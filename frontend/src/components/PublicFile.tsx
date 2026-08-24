import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { filesAPI } from '../api';

export default function PublicFile() {
  const { shareId } = useParams<{ shareId: string }>();

  const { data: fileData, isLoading, error } = useQuery({
    queryKey: ['publicFile', shareId],
    queryFn: () => filesAPI.getPublic(shareId!),
    enabled: !!shareId,
  });

  if (isLoading) {
    return (
      <div className="public-file-container">
        <div className="loading">Loading file...</div>
      </div>
    );
  }

  if (error || !fileData?.data) {
    return (
      <div className="public-file-container">
        <div className="error-state">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2>File Not Found</h2>
          <p>This file doesn't exist or is not publicly shared.</p>
        </div>
      </div>
    );
  }

  const file = fileData.data;

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="public-file-container">
      <div className="public-file-card">
        <div className="file-preview">
          {file.mimeType.startsWith('image/') ? (
            <img src={file.url} alt={file.originalName} />
          ) : (
            <div className="file-icon-large">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          )}
        </div>

        <div className="file-info">
          <h1>{file.originalName}</h1>
          <div className="file-details">
            <p>
              <strong>Size:</strong> {formatSize(file.size)}
            </p>
            <p>
              <strong>Type:</strong> {file.mimeType}
            </p>
            <p>
              <strong>Uploaded:</strong> {formatDate(file.createdAt)}
            </p>
          </div>

          <a
            href={file.url}
            download={file.originalName}
            className="btn-primary download-btn"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download File
          </a>
        </div>
      </div>
    </div>
  );
}