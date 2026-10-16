export class DmnsNotice extends HTMLElement {
  connectedCallback():void {
    this.querySelectorAll<HTMLElement>('[data-notice]').forEach(notice=>{
      const key=`dmns:dismissed:${notice.dataset.notice}`;
      try{if(sessionStorage.getItem(key)==='true'){notice.remove();return;}}catch{/* Session storage is optional. */}
      const button=notice.querySelector<HTMLButtonElement>('[data-dismiss]');
      if(button){button.hidden=false;button.addEventListener('click',()=>{try{sessionStorage.setItem(key,'true');}catch{/* Optional preference. */}const next=notice.nextElementSibling??this.nextElementSibling;notice.remove();if(next instanceof HTMLElement){next.tabIndex=-1;next.focus({preventScroll:true});}});}
    });
  }
}
declare global {interface HTMLElementTagNameMap {'dmns-notice':DmnsNotice}}
