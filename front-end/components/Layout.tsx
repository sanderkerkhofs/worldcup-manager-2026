import Link from 'next/link';
import { ReactNode } from 'react';
import { useRouter } from 'next/router';
import { useT } from '../lib/i18n';
import { useSession } from '../lib/useSession';
import { LanguageSwitcher } from './LanguageSwitcher';

export function Layout({ children }: { children: ReactNode }) {
    const t = useT();
    const router = useRouter();
    const { session, signOut } = useSession();

    function handleLogout() {
        signOut();
        router.push('/');
    }

    return (
        <div className="page-shell">
            <div className="page-backdrop" />
            <header className="topbar">
                <div>
                    <p className="eyebrow">{t('app.subtitle')}</p>
                    <h1>{t('app.title')}</h1>
                </div>
                <nav className="nav-links">
                    <Link href="/">{t('nav.home')}</Link>
                    <Link href="/tournaments">{t('nav.tournaments')}</Link>
                    <Link href="/login">{t('nav.login')}</Link>
                    {session ? <button onClick={handleLogout} className="nav-button">{t('nav.logout')}</button> : null}
                    <LanguageSwitcher />
                </nav>
            </header>
            <main className="content-grid">{children}</main>
        </div>
    );
}