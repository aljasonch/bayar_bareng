-- Seed categories
insert into categories (name, sort_order) values
  ('Coffee', 1),
  ('OG Aren Series', 2),
  ('OATSIDE Series', 3),
  ('Kenangan Frappe', 4),
  ('Chocolate & Sweets', 5),
  ('Tea Blend', 6),
  ('Milk Tea', 7)
on conflict (name) do update set sort_order = excluded.sort_order;

-- Seed menu items
insert into menu_items (name, category_id, price_r, price_l, price_j, has_one_liter, is_barista_choice, is_new, is_limited_time, sort_order) values
  -- Coffee
  ('Kopi Kenangan Mantan', (select id from categories where name = 'Coffee'), 19000, 25000, 35000, true, true, false, false, 1),
  ('Americano', (select id from categories where name = 'Coffee'), 17000, 22000, 29000, true, false, false, false, 2),
  ('Avocado Coffee', (select id from categories where name = 'Coffee'), 28000, 38000, 47000, false, false, false, false, 3),
  ('Butterscotch Aren Latte', (select id from categories where name = 'Coffee'), 20000, 27000, 36000, false, false, false, false, 4),
  ('Butterscotch Sea Salt Latte', (select id from categories where name = 'Coffee'), 25000, 33000, 42000, false, false, false, false, 5),
  ('Cappuccino', (select id from categories where name = 'Coffee'), 22000, 29000, 38000, false, false, false, false, 6),
  ('Caramel Macchiato', (select id from categories where name = 'Coffee'), 28000, 38000, 47000, true, true, false, false, 7),
  ('Creamy Aren Latte', (select id from categories where name = 'Coffee'), 22000, 31000, 40000, false, false, false, false, 8),
  ('Creamy Caramel Latte', (select id from categories where name = 'Coffee'), 26000, 33000, 43000, false, false, false, false, 9),
  ('Dua Shot Iced Shaken', (select id from categories where name = 'Coffee'), 28000, 38000, 47000, false, false, false, false, 10),
  ('Kopi Susu Black Aren', (select id from categories where name = 'Coffee'), 21000, 30000, 39000, true, false, false, false, 11),
  ('Latte', (select id from categories where name = 'Coffee'), 22000, 29000, 38000, true, true, false, false, 12),
  ('Matcha Espresso', (select id from categories where name = 'Coffee'), 26000, 35000, 45000, true, false, false, false, 13),
  ('Mocha Latte', (select id from categories where name = 'Coffee'), 28000, 38000, 47000, false, true, false, false, 14),
  ('Spanish Latte', (select id from categories where name = 'Coffee'), 19000, 27000, 36000, false, true, false, false, 15),
  ('Vanilla/Hazelnut/Caramel Latte', (select id from categories where name = 'Coffee'), 26000, 34000, 43000, false, false, false, false, 16),
  -- OG Aren Series
  ('OG Aren Speculoos Latte', (select id from categories where name = 'OG Aren Series'), 21000, 28000, null, false, false, false, false, 17),
  ('Dua Shot OG Aren', (select id from categories where name = 'OG Aren Series'), 25000, 32000, null, false, false, false, false, 18),
  -- OATSIDE Series
  ('Oatside Kopi Kenangan Mantan', (select id from categories where name = 'OATSIDE Series'), 22000, 28000, 38000, true, false, false, false, 19),
  ('Oatside Latte', (select id from categories where name = 'OATSIDE Series'), 25000, 32000, 41000, true, false, false, false, 20),
  ('Oatside Matcha Latte', (select id from categories where name = 'OATSIDE Series'), 25000, 32000, 42000, true, false, false, false, 21),
  -- Kenangan Frappe
  ('Kopi Kenangan Mantan Frappe', (select id from categories where name = 'Kenangan Frappe'), 27000, 34000, null, false, false, false, false, 22),
  ('Dutch Choco Kenangan Frappe', (select id from categories where name = 'Kenangan Frappe'), 29000, 36000, null, false, false, false, false, 23),
  ('Vanilla Kenangan Frappe', (select id from categories where name = 'Kenangan Frappe'), 25000, 32000, null, false, false, false, false, 24),
  -- Chocolate & Sweets
  ('Avocado Milk', (select id from categories where name = 'Chocolate & Sweets'), 24000, 34000, 43000, false, false, false, false, 25),
  ('Avocado Caramel', (select id from categories where name = 'Chocolate & Sweets'), 28000, 38000, 47000, false, false, false, false, 26),
  ('Caramel Dutch Choco', (select id from categories where name = 'Chocolate & Sweets'), 28000, 38000, 47000, false, false, false, false, 27),
  ('Dutch Chocolate', (select id from categories where name = 'Chocolate & Sweets'), 26000, 36000, 45000, false, false, false, false, 28),
  ('Hazelnut Dutch Choco', (select id from categories where name = 'Chocolate & Sweets'), 28000, 38000, 47000, false, false, false, false, 29),
  ('Matcha Latte', (select id from categories where name = 'Chocolate & Sweets'), 25000, 32000, 42000, true, false, false, false, 30),
  ('Milo Dinosaurus', (select id from categories where name = 'Chocolate & Sweets'), 23000, 30000, 38000, false, false, false, false, 31),
  ('Oreo Shake', (select id from categories where name = 'Chocolate & Sweets'), 26000, 34000, 44000, false, true, false, false, 32),
  -- Tea Blend
  ('Earl Grey Tea', (select id from categories where name = 'Tea Blend'), 15000, 19000, 26000, false, false, false, false, 33),
  ('Lemon Black Tea', (select id from categories where name = 'Tea Blend'), 17000, 24000, 31000, false, false, false, false, 34),
  ('Raspberry Hibiscus', (select id from categories where name = 'Tea Blend'), 20000, 27000, 34000, false, false, false, false, 35),
  -- Milk Tea
  ('Earl Grey Milk Tea', (select id from categories where name = 'Milk Tea'), 19000, 25000, 32000, false, false, false, false, 36),
  ('Hazelnut Choco Milk Tea', (select id from categories where name = 'Milk Tea'), 22000, 29000, 36000, false, false, false, false, 37),
  ('Kenangan Milk Tea', (select id from categories where name = 'Milk Tea'), 21000, 27000, 34000, false, false, false, false, 38),
  ('Thai Tea', (select id from categories where name = 'Milk Tea'), 22000, 29000, null, true, false, false, false, 39);

-- Seed modifier groups
insert into modifier_groups (name, sort_order) values
  ('Upgrade', 1),
  ('Syrup', 2),
  ('Add-ons', 3)
on conflict (name) do update set sort_order = excluded.sort_order;

-- Seed modifiers
insert into modifiers (group_id, name, type, price, sort_order) values
  -- Upgrade
  ((select id from modifier_groups where name = 'Upgrade'), 'Juwara Beans', 'upgrade', 3000, 1),
  ((select id from modifier_groups where name = 'Upgrade'), 'OATSIDE', 'upgrade', 3000, 2),
  -- Syrup
  ((select id from modifier_groups where name = 'Syrup'), 'Butterscotch', 'syrup', 6000, 1),
  ((select id from modifier_groups where name = 'Syrup'), 'Caramel', 'syrup', 6000, 2),
  ((select id from modifier_groups where name = 'Syrup'), 'Chocolate Sauce', 'syrup', 6000, 3),
  ((select id from modifier_groups where name = 'Syrup'), 'Hazelnut', 'syrup', 6000, 4),
  ((select id from modifier_groups where name = 'Syrup'), 'Salted Caramel Sauce', 'syrup', 6000, 5),
  ((select id from modifier_groups where name = 'Syrup'), 'Vanilla', 'syrup', 6000, 6),
  -- Add-ons
  ((select id from modifier_groups where name = 'Add-ons'), 'Golden Boba', 'addon', 6000, 1),
  ((select id from modifier_groups where name = 'Add-ons'), 'Grass Jelly', 'addon', 6000, 2),
  ((select id from modifier_groups where name = 'Add-ons'), 'Oreo', 'addon', 6000, 3),
  ((select id from modifier_groups where name = 'Add-ons'), 'Coffee Jelly', 'addon', 6000, 4),
  ((select id from modifier_groups where name = 'Add-ons'), 'Kenangan Blend Shot', 'addon', 6000, 5),
  ((select id from modifier_groups where name = 'Add-ons'), 'Juwara Beans Shot', 'addon', 6000, 6),
  ((select id from modifier_groups where name = 'Add-ons'), 'Whipped Cream VanillaChoco', 'addon', 6000, 7);

-- Seed outlet config
insert into outlet_config (key, value) values
  ('mall_adjustment', '2000'::jsonb),
  ('available_sizes', '["R", "L", "J"]'::jsonb)
on conflict (key) do update set value = excluded.value, updated_at = now();
