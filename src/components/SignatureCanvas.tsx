import React, { useRef, useState, useEffect } from 'react';
import { Pen, RotateCcw, Type, Check } from 'lucide-react';
import { SignatureData } from '../types';

interface SignatureCanvasProps {
  onSignatureSave: (sig: SignatureData) => void;
  defaultName?: string;
  initialSignature?: SignatureData;
  label?: string;
}

export const SignatureCanvas: React.FC<SignatureCanvasProps> = ({
  onSignatureSave,
  defaultName = '',
  initialSignature,
  label = 'Sign Below to Formalize the Agreement'
}) => {
  const [mode, setMode] = useState<'draw' | 'type'>(initialSignature?.type || 'draw');
  const [typedName, setTypedName] = useState(initialSignature?.typedName || defaultName);
  const [fontFamily, setFontFamily] = useState<'cursive' | 'serif' | 'sans-serif'>('cursive');
  const [inkColor, setInkColor] = useState('#1e293b');
  const [hasDrawn, setHasDrawn] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    ctx.strokeStyle = inkColor;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [inkColor]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    isDrawing.current = true;
    setHasDrawn(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleConfirm = () => {
    if (mode === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dataUrl = canvas.toDataURL('image/png');
      onSignatureSave({
        type: 'draw',
        dataUrl,
        typedName: defaultName || 'Signed Party',
        signedAt: new Date().toISOString()
      });
    } else {
      onSignatureSave({
        type: 'type',
        typedName: typedName || defaultName || 'Signed Party',
        signedAt: new Date().toISOString()
      });
    }
  };

  return (
    <div className="bg-amber-50/95 border-2 border-amber-800/30 rounded-xl p-4 md:p-6 text-slate-800 shadow-2xl backdrop-blur-md max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-900/80">{label}</span>
        <div className="flex items-center gap-1 bg-amber-200/60 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setMode('draw')}
            className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-md transition-all ${
              mode === 'draw' ? 'bg-amber-900 text-amber-50 shadow-sm' : 'text-amber-950 hover:bg-amber-300/50'
            }`}
          >
            <Pen className="w-3.5 h-3.5" /> Draw
          </button>
          <button
            type="button"
            onClick={() => setMode('type')}
            className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-md transition-all ${
              mode === 'type' ? 'bg-amber-900 text-amber-50 shadow-sm' : 'text-amber-950 hover:bg-amber-300/50'
            }`}
          >
            <Type className="w-3.5 h-3.5" /> Type
          </button>
        </div>
      </div>

      {mode === 'draw' ? (
        <div>
          <div className="relative border-2 border-dashed border-amber-800/40 rounded-lg bg-amber-100/40 touch-none mb-3">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-36 cursor-crosshair rounded-lg"
            />
            {!hasDrawn && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-amber-800/40 text-sm font-serif italic">
                Sign with finger or mouse here...
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-600 font-medium">Ink Color:</span>
              <button
                type="button"
                onClick={() => setInkColor('#1e293b')}
                className={`w-5 h-5 rounded-full bg-slate-800 ring-2 ${inkColor === '#1e293b' ? 'ring-amber-600 scale-110' : 'ring-transparent'}`}
              />
              <button
                type="button"
                onClick={() => setInkColor('#1e40af')}
                className={`w-5 h-5 rounded-full bg-blue-800 ring-2 ${inkColor === '#1e40af' ? 'ring-amber-600 scale-110' : 'ring-transparent'}`}
              />
              <button
                type="button"
                onClick={() => setInkColor('#991b1b')}
                className={`w-5 h-5 rounded-full bg-red-800 ring-2 ${inkColor === '#991b1b' ? 'ring-amber-600 scale-110' : 'ring-transparent'}`}
              />
            </div>

            <button
              type="button"
              onClick={clearCanvas}
              className="flex items-center gap-1 text-red-700 hover:text-red-900 font-medium transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Clear Ink
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 mb-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Full Legal Name</label>
            <input
              type="text"
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              placeholder="e.g. Alex Rivers"
              className="w-full px-3 py-2 bg-white border border-amber-800/30 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-600 font-medium text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Signature Style</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFontFamily('cursive')}
                className={`flex-1 py-2 px-3 border rounded-lg text-center transition-all ${
                  fontFamily === 'cursive' ? 'border-amber-800 bg-amber-200/50 font-bold' : 'border-amber-800/20 bg-white'
                }`}
                style={{ fontFamily: 'cursive' }}
              >
                Cursive
              </button>
              <button
                type="button"
                onClick={() => setFontFamily('serif')}
                className={`flex-1 py-2 px-3 border rounded-lg text-center transition-all ${
                  fontFamily === 'serif' ? 'border-amber-800 bg-amber-200/50 font-bold' : 'border-amber-800/20 bg-white'
                }`}
                style={{ fontFamily: 'serif' }}
              >
                Elegant
              </button>
            </div>
          </div>

          <div className="p-3 bg-amber-100/50 rounded-lg border border-amber-800/20 text-center">
            <span className="text-xs text-amber-900/70 block mb-1">Signature Preview:</span>
            <span
              className="text-2xl text-amber-950 block"
              style={{ fontFamily: fontFamily === 'cursive' ? 'cursive' : 'serif' }}
            >
              {typedName || 'Your Signature'}
            </span>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleConfirm}
        className="w-full mt-4 bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 hover:from-amber-800 hover:to-amber-950 text-amber-50 font-semibold py-2.5 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-sm"
      >
        <Check className="w-4 h-4" /> Apply Official Signature
      </button>
    </div>
  );
};
