import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { FriendshipCard, AnalyticsStats } from './src/types';
import { db, storage } from './src/lib/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

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

// Map Firestore doc to FriendshipCard object
const mapDocToCard = (data: any, docId: string): FriendshipCard => {
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
    musicType: (data.music || data.customAudioUrl)?.startsWith('http') ? 'custom' : 'preset',
    presetAudioTrack: (data.music || data.customAudioUrl)?.startsWith('http') ? undefined : (data.music || data.presetAudioTrack || 'Acoustic Nostalgia (Warm Guitar & Piano)'),
    customAudioUrl: (data.music || data.customAudioUrl)?.startsWith('http') ? (data.music || data.customAudioUrl) : '',
    audioSettings: openingConfig.audioSettings || data.audioSettings || { autoplay: true, loop: true, volume: 0.5, fadeIn: true },
    senderSignature: data.senderSignature || { type: 'type', typedName: senderName, signedAt: data.createdAt },
    recipientSignature: data.recipientSignature || data.receiverSignature || undefined,
    status: data.status || 'published',
    agreementNumber: data.shareId ? `FDA-2026-${data.shareId.slice(0, 4)}` : 'FDA-2026-8942',
    location: openingConfig.location || data.location || 'Special Moments',
    createdAt: data.createdAt || new Date().toISOString(),
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
};

// Save card to Firestore helper
const saveCardToFirestore = async (card: FriendshipCard) => {
  try {
    const docData = {
      id: card.id,
      shareId: card.id,
      senderName: card.senderName,
      receiverName: card.friendName,
      theme: card.themeId || 'friendship',
      openingConfig: {
        ...card.openingConfig,
        friendNickname: card.friendNickname,
        commitmentsTitle: card.commitmentsTitle,
        audioSettings: card.audioSettings,
        location: card.location
      },
      customMessage: card.customMessage,
      commitments: card.commitments || [],
      photos: card.photos || [],
      music: card.customAudioUrl || card.presetAudioTrack || '',
      agreementPDF: card.agreementPdf || '',
      agreementPNG: card.agreementPng || '',
      certificatePDF: card.certificatePdf || '',
      certificatePNG: card.certificatePng || '',
      senderSignature: card.senderSignature,
      receiverSignature: card.recipientSignature || null,
      createdAt: card.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      published: true,
      status: card.status || 'published'
    };

    const expRef = doc(db, 'experiences', card.id);
    await setDoc(expRef, docData, { merge: true });

    const cardRef = doc(db, 'cards', card.id);
    await setDoc(cardRef, docData, { merge: true });
  } catch (err) {
    console.error(`Firestore save error for card ${card.id}:`, err);
  }
};

// Delete card from Firestore helper
const deleteCardFromFirestore = async (cardId: string) => {
  try {
    await deleteDoc(doc(db, 'experiences', cardId)).catch(() => {});
    await deleteDoc(doc(db, 'cards', cardId)).catch(() => {});
  } catch (err) {
    console.error(`Firestore delete error for card ${cardId}:`, err);
  }
};

// Load cards from Firestore at startup
const loadCardsFromFirestore = async () => {
  try {
    const querySnap = await getDocs(collection(db, 'experiences'));
    if (!querySnap.empty) {
      querySnap.docs.forEach((docSnap) => {
        const card = mapDocToCard(docSnap.data(), docSnap.id);
        cardsStore[card.id] = card;
      });
      saveCardsLocal();
      console.log(`Loaded ${querySnap.size} cards from Firestore experiences collection.`);
    }
  } catch (err) {
    console.error('Firestore initial load error, using local cache:', err);
  }
};

loadCardsFromFirestore();

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

// Proxy upload endpoint to assist client with Firebase Storage upload
app.post('/api/upload', async (req, res) => {
  try {
    const { dataUrl, path: storagePath } = req.body;
    if (!dataUrl || !storagePath) {
      return res.status(400).json({ success: false, error: 'Missing dataUrl or path' });
    }

    if (typeof dataUrl === 'string' && dataUrl.startsWith('data:')) {
      const mimeMatch = dataUrl.match(/^data:(.*?);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      const base64Data = dataUrl.replace(/^data:.*?;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

      try {
        const storageRef = ref(storage, storagePath);
        const uploadTask = uploadBytesResumable(storageRef, buffer, { contentType: mimeType });

        await new Promise<void>((resolve, reject) => {
          uploadTask.on('state_changed', null, reject, resolve);
        });

        const publicUrl = await getDownloadURL(uploadTask.snapshot.ref);
        return res.json({ success: true, url: publicUrl });
      } catch (fbErr: any) {
        console.warn('Firebase Storage upload in proxy failed, saving to local uploads folder:', fbErr?.message || fbErr);
        const ext = mimeType.split('/')[1] || 'jpg';
        const fileId = `file_${Date.now()}_${Math.random().toString(36).substring(2, 6)}.${ext}`;
        const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
        if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
        const filePath = path.join(UPLOADS_DIR, fileId);
        fs.writeFileSync(filePath, buffer);
        const localUrl = `/api/uploads/${fileId}`;
        return res.json({ success: true, url: localUrl });
      }
    } else {
      return res.json({ success: true, url: dataUrl });
    }
  } catch (err: any) {
    console.error('Server upload proxy error:', err);
    return res.status(500).json({ success: false, error: err?.message || 'Server upload failed' });
  }
});

// Serve uploaded media files fallback
app.get('/api/uploads/:fileId', (req, res) => {
  const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
  const filePath = path.join(UPLOADS_DIR, req.params.fileId);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'Upload file not found' });
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
    await saveCardToFirestore(newCard);

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
  saveCardToFirestore(card);

  res.json({ success: true, card });
});

// Track download
app.post('/api/cards/:id/download', async (req, res) => {
  const card = cardsStore[req.params.id];
  if (card) {
    card.downloadsCount = (card.downloadsCount || 0) + 1;
    saveCardsLocal();
    saveCardToFirestore(card);
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
    saveCardToFirestore(card);
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
  await saveCardToFirestore(card);

  res.json({ success: true, card });
});

// Delete card (Admin operation)
app.delete('/api/cards/:id', async (req, res) => {
  const cardId = req.params.id;
  if (cardsStore[cardId]) {
    delete cardsStore[cardId];
    saveCardsLocal();
    await deleteCardFromFirestore(cardId);
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
