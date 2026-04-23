-- Versao temporaria para o estado atual do projeto.
-- Usa comparacao direta porque a coluna senha esta com valor em texto puro.
-- Quando as senhas voltarem para bcrypt, troque pela versao comentada no fim do arquivo.

create or replace function public.autenticar_usuario(
  p_usuario varchar,
  p_senha varchar
)
returns table (
  id uuid,
  restaurante_id uuid,
  usuario varchar,
  role varchar,
  ativo boolean
)
language sql
security definer
set search_path = public
as $$
  select
    u.id,
    u.restaurante_id,
    u.usuario,
    u.role,
    u.ativo
  from public.usuario u
  where u.usuario = p_usuario
    and u.ativo = true
    and u.senha = p_senha
  limit 1;
$$;

revoke all on function public.autenticar_usuario(varchar, varchar) from public;
grant execute on function public.autenticar_usuario(varchar, varchar) to anon;
grant execute on function public.autenticar_usuario(varchar, varchar) to authenticated;

-- Versao recomendada quando a coluna senha voltar a armazenar bcrypt:
--
-- create extension if not exists pgcrypto;
--
-- create or replace function public.autenticar_usuario(
--   p_usuario varchar,
--   p_senha varchar
-- )
-- returns table (
--   id uuid,
--   restaurante_id uuid,
--   usuario varchar,
--   role varchar,
--   ativo boolean
-- )
-- language sql
-- security definer
-- set search_path = public
-- as $$
--   select
--     u.id,
--     u.restaurante_id,
--     u.usuario,
--     u.role,
--     u.ativo
--   from public.usuario u
--   where u.usuario = p_usuario
--     and u.ativo = true
--     and u.senha::text = extensions.crypt(p_senha::text, u.senha::text)
--   limit 1;
-- $$;
