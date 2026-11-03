import {test,expect,type Page,type Route} from '@playwright/test';
import {answerDisplayedLocalQuestion,useOfflineQuestionFixtures} from './localQuestionFixture';

/* Owner request (2026-11-03): after a wrong answer the player can appeal and keep playing.
 * If the hourly review engine approves it, the player gets the line back plus 25 credits. */
const cors={'access-control-allow-origin':'*','access-control-allow-methods':'POST, OPTIONS',
  'access-control-allow-headers':'apikey, authorization, content-type, x-client-info, accept-profile, prefer'};
const json=(route:Route,body:unknown)=>route.fulfill({status:200,contentType:'application/json',headers:cors,body:JSON.stringify(body)});

async function draw(page:Page,a:[number,number],b:[number,number]){
  await page.locator('svg.board').scrollIntoViewIfNeeded();
  const point=async(r:number,c:number)=>{const box=await page.locator('svg.board circle[aria-label="נקודה '+r+', '+c+'"]').boundingBox();
    if(!box)throw new Error('dot');return {x:box.x+box.width/2,y:box.y+box.height/2}};
  const s=await point(...a),e=await point(...b);
  await page.mouse.move(s.x,s.y);await page.mouse.down();await page.mouse.move(e.x,e.y,{steps:12});await page.mouse.up();
}

test('a wrong answer can be appealed; an approved appeal returns the line and 25 credits',async({page},info)=>{
  test.skip(info.project.name!=='chromium-desktop','mouse drawing; the flow itself is device independent');
  let decided=false;let submitted:Record<string,unknown>|null=null;
  await useOfflineQuestionFixtures(page);
  await page.route('**/rest/v1/rpc/trivia_bundled_question_corrections**',r=>json(r,[]));
  await page.route('**/rest/v1/rpc/trivia_submit_answer_appeal**',async r=>{submitted=r.request().postDataJSON();await json(r,4242)});
  await page.route('**/rest/v1/rpc/trivia_my_appeals**',r=>json(r,decided?[{id:4242,kind:'appeal',source:'bundled',question_id:1,locale:'he',
    status:'approved',decision_note:null,decided_at:new Date().toISOString(),compensation_claimed:false}]:[]));
  await page.route('**/rest/v1/rpc/trivia_claim_appeal_compensation**',r=>json(r,{ok:true,credits:25,server_credited:false}));
  await page.addInitScript(()=>{localStorage.setItem('trivia-tutorial-seen-v1','1');localStorage.setItem('trivia-player-name','טסטר');
    localStorage.setItem('trivia-mode-v2','solo')});
  await page.goto('/');
  const tutorial=page.getByRole('dialog',{name:'הסבר משחק'});
  if(await tutorial.isVisible().catch(()=>false))await tutorial.getByRole('button',{name:'דלג או סיים'}).click();
  await expect(page.locator('svg.board')).toBeVisible();
  const credits=async()=>Number((await page.getByTestId('wallet-credits').first().innerText()).replace(/\D/g,'')||0);
  const before=await credits();

  await draw(page,[1,1],[1,2]);
  await answerDisplayedLocalQuestion(page.getByRole('dialog',{name:'שאלת טריוויה'}),false);
  const feedback=page.getByRole('dialog',{name:'התשובה הנכונה היא:'});
  await expect(feedback).toBeVisible();
  await feedback.getByTestId('answer-appeal').click();
  await expect(feedback.getByRole('status')).toContainText('הערעור נשלח לבדיקה');
  expect(submitted).toMatchObject({p_kind:'appeal',p_source:'bundled',p_locale:'he'});
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('trivia-answer-appeals-v1')||'[]'));
  expect(saved[0]).toMatchObject({id:4242,edge:'h-0-0',status:'pending'});
  await feedback.getByRole('button',{name:'המשך למשחק'}).click();
  await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('trivia-local-game-v1')||'{}').edges?.['h-0-0'])).toBeUndefined();

  // The engine approves; the app picks it up when the player returns to the tab.
  decided=true;
  await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));
  await expect(page.locator('.status-line')).toContainText('הערעור שלך התקבל',{timeout:10000});
  await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('trivia-local-game-v1')||'{}').edges?.['h-0-0'])).toBe('host');
  await expect.poll(credits).toBe(before+25);
  const after=await page.evaluate(()=>JSON.parse(localStorage.getItem('trivia-answer-appeals-v1')||'[]'));
  expect(after[0]).toMatchObject({id:4242,status:'approved',notified:true});
});
