-- Sinh tự động từ index.html bằng make-seed.mjs. Chạy SAU 0001_init.sql và 0002_category.sql.
-- CẢNH BÁO: xoá toàn bộ bài hiện có rồi nạp lại từ app (giai đoạn demo, chưa có dữ liệu thật).
begin;
delete from public.lessons;
with l as (insert into public.lessons (position,title,level,scene_key,category,template,status) values (1,'My Family','A1','family','family','My name is Anna. I live with my {0} in a nice house. My {1} also live with us. Every evening, we eat dinner together and {2} about our day. I love my family {3}.','published') returning id)
insert into public.phrases (lesson_id,idx,base,upgrade,level,vn,example) values
((select id from l),0,'father and mother','parents','A2','a single word for mother and father together','My parents live in Hanoi.'),
((select id from l),1,'sister and brother','siblings','A2','a single word for your brothers and sisters','I have two siblings.'),
((select id from l),2,'talk','chat','A2','a relaxed way to say ''talk''','We chat about our day.'),
((select id from l),3,'very much','a lot','A2','a natural way to say how much you love someone','I miss you a lot.');
with l as (insert into public.lessons (position,title,level,scene_key,category,template,status) values (2,'Best Friend','A1','friends','friends','Do you have a best friend? I do. My best friend is John. We {0} games, food and animals. I am {1} to {2}.','published') returning id)
insert into public.phrases (lesson_id,idx,base,upgrade,level,vn,example) values
((select id from l),0,'like the same things about','have a lot in common, such as','A2','a natural way to say you share interests','We have a lot in common, such as music and movies.'),
((select id from l),1,'so happy','really happy','A2','a more natural way to strengthen ''happy''','I am really happy today.'),
((select id from l),2,'have a friend like him','have such a friend','A2','a shorter way to say ''a friend like him''','I am lucky to have such a friend.');
with l as (insert into public.lessons (position,title,level,scene_key,category,template,status) values (3,'Where is my school?','A1','school','school','Hello, I am Vy and I am a student at a new school. Every morning, I {0} with my best friend. My school is near {1}, so we {2} together {3}. There are many {4} {5}. {6} where my school is?','published') returning id)
insert into public.phrases (lesson_id,idx,base,upgrade,level,vn,example) values
((select id from l),0,'go to school by foot','walk to school','A2','one verb instead of ''go ... by foot''','I walk to work every day.'),
((select id from l),1,'a place where we can have fun','a playground','A2','one word for a place where children play','The kids are at the playground.'),
((select id from l),2,'can play','often play there','A2','tells how often and where','We often play there on Sundays.'),
((select id from l),3,'after we study at school','after school','A2','shorter and more natural','I meet my friends after school.'),
((select id from l),4,'trees','green trees','A2','adds a clear picture','We sat under the green trees.'),
((select id from l),5,'along the way I go to school','along the road to my school','A2','a clearer way to describe the road','There are shops along the road to my house.'),
((select id from l),6,'Do you know','Do you have an idea','A2','a friendly way to ask someone to guess','Do you have an idea where the park is?');
with l as (insert into public.lessons (position,title,level,scene_key,category,template,status) values (4,'Love what you do','A1','work','work','Tom {0} at a small coffee shop. He {1} making drinks for customers. {2} he likes talking with them and {3} love his coffee. When customers {4} the coffee shop, they always feel happy because they can {5}. This is why Tom loves what he does.','published') returning id)
insert into public.phrases (lesson_id,idx,base,upgrade,level,vn,example) values
((select id from l),0,'has a job','works','A2','the usual verb for having a job','My sister works at a bank.'),
((select id from l),1,'likes','enjoys','A2','a warmer way to say ''like''','He enjoys cooking.'),
((select id from l),2,'One more thing is','Also,','A2','a short way to add another point','Also, the food is cheap.'),
((select id from l),3,'people','many customers','A2','names exactly who is talking about it','Many customers come back every week.'),
((select id from l),4,'go to','drop by','A2','a casual way to say visit for a short time','Drop by my house anytime.'),
((select id from l),5,'have good coffee','drink good coffee','A2','''drink'' is the natural verb for coffee','I drink coffee every morning.');
with l as (insert into public.lessons (position,title,level,scene_key,category,template,status) values (5,'My Weekend','A1','weekend','lifestyle','I often {0} early on Saturday mornings. I {1} with my family in the kitchen. And then, I {2}. In the afternoon, I {3} at a supermarket near my house. I {4} my weekend.','published') returning id)
insert into public.phrases (lesson_id,idx,base,upgrade,level,vn,example) values
((select id from l),0,'get up','wake up','A2','a natural way to say you stop sleeping','I wake up at six every day.'),
((select id from l),1,'eat breakfast','have breakfast','A2','''have'' is the common verb for meals','We have breakfast at seven.'),
((select id from l),2,'put my clothes into the washing machine','do laundry','A2','one phrase for washing clothes','I do laundry on Sundays.'),
((select id from l),3,'go and buy things','go shopping','A2','the common phrase for buying things','We go shopping on Saturdays.'),
((select id from l),4,'like','enjoy','A2','a warmer way to say ''like''','I enjoy my weekend.');
with l as (insert into public.lessons (position,title,level,scene_key,category,template,status) values (6,'My Hobbies','A1','hobbies','lifestyle','My name is Anna and I have {0} hobbies. In my {1} time, I {2} listening to music and reading books. On the weekend, I usually play football with my friends in the park. I also like {3} food for my family. {4} makes me happy and relaxed after a busy day.','published') returning id)
insert into public.phrases (lesson_id,idx,base,upgrade,level,vn,example) values
((select id from l),0,'many','a lot of','A2','a more natural way to say ''many''','I have a lot of homework today.'),
((select id from l),1,'free','spare','A2','time when you are not working','I like reading in my spare time.'),
((select id from l),2,'love','enjoy','A2','a calmer way to say you like something','I enjoy walking in the park.'),
((select id from l),3,'cooking good','making delicious','A2','a tastier way to describe good food','She is making delicious cookies.'),
((select id from l),4,'It','All of this','A2','refers to everything just mentioned','All of this makes me feel calm.');
with l as (insert into public.lessons (position,title,level,scene_key,category,template,status) values (7,'Going to School','A1','school','school','I go to school {0}. I get up early in the morning and {1} a big breakfast. {2} I walk to school with my friend. My school is {3} my house. I like my classes and my teachers. School is {4} every day.','published') returning id)
insert into public.phrases (lesson_id,idx,base,upgrade,level,vn,example) values
((select id from l),0,'from Monday to Friday','on weekdays','A2','a shorter way to say the five working days','The shop is open on weekdays.'),
((select id from l),1,'eat','have','A2','a common way to say ''eat a meal''','We have breakfast at seven.'),
((select id from l),2,'Then,','After that,','A2','a natural way to connect two actions','After that, we went home.'),
((select id from l),3,'near','not far from','A2','a softer way to say something is close','The park is not far from here.'),
((select id from l),4,'fun','enjoyable','A2','a more grown-up way to say ''fun''','The trip was very enjoyable.');
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
