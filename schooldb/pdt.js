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