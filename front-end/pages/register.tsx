import Link from 'next/link';
import { useRouter } from 'next/router';
import { FormEvent, useState } from 'react';
import { useSession } from '../lib/useSession';
import { register } from '../services/authService';

export default function RegisterPage() {
  const { setSession } = useSession();
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
      const message = submitError instanceof Error ? submitError.message : 'Registration failed.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="authSection authSectionWide">
      <div className="authCard">
        <h2>Create Account</h2>
        <p className="muted">Register to get a user account that can view matches and stats.</p>
        <form onSubmit={handleSubmit}>
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

          <button type="submit" disabled={loading}>{loading ? 'Working...' : 'Register'}</button>
        </form>

        <p className="muted">Already have an account? <Link href="/login">Go to login</Link>.</p>
      </div>
    </section>
  );
}