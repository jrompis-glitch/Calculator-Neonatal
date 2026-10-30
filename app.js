document.querySelectorAll("[data-open-page]").forEach(el=>el.addEventListener("click",()=>{location.href="./"+el.dataset.openPage;}));
let AAP=window.AAP2022Thresholds||{};
const $=id=>document.getElementById(id);const fmt=(n,d=2)=>Number.isFinite(n)?n.toLocaleString('id-ID',{minimumFractionDigits:d,maximumFractionDigits:d}):'—';
function view(name, push=true){
  const valid=['home','gir','bili','bind','thompson','prem','oxygen','co','ppi']; if(!valid.includes(name)) name='home';
  document.querySelectorAll('.view').forEach(v=>{const active=v.id===name+'View';v.classList.toggle('active',active);v.setAttribute('aria-hidden',String(!active));});
  document.querySelectorAll('[data-view]').forEach(b=>{const active=b.dataset.view===name;b.classList.toggle('active',active);if(b.classList.contains('nav-item'))b.setAttribute('aria-current',active?'page':'false');});
  document.body.dataset.page=name;
  if(push && location.hash!=='#'+name) history.pushState({page:name},'','#'+name);
  window.scrollTo({top:0,behavior:'auto'});
}
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>view(b.dataset.view)));
window.addEventListener('popstate',()=>view(location.hash.slice(1)||'home',false));
view(location.hash.slice(1)||'home',false);
let deferredInstall=null;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;$('installBtn').hidden=false});$('installBtn').addEventListener('click',async()=>{if(deferredInstall){deferredInstall.prompt();await deferredInstall.userChoice;deferredInstall=null;$('installBtn').hidden=true}else alert('Untuk memasang: buka menu browser ⋮ lalu pilih “Tambahkan ke layar utama” atau “Install app”.')});
if('serviceWorker' in navigator && location.protocol.startsWith('http'))window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
const ivType=$('ivType'),conc=$('conc'),category=$('category'),milkType=$('milkType');
const milkData={
  'ASI':[
    {value:'ASI kolostrum',label:'ASI kolostrum',carb:5.5},
    {value:'ASI transisi',label:'ASI transisi',carb:6.5},
    {value:'ASI matur',label:'ASI matur',carb:7},
    {value:'ASI perah',label:'ASI perah',carb:7},
    {value:'ASI donor',label:'ASI donor',carb:7}
  ],
  'PASI':[
    {value:'SGM Ananda 1',label:'SGM Ananda 1',carb:8},
    {value:'Nutribaby Royal 1 Acti Duobio',label:'Nutribaby Royal 1 Acti Duobio',carb:7.7},
    {value:'Morinaga BMT Gold 1',label:'Morinaga BMT Gold 1',carb:7},
    {value:'Lactogen 1',label:'Lactogen 1',carb:7.3},
    {value:'SGM Ananda Isopro Soy',label:'SGM Ananda Isopro Soy',carb:8},
    {value:'Bebelove Gold Soya 1',label:'Bebelove Gold Soya 1',carb:7.6},
    {value:'Input manual / produk lain',label:'Input manual / produk lain',carb:null}
  ],
  'Oral aff':[{value:'-',label:'— (tidak ada asupan enteral)',carb:0}]
};
function updateIV(){
  const val=ivType.value, numeric=Number(val);
  if(Number.isFinite(numeric)&&val!==''){
    conc.value=val;conc.readOnly=true;conc.required=true;
    $('concNote').textContent='Nilai referensi otomatis; verifikasi konsentrasi aktual pada kemasan.';
  }else{
    conc.value='';conc.readOnly=false;conc.required=true;
    $('concNote').textContent='Cairan campuran/KaEN: masukkan konsentrasi glukosa aktual berdasarkan label/komposisi yang diverifikasi.';
  }
}
function updateMilkOptions(){
  const cat=category.value, items=milkData[cat]||[];
  milkType.innerHTML=items.map(item=>`<option value="${item.value.replace(/"/g,'&quot;')}">${item.label}</option>`).join('');
  updateMilk();
}
function updateMilk(){
  const cat=category.value, item=(milkData[cat]||[]).find(x=>x.value===milkType.value);
  const oral=cat==='Oral aff', known=!!item&&item.carb!==null;
  $('carbRef').value=known?item.carb:'';
  $('carbOverride').value='';
  $('carbOverride').disabled=oral;
  $('carbOverrideWrap').hidden=oral;
  $('carbRef').value=oral?0:(known?item.carb:'');
  $('milkNote').textContent=oral?'Oral aff: kontribusi enteral dihitung 0.':known?'Nilai referensi; verifikasi label produk atau komposisi ASI.':'Produk tidak memiliki nilai referensi. Isi karbohidrat aktual dari label susu siap minum.';
  $('volume').disabled=oral;
  if(oral)$('volume').value=0;
  else if(+$('volume').value===0)$('volume').value=400;
}
ivType.addEventListener('change',updateIV);
category.addEventListener('change',updateMilkOptions);
milkType.addEventListener('change',updateMilk);
$('girForm').addEventListener('reset',()=>setTimeout(()=>{
  updateIV();category.value='ASI';updateMilkOptions();
  $('weight').value=3;$('targetGir').value=4;$('rate').value=2;$('volume').value=400;
  $('girResults').hidden=true;
},0));
updateIV();updateMilkOptions();
$('girForm').addEventListener('submit',e=>{
  e.preventDefault();
  const w=+$('weight').value, glucose=+$('conc').value, rate=+$('rate').value;
  const cat=category.value, oral=cat==='Oral aff', item=(milkData[cat]||[]).find(x=>x.value===milkType.value);
  const vol=oral?0:+$('volume').value, override=$('carbOverride').value.trim();
  const carb=oral?0:(override!==''?+override:(item&&item.carb!==null?item.carb:null));
  const target=$('targetGir').value===''?null:+$('targetGir').value;
  if(!(w>0)||!Number.isFinite(glucose)||glucose<0||rate<0||vol<0||glucose>100){alert('Periksa kembali berat badan, konsentrasi glukosa, laju infus, dan volume enteral.');return}
  if(!oral&&carb===null){alert('Karbohidrat produk belum tersedia. Isi karbohidrat aktual berdasarkan label susu siap minum.');$('carbOverride').focus();return}
  if(carb!==null&&carb<0){alert('Karbohidrat tidak boleh negatif.');return}
  const iv=(glucose*rate)/(6*w), enteral=oral?0:(carb*vol*10)/(w*1440), total=iv+enteral, diff=target===null?null:total-target;
  $('girResults').innerHTML=`<div class="result-hero"><div class="result-kicker">Hasil perhitungan</div><h2>Total GIR estimasi ${fmt(total)} <small>mg/kg/menit</small></h2><p>Hasil ini menggabungkan GIR intravena dan estimasi kontribusi karbohidrat enteral dari input.</p></div><div class="metric-grid"><div class="metric"><span>GIR intravena</span><strong>${fmt(iv)}</strong><small>mg/kg/menit</small></div><div class="metric"><span>Estimasi GIR enteral</span><strong>${fmt(enteral)}</strong><small>mg/kg/menit</small></div></div><div class="result-detail"><h3>Rincian perhitungan</h3><div class="detail-row"><span>Berat badan aktual</span><b>${fmt(w,2)} kg</b></div><div class="detail-row"><span>Jenis cairan IV</span><b>${ivType.value==='custom'?'Cairan lain':ivType.value.includes('KaEN')?ivType.value:`Dextrose ${ivType.value}%`}</b></div><div class="detail-row"><span>Konsentrasi glukosa</span><b>${fmt(glucose,1)}%</b></div><div class="detail-row"><span>Laju infus</span><b>${fmt(rate,1)} mL/jam</b></div><div class="detail-row"><span>Kategori enteral</span><b>${cat}</b></div><div class="detail-row"><span>Jenis / merek / varian</span><b>${oral?'Oral aff':item?item.label:'—'}</b></div><div class="detail-row"><span>Karbohidrat yang digunakan</span><b>${oral?'0':fmt(carb,1)+' g/100 mL'}</b></div><div class="detail-row"><span>Volume enteral</span><b>${fmt(vol,0)} mL/24 jam</b></div>${target!==null?`<div class="detail-row"><span>Target GIR</span><b>${fmt(target)} mg/kg/menit</b></div><div class="detail-row"><span>Total estimasi − target</span><b>${diff>=0?'+':''}${fmt(diff)} mg/kg/menit</b></div><p class="chart-note">${diff>0?'Total estimasi berada di atas target yang dimasukkan.':diff<0?'Total estimasi berada di bawah target yang dimasukkan.':'Total estimasi sama dengan target yang dimasukkan.'}</p>`:''}</div><div class="warning-card"><b>Catatan keselamatan</b><p>GIR intravena dihitung dari konsentrasi dan laju infus. Kontribusi enteral adalah estimasi asupan karbohidrat, bukan GIR sistemik terukur. Verifikasi konsentrasi cairan dan kandungan karbohidrat aktual. Jangan mengubah terapi hanya berdasarkan kalkulator; interpretasikan bersama glukosa darah serial, kondisi klinis, dan protokol NICU.</p></div>`;
  $('girResults').hidden=false;$('girResults').scrollIntoView({behavior:'smooth',block:'start'});
});
function threshold(group,ga,age){let gs=AAP[String(group)];if(!gs)return null;let row=gs[String(ga)];if(!row)return null;return row[String(Math.max(1,Math.min(336,Math.floor(age))))]??null}
function chartPath(points,x,y){let valid=points.filter(p=>p[1]!==null&&Number.isFinite(p[1]));return valid.map((p,i)=>(i?'L':'M')+x(p[0]).toFixed(1)+','+y(p[1]).toFixed(1)).join(' ')}
function drawChart(ga,risks,age,tsb,photoGroup,exchangeGroup,photoGA,exchangeGA){const svg=$('bilirubinChart'),W=640,H=320,L=46,R=14,T=16,B=38,plotW=W-L-R,plotH=H-T-B,x=v=>L+v/336*plotW,y=v=>T+(28-v)/24*plotH;let s='';for(let val=4;val<=28;val+=2){s+=`<line x1="${L}" y1="${y(val)}" x2="${W-R}" y2="${y(val)}" stroke="#e4ebf1"/><text x="${L-8}" y="${y(val)+4}" text-anchor="end" font-size="10" fill="#718496">${val}</text>`}for(let val=0;val<=336;val+=12){s+=`<line x1="${x(val)}" y1="${T}" x2="${x(val)}" y2="${H-B}" stroke="#edf1f5"/>${val%24===0?`<text x="${x(val)}" y="${H-16}" text-anchor="middle" font-size="10" fill="#718496">${val}</text>`:''}`}const pts=[];for(let h=1;h<=336;h+=3){pts.push([h,threshold(photoGroup,photoGA,h)]);}pts.push([336,threshold(photoGroup,photoGA,336)]);const ex=[];for(let h=1;h<=336;h+=3)ex.push([h,threshold(exchangeGroup,exchangeGA,h)]);ex.push([336,threshold(exchangeGroup,exchangeGA,336)]);s+=`<path d="${chartPath(pts,x,y)}" fill="none" stroke="#2878bf" stroke-width="3" stroke-linejoin="round"/><path d="${chartPath(ex,x,y)}" fill="none" stroke="#d18a26" stroke-width="3" stroke-linejoin="round"/>`;if(tsb>=4&&tsb<=28){s+=`<line x1="${x(age)}" y1="${T}" x2="${x(age)}" y2="${H-B}" stroke="#b84058" stroke-dasharray="4 4" opacity=".6"/><circle cx="${x(age)}" cy="${y(tsb)}" r="5" fill="#b84058" stroke="white" stroke-width="2"/><text x="${Math.min(W-R-35,Math.max(L+10,x(age)+7))}" y="${Math.max(T+12,y(tsb)-9)}" font-size="10" font-weight="700" fill="#a8324c">TSB ${fmt(tsb,1)}</text>`}s+=`<text x="${W/2}" y="${H-2}" text-anchor="middle" font-size="10" fill="#718496">Usia bayi (jam)</text><text x="13" y="${H/2}" transform="rotate(-90 13 ${H/2})" text-anchor="middle" font-size="10" fill="#718496">TSB (mg/dL)</text>`;svg.innerHTML=s;}
$('biliForm').addEventListener('reset',()=>setTimeout(()=>{$('biliResults').hidden=true;$('chartPanel').hidden=true},0));
$('biliForm').addEventListener('submit',e=>{e.preventDefault();if(!Object.keys(AAP).length){alert('Data ambang belum selesai dimuat. Tunggu sebentar lalu coba lagi.');return}const ga=+$('ga').value,age=+$('ageHours').value,tsb=+$('tsb').value,extra=['riskAlbumin','riskHemolysis','riskSepsis','riskInstability'].some(id=>$(id).value==='Ya'),enceph=$('encephalopathy').value==='Ya';if(age<1){alert('Tabel AAP yang digunakan tidak menyediakan ambang numerik untuk usia kurang dari 1 jam.');return}const photoGA=extra?Math.min(ga,38):Math.min(ga,40),exchangeGA=Math.min(ga,38),photoGroup=extra?2:1,exchangeGroup=extra?4:3,photo=threshold(photoGroup,photoGA,age),exchange=threshold(exchangeGroup,exchangeGA,age),escalation=exchange===null?null:exchange-2;let title,detail,klass;if(ga<35){title='Tidak dapat digunakan';detail='Usia gestasi <35 minggu. Gunakan protokol hiperbilirubinemia prematur yang berlaku di unit.';klass='danger-card'}else if(enceph){title='DARURAT: evaluasi transfusi tukar';detail='Tanda ensefalopati bilirubin akut sedang/berat memerlukan tindakan segera sesuai protokol. Jangan menunggu kalkulator.';klass='danger-card'}else if(photo===null||exchange===null){title='Ambang tidak tersedia';detail='Periksa usia gestasi, usia dalam jam, dan data tabel.';klass='warning-card'}else if(tsb>=exchange){title='TRANSFUSI TUKAR';detail='TSB mencapai atau melewati ambang transfusi tukar. Ini memerlukan tindakan emergensi sesuai protokol.';klass='danger-card'}else if(tsb>=photo){title='FOTOTERAPI';detail='TSB mencapai atau melewati ambang fototerapi AAP 2022.';klass='warning-card'}else{title='BELUM PERLU FOTOTERAPI';detail='TSB di bawah ambang fototerapi pada usia saat ini. Lanjutkan pemantauan sesuai kondisi klinis dan pedoman.';klass='success-card'}let extraWarn=exchange!==null&&tsb>=escalation&&tsb<exchange?`<div class="danger-card"><b>Ambang eskalasi perawatan tercapai.</b> TSB berada dalam 2 mg/dL di bawah ambang transfusi tukar. Eskalasi segera sesuai protokol, termasuk fototerapi intensif, konsultasi neonatolog, dan pemantauan TSB yang sesuai.</div>`:'';let follow='';if(title.startsWith('BELUM')&&photo!==null){const dis=$('dischargeHours').value===''?age:+$('dischargeHours').value;const d=threshold(photoGroup,photoGA,dis);if(d!==null){const delta=d-tsb;let action=delta<=0?'Evaluasi segera; jangan gunakan tindak lanjut rutin.':delta<2?'Sangat dekat ambang; pertimbangkan pengukuran ulang TSB/TcB dalam 4–8 jam.':delta<3.5?'Follow-up dalam 24 jam.':delta<5.5?'Follow-up dalam 24–48 jam.':delta<7?'Follow-up dalam 48 jam.':'Follow-up dalam 48–72 jam atau sesuai pertimbangan klinis.';let confirm=$('bilirubinType').value==='TcB'&&(delta<3||tsb>=15)?' TcB yang <3 mg/dL di bawah ambang atau ≥15 mg/dL perlu konfirmasi TSB.':'';follow=`<div class="result-detail"><h3>Tindak lanjut saat rencana pulang</h3><div class="detail-row"><span>Ambang fototerapi pada usia pulang</span><b>${fmt(d,1)} mg/dL</b></div><div class="detail-row"><span>Selisih ambang − TSB saat ini</span><b>${fmt(delta,1)} mg/dL</b></div><div class="detail-row"><span>Rekomendasi</span><b>${action}</b></div><p class="chart-note">Tabel tindak lanjut ini hanya berlaku pada bayi selama perawatan kelahiran yang belum menerima fototerapi. Sesuaikan dengan tren TSB, kecukupan minum, berat badan, faktor risiko, dan pertimbangan klinis.${confirm}</p></div>`}}
$('biliResults').innerHTML=`<div class="result-hero"><div class="result-kicker">Kesimpulan klinis • alat bantu</div><h2>${title}</h2><p>${detail}</p></div><div class="metric-grid"><div class="metric"><span>Ambang fototerapi</span><strong>${photo===null?'—':fmt(photo,1)}</strong><small>mg/dL</small></div><div class="metric"><span>Ambang transfusi tukar</span><strong>${exchange===null?'—':fmt(exchange,1)}</strong><small>mg/dL</small></div><div class="metric"><span>Ambang eskalasi perawatan</span><strong>${escalation===null?'—':fmt(escalation,1)}</strong><small>mg/dL • 2 di bawah transfusi tukar</small></div><div class="metric"><span>TSB pasien</span><strong>${fmt(tsb,1)}</strong><small>mg/dL</small></div></div><div class="${klass}"><b>${title}</b><br>${detail}</div>${extraWarn}<div class="result-detail"><h3>Dasar pemilihan kurva</h3><div class="detail-row"><span>Usia gestasi</span><b>${ga===43?'>42':ga} minggu</b></div><div class="detail-row"><span>Usia saat TSB</span><b>${age} jam</b></div><div class="detail-row"><span>Faktor risiko tambahan</span><b>${extra?'Ada ≥1 faktor':'Tidak ada'}</b></div><div class="detail-row"><span>Kurva fototerapi</span><b>Grafik ${photoGroup===2?'4':'3'} • GA tabel ${photoGA}</b></div><div class="detail-row"><span>Kurva transfusi tukar</span><b>Grafik ${exchangeGroup===4?'1':'2'} • GA tabel ${exchangeGA}</b></div></div>${follow}<p class="chart-note">Ambang dihitung dengan pembulatan usia ke bawah ke jam penuh, sesuai logika workbook v18. Hasil bukan pengganti pedoman resmi dan penilaian klinis.</p>`;$('biliResults').hidden=false;$('chartPanel').hidden=false;drawChart(ga,extra,age,tsb,photoGroup,exchangeGroup,photoGA,exchangeGA);$('biliResults').scrollIntoView({behavior:'smooth',block:'start'});});


// Kalkulator TSB bayi prematur <35 minggu — logika sesuai workbook Kalkulator_TSB_Prematur_Fix.xlsx
const premForm=$('premForm');
if(premForm){
  premForm.addEventListener('submit',e=>{
    e.preventDefault();
    const ga=+$('premGA').value, days=+$('premDays').value, post=+$('premPostnatal').value, tsb=+$('premTSB').value;
    const albumin=$('premAlbumin').value==='Ya', hemolysis=$('premHemolysis').value==='Ya', unstable=$('premUnstable').value==='Ya', enceph=$('premEnceph').value==='Ya';
    if(!ga && ga!==0 || $('premDays').value==='' || $('premPostnatal').value==='' || $('premTSB').value===''){alert('Lengkapi semua data pasien.');return;}
    const risk=albumin||hemolysis||unstable;
    const pma=ga+days/7+post/7;
    let photoGroup,photoLow,photoHigh;
    if(pma<28){photoGroup='<28 minggu';[photoLow,photoHigh]=risk?[5,5]:[6,6];}
    else if(pma<30){photoGroup='28+0–29+6 minggu';[photoLow,photoHigh]=risk?[6,6]:[8,8];}
    else if(pma<32){photoGroup='30+0–31+6 minggu';[photoLow,photoHigh]=risk?[8,8]:[10,10];}
    else if(pma<34){photoGroup='32+0–33+6 minggu';[photoLow,photoHigh]=risk?[10,10]:[12,12];}
    else if(pma<35){photoGroup='34+0–34+6 minggu';[photoLow,photoHigh]=risk?[12,12]:[14,14];}
    else {photoGroup='PMA ≥35 minggu';photoLow=photoHigh=null;}
    let exchangeLow,exchangeHigh;
    if(ga<28)[exchangeLow,exchangeHigh]=risk?[11,11]:[14,14];
    else if(ga<30)[exchangeLow,exchangeHigh]=risk?[12,12]:[14,14];
    else if(ga<32)[exchangeLow,exchangeHigh]=risk?[13,13]:[16,16];
    else if(ga<34)[exchangeLow,exchangeHigh]=risk?[15,15]:[18,18];
    else [exchangeLow,exchangeHigh]=risk?[17,17]:[19,19];
    let title,detail,klass='success-card';
    if(enceph){title='DARURAT: EVALUASI SEGERA';detail='Tanda ensefalopati bilirubin akut dilaporkan. Jangan menunda evaluasi dan penanganan untuk menyelesaikan kalkulator; konsultasi neonatolog dan evaluasi transfusi tukar sesuai protokol NICU.';klass='danger-card';}
    else if(pma>=35){title='KALKULATOR TIDAK BERLAKU';detail='PMA saat ini ≥35 minggu. Gunakan pedoman hiperbilirubinemia yang sesuai dengan usia gestasi dan protokol unit.';klass='warning-card';}
    else if(tsb>=exchangeLow){title='TSB MENCAPAI AMBANG TRANSFUSI TUKAR';detail='Evaluasi segera untuk transfusi tukar sesuai protokol NICU dan lanjutkan fototerapi intensif selama persiapan.';klass='danger-card';}
    else if(tsb>=photoLow){title='TSB MENCAPAI AMBANG FOTOTERAPI';detail='Mulai atau lanjutkan fototerapi dan pantau TSB serial sesuai kondisi klinis dan protokol NICU.';klass='warning-card';}
    else {title='TSB DI BAWAH AMBANG YANG DIPILIH';detail='Lanjutkan pemantauan klinis dan TSB serial sesuai kondisi bayi, tren bilirubin, dan protokol NICU.';klass='success-card';}
    const fmt1=n=>Number(n).toLocaleString('id-ID',{minimumFractionDigits:1,maximumFractionDigits:1});
    $('premResults').innerHTML=`<div class="result-hero"><div class="result-kicker">Hasil kalkulator TSB prematur • alat bantu</div><h2>${title}</h2><p>${detail}</p></div><div class="metric-grid"><div class="metric"><span>PMA saat pemeriksaan</span><strong>${fmt1(pma)}</strong><small>minggu</small></div><div class="metric"><span>Ambang fototerapi</span><strong>${photoLow===null?'—':fmt1(photoLow)}</strong><small>mg/dL</small></div><div class="metric"><span>Ambang transfusi tukar</span><strong>${fmt1(exchangeLow)}</strong><small>mg/dL</small></div><div class="metric"><span>TSB pasien</span><strong>${fmt1(tsb)}</strong><small>mg/dL</small></div></div><div class="${klass}"><b>${title}</b><br>${detail}</div><div class="result-detail"><h3>Dasar pemilihan ambang</h3><div class="detail-row"><span>Usia gestasi lahir</span><b>${ga} minggu + ${days} hari</b></div><div class="detail-row"><span>Usia pascanatal</span><b>${post} hari</b></div><div class="detail-row"><span>Kelompok PMA untuk fototerapi</span><b>${photoGroup}</b></div><div class="detail-row"><span>Faktor risiko tambahan</span><b>${risk?'Ada ≥1 faktor':'Tidak dilaporkan'}</b></div><div class="detail-row"><span>Ambang transfusi tukar</span><b>${exchangeLow} mg/dL (${risk?'batas bawah':'batas atas sesuai kelompok'})</b></div></div><p class="chart-note">Ambang fototerapi dan transfusi tukar pada workbook adalah rentang konsensus yang disederhanakan ke satu angka sesuai pilihan risiko. Verifikasi tabel asli, tren TSB, PMA, dan protokol NICU sebelum mengambil tindakan. Jangan mengurangi bilirubin direk dari TSB.</p>`;
    $('premResults').hidden=false;
    $('premResults').scrollIntoView({behavior:'smooth',block:'start'});
  });
  premForm.addEventListener('reset',()=>setTimeout(()=>{$('premResults').hidden=true;$('premResults').innerHTML='';},0));
}

// Oxygen Index calculator — aligned with Kalkulator_Oxygen_Index_Neonatus_v2.xlsx
const oxygenForm=$('oxygenForm');
if(oxygenForm){
 const oiFmt=n=>Number(n).toLocaleString('id-ID',{minimumFractionDigits:1,maximumFractionDigits:1});
 oxygenForm.addEventListener('submit',e=>{e.preventDefault();
 const fio=+$('oiFio2').value,pip=+$('oiPip').value,peep=+$('oiPeep').value,ti=+$('oiTi').value,rr=+$('oiRR').value,pao2=+$('oiPao2').value;
 if(![fio,pip,peep,ti,rr,pao2].every(Number.isFinite)||rr<=0||pao2<=0||ti<=0||pip<peep){alert('Periksa input: PIP harus ≥ PEEP dan seluruh nilai harus valid.');return;}
 const ttot=60/rr,map=peep+(pip-peep)*(ti/ttot),oi=fio*map/pao2;
 let interp=oi<5?'Gangguan oksigenasi relatif ringan':oi<15?'Gangguan oksigenasi':oi<25?'Gangguan sedang hingga berat':oi<=40?'Gangguan berat':'Gangguan sangat berat';
 let ino=oi<10?'Oksigenasi relatif lebih baik; umumnya belum menjadi indikasi iNO rutin.':oi<15?'Gangguan oksigenasi; optimalkan ventilasi dan evaluasi penyebab.':oi<20?'Pertimbangkan iNO pada PPHN tertentu, terutama bila hipoksemia menetap meskipun tata laksana optimal.':oi<25?'Ambang umum untuk mempertimbangkan iNO pada neonatus cukup bulan atau mendekati cukup bulan dengan hipoksemia persisten.':'Hipoksemia berat; risiko kegagalan terapi meningkat dan perlu evaluasi cepat serta penanganan di NICU tersier.';
 const cls=oi>=25?'danger-card':oi>=15?'warning-card':'success-card';
 $('oxygenResults').innerHTML=`<div class="result-hero"><div class="result-kicker">Hasil kalkulator • alat bantu klinis</div><h2>Oxygen Index: ${oiFmt(oi)}</h2><p>${interp}</p></div><div class="metric-grid"><div class="metric"><span>Estimasi MAP</span><strong>${oiFmt(map)}</strong><small>cmH₂O</small></div><div class="metric"><span>Oxygen Index</span><strong>${oiFmt(oi)}</strong><small>tanpa satuan</small></div><div class="metric"><span>Total waktu siklus</span><strong>${oiFmt(ttot)}</strong><small>detik</small></div><div class="metric"><span>PaO₂</span><strong>${oiFmt(pao2)}</strong><small>mmHg</small></div></div><div class="${cls}"><b>Interpretasi OI: ${interp}</b></div><div class="result-detail"><h3>Pertimbangan pemberian iNO</h3><p>${ino}</p><div class="detail-row"><span>FiO₂</span><b>${oiFmt(fio)}%</b></div><div class="detail-row"><span>PIP / PEEP</span><b>${oiFmt(pip)} / ${oiFmt(peep)} cmH₂O</b></div><div class="detail-row"><span>Ti / frekuensi</span><b>${oiFmt(ti)} detik / ${rr} kali/menit</b></div></div><p class="chart-note">MAP adalah estimasi dari parameter ventilator. Jika MAP terukur tersedia, perhitungan OI klinis umumnya menggunakan MAP terukur. Pertimbangan iNO terutama relevan pada PPHN neonatus cukup bulan/mendekati cukup bulan dengan hipoksemia persisten; gunakan evaluasi klinis, ekokardiografi bila tersedia, dan protokol unit.</p>`;
 $('oxygenResults').hidden=false;$('oxygenResults').scrollIntoView({behavior:'smooth',block:'start'});
 });
 oxygenForm.addEventListener('reset',()=>setTimeout(()=>{$('oxygenResults').hidden=true;$('oxygenResults').innerHTML='';},0));
}


/* Kalkulator PPI Neonatal: data referensi dari workbook PPI pengguna, usia gestasi 35–41 minggu */
(function(){
 const ppiData={
  pre:[
   {ga:35,p3:.47,p10:.74,p25:.98,p50:1.38,p75:2.38,p90:4.13,p97:6.69},
   {ga:36,p3:.54,p10:.84,p25:1.12,p50:1.55,p75:2.62,p90:4.44,p97:7.06},
   {ga:37,p3:.61,p10:.94,p25:1.24,p50:1.72,p75:2.84,p90:4.73,p97:7.40},
   {ga:38,p3:.66,p10:1.01,p25:1.34,p50:1.85,p75:3.03,p90:4.96,p97:7.66},
   {ga:39,p3:.68,p10:1.06,p25:1.40,p50:1.95,p75:3.16,p90:5.10,p97:7.79},
   {ga:40,p3:.69,p10:1.08,p25:1.44,p50:2.00,p75:3.23,p90:5.16,p97:7.79},
   {ga:41,p3:.68,p10:1.08,p25:1.46,p50:2.05,p75:3.28,p90:5.19,p97:7.76}
  ],
  post:[
   {ga:35,p3:.28,p10:.46,p25:.63,p50:.94,p75:1.74,p90:3.14,p97:5.18},
   {ga:36,p3:.34,p10:.56,p25:.77,p50:1.14,p75:2.09,p90:3.69,p97:5.98},
   {ga:37,p3:.43,p10:.68,p25:.93,p50:1.37,p75:2.44,p90:4.21,p97:6.70},
   {ga:38,p3:.51,p10:.79,p25:1.07,p50:1.56,p75:2.71,p90:4.58,p97:7.16},
   {ga:39,p3:.55,p10:.84,p25:1.13,p50:1.65,p75:2.82,p90:4.69,p97:7.23},
   {ga:40,p3:.55,p10:.85,p25:1.15,p50:1.68,p75:2.86,p90:4.68,p97:7.13},
   {ga:41,p3:.54,p10:.85,p25:1.16,p50:1.71,p75:2.89,p90:4.69,p97:7.07}
  ]
 };
 const fmtPPI=n=>Number(n).toLocaleString('id-ID',{minimumFractionDigits:2,maximumFractionDigits:2});
 const labels=[['p3','P3'],['p10','P10'],['p25','P25'],['p50','P50'],['p75','P75'],['p90','P90'],['p97','P97']];
 function classify(v,d){
  if(v===null||v===''||!Number.isFinite(v))return {range:'Belum diisi',meaning:'Masukkan nilai PPI'};
  if(v<d.p3)return {range:'Di bawah P3',meaning:'Sangat rendah; perlu perhatian khusus'};
  if(v<d.p10)return {range:'P3 hingga kurang dari P10',meaning:'Rendah'};
  if(v<d.p25)return {range:'P10 hingga kurang dari P25',meaning:'Relatif rendah'};
  if(v<=d.p75)return {range:'P25–P75',meaning:'Rentang tengah distribusi'};
  if(v<=d.p90)return {range:'Di atas P75 hingga P90',meaning:'Relatif tinggi'};
  if(v<=d.p97)return {range:'Di atas P90 hingga P97',meaning:'Tinggi'};
  return {range:'Di atas P97',meaning:'Sangat tinggi'};
 }
 function chart(targetId,title,data,ga,value){
  const target=document.getElementById(targetId);if(!target)return;
  const W=720,H=390,L=62,R=25,T=42,B=58,iw=W-L-R,ih=H-T-B,yMax=Math.max(8,Math.ceil((Number.isFinite(value)?value:0)+0.2));
  const x=g=>L+(g-35)/6*iw, y=v=>T+ih-(v/yMax)*ih;
  const colors={p3:'#315b8a',p10:'#a24b4b',p25:'#839b4d',p50:'#74578b',p75:'#4d98a8',p90:'#d28a42',p97:'#8fa2c2'};
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${title}" style="width:100%;height:auto;display:block"><text x="${W/2}" y="23" text-anchor="middle" font-size="17" font-weight="700" fill="#17365d">${title}</text>`;
  for(let tick=0;tick<=yMax;tick++){const yy=y(tick);s+=`<line x1="${L}" y1="${yy}" x2="${W-R}" y2="${yy}" stroke="#d7e0e8" stroke-width="1"/><text x="${L-10}" y="${yy+4}" text-anchor="end" font-size="11" fill="#516579">${tick.toFixed(1)}</text>`;}
  for(let g=35;g<=41;g++){const xx=x(g);s+=`<line x1="${xx}" y1="${T}" x2="${xx}" y2="${T+ih}" stroke="#e1e8ef" stroke-width="1"/><text x="${xx}" y="${T+ih+20}" text-anchor="middle" font-size="11" fill="#516579">${g}</text>`;}
  s+=`<line x1="${L}" y1="${T}" x2="${L}" y2="${T+ih}" stroke="#617487"/><line x1="${L}" y1="${T+ih}" x2="${W-R}" y2="${T+ih}" stroke="#617487"/><text x="18" y="${T+ih/2}" transform="rotate(-90 18 ${T+ih/2})" text-anchor="middle" font-size="12" font-weight="600" fill="#31465b">PPI (%)</text><text x="${L+iw/2}" y="${H-13}" text-anchor="middle" font-size="12" font-weight="600" fill="#31465b">Usia gestasi (minggu)</text>`;
  labels.forEach(([key,label],idx)=>{const points=data.map(d=>`${x(d.ga)},${y(d[key])}`).join(' ');s+=`<polyline points="${points}" fill="none" stroke="${colors[key]}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>`;const ly=T+15+idx*17;s+=`<line x1="${W-112}" y1="${ly}" x2="${W-96}" y2="${ly}" stroke="${colors[key]}" stroke-width="3"/><text x="${W-90}" y="${ly+4}" font-size="11" fill="#34495e">${label}</text>`;});
  if(Number.isInteger(ga)&&ga>=35&&ga<=41&&value!==null&&value!==''&&Number.isFinite(value)&&value>=0&&value<=yMax){
   s+=`<circle cx="${x(ga)}" cy="${y(value)}" r="5" fill="#ef4444" stroke="#fff" stroke-width="1.8"/><circle cx="${x(ga)}" cy="${y(value)}" r="8" fill="none" stroke="#ef4444" stroke-opacity=".25" stroke-width="2"/>`;
  }
  s+='</svg>';target.innerHTML=s;
 }
 function render(){
  const ga=Number(document.getElementById('ppiGA').value);
  const preRaw=document.getElementById('ppiPre').value,postRaw=document.getElementById('ppiPost').value;
  const pre=preRaw===''?null:Number(preRaw),post=postRaw===''?null:Number(postRaw);
  const results=document.getElementById('ppiResults');
  if(!Number.isInteger(ga)||ga<35||ga>41){
   results.hidden=false;results.innerHTML='<div class="ppi-result warning-result"><b>Di luar rentang referensi</b><p>Data referensi PPI yang tersedia hanya mencakup usia gestasi 35–41 minggu. Persentil tidak dihitung.</p></div>';
   chart('ppiPreChart','PPI Preduktal menurut Usia Gestasi',ppiData.pre,ga,null);chart('ppiPostChart','PPI Postduktal menurut Usia Gestasi',ppiData.post,ga,null);return;
  }
  const preD=ppiData.pre.find(d=>d.ga===ga),postD=ppiData.post.find(d=>d.ga===ga);
  const cards=[];
  [['Preduktal',pre,preD],['Postduktal',post,postD]].forEach(([name,v,d])=>{
   if(v===null)return;const c=classify(v,d);
   cards.push(`<div class="ppi-result"><div class="ppi-result-kicker">PPI ${name}</div><div class="ppi-result-value">${fmtPPI(v)}</div><div class="ppi-result-line"><span>Rentang persentil</span><b>${c.range}</b></div><div class="ppi-result-line"><span>Interpretasi</span><b>${c.meaning}</b></div><div class="ppi-thresholds">${labels.map(([k,l])=>`<span>${l}: ${fmtPPI(d[k])}</span>`).join('')}</div></div>`);
  });
  results.hidden=cards.length===0;results.innerHTML=cards.join('');
  chart('ppiPreChart','PPI Preduktal menurut Usia Gestasi',ppiData.pre,ga,pre);chart('ppiPostChart','PPI Postduktal menurut Usia Gestasi',ppiData.post,ga,post);
 }
 const form=document.getElementById('ppiForm');if(!form)return;
 form.addEventListener('submit',e=>{e.preventDefault();render();document.getElementById('ppiResults').scrollIntoView({behavior:'smooth',block:'start'});});
 form.addEventListener('reset',()=>setTimeout(()=>{document.getElementById('ppiResults').hidden=true;document.getElementById('ppiResults').innerHTML='';chart('ppiPreChart','PPI Preduktal menurut Usia Gestasi',ppiData.pre,37,null);chart('ppiPostChart','PPI Postduktal menurut Usia Gestasi',ppiData.post,37,null);},0));
 ['ppiGA','ppiPre','ppiPost'].forEach(id=>document.getElementById(id).addEventListener('input',render));
 chart('ppiPreChart','PPI Preduktal menurut Usia Gestasi',ppiData.pre,37,null);chart('ppiPostChart','PPI Postduktal menurut Usia Gestasi',ppiData.post,37,null);
})();


// Cardiac Output and Cardiac Index: LVOT/RVOT Doppler method.
const coForm=$('coForm');
if(coForm){
 const num=id=>Number($(id).value);
 const coFmt=(v,d=2)=>Number.isFinite(v)?v.toLocaleString('id-ID',{minimumFractionDigits:d,maximumFractionDigits:d}):'—';
 const classify=(v,lo,hi)=>v<lo?'Rendah':v>hi?'Tinggi':'Normal';
 const metric=(label,value,unit)=>`<div class="metric"><span>${label}</span><strong>${coFmt(value)}</strong><small>${unit}</small></div>`;
 coForm.addEventListener('submit',e=>{
  e.preventDefault();
  const weight=num('coWeight'),length=num('coLength'),hr=num('coHR');
  const bsa=Math.sqrt(weight*length/3600);
  const calc=(prefix,name)=>{
   const d=num(prefix+'d'),vti=num(prefix+'vti'),csa=Math.PI*Math.pow(d/2,2),sv=csa*vti,co=sv*hr,coL=co/1000,ci=coL/bsa,coKg=co/weight,svKg=sv/weight;
   return {name,d,vti,csa,sv,co,coL,ci,coKg,svKg,status:classify(ci,2.6,4.0)};
  };
  const lv=calc('coLV','Ventrikel kiri'),rv=calc('coRV','Ventrikel kanan');
  const detail=x=>`<div class="result-detail"><h3>Cardiac Output ${x.name}</h3><div class="detail-row"><span>Diameter outflow tract</span><b>${coFmt(x.d)} cm</b></div><div class="detail-row"><span>CSA</span><b>${coFmt(x.csa,3)} cm²</b></div><div class="detail-row"><span>VTI</span><b>${coFmt(x.vti)} cm</b></div><div class="detail-row"><span>Stroke Volume</span><b>${coFmt(x.sv)} mL/denyut</b></div><div class="detail-row"><span>Stroke Volume terindeks berat</span><b>${coFmt(x.svKg)} mL/kg/denyut</b></div><div class="detail-row"><span>Cardiac Output</span><b>${coFmt(x.co)} mL/menit (${coFmt(x.coL)} L/menit)</b></div><div class="detail-row"><span>CO terindeks berat</span><b>${coFmt(x.coKg)} mL/kg/menit</b></div><div class="detail-row"><span>Cardiac Index</span><b>${coFmt(x.ci)} L/menit/m²</b></div><div class="detail-row"><span>Kesimpulan CI</span><b>${x.status}</b></div></div>`;
  const overall=(lv.status==='Normal'&&rv.status==='Normal')?'Kedua CI berada dalam rentang referensi orientatif (Normal)':(lv.status===rv.status?`LV dan RV: ${lv.status}`:`Hasil LV dan RV berbeda; evaluasi klinis/ekokardiografi diperlukan`);
  $('coResults').innerHTML=`<div class="result-hero"><div class="result-kicker">Hasil kalkulator • alat bantu klinis</div><h2>Cardiac Output • CI</h2><p>${overall}</p></div><div class="metric-grid">${metric('BSA',bsa,'m²')}${metric('Heart rate',hr,'kali/menit')}${metric('CO LV',lv.coL,'L/menit')}${metric('CI LV',lv.ci,'L/menit/m²')}${metric('CO RV',rv.coL,'L/menit')}${metric('CI RV',rv.ci,'L/menit/m²')}</div>${detail(lv)}${detail(rv)}<div class="warning-card"><b>Catatan:</b> Hasil perhitungan sangat bergantung pada akurasi diameter dan VTI. Karena diameter dikuadratkan dalam perhitungan CSA, kesalahan kecil pengukuran diameter dapat berdampak besar pada estimasi CO. Jangan gunakan kategori otomatis sebagai satu-satunya dasar keputusan klinis.</div>`;
  $('coResults').hidden=false;$('coResults').scrollIntoView({behavior:'smooth',block:'start'});
 });
 coForm.addEventListener('reset',()=>setTimeout(()=>{$('coResults').hidden=true;$('coResults').innerHTML='';},0));
}
