import { FormEvent, useState } from 'react';
import { LoginInput, RegisterInput, UserRole } from '@types';
import { useT } from '../lib/i18n';

const roles: UserRole[] = ['ADMIN', 'ORGANIZER', 'VIEWER'];

export function LoginForm({
    mode,
    onSubmit,
    error,
}: {
    mode: 'login' | 'register';
    onSubmit: (input: LoginInput | RegisterInput) => Promise<void>;
    error?: string | null;
}) {
    const t = useT();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<UserRole>('VIEWER');
    const [formError, setFormError] = useState<string | null>(null);
    const isRegister = mode === 'register';

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!username.trim() || !password.trim()) {
            setFormError(t('auth.errorRequired'));
            return;
        }

        setFormError(null);
        await onSubmit(isRegister ? { username, password, role } : { username, password });
    }

    return (
        <form className="auth-form" onSubmit={handleSubmit}>
            <label>
                <span>{t('auth.username')}</span>
                <input value={username} onChange={(event) => setUsername(event.target.value)} />
            </label>
            <label>
                <span>{t('auth.password')}</span>
                <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
            </label>
            {isRegister ? (
                <label>
                    <span>{t('auth.role')}</span>
                    <select value={role} onChange={(event) => setRole(event.target.value as UserRole)}>
                        {roles.map((option) => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </label>
            ) : null}
            {(formError || error) ? <p className="error-banner">{formError ?? error}</p> : null}
            <button type="submit">{isRegister ? t('auth.submitRegister') : t('auth.submitLogin')}</button>
        </form>
    );
}