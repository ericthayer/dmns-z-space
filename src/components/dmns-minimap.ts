export class DmnsMinimap extends HTMLElement {
  connectedCallback():void {
    const detail=this.querySelector('details');
    if(detail && matchMedia('(max-width:760px)').matches)detail.open=false;
    document.addEventListener('dmns-floor-change',event=>{
      const floor=(event as CustomEvent<{floor:number}>).detail.floor;
      this.querySelector('.map-active')?.setAttribute('d',`M0 ${-20*(floor-1)}h35v20h-35z`);
      const label=this.querySelector<HTMLElement>('.minimap-location');
      if(label)label.textContent=label.textContent!.replace(/^(?:Floor \d|Outdoors)/,floor===0?'Outdoors':`Floor ${floor}`);
      this.querySelectorAll('.map-floors a').forEach(a=>{if(a.getAttribute('href')===`/halls/?floor=${floor}`)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
    });
  }
}
declare global {interface HTMLElementTagNameMap {'dmns-minimap':DmnsMinimap}}
