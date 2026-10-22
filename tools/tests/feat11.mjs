import { chromium } from '/opt/npm-tools/node_modules/playwright/index.mjs';
const browser=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width:1280,height:760}});const logs=[];page.on('pageerror',e=>logs.push('ERR '+e.message+' '+(e.stack||'').slice(0,400)));page.on('console',m=>{if(m.type()==='error')logs.push('CONSOLE '+m.text())});
await page.goto('http://127.0.0.1:8123/');await page.waitForFunction(()=>!document.getElementById('start').disabled,null,{timeout:240000});
console.log('DRAGON: '+await page.evaluate(async()=>{const g=window.game,E=()=>g.entities();await g.start({faction:'dragon',enemyFaction:'falcon',map:'valley'});const tm=g.teams()[0];tm.money=90000;const hq=E().find(e=>e.team===0&&e.type==='hq');const S=(t,dx,dz,team=0)=>g.spawn(t,team,hq.x+dx,hq.z+dz);const out=[];
 S('power',18,0);S('refinery',-20,-4);const f=S('factory',0,-24);const rd=S('radar',22,-24);S('barracks',-22,-26);
 // bunker
 const bk=S('bunker',0,34);const sq=[0,1,2].map(i=>S('infantry',4+i,30));sq.forEach(u=>g.enterBuilding(u,bk));g.simulate(4);out.push('bunker '+bk.garrison.length+'/5');const et=S('infantry',0,46,1);et.hold=true;g.simulate(4);out.push('bunker fire: enemy inf hp '+Math.max(0,Math.round(et.hp)));
 // crawler from factory
 g.enqueueUnit('crawler',0);g.simulate(16);const cr=E().find(e=>e.team===0&&e.type==='crawler');out.push('crawler '+!!cr+' crew '+(cr?.garrison.length));if(cr){cr.x+=6;g.simulate(.5);const l=g.evacuate(cr);out.push('unloaded '+l.length+' visible '+l.filter(u=>u.root.visible).length)}
 // overlord add-on
 const ov=S('heavy',-20,40);const okA=g.addAddon(ov,'gat');g.simulate(.2);const ei=[S('infantry',-20,52,1),S('infantry',-18,53,1)];ei.forEach(u=>u.hold=true);g.simulate(5);out.push('addon '+okA+' model '+ov.root.userData.asset+' enemy inf hp '+ei.map(u=>Math.max(0,Math.round(u.hp))).join(','));
 const ov2=S('heavy',-30,40);g.addAddon(ov2,'bnk');const r2=[S('infantry',-26,38),S('infantry',-27,38)];r2.forEach(u=>g.enterBuilding(u,ov2));g.simulate(3);out.push('overlord bunker '+ov2.garrison.length+'/'+g.capOf(ov2));
 // nuke cannon
 const nc=S('nukecannon',40,40);const eb=S('barracks',40,88,1);g.simulate(.1);nc.target=eb;nc.forced=true;const h0=eb.hp;g.simulate(14);out.push('nukecannon: enemy barracks '+Math.round(h0)+' -> '+Math.round(eb.hp));
 // overcharge
 const p0=document.getElementById('power').textContent;const pp=E().find(e=>e.team===0&&e.type==='power');pp.over=true;g.simulate(1);out.push('power '+p0+' -> overcharge '+document.getElementById('power').textContent+' hp '+Math.round(pp.hp/pp.maxhp*100)+'%');pp.over=false;
 // mines upgrade
 g.research('mines',0);g.simulate(27);out.push('mines on hq '+hq.mines);const mt=S('tank',hq.r+1.5,0,1);mt.hold=true;mt.x=hq.x+hq.r+1.2;mt.z=hq.z;const mh=mt.hp;g.simulate(1);out.push('mine hit tank '+Math.round(mh)+'->'+Math.round(mt.hp)+' left '+hq.mines);g.kill(mt);
 // powers
 tm.rank=5;tm.points=9;for(const id of ['clustermines','cashhack','emp'])g.unlockPower(0,id);
 const mx=hq.x+60,mz=hq.z+60;tm.powers.clustermines.cd=0;g.usePower(0,'clustermines',{x:mx,z:mz});g.simulate(6);out.push('mines laid '+g.mines().length);const vt=S('tank',60,60,1);vt.hold=true;g.simulate(1.5);out.push('minefield tank hp '+Math.round(vt.hp)+'/'+Math.round(vt.maxhp)+' mines '+g.mines().length);
 const ehq=E().find(e=>e.team===1&&e.type==='hq');g.teams()[1].money=5000;const m0=tm.money;tm.powers.cashhack.cd=0;const ch=g.usePower(0,'cashhack',{x:ehq.x,z:ehq.z});out.push('cashhack '+ch+' +'+Math.round(tm.money-m0)+' enemy left '+Math.round(g.teams()[1].money));
 const ex=ehq.x-20,ez=ehq.z;const etank=g.spawn('tank',1,ex,ez),ejet=g.spawn('raptor',1,ex+3,ez+2);ejet.alt=10;tm.powers.emp.cd=0;g.usePower(0,'emp',{x:ex,z:ez});g.simulate(6);out.push('emp: tank stunned '+(etank.stun>g.snapshot().time)+' raptor dead '+(ejet.hp<=0)+' hq off '+((ehq.off||0)>g.snapshot().time));
 g.select([etank]);return out.join(' | ')}));
console.log('FALCON: '+await page.evaluate(async()=>{const g=window.game,E=()=>g.entities();await g.start({faction:'falcon',enemyFaction:'sand',map:'valley'});const tm=g.teams()[0];tm.money=90000;const hq=E().find(e=>e.team===0&&e.type==='hq');const S=(t,dx,dz,team=0)=>g.spawn(t,team,hq.x+dx,hq.z+dz);const out=[];
 S('power',18,0);S('barracks',-22,-26);const rd=S('radar',22,-24);S('factory',0,-24);
 // humvee transport
 const hv=S('jeep',0,30);const rg=[0,1,2].map(i=>S('infantry',3+i,28));rg.forEach(u=>g.enterBuilding(u,hv));g.simulate(4);out.push('humvee '+hv.garrison.length+'/'+g.capOf(hv));const target=S('infantry',0,46,1);target.hold=true;hv.hold=true;g.simulate(2.5);out.push('humvee+rangers fire: enemy hp '+Math.max(0,Math.round(target.hp)));hv.hold=false;g.giveOrderAt;hv.destination=null;
 // sniper stealth
 const sn=S('sniper',-40,30);const tk=S('tank',-40,60,1);g.simulate(1.2);out.push('sniper hidden '+sn.hidden+' tank target '+(tk.target===sn));const spot=S('infantry',-40,33,1);g.simulate(1);out.push('spotted '+!!sn.seenBy?.size);
 // flashbang vs garrisoned civilian
 const civ=E().find(e=>e.type==='civilian');const g1=[0,1,2].map(i=>g.spawn('infantry',1,civ.x+6+i,civ.z+6));g1.forEach(u=>g.enterBuilding(u,civ));g.simulate(5);out.push('enemy garrison '+civ.garrison.length+' team '+civ.team);tm.upgrades.add('flashbang');const rr=[0,1,2,3].map(i=>g.spawn('infantry',0,civ.x-12+i,civ.z-10));rr.forEach(u=>{u.target=civ;u.forced=true});g.simulate(8);out.push('after flashbang garrison '+civ.garrison.length+' team '+civ.team);
 // powers
 tm.rank=5;tm.points=9;g.unlockPower(0,'spectre');g.unlockPower(0,'leaflet');const ehq=E().find(e=>e.team===1&&e.type==='hq');const grp=[0,1,2,3].map(i=>g.spawn('tank',1,ehq.x-25+i*2,ehq.z+4));grp.forEach(u=>u.hold=true);tm.powers.leaflet.cd=0;g.usePower(0,'leaflet',{x:ehq.x-22,z:ehq.z+4});g.simulate(6);out.push('leaflet stunned '+grp.filter(u=>u.stun>g.snapshot().time).length+'/4');
 tm.powers.spectre.cd=0;const h0=grp.reduce((n,u)=>n+u.hp,0);g.usePower(0,'spectre',{x:ehq.x-22,z:ehq.z+4});g.simulate(15);out.push('spectre damage '+Math.round(h0-grp.reduce((n,u)=>n+Math.max(0,u.hp),0)));
 return out.join(' | ')}));
console.log('SAND: '+await page.evaluate(async()=>{const g=window.game,E=()=>g.entities();await g.start({faction:'sand',enemyFaction:'dragon',map:'valley'});const tm=g.teams()[0];tm.money=90000;const hq=E().find(e=>e.team===0&&e.type==='hq');const S=(t,dx,dz,team=0)=>g.spawn(t,team,hq.x+dx,hq.z+dz);const out=[];
 S('barracks',-20,0);S('factory',0,-24);S('radar',22,-24);
 const bus=S('bus',0,30);const pass=[0,1,2,3].map(i=>S('infantry',3+i,28));pass.forEach(u=>g.enterBuilding(u,bus));g.simulate(4);out.push('bus '+bus.garrison.length+'/8');const tgt=S('infantry',0,46,1);tgt.hold=true;g.simulate(3);out.push('bus fire: enemy hp '+Math.max(0,Math.round(tgt.hp)));
 g.kill(bus);out.push('husk '+bus.husked+' hp '+Math.round(bus.hp/bus.maxhp*100)+'% inside '+bus.garrison.length+' alive '+E().includes(bus));g.kill(bus);out.push('bus destroyed, passengers out '+pass.filter(u=>!u.inside&&u.hp>0).length);
 const sc=S('scudlauncher',40,30);const eb=S('barracks',40,82,1);g.simulate(.1);sc.target=eb;sc.forced=true;const h0=eb.hp;g.simulate(12);out.push('scud: enemy barracks '+Math.round(h0)+' -> '+Math.round(eb.hp));
 tm.upgrades.add('camo');const rb=S('infantry',-30,40);g.simulate(1);out.push('camo rebel hidden '+rb.hidden);
 tm.rank=5;tm.points=9;g.unlockPower(0,'sneak');S('tunnel',-40,20);g.simulate(.2);const ehq=E().find(e=>e.team===1&&e.type==='hq');tm.powers.sneak.cd=0;const ok=g.usePower(0,'sneak',{x:ehq.x+14,z:ehq.z+4});out.push('sneak '+ok+' tunnels '+E().filter(e=>e.team===0&&e.type==='tunnel').length);
 return out.join(' | ')}));
await page.screenshot({path:'/tmp/claude-0/-home-claude/b02f0919-a5d1-5887-a395-0ea06de66044/scratchpad/feat11.png'});
console.log(logs.slice(0,6).join('\n')||'no errors');await browser.close();
