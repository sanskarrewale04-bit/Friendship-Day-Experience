import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
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

function MainApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentView, setCurrentView] = useState<'landing' | 'creator' | 'admin'>('landing');
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('admin') === 'true') {
      setCurrentView('admin');
    }
  }, [location.search]);

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
    navigate(`/card/${card.id}`);
  };

  const handlePreviewCard = (card: FriendshipCard) => {
    if (card.id) {
      navigate(`/card/${card.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 relative">
      <Navbar
        onNavigate={(view) => {
          if (view === 'samples') {
            navigate('/card/sample-alex-sam');
          } else if (view === 'creator') {
            setCurrentView('creator');
          } else {
            setCurrentView('landing');
          }
        }}
        currentView={currentView}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      {currentView === 'landing' ? (
        <Hero
          onCreateClick={() => setCurrentView('creator')}
          onOpenSampleCard={(id) => navigate(`/card/${id}`)}
        />
      ) : currentView === 'creator' ? (
        <CreatorWizard
          onCardCreated={handleCardCreated}
          onCancel={() => setCurrentView('landing')}
          onPreviewCard={handlePreviewCard}
        />
      ) : currentView === 'admin' ? (
        <AdminDashboard
          onBack={() => setCurrentView('landing')}
          onOpenCard={(id) => navigate(`/card/${id}`)}
        />
      ) : null}

      <HiddenAdminAccess onUnlockAdmin={() => setCurrentView('admin')} />
    </div>
  );
}

function CardRouteWrapper() {
  const { cardId } = useParams<{ cardId: string }>();
  const navigate = useNavigate();
  const [activeCard, setActiveCard] = useState<FriendshipCard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!cardId) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setNotFound(false);

    fetchCardById(cardId)
      .then((card) => {
        if (card) {
          setActiveCard(card);
          document.title = `Friendship Experience for ${card.friendName}`;
        } else {
          setNotFound(true);
        }
      })
      .catch((err) => {
        console.error('Error fetching card:', err);
        setNotFound(true);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [cardId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-slate-300 font-semibold">Loading Friendship Experience...</p>
      </div>
    );
  }

  if (notFound || !activeCard) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
        <NotFoundCardView
          cardId={cardId || ''}
          onGoHome={() => navigate('/')}
          onCreateNew={() => navigate('/')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans relative">
      <InteractiveExperience
        card={activeCard}
        onExit={() => {
          soundEngine.stopAll();
          navigate('/');
        }}
        onCreateOwn={() => {
          soundEngine.stopAll();
          navigate('/');
        }}
        onUnlockAdmin={() => navigate('/?admin=true')}
      />
      <HiddenAdminAccess onUnlockAdmin={() => navigate('/?admin=true')} />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainApp />} />
      <Route path="/card/:cardId" element={<CardRouteWrapper />} />
      <Route
        path="*"
        element={
          <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
            <NotFoundCardView
              cardId="page-not-found"
              onGoHome={() => window.location.href = '/'}
              onCreateNew={() => window.location.href = '/'}
            />
          </div>
        }
      />
    </Routes>
  );
}

