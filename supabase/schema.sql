-- ============================================================
-- Match de Duplas — Script SQL completo para o Supabase
-- Execute no SQL Editor do painel do Supabase
-- ============================================================

-- Extensão para UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABELA: profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  display_name  TEXT NOT NULL,
  society       TEXT NOT NULL,
  whatsapp      TEXT NOT NULL,
  photo_url     TEXT,
  bio           TEXT,
  positions     TEXT[] NOT NULL DEFAULT '{}',
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT profiles_society_valid CHECK (society IN (
    'GDO','SDS','Independente','Senatus','SDP','UFRJ',
    'Ágora','Octógono','UFC','GEDE','UFSC','SdD UNIFOR',
    'SDDTB','Hermenêutica'
  ))
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_profiles_user_id  ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON public.profiles(is_active);

-- ============================================================
-- TABELA: swipes
-- ============================================================
CREATE TABLE IF NOT EXISTS public.swipes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  swiper_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  decision    TEXT NOT NULL CHECK (decision IN ('like', 'pass')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Um usuário só pode swipe uma vez por alvo
  CONSTRAINT swipes_unique UNIQUE (swiper_id, target_id),
  -- Não pode swipe em si mesmo
  CONSTRAINT swipes_no_self CHECK (swiper_id != target_id)
);

CREATE INDEX IF NOT EXISTS idx_swipes_swiper ON public.swipes(swiper_id);
CREATE INDEX IF NOT EXISTS idx_swipes_target ON public.swipes(target_id);
CREATE INDEX IF NOT EXISTS idx_swipes_like_lookup ON public.swipes(swiper_id, target_id, decision);

-- ============================================================
-- TABELA: matches
-- ============================================================
CREATE TABLE IF NOT EXISTS public.matches (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_1_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_2_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Garante que user_1_id < user_2_id (sem duplicatas invertidas)
  CONSTRAINT matches_ordered CHECK (user_1_id < user_2_id),
  CONSTRAINT matches_unique UNIQUE (user_1_id, user_2_id),
  -- Não pode dar match consigo mesmo
  CONSTRAINT matches_no_self CHECK (user_1_id != user_2_id)
);

CREATE INDEX IF NOT EXISTS idx_matches_user1 ON public.matches(user_1_id);
CREATE INDEX IF NOT EXISTS idx_matches_user2 ON public.matches(user_2_id);

-- ============================================================
-- FUNÇÃO: atualiza updated_at automaticamente
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swipes   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches  ENABLE ROW LEVEL SECURITY;

-- ---------- profiles ----------

-- Qualquer usuário autenticado pode ver perfis ativos
CREATE POLICY "profiles_select_active"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (is_active = TRUE);

-- Usuário só cria/edita/deleta o próprio perfil
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "profiles_delete_own"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ---------- swipes ----------

-- Usuário pode ver apenas seus próprios swipes
CREATE POLICY "swipes_select_own"
  ON public.swipes FOR SELECT
  TO authenticated
  USING (
    swiper_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    OR
    target_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

-- Usuário só pode criar swipe de seu próprio perfil
CREATE POLICY "swipes_insert_own"
  ON public.swipes FOR INSERT
  TO authenticated
  WITH CHECK (
    swiper_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

-- ---------- matches ----------

-- Usuário pode ver matches em que participa
CREATE POLICY "matches_select_participant"
  ON public.matches FOR SELECT
  TO authenticated
  USING (
    user_1_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    OR
    user_2_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

-- Apenas o sistema cria matches (via upsert do usuário que deu o segundo like)
CREATE POLICY "matches_insert_authenticated"
  ON public.matches FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);

-- ============================================================
-- STORAGE: bucket avatars (execute separadamente se necessário)
-- ============================================================
-- No painel do Supabase → Storage → New bucket → avatars (público)
-- Ou via SQL:
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Política de storage: usuário só faz upload na própria pasta
CREATE POLICY "avatars_insert_own"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "avatars_update_own"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "avatars_select_public"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');
