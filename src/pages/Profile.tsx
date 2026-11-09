import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Camera, User, LogOut, Trash2, Save } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { POSITION_LABELS, SOCIETIES, type Position, type DebateLevel } from '../types'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [displayName, setDisplayName] = useState(profile?.display_name ?? '')
  const [society, setSociety] = useState(profile?.society ?? '')
  const [whatsapp, setWhatsapp] = useState(profile?.whatsapp ?? '')
  const [bio, setBio] = useState(profile?.bio ?? '')
  const [positions, setPositions] = useState<Position[]>(profile?.positions ?? [])
  const [level, setLevel] = useState<DebateLevel>((profile?.level as DebateLevel) ?? 'Open')
  const [photoPreview, setPhotoPreview] = useState<string | null>(profile?.photo_url ?? null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  function togglePosition(pos: Position) {
    if (pos === 'ANY') { setPositions(['ANY']); return }
    setPositions(prev => {
      const withoutAny = prev.filter(p => p !== 'ANY')
      return withoutAny.includes(pos) ? withoutAny.filter(p => p !== pos) : [...withoutAny, pos]
    })
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Foto deve ter menos de 5MB'); return }
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  async function handleSave() {
    if (!profile || !user) return
    if (!displayName || !society || !whatsapp) { toast.error('Preencha todos os campos obrigatórios'); return }
    if (positions.length === 0) { toast.error('Selecione pelo menos uma posição'); return }
    if (!positions.includes('ANY')) {
      if (!positions.includes('PM') && !positions.includes('DPM'))
        return void toast.error('Selecione PM ou Adjunto de Governo (DPM)')
      if (!positions.includes('LO') && !positions.includes('DLO'))
        return void toast.error('Selecione LO ou Adjunto de Oposição (DLO)')
      if (!positions.includes('MG') && !positions.includes('GW'))
        return void toast.error('Selecione Extensão de Governo (MG) ou Whip de Governo (GW)')
      if (!positions.includes('MO') && !positions.includes('OW'))
        return void toast.error('Selecione Extensão de Oposição (MO) ou Whip de Oposição (OW)')
    }

    setSaving(true)
    try {
      let photoUrl = profile.photo_url

      if (photoFile) {
        const ext = photoFile.name.split('.').pop()
        const path = `${user.id}/avatar.${ext}`
        const { error: uploadError } = await supabase.storage.from('avatars').upload(path, photoFile, { upsert: true })
        if (!uploadError) {
          const { data } = supabase.storage.from('avatars').getPublicUrl(path)
          photoUrl = data.publicUrl
        }
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName,
          society,
          whatsapp: whatsapp.replace(/\D/g, ''),
          bio: bio || null,
          positions,
          level,
          photo_url: photoUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)

      if (error) throw error
      await refreshProfile()
      toast.success('Perfil atualizado! ✨')
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/')
  }

  async function handleDeleteAccount() {
    if (!profile || !user) return
    try {
      await supabase.from('profiles').update({ is_active: false }).eq('user_id', user.id)
      await supabase.auth.signOut()
      navigate('/')
      toast.success('Conta desativada.')
    } catch (err: any) {
      toast.error(err.message || 'Erro ao excluir conta')
    }
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 max-w-lg mx-auto w-full">
      <div className="text-center mb-6">
        <h1
          className="text-3xl font-black"
          style={{
            fontFamily: "'Fredoka One', cursive",
            background: 'linear-gradient(135deg, #BF00FF, #FF1493)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Meu Perfil ✨
        </h1>
      </div>

      {/* Photo */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative">
          <div
            className="w-28 h-28 rounded-full overflow-hidden"
            style={{ border: '3px solid #FF1493', boxShadow: '0 0 20px rgba(255,20,147,0.3)' }}
          >
            {photoPreview ? (
              <img src={photoPreview} alt="Foto" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <User className="w-12 h-12 text-white/30" />
              </div>
            )}
          </div>
          <motion.button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: '#FF1493' }}
            whileTap={{ scale: 0.9 }}
          >
            <Camera className="w-4 h-4 text-white" />
          </motion.button>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
        <p className="text-white/30 text-xs mt-2">Clique no ícone para trocar a foto</p>
      </div>

      {/* Form */}
      <div
        className="rounded-2xl p-5 flex flex-col gap-4 mb-4"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <FormField label="Como quer ser chamado(a) *">
          <input
            type="text"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            className="profile-input"
            placeholder="Seu apelido"
          />
        </FormField>
        <FormField label="Sociedade de debates *">
          <select
            value={society}
            onChange={e => setSociety(e.target.value)}
            className="profile-input profile-select"
          >
            <option value="">Selecione sua sociedade</option>
            {SOCIETIES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </FormField>
        <FormField label="WhatsApp (com DDD) *">
          <input
            type="tel"
            value={whatsapp}
            onChange={e => setWhatsapp(e.target.value)}
            className="profile-input"
            placeholder="11987654321"
          />
        </FormField>
        <div>
          <label className="block text-xs font-semibold text-white/60 mb-1.5">Categoria *</label>
          <div className="grid grid-cols-2 gap-3">
            {(['Open', 'Novice'] as DebateLevel[]).map(lvl => (
              <motion.button
                key={lvl}
                type="button"
                onClick={() => setLevel(lvl)}
                className="py-2.5 rounded-xl font-bold text-sm transition-all"
                style={{
                  background: level === lvl
                    ? lvl === 'Open' ? 'rgba(255,215,0,0.15)' : 'rgba(57,255,20,0.15)'
                    : 'rgba(255,255,255,0.06)',
                  border: `2px solid ${level === lvl
                    ? lvl === 'Open' ? '#FFD700' : '#39FF14'
                    : 'rgba(255,255,255,0.15)'}`,
                  color: level === lvl
                    ? lvl === 'Open' ? '#FFD700' : '#39FF14'
                    : 'rgba(255,255,255,0.5)',
                }}
                whileTap={{ scale: 0.95 }}
              >
                {lvl === 'Open' ? '🏆 Open' : '🌱 Novice'}
              </motion.button>
            ))}
          </div>
        </div>
        <FormField label="Apresentação">
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            className="profile-input resize-none"
            rows={3}
            maxLength={300}
            placeholder="Conte um pouco sobre você..."
          />
        </FormField>
      </div>

      {/* Positions */}
      <div
        className="rounded-2xl p-5 mb-4"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <p className="text-sm font-bold text-white/70 mb-3">Posições *</p>
        <div className="space-y-5">
          {/* Primeiras bancadas */}
          <div>
            <p className="text-xs font-bold mb-2" style={{ color: '#FF6B35' }}>🥇 Primeiras bancadas</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-2">
                <PositionBtn pos="PM"  selected={positions} onToggle={togglePosition} color="#FF6B35" />
                <PositionBtn pos="DPM" selected={positions} onToggle={togglePosition} color="#FF6B35" />
              </div>
              <div className="flex flex-col gap-2">
                <PositionBtn pos="LO"  selected={positions} onToggle={togglePosition} color="#FF6B35" />
                <PositionBtn pos="DLO" selected={positions} onToggle={togglePosition} color="#FF6B35" />
              </div>
            </div>
          </div>
          {/* Segundas bancadas */}
          <div>
            <p className="text-xs font-bold mb-2" style={{ color: '#00BFFF' }}>🥈 Segundas bancadas</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-2">
                <PositionBtn pos="MG" selected={positions} onToggle={togglePosition} color="#00BFFF" />
                <PositionBtn pos="GW" selected={positions} onToggle={togglePosition} color="#00BFFF" />
              </div>
              <div className="flex flex-col gap-2">
                <PositionBtn pos="MO" selected={positions} onToggle={togglePosition} color="#00BFFF" />
                <PositionBtn pos="OW" selected={positions} onToggle={togglePosition} color="#00BFFF" />
              </div>
            </div>
          </div>
          <PositionBtn pos="ANY" selected={positions} onToggle={togglePosition} color="#BF00FF" fullWidth />
        </div>
      </div>

      {/* Save button */}
      <motion.button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-4 rounded-2xl font-black text-white mb-4 disabled:opacity-60 flex items-center justify-center gap-2"
        style={{
          background: 'linear-gradient(135deg, #FF1493, #FF6B35)',
          fontFamily: "'Fredoka One', cursive",
          fontSize: '1.1rem',
        }}
        whileTap={{ scale: 0.97 }}
      >
        <Save className="w-5 h-5" />
        {saving ? 'Salvando...' : 'Salvar alterações'}
      </motion.button>

      {/* Logout */}
      <motion.button
        onClick={handleLogout}
        className="w-full py-3 rounded-2xl font-semibold text-white/60 mb-3 flex items-center justify-center gap-2"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
        whileTap={{ scale: 0.97 }}
      >
        <LogOut className="w-4 h-4" />
        Sair da conta
      </motion.button>

      {/* Delete account */}
      {!showDeleteConfirm ? (
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="w-full text-xs text-white/20 hover:text-red-400 transition-colors py-2"
        >
          Excluir minha conta
        </button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-4 text-center"
          style={{ background: 'rgba(255,20,147,0.1)', border: '1px solid rgba(255,20,147,0.3)' }}
        >
          <p className="text-white/70 text-sm mb-3">Tem certeza? Sua conta será desativada.</p>
          <div className="flex gap-3">
            <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2 rounded-xl text-sm text-white/50" style={{ background: 'rgba(255,255,255,0.1)' }}>
              Cancelar
            </button>
            <button onClick={handleDeleteAccount} className="flex-1 py-2 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-1" style={{ background: '#FF1493' }}>
              <Trash2 className="w-4 h-4" />
              Confirmar
            </button>
          </div>
        </motion.div>
      )}

      <style>{`
        .profile-input {
          width: 100%;
          padding: 10px 14px;
          border-radius: 12px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          color: white;
          font-size: 0.9rem;
          outline: none;
          transition: border-color 0.2s;
        }
        .profile-input:focus {
          border-color: #FF1493;
        }
        .profile-input::placeholder {
          color: rgba(255,255,255,0.3);
        }
      `}</style>
    </div>
  )
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-white/60 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function PositionBtn({ pos, selected, onToggle, color, fullWidth }: {
  pos: Position; selected: Position[]; onToggle: (p: Position) => void; color: string; fullWidth?: boolean
}) {
  const isSelected = selected.includes(pos)
  return (
    <motion.button
      type="button"
      onClick={() => onToggle(pos)}
      className={`py-2 px-3 rounded-xl text-xs font-semibold text-left transition-all ${fullWidth ? 'col-span-2 w-full' : ''}`}
      style={{
        background: isSelected ? `${color}20` : 'rgba(255,255,255,0.06)',
        border: `2px solid ${isSelected ? color : 'rgba(255,255,255,0.15)'}`,
        color: isSelected ? color : 'rgba(255,255,255,0.6)',
      }}
      whileTap={{ scale: 0.95 }}
    >
      {POSITION_LABELS[pos]}
    </motion.button>
  )
}
