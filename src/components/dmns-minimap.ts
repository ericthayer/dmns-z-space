export class DmnsMinimap extends HTMLElement {
  connectedCallback():void {
    const detail=this.querySelector('details');
    if(detail && matchMedia('(max-width:760px)').matches)detail.open=false;
  }
}
declare global {interface HTMLElementTagNameMap {'dmns-minimap':DmnsMinimap}}
