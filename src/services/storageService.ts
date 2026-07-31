import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';

/**
 * Helper function to convert a base64 Data URL to a Blob with its MIME type
 */
export function dataURLToBlob(dataUrl: string): { blob: Blob; mimeType: string } {
  const arr = dataUrl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const bstr = atob(arr[1] || '');
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return { blob: new Blob([u8arr], { type: mimeType }), mimeType };
}

/**
 * Retry helper for asynchronous operations with exponential/step backoff
 */
async function uploadWithRetry<T>(
  fn: (attempt: number) => Promise<T>,
  maxRetries = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: any;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn(attempt);
    } catch (err: any) {
      lastError = err;
      console.warn(`[Firebase Storage] Upload attempt ${attempt}/${maxRetries} failed:`, err?.message || err);
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
      }
    }
  }
  throw lastError;
}

/**
 * Uploads a Data URL, File, or Blob to Firebase Storage using uploadBytes().
 * Returns the public download URL obtained via getDownloadURL() ONLY after uploadBytes() succeeds.
 * Logs exact errors, retries failed uploads, and throws on failure to prevent publishing broken cards.
 */
export async function uploadToFirebaseStorage(
  dataOrFile: string | File | Blob,
  path: string
): Promise<string> {
  if (!dataOrFile) {
    throw new Error('No data or file provided for upload.');
  }

  // Return immediately if it's already a hosted http/https URL
  if (typeof dataOrFile === 'string' && !dataOrFile.startsWith('data:')) {
    return dataOrFile;
  }

  // Attempt 1: Direct client-side Firebase Storage upload using uploadBytes() with retry logic
  try {
    return await uploadWithRetry(async () => {
      const storageRef = ref(storage, path);
      let blobToUpload: Blob;
      let contentType = 'image/jpeg';

      if (typeof dataOrFile === 'string') {
        const { blob, mimeType } = dataURLToBlob(dataOrFile);
        blobToUpload = blob;
        contentType = mimeType;
      } else {
        blobToUpload = dataOrFile;
        contentType = dataOrFile.type || 'image/jpeg';
      }

      // Step 1: Execute uploadBytes
      const snapshot = await uploadBytes(storageRef, blobToUpload, { contentType });

      // Step 2: Get Download URL ONLY after uploadBytes succeeds
      const downloadUrl = await getDownloadURL(snapshot.ref);
      return downloadUrl;
    }, 3, 1000);
  } catch (clientError: any) {
    console.warn(`[Firebase Storage Client Upload Failed for ${path}]:`, clientError?.message || clientError);

    // Attempt 2: Server API endpoint fallback (bypasses browser CORS policy restrictions)
    if (typeof dataOrFile === 'string' && dataOrFile.startsWith('data:')) {
      try {
        console.log(`[Firebase Storage] Trying server-assisted proxy upload for ${path}...`);
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dataUrl: dataOrFile, path })
        });
        if (response.ok) {
          const resData = await response.json();
          if (resData.success && resData.url) {
            console.log(`[Firebase Storage] Server-assisted upload succeeded for ${path}`);
            return resData.url;
          }
        }
      } catch (serverErr: any) {
        console.warn(`[Firebase Storage Server Proxy Failed for ${path}]:`, serverErr?.message || serverErr);
      }
    }

    // Log the exact upload error as required
    console.error('[Firebase Storage Upload Error]:', {
      path,
      errorCode: clientError?.code || 'UNKNOWN',
      errorMessage: clientError?.message || String(clientError),
      errorStack: clientError?.stack,
      rawError: clientError
    });

    // Throw explicit error so publishing halts and displays user-friendly message
    throw new Error(
      `Photo upload failed for (${path}). ${clientError?.message || 'Network/CORS error'}. Please try again.`
    );
  }
}
