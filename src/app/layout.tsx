import './globals.css'
import { Inter } from 'next/font/google'
import AuthProvider from '../components/auth-provider'
import LoginButton from '../components/login-btn'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'From My Farm',
  description: 'Buy fresh produce directly from local farmers',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1.5rem', background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
            <Link href="/" style={{ fontWeight: 700, fontSize: '1.1rem', textDecoration: 'none', color: '#333' }}>From My Farm</Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <LoginButton />
            </div>
          </nav>
          <div style={{ paddingTop: '3rem' }}>
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
