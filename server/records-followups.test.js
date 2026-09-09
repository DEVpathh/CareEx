import assert from 'node:assert/strict'
import test from 'node:test'
import { mkdtempSync, rmSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createApp } from './app.js'
import { extractDates, extractReferences } from './documents/extraction.js'
import { createOcr } from './documents/ocr.js'
import { createSms } from './followups/service.js'
import { stopForTriage } from './triage-stop.js'
const image='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII='
async function serve(options, run) {
  const app=createApp(options), server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r))
  const request=async(path,body,method=body?'POST':'GET')=>{const response=await fetch(`http://127.0.0.1:${server.address().port}/api/v1${path}`,{method,headers:{'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});return {status:response.status,...await response.json()}}
  try{await run(request,app)}finally{await new Promise(r=>server.close(r))}
}
async function patient(req, consent=true) {
  const {data:p}=await req('/patients',{displayName:'Camera Test',age:35,sex:'other',mobile:'+15555550123',smsConsent:true})
  await req('/consents',{patientId:p.id,language:'English',purposes:{casePreparation:true,careTeamSharing:true,priorRecords:consent}});return p
}
async function visit(req,p,extra={}) { return (await req('/cases/submit',{patientId:p.id,chiefComplaint:'mild headache',language:'English',...extra})).data }
async function approve(req,c) {return (await req(`/cases/${c.id}`,{version:c.version,status:'approved'},'PATCH')).data}
async function scan(req,p,textDate) {
  const result=await req('/documents/scan',{patientId:p.id,image,originalImage:image,fileType:'prescription',rawText:'Invented Diagnosis'})
  assert.equal(result.status,202)
  let doc=result.data
  for(let i=0;i<30 && doc.ocrStatus==='processing';i++){await new Promise(r=>setTimeout(r,5));doc=(await req(`/documents/${doc.id}/ocr`)).data}
  assert.notEqual(doc.ocrStatus,'processing')
  return (await req(`/documents/${doc.id}`,{extractedText:doc.extractedText,documentDate:textDate,reviewed:true},'PATCH')).data
}
const ocr={status:{available:true,provider:'test'},recognize:async()=>({text:'Date: 05/06/2025\nPCM 500 mg BD\nOD',lines:[],provider:'test'})}
test('OCR dates preserve ambiguity, reject impossible dates and exclude birth dates',()=>{
  assert.deepEqual(extractDates('DOB: 01/02/1990\nReport: 05/06/2025\n31/02/2025\n19 Aug 2024').map(d=>d.date),['2025-06-05','2025-05-06','2024-08-19'])
  const refs=extractReferences('PCM 500 mg BD OD. BP 120 mmHg')
  assert.ok(refs.abbreviations.find(a=>a.abbreviation==='PCM').candidates.includes('Paracetamol'))
  assert.equal(refs.abbreviations.find(a=>a.abbreviation==='OD').candidates.length,2)
  assert.ok(refs.units.includes('mg'));assert.ok(refs.abbreviations.every(a=>a.requiresConfirmation))
})
test('camera OCR reads the image, protects consent and sorts by confirmed date across restart',async()=>{
  const dir=mkdtempSync(join(tmpdir(),'carex-records-test-')),storagePath=join(dir,'store.json');let caseId
  try{
    await serve({ocr,storagePath},async req=>{
      const p=await patient(req),denied=await patient(req,false)
      assert.equal((await req('/documents/scan',{patientId:denied.id,image,originalImage:image,fileType:'prescription'})).status,403)
      assert.equal((await req('/documents/scan',{patientId:p.id,fileName:'fake.pdf',rawText:'fake',fileType:'prescription'})).status,400)
      const newer=await scan(req,p,'2025-08-20'),older=await scan(req,p,'2024-07-10'),unknown=await scan(req,p,null)
      assert.equal(newer.extractedText,'Date: 05/06/2025\nPCM 500 mg BD\nOD');assert.equal(newer.extractedDiagnoses,undefined);assert.equal(newer.image,undefined)
      assert.equal((await req('/cases/submit',{patientId:denied.id,chiefComplaint:'headache',documentIds:[newer.id]})).status,400)
      const c=await visit(req,p,{documentIds:[newer.id,unknown.id,older.id]});caseId=c.id
      assert.deepEqual((await req(`/cases/${c.id}/timeline`)).data.map(d=>d.documentDate),['2024-07-10','2025-08-20',null])
      await req(`/documents/${older.id}`,{documentDate:'2026-01-01',extractedText:'Corrected handwriting',reviewed:true},'PATCH')
      assert.equal((await req(`/documents/${newer.id}`,null,'DELETE')).status,409)
    })
    await serve({ocr,storagePath},async req=>{const rows=(await req(`/cases/${caseId}/timeline`)).data;assert.deepEqual(rows.map(d=>d.documentDate),['2025-08-20','2026-01-01',null]);assert.equal(rows[1].extractedText,'Corrected handwriting')})
  }finally{rmSync(dir,{recursive:true,force:true})}
})
test('failed OCR keeps the original and does not synthesize medicines or dates',()=>serve({ocr:{...ocr,recognize:async()=>{throw new Error('bad handwriting')}}},async req=>{const p=await patient(req),doc=await scan(req,p,null);assert.equal(doc.ocrStatus,'needs_review');assert.equal(doc.extractedText,'');assert.deepEqual(doc.dateCandidates,[]);assert.deepEqual(doc.abbreviations,[])}))
test('cloud handwriting OCR sends image bytes to DOCUMENT_TEXT_DETECTION and returns actual text',async()=>{
  let sent
  const engine=createOcr({env:{GOOGLE_CLOUD_VISION_API_KEY:'test-key'},fetchImpl:async(url,init)=>{sent={url,init};return {ok:true,json:async()=>({responses:[{fullTextAnnotation:{text:'Written prescription',pages:[]}}]})}}})
  const result=await engine.recognize(image)
  assert.equal(result.text,'Written prescription');assert.equal(sent.init.headers['X-Goog-Api-Key'],'test-key');assert.equal(JSON.parse(sent.init.body).requests[0].features[0].type,'DOCUMENT_TEXT_DETECTION');assert.equal(engine.status.handwriting,true)
})
test('triage suppresses every question and remains stopped across pathway changes and restart',async()=>{
  assert.equal(stopForTriage({questions:[{id:'next'}],triageLevel:'yellow'},'English').nextQuestion,null)
  const dir=mkdtempSync(join(tmpdir(),'carex-triage-test-')),storagePath=join(dir,'store.json')
  try{await serve({storagePath},async req=>{const r=await req('/intake/questions',{complaint:'I cannot breathe',sessionId:'triage-test',language:'English'});assert.equal(r.data.stopQuestionnaire,true);assert.deepEqual(r.data.questions,[]);assert.equal(r.data.complete,false)})
  await serve({storagePath},async req=>{const r=await req('/intake/questions',{complaint:'mild headache',sessionId:'triage-test',pathway:'ayush',language:'हिन्दी'});assert.equal(r.data.stopQuestionnaire,true);assert.deepEqual(r.data.questions,[]);assert.equal(r.data.nextQuestion,null)})}finally{rmSync(dir,{recursive:true,force:true})}
})
test('follow-up only after acceptance; sends once on India date to registered mobile; delivered survives restart',async()=>{
  const dir=mkdtempSync(join(tmpdir(),'carex-followup-test-')),storagePath=join(dir,'store.json');let clock=new Date('2026-09-09T10:00:00Z'),calls=0,caseId
  const sms={configured:true,send:async(to,body)=>{calls++;assert.equal(to,'+15555550123');assert.doesNotMatch(body,/10:00|IST/);assert.doesNotMatch(body,/headache|Camera Test/);return{id:'test-message',status:'queued'}},status:async()=> 'delivered'}
  try{await serve({storagePath,sms,now:()=>clock},async(req,app)=>{
    const p=await patient(req);let c=await visit(req,p);caseId=c.id
    assert.equal((await req(`/cases/${c.id}/followup`,{date:'2026-09-10',time:'10:00',version:c.version})).status,409)
    c=await approve(req,c)
    const {status,data:j}=await req(`/cases/${c.id}/followup`,{date:'2026-09-10',time:'10:00',version:c.version,mobile:'+19999999999'})
    assert.equal(status,201);assert.equal(j.sendAt,'2026-09-10T03:30:00.000Z')
    await app.locals.runFollowups();assert.equal(calls,0)
    clock=new Date('2026-09-10T03:31:00Z');await Promise.all([app.locals.runFollowups(),app.locals.runFollowups()]);assert.equal(calls,1)
  })
  await serve({storagePath,sms,now:()=>clock},async(req,app)=>{await app.locals.runFollowups();assert.equal(calls,1);assert.equal((await req(`/cases/${caseId}/followup`)).data[0].status,'delivered')})}finally{rmSync(dir,{recursive:true,force:true})}
})
test('rescheduling cancels old reminder, provider setup is honest, missed days do not send stale reminders',()=>{
 let clock=new Date('2026-09-09T10:00:00Z')
 return serve({sms:{configured:false},now:()=>clock},async(req,app)=>{const p=await patient(req);let c=await approve(req,await visit(req,p))
 const first=(await req(`/cases/${c.id}/followup`,{date:'2026-09-10',time:'10:00',version:c.version})).data;assert.equal(first.status,'blocked')
 c=(await req('/cases')).data.find(v=>v.id===c.id)
 await req(`/cases/${c.id}/followup`,{date:'2026-09-11',time:'11:00',version:c.version})
 assert.equal((await req(`/cases/${c.id}/followup`)).data.find(j=>j.id===first.id).status,'cancelled')
 clock=new Date('2026-09-12T00:00:00Z');await app.locals.runFollowups();assert.ok((await req(`/cases/${c.id}/followup`)).data.some(j=>j.status==='missed'))
 })
})
test('uncertain SMS acceptance is never blindly retried',()=>{
 let clock=new Date('2026-09-09T10:00:00Z'),calls=0
 return serve({sms:{configured:true,send:async()=>{calls++;throw new Error('lost response')}},now:()=>clock},async(req,app)=>{const p=await patient(req),c=await approve(req,await visit(req,p));await req(`/cases/${c.id}/followup`,{date:'2026-09-10',time:'10:00',version:c.version});clock=new Date('2026-09-10T03:31:00Z');await app.locals.runFollowups();await app.locals.runFollowups();assert.equal(calls,1);assert.equal((await req(`/cases/${c.id}/followup`)).data[0].status,'delivery_unknown')})
})
test('SMS adapter distinguishes provider acceptance from delivery and supports delivery polling',async()=>{
 const sid=`SM${'a'.repeat(32)}`,calls=[]
 const sms=createSms({env:{TWILIO_ACCOUNT_SID:'test',TWILIO_AUTH_TOKEN:'test',TWILIO_FROM:'+15555550111'},fetchImpl:async(url,init)=>{calls.push({url,init});return{ok:true,json:async()=>({sid,status:calls.length===1?'queued':'delivered'})}}})
 assert.equal((await sms.send('+15555550123','Reminder')).status,'queued');assert.equal(await sms.status(sid),'delivered');assert.equal(calls[0].init.body.get('To'),'+15555550123');assert.match(calls[1].url,new RegExp(sid))
})

test('high severity produces yellow review and cannot resume by changing an answer',()=>serve({},async req=>{
  const r=await req('/intake/questions',{complaint:'headache',answers:{severity:'8','headache.warning':'no'},sessionId:'priority-visit',language:'English'})
  assert.equal(r.data.triageLevel,'yellow');assert.equal(r.data.stopQuestionnaire,true);assert.deepEqual(r.data.questions,[])
  const next=await req('/intake/questions',{complaint:'headache',answers:{severity:'2','headache.warning':'no'},sessionId:'priority-visit',pathway:'ayush',language:'English'})
  assert.equal(next.data.triageLevel,'yellow');assert.equal(next.data.nextQuestion,null)
}))
