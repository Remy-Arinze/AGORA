'use client';

import { useState, useRef, useCallback } from 'react';
import { Image as ImageIcon, X, Upload, Loader2 } from 'lucide-react';
import { Button } from './Button';
import { ImageCropModal } from './ImageCropModal';

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  onUpload?: (file: File) => Promise<string>;
  label?: string;
  helperText?: string;
  error?: string;
  maxSizeMB?: number;
  className?: string;
  disabled?: boolean;
  enableCrop?: boolean;
  aspectRatio?: number;
  cropShape?: 'rect' | 'round';
  /** When true, renders a small square drop zone (e.g. next to a section title) with no label/helper */
  compact?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  onUpload,
  label = 'Profile Image',
  helperText,
  error,
  maxSizeMB = 5,
  className = '',
  disabled = false,
  enableCrop = true,
  aspectRatio = 1, // 1:1 for passport photos
  cropShape = 'rect',
  compact = false,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const [dragActive, setDragActive] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    async (file: File) => {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert(`Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.`);
        return;
      }

      // Validate file size
      const maxSize = maxSizeMB * 1024 * 1024;
      if (file.size > maxSize) {
        alert(`File size exceeds maximum limit of ${maxSizeMB}MB`);
        return;
      }

      // Create preview URL for cropping
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (enableCrop) {
          // Show crop modal
          setImageToCrop(result);
          setShowCropModal(true);
        } else {
          // Direct preview without cropping
          setPreview(result);
          // Upload if onUpload is provided
          if (onUpload) {
            handleUpload(file);
          } else {
            onChange(null);
          }
        }
      };
      reader.readAsDataURL(file);
    },
    [enableCrop, onUpload, maxSizeMB]
  );

  const handleUpload = useCallback(
    async (file: File) => {
      if (!onUpload) return;

      setIsUploading(true);
      try {
        const url = await onUpload(file);
        onChange(url);
        setPreview(URL.createObjectURL(file));
      } catch (error: any) {
        console.error('Upload error:', error);
        alert(error?.message || 'Failed to upload image');
        setPreview(value || null);
      } finally {
        setIsUploading(false);
      }
    },
    [onUpload, onChange, value]
  );

  const handleCropComplete = useCallback(
    async (croppedBlob: Blob) => {
      // Convert blob to File
      const croppedFile = new File([croppedBlob], 'cropped-image.jpg', {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });

      // Create preview
      const previewUrl = URL.createObjectURL(croppedBlob);
      setPreview(previewUrl);

      // Upload if onUpload is provided
      if (onUpload) {
        await handleUpload(croppedFile);
      } else {
        onChange(null);
      }

      // Clean up
      setImageToCrop(null);
      setShowCropModal(false);
    },
    [onUpload, handleUpload, onChange]
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const file = e.dataTransfer.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleRemove = () => {
    setPreview(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-2 ${className} ${compact ? 'inline-block' : ''}`}>
      {label && !compact && (
        <label className="block font-medium text-light-text-primary dark:text-dark-text-primary" style={{ fontSize: 'var(--text-body)' }}>
          {label}
        </label>
      )}
      
      {compact && (
        <label className="block font-medium text-[var(--light-text-secondary)] dark:text-[var(--dark-text-secondary)] mb-1" style={{ fontSize: 'var(--text-small)' }}>
          Select image
        </label>
      )}
      <div
        className={`
          relative border-2 border-dashed rounded-lg transition-colors
          ${compact ? 'w-20 h-20 p-1 flex items-center justify-center bg-[var(--input-field-bg)]' : 'p-6'}
          ${dragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-light-border dark:border-dark-border'}
          ${error ? 'border-red-500' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-blue-300 dark:hover:border-blue-700'}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled || isUploading}
        />

        {preview ? (
          <div className={`relative flex justify-center ${compact ? 'w-full h-full' : ''}`}>
            <div className={`relative overflow-hidden rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 ${compact ? 'w-full h-full' : 'w-48 h-60 border-4 shadow-lg'}`}>
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              {!disabled && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                  className={`absolute text-white rounded-full hover:bg-red-600 transition-colors z-10 ${compact ? 'top-0.5 right-0.5 p-0.5 bg-red-500' : 'top-2 right-2 p-1 bg-red-500'}`}
                  disabled={isUploading}
                >
                  <X className={compact ? 'h-3 w-3' : 'h-4 w-4'} />
                </button>
              )}
              {isUploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className={compact ? 'h-5 w-5 text-white animate-spin' : 'h-8 w-8 text-white animate-spin'} />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center">
            {isUploading ? (
              <div className="flex flex-col items-center">
                <Loader2 className={`text-blue-600 dark:text-blue-400 animate-spin ${compact ? 'h-6 w-6' : 'h-12 w-12 mb-4'}`} />
                {!compact && (
                  <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary" style={{ fontSize: 'var(--text-body)' }}>
                    Uploading...
                  </p>
                )}
              </div>
            ) : (
              <>
                <ImageIcon className={`text-light-text-muted dark:text-dark-text-muted mx-auto ${compact ? 'h-8 w-8' : 'h-12 w-12 mb-4'}`} />
                {!compact && (
                  <>
                    <p className="text-sm text-light-text-primary dark:text-dark-text-primary mb-2" style={{ fontSize: 'var(--text-body)' }}>
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary" style={{ fontSize: 'var(--text-small)' }}>
                      PNG, JPG, GIF, WEBP up to {maxSizeMB}MB
                      {enableCrop && ' (Passport-sized crop required)'}
                    </p>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {helperText && !error && !compact && (
        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary" style={{ fontSize: 'var(--text-small)' }}>
          {helperText}
          {enableCrop && !helperText.includes('crop') && ' Image will be cropped to passport size.'}
        </p>
      )}
      {error && !compact && (
        <p className="text-xs text-red-600 dark:text-red-400" style={{ fontSize: 'var(--text-small)' }}>{error}</p>
      )}

      {/* Crop Modal */}
      {imageToCrop && (
        <ImageCropModal
          isOpen={showCropModal}
          onClose={() => {
            setShowCropModal(false);
            setImageToCrop(null);
          }}
          imageSrc={imageToCrop}
          onCropComplete={handleCropComplete}
          aspectRatio={aspectRatio}
          cropShape={cropShape}
        />
      )}
    </div>
  );
}

