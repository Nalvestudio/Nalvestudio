import Link from 'next/link';

// Port of legacy js/account-nav.js ("Ingresar / Mi cuenta" header link).
// TODO(backend): resolve the logged-in user via the legacy /api/account/me endpoint and show "👤 <name>".
export function AccountLink() {
  return (
    <Link className="acct-link" href="/cuenta">
      Ingresar
    </Link>
  );
}
