import Link from 'next/link';
import { ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGaugeHigh,
  faLayerGroup,
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

        <nav className="topbarActions">
          <Link href="/" className="linkButton"><span className="iconLabel"><FontAwesomeIcon icon={faGaugeHigh} /> Dashboard</span></Link>
          <Link href="/rounds" className="linkButton"><span className="iconLabel"><FontAwesomeIcon icon={faLayerGroup} /> Rounds</span></Link>
          {role === 'ADMIN' && <Link href="/admin" className="linkButton"><span className="iconLabel"><FontAwesomeIcon icon={faUserShield} /> Admin</span></Link>}
          {role === 'COACH' && <Link href="/coach" className="linkButton"><span className="iconLabel"><FontAwesomeIcon icon={faPersonRunning} /> Coach</span></Link>}
          {role === 'REFEREE' && <Link href="/referee" className="linkButton"><span className="iconLabel"><FontAwesomeIcon icon={faFlagCheckered} /> Referee</span></Link>}
          {isAuthenticated && <Link href="/matches" className="linkButton"><span className="iconLabel"><FontAwesomeIcon icon={faFutbol} /> Matches</span></Link>}
          {isAuthenticated ? (
            <>
              <span className="userBadge">{user?.username} ({user?.role})</span>
              <button className="ghostButton" onClick={logout}><span className="iconLabel"><FontAwesomeIcon icon={faRightFromBracket} /> Logout</span></button>
            </>
          ) : (
            <Link href="/login" className="linkButton"><span className="iconLabel"><FontAwesomeIcon icon={faRightToBracket} /> Login</span></Link>
          )}
        </nav>
      </header>

      <main className="content">{children}</main>
    </div>
  );
}
