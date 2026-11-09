-- Permite que o admin veja e atualize qualquer perfil (inclusive inativos)
-- Usa auth.email() para evitar permission denied em auth.users

DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;

CREATE POLICY "profiles_select_admin"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.email() = 'leonardomenegol@gmail.com');

CREATE POLICY "profiles_update_admin"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.email() = 'leonardomenegol@gmail.com')
  WITH CHECK (auth.email() = 'leonardomenegol@gmail.com');
