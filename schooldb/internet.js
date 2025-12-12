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