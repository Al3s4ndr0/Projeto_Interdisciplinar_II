-- Uso temporario para desenvolvimento local.
-- Permite CRUD anonimo em item_cardapio enquanto o login interno ainda nao usa Supabase Auth/JWT.
-- Nao usar em producao.

alter table public.item_cardapio enable row level security;

drop policy if exists "cardapio_leitura_publica" on public.item_cardapio;
drop policy if exists "cardapio_escrita_gestor" on public.item_cardapio;
drop policy if exists "item_cardapio_select_dev" on public.item_cardapio;
drop policy if exists "item_cardapio_insert_dev" on public.item_cardapio;
drop policy if exists "item_cardapio_update_dev" on public.item_cardapio;
drop policy if exists "item_cardapio_delete_dev" on public.item_cardapio;

create policy "item_cardapio_select_dev"
on public.item_cardapio
for select
using (true);

create policy "item_cardapio_insert_dev"
on public.item_cardapio
for insert
with check (true);

create policy "item_cardapio_update_dev"
on public.item_cardapio
for update
using (true)
with check (true);

create policy "item_cardapio_delete_dev"
on public.item_cardapio
for delete
using (true);
