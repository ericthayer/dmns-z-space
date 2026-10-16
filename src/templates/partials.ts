import type {Content,Media,Hall} from '../lib/content.js';
import {exhibitionStatus, visibleNotices} from '../lib/dates.js';
export const esc = (value: unknown): string => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export const json = (value: unknown): string => JSON.stringify(value).replace(/</g,'\\u003c');
export function ui(c: Content, key: string): string {
  const value = c.site.ui[key];
  if (!value) throw new Error(`Missing UI copy: ${key}`);
  return esc(value);
}
export const copy = (value: string): string => value.includes('TODO:') ? `<span class="pending">${esc(value)}</span>` : esc(value);
export const arrow = '<span aria-hidden="true">↗</span>';
export function link(href: string, label: string, cls = ''): string {
  return `<a class="${esc(cls)}" href="${esc(href)}"${href.startsWith('https:') ? ' rel="external"' : ''}>${esc(label)} ${href.startsWith('https:') ? arrow : '<span aria-hidden="true">↗</span>'}</a>`;
}
export function plate(c: Content, key: string, name: string, cls='', lcp=false): string {
  const m: Media = c.media[key]!;
  if (!m) throw new Error(`Missing plate ${key}`);
  const art = m.placeholder ? `<div class="plate-art" aria-hidden="true"><span class="plate-orbit"></span><span class="plate-axis"></span></div>` : `<picture>${m.avif ? `<source type="image/avif" srcset="${esc(m.avif)}">` : ''}${m.webp ? `<source type="image/webp" srcset="${esc(m.webp)}">` : ''}<img src="${esc(m.src)}" alt="${esc(m.alt)}" width="${m.width ?? 1200}" height="${m.height ?? 900}" ${lcp?'fetchpriority="high"':'loading="lazy"'}></picture>`;
  return `<div class="plate ${esc(cls)}" data-shared-image>${art}<div class="plate-caption"><span class="eyebrow">${ui(c,'placeholder')}</span><span>${esc(name)}</span><span class="plate-credit">${esc(m.credit)}</span></div></div>`;
}
export function hallCard(c: Content, h: Hall, i: number): string {
  return `<li class="hall-item" data-wing="${h.wing}"><dmns-doorway><a href="/halls/${h.slug}/" class="hall-link" data-hall="${h.slug}">${plate(c,h.media,h.name)}<span class="hall-meta eyebrow"><span>${esc(h.floorNote)}</span><span>${String(i+1).padStart(2,'0')}</span></span><h3 data-shared-title>${esc(h.name)}</h3><p>${esc(h.description)}</p><span class="text-link">${ui(c,'openDoor')} ${arrow}</span>${h.sealed ? `<span class="scrim-label">${ui(c,'sealedLabel')}</span>`:''}</a></dmns-doorway></li>`;
}
export function exhibitionCards(c: Content, today: string): string {
  return c.exhibitions.map((e,i) => `<li class="exhibition-item" data-wing="special" data-filter="${exhibitionStatus(e,today)}" data-item="exhibition-${i}"><dmns-doorway><a href="/special-exhibitions/${e.slug}/" data-hall="${e.slug}">${plate(c,e.media,e.name)}<p class="eyebrow exhibition-date">${esc(e.dateLabel)}</p><h3 data-shared-title>${esc(e.name)}</h3><span class="text-link">${ui(c,'openDoor')} ${arrow}</span></a></dmns-doorway></li>`).join('');
}
export function notice(c: Content, today: string): string {
  return `<dmns-notice aria-live="polite" aria-atomic="true"><div id="status" class="sr-only"></div>${visibleNotices(c.notices,today).map(n=>`<aside class="notice" data-notice="${esc(n.id)}"><span class="notice-symbol" aria-hidden="true">i</span><div><p class="eyebrow">${esc(n.title)}</p><p>${esc(n.body)} <a href="${esc(n.href)}">${ui(c,'openDoor')}</a></p></div><button hidden data-dismiss aria-label="${ui(c,'dismiss')}">×</button></aside>`).join('')}</dmns-notice>`;
}
export function eventCorridor(c: Content): string {
  return `<dmns-event-corridor><div class="section-heading"><div><p class="eyebrow">${ui(c,'eventLabel')}</p><h2>${ui(c,'eventTitle')}</h2></div><div class="corridor-controls" hidden><button data-step="-1" aria-controls="events-track" aria-label="${ui(c,'previousEvents')}">←</button><button data-step="1" aria-controls="events-track" aria-label="${ui(c,'nextEvents')}">→</button></div></div><ul class="event-track" id="events-track">${c.events.map((e,i)=>`<li><span class="event-number">0${i+1}</span><div><p class="eyebrow">${esc(e.category)}</p><h3>${copy(e.name)}</h3><p>${ui(c,'dateLabel')}</p>${link(e.href,c.site.ui.sourceLink!)}</div></li>`).join('')}</ul></dmns-event-corridor>`;
}
export function vitrine(c: Content, h: Hall): string {
  return `<section class="diorama section"><div class="diorama-backdrop" aria-hidden="true"></div><dmns-vitrine><div class="vitrine-plate">${plate(c,h.media,h.name)}</div><div class="wall-label"><p class="eyebrow">${ui(c,'objectLabel')}</p><h2>${ui(c,'objectIntro')}</h2><p class="eyebrow">${copy(h.objectMetadata)}</p><p>${ui(c,'objectPending')}</p><button class="text-link" data-open-vitrine hidden>${ui(c,'objectOpen')} <span aria-hidden="true">↗</span></button><details class="vitrine-fallback"><summary>${ui(c,'objectDetails')}</summary><p>${copy(h.objectName)}</p><p>${copy(h.objectDescription)}</p></details></div><dialog aria-labelledby="object-title"><button class="dialog-close" data-close-vitrine aria-label="${ui(c,'objectClose')}">×</button><div class="dialog-layout"><div class="dialog-plate">${plate(c,h.media,h.name)}</div><div class="wall-label"><p class="eyebrow">${ui(c,'objectLabel')}</p><h2 id="object-title" tabindex="-1">${ui(c,'objectDetails')}</h2><p>${copy(h.objectName)}</p><p class="eyebrow">${copy(h.objectMetadata)}</p><p>${copy(h.objectDescription)}</p></div></div></dialog></dmns-vitrine></section>`;
}
