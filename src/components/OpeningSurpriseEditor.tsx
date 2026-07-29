import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { OpeningConfig } from '../types';
import { ParticleBackground } from './ParticleBackground';
import {
  Sparkles,
  Heart,
  Play,
  RotateCcw,
  Zap,
  Volume2,
  Clock,
  Wand2,
  Sliders,
  Type,
  Eye
} from 'lucide-react';

interface OpeningSurpriseEditorProps {
  config: OpeningConfig;
  onChange: (newConfig: OpeningConfig) => void;
  friendName: string;
  senderName: string;
}

export const OpeningSurpriseEditor: React.FC<OpeningSurpriseEditorProps> = ({
  config,
  onChange,
  friendName,
  senderName
}) => {
  const [previewKey, setPreviewKey] = useState(0);

  const headingExamples = [
    `Hey ${friendName || 'Manu'}...`,
    `Tiny Surprise`,
    `Something Just For You`,
    `Wait...`,
    `Hello Best Friend ❤️`
  ];

  const messageExamples = [
    `I made something tiny just for you.`,
    `This isn't a normal greeting...\nit's a collection of memories.`,
    `I hope this makes you smile.`,
    `You mean more to me than words can explain.`,
    `Don't rush...\nenjoy every moment.`
  ];

  const buttonTextExamples = [
    'Continue',
    'Open My Surprise',
    "Let's Begin",
    'See What I Made',
    'Start Journey',
    'Discover'
  ];

  const handleUpdate = (key: keyof OpeningConfig, value: any) => {
    onChange({
      ...config,
      [key]: value
    });
  };

  const particleTypeForEffect = (effect: OpeningConfig['backgroundEffect']): any => {
    if (effect === 'none') return 'sparkles';
    if (effect === 'fireflies' || effect === 'bubbles') return 'sparkles';
    return effect;
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="text-center mb-6">
        <span className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2">
          <Wand2 className="w-3.5 h-3.5" /> Opening Surprise Creator
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
          Create Your Opening Surprise
        </h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
          Customize the very first cinematic message {friendName || 'your friend'} sees before entering the greeting experience.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* FORM CONTROLS (7 cols) */}
        <div className="lg:col-span-7 space-y-5 bg-slate-950/60 border border-slate-800 p-5 rounded-2xl">
          {/* 1. OPENING HEADING */}
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1">
              Opening Heading
            </label>
            <input
              type="text"
              value={config.openingHeading}
              onChange={(e) => handleUpdate('openingHeading', e.target.value)}
              placeholder="e.g. Hey Manu..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {headingExamples.map((ex, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleUpdate('openingHeading', ex)}
                  className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700 transition-colors"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          {/* 2. OPENING MESSAGE */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-200">
                Opening Message
              </label>
              <span className="text-[10px] font-mono text-slate-500">
                {config.openingMessage.length}/500 chars
              </span>
            </div>
            <textarea
              rows={3}
              maxLength={500}
              value={config.openingMessage}
              onChange={(e) => handleUpdate('openingMessage', e.target.value)}
              placeholder="e.g. I made something tiny just for you..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {messageExamples.map((ex, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleUpdate('openingMessage', ex)}
                  className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700 transition-colors text-left"
                >
                  "{ex.slice(0, 32)}..."
                </button>
              ))}
            </div>
          </div>

          {/* 3. MESSAGE STYLE & TYPING SPEED */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                Message Style
              </label>
              <select
                value={config.messageStyle}
                onChange={(e) => handleUpdate('messageStyle', e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="romantic">Romantic & Warm</option>
                <option value="best_friends">Best Friends Forever</option>
                <option value="funny">Playful & Funny</option>
                <option value="emotional">Deeply Emotional</option>
                <option value="cute">Cute & Sweet</option>
                <option value="minimal">Sleek & Minimal</option>
                <option value="formal">Formal & Respectful</option>
                <option value="custom">Custom Expressive</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                Typing Speed
              </label>
              <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-700">
                {(['slow', 'normal', 'fast'] as const).map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => handleUpdate('typingSpeed', spd)}
                    className={`py-1.5 rounded-lg text-[10px] font-bold capitalize transition-all ${
                      config.typingSpeed === spd
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {spd}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 4. TEXT ANIMATION & BACKGROUND EFFECT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                Text Animation
              </label>
              <select
                value={config.textAnimation}
                onChange={(e) => handleUpdate('textAnimation', e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="typewriter">Typewriter (Letter by Letter)</option>
                <option value="letter_reveal">Letter Reveal</option>
                <option value="fade_up">Fade Up Smooth</option>
                <option value="blur_reveal">Blur Reveal</option>
                <option value="scale_in">Scale In Focus</option>
                <option value="glow_reveal">Glow Reveal</option>
                <option value="handwriting">Handwriting Flow</option>
                <option value="floating_letters">Floating Letters</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                Background Effect
              </label>
              <select
                value={config.backgroundEffect}
                onChange={(e) => handleUpdate('backgroundEffect', e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="hearts">Floating Hearts 💕</option>
                <option value="sparkles">Golden Sparkles ✨</option>
                <option value="fireflies">Glowing Fireflies 🌟</option>
                <option value="stars">Twinkling Stars 🌌</option>
                <option value="bubbles">Floating Bubbles 🫧</option>
                <option value="confetti">Celebration Confetti 🎉</option>
                <option value="none">None (Clean Canvas)</option>
              </select>
            </div>
          </div>

          {/* 5. BACKGROUND MUSIC TIMING */}
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-amber-400" /> Background Music Timing
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'immediately', label: 'Immediately' },
                { id: 'after_message', label: 'After Message' },
                { id: 'after_button_click', label: 'After Button Click' },
                { id: 'manual', label: 'Manual Toggle' }
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleUpdate('musicTiming', item.id as any)}
                  className={`p-2 rounded-xl border text-[10px] font-bold transition-all text-center ${
                    config.musicTiming === item.id
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 6. CONTINUE BUTTON TEXT */}
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1">
              Continue Button Text
            </label>
            <input
              type="text"
              value={config.continueButtonText}
              onChange={(e) => handleUpdate('continueButtonText', e.target.value)}
              placeholder="e.g. Open My Surprise"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {buttonTextExamples.map((ex, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleUpdate('continueButtonText', ex)}
                  className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700 transition-colors"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* LIVE PREVIEW SIMULATOR (5 cols) */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-amber-400" /> Live Recipient Experience Preview
            </span>
            <button
              type="button"
              onClick={() => setPreviewKey((k) => k + 1)}
              className="text-[11px] bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold px-2.5 py-1 rounded-lg border border-slate-700 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> Replay Preview
            </button>
          </div>

          {/* PREVIEW FRAME */}
          <div
            key={previewKey}
            className="flex-1 min-h-[380px] bg-gradient-to-br from-slate-900 via-rose-950/60 to-purple-950 border-2 border-amber-500/40 rounded-2xl p-6 relative flex flex-col items-center justify-center text-center overflow-hidden shadow-2xl"
          >
            {config.backgroundEffect !== 'none' && (
              <ParticleBackground type={particleTypeForEffect(config.backgroundEffect)} count={30} />
            )}

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [1, 1.1, 1], opacity: 1 }}
              transition={{ repeat: Infinity, duration: 2.5 }}
              className="w-14 h-14 rounded-full bg-rose-500/20 border border-rose-400/50 flex items-center justify-center mb-4 text-rose-400 relative z-10"
            >
              <Heart className="w-7 h-7 fill-rose-400" />
            </motion.div>

            {/* OPENING HEADING */}
            <motion.h3
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-amber-300 font-bold text-sm uppercase tracking-wider mb-2 relative z-10 font-serif"
            >
              {config.openingHeading || `Hey ${friendName || 'Friend'}...`}
            </motion.h3>

            {/* OPENING MESSAGE ANIMATED */}
            <motion.div
              initial={{ opacity: 0, scale: config.textAnimation === 'scale_in' ? 0.8 : 1 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              className="text-white text-base sm:text-lg font-serif italic max-w-xs mb-6 relative z-10 leading-relaxed drop-shadow-md"
            >
              "{config.openingMessage || "I made something tiny just for you..."}"
            </motion.div>

            {/* CUSTOM CONTINUE BUTTON */}
            <motion.button
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="relative z-10 bg-gradient-to-r from-amber-400 via-rose-500 to-purple-600 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 hover:scale-105 transition-transform"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>{config.continueButtonText || 'Open My Surprise'}</span>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};
