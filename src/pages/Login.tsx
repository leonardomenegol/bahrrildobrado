import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      navigate('/discover')
    } catch (err: any) {
      toast.error(err.message === 'Invalid login credentials'
        ? 'E-mail ou senha incorretos.'
        : err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center px-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0D0D2E 0%, #1a0030 50%, #0D1A3A 100%)' }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 text-4xl opacity-20 animate-float">🌟</div>
        <div className="absolute bottom-20 right-10 text-4xl opacity-20 animate-float" style={{ animationDelay: '1s' }}>💫</div>
        <div className="absolute top-1/2 left-5 text-3xl opacity-10 animate-float" style={{ animationDelay: '0.5s' }}>⭐</div>
      </div>

      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Link to="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Voltar</span>
        </Link>

        <div
          className="rounded-3xl p-8"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.15)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          }}
        >
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">👋</div>
            <h1
              className="text-3xl font-black mb-1"
              style={{
                fontFamily: "'Fredoka One', cursive",
                background: 'linear-gradient(135deg, #FF1493, #FF6B35)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Bem-vindo(a) de volta!
            </h1>
            <p className="text-white/50 text-sm">Partiu encontrar tua dupla? 🎤</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-semibold text-white/70 mb-2">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl text-white placeholder-white/30 outline-none focus:ring-2 transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    // @ts-ignore
                    '--tw-ring-color': '#FF1493',
                  }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/70 mb-2">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3 rounded-xl text-white placeholder-white/30 outline-none focus:ring-2 transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-black text-lg text-white mt-2 disabled:opacity-60"
              style={{
                background: 'linear-gradient(135deg, #FF1493, #FF6B35)',
                fontFamily: "'Fredoka One', cursive",
                boxShadow: '0 4px 20px rgba(255,20,147,0.3)',
              }}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              {loading ? '⏳ Entrando...' : '💚 Entrar'}
            </motion.button>
          </form>

          <p className="text-center text-white/50 text-sm mt-6">
            Novo por aqui?{' '}
            <Link to="/signup" className="font-bold" style={{ color: '#FF1493' }}>
              Criar conta
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
