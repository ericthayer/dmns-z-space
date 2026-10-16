import {readFile} from 'node:fs/promises';
import {z} from 'zod';
const text = z.string().min(1);
const slug = text.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const floor = z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]);
const wing = z.enum(['space','life','wildlife','culture','special','theaters','neutral']);
const href = text.refine(v => /^\/(?!\/)/.test(v) || /^https:\/\//.test(v), 'Expected a local path or HTTPS URL');
const date = z.iso.date();
const link = z.object({label:text, href});
export const hallSchema = z.object({slug, name:text, floor:floor.nullable(), wing, description:text, media:text, sealed:z.boolean(), floorNote:text, objectName:text, objectMetadata:text, objectDescription:text, source:href});
export const exhibitionSchema = z.object({slug,name:text,start:date.nullable(),end:date.nullable(),dateLabel:text,kind:z.enum(['exhibition','evening']),description:text,media:text,source:href});
export const theaterSchema = z.object({slug,name:text,description:text,media:text,source:href});
export const noticeSchema = z.object({id:slug,title:text,body:text,start:date,end:date,announceFrom:date,href}).refine(n => n.start <= n.end && n.announceFrom <= n.start, 'Notice dates out of order');
export const mediaSchema = z.record(text,z.object({src:href,alt:text,credit:text,placeholder:z.boolean(),webp:href.optional(),avif:href.optional(),width:z.number().positive().optional(),height:z.number().positive().optional()}));
const pageSchema = z.object({path:href,name:text,eyebrow:text,intro:text,floor,wing,sections:z.array(z.object({title:text,body:text,url:href.optional()}))});
const eventSchema = z.object({id:slug,name:text,date:date.nullable(),category:text,description:text,href});
const programSchema = z.object({name:text,description:text,category:z.enum(['events','learning']),href});
const siteSchema = z.object({name:text,shortName:text,concept:text,conceptLabel:text,description:text,timezone:text,seedDate:date,todayLabel:text,hours:text,fridayHours:text,closures:text,address:text,ticketUrl:href,membershipUrl:href,donateUrl:href,landAcknowledgment:text,landSource:href,legal:text,credentials:z.array(text),nav:z.array(link),footerNav:z.array(link),socials:z.array(link),policies:z.array(link),ui:z.record(text,text),doors:z.array(z.object({name:text,description:text,href,meta:text,wing})),floorLabels:z.array(text).length(4)});
export type Hall = z.infer<typeof hallSchema>;
export type Exhibition = z.infer<typeof exhibitionSchema>;
export type Theater = z.infer<typeof theaterSchema>;
export type Page = z.infer<typeof pageSchema>;
export type Media = z.infer<typeof mediaSchema>[string];
export async function loadContent(root = 'content') {
  async function load<T>(file: string, schema: z.ZodType<T>): Promise<T> {
    return schema.parse(JSON.parse(await readFile(`${root}/${file}.json`, 'utf8')));
  }
  const [site,halls,exhibitions,theaters,events,notices,media,pages,programs] = await Promise.all([
    load('site',siteSchema),load('halls',z.array(hallSchema)),load('exhibitions',z.array(exhibitionSchema)),load('theaters',z.array(theaterSchema)),load('events',z.array(eventSchema)),load('notices',z.array(noticeSchema)),load('media',mediaSchema),load('pages',z.array(pageSchema)),load('programs',z.array(programSchema))]);
  for (const group of [halls,exhibitions,theaters]) {
    if (new Set(group.map(x=>x.slug)).size !== group.length) throw new Error('Duplicate slug');
    for (const item of group) if (!media[item.media]) throw new Error(`Missing media: ${item.media}`);
  }
  return {site,halls,exhibitions,theaters,events,notices,media,pages,programs};
}
export type Content = Awaited<ReturnType<typeof loadContent>>;
