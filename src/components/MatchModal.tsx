import { motion, AnimatePresence } from 'framer-motion'
import type { Profile } from '../types'
import { User } from 'lucide-react'

interface MatchModalProps {
  myProfile: Profile
  matchedProfile: Profile
  onClose: () => void
  onViewMatches: () => void
}

export default function MatchModal({ myProfile, matchedProfile, onClose, onViewMatches }: MatchModalProps) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}
        onClick={onClose}
      >
        <motion.div
          className="text-center max-w-sm w-full"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Sparkles */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-2xl pointer-events-none"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${10 + Math.random() * 80}%`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0], y: -60 }}
              transition={{ duration: 1.5, delay: 0.3 + i * 0.1, repeat: 2 }}
            >
              {['✨', '💚', '⭐', '🎉', '💫', '🌟'][i % 6]}
            </motion.div>
          ))}

          {/* Match title */}
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <p className="text-white/70 text-lg font-semibold mb-1">🎊 DEU MATCH!</p>
            <h1
              className="text-5xl font-black"
              style={{
                fontFamily: "'Fredoka One', cursive",
                background: 'linear-gradient(135deg, #39FF14, #00BFFF)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 0 20px rgba(57,255,20,0.5))',
              }}
            >
              💚
            </h1>
            <p className="text-white/70 text-lg font-semibold">Agora é só fechar a dupla!</p>
          </motion.div>

          {/* Profile photos */}
          <motion.div
            className="flex items-center justify-center gap-4 mb-8"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.35, type: 'spring' }}
          >
            <ProfileAvatar profile={myProfile} glowColor="#FF1493" />
            <motion.div
              className="text-4xl"
              animate={{ scale: [1, 1.3, 1], rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.8, delay: 0.6, repeat: 3 }}
            >
              💚
            </motion.div>
            <ProfileAvatar profile={matchedProfile} glowColor="#00BFFF" />
          </motion.div>

          <motion.p
            className="text-white text-xl font-bold mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Você e <span style={{ color: '#FFD700' }}>{matchedProfile.display_name}</span> curtiram um ao outro!
          </motion.p>

          {/* Buttons */}
          <motion.div
            className="flex flex-col gap-3"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <motion.button
              onClick={onViewMatches}
              className="w-full py-3 rounded-2xl font-black text-black"
              style={{
                background: 'linear-gradient(135deg, #39FF14, #00BFFF)',
                fontFamily: "'Fredoka One', cursive",
                fontSize: '1.1rem',
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              💬 Ver meus matches
            </motion.button>
            <motion.button
              onClick={onClose}
              className="w-full py-3 rounded-2xl font-semibold text-white/60"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)' }}
              whileTap={{ scale: 0.97 }}
            >
              Continuar descobrindo
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function ProfileAvatar({ profile, glowColor }: { profile: Profile; glowColor: string }) {
  return (
    <div
      className="w-28 h-28 rounded-full overflow-hidden"
      style={{
        border: `4px solid ${glowColor}`,
        boxShadow: `0 0 20px ${glowColor}60`,
      }}
    >
      {profile.photo_url ? (
        <img src={profile.photo_url} alt={profile.display_name} className="w-full h-full object-cover" />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.1)' }}
        >
          <User className="w-12 h-12 text-white/40" />
        </div>
      )}
    </div>
  )
}
