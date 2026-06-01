import { useRouter } from 'next/router';
import Link from 'next/link';
import { LoginForm } from '../components/LoginForm';
import { useI18n } from '../lib/i18n';
import { useSession } from '../lib/useSession';
import { login } from '../services/authService';

export default function LoginPage() {
  const { setSession } = useSession();
  const { t } = useI18n();
  const router = useRouter();

  return (
    <section className="authSection authSectionWide">
      <div className="authCard">
        <p className="eyebrow">{t('authPredefinedAccess')}</p>
        <h2>{t('authPredefinedAccess')}</h2>
        <p className="muted">{t('authCredentialHint')}</p>
        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>{t('colUsername')}</th>
                <th>{t('colPassword')}</th>
                <th>{t('colRole')}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>admin</td>
                <td>admin123</td>
                <td>{t('roleAdmin')}</td>
              </tr>
              <tr>
                <td>greetjej</td>
                <td>greetjej123</td>
                <td>{t('roleUser')}</td>
              </tr>
              <tr>
                <td>elkes</td>
                <td>elkes123</td>
                <td>{t('roleUser')}</td>
              </tr>
              <tr>
                <td>johanp</td>
                <td>johanp123</td>
                <td>{t('roleUser')}</td>
              </tr>
              <tr>
                <td>Frank_De_Bleeckere</td>
                <td>referee123</td>
                <td>{t('roleReferee')}</td>
              </tr>
              <tr>
                <td>-</td>
                <td>-</td>
                <td>{t('roleGuest')}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="muted">{t('authNeedAccount')} <Link href="/register">{t('goToRegister')}</Link>.</p>
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
