import { FormEvent, useState } from 'react';
import { useI18n } from '../lib/i18n';

type Props = {
  onSubmit: (username: string, password: string) => Promise<void>;
};

export function LoginForm({ onSubmit }: Props) {
  const { t } = useI18n();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSubmit(username.trim(), password);
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : t('errorAuthenticationFailed');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="authCard" onSubmit={handleSubmit}>
      <h2>{t('authSignIn')}</h2>

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

      <button type="submit" disabled={loading}>{loading ? t('buttonWorking') : t('navLogin')}</button>
    </form>
  );
}
