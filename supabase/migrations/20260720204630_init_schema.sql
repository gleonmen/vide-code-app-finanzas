-- Personal finance MVP: categories + transactions (income/expense)

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('income', 'expense')),
  -- Tags the two categories that need their own summary rollup (debt vs savings/investment).
  tag text check (tag in ('debt', 'savings_investment')),
  created_at timestamptz not null default now(),
  unique (name, type)
);

create table transactions (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('income', 'expense')),
  name text not null check (char_length(name) <= 159),
  category_id uuid not null references categories(id),
  amount numeric(12, 2) not null check (amount > 0),
  frequency text not null check (frequency in ('monthly', 'semiannual', 'annual')),
  essentiality text not null check (essentiality in ('essential', 'non_essential')),
  created_at timestamptz not null default now()
);

create index transactions_category_id_idx on transactions(category_id);

insert into categories (name, type, tag) values
  ('Salario', 'income', null),
  ('Arriendos', 'income', null),
  ('Inversiones', 'income', null),
  ('Hogar', 'expense', null),
  ('Comida', 'expense', null),
  ('Transporte', 'expense', null),
  ('Creditos o deudas', 'expense', 'debt'),
  ('Entretenimiento', 'expense', null),
  ('Impuestos o pagos programados', 'expense', null),
  ('Auto', 'expense', null),
  ('Ahorros e inversiones', 'expense', 'savings_investment'),
  ('Familia', 'expense', null);

-- MVP is single-user local/dev: open policies so the anon key can read/write.
alter table categories enable row level security;
alter table transactions enable row level security;

create policy "categories_all" on categories for all using (true) with check (true);
create policy "transactions_all" on transactions for all using (true) with check (true);

grant select, insert, update, delete on categories to anon, authenticated;
grant select, insert, update, delete on transactions to anon, authenticated;
