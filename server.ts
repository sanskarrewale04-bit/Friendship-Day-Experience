import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { FriendshipCard, AnalyticsStats } from './src/types';

const app = express();
const PORT = 3000;

// Middleware for parsing JSON with increased limit for base64 photo/audio uploads
app.use(express.json({ limit: '25mb' }));

// Local database store directory
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

// Load existing cards from file
if (fs.existsSync(CARDS_FILE)) {
  try {
    const raw = fs.readFileSync(CARDS_FILE, 'utf-8');
    cardsStore = JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse cards.json:', err);
    cardsStore = {};
  }
}

// Helper to persist cards
const saveCards = () => {
  try {
    fs.writeFileSync(CARDS_FILE, JSON.stringify(cardsStore, null, 2));
  } catch (err) {
    console.error('Failed to save cards:', err);
  }
};

// Default initial commitments if none provided
const DEFAULT_COMMITMENTS = [
  {
    id: 'c1',
    number: 1,
    icon: 'Sparkles',
    title: 'The Years of Growth Pact',
    description: 'To celebrate each other’s victories, big or small, and stand as an unshakeable pillars through life’s unpredictable turns.',
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

// Populate sample cards if empty for instant preview & demonstration
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
    viewsCount: 142,
    downloadsCount: 18,
    shareAnalytics: { whatsapp: 12, telegram: 4, directCopy: 21 },
    visitorLogs: [
      { timestamp: new Date().toISOString(), userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X)' }
    ],
    createdAt: new Date().toISOString()
  };

  const sampleCard2: FriendshipCard = {
    id: 'sample-maya-birthday',
    agreementId: 'sample-maya-birthday-AGR',
    certificateId: 'CERT-FDA-2026-5510',
    themeId: 'birthday',
    friendName: 'Maya Lin',
    friendNickname: 'May-May',
    senderName: 'Jordan Lee',
    customMessage: 'Happy Birthday to the brightest star in every room! May this year bring endless cake, zero stress, and unlimited laughs!',
    friendPhotoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    photos: [
      {
        id: 'p1',
        url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
        caption: 'Birthday Surprise Blast',
        date: '2025-05-12',
        location: 'New York City'
      },
      {
        id: 'p2',
        url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',
        caption: 'Summer Beach Escape',
        date: '2025-07-04',
        location: 'Hamptons'
      }
    ],
    commitmentsTitle: 'OUR UNBREAKABLE PACT',
    commitments: DEFAULT_COMMITMENTS,
    musicType: 'preset',
    presetAudioTrack: 'Uplifting Festive Beats (Fun & Upbeat)',
    audioSettings: {
      autoplay: true,
      loop: true,
      volume: 0.6,
      fadeIn: true
    },
    senderSignature: {
      type: 'type',
      typedName: 'Jordan Lee',
      signedAt: new Date().toISOString()
    },
    recipientSignature: {
      type: 'type',
      typedName: 'Maya Lin',
      signedAt: new Date().toISOString()
    },
    status: 'signed',
    agreementNumber: 'FDA-2026-5510',
    location: 'New York, NY',
    viewsCount: 298,
    downloadsCount: 34,
    shareAnalytics: { whatsapp: 28, telegram: 9, directCopy: 45 },
    visitorLogs: [
      { timestamp: new Date().toISOString(), userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)' }
    ],
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    signedAt: new Date(Date.now() - 86400000 * 2).toISOString()
  };

  cardsStore[sampleCard1.id] = sampleCard1;
  cardsStore[sampleCard2.id] = sampleCard2;
  saveCards();
}

// API ROUTES BEFORE VITE MIDDLEWARE

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
app.post('/api/cards', (req, res) => {
  try {
    const cardData: Partial<FriendshipCard> = req.body;
    if (!cardData.friendName || !cardData.senderName) {
      return res.status(400).json({ success: false, error: 'Friend Name and Sender Name are required.' });
    }

    const id = `card_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
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
    saveCards();

    res.json({ success: true, card: newCard });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get card by ID and increment views count & visitor log
app.get('/api/cards/:id', (req, res) => {
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
  saveCards();

  res.json({ success: true, card });
});

// Track download
app.post('/api/cards/:id/download', (req, res) => {
  const card = cardsStore[req.params.id];
  if (card) {
    card.downloadsCount = (card.downloadsCount || 0) + 1;
    saveCards();
    return res.json({ success: true, downloadsCount: card.downloadsCount });
  }
  res.status(404).json({ success: false, error: 'Card not found' });
});

// Track share analytics
app.post('/api/cards/:id/share', (req, res) => {
  const card = cardsStore[req.params.id];
  const { channel } = req.body;
  if (card) {
    if (!card.shareAnalytics) {
      card.shareAnalytics = { whatsapp: 0, telegram: 0, directCopy: 0 };
    }
    if (channel === 'whatsapp') card.shareAnalytics.whatsapp++;
    else if (channel === 'telegram') card.shareAnalytics.telegram++;
    else if (channel === 'directCopy') card.shareAnalytics.directCopy++;

    saveCards();
    return res.json({ success: true, shareAnalytics: card.shareAnalytics });
  }
  res.status(404).json({ success: false, error: 'Card not found' });
});

// Sign agreement by recipient
app.post('/api/cards/:id/sign', (req, res) => {
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
  saveCards();

  res.json({ success: true, card });
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
  if (passcode === '0920') {
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

  // Return full card objects for hidden admin view so Sonu can inspect agreements, certificates, photos, audio, shares, downloads & details
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
