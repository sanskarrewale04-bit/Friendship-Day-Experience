import React, { useState } from 'react';
import { Sparkles, Heart, Music, FileText, Award, Play, ArrowRight, ShieldCheck, Share2, Users } from 'lucide-react';
import { THEMES } from '../data/themes';

interface HeroProps {
  onCreateClick: () => void;
  onOpenSampleCard: (sampleId: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onCreateClick, onOpenSampleCard }) => {
  const [activeThemePreview, setActiveThemePreview] = useState('friendship');

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-between overflow-hidden bg-slate-950 text-slate-100">
      {/* Background Animated Gradient Blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-amber-500/20 via-rose-500/20 to-purple-600/20 rounded-full blur-3xl pointer-events-none animate-pulse duration-1000" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 text-center flex flex-col items-center">
        {/* Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/90 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-widest shadow-xl mb-8 backdrop-blur-md animate-bounce">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Interactive Storytelling & Legal Friendship Pact</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight max-w-5xl leading-[1.1] mb-6">
          Not Just a Greeting Card.{' '}
          <span className="bg-gradient-to-r from-amber-300 via-rose-400 to-purple-400 bg-clip-text text-transparent">
            A 90-Second Interactive Movie.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-xl text-slate-300 max-w-2xl font-light leading-relaxed mb-10">
          Surprise your closest friends with custom background music, animated memories, floating particle effects, and an official digitally signed Friendship Agreement.
        </p>

        {/* Primary Call to Action */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-16">
          <button
            onClick={onCreateClick}
            className="w-full sm:w-auto bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:from-amber-600 hover:to-purple-700 text-white font-bold text-lg px-8 py-4 rounded-2xl shadow-2xl hover:shadow-rose-500/30 transition-all flex items-center justify-center gap-3 transform hover:-translate-y-1 active:scale-95 group"
          >
            <Heart className="w-6 h-6 text-white fill-white/20 group-hover:scale-110 transition-transform" />
            <span>Create Your Friendship Experience</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => onOpenSampleCard('sample-alex-sam')}
            className="w-full sm:w-auto bg-slate-900/80 border border-slate-700 hover:border-slate-500 text-slate-200 font-semibold text-base px-6 py-4 rounded-2xl transition-all flex items-center justify-center gap-2 backdrop-blur-md hover:bg-slate-800"
          >
            <Play className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>Experience Sample Story</span>
          </button>
        </div>

        {/* Live Theme Showcase Carousel */}
        <div className="w-full max-w-5xl bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="text-left">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" /> 7 Immersive Themes
              </h3>
              <p className="text-xs text-slate-400">Tailored music, fonts, particle effects, and custom legal clauses</p>
            </div>
            <div className="flex gap-1 overflow-x-auto pb-1 max-w-xs md:max-w-md">
              {Object.values(THEMES).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveThemePreview(t.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    activeThemePreview === t.id
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t.emoji} {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Theme Preview Card Display */}
          {THEMES[activeThemePreview as keyof typeof THEMES] && (
            <div
              className={`rounded-2xl p-6 md:p-8 text-left border transition-all bg-gradient-to-br ${
                THEMES[activeThemePreview as keyof typeof THEMES].bgGradient
              } border-white/20 shadow-2xl relative overflow-hidden`}
            >
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <span className="text-3xl mb-2 block">
                    {THEMES[activeThemePreview as keyof typeof THEMES].emoji}
                  </span>
                  <h4 className="text-2xl font-bold text-white mb-1">
                    {THEMES[activeThemePreview as keyof typeof THEMES].name}
                  </h4>
                  <p className="text-xs text-white/80 max-w-md mb-4">
                    {THEMES[activeThemePreview as keyof typeof THEMES].tagline}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-white/90 font-medium">
                    <span className="bg-black/30 px-2.5 py-1 rounded-lg border border-white/10">
                      🎵 {THEMES[activeThemePreview as keyof typeof THEMES].defaultAudioTitle}
                    </span>
                    <span className="bg-black/30 px-2.5 py-1 rounded-lg border border-white/10">
                      ✨ {THEMES[activeThemePreview as keyof typeof THEMES].particles} particles
                    </span>
                  </div>
                </div>

                <button
                  onClick={onCreateClick}
                  className="bg-white text-slate-950 font-bold px-5 py-3 rounded-xl shadow-lg hover:bg-slate-100 transition-all text-xs flex items-center gap-2 whitespace-nowrap"
                >
                  Start With This Theme <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-800/60">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-3">
            Why It Feels Like an Interactive Movie
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Built with modern web animation, spatial audio, and digital legal pact verification.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
              <Music className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-2">Custom Music & Audio Sync</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload your own favorite song or choose from 7 ambient orchestral soundtracks with autoplay, loop, and volume fade-ins.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-2">Official Friendship Agreement</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generates a parchment legal agreement complete with watermarks, agreement numbers, official wax seal, and custom friendship clauses.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-2">Digital Signature & Certificate</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Both sender and recipient sign using finger/mouse ink drawing or handwritten fonts to lock in the pact and unlock a downloadable PDF/PNG certificate.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <span className="font-semibold text-slate-300">Friendship Experience</span>
            <span>— Emotional Storytelling Platform</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Viral Sharing Loop</span>
            <span>•</span>
            <span>Digital Pact Verification</span>
            <span>•</span>
            <span>2026 Edition</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
