import {pageCopy,readPreference,writePreference,skipActiveTransition,announce} from '../lib/motion.js';
export class DmnsHeader extends HTMLElement {
  connectedCallback():void {
    const still=this.querySelector<HTMLButtonElement>('[data-stillness]');
    const theme=this.querySelector<HTMLButtonElement>('[data-theme-toggle]');
    if(still){
      still.hidden=false;still.setAttribute('aria-pressed',String(readPreference('stillness')==='true'));
      still.addEventListener('click',()=>{
        skipActiveTransition();const next=document.documentElement.dataset.stillness!=='true';
        document.documentElement.dataset.stillness=String(next);still.setAttribute('aria-pressed',String(next));writePreference('stillness',String(next));
        announce(`${pageCopy('stillness')}: ${pageCopy(next?'on':'off')}`);
      });
    }
    if(theme){
      theme.hidden=false;
      const sync=()=>{const next=document.documentElement.dataset.theme==='light'?'afterHours':'daylight';theme.setAttribute('aria-label',pageCopy(next));theme.title=pageCopy(next);};
      sync();theme.addEventListener('click',()=>{const next=document.documentElement.dataset.theme==='light'?'dark':'light';document.documentElement.dataset.theme=next;writePreference('theme',next);sync();});
    }
  }
}
declare global {interface HTMLElementTagNameMap {'dmns-header':DmnsHeader}}
