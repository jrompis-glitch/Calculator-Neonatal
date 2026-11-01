'use strict';
const $=id=>document.getElementById(id);
const logistic=x=>x>=0?1/(1+Math.exp(-x)):Math.exp(x)/(1+Math.exp(x));
const logit=p=>Math.log(p/(1-p));
const format=n=>n.toLocaleString('id-ID',{minimumFractionDigits:2,maximumFractionDigits:2});
function calc(){
 $('err').textContent='';$('results').hidden=true;
 const model=$('model').value,inc=+$('inc').value,w=+$('week').value,d=+$('day').value,temp=+$('temp').value,rom=+$('rom').value;
 const min=model==='2024'?35:34;
 if([inc,w,d,temp,rom].some(x=>!Number.isFinite(x))||inc<=0||inc>5||!Number.isInteger(w)||w<min||w>42||!Number.isInteger(d)||d<0||d>6||temp<34||temp>43||rom<0||rom>240){$('err').textContent=`Periksa input. Usia gestasi model ${model}: ${min}–42 minggu; hari 0–6, suhu 34–43°C, ROM 0–240 jam, insidens >0 hingga 5/1.000.`;return;}
 const ga=w+d/7,T=temp*9/5+32,ROM=Math.pow(rom+0.05,0.2),abx=$('abx').value,gbs=$('gbs').value;
 const a1=+(abx==='gbs'||abx==='broad2'),a2=+(abx==='broad4'),gp=+(gbs==='positive'),gu=+(gbs==='unknown');
 let x,lr;
 if(model==='2024'){
 const base=57.29929499,baseline=0.0002763,target=inc/1000;
 const intercept=base+logit(target)-logit(baseline);
 x=intercept+0.85194656*T-7.72247124*ga+0.09842383*ga*ga+0.86770862*ROM-2.13142945*a1-2.33985917*a2+1.02265353*gp+1.13710111*gu;
 lr={well:0.36,equivocal:3.65,ill:14.5};
 }else{
 // Kaiser original 2017 EMR implementation: population-incidence intercept adjustment.
 const intercept=47.8398+Math.log(inc/0.5);
 x=intercept+0.8680*T-6.9325*ga+0.0877*ga*ga+1.2256*ROM-1.0488*a1-1.1861*a2+0.5771*gp+0.0427*gu;
 lr={well:0.41,equivocal:5,ill:21.2};
 }
 const p=logistic(x),out={};for(const [k,v] of Object.entries(lr))out[k]=1000*logistic(logit(p)+Math.log(v));
 const chosen=$('clinical').value;
 $('birth').textContent=format(p*1000)+' / 1.000';$('post').textContent=format(out[chosen])+' / 1.000';
 const names={well:'Well Appearing',equivocal:'Equivocal',ill:'Clinical Illness'};
 $('rows').innerHTML=Object.keys(names).map(k=>`<div class="row"><strong>${names[k]}</strong> — ${format(out[k])} / 1.000</div>`).join('');
 const val=out[chosen];let rec=val>=3?'Ambang risiko ≥3/1.000: evaluasi sepsis dan pertimbangkan antibiotik empiris sesuai protokol.':val>=1?'Ambang risiko 1–<3/1.000: pertimbangkan kultur darah dan observasi ketat sesuai protokol.':'Ambang risiko <1/1.000: observasi klinis dan pemantauan tanda vital sesuai protokol.';
 if(chosen==='ill')rec='Clinical Illness: evaluasi segera oleh dokter, kultur darah dan antibiotik empiris sesuai kondisi klinis/protokol; jangan mengandalkan ambang angka semata. '+rec;
 $('advice').textContent=rec+' Nilai ini adalah panduan umum, bukan reproduksi penuh algoritme rekomendasi Kaiser.';
 $('results').hidden=false;
}
$('calc').addEventListener('click',calc);
$('model').addEventListener('change',()=>{$('results').hidden=true;$('err').textContent='';});
