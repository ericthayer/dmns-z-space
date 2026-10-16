import {readFile,access,readdir} from 'node:fs/promises';
import {resolve} from 'node:path';
async function files(dir:string):Promise<string[]>{const entries=await readdir(dir,{withFileTypes:true});return(await Promise.all(entries.map(e=>e.isDirectory()?files(`${dir}/${e.name}`):Promise.resolve([`${dir}/${e.name}`])))).flat();}
const pages=(await files('dist')).filter(f=>f.endsWith('.html'));let links=0;
for(const page of pages){
  const html=await readFile(page,'utf8');
  if((html.match(/<h1[ >]/g)??[]).length!==1)throw new Error(`${page}: must have one h1`);
  for(const m of html.matchAll(/(?:href|src)="([^"]+)"/g)){
    const value=m[1]!.replaceAll('&amp;','&');if(/^(https:|mailto:|data:)/.test(value))continue;
    const url=new URL(value,'https://concept.test/'+page.slice(5).replace(/index\.html$/,''));
    const target=resolve('dist',`.${url.pathname}${url.pathname.endsWith('/')?'index.html':''}`);
    await access(target).catch(()=>{throw new Error(`${page}: broken ${value}`);});links++;
    if(url.hash&&target.endsWith('.html')){
      const targetHtml=target===resolve(page)?html:await readFile(target,'utf8');
      if(!targetHtml.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`))throw new Error(`${page}: missing anchor ${value}`);
    }
  }
}
console.log(`${pages.length} HTML pages, ${links} local links/assets/anchors verified.`);
