import sys
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
import numpy as np
import os
SRC=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..','dist','assets','realism')+os.sep
OUT=sys.argv[1]
im=Image.open(SRC+'infantry.png').convert('RGBA')
W=im.size[0]; C=W//2
# desert-tan recolor: shift camo toward tan/khaki so rocket troops read differently
a=np.array(im).astype(np.float32)
rgb=a[:,:,:3]
lum=rgb.mean(axis=2,keepdims=True)
tan=np.array([1.18,1.02,0.78])
rgb2=np.clip(lum*tan*0.95+ (rgb-lum)*0.35,0,255)
a[:,:,:3]=rgb2
base=Image.fromarray(a.astype(np.uint8),'RGBA')
S=2.0
def tube(layer,p0,p1,r):
    d=ImageDraw.Draw(layer)
    p0=np.array(p0)*S; p1=np.array(p1)*S; r*=S
    v=p1-p0; L=np.linalg.norm(v); u=v/L; n=np.array([-u[1],u[0]])
    # body with simple cylindrical shading: draw several parallel strips
    strips=14
    for i in range(strips):
        t=(i+.5)/strips*2-1
        shade=0.55+0.45*np.cos((t+0.35)*1.4)
        col=(int(92*shade),int(90*shade),int(66*shade),255)
        off=n*t*r
        w=max(1,int(2*r/strips)+2)
        d.line([tuple(p0+off),tuple(p1+off)],fill=col,width=w)
    # end caps/rings
    for t,cr in [(0.0,1.25),(0.06,1.1),(0.92,1.15),(1.0,1.3)]:
        c=p0+v*t
        q=[tuple(c+n*r*cr+u*r*0.25),tuple(c-n*r*cr+u*r*0.25),tuple(c-n*r*cr-u*r*0.25),tuple(c+n*r*cr-u*r*0.25)]
        d.polygon(q,fill=(40,44,32,255))
    # sight box
    c=p0+v*0.45
    q=[tuple(c-n*r*1.0+u*r*1.2),tuple(c-n*r*2.0+u*r*1.2),tuple(c-n*r*2.0-u*r*1.0),tuple(c-n*r*1.0-u*r*1.0)]
    d.polygon(q,fill=(34,36,30,255))
    # warhead at front
    c=p1
    d.ellipse([tuple(c-np.array([r*1.1,r*1.1])),tuple(c+np.array([r*1.1,r*1.1]))],fill=(70,64,44,255))
cells={0:((150,75),(375,195)),1:((520,180),(735,70)),2:((470,180),(255,70)),3:((1105-627+0,75+0),(250-0,195))}
# coords in a 627px cell space (cell-local)
cells={
 0:((165,112),(400,215)),
 1:((395,205),(560,105)),
 2:((235,205),(70,105)),
 3:((470,112),(235,215)),
}
radius=13
out=base.copy()
for k,(p0,p1) in cells.items():
    cx=(k%2)*C; cy=(k//2)*C
    layer=Image.new('RGBA',(int(C*S),int(C*S)),(0,0,0,0))
    tube(layer,p0,p1,radius)
    layer=layer.resize((C,C),Image.LANCZOS)
    la=np.array(layer).astype(np.float32)
    noise=np.random.default_rng(k).normal(0,9,la.shape[:2])[:,:,None]
    la[:,:,:3]=np.clip(la[:,:,:3]+noise,0,255)
    layer=Image.fromarray(la.astype(np.uint8),'RGBA')
    cell=out.crop((cx,cy,cx+C,cy+C))
    # back-facing views: launcher sits behind head partially -> draw tube under? keep on top for readability
    cell.alpha_composite(layer)
    out.paste(cell,(cx,cy))
out.save(OUT)
