-- Trivia Squares: allow community-proposed Disney questions.
-- Source: the currently installed, service-reviewed SECURITY DEFINER RPC.
-- Exact guarded replacement preserves all auth, quota, duplicate, validation,
-- rewards and moderator-only approval logic. Safe to run once; idempotent.
BEGIN;
DO $guard$
DECLARE
  def text;
  before_text constant text := 'cat NOT IN(''tv_film'',''music'',';
  after_text constant text := 'cat NOT IN(''tv_film'',''disney'',''music'',';
  func regprocedure := 'public.trivia_submit_community_question(text,text,text,jsonb,integer,text)'::regprocedure;
BEGIN
  def := pg_catalog.pg_get_functiondef(func);
  IF pg_catalog.strpos(def, after_text)>0 THEN
    RETURN; -- Already applied
  END IF;
  IF pg_catalog.strpos(def,before_text)=0 THEN
    RAISE EXCEPTION 'Community topic validation changed; refusing unsafe replacement';
  END IF;
  IF pg_catalog.strpos(def,'SECURITY DEFINER')=0
     OR pg_catalog.strpos(def,'SELECT auth.uid()')=0
     OR pg_catalog.strpos(def,'Maximum three proposals in 24 hours')=0 THEN
    RAISE EXCEPTION 'Expected security checks missing; refusing replacement';
  END IF;
  EXECUTE pg_catalog.replace(def,before_text,after_text);
  IF pg_catalog.has_function_privilege('anon',func,'EXECUTE')
    OR NOT pg_catalog.has_function_privilege('authenticated',func,'EXECUTE')
    OR NOT pg_catalog.has_function_privilege('service_role',func,'EXECUTE') THEN
     RAISE EXCEPTION 'Unexpected role grants after migration';
  END IF;
END
$guard$;
COMMIT;
