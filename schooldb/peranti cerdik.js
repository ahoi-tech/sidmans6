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