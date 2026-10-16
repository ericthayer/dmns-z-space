import {reducedMotion} from '../lib/motion.js';
export class DmnsEventCorridor extends HTMLElement {
  connectedCallback():void {
    const track=this.querySelector<HTMLElement>('.event-track');
    const controls=this.querySelector<HTMLElement>('.corridor-controls');
    if(!track||!controls)return;
    controls.hidden=false;
    const buttons=[...controls.querySelectorAll<HTMLButtonElement>('[data-step]')];
    const sync=()=>{for(const b of buttons)b.disabled=Number(b.dataset.step)<0?track.scrollLeft<1:track.scrollLeft+track.clientWidth>=track.scrollWidth-1;};
    buttons.forEach(b=>b.addEventListener('click',()=>track.scrollBy({left:Number(b.dataset.step)*track.clientWidth*.8,behavior:reducedMotion()?'instant':'smooth'})));
    track.addEventListener('scroll',sync,{passive:true});new ResizeObserver(sync).observe(track);sync();
  }
}
declare global {interface HTMLElementTagNameMap {'dmns-event-corridor':DmnsEventCorridor}}
