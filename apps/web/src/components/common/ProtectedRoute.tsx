import { Navigate, Outlet } from 'react-router-dom'
import { useSession } from '@/lib/auth-client'

const ProtectedRoute = () => {
  const { data: session, isPending } = useSession()

  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
