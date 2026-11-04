import {test,expect} from '@playwright/test';

/* Daily challenge: the same 10 questions for everyone today, one try a day, leaderboard.
 * The leaderboard RPCs are stubbed: tests never write to the live table. */
test('daily challenge plays 10 questions, saves the result, submits to a stubbed board and survives reload',async({page})=>{
 const submitted:Record<string,unknown>[]=[];
 const cors={'access-control-allow-origin':'*','access-control-allow-methods':'POST, OPTIONS','access-control-allow-headers':'apikey, authorization, content-type, x-client-info, accept-profile, prefer'};
 await page.route('**/rest/v1/rpc/trivia_daily_submit**',async route=>{
  if(route.request().method()==='POST')submitted.push(JSON.parse(route.request().postData()||'{}'));
  await route.fulfill({status:200,contentType:'application/json',headers:cors,body:JSON.stringify([{rank:2,players:5,score:777}])});
 });
 await page.route('**/rest/v1/rpc/trivia_daily_top**',route=>route.fulfill({status:200,contentType:'application/json',headers:cors,
  body:JSON.stringify([{place:1,name:'רותם',correct:10,seconds:60,score:1240},{place:2,name:'גיא',correct:7,seconds:90,score:910}])}));
 await page.addInitScript(()=>{localStorage.setItem('trivia-language','he');localStorage.setItem('trivia-player-name','גיא')});
 await page.goto('/daily');
 await page.getByTestId('daily-start').click();
 const seen=new Set<string>();
 for(let i=0;i<10;i++){
  const text=await page.getByTestId('daily-question').innerText();
  expect(seen.has(text),'no repeated question').toBe(false);seen.add(text);
  await page.locator('.daily-answers button').first().click();
  await expect(page.locator('.daily-feedback')).toBeVisible();
  await page.getByTestId('daily-next').click();
 }
 await expect(page.getByTestId('daily-result')).toBeVisible();
 await page.getByTestId('daily-submit').click();
 await expect(page.getByTestId('daily-result')).toContainText('2/5');
 expect(submitted).toHaveLength(1);
 expect(submitted[0]).toMatchObject({p_locale:'he',p_name:'גיא'});
 await expect(page.getByTestId('daily-top').locator('li')).toHaveCount(2);
 // One try a day: a reload shows the saved result, not a new game.
 await page.reload();
 await expect(page.getByTestId('daily-result')).toBeVisible();
 await expect(page.getByTestId('daily-start')).toHaveCount(0);
});
