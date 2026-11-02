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

test('all six locales and skins keep readable picker targets without horizontal clipping',async({page})=>{
  await useOfflineQuestionFixtures(page);
  await page.addInitScript(()=>{
    localStorage.setItem('trivia-welcome-dismissed-v1','1');
    localStorage.setItem('trivia-tutorial-seen-v1','1');
    localStorage.setItem('trivia-player-name','טסטר');
  });
  await page.goto('/');
  await expect(page.locator('svg.board')).toBeVisible();
  const palette=page.locator('button.skin-palette-trigger');
  const languages=[['he','rtl'],['en','ltr'],['ru','ltr'],['fr','ltr'],['ar','rtl'],['es','ltr']] as const;
  for(const [index,[locale,direction]] of languages.entries()){
    await page.locator(`button.locale-option[lang="${locale}"]`).click();
    await expect(page.locator('html')).toHaveAttribute('lang',locale);
    await expect(page.locator('html')).toHaveAttribute('dir',direction);
    await palette.click();
    const options=page.locator('#skin-picker-panel button.skin-picker-item');
    await expect(options).toHaveCount(6);
    const option=options.nth(index);
    const metrics=await option.evaluate(el=>({
      weight:Number.parseInt(getComputedStyle(el).fontWeight,10),
      height:el.getBoundingClientRect().height,
      label:(el.textContent||'').trim()
    }));
    expect(metrics.weight).toBeGreaterThanOrEqual(800);
    expect(metrics.height).toBeGreaterThanOrEqual(44);
    expect(metrics.label.length).toBeGreaterThan(0);
    await option.click();
    await expect(palette).toHaveAttribute('aria-expanded','false');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth)).toBeLessThanOrEqual(2);
  }
  await page.reload();
  await expect(page.locator('svg.board')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang','es');
  await palette.click();
  await expect(page.locator('#skin-picker-panel button.skin-picker-item').nth(5)).toHaveAttribute('aria-pressed','true');
});
