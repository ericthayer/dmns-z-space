import {spawn,type ChildProcess} from 'node:child_process';
export async function previewServer():Promise<()=>void>{
  try{const response=await fetch('http://127.0.0.1:4173/');if(response.ok)return()=>{};}catch{/* Start a local preview if none exists. */}
  const process:ChildProcess=spawn('node',['--import','tsx','scripts/serve.ts'],{stdio:'ignore'});
  for(let i=0;i<100;i++){try{if((await fetch('http://127.0.0.1:4173/')).ok)return()=>{process.kill();};}catch{/* Wait for startup. */}await new Promise(r=>setTimeout(r,100));}
  process.kill();throw new Error('Preview server did not start');
}
