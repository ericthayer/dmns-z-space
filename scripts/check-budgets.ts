import {readFile,readdir,mkdir,writeFile} from 'node:fs/promises';
import {gzipSync} from 'node:zlib';
import {resolve,dirname} from 'node:path';
const seen=new Set<string>();
async function bytes(file:string):Promise<number>{
  if(seen.has(file))return 0;seen.add(file);
  const content=await readFile(file,'utf8');let total=gzipSync(content).byteLength;
  const imports=[...content.matchAll(/(?:from\s*|import\s*)['"]([^'"]+)['"]/g)].map(m=>m[1]!);
  for(const imp of imports){if(!imp.startsWith('.'))throw new Error(`Non-native runtime dependency ${imp}`);total+=await bytes(resolve(dirname(file),imp));}
  return total;
}
const js=await bytes(resolve('dist/assets/main.js'))+await bytes(resolve('dist/assets/preferences.js'));
const css=gzipSync(await readFile('dist/assets/styles.css')).byteLength;
for(const f of await readdir('src/components'))if(f.endsWith('.ts')&&(await readFile(`src/components/${f}`,'utf8')).split('\n').length>=300)throw new Error(`${f} exceeds component line budget`);
const report={jsGzipBytes:js,cssGzipBytes:css,jsLimitBytes:30*1024,cssLimitBytes:35*1024,modules:seen.size};
await mkdir('docs',{recursive:true});await writeFile('docs/budgets.json',JSON.stringify(report,null,2)+'\n');
console.log(`Per-page gzip: JS ${(js/1024).toFixed(2)} KB / 30 KB; CSS ${(css/1024).toFixed(2)} KB / 35 KB (${seen.size} native modules).`);
if(js>30*1024||css>35*1024)throw new Error('Asset budget exceeded');
