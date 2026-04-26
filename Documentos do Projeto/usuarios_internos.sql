-- Cadastro de usuarios internos do Qmesa.
-- Aplicar no Supabase antes de usar o cadastro pelo dashboard.
-- Observacao: este projeto academico ainda usa senha em texto puro para manter o fluxo atual.
-- Em producao, trocar para hash/bcrypt e restringir as politicas de RLS.

create extension if not exists "uuid-ossp";

create table if not exists public.usuario (
  id uuid primary key default uuid_generate_v4(),
  restaurante_id uuid not null references public.restaurante(id) on delete cascade,
  usuario varchar(100) not null unique,
  senha varchar(255) not null,
  role varchar(20) not null default 'operador',
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  constraint usuario_role_check check (role in ('admin', 'gestor', 'operador'))
);

alter table public.usuario
  add column if not exists restaurante_id uuid references public.restaurante(id) on delete cascade,
  add column if not exists usuario varchar(100),
  add column if not exists senha varchar(255),
  add column if not exists role varchar(20) default 'operador',
  add column if not exists ativo boolean default true,
  add column if not exists criado_em timestamptz default now();

alter table public.usuario
  alter column restaurante_id set not null,
  alter column usuario set not null,
  alter column senha set not null,
  alter column role set not null,
  alter column ativo set not null,
  alter column criado_em set not null;

create unique index if not exists usuario_usuario_key on public.usuario(usuario);
create index if not exists idx_usuario_restaurante on public.usuario(restaurante_id);
create index if not exists idx_usuario_role on public.usuario(role);

alter table public.usuario enable row level security;

drop policy if exists "usuario_crud_publico_dev" on public.usuario;
create policy "usuario_crud_publico_dev"
on public.usuario
for all
to anon, authenticated
using (true)
with check (true);

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

insert into public.usuario (restaurante_id, usuario, senha, role, ativo)
values
  ('00000000-0000-0000-0000-000000000001', 'admin_qmesa', 'admin123', 'admin', true),
  ('00000000-0000-0000-0000-000000000001', 'gestor_mangalhos', '123456', 'gestor', true),
  ('00000000-0000-0000-0000-000000000001', 'operador_mangalhos', '123456', 'operador', true)
on conflict (usuario) do nothing;
