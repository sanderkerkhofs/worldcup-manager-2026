import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from '../lib/useSession';
import { useT } from '../lib/i18n';

export function AuthGate({ children }: { children: ReactNode }) {
    const router = useRouter();
    const t = useT();
    const { session, ready } = useSession();

    useEffect(() => {
        if (ready && !session) {
            router.replace('/login?reason=auth-required');
        }
    }, [ready, session, router]);

    if (!ready) {
        return <p className="status-copy">{t('common.loading')}</p>;
    }

    if (!session) {
        return <p className="status-copy">You must sign in to open this page.</p>;
    }

    return <>{children}</>;
}