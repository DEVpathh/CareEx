export class GestureGate {
  private gesture = ''
  private since = 0
  private last = 0
  private fired = false
  reset() { this.gesture=''; this.since=0; this.last=0; this.fired=false }
  observe(gesture:string, confidence:number, timestamp:number) {
    if(confidence<.8 || !Number.isFinite(confidence) || gesture==='None') { this.reset(); return null }
    if(gesture!==this.gesture || timestamp-this.last>450){this.gesture=gesture;this.since=timestamp;this.fired=false}
    this.last=timestamp
    if(!this.fired && timestamp-this.since>=900){this.fired=true;return gesture}
    return null
  }
}
