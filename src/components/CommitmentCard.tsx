import React from 'react';
import { motion } from 'motion/react';
import { CommitmentItem } from '../types';
import {
  Sparkles,
  ShieldCheck,
  Heart,
  Smile,
  Award,
  Flame,
  Star,
  Sun,
  Crown,
  Compass,
  Gift,
  Zap,
  Lock,
  Anchor,
  Globe
} from 'lucide-react';

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Sparkles,
  ShieldCheck,
  Heart,
  Smile,
  Award,
  Flame,
  Star,
  Sun,
  Crown,
  Compass,
  Gift,
  Zap,
  Lock,
  Anchor,
  Globe
};

interface CommitmentCardProps {
  commitment: CommitmentItem;
  index: number;
}

export const CommitmentCard: React.FC<CommitmentCardProps> = ({ commitment, index }) => {
  const IconComponent = ICON_MAP[commitment.icon] || Sparkles;
  const accentColor = commitment.accentColor || '#f59e0b';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.03, y: -4 }}
      className="relative group p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl shadow-2xl transition-all overflow-hidden flex flex-col justify-between"
      style={{
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      }}
    >
      {/* Background Soft Glow on Hover */}
      <div
        className="absolute -top-12 -right-12 w-36 h-36 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none"
        style={{ backgroundColor: accentColor }}
      />

      <div>
        {/* Header Badge & Icon */}
        <div className="flex items-center justify-between mb-4">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg border border-white/20 transition-transform group-hover:rotate-6"
            style={{
              backgroundColor: `${accentColor}25`,
              color: accentColor
            }}
          >
            <IconComponent className="w-5 h-5" />
          </div>

          <span
            className="px-3 py-1 rounded-full text-[11px] font-extrabold tracking-widest uppercase border border-white/10"
            style={{
              backgroundColor: `${accentColor}15`,
              color: accentColor
            }}
          >
            Pact #{commitment.number || index + 1}
          </span>
        </div>

        {/* Commitment Title */}
        <h3 className="text-lg font-extrabold text-white mb-2 tracking-tight group-hover:text-amber-200 transition-colors">
          {commitment.title}
        </h3>

        {/* Commitment Description */}
        <p className="text-xs sm:text-sm text-slate-300 font-serif leading-relaxed line-clamp-4">
          {commitment.description}
        </p>
      </div>

      {/* Decorative Bottom Line Accent */}
      <div
        className="h-1 w-12 rounded-full mt-6 transition-all duration-300 group-hover:w-full opacity-60 group-hover:opacity-100"
        style={{ backgroundColor: accentColor }}
      />
    </motion.div>
  );
};
