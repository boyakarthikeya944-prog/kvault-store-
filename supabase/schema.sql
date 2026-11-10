create extension if not exists pgcrypto;
create table admins (user_id uuid primary key references auth.users on delete cascade);
create function is_admin() returns boolean language sql security definer stable set search_path=public as $$ select exists(select 1 from admins where user_id=auth.uid()) $$;
create table products (id uuid primary key default gen_random_uuid(), slug text unique not null, name text not null, description text default '',
 category text not null check (category in ('tshirts','denim','shirts')), price int not null check (price>0), discount_price int check (discount_price>0),
 images text[] not null default '{}', is_new_drop boolean default false, drop_name text, best_seller boolean default false, hidden boolean default false, created_at timestamptz default now());
create table variants (id uuid primary key default gen_random_uuid(), product_id uuid not null references products on delete cascade, size text not null, color text not null, stock int not null default 0 check (stock>=0), unique(product_id,size,color));
create table orders (id uuid primary key default gen_random_uuid(), name text not null, phone text not null, address text not null, items jsonb not null, total int not null,
 status text not null default 'new' check (status in ('new','confirmed','shipped','delivered','cancelled')), created_at timestamptz default now());
alter table admins enable row level security; alter table products enable row level security; alter table variants enable row level security; alter table orders enable row level security;
create policy "admin reads self" on admins for select using (user_id=auth.uid());
create policy "public reads visible products" on products for select using (not hidden or is_admin());
create policy "admin writes products" on products for all using (is_admin()) with check (is_admin());
create policy "public reads variants" on variants for select using (true);
create policy "admin writes variants" on variants for all using (is_admin()) with check (is_admin());
create policy "admin reads orders" on orders for select using (is_admin());
create policy "admin updates orders" on orders for update using (is_admin()) with check (is_admin());
-- Customers never touch orders directly: they call place_order(), which checks stock and prices on the server.
create function place_order(p_name text, p_phone text, p_address text, p_items jsonb) returns uuid language plpgsql security definer set search_path=public as $$
declare it jsonb; r record; tot int:=0; snap jsonb:='[]'; oid uuid; q int;
begin
 if length(trim(p_name))<2 or length(regexp_replace(p_phone,'\D','','g'))<10 or length(trim(p_address))<10 then raise exception 'Invalid customer details'; end if;
 if jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items)=0 then raise exception 'Cart is empty'; end if;
 for it in select * from jsonb_array_elements(p_items) loop
  q:=(it->>'qty')::int; if q<1 or q>10 then raise exception 'Invalid quantity'; end if;
  update variants set stock=stock-q where id=(it->>'vid')::uuid and stock>=q and product_id in (select id from products where not hidden);
  if not found then raise exception 'Some items are out of stock'; end if;
  select vr.size, vr.color, p.name, coalesce(p.discount_price,p.price) as price into r from variants vr join products p on p.id=vr.product_id where vr.id=(it->>'vid')::uuid;
  tot:=tot+r.price*q; snap:=snap||jsonb_build_object('name',r.name,'size',r.size,'color',r.color,'qty',q,'price',r.price);
 end loop;
 insert into orders(name,phone,address,items,total) values(trim(p_name),trim(p_phone),trim(p_address),snap,tot) returning id into oid; return oid;
end $$;
grant execute on function place_order(text,text,text,jsonb) to anon, authenticated;
insert into storage.buckets (id,name,public) values ('products','products',true) on conflict do nothing;
create policy "admin manages product images" on storage.objects for all using (bucket_id='products' and is_admin()) with check (bucket_id='products' and is_admin());
-- After creating your admin user in Authentication > Users, run (with your email):
-- insert into admins select id from auth.users where email='YOU@EXAMPLE.COM';
