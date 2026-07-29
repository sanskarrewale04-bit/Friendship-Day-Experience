import React, { useState, useEffect } from 'react';
import { FriendshipCard, SignatureData } from '../types';
import { THEMES } from '../data/themes';
import { soundEngine } from '../utils/audio';
import { ParticleBackground } from './ParticleBackground';
import { FriendshipAgreement } from './FriendshipAgreement';
import { SignatureCanvas } from './SignatureCanvas';
import { CertificateView } from './CertificateView';
import { PersonalizedOpening } from './PersonalizedOpening';
import { CinematicSlideshow } from './CinematicSlideshow';
import { CommitmentsSection } from './CommitmentsSection';
import { MemoryTimeline } from './MemoryTimeline';
import { Play, Sparkles, Heart, ArrowRight, ShieldCheck, Check, Volume2, VolumeX, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';

interface InteractiveExperienceProps {
  card: FriendshipCard;
  onExit: () => void;
  onCreateOwn: () => void;
  onUnlockAdmin?: () => void;
}

export const InteractiveExperience: React.FC<InteractiveExperienceProps> = ({
  card,
  onExit,
  onCreateOwn,
  onUnlockAdmin
}) => {
  const [movieStep, setMovieStep] = useState<number>(0); // 0 = Opening, 1 = Intro, 2 = Photos & Reel, 3 = Message, 4 = Clauses, 5 = Fireworks, 6 = Agreement, 7 = Signed Certificate
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [recipientSig, setRecipientSig] = useState<SignatureData | null>(card.recipientSignature || null);
  const [showSignPad, setShowSignPad] = useState(false);

  const theme = THEMES[card.themeId] || THEMES.friendship;

  // Start Audio on First Unbox Click
  const startExperience = () => {
    setMovieStep(1);
    if (card.musicType === 'custom' && card.customAudioUrl) {
      soundEngine.playCustomAudio(card.customAudioUrl, {
        loop: card.audioSettings.loop,
        volume: card.audioSettings.volume,
        fadeIn: card.audioSettings.fadeIn
      });
    } else {
      soundEngine.playPresetSynth(theme.synthFrequency, card.audioSettings.volume);
    }
    setIsPlayingAudio(true);
  };

  // Trigger Confetti Fireworks when reaching Step 5
  useEffect(() => {
    if (movieStep === 5) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 999 };

      const interval: any = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
          return clearInterval(interval);
        }
        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [movieStep]);

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  // Handle Recipient Signature Save
  const handleRecipientSigned = async (sig: SignatureData) => {
    setRecipientSig(sig);
    setShowSignPad(false);

    // Persist to server
    try {
      await fetch(`/api/cards/${card.id}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientSignature: sig })
      });
    } catch (err) {
      console.error('Failed to save recipient signature:', err);
    }

    setMovieStep(7); // Jump to Certificate
  };

  const photoList: any[] = card.photos && card.photos.length > 0
    ? card.photos
    : [
        {
          id: 'p1',
          url: card.friendPhotoUrl || 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',
          caption: card.friendName,
          date: new Date().toISOString().split('T')[0],
          location: card.location || 'Special Memory'
        }
      ];

  const commitmentList = card.commitments && card.commitments.length > 0
    ? card.commitments
    : theme.clauses.map((c, i) => ({
        id: `c_${i}`,
        number: i + 1,
        icon: 'Sparkles',
        title: `Pact #${i + 1}`,
        description: c,
        accentColor: '#f59e0b'
      }));

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto bg-gradient-to-br ${theme.bgGradient} text-slate-100 transition-all duration-700 font-sans`}>
      {/* Background Floating Particles */}
      <ParticleBackground type={theme.particles} count={40} />

      {/* Floating Sound Controller */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <button
          onClick={() => {
            if (isPlayingAudio) {
              soundEngine.stopAll();
              setIsPlayingAudio(false);
            } else {
              if (card.musicType === 'custom' && card.customAudioUrl) {
                soundEngine.playCustomAudio(card.customAudioUrl);
              } else {
                soundEngine.playPresetSynth(theme.synthFrequency);
              }
              setIsPlayingAudio(true);
            }
          }}
          className="p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white hover:bg-black/60 transition-all shadow-xl"
        >
          {isPlayingAudio ? <Volume2 className="w-5 h-5 text-emerald-400" /> : <VolumeX className="w-5 h-5 text-rose-400" />}
        </button>

        <button
          onClick={() => {
            soundEngine.stopAll();
            onExit();
          }}
          className="px-3 py-2 rounded-xl bg-black/40 backdrop-blur-md border border-white/20 text-xs font-bold text-white hover:bg-black/60 transition-all shadow-xl"
        >
          Exit Experience
        </button>
      </div>

      {/* SCREEN 0: PERSONALIZED DYNAMIC OPENING SCREEN */}
      {movieStep === 0 && (
        <PersonalizedOpening
          friendName={card.friendName}
          senderName={card.senderName}
          openingConfig={card.openingConfig}
          onStartExperience={startExperience}
          particlesType={theme.particles}
        />
      )}

      {/* SCREEN 1: TYPEWRITER INTRO */}
      {movieStep === 1 && (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center relative z-10 max-w-2xl mx-auto">
          <span className="text-4xl mb-4 block animate-bounce">{theme.emoji}</span>
          <h2 className="text-xs font-bold uppercase tracking-widest text-amber-300 mb-3">
            MEMORIES &amp; MILESTONES
          </h2>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight mb-6">
            Dear {card.friendName},<br />
            Some bonds are meant to last a lifetime.
          </h1>
          <p className="text-sm text-white/90 leading-relaxed mb-10 font-light">
            {card.senderName} has created a personalized journey celebrating our story.
          </p>

          <button
            onClick={() => setMovieStep(2)}
            className="bg-white/20 hover:bg-white/30 text-white border border-white/40 font-bold py-3.5 px-8 rounded-2xl backdrop-blur-md transition-all flex items-center gap-2"
          >
            <span>Continue Story</span> <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* SCREEN 2: CINEMATIC SLIDESHOW & MEMORY TIMELINE REVEAL */}
      {movieStep === 2 && (
        <div className="py-12 px-4 relative z-10 max-w-5xl mx-auto">
          {/* Cinematic Slideshow */}
          <CinematicSlideshow
            photos={photoList}
            friendName={card.friendName}
            senderName={card.senderName}
          />

          {/* Memory Journey Timeline */}
          {photoList.length > 1 && (
            <MemoryTimeline
              photos={photoList}
              friendName={card.friendName}
              senderName={card.senderName}
            />
          )}

          <div className="text-center my-8">
            <button
              onClick={() => setMovieStep(3)}
              className="bg-white text-slate-950 font-extrabold py-3.5 px-8 rounded-2xl shadow-2xl hover:scale-105 transition-all inline-flex items-center gap-2"
            >
              <span>Read Personal Message</span> <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 3: MESSAGE REVEAL */}
      {movieStep === 3 && (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center relative z-10 max-w-xl mx-auto">
          <div className="bg-black/40 border border-white/20 p-8 rounded-3xl backdrop-blur-xl shadow-2xl mb-8">
            <Heart className="w-8 h-8 text-rose-400 fill-rose-400/40 mx-auto mb-4 animate-pulse" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-amber-300 mb-4">
              MESSAGE FROM {card.senderName.toUpperCase()}
            </h3>
            <p className="text-lg sm:text-xl text-white font-serif leading-relaxed italic">
              "{card.customMessage}"
            </p>
          </div>

          <button
            onClick={() => setMovieStep(4)}
            className="bg-white text-slate-950 font-extrabold py-3.5 px-8 rounded-2xl shadow-xl hover:scale-105 transition-all flex items-center gap-2"
          >
            <span>View Friendship Pact</span> <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* SCREEN 4: COMMITMENTS PACT SECTION */}
      {movieStep === 4 && (
        <div className="py-12 px-4 relative z-10 max-w-5xl mx-auto">
          <CommitmentsSection
            title={card.commitmentsTitle || 'OUR UNBREAKABLE PACT'}
            commitments={commitmentList}
          />

          <div className="text-center mt-8">
            <button
              onClick={() => setMovieStep(5)}
              className="bg-gradient-to-r from-amber-400 to-rose-500 text-slate-950 font-extrabold py-4 px-8 rounded-2xl shadow-2xl hover:scale-105 transition-all inline-flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              <span>Celebrate &amp; Open Agreement</span>
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 5: FIREWORKS EXPLO */}
      {movieStep === 5 && (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center relative z-10 max-w-lg mx-auto">
          <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center mx-auto mb-6 text-amber-300 animate-bounce">
            <Flame className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-2">Celebration Time! 🎉</h1>
          <p className="text-sm text-white/80 mb-8">
            The legal deed of friendship is ready for your official digital signature.
          </p>

          <button
            onClick={() => setMovieStep(6)}
            className="bg-white text-slate-950 font-extrabold py-4 px-8 rounded-2xl shadow-2xl hover:scale-105 transition-all flex items-center gap-2"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>Review Legal Document</span>
          </button>
        </div>
      )}

      {/* SCREEN 6: FRIENDSHIP AGREEMENT & SIGN PAD */}
      {movieStep === 6 && (
        <div className="py-12 px-4 relative z-10">
          <FriendshipAgreement
            card={card}
            recipientSignature={recipientSig || undefined}
            onSignClick={() => setShowSignPad(true)}
            isSigned={!!recipientSig}
            onUnlockAdmin={onUnlockAdmin}
          />

          {/* Signature Modal */}
          {showSignPad && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
              <div className="w-full max-w-lg">
                <SignatureCanvas
                  defaultName={card.friendName}
                  label="Party B Signature (Recipient)"
                  onSignatureSave={handleRecipientSigned}
                />
              </div>
            </div>
          )}

          {recipientSig && (
            <div className="text-center mt-6">
              <button
                onClick={() => setMovieStep(7)}
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3.5 px-8 rounded-2xl shadow-2xl transition-all"
              >
                View Official Certificate →
              </button>
            </div>
          )}
        </div>
      )}

      {/* SCREEN 7: SIGNED CERTIFICATE */}
      {movieStep === 7 && (
        <div className="py-12 px-4 relative z-10">
          <CertificateView card={card} onCreateOwn={onCreateOwn} onUnlockAdmin={onUnlockAdmin} />
        </div>
      )}
    </div>
  );
};

