import {test,expect,type Page} from '@playwright/test';
async function tabTo(page:Page,selector:string):Promise<void>{
  for(let i=0;i<130;i++){
    if(await page.evaluate(s=>document.activeElement?.matches(s)??false,selector))return;
    const key=process.platform==='darwin'&&page.context().browser()?.browserType().name()==='webkit'?'Alt+Tab':'Tab';
    await page.keyboard.press(key);
  }
  throw new Error(`Keyboard did not reach ${selector}`);
}
async function hasCrossDocument(page:Page):Promise<boolean>{return page.evaluate(()=>'onpageswap'in window&&'onpagereveal'in window);}
async function waitForFinished(page:Page):Promise<void>{await page.waitForFunction(()=>!document.getAnimations().some(a=>a.effect instanceof KeyframeEffect && a.effect.pseudoElement?.startsWith('::view-transition')));}
test('keyboard walkthrough: floor, hall, vitrine, sibling, Atrium',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');
  await tabTo(page,'.primary-nav a[href="/halls/"]');await page.keyboard.press('Enter');await page.waitForURL('**/halls/');
  await tabTo(page,'[data-select-floor="3"]');await page.keyboard.press('Enter');await expect(page).toHaveURL(/floor=3/);await expect(page.locator('#floor-heading-3')).toBeFocused();
  await tabTo(page,'a[data-hall="prehistoric-journey"]');
  const outline=await page.locator('a[data-hall="prehistoric-journey"]').evaluate(el=>getComputedStyle(el).outlineWidth);expect(outline).toBe('2px');
  await page.keyboard.press('Enter');await page.waitForURL('**/halls/prehistoric-journey/');
  if(await hasCrossDocument(page))await expect(page.locator('html')).toHaveAttribute('data-last-transition','enter');
  await waitForFinished(page);
  await tabTo(page,'[data-open-vitrine]');await page.keyboard.press('Enter');await expect(page.locator('dialog')).toBeVisible();await expect(page.locator('#object-title')).toBeFocused();
  await page.keyboard.press('Escape');await expect(page.locator('dialog')).not.toBeVisible();await expect(page.locator('[data-open-vitrine]')).toBeFocused();
  await tabTo(page,'.exit-pair a[href="/halls/egyptian-mummies/"]');await page.keyboard.press('Enter');await page.waitForURL('**/halls/egyptian-mummies/');
  if(await hasCrossDocument(page))await expect(page.locator('html')).toHaveAttribute('data-last-transition','lateral-l');
  await waitForFinished(page);await tabTo(page,'.hall-exit>a[href="/"]');await page.keyboard.press('Enter');await page.waitForURL('http://127.0.0.1:4173/');
  await expect(page.locator('h1')).toContainText('Denver Museum');expect(errors).toEqual([]);
});
test('Directory return restores Floor 3 and inverse type; floor changes take priority',async({page})=>{
  await page.goto('/halls/?floor=3');await page.locator('a[data-hall="prehistoric-journey"]').click();await page.waitForURL('**/prehistoric-journey/');await waitForFinished(page);
  await page.goBack();await expect(page.locator('#floor-3')).toBeVisible();await expect(page.locator('#floor-1')).toBeHidden();
  if(await hasCrossDocument(page))await expect(page.locator('html')).toHaveAttribute('data-last-transition','exit');
  await page.goto('/halls/space-odyssey/');await page.locator('.map-rooms>summary').click();
  await page.locator('.map-rooms a[href="/halls/prehistoric-journey/"]').press('Enter');await page.waitForURL('**/prehistoric-journey/');
  if(await hasCrossDocument(page))await expect(page.locator('html')).toHaveAttribute('data-last-transition','ascend');
  await waitForFinished(page);await page.goBack();
  if(await hasCrossDocument(page))await expect(page.locator('html')).toHaveAttribute('data-last-transition','descend');
});
test('filters, sealed threshold, live notice dismissal and offline concept form',async({page})=>{
  const bad:string[]=[];page.on('request',r=>{if(r.isNavigationRequest()&&!r.url().startsWith('http://127.0.0.1:4173'))bad.push(r.url());});
  await page.goto('/special-exhibitions/');await page.getByRole('button',{name:'Coming soon',exact:true}).click();await expect(page.locator('[data-filter]:visible')).toHaveCount(2);await expect(page.locator('[data-filter-heading]')).toBeFocused();
  await page.getByRole('button',{name:'All',exact:true}).click();await expect(page.locator('[data-filter]:visible')).toHaveCount(4);
  await page.goto('/halls/?floor=3');await page.locator('a[data-hall="gems-and-minerals"]').click();
  if(await hasCrossDocument(page))await expect(page.locator('html')).toHaveAttribute('data-last-transition','enter');await expect(page.locator('dmns-sealed-hall')).toContainText('closed for major renovation');
  await page.goto('/');const notice=page.locator('[data-notice]');if(await notice.count()){await page.getByRole('button',{name:'Dismiss notice'}).click();await expect(notice).toHaveCount(0);await page.reload();await expect(notice).toHaveCount(0);}
  await page.getByLabel('Email address').fill('concept@example.test');await page.getByRole('button',{name:'Preview signup'}).click();await expect(page.locator('.form-hint')).toContainText('No information was sent');expect(bad).toEqual([]);
});
test('Stillness persists and reduced motion prevents transform/filter animation',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/halls/?floor=3');
  expect(await page.evaluate(()=>document.getAnimations().flatMap(a=>a.effect instanceof KeyframeEffect?a.effect.getKeyframes():[]).filter(k=>(k.transform&&k.transform!=='none')||(k.filter&&k.filter!=='none')))).toEqual([]);
  await page.locator('a[data-hall="prehistoric-journey"]').click();await page.waitForURL('**/prehistoric-journey/');
  expect(await page.evaluate(()=>document.getAnimations().flatMap(a=>a.effect instanceof KeyframeEffect?a.effect.getKeyframes():[]).filter(k=>(k.transform&&k.transform!=='none')||(k.filter&&k.filter!=='none')))).toEqual([]);
  await page.emulateMedia({reducedMotion:'no-preference'});await page.getByRole('button',{name:/Stillness/}).click();await expect(page.locator('html')).toHaveAttribute('data-stillness','true');
  await page.locator('.back-link').click();await page.waitForURL(/\/halls\/\?floor=3/);await expect(page.locator('html')).toHaveAttribute('data-stillness','true');await expect(page.getByRole('button',{name:/Stillness/})).toHaveAttribute('aria-pressed','true');
  expect(await page.evaluate(()=>document.getAnimations().flatMap(a=>a.effect instanceof KeyframeEffect?a.effect.getKeyframes():[]).filter(k=>(k.transform&&k.transform!=='none')||(k.filter&&k.filter!=='none')))).toEqual([]);
});
test('responsive shell and no console errors at 320, 768, 1024, 1440',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  for(const width of [320,768,1024,1440]){await page.setViewportSize({width,height:900});for(const path of ['/','/halls/?floor=3','/halls/prehistoric-journey/']){await page.goto(path);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${path} at ${width}px`).toBe(true);}}
  expect(errors).toEqual([]);
});

test('in-page controls work when the same-document API is absent',async({page})=>{
  await page.addInitScript(()=>{Reflect.deleteProperty(Document.prototype,'startViewTransition');});
  await page.goto('/halls/');expect(await page.evaluate(()=>'startViewTransition'in document)).toBe(false);
  await page.locator('[data-select-floor="3"]').click();await expect(page.locator('#floor-heading-3')).toBeFocused();
  await page.locator('a[data-hall="prehistoric-journey"]').click();await page.waitForURL('**/prehistoric-journey/');
  await page.locator('[data-open-vitrine]').click();await expect(page.locator('#object-title')).toBeFocused();
  await page.keyboard.press('Escape');await expect(page.locator('[data-open-vitrine]')).toBeFocused();
});

test('denied preference storage leaves navigation and controls usable',async({page})=>{
  await page.addInitScript(()=>{
    for(const key of ['localStorage','sessionStorage'])Object.defineProperty(window,key,{get(){throw new DOMException('Storage unavailable','SecurityError');}});
  });
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
  await page.getByRole('button',{name:/Stillness/}).click();await expect(page.locator('html')).toHaveAttribute('data-stillness','true');
  await page.locator('.primary-nav a[href="/halls/"]').click();await page.waitForURL('**/halls/');await expect(page.locator('h1')).toHaveText('The Directory');expect(errors).toEqual([]);
});
