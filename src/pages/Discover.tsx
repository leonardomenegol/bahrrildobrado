import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, X, RefreshCw, Frown } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getDiscoverProfiles, recordSwipe } from '../lib/api'
import type { Profile } from '../types'
import SwipeCard from '../components/SwipeCard'
import MatchModal from '../components/MatchModal'
import toast from 'react-hot-toast'

export default function Discover() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [candidates, setCandidates] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [matchData, setMatchData] = useState<{ matched: boolean; matchedProfile?: Profile } | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const loadCandidates = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const profiles = await getDiscoverProfiles(user.id)
      setCandidates(profiles)
      setCurrentIndex(0)
    } catch (err) {
      toast.error('Erro ao carregar perfis')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadCandidates()
  }, [loadCandidates])

  const currentProfile = candidates[currentIndex]
  const nextProfile = candidates[currentIndex + 1]

  async function handleSwipe(direction: 'left' | 'right') {
    if (!profile || !currentProfile || actionLoading) return
    setActionLoading(true)
    const decision = direction === 'right' ? 'like' : 'pass'
    setCurrentIndex(prev => prev + 1)
    try {
      const result = await recordSwipe(profile.id, currentProfile.id, decision)
      if (result.matched) {
        setMatchData({ matched: true, matchedProfile: currentProfile })
      }
    } catch (err) {
      toast.error('Erro ao registrar ação')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <motion.div
            className="text-5xl mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            💫
          </motion.div>
          <p className="text-white/50">Carregando perfis compatíveis...</p>
        </motion.div>
      </div>
    )
  }

  const hasProfiles = currentIndex < candidates.length

  return (
    <div className="flex-1 flex flex-col items-center px-4 py-4 max-w-sm mx-auto w-full">
      {/* Header */}
      <div className="w-full text-center mb-3">
        <h1
          className="text-2xl font-black"
          style={{
            fontFamily: "'Fredoka One', cursive",
            background: 'linear-gradient(135deg, #FF1493, #FF6B35)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Descobrir Duplas
        </h1>
        {hasProfiles && (
          <p className="text-white/40 text-xs mt-1">
            {candidates.length - currentIndex} perfis compatíveis
          </p>
        )}
      </div>

      {/* Card area — altura fixa para garantir visibilidade */}
      <div className="w-full mb-4" style={{ height: 460 }}>
        {hasProfiles ? (
          <div className="relative w-full h-full">
            {/* Card de trás */}
            {nextProfile && (
              <div
                className="absolute inset-0 rounded-3xl overflow-hidden"
                style={{ transform: 'translateY(8px) scale(0.97)', zIndex: 1 }}
              >
                <SwipeCard profile={nextProfile} onSwipe={() => {}} isTop={false} />
              </div>
            )}
            {/* Card do topo */}
            <AnimatePresence>
              <div
                className="absolute inset-0"
                style={{ zIndex: 2 }}
                key={currentProfile.id}
              >
                <SwipeCard profile={currentProfile} onSwipe={handleSwipe} isTop={true} />
              </div>
            </AnimatePresence>
          </div>
        ) : (
          <motion.div
            className="flex items-center justify-center h-full"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="text-center px-6">
              <Frown className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3
                className="text-xl font-black text-white mb-2"
                style={{ fontFamily: "'Fredoka One', cursive" }}
              >
                Ainda não rolou match?
              </h3>
              <p className="text-white/40 text-sm mb-6">
                Continua procurando! Por enquanto não tem mais perfis compatíveis disponíveis.
              </p>
              <motion.button
                onClick={loadCandidates}
                className="flex items-center gap-2 mx-auto px-6 py-3 rounded-2xl font-semibold text-white"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCw className="w-4 h-4" />
                Verificar novos perfis
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Action buttons */}
      {hasProfiles && (
        <div className="flex items-center justify-center gap-6 w-full">
          <motion.button
            onClick={() => handleSwipe('left')}
            disabled={actionLoading}
            className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg disabled:opacity-50"
            style={{
              background: 'rgba(255,20,147,0.15)',
              border: '3px solid #FF1493',
              boxShadow: '0 4px 20px rgba(255,20,147,0.3)',
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-8 h-8" style={{ color: '#FF1493' }} />
          </motion.button>

          <motion.button
            onClick={() => handleSwipe('right')}
            disabled={actionLoading}
            className="w-20 h-20 rounded-full flex items-center justify-center shadow-xl disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #39FF14, #00BFFF)',
              boxShadow: '0 8px 30px rgba(57,255,20,0.4)',
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Heart className="w-10 h-10 fill-current text-black" />
          </motion.button>

          <div className="w-16 h-16" />
        </div>
      )}

      {/* Match modal */}
      {matchData?.matched && matchData.matchedProfile && profile && (
        <MatchModal
          myProfile={profile}
          matchedProfile={matchData.matchedProfile}
          onClose={() => setMatchData(null)}
          onViewMatches={() => { setMatchData(null); navigate('/matches') }}
        />
      )}
    </div>
  )
}
