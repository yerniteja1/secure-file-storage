import { useState } from 'react';
import { FileUploadResponse } from '../api';
import { useDeleteFile, useToggleShare } from '../hooks/useFiles';

interface FileCardProps {
  file: FileUploadResponse;
  viewMode: 'grid' | 'list';
}

export default function FileCard({ file, viewMode }: FileCardProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const deleteMutation = useDeleteFile();
  const shareMutation = useToggleShare();

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${file.originalName}"?`)) {
      deleteMutation.mutate(file.id);
    }
  };

  const handleCopyLink = async () => {
    const shareUrl = `${window.location.origin}/share/${file.shareId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    }
    if (mimeType.startsWith('video/')) {
      return (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      );
    }
    if (mimeType.startsWith('audio/')) {
      return (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      );
    }
    return (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      <div className={`file-card ${viewMode}`}>
        <div className="file-icon">{getFileIcon(file.mimeType)}</div>

        <div className="file-details">
          <h3 className="file-name" title={file.originalName}>
            {file.originalName}
          </h3>
          <div className="file-meta">
            <span>{formatSize(file.size)}</span>
            <span>{formatDate(file.createdAt)}</span>
          </div>
        </div>

        <div className="file-status">
          <span className={`status-badge ${file.isPublic ? 'public' : 'private'}`}>
            {file.isPublic ? 'Public' : 'Private'}
          </span>
        </div>

        <div className="file-actions">
          <a
            href={file.url}
            download={file.originalName}
            className="action-btn"
            title="Download"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </a>

          <button
            onClick={() => setShowShareModal(true)}
            className="action-btn"
            title="Share"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>

          <button
            onClick={handleDelete}
            className="action-btn danger"
            title="Delete"
            disabled={deleteMutation.isPending}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {showShareModal && (
        <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Share File</h3>
            <p>
              Current status: <strong>{file.isPublic ? 'Public' : 'Private'}</strong>
            </p>

            {file.isPublic && file.shareId && (
              <div className="share-link">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/share/${file.shareId}`}
                />
                <button onClick={handleCopyLink} className="btn-primary">
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            )}

            <div className="modal-actions">
              <button
                onClick={() => shareMutation.mutate(file.id)}
                className={file.isPublic ? 'btn-secondary' : 'btn-primary'}
                disabled={shareMutation.isPending}
              >
                {shareMutation.isPending
                  ? 'Updating...'
                  : file.isPublic
                  ? 'Make Private'
                  : 'Make Public'}
              </button>
              <button
                onClick={() => setShowShareModal(false)}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}