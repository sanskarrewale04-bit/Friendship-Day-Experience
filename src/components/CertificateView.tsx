import React, { useRef, useEffect, useState } from 'react';
import { FriendshipCard } from '../types';
import { Award, Download, Share2, Sparkles, Heart, PlusCircle, CheckCircle2, Loader2, Printer } from 'lucide-react';
import { safeHtml2Canvas } from '../utils/safeHtml2canvas';
import QRCode from 'qrcode';
import { HiddenAdminAccess } from './HiddenAdminAccess';

interface CertificateViewProps {
  card: FriendshipCard;
  onCreateOwn: () => void;
  onUnlockAdmin?: () => void;
}

export const CertificateView: React.FC<CertificateViewProps> = ({ card, onCreateOwn, onUnlockAdmin }) => {
  const certRef = useRef<HTMLDivElement | null>(null);
  const [qrUrl, setQrUrl] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const generateQr = async () => {
      try {
        const link = `${window.location.origin}/card/${card.id}`;
        const url = await QRCode.toDataURL(link);
        setQrUrl(url);
      } catch (err) {
        console.error(err);
      }
    };
    generateQr();
  }, [card.id]);

  const handleDownloadPNG = async () => {
    if (!certRef.current || isDownloading) return;
    setIsDownloading(true);
    try {
      fetch(`/api/cards/${card.id}/download`, { method: 'POST' }).catch(() => {});
      const canvas = await safeHtml2Canvas(certRef.current, { scale: 2, useCORS: true, allowTaint: true, logging: false });
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.download = `Certificate_Friendship_${card.agreementNumber}.png`;
      a.href = dataUrl;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
      alert('Unable to generate PNG certificate image automatically.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-8 px-4 text-slate-100 relative">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
          <CheckCircle2 className="w-4 h-4" /> Pact Officially Executed
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold">Your Digital Certificate</h2>
        <p className="text-xs text-slate-400">Download or share your official proof of friendship</p>
      </div>

      {/* CERTIFICATE CANVAS */}
      <div
        ref={certRef}
        className="printable-area bg-slate-900 border-8 border-amber-500/80 rounded-2xl p-6 sm:p-10 text-center relative overflow-hidden shadow-2xl font-serif text-slate-100"
        style={{
          backgroundImage: 'radial-gradient(ellipse at center, #1e293b 0%, #0f172a 100%)'
        }}
      >
        {/* Certificate Frame Accents */}
        <div className="border border-amber-500/30 p-6 rounded-xl relative">
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center shadow-lg text-slate-950 font-bold">
              <Award className="w-7 h-7" />
            </div>
          </div>

          <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase block mb-1 font-sans">
            INTERNATIONAL FRIENDSHIP REGISTRY
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-wide text-amber-200 mb-4 font-serif">
            CERTIFICATE OF LIFELONG BOND
          </h1>

          <p className="text-xs text-slate-300 font-sans mb-4">
            This certifies that on <strong>{card.signedAt ? new Date(card.signedAt).toLocaleDateString() : new Date().toLocaleDateString()}</strong>,
          </p>

          <div className="text-xl sm:text-3xl font-extrabold text-white my-3 tracking-wide font-sans bg-amber-500/10 py-2 rounded-xl border border-amber-500/30">
            {card.senderName} <span className="text-amber-400">&amp;</span> {card.friendName}
          </div>

          <p className="text-xs text-slate-300 font-sans max-w-md mx-auto leading-relaxed my-4">
            have formally executed Document <strong>#{card.agreementNumber}</strong>, swearing unwavering loyalty, mutual support, and lifelong friendship.
          </p>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-left text-[11px] font-sans text-slate-400">
            <div>
              <span className="block text-slate-200 font-bold">Registry ID:</span>
              <span className="font-mono text-amber-300">{card.agreementNumber}</span>
            </div>

            {qrUrl && (
              <div className="bg-white p-1 rounded-lg">
                <img src={qrUrl} alt="QR Code" className="w-12 h-12" />
              </div>
            )}

            <div className="text-right">
              <span className="block text-slate-200 font-bold">Status:</span>
              <span className="text-emerald-400 font-bold uppercase">EXECUTED</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleDownloadPNG}
          disabled={isDownloading}
          className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold py-3.5 px-6 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer"
        >
          {isDownloading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Generating PNG...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" /> Download Certificate PNG
            </>
          )}
        </button>

        <button
          onClick={handlePrint}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3.5 px-6 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4" /> Print
        </button>

        <button
          onClick={onCreateOwn}
          className="flex-1 bg-gradient-to-r from-rose-500 to-purple-600 hover:opacity-95 text-white font-bold py-3.5 px-6 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" /> Create Your Own Greeting
        </button>
      </div>

      {/* Hidden Admin Access Watermark in Bottom Right Corner */}
      {onUnlockAdmin && (
        <HiddenAdminAccess onUnlockAdmin={onUnlockAdmin} accentColorClass="text-amber-300" />
      )}
    </div>
  );
};

