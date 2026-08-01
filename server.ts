import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { FriendshipCard, AnalyticsStats } from './src/types';
import { supabase } from './src/lib/supabase';
import { parseSupabaseBucketAndPath } from './src/services/storageService';

const app = express();
const PORT = 3000;

// Middleware for parsing JSON with increased limit for base64 photo/audio uploads
app.use(express.json({ limit: '25mb' }));

// Local database store directory (fallback/secondary cache)
const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const CARDS_FILE = path.join(DATA_DIR, 'cards.json');
const AUDIO_DIR = path.join(DATA_DIR, 'audio');
if (!fs.existsSync(AUDIO_DIR)) {
  fs.mkdirSync(AUDIO_DIR, { recursive: true });
}

// Memory cache of cards
let cardsStore: Record<string, FriendshipCard> = {};

// Load existing cards from local file initial cache
if (fs.existsSync(CARDS_FILE)) {
  try {
    const raw = fs.readFileSync(CARDS_FILE, 'utf-8');
    cardsStore = JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse cards.json:', err);
    cardsStore = {};
  }
}

// Helper to persist cards locally
const saveCardsLocal = () => {
  try {
    fs.writeFileSync(CARDS_FILE, JSON.stringify(cardsStore, null, 2));
  } catch (err) {
    console.error('Failed to save cards locally:', err);
  }
};

// Default initial commitments
const DEFAULT_COMMITMENTS = [
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

// Map Supabase DB row to FriendshipCard object
const mapRowToCard = (row: any): FriendshipCard => {
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
};

// Helper to save card to Supabase
const saveCardToSupabase = async (card: FriendshipCard) => {
  try {
    const row = {
      id: card.id,
      share_id: card.id,
      sender_name: card.senderName,
      receiver_name: card.friendName,
      theme: card.themeId || 'friendship',
      opening_config: {
        ...card.openingConfig,
        friendNickname: card.friendNickname,
        commitmentsTitle: card.commitmentsTitle,
        audioSettings: card.audioSettings,
        location: card.location
      },
      custom_message: card.customMessage,
      commitments: card.commitments || [],
      photos: card.photos || [],
      music_url: card.customAudioUrl || card.presetAudioTrack || '',
      agreement_pdf: card.agreementPdf || '',
      agreement_png: card.agreementPng || '',
      certificate_pdf: card.certificatePdf || '',
      certificate_png: card.certificatePng || '',
      sender_signature: card.senderSignature,
      recipient_signature: card.recipientSignature || null,
      created_at: card.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: card.status || 'published'
    };

    await supabase.from('experiences').upsert(row);

    if (card.status === 'signed') {
      const agreementId = card.agreementId || `${card.id}_AGR`;
      await supabase.from('agreements').upsert({
        id: agreementId,
        experience_id: card.id,
        signed_at: card.signedAt || new Date().toISOString()
      });

      const certId = card.certificateId || `CERT-${card.agreementNumber}`;
      await supabase.from('certificates').upsert({
        id: certId,
        experience_id: card.id,
        certificate_png: card.certificateImageDataUrl || card.certificatePng || '',
        issued_at: card.signedAt || new Date().toISOString()
      });
    }
  } catch (err) {
    console.error(`Supabase save error for card ${card.id}:`, err);
  }
};

// Helper to delete card from Supabase
const deleteCardFromSupabase = async (cardId: string) => {
  try {
    await supabase.from('experiences').delete().or(`id.eq.${cardId},share_id.eq.${cardId}`);
  } catch (err) {
    console.error(`Supabase delete error for card ${cardId}:`, err);
  }
};

// Load cards from Supabase at startup
const loadCardsFromSupabase = async () => {
  try {
    const { data, error } = await supabase.from('experiences').select('*');
    if (data && !error) {
      data.forEach((row) => {
        if (row && row.id) {
          const card = mapRowToCard(row);
          cardsStore[card.id] = card;
        }
      });
      saveCardsLocal();
      console.log(`Loaded ${data.length} cards from Supabase PostgreSQL database.`);
    }
  } catch (err) {
    console.error('Supabase initial load error, using local cache:', err);
  }
};

// Initial trigger to load Supabase database
loadCardsFromSupabase();

// Populate sample card if empty
if (Object.keys(cardsStore).length === 0) {
  const sampleCard1: FriendshipCard = {
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

  cardsStore[sampleCard1.id] = sampleCard1;
  saveCardsLocal();
}

function generateUniqueCardId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomPart = '';
  for (let i = 0; i < 6; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const id = `FRD-${new Date().getFullYear()}-${randomPart}`;
  if (cardsStore[id]) {
    return generateUniqueCardId();
  }
  return id;
}

// Proxy upload endpoint to assist client with Supabase Storage upload
app.post('/api/upload', async (req, res) => {
  try {
    const { dataUrl, path: storagePath } = req.body;
    if (!dataUrl || !storagePath) {
      return res.status(400).json({ success: false, error: 'Missing dataUrl or path' });
    }

    const { bucket, filePath } = parseSupabaseBucketAndPath(storagePath);
    const serverSupabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || (supabase as any)?.supabaseUrl || 'https://placeholder.supabase.co';

    console.log('[Server Storage Upload Trace]', {
      bucket,
      filePath,
      storagePath,
      serverSupabaseUrl
    });

    if (typeof dataUrl === 'string' && dataUrl.startsWith('data:')) {
      const mimeMatch = dataUrl.match(/^data:(.*?);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      const base64Data = dataUrl.replace(/^data:.*?;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

      if (serverSupabaseUrl && !serverSupabaseUrl.includes('placeholder')) {
        try {
          const { data: uploadData, error: uploadErr } = await supabase.storage
            .from(bucket)
            .upload(filePath, buffer, {
              contentType: mimeType,
              upsert: true
            });

          console.log('[Server Supabase upload() Response]:', { uploadData, uploadErr });

          if (!uploadErr) {
            const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
            console.log('[Server Supabase Public URL]:', publicUrlData.publicUrl);
            return res.json({ success: true, url: publicUrlData.publicUrl });
          } else {
            console.error('[Server Supabase Storage Error Object]:', uploadErr);
          }
        } catch (sbErr) {
          console.error('[Server Supabase Storage Exception]:', sbErr);
        }
      }

      // Local fallback on server disk if Supabase is unconfigured or unavailable
      const ext = mimeType.split('/')[1] || 'jpg';
      const localFileName = `media_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
      const localFilePath = path.join(DATA_DIR, localFileName);
      fs.writeFileSync(localFilePath, buffer);
      const localUrl = `/api/media/${localFileName}`;
      console.log(`[Server Storage Fallback] Saved locally to ${localUrl}`);
      return res.json({ success: true, url: localUrl });
    } else {
      return res.json({ success: true, url: dataUrl });
    }
  } catch (err: any) {
    console.error('Server upload error:', err);
    return res.status(500).json({ success: false, error: err?.message || 'Server upload failed' });
  }
});

// Serve uploaded local media fallback files
app.get('/api/media/:fileId', (req, res) => {
  const filePath = path.join(DATA_DIR, req.params.fileId);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'Media file not found' });
  }
});

// Get all cards
app.get('/api/cards', (req, res) => {
  const list = Object.values(cardsStore).map(card => ({
    id: card.id,
    agreementId: card.agreementId || card.id,
    certificateId: card.certificateId || `CERT-${card.agreementNumber}`,
    themeId: card.themeId,
    friendName: card.friendName,
    senderName: card.senderName,
    status: card.status,
    agreementNumber: card.agreementNumber,
    viewsCount: card.viewsCount || 0,
    downloadsCount: card.downloadsCount || 0,
    createdAt: card.createdAt,
    signedAt: card.signedAt,
    photosCount: card.photos ? card.photos.length : (card.friendPhotoUrl ? 1 : 0),
    musicType: card.musicType
  }));
  res.json({ success: true, cards: list });
});

// Create new card
app.post('/api/cards', async (req, res) => {
  try {
    const cardData: Partial<FriendshipCard> = req.body;
    if (!cardData.friendName || !cardData.senderName) {
      return res.status(400).json({ success: false, error: 'Friend Name and Sender Name are required.' });
    }

    const id = generateUniqueCardId();
    const agreementNumber = `FDA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const photos = cardData.photos && cardData.photos.length > 0
      ? cardData.photos
      : cardData.friendPhotoUrl
        ? [{ id: 'p1', url: cardData.friendPhotoUrl, caption: `${cardData.friendName}` }]
        : [];

    const newCard: FriendshipCard = {
      id,
      agreementId: `${id}_AGR`,
      certificateId: `CERT-${agreementNumber}`,
      themeId: cardData.themeId || 'friendship',
      friendName: cardData.friendName,
      friendNickname: cardData.friendNickname || '',
      senderName: cardData.senderName,
      customMessage: cardData.customMessage || 'Thank you for being an irreplaceable part of my life!',
      friendPhotoUrl: photos[0]?.url || cardData.friendPhotoUrl || '',
      photos,
      commitmentsTitle: cardData.commitmentsTitle || 'OUR UNBREAKABLE PACT',
      commitments: cardData.commitments && cardData.commitments.length > 0 ? cardData.commitments : DEFAULT_COMMITMENTS,
      musicType: cardData.musicType || 'preset',
      presetAudioTrack: cardData.presetAudioTrack || 'Acoustic Nostalgia',
      customAudioUrl: cardData.customAudioUrl || '',
      audioSettings: cardData.audioSettings || {
        autoplay: true,
        loop: true,
        volume: 0.5,
        fadeIn: true
      },
      senderSignature: cardData.senderSignature || {
        type: 'type',
        typedName: cardData.senderName,
        signedAt: new Date().toISOString()
      },
      status: 'published',
      agreementNumber,
      location: cardData.location || 'Global Friendship Network',
      viewsCount: 0,
      downloadsCount: 0,
      shareAnalytics: { whatsapp: 0, telegram: 0, directCopy: 0 },
      visitorLogs: [],
      createdAt: new Date().toISOString()
    };

    cardsStore[id] = newCard;
    saveCardsLocal();
    await saveCardToSupabase(newCard);

    res.json({ success: true, card: newCard });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get card by ID and increment views count & visitor log
app.get('/api/cards/:id', async (req, res) => {
  const card = cardsStore[req.params.id];
  if (!card) {
    return res.status(404).json({ success: false, error: 'Friendship Experience card not found.' });
  }

  // Increment view count
  card.viewsCount = (card.viewsCount || 0) + 1;
  if (!card.visitorLogs) card.visitorLogs = [];
  card.visitorLogs.push({
    timestamp: new Date().toISOString(),
    userAgent: req.headers['user-agent'] || 'Unknown'
  });
  saveCardsLocal();
  saveCardToSupabase(card);

  res.json({ success: true, card });
});

// Track download
app.post('/api/cards/:id/download', async (req, res) => {
  const card = cardsStore[req.params.id];
  if (card) {
    card.downloadsCount = (card.downloadsCount || 0) + 1;
    saveCardsLocal();
    saveCardToSupabase(card);
    return res.json({ success: true, downloadsCount: card.downloadsCount });
  }
  res.status(404).json({ success: false, error: 'Card not found' });
});

// Track share analytics
app.post('/api/cards/:id/share', async (req, res) => {
  const card = cardsStore[req.params.id];
  const { channel } = req.body;
  if (card) {
    if (!card.shareAnalytics) {
      card.shareAnalytics = { whatsapp: 0, telegram: 0, directCopy: 0 };
    }
    if (channel === 'whatsapp') card.shareAnalytics.whatsapp++;
    else if (channel === 'telegram') card.shareAnalytics.telegram++;
    else if (channel === 'directCopy') card.shareAnalytics.directCopy++;

    saveCardsLocal();
    saveCardToSupabase(card);
    return res.json({ success: true, shareAnalytics: card.shareAnalytics });
  }
  res.status(404).json({ success: false, error: 'Card not found' });
});

// Sign agreement by recipient
app.post('/api/cards/:id/sign', async (req, res) => {
  const card = cardsStore[req.params.id];
  if (!card) {
    return res.status(404).json({ success: false, error: 'Friendship Experience card not found.' });
  }

  const { recipientSignature, certificateImageDataUrl } = req.body;
  if (!recipientSignature) {
    return res.status(400).json({ success: false, error: 'Recipient signature is required.' });
  }

  card.recipientSignature = recipientSignature;
  card.status = 'signed';
  card.signedAt = new Date().toISOString();
  if (certificateImageDataUrl) {
    card.certificateImageDataUrl = certificateImageDataUrl;
  }
  saveCardsLocal();
  await saveCardToSupabase(card);

  res.json({ success: true, card });
});

// Delete card (Admin operation)
app.delete('/api/cards/:id', async (req, res) => {
  const cardId = req.params.id;
  if (cardsStore[cardId]) {
    delete cardsStore[cardId];
    saveCardsLocal();
    await deleteCardFromSupabase(cardId);
    return res.json({ success: true, message: 'Card deleted successfully.' });
  }
  res.status(404).json({ success: false, error: 'Card not found.' });
});

// Upload custom audio file (base64 string)
app.post('/api/upload-audio', (req, res) => {
  try {
    const { audioData, fileName } = req.body;
    if (!audioData) {
      return res.status(400).json({ success: false, error: 'Audio data base64 is required.' });
    }

    const matches = audioData.match(/^data:(audio\/[a-zA-Z0-9]+);base64,(.+)$/);
    let buffer: Buffer;
    let ext = 'mp3';

    if (matches && matches.length === 3) {
      const mime = matches[1];
      ext = mime.split('/')[1] || 'mp3';
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(audioData, 'base64');
    }

    const fileId = `audio_${Date.now()}_${Math.random().toString(36).substring(2, 6)}.${ext}`;
    const filePath = path.join(AUDIO_DIR, fileId);
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/api/audio/${fileId}`;
    res.json({ success: true, audioUrl: publicUrl });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Serve uploaded audio file
app.get('/api/audio/:fileId', (req, res) => {
  const filePath = path.join(AUDIO_DIR, req.params.fileId);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'Audio file not found' });
  }
});

// Verify admin passcode
app.post('/api/admin/verify-passcode', (req, res) => {
  const { passcode } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD || '0920';
  if (passcode === adminPassword) {
    return res.json({ success: true });
  }
  return res.status(401).json({ success: false, error: 'Incorrect Passcode. Access Denied.' });
});

// Get analytics stats for Admin Dashboard
app.get('/api/analytics', (req, res) => {
  const allCards = Object.values(cardsStore);
  const totalCards = allCards.length;
  const totalViews = allCards.reduce((sum, c) => sum + (c.viewsCount || 0), 0);
  const totalSignedAgreements = allCards.filter(c => c.status === 'signed').length;
  const totalCustomAudioUploaded = allCards.filter(c => c.musicType === 'custom').length;
  const totalDownloads = allCards.reduce((sum, c) => sum + (c.downloadsCount || 0), 0);

  const themeBreakdown: Record<string, number> = {
    friendship: 0,
    birthday: 0,
    love: 0,
    anniversary: 0,
    diwali: 0,
    christmas: 0,
    newyear: 0
  };

  allCards.forEach(c => {
    if (themeBreakdown[c.themeId] !== undefined) {
      themeBreakdown[c.themeId]++;
    }
  });

  const stats: AnalyticsStats = {
    totalCards,
    totalViews,
    totalSignedAgreements,
    totalCustomAudioUploaded,
    totalDownloads,
    themeBreakdown: themeBreakdown as any
  };

  res.json({ success: true, stats, allCardsDetail: allCards });
});

// VITE MIDDLEWARE / PRODUCTION STATIC SERVING
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Friendship Day Experience Server running on http://localhost:${PORT}`);
  });
}

startServer();
