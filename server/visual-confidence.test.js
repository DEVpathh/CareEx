import test from 'node:test'
import assert from 'node:assert/strict'
import { createApp } from './app.js'
import { confidenceElements } from './documents/confidence.js'
import { bodyMapContext } from './body-map.js'
const image='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII='
const evidence={text:'PCM 500 mg BD OD\n19 Aug 2024',lines:[{text:'PCM 500 mg BD OD',confidence:1,words:[{text:'PCM',confidence:.98},{text:'500',confidence:.93},{text:'mg',confidence:null},{text:'BD',confidence:.62},{text:'OD',confidence:.99}]},{text:'19 Aug 2024',confidence:.91}],provider:'test'}
async function server(options,run){const app=createApp(options),listener=app.listen(0,'127.0.0.1');await new Promise(r=>listener.once('listening',r));const req=async(path,body,method=body?'POST':'GET')=>{const response=await fetch(`http://127.0.0.1:${listener.address().port}/api/v1${path}`,{method,headers:{'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});return{status:response.status,...await response.json()}};try{await run(req,app)}finally{await new Promise(r=>listener.close(r))}}
async function patient(req,contact=true){const p=(await req('/patients',{displayName:'Visual Test',age:8,sex:'other',...(contact?{mobile:'+15555550123',smsConsent:true}:{})})).data;await req('/consents',{patientId:p.id,language:'English',purposes:{casePreparation:true,priorRecords:true,careTeamSharing:true}});return p}
test('OCR confidence uses actual word/line scores and flags missing confidence and ambiguity',()=>{
 const entries=confidenceElements(evidence.text,evidence)
 const word=value=>entries.find(e=>e.value===value)
 assert.equal(word('PCM').confidence,98);assert.equal(word('PCM').requiresAssurance,false)
 assert.equal(word('BD').confidence,62);assert.equal(word('BD').requiresAssurance,true)
 assert.equal(word('mg').confidence,null);assert.equal(word('mg').requiresAssurance,true)
 assert.equal(word('OD').confidence,99);assert.equal(word('OD').reason,'ambiguous-abbreviation')
 assert.equal(word('Aug').confidenceBasis,'line');assert.equal(word('2024-08-19').confidence,91)
 assert.equal(confidenceElements('missing words',{}).every(e=>e.confidence===null),true)
 assert.equal(confidenceElements('BD',evidence,[],60)[0].requiresAssurance,false)
})
test('doctor assurance is per entry, keeps the original score and rejects stale confirmation',()=>server({ocr:{status:{available:true},recognize:async()=>evidence}},async req=>{
 const p=await patient(req),initial=await req('/documents/scan',{patientId:p.id,image,originalImage:image,fileType:'prescription'})
 let doc=initial.data;for(let i=0;i<40&&doc.ocrStatus==='processing';i++){await new Promise(r=>setTimeout(r,5));doc=(await req(`/documents/${doc.id}/ocr`)).data}
 doc=(await req(`/documents/${doc.id}`,{documentDate:'2024-08-19',extractedText:doc.extractedText,reviewed:true,elements:[{confidence:100}]},'PATCH')).data
 const low=doc.elements.find(e=>e.value==='BD');assert.equal(low.confidence,62)
 const visit=(await req('/cases/submit',{patientId:p.id,chiefComplaint:'headache',documentIds:[doc.id]})).data
 const path=`/cases/${visit.id}/documents/${doc.id}/elements/${low.id}`
 const confirmed=await req(path,{version:doc.version,value:'BD',confirmed:true,confidence:100},'PATCH')
 assert.equal(confirmed.status,200);assert.equal(confirmed.data.elements.find(e=>e.id===low.id).confidence,62)
 assert.equal(confirmed.data.elements.find(e=>e.id===low.id).assurance.confirmed,true)
 assert.equal((await req(path,{version:doc.version,value:'BD',confirmed:true},'PATCH')).status,409)
 const rows=(await req(`/cases/${visit.id}/timeline`)).data
 assert.equal(rows[0].elements.find(e=>e.id===low.id).assurance.confirmed,true)
 assert.equal((await req(`/cases/unknown/documents/${doc.id}/elements/${low.id}`,{version:doc.version,value:'BD',confirmed:true},'PATCH')).status,404)
}))
test('body map validates locations, generates concerns, and records multiple patient-side regions',()=>server({},async req=>{
 const locations=(await req('/body-map')).data;assert.ok(locations.some(l=>l.id==='left_knee'&&l.hi))
 assert.throws(()=>bodyMapContext(['not-a-part']))
 const context=bodyMapContext(['head','abdomen','head']);assert.equal(context.ids.length,2)
 const result=await req('/intake/questions',{complaint:'',bodyLocations:['head','left_knee'],language:'English'})
 assert.equal(result.status,200);assert.deepEqual(result.data.bodyLocations,['head','left_knee']);assert.match(result.data.complaint,/head pain/)
 assert.match(result.data.complaint,/left knee/);assert.notEqual(result.data.nextQuestion?.id,'clarify')
 const p=await patient(req),visit=(await req('/cases/submit',{patientId:p.id,chiefComplaint:result.data.complaint,bodyLocations:['head','left_knee']})).data
 assert.deepEqual(visit.bodyLocations,['head','left_knee']);assert.match(visit.chiefComplaint,/left knee/)
 assert.equal((await req('/intake/questions',{complaint:'pain',bodyLocations:['invalid']})).status,400)
 const urgent=await req('/intake/questions',{complaint:'cannot breathe',bodyLocations:['chest'],language:'English'})
 assert.equal(urgent.data.stopQuestionnaire,true);assert.deepEqual(urgent.data.questions,[])
}))
test('date-only follow-up records No, cancels reminders, and does not ask doctor for contact',()=>server({now:()=>new Date('2026-09-09T06:00:00Z'),sms:{configured:false}},async req=>{
 const p=await patient(req,false);let visit=(await req('/cases/submit',{patientId:p.id,chiefComplaint:'headache'})).data
 visit=(await req(`/cases/${visit.id}`,{status:'approved',version:visit.version},'PATCH')).data
 const yes=await req(`/cases/${visit.id}/followup`,{needed:true,date:'2026-09-10',version:visit.version})
 assert.equal(yes.status,201);assert.equal(yes.data.status,'awaiting_contact');assert.equal('time' in yes.data,false);assert.equal(yes.data.sendAt,'2026-09-10T03:30:00.000Z')
 visit=(await req('/cases')).data.find(v=>v.id===visit.id)
 assert.deepEqual(visit.followupDecision.needed,true)
 const no=await req(`/cases/${visit.id}/followup`,{needed:false,version:visit.version})
 assert.equal(no.status,200);assert.equal(no.data.needed,false);assert.equal(no.data.date,null)
 assert.equal((await req(`/cases/${visit.id}/followup`)).data[0].status,'cancelled')
 visit=(await req('/cases')).data.find(v=>v.id===visit.id);assert.equal(visit.followupDecision.needed,false)
}))
