import Link from 'next/link';
import { ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGaugeHigh,
  faUserShield,
  faPersonRunning,
  faFlagCheckered,
  faFutbol,
  faRightFromBracket,
  faRightToBracket,
} from '@fortawesome/free-solid-svg-icons';
import { useSession } from '../lib/useSession';

export function Layout({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, logout } = useSession();
  const role = user?.role;

  return (
    <div className="shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">FIFA-Style Knockout Control</p>
          <h1 className="brand">Worldcup Manager 2026</h1>
        </div>

        <nav id="main-navigation" className="topbarGroup" aria-label="Main navigation">
          <Link href="/" className="topbarNavItem"><span className="iconLabel"><FontAwesomeIcon icon={faGaugeHigh} /> Dashboard</span></Link>
          {role === 'ADMIN' && <Link href="/admin" className="topbarNavItem"><span className="iconLabel"><FontAwesomeIcon icon={faUserShield} /> Admin</span></Link>}
          {role === 'COACH' && <Link href="/coach" className="topbarNavItem"><span className="iconLabel"><FontAwesomeIcon icon={faPersonRunning} /> Coach</span></Link>}
          {role === 'REFEREE' && <Link href="/referee" className="topbarNavItem"><span className="iconLabel"><FontAwesomeIcon icon={faFlagCheckered} /> Referee</span></Link>}
          {isAuthenticated && <Link href="/matches" className="topbarNavItem"><span className="iconLabel"><FontAwesomeIcon icon={faFutbol} /> Matches</span></Link>}
          {isAuthenticated ? (
            <>
              <span className="userBadge topbarUserBadge">{user?.username} ({user?.role})</span>
              <button className="topbarNavItem topbarLogout" onClick={logout}>
                <span className="iconLabel"><FontAwesomeIcon icon={faRightFromBracket} /> Logout</span>
              </button>
            </>
          ) : (
            <Link href="/login" className="topbarNavItem"><span className="iconLabel"><FontAwesomeIcon icon={faRightToBracket} /> Login</span></Link>
          )}
        </nav>
      </header>

      <main className="content">{children}</main>
    </div>
  );
}
