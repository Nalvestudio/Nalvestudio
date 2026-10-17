import Link from 'next/link';
import { AccountLink } from './AccountLink';

interface BackHeaderProps {
  label: string;
  withAccount?: boolean;
}

/** Minimal header with the brand and a "back to the store" button (inner pages). */
export function BackHeader({ label, withAccount = true }: BackHeaderProps) {
  return (
    <header className="site-header">
      <div className="wrap">
        <Link href="/" className="brand" aria-label="NALV">
          <img src="/img/nalv-logo.png" alt="NALV" />
        </Link>
        <Link href="/" className="btn btn-ghost" style={{ color: 'var(--ink)', borderColor: 'var(--line)' }}>
          {label}
        </Link>
        {withAccount ? <AccountLink /> : null}
      </div>
    </header>
  );
}
