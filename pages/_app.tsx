import Head from 'next/head'
import '@/styles/globals.css'

import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {

  return (
    <>
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;600&display=swap"
          rel="stylesheet"
        />
        <title>Feelzy – Mood Tracker</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
<link rel="manifest" href="/manifest.json" />
<link rel="apple-touch-icon" href="/icon-192.png" />
<meta name="theme-color" content="#ec4899" />

      </Head>
      <Component {...pageProps} />
    </>
  )
}
