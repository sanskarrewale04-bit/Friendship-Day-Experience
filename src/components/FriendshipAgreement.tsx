import React, { useRef, useState } from 'react';
import { FriendshipCard, SignatureData } from '../types';
import { THEMES } from '../data/themes';
import { ShieldCheck, Download, Printer, Award, Loader2 } from 'lucide-react';
import { safeHtml2Canvas } from '../utils/safeHtml2canvas';
import { HiddenAdminAccess } from './HiddenAdminAccess';
import { trackCardDownload } from '../services/cardService';

interface FriendshipAgreementProps {
  card: FriendshipCard;
  recipientSignature?: SignatureData;
  onSignClick?: () => void;
  isSigned?: boolean;
  onUnlockAdmin?: () => void;
}

export const FriendshipAgreement: React.FC<FriendshipAgreementProps> = ({
  card,
  recipientSignature,
  onSignClick,
  isSigned = false,
  onUnlockAdmin
}) => {
  const agreementRef = useRef<HTMLDivElement | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const theme = THEMES[card.themeId] || THEMES.friendship;
  const activeRecipientSig = recipientSignature || card.recipientSignature;

  // Handle PNG Download & Track
  const handleDownloadPNG = async () => {
    if (!agreementRef.current || isDownloading) return;
    setIsDownloading(true);
    try {
      trackCardDownload(card.id);
      const canvas = await safeHtml2Canvas(agreementRef.current, { scale: 2, useCORS: true, allowTaint: true, logging: false });
      const dataUrl = canvas.toDataURL('image/png');
      if (!dataUrl || dataUrl === 'data:,') {
        throw new Error('Canvas capture produced empty image data.');
      }
      const link = document.createElement('a');
      link.download = `Friendship_Agreement_${card.agreementNumber}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      console.error('Agreement PNG download error:', err);
      alert(`Agreement PNG capture error: ${err?.message || 'Unable to generate PNG'}. You can also use the "Print Agreement" button to save directly as PDF!`);
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle Print
  const handlePrint = () => {
    trackCardDownload(card.id);
    window.print();
  };

  const commitmentsToDisplay = card.commitments && card.commitments.length > 0
    ? card.commitments
    : theme.clauses.map((c, i) => ({
        id: `c_${i}`,
        number: i + 1,
        icon: 'Sparkles',
        title: `Article ${i + 1}`,
        description: c
      }));

  return (
    <div className="w-full max-w-3xl mx-auto my-6 px-2 relative">
      {/* Agreement Actions Bar */}
      <div className="flex items-center justify-between mb-4 bg-slate-900/80 border border-slate-800 p-3 rounded-2xl backdrop-blur-md">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-amber-400" />
          <span className="text-xs font-bold text-slate-200">Legal Deed ID: {card.agreementNumber}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadPNG}
            disabled={isDownloading}
            className="p-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
            title="Download PNG"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span className="hidden sm:inline">Generating...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Download PNG</span>
              </>
            )}
          </button>
          <button
            onClick={handlePrint}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Print Document"
          >
            <Printer className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Print</span>
          </button>
        </div>
      </div>

      {/* REALISTIC LEGAL PAPER DOCUMENT */}
      <div
        ref={agreementRef}
        className="printable-area bg-[#fefcbf]/90 text-slate-900 p-6 sm:p-12 rounded-lg shadow-2xl border-[12px] border-double border-amber-900/60 relative font-serif overflow-hidden select-none"
        style={{
          backgroundImage:
            'radial-gradient(#eab308 0.5px, transparent 0.5px), radial-gradient(#d97706 0.5px, #fef3c7 0.5px)',
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 10px 10px'
        }}
      >
        {/* Paper Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none font-bold text-7xl sm:text-9xl tracking-widest text-amber-900 uppercase rotate-[-25deg]">
          BOUND BY HONOR
        </div>

        {/* Decorative Inner Frame */}
        <div className="border-2 border-amber-900/40 p-6 sm:p-8 relative">
          {/* Header */}
          <div className="text-center border-b-2 border-amber-900/30 pb-6 mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Award className="w-8 h-8 text-amber-900" />
            </div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-amber-950 block mb-1">
              SUPREME COURT OF UNCONDITIONAL LOYALTY
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-amber-950 mb-2 font-serif">
              DEED OF UNBREAKABLE FRIENDSHIP
            </h1>
            <span className="text-xs font-bold text-amber-900 font-sans tracking-wide">
              Document No: <span className="underline">{card.agreementNumber}</span> | Date of Execution: {new Date(card.createdAt).toLocaleDateString()}
            </span>
          </div>

          {/* Preamble */}
          <div className="text-xs sm:text-sm leading-relaxed mb-6 space-y-3 text-slate-900">
            <p>
              <strong>THIS BINDING AGREEMENT</strong> is solemnly entered into by and between <strong>{card.senderName}</strong> (hereinafter referred to as <em>"Party A"</em>) and <strong>{card.friendName}</strong> {card.friendNickname ? `(affectionately known as "${card.friendNickname}")` : ''} (hereinafter referred to as <em>"Party B"</em>), residing in spirit across the <strong>{card.location || 'Global Friendship Network'}</strong>.
            </p>
            <p className="italic text-slate-800">
              WHEREAS both parties acknowledge that genuine friendship is a rare, cherished bond requiring mutual respect, shared laughter, and unshakeable support through all seasons of life:
            </p>
          </div>

          {/* Clauses List */}
          <div className="mb-8 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-950 border-b border-amber-900/20 pb-1">
              {card.commitmentsTitle || 'ARTICLES OF COVENANT & COMMITMENT'}
            </h3>

            {commitmentsToDisplay.map((item, idx) => (
              <div key={item.id || idx} className="flex items-start gap-3 text-xs sm:text-sm">
                <span className="font-bold text-amber-900 min-w-[75px]">Pact #{item.number || idx + 1}:</span>
                <div className="text-slate-900 font-serif leading-relaxed">
                  <strong>{item.title}</strong> — {item.description}
                </div>
              </div>
            ))}
          </div>

          {/* Personal Vow Section */}
          <div className="p-4 bg-amber-100/60 border-l-4 border-amber-800 rounded-r-lg mb-8 italic text-xs sm:text-sm text-slate-800">
            <strong>Party A's Personal Declaration:</strong> "{card.customMessage}"
          </div>

          {/* Signatures & Seal Section */}
          <div className="pt-6 border-t-2 border-amber-900/30 grid grid-cols-2 gap-4 items-end relative">
            {/* Party A Signature */}
            <div className="text-center border-t border-slate-900/40 pt-2">
              <div className="h-16 flex items-center justify-center">
                {card.senderSignature?.type === 'draw' && card.senderSignature.dataUrl ? (
                  <img src={card.senderSignature.dataUrl} alt="Party A Signature" className="max-h-14 max-w-full object-contain" />
                ) : (
                  <span className="text-2xl text-amber-950 font-bold font-serif" style={{ fontFamily: 'cursive' }}>
                    {card.senderSignature?.typedName || card.senderName}
                  </span>
                )}
              </div>
              <span className="block text-xs font-bold text-amber-950 mt-1">{card.senderName}</span>
              <span className="block text-[10px] text-slate-700 uppercase font-sans">Party A (Creator & Initiator)</span>
            </div>

            {/* Party B Signature */}
            <div className="text-center border-t border-slate-900/40 pt-2">
              <div className="h-16 flex items-center justify-center">
                {activeRecipientSig ? (
                  activeRecipientSig.type === 'draw' && activeRecipientSig.dataUrl ? (
                    <img src={activeRecipientSig.dataUrl} alt="Party B Signature" className="max-h-14 max-w-full object-contain" />
                  ) : (
                    <span className="text-2xl text-amber-950 font-bold font-serif" style={{ fontFamily: 'cursive' }}>
                      {activeRecipientSig.typedName || card.friendName}
                    </span>
                  )
                ) : (
                  onSignClick && (
                    <button
                      type="button"
                      onClick={onSignClick}
                      className="bg-amber-900 hover:bg-amber-950 text-amber-50 text-xs font-bold px-4 py-2 rounded-lg shadow-md transition-all animate-pulse"
                    >
                      Sign Here as Party B
                    </button>
                  )
                )}
              </div>
              <span className="block text-xs font-bold text-amber-950 mt-1">{card.friendName}</span>
              <span className="block text-[10px] text-slate-700 uppercase font-sans">Party B (Recipient & Signatory)</span>
            </div>

            {/* Official Wax Seal Stamp */}
            {(isSigned || activeRecipientSig) && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-red-800 border-4 border-amber-300 text-amber-100 flex flex-col items-center justify-center text-center shadow-2xl rotate-[-12deg] pointer-events-none opacity-90">
                <span className="text-[8px] uppercase tracking-widest font-bold">OFFICIAL</span>
                <span className="text-[10px] font-extrabold uppercase my-0.5">SEALED</span>
                <span className="text-[7px] uppercase font-bold tracking-wider">EXECUTED</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden Admin Access Watermark in Bottom Right Corner */}
      {onUnlockAdmin && (
        <HiddenAdminAccess onUnlockAdmin={onUnlockAdmin} accentColorClass="text-amber-900" />
      )}
    </div>
  );
};

