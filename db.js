const DB = {
db:null,
async init(){
this.db = await new Promise((resolve, reject)=>{
const req = indexedDB.open('trip_planner_db', 1);
req.onupgradeneeded = (e)=>{
const db = e.target.result;
if(!db.objectStoreNames.contains('trips')) db.createObjectStore('trips', {keyPath:'id'});
if(!db.objectStoreNames.contains('labels')) db.createObjectStore('labels', {keyPath:'name'});
if(!db.objectStoreNames.contains('inventory')) db.createObjectStore('inventory', {keyPath:'id'});
if(!db.objectStoreNames.contains('activities')){
const s = db.createObjectStore('activities', {keyPath:'id'});
s.createIndex('by_date','date',{unique:false});
}
};
req.onsuccess = ()=>resolve(req.result);
req.onerror = ()=>reject(req.error);
});
},
tx(store, mode='readonly'){ const tx=this.db.transaction(store,mode); return [tx, tx.objectStore(store)]; },
get(store, key){ return new Promise((res,rej)=>{ const [tx, os]=this.tx(store); const r=os.get(key); r.onsuccess=()=>res(r.result||null); r.onerror=()=>rej(r.error); }); },
getAll(store){ return new Promise((res,rej)=>{ const [tx, os]=this.tx(store); const r=os.getAll(); r.onsuccess=()=>res(r.result||[]); r.onerror=()=>rej(r.error); }); },
put(store, val){ return new Promise((res,rej)=>{ const [tx, os]=this.tx(store,'readwrite'); os.put(val); tx.oncomplete=()=>res(true); tx.onerror=()=>rej(tx.error); }); },
del(store, key){ return new Promise((res,rej)=>{ const [tx, os]=this.tx(store,'readwrite'); os.delete(key); tx.oncomplete=()=>res(true); tx.onerror=()=>rej(tx.error); }); },
whereDate(dateISO){ return new Promise((res,rej)=>{ const [tx, os]=this.tx('activities'); const idx=os.index('by_date'); const req=idx.getAll(dateISO); req.onsuccess=()=>res(req.result||[]); req.onerror=()=>rej(req.error); }); }
};
