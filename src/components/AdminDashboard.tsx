import React, { useEffect, useState } from 'react';
import { AnalyticsStats, FriendshipCard } from '../types';
import {
  LayoutDashboard,
  Users,
  Eye,
  FileText,
  Music,
  Play,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  Search,
  Download,
  Share2,
  Image as ImageIcon,
  Award,
  Clock,
  Filter,
  FileSpreadsheet,
  Trash2
} from 'lucide-react';
import { THEMES } from '../data/themes';
import { getAllCardsForAdmin, deleteCardForAdmin } from '../services/cardService';

interface AdminDashboardProps {
  onBack: () => void;
  onOpenCard: (cardId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack, onOpenCard }) => {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [allCards, setAllCards] = useState<FriendshipCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedThemeFilter, setSelectedThemeFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<
    'cards' | 'agreements' | 'certificates' | 'photos' | 'music' | 'themes' | 'analytics' | 'visitorLogs' | 'shareStats'
  >('cards');

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      let cards: FriendshipCard[] = [];
      try {
        const res = await fetch('/api/analytics', { signal: AbortSignal.timeout(2000) });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setStats(data.stats);
            if (data.allCardsDetail) {
              cards = data.allCardsDetail;
            }
          }
        }
      } catch (e) {
        // Express endpoint offline or not hosted, fallback to direct Firestore
      }

      if (cards.length === 0) {
        cards = await getAllCardsForAdmin();
      }

      setAllCards(cards);

      // Compute stats from cards
      const totalCreated = cards.length;
      const totalSigned = cards.filter((c) => c.status === 'signed').length;
      const totalViews = cards.reduce((sum, c) => sum + (c.viewsCount || 0), 0);
      const totalDownloads = cards.reduce((sum, c) => sum + (c.downloadsCount || 0), 0);

      setStats({
        totalCardsCreated: totalCreated,
        totalSignedAgreements: totalSigned,
        totalViews,
        totalDownloads,
        shareAnalyticsBreakdown: {
          whatsapp: cards.reduce((s, c) => s + (c.shareAnalytics?.whatsapp || 0), 0),
          telegram: cards.reduce((s, c) => s + (c.shareAnalytics?.telegram || 0), 0),
          facebook: cards.reduce((s, c) => s + (c.shareAnalytics?.facebook || 0), 0),
          directCopy: cards.reduce((s, c) => s + (c.shareAnalytics?.directCopy || 0), 0)
        },
        visitorLogs: cards.flatMap((c) => c.visitorLogs || [])
      });
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Filtered Cards
  const filteredCards = allCards.filter((card) => {
    const matchesSearch =
      card.friendName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (card.agreementNumber && card.agreementNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTheme = selectedThemeFilter === 'all' || card.themeId === selectedThemeFilter;
    const matchesStatus = selectedStatusFilter === 'all' || card.status === selectedStatusFilter;

    return matchesSearch && matchesTheme && matchesStatus;
  });

  // Collect all photos
  const allUploadedPhotos = allCards.flatMap((c) =>
    (c.photos || []).map((p) => ({ ...p, friendName: c.friendName, cardId: c.id }))
  );

  // Collect all custom music tracks
  const customTracks = allCards.filter((c) => c.musicType === 'custom' && c.customAudioUrl);

  // Export Data to CSV
  const exportToCSV = () => {
    if (allCards.length === 0) return alert('No data available to export.');

    const headers = ['Card ID', 'Agreement Number', 'Friend Name', 'Sender Name', 'Theme', 'Status', 'Views', 'Downloads', 'Created At'];
    const rows = allCards.map((c) => [
      c.id,
      c.agreementNumber || '',
      `"${c.friendName}"`,
      `"${c.senderName}"`,
      c.themeId,
      c.status,
      c.viewsCount || 0,
      c.downloadsCount || 0,
      c.createdAt
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sonu_admin_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Data to JSON
  const exportToJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(allCards, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `sonu_admin_full_backup_${Date.now()}.json`);
    dlAnchorElem.click();
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 p-4 sm:p-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Hidden Admin Mode
              </span>
              <span className="text-xs text-slate-500 font-mono">Sonu Panel v2.0</span>
            </div>
            <h1 className="text-2xl font-extrabold flex items-center gap-2 text-white mt-1">
              <LayoutDashboard className="w-6 h-6 text-amber-400" /> Administrative Command Center
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={exportToCSV}
            className="flex-1 sm:flex-none p-2.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" /> CSV Export
          </button>
          <button
            onClick={exportToJSON}
            className="flex-1 sm:flex-none p-2.5 bg-purple-950/80 hover:bg-purple-900 border border-purple-500/30 text-purple-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" /> JSON Export
          </button>
          <button
            onClick={fetchAdminData}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 text-amber-400 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* METRIC CARDS GRID */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Cards</span>
            <span className="text-2xl font-extrabold text-white">{stats.totalCards}</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Views</span>
            <span className="text-2xl font-extrabold text-sky-400">{stats.totalViews}</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Signed Pacts</span>
            <span className="text-2xl font-extrabold text-emerald-400">{stats.totalSignedAgreements}</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Downloads</span>
            <span className="text-2xl font-extrabold text-amber-400">{stats.totalDownloads}</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Custom Audio</span>
            <span className="text-2xl font-extrabold text-rose-400">{stats.totalCustomAudioUploaded}</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Photos Stored</span>
            <span className="text-2xl font-extrabold text-purple-400">{allUploadedPhotos.length}</span>
          </div>
        </div>
      )}

      {/* SEARCH AND FILTER BAR */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by friend, sender, or pact #"
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
            <select
              value={selectedThemeFilter}
              onChange={(e) => setSelectedThemeFilter(e.target.value)}
              className="bg-transparent text-slate-300 text-xs focus:outline-none pr-2 cursor-pointer"
            >
              <option value="all">All Themes</option>
              {Object.values(THEMES).map((t) => (
                <option key={t.id} value={t.id} className="bg-slate-900">
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="bg-transparent text-slate-300 text-xs focus:outline-none px-2 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="published" className="bg-slate-900">Published</option>
              <option value="signed" className="bg-slate-900">Signed</option>
            </select>
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-1 border-b border-slate-800 mb-6 overflow-x-auto no-scrollbar">
        {[
          { id: 'cards', label: 'Cards & Users', icon: Users },
          { id: 'agreements', label: 'Agreements', icon: FileText },
          { id: 'certificates', label: 'Certificates', icon: Award },
          { id: 'photos', label: 'Uploaded Photos', icon: ImageIcon },
          { id: 'music', label: 'Music Tracks', icon: Music },
          { id: 'themes', label: 'Themes', icon: Filter },
          { id: 'visitorLogs', label: 'Visitor Logs', icon: Clock },
          { id: 'shareStats', label: 'Share Stats', icon: Share2 }
        ].map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'border-amber-400 text-amber-300 bg-slate-900/50'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <IconComponent className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: CARDS & USERS */}
      {activeTab === 'cards' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Friendship Cards Directory ({filteredCards.length})
            </h2>
          </div>

          {filteredCards.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No cards match the search criteria.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800 bg-slate-950/60">
                  <tr>
                    <th className="p-3">Friend</th>
                    <th className="p-3">Sender</th>
                    <th className="p-3">Theme</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Views</th>
                    <th className="p-3">Downloads</th>
                    <th className="p-3">Photos</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredCards.map((card) => (
                    <tr key={card.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-semibold text-white">
                        {card.friendName}
                        {card.friendNickname && <span className="text-[10px] text-amber-400 block font-normal">"{card.friendNickname}"</span>}
                      </td>
                      <td className="p-3 text-slate-300">{card.senderName}</td>
                      <td className="p-3 capitalize text-amber-400 font-medium">{card.themeId}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            card.status === 'signed'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {card.status}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-sky-400 font-bold">{card.viewsCount || 0}</td>
                      <td className="p-3 font-mono text-amber-400 font-bold">{card.downloadsCount || 0}</td>
                      <td className="p-3 font-mono">{card.photos?.length || 1}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onOpenCard(card.id)}
                            className="p-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg font-bold flex items-center gap-1 text-[11px] transition-colors cursor-pointer"
                          >
                            <Play className="w-3 h-3 fill-slate-950" /> Experience
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm(`Are you sure you want to delete the experience for "${card.friendName}"?`)) {
                                await deleteCardForAdmin(card.id);
                                fetchAdminData();
                              }
                            }}
                            className="p-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-lg transition-colors cursor-pointer"
                            title="Delete Experience"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: AGREEMENTS */}
      {activeTab === 'agreements' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-4">
            Official Friendship Agreements Log
          </h2>
          <div className="space-y-3">
            {filteredCards.map((card) => (
              <div key={card.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-amber-400 font-bold">{card.agreementNumber || `FDA-2026-${card.id.slice(0, 4)}`}</span>
                    <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 capitalize">{card.themeId}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-200 mt-1">
                    Party A: <strong className="text-white">{card.senderName}</strong> | Party B: <strong className="text-white">{card.friendName}</strong>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Location: {card.location || 'Global Friendship Network'}</p>
                </div>
                <button
                  onClick={() => onOpenCard(card.id)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                >
                  Inspect Agreement
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: CERTIFICATES */}
      {activeTab === 'certificates' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-4">
            Issued Friendship Certificates ({filteredCards.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCards.map((card) => (
              <div key={card.id} className="p-4 bg-slate-950 border border-amber-500/30 rounded-xl relative">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <span className="text-xs font-mono font-bold text-amber-300">{card.certificateId || `CERT-${card.id}`}</span>
                </div>
                <h3 className="text-sm font-bold text-white mb-1">
                  {card.friendName} &amp; {card.senderName}
                </h3>
                <p className="text-[11px] text-slate-400 mb-3">Status: {card.status === 'signed' ? 'Signed & Ratified' : 'Offer Published'}</p>
                <button
                  onClick={() => onOpenCard(card.id)}
                  className="w-full py-2 bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500 hover:text-slate-950 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                >
                  View Certificate
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: UPLOADED PHOTOS */}
      {activeTab === 'photos' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-4">
            Uploaded Memory Photos ({allUploadedPhotos.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {allUploadedPhotos.map((photo, idx) => (
              <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden group">
                <div className="aspect-square relative overflow-hidden bg-slate-900">
                  <img src={photo.url} alt={photo.caption || 'Memory Photo'} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <div className="p-2">
                  <span className="text-[10px] text-amber-400 font-bold block truncate">{photo.friendName}</span>
                  <span className="text-[10px] text-slate-400 block truncate">{photo.caption || 'No caption'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: MUSIC TRACKS */}
      {activeTab === 'music' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-4">
            Music &amp; Audio Tracks Log
          </h2>
          <div className="space-y-3">
            {allCards.map((card) => (
              <div key={card.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-white block">{card.friendName}'s Greeting</span>
                  <span className="text-slate-400 text-[11px]">
                    Track: {card.musicType === 'custom' ? 'Custom Audio File' : card.presetAudioTrack || 'Preset Synth'}
                  </span>
                </div>
                <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${card.musicType === 'custom' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'}`}>
                  {card.musicType === 'custom' ? 'Custom Track' : 'Preset'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: THEMES */}
      {activeTab === 'themes' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-4">
            Theme Usage Breakdown
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(THEMES).map((theme) => {
              const count = allCards.filter((c) => c.themeId === theme.id).length;
              return (
                <div key={theme.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{theme.emoji}</span>
                    <div>
                      <h3 className="font-bold text-white text-sm">{theme.name}</h3>
                      <span className="text-xs text-slate-400">{theme.tagline}</span>
                    </div>
                  </div>
                  <span className="text-xl font-extrabold text-amber-400">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT: VISITOR LOGS */}
      {activeTab === 'visitorLogs' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-4">
            Recipient Visitor Audit Logs
          </h2>
          <div className="space-y-2">
            {allCards.flatMap((c) =>
              (c.visitorLogs || []).map((v, i) => (
                <div key={`${c.id}_${i}`} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white">Visited {c.friendName}'s Card</span>
                    <span className="text-[10px] text-slate-500 block truncate max-w-md">{v.userAgent || 'Web Browser'}</span>
                  </div>
                  <span className="font-mono text-[10px] text-amber-400">{new Date(v.timestamp).toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: SHARE STATS */}
      {activeTab === 'shareStats' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-4">
            Share Statistics Channel Breakdown
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-center">
              <span className="text-xs font-bold text-emerald-400 block mb-1">WhatsApp Shares</span>
              <span className="text-2xl font-extrabold text-white">
                {allCards.reduce((sum, c) => sum + (c.shareAnalytics?.whatsapp || 0), 0)}
              </span>
            </div>
            <div className="p-4 bg-sky-950/40 border border-sky-500/30 rounded-xl text-center">
              <span className="text-xs font-bold text-sky-400 block mb-1">Telegram Shares</span>
              <span className="text-2xl font-extrabold text-white">
                {allCards.reduce((sum, c) => sum + (c.shareAnalytics?.telegram || 0), 0)}
              </span>
            </div>
            <div className="p-4 bg-amber-950/40 border border-amber-500/30 rounded-xl text-center">
              <span className="text-xs font-bold text-amber-400 block mb-1">Direct Copies</span>
              <span className="text-2xl font-extrabold text-white">
                {allCards.reduce((sum, c) => sum + (c.shareAnalytics?.directCopy || 0), 0)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
