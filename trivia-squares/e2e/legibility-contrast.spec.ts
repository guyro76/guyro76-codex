import {test,expect} from '@playwright/test';
import {answerDisplayedLocalQuestion,useOfflineQuestionFixtures} from './localQuestionFixture';
import {drawAdjacentForQA} from './gestureQA';

test('active quiz and wrong-answer review retain readable semantic contrast on desktop and mobile',async({page})=>{
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
  await drawAdjacentForQA(page,[1,1],[1,2]);
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
