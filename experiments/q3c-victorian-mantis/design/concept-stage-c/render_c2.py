"""Построение графических листов и проверки монтажной модели Q3C Stage C.

Запуск из корня R4D: python experiments/q3c-victorian-mantis/design/concept-stage-c/render_c2.py
Требуется существующий Pillow. Скрипт читает данные конструкции и рисует авторские
векторные формы в PNG/WebP. Растровая иллюстрация Imagegen используется отдельно.
"""
from pathlib import Path
import json
import math
from functools import lru_cache
from PIL import Image, ImageDraw, ImageFont, features

HERE = Path(__file__).resolve().parent
RIG = json.loads((HERE / 'C2_ART_RIG_SPEC.json').read_text(encoding='utf-8'))
MOTION = json.loads((HERE / 'C2_MOTION_CURVES.json').read_text(encoding='utf-8'))
SOURCE = json.loads((HERE.parents[1] / RIG['source']).read_text(encoding='utf-8-sig'))
PARTS = {part['id']: part for part in RIG['inventory']}
SHELL = SOURCE['shell']['outlineXY']
ARMS = SOURCE['rig']['raptorial']
HEAD = SOURCE['rig']['opticalCarriage']
FOOT = SOURCE['rig']['walking']['footSourceLocalXY']
TRACKS = MOTION['tracks']
FLOOR = -30.0
DURATION = MOTION['durationSeconds']
FONT_DIR = Path('C:/Windows/Fonts')

BG = '#101c20'
CARD = '#18292d'
FRAME = '#365055'
TEXT = '#edf0df'
MUTED = '#a2b5b2'
GOLD = '#e2b978'
TEAL = '#73b5b1'
PINK = '#df91a6'
PALE = '#f4d59b'
MATERIALS = {
    'petrol': ('#102e32', '#264c50', '#4e7271', '#a98b55'),
    'brass': ('#55391e', '#a07442', '#d7ad70', '#f0ce92'),
    'bronze': ('#2c241c', '#614b34', '#937350', '#c49b6c'),
    'copper': ('#49291e', '#98502d', '#c57746', '#f0ab73'),
    'steel': ('#3d4847', '#758580', '#b0b8aa', '#e1e4ce'),
    'well': ('#0b1618', '#203237', '#45514a', '#7b7860'),
}


@lru_cache(maxsize=None)
def font(size, face='regular'):
    names = {'regular':'arial.ttf', 'bold':'arialbd.ttf', 'title':'georgia.ttf'}
    return ImageFont.truetype(str(FONT_DIR / names[face]), size)


def rotate(point, degrees):
    x, y = point
    angle = math.radians(degrees)
    c, s = math.cos(angle), math.sin(angle)
    return (x*c-y*s, x*s+y*c)


def add(a, b):
    return a[0]+b[0], a[1]+b[1]


def sub(a, b):
    return a[0]-b[0], a[1]-b[1]


def interpolate(a, b, u):
    return a[0]+(b[0]-a[0])*u, a[1]+(b[1]-a[1])*u


def endpoint(a, length, degrees):
    return add(a, rotate((length, 0), degrees))


def shape_at(points, origin, angle):
    return [add(origin, rotate(p, angle)) for p in points]


def bezier(q, curve):
    if q <= 0:
        return 0.0
    if q >= 1:
        return 1.0
    x1, y1, x2, y2 = MOTION['curves'][curve]
    def coordinate(u, a, b):
        return 3*(1-u)**2*u*a + 3*(1-u)*u*u*b + u**3
    lo, hi = 0.0, 1.0
    for _ in range(21):
        u = (lo+hi)/2
        if coordinate(u, x1, x2) < q:
            lo = u
        else:
            hi = u
    return coordinate((lo+hi)/2, y1, y2)


def value_at(track, t):
    value = track['initial']
    for span in track['segments']:
        if t < span['start']:
            return value
        if t < span['end']:
            phase = (t-span['start'])/(span['end']-span['start'])
            return span['from']+(span['to']-span['from'])*bezier(phase, span['ease'])
        value = span['to']
    return value


def transform(t):
    return {name:value_at(track,t) for name,track in TRACKS.items()}


def seed_stream(seed, key):
    value = 2166136261
    for byte in f'{seed}:{key}'.encode():
        value = ((value ^ byte)*16777619) & 0xffffffff
    value = value or 1
    while True:
        value ^= value << 13 & 0xffffffff
        value ^= value >> 17
        value ^= value << 5 & 0xffffffff
        yield value/2**32


def idle_value(form, channel, t, easing=None, travel_factor=1.0):
    key = channel['channel']
    seed = MOTION['idle']['sampleSeed']
    sequence = seed_stream(seed, f"{form}:{channel.get('seedKey', key)}")
    kind = channel['type']
    if kind == 'independentOscillators':
        angles = [2*math.pi*(t/p+next(sequence)) for p in channel['periods']]
        return channel['offset']+channel['amp']*sum(
            w*math.sin(a) for w,a in zip(channel['weights'],angles))
    if kind == 'laggedFollower':
        leader = next(c for c in MOTION['idle'][form] if c['channel']==channel['source'])
        return channel['gain']*idle_value(
            form,leader,max(0,t-channel['lag']),channel['ease'],1.4)
    dwell, travel, amplitude = channel['dwell'],channel['movement'],channel['amplitude']
    current, end_time = 0.0, 0.0
    while True:
        start = end_time+dwell[0]+next(sequence)*(dwell[1]-dwell[0])
        end_time = start+travel[0]+next(sequence)*(travel[1]-travel[0])
        target = amplitude[0]+next(sequence)*(amplitude[1]-amplitude[0])
        if t < start:
            return current
        followed_end = start+(end_time-start)*travel_factor
        if t < followed_end:
            return current+(target-current)*bezier(
                (t-start)/(followed_end-start),easing or channel['profile'])
        current = target


def with_idle(values, form, t, strength=1.0):
    pose = values.copy()
    for channel in MOTION['idle'][form]:
        name = channel['channel']
        pose[name] += strength*idle_value(form,channel,t)
    for key in ('head.carriage.section1.stroke','head.carriage.section2.stroke'):
        pose[key] = min(12,max(0,pose[key]))
    pose['eye.iris.open'] = min(1,max(.32,pose['eye.iris.open']))
    return pose


def leg_angle(start,end):
    return math.degrees(math.atan2(end[1]-start[1],end[0]-start[0]))


def solve_leg(hip,ankle,sign):
    delta = sub(ankle,hip)
    distance = math.hypot(*delta)
    if not 8 < distance < 144:
        raise ValueError(f'Опора недостижима: {hip}, {ankle}, d={distance}')
    along = (68**2-76**2+distance**2)/(2*distance)
    perp = math.sqrt(68**2-along**2)*sign
    ux,uy = (d/distance for d in delta)
    return hip[0]+ux*along-uy*perp,hip[1]+uy*along+ux*perp


def mechanism(values):
    get = values.__getitem__
    body = (get('cradle.x'),get('cradle.rise'))
    chest_a, chest_b = get('thorax.lower.abs'),get('thorax.upper.abs')
    root = add(body,(40,32))
    shoulder = endpoint(root,98,chest_a)
    crown = endpoint(shoulder,98,chest_b)
    stroke1,stroke2 = get('head.carriage.section1.stroke'),get('head.carriage.section2.stroke')
    carrier_angle = get('head.carriage.sleeve.abs')
    head = endpoint(crown,stroke1+stroke2,carrier_angle)
    head_angle = get('head.chassis.abs')
    lens = add(head,rotate((12,-6),head_angle))
    legs = {}
    for key,foot in MOTION['footContacts']['contactX'].items():
        x = foot['x']
        sign = -1 if x<0 else 1
        angle = get(f'walk.{key}.foot.roll')
        held = (-6,-2) if angle>=0 else (6,-2)
        hold_world = (x+held[0],FLOOR)
        ankle = sub(hold_world,rotate(held,angle))
        hip = add(body,(75*sign,20))
        knee = solve_leg(hip,ankle,sign)
        z = PARTS[f'walk.{key}.hip_fork']['pivot'][2]
        legs[key] = dict(hip=hip,knee=knee,ankle=ankle,angle=angle,z=z,
                         contact=hold_world,foot=shape_at(FOOT,ankle,angle))
    raptors = {}
    for side,z in [('far',-42),('near',42)]:
        a = get(f'rapt.{side}.femur.abs')
        b = a+get(f'rapt.{side}.tibia.relative')
        elbow = endpoint(shoulder,86,a)
        tip = endpoint(elbow,88,b)
        raptors[side] = dict(a=a,b=b,elbow=elbow,tip=tip,z=z,
                            femur=shape_at(ARMS['femurShape'],shoulder,a),
                            blade=shape_at(ARMS['tibiaShape'],elbow,b))
    return dict(v=values,body=body,root=root,shoulder=shoulder,crown=crown,
                head=head,head_angle=head_angle,carrier_angle=carrier_angle,lens=lens,legs=legs,
                raptors=raptors,chest_a=chest_a,chest_b=chest_b)


def mass_center(p):
    points = []
    for group in RIG['massGroups']:
        name = group['id']
        if 'center' in group:
            x,y,z = group['center']
            if name in ('shell.rear','shell.front'):
                pivot = PARTS[name]['pivot']
                sign = PARTS[name]['roofPanel']['hingeWorldSide']
                x,y,z = side_hinge(x,y,z,pivot[1],pivot[2],p['v'][name+'.open']*sign)
            if name=='eye-hatch':
                pivot = PARTS['eye.front_hatch']['pivot']
                x,y,z = side_hinge(x,y,35,pivot[1],pivot[2],p['v']['eye.front_hatch.open'])
            if name=='side-doors':
                for side,sign in [('far',-1),('near',1)]:
                    x1,y1,z1 = side_hinge(x,y,sign*51,35,sign*51,
                                           p['v'][f'bay.rapt.{side}.door.open']*sign)
                    points.append((group['mass']/2,add(p['body'],(x1,y1)),z1))
            else:
                points.append((group['mass'],add(p['body'],(x,y)),z))
        elif name.startswith('thorax'):
            a,b = (p['root'],p['shoulder']) if name.endswith('lower') else (p['shoulder'],p['crown'])
            points.append((group['mass'],interpolate(a,b,group['centerOnAxis']),0))
        elif name=='head-eye-carriage':
            points.append((group['mass'],add(p['head'],rotate((10,-4),p['head_angle'])),0))
        elif name=='walking-chains':
            for leg in p['legs'].values():
                hip,knee,ankle,z = (leg[k] for k in ('hip','knee','ankle','z'))
                points.extend([(1.8,interpolate(hip,knee,.48),z),
                               (1.4,interpolate(knee,ankle,.47),z),(.8,ankle,z)])
        elif name=='raptorial-chains':
            for arm in p['raptors'].values():
                points.extend([(3,interpolate(p['shoulder'],arm['elbow'],.48),arm['z']),
                               (2.5,interpolate(arm['elbow'],arm['tip'],.46),arm['z'])])
    total = sum(m for m,_,_ in points)
    return tuple(sum(m*coord for m,coord in values)/total for values in (
        [(m,p[0]) for m,p,z in points],[(m,p[1]) for m,p,z in points],[(m,z) for m,p,z in points]))


def orient(a,b,c):
    return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])


def support_margin(p):
    # Все четыре точки образуют опорный многоугольник в плоскости XZ.
    support = [(p['legs'][key]['contact'][0],p['legs'][key]['z']) for key in
               ('rear.far','front.far','front.near','rear.near')]
    x,_,z = mass_center(p)
    return min(orient(a,b,(x,z))/math.dist(a,b) for a,b in
               zip(support,support[1:]+support[:1]))


def clip(points,axis,edge,keep_above):
    out = []
    for a,b in zip(points,points[1:]+points[:1]):
        inside_a = (a[axis]>=edge)==keep_above
        inside_b = (b[axis]>=edge)==keep_above
        if inside_a:
            out.append(a)
        if inside_a!=inside_b:
            out.append(interpolate(a,b,(edge-a[axis])/(b[axis]-a[axis])))
    return out


GATE = clip(clip(clip(SHELL,0,-67,True),0,68,False),1,35,True)
BOTTOM = clip(SHELL,1,35,False)
REAR_WALL = clip(clip(SHELL,0,-67,False),1,35,True)
FRONT_WALL = clip(clip(SHELL,0,68,True),1,35,True)
ROOF_PROFILE = SHELL[2:9]


def roof_at(x):
    for a,b in zip(ROOF_PROFILE,ROOF_PROFILE[1:]):
        if a[0] <= x <= b[0]:
            return interpolate(a,b,(x-a[0])/(b[0]-a[0]))[1]
    raise ValueError(x)


def side_hinge(x,y,z,hinge_y,hinge_z,angle):
    yz = rotate((y-hinge_y,z-hinge_z),angle)
    return x,hinge_y+yz[0],hinge_z+yz[1]


def roof_polygon(panel,angle):
    item = PARTS[panel]
    start,end = item['roofPanel']['x']
    sign = item['roofPanel']['hingeWorldSide']
    xs = [start]+[x for x,_ in ROOF_PROFILE if start<x<end]+[end]
    top = [(x,roof_at(x),-33) for x in xs]
    bottom = [(x,roof_at(x)-5,33) for x in reversed(xs)]
    return [side_hinge(x,y,z,35,33*sign,angle*sign) for x,y,z in top+bottom]


def beam_shape(length,width):
    return [(-5,-width*.25),(length*.13,-width*.45),(length*.68,-width*.39),
            (length-6,-width*.27),(length+4,-width*.17),(length+4,width*.17),
            (length*.71,width*.48),(length*.19,width*.5),(-5,width*.27)]


def packed_pose():
    values = transform(0)
    values.update({'head.chassis.abs':-25,'eye.front_hatch.open':0,
                   'head.carriage.section1.stroke':0,'head.carriage.section2.stroke':0})
    pose = mechanism(values)
    for key,leg in pose['legs'].items():
        sign = -1 if key.startswith('rear') else 1
        leg.update(hip=(75*sign,20),knee=(7*sign,20),ankle=(83*sign,20),
                   angle=0,contact=None,foot=shape_at(FOOT,(83*sign,20),0))
    return pose


def packed_margins(p):
    # Оболочка выпуклая. Знак ориентированного расстояния определяет сторону ребра.
    winding = math.copysign(1,orient(*SHELL[:3]))
    assert all(orient(SHELL[i-2],SHELL[i-1],SHELL[i])*winding>=0
               for i in range(len(SHELL)))
    def part_outline(a,b,width):
        return shape_at(beam_shape(math.dist(a,b),width),a,leg_angle(a,b))
    groups = {
        'thorax.lower':part_outline(p['root'],p['shoulder'],28),
        'thorax.upper':part_outline(p['shoulder'],p['crown'],25),
        'head.chassis':shape_at(HEAD['headOutlineLocalXY'],p['head'],p['head_angle']),
        'eye.brow':shape_at(HEAD['browOutlineLocalXY'],p['head'],p['head_angle']),
        'head.carriage':shape_at(HEAD['housingLocalXY'],p['crown'],p['carrier_angle']),
        'eye.barrel':[endpoint(p['lens'],9,i*15) for i in range(24)],
    }
    for key,leg in p['legs'].items():
        groups[f'walk.{key}'] = (part_outline(leg['hip'],leg['knee'],22)+
                                part_outline(leg['knee'],leg['ankle'],18)+leg['foot'])
    for side,arm in p['raptors'].items():
        groups[f'rapt.{side}'] = arm['femur']+arm['blade']
    margins = {
        key:min(winding*orient(a,b,q)/math.dist(a,b)
                for q in points for a,b in zip(SHELL,SHELL[1:]+SHELL[:1]))
        for key,points in groups.items()
    }
    assert min(margins.values())>0, margins
    return {key:round(value,4) for key,value in margins.items()}


class Board:
    def __init__(self,w,h):
        self.im = Image.new('RGB',(w,h),BG)
        self.d = ImageDraw.Draw(self.im)

    def text(self,x,y,label,size=22,fill=TEXT,face='regular',anchor=None):
        self.d.text((x,y),label,font=font(size,face),fill=fill,anchor=anchor)

    def card(self,box):
        self.d.rounded_rectangle(box,radius=16,fill=CARD,outline=FRAME,width=2)

    def poly(self,points,fill,edge=None,width=1):
        if len(points)<3:
            return
        self.d.polygon(points,fill=fill)
        if edge:
            self.d.line(points+[points[0]],fill=edge,width=width,joint='curve')

    def disc(self,x,y,r,fill,edge=None,width=1):
        self.d.ellipse((x-r,y-r,x+r,y+r),fill=fill,outline=edge,width=width)

    def rule(self,points,fill=FRAME,width=1):
        self.d.line(points,fill=fill,width=width,joint='curve')

    def masthead(self,eyebrow,title,subtitle):
        self.text(36,21,eyebrow,20,GOLD,'bold')
        self.text(36,53,title,44,TEXT,'title')
        self.text(37,108,subtitle,22,MUTED)

    def save(self,name):
        self.im.save(HERE/name)


def shape_fill(board,points,material,scale=1.0,far=False):
    if len(points)<3:
        return
    dark,mid,light,edge = MATERIALS[material]
    if far:
        light,mid,edge = mid,dark,light
    board.poly(points,dark,'#081417',max(1,round(2*scale)))
    center = (sum(p[0] for p in points)/len(points),sum(p[1] for p in points)/len(points))
    inset = [interpolate(center,p,.85) for p in points]
    board.poly(inset,mid)
    top = sorted(range(len(points)),key=lambda i:points[i][1])[:max(2,len(points)//3)]
    for i in top:
        a,b = points[i],points[(i+1)%len(points)]
        board.rule([interpolate(a,b,.11),interpolate(a,b,.90)],edge,max(1,round(1.35*scale)))
    # Свободные диагональные фаски остаются внутри исходного контура.
    for i in range(len(points)):
        a,b = points[i],points[(i+1)%len(points)]
        if a[1]+b[1] < 2*center[1]:
            board.poly([a,b,interpolate(center,b,.89),interpolate(center,a,.89)],light)


def draw_mechanism(board,p,cx,floor_y,scale=1.0,labels=False,cutaway=False):
    v = p['v']
    bx,by = p['body']
    def screen(x,y,z=0):
        return cx+scale*(x+z*.30),floor_y-scale*(y-FLOOR+z*.10)
    def fixed(points,z):
        return [screen(x+bx,y+by,z) for x,y in points]
    def plane(points,z):
        return [screen(x,y,z) for x,y in points]
    def metal(points,z,mat,far=False):
        shape_fill(board,plane(points,z),mat,scale,far)
    def fixed_metal(points,z,mat,far=False):
        shape_fill(board,fixed(points,z),mat,scale,far)
    def bearing(point,z,r=5,far=False):
        x,y = screen(*point,z)
        board.disc(x,y,r*scale,'#674829' if far else '#a47745','#162326',max(1,round(scale)))
        board.disc(x,y,r*scale*.64,'#aa8050' if far else '#e0b879')
        board.disc(x,y,r*scale*.28,'#283335')
    def link(a,b,w,z,mat='brass',far=False):
        points = shape_at(beam_shape(math.dist(a,b),w),a,leg_angle(a,b))
        metal(points,z,mat,far)
        bearing(a,z,5,far)
    def piston(a,b,z,part_id,far=False):
        # Гильза и видимая часть штока ориентированы по двум креплениям.
        axis = leg_angle(a,b)
        actuator = PARTS[part_id+'.sleeve']['actuator']
        housing = actuator['housingLength']
        sections = actuator['sections']
        travel = math.dist(a,b)-housing
        for i in range(len(sections)-1,-1,-1):
            end = housing+travel*(i+1)/len(sections)
            start = end-sections[i]
            half = 2.4-i*.7
            metal(shape_at([(start,-half),(end,-half),(end,half),(start,half)],a,axis),
                  z,'steel' if i==len(sections)-1 else 'brass',far)
        metal(shape_at([(0,-3.6),(housing,-3.6),(housing,3.6),(0,3.6)],a,axis),z,'copper',far)
        bearing(b,z,2.5,far)
    def pin(a,b,offset):
        return add(a,rotate(offset,leg_angle(a,b)))
    def leg(key,far):
        item = p['legs'][key]
        hip,knee,ankle,z = (item[k] for k in ('hip','knee','ankle','z'))
        link(hip,knee,22,z,'brass',far)
        link(knee,ankle,18,z,'brass',far)
        piston(pin(hip,knee,(48,-5)),pin(knee,ankle,(8,2)),z+.8,f'walk.{key}.piston',far)
        metal(item['foot'],z,'brass',far)
        bearing(ankle,z,4,far)
    def arm(side):
        arm = p['raptors'][side]
        z = arm['z']
        far = side=='far'
        metal(arm['femur'],z,'petrol',far)
        metal(arm['blade'],z+(-4 if far else 4),'brass',far)
        piston(pin(p['shoulder'],arm['elbow'],(66,4)),
               pin(arm['elbow'],arm['tip'],(6,-2)),z+3,f'rapt.{side}.piston',far)
        bearing(p['shoulder'],z,5,far)
        bearing(arm['elbow'],z+4,5,far)
    def gate(side):
        sign = 1 if side=='near' else -1
        angle = v[f'bay.rapt.{side}.door.open']
        vertices = [side_hinge(x,y,51*sign,35,51*sign,angle*sign) for x,y in GATE]
        points = [screen(x+bx,y+by,z) for x,y,z in vertices]
        if cutaway and side=='near':
            board.rule(points+[points[0]],TEAL,2)
        else:
            shape_fill(board,points,'petrol',scale,side=='far')
        board.rule([screen(-67+bx,35+by,51*sign),screen(68+bx,35+by,51*sign)],
                   '#9f7b4d',max(1,round(1.9*scale)))
        for x in (-63,62):
            bearing((x+bx,35+by),51*sign,3,side=='far')

    # Тени и контакты привязаны к той же плоскости, что и край подошвы.
    for legp in p['legs'].values():
        if legp['contact'] is None:
            continue
        fx,fy = screen(*legp['contact'],legp['z'])
        board.d.ellipse((fx-12*scale,fy-2*scale,fx+12*scale,fy+4*scale),fill='#101b1f')
    for key in ('rear.far','front.far'):
        leg(key,True)
    gate('far')
    arm('far')
    fixed_metal(BOTTOM,-6,'bronze')
    fixed_metal(REAR_WALL,0,'petrol')
    fixed_metal(FRONT_WALL,0,'petrol')
    fixed_metal([(-78,12),(75,12),(75,29),(-75,29)],18,'brass')
    # Слой центрального силового узла. Обе броневые части имеют собственный шарнир.
    link(p['root'],p['shoulder'],28,-5,'brass')
    link(p['shoulder'],p['crown'],25,5,'brass')
    piston(pin(p['root'],p['shoulder'],(74,-6)),pin(p['shoulder'],p['crown'],(7,3)),10,'thorax.piston')
    for name in ('shell.rear','shell.front'):
        points = [screen(x+bx,y+by,z) for x,y,z in roof_polygon(name,v[name+'.open'])]
        shape_fill(board,points,'petrol',scale)
    for key in ('rear.near','front.near'):
        leg(key,False)
    arm('near')
    gate('near')
    # Козырёк, каретка и стекло остаются теми же слоями при каждом вычислении.
    crown,head = p['crown'],p['head']
    carrier_angle = p['carrier_angle']
    section1 = endpoint(crown,v['head.carriage.section1.stroke'],carrier_angle)
    metal(shape_at([(-18,-2.4),(0,-2.4),(0,2.4),(-18,2.4)],head,carrier_angle),2,'steel')
    metal(shape_at([(-18,-3.6),(0,-3.6),(0,3.6),(-18,3.6)],section1,carrier_angle),3,'brass')
    metal(shape_at(HEAD['housingLocalXY'],crown,carrier_angle),4,'copper')
    metal(shape_at(HEAD['headOutlineLocalXY'],head,p['head_angle']),4,'brass')
    brow_hinge = (-4,5)
    brow_local = [add(brow_hinge,rotate(sub(q,brow_hinge),v['eye.brow.angle']))
                  for q in HEAD['browOutlineLocalXY']]
    metal(shape_at(brow_local,head,p['head_angle']),8,'brass')
    ex,ey = screen(*p['lens'],10)
    board.disc(ex,ey,10*scale,'#543720','#142225',max(1,round(1.5*scale)))
    board.disc(ex,ey,8*scale,'#cb9855')
    board.disc(ex,ey,6.8*scale,'#6c3d1d')
    aperture = (.52+.39*v['eye.iris.open'])*6.8*scale
    board.disc(ex,ey,aperture,'#e8a548')
    pupil_x = ex+v['eye.gimbal.aim']*.14*scale
    board.disc(pupil_x,ey,2.8*scale,'#34271f')
    board.disc(ex-2.4*scale,ey-2.4*scale,1.45*scale,'#ffe1a1')
    # Передний люк остаётся на раме и имеет реальную угловую проекцию.
    flap = [(64,67),(83,59),(90,55),(82,49),(66,60)]
    flap_angle = v['eye.front_hatch.open']
    vertices = [side_hinge(x,y,35,58,35,flap_angle) for x,y in flap]
    shape_fill(board,[screen(x+bx,y+by,z) for x,y,z in vertices],'petrol',scale)
    if labels:
        for tag,point,z in (('B',p['root'],0),('S',p['shoulder'],0),('E',p['lens'],12),
                            ('A',p['raptors']['near']['elbow'],47),
                            ('H',p['legs']['rear.near']['hip'],18)):
            x,y = screen(*point,z)
            board.disc(x,y,9,GOLD,'#102025',2)
            board.text(x,y,tag,11,BG,'bold','mm')
        mx,my,mz = mass_center(p)
        x,y = screen(mx,my,mz)
        _,floor = screen(mx,FLOOR,mz)
        board.rule([(x,y),(x,floor)],PINK,2)
        board.disc(x,y,5,PINK)
        board.text(x+10,y-11,'ЦМ',15,PINK,'bold')
    return screen


def build_rig_board():
    board = Board(1920,1440)
    board.masthead('R4D  /  Q3C  /  STAGE C','Постоянные детали и посадки',
                   'Один масштаб U = 180. Рама, оболочка, четыре опоры и один глаз сохраняют идентичность.')
    board.card((32,151,955,762))
    board.card((965,151,1888,762))
    board.text(54,172,'K0    /    ХОДЯЧАЯ КАПСУЛА',25,GOLD,'bold')
    board.text(988,172,'K5    /    ВЫСОКАЯ СТОЙКА',25,GOLD,'bold')
    board.text(54,209,'Наклонная проекция, ближний люк показан контуром',19,MUTED)
    board.text(988,209,'Те же длины, те же шарниры, та же оболочка',19,MUTED)
    board.text(54,256,'P0 · Упакованный разрез',20,TEAL,'bold')
    draw_mechanism(board,packed_pose(),494,445,1.42,cutaway=True)
    board.text(54,435,'Голова повёрнута внутрь. Стопы и обе ловчие цепи сложены.',18,MUTED)
    for cx,t in ((488,0),(1416,DURATION)):
        board.rule([(cx-397,691),(cx+408,691)],FRAME,2)
        draw_mechanism(board,mechanism(transform(t)),cx,687,1.42,True,cutaway=t==0)
    board.text(54,724,'B — корень груди   S — общее плечо   E — единственный глаз',18,MUTED)
    board.text(988,724,'A — локоть серпа   H — тазовая вилка   ЦМ — расчётный центр массы',18,MUTED)

    board.card((32,780,634,1408))
    board.card((652,780,1250,1408))
    board.card((1268,780,1888,1408))
    board.text(54,802,'01   ХВАТАТЕЛЬНЫЙ ЛОКОТЬ',23,GOLD,'bold')
    board.text(674,802,'02   ГЛУБИНА И ЛЮКИ',23,GOLD,'bold')
    board.text(1290,802,'03   КАРЕТКА И ГЛАЗ',23,GOLD,'bold')

    scale = 2.18
    root = (182,970)
    def diagram(points):
        return [(root[0]+scale*x,root[1]-scale*y) for x,y in points]
    shoulder = (0,0)
    elbow = (86,0)
    shape_fill(board,diagram(ARMS['femurShape']),'petrol',scale)
    shape_fill(board,diagram(shape_at(ARMS['tibiaShape'],elbow,170)),'brass',scale)
    for x,y,label in ((0,0,'S'),(86,0,'A')):
        px,py = diagram([(x,y)])[0]
        board.disc(px,py,5*scale,'#d0a46d','#263231',2)
        board.text(px,py,label,15,BG,'bold','mm')
    board.rule([(182,1017),(370,1017)],TEAL,2)
    board.text(276,1027,'86 до оси A',20,TEAL,anchor='mt')
    for y,line in enumerate((
        'Серп 88. Шарнир A общий с бедром.',
        'Бедро и серп в разных полосах глубины.',
        '5 — радиус крышки в проёмном контуре.',
        '2,7 — видимое перекрытие металла.',
        '1,8 — отступ эмали от вращающегося стыка.',
        'Под крышкой дорисован несущий металл.',
        'Кант 4,5 лежит снаружи свободного окна.',
    ),0):
        board.text(54,1092+y*36,line,19,MUTED)

    left = 684
    depth_scale = 4.75
    bands = [('стенка',-55,-51,'#9d7d52'),('A F',-51,-33,'#b1758d'),
             ('L F',-31,-13,'#658c91'),('C',-11,11,'#b59455'),
             ('L N',13,31,'#658c91'),('A N',33,51,'#b1758d'),('стенка',51,55,'#9d7d52')]
    for label,lo,hi,color in bands:
        x0,x1 = left+(lo+55)*depth_scale,left+(hi+55)*depth_scale
        board.d.rectangle((x0,884,x1,959),fill=color,outline=BG,width=2)
        if hi-lo>5:
            board.text((x0+x1)/2,922,label,21,BG,'bold','mm')
    board.text(684,977,'−55',18,MUTED)
    board.text(1208,977,'+55',18,MUTED,anchor='ra')
    board.text(674,1020,'A F [−51, −33] / A N [33, 51]',22,PINK,'bold')
    board.text(674,1052,'L F [−31, −13] / L N [13, 31]',22,TEAL,'bold')
    board.text(674,1084,'C [−11, 11], две плоскости груди',22,GOLD,'bold')
    for y,line in enumerate((
        'Обе двери: ось X при y=35, z=±51.',
        'Окно x=[−67, 68], y=[35, 95].',
        'Крыша выходит из обеих полос глубины.',
        'Вилки соединяют только свои две плиты.',
        'Локальный порядок: ложе, деталь, кант.',
        'Смена слоя возможна под сплошным кантом.',
    ),0):
        board.text(674,1142+y*35,line,19,MUTED)

    for x,w,c in [(1294,138,'copper'),(1390,117,'steel'),(1478,117,'brass')]:
        shape_fill(board,[(x,905),(x+w,905),(x+w,941),(x,941)],c,2)
    board.rule([(1325,965),(1492,965)],TEAL,2)
    board.text(1408,973,'две секции по 18',20,TEAL,anchor='mt')
    head_origin = (1611,935)
    head_outline = [(head_origin[0]+3*x,head_origin[1]-3*y) for x,y in HEAD['headOutlineLocalXY']]
    shape_fill(board,head_outline,'brass',2)
    board.disc(1647,953,28,'#674a2c','#152629',3)
    board.disc(1647,953,21,'#d5a24f')
    board.disc(1647,953,12,'#e9ab42')
    board.disc(1652,953,7,'#3f2c20')
    board.disc(1640,946,4,'#ffe0a3')
    board.text(1710,905,'E',26,GOLD,'bold')
    for y,line in enumerate((
        '0 / 24 / 10 — суммарный ход каретки.',
        'Каждая секция: ход ≤12, нахлёст ≥6.',
        'Поворот каретки идёт вокруг конца C2.',
        'Линза остаётся в одном barrel/gimbal.',
        'Передний люк принадлежит оболочке.',
        'Козырёк и шесть лепестков принадлежат E.',
        'Весь головной узел проходит через окно.',
    ),0):
        board.text(1290,1092+y*36,line,19,MUTED)
    board.save('02-c2-rig-overlap-pivots.png')


def build_poses_board():
    board = Board(1920,1374)
    board.masthead('R4D  /  Q3C  /  STAGE C','Шесть фаз одного раскрытия',
                   'Кадры вычислены из общих контуров и отдельных дорожек движения. Масштаб всех окон одинаков.')
    card_width = 608
    for idx,key in enumerate(MOTION['keys']):
        col,row = idx%3,idx//3
        left,top = 34+col*622,152+row*589
        board.card((left,top,left+card_width,top+567))
        board.text(left+23,top+18,key['id'],32,GOLD,'bold')
        board.text(left+88,top+23,key['title'],25,TEXT,'title')
        board.text(left+card_width-23,top+25,f"{key['t']:.2f} с",20,TEAL,anchor='ra')
        floor_y = top+502
        board.rule([(left+31,floor_y+3),(left+card_width-30,floor_y+3)],FRAME,2)
        draw_mechanism(board,mechanism(transform(key['t'])),left+card_width*.49,floor_y,1.31)
        board.text(left+23,top+527,key['note'],18,MUTED)
    board.text(36,1334,'Рисунок нагрузки и порядок раскрытия. Цвет и отделку задаёт лист 01.',19,MUTED)
    board.save('03-c2-k0-k5-motion.png')


def plot(board,box,samples,color=TEAL,width=3):
    x0,y0,x1,y1 = box
    ymin,ymax = min(samples),max(samples)
    if ymax-ymin<1e-9:
        ymin-=1
        ymax+=1
    coords = [(x0+(x1-x0)*i/(len(samples)-1),
               y1-(y1-y0)*(value-ymin)/(ymax-ymin)) for i,value in enumerate(samples)]
    board.rule(coords,color,width)
    return ymin,ymax


DISPLAY = [
    ('Рама и крышки',[
        ('Рама · высота','cradle.rise'),('Рама · перенос','cradle.x'),
        ('Крыша · зад','shell.rear.open'),('Крыша · перед','shell.front.open'),
        ('Люк · дальний','bay.rapt.far.door.open'),('Люк · ближний','bay.rapt.near.door.open'),
        ('Защёлка дальняя','bay.rapt.far.catch.open'),('Защёлка ближняя','bay.rapt.near.catch.open')]),
    ('Грудь и серпы',[
        ('Нижняя грудь','thorax.lower.abs'),('Верхняя грудь','thorax.upper.abs'),
        ('Ближнее бедро','rapt.near.femur.abs'),('Дальнее бедро','rapt.far.femur.abs'),
        ('Ближний серп','rapt.near.tibia.relative'),('Дальний серп','rapt.far.tibia.relative'),
        ('Упор ближнего','rapt.near.latch.open'),('Упор дальнего','rapt.far.latch.open')]),
    ('Голова и опоры',[
        ('Головной люк','eye.front_hatch.open'),('Голова','head.chassis.abs'),
        ('Ось каретки','head.carriage.sleeve.abs'),
        ('Каретка 1','head.carriage.section1.stroke'),('Каретка 2','head.carriage.section2.stroke'),
        ('Оптика','eye.gimbal.aim'),('Козырёк','eye.brow.angle'),('Диафрагма','eye.iris.open'),
        ('Стопа ЗД','walk.rear.far.foot.roll'),('Стопа ПД','walk.front.far.foot.roll'),
        ('Стопа ЗБ','walk.rear.near.foot.roll'),('Стопа ПБ','walk.front.near.foot.roll')]),
]


def build_timing_board():
    board = Board(1920,1600)
    board.masthead('R4D  /  Q3C  /  STAGE C','Ритм по звеньям',
                   'Ось времени 0–4,22 с. Каждая строка имеет собственный диапазон. Полные сегменты и handles в JSON.')
    times = [DURATION*j/120 for j in range(121)]
    poses = [mechanism(transform(t)) for t in times]
    for col,(title,rows) in enumerate(DISPLAY):
        x = 34+col*623
        board.card((x,152,x+607,798))
        board.text(x+20,170,title,25,GOLD,'bold')
        start,end = x+204,x+587
        for key in MOTION['keys']:
            g = start+(end-start)*key['t']/DURATION
            board.rule([(g,222),(g,768)],FRAME,1)
            board.text(g,207,key['id'],15,MUTED,anchor='mm')
        for i,(label,id_) in enumerate(rows):
            y = 230+i*46
            board.text(x+20,y+9,label,19,TEXT)
            samples = [value_at(TRACKS[id_],t) for t in times]
            plot(board,(start,y,end,y+33),samples,PINK if 'rapt' in id_ else TEAL)
        if col<2:
            side,side_label = ('far','дальняя') if col==0 else ('near','ближняя')
            board.text(x+20,616,'Опоры от контакта',19,GOLD,'bold')
            for i,(position,label) in enumerate([('rear','Задняя'),('front','Передняя')]):
                y = 656+i*45
                board.text(x+20,y+4,label+' '+side_label,18,MUTED)
                legs = [p['legs'][f'{position}.{side}'] for p in poses]
                femurs = unwrap([leg_angle(leg['hip'],leg['knee']) for leg in legs])
                tibias = unwrap([leg_angle(leg['knee'],leg['ankle']) for leg in legs])
                plot(board,(start,y,end,y+27),femurs,GOLD,2)
                plot(board,(start,y,end,y+27),tibias,TEAL,2)
            board.text(start,750,'Золото — бедро     бирюза — голень',16,MUTED)
    board.text(36,816,'Опоры 68 / 76 следуют своим контактам. Медные приводы следуют расстояниям между двумя креплениями.',20,MUTED)
    board.text(36,855,'Живой покой    /    две формы, разные фазы',30,TEXT,'title')
    names = {'cradle.rise':'Рама · вертикаль','cradle.x':'Рама · перенос',
             'eye.gimbal.aim':'Оптика','head.chassis.abs':'Запаздывание головы',
             'eye.brow.angle':'Козырёк','eye.iris.open':'Диафрагма',
             'thorax.lower.abs':'Нижняя грудь','thorax.upper.abs':'Верхняя грудь',
             'head.carriage.section1.stroke':'Гильза 1','head.carriage.section2.stroke':'Гильза 2',
             'rapt.near.femur.abs':'Ближнее бедро','rapt.far.femur.abs':'Дальнее бедро',
             'rapt.near.tibia.relative':'Ближний серп','rapt.far.tibia.relative':'Дальний серп'}
    for form,x,title in [('capsule',34,'КАПСУЛА'),('mantis',970,'БОГОМОЛ')]:
        board.card((x,902,x+917,1555))
        board.text(x+22,921,title,22,GOLD,'bold')
        for index,channel in enumerate(MOTION['idle'][form]):
            y = 964+index*38
            name = channel['channel']
            label = names.get(name,'Микроперекат '+('ближний' if 'near' in name else 'дальний'))
            board.text(x+20,y+4,label,18,TEXT)
            samples = [idle_value(form,channel,j*.04) for j in range(151)]
            plot(board,(x+244,y,x+894,y+27),samples,PINK if 'rapt' in name else TEAL,2)
        board.text(x+244,1527,'0 с',16,MUTED)
        board.text(x+894,1527,'6 с',16,MUTED,anchor='ra')
    board.text(35,1570,'Seed 37. Разные периоды и отдельные события взгляда. Амплитуды и правила стыка сохранены в JSON.',18,MUTED)
    board.save('04-c2-curves-and-idles.png')


def piston_lengths(p):
    def at(a,b,offset):
        return add(a,rotate(offset,leg_angle(a,b)))
    result = {'thorax.piston':math.dist(at(p['root'],p['shoulder'],(74,-6)),
                                       at(p['shoulder'],p['crown'],(7,3)))}
    for side,arm in p['raptors'].items():
        result[f'rapt.{side}.piston'] = math.dist(at(p['shoulder'],arm['elbow'],(66,4)),
                                                at(arm['elbow'],arm['tip'],(6,-2)))
    for id_,leg in p['legs'].items():
        result[f'walk.{id_}.piston'] = math.dist(at(leg['hip'],leg['knee'],(48,-5)),
                                                at(leg['knee'],leg['ankle'],(8,2)))
    return result


def unwrap(angles):
    result = [angles[0]]
    for angle in angles[1:]:
        previous = result[-1]
        result.append(previous+(angle-previous+180)%360-180)
    return result


def measure():
    assert len(PARTS)==len(RIG['inventory'])
    assert sum(g['mass'] for g in RIG['massGroups'])==100
    assert all(p['parent'] is None or p['parent'] in PARTS for p in PARTS.values())
    assert SOURCE['rig']['thorax']['lengths']==[98,98]
    assert ARMS['lengths']==[86,88] and SOURCE['rig']['walking']['lengths']==[68,76]
    assert set(k for _,rows in DISPLAY for _,k in rows)==set(TRACKS)
    for track in TRACKS.values():
        prior_end,prior_value = 0,track['initial']
        for span in track['segments']:
            assert span['start']>=prior_end and span['from']==prior_value
            assert span['end']>span['start'] and span['ease'] in MOTION['curves']
            prior_end,prior_value = span['end'],span['to']
    samples = {i/120 for i in range(math.floor(DURATION*120)+1)}
    samples.update(key['t'] for key in MOTION['keys'])
    for track in TRACKS.values():
        samples.update(s[k] for s in track['segments'] for k in ('start','end'))
    min_arm = math.inf
    min_open = math.inf
    min_roof_depth = math.inf
    min_floor = math.inf
    min_support = math.inf
    bounds = [math.inf,-math.inf,math.inf]
    sleeve_range = {}
    leg_angles = {}
    min_head_tilt_clearance = math.inf
    for t in sorted(samples):
        p = mechanism(transform(t))
        v = p['v']
        body = p['body']
        shoulder_y = p['shoulder'][1]-body[1]
        min_support = min(min_support,support_margin(p))
        for id_,leg in p['legs'].items():
            assert abs(math.dist(leg['hip'],leg['knee'])-68)<1e-6
            assert abs(math.dist(leg['knee'],leg['ankle'])-76)<1e-6
            min_floor = min(min_floor,min(y-FLOOR for _,y in leg['foot']))
            for name,angle in [('femur',leg_angle(leg['hip'],leg['knee'])),
                               ('tibia',leg_angle(leg['knee'],leg['ankle']))]:
                key = f'walk.{id_}.{name}'
                leg_angles.setdefault(key,[]).append(angle)
        for id_,length in piston_lengths(p).items():
            extent = sleeve_range.setdefault(id_,[length,length])
            extent[0],extent[1] = min(extent[0],length),max(extent[1],length)
        if abs(p['carrier_angle'])>1e-5:
            contour = shape_at(HEAD['headOutlineLocalXY'],p['head'],p['head_angle'])
            min_head_tilt_clearance = min(min_head_tilt_clearance,min(y for x,y in contour)-body[1]-90)
        for side,arm in p['raptors'].items():
            assert abs(math.dist(p['shoulder'],arm['elbow'])-86)<1e-6
            assert abs(math.dist(arm['elbow'],arm['tip'])-88)<1e-6
            contour = [sub(q,body) for q in arm['femur']+arm['blade']]
            for joint in (p['shoulder'],arm['elbow']):
                x,y = sub(joint,body)
                contour += [(x+5,y),(x-5,y),(x,y+5),(x,y-5)]
            if .88 <= t <= 1.69:
                assert min(v['bay.rapt.near.door.open'],v['bay.rapt.far.door.open'],
                           v['shell.rear.open'],v['shell.front.open'])>=100
                assert abs(arm['a'])<1e-8 and abs(arm['b']-170)<1e-8
                xmin,xmax,ymin = min(x for x,y in contour),max(x for x,y in contour),min(y for x,y in contour)
                assert xmin>=-67 and xmax<=68 and ymin>=35
                bounds = [min(bounds[0],xmin),max(bounds[1],xmax),min(bounds[2],ymin)]
                for name in ('shell.rear','shell.front'):
                    min_roof_depth = min(min_roof_depth,min(abs(z) for x,y,z in roof_polygon(name,v[name+'.open'])))
            if t>=1.69:
                min_arm = min(min_arm,min(y for x,y in contour)-90)
            if v[f'rapt.{side}.tibia.relative']>170+1e-8:
                assert shoulder_y>=120
                min_open = min(min_open,min(y for x,y in contour)-90)
        assert abs(math.dist(p['root'],p['shoulder'])-98)<1e-6
        assert abs(math.dist(p['shoulder'],p['crown'])-98)<1e-6
    assert min_arm>=4-1e-6 and min_open>=4 and min_roof_depth>51 and min_head_tilt_clearance>4
    assert abs(min_floor)<1e-7 and min_support>0
    for form,t in [('capsule',0),('mantis',DURATION)]:
        for i in range(241):
            p = mechanism(with_idle(transform(t),form,i/40))
            assert support_margin(p)>0
            assert all(min(y for _,y in leg['foot'])>=FLOOR-1e-7 for leg in p['legs'].values())
            for id_,length in piston_lengths(p).items():
                extent = sleeve_range[id_]
                extent[0],extent[1] = min(extent[0],length),max(extent[1],length)
    for id_,(lo,hi) in sleeve_range.items():
        a = PARTS[id_+'.sleeve']['actuator']
        assert lo>=a['housingLength'] and all(
            section-(hi-a['housingLength'])/len(a['sections'])>=a['minOverlap']
            for section in a['sections']), (id_,lo,hi)
    end_pose = mechanism(transform(DURATION))
    near = end_pose['raptors']['near']['tip']
    far = end_pose['raptors']['far']['tip']
    tip_separation = math.hypot(near[0]-far[0]+92*.30,near[1]-far[1]+92*.10)
    assert tip_separation>24
    result = {
        'sampling': {'nominalHz':120,'samplesIncludingKeys':len(samples),'seconds':DURATION},
        'limits':'Rigid XY construction contours, projected depth budget, design mass distribution and fixed foot contacts. Final textured solid sweep, masks and live timing are evaluated on the Asset/Builder candidate.',
        'packedVisibleProfileClearancesXY':packed_margins(packed_pose()),
        'closedArmReleaseXY':{'minX':round(bounds[0],4),'maxX':round(bounds[1],4),'minY':round(bounds[2],4)},
        'closedAndReleasedArmMinRoofClearance':round(min_arm,4),
        'openingBladeMinRoofClearance':round(min_open,4),
        'headHousingSwingHeadMinRoofClearance':round(min_head_tilt_clearance,4),
        'finalBladeTipSeparationInProjection':round(tip_separation,3),
        'roofPanelsMinAbsDepthDuringClosedExit':round(min_roof_depth,4),
        'minSoleAboveFloor':round(min_floor,7),
        'minMassProjectionDistanceToContactHullEdge':round(min_support,3),
        'pistonPinDistanceRanges':{k:[round(x,3) for x in r] for k,r in sleeve_range.items()},
        'derivedLegAngleRangesDegrees':{k:[round(min(unwrap(r)),3),round(max(unwrap(r)),3)]
                                        for k,r in leg_angles.items()},
        'keys':[{'id':key['id'],'t':key['t'],'values':{k:round(v,5) for k,v in transform(key['t']).items()},
                 'landmarks':{k:[round(x,4) for x in mechanism(transform(key['t']))[k]] for k in
                              ('body','root','shoulder','crown','head','lens')}} for key in MOTION['keys']],
    }
    (HERE/'C2_MEASUREMENTS.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({k:v for k,v in result.items() if k not in ('keys','limits')},ensure_ascii=False))


def build_preview():
    if not features.check('webp'):
        raise RuntimeError('Требуется WebP animation в существующем Pillow')
    frames = []
    fps = 24
    capsule_time = 2.20
    length = capsule_time+DURATION+2.60
    for i in range(round(length*fps)):
        t = i/fps
        board = Board(820,575)
        board.text(22,15,'Q3C  /  C2',17,GOLD,'bold')
        board.text(22,43,'Одна конструкция',28,TEXT,'title')
        board.card((15,85,805,550))
        if t<capsule_time:
            label = 'Капсула · живой покой'
            strength = min(1,max(0,(capsule_time-t)/.24))
            pose = with_idle(transform(0),'capsule',t,bezier(strength,'damped'))
        elif t<capsule_time+DURATION:
            dt = t-capsule_time
            key = max((k for k in MOTION['keys'] if k['t']<=dt),key=lambda k:k['t'])
            label = f"{key['id']} · {key['title']}     {dt:.2f} c"
            pose = transform(dt)
        else:
            label = 'Богомол · живой покой'
            dt = t-capsule_time-DURATION
            pose = with_idle(transform(DURATION),'mantis',dt,bezier(min(1,dt/.42),'damped'))
        board.text(35,104,label,18,TEAL,'bold')
        board.rule([(35,522),(785,522)],FRAME,2)
        draw_mechanism(board,mechanism(pose),386,518,1.15)
        frames.append(board.im)
    frames[0].save(HERE/'05-c2-motion-study.webp',save_all=True,append_images=frames[1:],
                   duration=42,loop=1,quality=82,method=3)


if __name__ == '__main__':
    measure()
    build_rig_board()
    build_poses_board()
    build_timing_board()
    build_preview()
