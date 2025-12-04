import { useState, useEffect } from 'react'

export default function LinkModal({ isOpen, onClose, onSave, editingLink = null }) {
  const [formData, setFormData] = useState({
    originalUrl: '',
    title: '',
    description: '',
    customAlias: '',
    password: '',
    expiresAt: '',
    tags: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [qrCode, setQrCode] = useState('')

  useEffect(() => {
    if (editingLink) {
      setFormData({
        originalUrl: editingLink.originalUrl || '',
        title: editingLink.title || '',
        description: editingLink.description || '',
        customAlias: editingLink.customAlias || '',
        password: '',
        expiresAt: editingLink.expiresAt ? new Date(editingLink.expiresAt).toISOString().slice(0, 16) : '',
        tags: editingLink.tags ? editingLink.tags.join(', ') : ''
      })
    } else {
      setFormData({
        originalUrl: '',
        title: '',
        description: '',
        customAlias: '',
        password: '',
        expiresAt: '',
        tags: ''
      })
    }
    setError('')
    setQrCode('')
  }, [editingLink, isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const submitData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
      }

      if (editingLink) {
        // Update existing link
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/links/${editingLink._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(submitData),
        })

        const data = await response.json()

        if (response.ok) {
          onSave(data)
          onClose()
        } else {
          setError(data.message || 'Failed to update link')
        }
      } else {
        // Create new link
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/links`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(submitData),
        })

        const data = await response.json()

        if (response.ok) {
          // Generate QR code
          try {
            const qrResponse = await fetch(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${window.location.origin}/${data.shortCode}`)}`)
            if (qrResponse.ok) {
              setQrCode(`${window.location.origin}/${data.shortCode}`)
            }
          } catch (qrError) {
            console.error('QR code generation failed:', qrError)
          }

          onSave(data)
          // Don't close modal immediately, show success with QR
          setTimeout(() => onClose(), 2000)
        } else {
          setError(data.message || 'Failed to create link')
        }
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {editingLink ? 'Edit Link' : 'Create New Link'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {qrCode && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900 rounded-lg">
              <div className="flex items-center justify-center space-x-4">
                <div className="text-center">
                  <p className="text-green-800 dark:text-green-200 font-medium mb-2">Link Created Successfully!</p>
                  <p className="text-green-700 dark:text-green-300 text-sm mb-4">{qrCode}</p>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrCode)}`}
                    alt="QR Code"
                    className="mx-auto border border-green-300 dark:border-green-600 rounded"
                  />
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Original URL *
                </label>
                <input
                  type="url"
                  name="originalUrl"
                  value={formData.originalUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="My Awesome Link"
                  className="input-field"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Custom Alias
                </label>
                <input
                  type="text"
                  name="customAlias"
                  value={formData.customAlias}
                  onChange={handleInputChange}
                  placeholder="my-custom-link"
                  className="input-field"
                  pattern="^[a-zA-Z0-9_-]+$"
                  title="Only letters, numbers, hyphens, and underscores allowed"
                  maxLength={20}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Leave empty for auto-generated code
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Brief description of your link..."
                  className="input-field"
                  rows={3}
                  maxLength={500}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password Protection
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Optional password"
                  className="input-field"
                  minLength={4}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Leave empty for no password
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Expiration Date
                </label>
                <input
                  type="datetime-local"
                  name="expiresAt"
                  value={formData.expiresAt}
                  onChange={handleInputChange}
                  className="input-field"
                  min={new Date().toISOString().slice(0, 16)}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Leave empty for no expiration
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="work, social, marketing (comma separated)"
                  className="input-field"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 dark:bg-red-900 p-3 rounded">
                {error}
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.originalUrl}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (editingLink ? 'Updating...' : 'Creating...') : (editingLink ? 'Update Link' : 'Create Link')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
