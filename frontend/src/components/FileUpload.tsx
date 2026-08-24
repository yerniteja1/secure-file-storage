import { useState, useRef, DragEvent } from 'react';
import { useUpload } from '../hooks/useUpload';

export default function FileUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploads, uploadFiles } = useUpload();
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = (files: FileList | null) => {
    uploadFiles(files);
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