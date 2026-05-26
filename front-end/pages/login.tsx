import { useRouter } from 'next/router';
import Link from 'next/link';
import { LoginForm } from '../components/LoginForm';
import { useSession } from '../lib/useSession';
import { login } from '../services/authService';

export default function LoginPage() {
  const { setSession } = useSession();
  const router = useRouter();

  return (
    <section className="authSection authSectionWide">
      <div className="authCard">
        <h2>Predefined Access</h2>
        <p className="muted">Use one of these credentials for role-based testing. Guests can browse home, login, and register without signing in.</p>
        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Password</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>admin</td>
                <td>admin123</td>
                <td>admin</td>
              </tr>
              <tr>
                <td>greetjej</td>
                <td>greetjej123</td>
                <td>user</td>
              </tr>
              <tr>
                <td>elkes</td>
                <td>elkes123</td>
                <td>user</td>
              </tr>
              <tr>
                <td>johanp</td>
                <td>johanp123</td>
                <td>user</td>
              </tr>
              <tr>
                <td>Frank_De_Bleeckere</td>
                <td>referee123</td>
                <td>referee</td>
              </tr>
              <tr>
                <td>-</td>
                <td>-</td>
                <td>guest</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="muted">Need a new account? <Link href="/register">Go to register</Link>.</p>
      </div>

      <LoginForm
        onSubmit={async (username, password) => {
          const response = await login(username, password);
          setSession(response.token, response.user);
          await router.push('/');
        }}
      />
    </section>
  );
}
