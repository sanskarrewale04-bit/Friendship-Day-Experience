import { FriendshipCard } from '../types';
import { db, storage } from '../lib/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { uploadToFirebaseStorage } from './storageService';

export const DEFAULT_COMMITMENTS = [
  {
    id: 'c1',
    number: 1,
    icon: 'Sparkles',
    title: 'The Years of Growth Pact',
    description: 'To celebrate each other’s victories, big or small, and stand as an unshakeable pillar through life’s unpredictable turns.',
    accentColor: '#f59e0b'
  },
  {
    id: 'c2',
    number: 2,
    icon: 'ShieldCheck',
    title: 'The Unbroken Trust Treaty',
    description: 'To guard each other’s secrets with absolute confidentiality and offer honest, heartfelt counsel whenever called upon.',
    accentColor: '#3b82f6'
  },
  {
    id: 'c3',
    number: 3,
    icon: 'Heart',
    title: 'The Annual Reunion Mandate',
    description: 'To prioritize in-person meetups, late-night catchups, and uninterrupted memories regardless of distance or busy schedules.',
    accentColor: '#ec4899'
  },
  {
    id: 'c4',
    number: 4,
    icon: 'Smile',
    title: 'The Shared Journey Accord',
    description: 'To keep spontaneous laughter alive, forgive honest mistakes quickly, and treasure our friendship as an eternal priority.',
    accentColor: '#10b981'
  }
];

export const SAMPLE_CARD: FriendshipCard = {
  id: 'sample-alex-sam',
  agreementId: 'sample-alex-sam-AGR',
  certificateId: 'CERT-FDA-2026-8942',
  themeId: 'friendship',
  friendName: 'Alex Rivers',
  friendNickname: 'Al',
  senderName: 'Sam Vance',
  customMessage: 'To my partner-in-crime for over 10 years! Thank you for the endless road trips, midnight talks, and unshakeable support. Here is to our eternal bond!',
  friendPhotoUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',
  photos: [
    {
      id: 'p1',
      url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',
      caption: 'Unforgettable Road Trip',
      date: '2024-06-15',
      location: 'California Coast'
    },
    {
      id: 'p2',
      url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80',
      caption: 'Midnight Coffee & Deep Talks',
      date: '2024-11-02',
      location: 'San Francisco'
    },
    {
      id: 'p3',
      url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
      caption: 'Celebrating Milestones',
      date: '2025-01-20',
      location: 'Lake Tahoe'
    }
  ],
  commitmentsTitle: 'OUR UNBREAKABLE PACT',
  commitments: DEFAULT_COMMITMENTS,
  musicType: 'preset',
  presetAudioTrack: 'Acoustic Nostalgia (Warm Guitar & Piano)',
  audioSettings: {
    autoplay: true,
    loop: true,
    volume: 0.5,
    fadeIn: true
  },
  senderSignature: {
    type: 'draw',
    typedName: 'Sam Vance',
    signedAt: new Date().toISOString()
  },
  status: 'published',
  agreementNumber: 'FDA-2026-8942',
  location: 'San Francisco, CA',
  createdAt: new Date().toISOString(),
  viewsCount: 1,
  downloadsCount: 0,
  shareAnalytics: {
    whatsapp: 0,
    telegram: 0,
    facebook: 0,
    directCopy: 0
  },
  visitorLogs: []
};

// Helper to convert Firestore document data to FriendshipCard object
function mapDocToFriendshipCard(data: any, docId: string): FriendshipCard {
  if (!data) return SAMPLE_CARD;
  const openingConfig = data.openingConfig || data.opening_config || {};
  const photos = Array.isArray(data.photos) ? data.photos : [];
  const receiverName = data.receiverName || data.friendName || '';
  const senderName = data.senderName || data.sender_name || '';

  return {
    id: data.shareId || data.id || docId,
    agreementId: data.agreementId || `${docId}_AGR`,
    certificateId: data.certificateId || `CERT-${data.shareId || docId}`,
    themeId: data.theme || data.themeId || 'friendship',
    friendName: receiverName,
    friendNickname: openingConfig.friendNickname || data.friendNickname || '',
    senderName: senderName,
    customMessage: data.customMessage || data.custom_message || '',
    friendPhotoUrl: photos[0]?.url || data.friendPhotoUrl || '',
    photos: photos,
    openingConfig: {
      openingHeading: openingConfig.openingHeading || `Hey ${receiverName || 'Friend'}...`,
      openingMessage: openingConfig.openingMessage || data.customMessage || 'To a truly irreplaceable friend.',
      messageStyle: openingConfig.messageStyle || 'best_friends',
      typingSpeed: openingConfig.typingSpeed || 'normal',
      textAnimation: openingConfig.textAnimation || 'typewriter',
      backgroundEffect: openingConfig.backgroundEffect || 'sparkles',
      musicTiming: openingConfig.musicTiming || 'immediately',
      continueButtonText: openingConfig.continueButtonText || 'Unbox Memories'
    },
    commitmentsTitle: openingConfig.commitmentsTitle || data.commitmentsTitle || 'OUR UNBREAKABLE PACT',
    commitments: Array.isArray(data.commitments) && data.commitments.length > 0 ? data.commitments : DEFAULT_COMMITMENTS,
    musicType: (data.music || data.music_url || data.customAudioUrl)?.startsWith('http') ? 'custom' : 'preset',
    presetAudioTrack: (data.music || data.music_url || data.customAudioUrl)?.startsWith('http') ? undefined : (data.music || data.music_url || data.presetAudioTrack || 'Acoustic Nostalgia (Warm Guitar & Piano)'),
    customAudioUrl: (data.music || data.music_url || data.customAudioUrl)?.startsWith('http') ? (data.music || data.music_url || data.customAudioUrl) : '',
    audioSettings: openingConfig.audioSettings || data.audioSettings || { autoplay: true, loop: true, volume: 0.5, fadeIn: true },
    senderSignature: data.senderSignature || data.sender_signature || { type: 'type', typedName: senderName, signedAt: data.createdAt },
    recipientSignature: data.recipientSignature || data.receiverSignature || data.recipient_signature || undefined,
    status: data.status || 'published',
    agreementNumber: data.shareId ? `FDA-2026-${data.shareId.slice(0, 4)}` : 'FDA-2026-8942',
    location: openingConfig.location || data.location || 'Special Moments',
    createdAt: data.createdAt || data.created_at || new Date().toISOString(),
    signedAt: (data.recipientSignature || data.receiverSignature)?.signedAt || data.signedAt || undefined,
    viewsCount: data.viewsCount || data.views || 1,
    downloadsCount: data.downloadsCount || data.downloads || 0,
    shareAnalytics: data.shareAnalytics || data.shares || { whatsapp: 0, telegram: 0, facebook: 0, directCopy: 0 },
    agreementPdf: data.agreementPDF || data.agreement_pdf || '',
    agreementPng: data.agreementPNG || data.agreement_png || '',
    certificatePdf: data.certificatePDF || data.certificate_pdf || '',
    certificatePng: data.certificatePNG || data.certificate_png || '',
    visitorLogs: data.visitorLogs || []
  };
}

// Extract card ID from any URL format
export function extractCardIdFromUrl(): string | null {
  if (typeof window === 'undefined') return null;

  const path = window.location.pathname;
  const pathMatch = path.match(/\/card\/([a-zA-Z0-9_-]+)/i);
  if (pathMatch && pathMatch[1] && pathMatch[1] !== 'new') return pathMatch[1];

  const params = new URLSearchParams(window.location.search);
  const queryId = params.get('cardId') || params.get('card') || params.get('id');
  if (queryId) return queryId;

  const hash = window.location.hash;
  const hashMatch = hash.match(/(?:card|id)[=/]([a-zA-Z0-9_-]+)/i);
  if (hashMatch && hashMatch[1]) return hashMatch[1];

  return null;
}

// Generate unique public URL
export function getShareableCardUrl(cardId: string): string {
  if (typeof window === 'undefined') return `/card/${cardId}`;
  const origin = window.location.origin.replace(/\/+$/, '');
  return `${origin}/card/${cardId}`;
}

// Fetch a card by ID directly from Firestore
export async function fetchCardById(cardId: string): Promise<FriendshipCard | null> {
  if (!cardId) return null;

  // 1. Try Firestore `experiences` collection
  try {
    const expRef = doc(db, 'experiences', cardId);
    const expSnap = await getDoc(expRef);
    if (expSnap.exists()) {
      return mapDocToFriendshipCard(expSnap.data(), expSnap.id);
    }

    // Try querying by shareId
    const q = query(collection(db, 'experiences'), where('shareId', '==', cardId));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      const docData = querySnap.docs[0].data();
      return mapDocToFriendshipCard(docData, querySnap.docs[0].id);
    }
  } catch (err) {
    console.warn(`Firestore read failed for experience ${cardId}:`, err);
  }

  // 2. Try Firestore `cards` collection fallback
  try {
    const cardRef = doc(db, 'cards', cardId);
    const cardSnap = await getDoc(cardRef);
    if (cardSnap.exists()) {
      return mapDocToFriendshipCard(cardSnap.data(), cardSnap.id);
    }
  } catch (err) {
    console.warn(`Firestore cards query failed for ${cardId}`);
  }

  // 3. Try Backend Express API
  try {
    const res = await fetch(`/api/cards/${cardId}`, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.card) {
        return data.card;
      }
    }
  } catch (err) {
    console.warn(`Express API fetch failed for card ${cardId}`);
  }

  // 4. Sample card fallback for instant preview
  if (cardId === 'sample-alex-sam') {
    return SAMPLE_CARD;
  }

  return null;
}

// Save or Create an experience in Firestore
export async function saveCard(cardData: Partial<FriendshipCard>): Promise<FriendshipCard> {
  if (!cardData.friendName?.trim()) {
    throw new Error("Friend's name is required to publish this experience.");
  }
  if (!cardData.senderName?.trim()) {
    throw new Error("Your name is required to publish this experience.");
  }

  const isPreview = cardData.id && cardData.id.startsWith('preview_');
  const id = (cardData.id && !isPreview)
    ? cardData.id
    : (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `exp_${Date.now()}_${Math.floor(Math.random()*1000)}`);
  const agreementNumber = `FDA-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  console.log("Processing media for Firebase Storage upload...");

  // Upload photos to Firebase Storage if data URLs
  const uploadedPhotos = [];
  for (let idx = 0; idx < (cardData.photos || []).length; idx++) {
    const photo = cardData.photos![idx];
    if (photo.url && photo.url.startsWith('data:')) {
      try {
        const path = `photos/${id}/photo_${idx}_${Date.now()}.jpg`;
        console.log(`[Firebase Storage] Uploading photo ${idx + 1}/${cardData.photos!.length}...`);
        const photoStorageUrl = await uploadToFirebaseStorage(photo.url, path);
        uploadedPhotos.push({ ...photo, url: photoStorageUrl });
      } catch (err: any) {
        console.warn(`[Firebase Storage Upload Warning] Photo #${idx + 1}:`, err?.message || err);
        uploadedPhotos.push(photo);
      }
    } else {
      uploadedPhotos.push(photo);
    }
  }

  // Upload custom audio to Firebase Storage if data URL
  let customAudioUrl = cardData.customAudioUrl || '';
  if (customAudioUrl && customAudioUrl.startsWith('data:')) {
    try {
      const audioPath = `music/${id}/custom_audio_${Date.now()}.mp3`;
      console.log(`[Firebase Storage] Uploading custom audio track...`);
      customAudioUrl = await uploadToFirebaseStorage(customAudioUrl, audioPath);
    } catch (err: any) {
      console.warn('[Firebase Storage Upload Warning] Custom audio:', err?.message || err);
      // Keep original custom audio data URL or fallback
    }
  }

  const mainPhotoUrl = uploadedPhotos[0]?.url || cardData.friendPhotoUrl || '';
  const now = new Date().toISOString();

  const savedCard: FriendshipCard = {
    id,
    agreementId: cardData.agreementId || `${id}_AGR`,
    certificateId: cardData.certificateId || `CERT-${agreementNumber}`,
    themeId: cardData.themeId || 'friendship',
    friendName: cardData.friendName.trim(),
    friendNickname: cardData.friendNickname?.trim() || '',
    senderName: cardData.senderName.trim(),
    customMessage: cardData.customMessage?.trim() || 'To a truly irreplaceable friend!',
    friendPhotoUrl: mainPhotoUrl,
    photos: uploadedPhotos,
    openingConfig: cardData.openingConfig || {
      openingHeading: `Hey ${cardData.friendName || 'Friend'}...`,
      openingMessage: cardData.customMessage || 'To a truly irreplaceable friend.',
      messageStyle: 'best_friends',
      typingSpeed: 'normal',
      textAnimation: 'typewriter',
      backgroundEffect: 'sparkles',
      musicTiming: 'immediately',
      continueButtonText: 'Unbox Memories'
    },
    commitmentsTitle: cardData.commitmentsTitle || 'OUR UNBREAKABLE PACT',
    commitments: cardData.commitments && cardData.commitments.length > 0 ? cardData.commitments : DEFAULT_COMMITMENTS,
    musicType: cardData.musicType || 'preset',
    presetAudioTrack: cardData.presetAudioTrack || 'Acoustic Nostalgia (Warm Guitar & Piano)',
    customAudioUrl: customAudioUrl,
    audioSettings: cardData.audioSettings || { autoplay: true, loop: true, volume: 0.5, fadeIn: true },
    senderSignature: cardData.senderSignature || {
      type: 'type',
      typedName: cardData.senderName,
      signedAt: now
    },
    status: 'published',
    agreementNumber,
    location: cardData.location || 'Special Moments',
    createdAt: cardData.createdAt || now,
    viewsCount: cardData.viewsCount || 1,
    downloadsCount: cardData.downloadsCount || 0,
    shareAnalytics: cardData.shareAnalytics || { whatsapp: 0, telegram: 0, facebook: 0, directCopy: 0 },
    visitorLogs: cardData.visitorLogs || []
  };

  const experienceDoc = {
    id,
    shareId: id,
    senderName: savedCard.senderName,
    receiverName: savedCard.friendName,
    theme: savedCard.themeId,
    openingConfig: {
      ...savedCard.openingConfig,
      friendNickname: savedCard.friendNickname,
      commitmentsTitle: savedCard.commitmentsTitle,
      audioSettings: savedCard.audioSettings,
      location: savedCard.location
    },
    customMessage: savedCard.customMessage,
    commitments: savedCard.commitments,
    photos: savedCard.photos,
    music: savedCard.customAudioUrl || savedCard.presetAudioTrack || '',
    agreementPDF: savedCard.agreementPdf || '',
    agreementPNG: savedCard.agreementPng || '',
    certificatePDF: savedCard.certificatePdf || '',
    certificatePNG: savedCard.certificatePng || '',
    senderSignature: savedCard.senderSignature,
    receiverSignature: savedCard.recipientSignature || null,
    createdAt: savedCard.createdAt,
    updatedAt: now,
    published: true,
    status: 'published'
  };

  // 1. Persist to Firestore experiences collection
  try {
    console.log("Saving to Firestore experiences collection...");
    const expRef = doc(db, 'experiences', id);
    await setDoc(expRef, experienceDoc, { merge: true });

    // Also write to cards collection for backwards compatibility
    const cardRef = doc(db, 'cards', id);
    await setDoc(cardRef, experienceDoc, { merge: true });

    console.log("Firestore save success, Document ID:", savedCard.id);
  } catch (err: any) {
    console.error(`Firestore save failed for card ${savedCard.id}:`, err);
    throw new Error(`Firestore saving failed: ${err?.message || 'Unable to save document to Firestore'}`);
  }

  // 2. Also sync to Express backend API
  try {
    await fetch('/api/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(savedCard)
    });
  } catch (e) {
    // Optional backend sync
  }

  return savedCard;
}

// Sign Agreement & save recipient signature in Firestore
export async function signCardAgreement(
  cardId: string,
  recipientName: string,
  recipientSignatureName: string,
  certificateImageDataUrl?: string
): Promise<FriendshipCard | null> {
  const signedAt = new Date().toISOString();
  const recipientSigObj = {
    type: 'type' as const,
    typedName: recipientSignatureName,
    signedAt
  };

  // Upload certificate image if provided
  let certificatePngUrl = '';
  if (certificateImageDataUrl && certificateImageDataUrl.startsWith('data:')) {
    try {
      certificatePngUrl = await uploadToFirebaseStorage(
        certificateImageDataUrl,
        `certificates/${cardId}/certificate_${Date.now()}.png`
      );
    } catch (e) {
      console.warn('Certificate PNG upload failed:', e);
    }
  }

  // Update Firestore
  try {
    const expRef = doc(db, 'experiences', cardId);
    const updates = {
      status: 'signed',
      receiverSignature: recipientSigObj,
      recipientSignature: recipientSigObj,
      certificatePNG: certificatePngUrl || undefined,
      updatedAt: signedAt
    };

    await updateDoc(expRef, updates).catch(() => setDoc(expRef, updates, { merge: true }));

    // Also update cards collection
    const cardRef = doc(db, 'cards', cardId);
    await updateDoc(cardRef, updates).catch(() => setDoc(cardRef, updates, { merge: true }));

    // Read back updated card
    const updatedSnap = await getDoc(expRef);
    if (updatedSnap.exists()) {
      const card = mapDocToFriendshipCard(updatedSnap.data(), updatedSnap.id);
      localStorage.setItem(`card_${cardId}`, JSON.stringify(card));
      return card;
    }
  } catch (err) {
    console.error(`Firestore agreement signature update failed for ${cardId}:`, err);
  }

  return null;
}

// Track Share Analytics
export async function trackCardShare(cardId: string, channel: string): Promise<void> {
  fetch(`/api/cards/${cardId}/share`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ channel })
  }).catch(() => {});

  try {
    const expRef = doc(db, 'experiences', cardId);
    const snap = await getDoc(expRef);
    if (snap.exists()) {
      const data = snap.data();
      const shares = data.shareAnalytics || data.shares || { whatsapp: 0, telegram: 0, facebook: 0, directCopy: 0 };
      shares[channel] = (shares[channel] || 0) + 1;
      await updateDoc(expRef, { shareAnalytics: shares, shares });
    }
  } catch (err) {
    // Ignore error
  }
}

// Track Download Analytics
export async function trackCardDownload(cardId: string): Promise<void> {
  fetch(`/api/cards/${cardId}/download`, {
    method: 'POST'
  }).catch(() => {});

  try {
    const expRef = doc(db, 'experiences', cardId);
    const snap = await getDoc(expRef);
    if (snap.exists()) {
      const data = snap.data();
      const currentDownloads = (data.downloadsCount || data.downloads || 0) + 1;
      await updateDoc(expRef, { downloadsCount: currentDownloads, downloads: currentDownloads });
    }
  } catch (err) {
    // Ignore
  }
}

// Fetch all cards for Admin Dashboard from Firestore
export async function getAllCardsForAdmin(): Promise<FriendshipCard[]> {
  const cardsMap: Record<string, FriendshipCard> = {};

  try {
    const q = query(collection(db, 'experiences'), orderBy('createdAt', 'desc'));
    const querySnap = await getDocs(q);

    if (!querySnap.empty) {
      querySnap.docs.forEach((docSnap) => {
        const card = mapDocToFriendshipCard(docSnap.data(), docSnap.id);
        if (card && card.id) {
          cardsMap[card.id] = card;
        }
      });
      return Object.values(cardsMap);
    }
  } catch (err) {
    console.warn('Firestore fetch all cards failed:', err);
  }

  // Fallback query without orderBy
  try {
    const querySnap = await getDocs(collection(db, 'experiences'));
    if (!querySnap.empty) {
      querySnap.docs.forEach((docSnap) => {
        const card = mapDocToFriendshipCard(docSnap.data(), docSnap.id);
        if (card && card.id) {
          cardsMap[card.id] = card;
        }
      });
      return Object.values(cardsMap);
    }
  } catch (err) {
    console.warn('Firestore fallback fetch failed');
  }

  // Fallback to Express API
  try {
    const res = await fetch('/api/cards', { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.cards)) {
        data.cards.forEach((c: FriendshipCard) => {
          cardsMap[c.id] = c;
        });
      }
    }
  } catch (err) {
    console.warn('Express API fetch all failed');
  }

  if (Object.keys(cardsMap).length === 0) {
    cardsMap[SAMPLE_CARD.id] = SAMPLE_CARD;
  }

  return Object.values(cardsMap);
}

// Delete card for Admin from Firestore DB & Storage
export async function deleteCardForAdmin(cardId: string): Promise<boolean> {
  try {
    await fetch(`/api/cards/${cardId}`, { method: 'DELETE' });
  } catch (e) {
    // Ignore
  }

  try {
    // Delete Firestore documents
    await deleteDoc(doc(db, 'experiences', cardId)).catch(() => {});
    await deleteDoc(doc(db, 'cards', cardId)).catch(() => {});
    localStorage.removeItem(`card_${cardId}`);
    return true;
  } catch (e) {
    console.error('Delete card failed:', e);
    return false;
  }
}
