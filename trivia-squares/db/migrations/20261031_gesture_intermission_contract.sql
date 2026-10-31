-- Extend existing reward contract without changing authentication, row locks or payout.
ALTER TABLE trivia_squares.stage_collectibles DROP CONSTRAINT stage_collectibles_minigame_check;
ALTER TABLE trivia_squares.stage_collectibles ADD CONSTRAINT stage_collectibles_minigame_check CHECK (minigame IN ('wheel','word','balloons','cake','scratch','sword','scissors'));
DO $migration$
DECLARE definition text; old_guard text := 'if p_game not in (''wheel'',''word'',''balloons'',''cake'')';
BEGIN
 definition := pg_get_functiondef('public.trivia_stage_play(uuid,text,text)'::regprocedure);
 IF position(old_guard in definition)=0 THEN RAISE EXCEPTION 'Unexpected RPC definition; abort'; END IF;
 definition := replace(definition,old_guard,'if p_game IS NULL OR p_game not in (''wheel'',''word'',''balloons'',''cake'',''scratch'',''sword'',''scissors'')');
 EXECUTE definition;
END $migration$;