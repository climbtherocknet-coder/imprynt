'use client';

import '@/styles/error.css';

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="error-page">
      <div className="error-logo" />
      <h1 className="error-heading">Something went wrong</h1>
      <p className="error-text">
        An unexpected error occurred. Please try again.
      </p>
      <div className="error-actions">
        <button onClick={reset} className="error-btn">
          Try again
        </button>
        <a href="https://trysygnet.com" className="error-link">
          Go home
        </a>
      </div>
    </div>
  );
}
