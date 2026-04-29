-- Liberacao dev para o dashboard master do Qmesa.
-- Este projeto usa autenticacao propria na tabela public.usuario e sessao no navegador,
-- entao policies baseadas em auth.uid() nao conseguem identificar o usuario master.
-- Aplicar no SQL Editor do Supabase se o dashboard mostrar erro de RLS/permissao.

alter table public.restaurante enable row level security;
alter table public.fila_item enable row level security;
alter table public.reserva enable row level security;
alter table public.feedback enable row level security;
alter table public.cliente enable row level security;

drop policy if exists "restaurante_select_dashboard_dev" on public.restaurante;
create policy "restaurante_select_dashboard_dev"
on public.restaurante
for select
to anon, authenticated
using (true);

drop policy if exists "restaurante_insert_dashboard_dev" on public.restaurante;
create policy "restaurante_insert_dashboard_dev"
on public.restaurante
for insert
to anon, authenticated
with check (true);

drop policy if exists "fila_item_select_dashboard_dev" on public.fila_item;
create policy "fila_item_select_dashboard_dev"
on public.fila_item
for select
to anon, authenticated
using (true);

drop policy if exists "reserva_select_dashboard_dev" on public.reserva;
create policy "reserva_select_dashboard_dev"
on public.reserva
for select
to anon, authenticated
using (true);

drop policy if exists "feedback_select_dashboard_dev" on public.feedback;
create policy "feedback_select_dashboard_dev"
on public.feedback
for select
to anon, authenticated
using (true);

drop policy if exists "cliente_select_dashboard_dev" on public.cliente;
create policy "cliente_select_dashboard_dev"
on public.cliente
for select
to anon, authenticated
using (true);
