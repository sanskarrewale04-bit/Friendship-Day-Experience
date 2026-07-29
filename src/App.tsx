import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CreatorWizard } from './components/CreatorWizard';
import { InteractiveExperience } from './components/InteractiveExperience';
import { AdminDashboard } from './components/AdminDashboard';
import { HiddenAdminAccess } from './components/HiddenAdminAccess';
import { FriendshipCard } from './types';
import { soundEngine } from './utils/audio';

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'creator' | 'experience' | 'admin'>('landing');
  const [activeCard, setActiveCard] = useState<FriendshipCard | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoadingCard, setIsLoadingCard] = useState(false);

  // Check URL on load for direct card links e.g. /card/:id
  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/\/card\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      const cardId = match[1];
      fetchCardAndOpen(cardId);
    }
  }, []);

  const fetchCardAndOpen = async (cardId: string) => {
    setIsLoadingCard(true);
    try {
      const res = await fetch(`/api/cards/${cardId}`);
      const data = await res.json();
      if (data.success && data.card) {
        setActiveCard(data.card);
        setCurrentView('experience');
      } else {
        alert('Friendship Experience Card not found.');
        setCurrentView('landing');
      }
    } catch (err) {
      console.error('Error fetching card:', err);
    } finally {
      setIsLoadingCard(false);
    }
  };

  const handleToggleMute = () => {
    if (isMuted) {
      soundEngine.setVolume(0.5);
      setIsMuted(false);
    } else {
      soundEngine.setVolume(0);
      setIsMuted(true);
    }
  };

  const handleCardCreated = (card: FriendshipCard) => {
    setActiveCard(card);
  };

  const handlePreviewCard = (card: FriendshipCard) => {
    setActiveCard(card);
    setCurrentView('experience');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 relative">
      {/* Header Navigation Bar */}
      {currentView !== 'experience' && (
        <Navbar
          onNavigate={(view) => {
            if (view === 'samples') {
              fetchCardAndOpen('sample-alex-sam');
            } else {
              setCurrentView(view as any);
            }
          }}
          currentView={currentView}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* VIEW ROUTING */}
      {isLoadingCard ? (
        <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm text-slate-300 font-semibold">Loading Friendship Experience...</p>
        </div>
      ) : currentView === 'landing' ? (
        <Hero
          onCreateClick={() => setCurrentView('creator')}
          onOpenSampleCard={(id) => fetchCardAndOpen(id)}
        />
      ) : currentView === 'creator' ? (
        <CreatorWizard
          onCardCreated={handleCardCreated}
          onCancel={() => setCurrentView('landing')}
          onPreviewCard={handlePreviewCard}
        />
      ) : currentView === 'experience' && activeCard ? (
        <InteractiveExperience
          card={activeCard}
          onExit={() => {
            soundEngine.stopAll();
            window.history.pushState({}, '', '/');
            setCurrentView('landing');
          }}
          onCreateOwn={() => {
            soundEngine.stopAll();
            window.history.pushState({}, '', '/');
            setCurrentView('creator');
          }}
          onUnlockAdmin={() => setCurrentView('admin')}
        />
      ) : currentView === 'admin' ? (
        <AdminDashboard
          onBack={() => setCurrentView('landing')}
          onOpenCard={(id) => fetchCardAndOpen(id)}
        />
      ) : null}

      {/* GLOBAL HIDDEN ADMIN TRIGGER WATERMARK - Always rendered on every page */}
      <HiddenAdminAccess onUnlockAdmin={() => setCurrentView('admin')} />
    </div>
  );
}
