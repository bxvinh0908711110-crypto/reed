-- Sinh tự động từ index.html bằng make-seed.mjs. Chạy SAU 0001_init.sql và 0002_category.sql.
-- Chế độ thêm (--from=8): chỉ THÊM bài từ vị trí này, không xoá gì.
begin;
with l as (insert into public.lessons (position,title,level,scene_key,category,template,status) values (8,'Good Morning, Good Health','A1','morning','health','Many people do not {0} that a good morning can give them energy for {1}. We {2} people to get up early in the morning and see {3}. They {4} after they get up. They can also drink some water and eat a healthy breakfast. They {5} their day {6} energy.','published') returning id)
insert into public.phrases (lesson_id,idx,base,upgrade,level,vn,example) values
((select id from l),0,'know','realize','A2','to suddenly understand something','I realize I forgot my keys.'),
((select id from l),1,'the afternoon and evening','the rest of the day','A2','everything that is left of today','I felt tired for the rest of the day.'),
((select id from l),2,'tell','advise','A2','to give a helpful suggestion','Doctors advise us to sleep early.'),
((select id from l),3,'the sun come up','the sunrise','A2','one word for the sun coming up','We watched the sunrise from the hill.'),
((select id from l),4,'can have some exercise','do some exercises','A2','the natural way to say you exercise','I do some exercises every morning.'),
((select id from l),5,'start','begin','A2','a slightly more formal way to say ''start''','We begin class at eight.'),
((select id from l),6,'with a lot of','full of','A2','describes something that has plenty','The room is full of people.');
with l as (insert into public.lessons (position,title,level,scene_key,category,template,status) values (9,'Technology In Our Life','A1','tech','tech','Technology is an important part of our {0}. We use our phones to {1} friends and family every day. We also use computers to study, work, and {2} information. Many people {3} or {4} on their phones. Technology helps us do many things more easily.','published') returning id)
insert into public.phrases (lesson_id,idx,base,upgrade,level,vn,example) values
((select id from l),0,'everyday life','daily life','A2','the usual way to say life every day','Phones are part of daily life.'),
((select id from l),1,'contact','stay in touch with','A2','to keep talking to people over time','I stay in touch with my old classmates.'),
((select id from l),2,'find','search for','A2','to look for something on purpose','I search for recipes online.'),
((select id from l),3,'see videos','watch videos','A2','''watch'' is the natural verb for videos','We watch videos after dinner.'),
((select id from l),4,'hear music','listen to music','A2','''listen to'' means you pay attention to sounds','I listen to music on the bus.');
commit;
