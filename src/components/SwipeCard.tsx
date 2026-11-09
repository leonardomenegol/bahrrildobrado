import { useRef, type ReactNode } from 'react'
import { motion, useMotionValue, useTransform, useAnimation } from 'framer-motion'
import type { Profile } from '../types'
import { POSITION_SHORT, PONTA_POSITIONS, MEIO_POSITIONS } from '../types'
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

  function getPositionColor(pos: string) {
    if (PONTA_POSITIONS.includes(pos as any)) return '#FF6B35'
    if (MEIO_POSITIONS.includes(pos as any)) return '#00BFFF'
    return '#BF00FF'
  }

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
      className="absolute inset-0 swipe-card"
      style={{ x, rotate }}
      animate={controls}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragStart={() => { dragStartX.current = x.get() }}
      onDragEnd={handleDragEnd}
      whileTap={{ cursor: 'grabbing' }}
    >
      {/* Card */}
      <div
        className="w-full h-full rounded-3xl overflow-hidden relative"
        style={{
          background: 'linear-gradient(135deg, #1a1a3e, #0d1a2e)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
        }}
      >
        {/* Photo */}
        <div className="relative h-3/5 overflow-hidden">
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
            style={{ background: 'linear-gradient(to top, rgba(13,13,46,0.9) 0%, transparent 60%)' }}
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

        {/* Info section */}
        <div className="px-5 py-4 flex flex-col gap-3">
          <div>
            <h2
              className="text-2xl font-black text-white leading-tight"
              style={{ fontFamily: "'Fredoka One', cursive" }}
            >
              {profile.display_name}
            </h2>
            <p className="text-white/50 text-sm">{profile.society}</p>
          </div>

          {/* Positions */}
          <div className="flex flex-wrap gap-2">
            {profile.positions.includes('ANY') ? (
              <span
                className="px-3 py-1 rounded-full text-xs font-bold"
                style={{ background: 'rgba(191,0,255,0.2)', border: '1px solid #BF00FF', color: '#BF00FF' }}
              >
                ✨ Tanto faz
              </span>
            ) : (
              profile.positions.map(pos => (
                <span
                  key={pos}
                  className="px-2 py-1 rounded-full text-xs font-bold"
                  style={{
                    background: `${getPositionColor(pos)}20`,
                    border: `1px solid ${getPositionColor(pos)}`,
                    color: getPositionColor(pos),
                  }}
                >
                  {POSITION_SHORT[pos]}
                </span>
              ))
            )}
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-white/60 text-sm leading-relaxed line-clamp-2">
              {profile.bio}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}
