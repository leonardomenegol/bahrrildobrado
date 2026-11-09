import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, User, Mail, Lock, Phone, BookOpen, Camera } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { PONTA_POSITIONS, MEIO_POSITIONS, POSITION_LABELS, SOCIETIES, type Position } from '../types'
import toast from 'react-hot-toast'

const STEPS = ['conta', 'perfil', 'posicoes', 'foto'] as const
type Step = typeof STEPS[number]

export default function Signup() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('conta')
  const [loading, setLoading] = useState(false)

  // Account
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Profile
  const [name, setName] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [society, setSociety] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [bio, setBio] = useState('')

  // Positions
  const [positions, setPositions] = useState<Position[]>([])

  // Photo
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  function togglePosition(pos: Position) {
    if (pos === 'ANY') {
      setPositions(['ANY'])
      return
    }
    setPositions(prev => {
      const withoutAny = prev.filter(p => p !== 'ANY')
      if (withoutAny.includes(pos)) return withoutAny.filter(p => p !== pos)
      return [...withoutAny, pos]
    })
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Foto deve ter menos de 5MB')
      return
    }
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  function validateStep(): boolean {
    if (step === 'conta') {
      if (!email || !password || !confirmPassword) {
        toast.error('Preencha todos os campos')
        return false
      }
      if (password.length < 6) {
        toast.error('Senha deve ter pelo menos 6 caracteres')
        return false
      }
      if (password !== confirmPassword) {
        toast.error('Senhas não coincidem')
        return false
      }
    }
    if (step === 'perfil') {
      if (!name || !displayName || !society || !whatsapp) {
        toast.error('Preencha todos os campos obrigatórios')
        return false
      }
      const digits = whatsapp.replace(/\D/g, '')
      if (digits.length < 10 || digits.length > 11) {
        toast.error('WhatsApp inválido (DDD + número)')
        return false
      }
    }
    if (step === 'posicoes') {
      if (positions.length === 0) {
        toast.error('Selecione pelo menos uma posição')
        return false
      }
    }
    return true
  }

  function nextStep() {
    if (!validateStep()) return
    const idx = STEPS.indexOf(step)
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1])
  }

  function prevStep() {
    const idx = STEPS.indexOf(step)
    if (idx > 0) setStep(STEPS[idx - 1])
  }

  async function handleSubmit() {
    if (!validateStep()) return
    setLoading(true)
    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({ email, password })
      if (authError) throw authError
      if (!authData.user) throw new Error('Erro ao criar conta')

      // 2. Upload photo if provided
      let photoUrl: string | null = null
      if (photoFile) {
        const ext = photoFile.name.split('.').pop()
        const path = `${authData.user.id}/avatar.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(path, photoFile, { upsert: true })
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
          photoUrl = urlData.publicUrl
        }
      }

      // 3. Create profile
      const { error: profileError } = await supabase.from('profiles').insert({
        user_id: authData.user.id,
        name,
        display_name: displayName,
        society,
        whatsapp: whatsapp.replace(/\D/g, ''),
        photo_url: photoUrl,
        bio: bio || null,
        positions,
        is_active: true,
      })
      if (profileError) throw profileError

      toast.success('Conta criada com sucesso! 🎉')
      navigate('/discover')
    } catch (err: any) {
      if (err.message?.includes('already registered')) {
        toast.error('Este e-mail já está cadastrado.')
      } else {
        toast.error(err.message || 'Erro ao criar conta')
      }
    } finally {
      setLoading(false)
    }
  }

  const stepIndex = STEPS.indexOf(step)
  const progress = ((stepIndex + 1) / STEPS.length) * 100

  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0D0D2E 0%, #1a0030 50%, #0D1A3A 100%)' }}
    >
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          {stepIndex > 0 ? (
            <button onClick={prevStep} className="text-white/60 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <Link to="/" className="text-white/60 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          )}
          <div className="flex-1">
            <div className="flex justify-between text-xs text-white/50 mb-1">
              <span>Passo {stepIndex + 1} de {STEPS.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #FF1493, #FF6B35)' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
        </div>

        {/* Card */}
        <div
          className="rounded-3xl p-6 sm:p-8"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.15)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <AnimatePresence mode="wait">
            {step === 'conta' && (
              <motion.div
                key="conta"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-4"
              >
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">🔐</div>
                  <h2 className="text-2xl font-black" style={{ fontFamily: "'Fredoka One', cursive", color: '#FFD700' }}>
                    Cria tua conta
                  </h2>
                  <p className="text-white/50 text-sm mt-1">Primeiro passo para achar sua dupla!</p>
                </div>

                <Field label="E-mail" icon={<Mail className="w-4 h-4" />}>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="seu@email.com" className="field-input" />
                </Field>
                <Field label="Senha" icon={<Lock className="w-4 h-4" />}>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres" className="field-input" />
                </Field>
                <Field label="Confirmar senha" icon={<Lock className="w-4 h-4" />}>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Repita a senha" className="field-input" />
                </Field>

                <p className="text-center text-white/40 text-xs">
                  Já tem conta?{' '}
                  <Link to="/login" style={{ color: '#FF1493' }} className="font-bold">Entrar</Link>
                </p>
              </motion.div>
            )}

            {step === 'perfil' && (
              <motion.div
                key="perfil"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-4"
              >
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">👤</div>
                  <h2 className="text-2xl font-black" style={{ fontFamily: "'Fredoka One', cursive", color: '#FF6B35' }}>
                    Seu perfil
                  </h2>
                  <p className="text-white/50 text-sm mt-1">Como você vai aparecer para os outros</p>
                </div>

                <Field label="Nome completo *" icon={<User className="w-4 h-4" />}>
                  <input type="text" value={name} onChange={e => setName(e.target.value)}
                    placeholder="Nome Completo" className="field-input" />
                </Field>
                <Field label="Como quer ser chamado(a)? *" icon={<User className="w-4 h-4" />}>
                  <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
                    placeholder="Apelido ou nome" className="field-input" />
                </Field>
                <Field label="Sociedade de debates *" icon={<BookOpen className="w-4 h-4" />}>
                  <select value={society} onChange={e => setSociety(e.target.value)} className="field-input field-select">
                    <option value="">Selecione sua sociedade</option>
                    {SOCIETIES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="WhatsApp (com DDD) *" icon={<Phone className="w-4 h-4" />}>
                  <input type="tel" value={whatsapp} onChange={e => setWhatsapp(e.target.value)}
                    placeholder="11987654321" className="field-input" />
                </Field>
                <div>
                  <label className="block text-sm font-semibold text-white/70 mb-2">Apresentação (opcional)</label>
                  <textarea
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    placeholder="Fala um pouco sobre você, seu estilo de debate..."
                    rows={3}
                    maxLength={300}
                    className="w-full px-4 py-3 rounded-xl text-white placeholder-white/30 outline-none resize-none text-sm"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
                  />
                  <p className="text-right text-xs text-white/30 mt-1">{bio.length}/300</p>
                </div>
              </motion.div>
            )}

            {step === 'posicoes' && (
              <motion.div
                key="posicoes"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="text-center mb-6">
                  <div className="text-4xl mb-2">🏛️</div>
                  <h2 className="text-2xl font-black" style={{ fontFamily: "'Fredoka One', cursive", color: '#00BFFF' }}>
                    Suas posições
                  </h2>
                  <p className="text-white/50 text-sm mt-1">Em quais funções você debate?</p>
                </div>

                <div className="space-y-4">
                  <PositionGroup
                    title="🎤 Pontas / Primeiras falas"
                    positions={PONTA_POSITIONS}
                    selected={positions}
                    onToggle={togglePosition}
                    color="#FF6B35"
                  />
                  <PositionGroup
                    title="🎯 Meios / Segundas falas"
                    positions={MEIO_POSITIONS}
                    selected={positions}
                    onToggle={togglePosition}
                    color="#00BFFF"
                  />
                  <motion.button
                    type="button"
                    onClick={() => togglePosition('ANY')}
                    className="w-full py-3 rounded-xl font-bold text-sm transition-all"
                    style={{
                      background: positions.includes('ANY')
                        ? 'linear-gradient(135deg, #BF00FF, #FF1493)'
                        : 'rgba(255,255,255,0.08)',
                      border: `2px solid ${positions.includes('ANY') ? '#BF00FF' : 'rgba(255,255,255,0.2)'}`,
                      color: 'white',
                    }}
                    whileTap={{ scale: 0.97 }}
                  >
                    ✨ Tanto faz — aceito qualquer posição
                  </motion.button>
                </div>

                {positions.length > 0 && !positions.includes('ANY') && (
                  <p className="text-center text-xs text-white/40 mt-3">
                    {positions.some(p => PONTA_POSITIONS.includes(p as any)) &&
                     positions.some(p => MEIO_POSITIONS.includes(p as any))
                      ? '✅ Compatível com pontas e meios'
                      : positions.some(p => PONTA_POSITIONS.includes(p as any))
                      ? '🎤 Você vai aparecer para quem busca meios'
                      : '🎯 Você vai aparecer para quem busca pontas'}
                  </p>
                )}
              </motion.div>
            )}

            {step === 'foto' && (
              <motion.div
                key="foto"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col items-center gap-6"
              >
                <div className="text-center">
                  <div className="text-4xl mb-2">📸</div>
                  <h2 className="text-2xl font-black" style={{ fontFamily: "'Fredoka One', cursive", color: '#39FF14' }}>
                    Sua foto
                  </h2>
                  <p className="text-white/50 text-sm mt-1">Deixa a galera te reconhecer!</p>
                </div>

                <label className="cursor-pointer group">
                  <div
                    className="w-40 h-40 rounded-full overflow-hidden flex items-center justify-center transition-all group-hover:scale-105"
                    style={{
                      background: photoPreview ? 'transparent' : 'rgba(255,255,255,0.08)',
                      border: `3px dashed ${photoPreview ? '#39FF14' : 'rgba(255,255,255,0.3)'}`,
                    }}
                  >
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <Camera className="w-10 h-10 text-white/30 mx-auto mb-2" />
                        <p className="text-white/30 text-xs">Clique para<br />adicionar foto</p>
                      </div>
                    )}
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                </label>

                {photoPreview && (
                  <button
                    type="button"
                    onClick={() => { setPhotoFile(null); setPhotoPreview(null) }}
                    className="text-sm text-white/40 hover:text-white/70 transition-colors"
                  >
                    Remover foto
                  </button>
                )}

                <p className="text-white/30 text-xs text-center">
                  Opcional · Máx. 5MB · JPG, PNG ou GIF
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation buttons */}
          <div className="flex gap-3 mt-6">
            {stepIndex > 0 && (
              <motion.button
                onClick={prevStep}
                className="flex-1 py-3 rounded-xl font-semibold text-white/70 text-sm"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
                whileTap={{ scale: 0.97 }}
              >
                ← Voltar
              </motion.button>
            )}
            {step !== 'foto' ? (
              <motion.button
                onClick={nextStep}
                className="flex-1 py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #FF1493, #FF6B35)' }}
                whileTap={{ scale: 0.97 }}
              >
                Próximo <ArrowRight className="w-4 h-4" />
              </motion.button>
            ) : (
              <motion.button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 py-3 rounded-xl font-black text-white disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #39FF14, #00BFFF)', color: '#000' }}
                whileTap={{ scale: loading ? 1 : 0.97 }}
              >
                {loading ? '⏳ Criando...' : '🎉 Criar conta!'}
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-white/70 mb-2">{label}</label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">{icon}</div>
        <div className="[&>input]:w-full [&>input]:pl-11 [&>input]:pr-4 [&>input]:py-3 [&>input]:rounded-xl [&>input]:text-white [&>input]:placeholder-white/30 [&>input]:outline-none [&>input]:text-sm"
          style={{ '--input-bg': 'rgba(255,255,255,0.08)' } as any}
        >
          <style>{`
            .field-input {
              background: rgba(255,255,255,0.08);
              border: 1px solid rgba(255,255,255,0.15);
            }
            .field-input:focus {
              border-color: #FF1493;
              box-shadow: 0 0 0 2px rgba(255,20,147,0.2);
            }
          `}</style>
          {children}
        </div>
      </div>
    </div>
  )
}

function PositionGroup({
  title, positions: posOptions, selected, onToggle, color
}: {
  title: string
  positions: Position[]
  selected: Position[]
  onToggle: (p: Position) => void
  color: string
}) {
  return (
    <div>
      <p className="text-xs font-bold mb-2" style={{ color }}>{title}</p>
      <div className="grid grid-cols-2 gap-2">
        {posOptions.map(pos => {
          const isSelected = selected.includes(pos)
          return (
            <motion.button
              key={pos}
              type="button"
              onClick={() => onToggle(pos)}
              className="py-2 px-3 rounded-xl text-sm font-semibold transition-all text-left"
              style={{
                background: isSelected ? `${color}20` : 'rgba(255,255,255,0.06)',
                border: `2px solid ${isSelected ? color : 'rgba(255,255,255,0.15)'}`,
                color: isSelected ? color : 'rgba(255,255,255,0.7)',
              }}
              whileTap={{ scale: 0.95 }}
            >
              {POSITION_LABELS[pos]}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
