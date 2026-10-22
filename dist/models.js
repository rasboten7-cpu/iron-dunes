// Procedural 3D models (Three.js). Built once, rendered from many angles into sprite atlases by visuals.js.
// Conventions: +z = forward, +y = up, units = game world units, origin = ground centre (turret pivot over origin).
import * as T from './three.module.js';

// ---------------------------------------------------------------------------
// Materials
// ---------------------------------------------------------------------------
let seed=1234;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
function camoTexture(base,spots,repeat=.32,dirt=.25,tint=null,ta=.5){const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.fillStyle=base;g.fillRect(0,0,256,256);
 for(const [col,count,size] of spots){g.fillStyle=col;for(let i=0;i<count;i++){const x=rnd()*256,y=rnd()*256,r=size*(.5+rnd());g.beginPath();for(let k=0;k<7;k++){const a=k/7*Math.PI*2,rr=r*(.6+rnd()*.6);const px=x+Math.cos(a)*rr*1.4,py=y+Math.sin(a)*rr;k?g.lineTo(px,py):g.moveTo(px,py)}g.closePath();g.fill();
  // wrap blobs so the texture tiles
  for(const [dx,dy] of [[256,0],[-256,0],[0,256],[0,-256]]){g.save();g.translate(dx,dy);g.fill();g.restore()}}}
 const d=g.getImageData(0,0,256,256),p=d.data;for(let i=0;i<p.length;i+=4){const n=(rnd()-.5)*22*dirt*2;p[i]+=n;p[i+1]+=n;p[i+2]+=n*.9}g.putImageData(d,0,0);
 if(tint){g.globalCompositeOperation='color';g.globalAlpha=ta;g.fillStyle=tint;g.fillRect(0,0,256,256);g.globalCompositeOperation='soft-light';g.globalAlpha=ta*.5;g.fillRect(0,0,256,256);g.globalCompositeOperation='source-over';g.globalAlpha=1}
 const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(repeat*.8,repeat*.8);t.anisotropy=4;return t}
function stripeTexture(){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');g.fillStyle='#2b2924';g.fillRect(0,0,64,64);g.fillStyle='#46423a';for(let i=0;i<8;i++)g.fillRect(0,i*8,64,3);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(1,6);return t}
const TEAM_COL=[0x3d8fd0,0xc8412e,0x3fae4a,0xe0b52a,0x8e55c9,0xe07a22,0x2ab8b8,0xd05a9a];const tcol=t=>TEAM_COL[t]??0x9a9a8a;const thex=t=>TEAM_COL[t]!=null?'#'+TEAM_COL[t].toString(16).padStart(6,'0'):null;
function tintTex(t,col,a){if(!col)return t;const c=t.image,g=c.getContext('2d');g.save();g.globalCompositeOperation='color';g.globalAlpha=a;g.fillStyle=col;g.fillRect(0,0,c.width,c.height);g.restore();t.needsUpdate=true;return t}
export function palette(name,team){const P={
  desert:['#a6916b',[['#8d7b57',26,30],['#77694b',16,26],['#b29e78',10,18]]],
  dark:['#5e6052',[['#4f5145',26,30],['#43453b',16,26],['#68695a',10,18]]],
  olive:['#69674a',[['#5b593e',24,30],['#4e4c35',14,26],['#747152',10,18]]],
  ochre:['#c19a44',[['#ad8a3a',18,26],['#9b7a35',10,20]]],
  green:['#5d6a48',[['#4c5a3b',26,30],['#3f4a31',16,26],['#6c7853',10,18]]],
  rust:['#9c8460',[['#7d6243',22,26],['#8e5a36',12,16],['#b19b74',10,18]]],
  cnuni:['#5a6b48',[['#4a5a3a',40,10],['#3e4b31',26,8],['#6b7b55',18,6]]],
  glauni:['#b29d78',[['#9a8562',40,10],['#c4b08a',26,8],['#7e6c4c',16,6]]],
  uniform:['#8f8463',[['#6d6548',40,10],['#5a5a40',30,8],['#a89c76',20,6]]],
  tanuni:['#a8956a',[['#8a7a52',40,10],['#b9a882',26,8],['#77693f',20,6]]]}[name];
 const uni=/uni$/.test(name)||name==='uniform',tc=thex(team);const camo=new T.MeshStandardMaterial({map:camoTexture(P[0],P[1],uni?1.4:.32,.25,tc,uni?.62:.55),roughness:.86,metalness:.08});
 return{camo,
  plain:new T.MeshStandardMaterial({color:tc?new T.Color(P[0]).lerp(new T.Color(tc),.45).multiplyScalar(.92):new T.Color(P[0]).multiplyScalar(.92),roughness:.85,metalness:.08}),
  dark:new T.MeshStandardMaterial({color:0x2c2b27,roughness:.9,metalness:.15}),
  metal:new T.MeshStandardMaterial({color:0x55574f,roughness:.5,metalness:.55}),
  gun:new T.MeshStandardMaterial({color:0x3d3e38,roughness:.45,metalness:.6}),
  rubber:new T.MeshStandardMaterial({color:0x1f1e1c,roughness:.95}),
  track:new T.MeshStandardMaterial({map:stripeTexture(),roughness:.95,metalness:.2}),
  glass:new T.MeshStandardMaterial({color:0x26343c,roughness:.15,metalness:.4}),
  light:new T.MeshStandardMaterial({color:0xfff0c0,emissive:0x8a7a40,roughness:.3}),
  wood:new T.MeshStandardMaterial({color:0x8b6a42,roughness:.9}),
  canvas:new T.MeshStandardMaterial({color:0x6b6648,roughness:.95}),
  skin:new T.MeshStandardMaterial({color:0xc08a62,roughness:.7}),
  team:new T.MeshStandardMaterial({color:tcol(team),roughness:.5,metalness:.1,emissive:tcol(team),emissiveIntensity:.45})}}

// ---------------------------------------------------------------------------
// Geometry helpers
// ---------------------------------------------------------------------------
function mesh(geo,mat,parent,x=0,y=0,z=0){const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;parent?.add(m);return m}
function box(w,h,d,mat,parent,x,y,z){return mesh(new T.BoxGeometry(w,h,d),mat,parent,x,y,z)}
// chamfered block: footprint w x d, height h, sitting on y0
function slab(w,h,d,b,mat,parent,x=0,y0=0,z=0){const s=new T.Shape();s.moveTo(-w/2+b,-d/2+b);s.lineTo(w/2-b,-d/2+b);s.lineTo(w/2-b,d/2-b);s.lineTo(-w/2+b,d/2-b);s.closePath();const g=new T.ExtrudeGeometry(s,{depth:Math.max(.01,h-2*b),bevelEnabled:true,bevelThickness:b,bevelSize:b,bevelSegments:1});g.rotateX(-Math.PI/2);g.translate(0,b,0);return mesh(g,mat,parent,x,y0,z)}
// side profile [(z,y)...] extruded across width (x)
function profile(points,width,mat,parent,x=0,bevel=.05){const s=new T.Shape(points.map(([z,y])=>new T.Vector2(z,y)));const g=new T.ExtrudeGeometry(s,{depth:width-2*bevel,bevelEnabled:true,bevelThickness:bevel,bevelSize:bevel,bevelSegments:1});g.rotateY(-Math.PI/2);g.translate((width-2*bevel)/2,0,0);return mesh(g,mat,parent,x,0,0)}
// top-view polygon [(x,z)...] extruded up by h from y0
function plan(points,h,mat,parent,y0=0,bevel=.05){const s=new T.Shape(points.map(([x,z])=>new T.Vector2(x,-z)));const g=new T.ExtrudeGeometry(s,{depth:Math.max(.01,h-2*bevel),bevelEnabled:true,bevelThickness:bevel,bevelSize:bevel,bevelSegments:1});g.rotateX(-Math.PI/2);g.translate(0,bevel,0);return mesh(g,mat,parent,0,y0,0)}
function cyl(r1,r2,h,mat,parent,x,y,z,axis='y',seg=14){const g=new T.CylinderGeometry(r1,r2,h,seg);if(axis==='z')g.rotateX(Math.PI/2);if(axis==='x')g.rotateZ(Math.PI/2);return mesh(g,mat,parent,x,y,z)}
function wheel(r,w,m,parent,x,y,z){const g=new T.Group();g.position.set(x,y,z);parent.add(g);cyl(r,r,w,m.rubber,g,0,0,0,'x',18);cyl(r*.55,r*.55,w+.04,m.metal,g,0,0,0,'x',10);cyl(r*.18,r*.18,w+.08,m.dark,g,0,0,0,'x',8);return g}
function trackUnit(len,h,w,m,parent,x,y,z){const g=new T.Group();g.position.set(x,y,z);parent.add(g);box(w,h*.7,len-h,m.track,g,0,0,0);cyl(h/2,h/2,w,m.track,g,0,0,(len-h)/2,'x',16);cyl(h/2,h/2,w,m.track,g,0,0,-(len-h)/2,'x',16);for(let i=0;i<6;i++)cyl(h*.36,h*.36,w+.06,m.dark,g,0,-h*.05,-(len-h)/2+i*(len-h)/5,'x',12);return g}

// ---------------------------------------------------------------------------
// Vehicles
// ---------------------------------------------------------------------------
function tank(team,{heavy=false,pal,k:kk,barrels:bb,round=false,pd=false,gatling=false,stub=false,pod=false,flame=false}={}){const m=palette(pal||(heavy?'dark':'desert'),team),k=kk||(heavy?1.22:1);const hull=new T.Group(),turret=new T.Group();
 // tracks and running gear
 for(const s of [-1,1]){trackUnit(6.3*k,.9*k,.66*k,m,hull,s*1.33*k,.45*k,.45*k);slab(.16*k,.42*k,5.9*k,.04,m.camo,hull,s*1.36*k,.72*k,.45*k);}
 // hull with sloped glacis
 profile([[-2.55,.42],[-2.7,1.18],[1.9,1.22],[3.35,.78],[3.1,.42]].map(([z,y])=>[z*k,y*k]),2.25*k,m.camo,hull);
 slab(2.5*k,.08*k,5.2*k,.02,m.camo,hull,0,1.18*k,.15*k);
 // engine deck detail, exhausts, lights, tow hooks
 box(1.5*k,.06*k,1.2*k,m.dark,hull,0,1.27*k,-1.85*k);for(let i=0;i<5;i++)box(1.4*k,.03*k,.06*k,m.metal,hull,0,1.31*k,(-2.3+i*.22)*k);
 for(const s of [-1,1]){box(.22*k,.12*k,.08*k,m.light,hull,s*.95*k,1.0*k,3.2*k);box(.5*k,.3*k,.6*k,m.plain,hull,s*.95*k,1.32*k,-2.25*k);}
 // turret (pivot at origin)
 plan([[-1.0,-1.45],[1.0,-1.45],[1.32,-.25],[1.05,1.15],[.55,1.55],[-.55,1.55],[-1.05,1.15],[-1.32,-.25]].map(([x,z])=>[x*k,z*k]),.72*k,m.camo,turret,0,.07);
 slab(1.75*k,.5*k,.7*k,.04,m.camo,turret,0,.08*k,-1.75*k);for(let i=0;i<3;i++)box(.5*k,.28*k,.5*k,m.canvas,turret,(-.55+i*.55)*k,.58*k,-1.8*k);
 slab(.7*k,.48*k,.4*k,.04,m.camo,turret,0,.12*k,1.6*k);
 const barrels=bb||(heavy?[-.3,.3]:[0]);if(flame){cyl(.2,.3,1.7,m.gun,turret,0,.42,2.2,'z',12);cyl(.13,.2,.45,m.dark,turret,0,.42,3.2,'z',10);box(.5,.4,.6,m.camo,turret,0,.42,1.3);const fuel=new T.MeshStandardMaterial({color:0x7a2a1e,roughness:.6,metalness:.3});for(const s2 of [-1,1])cyl(.34,.34,1.5,fuel,turret,s2*.42,.62,-2.0,'z',14);cyl(.04,.04,2.6,m.dark,turret,.3,.75,.4,'z',6)}else if(gatling){for(let i=0;i<6;i++){const a=i/6*Math.PI*2;cyl(.045*k,.045*k,2.6*k,m.gun,turret,Math.cos(a)*.16*k,.4*k+Math.sin(a)*.16*k,2.9*k,'z',6)}cyl(.26*k,.26*k,.5*k,m.gun,turret,0,.4*k,1.75*k,'z');cyl(.24*k,.24*k,.12*k,m.dark,turret,0,.4*k,4.15*k,'z')}else if(stub){cyl(.24*k,.26*k,1.9*k,m.gun,turret,0,.4*k,2.45*k,'z');cyl(.3*k,.3*k,.35*k,m.dark,turret,0,.4*k,3.4*k,'z');for(const s2 of [-1,1])cyl(.22*k,.22*k,1.3*k,m.metal,turret,s2*.75*k,.35*k,-1.2*k,'z',12)}else for(const bx of barrels){cyl(.105*k,.115*k,3.9*k,m.gun,turret,bx*k,.36*k,3.55*k,'z');cyl(.16*k,.16*k,.55*k,m.gun,turret,bx*k,.36*k,3.1*k,'z');cyl(.14*k,.13*k,.3*k,m.gun,turret,bx*k,.36*k,5.45*k,'z')}
 if(round){const dome=mesh(new T.SphereGeometry(1.25*k,18,10,0,Math.PI*2,0,Math.PI/2),m.camo,turret,0,.1*k,.05*k);dome.scale.set(1,.55,1.15)}
 if(pd){slab(.5*k,.3*k,.5*k,.04,m.metal,turret,.55*k,.72*k,-.9*k);cyl(.13*k,.13*k,.3*k,m.glass,turret,.55*k,1.12*k,-.9*k,'y',10);box(.05*k,.05*k,.4*k,m.team,turret,.55*k,1.3*k,-.75*k)}
 if(pod){slab(.6*k,.45*k,1.0*k,.04,m.dark,turret,-1.15*k,.4*k,-.2*k);for(let i=0;i<4;i++)cyl(.08*k,.08*k,.1*k,m.metal,turret,(-1.29+i%2*.28)*k,(.55+Math.floor(i/2)*.2)*k,.32*k,'z',8)}
 cyl(.3*k,.32*k,.22*k,m.camo,turret,-.48*k,.82*k,-.45*k);cyl(.24*k,.24*k,.05*k,m.dark,turret,-.48*k,.95*k,-.45*k);cyl(.035*k,.035*k,.8*k,m.gun,turret,-.48*k,1.0*k,-.05*k,'z');
 slab(.36*k,.26*k,.42*k,.03,m.camo,turret,.55*k,.72*k,.35*k);box(.26*k,.12*k,.04*k,m.glass,turret,.55*k,.88*k,.57*k);
 for(const s of [-1,1]){cyl(.018,.018,1.9*k,m.dark,turret,s*.8*k,1.6*k,-1.3*k);for(let i=0;i<3;i++)cyl(.06*k,.06*k,.25*k,m.dark,turret,s*(1.12+i*.02)*k,.52*k+i*.07,(.6+i*.12)*k,'z',8);slab(.04*k,.3*k,.55*k,.01,m.team,turret,s*1.3*k,.24*k,-.35*k)}
 turret.position.y=1.22*k;return{hull,turret}}
function artillery(team){const m=palette('desert',team);const hull=new T.Group(),turret=new T.Group();
 for(const s of [-1,1]){trackUnit(6.2,.85,.62,m,hull,s*1.3,.43,-.2);slab(.14,.35,5.6,.04,m.camo,hull,s*1.34,.68,-.2)}
 profile([[-3.2,.4],[-3.25,1.25],[2.2,1.25],[3.0,.95],[2.85,.4]],2.25,m.camo,hull);
 for(const s of [-1,1])box(.2,.12,.08,m.light,hull,s*.9,1.0,2.95);box(1.3,.05,.9,m.dark,hull,0,1.28,2.1);
 // big boxy turret centred over the origin
 slab(2.35,1.15,3.0,.07,m.camo,turret,0,0,-.4);slab(2.0,.12,2.4,.03,m.camo,turret,0,1.15,-.5);
 cyl(.15,.16,5.2,m.gun,turret,0,.55,3.55,'z');box(.42,.3,.5,m.gun,turret,0,.55,6.15);cyl(.22,.22,.6,m.gun,turret,0,.55,1.35,'z');box(.75,.6,.35,m.camo,turret,0,.55,1.1);
 cyl(.28,.3,.2,m.camo,turret,-.6,1.27,-.9);cyl(.03,.03,.9,m.gun,turret,-.6,1.42,-.45,'z');for(const s of [-1,1])slab(.04,.35,.7,.01,m.team,turret,s*1.18,.35,-.6);cyl(.018,.018,1.6,m.dark,turret,.85,1.9,-1.6);
 for(let i=0;i<2;i++)box(.8,.35,.5,m.canvas,turret,(-.45+i*.9),.25,-2.15);
 turret.position.y=1.25;return{hull,turret}}
function jeep(team,pal='desert'){const m=palette(pal,team);const hull=new T.Group(),turret=new T.Group();
 for(const [x,z] of [[-1.02,1.45],[1.02,1.45],[-1.02,-1.45],[1.02,-1.45]])wheel(.47,.38,m,hull,x,.47,z);
 slab(2.05,.55,4.6,.06,m.camo,hull,0,.45,0);
 profile([[1.0,1.0],[1.05,1.25],[2.3,1.18],[2.42,.98],[2.42,.95]],2.15,m.camo,hull);
 slab(2.15,.6,2.1,.05,m.camo,hull,0,1.0,0);
 profile([[.95,1.6],[.6,1.95],[-1.05,1.95],[-1.05,1.6]],2.05,m.camo,hull);
 box(1.85,.34,.05,m.glass,hull,0,1.78,.82).rotation.x=-.55;for(const s of [-1,1]){box(.05,.28,.75,m.glass,hull,s*1.03,1.78,.1);box(.05,.28,.75,m.glass,hull,s*1.03,1.78,-.72)}
 for(const s of [-1,1]){slab(.3,.12,1.15,.03,m.camo,hull,s*.98,.98,1.45);slab(.3,.12,1.15,.03,m.camo,hull,s*.98,.98,-1.45);box(.22,.1,.06,m.light,hull,s*.75,1.08,2.43);slab(.04,.28,.9,.01,m.team,hull,s*1.09,1.12,-1.2)}
 box(1.6,.12,.25,m.dark,hull,0,.72,2.42);slab(1.95,.35,1.15,.04,m.camo,hull,0,1.0,-1.75);box(1.5,.25,.6,m.canvas,hull,0,1.38,-1.8);cyl(.018,.018,1.8,m.dark,hull,-.9,2.4,-2.1);
 // roof gun ring (turret pivot at roof centre)
 cyl(.42,.46,.14,m.dark,turret,0,.07,0,'y',16);for(const a of [-.6,0,.6]){const sh=box(.46,.42,.05,m.camo,turret,Math.sin(a)*.45,.38,Math.cos(a)*.45);sh.rotation.y=a}
 box(.12,.12,.55,m.gun,turret,0,.36,.15);cyl(.035,.035,1.05,m.gun,turret,0,.38,.85,'z',8);box(.16,.12,.2,m.metal,turret,.14,.3,-.05);
 turret.position.y=1.95;hull.position.z=0;return{hull,turret}}
function harvester(team,pal='olive'){const m=palette(pal,team);const hull=new T.Group();
 for(const z of [2.25,-.75,-2.05])for(const s of [-1,1])wheel(.52,.42,m,hull,s*1.08,.52,z);
 slab(1.9,.45,6.2,.04,m.dark,hull,0,.55,0);
 slab(2.25,1.1,1.6,.08,m.camo,hull,0,.85,2.3);profile([[1.6,1.95],[1.75,2.35],[2.9,2.3],[3.1,1.95]],2.2,m.camo,hull);box(2.0,.4,.06,m.glass,hull,0,2.18,3.06).rotation.x=.25;
 for(const s of [-1,1]){box(.06,.32,.7,m.glass,hull,s*1.12,2.15,2.25);box(.2,.1,.06,m.light,hull,s*.8,1.3,3.13);slab(.04,.35,.9,.01,m.team,hull,s*1.14,1.25,2.1)}box(1.6,.14,.12,m.dark,hull,0,.95,3.12);
 slab(2.3,.25,4.0,.04,m.camo,hull,0,1.0,-.95);for(const s of [-1,1])slab(.08,.45,4.0,.02,m.camo,hull,s*1.11,1.2,-.95);slab(2.3,.45,.08,.02,m.camo,hull,0,1.2,-2.92);
 const crates=[[-.55,1.25,.2,.95,.7,.9,m.wood],[.55,1.25,.25,.9,.8,.85,m.canvas],[-.5,1.25,-1.0,1.0,.75,1.1,m.canvas],[.5,1.25,-1.15,.9,.65,.95,m.wood],[0,1.25,-2.25,2.0,.55,.85,m.wood],[-.3,1.95,-.4,.9,.5,.9,m.wood]];
 for(const [x,y,z,w,h,d,mat] of crates){slab(w,h,d,.03,mat,hull,x,y,z);if(mat===m.wood)for(const yy of [.25,.65])box(w+.02,.05,d+.02,m.dark,hull,x,y+h*yy,z)}
 cyl(.07,.07,1.3,m.dark,hull,.95,2.1,1.55);return{hull,turret:null}}
function dozer(team,pal='ochre'){const m=palette(pal,team);const hull=new T.Group();
 for(const s of [-1,1])trackUnit(4.4,.85,.7,m,hull,s*1.25,.43,-.2);
 slab(2.0,.75,3.2,.06,m.camo,hull,0,.55,-.3);slab(1.7,.55,1.4,.05,m.camo,hull,0,1.3,.45);for(let i=0;i<4;i++)box(1.4,.03,.05,m.dark,hull,0,1.86,.05+i*.25);
 cyl(.08,.07,1.0,m.dark,hull,.55,2.2,1.0);
 // ROPS cab
 slab(1.6,.12,1.4,.03,m.camo,hull,0,1.3,-1.05);for(const [x,z] of [[-.72,-.4],[.72,-.4],[-.72,-1.7],[.72,-1.7]])box(.1,1.2,.1,m.dark,hull,x,1.95,z);slab(1.75,.12,1.6,.03,m.camo,hull,0,2.55,-1.05);
 box(1.4,.9,.04,m.glass,hull,0,1.92,-.4);for(const s of [-1,1])box(.04,.9,1.2,m.glass,hull,s*.7,1.92,-1.05);
 // curved blade + push arms
 const b1=box(3.3,.95,.14,m.camo,hull,0,.55,2.05);b1.rotation.x=-.12;const b2=box(3.3,.42,.14,m.camo,hull,0,1.15,2.18);b2.rotation.x=-.65;const b0=box(3.3,.14,.12,m.metal,hull,0,.1,2.1);for(const s of [-1,1])box(.12,1.3,.5,m.camo,hull,s*1.62,.7,1.95);
 box(3.3,.12,.18,m.metal,hull,0,.12,2.05);for(const s of [-1,1]){const arm=box(.16,.16,1.6,m.dark,hull,s*1.0,.75,1.05);arm.rotation.x=.25;cyl(.08,.08,1.0,m.metal,hull,s*.7,1.15,1.15,'z')}
 // rear ripper
 box(1.0,.15,.5,m.dark,hull,0,.75,-2.05);for(const s of [-1,0,1])box(.1,.6,.12,m.metal,hull,s*.35,.45,-2.3);
 slab(.04,.3,.8,.01,m.team,hull,1.02,.85,-.6);slab(.04,.3,.8,.01,m.team,hull,-1.02,.85,-.6);return{hull,turret:null}}

// cruise-missile launcher on a 6-wheel chassis (falcon artillery)
function tomahawk(team){const m=palette('desert',team);const hull=new T.Group(),turret=new T.Group();
 for(const z of [2.0,-.6,-1.9])for(const s of [-1,1])wheel(.5,.4,m,hull,s*1.1,.5,z);slab(2.0,.45,5.8,.04,m.dark,hull,0,.55,0);
 slab(2.25,1.0,1.5,.08,m.camo,hull,0,.85,2.1);profile([[1.4,1.85],[1.55,2.2],[2.65,2.15],[2.85,1.85]],2.2,m.camo,hull);box(2.0,.36,.06,m.glass,hull,0,2.03,2.8).rotation.x=.25;for(const s of [-1,1]){box(.2,.1,.06,m.light,hull,s*.8,1.2,2.87);slab(.04,.32,.8,.01,m.team,hull,s*1.14,1.2,1.9)}
 slab(2.2,.3,3.6,.04,m.camo,hull,0,.95,-1.0);
 // rotating launcher box (pivot over origin)
 const box1=new T.Group();box1.position.set(0,.35,-.3);box1.rotation.x=-.42;turret.add(box1);slab(1.7,.95,3.4,.06,m.camo,box1,0,0,0);for(let i=0;i<4;i++)cyl(.17,.17,.06,m.dark,box1,(-.45+(i%2)*.9),.25+Math.floor(i/2)*.42,1.71,'z',10);slab(1.2,.35,1.0,.04,m.camo,turret,0,0,-.3);
 turret.position.y=1.1;return{hull,turret}}
// pickup truck with a heavy machine gun in the bed (sand "technical")
function technical(team){const m=palette('rust',team);const hull=new T.Group(),turret=new T.Group();
 for(const [x,z] of [[-.95,1.35],[.95,1.35],[-.95,-1.3],[.95,-1.3]])wheel(.42,.32,m,hull,x,.42,z);
 slab(1.9,.5,4.4,.06,m.camo,hull,0,.45,0);profile([[.9,.95],[.95,1.15],[2.15,1.1],[2.25,.95]],1.95,m.camo,hull);
 slab(1.85,.6,1.2,.05,m.camo,hull,0,.95,.35);box(1.6,.35,.05,m.glass,hull,0,1.38,.98).rotation.x=-.35;for(const s of [-1,1])box(.05,.3,.6,m.glass,hull,s*.93,1.32,.4);
 for(const s of [-1,1]){slab(.08,.38,1.8,.02,m.camo,hull,s*.92,.95,-1.25);box(.2,.1,.06,m.light,hull,s*.7,.98,2.25);slab(.03,.25,.7,.01,m.team,hull,s*.96,1.0,-1.2)}slab(1.85,.38,.08,.02,m.camo,hull,0,.95,-2.15);
 box(.55,.4,.5,m.canvas,hull,.5,1.1,-1.75);
 cyl(.1,.1,.6,m.gun,turret,0,.3,0);box(.12,.14,.6,m.gun,turret,0,.62,.2);cyl(.04,.04,1.1,m.gun,turret,0,.64,.95,'z',8);box(.5,.4,.05,m.metal,turret,0,.75,.45);
 turret.position.set(0,.95,0);hull.position.z=.6;turret.position.z=0;return{hull,turret}}
// light buggy with a rocket rack (sand artillery)
function buggy(team){const m=palette('rust',team);const hull=new T.Group(),turret=new T.Group();
 for(const [x,z] of [[-1.0,1.35],[1.0,1.35],[-1.05,-1.25],[1.05,-1.25]])wheel(.5,.36,m,hull,x,.5,z);
 slab(1.5,.3,3.8,.04,m.dark,hull,0,.5,0);for(const s of [-1,1]){const r1=box(.08,.08,2.8,m.metal,hull,s*.7,1.3,.1);r1.rotation.x=.05;box(.08,.9,.08,m.metal,hull,s*.7,.95,1.1);box(.08,.9,.08,m.metal,hull,s*.7,.95,-.8)}box(1.5,.08,.08,m.metal,hull,0,1.38,1.1);
 slab(1.1,.3,1.0,.04,m.camo,hull,0,.75,.9);box(.5,.4,.4,m.dark,hull,0,.85,-.2);slab(.04,.25,.6,.01,m.team,hull,.78,.8,.4);
 const rack=new T.Group();rack.rotation.x=-.5;turret.add(rack);slab(1.3,.55,1.2,.03,m.camo,rack,0,0,0);for(let i=0;i<8;i++)cyl(.07,.07,1.25,m.metal,rack,-.45+(i%4)*.3,.15+Math.floor(i/4)*.22,0,'z',8);
 turret.position.set(0,1.2,-1.0);hull.position.z=1.0;turret.position.z=0;return{hull,turret}}
// worker: unarmed labourer with a shovel (sand builder)
function worker(team){const sd=soldier(team,{pal:'glauni',noGun:true,scarf:true});return sd}
// ---------------------------------------------------------------------------
// Infantry with a real walk cycle (poses are baked as separate rows)
// ---------------------------------------------------------------------------
function soldier(team,{rocket=false,pal,scarf=false,noGun=false,sniper=false,hacker=false,vest=false}={}){const m=palette(pal||(rocket?'tanuni':'uniform'),team);const root=new T.Group();
 const limb=(r,len,mat)=>{const g=new T.CapsuleGeometry(r,len,4,8);g.translate(0,-len/2-r,0);return g};
 const hips=new T.Group();hips.position.y=1.0;root.add(hips);
 const legs=[-1,1].map(s=>{const thigh=new T.Group();thigh.position.set(s*.17,0,0);hips.add(thigh);mesh(limb(.13,.38,m.camo),m.camo,thigh);const knee=new T.Group();knee.position.y=-.52;thigh.add(knee);mesh(limb(.11,.36,m.camo),m.camo,knee);const boot=box(.2,.14,.36,m.dark,knee,0,-.52,.07);return{thigh,knee}});
 const torso=new T.Group();torso.position.y=1.0;root.add(torso);
 mesh(new T.CapsuleGeometry(.24,.42,4,10),m.camo,torso,0,.42,0).scale.set(1,1,.72);
 slab(.52,.46,.38,.05,m.plain,torso,0,.24,.0).material=new T.MeshStandardMaterial({color:0x5d5a44,roughness:.9});
 for(const x of [-.14,0,.14])box(.11,.13,.08,m.dark,torso,x,.33,.21);
 slab(.42,.48,.24,.05,m.plain,torso,0,.25,-.3).material=new T.MeshStandardMaterial({color:0x5a5640,roughness:.9});
 box(.1,.06,.06,m.team,torso,-.27,.62,0);box(.1,.06,.06,m.team,torso,.27,.62,0);
 const head=new T.Group();head.position.y=.92;torso.add(head);mesh(new T.SphereGeometry(.15,12,10),m.skin,head,0,.02,.02);
 if(sniper){cyl(.3,.3,.03,m.camo,head,0,.06,0,'y',16);cyl(.17,.19,.16,m.camo,head,0,.14,0,'y',14)}else if(hacker){const cap=mesh(new T.SphereGeometry(.18,14,10,0,Math.PI*2,0,Math.PI*.5),new T.MeshStandardMaterial({color:0x3e4a32,roughness:.8}),head,0,.04,0);box(.2,.03,.16,new T.MeshStandardMaterial({color:0x3e4a32}),head,0,.05,.18);box(.26,.05,.04,m.dark,head,0,.03,.15)}else if(scarf){const wrap=mesh(new T.SphereGeometry(.19,14,10,0,Math.PI*2,0,Math.PI*.62),new T.MeshStandardMaterial({color:team===1?0x8a2a22:0x2a4a6a,roughness:.9}),head,0,.02,-.01);wrap.scale.set(1.05,1,1.1);box(.26,.12,.08,new T.MeshStandardMaterial({color:0xd8d0bc,roughness:.9}),head,0,-.1,.12)}else{const helm=mesh(new T.SphereGeometry(.2,14,10,0,Math.PI*2,0,Math.PI*.55),m.camo,head,0,.02,0);helm.scale.set(1,.9,1.08);box(.24,.05,.05,m.dark,head,0,.04,.17)}
 const arms=[-1,1].map(s=>{const sh=new T.Group();sh.position.set(s*.32,.72,0);torso.add(sh);mesh(limb(.09,.3,m.camo),m.camo,sh);const el=new T.Group();el.position.y=-.45;sh.add(el);mesh(limb(.08,.28,m.camo),m.camo,el);return{sh,el}});
 // weapon held in front of the chest
 const gun=new T.Group();torso.add(gun);
 if(vest){const ex=new T.MeshStandardMaterial({color:0x8a3a22,roughness:.7});for(let i=0;i<9;i++){const an=i/9*Math.PI*2;cyl(.045,.045,.34,ex,torso,Math.sin(an)*.27,.28,Math.cos(an)*.2,'y',6)}cyl(.012,.012,.6,new T.MeshStandardMaterial({color:0xd8c040}),torso,.1,.5,.2,'x',4);box(.1,.12,.06,m.dark,gun,0,0,.1)}
 else if(hacker){box(.42,.05,.3,m.dark,gun,0,0,0)}
 else if(sniper){box(.07,.09,1.35,m.gun,gun,0,0,.2);cyl(.045,.045,.36,m.dark,gun,0,.1,.15,'z',8);box(.05,.14,.08,m.gun,gun,0,-.1,0);box(.06,.1,.32,m.dark,gun,0,-.02,-.5);cyl(.02,.02,.4,m.gun,gun,0,.02,.95,'z',6)}
 else if(noGun){cyl(.025,.025,1.1,m.wood,gun,0,0,0,'z',6);box(.18,.03,.24,m.metal,gun,0,0,.6)}else if(rocket){cyl(.09,.09,1.25,new T.MeshStandardMaterial({color:0x4f5238,roughness:.8}),gun,0,0,0,'z',12);cyl(.12,.1,.2,m.dark,gun,0,0,.62,'z',10);box(.06,.12,.1,m.dark,gun,-.1,.06,.1);}
 else{box(.07,.1,.85,m.gun,gun,0,0,.1);box(.05,.16,.08,m.gun,gun,0,-.11,.05);box(.06,.09,.25,m.dark,gun,0,-.02,-.38);cyl(.02,.02,.3,m.gun,gun,0,.02,.62,'z',6)}
 let laptop=null;if(hacker){laptop=new T.Group();laptop.position.set(0,.4,.42);root.add(laptop);box(.56,.04,.4,m.dark,laptop,0,0,0);const scr=box(.56,.38,.03,new T.MeshStandardMaterial({color:0x163a1c,emissive:0x40ff70,emissiveIntensity:.55}),laptop,0,.19,-.19);scr.rotation.x=-.25;laptop.visible=false}
 function pose(kind,ph=0){// kind: idle | walk | aim | hack
  if(laptop){laptop.visible=kind==='hack';gun.visible=kind!=='hack'}
  if(kind==='hack'){hips.position.y=.36;torso.position.y=.36;torso.rotation.set(.32,0,0);legs.forEach((l,i)=>{l.thigh.rotation.set(-1.45,0,(i?1:-1)*.38);l.knee.rotation.set(2.35,0,0)});arms.forEach((a,i)=>{a.sh.rotation.set(-.95,0,(i?-1:1)*.15);a.el.rotation.set(-.55,0,0)});head.rotation.x=.35;return}
  const sw=kind==='walk'?Math.sin(ph):0,lift=kind==='walk'?Math.max(0,Math.sin(ph+Math.PI/2)):0;
  legs[0].thigh.rotation.x=-sw*.55;legs[1].thigh.rotation.x=sw*.55;legs[0].knee.rotation.x=kind==='walk'?Math.max(0,Math.sin(ph))*.9:0;legs[1].knee.rotation.x=kind==='walk'?Math.max(0,-Math.sin(ph))*.9:0;
  if(kind==='aim'){legs[0].thigh.rotation.x=-.25;legs[1].thigh.rotation.x=.2;legs[0].knee.rotation.x=.25}
  const bob=kind==='walk'?Math.abs(Math.cos(ph))*.06:0;hips.position.y=1.0-bob*.5;torso.position.y=1.0-bob*.5;torso.rotation.x=kind==='walk'?.08:kind==='aim'?.05:0;torso.rotation.y=kind==='walk'?sw*.08:0;
  torso.rotation.z=0;head.rotation.x=0;legs.forEach(l=>{l.thigh.rotation.z=0});arms.forEach(a=>a.sh.rotation.z=0);
  if(rocket){ // tube on the right shoulder
   gun.position.set(.22,.82,.05);gun.rotation.set(kind==='aim'?0:-.12,0,0);arms[1].sh.rotation.set(-1.2,0,-.15);arms[1].el.rotation.set(-.6,0,0);arms[0].sh.rotation.set(kind==='walk'?sw*.4:-.9,0,.25);arms[0].el.rotation.set(kind==='walk'?-.3:-.8,0,0);
  }else if(kind==='aim'){gun.position.set(.12,.72,.32);gun.rotation.set(0,0,0);arms[1].sh.rotation.set(-1.45,0,-.1);arms[1].el.rotation.set(-.3,0,0);arms[0].sh.rotation.set(-1.35,0,.35);arms[0].el.rotation.set(-.6,0,0);head.rotation.x=.12}
  else{gun.position.set(.05,.42,.3);gun.rotation.set(.35,-.55,0);arms[1].sh.rotation.set(-.55+sw*.1,0,-.1);arms[1].el.rotation.set(-1.1,0,0);arms[0].sh.rotation.set(-.75-sw*.1,0,.3);arms[0].el.rotation.set(-1.0,0,0);head.rotation.x=0}}
 pose('idle');root.scale.setScalar(1.22);return{hull:root,turret:null,pose}}

// ---------------------------------------------------------------------------
// Faction-specific vehicles
// ---------------------------------------------------------------------------
// attack helicopter (falcon). Poses rot0..rot3 spin the rotor so the baked rows animate.
function heli(team){const m=palette('desert',team);const hull=new T.Group(),body=new T.Group();hull.add(body);body.position.y=-.7;
 profile([[-1.1,.25],[-1.45,.8],[-.6,1.3],[1.2,1.35],[2.4,1.05],[3.05,.6],[2.6,.18],[.4,.02]],1.2,m.camo,body);
 profile([[.35,1.25],[.85,1.82],[2.2,1.6],[2.75,1.02],[2.25,1.08],[.8,1.3]],.82,m.glass,body);
 profile([[-1.2,.6],[-1.25,1.12],[-5.2,1.22],[-5.45,.98]],.46,m.camo,body);
 profile([[-4.55,.95],[-5.0,2.35],[-5.65,2.35],[-5.65,.9]],.24,m.camo,body);
 cyl(.5,.5,.32,m.dark,body,0,1.55,-5.15,'x',18);box(1.8,.06,.42,m.camo,body,0,2.0,-5.25);
 for(const s of [-1,1]){box(1.3,.08,.62,m.camo,body,s*1.15,.78,.55);cyl(.2,.2,1.0,m.dark,body,s*1.78,.62,.6,'z',10);for(let i=0;i<4;i++)cyl(.05,.05,.04,m.metal,body,s*1.78+Math.cos(i*1.57)*.1,.62+Math.sin(i*1.57)*.1,1.11,'z',6);slab(.04,.26,1.3,.01,m.team,body,s*.25,.95,-3.0);box(.08,.05,.9,m.dark,body,s*.55,.06,.6)}
 cyl(.045,.045,.9,m.gun,body,0,.22,3.0,'z',8);box(.24,.22,.26,m.dark,body,0,.26,2.55);
 cyl(.17,.22,.5,m.dark,body,0,1.55,.2);cyl(.26,.26,.16,m.metal,body,0,1.86,.2);
 const rotor=new T.Group();rotor.position.set(0,1.98,.2);body.add(rotor);
 for(let i=0;i<5;i++){const g=new T.BoxGeometry(3.5,.04,.22);g.translate(1.75,0,0);const b=mesh(g,m.dark,rotor);b.rotation.y=i/5*Math.PI*2}
 const disc=mesh(new T.CircleGeometry(3.5,40),new T.MeshBasicMaterial({color:0x3a3a34,transparent:true,opacity:.07,depthWrite:false}),rotor);disc.rotation.x=-Math.PI/2;disc.castShadow=false;
 const tr=new T.Group();tr.position.set(.2,1.55,-5.15);body.add(tr);for(let i=0;i<4;i++){const b=box(.05,.85,.12,m.dark,tr,0,0,0);b.rotation.x=i/4*Math.PI}
 function pose(kind){const k=+String(kind).replace(/\D/g,'')||0;rotor.rotation.y=k/4*(Math.PI*2/5);tr.rotation.x=k*.7}
 pose('rot0');return{hull,turret:null,pose}}
// tractor with a chemical tank and a spray boom (sand toxin tractor)
function tractor(team){const m=palette('rust',team);const hull=new T.Group();const tox=new T.MeshStandardMaterial({color:0x86b03c,roughness:.45,metalness:.25,emissive:0x2a4a08,emissiveIntensity:.35});
 for(const s of [-1,1]){wheel(.9,.58,m,hull,s*1.08,.9,-1.05);wheel(.5,.36,m,hull,s*.82,.5,1.65)}
 slab(1.0,.5,3.8,.04,m.dark,hull,0,.5,.25);slab(1.15,.75,1.8,.08,m.camo,hull,0,.92,1.35);box(1.0,.5,.06,m.dark,hull,0,1.12,2.27);cyl(.07,.06,1.0,m.dark,hull,.35,1.95,1.6);
 for(const [x,z] of [[-.72,-.1],[.72,-.1],[-.72,-1.5],[.72,-1.5]])box(.08,1.35,.08,m.dark,hull,x,1.7,z);slab(1.6,.08,1.6,.02,m.camo,hull,0,2.38,-.8);box(.6,.5,.5,m.canvas,hull,0,1.3,-.7);
 cyl(.78,.78,1.9,tox,hull,0,2.0,-1.9,'x',20);for(const s of [-1,1])cyl(.82,.82,.12,m.dark,hull,s*.8,2.0,-1.9,'x',20);cyl(.2,.2,.3,m.metal,hull,0,2.85,-1.9);slab(.04,.35,.9,.01,m.team,hull,1.0,.9,.2);slab(.04,.35,.9,.01,m.team,hull,-1.0,.9,.2);
 box(3.0,.09,.09,m.metal,hull,0,.75,2.55);for(let i=-2;i<=2;i++){cyl(.05,.08,.22,m.dark,hull,i*.62,.6,2.55,'y',6)}box(.07,.07,1.4,m.metal,hull,.5,1.05,1.9).rotation.x=.4;
 return{hull,turret:null}}
// old cargo truck loaded with explosives (sand bomb truck)
function bombTruck(team){const m=palette('rust',team);const hull=new T.Group();
 for(const z of [1.7,-1.0,-1.9])for(const s of [-1,1])wheel(.5,.38,m,hull,s*1.02,.5,z);slab(1.8,.4,5.6,.04,m.dark,hull,0,.52,0);
 slab(2.0,1.0,1.4,.08,m.camo,hull,0,.85,1.9);profile([[1.3,1.8],[1.45,2.2],[2.45,2.15],[2.62,1.85]],2.0,m.camo,hull);box(1.8,.36,.06,m.glass,hull,0,2.02,2.62).rotation.x=.25;for(const s of [-1,1])box(.2,.1,.06,m.light,hull,s*.7,1.2,2.62);
 slab(2.1,.25,3.4,.04,m.camo,hull,0,.92,-.8);for(const s of [-1,1])slab(.08,.5,3.4,.02,m.camo,hull,s*1.03,1.1,-.8);
 const bar=[new T.MeshStandardMaterial({color:0x6b3a20,roughness:.6,metalness:.3}),new T.MeshStandardMaterial({color:0xb08a2a,roughness:.6,metalness:.3}),new T.MeshStandardMaterial({color:0x4a5a3a,roughness:.6,metalness:.3})];
 let i=0;for(const x of [-.5,.5])for(const z of [.25,-.6,-1.45,-2.2]){cyl(.38,.38,1.0,bar[i++%3],hull,x,1.6,z,'y',14);cyl(.39,.39,.05,m.dark,hull,x,1.85,z,'y',14)}
 const wire=new T.MeshStandardMaterial({color:0xc8241a,emissive:0x601008,emissiveIntensity:.4});for(let k=0;k<3;k++)cyl(.025,.025,3.0,wire,hull,-.1+k*.1,2.13,-1.0,'z',4);box(.3,.2,.2,m.dark,hull,0,2.2,.6);slab(.04,.3,1.0,.01,m.team,hull,1.07,1.25,-.8);slab(.04,.3,1.0,.01,m.team,hull,-1.07,1.25,-.8);
 return{hull,turret:null}}

// jet fighters (falcon raptor, dragon MiG); nose points +z
function jetFighter(team,{pal='dark',twin=true,k=1}={}){const m=palette(pal,team);const hull=new T.Group(),b=new T.Group();hull.add(b);b.position.y=-.5;b.scale.setScalar(k);
 profile([[-3.7,.3],[-3.7,.85],[-1.2,1.0],[2.0,.98],[3.3,.72],[4.4,.5],[3.4,.3],[.2,.12]],.95,m.camo,b);
 profile([[1.1,.95],[1.55,1.35],[2.6,1.2],[3.1,.9]],.56,m.glass,b);
 plan([[0,1.6],[3.7,-1.2],[3.7,-1.9],[.6,-1.5],[-.6,-1.5],[-3.7,-1.9],[-3.7,-1.2]],.12,m.camo,b,.5);
 plan([[0,-2.6],[1.8,-3.6],[1.8,-4.0],[0,-3.6],[-1.8,-4.0],[-1.8,-3.6]],.08,m.camo,b,.6);
 const fin=(x,rz)=>{const g=new T.Group();g.position.x=x;g.rotation.z=rz;b.add(g);profile([[-2.3,.9],[-3.3,2.3],[-3.85,2.3],[-3.75,.9]],.1,m.camo,g);slab(.04,.3,.6,.01,m.team,g,.06,1.6,-3.2);slab(.04,.3,.6,.01,m.team,g,-.06,1.6,-3.2)};if(twin){fin(.45,-.28);fin(-.45,.28)}else fin(0,0);
 for(const s of [-1,1]){box(.36,.42,1.4,m.camo,b,s*.62,.55,.9);cyl(.24,.2,.5,m.dark,b,s*(twin?.32:0)*(twin?1:0)+(twin?0:0),.55,-3.85,'z',12);for(const x of [1.6,2.6])cyl(.07,.07,1.1,m.metal,b,s*x,.38,-.6,'z',8)}
 if(!twin)cyl(.3,.24,.5,m.dark,b,0,.55,-3.85,'z',12);return{hull,turret:null}}
// ---------------------------------------------------------------------------
// Buildings — one visual language per faction
// ---------------------------------------------------------------------------
function texCanvas(w,h,fn,rep=1){const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(rep,rep);t.anisotropy=4;return t}
function grain(g,w,h,amt){const d=g.getImageData(0,0,w,h),p=d.data;for(let i=0;i<p.length;i+=4){const n=(rnd()-.5)*amt;p[i]+=n;p[i+1]+=n;p[i+2]+=n*.9}g.putImageData(d,0,0)}
const concreteT=(base,seam='#0000002a')=>texCanvas(128,128,(g,w,h)=>{g.fillStyle=base;g.fillRect(0,0,w,h);grain(g,w,h,20);g.strokeStyle=seam;g.lineWidth=2;g.strokeRect(1,1,w-2,h-2);g.beginPath();g.moveTo(0,h/2);g.lineTo(w,h/2);g.moveTo(w/2,0);g.lineTo(w/2,h);g.stroke();for(let i=0;i<5;i++){g.fillStyle='rgba(70,50,30,.07)';g.fillRect(rnd()*w,h*.55+rnd()*h*.3,6+rnd()*14,18+rnd()*20)}});
const adobeT=base=>texCanvas(128,128,(g,w,h)=>{g.fillStyle=base;g.fillRect(0,0,w,h);for(let y=0;y<h;y+=16)for(let x=-((y/16)%2)*12;x<w;x+=24){g.fillStyle=`rgba(${120+rnd()*40|0},${90+rnd()*30|0},${60+rnd()*20|0},.18)`;g.fillRect(x+1,y+1,22,14);g.strokeStyle='#5a432a33';g.strokeRect(x+.5,y+.5,23,15)}grain(g,w,h,26);for(let i=0;i<4;i++){g.fillStyle='rgba(255,240,210,.08)';g.beginPath();g.ellipse(rnd()*w,rnd()*h,20,8,0,0,7);g.fill()}});
const tileT=base=>texCanvas(64,64,(g,w,h)=>{g.fillStyle=base;g.fillRect(0,0,w,h);for(let x=0;x<w;x+=8){g.fillStyle='#00000030';g.fillRect(x,0,2,h);g.fillStyle='#ffffff18';g.fillRect(x+3,0,2,h)}for(let y=0;y<h;y+=16){g.fillStyle='#00000022';g.fillRect(0,y,w,2)}grain(g,w,h,14)},2);
const corrugT=base=>texCanvas(64,64,(g,w,h)=>{g.fillStyle=base;g.fillRect(0,0,w,h);for(let x=0;x<w;x+=6){g.fillStyle='#00000035';g.fillRect(x,0,2,h);g.fillStyle='#ffffff20';g.fillRect(x+3,0,1,h)}for(let i=0;i<7;i++){g.fillStyle='rgba(120,52,20,.32)';g.beginPath();g.ellipse(rnd()*w,rnd()*h,4+rnd()*8,8+rnd()*14,0,0,7);g.fill()}grain(g,w,h,18)},2);
const stripeT=(a,b)=>texCanvas(64,64,(g,w,h)=>{g.fillStyle=a;g.fillRect(0,0,w,h);g.fillStyle=b;for(let i=-64;i<128;i+=16){g.beginPath();g.moveTo(i,0);g.lineTo(i+8,0);g.lineTo(i+8-64,64);g.lineTo(i-64,64);g.closePath();g.fill()}},2);
const padT=(col)=>texCanvas(128,128,(g,w,h)=>{g.fillStyle='#55554e';g.fillRect(0,0,w,h);grain(g,w,h,16);g.strokeStyle=col;g.lineWidth=6;g.beginPath();g.arc(64,64,52,0,7);g.stroke();g.fillStyle=col;g.fillRect(40,34,10,60);g.fillRect(78,34,10,60);g.fillRect(40,58,48,10)});
const screenT=()=>texCanvas(128,64,(g,w,h)=>{g.fillStyle='#4a0d0a';g.fillRect(0,0,w,h);g.fillStyle='#e8b84a';const st=(cx,cy,R)=>{g.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?R*.42:R;g.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r)}g.closePath();g.fill()};st(30,32,20);g.fillStyle='#f1d9a0';for(let i=0;i<4;i++)g.fillRect(60,14+i*11,50-i*8,5)});
function bmat(f,team){const tc=tcol(team),th=thex(team),M=o=>new T.MeshStandardMaterial({roughness:.86,metalness:.04,...o});
 const c={glass:M({color:0x22333c,roughness:.12,metalness:.55}),dark:M({color:0x27261f,roughness:.92}),metal:M({color:0x6d6e68,roughness:.42,metalness:.62}),steel:M({color:0x8d918c,roughness:.35,metalness:.7}),team:M({color:tc,emissive:tc,emissiveIntensity:.28,roughness:.55}),lamp:M({color:0xfff1c8,emissive:0xffd88a,emissiveIntensity:.9}),hazard:M({map:stripeT('#d6ac34','#25221c')}),sandbag:M({color:0xa08b62,roughness:1}),crate:M({color:0x8d6c42,roughness:.9}),tarp:M({color:0x6e6a48,roughness:1,side:T.DoubleSide}),wood:M({color:0x7a5a36,roughness:.95}),dirt:M({color:0xa58a5e,roughness:1})};
 const T0=(o)=>{if(o.map&&th)tintTex(o.map,th,.42);return o};const acc=th?M({color:tc,emissive:tc,emissiveIntensity:.5,roughness:.4}):null;
 if(f==='falcon')return{...c,f,wall:M({map:concreteT('#cdc6b3')}),wall2:M({map:concreteT('#a9a594')}),roof:M(T0({map:concreteT('#62707a','#0003'),roughness:.65})),trim:M({color:0x3d5a6c,roughness:.5,metalness:.35}),accent:acc||M({color:0x5fb4ea,emissive:0x2f86c4,emissiveIntensity:.7,roughness:.3}),floor:M({map:concreteT('#6f6c62','#0003')})};
 if(f==='dragon')return{...c,f,wall:M({map:concreteT('#858a6c')}),wall2:M({map:concreteT('#656b53')}),roof:M(T0({map:tileT('#86281f'),roughness:.55})),trim:M({color:0xcfa33c,roughness:.35,metalness:.65}),accent:acc||M({color:0xd9473a,emissive:0x7a1a10,emissiveIntensity:.45}),floor:M({map:concreteT('#605e4e','#0003')}),screen:M({map:screenT(),emissive:0x401010,emissiveIntensity:.5,emissiveMap:screenT()})};
 return{...c,f,wall:M({map:adobeT('#c8a777')}),wall2:M({map:adobeT('#ad8e62')}),roof:M(T0({map:corrugT('#8f7254'),metalness:.3,roughness:.7})),trim:M({color:0x6e5236}),accent:acc||M({color:0x9a4f2a,roughness:.7}),floor:M({map:adobeT('#b89e72')})}}
const G=(parent,x=0,y=0,z=0,ry=0)=>{const g=new T.Group();g.position.set(x,y,z);g.rotation.y=ry;parent.add(g);return g};
// gable roof with its ridge along x
function gable(w,d,h,mat,p,x,y,z,over=.35){const g=G(p,x,y,z);profile([[-d/2-over,0],[d/2+over,0],[0,h]],w+over*2,mat,g,0,.04);return g}
// curved "pagoda" roof with upturned eaves
function hip(w,d,h,mat,p,x,y,z){const g=new T.ConeGeometry(Math.SQRT1_2,1,4,1);g.rotateY(Math.PI/4);g.translate(0,.5,0);const m=mesh(g,mat,p,x,y,z);m.scale.set(w,h,d);return m}
function pagoda(w,d,h,mat,trim,p,x,y,z){const g=G(p,x,y,z);slab(w+1.5,.16,d+1.5,.05,mat,g,0,0,0);box(w+1.55,.08,.1,trim,g,0,.16,d/2+.75);box(w+1.55,.08,.1,trim,g,0,.16,-d/2-.75);hip(w+.7,d+.7,h,mat,g,0,.14,0);box(Math.max(.2,w-d+.4),.14,.14,trim,g,0,h+.1,0);for(const sx of [-1,1])for(const sz of [-1,1]){const t=box(.16,.55,.16,trim,g,sx*(w/2+.72),.32,sz*(d/2+.72));t.rotation.set(sz*.6,0,-sx*.6)}mesh(new T.SphereGeometry(.2,10,8),trim,g,0,h+.25,0);return g}
function roofKit(m,p,w,d,x,y,z,n=3){const g=G(p,x,y,z);for(const s of [-1,1]){box(w,.32,.16,m.wall2,g,0,.16,s*(d/2-.08));box(.16,.32,d,m.wall2,g,s*(w/2-.08),.16,0)}for(let i=0;i<n;i++){const ax=-w/2+1+(i+.5)*(w-2)/n,az=(i%2?.25:-.25)*d;slab(.9,.5,.8,.04,m.metal,g,ax,0,az);cyl(.28,.28,.06,m.dark,g,ax,.52,az,'y',12)}cyl(.12,.12,.7,m.metal,g,w/2-.7,.35,d/2-.7,'y',8);cyl(.12,.12,.5,m.metal,g,-w/2+.6,.25,-d/2+.6,'y',8);return g}
function dome(r,mat,p,x,y,z,sy=1){const m=mesh(new T.SphereGeometry(r,22,12,0,Math.PI*2,0,Math.PI/2),mat,p,x,y,z);m.scale.y=sy;return m}
function dish(r,mat,p,x,y,z,tilt=.9){const g=G(p,x,y,z);const d=mesh(new T.SphereGeometry(r,20,8,0,Math.PI*2,0,.85),mat,g,0,0,0);d.material=mat.clone();d.material.side=T.DoubleSide;d.rotation.x=Math.PI+tilt;cyl(.05,.05,r*.9,mat,g,0,0,0,'z',6).rotation.x=tilt;return g}
function mast(h,mat,p,x,z,y0=0){const g=G(p,x,y0,z);cyl(.07,.1,h,mat,g,0,h/2,0,'y',6);for(let i=1;i<4;i++)box(.7-i*.12,.05,.05,mat,g,0,h*i/4,0);cyl(.02,.02,.8,mat,g,.2,h+.3,0,'y',4);return g}
function flag(m,p,x,z,h=4.2,y0=0){const g=G(p,x,y0,z);cyl(.05,.06,h,m.steel,g,0,h/2,0,'y',8);const f=box(1.4,.8,.03,m.team,g,.72,h-.5,0);f.rotation.y=-.3;return g}
function sandbags(m,p,pts,y=0){for(let i=0;i<pts.length-1;i++){const[a,b]=[pts[i],pts[i+1]],L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.round(L/.62)),ang=Math.atan2(b[0]-a[0],b[1]-a[1]);for(let r=0;r<2;r++)for(let k=0;k<n;k++){const t=(k+(r?.5:0))/n;if(t>1)continue;const s=slab(.6,.26,.36,.1,m.sandbag,p,a[0]+(b[0]-a[0])*t,y+r*.24,a[1]+(b[1]-a[1])*t);s.rotation.y=ang+Math.PI/2}}}
function crates(m,p,x,z,n=4){for(let i=0;i<n;i++){const w=.8+rnd()*.4;const c=slab(w,w*.8,w,.04,rnd()<.5?m.crate:m.tarp,p,x+(i%2)*1.05-.5,(i>=2?.85:0),z+((i>>1)%2)*1.0-.5);c.rotation.y=rnd()*.4}}
function door(m,p,w,h,x,z,y0=0){box(w,h,.12,m.dark,p,x,y0+h/2,z);box(w+.3,.18,.16,m.hazard,p,x,y0+h+.09,z);for(const s of [-1,1])box(.15,h,.16,m.hazard,p,x+s*(w/2+.075),y0+h/2,z)}
function windows(m,p,w,y,z,n,x0=0,h=.45){for(let i=0;i<n;i++)box(w/n*.7,h,.06,m.glass,p,x0-w/2+w/n*(i+.5),y,z)}
function pad(m,p,w,d,h=.16){return slab(w,h,d,.05,m.floor,p,0,0,0)}
function hyper(r,h,mat,p,x,z){const pts=[];for(let i=0;i<=12;i++){const t=i/12;pts.push(new T.Vector2(r*(1-.34*Math.sin(Math.PI*t*.92))+.02,h*t))}const g=new T.LatheGeometry(pts,26);const mm=mat.clone();mm.side=T.DoubleSide;return mesh(g,mm,p,x,0,z)}
function star(R,mat,p,x,y,z){const sh=new T.Shape();for(let i=0;i<10;i++){const a=Math.PI/2+i*Math.PI/5,r=i%2?R*.42:R;i?sh.lineTo(Math.cos(a)*r,Math.sin(a)*r):sh.moveTo(Math.cos(a)*r,Math.sin(a)*r)}return mesh(new T.ExtrudeGeometry(sh,{depth:.06,bevelEnabled:false}),mat,p,x,y,z)}
function horn(mat,p,x,y,z,ry){const g=G(p,x,y,z,ry);const c=mesh(new T.CylinderGeometry(.42,.1,.8,14,1,true),mat,g,0,0,.35);c.rotation.x=Math.PI/2;c.material=mat.clone();c.material.side=T.DoubleSide;return g}
function container(col,p,x,y,z,ry=0){const g=G(p,x,y,z,ry);const m=new T.MeshStandardMaterial({map:corrugT(col),roughness:.7,metalness:.3});slab(2.4,1.25,1.25,.03,m,g,0,0,0);return g}

const B={};
// ---------- headquarters
B.hq_falcon=t=>{const m=bmat('falcon',t),h=new T.Group();pad(m,h,11,11);slab(9.4,2.7,7.6,.12,m.wall,h,0,.16,-.4);windows(m,h,8,1.55,3.45,6);slab(6.2,2.3,5.2,.1,m.wall2,h,-.6,2.86,-1.1);windows(m,h,5.4,3.9,1.5,5,-.6);slab(9.6,.18,7.8,.04,m.trim,h,0,2.86,-.4);slab(6.4,.16,5.4,.04,m.roof,h,-.6,5.15,-1.1);roofKit(m,h,6.2,5.2,-.6,5.31,-1.1,2);slab(3.2,.16,1.6,.04,m.roof,h,2.5,3.04,1.6);
 slab(3.2,.16,1.8,.04,m.trim,h,0,2.2,4.1);for(const s of [-1,1])cyl(.1,.1,2.1,m.steel,h,s*1.4,1.15,4.8);door(m,h,1.6,1.7,0,3.42,.16);dish(1.5,m.steel,h,1.6,6.1,-1.6,.8);mast(4.2,m.steel,h,-3.2,-3,5.3);flag(m,h,4.2,4.4);
 for(const [x,z] of [[2.9,1.1],[3.5,-2.6]])slab(.9,.5,.9,.04,m.metal,h,x,2.86,z);box(9.42,.22,.1,m.accent,h,0,2.55,3.42);for(const s of [-1,1])box(.3,.2,.1,m.lamp,h,s*4.2,2.2,3.5);return{hull:h}};
B.hq_dragon=t=>{const m=bmat('dragon',t),h=new T.Group();pad(m,h,11,11);slab(10,1.0,9,.1,m.wall2,h,0,.12,-.2);slab(8,2.5,6,.1,m.wall,h,0,1.1,-.6);for(let i=0;i<6;i++)cyl(.18,.18,2.5,m.accent,h,-3.4+i*1.36,2.35,2.6,'y',10);
 pagoda(8,6.4,1.5,m.roof,m.trim,h,0,3.6,-.6);slab(3.2,1.8,3,.08,m.wall,h,0,4.9,-1.0);pagoda(3.4,3.4,1.1,m.roof,m.trim,h,0,6.65,-1.0);star(.7,m.trim,h,0,2.3,2.48);door(m,h,1.8,1.6,0,2.45,1.12);
 for(const s of [-1,1]){const b=box(.9,1.8,.04,m.accent,h,s*4.3,2.1,3.0);flag(m,h,s*4.6,3.9,4.6)}mast(3,m.metal,h,2.6,-3.2,3.6);horn(m.metal,h,2.6,6.4,-3.2,.6);horn(m.metal,h,2.6,6.4,-3.2,-1.4);return{hull:h}};
B.hq_sand=t=>{const m=bmat('sand',t),h=new T.Group();
 const W=(w,d,x,z)=>slab(w,1.25,d,.12,m.wall2,h,x,.1,z);W(10,.6,0,-4.7);W(.6,9.4,-4.7,0);W(.6,9.4,4.7,0);W(3.6,.6,-3.2,4.7);W(3.6,.6,3.2,4.7);
 slab(6,2.7,4.6,.2,m.wall,h,-.6,.1,-1.4);dome(1.9,m.wall,h,-.6,2.8,-1.4,.85);slab(2.4,1.6,2.4,.15,m.wall,h,2.6,2.8,-2.1);slab(2.8,.12,2.8,.03,m.roof,h,2.6,4.4,-2.1);
 for(let i=0;i<3;i++)box(.45,.6,.06,m.dark,h,-2.4+i*1.6,2.0,.92);door(m,h,1.2,1.5,-.6,.92,.1);const aw=slab(4.2,.06,1.8,.02,m.tarp,h,-.6,2.15,1.8);aw.rotation.x=-.25;for(const s of [-1,1])cyl(.06,.06,2.1,m.wood,h,-.6+s*1.9,1.05,2.6);
 sandbags(m,h,[[-1.6,4.1],[-1.6,5.4]]);sandbags(m,h,[[1.6,4.1],[1.6,5.4]]);mast(3.6,m.metal,h,2.6,-2.1,4.5);flag(m,h,-3.8,-3.8,4.2,1.35);crates(m,h,3.2,2.4,3);return{hull:h}};
// ---------- power plants
B.power_falcon=t=>{const m=bmat('falcon',t),h=new T.Group();pad(m,h,7.6,7.6);slab(6.4,1.1,6.4,.1,m.wall2,h,0,.16,0);cyl(1.9,2.1,1.2,m.wall,h,0,1.86,0,'y',24);dome(1.75,m.accent,h,0,2.45,0,.95);
 for(let i=0;i<3;i++){const tr=mesh(new T.TorusGeometry(2.0+i*.02,.09,8,40),m.steel,h,0,2.6+i*.45,0);tr.rotation.x=Math.PI/2;tr.scale.set(1-i*.12,1-i*.12,1)}
 for(const s of [-1,1])for(let i=0;i<6;i++)box(.08,.8,1.6,m.metal,h,s*(2.55+0*i),1.7,-2.2+i*.88).position.x=s*2.75;for(const s of [-1,1])cyl(.22,.22,5.6,m.steel,h,s*2.0,1.45,0,'z',10);box(6.42,.16,.08,m.accent,h,0,1.1,3.2);door(m,h,1.2,.9,0,3.21,.16);return{hull:h}};
B.power_dragon=t=>{const m=bmat('dragon',t),h=new T.Group();pad(m,h,7.8,7.8);for(const x of [-1.75,1.75]){hyper(1.5,4.6,m.wall,h,x,-1.4);const r=mesh(new T.TorusGeometry(1.08,.1,6,26),m.accent,h,x,4.15,-1.4);r.rotation.x=Math.PI/2}
 slab(5.4,1.4,2.6,.1,m.wall2,h,0,.16,1.9);roofKit(m,h,5.4,2.6,0,1.56,1.9,1);dome(.9,m.metal,h,-1.3,1.56,1.9,.7);for(let i=0;i<3;i++)box(.5,.6,.06,m.glass,h,.6+i*.8,.9,3.22);cyl(.18,.18,3.5,m.steel,h,0,1.2,.6,'x',10);box(5.42,.18,.08,m.hazard,h,0,1.45,3.21);star(.32,m.trim,h,-1.7,.95,3.2);return{hull:h}};
// ---------- supply centres
B.refinery_falcon=t=>{const m=bmat('falcon',t),h=new T.Group();pad(m,h,10.5,10.5);const hg=G(h,-1.7,0,-.6);const roof=mesh(new T.CylinderGeometry(2.9,2.9,7.4,24,1,false,Math.PI/2,Math.PI),m.roof,hg,0,.16,0);roof.rotation.set(Math.PI/2,0,0);roof.material=m.roof.clone();roof.material.side=T.DoubleSide;
 const front=mesh(new T.CircleGeometry(2.9,24,0,Math.PI),m.wall,hg,0,.17,3.68);door(m,hg,3.2,2.1,0,3.72,.16);slab(5.8,.6,7.4,.05,m.wall2,hg,0,.16,0);
 slab(3.6,1.6,4.2,.08,m.wall,h,3.2,.16,1.6);roofKit(m,h,3.6,4.2,3.2,1.76,1.6,1);box(3.62,.16,4.22,m.hazard,h,3.2,.9,1.6);crates(m,h,3.2,-2.8,4);const cr=G(h,4.4,0,-1.2);cyl(.12,.15,4.2,m.steel,cr,0,2.1,0);const arm=box(3.6,.18,.18,m.hazard,cr,-1.3,4.1,0);cyl(.02,.02,1.4,m.dark,cr,-2.8,3.4,0);box(9.9,.16,.08,m.accent,h,0,.4,5.2);return{hull:h}};
B.refinery_dragon=t=>{const m=bmat('dragon',t),h=new T.Group();pad(m,h,10.5,10.5);slab(7.4,2.4,5.2,.1,m.wall,h,-1.2,.16,-1.4);gable(7.4,5.2,1.5,m.roof,h,-1.2,2.56,-1.4);for(let i=0;i<2;i++)door(m,h,1.9,1.8,-3.0+i*3.4,1.25,.16);star(.45,m.trim,h,-1.2,2.0,1.22);
 const cv=box(1.0,.12,4.6,m.metal,h,3.4,1.6,1.4);cv.rotation.x=.42;for(const s of [-1,1])cyl(.06,.06,2.2,m.steel,h,3.4+s*.45,.9,2.6);crates(m,h,3.0,-3.0,4);crates(m,h,-3.5,3.3,2);mast(4,m.metal,h,4.2,-3.6,.16);return{hull:h}};
B.refinery_sand=t=>{const m=bmat('sand',t),h=new T.Group();const W=(w,d,x,z)=>slab(w,1.0,d,.12,m.wall2,h,x,.1,z);W(9.6,.5,0,-4.6);W(.5,8.8,-4.6,0);W(.5,4,4.6,-2.4);
 for(const [x,z] of [[-3.4,-3.4],[2.6,-3.4],[-3.4,1.4],[2.6,1.4]])cyl(.08,.08,3.1,m.wood,h,x,1.6,z);gable(6.4,5.2,.9,m.tarp,h,-.4,3.1,-1.0,.2);crates(m,h,-1.8,-1.6,4);crates(m,h,1.4,-2.4,3);
 for(let i=0;i<5;i++)cyl(.36,.36,1.0,i%2?m.accent:m.metal,h,-3.0+i*.8,.6,3.4,'y',12);sandbags(m,h,[[3.0,1.5],[4.4,3.6],[2.2,4.4]]);return{hull:h}};
// ---------- barracks
B.barracks_falcon=t=>{const m=bmat('falcon',t),h=new T.Group();pad(m,h,9.6,9.6);slab(7.6,2.5,5.2,.1,m.wall,h,0,.16,-1.4);slab(7.8,.16,5.4,.04,m.roof,h,0,2.66,-1.4);roofKit(m,h,7.6,5.2,-.4,2.82,-1.4,2);windows(m,h,6.6,1.7,1.24,6);door(m,h,1.5,1.6,0,1.24,.16);slab(2.6,.14,1.4,.04,m.trim,h,0,1.95,1.9);
 slab(2.4,1.4,2.2,.06,m.wall2,h,2.6,2.82,-2.0);for(let i=0;i<3;i++)slab(.7,.4,.7,.03,m.metal,h,-2.6+i*1.1,2.82,-1.8);flag(m,h,-3.6,2.2);sandbags(m,h,[[-3.2,3.6],[-1.2,4.2],[1.2,4.2],[3.2,3.6]]);box(7.62,.16,.08,m.accent,h,0,2.4,1.24);return{hull:h}};
B.barracks_dragon=t=>{const m=bmat('dragon',t),h=new T.Group();pad(m,h,9.6,9.6);slab(7.4,2.1,4.4,.1,m.wall,h,-.4,.16,-1.4);pagoda(7.4,4.4,1.2,m.roof,m.trim,h,-.4,2.26,-1.4);for(let i=0;i<5;i++)cyl(.15,.15,2.1,m.accent,h,-3.4+i*1.5,1.2,.95,'y',10);door(m,h,1.4,1.5,-.4,.82,.16);
 const tw=G(h,3.6,0,2.4);for(const [x,z] of [[-.6,-.6],[.6,-.6],[-.6,.6],[.6,.6]])cyl(.07,.07,3.6,m.wood,tw,x,1.8,z);slab(1.6,.12,1.6,.03,m.wood,tw,0,3.0,0);pagoda(1.4,1.4,.6,m.roof,m.trim,tw,0,3.8,0);for(const s of [-1,1])flag(m,h,s*2.4,3.4,3.6);return{hull:h}};
B.barracks_sand=t=>{const m=bmat('sand',t),h=new T.Group();for(const [x,z,r] of [[-2.2,-1.6,2.2],[2.4,-2.2,1.8]]){const c=mesh(new T.ConeGeometry(r,2.6,4),m.tarp,h,x,1.4,z);c.rotation.y=Math.PI/4;box(.8,1.0,.05,m.dark,h,x,.6,z+r*.71)}
 slab(3.2,2.0,2.6,.15,m.wall,h,-1.6,.1,2.2);slab(3.4,.1,2.8,.02,m.roof,h,-1.6,2.1,2.2);box(.9,1.3,.06,m.dark,h,-1.6,.75,3.52);for(let i=0;i<3;i++){const d=G(h,1.6+i*1.1,0,2.6);cyl(.06,.06,1.6,m.wood,d,0,.8,0);box(.6,.07,.07,m.wood,d,0,1.2,0);mesh(new T.SphereGeometry(.18,10,8),m.sandbag,d,0,1.6,0)}sandbags(m,h,[[3.6,1.0],[4.2,4.2]]);flag(m,h,4.0,-3.8,3.8);return{hull:h}};
// ---------- war factories
B.factory_falcon=t=>{const m=bmat('falcon',t),h=new T.Group();pad(m,h,12.6,12.6);slab(10.6,3.6,8.4,.12,m.wall,h,0,.16,-1.2);for(let i=0;i<4;i++){const g=G(h,0,3.76,-4.6+i*2.1);profile([[0,0],[1.5,0],[0,1.3]],10.6,m.roof,g,0,.04);box(10.4,.9,.05,m.glass,g,0,.55,.02).rotation.x=0}
 door(m,h,5.0,2.9,-.8,3.02,.16);for(const s of [-1,1])box(.4,4.4,.4,m.trim,h,-.8+s*3.2,2.36,3.6);box(7.2,.4,.4,m.hazard,h,-.8,4.6,3.6);box(.3,.3,.3,m.metal,h,-.8,4.25,3.6);
 slab(2.2,2.4,3.0,.08,m.wall2,h,4.4,.16,1.8);roofKit(m,h,2.2,3.0,4.4,2.56,1.8,1);for(const x of [-3.6,-1.8])cyl(.32,.36,1.4,m.metal,h,x,4.7,-2.0);box(10.62,.2,.08,m.accent,h,0,3.3,3.02);windows(m,h,2.0,1.6,3.32,2,4.4);return{hull:h}};
B.factory_dragon=t=>{const m=bmat('dragon',t),h=new T.Group();pad(m,h,12.6,12.6);slab(10.6,3.4,8.2,.12,m.wall2,h,0,.16,-1.2);gable(10.6,8.2,2.2,m.roof,h,0,3.56,-1.2,.5);door(m,h,4.8,2.7,-1,2.92,.16);star(.6,m.trim,h,3.4,2.4,2.94);
 for(const x of [-3.8,3.8]){cyl(.55,.65,6.6,m.wall,h,x,3.3,-4.2,'y',14);for(const y of [5.4,6.2])cyl(.58,.58,.3,m.accent,h,x,y,-4.2,'y',14)}for(const s of [-1,1])slab(1.2,4.0,1.2,.06,m.wall,h,s*5.0,.16,2.6);box(10.62,.25,.08,m.hazard,h,0,3.3,2.92);return{hull:h}};
B.factory_sand=t=>{const m=bmat('sand',t),h=new T.Group();const sh=G(h,-1.6,0,-1.4);slab(7.6,2.8,6.4,.06,m.roof,sh,0,.1,0);gable(7.6,6.4,1.3,m.roof,sh,0,2.9,0,.4);box(4,2.3,.08,m.dark,sh,0,1.25,3.22);box(4.3,.2,.12,m.hazard,sh,0,2.5,3.24);
 container('#7a3a24',h,4.2,.1,-3.2,.1);container('#3e5a40',h,4.3,1.35,-3.1,-.05);container('#8a7a30',h,4.4,.1,-.6,1.6);crates(m,h,3.6,3.4,4);for(let i=0;i<6;i++){const s2=slab(.6+rnd(),.3+rnd()*.4,.5+rnd(),.05,i%2?m.metal:m.accent,h,-4+rnd()*3,.1,3.6+rnd()*1.2);s2.rotation.y=rnd()*3}
 const cr=G(h,1.4,0,-4.8);cyl(.1,.12,5.2,m.metal,cr,0,2.6,0);box(3.2,.15,.15,m.metal,cr,-1.4,5.1,0);flag(m,h,-5.4,4.8,4);return{hull:h}};
// ---------- defence towers (turret = rotating head, baked in 32 directions)
B.turret_falcon=t=>{const m=bmat('falcon',t),h=new T.Group(),tu=new T.Group();cyl(2.1,2.3,.3,m.floor,h,0,.15,0,'y',8);cyl(1.55,1.8,1.3,m.wall,h,0,.95,0,'y',8);cyl(1.6,1.6,.14,m.accent,h,0,1.55,0,'y',8);
 slab(1.9,.95,2.1,.12,m.trim,tu,0,0,-.2);for(const s of [-1,1]){cyl(.1,.11,2.4,m.gun,tu,s*.38,.5,1.8,'z',10);cyl(.15,.15,.4,m.dark,tu,s*.38,.5,1.0,'z',10)}box(.5,.32,.4,m.glass,tu,.55,1.0,-.6);slab(.06,.3,1.2,.01,m.team,tu,.97,.4,-.3);slab(.06,.3,1.2,.01,m.team,tu,-.97,.4,-.3);tu.position.y=1.62;return{hull:h,turret:tu}};
B.turret_dragon=t=>{const m=bmat('dragon',t),h=new T.Group(),tu=new T.Group();cyl(2.1,2.3,.3,m.floor,h,0,.15,0,'y',10);dome(1.8,m.wall2,h,0,.3,0,.55);
 cyl(.75,.85,.7,m.wall,tu,0,.35,0,'y',14);for(let i=0;i<6;i++){const a=i/6*Math.PI*2;cyl(.05,.05,2.2,m.gun,tu,Math.cos(a)*.15,.45+Math.sin(a)*.15,1.6,'z',6)}cyl(.25,.25,.5,m.dark,tu,0,.45,.6,'z');cyl(.24,.24,.1,m.dark,tu,0,.45,2.7,'z');box(.5,.4,.6,m.accent,tu,-.7,.5,-.3);tu.position.y=1.1;return{hull:h,turret:tu}};
B.turret_sand=t=>{const m=bmat('sand',t),h=new T.Group(),tu=new T.Group();const pts=[];for(let i=0;i<=10;i++){const a=i/10*Math.PI*2*.85+Math.PI*.6;pts.push([Math.cos(a)*1.85,Math.sin(a)*1.85])}sandbags(m,h,pts);
 cyl(.12,.15,1.0,m.metal,tu,0,-.4,0);const pod=G(tu,0,.3,0);pod.rotation.x=-.25;slab(1.4,.85,1.6,.05,m.accent,pod,0,0,0);for(let i=0;i<6;i++)cyl(.12,.12,.06,m.dark,pod,-.42+(i%3)*.42,.2+Math.floor(i/3)*.38,.81,'z',8);slab(.04,.25,1.0,.01,m.team,pod,.72,.3,0);tu.position.y=1.0;return{hull:h,turret:tu}};
// ---------- intelligence / propaganda / palace (spin = animated part)
B.radar_falcon=t=>{const m=bmat('falcon',t),h=new T.Group();pad(m,h,8.2,8.2);slab(6.6,2.3,4.6,.1,m.wall,h,0,.16,-.6);windows(m,h,5.6,1.55,1.72,5);slab(6.8,.16,4.8,.04,m.roof,h,0,2.46,-.6);roofKit(m,h,6.6,4.6,0,2.62,-.6,1);door(m,h,1.3,1.5,0,1.72,.16);box(6.62,.16,.08,m.accent,h,0,2.2,1.72);
 const tw=G(h,1.6,2.62,-1.4);for(const [x,z] of [[-.4,-.4],[.4,-.4],[-.4,.4],[.4,.4]])cyl(.06,.08,2.6,m.steel,tw,x*.8,1.3,z*.8,'y',6);const spin=G(tw,0,2.7,0);const d=dish(1.5,m.steel,spin,0,.3,0,1.15);cyl(.2,.2,.35,m.metal,spin,0,0,0);mast(2.4,m.steel,h,-2.4,-2.2,2.62);return{hull:h,spin}};
B.radar_dragon=t=>{const m=bmat('dragon',t),h=new T.Group();pad(m,h,8.2,8.2);slab(6.4,2.2,4.4,.1,m.wall,h,0,.16,-1);pagoda(6.4,4.4,1.0,m.roof,m.trim,h,0,2.36,-1);const sc=box(3.6,1.9,.12,m.screen,h,-.9,1.35,1.4);slab(4,.2,.5,.04,m.trim,h,-.9,.16,1.35);
 const tw=G(h,2.4,0,1.8);cyl(.1,.12,4.4,m.metal,tw,0,2.2,0);for(const r of [0,1.6,3.2,4.8])horn(m.metal,tw,0,3.8,0,r);const spin=G(h,1.4,3.6,-2.4);cyl(.08,.08,1,m.metal,h,1.4,3.1,-2.4);dish(1.1,m.steel,spin,0,.2,0,1.1);return{hull:h,spin}};
B.radar_sand=t=>{const m=bmat('sand',t),h=new T.Group();slab(6.6,2.5,4.4,.18,m.wall,h,0,.1,-1.2);for(let i=0;i<5;i++)cyl(.2,.24,2.4,m.wall2,h,-2.6+i*1.3,1.3,1.4,'y',12);slab(7,.25,1.2,.05,m.wall2,h,0,2.5,1.4);
 dome(1.6,new T.MeshStandardMaterial({color:0xc8a046,metalness:.6,roughness:.35}),h,0,2.6,-1.2,.9);for(const s of [-1,1]){cyl(.3,.34,3.8,m.wall,h,s*2.9,1.9,-3.0,'y',10);dome(.36,m.wall,h,s*2.9,3.8,-3.0)}const spin=G(h,-2.0,2.7,-.6);cyl(.06,.06,1.1,m.metal,spin,0,.55,0);dish(.75,m.steel,spin,0,1.1,0,1.1);crates(m,h,3.0,3.0,2);return{hull:h,spin}};
// ---------- superweapons
B.silo_falcon=t=>{const m=bmat('falcon',t),h=new T.Group();pad(m,h,12,12);cyl(4.4,4.8,1.3,m.wall2,h,0,.8,0,'y',8);cyl(4.45,4.45,.16,m.accent,h,0,1.5,0,'y',8);cyl(1.5,2.0,5.2,m.steel,h,0,4.1,0,'y',16);
 for(let i=0;i<3;i++){const r=mesh(new T.TorusGeometry(1.9-i*.25,.14,8,32),m.accent,h,0,3.2+i*1.5,0);r.rotation.x=Math.PI/2}for(let i=0;i<4;i++){const a=i/4*Math.PI*2+Math.PI/4;const st=box(.3,5,.3,m.trim,h,Math.cos(a)*2.7,3.4,Math.sin(a)*2.7);st.rotation.set(Math.sin(a)*.32,0,-Math.cos(a)*.32)}
 const top=G(h,0,6.9,0);{const bw=mesh(new T.SphereGeometry(2.0,24,10,0,Math.PI*2,0,1.0),m.steel.clone(),top,0,2,0);bw.rotation.x=Math.PI;bw.material.side=T.DoubleSide}mesh(new T.SphereGeometry(.55,16,10),m.accent,top,0,.7,0);door(m,h,1.6,1.1,0,4.3,.16);return{hull:h}};
B.silo_dragon=t=>{const m=bmat('dragon',t),h=new T.Group();pad(m,h,12,12);slab(9.4,1.3,9.4,.15,m.wall2,h,0,.16,0);for(const s of [-1,1]){const d=slab(3.3,.3,6.4,.05,m.metal,h,s*1.68,1.46,0);box(3.3,.05,6.4,m.hazard,h,s*1.68,1.78,0).scale.set(.98,1,.98)}
 slab(1.2,.3,6.6,.04,m.accent,h,0,1.4,0);for(const [x,z] of [[-4.2,-4.2],[4.2,-4.2],[-4.2,4.2],[4.2,4.2]])box(.4,.3,.4,m.lamp,h,x,1.6,z);slab(2.4,1.8,2,.08,m.wall,h,3.4,1.46,-3.2);box(.8,.5,.06,m.glass,h,3.4,2.6,-2.18);star(.5,m.trim,h,0,1.85,4.75);return{hull:h}};
B.silo_sand=t=>{const m=bmat('sand',t),h=new T.Group();slab(9,.3,6,.08,m.floor,h,0,.1,0);const scud=new T.MeshStandardMaterial({color:0x8e9c6a,roughness:.6,metalness:.2}),cone=new T.MeshStandardMaterial({color:0xa83a22,roughness:.5});
 for(let i=0;i<3;i++){const g=G(h,-2.8+i*2.8,.4,0);g.rotation.x=-.55;cyl(.42,.42,5.2,scud,g,0,2.6,0,'y',14);mesh(new T.ConeGeometry(.42,1.2,14),cone,g,0,5.8,0);for(let k=0;k<4;k++){const f=box(.05,.8,.6,scud,g,0,.5,0);f.rotation.y=k*Math.PI/2;f.position.set(Math.sin(k*Math.PI/2)*.45,.5,Math.cos(k*Math.PI/2)*.45)}box(1.0,.25,3.6,m.metal,g,0,1.6,-.6).rotation.x=.3}
 for(const [x,z] of [[-4.4,-2.8],[4.4,-2.8],[-4.4,2.8],[4.4,2.8]])cyl(.07,.07,4.6,m.wood,h,x,2.3,z);const net=slab(9.2,.05,2.6,.02,m.tarp,h,0,4.6,-1.7);net.rotation.x=.12;sandbags(m,h,[[-5,3.6],[-1.4,4.6]]);sandbags(m,h,[[1.4,4.6],[5,3.6]]);return{hull:h}};
// ---------- faction-only structures
B.airfield=t=>{const m=bmat('falcon',t),h=new T.Group();pad(m,h,12.4,12.4);const hp=new T.MeshStandardMaterial({map:padT('#e8e4d4'),roughness:.8});for(const x of [-2.9,2.9]){const c=mesh(new T.CylinderGeometry(2.6,2.6,.06,32),hp,h,x,.2,1.6);c.rotation.y=Math.PI/2}
 for(let i=0;i<8;i++)for(const z of [-1.2,4.4])box(.2,.12,.2,m.lamp,h,-5.6+i*1.6,.22,z);const tw=G(h,-4.4,0,-4.2);cyl(.7,.85,4.2,m.wall,tw,0,2.1,0,'y',10);cyl(1.25,1.0,1.0,m.glass,tw,0,4.7,0,'y',10);cyl(1.35,1.35,.14,m.trim,tw,0,5.25,0,'y',10);mast(1.4,m.steel,tw,0,0,5.3);
 slab(6.4,2.4,3.4,.08,m.wall2,h,1.6,.16,-4.2);gable(6.4,3.4,.9,m.roof,h,1.6,2.56,-4.2);door(m,h,3.6,1.9,1.6,-2.48,.16);const sock=G(h,5.6,0,4.8);cyl(.04,.04,2.6,m.steel,sock,0,1.3,0);mesh(new T.ConeGeometry(.22,.9,10,1,true),m.accent,sock,.5,2.5,0).rotation.z=Math.PI/2;return{hull:h}};
B.airfield_dragon=t=>{const m=bmat('dragon',t),h=new T.Group();pad(m,h,12.4,12.4);const hp=new T.MeshStandardMaterial({map:padT('#e8b84a'),roughness:.8});for(const x of [-2.9,2.9]){const c=mesh(new T.CylinderGeometry(2.6,2.6,.06,32),hp,h,x,.2,1.6);c.rotation.y=Math.PI/2}
 for(let i=0;i<8;i++)for(const z of [-1.2,4.4])box(.2,.12,.2,m.lamp,h,-5.6+i*1.6,.22,z);slab(6.6,2.4,3.4,.08,m.wall2,h,1.4,.16,-4.2);pagoda(6.6,3.4,1.0,m.roof,m.trim,h,1.4,2.56,-4.2);door(m,h,3.6,1.9,1.4,-2.48,.16);star(.4,m.trim,h,3.9,1.6,-2.46);
 const tw=G(h,-4.4,0,-4.2);slab(1.6,3.8,1.6,.06,m.wall,tw,0,0,0);slab(2.1,.9,2.1,.05,m.glass,tw,0,3.8,0);pagoda(1.6,1.6,.6,m.roof,m.trim,tw,0,4.7,0);flag(m,h,5.6,4.8,4);return{hull:h}};
B.speaker=t=>{const m=bmat('dragon',t),h=new T.Group();cyl(1.9,2.1,.3,m.floor,h,0,.15,0,'y',8);slab(1.8,1.1,1.8,.08,m.wall,h,0,.3,0);cyl(.12,.16,5.4,m.metal,h,0,3.6,0);for(let i=0;i<4;i++)horn(m.metal,h,0,5.6,0,i*Math.PI/2+.3);for(let i=0;i<4;i++)horn(m.metal,h,0,4.6,0,i*Math.PI/2+1.1);
 const r=mesh(new T.TorusGeometry(.5,.08,6,20),m.trim,h,0,6.2,0);r.rotation.x=Math.PI/2;box(.04,1.6,.9,m.accent,h,.25,2.6,.45);star(.3,m.trim,h,0,.9,.92);return{hull:h}};
B.tunnel=t=>{const m=bmat('sand',t),h=new T.Group(),tu=new T.Group();dome(2.4,m.dirt,h,0,.05,-.2,.5);const pts=[];for(let i=0;i<=12;i++){const a=i/12*Math.PI*2*.8+Math.PI*.7;pts.push([Math.cos(a)*2.6,Math.sin(a)*2.6-.2])}sandbags(m,h,pts);
 const hole=mesh(new T.CircleGeometry(.9,18,0,Math.PI),m.dark,h,0,.1,1.9);slab(2.2,.3,.4,.04,m.wood,h,0,1.0,1.7);
 cyl(.08,.1,.8,m.metal,tu,0,-.3,0);box(.12,.14,1.0,m.gun,tu,0,.1,.3);cyl(.035,.035,1.0,m.gun,tu,0,.12,1.2,'z',8);box(.8,.5,.06,m.metal,tu,0,.25,.5);tu.position.y=1.35;return{hull:h,turret:tu}};

// ---------------------------------------------------------------------------
// Specs: S = world units covered by a frame (frame width), dirs = baked directions, poses = rows
// ---------------------------------------------------------------------------
const WALK=8,INF_POSES=['idle','aim',...Array.from({length:WALK},(_,i)=>'walk'+i)];
export const MODEL_SPECS={
 builder:{S:7.6,build:t=>dozer(t)},
 harvester:{S:8.6,build:t=>harvester(t)},
 jeep:{S:6.8,build:t=>jeep(t),turret:true},
 tank:{S:9.2,build:t=>tank(t),turret:true},
 heavy:{S:11.4,build:t=>tank(t,{heavy:true}),turret:true},
 artillery:{S:10.6,build:t=>artillery(t),turret:true},
 infantry:{S:3.9,build:t=>soldier(t),poses:INF_POSES,infantry:true},
 rocket:{S:3.9,build:t=>soldier(t,{rocket:true}),poses:INF_POSES,infantry:true},
 // falcon
 crusader:{S:9.2,build:t=>tank(t),turret:true},paladin:{S:9.6,build:t=>tank(t,{k:1.05,pd:true}),turret:true},tomahawk:{S:9.4,build:t=>tomahawk(t),turret:true},
 // dragon
 dozer_cn:{S:7.6,build:t=>dozer(t,'green')},truck_cn:{S:8.6,build:t=>harvester(t,'green')},battlemaster:{S:9.2,build:t=>tank(t,{pal:'green',round:true}),turret:true},
 overlord:{S:11.6,build:t=>tank(t,{heavy:true,pal:'green',k:1.26}),turret:true},gattling:{S:8.6,build:t=>tank(t,{pal:'green',k:.92,gatling:true}),turret:true},
 inferno:{S:9.2,build:t=>tank(t,{pal:'green',k:.95,stub:true}),turret:true},
 soldier_cn:{S:3.9,build:t=>soldier(t,{pal:'cnuni'}),poses:INF_POSES,infantry:true},rocket_cn:{S:3.9,build:t=>soldier(t,{rocket:true,pal:'cnuni'}),poses:INF_POSES,infantry:true},
 // sand
 worker:{S:3.9,build:t=>worker(t),poses:INF_POSES,infantry:true},oldtruck:{S:8.6,build:t=>harvester(t,'rust')},technical:{S:7.2,build:t=>technical(t),turret:true},
 scorpion:{S:8.0,build:t=>tank(t,{pal:'rust',k:.82,pod:true}),turret:true},marauder:{S:9.4,build:t=>tank(t,{pal:'rust',k:1.05}),turret:true},buggy:{S:7.4,build:t=>buggy(t),turret:true},
 soldier_gla:{S:3.9,build:t=>soldier(t,{pal:'glauni',scarf:true}),poses:INF_POSES,infantry:true},rocket_gla:{S:3.9,build:t=>soldier(t,{rocket:true,pal:'glauni',scarf:true}),poses:INF_POSES,infantry:true},
 // faction-only units
 sniper:{S:3.9,build:t=>soldier(t,{sniper:true}),poses:INF_POSES,infantry:true},heli:{S:10.4,build:t=>heli(t),poses:['rot0','rot1','rot2','rot3']},
 hacker:{S:3.9,build:t=>soldier(t,{pal:'cnuni',hacker:true}),poses:[...INF_POSES,'hack'],infantry:true},flametank:{S:9.2,build:t=>tank(t,{pal:'green',k:.95,flame:true}),turret:true},
 raptor:{S:10.4,build:t=>jetFighter(t,{pal:'dark',twin:true})},mig:{S:10.4,build:t=>jetFighter(t,{pal:'olive',twin:false,k:.95})},
 suicide:{S:3.9,build:t=>soldier(t,{pal:'glauni',scarf:true,vest:true}),poses:INF_POSES,infantry:true},toxin:{S:7.8,build:t=>tractor(t)},bombtruck:{S:8.8,build:t=>bombTruck(t)}};
for(const[k,f]of Object.entries(B)){MODEL_SPECS[k]={build:f,building:true,turret:/^(turret|tunnel)/.test(k),frames:/^radar/.test(k)?8:1}}
const BLD=f=>Object.fromEntries(['hq','power','refinery','barracks','factory','turret','radar','silo'].filter(t=>B[t+'_'+f]).map(t=>[t,t+'_'+f]));
export const FACTION_MODELS={
 falcon:{builder:'builder',harvester:'harvester',infantry:'infantry',rocket:'rocket',jeep:'jeep',tank:'crusader',heavy:'paladin',artillery:'tomahawk',sniper:'sniper',heli:'heli',raptor:'raptor',...BLD('falcon'),airfield:'airfield'},
 dragon:{builder:'dozer_cn',harvester:'truck_cn',infantry:'soldier_cn',rocket:'rocket_cn',jeep:'gattling',tank:'battlemaster',heavy:'overlord',artillery:'inferno',hacker:'hacker',flame:'flametank',mig:'mig',...BLD('dragon'),speaker:'speaker',airfield:'airfield_dragon'},
 sand:{builder:'worker',harvester:'oldtruck',infantry:'soldier_gla',rocket:'rocket_gla',jeep:'technical',tank:'scorpion',heavy:'marauder',artillery:'buggy',suicide:'suicide',toxin:'toxin',bombtruck:'bombtruck',...BLD('sand'),tunnel:'tunnel'}};
export const WALK_FRAMES=WALK;

// ---------------------------------------------------------------------------
// Bake every model into sprite atlases: columns = directions, rows = poses
// ---------------------------------------------------------------------------
const CACHE_VER='iron-dunes-models-v5';
function idb(){return new Promise((res,rej)=>{const r=indexedDB.open('iron-dunes',1);r.onupgradeneeded=()=>r.result.createObjectStore('atlas');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
async function cacheGet(key){try{const db=await idb();return await new Promise(res=>{const q=db.transaction('atlas').objectStore('atlas').get(key);q.onsuccess=()=>res(q.result||null);q.onerror=()=>res(null)})}catch(e){return null}}
async function cachePut(key,val){try{const db=await idb();await new Promise(res=>{const tx=db.transaction('atlas','readwrite');tx.objectStore('atlas').put(val,key);tx.oncomplete=res;tx.onerror=()=>{console.warn('idb put error',tx.error);res()};tx.onabort=()=>{console.warn('idb abort',tx.error);res()}})}catch(e){console.warn('idb',e)}}
const toBlob=c=>new Promise(r=>c.toBlob(r,'image/webp',.92));
async function blobToCanvas(b){const bmp=await createImageBitmap(b);const c=document.createElement('canvas');c.width=bmp.width;c.height=bmp.height;c.getContext('2d').drawImage(bmp,0,0);return c}
async function buildMask(entry){const ms=entry.maskSize,dirs=entry.dirs,rows=entry.poses.length,mc=document.createElement('canvas');mc.width=ms*dirs;mc.height=ms*rows;const mg=mc.getContext('2d',{willReadFrequently:true});mg.drawImage(entry.atlas[0],0,0,mc.width,mc.height);if(entry.turretAtlas)mg.drawImage(entry.turretAtlas,0,0,mc.width,ms);const data=mg.getImageData(0,0,mc.width,mc.height).data;entry.mask=new Uint8Array(mc.width*mc.height);for(let i=0;i<entry.mask.length;i++)entry.mask[i]=data[i*4+3];entry.maskW=mc.width}
let R=null;function bakeRenderer(){if(R)return R;const renderer=new T.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.18;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.setPixelRatio(1);
 const scene=new T.Scene();const hemi=new T.HemisphereLight(0xfff4e2,0x6b5634,1.5);const sun=new T.DirectionalLight(0xfff0d6,2.6);sun.position.set(-5,9,5);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);const sc=sun.shadow.camera;sc.left=sc.bottom=-8;sc.right=sc.top=8;sc.near=1;sc.far=30;sun.shadow.bias=-.0015;const fill=new T.DirectionalLight(0xd8e4ff,.55);fill.position.set(6,4,-4);scene.add(hemi,sun,fill);
 const ground=new T.Mesh(new T.PlaneGeometry(80,80),new T.ShadowMaterial({opacity:.32}));ground.rotation.x=-Math.PI/2;ground.position.y=.01;ground.receiveShadow=true;const el=Math.atan2(.85,.62);R={renderer,scene,sun,ground,dirv:new T.Vector3(0,Math.sin(el),Math.cos(el))};return R}
function bakeOne(key,team,touch){const spec=MODEL_SPECS[key],{renderer,scene,dirv}=bakeRenderer();const dirs=spec.infantry?(touch?12:16):(touch?24:32),poses=spec.poses||['base'],F=spec.infantry?(touch?72:88):(touch?128:168),SS=2;
 const CH=8,cw=F*SS;renderer.setSize(cw*CH,cw);renderer.setScissorTest(true);const cam=new T.OrthographicCamera(-spec.S/2,spec.S/2,spec.S/2,-spec.S/2,.1,100);cam.position.copy(dirv).multiplyScalar(40);cam.lookAt(0,0,0);
 const strip=(obj,g,row)=>{for(let c0=0;c0<dirs;c0+=CH){const n=Math.min(CH,dirs-c0);renderer.setScissor(0,0,cw*CH,cw);renderer.setViewport(0,0,cw*CH,cw);renderer.clear();for(let k=0;k<n;k++){obj.rotation.y=(c0+k)/dirs*Math.PI*2;renderer.setViewport(k*cw,0,cw,cw);renderer.setScissor(k*cw,0,cw,cw);renderer.render(scene,cam)}g.drawImage(renderer.domElement,0,0,n*cw,cw,c0*F,row*F,n*F,F)}};
 const model=spec.build(team),holder=new T.Group();holder.add(model.hull);scene.add(holder);const atlas=document.createElement('canvas');atlas.width=F*dirs;atlas.height=F*poses.length;const g=atlas.getContext('2d');
 for(let row=0;row<poses.length;row++){const ps=poses[row];if(model.pose){if(ps.startsWith('walk'))model.pose('walk',+ps.slice(4)/WALK*Math.PI*2);else model.pose(ps)}strip(holder,g,row)}scene.remove(holder);
 let turretAtlas=null;if(spec.turret&&model.turret){const th=new T.Group();model.turret.position.x=model.turret.position.z=0;th.add(model.turret);scene.add(th);turretAtlas=document.createElement('canvas');turretAtlas.width=F*dirs;turretAtlas.height=F;strip(th,turretAtlas.getContext('2d'),0);scene.remove(th)}
 return{key,S:spec.S,F,dirs,poses,atlas,turretAtlas,maskSize:32}}
function bakeBuilding(key,team,touch){const spec=MODEL_SPECS[key],{renderer,scene,sun,ground,dirv}=bakeRenderer();const model=spec.build(team),holder=new T.Group();if(!spec.tree)model.hull.scale.y=1.3;if(model.turret){model.turret.position.y*=1.3}holder.add(model.hull);if(model.turret)holder.add(model.turret);scene.add(holder);holder.updateMatrixWorld(true);
 const cam=new T.OrthographicCamera(-1,1,1,-1,.1,200);cam.position.copy(dirv).multiplyScalar(60);cam.lookAt(0,0,0);cam.updateMatrixWorld();const bb=new T.Box3().setFromObject(holder);let ext=0;const v=new T.Vector3();for(const x of [bb.min.x,bb.max.x])for(const y of [bb.min.y,bb.max.y])for(const z of [bb.min.z,bb.max.z]){v.set(x,y,z).applyMatrix4(cam.matrixWorldInverse);ext=Math.max(ext,Math.abs(v.x),Math.abs(v.y))}
 const S=Math.ceil(ext*2.24*10)/10;cam.left=cam.bottom=-S/2;cam.right=cam.top=S/2;cam.updateProjectionMatrix();const F=Math.min(touch?300:400,Math.max(128,Math.round(S*(touch?13:18)))),SS=2,cw=F*SS,frames=spec.frames||1,CH=Math.min(8,Math.max(frames,model.turret?8:1));
 const sc=sun.shadow.camera;sc.left=sc.bottom=-S*.75;sc.right=sc.top=S*.75;sc.far=60;sun.position.set(-S*.5,S*.9+4,S*.5);sc.updateProjectionMatrix();sun.shadow.map?.dispose();sun.shadow.map=null;scene.add(ground);if(model.turret)holder.remove(model.turret);
 renderer.setSize(cw*CH,cw);renderer.setScissorTest(true);const run=(obj,n,g,spinFn)=>{for(let c0=0;c0<n;c0+=CH){const k1=Math.min(CH,n-c0);renderer.setScissor(0,0,cw*CH,cw);renderer.setViewport(0,0,cw*CH,cw);renderer.clear();for(let k=0;k<k1;k++){spinFn(c0+k);renderer.setViewport(k*cw,0,cw,cw);renderer.setScissor(k*cw,0,cw,cw);renderer.render(scene,cam)}g.drawImage(renderer.domElement,0,0,k1*cw,cw,c0*F,0,k1*F,F)}};
 const atlas=document.createElement('canvas');atlas.width=F*frames;atlas.height=F;run(holder,frames,atlas.getContext('2d'),i=>{if(model.spin)model.spin.rotation.y=i/frames*Math.PI*2});scene.remove(holder);scene.remove(ground);
 let turretAtlas=null,tdirs=0;if(model.turret){tdirs=touch?24:32;const th=new T.Group();th.add(model.turret);scene.add(th);turretAtlas=document.createElement('canvas');turretAtlas.width=F*tdirs;turretAtlas.height=F;run(th,tdirs,turretAtlas.getContext('2d'),i=>{th.rotation.y=i/tdirs*Math.PI*2});scene.remove(th)}
 sc.left=sc.bottom=-8;sc.right=sc.top=8;sc.far=30;sun.position.set(-5,9,5);sc.updateProjectionMatrix();sun.shadow.map?.dispose();sun.shadow.map=null;
 return{key,S,F,dirs:frames,poses:['base'],atlas,turretAtlas,tdirs,maskSize:48,building:true}}
async function buildMaskE(e){if(e.building){const ms=e.maskSize,mc=document.createElement('canvas');mc.width=ms*e.dirs;mc.height=ms;const mg=mc.getContext('2d',{willReadFrequently:true});mg.drawImage(e.atlas,0,0,mc.width,ms);if(e.turretAtlas)for(let i=0;i<e.dirs;i++)mg.drawImage(e.turretAtlas,0,0,e.F,e.F,i*ms,0,ms,ms);const data=mg.getImageData(0,0,mc.width,ms).data;e.mask=new Uint8Array(mc.width*ms);for(let i=0;i<e.mask.length;i++){const a=data[i*4+3];e.mask[i]=a>120?a:0}e.maskW=mc.width;return}const ms=e.maskSize,mc=document.createElement('canvas');mc.width=ms*e.dirs;mc.height=ms*e.poses.length;const mg=mc.getContext('2d',{willReadFrequently:true});mg.drawImage(e.atlas,0,0,mc.width,mc.height);if(e.turretAtlas)mg.drawImage(e.turretAtlas,0,0,mc.width,ms);const data=mg.getImageData(0,0,mc.width,mc.height).data;e.mask=new Uint8Array(mc.width*mc.height);for(let i=0;i<e.mask.length;i++)e.mask[i]=data[i*4+3];e.maskW=mc.width}
// Bake (or load from cache) the eight unit models of one faction for one team.
export async function bakeFaction(faction,team,{touch=false,progress}={}){const ckey=CACHE_VER+'-'+faction+'-'+team+(touch?'-t':'-d'),map=FACTION_MODELS[faction],types=Object.keys(map),out={};
 const cached=await cacheGet(ckey);if(cached){try{let n=0;for(const type of types){const c=cached[type];const e={...c.meta,atlas:await blobToCanvas(c.a),turretAtlas:c.t?await blobToCanvas(c.t):null};await buildMaskE(e);out[type]=e;progress?.(++n,types.length)}return out}catch(e){}}
 let n=0;for(const type of types){const e=MODEL_SPECS[map[type]].building?bakeBuilding(map[type],team,touch):bakeOne(map[type],team,touch);await buildMaskE(e);out[type]=e;progress?.(++n,types.length);await new Promise(r=>setTimeout(r,0))}
 (async()=>{try{const store={};for(const[type,e]of Object.entries(out))store[type]={meta:{key:e.key,S:e.S,F:e.F,dirs:e.dirs,poses:e.poses,maskSize:e.maskSize,tdirs:e.tdirs,building:e.building},a:await toBlob(e.atlas),t:e.turretAtlas?await toBlob(e.turretAtlas):null};await cachePut(ckey,store)}catch(e){console.warn('model cache failed',e)}})();
 return out}
export function bakeKey(key,team,touch){const e=MODEL_SPECS[key].building?bakeBuilding(key,team,touch):bakeOne(key,team,touch);buildMaskE(e);return e}
export function buildModel(key,team){const sp=MODEL_SPECS[key],m=sp.build(team),g=new T.Group();g.add(m.hull);if(m.turret)g.add(m.turret);if(sp.building)m.hull.scale.y=1.3;if(m.pose)m.pose(sp.infantry?'aim':'rot1');return g}

// ---------------------------------------------------------------------------
// Scenery for the different environments (baked once as single-view sprites)
// ---------------------------------------------------------------------------
const TREES={
 pine:(v)=>{const h=new T.Group(),bark=new T.MeshStandardMaterial({color:0x5a4030,roughness:.95}),nd=new T.MeshStandardMaterial({color:[0x2f4a34,0x2a4430,0x35523a][v%3],roughness:.9,flatShading:true}),sn=new T.MeshStandardMaterial({color:0xf2f6fa,roughness:.7,flatShading:true});const k=.9+v*.12;
  cyl(.22*k,.3*k,2.2*k,bark,h,0,1.1*k,0,'y',8);for(let i=0;i<4;i++){const r=(2.3-i*.48)*k,y=(1.6+i*1.45)*k,hh=2.3*k;const c=mesh(new T.ConeGeometry(r,hh,9),nd,h,0,y+hh/2,0);c.rotation.y=i*.7;const s=mesh(new T.ConeGeometry(r*.8,hh*.55,9),sn,h,0,y+hh*.72,0);s.rotation.y=i*.7+.3}return{hull:h}},
 oak:(v)=>{const h=new T.Group(),bark=new T.MeshStandardMaterial({color:0x5b4632,roughness:.95}),cols=[0x4f7a32,0x5e8a3a,0x46702c,0x6a8f40];const k=.85+v*.12;cyl(.28*k,.4*k,3*k,bark,h,0,1.5*k,0,'y',8);
  for(let i=0;i<7;i++){const a=i/7*Math.PI*2+v,r=i?1.5*k:0,y=(3.6+(i%3)*.5)*k;const b=mesh(new T.IcosahedronGeometry((1.5+((i*37+v*13)%5)*.12)*k,1),new T.MeshStandardMaterial({color:cols[(i+v)%4],roughness:.9,flatShading:true}),h,Math.cos(a)*r,y,Math.sin(a)*r);b.scale.y=.85}return{hull:h}},
 acacia:(v)=>{const h=new T.Group(),bark=new T.MeshStandardMaterial({color:0x5a4430,roughness:.95}),leaf=new T.MeshStandardMaterial({color:[0x6f7a36,0x7a8440,0x66702e][v%3],roughness:.9,flatShading:true});const k=.9+v*.1;
  cyl(.2*k,.3*k,2.4*k,bark,h,0,1.2*k,0,'y',7);for(const [dx,dz,rz,rx] of [[.8,0,-.5,0],[-.7,.3,.5,.2],[0,-.7,0,-.5]]){const b=cyl(.11*k,.15*k,2*k,bark,h,dx*.6*k,3.0*k,dz*.6*k,'y',6);b.rotation.set(rx,0,rz)}
  for(const [x,z,r] of [[0,0,2.8],[1.4,.4,1.8],[-1.3,.5,1.9],[.2,-1.2,1.8]]){const c=mesh(new T.SphereGeometry(r*k,10,6),leaf,h,x*k,3.9*k,z*k);c.scale.y=.28}return{hull:h}}};
for(const t of Object.keys(TREES))for(let v=0;v<3;v++)MODEL_SPECS['tree_'+t+v]={build:()=>TREES[t](v),building:true,tree:true,frames:1};
export function bakeScenery(type,touch){const out=[];for(let v=0;v<3;v++){const e=bakeBuilding('tree_'+type+v,2,touch);out.push(e)}return out}
