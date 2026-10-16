import {wireNavigation} from './lib/navigation.js';
import {wireFilters} from './lib/filters.js';
import {announce,pageCopy} from './lib/motion.js';
import {DmnsHeader} from './components/dmns-header.js';
import {DmnsMinimap} from './components/dmns-minimap.js';
import {DmnsDoorway} from './components/dmns-doorway.js';
import {DmnsFloorplan} from './components/dmns-floorplan.js';
import {DmnsVitrine} from './components/dmns-vitrine.js';
import {DmnsNotice} from './components/dmns-notice.js';
import {DmnsEventCorridor} from './components/dmns-event-corridor.js';
import {DmnsSealedHall} from './components/dmns-sealed-hall.js';
wireNavigation();
const elements = {'dmns-header':DmnsHeader,'dmns-minimap':DmnsMinimap,'dmns-doorway':DmnsDoorway,'dmns-floorplan':DmnsFloorplan,'dmns-vitrine':DmnsVitrine,'dmns-notice':DmnsNotice,'dmns-event-corridor':DmnsEventCorridor,'dmns-sealed-hall':DmnsSealedHall} as const;
for(const [name,element] of Object.entries(elements))customElements.define(name,element);
wireFilters();
const root=document.documentElement;
root.dataset.vt=String('startViewTransition' in document);
root.dataset.vtClasses=String(CSS.supports('view-transition-class: a'));
root.dataset.scrollTimelines=String(CSS.supports('animation-timeline: view()'));
if(!('CSSViewTransitionRule' in window && 'onpageswap' in window && 'onpagereveal' in window))root.dataset.entrance='fallback';
if(HTMLScriptElement.supports?.('speculationrules')){
  const rules=document.createElement('script');rules.type='speculationrules';
  rules.textContent=JSON.stringify({prerender:[{source:'document',where:{and:[{selector_matches:'dmns-doorway a[href]'},{not:{href_matches:'https://*'}}]},eagerness:'moderate'}]});document.head.append(rules);
}
const form=document.querySelector<HTMLFormElement>('[data-newsletter]');
const submit=form?.querySelector<HTMLButtonElement>('[data-newsletter-submit]');
if(form&&submit){submit.disabled=false;const preview=(event:Event)=>{event.preventDefault();if(!form.reportValidity())return;form.reset();const hint=form.querySelector('.form-hint');if(hint)hint.textContent=pageCopy('newsletterThanks');announce(pageCopy('newsletterThanks'));};submit.addEventListener('click',preview);form.addEventListener('submit',preview);}
