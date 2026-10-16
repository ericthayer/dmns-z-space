import {transition,announce,pageCopy} from './motion.js';
export function wireFilters():void {
  document.querySelectorAll<HTMLElement>('[data-filter-region]').forEach(region=>{
    const bar=region.querySelector<HTMLElement>('.filter-bar');if(bar)bar.hidden=false;
    let request=0;
    const items=[...region.querySelectorAll<HTMLElement>('[data-filter]')];
    region.querySelectorAll<HTMLButtonElement>('[data-filter-button]').forEach(button=>button.addEventListener('click',async()=>{
      const current=++request;
      items.forEach((el,i)=>{el.style.viewTransitionName=`filter-item-${i}`;el.style.setProperty('view-transition-class','gallery-item');});
      try{
        await transition(()=>{
          const value=button.dataset.filterButton;
          for(const item of items)item.hidden=value!=='all'&&item.dataset.filter!==value;
          region.querySelectorAll('[data-filter-button]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
          const empty=region.querySelector<HTMLElement>('[data-empty]');if(empty)empty.hidden=items.some(i=>!i.hidden);
        },['reload']);
        if(current===request){region.querySelector<HTMLElement>('[data-filter-heading]')?.focus({preventScroll:true});announce(`${pageCopy('resultChanged')}: ${items.filter(i=>!i.hidden).length}`);}
      }finally{if(current===request)items.forEach(el=>{el.style.removeProperty('view-transition-name');el.style.removeProperty('view-transition-class');});}
    }));
  });
}
