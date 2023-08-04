CREATE TABLE mensagem (
 id SERIAL PRIMARY KEY,
 valores TEXT NOT null,
 data_hora_criacao TIMESTAMP DEFAULT NOW()
);

--delete from mensagem ;
--drop table mensagem;

--insert into mensagem (valores) values ('alan;1we:123');
select count(*) from mensagem m ;
select * from mensagem m order by m.id desc;

--31/07/2023
select count(*) 
from mensagem m 
where DATE(m.data_hora_criacao) = '2023-07-31';
-----
select * 
from mensagem m 
where DATE(m.data_hora_criacao) = '2023-07-31' 
order by m.id asc;

--04/08/2023
select count(*) 
from mensagem m 
where DATE(m.data_hora_criacao) = '2023-08-04';
-----
select * 
from mensagem m 
where DATE(m.data_hora_criacao) = '2023-08-04' 
order by m.id desc;