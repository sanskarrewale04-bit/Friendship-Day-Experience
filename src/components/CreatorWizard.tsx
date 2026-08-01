import React, { useState } from 'react';
import { THEMES, PRESET_MESSAGES } from '../data/themes';
import { ThemeId, FriendshipCard, SignatureData, PhotoItem, CommitmentItem, OpeningConfig } from '../types';
import { saveCard, getShareableCardUrl, trackCardShare } from '../services/cardService';
import { SignatureCanvas } from './SignatureCanvas';
import { EmojiPickerModal } from './EmojiPickerModal';
import { MultiPhotoUploader } from './MultiPhotoUploader';
import { CommitmentsEditor } from './CommitmentsEditor';
import { OpeningSurpriseEditor } from './OpeningSurpriseEditor';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Upload,
  Music,
  Check,
  Heart,
  Smile,
  Copy,
  Share2,
  QrCode,
  Volume2,
  FileText,
  Play,
  CheckCircle2,
  Image as ImageIcon,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import QRCode from 'qrcode';

interface CreatorWizardProps {
  onCardCreated: (card: FriendshipCard) => void;
  onCancel: () => void;
  onPreviewCard: (card: FriendshipCard) => void;
}

export const CreatorWizard: React.FC<CreatorWizardProps> = ({
  onCardCreated,
  onCancel,
  onPreviewCard
}) => {
  const [step, setStep] = useState<number>(1);

  // Form State
  const [selectedTheme, setSelectedTheme] = useState<ThemeId>('friendship');
  const [friendName, setFriendName] = useState<string>('');
  const [friendNickname, setFriendNickname] = useState<string>('');
  const [senderName, setSenderName] = useState<string>('');
  const [location, setLocation] = useState<string>('San Francisco, CA');
  const [customMessage, setCustomMessage] = useState<string>(PRESET_MESSAGES[0]);

  // Opening Surprise Config State
  const [openingConfig, setOpeningConfig] = useState<OpeningConfig>({
    openingHeading: '',
    openingMessage: 'I made something tiny just for you ❤️\nBefore you continue... I wanted to remind you how special our friendship is.',
    messageStyle: 'best_friends',
    typingSpeed: 'normal',
    textAnimation: 'typewriter',
    backgroundEffect: 'hearts',
    musicTiming: 'immediately',
    continueButtonText: 'Open My Surprise'
  });

  // Multiple Photos State
  const [photos, setPhotos] = useState<PhotoItem[]>([
    {
      id: 'default_1',
      url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',
      caption: 'Unforgettable Moments Together',
      date: '2026-07-29',
      location: 'San Francisco, CA'
    }
  ]);

  // Commitments Pact State
  const [commitmentsTitle, setCommitmentsTitle] = useState<string>('OUR UNBREAKABLE PACT');
  const [commitments, setCommitments] = useState<CommitmentItem[]>([
    {
      id: 'c1',
      number: 1,
      icon: 'ShieldCheck',
      title: 'The Years of Growth Pact',
      description: 'We promise to support each other through every chapter, career shift, and milestone.',
      accentColor: '#f59e0b'
    },
    {
      id: 'c2',
      number: 2,
      icon: 'Heart',
      title: 'The Unbroken Trust Treaty',
      description: 'Secrets shared shall remain sacred forever, protected under the seal of honor.',
      accentColor: '#ec4899'
    },
    {
      id: 'c3',
      number: 3,
      icon: 'Sparkles',
      title: 'The Annual Reunion Mandate',
      description: 'No matter how far life takes us, we agree to meet at least once every year.',
      accentColor: '#8b5cf6'
    },
    {
      id: 'c4',
      number: 4,
      icon: 'Star',
      title: 'The Shared Journey Accord',
      description: 'In times of victory we celebrate together, and in times of trouble we stand side by side.',
      accentColor: '#10b981'
    }
  ]);

  // Audio State
  const [musicType, setMusicType] = useState<'preset' | 'custom'>('preset');
  const [customAudioUrl, setCustomAudioUrl] = useState<string>('');
  const [isUploadingAudio, setIsUploadingAudio] = useState<boolean>(false);
  const [audioSettings, setAudioSettings] = useState({
    autoplay: true,
    loop: true,
    volume: 0.6,
    fadeIn: true
  });

  // Signature State
  const [senderSignature, setSenderSignature] = useState<SignatureData | null>(null);

  // Modals & UI helpers
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [createdCard, setCreatedCard] = useState<FriendshipCard | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);

  const themeConfig = THEMES[selectedTheme];

  // Handle Custom Audio File Upload
  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAudio(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        const res = await fetch('/api/upload-audio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ audioData: base64Data, fileName: file.name })
        });
        const data = await res.json();
        if (data.success && data.audioUrl) {
          setCustomAudioUrl(data.audioUrl);
          setMusicType('custom');
        } else {
          alert('Failed to upload audio: ' + (data.error || 'Unknown error'));
        }
        setIsUploadingAudio(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setIsUploadingAudio(false);
    }
  };

  // Build card payload for preview or final creation
  const getCardPayload = (): FriendshipCard => {
    const mainPhoto = photos.length > 0 ? photos[0].url : 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80';
    const cleanId = createdCard?.id && !createdCard.id.startsWith('preview_') ? createdCard.id : undefined;

    return {
      id: cleanId as any,
      themeId: selectedTheme,
      friendName: friendName.trim() || 'Best Friend',
      friendNickname: friendNickname.trim() || '',
      senderName: senderName.trim() || 'Your Friend',
      customMessage: customMessage.trim(),
      openingConfig: {
        ...openingConfig,
        openingHeading: openingConfig.openingHeading.trim() || `Hey ${friendName.trim() || 'Friend'}...`
      },
      friendPhotoUrl: mainPhoto,
      photos: photos,
      commitmentsTitle: commitmentsTitle.trim() || 'OUR UNBREAKABLE PACT',
      commitments: commitments,
      musicType,
      presetAudioTrack: themeConfig.defaultAudioTitle,
      customAudioUrl,
      audioSettings,
      senderSignature: senderSignature || {
        type: 'type',
        typedName: senderName || 'Sender',
        signedAt: new Date().toISOString()
      },
      status: 'published',
      agreementNumber: `FDA-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      agreementId: createdCard?.agreementId || `AGR-${Math.floor(100000 + Math.random() * 900000)}`,
      certificateId: createdCard?.certificateId || `CERT-${Math.floor(100000 + Math.random() * 900000)}`,
      location: location || 'Global Friendship Network',
      viewsCount: 0,
      downloadsCount: 0,
      shareAnalytics: { whatsapp: 0, telegram: 0, directCopy: 0 },
      visitorLogs: [],
      createdAt: new Date().toISOString()
    };
  };

  // Save & publish card
  const handlePublishCard = async () => {
    if (!friendName.trim()) {
      alert("Please enter your friend's name in Step 1.");
      setStep(1);
      return;
    }
    if (!senderName.trim()) {
      alert("Please enter your name in Step 1.");
      setStep(1);
      return;
    }
    if (!customMessage.trim()) {
      alert("Please write a message for your friend in Step 4.");
      setStep(4);
      return;
    }

    setIsSubmitting(true);
    setUploadError(null);
    console.log("Saving experience...");

    try {
      const payload = getCardPayload();
      console.log("Card payload generated:", payload);
      const card = await saveCard(payload);

      if (card && card.id) {
        console.log("Card successfully saved with ID:", card.id);
        setCreatedCard(card);
        onCardCreated(card);

        // Update URL bar to /card/{card.id} without full page reload
        const cardUrl = getShareableCardUrl(card.id);
        console.log("Generated Share URL:", cardUrl);
        try {
          window.history.pushState({}, '', cardUrl);
        } catch (navErr) {
          console.warn("History pushState warning:", navErr);
        }

        // Generate QR code safely
        try {
          const qr = await QRCode.toDataURL(cardUrl, { margin: 1, width: 200 });
          setQrDataUrl(qr);
        } catch (qrErr) {
          console.warn("QR code generation warning:", qrErr);
        }

        // Advance to step 9 (Share Screen)
        setStep(9);
      } else {
        throw new Error("Unable to obtain valid ID for saved experience.");
      }
    } catch (err: any) {
      console.error('Error publishing card:', err);
      const errorMessage = err?.message || 'Failed to generate experience. Please check your connection and try again.';
      setUploadError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyShareLink = () => {
    if (!createdCard) return;
    const url = getShareableCardUrl(createdCard.id);
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 pointer-events-none" />

      {/* Progress Header */}
      <div className="relative z-10 w-full max-w-2xl mb-8">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
          <button
            onClick={step > 1 && step < 9 ? () => setStep(step - 1) : onCancel}
            className="flex items-center gap-1 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> {step === 1 ? 'Cancel' : 'Back'}
          </button>
          <span>Step {step} of 8</span>
        </div>
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 h-full transition-all duration-300"
            style={{ width: `${(Math.min(step, 8) / 8) * 100}%` }}
          />
        </div>
      </div>

      {/* STEP 1: NAMES & LOCATION */}
      {step === 1 && (
        <div className="relative z-10 w-full max-w-lg bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          <div className="text-center mb-6">
            <span className="text-4xl mb-2 block">🤝</span>
            <h2 className="text-2xl font-extrabold text-slate-100 mb-1">Who is this experience for?</h2>
            <p className="text-xs text-slate-400">Enter your name and your friend's name to personalize the pact</p>
          </div>

          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Friend's Full Name *
              </label>
              <input
                type="text"
                value={friendName}
                onChange={(e) => setFriendName(e.target.value)}
                placeholder="e.g. Alex Rivers"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nickname / Pet Name (Optional)
              </label>
              <input
                type="text"
                value={friendNickname}
                onChange={(e) => setFriendNickname(e.target.value)}
                placeholder="e.g. Al, Chief, Partner in crime"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Your Name (Sender) *
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="e.g. Sam Vance"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  City / Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. San Francisco, CA"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              if (!friendName.trim()) return alert('Please enter your friend\'s name.');
              if (!senderName.trim()) return alert('Please enter your name.');
              setStep(2);
            }}
            className="w-full bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:opacity-95 text-white font-bold py-3.5 px-6 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
          >
            <span>Next: Create Opening Surprise</span> <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 2: CREATE YOUR OPENING SURPRISE */}
      {step === 2 && (
        <div className="relative z-10 w-full max-w-4xl bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          <OpeningSurpriseEditor
            config={openingConfig}
            onChange={setOpeningConfig}
            friendName={friendName}
            senderName={senderName}
          />

          <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-slate-800">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:opacity-95 text-white font-bold py-3 px-8 rounded-xl shadow-xl transition-all flex items-center gap-2 text-xs cursor-pointer"
            >
              <span>Next: Select Theme</span> <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: CHOOSE THEME */}
      {step === 3 && (
        <div className="relative z-10 w-full max-w-3xl bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 mb-2">
              Choose Friendship Theme
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Each theme sets custom color palettes, background particle physics, fonts, and legal clauses.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {Object.values(THEMES).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTheme(t.id)}
                className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden group cursor-pointer ${
                  selectedTheme === t.id
                    ? 'border-amber-500 ring-2 ring-amber-500/50 bg-slate-800/90 shadow-xl'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{t.emoji}</span>
                  {selectedTheme === t.id && (
                    <span className="bg-amber-500 text-slate-950 p-1 rounded-full">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-sm text-slate-100 mb-1">{t.name}</h3>
                <p className="text-[11px] text-slate-400 line-clamp-2">{t.tagline}</p>
              </button>
            ))}
          </div>

          <button
            onClick={() => setStep(4)}
            className="w-full bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:opacity-95 text-white font-bold py-3.5 px-6 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
          >
            <span>Next: Personal Message</span> <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 4: CUSTOM MESSAGE */}
      {step === 4 && (
        <div className="relative z-10 w-full max-w-lg bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-extrabold text-slate-100">Write Personal Message</h2>
            <button
              type="button"
              onClick={() => setIsEmojiOpen(true)}
              className="p-2 bg-slate-800 text-amber-400 hover:bg-slate-700 rounded-xl transition-colors text-xs flex items-center gap-1 font-semibold"
            >
              <Smile className="w-4 h-4" /> Add Emoji
            </button>
          </div>

          <p className="text-xs text-slate-400 mb-4">
            This message will appear line-by-line during the recipient's animated movie experience.
          </p>

          <div className="mb-4">
            <textarea
              rows={5}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Write your heartfelt message here..."
              className="w-full p-4 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm leading-relaxed"
            />
          </div>

          {/* Preset Suggestions */}
          <div className="mb-6">
            <span className="text-[11px] font-semibold text-slate-400 block mb-2 uppercase tracking-wider">
              Need Inspiration? Click to Insert Preset:
            </span>
            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {PRESET_MESSAGES.map((msg, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCustomMessage(msg)}
                  className="w-full p-2.5 text-left bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 rounded-xl text-xs text-slate-300 transition-all line-clamp-2"
                >
                  "{msg}"
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              if (!customMessage.trim()) return alert('Please write a message.');
              setStep(5);
            }}
            className="w-full bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:opacity-95 text-white font-bold py-3.5 px-6 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 text-sm"
          >
            <span>Next: Upload Multiple Photos</span> <ArrowRight className="w-4 h-4" />
          </button>

          <EmojiPickerModal
            isOpen={isEmojiOpen}
            onClose={() => setIsEmojiOpen(false)}
            onSelectEmoji={(emoji) => setCustomMessage((prev) => prev + ' ' + emoji)}
          />
        </div>
      )}

      {/* STEP 5: MULTI PHOTO UPLOADER */}
      {step === 5 && (
        <div className="relative z-10 w-full max-w-2xl bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-extrabold text-slate-100 mb-1">
              Upload Memory Photos (Up to 20)
            </h2>
            <p className="text-xs text-slate-400">
              Uploaded photos auto-generate a cinematic slideshow and memory timeline inside the greeting.
            </p>
          </div>

          <div className="mb-8 max-h-[420px] overflow-y-auto pr-1">
            <MultiPhotoUploader
              photos={photos}
              onChangePhotos={(newPhotos) => setPhotos(newPhotos)}
              maxPhotos={20}
            />
          </div>

          <button
            onClick={() => setStep(6)}
            className="w-full bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:opacity-95 text-white font-bold py-3.5 px-6 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 text-sm"
          >
            <span>Next: Customize Friendship Pact</span> <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 6: CUSTOMIZABLE FRIENDSHIP PACT & COMMITMENTS */}
      {step === 6 && (
        <div className="relative z-10 w-full max-w-2xl bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-extrabold text-slate-100 mb-1">
              Customize Friendship Pact
            </h2>
            <p className="text-xs text-slate-400">
              Customize pact title and add 1 to 12 solemn promises binding both parties.
            </p>
          </div>

          <div className="mb-8 max-h-[420px] overflow-y-auto pr-1">
            <CommitmentsEditor
              title={commitmentsTitle}
              onChangeTitle={(t) => setCommitmentsTitle(t)}
              commitments={commitments}
              onChangeCommitments={(c) => setCommitments(c)}
            />
          </div>

          <button
            onClick={() => setStep(7)}
            className="w-full bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:opacity-95 text-white font-bold py-3.5 px-6 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 text-sm"
          >
            <span>Next: Music Selection</span> <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 7: MUSIC SELECTION & CUSTOM AUDIO UPLOAD */}
      {step === 7 && (
        <div className="relative z-10 w-full max-w-lg bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-extrabold text-slate-100 mb-1">Choose Background Music</h2>
            <p className="text-xs text-slate-400">Set the emotional mood for your recipient's movie</p>
          </div>

          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => setMusicType('preset')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                musicType === 'preset' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🎵 Theme Preset Track
            </button>
            <button
              type="button"
              onClick={() => setMusicType('custom')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                musicType === 'custom' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🎧 Upload Own Music
            </button>
          </div>

          {musicType === 'preset' ? (
            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl mb-6 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                  Selected Preset
                </span>
                <span className="text-sm font-bold text-slate-100">{themeConfig.defaultAudioTitle}</span>
              </div>
              <Music className="w-6 h-6 text-amber-400 animate-pulse" />
            </div>
          ) : (
            <div className="mb-6">
              {customAudioUrl ? (
                <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
                    <CheckCircle2 className="w-4 h-4" /> Custom Track Uploaded Successfully!
                  </div>
                  <button
                    type="button"
                    onClick={() => setCustomAudioUrl('')}
                    className="text-[11px] text-red-400 underline"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-700 hover:border-amber-500 bg-slate-950/60 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all">
                  <Upload className="w-6 h-6 text-amber-400 mb-2" />
                  <span className="text-xs font-semibold text-slate-200 mb-1">
                    {isUploadingAudio ? 'Uploading Track...' : 'Click to Upload Custom Music (MP3/WAV/M4A)'}
                  </span>
                  <span className="text-[10px] text-slate-500">Secure Cloud Storage up to 10MB</span>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioUpload}
                    disabled={isUploadingAudio}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          )}

          {/* Audio Settings Toggles */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-3 mb-8 text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Audio Behavior Settings
            </span>
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-medium">Autoplay on First Interaction</span>
              <input
                type="checkbox"
                checked={audioSettings.autoplay}
                onChange={(e) => setAudioSettings({ ...audioSettings, autoplay: e.target.checked })}
                className="w-4 h-4 accent-amber-500 rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-medium">Smooth Audio Fade In</span>
              <input
                type="checkbox"
                checked={audioSettings.fadeIn}
                onChange={(e) => setAudioSettings({ ...audioSettings, fadeIn: e.target.checked })}
                className="w-4 h-4 accent-amber-500 rounded"
              />
            </div>
          </div>

          <button
            onClick={() => setStep(8)}
            className="w-full bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:opacity-95 text-white font-bold py-3.5 px-6 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 text-sm"
          >
            <span>Next: Sign Legal Pact</span> <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 8: SENDER SIGNATURE & PREVIEW */}
      {step === 8 && (
        <div className="relative z-10 w-full max-w-lg bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-extrabold text-slate-100 mb-1">Sign Friendship Agreement</h2>
            <p className="text-xs text-slate-400">As Party A, sign below to formalize your offer</p>
          </div>

          <div className="mb-6">
            <SignatureCanvas
              defaultName={senderName}
              label="Sender Signature (Party A)"
              onSignatureSave={(sig) => setSenderSignature(sig)}
            />
            {senderSignature && (
              <div className="mt-3 p-2 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-center text-xs text-emerald-300 font-semibold">
                ✓ Signature Applied Successfully!
              </div>
            )}
          </div>

          {uploadError && (
            <div className="mb-6 p-4 bg-rose-950/60 border border-rose-500/50 rounded-2xl text-left flex items-start gap-3 shadow-lg">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-rose-200 uppercase tracking-wider mb-1">
                  Upload Error
                </h4>
                <p className="text-xs text-rose-300 leading-relaxed mb-2">
                  {uploadError}
                </p>
                <p className="text-[11px] text-slate-400">
                  Please check your internet connection or try re-selecting your photos.
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => onPreviewCard(getCardPayload())}
              className="flex-1 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 font-bold py-3 px-4 rounded-2xl transition-all flex items-center justify-center gap-2 text-xs"
            >
              <Play className="w-4 h-4 text-amber-400 fill-amber-400" /> Test Full Experience
            </button>

            <button
              type="button"
              onClick={handlePublishCard}
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:opacity-95 text-white font-bold py-3.5 px-6 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Generating Card...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Publish & Get Share Link
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 9: FINAL SHARE SCREEN */}
      {step === 9 && createdCard && (
        <div className="relative z-10 w-full max-w-lg bg-slate-900/95 border border-amber-500/40 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl text-center">
          <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-2xl font-extrabold text-slate-100 mb-1">
            Experience Generated! 🎉
          </h2>
          <p className="text-xs text-slate-400 mb-6">
            Send this link to <strong className="text-amber-400">{createdCard.friendName}</strong> to start their animated movie journey.
          </p>

          {/* Shareable Link Box */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between gap-2 mb-6">
            <span className="text-xs text-amber-300 font-mono truncate pl-2">
              {getShareableCardUrl(createdCard.id)}
            </span>
            <button
              onClick={copyShareLink}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1 transition-colors whitespace-nowrap cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedLink ? 'Copied!' : 'Copy Link'}
            </button>
          </div>

          {/* QR Code */}
          {qrDataUrl && (
            <div className="bg-white p-4 rounded-2xl inline-block mb-6 shadow-xl border-4 border-amber-500/30">
              <img src={qrDataUrl} alt="QR Code Share" className="w-36 h-36 mx-auto" />
              <span className="text-[10px] text-slate-800 font-bold block mt-1">Scan to Open Card</span>
            </div>
          )}

          {/* Quick Social Share Buttons */}
          <div className="grid grid-cols-2 gap-2.5 mb-6">
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Hey ${createdCard.friendName}! ${createdCard.senderName} created a special Friendship Day experience for you. Open it here: ${getShareableCardUrl(createdCard.id)}`)}`}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackCardShare(createdCard.id, 'whatsapp')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" /> WhatsApp
            </a>

            <a
              href={`https://t.me/share/url?url=${encodeURIComponent(getShareableCardUrl(createdCard.id))}&text=${encodeURIComponent(`Check out this Friendship Experience for ${createdCard.friendName}!`)}`}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackCardShare(createdCard.id, 'telegram')}
              className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" /> Telegram
            </a>

            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareableCardUrl(createdCard.id))}`}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackCardShare(createdCard.id, 'facebook')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" /> Facebook
            </a>

            <button
              onClick={() => {
                copyShareLink();
                trackCardShare(createdCard.id, 'directCopy');
                alert('Card link copied! You can now paste it directly into Instagram Story or DM.');
              }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" /> Instagram
            </button>
          </div>

          <button
            onClick={() => onPreviewCard(createdCard)}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3 px-4 rounded-2xl transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 text-amber-400 fill-amber-400" /> Watch Experience Now
          </button>
        </div>
      )}
    </div>
  );
};

