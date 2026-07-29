import React, { useState } from 'react';
import { PhotoItem } from '../types';
import {
  Upload,
  Trash2,
  RotateCw,
  MoveUp,
  MoveDown,
  Image as ImageIcon,
  Plus,
  Edit3,
  Check,
  X,
  MapPin,
  Calendar
} from 'lucide-react';

interface MultiPhotoUploaderProps {
  photos: PhotoItem[];
  onChangePhotos: (photos: PhotoItem[]) => void;
  maxPhotos?: number;
}

export const MultiPhotoUploader: React.FC<MultiPhotoUploaderProps> = ({
  photos,
  onChangePhotos,
  maxPhotos = 20
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [captionInput, setCaptionInput] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [locationInput, setLocationInput] = useState('');

  // Process files and convert/compress
  const processFiles = (files: FileList | File[]) => {
    const remainingSlots = maxPhotos - photos.length;
    if (remainingSlots <= 0) {
      alert(`Maximum of ${maxPhotos} photos allowed.`);
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    filesToProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target?.result as string;
        img.onload = () => {
          // Compress using canvas if large
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1200;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);

          const newPhoto: PhotoItem = {
            id: `photo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            url: compressedDataUrl,
            caption: file.name.replace(/\.[^/.]+$/, ''),
            date: new Date().toISOString().split('T')[0],
            location: 'Special Memory'
          };

          onChangePhotos([...photos, newPhoto]);
        };
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  // Rotate photo 90 degrees clockwise using Canvas
  const handleRotatePhoto = (index: number) => {
    const photo = photos[index];
    const img = new Image();
    img.src = photo.url;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.height;
      canvas.height = img.width;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((90 * Math.PI) / 180);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        const rotatedUrl = canvas.toDataURL('image/jpeg', 0.85);

        const updated = [...photos];
        updated[index] = { ...photo, url: rotatedUrl };
        onChangePhotos(updated);
      }
    };
  };

  // Move order up/down
  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= photos.length) return;

    const updated = [...photos];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    onChangePhotos(updated);
  };

  // Delete photo
  const handleDelete = (index: number) => {
    const updated = photos.filter((_, i) => i !== index);
    onChangePhotos(updated);
  };

  // Open edit modal for photo details
  const startEditing = (photo: PhotoItem) => {
    setEditingId(photo.id);
    setCaptionInput(photo.caption || '');
    setDateInput(photo.date || '');
    setLocationInput(photo.location || '');
  };

  const saveEditing = () => {
    if (!editingId) return;
    const updated = photos.map((p) =>
      p.id === editingId
        ? {
            ...p,
            caption: captionInput,
            date: dateInput,
            location: locationInput
          }
        : p
    );
    onChangePhotos(updated);
    setEditingId(null);
  };

  return (
    <div className="w-full space-y-6">
      {/* Upload Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="border-2 border-dashed border-slate-700 hover:border-amber-500 bg-slate-950/80 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center cursor-pointer transition-all text-center group relative"
      >
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
          <Upload className="w-7 h-7" />
        </div>
        <h3 className="text-sm font-bold text-slate-100 mb-1">
          Drag &amp; Drop Multiple Photos Here
        </h3>
        <p className="text-xs text-slate-400 mb-4 max-w-sm">
          Select up to <strong>{maxPhotos} images</strong> to create a cinematic slideshow and memory timeline ({photos.length}/{maxPhotos} uploaded).
        </p>

        <label className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer shadow-lg transition-all inline-flex items-center gap-2">
          <Plus className="w-4 h-4" /> Browse Computer / Gallery
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </label>
      </div>

      {/* Photos Grid & Management */}
      {photos.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3 text-xs font-bold text-slate-300">
            <span>Uploaded Memories ({photos.length})</span>
            <span className="text-[11px] font-normal text-slate-400">
              Drag or use arrows to rearrange cinematic order
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {photos.map((photo, index) => (
              <div
                key={photo.id || index}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-col justify-between group shadow-lg hover:border-amber-500/40 transition-all relative overflow-hidden"
              >
                {/* Photo Thumbnail */}
                <div className="relative rounded-xl overflow-hidden h-40 bg-black/50 mb-3 border border-white/5">
                  <img
                    src={photo.url}
                    alt={photo.caption || `Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2 left-2 bg-black/70 backdrop-blur-md text-amber-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md">
                    #{index + 1}
                  </span>

                  {/* Quick Action Overlay Buttons */}
                  <div className="absolute top-2 right-2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleRotatePhoto(index)}
                      className="p-1.5 bg-black/70 hover:bg-amber-500 text-white hover:text-slate-950 rounded-lg transition-colors"
                      title="Rotate 90°"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(index)}
                      className="p-1.5 bg-black/70 hover:bg-rose-600 text-white rounded-lg transition-colors"
                      title="Delete Photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Caption & Info */}
                <div className="space-y-1.5 mb-3">
                  <p className="text-xs font-extrabold text-white truncate">
                    {photo.caption || 'Untitled Memory'}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-serif">
                    {photo.date && <span>📅 {photo.date}</span>}
                    {photo.location && <span>📍 {photo.location}</span>}
                  </div>
                </div>

                {/* Controls Row */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMove(index, 'up')}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-200 rounded-lg text-[10px]"
                      title="Move Earlier"
                    >
                      <MoveUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      disabled={index === photos.length - 1}
                      onClick={() => handleMove(index, 'down')}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-200 rounded-lg text-[10px]"
                      title="Move Later"
                    >
                      <MoveDown className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => startEditing(photo)}
                    className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" /> Edit Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Details Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setEditingId(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-4">Edit Memory Details</h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Caption / Title
                </label>
                <input
                  type="text"
                  value={captionInput}
                  onChange={(e) => setCaptionInput(e.target.value)}
                  placeholder="e.g. Unforgettable Beach Sunset"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  placeholder="e.g. Los Angeles, CA"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={saveEditing}
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg"
            >
              <Check className="w-4 h-4" /> Save Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
