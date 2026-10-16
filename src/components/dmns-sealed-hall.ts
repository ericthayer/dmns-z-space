export class DmnsSealedHall extends HTMLElement {
  connectedCallback():void {this.dataset.sealed='true';}
}
declare global {interface HTMLElementTagNameMap {'dmns-sealed-hall':DmnsSealedHall}}
