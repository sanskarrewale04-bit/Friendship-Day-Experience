import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CreatorWizard } from './components/CreatorWizard';
import { InteractiveExperience } from './components/InteractiveExperience';
import { AdminDashboard } from './components/AdminDashboard';
import { HiddenAdminAccess } from './components/HiddenAdminAccess';
import { NotFoundCardView } from './components/NotFoundCardView';
import { FriendshipCard } from './types';
import { soundEngine } from './utils/audio';
import { extractCardIdFromUrl, fetchCardById, getShareableCardUrl } from './services/cardService';

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'creator' | 'experience' | 'admin' | '404'>('landing');
  const [activeCard, setActiveCard] = useState<FriendshipCard | null>(null);
  const [missingCardId, setMissingCardId] = useState<string>('');
  const [isMuted, setIsMuted] = useState(false);
  const [isLoadingCard, setIsLoadingCard] = useState(false);

  // Check URL on load and on popstate for direct card links (/card/[cardId])
  useEffect(() => {
    const handleUrlChange = () => {
      const cardId = extractCardIdFromUrl();
      if (cardId) {
        fetchCardAndOpen(cardId);
      } else {
        if (currentView === 'experience' || currentView === '404') {
          setCurrentView('landing');
        }
      }
    };

    handleUrlChange();
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  const fetchCardAndOpen = async (cardId: string) => {
    setIsLoadingCard(true);
    setMissingCardId(cardId);
    try {
      const card = await fetchCardById(cardId);
      if (card) {
        setActiveCard(card);
        setCurrentView('experience');

        // Update URL safely for sharing
        const newUrl = getShareableCardUrl(card.id);
        window.history.pushState({}, '', newUrl);

        // Update Dynamic SEO Metadata
        document.title = `Friendship Surprise for ${card.friendName}`;
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
          metaDesc = document.createElement('meta');
          metaDesc.setAttribute('name', 'description');
          document.head.appendChild(metaDesc);
        }
        metaDesc.setAttribute(
          'content',
          `${card.senderName} created a special Friendship Day experience for ${card.friendName}.`
        );
      } else {
        setCurrentView('404');
      }
    } catch (err) {
      console.error('Error fetching card:', err);
      setCurrentView('404');
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
    window.history.pushState({}, '', getShareableCardUrl(card.id));
  };

  const handlePreviewCard = (card: FriendshipCard) => {
    setActiveCard(card);
    setCurrentView('experience');
    if (card.id) {
      window.history.pushState({}, '', getShareableCardUrl(card.id));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 relative">
      {/* Header Navigation Bar */}
      {currentView !== 'experience' && currentView !== '404' && (
        <Navbar
          onNavigate={(view) => {
            if (view === 'samples') {
              fetchCardAndOpen('sample-alex-sam');
            } else {
              window.history.pushState({}, '', '/');
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
          onCreateClick={() => {
            window.history.pushState({}, '', '/');
            setCurrentView('creator');
          }}
          onOpenSampleCard={(id) => fetchCardAndOpen(id)}
        />
      ) : currentView === 'creator' ? (
        <CreatorWizard
          onCardCreated={handleCardCreated}
          onCancel={() => {
            window.history.pushState({}, '', '/');
            setCurrentView('landing');
          }}
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
          onBack={() => {
            window.history.pushState({}, '', '/');
            setCurrentView('landing');
          }}
          onOpenCard={(id) => fetchCardAndOpen(id)}
        />
      ) : currentView === '404' ? (
        <NotFoundCardView
          cardId={missingCardId}
          onGoHome={() => {
            window.history.pushState({}, '', '/');
            setCurrentView('landing');
          }}
          onCreateNew={() => {
            window.history.pushState({}, '', '/');
            setCurrentView('creator');
          }}
        />
      ) : null}

      {/* GLOBAL HIDDEN ADMIN TRIGGER WATERMARK - Always rendered on every page */}
      <HiddenAdminAccess onUnlockAdmin={() => setCurrentView('admin')} />
    </div>
  );
}
