// src/components/common/image-upload-gallery.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Upload, X, Star } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface ImageUploadGalleryProps {
  images: string[];
  onChange: (images: string[]) => void;
  onError?: (error: string) => void;
  maxImages?: number;
}

export function ImageUploadGallery({
  images,
  onChange,
  onError,
  maxImages = 15,
}: ImageUploadGalleryProps) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > maxImages) {
      onError?.(`Maximum limit of ${maxImages} photos exceeded.`);
      return;
    }

    setUploading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (file.size > 5 * 1024 * 1024) {
        onError?.(`File "${file.name}" exceeds the 5MB size limit.`);
        continue;
      }

      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();

        if (data.success && data.url) {
          onChange([...images, data.url]);
        } else {
          onError?.(data.error || 'Image upload failed.');
        }
      } catch (err: any) {
        onError?.(err.message || 'Error uploading image');
      }
    }

    setUploading(false);
    e.target.value = '';
  };

  const handleRemove = (indexToRemove: number) => {
    onChange(images.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSetCover = (indexToPromote: number) => {
    if (indexToPromote === 0) return;
    const reordered = [...images];
    const [selected] = reordered.splice(indexToPromote, 1);
    reordered.unshift(selected);
    onChange(reordered);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-xs font-bold uppercase tracking-wider text-zinc-950">
            Product Photos ({images.length}/{maxImages})
          </Label>
          <p className="text-[11px] text-zinc-500">
            First image is the primary catalog cover. Hover to reassign or delete.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-1">
        {images.map((imgUrl, idx) => (
          <div
            key={imgUrl + idx}
            className="relative aspect-[4/5] bg-zinc-100 border border-zinc-200 rounded-md overflow-hidden group shadow-xs"
          >
            <Image
              src={imgUrl}
              alt={`Photo ${idx + 1}`}
              fill
              sizes="(max-width: 640px) 33vw, 20vw"
              className="object-cover"
            />

            <button
              type="button"
              onClick={() => handleRemove(idx)}
              className="absolute top-1 right-1 bg-black/75 hover:bg-red-600 text-white p-1 rounded-full transition-colors z-10"
              title="Remove Image"
            >
              <X className="w-3 h-3" />
            </button>

            {idx === 0 ? (
              <span className="absolute bottom-1 left-1 bg-zinc-950 text-white text-[9px] uppercase font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-sm">
                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" /> Cover
              </span>
            ) : (
              <button
                type="button"
                onClick={() => handleSetCover(idx)}
                className="absolute bottom-1 left-1 right-1 bg-black/75 hover:bg-black text-white text-[9px] uppercase font-semibold py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity text-center"
              >
                Set Cover
              </button>
            )}
          </div>
        ))}

        {images.length < maxImages && (
          <label className="relative aspect-[4/5] border-2 border-dashed border-zinc-300 hover:border-zinc-900 bg-zinc-50 hover:bg-zinc-100 rounded-md flex flex-col items-center justify-center cursor-pointer transition-colors group">
            <Upload className="w-5 h-5 text-zinc-400 group-hover:text-zinc-900 mb-1 transition-colors" />
            <span className="text-[11px] font-semibold text-zinc-600 group-hover:text-zinc-900">
              {uploading ? 'Uploading...' : '+ Upload'}
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              multiple
              disabled={uploading}
              onChange={handleUpload}
              className="hidden"
            />
          </label>
        )}
      </div>
    </div>
  );
}