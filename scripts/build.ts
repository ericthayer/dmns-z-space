import {mkdir,rm,writeFile,readFile,cp,copyFile} from 'node:fs/promises';
import {loadContent} from '../src/lib/content.js';
import {createPositions} from '../src/lib/coordinates.js';
import {localDate} from '../src/lib/dates.js';
import {shell} from '../src/templates/shell.js';
import {home,directory,hall,specials,theaters,detail,editorial,programs} from '../src/templates/pages.js';
const c=await loadContent();
const today=process.env.BUILD_DATE??localDate();
if(!/^\d{4}-\d{2}-\d{2}$/.test(today)||Number.isNaN(Date.parse(today)))throw new Error('BUILD_DATE must be YYYY-MM-DD');
const routes=createPositions(c.halls,c.exhibitions,c.theaters,c.pages);
await rm('dist',{recursive:true,force:true});await mkdir('dist/assets',{recursive:true});
await cp('public','dist',{recursive:true});
await mkdir('dist/fonts',{recursive:true});
for(const font of ['newsreader','jost']){
  const file=`node_modules/@fontsource-variable/${font}/files/${font}-latin-wght-normal.woff2`;
  await copyFile(file,`public/fonts/${font}-latin.woff2`);
  await copyFile(file,`dist/fonts/${font}-latin.woff2`);
  await copyFile(`node_modules/@fontsource-variable/${font}/LICENSE`,`public/fonts/${font}-LICENSE.txt`);
  await copyFile(`public/fonts/${font}-LICENSE.txt`,`dist/fonts/${font}-LICENSE.txt`);
}
const styles=['tokens','base','components/chrome','components/atrium','components/collections','components/interactive','transitions','scroll'];
await writeFile('dist/assets/styles.css',(await Promise.all(styles.map(s=>readFile(`src/styles/${s}.css`,'utf8')))).join('\n'));
const pages=new Map<string,{title:string;body:string}>();
pages.set('/',{title:'The Atrium',body:home(c,today)});
pages.set('/halls/',{title:c.site.ui.directoryTitle!,body:directory(c,today)});
pages.set('/special-exhibitions/',{title:c.site.ui.specialHeading!,body:specials(c,today)});
pages.set('/theaters/',{title:c.site.ui.theatersHeading!,body:theaters(c,today)});
pages.set('/programs/',{title:c.site.ui.programHeading!,body:programs(c,today)});
for(const h of c.halls)pages.set(`/halls/${h.slug}/`,{title:h.name,body:hall(c,h,today)});
const wildlife=c.halls.find(h=>h.slug==='wildlife-halls')!;
pages.set('/halls/wildlife-halls/upper-floor/',{title:c.site.ui.wildlifeUpper!,body:hall(c,wildlife,today,true)});
for(const e of c.exhibitions)pages.set(`/special-exhibitions/${e.slug}/`,{title:e.name,body:detail(c,e,today,'special-exhibitions')});
for(const t of c.theaters)pages.set(`/theaters/${t.slug}/`,{title:t.name,body:detail(c,t,today,'theaters')});
for(const p of c.pages)pages.set(p.path,{title:p.name,body:editorial(c,p,today)});
for(const route of routes){
  const p=pages.get(route.path);if(!p)throw new Error(`Missing route ${route.path}`);
  const dir=`dist${route.path}`;await mkdir(dir,{recursive:true});await writeFile(`${dir}index.html`,shell(c,route,routes,p.title,p.body,today));
}
await writeFile('dist/route-manifest.json',JSON.stringify({today,routes},null,2));
await writeFile('dist/robots.txt','User-agent: *\nAllow: /\n');
await writeFile('dist/404.html',shell(c,routes[0]!,routes,'Page not found','<section class="section page-intro"><p class="eyebrow">404</p><h1>Page not found</h1><p><a class="text-link" href="/">Back to the Atrium ↗</a></p></section>',today));
console.log(`Built ${pages.size} routes for ${today} (America/Denver).`);
