import {type Locator,type Page} from '@playwright/test';
import {offlineQuestions} from '../src/lib/offlineQuestions';
import {freshLocalQuestionReserve} from '../src/lib/freshQuestions';

/** Keep offline-questions E2E deterministic while leaving production
 * question selection, topic rotation and the actual gameplay unchanged.
 * Server culture batch is separately covered by API/integration tests. */
export async function useOfflineQuestionFixtures(page:Page):Promise<void>{
  await page.route('**/rest/v1/rpc/trivia_local_culture_batch**',async route=>{
    await route.fulfill({
      status:200,
      contentType:'application/json',
      headers:{
        'access-control-allow-origin':'*',
        'access-control-allow-methods':'POST, OPTIONS',
        'access-control-allow-headers':'apikey, authorization, content-type, x-client-info, accept-profile'
      },
      body:'[]'
    });
  });
}

const bank=[...offlineQuestions,...freshLocalQuestionReserve];
function escapeRegex(text:string):string{return text.replace(/[.*+?^$\{\}()|[\]\\]/g,'\\$&');}

/** The old tests hard-coded Australia / Canberra as the FIRST question.
 * That forced geography and invalidated topic-choice balancing.
 * Resolve the correct answer against the actual question shown instead. */
export async function answerDisplayedLocalQuestion(quiz:Locator,correct:boolean):Promise<{correctAnswer:string;chosenAnswer:string}> {
  const displayed=(await quiz.locator('h2').innerText()).trim();
  const item=bank.find(q=>displayed===q.text || displayed.includes(q.text));
  if(!item)throw new Error('Question missing from local reviewed fixture bank: '+displayed);
  const index=correct?item.correct:(item.correct+1)%item.answers.length;
  const chosenAnswer=item.answers[index];
  const correctAnswer=item.answers[item.correct];
  await quiz.getByRole('button',{name:new RegExp(escapeRegex(chosenAnswer))}).click();
  return {correctAnswer,chosenAnswer};
}
