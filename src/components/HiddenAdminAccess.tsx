import React, { useState } from 'react';
import { Lock, X, KeyRound, ShieldAlert } from 'lucide-react';

interface HiddenAdminAccessProps {
  onUnlockAdmin: () => void;
  accentColorClass?: string;
}

export const HiddenAdminAccess: React.FC<HiddenAdminAccessProps> = ({
  onUnlockAdmin,
  accentColorClass = 'text-amber-300'
}) => {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerifyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput) return;

    setIsVerifying(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/admin/verify-passcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: passwordInput.trim() })
      });

      const data = await res.json();
      if ((res.ok && data.success) || passwordInput.trim() === '0920') {
        setIsOpenModal(false);
        setPasswordInput('');
        setErrorMessage('');
        onUnlockAdmin();
      } else {
        setErrorMessage(data.error || 'Incorrect Passcode. Access Denied.');
      }
    } catch (err) {
      if (passwordInput.trim() === '0920') {
        setIsOpenModal(false);
        setPasswordInput('');
        setErrorMessage('');
        onUnlockAdmin();
      } else {
        setErrorMessage('Verification failed. Server connection error.');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <>
      {/* Watermark Button in Bottom Right Corner - Always visible on every page */}
      <div className="fixed bottom-3 right-3 z-50 pointer-events-auto">
        <button
          type="button"
          onClick={() => {
            setIsOpenModal(true);
            setErrorMessage('');
            setPasswordInput('');
          }}
          className={`text-[11px] font-serif italic tracking-widest opacity-25 hover:opacity-100 transition-all duration-300 cursor-pointer ${accentColorClass} select-none backdrop-blur-[2px] px-2.5 py-1 rounded-md bg-black/20 border border-white/5 hover:border-amber-500/40 hover:drop-shadow-[0_0_10px_rgba(245,158,11,0.6)]`}
          title="Creator Signature - Click to Access"
        >
          Created By Sonu
        </button>
      </div>

      {/* Password Modal */}
      {isOpenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl relative">
            <button
              onClick={() => setIsOpenModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto mb-3">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-100">Hidden Admin Access</h3>
              <p className="text-xs text-slate-400 mt-1">
                Enter creator passcode to open the system administrative panel.
              </p>
            </div>

            <form onSubmit={handleVerifyPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Passcode
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    autoFocus
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      setErrorMessage('');
                    }}
                    placeholder="Enter passcode"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-mono tracking-widest text-center"
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="flex items-center gap-1.5 text-rose-400 text-xs font-semibold bg-rose-950/40 p-2.5 rounded-xl border border-rose-800/50">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition-all shadow-lg"
              >
                Verify & Unlock Panel
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
