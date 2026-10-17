import type { Metadata } from 'next';
import Link from 'next/link';
import { AdminScreen } from '@/components/admin/AdminScreen';
import { adminCss } from './styles';

export const metadata: Metadata = { title: 'Panel de pedidos | nalv.estudio' };

// Ported from legacy admin.html (markup and styles only).
export default function AdminPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: adminCss }} />
      <header className="site-header">
        <div className="wrap">
          <Link href="/" className="brand" aria-label="NALV">
            <img src="/img/nalv-logo.png" alt="NALV" />
          </Link>
          <span style={{ fontFamily: 'var(--mono)', fontSize: '.85rem', color: 'var(--ink-soft)' }}>panel de pedidos</span>
        </div>
      </header>
      <AdminScreen />
    </>
  );
}
