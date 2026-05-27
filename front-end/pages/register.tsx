import Link from 'next/link';
import { useRouter } from 'next/router';
import { FormEvent, useState } from 'react';
import { useI18n } from '../lib/i18n';
import { useSession } from '../lib/useSession';
import { register } from '../services/authService';

export default function RegisterPage() {
  const { setSession } = useSession();
  const { t } = useI18n();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await register(username.trim(), password);
      setSession(response.token, response.user);
      await router.push('/');
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : t('errorRegistrationFailed');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="authSection authSectionWide">
      <div className="authCard">
        <h2>{t('authCreateAccount')}</h2>
        <p className="muted">{t('authRegisterHint')}</p>
        <form onSubmit={handleSubmit}>
          <label>
            {t('labelUsername')}
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
              minLength={3}
            />
          </label>

          <label>
            {t('labelPassword')}
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
            />
          </label>

          {error && <p className="errorText">{error}</p>}

          <button type="submit" disabled={loading}>{loading ? t('buttonWorking') : t('buttonRegister')}</button>
        </form>

        <p className="muted">{t('authAlreadyAccount')} <Link href="/login">{t('goToLogin')}</Link>.</p>
      </div>
    </section>
  );
}