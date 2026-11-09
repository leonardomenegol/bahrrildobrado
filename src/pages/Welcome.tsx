import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, Zap, Music } from 'lucide-react'

const stickers = [
  { emoji: '⭐', x: '5%', y: '10%', size: '2rem', delay: 0 },
  { emoji: '💚', x: '88%', y: '8%', size: '2.5rem', delay: 0.3 },
  { emoji: '🌟', x: '3%', y: '55%', size: '1.8rem', delay: 0.6 },
  { emoji: '🎵', x: '90%', y: '45%', size: '2rem', delay: 0.2 },
  { emoji: '💫', x: '15%', y: '80%', size: '1.5rem', delay: 0.8 },
  { emoji: '🌈', x: '80%', y: '75%', size: '2.2rem', delay: 0.4 },
  { emoji: '✨', x: '45%', y: '5%', size: '1.6rem', delay: 1 },
  { emoji: '🎤', x: '92%', y: '20%', size: '1.8rem', delay: 0.7 },
  { emoji: '🏆', x: '8%', y: '30%', size: '1.7rem', delay: 0.5 },
  { emoji: '📢', x: '70%', y: '88%', size: '1.8rem', delay: 0.9 },
]

export default function Welcome() {
  return (
    <div className="min-h-dvh relative overflow-hidden flex flex-col items-center justify-center px-4"
      style={{
        background: 'linear-gradient(135deg, #0D0D2E 0%, #1a0030 30%, #0D1A3A 60%, #001A1A 100%)',
      }}
    >
      {/* Animated background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute rounded-full opacity-20 blur-3xl"
          style={{ width: 400, height: 400, background: '#FF1493', top: '-10%', left: '-10%' }}
          animate={{ scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute rounded-full opacity-20 blur-3xl"
          style={{ width: 350, height: 350, background: '#00BFFF', bottom: '-5%', right: '-5%' }}
          animate={{ scale: [1, 1.3, 1], x: [0, -20, 0], y: [0, -30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
        <motion.div
          className="absolute rounded-full opacity-15 blur-3xl"
          style={{ width: 300, height: 300, background: '#FFD700', top: '40%', left: '30%' }}
          animate={{ scale: [1, 1.1, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* Floating stickers */}
      {stickers.map((s, i) => (
        <motion.div
          key={i}
          className="absolute sticker select-none"
          style={{ left: s.x, top: s.y, fontSize: s.size }}
          animate={{ y: [0, -15, 0], rotate: [-5, 5, -5] }}
          transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: 'easeInOut', delay: s.delay }}
        >
          {s.emoji}
        </motion.div>
      ))}

      {/* Main content */}
      <motion.div
        className="relative z-10 text-center max-w-md w-full"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        {/* Logo */}
        <motion.div
          className="mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
        >
          <div className="inline-flex items-center justify-center gap-3 mb-2">
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Heart className="w-12 h-12 fill-current" style={{ color: '#FF1493' }} />
            </motion.div>
            <Zap className="w-8 h-8" style={{ color: '#FFD700' }} />
            <Music className="w-10 h-10" style={{ color: '#00BFFF' }} />
          </div>

          <h1
            className="text-5xl sm:text-6xl font-black leading-none mb-1"
            style={{
              fontFamily: "'Fredoka One', cursive",
              background: 'linear-gradient(135deg, #FF1493, #FF6B35, #FFD700)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: 'none',
              filter: 'drop-shadow(0 0 20px rgba(255,20,147,0.4))',
            }}
          >
            Match de
          </h1>
          <h1
            className="text-5xl sm:text-6xl font-black leading-none"
            style={{
              fontFamily: "'Fredoka One', cursive",
              background: 'linear-gradient(135deg, #00BFFF, #BF00FF, #FF1493)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 20px rgba(0,191,255,0.4))',
            }}
          >
            Duplas
          </h1>
        </motion.div>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <p
            className="text-xl sm:text-2xl font-bold mb-2"
            style={{
              fontFamily: "'Fredoka One', cursive",
              color: '#FFD700',
              textShadow: '0 0 20px rgba(255,215,0,0.5)',
            }}
          >
            ✨ Sua dupla perfeita tá por aí! ✨
          </p>
          <p className="text-white/70 text-sm sm:text-base mb-8">
            Campeonato de Debates • Parlamentar Britânico
          </p>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          className="flex flex-wrap gap-2 justify-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          {['🧉 GDO', '🌴 SDS', '💬 WhatsApp direto'].map((f, i) => (
            <span
              key={i}
              className="px-3 py-1 rounded-full text-xs font-semibold"
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                color: 'white',
              }}
            >
              {f}
            </span>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Link to="/signup">
            <motion.button
              className="btn-y2k w-full py-4 rounded-2xl font-black text-xl text-white shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, #FF1493, #FF6B35)',
                boxShadow: '0 8px 32px rgba(255,20,147,0.4), 0 2px 8px rgba(0,0,0,0.3)',
                fontFamily: "'Fredoka One', cursive",
                letterSpacing: '0.05em',
              }}
              whileHover={{ scale: 1.03, boxShadow: '0 12px 40px rgba(255,20,147,0.6)' }}
              whileTap={{ scale: 0.97 }}
            >
              💚 Quero encontrar minha dupla!
            </motion.button>
          </Link>

          <Link to="/login">
            <motion.button
              className="btn-y2k w-full py-3 rounded-2xl font-bold text-base"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '2px solid rgba(255,255,255,0.3)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                fontFamily: "'Nunito', sans-serif",
              }}
              whileHover={{ scale: 1.02, background: 'rgba(255,255,255,0.15)' }}
              whileTap={{ scale: 0.98 }}
            >
              Já tenho cadastro → Entrar
            </motion.button>
          </Link>
        </motion.div>

        {/* Fun quote */}
        <motion.p
          className="mt-8 text-white/40 text-xs italic"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          "Será que vai rolar química na bancada?" 🎤
        </motion.p>
      </motion.div>

      {/* Bottom wave decoration */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(255,20,147,0.05), transparent)',
        }}
      />
    </div>
  )
}
