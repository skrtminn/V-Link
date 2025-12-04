import Link from 'next/link'
import { useAuth } from '../hooks/useAuth'

export default function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-red-600">
              V-Link
            </Link>
          </div>
          <nav className="flex items-center space-x-4">
            {user ? (
              <>
                <Link href="/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-red-600">
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="btn-secondary"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login" className="btn-primary">
                Login
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
