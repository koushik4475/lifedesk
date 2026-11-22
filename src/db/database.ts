import Dexie, { type EntityTable } from 'dexie';
export type Task={id:string;title:string;description:string;priority:'low'|'medium'|'high';dueAt:string;category:string;completedAt:string|null;recurrence:'none'|'daily'|'weekly'|'monthly';createdAt:string;updatedAt:string};
export type EventItem={id:string;title:string;description:string;startsAt:string;endsAt:string;allDay:boolean;createdAt:string};
export type Habit={id:string;name:string;targetDays:number[];color:string;archivedAt:string|null;createdAt:string};
export type HabitEntry={id:string;habitId:string;localDate:string;completedAt:string};
export type Note={id:string;title:string;body:string;tags:string[];pinned:boolean;createdAt:string;updatedAt:string};
export type Transaction={id:string;type:'income'|'expense';amountMinor:number;currency:string;category:string;occurredOn:string;note:string;createdAt:string};
export type RecordItem={id:string;name:string;kind:string;dueOn:string;note:string;createdAt:string;updatedAt:string};
class LifeDeskDB extends Dexie {
 tasks!:EntityTable<Task,'id'>; events!:EntityTable<EventItem,'id'>; habits!:EntityTable<Habit,'id'>; habitEntries!:EntityTable<HabitEntry,'id'>; notes!:EntityTable<Note,'id'>; transactions!:EntityTable<Transaction,'id'>; records!:EntityTable<RecordItem,'id'>; settings!:EntityTable<{key:string;value:unknown},'key'>;
 constructor(){super('lifedesk');this.version(1).stores({tasks:'id,title,dueAt,completedAt,priority,category',events:'id,startsAt,endsAt',habits:'id,name,archivedAt',habitEntries:'id,habitId,localDate,[habitId+localDate]',notes:'id,title,*tags,pinned,updatedAt',transactions:'id,type,occurredOn,category',records:'id,name,kind,dueOn',settings:'key'});}
}
export const db=new LifeDeskDB();
export const uid=()=>crypto.randomUUID();
export const todayKey=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
