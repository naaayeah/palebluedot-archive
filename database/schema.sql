-- Planets table
create table if not exists planets (
  id text primary key,
  name text not null,
  subtitle text,
  description text,
  distance text,
  question_prompt text,
  video_url text,
  is_visible boolean default true,
  created_at timestamptz default now()
);

-- Planet messages
create table if not exists planet_messages (
  id uuid primary key default gen_random_uuid(),
  planet_id text not null references planets(id) on delete cascade,
  content text not null,
  is_hidden boolean default false,
  created_at timestamptz default now()
);

-- Planet photos
create table if not exists planet_photos (
  id uuid primary key default gen_random_uuid(),
  planet_id text not null references planets(id) on delete cascade,
  image_url text not null,
  storage_path text,
  is_hidden boolean default false,
  created_at timestamptz default now()
);

-- Visitor tracking
create table if not exists visitor_logs (
  id uuid primary key default gen_random_uuid(),
  page text not null,
  visited_at timestamptz default now()
);

-- Indexes for performance
create index if not exists planet_messages_planet_id_idx on planet_messages(planet_id);
create index if not exists planet_messages_created_at_idx on planet_messages(created_at desc);
create index if not exists planet_messages_hidden_idx on planet_messages(is_hidden);
create index if not exists planet_photos_planet_id_idx on planet_photos(planet_id);
create index if not exists planet_photos_hidden_idx on planet_photos(is_hidden);
create index if not exists visitor_logs_visited_at_idx on visitor_logs(visited_at desc);

-- Row Level Security
alter table planets enable row level security;
alter table planet_messages enable row level security;
alter table planet_photos enable row level security;
alter table visitor_logs enable row level security;

-- Public read policies (only visible/non-hidden content)
create policy "Public can read visible planets"
  on planets for select
  using (is_visible = true);

create policy "Public can read visible messages"
  on planet_messages for select
  using (is_hidden = false);

create policy "Public can read visible photos"
  on planet_photos for select
  using (is_hidden = false);

-- Public can insert messages and photos
create policy "Public can insert messages"
  on planet_messages for insert
  with check (true);

create policy "Public can insert photos"
  on planet_photos for insert
  with check (true);

-- Public can insert visitor logs
create policy "Public can insert visitor logs"
  on visitor_logs for insert
  with check (true);

-- Public can read visitor logs count (for stats display)
create policy "Public can read visitor logs"
  on visitor_logs for select
  using (true);

-- Storage bucket for planet photos (run separately in Supabase dashboard)
-- insert into storage.buckets (id, name, public) values ('planet-photos', 'planet-photos', true);
