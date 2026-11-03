import {test,expect} from '@playwright/test';
import {useOfflineQuestionFixtures} from './localQuestionFixture';
import {offlineQuestions} from '../src/lib/offlineQuestions';
import {freshLocalQuestionReserve} from '../src/lib/freshQuestions';
import {languageQuestions} from '../src/lib/languageQuestions';
import {curatedHebrewQuestions} from '../src/lib/curatedHebrewQuestions';

/* Owner request: a free-licensed photo next to the correct answer, with the photographer credited. */
const TARGET=990003; // Sea of Galilee
const others=[...offlineQuestions,...freshLocalQuestionReserve,...languageQuestions,...curatedHebrewQuestions].map(q=>q.id).filter(id=>id!==TARGET);
const target=curatedHebrewQuestions.find(q=>q.id===TARGET)!;

for(const correct of [true,false]){
  test('answer photo with credit after a '+(correct?'correct':'wrong')+' answer',async({page},info)=>{
    test.skip(info.project.name!=='chromium-desktop','mouse drawing');
    await useOfflineQuestionFixtures(page);
    await page.addInitScript(ids=>{localStorage.setItem('trivia-used-question-ids',JSON.stringify(ids));
      localStorage.setItem('trivia-tutorial-seen-v1','1');localStorage.setItem('trivia-player-name','טסטר');localStorage.setItem('trivia-mode-v2','solo')},others);
    await page.goto('/');
    const tutorial=page.getByRole('dialog',{name:'הסבר משחק'});
    if(await tutorial.isVisible().catch(()=>false))await tutorial.getByRole('button',{name:'דלג או סיים'}).click();
    await page.locator('svg.board').scrollIntoViewIfNeeded();
    const pt=async(r:number,c:number)=>{const b=(await page.locator('svg.board circle[aria-label="נקודה '+r+', '+c+'"]').boundingBox())!;return {x:b.x+b.width/2,y:b.y+b.height/2}};
    const a=await pt(1,1),z=await pt(1,2);
    await page.mouse.move(a.x,a.y);await page.mouse.down();await page.mouse.move(z.x,z.y,{steps:12});await page.mouse.up();
    const quiz=page.getByRole('dialog',{name:'שאלת טריוויה'});
    await expect(quiz.locator('h2')).toHaveText(target.text);
    const index=correct?target.correct:(target.correct+1)%target.answers.length;
    await quiz.locator('button.answer-option').nth(index).click();
    const where=correct?page.getByTestId('answer-reveal'):page.getByRole('dialog',{name:'התשובה הנכונה היא:'});
    const fig=where.locator('figure.answer-image');
    await expect(fig.locator('img')).toHaveAttribute('src','/answer-images/990003.webp');
    await expect(fig.locator('img')).toHaveJSProperty('complete',true);
    await expect(fig.locator('figcaption')).toContainText('צילום: Zachi Evenor, MathKnight');
    await expect(fig.locator('figcaption a').first()).toHaveAttribute('href','https://creativecommons.org/licenses/by/2.0/');
    await page.screenshot({path:info.outputPath('answer-image.png')});
  });
}
