import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Landing() {
  const { isAuthenticated, isLoading } = useAuth();

  const primaryAction = isAuthenticated ? (
    <Link to="/dashboard" className="btn-primary landing-cta">
      Go to Dashboard
    </Link>
  ) : (
    <Link to="/register" className="btn-primary landing-cta">
      Get Started
    </Link>
  );

  const secondaryAction = isAuthenticated ? null : (
    <Link to="/login" className="btn-secondary landing-cta-secondary">
      Login
    </Link>
  );

  return (
    <div className="landing">
      <header className="landing-header">
        <div className="landing-brand">
          <svg className="landing-logo" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <span>SecureFile</span>
        </div>
        <nav className="landing-nav">
          {!isLoading &&
            (isAuthenticated ? (
              <Link to="/dashboard" className="landing-nav-link">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="landing-nav-link">
                  Login
                </Link>
                <Link to="/register" className="btn-primary landing-nav-btn">
                  Sign Up
                </Link>
              </>
            ))}
        </nav>
      </header>

      <main className="landing-main">
        <section className="landing-hero">
          <div className="landing-hero-text">
            <span className="landing-badge">Secure Cloud Storage</span>
            <h1>
              Store, manage, and share your files
              <span className="landing-highlight"> with confidence</span>
            </h1>
            <p className="landing-subtitle">
              A secure file storage service where you upload, organize, and
              share files from your personal dashboard. Keep files private or
              generate a shareable link for anyone.
            </p>
            <div className="landing-actions">
              {primaryAction}
              {secondaryAction}
            </div>
            <p className="landing-note">
              Uploading files requires an account.{' '}
              {isAuthenticated
                ? 'You are signed in and ready to upload.'
                : 'Sign in or create a free account to start uploading.'}
            </p>
          </div>

          <div className="landing-hero-visual">
            <div className="landing-preview">
              <div className="landing-preview-header">
                <span className="landing-dot" />
                <span className="landing-dot" />
                <span className="landing-dot" />
              </div>
              <div className="landing-preview-body">
                <div className="landing-preview-row">
                  <div className="landing-preview-icon">📄</div>
                  <div className="landing-preview-meta">
                    <span className="landing-preview-name">Quarterly-Report.pdf</span>
                    <span className="landing-preview-size">2.4 MB · Private</span>
                  </div>
                </div>
                <div className="landing-preview-row">
                  <div className="landing-preview-icon">🖼️</div>
                  <div className="landing-preview-meta">
                    <span className="landing-preview-name">Design-Mockup.png</span>
                    <span className="landing-preview-size">5.1 MB · Public</span>
                  </div>
                </div>
                <div className="landing-preview-row">
                  <div className="landing-preview-icon">🎞️</div>
                  <div className="landing-preview-meta">
                    <span className="landing-preview-name">Demo-Video.mp4</span>
                    <span className="landing-preview-size">48 MB · Private</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-features">
          <div className="landing-feature-card">
            <div className="landing-feature-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <h3>Upload with progress</h3>
            <p>
              Drag and drop files up to 100 MB. Track upload progress in real
              time with clear success and error states. Uploading is available
              only to signed-in users.
            </p>
          </div>

          <div className="landing-feature-card">
            <div className="landing-feature-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3>Private by default</h3>
            <p>
              Every upload is private and readable only by you. Your files are
              protected with JWT authentication and owner-only authorization.
            </p>
          </div>

          <div className="landing-feature-card">
            <div className="landing-feature-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
            </div>
            <h3>Shareable links</h3>
            <p>
              Toggle any file to public and get a shareable link. Public files
              are accessible to anyone with the link — no login required.
            </p>
          </div>

          <div className="landing-feature-card">
            <div className="landing-feature-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3>Organize & manage</h3>
            <p>
              Search, filter, download, and delete files from your dashboard.
              Everything stays organized in one secure place.
            </p>
          </div>
        </section>

        <section className="landing-cta-section">
          <h2>Ready to store your files securely?</h2>
          <p>
            Create a free account and start uploading in less than a minute.
          </p>
          <div className="landing-actions">
            {isLoading ? null : isAuthenticated ? (
              <Link to="/dashboard" className="btn-primary landing-cta">
                Open Dashboard
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary landing-cta">
                  Create Free Account
                </Link>
                <Link to="/login" className="btn-secondary landing-cta-secondary">
                  I already have an account
                </Link>
              </>
            )}
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <p>© {new Date().getFullYear()} SecureFile · Built with React, Express & PostgreSQL</p>
      </footer>
    </div>
  );
}
