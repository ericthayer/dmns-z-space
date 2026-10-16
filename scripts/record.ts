import {chromium,type Page} from 'playwright';
import {mkdir,copyFile,writeFile} from 'node:fs/promises';
import {previewServer} from './runtime.js';
const stop=await previewServer();const browser=await chromium.launch();
await mkdir('work/recording',{recursive:true});
const context=await browser.newContext({viewport:{width:1440,height:1000},colorScheme:'dark',recordVideo:{dir:'work/recording',size:{width:1440,height:1000}}});
const page=await context.newPage();const video=page.video();
const start=Date.now();const steps:Array<{second:number;action:string}>=[];
async function at(second:number,action:string):Promise<void>{const ms=start+second*1000-Date.now();if(ms>0)await page.waitForTimeout(ms);steps.push({second:(Date.now()-start)/1000,action});console.log(`${second}s ${action}`);}
async function tabTo(page:Page,selector:string):Promise<void>{for(let i=0;i<130;i++){if(await page.evaluate(s=>document.activeElement?.matches(s)??false,selector))return;await page.keyboard.press('Tab');await page.waitForTimeout(50);}throw new Error(`Keyboard could not reach ${selector}`);}
try{
  await page.goto('http://127.0.0.1:4173/');await page.waitForTimeout(1600);
  await page.screenshot({path:'docs/atrium-desktop.png'});
  await at(6,'Tab to Halls and enter the Directory');await tabTo(page,'.primary-nav a[href="/halls/"]');await page.keyboard.press('Enter');await page.waitForURL('**/halls/');
  await at(12,'Choose Floor 3');await tabTo(page,'[data-select-floor="3"]');await page.keyboard.press('Enter');await page.waitForURL('**/halls/?floor=3');await page.waitForTimeout(800);await page.screenshot({path:'docs/directory-desktop.png'});
  await at(19,'Enter Prehistoric Journey through its doorway');await tabTo(page,'a[data-hall="prehistoric-journey"]');await page.keyboard.press('Enter');await page.waitForURL('**/prehistoric-journey/');await page.waitForTimeout(1000);await page.screenshot({path:'docs/hall-desktop.png'});
  await at(27,'Walk down the hall to the vitrine');await page.keyboard.press('PageDown');await page.waitForTimeout(900);await tabTo(page,'[data-open-vitrine]');
  await at(33,'Open object detail');await page.keyboard.press('Enter');await page.waitForSelector('dialog[open]');
  await at(40,'Escape closes detail and restores focus');await page.keyboard.press('Escape');
  await at(45,'Walk sideways to Egyptian Mummies');await tabTo(page,'.exit-pair a[href="/halls/egyptian-mummies/"]');await page.keyboard.press('Enter');await page.waitForURL('**/egyptian-mummies/');
  await at(53,'Return to the Atrium');await tabTo(page,'.hall-exit>a[href="/"]');await page.keyboard.press('Enter');await page.waitForURL('http://127.0.0.1:4173/');
  await at(60,'Walkthrough complete');
  await context.close();if(!video)throw new Error('Video unavailable');await copyFile(await video.path(),'docs/keyboard-walkthrough.webm');
  await writeFile('docs/recording-cues.json',JSON.stringify({viewport:'1440×1000',browser:browser.version(),input:'Keyboard only: Tab, Enter, PageDown, Escape',steps},null,2)+'\n');
  const mobile=await browser.newContext({viewport:{width:390,height:844},colorScheme:'dark'});const mp=await mobile.newPage();await mp.goto('http://127.0.0.1:4173/');await mp.waitForTimeout(1600);await mp.screenshot({path:'docs/atrium-mobile.png',fullPage:true});await mobile.close();
  console.log('Saved docs/keyboard-walkthrough.webm and review screenshots.');
}finally{await browser.close();stop();}
