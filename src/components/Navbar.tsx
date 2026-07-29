import React from 'react';
import { Heart, PlusCircle, ShieldCheck, Volume2, VolumeX, Sparkles, LayoutDashboard } from 'lucide-react';

interface NavbarProps {
  onNavigate: (view: 'landing' | 'creator' | 'admin' | 'samples') => void;
  currentView: string;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigate,
  currentView,
  isMuted,
  onToggleMute
}) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/70 border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2.5 group focus:outline-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-0.5 shadow-lg group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500/30 group-hover:animate-pulse" />
            </div>
          </div>
          <div className="text-left">
            <span className="font-bold text-base bg-gradient-to-r from-amber-200 via-rose-300 to-purple-300 bg-clip-text text-transparent tracking-tight block">
              Friendship Experience
            </span>
            <span className="text-[10px] text-slate-400 font-medium tracking-widest uppercase block">
              Cinematic Journey
            </span>
          </div>
        </button>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onToggleMute}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all text-xs flex items-center gap-1.5"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span className="hidden md:inline text-xs">{isMuted ? 'Muted' : 'Audio On'}</span>
          </button>

          <button
            onClick={() => onNavigate('admin')}
            className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              currentView === 'admin'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden sm:inline">Admin</span>
          </button>

          <button
            onClick={() => onNavigate('creator')}
            className="bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:opacity-95 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg hover:shadow-rose-500/25 transition-all flex items-center gap-1.5 transform active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Experience</span>
          </button>
        </div>
      </div>
    </header>
  );
};
