-- Corrige RLS: usuário pode sempre ver o próprio perfil (mesmo se inativo)
-- A policy existente "profiles_select_active" só retorna perfis ativos,
-- bloqueando o próprio usuário de carregar seus dados após ser desativado.

-- Adiciona policy separada para o próprio usuário
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
