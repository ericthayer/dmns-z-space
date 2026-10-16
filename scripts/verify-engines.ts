import {chromium,firefox,webkit} from 'playwright';
import {writeFile} from 'node:fs/promises';
import {previewServer} from './runtime.js';
const stop=await previewServer();const engines=[];
try{
  for(const [name,type] of Object.entries({chromium,firefox,webkit})){
    const browser=await type.launch();const context=await browser.newContext({colorScheme:'dark'});const page=await context.newPage();
    await page.goto('http://127.0.0.1:4173/halls/?floor=3');
    const features=await page.evaluate(()=>({sameDocument:'startViewTransition' in document,pageswap:'onpageswap'in window,pagereveal:'onpagereveal'in window,crossDocumentRule:'CSSViewTransitionRule'in window,classes:CSS.supports('view-transition-class: a'),types:CSS.supports('selector(:active-view-transition-type(enter))'),scrollTimeline:CSS.supports('animation-timeline: view()')}));
    await page.locator('a[data-hall="prehistoric-journey"]').click();await page.waitForURL('**/prehistoric-journey/');
    const typeName=await page.locator('html').getAttribute('data-last-transition');
    engines.push({name,version:browser.version(),features,observedDirectoryToHall:typeName??'ordinary navigation',date:'2026-10-16'});
    await context.close();await browser.close();
  }
  await writeFile('docs/engine-verification.json',JSON.stringify(engines,null,2)+'\n');console.log(JSON.stringify(engines,null,2));
}finally{stop();}
