import '../styles/globals.css'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'

function MyApp({ Component, pageProps }) {
  const router = useRouter()

  return (
    <>
      <Head>
        <title>TikTok Scraper Platform</title>
        <meta name="description" content="Professional TikTok scraping and analysis platform" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen flex flex-col">
        {/* Navigation */}
        <nav className="bg-dark text-white shadow-lg">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="text-xl font-bold flex items-center space-x-2">
                <span className="text-primary">TikTok</span>
                <span>Scraper</span>
              </Link>

              <div className="flex space-x-6">
                <Link
                  href="/"
                  className={`hover:text-primary transition-colors ${router.pathname === '/' ? 'text-primary' : ''}`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/projects"
                  className={`hover:text-primary transition-colors ${router.pathname.startsWith('/projects') ? 'text-primary' : ''}`}
                >
                  Progetti
                </Link>
                <Link
                  href="/scraper"
                  className={`hover:text-primary transition-colors ${router.pathname === '/scraper' ? 'text-primary' : ''}`}
                >
                  Scraper
                </Link>
                <Link
                  href="/settings"
                  className={`hover:text-primary transition-colors ${router.pathname === '/settings' ? 'text-primary' : ''}`}
                >
                  Impostazioni
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 container mx-auto px-4 py-8">
          <Component {...pageProps} />
        </main>

        {/* Footer */}
        <footer className="bg-dark text-white py-6 mt-auto">
          <div className="container mx-auto px-4 text-center">
            <p>TikTok Scraper Platform - Powered by tiktok-hks</p>
          </div>
        </footer>
      </div>
    </>
  )
}

export default MyApp
