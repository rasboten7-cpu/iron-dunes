// Original static OBJ architecture, authored offline. No reference-game assets.
import * as T from './three.module.js';
import {OBJLoader} from './OBJLoader.js';
const models=new Map(),materials=new Map();let pending;
export function loadArchitecture(){return pending??=(async()=>{
 const textures=await Promise.all(['weathered-plaster.png','roof-metal.png'].map(async n=>{const t=await new T.TextureLoader().loadAsync('assets/buildings/'+n);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=4;return t}));
 const atlases={};
 // Extract the four authored atlas regions without changing their image content.
 await Promise.all(['falcon','dragon','sand','details'].map(async f=>{const im=await new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=reject;image.src='assets/architecture/'+f+'-atlas.png'});atlases[f]=[];for(let i=0;i<4;i++){const canvas=document.createElement('canvas');canvas.width=canvas.height=1024;canvas.getContext('2d').drawImage(im,(i%2)*im.width/2,Math.floor(i/2)*im.height/2,im.width/2,im.height/2,0,0,1024,1024);const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=8;tex.wrapS=tex.wrapT=T.RepeatWrapping;atlases[f].push(tex)}}));
 const palettes={falcon:{wall:0xbcc1b7,team:0x24678e,roof:0x64767d,edge:0xc1c2ae},dragon:{wall:0xc6b894,team:0xa52c23,roof:0x625e50,edge:0xbeb89b},sand:{wall:0xbfa77e,team:0x527748,roof:0x8c7c5f,edge:0xc7b28b}};
 const colors={stone:0x918b76,paving:0xa7a18b,pavingline:0x888674,dark:0x232b2b,recess:0x20292b,metal:0x748080,glass:0x355665,door:0x636f69,white:0xd8d9c1,yellow:0xc5a24b,wood:0x7b6041,ridge:0x969783,tarmac:0x62675e,tank:0x909b91,dish:0xaeb9b4,coil:0x746a52,sandbag:0x958565,dome:0xaaa079,fabric:0x64794f,target:0xb69b77,lamp:0xffcf7c};
 function material(role,f){
  const key=f+role;if(materials.has(key))return materials.get(key);
  const slot={facade:0,roof:1,paving:2,equipment:3,fabric:3}[role];
  const detailed=slot!==undefined,metal=['metal','tank','dish','coil','roof','equipment'].includes(role),plain=['team','glass','dark','recess','white','yellow','lamp'].includes(role);
  const generalSlot={wall:f==='sand'?3:0,stone:0,edge:0,metal:1,tank:1,dish:1,coil:1,wood:2,dome:3,sandbag:3}[role];const tex=detailed?atlases[f][slot]:generalSlot!==undefined?atlases.details[generalSlot]:textures[0];
  const color=detailed?0xffffff:palettes[f][role]??colors[role]??0xaaaa99;
  const mat=new T.MeshStandardMaterial({color,map:plain?null:tex,bumpMap:plain?null:tex,bumpScale:detailed?.035:.012,roughness:role==='glass'?.25:metal?.72:.94,metalness:role==='glass'?.4:metal?.15:0,side:['roof','dish','fabric'].includes(role)?T.DoubleSide:T.FrontSide});
  if(role==='lamp'){mat.emissive.setHex(0xffbb65);mat.emissiveIntensity=.45}materials.set(key,mat);return mat
 }
 const manifest=await (await fetch('assets/architecture/manifest.json',{cache:'reload'})).json(),loader=new OBJLoader();
 await Promise.all(manifest.map(async entry=>{const response=await fetch('assets/architecture/'+entry.file,{cache:'reload'});if(!response.ok)throw Error('Missing architecture '+entry.key);const root=loader.parse(await response.text()),f=entry.key.split('_')[0],turrets=[];root.traverse(o=>{if(!o.isMesh)return;const role=o.name.split('_').slice(1).join('_');o.material=material(role,f);o.castShadow=o.receiveShadow=true;if(o.name.startsWith('turret_'))turrets.push(o)});if(turrets.length){const pivot=new T.Group();pivot.name='weaponPivot';root.add(pivot);for(const mesh of turrets)pivot.add(mesh);root.userData.liveTurret=pivot}models.set(entry.key,root)}));
})();}
export function architecture(type,faction){const source=models.get(faction+'_'+type);if(!source)return null;const root=source.clone(true);root.userData.liveTurret=root.getObjectByName('weaponPivot')||null;return root}
