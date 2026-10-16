import {test} from 'node:test';
import assert from 'node:assert/strict';
import {resolveTransition} from '../src/lib/resolve-transition.js';
import {createPositions, positionFor, directoryFloor, type RoutePosition} from '../src/lib/coordinates.js';
import {visibleNotices,exhibitionStatus,hoursForDate,localDate} from '../src/lib/dates.js';
import {hallSchema,noticeSchema,loadContent} from '../src/lib/content.js';
const p: RoutePosition = {path:'/a/',floor:2,depth:1,x:2,wing:'life'};
const cases = [
  [{},'reload'],[{path:'/b/'},'reload'],[{floor:3,depth:0,x:0},'ascend'],[{floor:1,depth:3,x:9},'descend'],
  [{depth:2,x:0},'enter'],[{depth:0,x:9},'exit'],[{x:1},'lateral-l'],[{x:3},'lateral-r']
] as const;
for (const [delta,type] of cases) test(`resolver ${JSON.stringify(delta)} → ${type}`,()=>assert.equal(resolveTransition(p,{...p,...delta}),type));
test('notice includes announcement and end date; excludes expired/future',()=>{
  const n={start:'2026-10-27',end:'2026-10-29',announceFrom:'2026-10-01'};
  for (const day of ['2026-10-01','2026-10-15','2026-10-29']) assert.equal(visibleNotices([n],day).length,1);
  for (const day of ['2026-09-30','2026-10-30']) assert.equal(visibleNotices([n],day).length,0);
});
test('dates are Denver calendar dates and exhibitions use inclusive boundaries',()=>{
  assert.equal(localDate(new Date('2026-10-16T01:00:00Z')),'2026-10-15');
  assert.equal(exhibitionStatus({start:'2026-10-16',end:null},'2026-10-15'),'coming');
  assert.equal(exhibitionStatus({start:null,end:'2027-01-03'},'2027-01-03'),'current');
  assert.equal(exhibitionStatus({start:null,end:'2027-01-03'},'2027-01-04'),'past');
  assert.equal(hoursForDate('2026-12-25','regular','closed','friday'),'closed');
  assert.equal(hoursForDate('2026-10-16','regular','closed','friday'),'friday');
  assert.equal(hoursForDate('2026-10-15','regular','closed','friday'),'regular');
});
test('loaders reject invalid data and route map covers all content',async()=>{
  const c=await loadContent();
  assert.throws(()=>hallSchema.parse({...c.halls[0],floor:9}));
  assert.throws(()=>hallSchema.parse({...c.halls[0],source:'javascript:alert(1)'}));
  assert.throws(()=>noticeSchema.parse({...c.notices[0],end:'2026-01-01'}));
  assert.throws(()=>noticeSchema.parse({...c.notices[0],start:'2026-02-30'}));
  const routes=createPositions(c.halls,c.exhibitions,c.theaters,c.pages);
  assert.equal(new Set(routes.map(p=>p.path)).size,routes.length);
  const dir=positionFor(new URL('https://concept.test/halls/?floor=3'),routes)!;
  const hall=positionFor(new URL('https://concept.test/halls/prehistoric-journey/'),routes)!;
  assert.equal(resolveTransition(dir,hall),'enter');
  assert.equal(resolveTransition(hall,dir),'exit');
  assert.equal(directoryFloor('unknown'),null);
  assert.equal(directoryFloor(''),null);
  assert.equal(positionFor(new URL('https://concept.test/missing/'),routes),undefined);
});
