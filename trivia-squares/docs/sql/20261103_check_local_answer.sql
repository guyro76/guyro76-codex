-- Security (Ultra QA 2026-11-03): server questions must not ship their answer index to the browser.
-- Stage 1 (applied 2026-11-03, additive): check one answer after the player picks it.
create or replace function public.trivia_check_local_answer(p_question_id bigint, p_answer integer)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare v_correct integer; v_len integer;
begin
  if p_question_id is null or p_question_id <= 0 or p_answer is null or p_answer < 0 or p_answer > 5 then
    raise exception 'invalid answer check' using errcode = '22023';
  end if;
  select q.correct_index, jsonb_array_length(q.answers) into v_correct, v_len
    from trivia_squares.questions q where q.id = p_question_id and q.active = true;
  if v_correct is null then return jsonb_build_object('found', false); end if;
  if p_answer >= v_len then raise exception 'invalid answer check' using errcode = '22023'; end if;
  return jsonb_build_object('found', true, 'correct', p_answer = v_correct, 'correct_index', v_correct);
end $$;
revoke all on function public.trivia_check_local_answer(bigint, integer) from public;
grant execute on function public.trivia_check_local_answer(bigint, integer) to anon, authenticated;
-- Stage 2 (after the client that uses the check is live): remove 'correct' from
-- trivia_local_culture_batch and trivia_local_question_batch.

-- Stage 2 (applied 2026-11-03 after #103 was live and verified): `correct` removed from
-- trivia_local_culture_batch and trivia_local_question_batch (same signatures, grants kept).
-- Verified: both batches return only id/text/answers/category/difficulty/locale; live play
-- checks answers through trivia_check_local_answer.
