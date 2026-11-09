import { useRef, useState, type ReactNode } from 'react'
import { motion, useMotionValue, useTransform, useAnimation } from 'framer-motion'
import type { Profile } from '../types'
import { getPositionGroups } from '../types'
import { User } from 'lucide-react'

interface SwipeCardProps {
  profile: Profile
  onSwipe: (direction: 'left' | 'right') => void
  children?: ReactNode
  isTop: boolean
}

export default function SwipeCard({ profile, onSwipe, isTop }: SwipeCardProps) {
  const controls = useAnimation()
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 0, 200], [-20, 0, 20])
  const likeOpacity = useTransform(x, [20, 100], [0, 1])
  const nopeOpacity = useTransform(x, [-100, -20], [1, 0])
  const dragStartX = useRef(0)
  const [bioOpen, setBioOpen] = useState(false)

  async function handleDragEnd(_: any, info: { offset: { x: number } }) {
    const threshold = 80
    if (info.offset.x > threshold) {
      await controls.start({ x: 600, opacity: 0, transition: { duration: 0.3 } })
      onSwipe('right')
    } else if (info.offset.x < -threshold) {
      await controls.start({ x: -600, opacity: 0, transition: { duration: 0.3 } })
      onSwipe('left')
    } else {
      controls.start({ x: 0, rotate: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } })
    }
  }

  return (
    <motion.div
      className="w-full h-full swipe-card"
      style={{ x, rotate }}
      animate={controls}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragStart={() => { dragStartX.current = x.get() }}
      onDragEnd={handleDragEnd}
      whileTap={{ cursor: 'grabbing' }}
    >
      <div
        className="w-full h-full rounded-3xl overflow-hidden flex flex-col"
        style={{
          background: 'linear-gradient(135deg, #1a1a3e, #0d1a2e)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
        }}
      >
        {/* Foto — altura fixa */}
        <div className="relative overflow-hidden flex-shrink-0" style={{ height: 280 }}>
          {profile.photo_url ? (
            <img
              src={profile.photo_url}
              alt={profile.display_name}
              className="w-full h-full object-cover"
              draggable={false}
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #1a1a4e, #0d2a3e)' }}
            >
              <User className="w-28 h-28 text-white/20" />
            </div>
          )}

          {/* Gradient overlay */}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, rgba(13,13,46,0.95) 0%, transparent 50%)' }}
          />

          {/* LIKE stamp */}
          <motion.div
            className="absolute top-8 left-8 stamp-like rounded-lg"
            style={{ opacity: likeOpacity }}
          >
            LIKE
          </motion.div>

          {/* NOPE stamp */}
          <motion.div
            className="absolute top-8 right-8 stamp-nope rounded-lg"
            style={{ opacity: nopeOpacity }}
          >
            NOPE
          </motion.div>
        </div>

        {/* Infos */}
        <div className="flex-1 px-5 py-4 flex flex-col gap-2 overflow-hidden">
          <div>
            <h2
              className="text-2xl font-black text-white leading-tight"
              style={{ fontFamily: "'Fredoka One', cursive" }}
            >
              {profile.display_name}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-white/50 text-sm">{profile.society}</p>
              {profile.level && (
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-bold"
                  style={{
                    background: profile.level === 'Open' ? 'rgba(255,215,0,0.15)' : 'rgba(57,255,20,0.15)',
                    border: `1px solid ${profile.level === 'Open' ? '#FFD700' : '#39FF14'}`,
                    color: profile.level === 'Open' ? '#FFD700' : '#39FF14',
                  }}
                >
                  {profile.level === 'Open' ? '🏆 Open' : '🌱 Novice'}
                </span>
              )}
            </div>
          </div>

          {/* Positions */}
          <div className="flex flex-wrap gap-2">
            {getPositionGroups(profile.positions).map(group => (
              <span
                key={group}
                className="px-3 py-1 rounded-full text-xs font-bold"
                style={{
                  background: group === 'Tanto faz'
                    ? 'rgba(191,0,255,0.2)'
                    : group.includes('Ponta')
                    ? 'rgba(255,107,53,0.2)'
                    : group.includes('Meio')
                    ? 'rgba(0,191,255,0.2)'
                    : group.includes('Primeiras')
                    ? 'rgba(255,215,0,0.2)'
                    : 'rgba(57,255,20,0.2)',
                  border: `1px solid ${
                    group === 'Tanto faz' ? '#BF00FF'
                    : group.includes('Ponta') ? '#FF6B35'
                    : group.includes('Meio') ? '#00BFFF'
                    : group.includes('Primeiras') ? '#FFD700'
                    : '#39FF14'
                  }`,
                  color: group === 'Tanto faz' ? '#BF00FF'
                    : group.includes('Ponta') ? '#FF6B35'
                    : group.includes('Meio') ? '#00BFFF'
                    : group.includes('Primeiras') ? '#FFD700'
                    : '#39FF14',
                }}
              >
                {group}
              </span>
            ))}
          </div>

          {/* Bio */}
          {profile.bio && (
            <p
              className="text-white/60 text-sm leading-relaxed line-clamp-2 cursor-pointer hover:text-white/80 transition-colors"
              onClick={e => { e.stopPropagation(); setBioOpen(true) }}
            >
              {profile.bio}
            </p>
          )}
        </div>
      </div>

      {/* Bio modal */}
      {bioOpen && (
        <motion.div
          className="absolute inset-0 z-50 flex items-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setBioOpen(false)}
        >
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />
          <motion.div
            className="relative w-full rounded-t-3xl p-6"
            style={{ background: 'linear-gradient(135deg, #1a1a3e, #0d1a2e)', border: '1px solid rgba(255,255,255,0.15)' }}
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <p className="text-white/40 text-xs mb-3 text-center">Apresentação de {profile.display_name}</p>
            <p className="text-white/80 text-sm leading-relaxed">{profile.bio}</p>
            <button
              onClick={() => setBioOpen(false)}
              className="mt-5 w-full py-2 rounded-xl text-sm text-white/50 font-semibold"
              style={{ background: 'rgba(255,255,255,0.08)' }}
            >
              Fechar
            </button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}
