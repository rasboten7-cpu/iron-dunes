// Shared map definitions: rendering, simulation, navigation and radar all use one world coordinate system.
// Every skirmish map is point-symmetric around (0,0) so both start positions are fair.
const common={limit:200,playLimit:194,cameraLimit:190,terrainSize:520};
const mirror=list=>list.flatMap(p=>[p,{...p,x:-p.x,z:-p.z}]);
const ridge=(x,from,to,gaps,step=9,r=4.6)=>{const out=[];for(let z=from;z<=to;z+=step){if(gaps.some(([a,b])=>z>a&&z<b))continue;out.push({x:x+Math.sin(z*.21)*2.2,z,r})}return out};

export const MAPS=[
 {...common,id:'valley',name:'وادي الحديد',sub:'IRON VALLEY',desc:'وادٍ مفتوح بممرات واسعة ومبانٍ مدنية في الوسط. مناسب للهجمات المدرعة.',
  bases:[{x:-130,z:130},{x:130,z:-130}],
  deposits:[{x:-139,z:103},{x:139,z:-103},{x:-60,z:-50},{x:60,z:50},{x:-145,z:-80},{x:145,z:80},{x:-30,z:130},{x:30,z:-130}],
  civilians:mirror([{x:30,z:-4},{x:-6,z:38}]),
  rocks:mirror([{x:-78,z:34,r:5.5},{x:-16,z:-88,r:5},{x:-100,z:-10,r:4.5},{x:-176,z:20,r:6}]),
  groves:[],
  roads:[Array.from({length:52},(_,i)=>{const z=-205+i*8;return[Math.sin(z*.028)*12,z]})],
  palms:{count:95,rule:(x,z)=>Math.abs(x)>25&&Math.abs(z)<95}},
 {...common,id:'pass',name:'ممر العقارب',sub:'SCORPION PASS',desc:'سلسلتان صخريتان تقسمان الساحة إلى ثلاثة ممرات ضيقة. الدفاع والمدفعية حاسمان.',
  bases:[{x:-150,z:25},{x:150,z:-25}],
  deposits:[{x:-158,z:-22},{x:158,z:22},{x:-120,z:100},{x:120,z:-100},{x:-104,z:-112},{x:104,z:112},{x:0,z:88},{x:0,z:-88}],
  civilians:[{x:0,z:0},...mirror([{x:-28,z:58}])],
  rocks:[...ridge(-56,-190,190,[[-34,30],[96,142],[-150,-108]]),...ridge(56,-190,190,[[-30,34],[108,150],[-142,-96]])],
  groves:[],
  roads:[Array.from({length:52},(_,i)=>{const x=-205+i*8;return[x,16+Math.sin(x*.03)*6]})],
  palms:{count:60,rule:(x,z)=>Math.abs(x)>70}},
 {...common,id:'oasis',name:'واحة النخيل',sub:'PALM OASIS',desc:'واحة كثيفة في المركز يلتف حولها طريقان. موارد غنية على الأطراف.',
  bases:[{x:-25,z:150},{x:25,z:-150}],
  deposits:[{x:-80,z:152},{x:80,z:-152},{x:-150,z:70},{x:150,z:-70},{x:150,z:92},{x:-150,z:-92},{x:-46,z:44},{x:46,z:-44}],
  civilians:mirror([{x:-98,z:8},{x:66,z:96}]),
  rocks:mirror([{x:-122,z:-28,r:6},{x:-34,z:-84,r:5},{x:-178,z:150,r:6}]),
  groves:[{x:0,z:0,r:20}],
  roads:[[[-25,205],[-25,118],[6,74],[40,32],[42,-10],[30,-62],[25,-118],[25,-205]],[[25,-205],[25,-118],[-6,-74],[-40,-32],[-42,10],[-30,62],[-25,118],[-25,205]]],
  palms:{count:120,rule:(x,z)=>Math.hypot(x,z)<70||Math.abs(x)>120}}
];
export let MAP=MAPS[0];
export function setMap(id){MAP=MAPS.find(m=>m.id===id)||MAPS[0];return MAP}
// Obstacles used by navigation and placement: rock clusters, palm groves and (separately) civilian buildings.
export function mapObstacles(map=MAP){return[...map.rocks.map(r=>({...r,kind:'rocks'})),...map.groves.map(g=>({...g,kind:'grove'}))]}
