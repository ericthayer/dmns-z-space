import {positionFor, type RoutePosition, type TransitionType} from './coordinates.js';
import {resolveTransition} from './resolve-transition.js';
import {trackTransition,skipActiveTransition,type TransitionHandle} from './motion.js';
interface SwapEvent extends Event {activation?:{entry?:{url:string}};viewTransition:TransitionHandle|null}
interface RevealEvent extends Event {viewTransition:TransitionHandle|null}
interface Handoff {type:TransitionType;from:string;to:string;hall:string|null;x:string;y:string;created:number;sealed:boolean}
let lastLink: HTMLAnchorElement | null = null;
let routes: RoutePosition[] = [];
function positions(): RoutePosition[] {
  if(!routes.length)routes=JSON.parse(document.getElementById('route-data')?.textContent??'[]') as RoutePosition[];
  return routes;
}
function handoffKey(url: URL): string {return `dmns:transition:${url.pathname}`;}
function sharedHall(from:URL,to:URL):string|null {
  const slug=(url:URL)=>url.pathname.match(/^\/(?:halls|special-exhibitions|theaters)\/([^/]+)\/$/)?.[1];
  return slug(to)??slug(from)??null;
}
function markShared(slug:string|null,changes:HTMLElement[]):void {
  if(!slug || !/^[a-z0-9-]+$/.test(slug))return;
  const owner=document.querySelector<HTMLElement>(`#hall-hero[data-hall="${slug}"], a[data-hall="${slug}"]`);
  if(!owner || !owner.getClientRects().length)return;
  const image=owner.querySelector<HTMLElement>('[data-shared-image]');
  const title=owner.querySelector<HTMLElement>('[data-shared-title]');
  if(image){image.style.viewTransitionName=`hall-${slug}`;image.style.setProperty('view-transition-class','hall-door');changes.push(image);}
  if(title){title.style.viewTransitionName=`hall-${slug}-title`;title.style.setProperty('view-transition-class','hall-title');changes.push(title);}
}
function configure(handle:TransitionHandle,data:Handoff):void {
  handle.types?.add(data.type);
  document.documentElement.dataset.lastTransition=data.type;
  document.documentElement.style.setProperty('--vt-origin-x',data.x);
  document.documentElement.style.setProperty('--vt-origin-y',data.y);
  if(data.sealed)document.documentElement.dataset.sealedTransition='true';
  const changed:HTMLElement[]=[];
  markShared(data.hall,changed);
  trackTransition(handle);
  void handle.finished.catch(()=>{}).finally(()=>{
    for(const el of changed){el.style.removeProperty('view-transition-name');el.style.removeProperty('view-transition-class');}
    delete document.documentElement.dataset.sealedTransition;
  });
}
export function wireNavigation():void {
  document.addEventListener('click',event=>{
    const anchor=(event.target as Element).closest<HTMLAnchorElement>('a[href]');
    if(anchor){skipActiveTransition();lastLink=anchor;}
  },{capture:true});
  addEventListener('pageswap',event=>{
    const e=event as SwapEvent;
    if(!e.viewTransition || !e.activation?.entry?.url)return;
    const from=new URL(location.href),to=new URL(e.activation.entry.url);
    if(from.origin!==to.origin)return;
    const a=positionFor(from,positions()),b=positionFor(to,positions());
    if(!a||!b)return;
    const rect=lastLink?.href===to.href?lastLink.getBoundingClientRect():null;
    const type=resolveTransition(a,b);
    const editorial=['/about/','/support/'];
    const data:Handoff={type:editorial.includes(to.pathname)||editorial.includes(from.pathname)?(b.depth>a.depth?'enter':b.depth<a.depth?'exit':'reload'):type,from:from.href,to:to.href,hall:sharedHall(from,to),x:rect?`${Math.round(rect.x+rect.width/2)}px`:'50%',y:rect?`${Math.round(rect.y+rect.height/2)}px`:'50%',created:Date.now(),sealed:to.pathname==='/halls/gems-and-minerals/'};
    try{sessionStorage.setItem(handoffKey(to),JSON.stringify(data));}catch{/* Default crossfade still works. */}
    configure(e.viewTransition,data);
  });
  addEventListener('pagereveal',event=>{
    const e=event as RevealEvent;
    if(!e.viewTransition)return;
    const to=new URL(location.href);
    let data:Handoff|null=null;
    try{const raw=sessionStorage.getItem(handoffKey(to));sessionStorage.removeItem(handoffKey(to));if(raw)data=JSON.parse(raw) as Handoff;}catch{/* Storage may be disabled. */}
    if(!data || data.to!==to.href || Date.now()-data.created>15000)return;
    configure(e.viewTransition,data);
  });
  addEventListener('pageshow',()=>{lastLink=null;});
}
