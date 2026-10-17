import { calculate, defaults } from './math.js';

const $ = id => document.getElementById(id);
const key = 'margindesk.scenarios.v1';
const currencies = {INR:'₹',USD:'$',GBP:'£',EUR:'€'};
let scenarios = [];
let current = null;
let storageAvailable = true;
try {
  const stored = JSON.parse(localStorage.getItem(key) || '[]');
  if (!Array.isArray(stored)) throw new Error('Invalid saved data');
  scenarios = stored.slice(0,12).filter(row => {
    try { return typeof row.id === 'string' && typeof row.name === 'string' && row.name.length <=70 && Object.hasOwn(currencies,row.currency) && Boolean(calculate(row.values)); } catch { return false; }
  });
} catch { storageAvailable = false; $('status').textContent = 'Browser storage is unavailable or saved data could not be read. You can still calculate and export this session’s scenarios.'; }

function money(amount,currency=$('currency').value) {
  return amount===null ? 'Unavailable' : new Intl.NumberFormat('en-IN',{style:'currency',currency,maximumFractionDigits:2}).format(amount);
}
function percent(amount) { return amount===null ? '—' : `${amount.toFixed(1)}%`; }
function readValues() { return Object.fromEntries(Object.keys(defaults).map(name=>[name,$(name).value.trim()==='' ? NaN : Number($(name).value)])); }
function status(text) { $('status').textContent=text; }
function render() {
  for(const symbol of document.querySelectorAll('.money-symbol')) symbol.textContent=currencies[$('currency').value];
  try {
    const values=readValues();
    const result=calculate(values);
    current={values,result};
    $('error').hidden=true; $('save').disabled=false;
    $('profit').textContent=money(result.profit);
    $('margin').textContent=percent(result.margin);
    $('revenue').textContent=money(result.revenue);
    $('base-cost').textContent=money(values.cost+values.shipping+values.packaging);
    $('platform').textContent=money(result.platformFee);
    $('costs').textContent=money(result.costs);
    $('break-even').textContent=money(result.breakEven===null?null:Math.ceil(result.breakEven*100-1e-8)/100);
    $('suggested').textContent=money(result.suggested===null?null:Math.ceil(result.suggested*100-1e-8)/100);
    $('target-copy').textContent=result.suggested===null ? 'This target cannot be reached with the current discount and fee percentages.' : `For a ${values.target}% margin with a ${values.discount}% discount. Rounded up to the nearest cent.`;
    const loss=result.profit<0;
    document.querySelector('.profit-card').classList.toggle('loss',loss);
    $('health').textContent=loss ? 'Making a loss' : result.margin===null ? 'No revenue' : result.margin+1e-8>=values.target ? 'At / above target' : 'Below target';
    const base=values.cost+values.shipping+values.packaging;
    const positiveProfit=Math.max(0,result.profit);
    const total=base+result.platformFee+positiveProfit;
    for (const [id,value] of [['cost-bar',base],['fee-bar',result.platformFee],['profit-bar',positiveProfit]]) $(id).style.width=`${total?value/total*100:0}%`;
    $('distribution').setAttribute('aria-label',`Product and delivery ${money(base)}; fees ${money(result.platformFee)}; ${loss?'loss':'profit'} ${money(Math.abs(result.profit))}.`);
  } catch(error) {
    current=null; $('error').textContent=error.message; $('error').hidden=false; $('save').disabled=true;
    for (const id of ['profit','margin','revenue','base-cost','platform','costs','break-even','suggested']) $(id).textContent='—';
    $('health').textContent='Check inputs'; $('target-copy').textContent='Complete the inputs to calculate a target price.';
    for(const id of ['cost-bar','fee-bar','profit-bar']) $(id).style.width='0%';
    $('distribution').setAttribute('aria-label','Complete the inputs to see the breakdown.');
  }
}
function persist() {
  try { localStorage.setItem(key,JSON.stringify(scenarios)); storageAvailable=true; return true; }
  catch { storageAvailable=false;return false; }
}
function renderScenarios() {
  $('scenarios').replaceChildren();
  $('empty').hidden=scenarios.length>0; $('table-wrap').hidden=scenarios.length===0; $('export').disabled=scenarios.length===0;
  for(const row of scenarios) {
    const result=calculate(row.values); const tr=document.createElement('tr');
    const cells=[row.name,money(row.values.price,row.currency),money(result.revenue,row.currency),money(result.profit,row.currency),percent(result.margin)];
    for(const [index,value] of cells.entries()) { const td=document.createElement('td'); td.textContent=value; if(index===0) td.title=value; if(index===3 && result.profit<0) td.classList.add('negative');tr.append(td); }
    const actions=document.createElement('td');
    for(const [label,handler] of [ ['Load',()=>{
      $('product').value=row.name;$('currency').value=row.currency;
      for(const name of Object.keys(defaults)) $(name).value=row.values[name];
      render(); $('price').focus();status(`Loaded “${row.name}”. Saving creates a new scenario.`);
    }], ['Remove',()=>{
      scenarios=scenarios.filter(x=>x.id!==row.id);const saved=persist();renderScenarios();status(saved?`Removed “${row.name}”.`:'Removed for this session. Browser storage could not be updated.');
    }] ]) { const button=document.createElement('button'); button.type='button';button.className='row-action';button.textContent=label;button.setAttribute('aria-label',`${label} ${row.name}`);button.addEventListener('click',handler);actions.append(button); }
    tr.append(actions);$('scenarios').append(tr);
  }
}
$('calculator').addEventListener('input',render);
$('currency').addEventListener('change',()=>{render();status('Currency label changed. Amounts were not converted.');});
$('calculator').addEventListener('submit',event=>{
  event.preventDefault(); render(); if(!current)return;
  if(scenarios.length>=12){status('You have 12 scenarios. Export or remove one before saving another.');return;}
  const row={id:crypto.randomUUID(),name:$('product').value.trim()||`Scenario ${scenarios.length+1}`,currency:$('currency').value,values:{...current.values}};
  scenarios.push(row); const saved=persist(); renderScenarios();status(saved?`Saved “${row.name}” on this device.`:`Saved “${row.name}” for this session only. Export to keep a copy.`);
});
$('reset').addEventListener('click',()=>{for(const [name,value] of Object.entries(defaults))$(name).value=value;$('product').value='';render();status('Example numbers restored. Your saved scenarios are unchanged.');});
$('export').addEventListener('click',()=>{
  const payload={app:'MarginDesk',version:1,exportedAt:new Date().toISOString(),scenarios};
  const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));
  const link=document.createElement('a');link.href=url;link.download='margindesk-scenarios.json';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);status('Scenarios exported as JSON.');
});
$('print').addEventListener('click',()=>window.print());
render();renderScenarios();
