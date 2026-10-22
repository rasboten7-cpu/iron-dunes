import sys, math, numpy as np
from PIL import Image, ImageDraw, ImageFilter
OUT=sys.argv[1]
CELL=627; SS=2; R=CELL*SS
E=math.radians(50)
PX=31.0*SS        # pixels per world unit
GY=0.60*R          # ground centre on screen (anchor ~0.40)
rng=np.random.default_rng(7)
LIGHT=np.array([-0.55,0.75,-0.35]); LIGHT/=np.linalg.norm(LIGHT)
def proj(p,yaw):
    x,y,z=p; c,s=math.cos(yaw),math.sin(yaw)
    xr=x*c-z*s; zr=x*s+z*c
    sx=R/2+xr*PX; sy=GY+(zr*math.sin(E)-y*math.cos(E))*PX
    depth=zr*math.cos(E)+y*math.sin(E)
    return sx,sy,depth
def shade(col,normal,yaw,amb=0.48):
    # light fixed in world relative to camera (upper-left), so rotate normal with yaw
    x,y,z=normal; c,s=math.cos(yaw),math.sin(yaw)
    n=np.array([x*c-z*s,y,x*s+z*c]); n/=np.linalg.norm(n)+1e-9
    k=amb+(1-amb)*max(0,float(n@LIGHT))
    return tuple(int(min(255,ch*k)) for ch in col)
faces=[]
def face(pts,col,normal,tex=1.0,bias=0.0):
    faces.append((pts,col,normal,tex,bias))
def box(cx,cz,w,d,h,y0,col,top=None,bias=0):
    x0,x1,z0,z1=cx-w/2,cx+w/2,cz-d/2,cz+d/2; y1=y0+h
    face([(x0,y1,z0),(x1,y1,z0),(x1,y1,z1),(x0,y1,z1)],top or col,(0,1,0),bias=bias)
    face([(x0,y0,z1),(x1,y0,z1),(x1,y1,z1),(x0,y1,z1)],col,(0,0,1),bias=bias)
    face([(x0,y0,z0),(x1,y0,z0),(x1,y1,z0),(x0,y1,z0)],col,(0,0,-1),bias=bias)
    face([(x1,y0,z0),(x1,y0,z1),(x1,y1,z1),(x1,y1,z0)],col,(1,0,0),bias=bias)
    face([(x0,y0,z0),(x0,y0,z1),(x0,y1,z1),(x0,y1,z0)],col,(-1,0,0),bias=bias)
def cyl(cx,cz,r,y0,h,col,n=40,top=None,bias=0):
    y1=y0+h
    for i in range(n):
        a0=2*math.pi*i/n; a1=2*math.pi*(i+1)/n; am=(a0+a1)/2
        face([(cx+r*math.cos(a0),y0,cz+r*math.sin(a0)),(cx+r*math.cos(a1),y0,cz+r*math.sin(a1)),(cx+r*math.cos(a1),y1,cz+r*math.sin(a1)),(cx+r*math.cos(a0),y1,cz+r*math.sin(a0))],col,(math.cos(am),0,math.sin(am)),bias=bias)
    if top is not None:
        face([(cx+r*math.cos(2*math.pi*i/n),y1,cz+r*math.sin(2*math.pi*i/n)) for i in range(n)],top,(0,1,0),bias=bias+0.01)
def ring_top(cx,cz,r0,r1,y,cols,n=48,bias=0.02):
    for i in range(n):
        a0=2*math.pi*i/n; a1=2*math.pi*(i+1)/n
        face([(cx+r0*math.cos(a0),y,cz+r0*math.sin(a0)),(cx+r1*math.cos(a0),y,cz+r1*math.sin(a0)),(cx+r1*math.cos(a1),y,cz+r1*math.sin(a1)),(cx+r0*math.cos(a1),y,cz+r0*math.sin(a1))],cols[i%len(cols)],(0,1,0),bias=bias)
CONC=(184,172,148); CONC2=(146,138,118); DARK=(58,60,56); STEEL=(112,118,110); OLIVE=(92,98,72); YEL=(214,168,52); BLK=(36,34,30)
def build():
    faces.clear()
    # octagonal slab
    oct=[(7.6*math.cos(math.pi/8+i*math.pi/4),7.6*math.sin(math.pi/8+i*math.pi/4)) for i in range(8)]
    for i in range(8):
        (x0,z0),(x1,z1)=oct[i],oct[(i+1)%8]; am=math.atan2((z0+z1)/2,(x0+x1)/2)
        face([(x0,0,z0),(x1,0,z1),(x1,.8,z1),(x0,.8,z0)],CONC2,(math.cos(am),0,math.sin(am)))
    face([(x,.8,z) for x,z in oct],CONC,(0,1,0),bias=-.5)
    # painted lines on slab
    for k in range(4):
        a=k*math.pi/2+math.pi/4
        x,z=6.6*math.cos(a),6.6*math.sin(a)
        box(x,z,.9,.9,.08,.8,YEL,bias=.1)
    # collar
    cyl(0,0,4.3,.8,1.1,CONC2,top=None)
    ring_top(0,0,3.3,4.3,1.9,[CONC]*1,bias=.05)
    ring_top(0,0,3.0,3.35,1.92,[YEL,BLK],n=36,bias=.08)
    # recessed shaft (dark) + blast doors (two half discs, slightly parted)
    face([(3.0*math.cos(2*math.pi*i/40),1.85,3.0*math.sin(2*math.pi*i/40)) for i in range(40)],(22,22,20),(0,1,0),bias=.06)
    for side in (-1,1):
        pts=[]
        for i in range(21):
            a=-math.pi/2+math.pi*i/20
            pts.append((side*(0.18+2.85*math.cos(a)),2.0,2.85*math.sin(a)))
        face(pts,STEEL,(0,1,0),bias=.12)
        # door ribs
        for j in range(-2,3):
            box(side*1.5,j*1.05,2.4,.16,.08,2.0,(84,88,82),bias=.15)
        box(side*.32,0,.18,5.4,.16,2.0,(70,72,66),bias=.16)
    # control bunker (bermed) & antenna
    box(-5.2,3.6,3.6,2.6,1.6,.8,OLIVE,top=(110,114,90),bias=.2)
    box(-5.2,3.6,1.6,.2,0.9,.8,DARK,bias=.25)
    box(-4.2,3.2,.6,.6,.5,2.4,STEEL,bias=.3)
    cyl(-6.3,2.8,.08,2.4,4.2,STEEL,n=8,bias=.35)
    # fuel/vent tanks
    cyl(5.3,-3.2,.85,.8,1.9,(150,152,140),n=24,top=(176,178,166),bias=.2)
    cyl(5.6,-1.2,.7,.8,1.6,(150,152,140),n=24,top=(176,178,166),bias=.2)
    # sandbag/barrier rows
    for i in range(6):
        box(-2.5+i*1.0,-6.6,.9,.6,.55,.8,(160,146,112),bias=.1)
    # floodlights
    for (x,z) in [(5.8,4.6),(-1.0,-6.0)]:
        cyl(x,z,.07,.8,3.0,STEEL,n=6,bias=.3); box(x,z,.6,.3,.35,3.8,DARK,bias=.35)
def render(yaw):
    build()
    img=Image.new('RGBA',(R,R),(0,0,0,0))
    shadow=Image.new('L',(R,R),0)
    sd=ImageDraw.Draw(shadow)
    # contact shadow
    pts=[proj((7.9*math.cos(a)+.8,0,7.9*math.sin(a)+.8),yaw)[:2] for a in np.linspace(0,2*math.pi,40)]
    sd.polygon(pts,fill=110)
    shadow=shadow.filter(ImageFilter.GaussianBlur(14*SS))
    sh=Image.new('RGBA',(R,R),(30,26,20,0)); sh.putalpha(shadow)
    img.alpha_composite(sh)
    d=ImageDraw.Draw(img)
    items=[]
    for pts,col,normal,tex,bias in faces:
        P=[proj(p,yaw) for p in pts]
        depth=sum(p[2] for p in P)/len(P)+(1000*bias if bias>=0.05 and bias<0.2 and abs(normal[1])>0.5 and pts[0][1]>1.8 else bias*10)
        items.append((depth,[p[:2] for p in P],shade(col,normal,yaw)))
    items.sort(key=lambda t:t[0])
    for depth,P,col in items:
        d.polygon(P,fill=col+(255,))
    a=np.array(img).astype(np.float32)
    mask=a[:,:,3]>0
    noise=rng.normal(0,11,a.shape[:2]); blot=np.array(Image.fromarray((rng.random((R//24,R//24))*255).astype(np.uint8)).resize((R,R),Image.BICUBIC)).astype(np.float32)/255-.5
    for ch in range(3):
        a[:,:,ch]=np.where(mask&(a[:,:,3]>200),np.clip(a[:,:,ch]*(0.92+blot*0.25)+noise,0,255),a[:,:,ch])
    img=Image.fromarray(a.astype(np.uint8),'RGBA').resize((CELL,CELL),Image.LANCZOS)
    return img
sheet=Image.new('RGBA',(CELL*2,CELL*2),(0,0,0,0))
# cells: front-right, rear-right, rear-left, front-left
for i,yaw in enumerate([math.radians(45),math.radians(135),math.radians(225),math.radians(315)]):
    sheet.alpha_composite(render(yaw),((i%2)*CELL,(i//2)*CELL))
sheet.save(OUT)
