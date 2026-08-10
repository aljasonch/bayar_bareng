-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Categories
create table categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Menu Items
create table menu_items (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  category_id uuid not null references categories(id) on delete restrict,
  price_r int, -- price in Rupiah (nullable = size not available)
  price_l int,
  price_j int,
  has_one_liter boolean not null default false,
  is_barista_choice boolean not null default false,
  is_new boolean not null default false,
  is_limited_time boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Modifier Groups
create table modifier_groups (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Modifiers
create table modifiers (
  id uuid primary key default uuid_generate_v4(),
  group_id uuid not null references modifier_groups(id) on delete cascade,
  name text not null,
  type text not null, -- 'upgrade', 'syrup', 'addon'
  price int not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Outlet Config (key-value store)
create table outlet_config (
  id uuid primary key default uuid_generate_v4(),
  key text not null unique,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- Enable RLS on all tables
alter table categories enable row level security;
alter table menu_items enable row level security;
alter table modifier_groups enable row level security;
alter table modifiers enable row level security;
alter table outlet_config enable row level security;

-- Policies for categories
create policy "Allow public select" on categories for select using (true);
create policy "Allow auth insert" on categories for insert to authenticated with check (true);
create policy "Allow auth update" on categories for update to authenticated using (true) with check (true);
create policy "Allow auth delete" on categories for delete to authenticated using (true);

-- Policies for menu_items
create policy "Allow public select" on menu_items for select using (true);
create policy "Allow auth insert" on menu_items for insert to authenticated with check (true);
create policy "Allow auth update" on menu_items for update to authenticated using (true) with check (true);
create policy "Allow auth delete" on menu_items for delete to authenticated using (true);

-- Policies for modifier_groups
create policy "Allow public select" on modifier_groups for select using (true);
create policy "Allow auth insert" on modifier_groups for insert to authenticated with check (true);
create policy "Allow auth update" on modifier_groups for update to authenticated using (true) with check (true);
create policy "Allow auth delete" on modifier_groups for delete to authenticated using (true);

-- Policies for modifiers
create policy "Allow public select" on modifiers for select using (true);
create policy "Allow auth insert" on modifiers for insert to authenticated with check (true);
create policy "Allow auth update" on modifiers for update to authenticated using (true) with check (true);
create policy "Allow auth delete" on modifiers for delete to authenticated using (true);

-- Policies for outlet_config
create policy "Allow public select" on outlet_config for select using (true);
create policy "Allow auth insert" on outlet_config for insert to authenticated with check (true);
create policy "Allow auth update" on outlet_config for update to authenticated using (true) with check (true);
create policy "Allow auth delete" on outlet_config for delete to authenticated using (true);
