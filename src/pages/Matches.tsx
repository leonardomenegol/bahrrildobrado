import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, User, Heart } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getMatches, buildWhatsAppLink } from '../lib/api'
import type { MatchWithProfile } from '../types'
import { POSITION_SHORT, PONTA_POSITIONS } from '../types'
import toast from 'react-hot-toast'

export default function Matches() {
  const { profile } = useAuth()
  const [matches, setMatches] = useState<MatchWithProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    getMatches(profile.id)
      .then(setMatches)
      .catch(() => toast.error('Erro ao carregar matches'))
      .finally(() => setLoading(false))
  }, [profile])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <motion.div
          className="text-4xl"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          💫
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 max-w-lg mx-auto w-full">
      {/* Header */}
      <div className="text-center mb-6">
        <h1
          className="text-3xl font-black mb-1"
          style={{
            fontFamily: "'Fredoka One', cursive",
            background: 'linear-gradient(135deg, #39FF14, #00BFFF)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Meus Matches 💚
        </h1>
        <p className="text-white/40 text-sm">
          {matches.length === 0
            ? 'Nenhum match ainda — continua deslizando!'
            : `${matches.length} ${matches.length === 1 ? 'match' : 'matches'} encontrado${matches.length === 1 ? '' : 's'}`}
        </p>
      </div>

      {matches.length === 0 ? (
        <motion.div
          className="text-center py-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Heart className="w-20 h-20 text-white/10 mx-auto mb-4" />
          <p
            className="text-xl font-black text-white/30 mb-2"
            style={{ fontFamily: "'Fredoka One', cursive" }}
          >
            Esse discurso tem tudo pra dar certo!
          </p>
          <p className="text-white/20 text-sm">
            Continua descobrindo perfis para encontrar sua dupla perfeita.
          </p>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-3">
          {matches.map((match, i) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <MatchCard match={match} myDisplayName={profile?.display_name ?? ''} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

function MatchCard({ match, myDisplayName }: { match: MatchWithProfile; myDisplayName: string }) {
  const p = match.profile

  function getPositionColor(pos: string) {
    if (PONTA_POSITIONS.includes(pos as any)) return '#FF6B35'
    return '#00BFFF'
  }

  const whatsappLink = buildWhatsAppLink(p.whatsapp, myDisplayName)

  return (
    <motion.div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)',
      }}
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex items-center gap-4 p-4">
        {/* Photo */}
        <div
          className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0"
          style={{
            border: '2px solid #39FF14',
            boxShadow: '0 0 12px rgba(57,255,20,0.3)',
          }}
        >
          {p.photo_url ? (
            <img src={p.photo_url} alt={p.display_name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <User className="w-7 h-7 text-white/40" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3
            className="font-black text-white text-lg leading-tight truncate"
            style={{ fontFamily: "'Fredoka One', cursive" }}
          >
            {p.display_name}
          </h3>
          <p className="text-white/50 text-sm truncate">{p.society}</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {p.positions.includes('ANY') ? (
              <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(191,0,255,0.2)', color: '#BF00FF' }}>
                Tanto faz
              </span>
            ) : (
              p.positions.slice(0, 3).map(pos => (
                <span
                  key={pos}
                  className="text-xs px-2 py-0.5 rounded-full font-bold"
                  style={{ background: `${getPositionColor(pos)}20`, color: getPositionColor(pos) }}
                >
                  {POSITION_SHORT[pos]}
                </span>
              ))
            )}
          </div>
        </div>

        {/* WhatsApp button */}
        <motion.a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-black text-sm"
          style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)' }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <MessageCircle className="w-4 h-4" />
          <span className="hidden sm:inline">WhatsApp</span>
        </motion.a>
      </div>

      {p.bio && (
        <div
          className="px-4 pb-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-white/40 text-xs mt-3 line-clamp-2 italic">"{p.bio}"</p>
        </div>
      )}

      <div className="px-4 pb-3">
        <p className="text-white/20 text-xs">
          Match em {new Date(match.created_at).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
        </p>
      </div>
    </motion.div>
  )
}
