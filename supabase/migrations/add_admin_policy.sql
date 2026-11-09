-- Permite que o admin veja e atualize qualquer perfil (inclusive inativos)
-- Troque 'leonardomenegol@gmail.com' pelo email do admin se necessário

CREATE POLICY "profiles_select_admin"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'leonardomenegol@gmail.com'
  );

CREATE POLICY "profiles_update_admin"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'leonardomenegol@gmail.com'
  )
  WITH CHECK (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'leonardomenegol@gmail.com'
  );
