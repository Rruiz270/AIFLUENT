import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="w-16 h-16 rounded-2xl bg-sky-100 flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-sky-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        </div>
        <h2 className="text-4xl font-bold text-gray-900 mb-2">404</h2>
        <p className="text-lg font-medium text-gray-700 mb-1">Pagina nao encontrada</p>
        <p className="text-sm text-gray-500 mb-6">
          A pagina que voce procura nao existe ou foi movida.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-white text-sm font-medium rounded-xl transition-colors"
        >
          Voltar ao inicio
        </Link>
      </div>
    </div>
  )
}
