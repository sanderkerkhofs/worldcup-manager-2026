import type { AppProps } from 'next/app';
import '../styles/globals.css';
import { LocaleProvider } from '../lib/i18n';
import { SessionProvider } from '../lib/useSession';
import { Layout } from '../components/Layout';

export default function App({ Component, pageProps }: AppProps) {
    return (
        <SessionProvider>
            <LocaleProvider>
                <Layout>
                    <Component {...pageProps} />
                </Layout>
            </LocaleProvider>
        </SessionProvider>
    );
}