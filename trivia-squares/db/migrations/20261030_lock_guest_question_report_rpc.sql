-- Trivia Squares: anonymous visitors may read unranked trivia, but cannot submit
-- account-linked reports. The function itself requires auth.uid().
-- This change does NOT touch the anonymous question-batch RPCs used by guest play.
-- Safe to rerun. No user data, balances, or game progress are modified.
revoke execute on function public.trivia_report_question(bigint, text) from public, anon;
grant execute on function public.trivia_report_question(bigint, text) to authenticated, service_role;

-- Verification:
-- select has_function_privilege('anon','public.trivia_report_question(bigint,text)','EXECUTE'); -- false
-- select has_function_privilege('authenticated','public.trivia_report_question(bigint,text)','EXECUTE'); -- true
