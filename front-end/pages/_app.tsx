import type { AppProps } from 'next/app';
import { SessionProvider } from '../lib/useSession';
import { Layout } from '../components/Layout';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </SessionProvider>
  );
}
