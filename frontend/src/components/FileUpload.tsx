import { useState, useRef, DragEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { filesAPI } from '../api';

interface UploadState {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export default function FileUpload() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploads, setUploads] = useState<UploadState[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: (file: File) => {
      return new Promise((resolve, reject) => {
        filesAPI.upload(file, (progress) => {
          setUploads((prev) =>
            prev.map((u) =>
              u.file === file ? { ...u, progress, status: 'uploading' as const } : u
            )
          );
        }).then(resolve).catch(reject);
      });
    },
    onSuccess: (_, file) => {
      setUploads((prev) =>
        prev.map((u) =>
          u.file === file ? { ...u, status: 'success' as const, progress: 100 } : u
        )
      );
      queryClient.invalidateQueries({ queryKey: ['files'] });
      
      // Remove successful upload after 3 seconds
      setTimeout(() => {
        setUploads((prev) => prev.filter((u) => u.file !== file));
      }, 3000);
    },
    onError: (error: Error, file) => {
      setUploads((prev) =>
        prev.map((u) =>
          u.file === file
            ? { ...u, status: 'error' as const, error: error.message }
            : u
        )
      );
    },
  });

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach((file) => {
      // Validate file size (100MB)
      if (file.size > 100 * 1024 * 1024) {
        setUploads((prev) => [
          ...prev,
          {
            file,
            progress: 0,
            status: 'error' as const,
            error: 'File size exceeds 100MB limit',
          },
        ]);
        return;
      }

      setUploads((prev) => [
        ...prev,
        { file, progress: 0, status: 'pending' as const },
      ]);
      uploadMutation.mutate(file);
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  return (
    <div className="file-upload">
      <div
        className={`dropzone ${isDragOver ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          className="file-input"
        />
        <div className="dropzone-content">
          <svg
            className="upload-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p>Drag & drop files here, or click to select</p>
          <p className="dropzone-hint">Maximum file size: 100MB</p>
        </div>
      </div>

      {uploads.length > 0 && (
        <div className="upload-list">
          {uploads.map((upload, index) => (
            <div key={index} className={`upload-item ${upload.status}`}>
              <div className="upload-info">
                <span className="file-name">{upload.file.name}</span>
                <span className="file-size">
                  {(upload.file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
              
              {upload.status === 'uploading' && (
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${upload.progress}%` }}
                  />
                  <span className="progress-text">{upload.progress}%</span>
                </div>
              )}
              
              {upload.status === 'success' && (
                <span className="status-success">Uploaded</span>
              )}
              
              {upload.status === 'error' && (
                <span className="status-error">{upload.error}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}