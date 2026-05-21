'use client';

import React, { useState, useCallback } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { X, Check, Loader2, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import getCroppedImg from '@/utils/cropImage';

interface AvatarCropModalProps {
  imageSrc: string;
  onConfirm: (croppedBlob: Blob) => void;
  onCancel: () => void;
  isUploading: boolean;
}

export default function AvatarCropModal({ imageSrc, onConfirm, onCancel, isUploading }: AvatarCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    setIsGenerating(true);
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels, 512);
      onConfirm(croppedBlob);
    } catch (error) {
      console.error('Crop failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const isBusy = isGenerating || isUploading;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={!isBusy ? onCancel : undefined} />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-base font-extrabold text-gray-900">Adjust Profile Photo</h3>
            <p className="text-xs text-gray-500 mt-0.5">Drag to reposition. Pinch or use the slider to zoom.</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isBusy}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Crop Area */}
        <div className="relative w-full aspect-square bg-gray-950">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            style={{
              containerStyle: {
                width: '100%',
                height: '100%',
                position: 'relative',
              },
              cropAreaStyle: {
                border: '3px solid rgba(255,255,255,0.85)',
                boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
              },
            }}
          />
        </div>

        {/* Zoom Controls */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/80">
          <div className="flex items-center gap-3">
            <ZoomOut size={16} className="text-gray-400 flex-shrink-0" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-600 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:shadow-md"
              disabled={isBusy}
            />
            <ZoomIn size={16} className="text-gray-400 flex-shrink-0" />
            <button
              type="button"
              onClick={() => { setZoom(1); setCrop({ x: 0, y: 0 }); }}
              disabled={isBusy}
              className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              title="Reset position"
            >
              <RotateCcw size={14} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 px-5 py-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            disabled={isBusy}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <X size={14} /> Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isBusy}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 shadow-sm"
          >
            {isBusy ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                {isUploading ? 'Saving...' : 'Processing...'}
              </>
            ) : (
              <>
                <Check size={14} /> Confirm & Set Photo
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
