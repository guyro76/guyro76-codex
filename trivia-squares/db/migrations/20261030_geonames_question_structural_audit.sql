-- Automated structural cross-check of GeoNames-derived city-country trivia.
-- THIS IS NOT independent manual fact review. The source dataset is licensed
-- CC BY and supplied as-is; this table records which exact imported city and
-- translated country label match each active question. Game content unchanged.
-- Source: https://www.geonames.org/export/ (GeoNames CC BY attribution).
create table if not exists trivia_squares.geography_question_audit (
 question_id bigint primary key references trivia_squares.questions(id) on delete cascade,
 geonameid bigint not null,
 country_code char(2) not null,
 source_url text not null,
 audit_method text not null,
 checked_answer text not null,
 checked_on date not null default current_date
);
alter table trivia_squares.geography_question_audit enable row level security;
revoke all on trivia_squares.geography_question_audit from public,anon,authenticated;
with parsed as (
 select q.id,q.locale,q.category,q.answers->>q.correct_index as correct_answer,
 case when q.locale='en' then coalesce(substring(q.question from '^The city of (.+) belongs to which country\?$'),substring(q.question from '^Which country contains the city (.+)\?$'),substring(q.question from '^In which country is the city of (.+) located\?$'))
when q.locale='he' then coalesce(substring(q.question from '^באיזו מדינה אפשר למצוא את (.+)\?$'),substring(q.question from '^באיזו מדינה נמצאת העיר (.+)\?$'),substring(q.question from '^העיר (.+) נמצאת באיזו מדינה\?$'))
when q.locale='ru' then coalesce(substring(q.question from '^К какой стране относится город (.+)\?$'),substring(q.question from '^В какой стране находится город (.+)\?$'),substring(q.question from '^Город (.+) расположен в какой стране\?$'))
when q.locale='fr' then coalesce(substring(q.question from '^Dans quel pays se situe (.+) \?$'),substring(q.question from '^Dans quel pays se trouve la ville de (.+) \?$'),substring(q.question from '^La ville de (.+) se situe dans quel pays \?$'))
when q.locale='ar' then coalesce(substring(q.question from '^إلى أي دولة تنتمي مدينة (.+)؟$'),substring(q.question from '^في أي دولة تقع مدينة (.+)؟$'),substring(q.question from '^مدينة (.+) تقع في أي دولة؟$'))
when q.locale='es' then coalesce(substring(q.question from '^¿A qué país pertenece la ciudad de (.+)\?$'),substring(q.question from '^¿En qué país está situada la ciudad de (.+)\?$'),substring(q.question from '^¿En qué país se encuentra la ciudad de (.+)\?$'),substring(q.question from '^¿En qué país está la ciudad de (.+)\?$'),substring(q.question from '^La ciudad de (.+), ¿en qué país se ubica\?$'),substring(q.question from '^¿Qué país tiene una ciudad llamada (.+)\?$'),substring(q.question from '^¿En qué país se encuentra (.+)\?$')) else null end as city
 from trivia_squares.questions q
 where q.active and q.category ~* '(geograph|géograph|географ|الجغراف|גאוגר|geografía)'
), validated as (
 select p.id,p.correct_answer,f.geonameid,f.country_code,
 case p.locale when 'he' then l.he when 'en' then l.en when 'ru' then l.ru
 when 'fr' then l.fr when 'ar' then l.ar when 'es' then l.es end as reference_answer
 from parsed p join trivia_squares.geography_city_facts f on f.city=p.city
 join trivia_squares.geography_country_labels l on l.code=f.country_code
), inserted as (
 insert into trivia_squares.geography_question_audit
 (question_id,geonameid,country_code,source_url,audit_method,checked_answer,checked_on)
 select id,geonameid,country_code,'https://www.geonames.org/export/',
 'geonames_imported_dataset_city_and_localized_country_exact_match',
 correct_answer,date '2026-10-30'
 from validated where correct_answer=reference_answer
 on conflict (question_id) do nothing returning question_id
)
select count(*) as new_structurally_crosschecked_questions from inserted;
