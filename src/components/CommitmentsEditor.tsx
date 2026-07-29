import React, { useState } from 'react';
import { CommitmentItem } from '../types';
import {
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Sparkles,
  ShieldCheck,
  Heart,
  Smile,
  Award,
  Flame,
  Star,
  Sun,
  Crown,
  Compass,
  Gift,
  Zap,
  Lock,
  Anchor,
  Globe,
  Check
} from 'lucide-react';

const AVAILABLE_ICONS = [
  'Sparkles',
  'ShieldCheck',
  'Heart',
  'Smile',
  'Award',
  'Flame',
  'Star',
  'Sun',
  'Crown',
  'Compass',
  'Gift',
  'Zap',
  'Lock',
  'Anchor',
  'Globe'
];

const ACCENT_COLORS = [
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#8b5cf6', // Purple
  '#f43f5e', // Rose
  '#06b6d4', // Cyan
  '#eab308'  // Yellow
];

interface CommitmentsEditorProps {
  title: string;
  onChangeTitle: (title: string) => void;
  commitments: CommitmentItem[];
  onChangeCommitments: (commitments: CommitmentItem[]) => void;
}

export const CommitmentsEditor: React.FC<CommitmentsEditorProps> = ({
  title,
  onChangeTitle,
  commitments,
  onChangeCommitments
}) => {
  const handleAddCommitment = () => {
    if (commitments.length >= 12) {
      alert('Maximum 12 commitments allowed.');
      return;
    }

    const newNumber = commitments.length + 1;
    const newItem: CommitmentItem = {
      id: `comm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      number: newNumber,
      icon: AVAILABLE_ICONS[(newNumber - 1) % AVAILABLE_ICONS.length],
      title: `Commitment #${newNumber}`,
      description: 'Write your custom pledge or promise here for Party B...',
      accentColor: ACCENT_COLORS[(newNumber - 1) % ACCENT_COLORS.length]
    };

    onChangeCommitments([...commitments, newItem]);
  };

  const handleUpdate = (index: number, key: keyof CommitmentItem, value: any) => {
    const updated = [...commitments];
    updated[index] = { ...updated[index], [key]: value };
    onChangeCommitments(updated);
  };

  const handleDelete = (index: number) => {
    if (commitments.length <= 1) {
      alert('You must have at least 1 commitment.');
      return;
    }
    const filtered = commitments.filter((_, i) => i !== index);
    // Re-index numbers
    const reindexed = filtered.map((c, idx) => ({ ...c, number: idx + 1 }));
    onChangeCommitments(reindexed);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= commitments.length) return;

    const updated = [...commitments];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);

    // Re-number
    const reindexed = updated.map((c, idx) => ({ ...c, number: idx + 1 }));
    onChangeCommitments(reindexed);
  };

  return (
    <div className="w-full space-y-6">
      {/* Section Title Input */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1">
          Friendship Pact Section Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => onChangeTitle(e.target.value)}
          placeholder="OUR UNBREAKABLE PACT"
          className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-bold tracking-wide"
        />
      </div>

      {/* Commitments List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-bold text-slate-300">
          <span>Custom Commitments ({commitments.length}/12)</span>
          <button
            type="button"
            onClick={handleAddCommitment}
            disabled={commitments.length >= 12}
            className="bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 transition-all shadow-md"
          >
            <Plus className="w-3.5 h-3.5" /> Add Pledge
          </button>
        </div>

        {commitments.map((item, idx) => (
          <div
            key={item.id || idx}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 relative group shadow-lg"
          >
            {/* Header / Reorder bar */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-amber-400">
                Pledge #{idx + 1}
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => handleMove(idx, 'up')}
                  className="p-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 rounded text-xs"
                  title="Move Up"
                >
                  <MoveUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={idx === commitments.length - 1}
                  onClick={() => handleMove(idx, 'down')}
                  className="p-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 rounded text-xs"
                  title="Move Down"
                >
                  <MoveDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(idx)}
                  className="p-1 bg-slate-800 hover:bg-rose-600 text-rose-400 hover:text-white rounded text-xs ml-1"
                  title="Delete Commitment"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                Title
              </label>
              <input
                type="text"
                value={item.title}
                onChange={(e) => handleUpdate(idx, 'title', e.target.value)}
                placeholder="e.g. The Unbroken Trust Treaty"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none font-bold"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                Description / Promise Text
              </label>
              <textarea
                rows={2}
                value={item.description}
                onChange={(e) => handleUpdate(idx, 'description', e.target.value)}
                placeholder="Write description..."
                className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            {/* Icon & Color Selection */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                  Select Icon
                </label>
                <select
                  value={item.icon}
                  onChange={(e) => handleUpdate(idx, 'icon', e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  {AVAILABLE_ICONS.map((iconName) => (
                    <option key={iconName} value={iconName}>
                      {iconName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                  Accent Color
                </label>
                <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                  {ACCENT_COLORS.map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => handleUpdate(idx, 'accentColor', col)}
                      className={`w-5 h-5 rounded-full border transition-transform ${
                        item.accentColor === col ? 'scale-125 border-white shadow-md' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
