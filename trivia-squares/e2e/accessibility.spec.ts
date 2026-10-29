import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const paths=['/','/privacy','/terms','/cookies','/accessibility','/account/privacy','/auth/reset-password'];

for(const path of paths){
  test('WCAG 2.1 AA automated check: '+path,async({page})=>{
    await page.goto(path);
    if(path==='/'){
      const intro=page.getByRole('dialog',{name:'הסבר משחק'});
      if(await intro.isVisible())await intro.getByRole('button',{name:'דלג או סיים'}).click();
    }
    const report=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
    const violations=report.violations.map(v=>({
      rule:v.id,impact:v.impact,help:v.help,nodes:v.nodes.slice(0,3).map(n=>n.target.join(' '))
    }));
    expect(violations,JSON.stringify(violations,null,2)).toEqual([]);
  });
}
