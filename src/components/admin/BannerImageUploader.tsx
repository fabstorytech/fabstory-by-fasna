'use client';

import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import Image from 'next/image';
import { Upload, Trash2, Image as ImageIcon, CheckCircle2, Sparkles, Plus } from 'lucide-react';

interface BannerImageUploaderProps {
  label: string;
  sublabel?: string;
  badge?: string;
  aspectRatio: '16/9' | '3/4' | '4/3' | 'square';
  currentImageUrl?: string | null;
  stagedFile?: File | null;
  stagedPreviewUrl?: string | null;
  recommendedDimensions?: string;
  isRemoved?: boolean;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
}

export default function BannerImageUploader({
  label,
  sublabel,
  badge,
  aspectRatio,
  currentImageUrl,
  stagedFile,
  stagedPreviewUrl,
  recommendedDimensions = '1920×1080 px recommended',
  isRemoved = false,
  onFileSelect,
  onRemove,
}: BannerImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active display image: staged file preview > existing URL (unless removed)
  const displayUrl = stagedPreviewUrl || (!isRemoved && currentImageUrl ? currentImageUrl : null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Only deactivate if leaving the container itself
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        onFileSelect(file);
      }
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
    // reset input value so re-selecting same file triggers change
    if (e.target) e.target.value = '';
  };

  const triggerPicker = () => {
    fileInputRef.current?.click();
  };

  // Determine aspect ratio class & max-width container
  const aspectClass =
    aspectRatio === '16/9'
      ? 'aspect-[16/9] w-full'
      : aspectRatio === '3/4'
      ? 'aspect-[3/4] w-40 sm:w-48 mx-auto'
      : aspectRatio === '4/3'
      ? 'aspect-[4/3] w-full'
      : 'aspect-square w-44 mx-auto';

  return (
    <div className="p-4 sm:p-5 border border-[#E5E0D8] bg-[#F8F5EF] rounded-2xs flex flex-col justify-between h-full shadow-2xs space-y-3.5 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h4 className="font-semibold text-[#23484A] text-xs sm:text-sm">{label}</h4>
          {sublabel && <p className="text-[10px] text-[#6F7775]">{sublabel}</p>}
        </div>
        {badge && (
          <span className="text-[10px] bg-white px-2 py-0.5 border border-[#E5E0D8] text-[#6F7775] rounded-full shrink-0 font-medium">
            {badge}
          </span>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Dropzone & Preview Container */}
      <div
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={displayUrl ? undefined : triggerPicker}
        className={`relative ${aspectClass} bg-white border-2 overflow-hidden rounded-2xs shadow-2xs my-auto transition-all ${
          isDragging
            ? 'border-[#C7A66A] bg-[#C7A66A]/10 scale-[1.01] ring-4 ring-[#C7A66A]/20'
            : displayUrl
            ? 'border-[#E5E0D8]'
            : 'border-dashed border-[#D9D3C8] hover:border-[#23484A] cursor-pointer'
        }`}
      >
        {displayUrl ? (
          <>
            <Image
              src={displayUrl}
              alt={label}
              fill
              unoptimized={displayUrl.startsWith('http') || displayUrl.startsWith('blob:')}
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 50vw"
            />

            {/* Drag Overlay (Visible when hovering a file over existing image) */}
            {isDragging && (
              <div className="absolute inset-0 bg-[#23484A]/80 backdrop-blur-2xs flex flex-col items-center justify-center text-white z-20 p-4 text-center animate-in fade-in duration-150">
                <Upload className="w-8 h-8 text-[#C7A66A] animate-bounce mb-2" />
                <span className="text-xs font-bold uppercase tracking-wider">Drop to Replace Banner</span>
                <span className="text-[10px] text-white/80 mt-1">Image will stage immediately</span>
              </div>
            )}

            {/* Status Pill on Preview */}
            <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 bg-black/65 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-full font-medium shadow-xs">
              {stagedPreviewUrl ? (
                <>
                  <Sparkles className="w-3 h-3 text-[#C7A66A] animate-pulse" />
                  <span className="text-[#F8F5EF]">Staged for Upload</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Live on Store</span>
                </>
              )}
            </div>
          </>
        ) : (
          /* Empty / Removed State */
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center select-none">
            {isDragging ? (
              <div className="space-y-1">
                <Upload className="w-8 h-8 text-[#C7A66A] mx-auto animate-bounce" />
                <span className="text-xs font-bold text-[#23484A] block">Drop image here!</span>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="w-10 h-10 rounded-full bg-[#FAF8F5] border border-[#E5E0D8] flex items-center justify-center mx-auto text-[#6F7775]">
                  <ImageIcon className="w-5 h-5 text-[#C7A66A]" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-[#23484A] block">
                    {isRemoved ? 'Banner Image Removed' : 'No Banner Image'}
                  </span>
                  <span className="text-[10px] text-[#6F7775] block mt-0.5">
                    Drag & drop image here or click to browse
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Controls & Drag Guide */}
      <div className="space-y-2 pt-1">
        <div className="flex flex-wrap items-center gap-2">
          {/* Change Image Button */}
          <button
            type="button"
            onClick={triggerPicker}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-[#FAF8F5] text-[#23484A] border border-[#D9D3C8] hover:border-[#23484A] rounded-2xs text-[11px] font-semibold transition-colors shadow-2xs cursor-pointer"
          >
            {displayUrl ? (
              <>
                <Upload className="w-3.5 h-3.5 text-[#C7A66A]" />
                <span>Change Image</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5 text-[#C7A66A]" />
                <span>Upload Image</span>
              </>
            )}
          </button>

          {/* Remove Banner / Clear Image Button */}
          {displayUrl && (
            <button
              type="button"
              onClick={onRemove}
              title="Remove this banner image"
              className="inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 hover:border-rose-300 rounded-2xs text-[11px] font-semibold transition-colors shadow-2xs cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove</span>
            </button>
          )}
        </div>

        <div className="flex items-center justify-between text-[10px] text-[#6F7775] px-0.5">
          <span>{recommendedDimensions}</span>
          <span className="hidden sm:inline text-[#C7A66A] font-medium">Drag & Drop supported</span>
        </div>
      </div>
    </div>
  );
}
