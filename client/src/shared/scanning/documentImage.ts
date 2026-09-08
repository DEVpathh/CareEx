export type Point = { x: number; y: number }
export const defaultCorners = (): Point[] => [{x:.08,y:.06},{x:.92,y:.06},{x:.92,y:.94},{x:.08,y:.94}]
export function detectPaper(canvas: HTMLCanvasElement): Point[] {
  const small = document.createElement('canvas'); small.width = 180; small.height = Math.round(canvas.height / canvas.width * 180)
  const ctx = small.getContext('2d')!; ctx.drawImage(canvas,0,0,small.width,small.height)
  const {data,width,height} = ctx.getImageData(0,0,small.width,small.height)
  const visited = new Uint8Array(width * height); let best: number[] = []
  const paper = (i: number) => { const values = [data[i*4]!,data[i*4+1]!,data[i*4+2]!]; return Math.min(...values) > 155 && Math.max(...values)-Math.min(...values) < 65 }
  for(let i=0;i<visited.length;i++) {
    if(visited[i] || !paper(i)) continue
    const queue = [i]; visited[i]=1
    for(let j=0;j<queue.length;j++) { const k=queue[j]!; for(const n of [k-width,k+width,...(k%width>0?[k-1]:[]),...(k%width<width-1?[k+1]:[])]) if(n>=0 && n<visited.length && !visited[n] && paper(n)) {visited[n]=1;queue.push(n)} }
    if(queue.length>best.length)best=queue
  }
  if(best.length<width*height*.15 || best.length>width*height*.96) return defaultCorners()
  const points=best.map(i=>({x:(i%width)/width,y:Math.floor(i/width)/height}))
  const extremes=[(p:Point)=>p.x+p.y,(p:Point)=>-p.x+p.y,(p:Point)=>-p.x-p.y,(p:Point)=>p.x-p.y]
  return extremes.map(score=>points.reduce((a,b)=>score(a)<score(b)?a:b))
}
function solve(matrix: number[][]): number[] {
  for(let col=0;col<8;col++) {
    let pivot=col
    for(let row=col+1;row<8;row++) if(Math.abs(matrix[row]![col]!)>Math.abs(matrix[pivot]![col]!)) pivot=row
    const swap=matrix[col]!;matrix[col]=matrix[pivot]!;matrix[pivot]=swap
    const current=matrix[col]!,n=current[col]!
    if(Math.abs(n)<1e-10)throw new Error('Move the four corners to the page edges.')
    for(let j=col;j<9;j++)current[j]=current[j]!/n
    for(let row=0;row<8;row++)if(row!==col){const other=matrix[row]!,k=other[col]!;for(let j=col;j<9;j++)other[j]=other[j]!-k*current[j]!}
  }
  return matrix.map(row=>row[8]!)
}
export function rectify(canvas: HTMLCanvasElement, corners: Point[]): HTMLCanvasElement {
  if(corners.length!==4)throw new Error('Four page corners are required.')
  const cross=corners.map((a,i)=>{const b=corners[(i+1)%4]!,c=corners[(i+2)%4]!;return(b.x-a.x)*(c.y-b.y)-(b.y-a.y)*(c.x-b.x)})
  if(cross.some(n=>n<.002))throw new Error('Keep the corners in order: top left, top right, bottom right, bottom left.')
  const p=corners.map(c=>({x:c.x*(canvas.width-1),y:c.y*(canvas.height-1)}))
  const distance=(a:Point,b:Point)=>Math.hypot(a.x-b.x,a.y-b.y)
  let w=Math.max(distance(p[0]!,p[1]!),distance(p[3]!,p[2]!)),h=Math.max(distance(p[0]!,p[3]!),distance(p[1]!,p[2]!))
  const scale=Math.min(1,1800/Math.max(w,h));w=Math.round(w*scale);h=Math.round(h*scale)
  if(w<100||h<100)throw new Error('Move closer and include the entire page.')
  const targets=[{x:0,y:0},{x:w-1,y:0},{x:w-1,y:h-1},{x:0,y:h-1}]
  const matrix=targets.flatMap(({x:u,y:v},i)=>{const{x,y}=p[i]!;return[[u,v,1,0,0,0,-u*x,-v*x,x],[0,0,0,u,v,1,-u*y,-v*y,y]]})
  const a=solve(matrix),src=canvas.getContext('2d')!.getImageData(0,0,canvas.width,canvas.height)
  const out=document.createElement('canvas');out.width=w;out.height=h
  const ctx=out.getContext('2d')!,dest=ctx.createImageData(w,h)
  for(let v=0;v<h;v++)for(let u=0;u<w;u++) {
    const denom=a[6]!*u+a[7]!*v+1, x=Math.max(0,Math.min(canvas.width-1,(a[0]!*u+a[1]!*v+a[2]!)/denom)),y=Math.max(0,Math.min(canvas.height-1,(a[3]!*u+a[4]!*v+a[5]!)/denom))
    const x0=Math.floor(x),y0=Math.floor(y),x1=Math.min(x0+1,canvas.width-1),y1=Math.min(y0+1,canvas.height-1),dx=x-x0,dy=y-y0,index=(v*w+u)*4
    for(let c=0;c<3;c++){const value=src.data[(y0*canvas.width+x0)*4+c]!*(1-dx)*(1-dy)+src.data[(y0*canvas.width+x1)*4+c]!*dx*(1-dy)+src.data[(y1*canvas.width+x0)*4+c]!*(1-dx)*dy+src.data[(y1*canvas.width+x1)*4+c]!*dx*dy;dest.data[index+c]=Math.max(0,Math.min(255,(value-128)*1.08+128))}dest.data[index+3]=255
  }
  ctx.putImageData(dest,0,0);return out
}
export function rotatePage(canvas: HTMLCanvasElement) {
  const out=document.createElement('canvas');out.width=canvas.height;out.height=canvas.width
  const ctx=out.getContext('2d')!;ctx.translate(out.width,0);ctx.rotate(Math.PI/2);ctx.drawImage(canvas,0,0);return out
}
