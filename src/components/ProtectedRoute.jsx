import { Navigate } from 'react-router-dom'
import { useAuthContext } from '@/hooks/useAuthContext'

export function ProtectedRoute({ children, papeis = [] }) {
    const { isAuthenticated, hasRole } = useAuthContext()

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }
    if (papeis.length > 0 && !hasRole(...papeis)) {
        return <Navigate to="/inicio" replace />
    }
    return children
}

export default ProtectedRoute
