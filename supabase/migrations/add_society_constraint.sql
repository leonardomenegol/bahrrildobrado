-- Migração: adicionar constraint de sociedades válidas
-- Execute no SQL Editor do Supabase se o schema já foi aplicado anteriormente

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_society_valid
  CHECK (society IN (
    'GDO','SDS','Independente','Senatus','SDP','UFRJ',
    'Ágora','Octógono','UFC','GEDE','UFSC','SdD UNIFOR',
    'SDDTB','Hermenêutica'
  ));
