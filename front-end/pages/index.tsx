import Link from 'next/link';
import { useT } from '../lib/i18n';

const testUsers = [
    { username: 'greetjej', password: 'greetjej123', role: 'lecturer' },
    { username: 'elkes', password: 'elkes123', role: 'student' },
    { username: 'johanp', password: 'johanp123', role: 'guest' },
    { username: 'admin', password: 'admin123', role: 'admin' },
];

export default function HomePage() {
    const t = useT();

    return (
        <div className="hero-grid">
            <section className="hero-panel">
                <p className="eyebrow">MVP</p>
                <h2>{t('home.hero')}</h2>
                <p>{t('home.copy')}</p>
                <p className="status-copy">{t('home.statusHint')}</p>
                <div className="hero-actions">
                    <Link className="primary-button" href="/login">{t('nav.login')}</Link>
                    <Link className="secondary-button" href="/tournaments">{t('nav.tournaments')}</Link>
                </div>
            </section>

            <section className="info-panel">
                <h3>{t('home.testUsers')}</h3>
                <ul className="credential-list">
                    {testUsers.map((user) => (
                        <li key={user.username}>
                            <strong>{user.username}</strong> / {user.password} / {user.role}
                        </li>
                    ))}
                </ul>
                <p className="status-copy">{t('home.loginHint')}</p>
            </section>
        </div>
    );
}