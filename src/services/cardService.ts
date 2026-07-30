import { FriendshipCard } from '../types';
import { db } from '../lib/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  increment
} from 'firebase/firestore';

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

// Extract card ID from any URL format (pathname, query params, hash)
export function extractCardIdFromUrl(): string | null {
  if (typeof window === 'undefined') return null;

  // 1. Check pathname (/card/...)
  const path = window.location.pathname;
  const pathMatch = path.match(/\/card\/([a-zA-Z0-9_-]+)/i);
  if (pathMatch && pathMatch[1] && pathMatch[1] !== 'new') return pathMatch[1];

  // 2. Check query parameters (?cardId=... or ?card=... or ?id=...)
  const params = new URLSearchParams(window.location.search);
  const queryId = params.get('cardId') || params.get('card') || params.get('id');
  if (queryId) return queryId;

  // 3. Check hash (#card=... or #/card/...)
  const hash = window.location.hash;
  const hashMatch = hash.match(/(?:card|id)[=/]([a-zA-Z0-9_-]+)/i);
  if (hashMatch && hashMatch[1]) return hashMatch[1];

  return null;
}

// Generate unique public URL (/card/{documentId})
export function getShareableCardUrl(cardId: string): string {
  if (typeof window === 'undefined') return `/card/${cardId}`;
  const origin = window.location.origin.replace(/\/+$/, '');
  return `${origin}/card/${cardId}`;
}

// Fetch a card by ID directly from Firebase Firestore
export async function fetchCardById(cardId: string): Promise<FriendshipCard | null> {
  if (!cardId) return null;

  // 1. Try Firebase Firestore Database directly from client
  try {
    const docRef = doc(db, 'cards', cardId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const card = docSnap.data() as FriendshipCard;
      // Increment views count in Firestore
      try {
        await updateDoc(docRef, {
          viewsCount: increment(1)
        });
        card.viewsCount = (card.viewsCount || 0) + 1;
      } catch (e) {
        // Ignore view update error
      }
      return card;
    }
  } catch (err) {
    console.warn(`Firestore read failed for card ${cardId}:`, err);
  }

  // 2. Try Backend Express API as secondary verification
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

  // 3. Built-in sample card fallback for instant demo
  if (cardId === 'sample-alex-sam') {
    return SAMPLE_CARD;
  }

  // If not found in Firebase Firestore, return null to render 404 page
  return null;
}

// Save or Create a card permanently in Firebase Firestore
export async function saveCard(cardData: Partial<FriendshipCard>): Promise<FriendshipCard> {
  if (!cardData.friendName?.trim()) {
    throw new Error("Friend's name is required to publish this experience.");
  }
  if (!cardData.senderName?.trim()) {
    throw new Error("Your name is required to publish this experience.");
  }

  // Determine Firestore document reference and authentic document ID
  const isPreview = cardData.id && cardData.id.startsWith('preview_');
  const docRef = cardData.id && !isPreview
    ? doc(db, 'cards', cardData.id)
    : doc(collection(db, 'cards'));
  
  const id = docRef.id;
  const agreementNumber = `FDA-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  const savedCard: FriendshipCard = {
    id,
    agreementId: cardData.agreementId || `${id}_AGR`,
    certificateId: cardData.certificateId || `CERT-${agreementNumber}`,
    themeId: cardData.themeId || 'friendship',
    friendName: cardData.friendName.trim(),
    friendNickname: cardData.friendNickname?.trim() || '',
    senderName: cardData.senderName.trim(),
    customMessage: cardData.customMessage?.trim() || 'To a truly irreplaceable friend!',
    friendPhotoUrl: cardData.friendPhotoUrl || cardData.photos?.[0]?.url || '',
    photos: cardData.photos || [],
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
    customAudioUrl: cardData.customAudioUrl || '',
    audioSettings: cardData.audioSettings || { autoplay: true, loop: true, volume: 0.5, fadeIn: true },
    senderSignature: cardData.senderSignature || {
      type: 'type',
      typedName: cardData.senderName,
      signedAt: new Date().toISOString()
    },
    status: 'published',
    agreementNumber,
    location: cardData.location || 'Special Moments',
    createdAt: new Date().toISOString(),
    viewsCount: 1,
    downloadsCount: 0,
    shareAnalytics: { whatsapp: 0, telegram: 0, facebook: 0, directCopy: 0 },
    visitorLogs: []
  };

  // 1. MANDATORY: Persist directly to Firebase Firestore
  try {
    console.log("Saving...");
    await setDoc(docRef, savedCard, { merge: true });
    console.log("Firestore success");
    console.log("Document ID:", savedCard.id);
  } catch (err: any) {
    console.error(`Firebase Firestore save failed for card ${savedCard.id}:`, err);
    throw new Error(`Firebase saving failed: ${err?.message || 'Unable to save document to Firestore database'}`);
  }

  // 2. Also sync to Express backend API if active
  try {
    await fetch('/api/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(savedCard)
    });
  } catch (e) {
    // Backend API sync optional
  }

  return savedCard;
}

// Sign Agreement & save recipient signature to Firebase Firestore and LocalStorage
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

  // Try Express API
  try {
    const res = await fetch(`/api/cards/${cardId}/sign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipientSignature: recipientSigObj, certificateImageDataUrl })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.card) {
        // Also sync to Firestore
        await setDoc(doc(db, 'cards', cardId), data.card, { merge: true });
        return data.card;
      }
    }
  } catch (err) {
    console.warn('Express API sign failed, writing directly to Firebase Firestore...');
  }

  // Client-side Firestore update fallback
  try {
    const docRef = doc(db, 'cards', cardId);
    const updates: Partial<FriendshipCard> = {
      status: 'signed',
      recipientSignature: recipientSigObj,
      signedAt
    };
    if (certificateImageDataUrl) {
      updates.certificateImageDataUrl = certificateImageDataUrl;
    }
    await updateDoc(docRef, updates);

    // Save agreement document in agreements collection
    const agreementId = `${cardId}_AGR`;
    await setDoc(doc(db, 'agreements', agreementId), {
      id: agreementId,
      cardId,
      recipientName,
      recipientSignature: recipientSigObj,
      signedAt
    }, { merge: true });

    // Fetch updated card
    const updatedSnap = await getDoc(docRef);
    if (updatedSnap.exists()) {
      const card = updatedSnap.data() as FriendshipCard;
      localStorage.setItem(`card_${cardId}`, JSON.stringify(card));
      return card;
    }
  } catch (err) {
    console.error(`Firestore agreement signature update failed for ${cardId}:`, err);
  }

  return null;
}

// Track Share Analytics in Express API + Firebase Firestore
export async function trackCardShare(cardId: string, channel: string): Promise<void> {
  // Try Express API
  fetch(`/api/cards/${cardId}/share`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ channel })
  }).catch(() => {});

  // Try Firestore direct update
  try {
    const docRef = doc(db, 'cards', cardId);
    await updateDoc(docRef, {
      [`shareAnalytics.${channel}`]: increment(1)
    });
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
    const docRef = doc(db, 'cards', cardId);
    await updateDoc(docRef, {
      downloadsCount: increment(1)
    });
  } catch (err) {
    // Ignore
  }
}

// Fetch all cards for Admin Dashboard
export async function getAllCardsForAdmin(): Promise<FriendshipCard[]> {
  const cardsMap: Record<string, FriendshipCard> = {};

  // 1. Try Express API
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
    console.warn('Express API fetch all failed, reading directly from Firebase Firestore...');
  }

  // 2. Query Firebase Firestore directly
  try {
    const querySnapshot = await getDocs(collection(db, 'cards'));
    querySnapshot.forEach((docSnap) => {
      const card = docSnap.data() as FriendshipCard;
      if (card && card.id) {
        cardsMap[card.id] = card;
      }
    });
  } catch (err) {
    console.warn('Firestore query all cards failed:', err);
  }

  // Always include sample card if empty
  if (Object.keys(cardsMap).length === 0) {
    cardsMap[SAMPLE_CARD.id] = SAMPLE_CARD;
  }

  return Object.values(cardsMap);
}

// Delete card for Admin
export async function deleteCardForAdmin(cardId: string): Promise<boolean> {
  try {
    await fetch(`/api/cards/${cardId}`, { method: 'DELETE' });
  } catch (e) {
    // Ignore
  }

  try {
    await deleteDoc(doc(db, 'cards', cardId));
    localStorage.removeItem(`card_${cardId}`);
    return true;
  } catch (e) {
    console.error('Delete card failed:', e);
    return false;
  }
}
