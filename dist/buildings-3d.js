// Live, externally authored building meshes. Zsky / CC BY 4.0; see asset credits.
import * as T from './three.module.js';
import {OBJLoader} from './OBJLoader.js';
import {buildModel,FACTION_MODELS} from './models.js?v=13';
const DIR='assets/buildings/';
const names=['Quarter','Storage','Refectory','RadioStation','GasTank','Container_01','Container_02','Container_03','GateKeeperStation','HelicopterBase','MedicTent','SniperTower','SandsSack','WoodenBox','Barrel','LightPole','ConcreteBlock'];
const source=new Map(),templates=new Map(),icons=new Map();let surface,wallSurface,roofSurface,ready=false,pending;
export const BUILDING_TYPES=new Set(['hq','power','refinery','barracks','factory','radar','silo','turret','airfield','dropzone','blackmarket','speaker','bunker','tunnel','hole','trap','civilian']);
export function loadBuildings(){return pending??=(async()=>{
 surface=await new T.TextureLoader().loadAsync(DIR+'weathered-plaster.png');surface.colorSpace=T.SRGBColorSpace;surface.wrapS=surface.wrapT=T.RepeatWrapping;surface.anisotropy=4;
 [wallSurface,roofSurface]=await Promise.all(['wall-panels.png','roof-metal.png'].map(async name=>{const t=await new T.TextureLoader().loadAsync(DIR+name);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=4;return t}));
 const loader=new OBJLoader();await Promise.all(names.map(async name=>{const response=await fetch(DIR+name+'.obj');if(!response.ok)throw Error('Missing building mesh '+name);const root=loader.parse(await response.text());root.updateMatrixWorld(true);const box=new T.Box3().setFromObject(root),size=box.getSize(new T.Vector3()),center=box.getCenter(new T.Vector3()),scale=1/Math.max(size.x,size.z);root.traverse(o=>{if(!o.isMesh)return;const g=o.geometry.clone();g.applyMatrix4(o.matrixWorld);g.translate(-center.x,-box.min.y,-center.z);g.scale(scale,scale,scale);const p=g.attributes.position,n=g.attributes.normal,uv=[];for(let i=0;i<p.count;i++){const ax=Math.abs(n.getX(i)),ay=Math.abs(n.getY(i)),az=Math.abs(n.getZ(i));uv.push((ax>ay&&ax>az?p.getZ(i):p.getX(i))*6,(ay>ax&&ay>az?p.getZ(i):p.getY(i))*6)}g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));o.geometry=g;o.position.set(0,0,0);o.rotation.set(0,0,0);o.scale.set(1,1,1);o.castShadow=o.receiveShadow=true;});source.set(name,root)}));ready=true;
})();}
function mat(name,faction){const n=name.toLowerCase(),wall=faction==='sand'?0xb5a181:faction==='dragon'?0x888b7b:0xa5aaa0;
 if(/glass|window/.test(n))return new T.MeshStandardMaterial({color:0x263d45,metalness:.5,roughness:.22});
 if(/light|lamp/.test(n))return new T.MeshStandardMaterial({color:0xc7c2a1,emissive:0xffc97b,emissiveIntensity:.25});
 const metal=/metal|roof|orange|door|iron|container|barrel|anten|tank|radio/.test(n),wood=/wood|box/.test(n),fabric=/tent|sand/.test(n);
 return new T.MeshStandardMaterial({color:wood?0x786044:fabric?0x837958:metal?(faction==='sand'?0xb1a58a:0xa1aba2):wall,map:wood||fabric?surface:metal?roofSurface:wallSurface,bumpMap:wood||fabric?surface:metal?roofSurface:wallSurface,bumpScale:metal?.055:.025,roughness:metal?.68:.94,metalness:metal?.3:0});}
function part(group,name,width,x=0,z=0,angle=0,faction='falcon'){
 const g=source.get(name).clone(true);g.traverse(o=>{if(o.isMesh){o.material=(Array.isArray(o.material)?o.material:[o.material]).map(m=>mat(m.name||o.name,faction));if(o.material.length===1)o.material=o.material[0]}});g.scale.setScalar(width);g.position.set(x,0,z);g.rotation.y=angle;group.add(g);return g;
}
function assemble(type,faction){const g=new T.Group(),add=(n,w,x=0,z=0,a=0)=>part(g,n,w,x,z,a,faction);
 switch(type){
 case 'hq':add('Quarter',8,-1,0);add('RadioStation',3.1,4,-2);add('GateKeeperStation',1.7,3.8,3);add('LightPole',.7,-3,4);break;
 case 'barracks':add(faction==='sand'?'MedicTent':'Refectory',7.5,-1,0);add('Quarter',3.5,4,0);add('SandsSack',2.8,1,3.8);add('WoodenBox',1.2,-3,3.8);break;
 case 'factory':add('Storage',9.5,0,-.5);add('Container_02',3.5,5.8,1,Math.PI/2);add('Barrel',.7,-4,4);add('WoodenBox',1,-2.5,4);break;
 case 'refinery':add('Container_01',7,-2,0,Math.PI/2);add('GasTank',3.5,3.5,-2);add('Storage',4,3.5,2.5);add('Barrel',.8,-1,4);break;
 case 'power':add('GasTank',4.3,-2,0);add('GasTank',3.2,2.7,-1);add('GateKeeperStation',2.4,2.6,2.6);add('ConcreteBlock',2,-2,3);break;
 case 'radar':add('RadioStation',8);add('Container_03',3,4,2,Math.PI/2);break;
 case 'airfield':add('Storage',7,0,-3);add('HelicopterBase',7,0,4);add('RadioStation',2.5,-5,0);break;
 case 'dropzone':add('HelicopterBase',7.5,0,0);add('Container_01',3.6,0,-5);add('WoodenBox',1.6,4,2);add('WoodenBox',1.2,4,-1);break;
 case 'blackmarket':add('Refectory',7);add('Container_03',3.8,4.5,-1,Math.PI/2);add('WoodenBox',1.5,3.6,3);add('Barrel',.8,-3,3);break;
 case 'civilian':add('Quarter',8);break;
 default:{// Keep functional weapon silhouettes/turret pivots as true live meshes.
  const key=FACTION_MODELS[faction]?.[type];if(!key)return null;const original=buildModel(key,0);original.traverse(o=>{if(o.isMesh){o.castShadow=o.receiveShadow=true;const mats=Array.isArray(o.material)?o.material:[o.material];o.material=mats.map(m=>{const c=new T.MeshStandardMaterial({color:m.color||0x969a88,map:m.map||surface,roughness:.8,metalness:m.metalness||0,side:m.side,transparent:m.transparent,opacity:m.opacity,emissive:m.emissive||0x000000,emissiveIntensity:m.emissiveIntensity??1});if(!m.map){c.bumpMap=surface;c.bumpScale=.025;}return c});if(o.material.length===1)o.material=o.material[0]}});g.add(original);g.userData.liveTurret=original.children.length>1?original.children[1]:null;
 }}
 g.updateMatrixWorld(true);return g;
}
export function buildingModel(type,faction='falcon',radius=5){if(!ready||!BUILDING_TYPES.has(type))return null;const key=type+':'+faction+':'+radius;if(templates.has(key))return templates.get(key);const model=assemble(type,faction);if(!model)return null;const b=new T.Box3().setFromObject(model),s=b.getSize(new T.Vector3()),c=b.getCenter(new T.Vector3()),k=radius*1.85/Math.max(s.x,s.z);const wrapper=new T.Group();model.position.set(-c.x*k,-b.min.y*k,-c.z*k);model.scale.setScalar(k);wrapper.add(model);wrapper.userData.liveTurret=model.userData.liveTurret;wrapper.updateMatrixWorld(true);const result={root:wrapper,box:new T.Box3().setFromObject(wrapper),key,imported:!['silo','turret','speaker','bunker','tunnel','hole','trap'].includes(type)};templates.set(key,result);return result;}
let engine;
function renderer(){if(engine)return engine;const renderer=new T.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});renderer.setPixelRatio(1);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
 const scene=new T.Scene();scene.add(new T.HemisphereLight(0xcbdde7,0x77644c,2.2));const sun=new T.DirectionalLight(0xffefd5,3.3);sun.position.set(-20,35,20);sun.castShadow=true;sun.shadow.mapSize.set(256,256);Object.assign(sun.shadow.camera,{left:-16,right:16,top:16,bottom:-16,near:1,far:90});sun.shadow.bias=-.001;sun.shadow.normalBias=.04;scene.add(sun);
 const plane=new T.Mesh(new T.PlaneGeometry(60,60),new T.ShadowMaterial({opacity:.23}));plane.rotation.x=-Math.PI/2;plane.position.y=.012;plane.receiveShadow=true;scene.add(plane);const cam=new T.PerspectiveCamera();engine={renderer,scene,cam};return engine;}
const corner=new T.Vector3(),crop=new T.Matrix4();
export function drawLiveBuilding(ctx,root,camera,w,h,ratio=1){const u=root.userData,template=u.liveBuilding;if(!template)return null;const {renderer:r,scene,cam}=renderer();
 const model=template.root,construction=u.build===undefined?1:Math.max(.08,u.build);if(model.userData.liveTurret&&u.turretYaw!=null)model.userData.liveTurret.rotation.y=u.turretYaw-root.rotation.y;model.rotation.copy(root.rotation);model.scale.copy(root.scale);model.scale.y*=construction;model.updateMatrixWorld(true);
 const b=template.box.clone();b.min.multiply(root.scale);b.max.multiply(root.scale);b.max.y*=construction;b.translate(root.position);let x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity;
 for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z]){corner.set(x,y,z).project(camera);const px=(corner.x+1)*w/2,py=(1-corner.y)*h/2;x0=Math.min(x0,px);x1=Math.max(x1,px);y0=Math.min(y0,py);y1=Math.max(y1,py)}
 const pad=Math.max(8,(x1-x0)*.16);x0=Math.floor(x0-pad);x1=Math.ceil(x1+pad);y0=Math.floor(y0-pad*.3);y1=Math.ceil(y1+pad);const bw=x1-x0,bh=y1-y0;if(bw<=0||bh<=0||bw>4096||bh>4096)return null;
 const key=[template.key,...camera.position.toArray(),...camera.quaternion.toArray(),...camera.projectionMatrix.elements,root.position.x,root.position.y,root.position.z,root.rotation.y,root.scale.y,construction,u.turretYaw||0,w,h].map(v=>typeof v==='number'?Math.round(v*1000)/1000:v).join(',');let cached=u.liveCache;
 if(!cached||cached.key!==key){cam.copy(camera);cam.position.sub(root.position);cam.updateMatrixWorld(true);crop.makeScale(w/bw,h/bh,1);crop.elements[12]=(w-2*x0-bw)/bw;crop.elements[13]=(2*y0+bh-h)/bh;cam.projectionMatrix.copy(camera.projectionMatrix).premultiply(crop);cam.projectionMatrixInverse.copy(cam.projectionMatrix).invert();
 const resolution=Math.min(1.2,ratio,384/Math.max(bw,bh));r.setSize(Math.max(1,Math.ceil(bw*resolution)),Math.max(1,Math.ceil(bh*resolution)),false);scene.add(model);r.render(scene,cam);scene.remove(model);
 const canvas=cached?.canvas||document.createElement('canvas');canvas.width=r.domElement.width;canvas.height=r.domElement.height;canvas.getContext('2d').drawImage(r.domElement,0,0);const maskCanvas=document.createElement('canvas');maskCanvas.width=maskCanvas.height=64;const mg=maskCanvas.getContext('2d',{willReadFrequently:true});mg.drawImage(canvas,0,0,64,64);cached=u.liveCache={canvas,key,mask:mg.getImageData(0,0,64,64).data};
 }
 ctx.save();if(u.wreck)ctx.filter='brightness(.35) saturate(.35)';if(u.ghost)ctx.filter=u.ghost==='ghostok'?'sepia(.4) hue-rotate(55deg)':'sepia(1) saturate(3)';ctx.drawImage(cached.canvas,x0,y0,bw,bh);ctx.restore();
 if(construction<1){ctx.strokeStyle='#ffd27a';ctx.lineWidth=1.5;ctx.setLineDash([5,4]);ctx.strokeRect(x0+bw*.15,y0+bh*.15,bw*.7,bh*.75);ctx.setLineDash([])}return {left:x0,top:y0,w:bw,h:bh,liveMask:cached.mask};
}
export function buildingIcon(type,faction,radius){const key=type+':'+faction;if(icons.has(key))return icons.get(key);const live=buildingModel(type,faction,radius);if(!live)return null;const root=new T.Group();root.userData.liveBuilding=live;root.updateMatrixWorld();const cam=new T.PerspectiveCamera(38,1,.1,200);cam.position.set(radius*2.6,radius*2.4,radius*3.1);cam.lookAt(0,live.box.max.y*.35,0);cam.updateMatrixWorld();const out=document.createElement('canvas');out.width=out.height=192;const rect=drawLiveBuilding(out.getContext('2d'),root,cam,192,192,1);const tight=document.createElement('canvas');tight.width=tight.height=160;const side=Math.max(rect.w,rect.h)*1.05;tight.getContext('2d').drawImage(out,rect.left+(rect.w-side)/2,rect.top+(rect.h-side)/2,side,side,0,0,160,160);const url=tight.toDataURL();icons.set(key,url);return url;}
