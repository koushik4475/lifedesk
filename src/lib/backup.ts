import {z} from 'zod';
import {db} from '../db/database';
import {recordsMissingLocally} from './domain';
const id=z.string().uuid();
const iso=z.string().min(1);
const task=z.object({id,title:z.string().min(1),description:z.string(),priority:z.enum(['low','medium','high']),dueAt:z.string(),category:z.string(),completedAt:z.string().nullable(),recurrence:z.enum(['none','daily','weekly','monthly']),createdAt:iso,updatedAt:iso}).passthrough();
const event=z.object({id,title:z.string().min(1),description:z.string(),startsAt:iso,endsAt:iso,allDay:z.boolean(),createdAt:iso}).passthrough();
const habit=z.object({id,name:z.string().min(1),targetDays:z.array(z.number().int().min(0).max(6)).min(1),color:z.string(),archivedAt:z.string().nullable(),createdAt:iso}).passthrough();
const calendarDate=z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value)=>{const date=new Date(`${value}T00:00:00.000Z`);return !Number.isNaN(date.getTime())&&date.toISOString().slice(0,10)===value;},{message:'Expected a valid calendar date'});
const entry=z.object({id,habitId:id,localDate:calendarDate,completedAt:iso}).passthrough();
const note=z.object({id,title:z.string(),body:z.string(),tags:z.array(z.string()),pinned:z.boolean(),createdAt:iso,updatedAt:iso}).passthrough();
const transaction=z.object({id,type:z.enum(['income','expense']),amountMinor:z.number().int().nonnegative(),currency:z.string().length(3),category:z.string(),occurredOn:z.string(),note:z.string(),createdAt:iso}).passthrough();
const record=z.object({id,name:z.string().min(1),kind:z.string(),dueOn:z.string(),note:z.string(),createdAt:iso,updatedAt:iso}).passthrough();
const setting=z.object({key:z.string().min(1),value:z.unknown()}).passthrough();
const schema=z.object({version:z.literal(1),exportedAt:z.string().datetime(),data:z.object({tasks:z.array(task),events:z.array(event),habits:z.array(habit),habitEntries:z.array(entry),notes:z.array(note),transactions:z.array(transaction),records:z.array(record),settings:z.array(setting)})});
export function validateBackup(input: unknown) { return schema.parse(input); }
const tables=['tasks','events','habits','habitEntries','notes','transactions','records','settings'] as const;
const primaryKey=(table:typeof tables[number])=>table==='settings'?'key':'id';
export async function exportBackup(){const data:any={};for(const t of tables)data[t]=await (db[t] as any).toArray();return {version:1 as const,exportedAt:new Date().toISOString(),data};}
export async function importBackup(input:unknown,mode:'merge'|'replace'){
 const parsed=validateBackup(input);
 const safety=await exportBackup();
 if(mode==='replace'){
  const blob=new Blob([JSON.stringify(safety,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;a.download=`lifedesk-safety-${Date.now()}.json`;a.click();URL.revokeObjectURL(url);
 }
 await db.transaction('rw',[db.tasks,db.events,db.habits,db.habitEntries,db.notes,db.transactions,db.records,db.settings],async()=>{
  if(mode==='replace')for(const t of tables)await (db[t] as any).clear();
  for(const t of tables){
   const table=db[t] as any;
   const key=primaryKey(t);
   const incoming=(parsed.data as any)[t] as Record<string,unknown>[];
   if(!incoming.length)continue;
   const uniqueKeys=[...new Set(incoming.map((row)=>String(row[key])))];
   const existing=mode==='merge'?await table.bulkGet(uniqueKeys):[];
   const existingKeys = new Set<string>(existing.filter(Boolean).map((row:any) => String(row[key])));
   const additions=recordsMissingLocally(incoming,existingKeys,(row)=>String(row[key]));
   if(additions.length)await table.bulkAdd(additions);
  }
 });
}
