import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Heart, Shield, ToggleLeft, ToggleRight, User, AlertTriangle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL

interface Stats {
  totalProfiles: number
  activeProfiles: number
  totalMatches: number
  totalSwipes: number
}

interface ProfileRow {
  id: string
  display_name: string
  name: string
  society: string
  positions: string[]
  is_active: boolean
  created_at: string
  photo_url: string | null
}

export default function Admin() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState<Stats | null>(null)
  const [profiles, setProfiles] = useState<ProfileRow[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'stats' | 'users'>('stats')

  // Guard: only admin can access
  useEffect(() => {
    if (!ADMIN_EMAIL || user?.email !== ADMIN_EMAIL) {
      navigate('/discover')
    }
  }, [user, navigate])

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [profilesRes, matchesRes, swipesRes] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('matches').select('id', { count: 'exact' }),
        supabase.from('swipes').select('id', { count: 'exact' }),
      ])

      const allProfiles = profilesRes.data ?? []
      setProfiles(allProfiles)
      setStats({
        totalProfiles: allProfiles.length,
        activeProfiles: allProfiles.filter((p: any) => p.is_active).length,
        totalMatches: matchesRes.count ?? 0,
        totalSwipes: swipesRes.count ?? 0,
      })
    } catch (err) {
      toast.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  async function toggleActive(profileId: string, currentState: boolean) {
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: !currentState })
      .eq('id', profileId)
      .select('id')

    if (error) { toast.error('Erro ao atualizar: ' + error.message); return }
    setProfiles(prev => prev.map(p => p.id === profileId ? { ...p, is_active: !currentState } : p))
    toast.success(currentState ? 'Perfil desativado' : 'Perfil ativado')
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <motion.div className="text-4xl" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          💫
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 max-w-2xl mx-auto w-full">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Shield className="w-6 h-6" style={{ color: '#FFD700' }} />
          <h1
            className="text-2xl font-black"
            style={{
              fontFamily: "'Fredoka One', cursive",
              background: 'linear-gradient(135deg, #FFD700, #FF6B35)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Painel Admin
          </h1>
        </div>
        <p className="text-white/40 text-xs">Acesso restrito • {user?.email}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 p-1 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
        {(['stats', 'users'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-2 rounded-xl font-semibold text-sm transition-all"
            style={{
              background: tab === t ? 'rgba(255,255,255,0.15)' : 'transparent',
              color: tab === t ? 'white' : 'rgba(255,255,255,0.4)',
            }}
          >
            {t === 'stats' ? '📊 Estatísticas' : '👥 Participantes'}
          </button>
        ))}
      </div>

      {tab === 'stats' && stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 gap-3"
        >
          {[
            { label: 'Cadastros', value: stats.totalProfiles, icon: <Users className="w-5 h-5" />, color: '#00BFFF' },
            { label: 'Ativos', value: stats.activeProfiles, icon: <User className="w-5 h-5" />, color: '#39FF14' },
            { label: 'Matches', value: stats.totalMatches, icon: <Heart className="w-5 h-5" />, color: '#FF1493' },
            { label: 'Swipes', value: stats.totalSwipes, icon: <AlertTriangle className="w-5 h-5" />, color: '#FFD700' },
          ].map(s => (
            <div
              key={s.label}
              className="rounded-2xl p-5 text-center"
              style={{ background: `${s.color}15`, border: `1px solid ${s.color}30` }}
            >
              <div style={{ color: s.color }} className="flex justify-center mb-2">{s.icon}</div>
              <p className="text-3xl font-black text-white" style={{ fontFamily: "'Fredoka One', cursive" }}>{s.value}</p>
              <p className="text-white/50 text-xs mt-1">{s.label}</p>
            </div>
          ))}

          <div className="col-span-2 mt-2">
            <motion.button
              onClick={loadData}
              className="w-full py-3 rounded-2xl font-semibold text-sm text-white"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
              whileTap={{ scale: 0.97 }}
            >
              🔄 Atualizar dados
            </motion.button>
          </div>
        </motion.div>
      )}

      {tab === 'users' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-3"
        >
          {profiles.map(p => (
            <div
              key={p.id}
              className="rounded-2xl p-4"
              style={{
                background: p.is_active ? 'rgba(255,255,255,0.05)' : 'rgba(255,20,147,0.05)',
                border: `1px solid ${p.is_active ? 'rgba(255,255,255,0.1)' : 'rgba(255,20,147,0.2)'}`,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0"
                  style={{ border: `2px solid ${p.is_active ? '#39FF14' : '#FF1493'}` }}
                >
                  {p.photo_url ? (
                    <img src={p.photo_url} alt={p.display_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
                      <User className="w-5 h-5 text-white/30" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-sm truncate">{p.display_name}</p>
                  <p className="text-white/40 text-xs truncate">{p.society}</p>
                  <p className="text-white/30 text-xs">{p.positions.join(', ')}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <button
                    onClick={() => toggleActive(p.id, p.is_active)}
                    className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-all"
                    style={{
                      background: p.is_active ? 'rgba(57,255,20,0.15)' : 'rgba(255,20,147,0.15)',
                      color: p.is_active ? '#39FF14' : '#FF1493',
                    }}
                  >
                    {p.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                    {p.is_active ? 'Ativo' : 'Inativo'}
                  </button>
                  <p className="text-white/20 text-xs">
                    {new Date(p.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
