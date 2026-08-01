import { FriendshipCard } from '../types';
import { supabase } from '../lib/supabase';
import { uploadToSupabaseStorage } from './storageService';

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

// Helper to convert database row to FriendshipCard object
function mapRowToFriendshipCard(row: any): FriendshipCard {
  if (!row) return SAMPLE_CARD;
  const openingConfig = row.opening_config || {};
  const photos = Array.isArray(row.photos) ? row.photos : [];
  return {
    id: row.id || row.share_id,
    agreementId: row.agreement_id || `${row.id}_AGR`,
    certificateId: row.certificate_id || `CERT-${row.share_id}`,
    themeId: row.theme || 'friendship',
    friendName: row.receiver_name || '',
    friendNickname: openingConfig.friendNickname || '',
    senderName: row.sender_name || '',
    customMessage: row.custom_message || '',
    friendPhotoUrl: photos[0]?.url || '',
    photos: photos,
    openingConfig: {
      openingHeading: openingConfig.openingHeading || `Hey ${row.receiver_name || 'Friend'}...`,
      openingMessage: openingConfig.openingMessage || row.custom_message || 'To a truly irreplaceable friend.',
      messageStyle: openingConfig.messageStyle || 'best_friends',
      typingSpeed: openingConfig.typingSpeed || 'normal',
      textAnimation: openingConfig.textAnimation || 'typewriter',
      backgroundEffect: openingConfig.backgroundEffect || 'sparkles',
      musicTiming: openingConfig.musicTiming || 'immediately',
      continueButtonText: openingConfig.continueButtonText || 'Unbox Memories'
    },
    commitmentsTitle: openingConfig.commitmentsTitle || 'OUR UNBREAKABLE PACT',
    commitments: Array.isArray(row.commitments) && row.commitments.length > 0 ? row.commitments : DEFAULT_COMMITMENTS,
    musicType: row.music_url?.startsWith('http') ? 'custom' : 'preset',
    presetAudioTrack: row.music_url?.startsWith('http') ? undefined : (row.music_url || 'Acoustic Nostalgia (Warm Guitar & Piano)'),
    customAudioUrl: row.music_url?.startsWith('http') ? row.music_url : '',
    audioSettings: openingConfig.audioSettings || { autoplay: true, loop: true, volume: 0.5, fadeIn: true },
    senderSignature: row.sender_signature || { type: 'type', typedName: row.sender_name, signedAt: row.created_at },
    recipientSignature: row.recipient_signature || undefined,
    status: row.status || 'published',
    agreementNumber: row.share_id ? `FDA-2026-${row.share_id.slice(0, 4)}` : 'FDA-2026-8942',
    location: openingConfig.location || 'Special Moments',
    createdAt: row.created_at || new Date().toISOString(),
    signedAt: row.recipient_signature?.signedAt || undefined,
    viewsCount: row.views || 1,
    downloadsCount: row.downloads || 0,
    shareAnalytics: row.shares || { whatsapp: 0, telegram: 0, facebook: 0, directCopy: 0 },
    agreementPdf: row.agreement_pdf || '',
    agreementPng: row.agreement_png || '',
    certificatePdf: row.certificate_pdf || '',
    certificatePng: row.certificate_png || '',
    visitorLogs: row.visitor_logs || []
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

// Fetch a card by ID directly from Supabase
export async function fetchCardById(cardId: string): Promise<FriendshipCard | null> {
  if (!cardId) return null;

  // 1. Try Supabase database directly from client
  try {
    const { data, error } = await supabase
      .from('experiences')
      .select('*')
      .or(`id.eq.${cardId},share_id.eq.${cardId}`)
      .maybeSingle();

    if (data && !error) {
      const card = mapRowToFriendshipCard(data);
      return card;
    }
  } catch (err) {
    console.warn(`Supabase read failed for experience ${cardId}:`, err);
  }

  // 2. Try Backend Express API
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

  return null;
}

// Save or Create an experience in Supabase
export async function saveCard(cardData: Partial<FriendshipCard>): Promise<FriendshipCard> {
  if (!cardData.friendName?.trim()) {
    throw new Error("Friend's name is required to publish this experience.");
  }
  if (!cardData.senderName?.trim()) {
    throw new Error("Your name is required to publish this experience.");
  }

  const isPreview = cardData.id && cardData.id.startsWith('preview_');
  const id = (cardData.id && !isPreview) ? cardData.id : (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `exp_${Date.now()}_${Math.floor(Math.random()*1000)}`);
  const agreementNumber = `FDA-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  console.log("Processing media for Supabase upload...");

  // Upload photos to Supabase Storage if data URLs
  const uploadedPhotos = [];
  for (let idx = 0; idx < (cardData.photos || []).length; idx++) {
    const photo = cardData.photos![idx];
    if (photo.url && photo.url.startsWith('data:')) {
      try {
        const path = `photos/${id}/photo_${idx}_${Date.now()}.jpg`;
        console.log(`[Supabase Storage] Uploading photo ${idx + 1}/${cardData.photos!.length}...`);
        const photoStorageUrl = await uploadToSupabaseStorage(photo.url, path);
        uploadedPhotos.push({ ...photo, url: photoStorageUrl });
      } catch (err: any) {
        console.error(`[Supabase Storage Upload Failed] Photo #${idx + 1}:`, err);
        throw new Error(`Photo upload failed for Photo #${idx + 1}: ${err?.message || 'Upload error'}. Publishing aborted.`);
      }
    } else {
      uploadedPhotos.push(photo);
    }
  }

  // Upload custom audio to Supabase Storage if data URL
  let customAudioUrl = cardData.customAudioUrl || '';
  if (customAudioUrl && customAudioUrl.startsWith('data:')) {
    try {
      const audioPath = `music/${id}/custom_audio_${Date.now()}.mp3`;
      console.log(`[Supabase Storage] Uploading custom audio track...`);
      customAudioUrl = await uploadToSupabaseStorage(customAudioUrl, audioPath);
    } catch (err: any) {
      console.error('[Supabase Storage Upload Failed] Custom audio:', err);
      throw new Error(`Audio upload failed: ${err?.message || 'Upload error'}. Publishing aborted.`);
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

  const row = {
    id,
    share_id: id,
    sender_name: savedCard.senderName,
    receiver_name: savedCard.friendName,
    theme: savedCard.themeId,
    opening_config: {
      ...savedCard.openingConfig,
      friendNickname: savedCard.friendNickname,
      commitmentsTitle: savedCard.commitmentsTitle,
      audioSettings: savedCard.audioSettings,
      location: savedCard.location
    },
    custom_message: savedCard.customMessage,
    commitments: savedCard.commitments,
    photos: savedCard.photos,
    music_url: savedCard.customAudioUrl || savedCard.presetAudioTrack || '',
    agreement_pdf: savedCard.agreementPdf || '',
    agreement_png: savedCard.agreementPng || '',
    certificate_pdf: savedCard.certificatePdf || '',
    certificate_png: savedCard.certificatePng || '',
    sender_signature: savedCard.senderSignature,
    recipient_signature: savedCard.recipientSignature || null,
    created_at: savedCard.createdAt,
    updated_at: now,
    status: 'published'
  };

  // 1. MANDATORY: Persist to Supabase experiences table
  try {
    console.log("Saving to Supabase PostgreSQL database...");
    const { error } = await supabase.from('experiences').upsert(row);
    if (error) {
      throw error;
    }
    console.log("Supabase save success, Document ID:", savedCard.id);
  } catch (err: any) {
    console.error(`Supabase save failed for card ${savedCard.id}:`, err);
    throw new Error(`Supabase saving failed: ${err?.message || 'Unable to save document to PostgreSQL database'}`);
  }

  // 2. Also sync to Express backend API if active
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

// Sign Agreement & save recipient signature in Supabase
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
      certificatePngUrl = await uploadToSupabaseStorage(
        certificateImageDataUrl,
        `certificates/${cardId}/certificate_${Date.now()}.png`
      );
    } catch (e) {
      console.warn('Certificate PNG upload failed:', e);
    }
  }

  // Update Supabase
  try {
    const { data: updatedDoc, error } = await supabase
      .from('experiences')
      .update({
        status: 'signed',
        recipient_signature: recipientSigObj,
        certificate_png: certificatePngUrl || undefined,
        updated_at: signedAt
      })
      .or(`id.eq.${cardId},share_id.eq.${cardId}`)
      .select()
      .maybeSingle();

    if (updatedDoc && !error) {
      // Insert into agreements table
      const agreementId = `${cardId}_AGR`;
      await supabase.from('agreements').upsert({
        id: agreementId,
        experience_id: updatedDoc.id,
        signed_at: signedAt
      });

      // Insert into certificates table
      const certId = updatedDoc.certificate_id || `CERT-${cardId}`;
      await supabase.from('certificates').upsert({
        id: certId,
        experience_id: updatedDoc.id,
        certificate_png: certificatePngUrl,
        issued_at: signedAt
      });

      const card = mapRowToFriendshipCard(updatedDoc);
      localStorage.setItem(`card_${cardId}`, JSON.stringify(card));
      return card;
    }
  } catch (err) {
    console.error(`Supabase agreement signature update failed for ${cardId}:`, err);
  }

  return null;
}

// Track Share Analytics in Supabase
export async function trackCardShare(cardId: string, channel: string): Promise<void> {
  fetch(`/api/cards/${cardId}/share`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ channel })
  }).catch(() => {});

  try {
    const { data } = await supabase
      .from('experiences')
      .select('shares')
      .or(`id.eq.${cardId},share_id.eq.${cardId}`)
      .maybeSingle();

    const currentShares = data?.shares || { whatsapp: 0, telegram: 0, facebook: 0, directCopy: 0 };
    currentShares[channel] = (currentShares[channel] || 0) + 1;

    await supabase
      .from('experiences')
      .update({ shares: currentShares })
      .or(`id.eq.${cardId},share_id.eq.${cardId}`);
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
    const { data } = await supabase
      .from('experiences')
      .select('downloads')
      .or(`id.eq.${cardId},share_id.eq.${cardId}`)
      .maybeSingle();

    const currentDownloads = (data?.downloads || 0) + 1;

    await supabase
      .from('experiences')
      .update({ downloads: currentDownloads })
      .or(`id.eq.${cardId},share_id.eq.${cardId}`);
  } catch (err) {
    // Ignore
  }
}

// Fetch all cards for Admin Dashboard from Supabase
export async function getAllCardsForAdmin(): Promise<FriendshipCard[]> {
  const cardsMap: Record<string, FriendshipCard> = {};

  try {
    const { data, error } = await supabase
      .from('experiences')
      .select('*')
      .order('created_at', { ascending: false });

    if (data && !error && data.length > 0) {
      data.forEach((row) => {
        const card = mapRowToFriendshipCard(row);
        if (card && card.id) {
          cardsMap[card.id] = card;
        }
      });
      return Object.values(cardsMap);
    }
  } catch (err) {
    console.warn('Supabase fetch all cards failed:', err);
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

// Delete card for Admin from Supabase DB & Storage
export async function deleteCardForAdmin(cardId: string): Promise<boolean> {
  try {
    await fetch(`/api/cards/${cardId}`, { method: 'DELETE' });
  } catch (e) {
    // Ignore
  }

  try {
    // Delete database record
    await supabase.from('experiences').delete().or(`id.eq.${cardId},share_id.eq.${cardId}`);
    localStorage.removeItem(`card_${cardId}`);
    return true;
  } catch (e) {
    console.error('Delete card failed:', e);
    return false;
  }
}
