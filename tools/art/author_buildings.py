"""Original offline-authored RTS architecture. Exports real, static UV-mapped OBJ meshes.
No Generals assets are included. Run from any directory with Python 3.
"""
import math,json
from pathlib import Path
from collections import defaultdict
P=Path(__file__).resolve().parents[2]/'dist/assets/architecture';P.mkdir(parents=True,exist_ok=True)
pi=math.pi
class Mesh:
 def __init__(self):self.faces=defaultdict(list)
 def poly(self,p,m='wall',g='main'):
  for i in range(1,len(p)-1):self.faces[g+'_'+m].append((p[0],p[i],p[i+1]))
 def loft(self,rings,m='wall',g='main',caps=True):
  for a,b in zip(rings,rings[1:]):
   for i in range(len(a)):j=(i+1)%len(a);self.poly([a[i],b[i],b[j],a[j]],m,g)
  if caps:self.poly(rings[0],m,g);self.poly(rings[-1][::-1],m,g)
 def box(self,x,y,z,w,h,d,m='wall',g='main',a=0):
  ring=[(-w/2,-d/2),(w/2,-d/2),(w/2,d/2),(-w/2,d/2)]
  self.loft([[(x+u*math.cos(a)+v*math.sin(a),yy,z-u*math.sin(a)+v*math.cos(a)) for u,v in ring]for yy in[y,y+h]],m,g)
 def cyl(self,x,y,z,r,rt,h,m='metal',n=20,g='main'):
  self.loft([[(x+rr*math.cos(i*2*pi/n),yy,z+rr*math.sin(i*2*pi/n))for i in range(n)]for rr,yy in[(r,y),(rt,y+h)]],m,g)
 def rod(self,a,b,r=.045,m='metal',g='main'):
  import numpy as np
  a,b=np.array(a),np.array(b);v=b-a;v=v/np.linalg.norm(v);u=np.cross(v,[0,1,0] if abs(v[1])<.95 else[1,0,0]);u/=np.linalg.norm(u);w=np.cross(v,u)
  self.loft([[tuple(c+r*(u*math.cos(i*pi/4)+w*math.sin(i*pi/4)))for i in range(8)]for c in[a,b]],m,g)
 def save(self,p):
  out=['# Original Niran al-Harb architecture; metres, Y up'];idx=1
  for name,fs in self.faces.items():
   out+=['o '+name,'usemtl '+name.split('_',1)[1]]
   for t in fs:
    a,b,c=t;u=[b[i]-a[i]for i in range(3)];v=[c[i]-a[i]for i in range(3)];normal=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];axis=max(range(3),key=lambda i:abs(normal[i]));axes=[i for i in range(3)if i!=axis]
    for q in t:out.append('v '+' '.join(f'{x:.4f}'for x in q));out.append(f'vt {q[axes[0]]*.27:.4f} {q[axes[1]]*.27:.4f}')
    out.append('f '+' '.join(f'{i}/{i}'for i in range(idx,idx+3)));idx+=3
  p.write_text('\n'.join(out));return (idx-1)//3

def base(m,w=13,d=11):
 m.box(0,0,0,w,.22,d,'stone');m.box(0,.22,0,w-.25,.09,d-.25,'paving')
 for z in[-d/2,d/2]:m.box(0,.22,z,w,.17,.18,'edge')
 for x in[-w/2,w/2]:m.box(x,.22,0,.18,.17,d,'edge')
 for x in range(-int(w/2)+1,int(w/2)):m.box(x,.313,0,.018,.006,d-.4,'pavingline')
 for z in range(-int(d/2)+1,int(d/2)):m.box(0,.313,z,w-.4,.006,.018,'pavingline')
def block(m,x,z,w,d,h=2.5,y=.32,windows=True):
 m.box(x,y,z,w,h,d);m.box(x,y,z,w+.12,.25,d+.12,'stone');m.box(x,y+h-.14,z,w+.16,.18,d+.16,'edge')
 if windows:
  for xx in[-1,0,1]:
   for zz in[-1,1]:
    m.box(x+xx*w*.27,y+h*.55,z+zz*(d/2+.018),.5,.75,.07,'recess');m.box(x+xx*w*.27,y+h*.55+.08,z+zz*(d/2+.06),.33,.55,.03,'glass');m.box(x+xx*w*.27,y+h*.55-.04,z+zz*(d/2+.08),.64,.09,.2,'edge')
  for zz in[-.25,.25]:
   for xx in[-1,1]:m.box(x+xx*(w/2+.02),y+h*.55,z+zz*d,.07,.75,.48,'recess')
 return y+h

def flat(m,x,z,w,d,y):
 m.box(x,y,z,w+.2,.12,d+.2,'roof')
 for zz in[-d/2,d/2]:m.box(x,y,z+zz,w+.25,.36,.15,'wall');m.box(x,y+.26,z+zz,w+.3,.08,.19,'team')
 for xx in[-w/2,w/2]:m.box(x+xx,y,z,.15,.36,d,'wall')
def hip(m,x,z,w,d,y):
 def ring(w,d,y):return[(x-w/2,y,z-d/2),(x+w/2,y,z-d/2),(x+w/2,y,z+d/2),(x-w/2,y,z+d/2)]
 m.box(x,y-.16,z,w+.3,.18,d+.3,'team');m.loft([ring(w+.4,d+.4,y),ring(max(.5,w-1.8),max(.5,d-1.8),y+.95)],'roof')
 for t in[.25,.5,.75]:
  ww=w+.4-2.2*t;dd=d+.4-2.2*t
  for zz in[-dd/2,dd/2]:m.box(x,y+.95*t,z+zz,ww,.035,.045,'ridge')
 m.box(x,y+.98,z,max(.6,w-1.8),.12,.13,'team')
def dome(m,x,z,r,y):
 rings=[]
 for j in range(9):a=j*pi/16;rr=max(.015,r*math.cos(a));rings.append([(x+rr*math.cos(i*pi/12),y+r*.85*math.sin(a),z+rr*math.sin(i*pi/12))for i in range(24)])
 m.loft(rings,'dome');m.cyl(x,y-.12,z,r*1.05,r*1.05,.18,'team',24)
def roof(m,f,x,z,w,d,y):
 if f=='dragon':hip(m,x,z,w,d,y)
 else:flat(m,x,z,w,d,y)
def vent(m,x,z,y,w=1):
 m.box(x,y,z,w,.45,.8,'metal')
 for k in range(6):m.box(x-w*.4+k*w*.16,y+.46,z,.035,.02,.7,'dark')
def door(m,x,z,y=.32,w=1.3):
 m.box(x,y,z,w+.35,1.85,.25,'stone');m.box(x,y+.06,z+.14,w,1.65,.05,'recess');m.box(x,y+.08,z+.18,w*.8,1.48,.04,'door')
 for xx in[-1,1]:m.box(x+xx*(w/2+.3),y+1.6,z+.17,.14,.2,.12,'lamp')
def stairs(m,x,z,w=2):
 for i in range(5):m.box(x,.08,z+i*.3,w,.7-i*.13,.34,'paving')
 for xx in[-w/2,w/2]:m.rod((x+xx,1.1,z),(x+xx,.45,z+1.4),.04)
def flag(m,x,z):
 m.cyl(x,.32,z,.05,.04,4,'metal',8);m.box(x+.48,3.25,z,.9,.65,.025,'team')
def crates(m,x,z):
 for i in range(3):
  xx=x+(i%2)*.85;zz=z+(i//2)*.8;m.box(xx,.32,zz,.7,.65,.65,'wood')
  for off in[-.22,.22]:m.box(xx+off,.32,zz,.06,.68,.68,'metal')
def fence(m,x,z,w):
 for i in range(int(w)+1):m.box(x-w/2+i,.32,z,.06,1.1,.06,'metal')
 for y in[.7,1.3]:m.box(x,y,z,w,.045,.045,'metal')
def dish(m,x,z,y,r=1.5):
 m.cyl(x,y-1,z,.13,.1,1.3,'metal',12)
 rings=[[(x+rr*math.cos(i*pi/12),y+yy,z+rr*math.sin(i*pi/12))for i in range(24)]for rr,yy in[(.04,0),(r*.4,.1),(r*.75,.35),(r,.7)]];m.loft(rings,'dish',caps=False)
 for a in[0,2*pi/3,4*pi/3]:m.rod((x+r*math.cos(a),y+.7,z+r*math.sin(a)),(x,y+1.45,z),.035)
 m.cyl(x,y+1.35,z,.1,.1,.25,'dark',8)
def awning(m,x,z,w,d,y=2):
 m.poly([(x-w/2,y,z-d/2),(x+w/2,y,z-d/2),(x+w/2,y-.5,z+d/2),(x-w/2,y-.5,z+d/2)],'fabric')
 for xx in[-w/2,w/2]:m.rod((x+xx,.32,z+d/2),(x+xx,y-.5,z+d/2),.045,'wood')
def courtyard(m):
 for x in[-5.3,5.3]:m.box(x,.32,.1,.38,1.4,8.4,'wall');m.box(x,1.66,.1,.5,.15,8.5,'edge')
 for x in[-3.7,3.7]:m.box(x,.32,4.25,3.5,1.4,.38,'wall');m.box(x,1.66,4.25,3.6,.15,.5,'edge')
def hangar(m,x,z,w=6.5,d=5.8):
 for xx in[-w/2,w/2]:m.box(x+xx,.32,z,.28,2.5,d,'wall')
 m.box(x,.32,z-d/2,w,2.5,.28,'wall');m.box(x,.33,z,w,.08,d,'dark')
 profile=[(x+w/2*math.cos(i*pi/16),2.75+1.4*math.sin(i*pi/16))for i in range(17)]
 for i in range(16):a,b=profile[i:i+2];m.poly([(a[0],a[1],z-d/2),(a[0],a[1],z+d/2),(b[0],b[1],z+d/2),(b[0],b[1],z-d/2)],'roof')
 for zz in[-d/2,d/2]:
  m.poly([(a,y,z+zz)for a,y in profile],'wall')
  for a,b in zip(profile,profile[1:]):m.rod((a[0],a[1],z+zz+.03),(b[0],b[1],z+zz+.03),.075,'team')
 for zz in[-d*.3,0,d*.3]:
  for a,b in zip(profile,profile[1:]):m.rod((a[0],a[1]+.025,z+zz),(b[0],b[1]+.025,z+zz),.028,'ridge')
 m.box(x,2.25,z+d/2+.02,w-.3,.5,.16,'door')
 for yy in[2.3,2.45,2.6]:m.box(x,yy,z+d/2+.12,w-.4,.025,.03,'dark')
 for xx in[-w/2,w/2]:m.box(x+xx,.32,z+d/2+.06,.2,2.45,.25,'team')

def make(f,t):
 m=Mesh();base(m);s=f=='sand';d=f=='dragon'
 if t=='hq':
  if s:
   courtyard(m);y=block(m,0,-1.4,5.2,4.1,3);flat(m,0,-1.4,5.2,4.1,y);dome(m,0,-1.4,2.1,y+.15);door(m,0,.72,w=1.7)
   for x in[-4.2,4.2]:y=block(m,x,-2.7,1.8,2,3.7);flat(m,x,-2.7,1.8,2,y);dome(m,x,-2.7,.65,y+.1)
   awning(m,-3,1.7,2.5,2.1);crates(m,3,2);flag(m,4,3.5)
  elif d:
   y=block(m,0,-.5,7,5,2.5);hip(m,0,-.5,7,5,y);m.cyl(0,y+.9,-.5,2.2,2.2,1.35,'wall',8);m.cyl(0,y+2.2,-.5,2.8,1.3,.95,'roof',8);m.cyl(0,y+2.2,-.5,2.85,2.85,.12,'team',8);m.cyl(0,y+3.1,-.5,1.6,.8,.55,'roof',8);dish(m,0,-.5,y+3.6,.7);
   for a in range(8):
    ang=a*pi/4;m.box(2.21*math.sin(ang),y+1.15,-.5+2.21*math.cos(ang),.65,.55,.07,'recess',a=ang)
   yy=block(m,4,-1.5,2.2,3,1.7);hip(m,4,-1.5,2.2,3,yy);door(m,0,2.05);stairs(m,0,2.3);flag(m,4,3)
  else:
   y=block(m,-1,-1,7,4.2,2.5);flat(m,-1,-1,7,4.2,y);y2=block(m,-1,-1.5,3.5,2.4,1.1,y);flat(m,-1,-1.5,3.5,2.4,y2);vent(m,-3,-1,y);hangar(m,-1,2,4.2,2.5)
   for xx in[3.3,4.2]:m.rod((xx,.32,-3),(xx,7,-3),.065)
   for yy in[1,2,3,4,5,6]:m.rod((3.3,yy,-3),(4.2,yy+1,-3),.035);m.rod((4.2,yy,-3),(3.3,yy+1,-3),.035)
   dish(m,3.75,-3,7,1.2);flag(m,-5,3.7)
 elif t in['barracks','blackmarket','civilian']:
  if s:
   courtyard(m)
   for x in[-3.6,3.6]:y=block(m,x,-1.4,2.8,4,2.3);flat(m,x,-1.4,2.8,4,y)
   y=block(m,0,-3,4.5,1.6,2.6);flat(m,0,-3,4.5,1.6,y);dome(m,-3.6,-1.5,.95,2.75);door(m,-3.6,.65);awning(m,2,1.5,3,2.2);crates(m,2,2.6);flag(m,-4.4,3.7)
  else:
   for x in[-3,3]:y=block(m,x,-1.5,4,4.4,2.2);roof(m,f,x,-1.5,4,4.4,y);door(m,x,.76);vent(m,x,-2,y+(.95 if d else .2))
   flag(m,0,2);fence(m,0,4.5,9);crates(m,3,2.5)
   for x in[-3,-1.5]:m.box(x,.32,3,.1,1.3,.1,'wood');m.cyl(x,1.4,3,.3,.3,.1,'target',12)
 elif t in['factory','airfield']:
  if s:
   courtyard(m);y=block(m,-1,-1.1,7,4.6,3,windows=False);flat(m,-1,-1.1,7,4.6,y);m.box(-1,.32,1.25,4.6,2.5,.08,'recess');awning(m,-1,2.4,5,2.3,2.8);vent(m,-3,-2,y+.2);crates(m,3,2.5)
  else:
   hangar(m,-1.7,-1,6.4,5.6);y=block(m,3,-1.5,2.4,4,2.7);roof(m,f,3,-1.5,2.4,4,y);vent(m,3,-2,y+.25);door(m,3,.55)
   for x in[-3,-.5]:m.box(x,.32,3,.1,.02,3,'yellow')
  if t=='airfield':
   m.cyl(1,.325,3,1.65,1.65,.02,'tarmac',32)
   for x in[.45,1.55]:m.box(x,.35,3,.18,.02,1.7,'white')
   m.box(1,.35,3,1.2,.02,.18,'white')
  else:
   for x in[-4,1]:m.box(x,.32,2.3,.18,3.6,.18,'yellow')
   m.box(-1.5,3.85,2.3,5.3,.22,.22,'yellow');m.rod((-1,3.8,2.3),(-1,2.5,2.3),.035);crates(m,3,3)
 elif t=='power':
  if d:
   rings=[[( -2+rr*math.cos(i*pi/12),yy,rr*math.sin(i*pi/12))for i in range(24)]for rr,yy in[(2,.32),(1.65,1),(1.1,2.8),(1.2,4.5),(1.6,5.2)]];m.loft(rings,'wall',caps=False);m.cyl(-2,4.9,0,1.35,1.35,.03,'dark',24);m.loft([[(-2+rr*math.cos(i*pi/12),yy,rr*math.sin(i*pi/12))for i in range(24)]for rr,yy in[(1.62,5.12),(1.62,5.22),(1.38,5.22),(1.38,5.02)]],'team',caps=False)
  else:
   for x in[-3.5,0]:
    m.box(x,.32,-1,2.4,1.9,3,'wall');m.box(x,2.2,-1,2.6,.18,3.2,'team');m.cyl(x,2.38,-1,.55,.42,2.6,'metal',16);m.cyl(x,4.7,-1,.46,.46,.28,'team',16);vent(m,x,0,2.4)
  y=block(m,3,-1,2.5,3.8,2.2);roof(m,f,3,-1,2.5,3.8,y);door(m,3,.95)
  for x in[-3,-1,1]:m.box(x,.32,3,1.2,.8,1.3,'metal');m.cyl(x,1.1,3,.17,.17,.6,'coil',10)
  fence(m,0,4.5,10)
 elif t=='refinery':
  if s:
   courtyard(m);y=block(m,-2,-2,5,3,2);flat(m,-2,-2,5,3,y);awning(m,-2,.8,5,2.5);crates(m,-3,1);crates(m,1,2)
  else:
   for x in[-3.4,-.4]:m.cyl(x,.32,-1.5,1.2,1.2,2.6,'tank',24);m.cyl(x,2.92,-1.5,1.2,.25,.45,'metal',24);m.cyl(x,1.7,-1.5,1.22,1.22,.13,'team',24)
  y=block(m,3,-1,2.5,4,2.5);roof(m,f,3,-1,2.5,4,y);door(m,3,1.06);crates(m,-3,3);crates(m,0,3)
 elif t=='radar':
  y=block(m,-1,-1,5.5,4.5,2.3);roof(m,f,-1,-1,5.5,4.5,y)
  if s:dome(m,-2,-1,1.1,y+.1);awning(m,-1,2,3,2)
  for xx in[2.8,3.8]:m.rod((xx,.32,-2),(xx,5.7,-2),.07)
  for yy in[1,2,3,4]:m.rod((2.8,yy,-2),(3.8,yy+1,-2),.04);m.rod((3.8,yy,-2),(2.8,yy+1,-2),.04)
  dish(m,3.3,-2,5.7,1.8);door(m,-1,1.3);flag(m,-4.5,3)
 elif t=='silo':
  y=block(m,3,1.5,2.3,2.5,1.8);roof(m,f,3,1.5,2.3,2.5,y);door(m,3,2.8)
  m.cyl(-1,.32,-1,3,3,.35,'stone',8)
  if f=='falcon':
   m.cyl(-1,.7,-1,.8,.6,4,'coil',20)
   for yy in range(1,5):m.cyl(-1,yy,-1,1,1,.12,'metal',20)
   for a in[0,pi/2,pi,3*pi/2]:m.rod((-1+2.5*math.cos(a),.7,-1+2.5*math.sin(a)),(-1,4.2,-1),.15,'team')
   dish(m,-1,-1,4.5,1.6)
  elif d:
   for x in[-2.4,.4]:m.box(x,.7,-1,2.6,.25,4.5,'metal');m.box(x,.96,-1,2.3,.025,.15,'yellow')
  else:
   for x in[-2.5,-1,.5]:m.cyl(x,.7,-1,.38,.38,3.6,'metal',12);m.cyl(x,4.3,-1,.38,.02,.85,'team',12);m.box(x,.7,-1,.95,.2,2.5,'dark')
  fence(m,0,-4.5,10)
 elif t in['turret','speaker','bunker','tunnel','hole','trap']:
  m.cyl(0,.32,0,2.8,2.4,.7,'stone',8)
  if t=='speaker':
   m.cyl(0,1,0,.22,.18,4,'metal',12)
   for x in[-1,1]:m.box(x,4,0,1.2,.8,1,'team');m.box(x,4.08,.51,.9,.55,.03,'dark')
  elif t=='trap':m.cyl(0,1,0,1.1,.9,.2,'metal',12)
  else:
   m.box(0,1,0,3.5,1.1,2.6,'wall');m.box(0,2.1,0,3.8,.25,2.9,'team');m.box(0,1.3,1.32,2.5,.5,.03,'recess')
   if t in['turret','tunnel']:
    m.cyl(0,2.35,0,.9,.75,.4,'metal',12,g='turret');m.box(0,2.65,0,1.8,.55,1.3,'team',g='turret')
    for x in[-.42,.42]:m.rod((x,2.85,.2),(x,2.85,2.8),.11,'metal','turret')
   for x in[-2.7,2.7]:
    for z in[-1,0,1]:m.box(x,.32,z,.75,.5,.9,'sandbag')
 elif t=='dropzone':
  m.cyl(0,.32,1,3.2,3.2,.05,'tarmac',32)
  for x in[-1,1]:m.box(x,.38,1,.3,.02,3,'white')
  m.box(0,.38,1,2,.02,.3,'white');y=block(m,0,-3.5,5,1.5,1.7);flat(m,0,-3.5,5,1.5,y);crates(m,4,1);flag(m,-4,2)
 return m
TYPES='hq power refinery barracks factory turret radar silo airfield speaker tunnel dropzone blackmarket trap hole civilian bunker'.split();manifest=[]
for f in['falcon','dragon','sand']:
 for t in TYPES:
  name=f+'_'+t;tri=make(f,t).save(P/(name+'.obj'));manifest.append({'key':name,'file':name+'.obj','triangles':tri})
(P/'manifest.json').write_text(json.dumps(manifest,indent=2));print('Exported',len(manifest),'meshes;',sum(e['triangles']for e in manifest),'triangles')
