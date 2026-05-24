import { FormEvent, useState } from 'react';

type Props = {
  onSubmit: (username: string, password: string) => Promise<void>;
};

export function LoginForm({ onSubmit }: Props) {
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
      const message = submitError instanceof Error ? submitError.message : 'Authentication failed.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="authCard" onSubmit={handleSubmit}>
      <h2>Sign In</h2>

      <label>
        Username
        <input
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          required
          minLength={3}
        />
      </label>

      <label>
        Password
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={6}
        />
      </label>

      {error && <p className="errorText">{error}</p>}

      <button type="submit" disabled={loading}>{loading ? 'Working...' : 'Login'}</button>
    </form>
  );
}
