/* Drag & Drop for inventory -> day timeline, and move cards between days */
function setupDayDnd(dateISO){
const tl = $('#timeline');
// Allow drop from inventory
tl.addEventListener('dragover', (e)=>{ e.preventDefault(); tl.classList.add('drop-hint'); });
tl.addEventListener('dragleave', ()=> tl.classList.remove('drop-hint'));
tl.addEventListener('drop', async (e)=>{
tl.classList.remove('drop-hint');
const type = e.dataTransfer.getData('type');
if(type==='inventory'){
const payload = JSON.parse(e.dataTransfer.getData('payload'));
const start = '09:00';
const end = addMinutes(start, payload.defaultDurationMin||60);
const a = normActivity({ id:crypto.randomUUID(), title:payload.title, date:dateISO, start, end, place:'', labels: payload.labels||[], notes:'', links:[] });
await DB.put('activities', a); State.activities.push(a);
if(!payload.reusable){ await DB.del('inventory', payload.id); State.inventory = State.inventory.filter(x=>x.id!==payload.id); renderInventory(); }
renderTimeline(dateISO); renderMonth();
}
if(type==='activity-move'){
const payload = JSON.parse(e.dataTransfer.getData('payload'));
const a = State.activities.find(x=>x.id===payload.id);
if(a){ a.date = dateISO; await DB.put('activities', a); renderTimeline(dateISO); renderMonth(); }
}
});
}


function makeInventoryDraggable(el, it){
el.addEventListener('dragstart', (e)=>{
e.dataTransfer.effectAllowed = 'copy';
e.dataTransfer.setData('type','inventory');
e.dataTransfer.setData('payload', JSON.stringify(it));
});
}
function makeActivityDraggable(el, a){
el.addEventListener('dragstart', (e)=>{
e.dataTransfer.effectAllowed = 'move';
e.dataTransfer.setData('type','activity-move');
e.dataTransfer.setData('payload', JSON.stringify({id:a.id}));
});
}
