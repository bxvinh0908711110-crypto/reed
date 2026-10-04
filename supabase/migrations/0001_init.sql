-- Reed: schema khởi tạo. Chạy trong Supabase SQL Editor (hoặc supabase db push).
-- Mô hình bám đúng engine hiện tại: mỗi bài = 1 "template" có chỗ trống {0},{1}... + danh sách cụm (phrases) theo idx.


-- ---------- Hồ sơ & vai trò ----------
create type public.app_role as enum ('learner', 'editor', 'admin');

create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  full_name   text,
  avatar_url  text,
  role        public.app_role not null default 'learner',
  created_at  timestamptz not null default now()
);

-- Tự tạo profile khi có người đăng nhập lần đầu (Google)
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create function public.is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('editor','admin'));
$$;
create function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin');
$$;

-- ---------- Nội dung ----------
create type public.lesson_status as enum ('draft', 'published', 'archived');

create table public.lessons (
  id          uuid primary key default gen_random_uuid(),
  position    int  not null,                    -- thứ tự hiển thị / thứ tự mở khoá
  title       text not null,                    -- vd "My Hobbies"
  level       text not null default 'A1',
  scene_key   text,                             -- khoá ảnh SVG có sẵn trong app (hobbies, school, family...)
  scene_path  text,                             -- hoặc đường dẫn ảnh trong Storage (bucket "lesson-media")
  template    text not null,                    -- "My name is Anna and I have {0} hobbies..."
  status      public.lesson_status not null default 'draft',
  version     int  not null default 1,          -- tăng mỗi lần sửa nội dung đã xuất bản
  created_by  uuid references public.profiles(id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create unique index lessons_position_published on public.lessons(position) where status = 'published';

create table public.phrases (
  id          uuid primary key default gen_random_uuid(),
  lesson_id   uuid not null references public.lessons(id) on delete cascade,
  idx         int  not null,                    -- khớp {idx} trong template
  base        text not null,                    -- cụm gốc (A1)
  upgrade     text not null,                    -- cụm nâng cấp (A2/B1)
  level       text not null default 'A2',
  vn          text,                             -- giải nghĩa
  example     text,
  unique (lesson_id, idx)
);

create type public.voice_kind as enum ('female', 'male');
create table public.audio_assets (
  id          uuid primary key default gen_random_uuid(),
  lesson_id   uuid not null references public.lessons(id) on delete cascade,
  voice       public.voice_kind not null,
  scope       text not null default 'lesson',   -- 'lesson' | 'phrase:<idx>' | 'sentence:<n>'
  path        text not null,                    -- đường dẫn trong Storage (bucket "lesson-media")
  unique (lesson_id, voice, scope)
);

-- ---------- Dữ liệu học viên ----------
create table public.progress (
  user_id         uuid primary key references public.profiles(id) on delete cascade,
  unlocked_count  int not null default 1,
  updated_at      timestamptz not null default now()
);

create type public.notebook_kind as enum ('word', 'collocation', 'phrase');
create table public.notebook_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  lesson_id   uuid references public.lessons(id) on delete set null,
  base        text not null,
  upgrade     text not null,
  level       text,
  vn          text,
  example     text,
  kind        public.notebook_kind not null default 'phrase',
  created_at  timestamptz not null default now(),
  unique (user_id, base, upgrade)
);

create table public.study_events (
  id          bigint generated always as identity primary key,
  user_id     uuid references public.profiles(id) on delete cascade,
  lesson_id   uuid references public.lessons(id) on delete set null,
  event       text not null check (event in ('lesson_open','step_reach','lesson_complete','phrase_save','audio_play')),
  at          timestamptz not null default now()
);
create index study_events_lesson_at on public.study_events(lesson_id, at);

-- ---------- Row Level Security ----------
alter table public.profiles       enable row level security;
alter table public.lessons        enable row level security;
alter table public.phrases        enable row level security;
alter table public.audio_assets   enable row level security;
alter table public.progress       enable row level security;
alter table public.notebook_items enable row level security;
alter table public.study_events   enable row level security;

-- profiles: tự xem/sửa hồ sơ của mình (không được tự đổi role); admin xem tất cả và đổi role
create policy profiles_self_read   on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy profiles_self_update on public.profiles for update using (id = auth.uid())
  with check (id = auth.uid() and role = (select p.role from public.profiles p where p.id = auth.uid()));
create policy profiles_admin_write on public.profiles for update using (public.is_admin()) with check (public.is_admin());

-- nội dung: ai cũng đọc bài đã xuất bản (kể cả chưa đăng nhập); staff đọc/ghi tất cả
create policy lessons_read_pub   on public.lessons for select using (status = 'published' or public.is_staff());
create policy lessons_staff_all  on public.lessons for all using (public.is_staff()) with check (public.is_staff());

create policy phrases_read   on public.phrases for select using (
  public.is_staff() or exists (select 1 from public.lessons l where l.id = lesson_id and l.status = 'published'));
create policy phrases_staff  on public.phrases for all using (public.is_staff()) with check (public.is_staff());

create policy audio_read   on public.audio_assets for select using (
  public.is_staff() or exists (select 1 from public.lessons l where l.id = lesson_id and l.status = 'published'));
create policy audio_staff  on public.audio_assets for all using (public.is_staff()) with check (public.is_staff());

-- dữ liệu học viên: chỉ chủ sở hữu
create policy progress_own  on public.progress       for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy notebook_own  on public.notebook_items for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- sự kiện học: ai cũng ghi được dòng của mình (hoặc ẩn danh = user_id null); chỉ staff đọc để thống kê
create policy events_insert on public.study_events for insert with check (user_id is null or user_id = auth.uid());
create policy events_staff_read on public.study_events for select using (public.is_staff());

-- ---------- Storage (chạy sau khi tạo bucket "lesson-media" ở Dashboard → Storage, bật Public) ----------
-- create policy media_staff_write on storage.objects for all
--   using (bucket_id = 'lesson-media' and public.is_staff()) with check (bucket_id = 'lesson-media' and public.is_staff());
