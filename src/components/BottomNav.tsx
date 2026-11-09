import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Compass, Heart, User, Shield } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL

export default function BottomNav() {
  const { user } = useAuth()
  const isAdmin = ADMIN_EMAIL && user?.email === ADMIN_EMAIL

  const links = [
    { to: '/discover', icon: <Compass className="w-5 h-5" />, label: 'Descobrir' },
    { to: '/matches', icon: <Heart className="w-5 h-5" />, label: 'Matches' },
    { to: '/profile', icon: <User className="w-5 h-5" />, label: 'Perfil' },
    ...(isAdmin ? [{ to: '/admin', icon: <Shield className="w-5 h-5" />, label: 'Admin' }] : []),
  ]

  return (
    <nav
      className="sticky bottom-0 left-0 right-0 z-40"
      style={{
        background: 'rgba(13,13,30,0.95)',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(20px)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="flex items-center justify-around max-w-lg mx-auto px-2">
        {links.map(link => (
          <NavLink key={link.to} to={link.to} className="flex-1">
            {({ isActive }) => (
              <motion.div
                className="flex flex-col items-center gap-1 py-3 relative"
                whileTap={{ scale: 0.9 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 rounded-2xl"
                    style={{ background: 'rgba(255,20,147,0.1)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <div
                  style={{ color: isActive ? '#FF1493' : 'rgba(255,255,255,0.35)' }}
                  className="transition-colors relative z-10"
                >
                  {link.icon}
                </div>
                <span
                  className="text-xs font-semibold transition-colors relative z-10"
                  style={{ color: isActive ? '#FF1493' : 'rgba(255,255,255,0.3)' }}
                >
                  {link.label}
                </span>
              </motion.div>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
