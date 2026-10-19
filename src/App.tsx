import {useEffect,useMemo,useState} from 'react';
import {Plus,Trash2,Download,Upload,Wallet,SlidersHorizontal,ChartNoAxesColumn,Repeat2,Heart,ChevronDown} from 'lucide-react';
import {State,Kind,Frequency,MealPlan,initialState,localDate,parseLocal,weekStart,money,allTransactions,weeklyTotal,accountBalance,newId, weeksRemaining} from './logic';

type Tab='home'|'activity'|'recurring'|'settings';
const today=()=>localDate(new Date());
const load=():State=>{try{const raw=localStorage.getItem('campus-cash-v1');if(!raw)return initialState;const saved=JSON.parse(raw) as Partial<State>;return {...initialState,...saved,accounts:saved.accounts||initialState.accounts,categories:saved.categories||initialState.categories,transactions:saved.transactions||[],recurring:saved.recurring||[]};}catch{return initialState;}};
const toNumber=(x:string)=>Math.max(0,Number(x)||0);
export default function App(){
 const [state,setState]=useState<State>(load);const [tab,setTab]=useState<Tab>('home');const [showEntry,setShowEntry]=useState(false);const [editRecurring,setEditRecurring]=useState(false);const [selectedWeek,setSelectedWeek]=useState(weekStart(today()));
 const [kind,setKind]=useState<Kind>('expense');const [amount,setAmount]=useState('');const [category,setCategory]=useState('groceries');const [account,setAccount]=useState('checking');const [date,setDate]=useState(today());const [note,setNote]=useState('');const [frequency,setFrequency]=useState<Frequency>('monthly');const [endDate,setEndDate]=useState('');
 const [setupDone, setSetupDone] = useState(
  () => localStorage.getItem('campus-cash-setup') === 'done'
 );
 const [setupStep, setSetupStep] = useState(1);
 useEffect(()=>{localStorage.setItem('campus-cash-v1',JSON.stringify(state));},[state]);
 const all=useMemo(()=>allTransactions(state,today()),[state]);
 const weekEnd=localDate(new Date(parseLocal(selectedWeek).getTime()+6*86400000));
 const weekTransactions=all.filter(t=>t.date>=selectedWeek&&t.date<=weekEnd);
 const spent=weekTransactions.filter(t=>t.kind==='expense').reduce((n,t)=>n+t.amount,0);
 const weeklyBudget=state.categories.reduce((n,c)=>n+c.budget,0);
 const balances=state.accounts.map(a=>({...a,balance:accountBalance(a,all)}));
 const balance=balances.reduce((n,a)=>n+a.balance,0);
 const weeksLeft = weeksRemaining(state.savingsGoalDate);

// Calculate future recurring transactions through graduation
const futureTransactions = allTransactions(
  state,
  state.savingsGoalDate
).filter(t =>
  t.date > today() &&
  t.date <= state.savingsGoalDate
);

// Future income
const futureIncome = futureTransactions
  .filter(t => t.kind === 'income')
  .reduce((sum, t) => sum + t.amount, 0);

// Future expenses
const futureExpenses = futureTransactions
  .filter(t => t.kind === 'expense')
  .reduce((sum, t) => sum + t.amount, 0);

// Amount available after future income and bills
const projectedBalance =
  balance + futureIncome - futureExpenses;

// Weekly spending allowance
const weeklyAllowance = weeksLeft > 0
  ? Math.max(0, projectedBalance / weeksLeft)
  : 0;
// Categories already covered by scheduled recurring bills
const recurringExpenseCategories = new Set(
  state.recurring
    .filter(r =>
      r.kind === 'expense' &&
      (!r.end || r.end >= today()) &&
      r.start <= state.savingsGoalDate
    )
    .map(r => r.categoryId)
);

// Weekly spending that isn't already included in fixed bills
const plannedWeeklySpending = state.categories
  .filter(c =>
    !incomeIds.includes(c.id) &&
    !recurringExpenseCategories.has(c.id)
  )
  .reduce((sum, c) => sum + c.budget, 0);

// Project how much you'll spend before your goal date
const projectedWeeklyExpenses =
  plannedWeeklySpending * weeksLeft;

// Money remaining after bills AND planned weekly spending
const projectedMoneyLeft =
  projectedBalance - projectedWeeklyExpenses;

// Weekly spending difference from your break-even allowance
const weeklyDifference =
  weeklyAllowance - plannedWeeklySpending;
 const actualIncome=all.filter(t=>t.kind==='income').reduce((n,t)=>n+t.amount,0);
 const currentMonth=today().slice(0,7);
 const monthlyExpense=all.filter(t=>t.kind==='expense'&&t.date.startsWith(currentMonth)).reduce((n,t)=>n+t.amount,0);
 const incomeIds=['pay','savings','scholarship','gift'];
 const categoryChoices=state.categories.filter(c=>
  kind==='income'
    ? incomeIds.includes(c.id) && (!editRecurring || c.id!=='savings')
    : !incomeIds.includes(c.id)
);
 const resetForm=(mode:'single'|'recurring',k:Kind='expense')=>{setKind(k);setAmount('');setCategory(k==='income'?'pay':'groceries');setAccount(state.accounts[0]?.id||'checking');setDate(today());setNote('');setEndDate('');setFrequency('monthly');setEditRecurring(mode==='recurring');setShowEntry(true);};
 const saveEntry = () => {
  if (!Number.isFinite(Number(amount)) || Number(amount) <= 0)
    return alert('Enter an amount above zero.');

  // Savings / Starting Money cannot be recurring
  if (editRecurring && kind === 'income' && category === 'savings')
    return alert('Starting savings cannot be recurring income.');

  if (editRecurring) {
    setState(s => ({
      ...s,
      recurring: [
        ...s.recurring,
        {
          id: newId(),
          amount: Number(amount),
          kind,
          categoryId: category,
          accountId: account,
          start: date,
          end: endDate,
          note,
          frequency
        }
      ]
    }));
  } else {
    setState(s => ({
      ...s,
      transactions: [
        ...s.transactions,
        {
          id: newId(),
          amount: Number(amount),
          kind,
          categoryId: category,
          accountId: account,
          date,
          note
        }
      ]
    }));
  }

  setShowEntry(false);
};
 const removeTx=(id:string)=>{if(confirm('Delete this transaction?'))setState(s=>({...s,transactions:s.transactions.filter(t=>t.id!==id)}));};
 const removeRecurring=(id:string)=>{if(confirm('Delete this recurring schedule and all its generated occurrences?'))setState(s=>({...s,recurring:s.recurring.filter(t=>t.id!==id)}));};
 const download=()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`campus-cash-backup-${today()}.json`;a.click();URL.revokeObjectURL(url);};
 const importData=async(f?:File)=>{if(!f)return;try{const parsed=JSON.parse(await f.text());if(!Array.isArray(parsed.accounts)||!Array.isArray(parsed.categories)||!Array.isArray(parsed.transactions)||!Array.isArray(parsed.recurring))throw new Error('Invalid backup');if(confirm('Replace all current app data with this backup?'))setState({...initialState,...parsed});}catch{alert('That file is not a valid Campus Cash backup.');}};
 const updateMealPlan=(plan:MealPlan)=>{const groceries=plan==='full'?25:plan==='partial'?45:75;setState(s=>({...s,mealPlan:plan,categories:s.categories.map(c=>c.id==='groceries'?{...c,budget:groceries}:c)}));};
 const cat=(id:string)=>state.categories.find(c=>c.id===id);
 const updateSetupRecurring = (
  id: string,
  kind: Kind,
  changes: {
    amount?: number;
    start?: string;
    frequency?: Frequency;
  }
) => {
  const scheduleId = `setup-${id}`;

  setState(s => {
    const existing = s.recurring.find(r => r.id === scheduleId);

    const updated = {
      id: scheduleId,
      kind,
      categoryId: id,
      accountId: existing?.accountId ?? s.accounts[0].id,
      amount: existing?.amount ?? 0,
      start: existing?.start ?? today(),
      end: '',
      note: existing?.note ?? '',
      frequency: existing?.frequency ?? 'monthly' as Frequency,
      ...changes
    };

    return {
      ...s,
      recurring: [
        ...s.recurring.filter(r => r.id !== scheduleId),
        ...(updated.amount > 0 ? [updated] : [])
      ],
      categories: s.categories.map(c =>
        updated.amount > 0 && kind === 'expense' && c.id === id
          ? { ...c, budget: 0 }
          : c
      )
    };
  });
};
 // CAMPUS CASH — FIRST-TIME SETUP SCREEN
if (!setupDone) {
  return (
    <div className="setupScreen">
      <div className="setupCard">

        <h2>campus cash 💸</h2>
        <p>step {setupStep} of 5 ✨</p>

        {/* STEP 1: STARTING MONEY */}
        {setupStep === 1 && (
          <>
            <h1>hey, money bestie! 💗</h1>

            <p>
              Let's get your money situation figured out.
              How much are we starting with?
            </p>

            {state.accounts.map(a => (
              <label className="formlabel" key={a.id}>
                🏦 {a.name} starting balance ($)

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={a.openingBalance}
                  onChange={e =>
                    setState(s => ({
                      ...s,
                      accounts: s.accounts.map(x =>
                        x.id === a.id
                          ? {
                              ...x,
                              openingBalance: toNumber(e.target.value)
                            }
                          : x
                      )
                    }))
                  }
                />
              </label>
            ))}

            <p>
              💡 Add the money you already have in your accounts.
              This won't count as new income.
            </p>
          </>
        )}

        {/* STEP 2: MEAL PLAN */}
        {setupStep === 2 && (
          <>
            <h1>what's the food situation? 🥑</h1>

            <p>
              Dining hall girlie or grocery store regular?
              Let's figure out your food budget.
            </p>

            <div className="choices">
              {([
                ['none', '🛒 No meal plan'],
                ['partial', '🥪 Partial meal plan'],
                ['full', '🍽️ Full meal plan']
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  className={
                    state.mealPlan === value
                      ? 'choice active'
                      : 'choice'
                  }
                  onClick={() => updateMealPlan(value)}
                >
                  {label}
                </button>
              ))}
            </div>

            <h3>
              Your suggested grocery budget:
              {' '}
              {money(
                state.categories.find(
                  c => c.id === 'groceries'
                )?.budget ?? 0
              )} / week
            </h3>

            <p>
              Don't worry! You can customize this later.
            </p>
          </>
        )}
        {/* STEP 3: RECURRING BILLS AND INCOME */}
{setupStep === 3 && (
  <>
    <h1>the bills don't stop 💸</h1>

    <p>
      Let's get your regular payments figured out.
      Add your bills and paychecks so we can plan ahead.
    </p>

    {[
      { id: 'rent', name: '🏠 Rent', kind: 'expense' as Kind },
      { id: 'utilities', name: '💡 Utilities', kind: 'expense' as Kind },
      { id: 'gym', name: '🏋️ Gym membership', kind: 'expense' as Kind },
      { id: 'subscriptions', name: '🎧 Subscriptions', kind: 'expense' as Kind },
      { id: 'pay', name: '💵 Paycheck', kind: 'income' as Kind }
    ].map(item => {
      const recurring = state.recurring.find(
        r => r.id === `setup-${item.id}`
      );

      return (
        <div className="setupBill" key={item.id}>
          <h3>{item.name}</h3>

          <label className="formlabel">
            Amount ($)
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={recurring?.amount ?? ''}
              onChange={e =>
                updateSetupRecurring(item.id, item.kind, {
                  amount: Math.max(0, Number(e.target.value) || 0)
                })
              }
            />
          </label>

          {recurring && (
            <>
              <label className="formlabel">
                First payment date
                <input
                  type="date"
                  value={recurring.start}
                  onChange={e =>
                    updateSetupRecurring(item.id, item.kind, {
                      start: e.target.value
                    })
                  }
                />
              </label>

              <label className="formlabel">
                Repeats
                <select
                  value={recurring.frequency}
                  onChange={e =>
                    updateSetupRecurring(item.id, item.kind, {
                      frequency: e.target.value as Frequency
                    })
                  }
                >
                  <option value="weekly">Every week</option>
                  <option value="biweekly">Every 2 weeks</option>
                  <option value="monthly">Every month</option>
                  <option value="yearly">Every year</option>
                </select>
              </label>
            </>
          )}
        </div>
      );
    })}

    <p className="sub">
      ✨ Only add what applies to you. You can add more
      recurring bills or income later in On Repeat 🔁.
      Choose the next actual payment date if you've already
      paid this month's bill.
    </p>
  </>
)}

        {/* STEP 4: FLEXIBLE WEEKLY BUDGETS */}
        {setupStep === 4 && (
          <>
            <h1>let's make that money last 💅</h1>

            <p>
              College is expensive, but having fun is
              part of the experience. Let's set some goals.
            </p>

            <h3>your weekly spending goals 🎯</h3>

            <p>
              Set how much you'd ideally like to spend
              in each category every week.
            </p>

            {state.categories
              .filter(c =>
                !['pay', 'savings', 'scholarship', 'gift'].includes(c.id) &&
                !recurringExpenseCategories.has(c.id)
                )
              .map(c => (
                <label
                  className="formlabel"
                  key={c.id}
                >
                  {c.emoji} {c.name}

                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={c.budget}
                    onChange={e =>
                      setState(s => ({
                        ...s,
                        categories: s.categories.map(x =>
                          x.id === c.id
                            ? {
                                ...x,
                                budget: toNumber(e.target.value)
                              }
                            : x
                        )
                      }))
                    }
                  />
                </label>
              ))}
          </>
        )}
        {/* STEP 5: SEMESTER GOAL */}
{setupStep === 5 && (
  <>
    <h1>your semester, your money 🎓</h1>

    <p>
      Last step! When does your money need to last until?
    </p>

    <label className="formlabel">
      🎯 Savings goal date
      <input
        type="date"
        value={state.savingsGoalDate}
        onChange={e =>
          setState(s => ({
            ...s,
            savingsGoalDate: e.target.value
          }))
        }
      />
    </label>

    <p>
      🏦 Starting money:{' '}
      {money(state.accounts.reduce(
        (sum, a) => sum + a.openingBalance, 0
      ))}
    </p>

    <p>
      🎉 Flexible weekly budget:{' '}
      {money(plannedWeeklySpending)}
    </p>

    <p className="sub">
      You're ready to start tracking!
      Your dashboard will calculate how long your
      money can last based on your spending and
      scheduled bills.
    </p>
  </>
)}

        {/* NAVIGATION BUTTONS */}
        <div className="setupButtons">

          {setupStep > 1 && (
            <button
              className="outline"
              onClick={() =>
                setSetupStep(s => s - 1)
              }
            >
              ← Back
            </button>
          )}

          <button
            className="primary"
            onClick={() => {
              if (setupStep < 5) {
                setSetupStep(s => s + 1);
              } else {
                localStorage.setItem(
                  'campus-cash-setup',
                  'done'
                );
                setSetupDone(true);
              }
            }}
          >
            {setupStep === 5
              ? "Let's get budgeting! 💖"
              : 'Next →'}
          </button>

        </div>
      </div>
    </div>
  );
}
 return <div className="site"><div className="shell">
 <header><div className="logo" onClick={()=>setTab('home')} role="button" tabIndex={0}>campus<span>cash</span><span className="sparkle">✳</span></div><span className="tagline">your money, but make it cute ✨</span></header>
 <main>
 {tab==='home'&&<>
  <section className="hero"><h1>hey, money bestie! <span>💗</span></h1><p>Spend intentionally. Still have a life.</p><div className="heroNumbers"><div><span>ACCOUNT BALANCE</span><strong>{money(balance)}</strong></div><div><span>THIS WEEK LEFT</span><strong className={weeklyBudget-spent<0?'negative':''}>{money(weeklyBudget-spent)}</strong></div></div><button className="primary" onClick={()=>resetForm('single')}>＋ Add a transaction</button></section>
  <div className="panel">
  <h2>semester survival check 🎓</h2>
  <p>Making your money last until {state.savingsGoalDate}</p>

  {/* SECTION 1: MONEY AFTER BILLS */}
  <div className="survivalSection">
    <h3>🏦 Your money after bills</h3>

    <p>Current savings: {money(balance)}</p>
    <p>Expected income: +{money(futureIncome)}</p>
    <p>Upcoming bills: -{money(futureExpenses)}</p>

    <hr />

    <h2>{money(projectedBalance)}</h2>
    <p className="sub">
      Available after scheduled income and expenses,
      before everyday spending.
    </p>
  </div>

  {/* SECTION 2: WEEKLY BUDGET COMPARISON */}
  <div className="survivalComparison">

    <div className="survivalSection">
      <h3>🎯 Your break-even budget</h3>
      <h2>{money(weeklyAllowance)} / week</h2>
      <p>
        What you can spend weekly to make your money
        last approximately {weeksLeft} more weeks.
      </p>
    </div>

    <div className="survivalSection">
      <h3>🎉 Your planned spending</h3>
      <h2>{money(plannedWeeklySpending)} / week</h2>
      <p>
        Based on your weekly category budgets.
      </p>
    </div>

  </div>

  {/* SECTION 3: FINAL PROJECTION */}
  <div className="survivalSection">
    <h3>💗 Your projected money left</h3>

    <h1 className={
      projectedMoneyLeft < 0 ? 'negative' : 'positive'
    }>
      {money(projectedMoneyLeft)}
    </h1>

    <p>
      Estimated balance on {state.savingsGoalDate}
      if you follow your planned weekly spending.
    </p>

    <p className="sub">
      {weeklyDifference >= 0
        ? `You're budgeting ${money(weeklyDifference)} less per week than your break-even allowance! ✨`
        : `Your planned spending is ${money(Math.abs(weeklyDifference))} above your break-even allowance per week.`}
    </p>
  </div>
</div>
 
  <div className="stats"><div className="stat"><div>💸</div><span>This week's spending</span><strong>{money(spent)}</strong><small>of {money(weeklyBudget)} planned</small></div><div className="stat"><div>📅</div><span>Spent this month</span><strong>{money(monthlyExpense)}</strong><small>{currentMonth}</small></div><div className="stat"><div>💰</div><span>Income recorded</span><strong>{money(actualIncome)}</strong><small>since you started tracking</small></div></div>
  <div className="panel"><div className="paneltop"><div><h2>weekly vibe check 🪩</h2><p>Monday – Sunday</p></div><input aria-label="Choose week" type="date" value={selectedWeek} onChange={e=>setSelectedWeek(weekStart(e.target.value))}/></div><div className="meter"><div style={{width:`${Math.min(100,weeklyBudget?spent/weeklyBudget*100:0)}%`}}/></div><p className="sub">{money(spent)} spent of {money(weeklyBudget)} · {spent>weeklyBudget?'over budget — you got this next week!':'looking good, keep it up'}</p><div className="categories">{state.categories.filter(c=>c.budget>0).map(c=>{const used=weeklyTotal(weekTransactions,c.id,selectedWeek);return <div className="category" key={c.id}><div className="catline"><span className="catname">{c.emoji} {c.name}</span><span>{money(used)} <span className="muted">/ {money(c.budget)}</span></span></div><div className="smallmeter"><div className={used>c.budget?'over':''} style={{width:`${Math.min(100,used/c.budget*100)}%`}}/></div></div>})}</div></div>
  <div className="panel"><div className="paneltop"><h2>your accounts 🏦</h2><button className="textbtn" onClick={()=>setTab('settings')}>edit <ChevronDown size={13}/></button></div><div className="accountgrid">{balances.map(a=><div key={a.id} className="accountbox"><div>{a.name}</div><strong>{money(a.balance)}</strong></div>)}</div></div>
  <div className="panel"><div className="paneltop"><h2>recent activity 🧾</h2><button className="textbtn" onClick={()=>setTab('activity')}>view all →</button></div><TransactionList items={all.slice(0,5)} cat={cat} onDelete={removeTx}/></div>
 </>}
 {tab==='activity'&&<div className="panel page"><div className="paneltop"><div><h1>the money diary 📒</h1><p>Every latte, paycheck, and questionable Saturday.</p></div><button className="primary small" onClick={()=>resetForm('single')}>＋ Add</button></div><TransactionList items={all.slice(0,250)} cat={cat} onDelete={removeTx}/><p className="sub">Recurring entries have a ↻ symbol and are generated automatically on their due dates.</p></div>}
 {tab==='recurring'&&<div className="panel page"><div className="paneltop"><div><h1>on repeat 🔁</h1><p>Set it once. Your budget updates on each scheduled date.</p></div><button className="primary small" onClick={()=>resetForm('recurring')}>＋ New</button></div>{state.recurring.length===0?<div className="empty">Nothing on repeat yet. Add rent, utilities, gym, paychecks, or subscriptions! 💌</div>:state.recurring.map(r=><div className="transaction" key={r.id}><div className="emoji">{cat(r.categoryId)?.emoji||'✨'}</div><div className="txtext"><strong>{r.note||cat(r.categoryId)?.name}</strong><small>{r.frequency} · starts {r.start}{r.end?` · ends ${r.end}`:''} · {state.accounts.find(a=>a.id===r.accountId)?.name}</small></div><strong className={r.kind==='income'?'positive':''}>{r.kind==='income'?'+':'−'}{money(r.amount)}</strong><button className="delete" aria-label="Delete recurring schedule" onClick={()=>removeRecurring(r.id)}><Trash2 size={17}/></button></div>)}<div className="tip">💡 Heads up: payments are reflected on their dates when you open the app. No background bank transfers happen.</div></div>}
 {tab==='settings'&&<div className="page"><div className="panel"><h1>make it yours 🎀</h1><p className="sub">Your numbers stay in this browser, on this device.</p><h2 className="sectiontitle">🥗 meal plan situation</h2><p>We'll suggest a starting grocery budget. You can change it below.</p><div className="choices">{([['none','No meal plan'],['partial','Partial meal plan'],['full','Full meal plan']] as const).map(([v,t])=><button className={state.mealPlan===v?'choice active':'choice'} key={v} onClick={()=>updateMealPlan(v)}>{t}</button>)}</div><h2 className="sectiontitle">🏦 accounts & starting balances</h2>{state.accounts.map(a=><div className="settingrow" key={a.id}><input aria-label="Account name" value={a.name} onChange={e=>setState(s=>({...s,accounts:s.accounts.map(x=>x.id===a.id?{...x,name:e.target.value}:x)}))}/><label>Starting $ <input type="number" step="0.01" value={a.openingBalance} onChange={e=>setState(s=>({...s,accounts:s.accounts.map(x=>x.id===a.id?{...x,openingBalance:toNumber(e.target.value)}:x)}))}/></label><button className="delete" title="Delete account" onClick={()=>{if(state.accounts.length===1||all.some(t=>t.accountId===a.id)||state.recurring.some(r=>r.accountId===a.id))return alert('Move or remove transactions for this account before deleting it. Keep at least one account.');setState(s=>({...s,accounts:s.accounts.filter(x=>x.id!==a.id)}));}}><Trash2 size={17}/></button></div>)}<button className="outline" onClick={()=>setState(s=>({...s,accounts:[...s.accounts,{id:newId(),name:'New account',openingBalance:0}]}))}>＋ Add account</button><h2 className="sectiontitle">🎯 weekly category limits</h2><div className="budgetgrid">{state.categories.filter(c=>!['pay','savings','scholarship','gift'].includes(c.id)).map(c=><label key={c.id}>{c.emoji} {c.name}<div><span>$</span><input type="number" min="0" step="1" value={c.budget} onChange={e=>setState(s=>({...s,categories:s.categories.map(x=>x.id===c.id?{...x,budget:toNumber(e.target.value)}:x)}))}/></div></label>)}</div><h2 className="sectiontitle">💾 backup & restore</h2><p>Export regularly! Clearing browser data or changing phones can erase locally saved transactions.</p><div className="backup"><button className="outline" onClick={download}><Download size={17}/> Download backup</button><label className="outline upload"><Upload size={17}/> Import backup<input type="file" accept="application/json,.json" hidden onChange={e=>{void importData(e.target.files?.[0]);e.target.value='';}}/></label></div></div></div>}
 </main>
 <nav aria-label="Main navigation"><button className={tab==='home'?'active':''} onClick={()=>setTab('home')}><Wallet size={20}/> Home</button><button className={tab==='activity'?'active':''} onClick={()=>setTab('activity')}><ChartNoAxesColumn size={20}/> Activity</button><button className={tab==='recurring'?'active':''} onClick={()=>setTab('recurring')}><Repeat2 size={20}/> Repeat</button><button className={tab==='settings'?'active':''} onClick={()=>setTab('settings')}><SlidersHorizontal size={20}/> Settings</button></nav>
 <footer>made for students who have bills & a social life <Heart size={13} fill="currentColor"/></footer>
 {showEntry&&<div className="overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setShowEntry(false)}}><div className="modal"><div className="paneltop"><div><h2>{editRecurring?'something on repeat 🔁':'new money move ✨'}</h2><p>{editRecurring?'Auto-track future due dates':'Track that money, bestie'}</p></div><button className="close" onClick={()=>setShowEntry(false)}>✕</button></div><div className="choices"><button className={kind==='expense'?'choice active':'choice'} onClick={()=>{setKind('expense');setCategory('groceries')}}>💸 Expense</button><button className={kind==='income'?'choice active':'choice'} onClick={()=>{setKind('income');setCategory('pay')}}>💰 Income</button></div><label className="formlabel">Amount ($)<input type="number" min="0.01" step="0.01" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0.00" autoFocus/></label><label className="formlabel">Category<select value={category} onChange={e=>setCategory(e.target.value)}>{categoryChoices.map(c=><option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}</select></label><label className="formlabel">Account<select value={account} onChange={e=>setAccount(e.target.value)}>{state.accounts.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select></label><label className="formlabel">{editRecurring?'First date':'Date'}<input type="date" value={date} onChange={e=>setDate(e.target.value)}/></label>{editRecurring&&<><label className="formlabel">Repeat<select value={frequency} onChange={e=>setFrequency(e.target.value)}><option value="weekly">Every week</option><option value="biweekly">Every 2 weeks</option><option value="monthly">Every month</option><option value="yearly">Every year</option></select></label><label className="formlabel">End date (optional)<input type="date" min={date} value={endDate} onChange={e=>setEndDate(e.target.value)}/></label></>}<label className="formlabel">Note (optional)<input value={note} onChange={e=>setNote(e.target.value)} placeholder="e.g. Saturday night, electric bill"/></label><button className="primary full" onClick={saveEntry}>Save {editRecurring?'recurring schedule':'transaction'} ✨</button></div></div>}
 </div></div>;
}
function TransactionList({items,cat,onDelete}:{items:State['transactions'];cat:(id:string)=>State['categories'][number]|undefined;onDelete:(id:string)=>void}){if(!items.length)return <div className="empty">No transactions yet. It's a fresh start 🌸</div>;return <div className="transactions">{items.map(t=><div className="transaction" key={t.id}><div className="emoji">{cat(t.categoryId)?.emoji||'✨'}</div><div className="txtext"><strong>{t.note||cat(t.categoryId)?.name||'Transaction'} {t.id.startsWith('rec:')?'↻':''}</strong><small>{t.date} · {cat(t.categoryId)?.name}</small></div><strong className={t.kind==='income'?'positive':''}>{t.kind==='income'?'+':'−'}{money(t.amount)}</strong>{!t.id.startsWith('rec:')&&<button className="delete" title="Delete transaction" onClick={()=>onDelete(t.id)}><Trash2 size={16}/></button>}</div>)}</div>}
