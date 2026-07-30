import { ref, uploadString, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';

/**
 * Uploads a Data URL (base64 image or audio) or Blob to Firebase Storage.
 * Returns the public download URL.
 * Fallbacks to data URL if Firebase Storage is unavailable or fails.
 */
export async function uploadToFirebaseStorage(
  dataOrFile: string | File | Blob,
  path: string
): Promise<string> {
  try {
    const storageRef = ref(storage, path);

    if (typeof dataOrFile === 'string') {
      if (dataOrFile.startsWith('data:')) {
        // Upload string as data_url
        await uploadString(storageRef, dataOrFile, 'data_url');
        const downloadUrl = await getDownloadURL(storageRef);
        return downloadUrl;
      }
      return dataOrFile; // Already an http/https URL
    } else {
      // Upload File or Blob
      await uploadBytes(storageRef, dataOrFile);
      const downloadUrl = await getDownloadURL(storageRef);
      return downloadUrl;
    }
  } catch (error) {
    console.warn(`Firebase Storage upload to ${path} failed/skipped, falling back to original data:`, error);
    // If input is data URL or string, return it as fallback
    if (typeof dataOrFile === 'string') {
      return dataOrFile;
    }
    // If it's a File/Blob, convert to Data URL fallback
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(dataOrFile);
    });
  }
}
