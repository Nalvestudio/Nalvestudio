import type { ReactNode } from 'react';
import Link from 'next/link';
import { CartButton } from '@/components/cart/CartButton';
import { AccountLink } from './AccountLink';

/** Header with navigation, account link and cart button (home and garments pages). */
export function StoreHeader({ children }: { children: ReactNode }) {
  return (
    <header className="site-header">
      <div className="wrap">
        <Link href="/" className="brand" aria-label="NALV">
          <img src="/img/nalv-logo.png" alt="NALV" />
        </Link>
        <nav className="nav-links">{children}</nav>
        <div className="hdr-right">
          <AccountLink />
          <CartButton />
        </div>
      </div>
    </header>
  );
}
