-- Corrige a policy de INSERT em profiles para funcionar com email não confirmado
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Garante que usuários possam ver o próprio perfil mesmo se inativo
DROP POLICY IF EXISTS "profiles_select_active" ON public.profiles;

CREATE POLICY "profiles_select_active"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    is_active = TRUE
    OR user_id = auth.uid()
  );
