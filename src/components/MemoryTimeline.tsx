import React from 'react';
import { motion } from 'motion/react';
import { PhotoItem } from '../types';
import { Camera, Calendar, MapPin, Sparkles, Heart } from 'lucide-react';

interface MemoryTimelineProps {
  photos: PhotoItem[];
  friendName: string;
  senderName: string;
}

export const MemoryTimeline: React.FC<MemoryTimelineProps> = ({
  photos,
  friendName,
  senderName
}) => {
  if (!photos || photos.length === 0) return null;

  return (
    <div className="w-full max-w-4xl mx-auto my-12 px-4">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold uppercase tracking-widest mb-3">
          <Camera className="w-3.5 h-3.5" /> Visual Memories
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-serif mb-2">
          Our Journey
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
          A chronological retrospective of moments shared between {senderName} and {friendName}
        </p>
      </div>

      {/* Timeline Tree Container */}
      <div className="relative">
        {/* Central Vertical Connector Line */}
        <div className="absolute left-4 sm:left-1/2 top-4 bottom-4 w-1 bg-gradient-to-b from-amber-500 via-rose-500 to-purple-600 -translate-x-1/2 rounded-full opacity-60" />

        <div className="space-y-12">
          {photos.map((photo, idx) => {
            const isEven = idx % 2 === 0;

            return (
              <motion.div
                key={photo.id || idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className={`relative flex flex-col sm:flex-row items-center ${
                  isEven ? 'sm:flex-row-reverse' : ''
                }`}
              >
                {/* Central Timeline Node Circle */}
                <div className="absolute left-4 sm:left-1/2 top-8 -translate-x-1/2 z-10 w-8 h-8 rounded-full bg-slate-900 border-2 border-amber-400 flex items-center justify-center text-amber-300 shadow-xl">
                  <Heart className="w-4 h-4 fill-amber-400/30" />
                </div>

                {/* Content Card Side */}
                <div className="w-full sm:w-1/2 pl-12 sm:pl-0 sm:px-8">
                  <div className="bg-slate-900/80 border border-white/10 p-5 rounded-3xl backdrop-blur-xl shadow-2xl hover:border-amber-500/40 transition-all group">
                    {/* Photo Image Container */}
                    <div className="relative rounded-2xl overflow-hidden mb-4 border border-white/10 bg-black/40">
                      <img
                        src={photo.url}
                        alt={photo.caption || `Memory ${idx + 1}`}
                        className="w-full h-56 sm:h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

                      {/* Photo Badge / Counter */}
                      <span className="absolute top-3 right-3 bg-black/60 backdrop-blur-md border border-white/20 text-white font-mono text-[10px] font-bold px-2.5 py-1 rounded-full">
                        #{idx + 1}
                      </span>
                    </div>

                    {/* Metadata & Caption */}
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-amber-300/90">
                        {photo.date && (
                          <span className="flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                            <Calendar className="w-3 h-3 text-amber-400" /> {photo.date}
                          </span>
                        )}

                        {photo.location && (
                          <span className="flex items-center gap-1 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20 text-rose-300">
                            <MapPin className="w-3 h-3 text-rose-400" /> {photo.location}
                          </span>
                        )}
                      </div>

                      {photo.caption && (
                        <h4 className="text-sm sm:text-base font-extrabold text-white font-serif leading-snug pt-1">
                          "{photo.caption}"
                        </h4>
                      )}
                    </div>
                  </div>
                </div>

                {/* Empty Spacer Side for Desktop Alternating Layout */}
                <div className="hidden sm:block w-1/2" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
