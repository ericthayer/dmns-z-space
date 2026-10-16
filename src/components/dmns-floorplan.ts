import {directoryFloor,type Floor} from '../lib/coordinates.js';
import {transition,announce,pageCopy} from '../lib/motion.js';
export class DmnsFloorplan extends HTMLElement {
  #floor:Floor=1;
  #request=0;
  connectedCallback():void {
    this.#floor=directoryFloor(new URL(location.href).searchParams.get('floor'))??1;
    this.#render();
    this.querySelectorAll<HTMLAnchorElement>('[data-select-floor]').forEach(a=>a.addEventListener('click',async event=>{
      if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||event.button!==0)return;
      event.preventDefault();
      const next=directoryFloor(a.dataset.selectFloor??null);
      if(next===null||next===this.#floor)return;
      const ticket=++this.#request;
      const type=next>this.#floor?'ascend':'descend';
      await transition(()=>{this.#floor=next;this.#render();const url=new URL(location.href);url.searchParams.set('floor',String(next));history.replaceState(null,'',url);},[type]);
      if(ticket!==this.#request)return;
      const heading=this.querySelector<HTMLElement>(`#floor-heading-${next}`);heading?.focus({preventScroll:true});
      announce(`${pageCopy('floorChanged')}: ${heading?.textContent??''}`);
    }));
  }
  #render():void {
    this.querySelectorAll<HTMLElement>('[data-floor-panel]').forEach(p=>{p.hidden=p.dataset.floorPanel!==String(this.#floor);});
    this.querySelectorAll('[data-select-floor]').forEach(a=>{if(a.getAttribute('data-select-floor')===String(this.#floor))a.setAttribute('aria-current','true');else a.removeAttribute('aria-current');});
    document.body.dataset.floor=String(this.#floor);
    this.dataset.wing=({0:'life',1:'space',2:'life',3:'culture'} as const)[this.#floor];
  }
}
declare global {interface HTMLElementTagNameMap {'dmns-floorplan':DmnsFloorplan}}
