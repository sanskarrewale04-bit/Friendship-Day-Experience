import React from 'react';
import { X } from 'lucide-react';

interface EmojiPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEmoji: (emoji: string) => void;
}

const EMOJI_CATEGORIES = [
  { name: 'Hearts & Love', emojis: ['❤️', '💖', '💕', '💗', '💓', '💞', '💘', '💌', '❣', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎'] },
  { name: 'Joy & Friendship', emojis: ['🥳', '🤗', '🥳', '😎', '🤩', '😃', '😄', '😁', '🥳', '😇', '🥹', '🥰', '😍', '😜', '🤙', '🤝', '🙌'] },
  { name: 'Celebration & Sparkles', emojis: ['🎉', '🎊', '✨', '🎈', '🎆', '🎁', '🥂', '🍰', '🧁', '⭐', '🌟', '💫', '🔥', '🪔', '🎄', '🏆'] },
  { name: 'Memories & Travel', emojis: ['📸', '✈️', '🚗', '☕', '🍕', '🍻', '🍿', '🎸', '🎧', '🌅', '🏖️', 'Camping', '🎯', '🚀'] }
];

export const EmojiPickerModal: React.FC<EmojiPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectEmoji
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-2xl p-5 max-w-sm w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <h3 className="font-semibold text-sm text-slate-200">Select Emoji</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-72 overflow-y-auto space-y-4 pr-1">
          {EMOJI_CATEGORIES.map((cat, idx) => (
            <div key={idx}>
              <h4 className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">{cat.name}</h4>
              <div className="grid grid-cols-6 gap-2">
                {cat.emojis.map((emoji, eIdx) => (
                  <button
                    key={eIdx}
                    type="button"
                    onClick={() => {
                      onSelectEmoji(emoji);
                      onClose();
                    }}
                    className="text-2xl p-2 hover:bg-slate-800 rounded-xl transition-all transform hover:scale-125 flex items-center justify-center"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
