-- Liberacao temporaria para telas internas de reservas e mesas usando o login atual do Qmesa.
-- Ambiente academico/dev: permite o CRUD pelo anon key nas tabelas mesa e reserva.
-- Em producao, trocar por RPCs security definer ou politicas ligadas ao usuario autenticado real do Supabase.

alter table public.mesa enable row level security;
alter table public.reserva enable row level security;
alter table public.cliente enable row level security;

drop policy if exists "mesa_crud_publico_dev" on public.mesa;
create policy "mesa_crud_publico_dev"
on public.mesa
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "reserva_crud_publico_dev" on public.reserva;
create policy "reserva_crud_publico_dev"
on public.reserva
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "cliente_leitura_publica_dev" on public.cliente;
create policy "cliente_leitura_publica_dev"
on public.cliente
for select
to anon, authenticated
using (true);
