import {test,expect} from '@playwright/test';
import {answerDisplayedLocalQuestion,useOfflineQuestionFixtures} from './localQuestionFixture';

test('active quiz and wrong-answer review retain readable semantic contrast',async({page},info)=>{
  test.skip(info.project.name!=='chromium-desktop','Focused desktop contrast regression; locale/mobile matrix runs separately');
  await useOfflineQuestionFixtures(page);
  await page.addInitScript(()=>{
    localStorage.setItem('trivia-welcome-dismissed-v1','1');
    localStorage.setItem('trivia-tutorial-seen-v1','1');
    localStorage.setItem('trivia-player-name','טסטר');
  });
  await page.goto('/');
  const board=page.locator('svg.board');
  await expect(board).toBeVisible();
  await board.scrollIntoViewIfNeeded();
  const dot=async(row:number,col:number)=>{
    const bounds=await page.locator('svg.board circle[aria-label="נקודה '+row+', '+col+'"]').boundingBox();
    if(!bounds)throw new Error('Missing board dot');
    return {x:bounds.x+bounds.width/2,y:bounds.y+bounds.height/2};
  };
  const start=await dot(1,1),end=await dot(1,2);
  await page.mouse.move(start.x,start.y);
  await page.mouse.down();
  await page.mouse.move(end.x,end.y,{steps:12});
  await page.mouse.up();
  const quiz=page.getByRole('dialog',{name:'שאלת טריוויה'});
  await expect(quiz).toBeVisible();
  await expect(quiz.locator('h2')).toHaveCSS('background-color','rgb(255, 255, 255)');
  await expect(quiz.locator('h2')).toHaveCSS('color','rgb(20, 33, 61)');
  await answerDisplayedLocalQuestion(quiz,false);
  const feedback=page.getByRole('dialog',{name:'התשובה הנכונה היא:'});
  await expect(feedback).toBeVisible();
  await expect(feedback.locator('.feedback-answer.feedback-correct')).toHaveCSS('background-color','rgb(216, 255, 232)');
  await expect(feedback.locator('.feedback-answer.feedback-correct')).toHaveCSS('color','rgb(12, 82, 50)');
  await expect(feedback.locator('.feedback-answer.feedback-wrong')).toHaveCSS('background-color','rgb(255, 227, 224)');
  await expect(feedback.locator('.feedback-answer.feedback-wrong')).toHaveCSS('color','rgb(128, 33, 44)');
});
