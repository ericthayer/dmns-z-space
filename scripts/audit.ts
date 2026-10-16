import lighthouse from 'lighthouse';
import {chromium} from 'playwright';
import {writeFile,mkdir} from 'node:fs/promises';
import {previewServer} from './runtime.js';
const stop=await previewServer();
const browser=await chromium.launch({args:['--remote-debugging-port=9222']});
await mkdir('docs/audits',{recursive:true});
const results=[];let failed=false;
try{
  for(const [name,path] of [['atrium','/'],['directory','/halls/?floor=3'],['hall','/halls/prehistoric-journey/']] as const){
    const result=await lighthouse(`http://127.0.0.1:4173${path}`,{port:9222,output:'html',logLevel:'error',onlyCategories:['performance','accessibility','best-practices','seo'],formFactor:'mobile',screenEmulation:{mobile:true,width:412,height:823,deviceScaleFactor:1.75,disabled:false},throttling:{rttMs:150,throughputKbps:1638.4,cpuSlowdownMultiplier:4,requestLatencyMs:562.5,downloadThroughputKbps:1474.56,uploadThroughputKbps:675},throttlingMethod:'simulate'});
    if(!result)throw new Error('Lighthouse returned no result');
    const {lhr}=result;
    const scores=Object.fromEntries(Object.entries(lhr.categories).map(([key,val])=>[key,Math.round((val.score??0)*100)]));
    const lcp=lhr.audits['largest-contentful-paint']?.numericValue??Infinity;
    const cls=lhr.audits['cumulative-layout-shift']?.numericValue??Infinity;
    const tbt=lhr.audits['total-blocking-time']?.numericValue??Infinity;
    const item={name,path,scores,lcpMs:lcp,cls,tbtMs:tbt,fetchTime:lhr.fetchTime,browser:await browser.version(),failedAudits:Object.values(lhr.audits).filter(a=>a.score!==null&&a.score<1&&a.scoreDisplayMode==='binary').map(a=>({id:a.id,title:a.title,description:a.description,details:a.details}))};
    results.push(item);console.log(JSON.stringify(item,null,2));
    await writeFile(`docs/audits/${name}.html`,Array.isArray(result.report)?result.report[0]!:result.report);
    failed||=(scores.performance??0)<95||(scores.accessibility??0)<100||(scores['best-practices']??0)<100||(scores.seo??0)<100||lcp>2500||cls>.05;
  }
  await writeFile('docs/performance.json',JSON.stringify({method:'Lighthouse mobile lab simulation: 412×823, 4× CPU, simulated slow 4G. This is not a physical Moto G Power or field INP measurement.',results},null,2)+'\n');
  if(failed)throw new Error('Performance/accessibility/SEO budget failed; see docs/performance.json');
}finally{await browser.close();stop();}
