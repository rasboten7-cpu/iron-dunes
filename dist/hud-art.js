// Original raster artwork for command thumbnails, generated for this UI.
const DIR='assets/interface/';
const buildings={
 falcon:['hq','power','refinery','barracks','factory','turret','radar','silo','airfield','dropzone','builder','tank'],
 dragon:['hq','power','refinery','barracks','factory','turret','radar','silo','airfield','speaker','bunker','builder'],
 sand:['hq','refinery','barracks','factory','turret','radar','silo','tunnel','blackmarket','hole','trap','builder']
};
const actions=['ammo','armor','training','repair','upgrade','strike','paradrop','barrage','cash','carpet','launch','sell','evac','rally','stop','guard'];
const aliases={emergency:'repair',silo:'launch',combat:'training',speed:'upgrade',scud:'launch',alert:'guard',heli:'guard',raptor:'strike',mig:'strike',nukecannon:'barrage',scudlauncher:'launch'};
export function commandIcon(type,faction='falcon'){
 const factionKey=buildings[faction]?faction:'falcon';let index=buildings[factionKey].indexOf(type),file=factionKey+'-commands.png',rows=3;
 if(index<0){index=actions.indexOf(aliases[type]||type);file='actions.png';rows=4}
 if(index<0)return null;
 const x=(index%4)/3*100,y=Math.floor(index/4)/(rows-1)*100;
 return `<span class="asset-icon command-art" aria-hidden="true" data-art="${factionKey}:${type}" style="--art-url:url('${DIR+file}');--art-x:${x}%;--art-y:${y}%;--art-size:400% ${rows*100}%"></span>`
}
export const radarTerrain=new Image();radarTerrain.src='assets/terrain-desert.png';
let pending;
export function loadCommandArt(){return pending??=Promise.all(['console-frame.png','falcon-commands.png','dragon-commands.png','sand-commands.png','actions.png'].map(name=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(Error('Missing command artwork '+name));img.src=DIR+name})));}
