/* Import/Export JSON + CSV */
if(data.labels){ for(const l of data.labels) await DB.put('labels', l); }
if(data.inventory){ for(const it of data.inventory) await DB.put('inventory', it); }
if(data.activities){ for(const a of data.activities) await DB.put('activities', normActivity(a)); }
if(data.trip){ await DB.put('trips', data.trip); State.trip = data.trip; }
State.labels = await DB.getAll('labels'); State.inventory = await DB.getAll('inventory'); State.activities = await DB.getAll('activities');
renderFilters(); renderInventory(); renderMonth(); renderDayIfOpen();
}


async function handleImportCSV(file){
const text = await file.text();
const lines = text.split(/\r?\n/).filter(Boolean);
const [header, ...rows] = lines;
const cols = header.split(',').map(h=>h.trim());
const idx = Object.fromEntries(cols.map((c,i)=>[c,i]));
for(const row of rows){
const cells = parseCsvRow(row);
const a = normActivity({
id: crypto.randomUUID(),
date: cells[idx.date] || '',
title: unq(cells[idx.title]||''),
start: cells[idx.start] || '09:00',
end: cells[idx.end] || '10:00',
place: unq(cells[idx.place]||''),
labels: splitSemi(unq(cells[idx.labels]||'')),
notes: unq(cells[idx.notes]||''),
links: splitSemi(unq(cells[idx.links]||'')),
category: unq(cells[idx.category]||'')
});
if(!a.date) continue;
await DB.put('activities', a);
}
State.activities = await DB.getAll('activities');
renderMonth(); renderDayIfOpen();
}


function parseCsvRow(row){
// basic CSV with quotes
const out=[]; let cur=''; let inQ=false;
for(let i=0;i<row.length;i++){
const ch=row[i];
if(ch==='"'){
if(inQ && row[i+1]==='"'){ cur+='"'; i++; }
else inQ=!inQ;
} else if(ch===',' && !inQ){ out.push(cur); cur=''; }
else cur+=ch;
}
out.push(cur); return out;
}
function unq(s){ return s?.replace(/^"|"$/g,'')?.replace(/""/g,'"') ?? s; }


function downloadFile(data, name, type){
const blob = new Blob([data], {type});
const url = URL.createObjectURL(blob);
const a = document.createElement('a'); a.href=url; a.download=name; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}
