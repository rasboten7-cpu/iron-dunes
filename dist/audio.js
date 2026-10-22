// Procedural battlefield audio (no audio files) + optional Arabic voice announcements via the browser's speech engine.
let ac=null,master=null,noiseBuf=null,amb=null;export const audioState={sound:true,voice:true,volume:.8};
const last=new Map();
function ensure(){if(!audioState.sound)return null;try{if(!ac){ac=new(window.AudioContext||window.webkitAudioContext)();const comp=ac.createDynamicsCompressor();comp.threshold.value=-18;comp.ratio.value=4;master=ac.createGain();master.gain.value=audioState.volume*.6;master.connect(comp);comp.connect(ac.destination);noiseBuf=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}if(ac.state==='suspended')ac.resume();return ac}catch(e){return null}}
function noise(t,dur,{type='lowpass',f0=800,f1=null,q=.7,vol=.3,attack=.003,decay=null}={}){const s=ac.createBufferSource();s.buffer=noiseBuf;s.playbackRate.value=.8+Math.random()*.4;const f=ac.createBiquadFilter();f.type=type;f.frequency.setValueAtTime(f0,t);if(f1)f.frequency.exponentialRampToValueAtTime(f1,t+dur);f.Q.value=q;const g=ac.createGain();g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+attack);g.gain.exponentialRampToValueAtTime(.0001,t+(decay||dur));s.connect(f);f.connect(g);g.connect(master);s.start(t,Math.random()*1.5);s.stop(t+dur+.05)}
function tone(t,dur,{type='sine',f0=200,f1=null,vol=.2,attack=.003}={}){const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.setValueAtTime(f0,t);if(f1)o.frequency.exponentialRampToValueAtTime(f1,t+dur);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+attack);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(master);o.start(t);o.stop(t+dur+.05)}
const LIMIT={rifle:[70,4],mg:[55,4],cannon:[90,3],rocket:[120,3],howitzer:[150,2],boom:[80,4],bigboom:[300,2],autocannon:[80,3]};
// vol: 0..1 distance attenuation computed by the caller
export function sfx(kind,vol=1){if(!audioState.sound||vol<=.03)return;if(!ensure())return;const now=performance.now(),[gap,max]=LIMIT[kind]||[30,6],rec=last.get(kind)||[];const recent=rec.filter(t=>now-t<gap*3);if(recent.length>=max)return;recent.push(now);last.set(kind,recent);const t=ac.currentTime+.005;
 switch(kind){
  case 'rifle':noise(t,.07,{type:'bandpass',f0:2600,q:.9,vol:.22*vol});noise(t,.12,{type:'lowpass',f0:700,vol:.12*vol});break;
  case 'mg':for(let i=0;i<3;i++){noise(t+i*.07,.05,{type:'bandpass',f0:1900,q:.8,vol:.2*vol});noise(t+i*.07,.08,{type:'lowpass',f0:500,vol:.14*vol})}break;
  case 'autocannon':for(let i=0;i<2;i++){noise(t+i*.11,.12,{type:'lowpass',f0:1400,f1:300,vol:.32*vol});tone(t+i*.11,.1,{f0:120,f1:50,vol:.18*vol})}break;
  case 'cannon':noise(t,.5,{type:'lowpass',f0:1200,f1:120,vol:.55*vol,decay:.45});tone(t,.35,{f0:95,f1:32,vol:.45*vol});noise(t,.05,{type:'highpass',f0:3000,vol:.15*vol});break;
  case 'rocket':noise(t,.55,{type:'bandpass',f0:600,f1:2600,q:1.2,vol:.28*vol,attack:.05});noise(t,.08,{type:'lowpass',f0:900,vol:.2*vol});break;
  case 'howitzer':noise(t,.9,{type:'lowpass',f0:700,f1:80,vol:.6*vol,decay:.8});tone(t,.6,{f0:70,f1:24,vol:.5*vol});break;
  case 'boom':noise(t,1.1,{type:'lowpass',f0:900,f1:90,vol:.55*vol,attack:.004,decay:1});tone(t,.5,{f0:80,f1:28,vol:.4*vol});break;
  case 'bigboom':noise(t,2.6,{type:'lowpass',f0:1100,f1:50,vol:.8*vol,attack:.01,decay:2.4});tone(t,1.6,{f0:55,f1:18,vol:.6*vol});noise(t+.15,1.8,{type:'bandpass',f0:300,f1:80,vol:.3*vol});break;
  case 'jet':noise(t,2.8,{type:'bandpass',f0:500,f1:2200,q:.6,vol:.35*vol,attack:.9,decay:2.7});noise(t,2.8,{type:'lowpass',f0:300,vol:.2*vol,attack:1});break;
  case 'flame':noise(t,.35,{type:'bandpass',f0:500,f1:900,q:.5,vol:.3*vol,attack:.03});noise(t,.3,{type:'lowpass',f0:300,vol:.2*vol});break;
  case 'spray':noise(t,.4,{type:'highpass',f0:2400,vol:.16*vol,attack:.05});break;
  case 'sniper':noise(t,.06,{type:'bandpass',f0:3200,q:1.2,vol:.35*vol});noise(t,.5,{type:'lowpass',f0:900,f1:200,vol:.25*vol,decay:.45});break;
  case 'hack':for(let i=0;i<4;i++)tone(t+i*.05,.04,{type:'square',f0:1400+((i*37)%5)*180,vol:.025*vol});break;
  case 'heli':noise(t,.5,{type:'lowpass',f0:180,vol:.18*vol});break;
  case 'click':tone(t,.06,{type:'triangle',f0:900,f1:1300,vol:.08});break;
  case 'select':tone(t,.08,{type:'triangle',f0:620,f1:820,vol:.07});tone(t+.05,.06,{type:'triangle',f0:940,vol:.05});break;
  case 'build':for(let i=0;i<3;i++)tone(t+i*.09,.07,{type:'square',f0:300+i*90,vol:.04});break;
  case 'ready':tone(t,.12,{type:'triangle',f0:660,vol:.08});tone(t+.12,.18,{type:'triangle',f0:990,vol:.08});break;
  case 'alert':for(let i=0;i<2;i++){tone(t+i*.28,.2,{type:'square',f0:520,vol:.05});tone(t+i*.28+.12,.14,{type:'square',f0:390,vol:.05})}break;
  case 'error':tone(t,.18,{type:'square',f0:180,f1:120,vol:.05});break;
  case 'siren':for(let i=0;i<3;i++)tone(t+i*.6,.6,{type:'sawtooth',f0:420,f1:780,vol:.05});break;
  case 'promote':[523,659,784,1046].forEach((f,i)=>tone(t+i*.09,.25,{type:'triangle',f0:f,vol:.07}));break;
  case 'cash':for(let i=0;i<4;i++)tone(t+i*.06,.08,{type:'triangle',f0:1200+i*200,vol:.05});break;
  default:tone(t,.08,{f0:500,vol:.05})}}
export function ambience(on){if(!ensure())return;if(on&&!amb){const s=ac.createBufferSource();s.buffer=noiseBuf;s.loop=true;const f=ac.createBiquadFilter();f.type='lowpass';f.frequency.value=380;const g=ac.createGain();g.gain.value=.035;const lfo=ac.createOscillator(),lg=ac.createGain();lfo.frequency.value=.07;lg.gain.value=160;lfo.connect(lg);lg.connect(f.frequency);lfo.start();s.connect(f);f.connect(g);g.connect(master);s.start();amb={s,lfo,g}}else if(!on&&amb){try{amb.s.stop();amb.lfo.stop()}catch(e){}amb=null}}
export function setSound(on){audioState.sound=on;if(!on)ambience(false);if(master)master.gain.value=on?audioState.volume*.6:0}
// Voice: pre-recorded Arabic lines (assets/voice/*.mp3, generated offline with a neural voice and radio-processed).
// Played through Web Audio one at a time; announcer lines queue, unit acknowledgements are skipped when busy.
const VOICE_KEYS=['built','unit','vehicle','builder','harvester','attack','uattack','upgrade','promo','money','lowpower','lostb','lostu','enemyPower','wave','enemysw','enemyready','swready','nuke','nukeEnemy','start','win','lose','newpower','garrison','cantbuild','sel1','sel2','sel3','mov1','mov2','mov3','atk1','atk2','atk3','dozer','dozerGo'];
const voiceBuf={},spoken=new Map();let voiceLoading=false,voiceBusyUntil=0,voiceSrc=null;const voiceQueue=[];
export function loadVoices(base='assets/voice/'){if(voiceLoading||!ensure())return;voiceLoading=true;for(const k of VOICE_KEYS){fetch(base+k+'.mp3').then(r=>r.ok?r.arrayBuffer():Promise.reject()).then(b=>new Promise((res,rej)=>ac.decodeAudioData(b,res,rej))).then(buf=>{voiceBuf[k]=buf}).catch(()=>{})}}
function playVoice(k,rate=1){const buf=voiceBuf[k];if(!buf||!ensure())return false;const src=ac.createBufferSource();src.buffer=buf;src.playbackRate.value=rate;const g=ac.createGain();g.gain.value=1.25;src.connect(g);g.connect(master);src.start();voiceSrc=src;voiceBusyUntil=performance.now()+buf.duration/rate*1000+150;src.onended=()=>{if(voiceSrc===src)voiceSrc=null;setTimeout(pump,120)};return true}
function pump(){if(performance.now()<voiceBusyUntil||!voiceQueue.length)return;const k=voiceQueue.shift();playVoice(k)}
export function hasArabicVoice(){return Object.keys(voiceBuf).length>0}
// announcer line. key = line id; gap = minimum ms before the same line repeats; priority interrupts whatever is playing.
export function say(key,gap=7000,priority=false){if(!audioState.voice||!audioState.sound||!voiceBuf[key])return;const now=performance.now();if(now-(spoken.get(key)||-1e9)<gap)return;spoken.set(key,now);if(priority){try{voiceSrc?.stop()}catch(e){}voiceQueue.length=0;voiceBusyUntil=0;playVoice(key);return}if(now<voiceBusyUntil){if(voiceQueue.length<2&&!voiceQueue.includes(key))voiceQueue.push(key);return}playVoice(key)}
// unit acknowledgement ("نعم سيدي", "في الطريق"...). Skipped while the announcer talks; light pitch variation per unit class.
let lastAck=0;export function ack(kind,heavy=false){if(!audioState.voice||!audioState.sound)return;const now=performance.now();if(now-lastAck<1300||now<voiceBusyUntil)return;const pool={select:['sel1','sel2','sel3'],move:['mov1','mov2','mov3'],attack:['atk1','atk2','atk3'],dozer:['dozer'],dozerGo:['dozerGo']}[kind];if(!pool)return;const k=pool[Math.floor(Math.random()*pool.length)];if(playVoice(k,heavy?.94:1.03))lastAck=now}
