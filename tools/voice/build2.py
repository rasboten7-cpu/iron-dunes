import subprocess, os, re, difflib, numpy as np, soundfile as sf, sherpa_onnx, json
from lines2 import LINES
M='vits-piper-ar_JO-kareem-medium/';W='sherpa-onnx-whisper-small/'
def mk(ls): return sherpa_onnx.OfflineTts(sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(vits=sherpa_onnx.OfflineTtsVitsModelConfig(model=M+'ar_JO-kareem-medium.onnx',tokens=M+'tokens.txt',data_dir=M+'espeak-ng-data',length_scale=ls,noise_scale=.5,noise_scale_w=.6),num_threads=4)))
tts={'eva':mk(1.08),'unit':mk(0.95)}
rec=sherpa_onnx.OfflineRecognizer.from_whisper(encoder=W+'small-encoder.int8.onnx',decoder=W+'small-decoder.int8.onnx',tokens=W+'small-tokens.txt',language='ar',task='transcribe',num_threads=4)
strip=lambda t:re.sub(r'[ً-ْٰ]','',t)
norm=lambda t:re.sub(r'[^ء-ي]','',strip(t)).replace('أ','ا').replace('إ','ا').replace('آ','ا').replace('ة','ه').replace('ى','ي').replace('ؤ','و').replace('ئ','ي')
AF={'eva':"asetrate=22050*0.94,aresample=44100,highpass=f=120,lowpass=f=7000,equalizer=f=2600:t=q:w=1.2:g=3,acompressor=threshold=-18dB:ratio=3:attack=5:release=80:makeup=3,aecho=0.8:0.45:22|41:0.18|0.10,apad=pad_dur=0.12",
    'unit':"asetrate=22050*0.97,aresample=44100,highpass=f=300,lowpass=f=3400,acompressor=threshold=-22dB:ratio=5:attack=2:release=60:makeup=5,acrusher=bits=11:mix=0.15,apad=pad_dur=0.06"}
os.makedirs('final',exist_ok=True);report={}
import sys
ONLY=sys.argv[1:]
for k,(cands,style) in LINES.items():
    if ONLY and k not in ONLY: continue
    best=None
    for i,text in enumerate(cands):
        for ls_try in (None,):
            a=tts[style].generate(text,sid=0,speed=1.0);s=np.array(a.samples,dtype=np.float32);s=s/(np.abs(s).max()+1e-6)*.9
            sf.write('tmp.wav',s,a.sample_rate)
            subprocess.run(['ffmpeg','-loglevel','error','-y','-i','tmp.wav','-af',AF[style],'-ac','1','-ar','44100','-b:a','64k',f'tmp_{i}.mp3'],check=True)
            wav=subprocess.run(['ffmpeg','-loglevel','error','-i',f'tmp_{i}.mp3','-ac','1','-ar','16000','-f','f32le','-'],capture_output=True).stdout
            st=rec.create_stream();st.accept_waveform(16000,np.frombuffer(wav,dtype=np.float32));rec.decode_stream(st);r=st.result.text
            score=difflib.SequenceMatcher(None,norm(text),norm(r)).ratio()
            if not best or score>best[0]+.02: best=(score,i,text,r)
            if score>=.97: break
        if best[0]>=.97: break
    os.replace(f'tmp_{best[1]}.mp3',f'final/{k}.mp3');report[k]=(round(best[0],2),strip(best[2]),best[3])
    print(f'{best[0]:.2f}',k.ljust(11),strip(best[2]),'=>',best[3],flush=True)
json.dump(report,open('report_'+('_'.join(ONLY) if ONLY else 'all')[:40]+'.json','w'),ensure_ascii=False,indent=1)
