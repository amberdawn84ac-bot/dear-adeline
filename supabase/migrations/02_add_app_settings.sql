-- Migration: Add app_settings for global configuration
create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamp with time zone default now()
);

-- Seed initial theme settings
insert into public.app_settings (key, value) 
values ('theme', '{"primaryColor": "#87A878", "fontSize": "16px", "fontFamily": "Inter"}'::jsonb)
on conflict (key) do nothing;
