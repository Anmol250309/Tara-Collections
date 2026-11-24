import { Link } from 'react-router-dom'
import { Home, Search, ArrowLeft } from 'lucide-react'

function NotFound() {
  return (
    <div className="min-h-screen bg-primary-50 flex items-center justify-center pt-28 px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <span className="text-9xl font-bold text-primary-100">404</span>
        </div>
        <h1 className="heading-2 mb-4">Page Not Found</h1>
        <p className="text-body text-dark-500 mb-8">
          Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/" className="btn-primary inline-flex items-center gap-2">
            <Home className="w-5 h-5" />
            Go Home
          </Link>
          <Link to="/shop" className="btn-outline inline-flex items-center gap-2">
            <Search className="w-5 h-5" />
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound