export type Kind = 'expense' | 'income';
export type Frequency = 'weekly' | 'biweekly' | 'monthly' | 'yearly';
export type MealPlan = 'none' | 'partial' | 'full';
export type Category = { id: string; name: string; emoji: string; budget: number };
export type Account = { id: string; name: string; openingBalance: number };
export type Transaction = { id: string; date: string; amount: number; kind: Kind; categoryId: string; accountId: string; note: string };
export type Recurring = { id: string; start: string; end: string; amount: number; kind: Kind; categoryId: string; accountId: string; note: string; frequency: Frequency };
export type State = { accounts: Account[]; categories: Category[]; transactions: Transaction[]; recurring: Recurring[]; mealPlan: MealPlan; mealPlanEdited: boolean; savingsGoalDate: string };
export const CATEGORIES: Category[] = [
  {id:'groceries',name:'Groceries',emoji:'🥑',budget:75},
  {id:'weekend',name:'Weekend fun',emoji:'🎉',budget:70},
  {id:'dining',name:'Coffee & bites',emoji:'☕',budget:35},
  {id:'rent',name:'Rent',emoji:'🏠',budget:0},
  {id:'utilities',name:'Utilities',emoji:'💡',budget:15},
  {id:'transport',name:'Transportation',emoji:'🚙',budget:20},
  {id:'clothes',name:'Clothes',emoji:'🛍️',budget:20},
  {id:'beauty',name:'Makeup & beauty',emoji:'💄',budget:15},
  {id:'gym',name:'Gym membership',emoji:'🏋️',budget:10},
  {id:'school',name:'School stuff',emoji:'📚',budget:15},
  {id:'subscriptions',name:'Subscriptions',emoji:'🎧',budget:10},
  {id:'other',name:'Miscellaneous',emoji:'✨',budget:20},
  {id:'pay',name:'Paycheck',emoji:'💵',budget:0},
  {id:'savings',name:'Savings / Starting Money',emoji:'🏦',budget:0},
  {id:'scholarship',name:'Aid & scholarships',emoji:'🎓',budget:0},
  {id:'gift',name:'Gifts & other income',emoji:'🎁',budget:0},
];
export const initialState: State = {
  accounts:[{id:'checking',name:'Checking',openingBalance:0},{id:'savings',name:'Savings',openingBalance:0}],
  categories:CATEGORIES, transactions:[],recurring:[],mealPlan:'none',mealPlanEdited:false,savingsGoalDate:'2027-06-28'
};
export function localDate(date: Date): string {return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;}
export function parseLocal(ymd:string):Date { const [y,m,d]=ymd.split('-').map(Number);return new Date(y,m-1,d,12); }
export function addDays(date: Date,n:number) {const x=new Date(date);x.setDate(x.getDate()+n);return x;}
export function weekStart(ymd:string):string {const d=parseLocal(ymd);const offset=(d.getDay()+6)%7;return localDate(addDays(d,-offset));}
export function money(n:number) {return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n);}
export function nextScheduleDate(start:string,frequency:Frequency,n:number):string {
  const origin=parseLocal(start);
  if(frequency==='weekly'||frequency==='biweekly')return localDate(addDays(origin,n*(frequency==='weekly'?7:14)));
  const monthOffset=frequency==='monthly'?n:n*12;
  const first=new Date(origin.getFullYear(),origin.getMonth()+monthOffset,1,12);
  const lastDay=new Date(first.getFullYear(),first.getMonth()+1,0,12).getDate();
  first.setDate(Math.min(origin.getDate(),lastDay));
  return localDate(first);
}
export function occurrences(items:Recurring[],through:string):Transaction[] {
  const out:Transaction[]=[];
  for(const r of items){
    if(!r.start || r.start>through)continue;
    for(let n=0;n<1500;n++){
      const date=nextScheduleDate(r.start,r.frequency,n);
      if(date>through || (r.end && date>r.end))break;
      out.push({id:`rec:${r.id}:${date}`,date,amount:r.amount,kind:r.kind,categoryId:r.categoryId,accountId:r.accountId,note:r.note||'Recurring payment'});
    }
  }
  return out;
}
export function allTransactions(state:State,through:string){return [...state.transactions.filter(t=>t.date<=through),...occurrences(state.recurring,through)].sort((a,b)=>b.date.localeCompare(a.date));}
export function weeklyTotal(items:Transaction[],categoryId:string,week:string){const end=localDate(addDays(parseLocal(week),6));return items.filter(t=>t.kind==='expense'&&t.categoryId===categoryId&&t.date>=week&&t.date<=end).reduce((s,t)=>s+t.amount,0);}
export function accountBalance(account:Account,transactions:Transaction[]){return account.openingBalance+transactions.filter(t=>t.accountId===account.id).reduce((s,t)=>s+(t.kind==='income'?t.amount:-t.amount),0);}
export function newId(){return crypto.randomUUID?.()||`${Date.now()}-${Math.random()}`;}
export function weeksRemaining(goalDate: string): number {
  const today = parseLocal(localDate(new Date()));
  const end = parseLocal(goalDate);

  const days = Math.max(
    0,
    Math.ceil((end.getTime() - today.getTime()) / 86400000)
  );

  return Math.ceil(days / 7);
}