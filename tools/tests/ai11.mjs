import { chromium } from '/opt/npm-tools/node_modules/playwright/index.mjs';
const browser=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width:1100,height:700}});const logs=[];page.on('pageerror',e=>logs.push('ERR '+e.message+' '+(e.stack||'').slice(0,500)));
await page.goto('http://127.0.0.1:8123/');await page.waitForFunction(()=>!document.getElementById('start').disabled,null,{timeout:240000});
const pairs=process.argv[2]?JSON.parse(process.argv[2]):[['dragon','falcon','hard','hard'],['sand','dragon','hard','hard'],['falcon','sand','hard','hard']];
for(const [a,b,da,db] of pairs){
 const r=await page.evaluate(async([a,b,da,db])=>{const g=window.game;await g.start({map:'valley',faction:a,superweapons:true,aiBoth:true,slots:[{ai:true,faction:a,diff:da,team:1},{ai:true,faction:b,diff:db,team:2}]});
  const out=[];const seen={};let maxGar=0,addons=0;for(let i=0;i<20;i++){let s;for(let k=0;k<6;k++){s=g.simulate(10);for(const e of g.entities()){if(!e.building||e.type==='bunker'){}seen[e.team+':'+e.type]=1;if(e.garrison?.length&&e.type!=='civilian')maxGar=Math.max(maxGar,e.garrison.length);if(e.addon)seen[e.team+':addon_'+e.addon]=1;if(e.husked)seen[e.team+':husk']=1;if(e.hidden)seen[e.team+':hidden']=1;if(e.stun>s.time)seen['stun_'+e.team]=1}if(s.ended)break}
   const tm=g.teams();if(i%5===4||s.ended){const cnt=t=>{const c={};g.entities().filter(e=>e.team===t&&!e.building).forEach(e=>c[e.type]=(c[e.type]||0)+1);return JSON.stringify(c)};out.push(`${Math.round(s.time)}s ended=${s.ended} dead=${tm.map(t=>t.dead)} $${Math.round(tm[0].money)}/${Math.round(tm[1].money)} up0=${[...tm[0].upgrades].join(',')} up1=${[...tm[1].upgrades].join(',')}\n  T0 ${cnt(0)}\n  T1 ${cnt(1)}`)}if(s.ended)break}
  const newT=['bunker','crawler','nukecannon','bus','scudlauncher','addon_gat','addon_spk','addon_bnk','husk','hidden'];out.push('seen: '+Object.keys(seen).filter(k=>newT.some(n=>k.endsWith(n))||k.startsWith('stun')).join(' ')+' maxGarrison '+maxGar+' powersUsed '+g.teams().map(t=>Object.entries(t.powers).filter(([k,v])=>v.unlocked).map(([k,v])=>k+(v.cd>0?'*':'')).join('/')).join(' || '));
  return out.join('\n')},[a,b,da,db]);
 console.log('=== '+a+'('+da+') vs '+b+'('+db+')\n'+r);
}
console.log(logs.slice(0,5).join('\n')||'no errors');await browser.close();
