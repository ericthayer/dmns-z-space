export class DmnsDoorway extends HTMLElement {
  connectedCallback():void {
    this.addEventListener('keydown',e=>{
      const target=e.target;
      if(e.key===' ' && target instanceof HTMLAnchorElement){e.preventDefault();target.click();}
    });
  }
}
declare global {interface HTMLElementTagNameMap {'dmns-doorway':DmnsDoorway}}
