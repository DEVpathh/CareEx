import { useEffect, useRef, useState } from 'react'
import { Camera, Hand, Pause, ThumbsDown, ThumbsUp, X } from 'lucide-react'
import { GestureGate } from '../shared/gestures/gestureGate'
import './gestures.css'
type Props={language:string;active:boolean;disabled:boolean;questionKey:string;bodyMode:boolean;onBodySelect:(id:string)=>void;choices?:{value:string;label:string}[];onAnswer:(value:string)=>void;onStart:()=>void}
type Point={x:number;y:number}
export function GestureControls(props:Props) {
  const latest=useRef(props);latest.current=props
  const hi=props.language!=='English',t=(h:string,e:string)=>hi?h:e
  const video=useRef<HTMLVideoElement>(null),media=useRef<MediaStream|null>(null),worker=useRef<Worker|null>(null),timer=useRef<ReturnType<typeof setInterval>|null>(null),generation=useRef(0),gate=useRef(new GestureGate()),hover=useRef<HTMLElement|SVGElement|null>(null),inFlight=useRef(false)
  const [state,setState]=useState<'off'|'loading'|'ready'|'paused'>('off'),[error,setError]=useState(''),[pointer,setPointer]=useState<Point|null>(null),[candidate,setCandidate]=useState<string|null>(null),[detected,setDetected]=useState(''),[score,setScore]=useState(0)
  const lastPoint=useRef(0)
  const paused=useRef(false)
  const clearHover=()=>{hover.current?.classList.remove('gesture-hover');hover.current=null;setPointer(null)}
  const stop=()=>{generation.current++;if(timer.current)clearInterval(timer.current);timer.current=null;worker.current?.terminate();worker.current=null;media.current?.getTracks().forEach(track=>track.stop());media.current=null;gate.current.reset();inFlight.current=false;paused.current=false;clearHover();setCandidate(null);setState('off')}
  useEffect(()=>()=>stop(),[])
  useEffect(()=>{if(!props.active)stop()},[props.active])
  useEffect(()=>{gate.current.reset();setCandidate(null);clearHover()},[props.questionKey,props.disabled])
  useEffect(()=>{const change=()=>{if(document.hidden)stop()};document.addEventListener('visibilitychange',change);return()=>document.removeEventListener('visibilitychange',change)},[])
  useEffect(()=>{if(state!=='off'&&video.current&&media.current){video.current.srcObject=media.current;void video.current.play().catch(()=>setError(t('कैमरा फिर खोलें।','Please reopen the camera.')))}},[state])
  const start=async()=>{
    stop();const token=generation.current;setError('');setState('loading');props.onStart()
    try {
      const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:640},height:{ideal:480}},audio:false})
      if(token!==generation.current){stream.getTracks().forEach(track=>track.stop());return}
      media.current=stream;if(video.current){video.current.srcObject=stream;await video.current.play()}
      const model=new Worker(new URL('../shared/gestures/gesture.worker.ts',import.meta.url),{type:'module'});worker.current=model
      const fail=()=>{if(token!==generation.current)return;stop();setError(t('हाथ के कंट्रोल नहीं खुले। फिर कोशिश करें या स्क्रीन छुएँ।','Hand controls could not start. Retry or use touch.'))}
      model.onerror=fail
      const timeout=setTimeout(()=>{if(token===generation.current&&inFlight.current===false&&state==='off')fail()},30000)
      model.onmessage=({data})=>{
        if(token!==generation.current)return
        if(data.type==='error'){clearTimeout(timeout);fail();return}
        if(data.type==='ready'){
          clearTimeout(timeout);setState('ready')
          timer.current=setInterval(async()=>{
            if(inFlight.current||!video.current?.videoWidth||video.current.readyState<2)return
            inFlight.current=true
            try{const frame=await createImageBitmap(video.current,{resizeWidth:320,resizeHeight:240});if(token!==generation.current){frame.close();return}model.postMessage({type:'frame',frame,timestamp:performance.now()},[frame])}catch{inFlight.current=false}
          },110)
          return
        }
        if(data.type!=='result')return
        inFlight.current=false;setDetected(data.gesture);setScore(Math.round(data.confidence*100))
        const current=latest.current
        if(current.disabled||paused.current)return
        if(current.bodyMode&&data.gesture==='Pointing_Up'&&data.confidence>=.8){
          const tip=data.landmarks[8] as Point|undefined
          if(tip){lastPoint.current=data.timestamp;const x=Math.max(0,Math.min(1,(.9-tip.x)/.8))*window.innerWidth,y=Math.max(0,Math.min(1,(tip.y-.1)/.8))*window.innerHeight;setPointer({x,y});const target=document.elementFromPoint(x,y)?.closest('[data-body-location]') as HTMLElement|SVGElement|null;if(target!==hover.current){hover.current?.classList.remove('gesture-hover');hover.current=target;target?.classList.add('gesture-hover')}}
        }
        const action=gate.current.observe(data.gesture,data.confidence,data.timestamp)
        if(action==='Open_Palm'){paused.current=true;setState('paused');clearHover();setCandidate(null)}
        if(action==='Thumb_Up'&&current.bodyMode&&hover.current&&data.timestamp-lastPoint.current<3000){const id=hover.current.getAttribute('data-body-location');if(id)current.onBodySelect(id);clearHover()}
        if(!current.bodyMode&&(action==='Thumb_Up'||action==='Thumb_Down')){const value=action==='Thumb_Up'?'yes':'no';if(current.choices?.some(choice=>choice.value===value))setCandidate(value)}
        if(data.gesture==='None'&&(!data.landmarks.length||data.timestamp-lastPoint.current>3000)){clearHover()}
      }
      model.postMessage({type:'init',origin:window.location.origin})
    } catch { if(token===generation.current){stop();setError(t('कैमरे की अनुमति दें या स्क्रीन छूकर जवाब दें।','Allow camera access or answer by touch.'))} }
  }
  return <section className="gesture-controls"><div className="gesture-launch"><Hand/><span>{t('इशारों से जवाब दें','Answer with hand gestures')}</span>{state==='off'?<button className="secondary-button" disabled={!props.active||props.disabled} onClick={()=>void start()}><Camera/>{t('हाथ का कैमरा खोलें','Start hand controls')}</button>:<button className="secondary-button" onClick={stop}><X/>{t('कैमरा बंद करें','Stop hand controls')}</button>}</div>{error&&<p role="alert">{error}</p>}{state!=='off'&&<div className="gesture-live"><video ref={video} autoPlay muted playsInline aria-label={t('हाथ के कैमरे का दृश्य','Hand camera preview')}/><div><p role="status">{state==='loading'?t('हाथ पहचानने की तैयारी…','Loading hand recognition…'):state==='paused'?t('इशारों के कंट्रोल रुके हैं','Hand controls paused'):t('कैमरा तैयार — एक हाथ दिखाएँ','Camera ready — show one hand')}</p><div className="gesture-symbols">{props.bodyMode?<p><span aria-hidden="true">☝️ → 👍</span>{t('उँगली से जगह दिखाएँ, अंगूठा 1 सेकंड ऊपर रखें।','Point to highlight a place, then hold thumbs-up for 1 second.')}</p>:<p><ThumbsUp/> {t('हाँ','Yes')} <ThumbsDown/> {t('नहीं','No')}</p>}<p><Hand/>{t('खुली हथेली: रुकें','Open palm: pause')}</p></div>{state==='paused'&&<button className="primary-button" onClick={()=>{paused.current=false;gate.current.reset();setState('ready')}}><Pause/>{t('फिर शुरू करें','Resume hand controls')}</button>}{state==='ready'&&<small>{detected==='None'?t('एक हाथ कैमरे के सामने रखें','Show one hand to the camera'):`${score}%${score<80?t(' — हाथ स्थिर रखें या स्क्रीन छुएँ',' — hold your hand steady or use touch'):''}`}</small>}{candidate&&<div className="gesture-confirm"><strong>{candidate==='yes'?<ThumbsUp/>:<ThumbsDown/>}{props.choices?.find(c=>c.value===candidate)?.label}</strong><button className="primary-button" disabled={props.disabled} onClick={()=>{props.onAnswer(candidate);setCandidate(null);gate.current.reset()}}>{t('यही जवाब है','Confirm this answer')}</button><button className="secondary-button" onClick={()=>setCandidate(null)}>{t('फिर कोशिश करें','Try again')}</button></div>}<p className="field-hint">{t('तस्वीरें इसी डिवाइस पर पढ़ी जाती हैं।','Camera frames are processed on this device.')}</p></div></div>}{pointer&&<span className="gesture-pointer" style={{left:pointer.x,top:pointer.y}} aria-hidden="true">☝</span>}</section>
}
