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