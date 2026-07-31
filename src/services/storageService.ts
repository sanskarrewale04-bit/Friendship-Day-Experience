import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';

/**
 * Converts a base64 Data URL to a Blob with its MIME type
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
 * Compresses images to a maximum dimension of 1920px and JPEG quality of 0.8.
 * Leaves audio and non-image media untouched.
 */
export async function compressImageIfNeeded(
  dataOrFile: string | File | Blob,
  maxDimension = 1920,
  quality = 0.8
): Promise<{ blob: Blob; contentType: string }> {
  // Check if media is audio or non-image
  if (dataOrFile instanceof File || dataOrFile instanceof Blob) {
    const type = dataOrFile.type || '';
    if (type.startsWith('audio/') || type.includes('mpeg') || type.includes('mp3') || type.includes('wav')) {
      return { blob: dataOrFile, contentType: type || 'audio/mpeg' };
    }
  }

  if (typeof dataOrFile === 'string' && dataOrFile.startsWith('data:audio/')) {
    const { blob, mimeType } = dataURLToBlob(dataOrFile);
    return { blob, contentType: mimeType };
  }

  // Compress image via Canvas
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const loadAndProcess = () => {
      let width = img.width;
      let height = img.height;

      if (!width || !height) {
        if (dataOrFile instanceof Blob) {
          return resolve({ blob: dataOrFile, contentType: dataOrFile.type || 'image/jpeg' });
        }
        const { blob, mimeType } = dataURLToBlob(dataOrFile as string);
        return resolve({ blob, contentType: mimeType });
      }

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        if (dataOrFile instanceof Blob) {
          return resolve({ blob: dataOrFile, contentType: dataOrFile.type || 'image/jpeg' });
        }
        const { blob, mimeType } = dataURLToBlob(dataOrFile as string);
        return resolve({ blob, contentType: mimeType });
      }

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (compressedBlob) => {
          if (compressedBlob) {
            resolve({ blob: compressedBlob, contentType: 'image/jpeg' });
          } else {
            if (dataOrFile instanceof Blob) {
              return resolve({ blob: dataOrFile, contentType: dataOrFile.type || 'image/jpeg' });
            }
            const { blob, mimeType } = dataURLToBlob(dataOrFile as string);
            resolve({ blob, contentType: mimeType });
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onload = loadAndProcess;
    img.onerror = () => {
      if (dataOrFile instanceof Blob) {
        return resolve({ blob: dataOrFile, contentType: dataOrFile.type || 'image/jpeg' });
      }
      const { blob, mimeType } = dataURLToBlob(dataOrFile as string);
      resolve({ blob, contentType: mimeType });
    };

    if (typeof dataOrFile === 'string') {
      img.src = dataOrFile;
    } else {
      img.src = URL.createObjectURL(dataOrFile);
    }
  });
}

/**
 * Retry helper with exponential backoff
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
 * Uploads a Data URL, File, or Blob to Firebase Storage using uploadBytesResumable().
 * - Uses original File/Blob when available.
 * - Compresses images to max 1920px, quality 0.8 (does not compress audio).
 * - Tracks progress with uploadBytesResumable.
 * - Falls back seamlessly to server proxy if client CORS request fails.
 */
export async function uploadToFirebaseStorage(
  dataOrFile: string | File | Blob,
  path: string,
  onProgress?: (progressPercent: number) => void
): Promise<string> {
  if (!dataOrFile) {
    throw new Error('No data or file provided for upload.');
  }

  // Return immediately if it's already a hosted http/https URL
  if (typeof dataOrFile === 'string' && !dataOrFile.startsWith('data:')) {
    return dataOrFile;
  }

  // Compress image if applicable (leaves audio files uncompressed)
  const { blob: blobToUpload, contentType } = await compressImageIfNeeded(dataOrFile, 1920, 0.8);

  // Attempt 1: Direct client-side Firebase Storage upload using uploadBytesResumable() with retry logic
  try {
    return await uploadWithRetry(async () => {
      const storageRef = ref(storage, path);

      console.log(`[Firebase Storage] Starting uploadBytesResumable for path: "${path}"`, {
        storageBucket: storageRef.bucket,
        fullPath: storageRef.fullPath,
        blobSize: blobToUpload.size,
        contentType
      });

      const uploadTask = uploadBytesResumable(storageRef, blobToUpload, { contentType });

      await new Promise<void>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`[Firebase Storage] Uploading ${path}: ${progress.toFixed(1)}%`);
            if (onProgress) {
              onProgress(Math.round(progress));
            }
          },
          (error) => {
            console.error(`[Firebase Storage] uploadBytesResumable error for ${path}:`, error);
            reject(error);
          },
          () => {
            resolve();
          }
        );
      });

      const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
      console.log(`[Firebase Storage] Upload completed for "${path}":`, downloadUrl);
      return downloadUrl;
    }, 3, 1000);
  } catch (clientError: any) {
    console.warn(`[Firebase Storage Client Upload Failed for ${path}]:`, clientError?.message || clientError);

    // Attempt 2: Server API endpoint fallback (bypasses browser CORS policy restrictions)
    let dataUrlToSend: string | null = null;

    if (typeof dataOrFile === 'string') {
      dataUrlToSend = dataOrFile;
    } else if (blobToUpload instanceof Blob) {
      dataUrlToSend = await new Promise<string>((res) => {
        const reader = new FileReader();
        reader.onloadend = () => res(reader.result as string);
        reader.readAsDataURL(blobToUpload);
      });
    }

    if (dataUrlToSend) {
      try {
        console.log(`[Firebase Storage] Trying server-assisted proxy upload for ${path}...`);
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dataUrl: dataUrlToSend, path })
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

    // Log exact upload error
    console.error('[Firebase Storage Upload Error]:', {
      path,
      errorCode: clientError?.code || 'UNKNOWN',
      errorMessage: clientError?.message || String(clientError),
      rawError: clientError
    });

    throw new Error(
      `Photo/media upload failed for (${path}). ${clientError?.message || 'Network/CORS error'}. Please try again.`
    );
  }
}
