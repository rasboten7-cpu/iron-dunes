// Shared map definitions: rendering, simulation, navigation and radar all use one world coordinate system.
// Hand-made 1v1 maps are point-symmetric around (0,0); the large maps are generated from a seed so
// every start position gets the same resources at the same distances.

// Environments ("biomes"): ground colours, scenery, grading and particle colours
export const BIOMES={
 desert:{name:'صحراء',ground:null,base:'#9f8e6d',grade:'#d5b286',gradeA:.20,mult:'#b9a080',multA:.05,tree:'palm',rockTint:null,dust:0xc9a874,patch:['#6e5a3c','#c4ad84'],road:'#6a624e30',mini:'#2a372c',obstacle:'#6d665a',grove:'#4e6a3c',sky:null},
 snow:{name:'ثلوج',ground:{base:[218,225,233],var:[[206,215,226],[236,240,246],[198,206,216]],speck:'rgba(120,130,145,.25)'},base:'#d8dee6',grade:'#b8d4f0',gradeA:.35,mult:'#c8d8ec',multA:.08,tree:'pine',rockTint:'snow',dust:0xe8eef6,patch:['#9aa6b4','#f4f7fb'],road:'#5a5e6640',mini:'#4a5662',obstacle:'#8a929c',grove:'#2f4a3a',snowfall:true},
 green:{name:'سهول خضراء',ground:{base:[96,122,62],var:[[78,104,48],[118,140,72],[128,112,74]],speck:'rgba(60,46,26,.22)'},base:'#5f7a3e',grade:'#d8c070',gradeA:.25,mult:'#9ab060',multA:.06,tree:'oak',rockTint:'moss',dust:0x9a8a64,patch:['#4a6430','#8a7a50'],road:'#5a4a3260',mini:'#2e4a2a',obstacle:'#6a6a5a',grove:'#2a5a24'},
 savanna:{name:'سافانا',ground:{base:[176,150,86],var:[[160,132,70],[196,170,104],[150,110,62]],speck:'rgba(90,60,30,.25)'},base:'#b0965a',grade:'#e8b050',gradeA:.45,mult:'#d8a058',multA:.08,tree:'acacia',rockTint:'red',dust:0xc8a46a,patch:['#8a6a3c','#d0b878'],road:'#6a503460',mini:'#4a4428',obstacle:'#7a5a44',grove:'#5a6a2c'}
};

const common={limit:200,playLimit:194,cameraLimit:190,terrainSize:520,biome:'desert',max:2};
const mirror=list=>list.flatMap(p=>[p,{...p,x:-p.x,z:-p.z}]);
const ridge=(x,from,to,gaps,step=9,r=4.6)=>{const out=[];for(let z=from;z<=to;z+=step){if(gaps.some(([a,b])=>z>a&&z<b))continue;out.push({x:x+Math.sin(z*.21)*2.2,z,r})}return out};

// ---------------------------------------------------------------------------
// Generator for large maps with 2-6 start positions placed on a ring.
// ---------------------------------------------------------------------------
function gen({id,name,sub,desc,biome,limit,players,seed,rot=0,rockCount=26,groveCount=6,groveR=[12,20],civCount=4,trees=140,center=null,forward=false}){
 let s=seed;const rnd=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296};
 const R=limit*.7,bases=[],deposits=[],rocks=[],groves=[],civilians=[],roads=[];
 for(let i=0;i<players;i++){const a=rot+i/players*Math.PI*2;bases.push({x:Math.round(Math.sin(a)*R),z:Math.round(Math.cos(a)*R)})}
 // each start: one supply pile in front of the base and one behind, plus an expansion between neighbours
 bases.forEach((b,i)=>{const a=Math.atan2(b.x,b.z);for(const [da,dr] of [[.32,-6],[-.3,22]]){const aa=a+da*(players>3?.8:1),rr=R+dr;deposits.push({x:Math.round(Math.sin(aa)*rr),z:Math.round(Math.cos(aa)*rr)})}
  const m=a+Math.PI/players;deposits.push({x:Math.round(Math.sin(m)*R*.78),z:Math.round(Math.cos(m)*R*.78)})});
 // very large maps: an extra expansion in front of every base, half-way to the centre
 if(forward)bases.forEach(b=>{const a=Math.atan2(b.x,b.z);deposits.push({x:Math.round(Math.sin(a)*R*.6),z:Math.round(Math.cos(a)*R*.6)})});
 const cDep=players>=4?players:2;for(let i=0;i<cDep;i++){const a=rot+(i+.5)/cDep*Math.PI*2;deposits.push({x:Math.round(Math.sin(a)*limit*.2),z:Math.round(Math.cos(a)*limit*.2)})}
 // roads from every base to the centre
 for(const b of bases){const pts=[];for(let k=0;k<=12;k++){const t=k/12,w=Math.sin(t*Math.PI)*10;const nx=-b.z/R,nz=b.x/R;pts.push([b.x*(1-t)+nx*w,b.z*(1-t)+nz*w])}roads.push(pts)}
 const far=(x,z,pad)=>bases.every(b=>Math.hypot(x-b.x,z-b.z)>52+pad)&&deposits.every(d=>Math.hypot(x-d.x,z-d.z)>16+pad)&&Math.hypot(x,z)>(center?center+pad:18)&&Math.abs(x)<limit-14&&Math.abs(z)<limit-14;
 const offRoad=(x,z)=>roads.every(r=>r.every(([px,pz])=>Math.hypot(x-px,z-pz)>11));
 for(let i=0;i<civCount;i++){const a=rot+(i+.25)/civCount*Math.PI*2+.3,r=limit*(.32+rnd()*.08);const x=Math.round(Math.sin(a)*r),z=Math.round(Math.cos(a)*r);if(far(x,z,-8)&&offRoad(x,z))civilians.push({x,z})}
 for(let i=0,n=0;i<600&&n<rockCount;i++){const x=(rnd()*2-1)*(limit-20),z=(rnd()*2-1)*(limit-20);if(far(x,z,6)&&offRoad(x,z)&&civilians.every(c=>Math.hypot(x-c.x,z-c.z)>16)&&rocks.every(r=>Math.hypot(x-r.x,z-r.z)>14)){rocks.push({x:Math.round(x),z:Math.round(z),r:4+rnd()*2.5});n++}}
 for(let i=0,n=0;i<400&&n<groveCount;i++){const x=(rnd()*2-1)*(limit-30),z=(rnd()*2-1)*(limit-30),r=groveR[0]+rnd()*(groveR[1]-groveR[0]);if(far(x,z,r)&&offRoad(x,z)&&rocks.every(q=>Math.hypot(x-q.x,z-q.z)>r+10)&&groves.every(g=>Math.hypot(x-g.x,z-g.z)>g.r+r+16)&&civilians.every(c=>Math.hypot(x-c.x,z-c.z)>r+12)){groves.push({x:Math.round(x),z:Math.round(z),r:Math.round(r)});n++}}
 if(center)groves.push({x:0,z:0,r:center});
 return{id,name,sub,desc,biome,limit,playLimit:limit-6,cameraLimit:limit-10,terrainSize:limit*2.6,max:players,bases,deposits,civilians,rocks,groves,roads,palms:{count:trees,rule:(x,z)=>far(x,z,-20)&&offRoad(x,z)}}}

export const MAPS=[
 // hand-made 2-player maps: about 1 km across (800 units)
 {...common,limit:400,playLimit:394,cameraLimit:390,terrainSize:1040,id:'valley',name:'وادي الحديد',sub:'IRON VALLEY',desc:'وادٍ صحراوي مفتوح لجيشين بطول كيلومتر، مبانٍ مدنية في الوسط.',
  bases:[{x:-260,z:260},{x:260,z:-260}],
  deposits:mirror([{x:-278,z:206},{x:-120,z:-100},{x:-290,z:-160},{x:-60,z:260},{x:-200,z:40},{x:60,z:140}]),
  civilians:mirror([{x:60,z:-8},{x:-12,z:76},{x:-150,z:-210}]),
  rocks:mirror([{x:-156,z:68,r:7},{x:-32,z:-176,r:6.5},{x:-200,z:-20,r:6},{x:-352,z:40,r:8},{x:-90,z:150,r:6},{x:-250,z:120,r:7},{x:-60,z:-320,r:7.5},{x:-330,z:-260,r:6.5},{x:20,z:-60,r:5.5},{x:-120,z:320,r:7}]),
  groves:mirror([{x:-300,z:-60,r:16},{x:-40,z:-250,r:14}]),
  roads:[Array.from({length:104},(_,i)=>{const z=-410+i*8;return[Math.sin(z*.014)*24,z]})],
  palms:{count:230,rule:(x,z)=>Math.abs(x)>50&&Math.abs(z)<190}},
 {...common,limit:400,playLimit:394,cameraLimit:390,terrainSize:1040,id:'pass',name:'ممر العقارب',sub:'SCORPION PASS',desc:'سلسلتان صخريتان وثلاثة ممرات ضيقة على كيلومتر من الصحراء. الدفاع والمدفعية حاسمان.',
  bases:[{x:-300,z:50},{x:300,z:-50}],
  deposits:mirror([{x:-316,z:-44},{x:-240,z:200},{x:-208,z:-224},{x:0,z:176},{x:-200,z:60},{x:-60,z:-300}]),
  civilians:[{x:0,z:0},...mirror([{x:-56,z:116},{x:-40,z:-200}])],
  rocks:[...ridge(-112,-390,390,[[-68,60],[192,284],[-300,-216]]),...ridge(112,-390,390,[[-60,68],[216,300],[-284,-192]]),...mirror([{x:-250,z:-150,r:7},{x:-330,z:220,r:7.5},{x:-180,z:330,r:6.5}])],
  groves:mirror([{x:-260,z:-330,r:14}]),
  roads:[Array.from({length:104},(_,i)=>{const x=-410+i*8;return[x,32+Math.sin(x*.015)*12]})],
  palms:{count:150,rule:(x,z)=>Math.abs(x)>140}},
 gen({id:'dunes',name:'الكثبان الكبرى',sub:'GREAT DUNES',desc:'خريطة عملاقة بطول كيلو ونصف لستة جيوش: صحراء مفتوحة وممرات بين الصخور وواحات ومواقع إمداد إضافية.',biome:'desert',limit:600,players:6,seed:91,rot:.52,rockCount:95,groveCount:12,groveR:[14,26],civCount:8,trees:320,forward:true}),
 gen({id:'tundra',name:'جبهة الجليد',sub:'FROZEN FRONT',desc:'أرض ثلجية لأربعة جيوش بطول كيلو وربع تتخللها غابات الصنوبر والصخور المتجمدة.',biome:'snow',limit:500,players:4,seed:17,rot:.785,rockCount:70,groveCount:16,groveR:[13,24],civCount:6,trees:380,forward:true}),
 gen({id:'meadow',name:'سهول الربيع',sub:'SPRING PLAINS',desc:'سهول خضراء بطول كيلو ونصف لستة جيوش مع بساتين ومزارع في الوسط.',biome:'green',limit:600,players:6,seed:55,rot:0,rockCount:70,groveCount:22,groveR:[14,26],trees:420,civCount:10,forward:true}),
 gen({id:'savanna',name:'سافانا الأسود',sub:'LION SAVANNA',desc:'سافانا جافة بطول كيلو وربع لأربعة جيوش، أشجار الأكاسيا وصخور حمراء.',biome:'savanna',limit:500,players:4,seed:203,rot:0,rockCount:80,groveCount:12,groveR:[13,24],civCount:6,trees:330,forward:true}),
 gen({id:'pines',name:'غابة الصنوبر',sub:'PINE FOREST',desc:'خريطة ثلجية لجيشين بطول كيلومتر يفصل بينهما حزام غابات كثيف في الوسط.',biome:'snow',limit:400,players:2,seed:77,rot:.785,rockCount:40,groveCount:24,groveR:[10,18],trees:420,civCount:4,center:34,forward:true}),
 gen({id:'oasis',name:'واحة النخيل',sub:'PALM OASIS',desc:'سهل أخضر بطول كيلو وربع لأربعة جيوش تحيط بواحة نخيل كبيرة في المركز.',biome:'green',limit:500,players:4,seed:131,rot:0,rockCount:55,groveCount:10,groveR:[13,24],civCount:6,trees:340,center:40,forward:true})
];
export let MAP=MAPS[0];
export function setMap(id){MAP=MAPS.find(m=>m.id===id)||MAPS[0];return MAP}
// Obstacles used by navigation and placement: rock clusters, tree groves and (separately) civilian buildings.
export function mapObstacles(map=MAP){return[...map.rocks.map(r=>({...r,kind:'rocks'})),...map.groves.map(g=>({...g,kind:'grove'}))]}
