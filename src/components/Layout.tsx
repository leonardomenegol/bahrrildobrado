import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import BottomNav from './BottomNav'
import { motion } from 'framer-motion'

export function ProtectedLayout() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <motion.div
          className="text-5xl"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          💫
        </motion.div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  return (
    <div
      className="min-h-dvh flex flex-col"
      style={{
        background: 'linear-gradient(180deg, #0D0D2E 0%, #0D1A2E 100%)',
      }}
    >
      <div className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  )
}

export function PublicLayout() {
  return <Outlet />
}
