-- Sinh tự động từ index.html bằng make-seed.mjs. Chạy SAU 0001_init.sql.
begin;
with l as (insert into public.lessons (position,title,level,scene_key,category,template,status) values (1,'My Hobbies','A1','hobbies','lifestyle','My name is Anna and I have {0} hobbies. In my {1} time, I {2} listening to music and reading books. On the weekend, I usually play football with my friends in the park. I also like {3} food for my family. {4} makes me happy and relaxed after a busy day.','published') returning id)
insert into public.phrases (lesson_id,idx,base,upgrade,level,vn,example) values
((select id from l),0,'many','a lot of','A2','a more natural way to say ''many''','I have a lot of homework today.'),
((select id from l),1,'free','spare','A2','time when you are not working','I like reading in my spare time.'),
((select id from l),2,'love','enjoy','A2','a calmer way to say you like something','I enjoy walking in the park.'),
((select id from l),3,'cooking good','making delicious','A2','a tastier way to describe good food','She is making delicious cookies.'),
((select id from l),4,'It','All of this','A2','refers to everything just mentioned','All of this makes me feel calm.');
with l as (insert into public.lessons (position,title,level,scene_key,category,template,status) values (2,'Going to School','A1','school','school','I go to school {0}. I get up early in the morning and {1} a big breakfast. {2} I walk to school with my friend. My school is {3} my house. I like my classes and my teachers. School is {4} every day.','published') returning id)
insert into public.phrases (lesson_id,idx,base,upgrade,level,vn,example) values
((select id from l),0,'from Monday to Friday','on weekdays','A2','a shorter way to say the five working days','The shop is open on weekdays.'),
((select id from l),1,'eat','have','A2','a common way to say ''eat a meal''','We have breakfast at seven.'),
((select id from l),2,'Then,','After that,','A2','a natural way to connect two actions','After that, we went home.'),
((select id from l),3,'near','not far from','A2','a softer way to say something is close','The park is not far from here.'),
((select id from l),4,'fun','enjoyable','A2','a more grown-up way to say ''fun''','The trip was very enjoyable.');
with l as (insert into public.lessons (position,title,level,scene_key,category,template,status) values (3,'My Family','A1','family','family','I live with {0}, and {1} in a nice house. My dad {2}, and my mom {3}. Every evening, we {4} together in the living room and {5} about our day. I love my family {6}.','published') returning id)
insert into public.phrases (lesson_id,idx,base,upgrade,level,vn,example) values
((select id from l),0,'my mom and dad','my parents','A2','a single word for mother and father together','My parents live in Hanoi.'),
((select id from l),1,'my brother and sister','my siblings','A2','a single word for your brothers and sisters','I have two siblings.'),
((select id from l),2,'works in a hospital','is a doctor','A2','names the job directly','My uncle is a doctor.'),
((select id from l),3,'works in a school','is a teacher','A2','names the job directly','My aunt is a teacher.'),
((select id from l),4,'sit','gather','A2','to come together as a group','We gather every Sunday.'),
((select id from l),5,'talk','chat','A2','a relaxed way to say ''talk''','We chat about our day.'),
((select id from l),6,'very much','so much','A2','a warmer way to say ''very much''','I miss you so much.');
commit;
