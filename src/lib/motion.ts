import type {TransitionType} from './coordinates.js';
export interface TransitionHandle {
  types?: Set<string>;
  finished: Promise<void>;
  updateCallbackDone: Promise<void>;
  skipTransition(): void;
}
interface TransitionDocument {startViewTransition?: (options: (()=>void|Promise<void>) | {update:()=>void|Promise<void>;types:string[]})=>TransitionHandle}
let active: TransitionHandle | null = null;
export function readPreference(key: string): string | null {
  try { return localStorage.getItem(`dmns:${key}`); } catch { return null; }
}
export function writePreference(key: string, value: string): void {
  try {localStorage.setItem(`dmns:${key}`,value);} catch { /* Preferences remain usable in this document. */ }
}
export function reducedMotion(): boolean {
  return matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.stillness==='true';
}
export function skipActiveTransition(): void { active?.skipTransition(); }
export function trackTransition(handle: TransitionHandle): void {
  skipActiveTransition(); active=handle;
  void handle.finished.catch(()=>{}).finally(()=>{if(active===handle)active=null;});
}
export async function transition(update: ()=>void|Promise<void>, types: readonly TransitionType[]): Promise<void> {
  skipActiveTransition();
  const doc=document as unknown as TransitionDocument;
  if (!doc.startViewTransition || reducedMotion()) {await update(); return;}
  const options=CSS.supports('selector(:active-view-transition-type(enter))')?{update,types:[...types]}:update;
  const handle=doc.startViewTransition(options);
  trackTransition(handle);
  await handle.updateCallbackDone;
  await handle.finished.catch(()=>{});
}
export function announce(message: string): void {
  const target=document.getElementById('status');
  if(target)target.textContent=message;
}
export function pageCopy(key: string): string {
  const raw=document.getElementById('page-data')?.textContent;
  const data=raw?JSON.parse(raw) as {ui:Record<string,string>}:null;
  return data?.ui[key] ?? key;
}
