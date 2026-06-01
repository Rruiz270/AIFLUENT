'use client' // Error boundaries must be Client Components

import { useEffect } from 'react'

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-100 flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-rose-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Algo deu errado</h2>
        <p className="text-sm text-gray-500 mb-6">
          {error.message || 'Ocorreu um erro inesperado. Tente novamente.'}
        </p>
        <button
          onClick={() => unstable_retry()}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-white text-sm font-medium rounded-xl transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  )
}
