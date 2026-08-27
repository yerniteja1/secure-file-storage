import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFiles } from '../hooks/useFiles';
import { useDebounce } from '../hooks/useDebounce';
import FileList from './FileList';
import FileUpload from './FileUpload';

type Tab = 'all' | 'shared' | 'trash';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<Tab>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  const { data: filesData, isLoading, error } = useFiles({
    page,
    search: debouncedSearch,
    isPublic: tab === 'shared' ? true : undefined,
    trash: tab === 'trash' ? true : undefined,
  });

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleTabChange = (next: Tab) => {
    setTab(next);
    setPage(1);
  };

  const totalPages = filesData?.pagination.totalPages ?? 1;

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
        {tab !== 'trash' && (
          <div className="upload-section">
            <FileUpload />
          </div>
        )}

        <div className="files-section">
          <div className="files-tabs">
            <button
              className={`files-tab ${tab === 'all' ? 'active' : ''}`}
              onClick={() => handleTabChange('all')}
            >
              All Files
            </button>
            <button
              className={`files-tab ${tab === 'shared' ? 'active' : ''}`}
              onClick={() => handleTabChange('shared')}
            >
              Shared Links
            </button>
            <button
              className={`files-tab ${tab === 'trash' ? 'active' : ''}`}
              onClick={() => handleTabChange('trash')}
            >
              Trash
            </button>
          </div>

          <div className="files-header">
            <h2>
              {tab === 'all'
                ? 'Your Files'
                : tab === 'shared'
                ? 'Shared Links'
                : 'Trash'}
            </h2>
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
              <FileList
                files={filesData?.data || []}
                variant={tab === 'trash' ? 'trash' : 'normal'}
              />

              {filesData?.pagination && totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="btn-secondary"
                  >
                    Previous
                  </button>
                  <span>
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
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
