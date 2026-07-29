import React from 'react';
import { Ghost, Home, PlusCircle, Sparkles } from 'lucide-react';

interface NotFoundCardViewProps {
  cardId?: string;
  errorMessage?: string;
  onGoHome: () => void;
  onCreateNew: () => void;
}

export const NotFoundCardView: React.FC<NotFoundCardViewProps> = ({
  cardId,
  errorMessage,
  onGoHome,
  onCreateNew
}) => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6 text-center bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none -top-10 -left-10" />
      <div className="absolute w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -bottom-10 -right-10" />

      <div className="relative z-10 max-w-md w-full bg-slate-900/80 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
        <div className="w-20 h-20 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6 text-rose-400">
          <Ghost className="w-10 h-10 animate-bounce" />
        </div>

        <span className="text-xs font-bold uppercase tracking-widest text-amber-400 block mb-2">
          404 - Card Not Found
        </span>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 mb-3">
          Experience Missing
        </h1>

        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
          {errorMessage || (cardId ? `We couldn't find a Friendship Experience associated with ID "${cardId}". The link might be invalid or expired.` : 'The Friendship Experience you are looking for does not exist.')}
        </p>

        <div className="space-y-3">
          <button
            onClick={onCreateNew}
            className="w-full bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:opacity-95 text-white font-bold py-3.5 px-6 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" /> Create A New Experience
          </button>

          <button
            onClick={onGoHome}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 px-6 rounded-2xl border border-slate-700 transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
          >
            <Home className="w-4 h-4" /> Go to Homepage
          </button>
        </div>
      </div>
    </div>
  );
};
