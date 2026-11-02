import type {Page} from '@playwright/test';

/** Secondary controls (language, sound test, fill demo, device preview, clock/weather)
 *  live in the game menu's Settings tab so the board owns the screen. */
export async function openGameSettings(page:Page){
 const dialog=page.locator('dialog.app-menu-dialog');
 const open=await dialog.evaluate(d=>(d as HTMLDialogElement).open).catch(()=>false);
 if(!open)await page.locator('.game-topbar .app-menu-trigger').click();
 await dialog.locator('.app-menu-tab[data-section="settings"]').click();
 return dialog;
}

export async function closeGameMenu(page:Page){
 const dialog=page.locator('dialog.app-menu-dialog');
 if(await dialog.evaluate(d=>(d as HTMLDialogElement).open).catch(()=>false))await dialog.locator('.app-menu-close').click();
}

export async function switchLanguage(page:Page,name:string){
 const dialog=await openGameSettings(page);
 await dialog.locator('.locale-switch').getByRole('button',{name}).click();
 await closeGameMenu(page);
}
