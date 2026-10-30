-- Read-only verification. It does not submit any question or issue credits.
SELECT
  pg_catalog.strpos(
    pg_catalog.pg_get_functiondef('public.trivia_submit_community_question(text,text,text,jsonb,integer,text)'::regprocedure),
    'cat NOT IN(''tv_film'',''disney'',''music'','
  )>0 AS disney_accepted,
  NOT pg_catalog.has_function_privilege(
    'anon','public.trivia_submit_community_question(text,text,text,jsonb,integer,text)'::regprocedure,'EXECUTE'
  ) AS anonymous_submission_blocked,
  pg_catalog.has_function_privilege(
    'authenticated','public.trivia_submit_community_question(text,text,text,jsonb,integer,text)'::regprocedure,'EXECUTE'
  ) AS authenticated_submission_allowed,
  NOT pg_catalog.has_function_privilege(
    'authenticated','public.trivia_review_community_proposal(uuid,boolean,text,text)'::regprocedure,'EXECUTE'
  ) AS approval_stays_server_only;
