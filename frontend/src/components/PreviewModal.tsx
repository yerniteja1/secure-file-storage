import { useState } from 'react';
import { FileUploadResponse, getMediaUrl } from '../api';

interface PreviewModalProps {
  file: FileUploadResponse;
  onClose: () => void;
}

export default function PreviewModal({ file, onClose }: PreviewModalProps) {
  const [mediaError, setMediaError] = useState(false);
  const mediaUrl = getMediaUrl(file.filename);
  const isImage = file.mimeType.startsWith('image/') && !mediaError;
  const isVideo = file.mimeType.startsWith('video/') && !mediaError;
  const isAudio = file.mimeType.startsWith('audio/') && !mediaError;
  const isPdf = file.mimeType === 'application/pdf' && !mediaError;

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="preview-modal-header">
          <div className="preview-modal-title">
            <h3 title={file.originalName}>{file.originalName}</h3>
            <span className="preview-modal-meta">
              {formatSize(file.size)} · {file.mimeType}
            </span>
          </div>
          <button className="preview-close" onClick={onClose} title="Close">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="preview-modal-body">
          {isImage && (
            <img src={mediaUrl} alt={file.originalName} className="preview-media" onError={() => setMediaError(true)} />
          )}

          {isVideo && (
            <video src={mediaUrl} controls className="preview-media" onError={() => setMediaError(true)} />
          )}

          {isAudio && (
            <audio src={mediaUrl} controls className="preview-media-audio" onError={() => setMediaError(true)} />
          )}

          {isPdf && (
            <iframe src={mediaUrl} title={file.originalName} className="preview-media" onError={() => setMediaError(true)} />
          )}

          {!isImage && !isVideo && !isAudio && !isPdf && (
            <div className="preview-unsupported">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>{mediaError ? "Couldn't load this file." : 'No inline preview available for this file type.'}</p>
            </div>
          )}
        </div>

        <div className="preview-modal-actions">
          <a href={mediaUrl} download={file.originalName} className="btn-primary">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </a>
          {file.isPublic && file.shareId && (
            <a
              href={`/share/${file.shareId}`}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary"
            >
              Open share link
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
