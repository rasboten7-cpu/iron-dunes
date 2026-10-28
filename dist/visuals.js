import {commandIcon,loadCommandArt} from './hud-art.js?v=16';
import {loadBuildings,buildingModel,buildingIcon,drawLiveBuilding} from './buildings-3d.js?v=15';
import * as T from './three.module.js';
import {MAP,MAPS,setMap,mapObstacles,BIOMES} from './world-config.js?v=17-maps';
import {bakeFaction,WALK_FRAMES,bakeScenery} from './models.js?v=19-units';
export {T,MAP,MAPS,setMap,mapObstacles,BIOMES};
const BIO=()=>BIOMES[MAP.biome]||BIOMES.desert;

// ---------------------------------------------------------------------------
// Terrain
// ---------------------------------------------------------------------------
export function noise(x,z){return Math.sin(x*.043+z*.024)*Math.cos(z*.061)*.65+Math.sin(x*.17-z*.09)*.18}
export function height(x,z){return noise(x,z)+Math.max(0,Math.max(Math.abs(x),Math.abs(z))-(MAP.limit-6))*.24}

// ---------------------------------------------------------------------------
// Artwork loading. Sheets are 2x2 four-view atlases; environment images are single views.
// ---------------------------------------------------------------------------
const base='assets/web/',EXT='.webp'; // compressed copies of assets/realism (originals kept for editing)
const SHEETS=['hq','power','refinery','barracks','factory','turret','radar','silo','civilian','builder','infantry','rocket','jeep','tank','heavy','artillery','harvester'];
const ENV=['ground','palm','rocks','supplies'];
const UNIT_SHEETS=new Set(['builder','infantry','rocket','jeep','tank','heavy','artillery','harvester']);
export const assets={};
let loaded=0;const total=SHEETS.length+ENV.length;
function canvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c}
await Promise.all([...SHEETS,...ENV].map(key=>new Promise((resolve,reject)=>{
 const image=new Image();
 image.onload=()=>{
  const sheet=SHEETS.includes(key);
  const m=canvas(256,256),mctx=m.getContext('2d',{willReadFrequently:true});mctx.drawImage(image,0,0,256,256);
  const data=mctx.getImageData(0,0,256,256).data,mask=new Uint8Array(256*256);for(let i=0;i<mask.length;i++)mask[i]=data[i*4+3];
  const frames=[];
  if(sheet){const fs=UNIT_SHEETS.has(key)?(key==='infantry'||key==='rocket'?192:256):384;for(let f=0;f<4;f++){const c=canvas(fs,fs);c.getContext('2d').drawImage(image,(f%2)*image.width/2,Math.floor(f/2)*image.height/2,image.width/2,image.height/2,0,0,fs,fs);frames.push(c)}}
  else{const ratio=Math.min(1,(key==='ground'?512:512)/Math.max(image.width,image.height)),c=canvas(Math.round(image.width*ratio),Math.round(image.height*ratio));c.getContext('2d').drawImage(image,0,0,c.width,c.height);frames.push(c)}
  assets[key]={image,mask,frames,sheet,variants:{}};
  const b=document.getElementById('start');if(b)b.textContent='تحميل الرسومات '+(++loaded)+' / '+total;resolve()};
 image.onerror=()=>{const f=document.getElementById('fatal');if(f){f.hidden=false;f.textContent='تعذر تحميل بعض الرسومات. أعد تحميل الصفحة للتحقق من الاتصال.'}reject(new Error('Missing game asset: '+key))};
 image.src=key==='ground'?'assets/terrain-desert.png':base+key+EXT;
})));

export const MODELS={};export {WALK_FRAMES};
// --- environment art -------------------------------------------------------
const GROUNDS={};function groundTex(){const b=BIO();if(!b.ground)return assets.ground.frames[0];if(GROUNDS[MAP.biome])return GROUNDS[MAP.biome];const N=512,c=canvas(N,N),g=c.getContext('2d'),G=b.ground;g.fillStyle=`rgb(${G.base})`;g.fillRect(0,0,N,N);let sd=MAP.biome.length*977;const r=()=>{sd=(sd*1664525+1013904223)>>>0;return sd/4294967296};
 const blob=(x,y,rad,col,a)=>{for(const[dx,dy]of[[0,0],[N,0],[-N,0],[0,N],[0,-N]]){const gr=g.createRadialGradient(x+dx,y+dy,0,x+dx,y+dy,rad);gr.addColorStop(0,`rgba(${col},${a})`);gr.addColorStop(1,`rgba(${col},0)`);g.fillStyle=gr;g.fillRect(x+dx-rad,y+dy-rad,rad*2,rad*2)}};
 for(let i=0;i<70;i++)blob(r()*N,r()*N,30+r()*90,G.var[i%G.var.length],(MAP.biome==='snow'?.18:.35)+r()*.3);for(let i=0;i<260;i++)blob(r()*N,r()*N,4+r()*14,G.var[i%G.var.length],.4);
 if(MAP.biome==='green'||MAP.biome==='savanna'){g.lineWidth=1;for(let i=0;i<4200;i++){const x=r()*N,y=r()*N,l=2+r()*4;const v=G.var[i%G.var.length];g.strokeStyle=`rgba(${v.map(q=>q+(r()*30-15)|0)},.7)`;g.beginPath();g.moveTo(x,y);g.lineTo(x+(r()-.5)*2,y-l);g.stroke()}}
 if(MAP.biome==='snow'){for(let i=0;i<900;i++){g.fillStyle=r()<.5?'rgba(255,255,255,.9)':'rgba(170,190,215,.35)';g.fillRect(r()*N,r()*N,1.5,1.5)}for(let i=0;i<30;i++){g.strokeStyle='rgba(150,170,195,.25)';g.lineWidth=2+r()*3;g.beginPath();const x=r()*N,y=r()*N;g.moveTo(x,y);g.quadraticCurveTo(x+r()*80-40,y+r()*40,x+r()*120-60,y+r()*60);g.stroke()}}
 g.fillStyle=G.speck;for(let i=0;i<1600;i++)g.fillRect(r()*N,r()*N,1+r()*1.5,1+r()*1.5);GROUNDS[MAP.biome]=c;return c}
function treeAsset(kind,v){const key='tree_'+kind+v;if(assets[key])return key;try{const touch=matchMedia('(pointer:coarse)').matches;const list=bakeScenery(kind,touch);list.forEach((e,i)=>{const k='tree_'+kind+i,m=e.mask;assets[k]={image:{width:e.F,height:e.F},frames:[e.atlas],mask:null,sheet:false,variants:{},model:e};dimensions[k]=[e.S,kind==='oak'?1.8:1.4,.5]})}catch(err){console.warn('tree bake failed',err);return'palm'}return assets[key]?key:'palm'}
function rockAsset(){const t=BIO().rockTint;if(!t)return'rocks';const key='rocks_'+t;if(assets[key])return key;const src=assets.rocks.frames[0],c=canvas(src.width,src.height),g=c.getContext('2d');g.drawImage(src,0,0);g.globalCompositeOperation='source-atop';
 if(t==='snow'){const gr=g.createLinearGradient(0,0,0,c.height);gr.addColorStop(0,'rgba(245,249,255,.92)');gr.addColorStop(.55,'rgba(225,235,248,.55)');gr.addColorStop(1,'rgba(200,215,235,.15)');g.fillStyle=gr;g.fillRect(0,0,c.width,c.height)}else if(t==='moss'){g.fillStyle='rgba(70,90,50,.32)';g.fillRect(0,0,c.width,c.height)}else{g.fillStyle='rgba(150,60,30,.3)';g.fillRect(0,0,c.width,c.height)}
 assets[key]={...assets.rocks,frames:[c],variants:{}};dimensions[key]=dimensions.rocks;return key}
// 3D models are baked per faction and team when a battle starts (cached in the browser afterwards)
export async function ensureModels(list,progress){await loadCommandArt();await loadBuildings();const touch=matchMedia('(pointer:coarse)').matches;let step=0;for(const[f,t]of list){const k=f+':'+t;if(MODELS[k]){step++;continue}try{MODELS[k]=await bakeFaction(f,t,{touch,progress:(d,n)=>progress?.(step+d/n,list.length)})}catch(err){console.warn('3D models unavailable, using sprites',err);MODELS[k]={}}step++}}
function modelVariant(entry,kind){entry.var??={};const id=kind;if(entry.var[id])return entry.var[id];const src=entry.atlas,c=canvas(src.width,src.height),g=c.getContext('2d');g.drawImage(src,0,0);g.globalCompositeOperation='source-atop';g.fillStyle='rgba(18,14,10,.74)';g.fillRect(0,0,c.width,c.height);entry.var[id]=c;return c}
// Team colours are baked once per frame so the Canvas renderer needs no per-draw filters (works in every browser).
const TINT={0:'rgba(60,140,215,.15)',1:'rgba(190,52,36,.15)',2:'rgba(60,170,74,.15)',3:'rgba(224,181,42,.15)',4:'rgba(142,85,201,.15)',5:'rgba(224,122,34,.15)',6:'rgba(42,184,184,.15)',7:'rgba(208,90,154,.15)',wreck:'rgba(18,14,10,.74)',ghostok:'rgba(110,220,140,.55)',ghostbad:'rgba(235,80,60,.6)'};
function variant(key,frame,v){const entry=assets[key];if(v===undefined||v===9||v===null||!(v in TINT))return entry.frames[frame];const id=v+':'+frame;let c=entry.variants[id];if(c)return c;const src=entry.frames[frame];c=canvas(src.width,src.height);const g=c.getContext('2d');g.drawImage(src,0,0);g.globalCompositeOperation='source-atop';g.fillStyle=TINT[v];g.fillRect(0,0,c.width,c.height);if(v==='wreck'){g.globalCompositeOperation='source-atop';g.fillStyle='rgba(60,30,10,.25)';g.fillRect(0,c.height*.55,c.width,c.height*.45)}entry.variants[id]=c;return c}

// World sizes: [sprite width in world units, footprint radius, ground anchor]
export const FALLBACK={burton:'infantry',pilot:'infantry',lotus:'infantry',hijacker:'infantry',jarmen:'infantry',mob:'infantry',stealth:'jeep',aurora:'jeep',radarvan:'jeep',quad:'jeep',ambulance:'jeep',dropzone:'refinery',blackmarket:'refinery',hole:'rocks',trap:'supplies',raptor:'jeep',mig:'jeep',sniper:'infantry',hacker:'infantry',suicide:'infantry',heli:'jeep',flame:'tank',toxin:'jeep',bombtruck:'harvester',airfield:'factory',speaker:'turret',tunnel:'turret',bunker:'turret',crawler:'harvester',bus:'harvester',scudlauncher:'harvester',nukecannon:'artillery',heavy_gat:'heavy',heavy_spk:'heavy',heavy_bnk:'heavy'};
export const dimensions={burton:[2.9,.6,.16],pilot:[2.9,.6,.16],lotus:[2.9,.6,.16],hijacker:[2.9,.6,.16],jarmen:[2.9,.6,.16],mob:[5.2,1.4,.2],stealth:[9,1.9,.25],aurora:[10,2,.25],radarvan:[7,2.6,.25],bunker:[8,2.8,.25],crawler:[7.4,2.1,.25],bus:[8.6,2.3,.24],scudlauncher:[9,2.3,.24],nukecannon:[10.4,2.4,.25],heavy_gat:[10.2,2.4,.25],heavy_spk:[10.2,2.4,.25],heavy_bnk:[10.2,2.4,.25],quad:[7,1.5,.25],ambulance:[6.5,1.5,.25],dropzone:[16,5,.23],blackmarket:[15,4.4,.23],hole:[8,3,.3],trap:[3,1.2,.3],raptor:[9,1.9,.25],mig:[9,1.9,.25],sniper:[2.9,.6,.16],hacker:[2.9,.6,.16],suicide:[2.9,.6,.16],heli:[9,1.8,.25],flame:[8,1.9,.25],toxin:[7,1.8,.25],bombtruck:[7.5,2,.24],airfield:[20,6.2,.23],speaker:[7,2.4,.25],tunnel:[8,3,.25],hq:[18,5.8,.22],power:[12,4,.22],refinery:[17,5.5,.23],barracks:[15,4.8,.23],factory:[20,6.5,.23],turret:[7,2.4,.25],radar:[15,4,.2],silo:[19,6.2,.40],civilian:[13.5,4.3,.23],builder:[6.2,1.6,.26],infantry:[2.9,.6,.16],rocket:[2.9,.6,.16],jeep:[5.4,1.3,.25],tank:[8,1.9,.25],heavy:[10.2,2.4,.25],artillery:[9,1.9,.25],harvester:[7.3,2.1,.24],palm:[12,2,.07],rocks:[16,6,.23],supplies:[10,4,.22]};

export function makeAsset(type,team=2,{sprite=false,faction=null}={}){const g=new T.Group(),[size,r,anchor]=dimensions[type],key=assets[type]?type:FALLBACK[type],entry=assets[key];const M=!sprite&&faction&&MODELS[faction+':'+team]?.[type];const liveBuilding=buildingModel(type,faction||'falcon',r);if(M){g.userData={liveBuilding,asset:type,model:M,team,size:M.S,r,anchor:.5,aspect:1,frame:0,opacity:1,pose:0,turretYaw:null,recoil:0,noShadow:!!M.building};return g}g.userData={liveBuilding,asset:key,team,size,r,anchor,aspect:entry.sheet?1:entry.image.height/entry.image.width,frame:0,opacity:1,variant:entry.sheet&&team<9?team:null};return g}
export function makeBuilding(type,team){return makeAsset(type,team)}
export function makeUnit(type,team){return makeAsset(type,team)}

// ---------------------------------------------------------------------------
// Scenery per map
// ---------------------------------------------------------------------------
export const world={patches:[],decals:[],tracks:[],scenery:[],clouds:[]};
export function makeWorld(scene,map=MAP){
 for(const s of world.scenery)scene.remove(s);world.scenery=[];world.decals=[];world.tracks=[];world.patches=[];world.clouds=Array.from({length:Math.round(7*map.limit/200)},(_,i)=>({x:-map.limit-60+i*80+Math.random()*30,z:(Math.random()-.5)*map.limit*2,r:38+Math.random()*40,ratio:.55+Math.random()*.3,rot:Math.random()*3}));
 let seed=731+map.id.length*97;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
 const B=BIO(),treeKey=v=>B.tree==='palm'?'palm':treeAsset(B.tree,v),rk=rockAsset(),L=map.limit;
 const add=(key,x,z,scale,team=9)=>{if(key==='palm'&&B.tree!=='palm'){key=treeKey(Math.floor(random()*3));scale=(scale||1)*({pine:1.55,acacia:1.25,oak:1.1}[B.tree]||1.15)}if(key==='rocks')key=rk;const g=makeAsset(key,team);g.position.set(x,height(x,z),z);if(scale)g.scale.setScalar(scale);scene.add(g);world.scenery.push(g);return g};
 const clearOf=(x,z,pad)=>map.bases.every(b=>Math.hypot(x-b.x,z-b.z)>48+pad)&&map.deposits.every(d=>Math.hypot(x-d.x,z-d.z)>13+pad)&&map.civilians.every(c=>Math.hypot(x-c.x,z-c.z)>11+pad);
 for(let i=0;i<Math.round(150*L/200);i++){const side=Math.floor(random()*4),u=(random()*2-1)*(map.limit+40),o=map.limit+14+random()*28;const x=side===0?u:side===1?u:side===2?o:-o,z=side===0?o:side===1?-o:u;add('rocks',x,z,.8+random())}
 let palms=0;for(let i=0;i<1400&&palms<map.palms.count;i++){const x=(random()-.5)*L*1.9,z=(random()-.5)*L*1.9;if(map.palms.rule(x,z)&&clearOf(x,z,0)&&map.groves.every(g=>Math.hypot(x-g.x,z-g.z)>g.r+4)&&map.rocks.every(r=>Math.hypot(x-r.x,z-r.z)>r.r+5)){add('palm',x,z,.55+random()*.5);palms++}}
 for(let i=0;i<Math.round(90*L/200);i++){const x=(random()-.5)*L*1.98,z=(random()-.5)*L*1.98;if(clearOf(x,z,-10))add('rocks',x,z,.06+random()*.13)}
 for(const {x,z}of map.deposits)add('supplies',x,z,1.1);
 for(const r of map.rocks)add('rocks',r.x,r.z,r.r/5.2*(0.95+random()*.15));
 for(const g of map.groves){for(let i=0;i<34;i++){const a=random()*Math.PI*2,d=Math.sqrt(random())*g.r;add('palm',g.x+Math.cos(a)*d,g.z+Math.sin(a)*d,.7+random()*.45)}world.patches.push({x:g.x,z:g.z,rx:g.r+6,rz:g.r+6,color:B.grove,alpha:.42})}
 for(let i=0;i<Math.round(70*L/200);i++){const x=(random()-.5)*L*1.9,z=(random()-.5)*L*1.9,r=6+random()*18;world.patches.push({x,z,rx:r,rz:r*(.5+random()*.6),rot:random()*3,color:random()<.5?B.patch[0]:B.patch[1],alpha:.10+random()*.12})}
 for(const d of map.deposits)world.patches.push({x:d.x,z:d.z,rx:11,rz:9,color:'#5b4a32',alpha:.22});
 const sun=new T.DirectionalLight(0xffe6b5,3.4);return{sun}
}
export function addDecal(d){if(d.kind==='track'){d.born=performance.now();world.tracks.push(d);if(world.tracks.length>900)world.tracks.splice(0,100);return}d={born:performance.now(),life:d.r>5?200000:80000,color:'#2e2418',...d};d.alpha=(d.alpha??.5)*.6;world.decals.push(d);if(world.decals.length>180)world.decals.shift()}

// ---------------------------------------------------------------------------
// Particles (coloured soft sprites, cached per colour)
// ---------------------------------------------------------------------------
const particleCache=new Map();
export function particle(color){let c=particleCache.get(color);if(c)return c;c=canvas(64,64);const g=c.getContext('2d'),r=(color>>16)&255,gg=(color>>8)&255,b=color&255,grad=g.createRadialGradient(32,32,0,32,32,32);grad.addColorStop(0,`rgba(${r},${gg},${b},.7)`);grad.addColorStop(.4,`rgba(${r},${gg},${b},.35)`);grad.addColorStop(1,`rgba(${r},${gg},${b},0)`);g.fillStyle=grad;g.fillRect(0,0,64,64);particleCache.set(color,c);return c}

// ---------------------------------------------------------------------------
// CPU image renderer: pre-rendered artwork projected onto the shared world coordinates.
// No WebGL context is required.
// ---------------------------------------------------------------------------
export class ImageRenderer{
 constructor({canvas:c}){this.domElement=c;this.ctx=c.getContext('2d',{alpha:false});this.ratio=Math.min(devicePixelRatio||1,1.4);this.tint='dawn';this.drawn=[];this.groundCache=null;this.groundKey='';this.flash=0}
 setPixelRatio(v){this.ratio=Math.min(v,1.4)}
 setSize(w,h){this.width=w;this.height=h;this.domElement.width=Math.round(w*this.ratio);this.domElement.height=Math.round(h*this.ratio);this.domElement.style.width=w+'px';this.domElement.style.height=h+'px';this.groundKey=''}
 helpers(camera){const w=this.width,h=this.height,v=new T.Vector3();const project=(x,y,z)=>{v.set(x,y,z).project(camera);return{x:(v.x+1)*w/2,y:(1-v.y)*h/2,z:v.z}};const scaleAt=(x,y,z)=>{v.set(x,y,z).applyMatrix4(camera.matrixWorldInverse);return h/(2*Math.tan(camera.fov*Math.PI/360)*Math.max(.1,-v.z))};const depth=(x,y,z)=>{v.set(x,y,z).applyMatrix4(camera.matrixWorldInverse);return -v.z};
  // vertical foreshortening of ground circles for the current camera
  const a=project(camera.userData.fx||0,0,camera.userData.fz||0);return{project,scaleAt,depth,w,h,squash:camera.userData.squash||.62,time:performance.now()/1000}}
 drawGround(ctx,camera,H){const{w,h,project}=H;const key=[camera.position.x,camera.position.y,camera.position.z,camera.rotation.y,w,h,MAP.id,this.tint,camera.view?.offsetY||0].map(n=>typeof n==='number'?n.toFixed(2):n).join('|');
  if(key===this.groundKey&&this.groundCache){ctx.drawImage(this.groundCache,0,0,w,h);return}
  if(!this.groundCache||this.groundCache.width!==this.domElement.width||this.groundCache.height!==this.domElement.height){this.groundCache=canvas(this.domElement.width,this.domElement.height)}
  const g=this.groundCache.getContext('2d');g.setTransform(this.ratio,0,0,this.ratio,0,0);g.fillStyle=BIO().base;g.fillRect(0,0,w,h);const LIM=MAP.limit+64;
  const focus=new T.Vector3(),origin=new T.Vector3();camera.getWorldDirection(focus);const t=camera.position.y/(-focus.y);origin.copy(camera.position).addScaledVector(focus,t);
  const radius=Math.min(250,camera.position.y*1.9),tile=camera.position.y>120?32:16,x0=Math.max(-LIM,Math.floor((origin.x-radius)/tile)*tile),x1=Math.min(LIM,origin.x+radius),z0=Math.max(-LIM,Math.floor((origin.z-radius)/tile)*tile),z1=Math.min(LIM,origin.z+radius),ground=groundTex();
  const tri=(a,b,c,second)=>{g.save();g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.lineTo(c.x,c.y);g.closePath();g.clip();let aa,bb,cc,dd,tx,ty;const s=tile/16;if(!second){aa=(b.x-a.x)/ground.width/s;bb=(b.y-a.y)/ground.width/s;cc=(c.x-a.x)/ground.height/s;dd=(c.y-a.y)/ground.height/s;tx=a.x;ty=a.y}else{aa=(a.x-b.x)/ground.width/s;bb=(a.y-b.y)/ground.width/s;cc=(a.x-c.x)/ground.height/s;dd=(a.y-c.y)/ground.height/s;tx=b.x+c.x-a.x;ty=b.y+c.y-a.y}g.transform(aa,bb,cc,dd,tx,ty);if(s>1){for(let i=0;i<s;i++)for(let j=0;j<s;j++)g.drawImage(ground,i*ground.width,j*ground.height)}else g.drawImage(ground,0,0);g.restore()};
  for(let z=z0;z<z1;z+=tile)for(let x=x0;x<x1;x+=tile){const a=project(x,height(x,z),z),b=project(x+tile,height(x+tile,z),z),c=project(x,height(x,z+tile),z+tile),d=project(x+tile,height(x+tile,z+tile),z+tile);if([a,b,c,d].some(p=>p.z>1||p.z<-1)||[a,b,c,d].every(p=>p.x<0)||[a,b,c,d].every(p=>p.x>w)||[a,b,c,d].every(p=>p.y<0)||[a,b,c,d].every(p=>p.y>h))continue;tri(a,b,c,false);tri(d,c,b,true)}
  // colour grade toward the warm, saturated ochre of Generals' desert maps
  g.save();g.globalCompositeOperation='soft-light';g.globalAlpha=BIO().gradeA;g.fillStyle=this.tint==='sunset'?'#e07a30':BIO().grade;g.fillRect(0,0,w,h);g.globalCompositeOperation='multiply';g.globalAlpha=BIO().multA;g.fillStyle=BIO().mult;g.fillRect(0,0,w,h);g.restore();
  // static ground patches (gravel, darker soil, oasis vegetation)
  for(const p of world.patches)this.ellipse(g,H,p.x,p.z,p.rx,p.rz,p.color,p.alpha,p.rot||0,true);
  // service roads
  for(const road of MAP.roads){for(let i=0;i<road.length-1;i++){const[ax,az]=road[i],[bx,bz]=road[i+1],dx=bx-ax,dz=bz-az,l=Math.hypot(dx,dz)||1,nx=-dz/l*3.2,nz=dx/l*3.2,p=[project(ax+nx,height(ax,az)+.04,az+nz),project(bx+nx,height(bx,bz)+.04,bz+nz),project(bx-nx,height(bx,bz)+.04,bz-nz),project(ax-nx,height(ax,az)+.04,az-nz)];if(p.some(q=>q.z>1)||p.every(q=>q.y<0)||p.every(q=>q.y>h)||p.every(q=>q.x<0)||p.every(q=>q.x>w))continue;g.fillStyle=BIO().road;g.beginPath();p.forEach((q,i)=>i?g.lineTo(q.x,q.y):g.moveTo(q.x,q.y));g.closePath();g.fill();const m=[p[0],p[1]].map((q,i)=>({x:(q.x+p[3-i].x)/2,y:(q.y+p[3-i].y)/2}));g.strokeStyle='#4f4a3c22';g.lineWidth=Math.max(1,Math.hypot(p[0].x-p[3].x,p[0].y-p[3].y)*.18);for(const off of [-.28,.28]){g.beginPath();g.moveTo(m[0].x+(p[0].x-p[3].x)*off,m[0].y+(p[0].y-p[3].y)*off);g.lineTo(m[1].x+(p[1].x-p[2].x)*off,m[1].y+(p[1].y-p[2].y)*off);g.stroke()}}}
  this.groundKey=key;ctx.drawImage(this.groundCache,0,0,w,h)}
 ellipse(ctx,H,x,z,rx,rz,color,alpha,rot=0,soft=false){const p=H.project(x,height(x,z),z);if(p.z>1)return;const s=H.scaleAt(x,height(x,z),z),a=rx*s,b=rz*s*H.squash;if(p.x+a<0||p.x-a>H.w||p.y+a<0||p.y-a>H.h)return;ctx.save();ctx.globalAlpha=alpha;ctx.translate(p.x,p.y);ctx.scale(1,H.squash);ctx.rotate(rot);if(soft){const gr=ctx.createRadialGradient(0,0,0,0,0,Math.max(a,rz*s));gr.addColorStop(0,color);gr.addColorStop(.35,color+'cc');gr.addColorStop(.7,color+'55');gr.addColorStop(1,color+'00');ctx.fillStyle=gr}else ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(0,0,a,rz*s,0,0,Math.PI*2);ctx.fill();ctx.restore()}
 render(scene,camera){const start=performance.now();scene.updateMatrixWorld(true);camera.updateMatrixWorld();const ctx=this.ctx,H=this.helpers(camera),{w,h,project,scaleAt}=H;ctx.setTransform(this.ratio,0,0,this.ratio,0,0);
  this.drawGround(ctx,camera,H);
  // dynamic decals: scorch marks, rubble, craters
  const now=performance.now();world.decals=world.decals.filter(d=>now-d.born<d.life);for(const d of world.decals){const age=(now-d.born)/d.life,fade=age>.7?(1-age)/.3:1;this.ellipse(ctx,H,d.x,d.z,d.r,d.r*(d.ratio||1),d.color||'#1d1712',(d.alpha||.5)*fade,d.rot||0,true)}
  // tyre/track marks
  world.tracks=world.tracks.filter(d=>now-d.born<d.life);ctx.save();ctx.lineCap='round';for(const d of world.tracks){const age=(now-d.born)/d.life,a=d.alpha*(age>.6?(1-age)/.4:1);const sx=Math.sin(d.ang),sz=Math.cos(d.ang),nx=sz*d.w,nz=-sx*d.w,L=.75;const y=height(d.x,d.z)+.02;const c=H.project(d.x,y,d.z);if(c.z>1||c.x<-20||c.x>w+20||c.y<-20||c.y>h+20)continue;const s=H.scaleAt(d.x,y,d.z);ctx.strokeStyle=`rgba(70,52,30,${a.toFixed(3)})`;ctx.lineWidth=Math.max(1,s*.32);for(const side of [-1,1]){const p0=H.project(d.x+nx*side-sx*L,y,d.z+nz*side-sz*L),p1=H.project(d.x+nx*side+sx*L,y,d.z+nz*side+sz*L);ctx.beginPath();ctx.moveTo(p0.x,p0.y);ctx.lineTo(p1.x,p1.y);ctx.stroke()}}ctx.restore();
  // drifting cloud shadows
  const ct=performance.now()/1000;for(const c of world.clouds){let x=c.x+ct*2.2;x=((x+300)%600+600)%600-300;this.ellipse(ctx,H,x,c.z+ct*.6%1,c.r,c.r*c.ratio,MAP.biome==='snow'?'#3a4a5c':'#2b1c08',MAP.biome==='snow'?.12:.16,c.rot,true)}
  const items=[],ground=[],top=[],origin=new T.Vector3(),size=new T.Vector3();
  for(const root of scene.children){if(!root.visible)continue;const u=root.userData;
   if(u.asset){root.getWorldPosition(origin);root.getWorldScale(size);const p=project(origin.x,origin.y,origin.z),s=scaleAt(origin.x,origin.y,origin.z),pixels=u.size*s*size.x;if(p.z>1||p.x+pixels<0||p.x-pixels>w||p.y+pixels<0||p.y-pixels*1.2>h)continue;const angle=Math.atan2(camera.position.x-origin.x,camera.position.z-origin.z);let frame;if(u.model){const M=u.model,n=M.dirs,st=Math.PI*2/n,tn=M.tdirs||n,tst=Math.PI*2/tn;frame=M.building?(n>1?Math.floor(performance.now()/160)%n:0):((Math.round((root.rotation.y-angle)/st)%n)+n)%n;u.tframe=u.turretYaw==null?null:((Math.round((u.turretYaw-angle)/tst)%tn)+tn)%tn;u.rel=u.turretYaw==null?0:u.turretYaw-angle}else frame=((Math.round((root.rotation.y-angle-Math.PI/4)/(Math.PI/2))%4)+4)%4;u.frame=frame;items.push({kind:'asset',root,u,p,s,pixels,frame,sy:size.y,depth:H.depth(origin.x,origin.y,origin.z),gp:u.alt?project(origin.x,origin.y-u.alt,origin.z):null})}
   else if(u.draw){root.getWorldPosition(origin);const p=project(origin.x,origin.y,origin.z);if(p.z>1)continue;const item={kind:'custom',root,u,p,depth:H.depth(origin.x,origin.y,origin.z)};if(u.layer==='ground')ground.push(item);else if(u.layer==='top')top.push(item);else items.push(item)}}
  for(const it of ground)it.u.draw(ctx,H,it.root,it.p);
  items.sort((a,b)=>b.depth-a.depth);this.drawn=[];
  for(const it of items){if(it.kind==='custom'){it.u.draw(ctx,H,it.root,it.p);continue}
   const{root,u,p,s,pixels,frame}=it,entry=assets[u.asset];ctx.save();ctx.globalAlpha=u.opacity??1;if(u.bank||u.bob){ctx.translate(p.x,p.y);ctx.rotate((u.bank||0)+(u.bob||0));ctx.translate(-p.x,-p.y);}
   const gp=it.gp||p;
   if(!u.noShadow){ctx.fillStyle=u.alt?'#2d2a2344':'#2d2a2338';ctx.beginPath();ctx.ellipse(gp.x+(u.alt||0)*s*.38,gp.y+(u.alt||0)*s*.16,u.r*s*root.scale.x*(u.alt?1.6:.95),u.r*s*root.scale.x*(u.alt?1.6:.95)*H.squash,0,0,Math.PI*2);ctx.fill()}
   if(u.tc){ctx.fillStyle=u.tc+'40';ctx.beginPath();ctx.ellipse(gp.x,gp.y,(u.r*root.scale.x+.3)*s,(u.r*root.scale.x+.3)*s*H.squash,0,0,Math.PI*2);ctx.fill()}
   if(u.ring){ctx.strokeStyle=u.ring;ctx.lineWidth=u.tc&&u.ring!=='#f2f6d8'?2.2:1.8;ctx.beginPath();ctx.ellipse(gp.x,gp.y,(u.r*root.scale.x+.35)*s,(u.r*root.scale.x+.35)*s*H.squash,0,0,Math.PI*2);ctx.stroke();if(u.alt){ctx.globalAlpha*=.4;ctx.beginPath();ctx.moveTo(gp.x,gp.y);ctx.lineTo(p.x,p.y);ctx.stroke();ctx.globalAlpha/=.4}}
   if(u.liveBuilding){const drawn=drawLiveBuilding(ctx,root,camera,w,h,this.ratio);ctx.restore();if(drawn){if(u.entity)this.drawn.push({root,...drawn,p,s});if(u.hud)top.push({kind:'hud',root,u,p,s,topY:drawn.top});continue}ctx.save();ctx.globalAlpha=u.opacity??1;}
   if(u.model){const M=u.model,F=M.F,ph=pixels*it.sy/(root.scale.x||1),left=p.x-pixels*.5,topY=p.y-ph*.5,row=Math.min(M.poses.length-1,u.pose||0);const src=u.wreck?modelVariant(M,'w'):M.atlas;if(u.flashT&&performance.now()-u.flashT<90)ctx.globalAlpha*=.75;
    if(M.building&&u.build!==undefined&&u.build<1){const a0=ctx.globalAlpha,k=Math.max(.05,u.build),cut=topY+ph*(.78-.6*k);ctx.globalAlpha=a0*.28;ctx.drawImage(src,frame*F,row*F,F,F,left,topY,pixels,ph);ctx.globalAlpha=a0;ctx.save();ctx.beginPath();ctx.rect(left,cut,pixels,topY+ph-cut);ctx.clip();ctx.drawImage(src,frame*F,row*F,F,F,left,topY,pixels,ph);ctx.restore();ctx.strokeStyle='#ffd27acc';ctx.lineWidth=1.5;ctx.setLineDash([5,4]);ctx.beginPath();ctx.moveTo(left+pixels*.18,cut);ctx.lineTo(left+pixels*.82,cut);ctx.stroke();ctx.setLineDash([])}
    else ctx.drawImage(src,frame*F,row*F,F,F,left,topY,pixels,ph);
    if(M.turretAtlas&&!u.wreck&&u.tframe!=null&&!(M.building&&u.build<1)){const rk=Math.max(0,1-(performance.now()-(u.recoil||0))/160)*pixels*.035;ctx.drawImage(M.turretAtlas,u.tframe*F,0,F,F,left-Math.sin(u.rel)*rk,topY-Math.cos(u.rel)*rk*.6,pixels,ph)}
    ctx.restore();if(u.entity)this.drawn.push({root,left,top:topY,w:pixels,h:ph,frame,row,model:M,p,s});if(u.hud)top.push({kind:'hud',root,u,p,s,topY:topY+ph*.18});continue}
   const ph=pixels*u.aspect*it.sy/(root.scale.x||1),left=p.x-pixels*.5,topY=p.y-ph*(1-u.anchor);const img=u.ghost?variant(u.asset,entry.sheet?frame:0,u.ghost):u.wreck?variant(u.asset,entry.sheet?frame:0,'wreck'):variant(u.asset,entry.sheet?frame:0,u.variant);
   if(u.flashT&&performance.now()-u.flashT<90){ctx.globalAlpha*=.7}
   ctx.drawImage(img,left,topY,pixels,ph);ctx.restore();
   if(u.entity)this.drawn.push({root,left,top:topY,w:pixels,h:ph,frame,entry,p,s});
   if(u.hud)top.push({kind:'hud',root,u,p,s,topY})}
  for(const it of top){if(it.kind==='hud')this.drawHud(ctx,it);else it.u.draw(ctx,H,it.root,it.p)}
  if(BIO().snowfall){const t=performance.now()/1000;ctx.save();ctx.fillStyle='#ffffffcc';for(let i=0;i<110;i++){const sp=18+(i*37%23),x=((i*197.3+t*(10+i%7*3)+Math.sin(t+i)*14)%(w+40)+w+40)%(w+40)-20,y=((i*131.7+t*sp*2.2)%(h+40))-20,r=.8+(i%3)*.6;ctx.globalAlpha=.35+(i%4)*.15;ctx.fillRect(x,y,r*1.6,r*1.6)}ctx.restore()}
  if(this.tint==='sunset'){ctx.fillStyle='#b4602014';ctx.fillRect(0,0,w,h)}
  if(this.flash>0){ctx.fillStyle=`rgba(255,244,214,${Math.min(.85,this.flash)})`;ctx.fillRect(0,0,w,h);this.flash-=.03}
  this.domElement.dataset.renderMs=(performance.now()-start).toFixed(1)}
 drawHud(ctx,{u,p,s,topY}){const hud=u.hud;const big=hud.building,bw=big?Math.min(90,Math.max(46,u.r*s*1.6)):Math.min(48,Math.max(26,u.r*s*2.2)),x=p.x-bw/2,y=Math.max(topY+(big?hud.offset||8:2),p.y-(big?u.size*s*.55:u.size*s*.8))-8;
  if(hud.showHp){ctx.fillStyle='#0b0f0ccc';ctx.fillRect(x-1,y-1,bw+2,6);const f=Math.max(0,Math.min(1,hud.hp));ctx.fillStyle=f>.6?'#5fe04a':f>.3?'#ecd23c':'#ec4a32';ctx.fillRect(x,y,bw*f,4);const seg=big?10:5;ctx.fillStyle='#0b0f0c99';for(let i=1;i<seg;i++)ctx.fillRect(x+bw*i/seg-.5,y,1,4)}
  if(hud.progress!==undefined&&hud.progress<1){ctx.fillStyle='#0b0f0ccc';ctx.fillRect(x-1,y+6,bw+2,4);ctx.fillStyle='#e6bf7d';ctx.fillRect(x,y+7,bw*hud.progress,2)}
  if(hud.vet){ctx.save();ctx.fillStyle=hud.vet>=3?'#ff7a5a':'#f3d27a';ctx.strokeStyle='#0008';ctx.lineWidth=1;for(let i=0;i<hud.vet;i++){const cx=x-7-i*0,cy=y-1-i*4;ctx.beginPath();ctx.moveTo(cx-4,cy);ctx.lineTo(cx,cy-3);ctx.lineTo(cx+4,cy);ctx.lineTo(cx+4,cy+2);ctx.lineTo(cx,cy-1);ctx.lineTo(cx-4,cy+2);ctx.closePath();ctx.fill();ctx.stroke()}ctx.restore()}
  if(hud.pips){for(let i=0;i<hud.pips[1];i++){ctx.fillStyle=i<hud.pips[0]?(hud.team===1?'#e07a5f':'#8fd0ff'):'#0008';ctx.fillRect(x+i*7,y+8,5,5)}}
  if(hud.group){ctx.font='bold 10px monospace';ctx.fillStyle='#f6e2b4';ctx.strokeStyle='#000a';ctx.lineWidth=3;ctx.strokeText(hud.group,x+bw+3,y+5);ctx.fillText(hud.group,x+bw+3,y+5)}
  if(hud.text){ctx.font='10px Tahoma';ctx.textAlign='center';ctx.fillStyle='#f3e2bf';ctx.strokeStyle='#000b';ctx.lineWidth=3;ctx.strokeText(hud.text,p.x,y-6);ctx.fillText(hud.text,p.x,y-6);ctx.textAlign='start'}}
 // Pixel-accurate picking against the artwork that was actually drawn this frame.
 hit(d,px,py){if(px<d.left||px>d.left+d.w||py<d.top||py>d.top+d.h)return false;if(d.liveMask){const x=Math.min(63,Math.max(0,Math.floor((px-d.left)/d.w*64))),y=Math.min(63,Math.max(0,Math.floor((py-d.top)/d.h*64)));return d.liveMask[(y*64+x)*4+3]>100}if(d.model){const M=d.model,ms=M.maskSize,x=Math.min(ms-1,Math.floor((px-d.left)/d.w*ms))+d.frame*ms,y=Math.min(ms-1,Math.floor((py-d.top)/d.h*ms))+d.row*ms;return M.mask[y*M.maskW+x]>40}const u=(px-d.left)/d.w,v=(py-d.top)/d.h,cols=d.entry.sheet?2:1,col=d.entry.sheet?d.frame%2:0,row=d.entry.sheet?Math.floor(d.frame/2):0,x=Math.max(0,Math.min(255,Math.floor((col+u)/cols*256))),y=Math.max(0,Math.min(255,Math.floor((row+v)/cols*256)));return d.entry.mask[y*256+x]>64}
 pick(px,py,tol=0){for(let i=this.drawn.length-1;i>=0;i--){const d=this.drawn[i];if(this.hit(d,px,py))return d.root.userData.entity}
  // touch: also accept a hit within `tol` pixels of the artwork
  if(tol){const offs=[];for(const r of [tol*.5,tol])for(let a=0;a<8;a++)offs.push([Math.cos(a*Math.PI/4)*r,Math.sin(a*Math.PI/4)*r]);for(let i=this.drawn.length-1;i>=0;i--){const d=this.drawn[i];for(const[ox,oy]of offs)if(this.hit(d,px+ox,py+oy))return d.root.userData.entity}}
  // generous fallback for tiny infantry
  let best=null,bd=1e9;for(const d of this.drawn){const e=d.root.userData.entity;if(!e||e.building)continue;const r=Math.max(9+tol,d.root.userData.r*d.s*1.2+tol*.5),dd=Math.hypot(px-d.p.x,py-(d.p.y-r*.6));if(dd<r&&dd<bd){bd=dd;best=e}}return best}
}

// ---------------------------------------------------------------------------
// Procedural effect drawings (aircraft, missiles, parachutes) used by powers.
// ---------------------------------------------------------------------------
export function drawJet(ctx,p,s,heading,scale=1,shadow=false){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(heading);const k=s*scale;ctx.scale(k,k*.85);ctx.beginPath();ctx.moveTo(0,-6.5);ctx.lineTo(.8,-4.5);ctx.lineTo(.9,-1.2);ctx.lineTo(5.6,1.6);ctx.lineTo(5.6,2.6);ctx.lineTo(.9,1.6);ctx.lineTo(.7,4.6);ctx.lineTo(2.4,5.8);ctx.lineTo(2.4,6.5);ctx.lineTo(0,6);ctx.lineTo(-2.4,6.5);ctx.lineTo(-2.4,5.8);ctx.lineTo(-.7,4.6);ctx.lineTo(-.9,1.6);ctx.lineTo(-5.6,2.6);ctx.lineTo(-5.6,1.6);ctx.lineTo(-.9,-1.2);ctx.lineTo(-.8,-4.5);ctx.closePath();if(shadow){ctx.fillStyle='#1d1a1455';ctx.fill()}else{const g=ctx.createLinearGradient(-5,0,5,0);g.addColorStop(0,'#5d6460');g.addColorStop(.5,'#a6aca4');g.addColorStop(1,'#4d534f');ctx.fillStyle=g;ctx.fill();ctx.strokeStyle='#222a';ctx.lineWidth=.12;ctx.stroke();ctx.fillStyle='#2a3a44';ctx.beginPath();ctx.ellipse(0,-3.6,.45,1.1,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ffb35acc';ctx.beginPath();ctx.ellipse(0,6.6,.5,1.1,0,0,Math.PI*2);ctx.fill()}ctx.restore()}
export function drawMissile(ctx,p,s,angle,len=5){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(angle);const k=s;ctx.scale(k,k);const g=ctx.createLinearGradient(-.6,0,.6,0);g.addColorStop(0,'#8a8d86');g.addColorStop(.5,'#eceae0');g.addColorStop(1,'#7c7f78');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(0,-len);ctx.quadraticCurveTo(.65,-len+1.2,.6,-len+2);ctx.lineTo(.6,len*.6);ctx.lineTo(1.3,len*.9);ctx.lineTo(-1.3,len*.9);ctx.lineTo(-.6,len*.6);ctx.lineTo(-.6,-len+2);ctx.quadraticCurveTo(-.65,-len+1.2,0,-len);ctx.fill();ctx.fillStyle='#b43d2c';ctx.fillRect(-.6,-len+2.2,1.2,.6);ctx.globalCompositeOperation='lighter';const f=ctx.createRadialGradient(0,len*.95,0,0,len*.95,2.2);f.addColorStop(0,'#fff6d0');f.addColorStop(.4,'#ffa040cc');f.addColorStop(1,'#ff400000');ctx.fillStyle=f;ctx.beginPath();ctx.ellipse(0,len*1.4,1.2,2.6,0,0,Math.PI*2);ctx.fill();ctx.restore()}
export function drawChute(ctx,p,s){ctx.save();ctx.translate(p.x,p.y);ctx.scale(s,s);ctx.strokeStyle='#2c2a24aa';ctx.lineWidth=.06;ctx.beginPath();ctx.moveTo(-1.6,-3.2);ctx.lineTo(0,0);ctx.lineTo(1.6,-3.2);ctx.stroke();const g=ctx.createLinearGradient(-1.8,0,1.8,0);g.addColorStop(0,'#6d7357');g.addColorStop(.5,'#b9bc98');g.addColorStop(1,'#5d6249');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(-1.9,-3.1);ctx.quadraticCurveTo(0,-5.3,1.9,-3.1);ctx.quadraticCurveTo(0,-3.7,-1.9,-3.1);ctx.fill();ctx.fillStyle='#3e4434';ctx.fillRect(-.22,-.6,.44,.9);ctx.restore()}

// ---------------------------------------------------------------------------
// HTML icons for the command cards
// ---------------------------------------------------------------------------
const ICONS={strike:'M32 2l5 14 23 10v5l-24-5-1 11 8 4v3l-11-2-11 2v-3l8-4-1-11-24 5v-5l23-10 5-14z',repair:'M9 38l25-25M32 4q13-8 20 5l-9 1-2 8 9 3q-8 10-18 2L17 42z',upgrade:'M12 35V20h10v15m6 0V13h10v22m6 0V6h10v29M7 11L24 6l11 4L54 0',
 armor:'M32 3l22 8v12c0 11-9 18-22 22C19 41 10 34 10 23V11z M32 10v28',ammo:'M14 40V16l5-9 5 9v24zM29 40V16l5-9 5 9v24zM44 40V16l5-9 5 9v24z',training:'M32 4l6 12 13 2-9 9 2 13-12-6-12 6 2-13-9-9 13-2z',
 paradrop:'M8 20Q32-6 56 20Q44 16 32 20Q20 16 8 20zM8 20l24 18 24-18M32 20v18M28 38h8v6h-8z',barrage:'M6 40l14-20M18 40l14-24M30 40l14-28M42 40l14-30M4 42h56',carpet:'M4 10h56M10 18l4 6M22 18l4 6M34 18l4 6M46 18l4 6M8 34a5 5 0 1010 0a5 5 0 10-10 0M24 36a5 5 0 1010 0a5 5 0 10-10 0M40 34a5 5 0 1010 0a5 5 0 10-10 0',
 cash:'M8 12h48v24H8zM32 18a6 6 0 100 12a6 6 0 100-12M14 18v12M50 18v12',emergency:'M26 6h12v14h14v12H38v14H26V32H12V20h14z',launch:'M32 2q8 8 8 22v14l6 6H18l6-6V24q0-14 8-22zM28 44l4 6 4-6',
 sell:'M10 30l20-20h20v20L30 50zM40 16a3 3 0 100 6a3 3 0 100-6',evac:'M8 44V12h28v32M36 28h22M50 20l8 8-8 8',rally:'M16 46V6M16 8h30l-8 8 8 8H16'};
let ICON_FACTION='falcon';const PORTRAITS=new Map();export function setIconFaction(f){ICON_FACTION=f}
function portrait(M,key){if(PORTRAITS.has(key))return PORTRAITS.get(key);const F=M.F,col=M.building?0:Math.round(M.dirs*5/6)%M.dirs,c=canvas(F,F),g=c.getContext('2d',{willReadFrequently:true});g.drawImage(M.atlas,col*F,0,F,F,0,0,F,F);if(M.turretAtlas){const tc=M.building?Math.round((M.tdirs||M.dirs)*5/6)%(M.tdirs||M.dirs):col;g.drawImage(M.turretAtlas,tc*F,0,F,F,0,0,F,F)}
 const d=g.getImageData(0,0,F,F).data;let x0=F,y0=F,x1=0,y1=0;for(let y=0;y<F;y++)for(let x=0;x<F;x++)if(d[(y*F+x)*4+3]>130){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}if(x1<=x0){x0=0;y0=0;x1=F;y1=F}
 const side=Math.max(x1-x0,y1-y0)*1.12+4,cx=(x0+x1)/2,cy=(y0+y1)/2,o=canvas(120,120);o.getContext('2d').drawImage(c,cx-side/2,cy-side/2,side,side,0,0,120,120);const url=o.toDataURL('image/png');PORTRAITS.set(key,url);return url}
// unit portraits (realistic concept renders, one per faction and unit type)
const UNIT_ART={"dragon":["artillery","builder","crawler","flame","hacker","harvester","heavy","infantry","jeep","lotus","mig","nukecannon","rocket","tank"],"falcon":["ambulance","artillery","aurora","builder","burton","harvester","heavy","heli","infantry","jeep","pilot","raptor","rocket","sniper","stealth","tank"],"sand":["artillery","bombtruck","builder","heavy","hijacker","infantry","jarmen","jeep","mob","quad","radarvan","rocket","scudlauncher","suicide","tank","toxin"]};
export const hasPortrait=(type,faction)=>!!UNIT_ART[faction]?.includes(type);
export function icon(type,faction){const pf=faction||ICON_FACTION;if(UNIT_ART[pf]?.includes(type))return `<span class="asset-icon portrait" style="background-image:url('assets/portraits/${pf}-${type}.webp')"></span>`;const art=commandIcon(type,faction||ICON_FACTION);if(art)return art;if(assets[type])return `<span class="asset-icon" style="background-image:url('${base+type+EXT}')"></span>`;const live=buildingIcon(type,faction||ICON_FACTION,dimensions[type]?.[1]||5);if(live)return `<span class="asset-icon model" style="background-image:url('${live}')"></span>`;const M=MODELS[(faction||ICON_FACTION)+':0']?.[type]||MODELS[(faction||ICON_FACTION)+':1']?.[type];if(M)return `<span class="asset-icon model" style="background-image:url('${portrait(M,(faction||ICON_FACTION)+':'+type)}')"></span>`;if(FALLBACK[type])type=FALLBACK[type];if(assets[type])return `<span class="asset-icon" style="background-image:url('${base+type+EXT}')"></span>`;return commandIcon('upgrade',faction||ICON_FACTION)}
