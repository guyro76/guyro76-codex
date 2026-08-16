-- בדיקת קוד הזמנה עוד לפני שיש חשבון
--
-- הצורך: הקוד נשאל עכשיו כבר במסך הכניסה, לפני ההרשמה. אי אפשר
-- לממש אותו שם — מימוש דורש חשבון קיים — ולכן צריך שלב ביניים
-- שבודק אם הקוד תקף ומראה מה הוא נותן, בלי לשנות כלום.
--
-- למה security definer: משתמש אנונימי חייב לקבל תשובה, אבל אסור לתת
-- לו גישת קריאה לטבלת ההזמנות. הפונקציה מחזירה בדיוק שלושה שדות —
-- תקף/לא, החבילה ומספר הימים — ולא את הקוד עצמו, לא את ההערה
-- הפנימית, לא את מי יצר אותו ולא כמה פעמים נוצל.
create or replace function public.preview_invitation(invite_code text)
returns table (ok boolean, message text, tier public.account_tier, days integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  inv public.invitations%rowtype;
begin
  select * into inv from public.invitations
    where code = upper(trim(invite_code));

  -- קוד שלא קיים מקבל נוסח כללי בכוונה: מי שמנסה לנחש קודים לא
  -- אמור ללמוד מהתשובה אם קלע לקוד קיים שפג תוקפו או לא קלע בכלל.
  if not found then
    return query select false, 'לא מצאנו את הקוד הזה. כדאי לבדוק שוב — אותיות גדולות וקטנות לא משנות.',
                        null::public.account_tier, null::integer;
    return;
  end if;

  if inv.expires_at is not null and inv.expires_at < now() then
    return query select false, 'פג תוקפו של הקוד', null::public.account_tier, null::integer;
    return;
  end if;

  if inv.used_count >= inv.max_uses then
    return query select false, 'הקוד כבר נוצל במלואו', null::public.account_tier, null::integer;
    return;
  end if;

  return query select true, 'הקוד תקף!', inv.tier, inv.days;
end;
$$;

grant execute on function public.preview_invitation(text) to anon, authenticated;

-- תוקף ברירת מחדל לקוד עצמו: שבוע מרגע היצירה.
-- זה נפרד ממספר הימים שהקוד מזכה בהם: `days` הוא כמה זמן החבילה
-- פעילה אחרי המימוש, ו-`expires_at` הוא עד מתי בכלל אפשר לממש.
-- בלי זה קוד שלא נוצל נשאר תקף לנצח, וזו בדיוק דליפה שקטה.
alter table public.invitations
  alter column expires_at set default (now() + interval '7 days');
