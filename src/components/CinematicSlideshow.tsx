import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PhotoItem } from '../types';
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Calendar,
  MapPin,
  Film,
  Layers,
  BookOpen,
  Image as ImageIcon
} from 'lucide-react';

export type SlideshowAnimMode =
  | 'fade'
  | 'zoom'
  | 'parallax'
  | 'polaroid'
  | 'stack'
  | 'filmstrip'
  | 'album';

interface CinematicSlideshowProps {
  photos: PhotoItem[];
  friendName: string;
  senderName: string;
}

export const CinematicSlideshow: React.FC<CinematicSlideshowProps> = ({
  photos,
  friendName,
  senderName
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [animMode, setAnimMode] = useState<SlideshowAnimMode>('polaroid');

  if (!photos || photos.length === 0) return null;

  // Auto advance synchronized with music pace (3.5 sec per slide)
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % photos.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [isPlaying, photos.length]);

  const currentPhoto = photos[currentIndex];

  // Animation Variant maps
  const getVariants = () => {
    switch (animMode) {
      case 'fade':
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 }
        };
      case 'zoom':
        return {
          initial: { opacity: 0, scale: 1.15 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.95 }
        };
      case 'parallax':
        return {
          initial: { opacity: 0, x: 100, rotate: 3 },
          animate: { opacity: 1, x: 0, rotate: 0 },
          exit: { opacity: 0, x: -100, rotate: -3 }
        };
      case 'polaroid':
        return {
          initial: { opacity: 0, y: -80, rotate: -8, scale: 0.9 },
          animate: { opacity: 1, y: 0, rotate: -1, scale: 1 },
          exit: { opacity: 0, y: 80, rotate: 6, scale: 0.9 }
        };
      case 'stack':
        return {
          initial: { opacity: 0, scale: 0.8, y: 50 },
          animate: { opacity: 1, scale: 1, y: 0 },
          exit: { opacity: 0, scale: 1.1, y: -50 }
        };
      case 'filmstrip':
        return {
          initial: { opacity: 0, x: -120 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: 120 }
        };
      case 'album':
        return {
          initial: { opacity: 0, rotateY: 90 },
          animate: { opacity: 1, rotateY: 0 },
          exit: { opacity: 0, rotateY: -90 }
        };
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 }
        };
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto my-8 px-4 text-slate-100">
      {/* Slideshow Mode Selector Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 bg-slate-900/80 border border-slate-800 p-3 rounded-2xl backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Film className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-slate-200">Cinematic Memory Reel</span>
        </div>

        {/* Animation Mode Switcher */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full text-[10px] font-semibold">
          {[
            { id: 'polaroid', label: '📸 Polaroid Drop' },
            { id: 'zoom', label: '🔍 Ken Burns' },
            { id: 'fade', label: '✨ Fade' },
            { id: 'parallax', label: '🌌 Parallax' },
            { id: 'stack', label: '🎴 Card Stack' },
            { id: 'filmstrip', label: '🎞️ Film Strip' },
            { id: 'album', label: '📖 Album Flip' }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setAnimMode(mode.id as SlideshowAnimMode)}
              className={`px-2.5 py-1 rounded-lg transition-all whitespace-nowrap ${
                animMode === mode.id
                  ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* SLIDESHOW CANVAS STAGE */}
      <div className="relative min-h-[380px] sm:min-h-[460px] flex items-center justify-center p-4 bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        {/* Background Radial Glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 via-rose-500/5 to-purple-600/10 pointer-events-none" />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            variants={getVariants()}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="relative z-10 max-w-md w-full"
          >
            {/* Polaroid / Photo Card Styling */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-2xl text-slate-950 border-4 border-amber-100">
              <div className="relative rounded-xl overflow-hidden h-64 sm:h-80 bg-slate-100">
                <img
                  src={currentPhoto.url}
                  alt={currentPhoto.caption || 'Memory Photo'}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Caption & Photo Details */}
              <div className="pt-4 pb-1 text-center font-serif">
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 leading-snug">
                  "{currentPhoto.caption || `${friendName} & ${senderName}`}"
                </h3>

                <div className="flex items-center justify-center gap-3 text-[11px] text-slate-600 font-sans mt-1">
                  {currentPhoto.date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-amber-700" /> {currentPhoto.date}
                    </span>
                  )}
                  {currentPhoto.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-rose-700" /> {currentPhoto.location}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        <button
          type="button"
          onClick={() => setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length)}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/20 transition-all shadow-xl"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => setCurrentIndex((prev) => (prev + 1) % photos.length)}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/20 transition-all shadow-xl"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Footer Controls & Dots */}
      <div className="mt-4 flex items-center justify-between px-2">
        <button
          type="button"
          onClick={() => setIsPlaying(!isPlaying)}
          className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-amber-300 flex items-center gap-1.5 hover:bg-slate-800 transition-colors"
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isPlaying ? 'Pause Reel' : 'Play Sync Reel'}</span>
        </button>

        {/* Thumbnail Dots */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-[200px] py-1">
          {photos.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all ${
                currentIndex === idx ? 'w-6 bg-amber-400' : 'w-2 bg-slate-700 hover:bg-slate-500'
              }`}
            />
          ))}
        </div>

        <span className="text-[11px] font-mono text-slate-400">
          {currentIndex + 1} / {photos.length}
        </span>
      </div>
    </div>
  );
};
