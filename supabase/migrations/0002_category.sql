-- Thêm chủ đề (category) cho bài học: family | friends | school | work | lifestyle | health | tech
alter table public.lessons add column if not exists category text;

update public.lessons set category = 'lifestyle' where title = 'My Hobbies'     and category is null;
update public.lessons set category = 'school'    where title = 'Going to School' and category is null;
update public.lessons set category = 'family'    where title = 'My Family'       and category is null;

alter table public.lessons
  drop constraint if exists lessons_category_check,
  add  constraint lessons_category_check
  check (category is null or category in ('family','friends','school','work','lifestyle','health','tech'));

create index if not exists lessons_category_position on public.lessons(category, position);
