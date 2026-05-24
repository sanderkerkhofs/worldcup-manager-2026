import { useRouter } from 'next/router';
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
        <p className="muted">Use one of these credentials for role-based testing. Guest pages are public and do not require login.</p>
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
                <td>Domenico_Tedesco</td>
                <td>coach123</td>
                <td>coach</td>
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
