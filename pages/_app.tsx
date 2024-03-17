// eslint-disable
import type { AppProps } from 'next/app'

import { AuthProvider, SaasProvider } from '@saas-ui/react'
import { Layout } from 'components/layout'

import theme from '../theme'
import '../public/static/fonts/Londrina_Solid/stylesheet.css';

function MyApp({ Component, pageProps }: AppProps) {
  const { announcement, header, footer } = pageProps

  return (
    <SaasProvider theme={theme}>
      <AuthProvider>
        <Layout
          announcementProps={announcement}
          headerProps={header}
          footerProps={footer}
        >
          {/* @ts-ignore */}
          <Component {...(pageProps as any)} />
        </Layout>
      </AuthProvider>
    </SaasProvider>
  )
}

export default MyApp
