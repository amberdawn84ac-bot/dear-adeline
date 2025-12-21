-- Migration: Update handle_new_user to use role from metadata
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name, role)
  values (
    new.id, 
    new.email, 
    split_part(new.email, '@', 1),
    coalesce(new.raw_user_meta_data->>'role', 'student')
  );
  return new;
end;
$$ language plpgsql security definer;
