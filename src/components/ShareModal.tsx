import React, { useState, useEffect } from 'react';
import { FriendshipCard } from '../types';
import { X, Copy, Check, Share2, Download } from 'lucide-react';
import QRCode from 'qrcode';
import { getShareableCardUrl, trackCardShare } from '../services/cardService';

interface ShareModalProps {
  card: FriendshipCard;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ card, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');

  const cardUrl = getShareableCardUrl(card.id);
  const shareMessage = `Hey ${card.friendName}! ${card.senderName} created a special Friendship Day experience for you. Open it here: ${cardUrl}`;

  useEffect(() => {
    if (isOpen && cardUrl) {
      QRCode.toDataURL(cardUrl, { margin: 2, width: 200, color: { dark: '#0f172a', light: '#ffffff' } })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('Error generating QR:', err));
    }
  }, [isOpen, cardUrl]);

  if (!isOpen) return null;

  const trackShare = (channel: string) => {
    trackCardShare(card.id, channel);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(cardUrl);
    setCopied(true);
    trackShare('directCopy');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-100 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-5">
          <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto mb-2 text-amber-400">
            <Share2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-extrabold text-slate-100">Share Friendship Experience</h3>
          <p className="text-xs text-slate-400 mt-1">
            Unique link generated for <strong className="text-amber-400">{card.friendName}</strong>
          </p>
        </div>

        {/* Copy Link Input Box */}
        <div className="mb-5">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Unique Card URL
          </label>
          <div className="flex items-center gap-2 bg-slate-950 p-2 pl-3 border border-slate-800 rounded-2xl">
            <span className="text-xs text-amber-300 font-mono truncate flex-1">{cardUrl}</span>
            <button
              onClick={copyToClipboard}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shadow-md"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>

        {/* Social Share Buttons */}
        <div className="grid grid-cols-2 gap-2.5 mb-5">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(shareMessage)}`}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackShare('whatsapp')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span>📱 WhatsApp</span>
          </a>

          <a
            href={`https://t.me/share/url?url=${encodeURIComponent(cardUrl)}&text=${encodeURIComponent(shareMessage)}`}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackShare('telegram')}
            className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span>✈️ Telegram</span>
          </a>

          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(cardUrl)}`}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackShare('facebook')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span>📘 Facebook</span>
          </a>

          <button
            onClick={() => {
              copyToClipboard();
              alert('Card link copied! You can now paste it directly into Instagram DM or Story.');
            }}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span>📸 Instagram</span>
          </button>
        </div>

        {/* QR Code Section */}
        {qrDataUrl && (
          <div className="bg-slate-950 p-4 border border-slate-800 rounded-2xl text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Scan QR Code to Open Experience
            </span>
            <div className="bg-white p-2 rounded-xl inline-block shadow-lg border border-amber-500/30">
              <img src={qrDataUrl} alt="Card QR Code" className="w-28 h-28 mx-auto" />
            </div>
            <a
              href={qrDataUrl}
              download={`QR_Friendship_${card.id}.png`}
              className="mt-2 text-[11px] text-amber-400 hover:underline inline-flex items-center gap-1 font-semibold block"
            >
              <Download className="w-3 h-3" /> Download QR Code Image
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
