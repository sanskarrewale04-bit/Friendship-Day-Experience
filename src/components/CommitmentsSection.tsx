import React from 'react';
import { CommitmentItem } from '../types';
import { CommitmentCard } from './CommitmentCard';
import { Sparkles } from 'lucide-react';

interface CommitmentsSectionProps {
  title?: string;
  commitments: CommitmentItem[];
}

export const CommitmentsSection: React.FC<CommitmentsSectionProps> = ({
  title = 'OUR UNBREAKABLE PACT',
  commitments
}) => {
  if (!commitments || commitments.length === 0) return null;

  return (
    <div className="w-full max-w-5xl mx-auto my-12 px-4">
      {/* Section Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-widest mb-3">
          <Sparkles className="w-3.5 h-3.5" /> Solemn Promises
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight uppercase font-serif">
          {title}
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto mt-2 font-light">
          {commitments.length} inviolable pledges binding Party A and Party B in honor and trust
        </p>
      </div>

      {/* Desktop Responsive Grid */}
      <div className="hidden sm:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {commitments.map((item, idx) => (
          <CommitmentCard key={item.id || idx} commitment={item} index={idx} />
        ))}
      </div>

      {/* Mobile Swipeable Cards Carousel */}
      <div className="block sm:hidden">
        <div className="flex items-center justify-end gap-1 text-[10px] text-amber-300/80 mb-2 px-1">
          <span>Swipe to explore pledges →</span>
        </div>
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-6 pt-2 scrollbar-none px-1">
          {commitments.map((item, idx) => (
            <div key={item.id || idx} className="snap-center shrink-0 w-[85vw] max-w-xs">
              <CommitmentCard commitment={item} index={idx} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
