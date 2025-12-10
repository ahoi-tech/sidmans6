/* Utilities */
function genId(){return'id_'+Date.now()+'_'+Math.floor(Math.random()*10000);}
function $(id){return document.getElementById(id);}
function saveToStorage(key,val){localStorage.setItem(key,JSON.stringify(val));}
function loadFromStorage(key){try{return JSON.parse(localStorage.getItem(key)||'null');}catch(e){return null;}}
function toast(msg){try{alert(msg);}catch(e){console.log(msg);}}

/* SPA nav */
document.querySelectorAll('.nav-btn').forEach(btn=>{btn.addEventListener('click',()=>{document.querySelectorAll('.section').forEach(s=>s.classList.add('hidden'));const t=btn.dataset.target;$(t).classList.remove('hidden');document.querySelectorAll('.nav-btn').forEach(x=>x.classList.remove('bg-orange-500','font-bold'));btn.classList.add('bg-orange-500','font-bold');window.scrollTo({top:0,behavior:'smooth'});});});
document.querySelector('.nav-btn[data-target="pa"]').click();

/* PUSAT AKSES */
(function(){
  const PA_KEY='pa_data_full_v2',DEBOUNCE_DELAY=1500,SERVER_URL='https://yourdomain.com/api/save_pa';
  let fadeTimer=null;
  let paData=pa_loadFromStorage(PA_KEY)||{status:'Berfungsi',ganti:'Tidak',lupus:'Tidak',ganti_tarikh:'',lupus_tarikh:'',devices:[]};
  const statusBox=document.getElementById("pa_save_status");
  const paStatus=document.getElementById('pa_status');
  const paSebabWrapper=document.getElementById('pa_sbb');
  paStatus&&paStatus.addEventListener('change',()=>{if(paStatus.value==='Tidak Berfungsi'){paSebabWrapper.style.display='block';}else{paSebabWrapper.style.display='none';document.getElementById('pa_sbb').value='';}});
  function showStatus(text,color="bg-slate-700",withSpinner=false){if(!statusBox)return;clearTimeout(fadeTimer);let spinnerHTML=withSpinner?'<span class="pa-spinner animate-spin mr-2 inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>':"";statusBox.innerHTML=spinnerHTML+text;statusBox.className=`pa-badge ${color}`;statusBox.classList.remove("pa-hidden");if(!withSpinner){fadeTimer=setTimeout(()=>statusBox.classList.add("pa-hidden"),3000);}}
  function markUnsaved(){showStatus("✖ Tidak Disimpan","bg-red-600");}
  function markSaved(){showStatus("✔ Disimpan (Local + Server)","bg-emerald-700");}
  function pa$(id){return document.getElementById(id);}
  function pa_genId(){return'pa_'+Date.now()+Math.random().toString(16).slice(2);}
  function pa_saveToStorage(key,data){localStorage.setItem(key,JSON.stringify(data));markSaved();}
  function pa_loadFromStorage(key){const raw=localStorage.getItem(key);return raw?JSON.parse(raw):null;}
  function pa_uploadToServer(data){showStatus("Menyimpan ke server...","bg-blue-600",true);fetch(SERVER_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}).then(res=>res.json()).then(resp=>{markSaved();}).catch(err=>{showStatus("⚠ Gagal simpan server","bg-red-700");console.error("Upload PA error:",err);});}
  function pa_debounce(fn,delay){let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),delay);};}
  const pa_autoSave=pa_debounce(()=>{pa_saveToStorage(PA_KEY,paData);pa_uploadToServer(paData);},DEBOUNCE_DELAY);
  function pa_flagChange(){markUnsaved();pa_autoSave();}
  function pa_renderSelectValue(opts,val){return opts.map(o=>`<option ${o===val?'selected':''}>${o}</option>`).join('');}
  function pa_renderRow(row,index){const tr=document.createElement('tr');tr.className='border';tr.dataset.id=row.id;tr.classList.add(row.status==='Berfungsi'?'status-berfungsi':row.status==='Rosak'?'status-rosak':'');tr.innerHTML=`<td class="p-2 border text-sm">${index+1}</td><td class="p-2 border"><select class="w-full p-1 border rounded jenis">${pa_renderSelectValue(['Komputer Peribadi (PC)','Pencetak (Printer)','Projektor'],row.jenis)}</select></td><td class="p-2 border"><input class="w-full p-1 border rounded jenama" value="${row.jenama||''}"></td><td class="p-2 border"><input class="w-full p-1 border rounded model" value="${row.model||''}"></td><td class="p-2 border"><input class="w-full p-1 border rounded nosiri" value="${row.nosiri||''}"></td><td class="p-2 border"><select class="w-full p-1 border rounded status"><option ${row.status==='Berfungsi'?'selected':''}>Berfungsi</option><option ${row.status==='Rosak'?'selected':''}>Rosak</option></select></td><td class="p-2 border text-center"><button class="pa_del bg-red-500 text-white px-2 py-1 rounded">Padam</button></td>`;return tr;}
  function pa_updatePAStats(){if(paData.status==='Tidak Berkaitan'){['pa_total','pa_ok','pa_broken'].forEach(id=>pa$(id)&&(pa$(id).textContent=''));if(pa$('pa_broken_list'))pa$('pa_broken_list').innerHTML='';return;}const t=paData.devices.length;const ok=paData.devices.filter(x=>x.status==='Berfungsi').length;const b=paData.devices.filter(x=>x.status==='Rosak').length;if(pa$('pa_total'))pa$('pa_total').textContent=t;if(pa$('pa_ok'))pa$('pa_ok').textContent=ok;if(pa$('pa_broken'))pa$('pa_broken').textContent=b;if(pa$('pa_broken_list')){pa$('pa_broken_list').innerHTML=b===0?'':`<div class="p-3 bg-red-50 rounded-md"><div class="text-red-700 font-bold mb-1">Senarai Peranti Rosak</div><ul class="ml-4 text-sm">${paData.devices.filter(x=>x.status==='Rosak').map(x=>`<li>${x.jenis} — ${x.jenama||'-'} ${x.model?'/ '+x.model:''} (${x.nosiri||'-'})</li>`).join('')}</ul></div>`;}}
  function pa_renderPA(){const tbody=pa$('pa_tbody');if(!tbody)return;tbody.innerHTML='';if(paData.status!=='Tidak Berkaitan'){paData.devices.forEach((row,i)=>tbody.appendChild(pa_renderRow(row,i))); }pa_updatePAStats();markSaved();}
  function pa_applyStatusFields(){if(pa$('pa_status'))pa$('pa_status').value=paData.status;if(pa$('pa_ganti'))pa$('pa_ganti').value=paData.ganti;if(pa$('pa_lupus'))pa$('pa_lupus').value=paData.lupus;if(pa$('pa_ganti_tarikh'))pa$('pa_ganti_tarikh').value=paData.ganti_tarikh;if(pa$('pa_lupus_tarikh'))pa$('pa_lupus_tarikh').value=paData.lupus_tarikh;if(pa$('pa_ganti_tarikh'))pa$('pa_ganti_tarikh').classList.toggle('hidden',paData.ganti!=='Ya');if(pa$('pa_lupus_tarikh'))pa$('pa_lupus_tarikh').classList.toggle('hidden',paData.lupus!=='Ya');}
  if(pa$('pa_status'))pa$('pa_status').addEventListener('change',e=>{paData.status=e.target.value;if(paData.status==='Tidak Berkaitan'){paData.ganti='Tidak Berkaitan';paData.lupus='Tidak Berkaitan';paData.ganti_tarikh='';paData.lupus_tarikh='';paData.devices=[];}else{if(paData.ganti==='Tidak Berkaitan')paData.ganti='Tidak';if(paData.lupus==='Tidak Berkaitan')paData.lupus='Tidak';}pa_applyStatusFields();pa_renderPA();pa_flagChange();});
  if(pa$('pa_ganti'))pa$('pa_ganti').addEventListener('change',e=>{paData.ganti=e.target.value;if(pa$('pa_ganti_tarikh'))pa$('pa_ganti_tarikh').classList.toggle('hidden',paData.ganti!=='Ya');pa_flagChange();});
  if(pa$('pa_ganti_tarikh'))pa$('pa_ganti_tarikh').addEventListener('input',e=>{paData.ganti_tarikh=e.target.value;pa_flagChange();});
  if(pa$('pa_lupus'))pa$('pa_lupus').addEventListener('change',e=>{paData.lupus=e.target.value;if(pa$('pa_lupus_tarikh'))pa$('pa_lupus_tarikh').classList.toggle('hidden',paData.lupus!=='Ya');pa_flagChange();});
  if(pa$('pa_lupus_tarikh'))pa$('pa_lupus_tarikh').addEventListener('input',e=>{paData.lupus_tarikh=e.target.value;pa_flagChange();});
  if(pa$('pa_add'))pa$('pa_add').addEventListener('click',()=>{if(paData.status==='Tidak Berkaitan')return;const row={id:pa_genId(),jenis:'Komputer Peribadi (PC)',jenama:'',model:'',nosiri:'',status:'Berfungsi'};paData.devices.push(row);pa_renderPA();pa_flagChange();});
  if(pa$('pa_tbody')){pa$('pa_tbody').addEventListener('input',e=>{const tr=e.target.closest('tr');if(!tr)return;const idx=paData.devices.findIndex(x=>x.id===tr.dataset.id);if(idx===-1)return;['jenis','jenama','model','nosiri','status'].forEach(f=>{const el=tr.querySelector('.'+f);if(el)paData.devices[idx][f]=el.value;});pa_renderPA();pa_flagChange();});pa$('pa_tbody').addEventListener('click',e=>{if(!e.target.closest('.pa_del'))return;const tr=e.target.closest('tr');const id=tr.dataset.id;paData.devices=paData.devices.filter(x=>x.id!==id);pa_renderPA();pa_flagChange();});}
  document.addEventListener('DOMContentLoaded',()=>{pa_applyStatusFields();pa_renderPA();showStatus("Sedia untuk mengisi","bg-slate-600");});
})();

/* MAKMAL KOMPUTER */
(function(){
  const MK_KEY='mk_data_full_v1',DEBOUNCE_DELAY=1500,SERVER_URL='https://yourdomain.com/api/save_mk';
  let fadeTimer=null;
  function mk_loadFromStorage(key){const raw=localStorage.getItem(key);return raw?JSON.parse(raw):null;}
  function mk_saveToStorage(key,data){localStorage.setItem(key,JSON.stringify(data));markSaved();}
  let mkData=mk_loadFromStorage(MK_KEY)||{status:'Berfungsi',sbb:'',building:'3A (21/21 Komputer Peribadi)',location:'Dalam bangunan sekolah',ganti:'Tiada',lupus:'Tiada',ganti_tarikh:'',lupus_tarikh:'',devices:[]};
  const statusBox=document.getElementById("mk_save_status");
  const mkStatus=document.getElementById('mk_status');
  const mkSebabWrapper=document.getElementById('mk_sbb');
  mkStatus&&mkStatus.addEventListener('change',()=>{if(mkStatus.value==='Tidak Berfungsi'){mkSebabWrapper.style.display='block';}else{mkSebabWrapper.style.display='none';document.getElementById('mk_sbb').value='';}});
  function showStatus(text,color="bg-slate-700",withSpinner=false){if(!statusBox)return;clearTimeout(fadeTimer);let spinner=withSpinner?'<span class="mk-spinner animate-spin mr-2 inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>':"";statusBox.innerHTML=spinner+text;statusBox.className=`mk-badge ${color}`;statusBox.classList.remove("mk-hidden");if(!withSpinner){fadeTimer=setTimeout(()=>statusBox.classList.add("mk-hidden"),3000);}}
  function markUnsaved(){showStatus("✖ Tidak Disimpan","bg-red-600");}
  function markSaved(){showStatus("✔ Disimpan (Local + Server)","bg-emerald-700");}
  function mk$(id){return document.getElementById(id);}
  function mk_genId(){return'mk_'+Date.now()+Math.random().toString(16).slice(2);}
  function mk_uploadToServer(data){showStatus("Menyimpan ke server...","bg-blue-600",true);fetch(SERVER_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}).then(r=>r.json()).then(res=>{markSaved();}).catch(err=>{showStatus("⚠ Gagal simpan server","bg-red-700");console.error("Upload MK ERROR:",err);});}
  function mk_debounce(fn,delay){let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),delay);};}
  const mk_autoSave=mk_debounce(()=>{mk_saveToStorage(MK_KEY,mkData);mk_uploadToServer(mkData);},DEBOUNCE_DELAY);
  function mk_flagChange(){markUnsaved();mk_autoSave();}
  function mk_renderRow(row,index){const tr=document.createElement('tr');tr.className='border';tr.dataset.id=row.id;tr.innerHTML=`<td class="p-2 border">${index+1}</td><td class="p-2 border"><select class="jenis w-full p-1 border rounded"><option ${row.jenis==='Komputer Peribadi (PC)'?'selected':''}>Komputer Peribadi (PC)</option><option ${row.jenis==='Pencetak (Printer)'?'selected':''}>Pencetak (Printer)</option><option ${row.jenis==='Projektor'?'selected':''}>Projektor</option></select></td><td class="p-2 border"><input class="jenama w-full p-1 border rounded" value="${row.jenama||''}"></td><td class="p-2 border"><input class="model w-full p-1 border rounded" value="${row.model||''}"></td><td class="p-2 border"><input class="nosiri w-full p-1 border rounded" value="${row.nosiri||''}"></td><td class="p-2 border"><select class="status w-full p-1 border rounded"><option ${row.status==='Berfungsi'?'selected':''}>Berfungsi</option><option ${row.status==='Rosak'?'selected':''}>Rosak</option></select></td><td class="p-2 border text-center"><button class="mk_del bg-red-500 text-white px-2 py-1 rounded">Padam</button></td>`;return tr;}
  function mk_updateStats(){if(mkData.status==='Tidak Berkaitan'){if(mk$('mk_total'))mk$('mk_total').textContent='';if(mk$('mk_ok'))mk$('mk_ok').textContent='';if(mk$('mk_broken'))mk$('mk_broken').textContent='';if(mk$('mk_broken_list'))mk$('mk_broken_list').innerHTML='';return;}const total=mkData.devices.length;const ok=mkData.devices.filter(x=>x.status==='Berfungsi').length;const broken=mkData.devices.filter(x=>x.status==='Rosak').length;if(mk$('mk_total'))mk$('mk_total').textContent=total;if(mk$('mk_ok'))mk$('mk_ok').textContent=ok;if(mk$('mk_broken'))mk$('mk_broken').textContent=broken;if(mk$('mk_broken_list')){mk$('mk_broken_list').innerHTML=broken===0?'':`<div class="p-3 bg-red-50 rounded-md"><div class="text-red-700 font-bold mb-1">Senarai Peranti Rosak</div><ul class="ml-4 text-sm">${mkData.devices.filter(x=>x.status==='Rosak').map(x=>`<li>${x.jenis} — ${x.jenama||'-'} ${x.model?('/ '+x.model):''} (${x.nosiri||'-'})</li>`).join('')}</ul></div>`;}}
  function mk_render(){const tbody=mk$('mk_tbody');if(!tbody)return;tbody.innerHTML='';if(mkData.status!=='Tidak Berkaitan'){mkData.devices.forEach((row,i)=>tbody.appendChild(mk_renderRow(row,i)));}mk_updateStats();markSaved();}
  function mk_applyFields(){if(!mk$('mk_status'))return;mk$('mk_status').value=mkData.status||'Berfungsi';if(mk$('mk_sbb')){mk$('mk_sbb').value=mkData.sbb||'';mk$('mk_sbb').classList.toggle('hidden',mkData.status!=='Rosak');}if(mk$('mk_building'))mk$('mk_building').value=mkData.building||'Tidak Berkaitan';if(mk$('mk_location'))mk$('mk_location').value=mkData.location||'Tidak Berkaitan';if(mk$('mk_ganti'))mk$('mk_ganti').value=mkData.ganti||'Tiada';if(mk$('mk_ganti_tarikh')){mk$('mk_ganti_tarikh').value=mkData.ganti_tarikh||'';mk$('mk_ganti_tarikh').classList.toggle('hidden',mkData.ganti!=='Ya');}if(mk$('mk_lupus'))mk$('mk_lupus').value=mkData.lupus||'Tiada';if(mk$('mk_lupus_tarikh')){mk$('mk_lupus_tarikh').value=mkData.lupus_tarikh||'';mk$('mk_lupus_tarikh').classList.toggle('hidden',mkData.lupus!=='Ya');}}
  if(mk$('mk_status'))mk$('mk_status').addEventListener('change',e=>{mkData.status=e.target.value;if(mkData.status==='Tidak Berkaitan'){mkData.building='Tidak Berkaitan';mkData.location='Tidak Berkaitan';mkData.ganti='Tidak Berkaitan';mkData.lupus='Tidak Berkaitan';mkData.ganti_tarikh='';mkData.lupus_tarikh='';mkData.sbb='';mkData.devices=[];}else{if(mkData.building==='Tidak Berkaitan')mkData.building='3A (21/21 Komputer Peribadi)';if(mkData.location==='Tidak Berkaitan')mkData.location='Dalam bangunan sekolah';if(mkData.ganti==='Tidak Berkaitan')mkData.ganti='Tiada';if(mkData.lupus==='Tidak Berkaitan')mkData.lupus='Tiada';}mk_applyFields();mk_render();mk_flagChange();});
  if(mk$('mk_sbb'))mk$('mk_sbb').addEventListener('input',e=>{mkData.sbb=e.target.value;mk_flagChange();});
  if(mk$('mk_building'))mk$('mk_building').addEventListener('change',e=>{mkData.building=e.target.value;mk_flagChange();});
  if(mk$('mk_location'))mk$('mk_location').addEventListener('change',e=>{mkData.location=e.target.value;mk_flagChange();});
  if(mk$('mk_ganti'))mk$('mk_ganti').addEventListener('change',e=>{mkData.ganti=e.target.value;if(mk$('mk_ganti_tarikh'))mk$('mk_ganti_tarikh').classList.toggle('hidden',mkData.ganti!=='Ya');mk_flagChange();});
  if(mk$('mk_ganti_tarikh'))mk$('mk_ganti_tarikh').addEventListener('input',e=>{mkData.ganti_tarikh=e.target.value;mk_flagChange();});
  if(mk$('mk_lupus'))mk$('mk_lupus').addEventListener('change',e=>{mkData.lupus=e.target.value;if(mk$('mk_lupus_tarikh'))mk$('mk_lupus_tarikh').classList.toggle('hidden',mkData.lupus!=='Ya');mk_flagChange();});
  if(mk$('mk_lupus_tarikh'))mk$('mk_lupus_tarikh').addEventListener('input',e=>{mkData.lupus_tarikh=e.target.value;mk_flagChange();});
  if(mk$('mk_add'))mk$('mk_add').addEventListener('click',()=>{if(mkData.status==='Tidak Berkaitan')return;mkData.devices.push({id:mk_genId(),jenis:'Komputer Peribadi (PC)',jenama:'',model:'',nosiri:'',status:'Berfungsi'});mk_render();mk_flagChange();});
  if(mk$('mk_tbody')){mk$('mk_tbody').addEventListener('input',e=>{const tr=e.target.closest('tr');if(!tr)return;const id=tr.dataset.id;const idx=mkData.devices.findIndex(x=>x.id===id);if(idx===-1) return;['jenis','jenama','model','nosiri','status'].forEach(f=>{const el=tr.querySelector('.'+f);if(el)mkData.devices[idx][f]=el.value;});mk_render();mk_flagChange();});mk$('mk_tbody').addEventListener('click',e=>{if(!e.target.closest('.mk_del'))return;const tr=e.target.closest('tr');const id=tr.dataset.id;mkData.devices=mkData.devices.filter(x=>x.id!==id);mk_render();mk_flagChange();});}
  document.addEventListener('DOMContentLoaded',()=>{mk_applyFields();mk_render();showStatus("Sedia untuk mengisi","bg-slate-600");});
})();

/* PdP */
(function(){
  const PDP_KEY='pdp_data_full_v1',DEBOUNCE_DELAY=1500,SERVER_URL='https://yourdomain.com/api/save_pdp';
  let fadeTimer=null;
  function pdp_loadFromStorage(key){const raw=localStorage.getItem(key);return raw?JSON.parse(raw):null;}
  function pdp_saveToStorage(key,data){localStorage.setItem(key,JSON.stringify(data));markSaved();}
  let pdpData=pdp_loadFromStorage(PDP_KEY)||{phases:[{company:'',start:'',end:'',laptop:0,printer:0,projector:0,cart:0,pm:''},{company:'',start:'',end:'',laptop:0,printer:0,projector:0,cart:0,pm:''},{company:'',start:'',end:'',laptop:0,printer:0,projector:0,cart:0,pm:''},{company:'',start:'',end:'',laptop:0,printer:0,projector:0,cart:0,pm:''}],notes:''};
  const statusBox=document.getElementById("pdp_save_status");
  function showStatus(text,colorClass="bg-slate-700",withSpinner=false){if(!statusBox)return;clearTimeout(fadeTimer);let spinnerHTML=withSpinner?'<span class="pdp-spinner animate-spin mr-2 inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>':"";statusBox.innerHTML=spinnerHTML+text;statusBox.className=`pdp-badge ${colorClass}`;statusBox.classList.remove("pdp-hidden");if(!withSpinner){fadeTimer=setTimeout(()=>statusBox.classList.add("pdp-hidden"),3000);}}
  function markUnsaved(){showStatus("✖ Tidak Disimpan","bg-red-600");}
  function markSaved(){showStatus("✔ Disimpan (Local + Server)","bg-emerald-700");}
  function pdp$(id){return document.getElementById(id);}
  function pdp_debounce(fn,delay){let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),delay);};}
  function pdp_uploadToServer(data){showStatus("Menyimpan ke server...","bg-blue-600",true);fetch(SERVER_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}).then(r=>{if(!r.ok)throw new Error('Server returned '+r.status);return r.json().catch(()=>({ok:true}));}).then(res=>{markSaved();}).catch(err=>{showStatus("⚠ Gagal simpan server","bg-red-700");console.error("Upload PDP ERROR:",err);});}
  const pdp_autoSave=pdp_debounce(()=>{pdp_saveToStorage(PDP_KEY,pdpData);pdp_uploadToServer(pdpData);},DEBOUNCE_DELAY);
  function pdp_flagChange(){markUnsaved();pdp_autoSave();}
  function pdp_applyFields(){for(let i=0;i<4;i++){const n=i+1;const p=pdpData.phases[i];if(pdp$('pdp_company_'+n))pdp$('pdp_company_'+n).value=p.company||'';if(pdp$('pdp_start_'+n))pdp$('pdp_start_'+n).value=p.start||'';if(pdp$('pdp_end_'+n))pdp$('pdp_end_'+n).value=p.end||'';if(pdp$('pdp_laptop_'+n))pdp$('pdp_laptop_'+n).value=p.laptop!=null?p.laptop:0;if(pdp$('pdp_printer_'+n))pdp$('pdp_printer_'+n).value=p.printer!=null?p.printer:0;if(pdp$('pdp_projector_'+n))pdp$('pdp_projector_'+n).value=p.projector!=null?p.projector:0;if(pdp$('pdp_cart_'+n))pdp$('pdp_cart_'+n).value=p.cart!=null?p.cart:0;if(pdp$('pdp_pm_'+n))pdp$('pdp_pm_'+n).value=p.pm||'';}pdp_updateSummary();}
  function pdp_updateSummary(){const totals=pdpData.phases.reduce((acc,p)=>{acc.laptop+=Number(p.laptop||0);acc.printer+=Number(p.printer||0);acc.projector+=Number(p.projector||0);acc.cart+=Number(p.cart||0);return acc;},{laptop:0,printer:0,projector:0,cart:0});const summary=`L:${totals.laptop} P:${totals.printer} Pr:${totals.projector} C:${totals.cart}`;const sumEl=pdp$('pdp_summary');if(sumEl)sumEl.textContent=summary;}
  function bindAllInputs(){for(let i=0;i<4;i++){const n=i+1;if(pdp$('pdp_company_'+n))pdp$('pdp_company_'+n).addEventListener('input',e=>{pdpData.phases[i].company=e.target.value;pdp_flagChange();pdp_updateSummary();});if(pdp$('pdp_start_'+n))pdp$('pdp_start_'+n).addEventListener('change',e=>{pdpData.phases[i].start=e.target.value;pdp_flagChange();});if(pdp$('pdp_end_'+n))pdp$('pdp_end_'+n).addEventListener('change',e=>{pdpData.phases[i].end=e.target.value;pdp_flagChange();});const numericIds=['laptop','printer','projector','cart'];numericIds.forEach(id=>{const el=pdp$(`pdp_${id}_${n}`);if(!el)return;el.addEventListener('input',e=>{let val=e.target.value;let num=parseInt(val);if(isNaN(num)||num<0)num=0;pdpData.phases[i][id]=num;pdp_flagChange();pdp_updateSummary();});});if(pdp$('pdp_pm_'+n))pdp$('pdp_pm_'+n).addEventListener('change',e=>{pdpData.phases[i].pm=e.target.value;pdp_flagChange();});}}
  function pdp_resetPhase(index){if(index<0||index>3)return;pdpData.phases[index]={company:'',start:'',end:'',laptop:0,printer:0,projector:0,cart:0,pm:''};pdp_applyFields();pdp_flagChange();}
  function pdp_resetAll(){pdpData={phases:[{company:'',start:'',end:'',laptop:0,printer:0,projector:0,cart:0,pm:''},{company:'',start:'',end:'',laptop:0,printer:0,projector:0,cart:0,pm:''},{company:'',start:'',end:'',laptop:0,printer:0,projector:0,cart:0,pm:''},{company:'',start:'',end:'',laptop:0,printer:0,projector:0,cart:0,pm:''}],notes:''};pdp_applyFields();pdp_flagChange();}
  document.addEventListener('DOMContentLoaded',()=>{bindAllInputs();pdp_applyFields();showStatus("Sedia untuk mengisi","bg-slate-600");});
  Object.defineProperty(window,'pdp_resetPhase',{value:pdp_resetPhase,writable:false});Object.defineProperty(window,'pdp_resetAll',{value:pdp_resetAll,writable:false});
})();

/* PdT */
(function(){
  const PDT_KEY='pdt_data_full_v1',DEBOUNCE_DELAY=1500,SERVER_URL='https://yourdomain.com/api/save_pdt';
  let fadeTimer=null;
  function pdt_loadFromStorage(key){const raw=localStorage.getItem(key);return raw?JSON.parse(raw):null;}
  function pdt_saveToStorage(key,data){localStorage.setItem(key,JSON.stringify(data));markSaved();}
  let pdtData=pdt_loadFromStorage(PDT_KEY)||{phases:[{company:'',start:'',end:'',pc:0,printer:0,pm:''},{company:'',start:'',end:'',pc:0,printer:0,pm:''}],notes:''};
  const statusBox=document.getElementById("pdt_status");
  function showStatus(text,color="bg-slate-700",withSpinner=false){if(!statusBox)return;clearTimeout(fadeTimer);let spinner=withSpinner?'<span class="animate-spin mr-2 inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>':"";statusBox.innerHTML=spinner+text;statusBox.className=`pdp-badge ${color}`;statusBox.classList.remove("pdp-hidden");if(!withSpinner){fadeTimer=setTimeout(()=>statusBox.classList.add("pdp-hidden"),3000);}}
  function markUnsaved(){showStatus("✖ Tidak Disimpan","bg-red-600");}
  function markSaved(){showStatus("✔ Disimpan (Local + Server)","bg-emerald-700");}
  function pdt$(id){return document.getElementById(id);}
  function pdt_debounce(fn,delay){let t;return(...args)=>{clearTimeout(t);t=setTimeout(()=>fn(...args),delay);};}
  function pdt_uploadToServer(data){showStatus("Menyimpan ke server...","bg-blue-600",true);fetch(SERVER_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}).then(r=>{if(!r.ok)throw new Error("Server error "+r.status);return r.json().catch(()=>({ok:true}));}).then(()=>{markSaved();}).catch(err=>{showStatus("⚠ Gagal simpan ke server","bg-red-700");console.error("Upload PdT ERROR:",err);});}
  const pdt_autoSave=pdt_debounce(()=>{pdt_saveToStorage(PDT_KEY,pdtData);pdt_uploadToServer(pdtData);},DEBOUNCE_DELAY);
  function pdt_flagChange(){markUnsaved();pdt_autoSave();}
  function pdt_applyFields(){for(let i=0;i<2;i++){const n=i+1;const p=pdtData.phases[i];if(pdt$('pdt_company_'+n))pdt$('pdt_company_'+n).value=p.company||'';if(pdt$('pdt_start_'+n))pdt$('pdt_start_'+n).value=p.start||'';if(pdt$('pdt_end_'+n))pdt$('pdt_end_'+n).value=p.end||'';if(pdt$('pdt_pc_'+n))pdt$('pdt_pc_'+n).value=p.pc!=null?p.pc:0;if(pdt$('pdt_printer_'+n))pdt$('pdt_printer_'+n).value=p.printer!=null?p.printer:0;if(pdt$('pdt_pm_'+n))pdt$('pdt_pm_'+n).value=p.pm||'';}pdt_updateSummary();}
  function pdt_updateSummary(){const totals=pdtData.phases.reduce((acc,p)=>{acc.pc+=Number(p.pc||0);acc.printer+=Number(p.printer||0);return acc;},{pc:0,printer:0});const sumEl=pdt$('pdt_summary');if(sumEl)sumEl.textContent=`PC:${totals.pc} P:${totals.printer}`;}
  function bindAllInputs(){for(let i=0;i<2;i++){const n=i+1;if(pdt$('pdt_company_'+n))pdt$('pdt_company_'+n).addEventListener('input',e=>{pdtData.phases[i].company=e.target.value;pdt_flagChange();});if(pdt$('pdt_start_'+n))pdt$('pdt_start_'+n).addEventListener('change',e=>{pdtData.phases[i].start=e.target.value;pdt_flagChange();});if(pdt$('pdt_end_'+n))pdt$('pdt_end_'+n).addEventListener('change',e=>{pdtData.phases[i].end=e.target.value;pdt_flagChange();});const numericIds=['pc','printer'];numericIds.forEach(id=>{const el=pdt$(`pdt_${id}_${n}`);if(!el)return;el.addEventListener('input',e=>{let val=parseInt(e.target.value);if(isNaN(val)||val<0)val=0;pdtData.phases[i][id]=val;pdt_flagChange();pdt_updateSummary();});});if(pdt$('pdt_pm_'+n))pdt$('pdt_pm_'+n).addEventListener('change',e=>{pdtData.phases[i].pm=e.target.value;pdt_flagChange();});}}
  function pdt_resetPhase(index){if(index<0||index>1)return;pdtData.phases[index]={company:'',start:'',end:'',pc:0,printer:0,pm:''};pdt_applyFields();pdt_flagChange();}
  function pdt_resetAll(){pdtData={phases:[{company:'',start:'',end:'',pc:0,printer:0,pm:''},{company:'',start:'',end:'',pc:0,printer:0,pm:''}],notes:''};pdt_applyFields();pdt_flagChange();}
  document.addEventListener('DOMContentLoaded',()=>{bindAllInputs();pdt_applyFields();showStatus("Sedia untuk mengisi","bg-slate-600");});
  Object.defineProperty(window,'pdt_resetPhase',{value:pdt_resetPhase,writable:false});Object.defineProperty(window,'pdt_resetAll',{value:pdt_resetAll,writable:false});
})();

/* PERANTI CERDIK */
(function(){
  const PC_KEY='pc_data_full_v1',DEBOUNCE_DELAY=1500,SERVER_URL='https://yourdomain.com/api/save_pc';
  let fadeTimer=null;
  function pc_load(key){const raw=localStorage.getItem(key);return raw?JSON.parse(raw):null;}
  function pc_saveToStorage(key,data){localStorage.setItem(key,JSON.stringify(data));markSaved();}
  let pcData=pc_load(PC_KEY)||{brand:'',model:'',total:0,ok:0,broken:0,lost:0,missing:0,pm:'',supervise:''};
  const statusBox=document.getElementById("pc_status");
  function showStatus(text,color="bg-slate-700",withSpinner=false){if(!statusBox)return;clearTimeout(fadeTimer);const spinner=withSpinner?'<span class="animate-spin mr-2 inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>':"";statusBox.innerHTML=spinner+text;statusBox.className=`pc-badge ${color}`;statusBox.classList.remove("pc-hidden");if(!withSpinner){fadeTimer=setTimeout(()=>statusBox.classList.add("pc-hidden"),3000);}}
  function markUnsaved(){showStatus("✖ Tidak Disimpan","bg-red-600");}
  function markSaved(){showStatus("✔ Disimpan (Local + Server)","bg-emerald-700");}
  function pc$(id){return document.getElementById(id);}
  function pc_debounce(fn,delay){let t;return(...args)=>{clearTimeout(t);t=setTimeout(()=>fn(...args),delay);};}
  function pc_uploadToServer(data){showStatus("Menyimpan ke server...","bg-blue-600",true);fetch(SERVER_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}).then(r=>{if(!r.ok)throw new Error("Server error "+r.status);return r.json().catch(()=>({ok:true}));}).then(()=>{markSaved();}).catch(err=>{showStatus("⚠ Gagal simpan ke server","bg-red-700");console.error("Upload PC ERROR:",err);});}
  const pc_autoSave=pc_debounce(()=>{pc_saveToStorage(PC_KEY,pcData);pc_uploadToServer(pcData);},DEBOUNCE_DELAY);
  function pc_flagChange(){markUnsaved();pc_autoSave();}
  function pc_applyFields(){pc$('pc_brand').value=pcData.brand||'';pc$('pc_model').value=pcData.model||'';pc$('pc_total_input').value=pcData.total||0;pc$('pc_ok_input').value=pcData.ok||0;pc$('pc_broken_input').value=pcData.broken||0;pc$('pc_lost_input').value=pcData.lost||0;pc$('pc_missing_input').value=pcData.missing||0;pc$('pc_pm').value=pcData.pm||'';pc$('pc_supervise').value=pcData.supervise||'';}
  function bindInputs(){pc$('pc_brand').addEventListener('input',e=>{pcData.brand=e.target.value;pc_flagChange();});pc$('pc_model').addEventListener('input',e=>{pcData.model=e.target.value;pc_flagChange();});const numeric=[['pc_total_input','total'],['pc_ok_input','ok'],['pc_broken_input','broken'],['pc_lost_input','lost'],['pc_missing_input','missing']];numeric.forEach(([id,key])=>{pc$(id).addEventListener('input',e=>{let v=parseInt(e.target.value);pcData[key]=isNaN(v)||v<0?0:v;pc_flagChange();});});pc$('pc_pm').addEventListener('change',e=>{pcData.pm=e.target.value;pc_flagChange();});pc$('pc_supervise').addEventListener('change',e=>{pcData.supervise=e.target.value;pc_flagChange();});}
  document.addEventListener('DOMContentLoaded',()=>{bindInputs();pc_applyFields();showStatus("Sedia untuk mengisi","bg-slate-600");});
})();

/* PERANTI GURU */
(function(){
  const PG_KEY='pg_data_full_v1',DEBOUNCE_DELAY=1500,SERVER_URL='https://yourdomain.com/api/save_pg';
  let fadeTimer=null;
  function pg_load(key){const raw=localStorage.getItem(key);return raw?JSON.parse(raw):null;}
  function pg_saveToStorage(key,data){localStorage.setItem(key,JSON.stringify(data));markSaved();}
  let pgData=pg_load(PG_KEY)||{company:'',start:'',end:'',brand:'',model:'',total:0};
  const statusBox=document.getElementById("pg_status");
  function showStatus(text,color="bg-slate-700",withSpinner=false){if(!statusBox)return;clearTimeout(fadeTimer);const spinner=withSpinner?'<span class="animate-spin mr-2 inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>':"";statusBox.innerHTML=spinner+text;statusBox.className=`pg-badge ${color}`;statusBox.classList.remove("pg-hidden");if(!withSpinner){fadeTimer=setTimeout(()=>statusBox.classList.add("pg-hidden"),3000);}}
  function markUnsaved(){showStatus("✖ Tidak Disimpan","bg-red-600");}
  function markSaved(){showStatus("✔ Disimpan (Local + Server)","bg-emerald-700");}
  function pg$(id){return document.getElementById(id);}
  function pg_debounce(fn,delay){let t;return(...args)=>{clearTimeout(t);t=setTimeout(()=>fn(...args),delay);};}
  function pg_uploadToServer(data){showStatus("Menyimpan ke server...","bg-blue-600",true);fetch(SERVER_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}).then(r=>{if(!r.ok)throw new Error("Server error "+r.status);return r.json().catch(()=>({ok:true}));}).then(()=>{markSaved();}).catch(err=>{showStatus("⚠ Gagal simpan ke server","bg-red-700");console.error("Upload PG ERROR:",err);});}
  const pg_autoSave=pg_debounce(()=>{pg_saveToStorage(PG_KEY,pgData);pg_uploadToServer(pgData);},DEBOUNCE_DELAY);
  function pg_flagChange(){markUnsaved();pg_autoSave();}
  function pg_applyFields(){pg$('pg_company').value=pgData.company||'';pg$('pg_start').value=pgData.start||'';pg$('pg_end').value=pgData.end||'';pg$('pg_brand').value=pgData.brand||'';pg$('pg_model').value=pgData.model||'';pg$('pg_total').value=pgData.total||0;}
  function bindInputs(){pg$('pg_company').addEventListener('input',e=>{pgData.company=e.target.value;pg_flagChange();});pg$('pg_start').addEventListener('change',e=>{pgData.start=e.target.value;pg_flagChange();});pg$('pg_end').addEventListener('change',e=>{pgData.end=e.target.value;pg_flagChange();});pg$('pg_brand').addEventListener('input',e=>{pgData.brand=e.target.value;pg_flagChange();});pg$('pg_model').addEventListener('input',e=>{pgData.model=e.target.value;pg_flagChange();});pg$('pg_total').addEventListener('input',e=>{let v=parseInt(e.target.value);pgData.total=isNaN(v)||v<0?0:v;pg_flagChange();});}
  document.addEventListener('DOMContentLoaded',()=>{bindInputs();pg_applyFields();showStatus("Sedia untuk mengisi","bg-slate-600");});
})();

/* INTERNET */
(function(){
  const NET_KEY='net_data_full_v1',DEBOUNCE_DELAY=1500,SERVER_URL='https://yourdomain.com/api/save_net';
  let fadeTimer=null;
  function net_load(key){const raw=localStorage.getItem(key);return raw?JSON.parse(raw):null;}
  function net_saveToStorage(key,data){localStorage.setItem(key,JSON.stringify(data));markSaved();}
  let netData=net_load(NET_KEY)||{isp:'TM Unifi',tech:'Broadband',speed:'300 Mbps',count:0,start:'',end:''};
  const statusBox=document.getElementById("net_status");
  function showStatus(text,color="bg-slate-700",withSpinner=false){if(!statusBox)return;clearTimeout(fadeTimer);const spinner=withSpinner?'<span class="animate-spin mr-2 inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>':"";statusBox.innerHTML=spinner+text;statusBox.className=`net-badge ${color}`;statusBox.classList.remove("net-hidden");if(!withSpinner){fadeTimer=setTimeout(()=>statusBox.classList.add("net-hidden"),3000);}}
  function markUnsaved(){showStatus("✖ Tidak Disimpan","bg-red-600");}
  function markSaved(){showStatus("✔ Disimpan (Local + Server)","bg-emerald-700");}
  function net$(id){return document.getElementById(id);}
  function net_debounce(fn,delay){let t;return(...args)=>{clearTimeout(t);t=setTimeout(()=>fn(...args),delay);};}
  function net_uploadToServer(data){showStatus("Menyimpan ke server...","bg-blue-600",true);fetch(SERVER_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}).then(r=>{if(!r.ok)throw new Error("Server error "+r.status);return r.json().catch(()=>({ok:true}));}).then(()=>{markSaved();}).catch(err=>{showStatus("⚠ Gagal simpan ke server","bg-red-700");console.error("Upload NET ERROR:",err);});}
  const net_autoSave=net_debounce(()=>{net_saveToStorage(NET_KEY,netData);net_uploadToServer(netData);},DEBOUNCE_DELAY);
  function net_flagChange(){markUnsaved();net_autoSave();}
  function net_applyFields(){net$('net_isp').value=netData.isp;net$('net_tech').value=netData.tech;net$('net_speed').value=netData.speed;net$('net_count').value=netData.count;net$('net_start').value=netData.start||'';net$('net_end').value=netData.end||'';}
  function bindInputs(){net$('net_isp').addEventListener('change',e=>{netData.isp=e.target.value;net_flagChange();});net$('net_tech').addEventListener('change',e=>{netData.tech=e.target.value;net_flagChange();});net$('net_speed').addEventListener('change',e=>{netData.speed=e.target.value;net_flagChange();});net$('net_count').addEventListener('input',e=>{let v=parseInt(e.target.value);netData.count=isNaN(v)||v<0?0:v;net_flagChange();});net$('net_start').addEventListener('change',e=>{netData.start=e.target.value;net_flagChange();});net$('net_end').addEventListener('change',e=>{netData.end=e.target.value;net_flagChange();});}
  document.addEventListener('DOMContentLoaded',()=>{bindInputs();net_applyFields();showStatus("Sedia untuk mengisi","bg-slate-600");});
})();

/* Logout modal handlers */
const logoutBtn=document.getElementById('logoutBtn');
const modal=document.getElementById('logoutModal');
const cancelBtn=document.getElementById('cancelLogout');
const confirmBtn=document.getElementById('confirmLogout');
logoutBtn&&logoutBtn.addEventListener('click',()=>{modal.classList.remove('hidden');});
cancelBtn&&cancelBtn.addEventListener('click',()=>{modal.classList.add('hidden');});
modal&&modal.addEventListener('click',e=>{if(e.target===modal){modal.classList.add('hidden');}});
confirmBtn&&confirmBtn.addEventListener('click',()=>{localStorage.removeItem('current_user');if(typeof toast==='function'){toast('Anda telah log keluar.');}modal.classList.add('hidden');});
