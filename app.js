/* Core app logic */
const place = prompt('מקום', a.place||'')||'';
const labels = prompt('תוויות (מופרדות ;)', (a.labels||[]).join(';'))||'';
const notes = prompt('הערות', a.notes||'')||'';
a = {...a, title, start, end, place, labels: splitSemi(labels), notes };
a = normActivity(a);
await DB.put('activities', a);
// update cache
const idx = State.activities.findIndex(x=>x.id===a.id); if(idx>=0) State.activities[idx]=a;
renderTimeline(a.date); renderMonth();
}


let undoStack = [];
async function deleteActivity(a){
await DB.del('activities', a.id);
State.activities = State.activities.filter(x=>x.id!==a.id);
pushUndo( async ()=>{ await DB.put('activities', a); State.activities.push(a); renderDayIfOpen(); renderMonth(); } );
renderDayIfOpen(); renderMonth(); showSnackbar('נמחק – ביטול?');
}
function pushUndo(fn){ undoStack.push(fn); setTimeout(()=>undoStack.shift(), 6000); }
function showSnackbar(msg){ const s=$('#snackbar'); s.textContent=msg; s.hidden=false; setTimeout(()=>{ s.hidden=true; if(undoStack.length){ const btn=document.createElement('button'); btn.className='btn small'; btn.textContent='ביטול'; btn.onclick=async()=>{ const fn=undoStack.pop(); if(fn) await fn(); s.hidden=true; }; s.appendChild(document.createTextNode(' ')); s.appendChild(btn); } },10); setTimeout(()=>{ s.hidden=true; },6000); }


async function addInventoryItem(){
const title = $('#invTitle').value.trim(); if(!title) return;
const dur = parseInt($('#invDuration').value||'60',10);
const labels = splitSemi($('#invLabels').value);
const reusable = $('#invReusable').checked;
const item = { id:'inv_'+crypto.randomUUID().slice(0,8), title, defaultDurationMin:dur, labels, reusable };
await DB.put('inventory', item);
State.inventory.push(item);
renderInventory();
$('#invTitle').value=''; $('#invLabels').value='';
}


function renderInventory(){
const ul = $('#inventoryList'); ul.innerHTML='';
for(const it of State.inventory){
const li = document.createElement('li'); li.className='inv-item'; li.draggable=true; li.dataset.id = it.id;
li.innerHTML = `<div><strong>${escapeHtml(it.title)}</strong><div class="meta">${it.defaultDurationMin} דק׳ · ${ (it.labels||[]).join(', ') }</div></div>
<button class="icon-btn" title="מחק">🗑</button>`;
li.querySelector('button').onclick = async ()=>{ await DB.del('inventory', it.id); State.inventory = State.inventory.filter(x=>x.id!==it.id); renderInventory(); };
makeInventoryDraggable(li, it);
ul.appendChild(li);
}
}


async function newTrip(){
const name = prompt('שם הטיול', State.trip.name) || 'טיול חדש';
const start = prompt('תאריך התחלה (YYYY-MM-DD)', State.trip.dateRange[0]) || State.trip.dateRange[0];
const end = prompt('תאריך סיום (YYYY-MM-DD)', State.trip.dateRange[1]) || State.trip.dateRange[1];
State.trip = { ...State.trip, id: 'trip_'+crypto.randomUUID().slice(0,8), name, dateRange:[start,end] };
await DB.put('trips', State.trip);
renderMonth();
}
