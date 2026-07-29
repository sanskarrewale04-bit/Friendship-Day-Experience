import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Heart, Sparkles, Volume2 } from 'lucide-react';
import { ParticleBackground } from './ParticleBackground';
import { OpeningConfig } from '../types';

interface PersonalizedOpeningProps {
  friendName: string;
  senderName: string;
  openingConfig?: OpeningConfig;
  onStartExperience: () => void;
  particlesType?: 'hearts' | 'sparkles' | 'confetti' | 'stars' | 'diyas' | 'snow';
}

export const PersonalizedOpening: React.FC<PersonalizedOpeningProps> = ({
  friendName,
  senderName,
  openingConfig,
  onStartExperience,
  particlesType = 'hearts'
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isFinished, setIsFinished] = useState(false);

  const headingText = openingConfig?.openingHeading || `Hey ${friendName}...`;
  const messageText = openingConfig?.openingMessage || `I made a tiny little surprise just for you ❤️\nBefore you continue... I wanted to remind you how special our friendship is.`;
  const buttonText = openingConfig?.continueButtonText || 'Open Experience';
  const speedMs = openingConfig?.typingSpeed === 'slow' ? 70 : openingConfig?.typingSpeed === 'fast' ? 20 : 40;
  const bgEffect = openingConfig?.backgroundEffect || particlesType || 'hearts';

  // Letter by letter typing effect for the message
  useEffect(() => {
    let charIdx = 0;
    setDisplayedText('');
    setIsFinished(false);

    const timer = setInterval(() => {
      if (charIdx < messageText.length) {
        setDisplayedText(messageText.slice(0, charIdx + 1));
        charIdx++;
      } else {
        clearInterval(timer);
        setIsFinished(true);
      }
    }, speedMs);

    return () => clearInterval(timer);
  }, [messageText, speedMs]);

  const mapBgEffect = (effect: string): any => {
    if (effect === 'none') return 'sparkles';
    if (effect === 'fireflies' || effect === 'bubbles') return 'sparkles';
    if (effect === 'diyas' || effect === 'snow') return effect;
    if (['hearts', 'sparkles', 'confetti', 'stars'].includes(effect)) return effect;
    return 'hearts';
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center relative z-10 overflow-hidden select-none">
      {bgEffect !== 'none' && (
        <ParticleBackground type={mapBgEffect(bgEffect)} count={45} />
      )}

      {/* Floating Animated Heart Badge */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: [1, 1.1, 1], opacity: 1 }}
        transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
        className="w-20 h-20 rounded-full bg-rose-500/20 border-2 border-rose-400/50 backdrop-blur-xl flex items-center justify-center mb-6 shadow-2xl text-rose-400"
      >
        <Heart className="w-10 h-10 fill-rose-400" />
      </motion.div>

      {/* Heading */}
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-2xl sm:text-3xl font-extrabold text-amber-300 font-serif mb-4 tracking-wide drop-shadow-md"
      >
        {headingText}
      </motion.h2>

      {/* Dynamic Animated Greeting Container */}
      <div className="max-w-2xl min-h-[140px] flex flex-col items-center justify-center mb-8 px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xl sm:text-3xl md:text-4xl font-serif text-white tracking-tight leading-relaxed whitespace-pre-line drop-shadow-[0_0_20px_rgba(244,63,94,0.4)]"
        >
          {displayedText}
          {!isFinished && <span className="animate-pulse text-amber-300">|</span>}
        </motion.div>
      </div>

      {/* Custom Button - Appears ONLY after message completes */}
      {isFinished ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, type: 'spring' }}
        >
          <button
            onClick={onStartExperience}
            className="group relative bg-gradient-to-r from-amber-400 via-rose-500 to-purple-600 hover:opacity-95 text-white font-extrabold text-lg px-9 py-4 rounded-2xl shadow-[0_0_35px_rgba(244,63,94,0.5)] transition-all flex items-center gap-3 hover:scale-105 cursor-pointer"
          >
            <Play className="w-6 h-6 fill-white group-hover:scale-110 transition-transform" />
            <span>{buttonText}</span>
            <Sparkles className="w-5 h-5 text-amber-200 animate-spin" />
          </button>
        </motion.div>
      ) : (
        <button
          onClick={() => {
            setDisplayedText(messageText);
            setIsFinished(true);
          }}
          className="text-xs text-slate-400 hover:text-slate-200 underline tracking-wider font-semibold opacity-70 transition-opacity cursor-pointer"
        >
          Skip Typing Animation
        </button>
      )}
    </div>
  );
};
