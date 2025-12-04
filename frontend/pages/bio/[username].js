import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function BioPage() {
  const router = useRouter()
  const { username } = router.query
  const [bio, setBio] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (username) {
      fetchBio()
    }
  }, [username])

  const fetchBio = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bio/${username}`)
      if (response.ok) {
        const data = await response.json()
        setBio(data)
      } else {
        setError('Bio page not found')
      }
    } catch (err) {
      setError('Failed to load bio page')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (error || !bio) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            {error || 'Bio page not found'}
          </p>
          <a href="/" className="btn-primary">
            Go Home
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 dark:from-gray-900 dark:to-gray-800">
      <Head>
        <title>{bio.title || `${username}'s Bio`} - V-Link</title>
        <meta name="description" content={bio.description || `${username}'s bio page`} />
        <meta property="og:title" content={bio.title || `${username}'s Bio`} />
        <meta property="og:description" content={bio.description || `${username}'s bio page`} />
        {bio.image && <meta property="og:image" content={bio.image} />}
      </Head>

      <div className="max-w-md mx-auto px-4 py-16">
        {/* Profile Section */}
        <div className="text-center mb-8">
          {bio.avatar && (
            <img
              src={bio.avatar}
              alt={username}
              className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
            />
          )}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {bio.displayName || username}
          </h1>
          {bio.bio && (
            <p className="text-gray-600 dark:text-gray-300">
              {bio.bio}
            </p>
          )}
        </div>

        {/* Links */}
        <div className="space-y-4">
          {bio.links && bio.links.map((link, index) => (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center">
                {link.icon && (
                  <img src={link.icon} alt="" className="w-6 h-6 mr-3" />
                )}
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {link.title}
                  </h3>
                  {link.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {link.description}
                    </p>
                  )}
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            </a>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Powered by <a href="/" className="text-red-600 hover:text-red-700">V-Link</a>
          </p>
        </div>
      </div>
    </div>
  )
}
