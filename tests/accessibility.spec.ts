import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {readFileSync} from 'node:fs';
const {routes}=JSON.parse(readFileSync('dist/route-manifest.json','utf8')) as {routes:Array<{path:string}>};
test.describe('Static HTML without JavaScript',()=>{
  for(const {path} of routes)test(`accessible route ${path}`,async({page,browser})=>{
    const staticContext=await browser.newContext({javaScriptEnabled:false,colorScheme:'dark'});
    const staticPage=await staticContext.newPage();
    const response=await staticPage.goto(`http://127.0.0.1:4173${path}`);expect(response?.status()).toBe(200);
    await expect(staticPage.locator('h1')).toBeVisible();
    const staticMain=await staticPage.locator('main').innerHTML();
    await staticContext.close();
    // Axe itself needs JavaScript timers. Audit identical SSR with application scripts blocked.
    await page.route('**/assets/**/*.js',route=>route.abort());
    await page.goto(path);expect(await page.locator('main').innerHTML()).toBe(staticMain);
    await expect(page.locator('h1')).toHaveCount(1);await expect(page.locator('main#main')).toBeVisible();
    await expect(page.locator('header')).toBeVisible();await expect(page.locator('footer')).toBeVisible();
    const result=await new AxeBuilder({page}).analyze();
    expect(result.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
  });
});
test('daylight, reduced-motion static content and mobile menu pass axe',async({page})=>{
  await page.goto('/');await page.getByRole('button',{name:'Daylight',exact:true}).click();
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const path of ['/','/halls/?floor=3','/halls/prehistoric-journey/']){
    await page.goto(path);const result=await new AxeBuilder({page}).analyze();expect(result.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))).toEqual([]);
  }
  await page.setViewportSize({width:320,height:800});await page.goto('/');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const result=await new AxeBuilder({page}).analyze();expect(result.violations.map(v=>v.id)).toEqual([]);
});
