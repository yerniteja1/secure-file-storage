import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { filesAPI, FileUploadResponse } from '../api';
import FileCard from './FileCard';

interface FileListProps {
  files: FileUploadResponse[];
}

export default function FileList({ files }: FileListProps) {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  if (files.length === 0) {
    return (
      <div className="empty-state">
        <svg
          className="empty-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
          />
        </svg>
        <h3>No files yet</h3>
        <p>Upload your first file to get started</p>
      </div>
    );
  }

  return (
    <div className="file-list">
      <div className="view-toggle">
        <button
          className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
          onClick={() => setViewMode('grid')}
          title="Grid view"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
            />
          </svg>
        </button>
        <button
          className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
          onClick={() => setViewMode('list')}
          title="List view"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 10h16M4 14h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      <div className={`files-${viewMode}`}>
        {files.map((file) => (
          <FileCard key={file.id} file={file} viewMode={viewMode} />
        ))}
      </div>
    </div>
  );
}