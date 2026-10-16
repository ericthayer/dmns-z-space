import {transition,announce,pageCopy} from '../lib/motion.js';
export class DmnsVitrine extends HTMLElement {
  #busy=false;
  connectedCallback():void {
    const dialog=this.querySelector('dialog');
    const opener=this.querySelector<HTMLButtonElement>('[data-open-vitrine]');
    const close=this.querySelector<HTMLButtonElement>('[data-close-vitrine]');
    const thumb=this.querySelector<HTMLElement>('.vitrine-plate [data-shared-image]');
    const large=this.querySelector<HTMLElement>('.dialog-plate [data-shared-image]');
    if(!dialog||!opener||!close||!thumb||!large||!('showModal' in dialog))return;
    opener.hidden=false;
    this.querySelector<HTMLElement>('.vitrine-fallback')!.hidden=true;
    const morph=async(open:boolean)=>{
      if(this.#busy)return;this.#busy=true;
      const before=open?thumb:large,after=open?large:thumb;
      before.style.viewTransitionName='vitrine-object';
      try{
        await transition(()=>{before.style.removeProperty('view-transition-name');after.style.viewTransitionName='vitrine-object';if(open)dialog.showModal();else dialog.close();},[open?'enter':'exit']);
        if(open){dialog.querySelector<HTMLElement>('h2')?.focus({preventScroll:true});announce(pageCopy('objectDetails'));}
        else opener.focus({preventScroll:true});
      }finally{thumb.style.removeProperty('view-transition-name');large.style.removeProperty('view-transition-name');this.#busy=false;}
    };
    opener.addEventListener('click',()=>{void morph(true);});
    close.addEventListener('click',()=>{void morph(false);});
    dialog.addEventListener('cancel',e=>{e.preventDefault();void morph(false);});
    dialog.addEventListener('close',()=>{if(!this.#busy)opener.focus({preventScroll:true});});
  }
}
declare global {interface HTMLElementTagNameMap {'dmns-vitrine':DmnsVitrine}}
