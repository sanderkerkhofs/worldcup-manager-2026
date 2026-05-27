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
import { LocaleCode, SUPPORTED_LOCALES, useI18n } from '../lib/i18n';

export function Layout({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, logout } = useSession();
  const { locale, setLocale, t } = useI18n();
  const router = useRouter();
  const role = user?.role;

  const isGuest = !isAuthenticated || role === 'GUEST';
  const canViewUserPages = isAuthenticated && role !== 'GUEST';
  const canViewAdminPage = role === 'ADMIN';
  const canViewRefereePage = role === 'REFEREE';

  const currentPath = router.asPath.split('?')[0].split('#')[0];

  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return currentPath === '/';
    }

    return currentPath === href || currentPath.startsWith(`${href}/`);
  };

  const navItemClass = (href: string) => (`topbarNavItem${isActiveRoute(href) ? ' topbarNavItemActive' : ''}`);

  const languageLabelByLocale: Record<LocaleCode, string> = {
    nl: t('languageNL'),
    en: t('languageENG'),
    fr: t('languageFR'),
  };

  return (
    <div className="shell">
      <header className="topbar">
        <div>
          <h1 className="brand">{t('brandTitle')}</h1>
        </div>

        <nav id="main-navigation" className="topbarGroup" aria-label="Main navigation">
          <Link href="/" className={navItemClass('/')}><span className="iconLabel"><FontAwesomeIcon icon={faHouse} /> {t('navHome')}</span></Link>
          {canViewUserPages && <Link href="/matches" className={navItemClass('/matches')}><span className="iconLabel"><FontAwesomeIcon icon={faFutbol} /> {t('navMatches')}</span></Link>}
          {canViewUserPages && <Link href="/stats" className={navItemClass('/stats')}><span className="iconLabel"><FontAwesomeIcon icon={faChartLine} /> {t('navStats')}</span></Link>}
          {canViewAdminPage && <Link href="/admin" className={navItemClass('/admin')}><span className="iconLabel"><FontAwesomeIcon icon={faUserShield} /> {t('navAdmin')}</span></Link>}
          {canViewRefereePage && <Link href="/referee" className={navItemClass('/referee')}><span className="iconLabel"><FontAwesomeIcon icon={faFlagCheckered} /> {t('navReferee')}</span></Link>}
          {isGuest ? (
            <>
              <Link href="/login" className={navItemClass('/login')}><span className="iconLabel"><FontAwesomeIcon icon={faRightToBracket} /> {t('navLogin')}</span></Link>
              <Link href="/register" className={navItemClass('/register')}><span className="iconLabel"><FontAwesomeIcon icon={faRightToBracket} /> {t('navRegister')}</span></Link>
              <div className="languageSwitch" role="group" aria-label={t('languageSwitchAria')}>
                {SUPPORTED_LOCALES.map((code) => (
                  <button
                    key={code}
                    type="button"
                    className={`languageSwitchButton${locale === code ? ' languageSwitchButtonActive' : ''}`}
                    onClick={() => setLocale(code)}
                  >
                    {languageLabelByLocale[code]}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <span className="userBadge topbarUserBadge">{user?.username} ({user?.role})</span>
              <div className="languageSwitch" role="group" aria-label={t('languageSwitchAria')}>
                {SUPPORTED_LOCALES.map((code) => (
                  <button
                    key={code}
                    type="button"
                    className={`languageSwitchButton${locale === code ? ' languageSwitchButtonActive' : ''}`}
                    onClick={() => setLocale(code)}
                  >
                    {languageLabelByLocale[code]}
                  </button>
                ))}
              </div>
              <button className="topbarNavItem topbarLogout" onClick={logout}>
                <span className="iconLabel"><FontAwesomeIcon icon={faRightFromBracket} /> {t('navLogout')}</span>
              </button>
            </>
          )}
        </nav>
      </header>

      <main className="content">{children}</main>
    </div>
  );
}
