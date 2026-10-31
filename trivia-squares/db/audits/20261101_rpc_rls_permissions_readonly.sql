-- Trivia Squares / 2026-11-01: read-only RPC and RLS permission regression audit.
-- Scope: public.trivia_* functions and selected trivia_squares tables ONLY.
-- NO DDL, DML, SET ROLE, test-account creation, or player-data changes.
-- This is a catalog inspection, not a substitute for authenticated BOLA/IDOR E2E.
-- Expected: all *_violations = 0; investigate any nonzero result before release.

WITH functions AS (
 SELECT p.oid,p.proname,p.prosecdef,p.proconfig
 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
 WHERE n.nspname='public' AND p.proname LIKE 'trivia_%'
), permissions AS (
 SELECT proname,prosecdef,
  has_function_privilege('anon',oid,'EXECUTE') AS anon_exec,
  has_function_privilege('authenticated',oid,'EXECUTE') AS auth_exec,
  has_function_privilege('service_role',oid,'EXECUTE') AS service_exec,
  EXISTS(SELECT 1 FROM unnest(proconfig) setting
         WHERE setting LIKE 'search_path=%') AS pinned_search_path
 FROM functions
)
SELECT count(*) AS inspected_trivia_rpc,
 count(*) FILTER(WHERE prosecdef AND NOT pinned_search_path)
  AS unpinned_security_definer_violations,
 count(*) FILTER(WHERE anon_exec AND proname NOT IN
  ('trivia_local_question_batch','trivia_local_culture_batch'))
  AS unexpected_anonymous_rpc_violations,
 count(*) FILTER(WHERE proname='trivia_review_community_proposal'
  AND (anon_exec OR auth_exec OR NOT service_exec))
  AS community_approval_exposure_violations,
 count(*) FILTER(WHERE proname IN
  ('trivia_answer','trivia_choose_edge','trivia_stage_claim',
   'trivia_submit_community_question')
  AND (anon_exec OR NOT auth_exec))
  AS unsafe_game_rpc_violations
FROM permissions;

-- Inspect the RLS flag AND table-level DML grants.
-- A true RLS flag alone does not prove policies are safe.
WITH scoped AS (
 SELECT c.oid,c.relname,c.relrowsecurity
 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
 WHERE n.nspname='trivia_squares' AND c.relkind='r'
  AND c.relname IN ('questions','question_reserve','seen_questions',
                   'matches','progress','question_provenance',
                   'geography_question_audit')
), checks AS (
 SELECT relname,relrowsecurity,
  has_table_privilege('anon',oid,'INSERT,UPDATE,DELETE') AS anon_write,
  has_table_privilege('authenticated',oid,'INSERT,UPDATE,DELETE') AS auth_write
 FROM scoped
)
SELECT relname AS table_name,relrowsecurity AS rls_enabled,
 anon_write,auth_write,
 (relrowsecurity AND NOT anon_write AND NOT auth_write) AS catalog_gate_pass
FROM checks ORDER BY relname;

-- Follow-up still required: real signed-in two-account gameplay, unauthorized
-- cross-user access attempts, session recovery and iOS Safari physical QA.
