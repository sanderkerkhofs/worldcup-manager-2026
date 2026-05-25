import Link from 'next/link';
import { ReactNode } from 'react';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHouse,
  faChartLine,
  faUserShield,
  faFlagCheckered,
  faFutbol,
  faRightFromBracket,
  faRightToBracket,
} from '@fortawesome/free-solid-svg-icons';
import { useSession } from '../lib/useSession';

export function Layout({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, logout } = useSession();
  const router = useRouter();
  const role = user?.role;

  const currentPath = router.asPath.split('?')[0].split('#')[0];

  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return currentPath === '/';
    }

    return currentPath === href || currentPath.startsWith(`${href}/`);
  };

  const navItemClass = (href: string) => (`topbarNavItem${isActiveRoute(href) ? ' topbarNavItemActive' : ''}`);

  return (
    <div className="shell">
      <header className="topbar">
        <div>
          <h1 className="brand">Worldcup Manager 2026</h1>
        </div>

        <nav id="main-navigation" className="topbarGroup" aria-label="Main navigation">
          <Link href="/" className={navItemClass('/')}><span className="iconLabel"><FontAwesomeIcon icon={faHouse} /> Home</span></Link>
          {isAuthenticated && <Link href="/matches" className={navItemClass('/matches')}><span className="iconLabel"><FontAwesomeIcon icon={faFutbol} /> Matches</span></Link>}
          <Link href="/stats" className={navItemClass('/stats')}><span className="iconLabel"><FontAwesomeIcon icon={faChartLine} /> Stats</span></Link>
          {role === 'ADMIN' && <Link href="/admin" className={navItemClass('/admin')}><span className="iconLabel"><FontAwesomeIcon icon={faUserShield} /> Admin</span></Link>}
          {role === 'REFEREE' && <Link href="/referee" className={navItemClass('/referee')}><span className="iconLabel"><FontAwesomeIcon icon={faFlagCheckered} /> Referee</span></Link>}
          {isAuthenticated ? (
            <>
              <span className="userBadge topbarUserBadge">{user?.username} ({user?.role})</span>
              <button className="topbarNavItem topbarLogout" onClick={logout}>
                <span className="iconLabel"><FontAwesomeIcon icon={faRightFromBracket} /> Logout</span>
              </button>
            </>
          ) : (
            <Link href="/login" className={navItemClass('/login')}><span className="iconLabel"><FontAwesomeIcon icon={faRightToBracket} /> Login</span></Link>
          )}
        </nav>
      </header>

      <main className="content">{children}</main>
    </div>
  );
}
