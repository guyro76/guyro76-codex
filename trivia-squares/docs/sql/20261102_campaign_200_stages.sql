-- Trivia Squares: extend the campaign from 100 to 200 stages.
-- Non-destructive: widens two CHECK constraints, adds stage rows 101-200 and
-- raises the stage bound in the two functions that validate it. No data is
-- deleted or rewritten; existing progress and matches are untouched.
begin;

alter table trivia_squares.campaign_stages drop constraint campaign_stages_id_check;
alter table trivia_squares.campaign_stages add constraint campaign_stages_id_check check (id between 1 and 200);

alter table trivia_squares.campaign_progress drop constraint campaign_progress_completed_stage_check;
alter table trivia_squares.campaign_progress add constraint campaign_progress_completed_stage_check check (completed_stage between 0 and 200);

insert into trivia_squares.campaign_stages (id, size, theme) values
(101,5,'clouds'),
(102,6,'clouds'),
(103,6,'clouds'),
(104,5,'clouds'),
(105,6,'clouds'),
(106,5,'crystal'),
(107,6,'crystal'),
(108,6,'crystal'),
(109,5,'crystal'),
(110,6,'crystal'),
(111,5,'orchard'),
(112,6,'orchard'),
(113,6,'orchard'),
(114,5,'orchard'),
(115,6,'orchard'),
(116,5,'clouds'),
(117,6,'clouds'),
(118,6,'clouds'),
(119,5,'clouds'),
(120,6,'clouds'),
(121,5,'orchard'),
(122,6,'orchard'),
(123,6,'orchard'),
(124,5,'orchard'),
(125,6,'orchard'),
(126,5,'galaxy'),
(127,6,'galaxy'),
(128,6,'galaxy'),
(129,5,'galaxy'),
(130,6,'galaxy'),
(131,5,'crystal'),
(132,6,'crystal'),
(133,6,'crystal'),
(134,5,'crystal'),
(135,6,'crystal'),
(136,5,'orchard'),
(137,6,'orchard'),
(138,6,'orchard'),
(139,5,'orchard'),
(140,6,'orchard'),
(141,5,'clouds'),
(142,6,'clouds'),
(143,6,'clouds'),
(144,5,'clouds'),
(145,6,'clouds'),
(146,5,'galaxy'),
(147,6,'galaxy'),
(148,6,'galaxy'),
(149,5,'galaxy'),
(150,6,'galaxy'),
(151,5,'orchard'),
(152,6,'orchard'),
(153,6,'orchard'),
(154,5,'orchard'),
(155,6,'orchard'),
(156,5,'galaxy'),
(157,6,'galaxy'),
(158,6,'galaxy'),
(159,5,'galaxy'),
(160,6,'galaxy'),
(161,5,'crystal'),
(162,6,'crystal'),
(163,6,'crystal'),
(164,5,'crystal'),
(165,6,'crystal'),
(166,5,'clouds'),
(167,6,'clouds'),
(168,6,'clouds'),
(169,5,'clouds'),
(170,6,'clouds'),
(171,5,'crystal'),
(172,6,'crystal'),
(173,6,'crystal'),
(174,5,'crystal'),
(175,6,'crystal'),
(176,5,'orchard'),
(177,6,'orchard'),
(178,6,'orchard'),
(179,5,'orchard'),
(180,6,'orchard'),
(181,5,'galaxy'),
(182,6,'galaxy'),
(183,6,'galaxy'),
(184,5,'galaxy'),
(185,6,'galaxy'),
(186,5,'galaxy'),
(187,6,'galaxy'),
(188,6,'galaxy'),
(189,5,'galaxy'),
(190,6,'galaxy'),
(191,6,'crystal'),
(192,6,'crystal'),
(193,6,'crystal'),
(194,6,'crystal'),
(195,6,'crystal'),
(196,6,'galaxy'),
(197,6,'galaxy'),
(198,6,'galaxy'),
(199,6,'galaxy'),
(200,6,'galaxy')
on conflict (id) do nothing;

-- Raise the bound inside the existing function bodies (same signature, owner,
-- grants and security settings are preserved by CREATE OR REPLACE).
do $$
declare d text;
begin
  d := pg_get_functiondef('public.trivia_create_campaign_match(text,integer)'::regprocedure);
  if position('not between 1 and 100' in d) = 0 then raise exception 'create_campaign_match bound not found'; end if;
  execute replace(d, 'not between 1 and 100', 'not between 1 and 200');

  d := pg_get_functiondef('trivia_squares.campaign_complete_match_trigger()'::regprocedure);
  if position('done_stage between 1 and 100' in d) = 0 then raise exception 'complete_match_trigger bound not found'; end if;
  execute replace(d, 'done_stage between 1 and 100', 'done_stage between 1 and 200');
end $$;

commit;
