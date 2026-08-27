import { useState, useEffect, useRef } from 'react';
import { FileUploadResponse, getMediaUrl, triggerDownload } from '../api';
import { useAuth } from '../contexts/AuthContext';
import {
  useDeleteFile,
  useToggleShare,
  useRestoreFile,
  usePermanentDeleteFile,
} from '../hooks/useFiles';
import PreviewModal from './PreviewModal';

interface FileCardProps {
  file: FileUploadResponse;
  viewMode: 'grid' | 'list';
  variant?: 'normal' | 'trash';
}

export default function FileCard({ file, viewMode, variant = 'normal' }: FileCardProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedInline, setCopiedInline] = useState(false);
  const [imgError, setImgError] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { token } = useAuth();
  const deleteMutation = useDeleteFile();
  const restoreMutation = useRestoreFile();
  const permanentDeleteMutation = usePermanentDeleteFile();
  const shareMutation = useToggleShare();

  const isTrash = variant === 'trash';
  const isImage = file.mimeType.startsWith('image/') && !imgError;
  const isPreviewable = file.mimeType.startsWith('image/') ||
    file.mimeType.startsWith('video/') ||
    file.mimeType.startsWith('audio/') ||
    file.mimeType === 'application/pdf';
  const shareUrl = file.shareId ? `${window.location.origin}/share/${file.shareId}` : '';

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  const handleDelete = () => {
    setMenuOpen(false);
    if (window.confirm(`Move "${file.originalName}" to trash?`)) {
      deleteMutation.mutate(file.id);
    }
  };

  const handleRestore = () => {
    setMenuOpen(false);
    restoreMutation.mutate(file.id);
  };

  const handlePermanentDelete = () => {
    setMenuOpen(false);
    if (window.confirm(`Permanently delete "${file.originalName}"? This cannot be undone.`)) {
      permanentDeleteMutation.mutate(file.id);
    }
  };

  const handleDownload = () => {
    setMenuOpen(false);
    triggerDownload(`/api/files/${file.id}/download`, file.originalName, token ?? undefined).catch(
      () => window.alert('Download failed')
    );
  };

  const handleShareToggle = () => {
    setMenuOpen(false);
    if (!file.isPublic) {
      shareMutation.mutate(file.id);
    } else {
      setShowShareModal(true);
    }
  };

  const handleCopyInline = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
    setCopiedInline(true);
    setTimeout(() => setCopiedInline(false), 2000);
  };

  const handleCopyLink = async () => {
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
      <div className={`file-card ${viewMode} ${isTrash ? 'is-trash' : ''}`} ref={menuRef}>
        {isImage ? (
          <div
            className="file-thumb"
            onClick={isPreviewable ? () => setShowPreview(true) : undefined}
            role={isPreviewable ? 'button' : undefined}
          >
            <img src={getMediaUrl(file.filename)} alt={file.originalName} onError={() => setImgError(true)} loading="lazy" />
          </div>
        ) : (
          <div
            className="file-icon"
            onClick={isPreviewable ? () => setShowPreview(true) : undefined}
            role={isPreviewable ? 'button' : undefined}
          >
            {getFileIcon(file.mimeType)}
          </div>
        )}

        <div className="file-details">
          <h3
            className="file-name"
            title={file.originalName}
            onClick={isPreviewable ? () => setShowPreview(true) : undefined}
          >
            {file.originalName}
          </h3>
          <div className="file-meta">
            <span>{formatSize(file.size)}</span>
            <span>{formatDate(file.createdAt)}</span>
          </div>
          {file.isPublic && shareUrl && (
            <div className="file-link">
              <span className="file-link-text" title={shareUrl}>
                {shareUrl}
              </span>
              <button className="file-link-copy" onClick={handleCopyInline}>
                {copiedInline ? 'Copied' : 'Copy'}
              </button>
            </div>
          )}
        </div>

        <div className="file-status">
          {isTrash ? (
            <span className="status-badge trash">In Trash</span>
          ) : (
            <span className={`status-badge ${file.isPublic ? 'public' : 'private'}`}>
              {file.isPublic ? 'Public' : 'Private'}
            </span>
          )}
        </div>

        <div className="file-actions">
          <button
            className="action-btn menu-trigger"
            title="Actions"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
            </svg>
          </button>

          {menuOpen && (
            <div className="file-menu">
              {isTrash ? (
                <>
                  <button className="file-menu-item" onClick={handleRestore} disabled={restoreMutation.isPending}>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l4-4m-4 4l4 4" />
                    </svg>
                    Restore
                  </button>
                  <button className="file-menu-item danger" onClick={handlePermanentDelete} disabled={permanentDeleteMutation.isPending}>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete permanently
                  </button>
                </>
              ) : (
                <>
                  {isPreviewable && (
                    <button className="file-menu-item" onClick={() => { setMenuOpen(false); setShowPreview(true); }}>
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Preview
                    </button>
                  )}
                  <button className="file-menu-item" onClick={handleDownload}>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </button>
                  <button className="file-menu-item" onClick={handleShareToggle}>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    {file.isPublic ? 'Manage link' : 'Make public'}
                  </button>
                  <button className="file-menu-item danger" onClick={handleDelete} disabled={deleteMutation.isPending}>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Move to trash
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {showPreview && !isTrash && (
        <PreviewModal file={file} onClose={() => setShowPreview(false)} />
      )}

      {showShareModal && !isTrash && (
        <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Share File</h3>
            <p>
              Current status: <strong>{file.isPublic ? 'Public' : 'Private'}</strong>
            </p>

            {file.isPublic && file.shareId && (
              <div className="share-link">
                <input type="text" readOnly value={shareUrl} />
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
              <button onClick={() => setShowShareModal(false)} className="btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
