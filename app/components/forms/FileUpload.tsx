'use client';

import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { clsx } from 'clsx';
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { fileUploadSchema } from '@utils/validators';
import { TRACKING_EVENTS } from '@utils/constants';

// Simple AuthUser interface for this component
interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  age: number;
  subscriptionTier: string;
}

export interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  onUploadComplete?: (uploadedFileUrl: string) => void;
  acceptedTypes?: string[];
  maxSize?: number; // in bytes
  multiple?: boolean;
  className?: string;
  variant?: 'default' | 'mintoons' | 'compact';
  uploadEndpoint?: string;
  showPreview?: boolean;
  disabled?: boolean;
  label?: string;
  hint?: string;
  required?: boolean;
  trackingEnabled?: boolean;
}

interface UploadedFile {
  file: File;
  preview?: string;
  status: 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  url?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  onUploadComplete,
  acceptedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
  ],
  maxSize = 10 * 1024 * 1024, // 10MB default
  multiple = false,
  className,
  variant = 'default',
  uploadEndpoint = '/api/upload',
  showPreview = true,
  disabled = false,
  label = 'Upload File',
  hint = 'Drag and drop or click to select',
  required = false,
  trackingEnabled = true,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: session } = useSession();
  // Type-safe user extraction
  const user = session?.user
    ? ({
        id: session.user._id || '',
        email: session.user.email || '',
        name: session.user.name || '',
        role: (session.user as any).role || 'child',
        age: (session.user as any).age || 0,
        subscriptionTier: (session.user as any).subscriptionTier || 'FREE',
      } as AuthUser)
    : null;

  // Validate file using utils/validators.ts
  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    try {
      // Use Zod schema from utils/validators.ts
      fileUploadSchema.parse({ file });

      // Additional validations
      if (!acceptedTypes.includes(file.type)) {
        return {
          isValid: false,
          error: `File type ${file.type} is not supported. Accepted types: ${acceptedTypes.join(', ')}`,
        };
      }

      if (file.size > maxSize) {
        const maxSizeMB = Math.round(maxSize / (1024 * 1024));
        return {
          isValid: false,
          error: `File size ${Math.round(file.size / (1024 * 1024))}MB exceeds limit of ${maxSizeMB}MB`,
        };
      }

      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        error:
          error instanceof Error ? error.message : 'File validation failed',
      };
    }
  };

  // Track file upload events
  const trackFileEvent = async (eventType: string, data: any) => {
    if (!trackingEnabled) return;

    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType,
          userId: user?.id,
          data: {
            ...data,
            timestamp: new Date().toISOString(),
          },
        }),
      });
    } catch (error) {
      console.error('File event tracking failed:', error);
    }
  };

  // Handle file selection
  const handleFileSelect = async (files: FileList) => {
    if (disabled) return;

    const fileArray = Array.from(files);
    const filesToProcess = multiple ? fileArray : [fileArray[0]];

    for (const file of filesToProcess) {
      const validation = validateFile(file);

      if (!validation.isValid) {
        toast.error(validation.error || 'File validation failed');
        await trackFileEvent(TRACKING_EVENTS.ERROR_OCCURRED, {
          type: 'file_validation_error',
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          error: validation.error,
        });
        continue;
      }

      // Create preview for images
      let preview: string | undefined;
      if (file.type.startsWith('image/') && showPreview) {
        preview = URL.createObjectURL(file);
      }

      const uploadedFile: UploadedFile = {
        file,
        preview,
        status: 'uploading',
        progress: 0,
      };

      setUploadedFiles(prev => [...prev, uploadedFile]);
      onFileSelect(file);

      // Track file selection
      await trackFileEvent(TRACKING_EVENTS.BUTTON_CLICK, {
        type: 'file_selected',
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      });

      // Start upload
      await uploadFile(file, uploadedFiles.length);
    }
  };

  // Upload file to server
  const uploadFile = async (file: File, index: number) => {
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', user?.id || '');
      formData.append('uploadType', 'story_asset');

      const response = await fetch(uploadEndpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();

      // Update file status to success
      setUploadedFiles(prev =>
        prev.map((uploadedFile, i) =>
          i === index
            ? {
                ...uploadedFile,
                status: 'success' as const,
                progress: 100,
                url: result.url,
              }
            : uploadedFile
        )
      );

      onUploadComplete?.(result.url);
      toast.success('File uploaded successfully!');

      // Track successful upload
      await trackFileEvent(TRACKING_EVENTS.BUTTON_CLICK, {
        type: 'file_upload_success',
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        uploadUrl: result.url,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Upload failed';

      // Update file status to error
      setUploadedFiles(prev =>
        prev.map((uploadedFile, i) =>
          i === index
            ? {
                ...uploadedFile,
                status: 'error' as const,
                progress: 0,
                error: errorMessage,
              }
            : uploadedFile
        )
      );

      toast.error(errorMessage);

      // Track upload error
      await trackFileEvent(TRACKING_EVENTS.ERROR_OCCURRED, {
        type: 'file_upload_error',
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        error: errorMessage,
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Handle drag events
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  // Handle click to select
  const handleClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  // Remove uploaded file
  const removeFile = async (index: number) => {
    const file = uploadedFiles[index];

    // Track file removal
    await trackFileEvent(TRACKING_EVENTS.BUTTON_CLICK, {
      type: 'file_removed',
      fileName: file.file.name,
      fileSize: file.file.size,
      fileType: file.file.type,
    });

    // Revoke preview URL to prevent memory leaks
    if (file.preview) {
      URL.revokeObjectURL(file.preview);
    }

    setUploadedFiles(prev => prev.filter((_, i) => i !== index));

    if (uploadedFiles.length === 1) {
      onFileSelect(null);
    }
  };

  const variantStyles = {
    default: 'border-gray-300 bg-gray-50',
    mintoons:
      'border-mintoons-purple/30 bg-gradient-to-br from-mintoons-purple/5 to-mintoons-pink/5',
    compact: 'border-gray-200 bg-white',
  };

  const dropZoneStyles = clsx(
    'relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 cursor-pointer',
    variantStyles[variant],
    {
      'border-mintoons-purple bg-mintoons-purple/10': isDragOver && !disabled,
      'border-gray-400 bg-gray-100':
        isDragOver && !disabled && variant === 'default',
      'opacity-50 cursor-not-allowed': disabled,
      'hover:border-gray-400':
        !disabled && !isDragOver && variant === 'default',
      'hover:border-mintoons-purple/50':
        !disabled && !isDragOver && variant === 'mintoons',
    },
    className
  );

  return (
    <div className="space-y-4">
      {/* Label */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
        <span className="text-xs text-gray-500">
          Max {Math.round(maxSize / (1024 * 1024))}MB
        </span>
      </div>

      {/* Drop Zone */}
      <div
        className={dropZoneStyles}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          multiple={multiple}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            if (e.target.files) {
              handleFileSelect(e.target.files);
            }
          }}
          className="hidden"
          disabled={disabled}
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <Upload
            size={variant === 'compact' ? 24 : 48}
            className={clsx(
              'text-gray-400',
              isDragOver && 'text-mintoons-purple'
            )}
          />

          <div>
            <p
              className={clsx(
                'font-medium',
                variant === 'compact' ? 'text-sm' : 'text-base',
                isDragOver ? 'text-mintoons-purple' : 'text-gray-700'
              )}
            >
              {isDragOver ? 'Drop files here' : 'Upload Files'}
            </p>

            {hint && <p className="mt-1 text-sm text-gray-500">{hint}</p>}
          </div>

          <div className="text-xs text-gray-400">
            <p>
              Supported:{' '}
              {acceptedTypes
                .map(type => type.split('/')[1])
                .join(', ')
                .toUpperCase()}
            </p>
          </div>
        </div>

        {/* Upload Progress Overlay */}
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/80">
            <div className="text-center">
              <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-b-2 border-mintoons-purple"></div>
              <p className="text-sm text-gray-600">Uploading...</p>
            </div>
          </div>
        )}
      </div>

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">
            {multiple ? 'Uploaded Files' : 'Uploaded File'}
          </h4>

          {uploadedFiles.map((uploadedFile, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3"
            >
              <div className="flex items-center space-x-3">
                {/* File Preview */}
                {uploadedFile.preview ? (
                  <img
                    src={uploadedFile.preview}
                    alt="Preview"
                    className="h-10 w-10 rounded object-cover"
                  />
                ) : (
                  <File size={20} className="text-gray-400" />
                )}

                {/* File Info */}
                <div>
                  <p className="max-w-48 truncate text-sm font-medium text-gray-900">
                    {uploadedFile.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {Math.round(uploadedFile.file.size / 1024)} KB
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* Status Icon */}
                {uploadedFile.status === 'uploading' && (
                  <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-mintoons-purple"></div>
                )}

                {uploadedFile.status === 'success' && (
                  <CheckCircle size={16} className="text-green-500" />
                )}

                {uploadedFile.status === 'error' && (
                  <AlertCircle size={16} className="text-red-500" />
                )}

                {/* Remove Button */}
                <button
                  onClick={() => removeFile(index)}
                  disabled={uploadedFile.status === 'uploading'}
                  className="p-1 text-gray-400 transition-colors hover:text-red-500 disabled:opacity-50"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error Messages */}
      {uploadedFiles.some(f => f.status === 'error') && (
        <div className="space-y-2">
          {uploadedFiles
            .filter(f => f.status === 'error')
            .map((file, index) => (
              <div
                key={index}
                className="rounded-lg border border-red-200 bg-red-50 p-3"
              >
                <p className="text-sm text-red-800">
                  <strong>{file.file.name}:</strong> {file.error}
                </p>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
