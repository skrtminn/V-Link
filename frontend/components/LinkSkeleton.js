import { motion } from 'framer-motion'

export default function LinkSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
    >
      <div className="flex items-center space-x-3 flex-1">
        <div className="w-4 h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center space-x-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-24 animate-pulse"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-16 animate-pulse"></div>
          </div>
          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-48 animate-pulse"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-64 animate-pulse"></div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded w-16 animate-pulse"></div>
        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full animate-pulse"></div>
      </div>
    </motion.div>
  )
}
