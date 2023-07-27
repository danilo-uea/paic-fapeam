CREATE TABLE mensagem (
 id SERIAL PRIMARY KEY,
 valores TEXT NOT null,
 data_hora_criacao TIMESTAMP DEFAULT NOW()
);

insert into mensagem (valores) values ('alan;1we:123');
select count(*) from mensagem m ;
select * from mensagem m order by m.id desc;

--delete from mensagem ;
--drop table mensagem;