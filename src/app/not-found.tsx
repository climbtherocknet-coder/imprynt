import Link from 'next/link';
import '@/styles/error.css';

export default function NotFound() {
  return (
    <div className="error-page">
      <div className="error-logo" />
      <h1 className="error-heading">Page not found</h1>
      <p className="error-text">
        This page doesn&apos;t exist or has been moved.
      </p>
      <div className="error-actions">
        <Link href="https://trysygnet.com" className="error-btn">
          Go to Imprynt
        </Link>
      </div>
    </div>
  );
}
