import { AppProps } from 'next/app';
import Head from 'next/head';
import { ThemeProvider } from 'next-themes';
import SimpleReactLightbox from 'simple-react-lightbox';

import '@/styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute='class'>
      <SimpleReactLightbox>
        <Head>
          <meta
            name='viewport'
            content='minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover'
          />

          <meta
            name='application-name'
            content='Facebook Messenger exported JSON viewer'
          />
          <meta name='apple-mobile-web-app-capable' content='yes' />
          <meta
            name='apple-mobile-web-app-status-bar-style'
            content='default'
          />
          <meta
            name='apple-mobile-web-app-title'
            content='Facebook Messenger exported JSON viewer'
          />
          <meta
            name='description'
            content='View your exported messenger data in style'
          />
          <meta name='format-detection' content='telephone=no' />
          <meta name='mobile-web-app-capable' content='yes' />
          <meta
            name='msapplication-config'
            content='/icons/browserconfig.xml'
          />
          <meta name='msapplication-TileColor' content='#2B5797' />
          <meta name='msapplication-tap-highlight' content='no' />

          <title>Messenger Archive Viewer</title>
          <meta name='theme-color' content='#121212' />
        </Head>

        <Component {...pageProps}></Component>
      </SimpleReactLightbox>
    </ThemeProvider>
  );
}

export default MyApp;
