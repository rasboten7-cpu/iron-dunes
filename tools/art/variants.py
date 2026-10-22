import sys, numpy as np
from PIL import Image
import os
SRC=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..','dist','assets','realism')+os.sep
out=sys.argv[1]
# Heavy tank: dark charcoal-olive scheme
im=np.array(Image.open(SRC+'tank.png').convert('RGBA')).astype(np.float32)
rgb=im[:,:,:3]; lum=rgb.mean(axis=2,keepdims=True)
dark=np.array([0.80,0.84,0.74])
im[:,:,:3]=np.clip((lum*dark*0.82+(rgb-lum)*0.45)*1.0,0,255)
Image.fromarray(im.astype(np.uint8),'RGBA').save(out+'/heavy.png')
# Civilian building: barracks with terracotta roof and whitewashed walls
im=np.array(Image.open(SRC+'barracks.png').convert('RGBA')).astype(np.float32)
r,g,b=im[:,:,0],im[:,:,1],im[:,:,2]
green=(g>r*1.02)&(g>b*1.05)
lum=(r+g+b)/3
roof=np.stack([lum*1.25,lum*0.78,lum*0.58],axis=2)
rgb=im[:,:,:3]
rgb[green]=np.clip(roof[green],0,255)
walls=~green
lumw=lum[walls][:,None]
rgb[walls]=np.clip(rgb[walls]*0.55+lumw*np.array([0.52,0.50,0.46])+18,0,255)
im[:,:,:3]=rgb
Image.fromarray(im.astype(np.uint8),'RGBA').save(out+'/civilian.png')
