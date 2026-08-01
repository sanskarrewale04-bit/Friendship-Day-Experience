import { supabase } from '../lib/supabase';

export const VALID_STORAGE_BUCKETS = ['photos', 'music', 'agreement', 'certificates'] as const;
export type StorageBucket = typeof VALID_STORAGE_BUCKETS[number];

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
 * Parses path to determine Supabase bucket and relative file path.
 * EXACT bucket names: photos, music, agreement, certificates
 */
export function parseSupabaseBucketAndPath(path: string): { bucket: StorageBucket; filePath: string; fileName: string } {
  const cleaned = path.replace(/^\/+/, '');
  let bucket: StorageBucket = 'photos';
  let filePath = cleaned;

  if (cleaned.startsWith('photos/')) {
    bucket = 'photos';
    filePath = cleaned.replace(/^photos\//, '');
  } else if (cleaned.startsWith('music/')) {
    bucket = 'music';
    filePath = cleaned.replace(/^music\//, '');
  } else if (cleaned.startsWith('agreement/') || cleaned.startsWith('agreements/')) {
    bucket = 'agreement';
    filePath = cleaned.replace(/^agreements?\//, '');
  } else if (cleaned.startsWith('certificates/') || cleaned.startsWith('certificate/')) {
    bucket = 'certificates';
    filePath = cleaned.replace(/^certificates?\//, '');
  } else if (cleaned.includes('/music/')) {
    bucket = 'music';
  } else if (cleaned.includes('/photos/')) {
    bucket = 'photos';
  } else if (cleaned.endsWith('.mp3') || cleaned.endsWith('.wav') || cleaned.endsWith('.m4a')) {
    bucket = 'music';
  } else if (cleaned.endsWith('.pdf')) {
    bucket = 'agreement';
  }

  const fileName = filePath.split('/').pop() || filePath;
  return { bucket, filePath, fileName };
}

/**
 * Uploads a Data URL, File, or Blob to Supabase Storage with strict debugging and exact bucket checking.
 */
export async function uploadToSupabaseStorage(
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

  const { bucket, filePath, fileName } = parseSupabaseBucketAndPath(path);
  const { blob: blobToUpload, contentType } = await compressImageIfNeeded(dataOrFile, 1920, 0.8);
  const currentSupabaseUrl = (supabase as any)?.supabaseUrl || (import.meta as any)?.env?.VITE_SUPABASE_URL || 'placeholder';

  // 1. Verify Bucket Exists
  if (!VALID_STORAGE_BUCKETS.includes(bucket)) {
    const errorMsg = `Storage bucket "${bucket}" does not exist.`;
    console.error(`[Supabase Storage Verification Error]`, errorMsg);
    throw new Error(errorMsg);
  }

  // 2. Print Debugging BEFORE every upload
  console.log(`[Supabase Storage Upload Debug]`, {
    Bucket: bucket,
    Path: filePath,
    Filename: fileName,
    'File Size': `${blobToUpload.size} bytes`,
    'Content Type': contentType,
    'Supabase URL': currentSupabaseUrl
  });

  try {
    if (onProgress) onProgress(30);

    // EXACT Storage upload mapping:
    // .from("photos")
    // .from("music")
    // .from("agreement")
    // .from("certificates")
    const uploadResult = await supabase.storage
      .from(bucket)
      .upload(filePath, blobToUpload, {
        contentType,
        upsert: true
      });

    // Debug print Response & Storage Error
    console.log(`[Supabase Storage Upload Response]`, {
      Bucket: bucket,
      Path: filePath,
      Response: uploadResult,
      StorageError: uploadResult.error
    });

    if (uploadResult.error) {
      const err = uploadResult.error as any;
      console.error(`[Supabase Storage Failed Request Debug]`, {
        status: err.status || err.statusCode || 400,
        statusText: err.statusText || err.name || 'Storage Upload Error',
        'error.message': err.message,
        'error.code': err.code || err.error || 'STORAGE_ERROR',
        'error.details': err.details || err.description || '',
        'error.hint': err.hint || ''
      });

      if (err.message?.includes('bucket') || err.message?.includes('not found') || err.status === 404) {
        throw new Error(`Storage bucket "${bucket}" does not exist.`);
      }

      throw new Error(`Photo upload failed: ${err.message || 'Supabase storage error'}`);
    }

    if (onProgress) onProgress(80);

    // 3. Generate Public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    console.log(`[Supabase Storage Public URL]`, {
      Bucket: bucket,
      Path: filePath,
      PublicUrl: publicUrlData?.publicUrl
    });

    if (onProgress) onProgress(100);

    return publicUrlData.publicUrl;
  } catch (clientError: any) {
    const errMessage = clientError?.message || String(clientError);

    console.error(`[Supabase Storage Client Exception]`, {
      status: clientError?.status || 500,
      statusText: clientError?.statusText || 'Upload Exception',
      'error.message': errMessage,
      'error.code': clientError?.code || 'FETCH_EXCEPTION',
      'error.details': clientError?.details || '',
      'error.hint': clientError?.hint || ''
    });

    if (errMessage.includes('bucket') && errMessage.includes('not exist')) {
      throw clientError;
    }

    // Attempt Server API Proxy Upload
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
        console.log(`[Supabase Storage] Attempting server proxy upload for ${path}...`);
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dataUrl: dataUrlToSend, path })
        });
        if (response.ok) {
          const resData = await response.json();
          if (resData.success && resData.url) {
            console.log(`[Supabase Storage] Server proxy upload successful for ${path}:`, resData.url);
            if (onProgress) onProgress(100);
            return resData.url;
          }
        }
      } catch (serverErr: any) {
        console.warn(`[Supabase Storage Server Proxy Exception]:`, serverErr?.message || serverErr);
      }

      // Safe fallback data URL retention so user app publishing never crashes
      console.log(`[Supabase Storage Fallback] Using data URL for ${path}`);
      if (onProgress) onProgress(100);
      return dataUrlToSend;
    }

    // Always replace "Failed to fetch" with exact descriptive Supabase error
    const formattedError = errMessage.includes('Failed to fetch')
      ? `Photo upload failed: Network connection error or invalid Supabase URL (${currentSupabaseUrl}).`
      : errMessage.startsWith('Photo upload failed')
      ? errMessage
      : `Photo upload failed: ${errMessage}`;

    throw new Error(formattedError);
  }
}

// Backward-compatible alias
export const uploadToFirebaseStorage = uploadToSupabaseStorage;
