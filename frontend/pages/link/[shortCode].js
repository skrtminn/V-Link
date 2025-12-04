import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function LinkRedirect() {
  const router = useRouter()
  const { shortCode } = router.query
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [password, setPassword] = useState('')
  const [showPasswordForm, setShowPasswordForm] = useState(false)

  useEffect(() => {
    if (shortCode) {
      redirectToLink()
    }
  }, [shortCode])

  const redirectToLink = async () => {
    try {
      // First try to redirect directly
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${shortCode}`, {
        redirect: 'manual' // Don't follow redirects automatically
      })

      if (response.status === 302 || response.status === 301) {
        // Direct redirect
        window.location.href = response.headers.get('location')
        return
      }

      if (response.status === 200) {
        // Password required
        const data = await response.json()
        if (data.requiresPassword) {
          setShowPasswordForm(true)
          setLoading(false)
          return
        }
      }

      if (response.status === 404) {
        setError('Link not found')
        setLoading(false)
        return
      }

      if (response.status === 410) {
        const data = await response.json()
        setError(data.message || 'Link expired or inactive')
        setLoading(false)
        return
      }

      // For any other status, try direct backend redirect
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/${shortCode}`

    } catch (err) {
      console.error('Redirect error:', err)
      setError('Failed to redirect. Please try again.')
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${shortCode}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      })

      if (response.ok) {
        const data = await response.json()
        window.location.href = data.originalUrl
      } else {
        const data = await response.json()
        setError(data.message || 'Invalid password')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Redirecting...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md mx-auto text-center">
          <Head>
            <title>Link Error - V-Link</title>
          </Head>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Link Error</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
            <a href="/" className="btn-primary">
              Go Home
            </a>
          </div>
        </div>
      </div>
    )
  }

  if (showPasswordForm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md mx-auto">
          <Head>
            <title>Password Required - V-Link</title>
          </Head>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Password Required</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              This link is password protected. Please enter the password to continue.
            </p>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="input-field"
                required
              />
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <button type="submit" disabled={loading} className="w-full btn-primary">
                {loading ? 'Checking...' : 'Submit'}
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return null
}
