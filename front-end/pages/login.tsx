import { useRouter } from 'next/router';
import { useState } from 'react';
import { LoginForm } from '../components/LoginForm';
import { register, login } from '../services/authService';
import { useSession } from '../lib/useSession';
import { useT } from '../lib/i18n';

export default function LoginPage() {
    const t = useT();
    const router = useRouter();
    const { persist } = useSession();
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [error, setError] = useState<string | null>(null);

    async function handleAuth(input: Parameters<typeof login>[0]) {
        try {
            const session = mode === 'login' ? await login(input) : await register(input as Parameters<typeof register>[0]);
            persist(session);
            await router.push('/tournaments');
        } catch (caughtError) {
            setError(caughtError instanceof Error ? caughtError.message : 'Authentication failed.');
        }
    }

    return (
        <div className="auth-layout">
            <section className="auth-panel">
                <h2>{t('auth.title')}</h2>
                <div className="toggle-row">
                    <button className={mode === 'login' ? 'toggle active' : 'toggle'} onClick={() => setMode('login')} type="button">{t('auth.login')}</button>
                    <button className={mode === 'register' ? 'toggle active' : 'toggle'} onClick={() => setMode('register')} type="button">{t('auth.register')}</button>
                </div>
                <LoginForm mode={mode} onSubmit={handleAuth} error={error} />
            </section>
        </div>
    );
}