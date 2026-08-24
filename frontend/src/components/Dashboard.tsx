import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { filesAPI } from '../api';
import { useAuth } from '../contexts/AuthContext';
import FileList from './FileList';
import FileUpload from './FileUpload';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data: filesData, isLoading, error } = useQuery({
    queryKey: ['files', page, search],
    queryFn: () => filesAPI.list(page, 10, search || undefined),
    select: (response) => response.data,
  });

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>File Storage</h1>
        </div>
        <div className="header-right">
          <span className="user-email">{user?.email}</span>
          <button onClick={logout} className="btn-secondary">
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="upload-section">
          <FileUpload />
        </div>

        <div className="files-section">
          <div className="files-header">
            <h2>Your Files</h2>
            <input
              type="text"
              placeholder="Search files..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="search-input"
            />
          </div>

          {isLoading ? (
            <div className="loading">Loading files...</div>
          ) : error ? (
            <div className="error-message">
              Failed to load files. Please try again.
            </div>
          ) : (
            <>
              <FileList files={filesData?.data || []} />
              
              {filesData?.pagination && filesData.pagination.totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="btn-secondary"
                  >
                    Previous
                  </button>
                  <span>
                    Page {page} of {filesData.pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(filesData.pagination.totalPages, p + 1))}
                    disabled={page === filesData.pagination.totalPages}
                    className="btn-secondary"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}