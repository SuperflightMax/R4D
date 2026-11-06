"""Авторская техническая схема Q3C; не rig и не исходник продукта.

Запуск: python experiments/q3c-victorian-mantis/design/concept/packing_diagram.py
Создаёт PNG-превью и редактируемый SVG из одних векторных примитивов.
Генеративных моделей, загрузок и обработки концепт-изображений здесь нет.
"""
from pathlib import Path
import math
import html
from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parent
W, H = 1800, 1120
BG = '#eee9df'
INK = '#243d43'
MUTED = '#64777a'
SHELL = '#29575b'
SPINE = '#c79b49'
ARM = '#a65e79'
LEG = '#628d9e'
EYE = '#e5a13e'
image = Image.new('RGB', (W, H), BG)
draw = ImageDraw.Draw(image)
svg = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">', f'<rect width="{W}" height="{H}" fill="{BG}"/>']
font_dir = Path('C:/Windows/Fonts')

def font(size, bold=False):
    return ImageFont.truetype(str(font_dir / ('arialbd.ttf' if bold else 'arial.ttf')), size)

def text(x, y, value, size=20, color=INK, bold=False):
    draw.text((x, y), value, fill=color, font=font(size, bold))
    svg.append(f'<text x="{x}" y="{y + size * .94}" font-family="Arial,sans-serif" font-size="{size}" fill="{color}" font-weight="{700 if bold else 400}">{html.escape(value)}</text>')

def line(points, color=INK, width=2):
    draw.line(points, fill=color, width=width)
    svg.append(f'<polyline points="{" ".join(f"{x:.2f},{y:.2f}" for x,y in points)}" fill="none" stroke="{color}" stroke-width="{width}" stroke-linejoin="round"/>')

def polygon(points, fill, outline=INK, width=2):
    draw.polygon(points, fill=fill)
    if outline:
        draw.line(points + [points[0]], fill=outline, width=width)
    svg.append(f'<polygon points="{" ".join(f"{x:.2f},{y:.2f}" for x,y in points)}" fill="{fill}" stroke="{outline or "none"}" stroke-width="{width}"/>')

def circle(x, y, r, fill, outline=INK, width=2):
    draw.ellipse((x-r,y-r,x+r,y+r), fill=fill, outline=outline, width=width)
    svg.append(f'<circle cx="{x:.2f}" cy="{y:.2f}" r="{r:.2f}" fill="{fill}" stroke="{outline}" stroke-width="{width}"/>')

def rect(x,y,w,h,fill,outline=None):
    polygon([(x,y),(x+w,y),(x+w,y+h),(x,y+h)], fill, outline)

def point(p, length, deg):
    rad = math.radians(deg)
    return p[0]+length*math.cos(rad), p[1]+length*math.sin(rad)

SCALE = 1.5
GROUND_Y = 655

def screen(p, cx):
    return cx+p[0]*SCALE, GROUND_Y-(p[1]+30)*SCALE

def world_poly(points,cx,fill,outline=INK):
    polygon([screen(p,cx) for p in points], fill, outline)

def inside(p, outline):
    x,y=p
    contained=False
    for i in range(len(outline)):
        ax,ay=outline[i]
        bx,by=outline[(i+1)%len(outline)]
        if (ay>y)!=(by>y) and x<(bx-ax)*(y-ay)/(by-ay)+ax:
            contained=not contained
    return contained

def link(a,b,width,cx,fill,blade=False):
    length = math.dist(a,b)
    angle = math.atan2(b[1]-a[1],b[0]-a[0])
    # Один и тот же жёсткий контур во всех состояниях; только перенос/поворот.
    if blade:
        shape = [(-3,-5),(length*.20,-4),(length*.35,-9),
                 (length*.41,-3),(length*.53,-7),(length*.59,-1),
                 (length*.72,-5),(length*.78,0),(length,0),
                 (length*.82,10),(length*.48,18),(length*.16,13),(-3,6)]
    else:
        shape = [(-5,-width*.34),(length*.17,-width*.5),
                 (length*.78,-width*.38),(length+4,-width*.17),
                 (length+4,width*.17),(length*.75,width*.46),
                 (length*.18,width*.5),(-5,width*.34)]
    transformed = [(a[0]+x*math.cos(angle)-y*math.sin(angle),
                    a[1]+x*math.sin(angle)+y*math.cos(angle)) for x,y in shape]
    world_poly(transformed,cx,fill)
    for p in (a,b):
        x,y=screen(p,cx)
        circle(x,y,5*SCALE,BG,INK,2)
        circle(x,y,1.6*SCALE,INK,INK,1)
    return transformed

def ik_knee(root,foot,l1=68,l2=76,sign=1):
    dx,dy=foot[0]-root[0],foot[1]-root[1]
    d=math.hypot(dx,dy)
    if not abs(l1-l2) < d < l1+l2:
        raise ValueError('Недостижимая опора в авторской схеме')
    a=(l1*l1-l2*l2+d*d)/(2*d)
    h=math.sqrt(l1*l1-a*a)
    return root[0]+a*dx/d-sign*h*dy/d,root[1]+a*dy/d+sign*h*dx/d

SHELL_SHAPE=[(-90,12),(-90,42),(-83,64),(-63,81),(-32,90),(2,88),
             (35,81),(63,70),(90,57),(90,12),(55,5),(-55,5)]

def mechanism(cx,mode):
    packed=mode=='P'
    rise=40 if mode=='M' else 0
    base=(40,32+rise)
    a1,a2=(82,78) if mode=='M' else (170,10)
    joint=point(base,98,a1)
    crown=point(joint,98,a2)
    body=[(x,y+rise) for x,y in SHELL_SHAPE]
    inventory=[]
    # В cutaway оболочка дана контуром; конечности и грудь показаны в своих слоях.
    if not packed:
        world_poly(body,cx,SHELL)
        line([screen((-72,52+rise),cx),screen((-32,73+rise),cx),screen((24,69+rise),cx)], '#779291',3)
    else:
        world_poly(body,cx,'#d9ded7')
    # Дальняя пара опор: та же длина, иной реальный вынос стопы.
    for far in (True,False):
        for side in (-1,1):
            root=(75*side,20+rise)
            if packed:
                knee=(7*side,20)
                toe=(83*side,20)
            else:
                spread=(138 if far else 170) if mode=='M' else (105 if far else 132)
                toe=(spread*side,-28)
                knee=ik_knee(root,toe,sign=side)
            color='#95acb0' if far else LEG
            inventory+=link(root,knee,14,cx,color)
            inventory+=link(knee,toe,12,cx,color)
            tx,ty=toe
            foot=[(tx-5,ty+5),(tx+5,ty+5),(tx+6,ty-2),(tx-6,ty-2)]
            inventory+=foot
            world_poly(foot,cx,color)
            assert abs(math.dist(root,knee)-68)<1e-6
            assert abs(math.dist(knee,toe)-76)<1e-6
    cradle=[(-75,10+rise),(75,10+rise),(75,29+rise),(-75,29+rise)]
    inventory+=cradle
    world_poly(cradle,cx,'#b2a17a')
    inventory+=link(base,joint,17,cx,SPINE)
    inventory+=link(joint,crown,17,cx,SPINE)
    arm_a,arm_b=(60,-60) if mode=='M' else (0,170)
    elbow=point(joint,86,arm_a)
    tip=point(elbow,88,arm_b)
    packed_arm=[]
    for far in (True,False):
        # Совпадающая боковая проекция двух разнесённых по z лап.
        # Контур дальней лапы не смещён ради красоты: слои видны на разрезе ниже.
        color='#c19ba8' if far else ARM
        packed_arm+=link(joint,elbow,22,cx,color)
        packed_arm+=link(elbow,tip,16,cx,color,blade=True)
    # Короткая оптическая каретка: жёсткий корпус остаётся у C2,
    # показана только вышедшая часть двух вложенных штоков.
    stroke=0 if packed else (10 if mode=='M' else 24)
    barrel=[(crown[0]-26,crown[1]-5),(crown[0],crown[1]-5),
            (crown[0],crown[1]+5),(crown[0]-26,crown[1]+5)]
    inventory+=barrel
    world_poly(barrel,cx,'#b78355')
    if stroke:
        world_poly([(crown[0]-2,crown[1]-2),(crown[0]+stroke,crown[1]-2),
                    (crown[0]+stroke,crown[1]+2),(crown[0]-2,crown[1]+2)],cx,'#dac399')
    hx,hy=crown[0]+stroke,crown[1]
    head_angle=math.radians(-25 if packed else 0)
    def head_point(x,y):
        return hx+x*math.cos(head_angle)-y*math.sin(head_angle),hy+x*math.sin(head_angle)+y*math.cos(head_angle)
    head=[head_point(x,y) for x,y in [(-8,-10),(18,-17),(30,-8),(27,4),(-4,8)]]
    inventory+=head
    world_poly(head,cx,SPINE)
    eye_center=head_point(12,-6)
    inventory += [(eye_center[0]+9*math.cos(t*math.pi/12),eye_center[1]+9*math.sin(t*math.pi/12)) for t in range(24)]
    ex,ey=screen(eye_center,cx)
    circle(ex,ey,9*SCALE,EYE)
    circle(ex+3,ey,3.5*SCALE,INK)
    crest=[head_point(x,y) for x,y in [(-9,3),(8,11),(31,6),(32,2),(3,4)]]
    inventory+=crest
    world_poly(crest,cx,SPINE)
    if packed:
        # Проверяются вершины жёстких контуров внутри выпуклого
        # контура упаковки, а не только в ограничивающем прямоугольнике.
        for x,y in inventory+packed_arm:
            assert inside((x,y),SHELL_SHAPE), ('Пакет выходит из оболочки',x,y)
        line([screen(p,cx) for p in body+[body[0]]],SHELL,3)
        text(cx-140,690,'Оболочка раскрыта только на схеме',16,MUTED)
        text(cx-140,716,'Глаз повёрнут внутрь на своём шарнире',16,MUTED)
    else:
        text(cx-170,690,'Те же 2 × 98 / 86 + 88 / 68 + 76',17,MUTED)
    # Неброские ID с одинаковой семантикой между проекциями.
    for value,p in [('S',(-42,56+rise)),('A',point(joint,45,arm_a)),('E',eye_center)]:
        x,y=screen(p,cx)
        circle(x,y-27,14,BG,INK,1)
        text(x-6,y-38,value,20,INK,True)
    return base,joint,crown,elbow,tip

text(36,28,'Q3C · ОДИН МЕХАНИЗМ, ПОСТОЯННЫЕ ДЕТАЛИ',34,INK,True)
text(36,80,'Производственная схема упаковки · D = 100 условных единиц · одинаковый масштаб трёх видов',23,MUTED)
for x in (600,1200):
    line([(x,128),(x,748)],'#c7cec7',2)
text(35,133,'P · УПАКОВАННЫЙ РАЗРЕЗ',25,INK,True)
text(636,133,'C · ХОДЯЧАЯ КАПСУЛА',25,INK,True)
text(1230,133,'M · РАСКРЫТЫЙ БОГОМОЛ',25,INK,True)
text(35,193,'A: две лапы по бокам, каждая',21,ARM,True)
text(35,224,'86 + 88; клинок сложен вдоль бедра.',21,INK)
text(35,270,'Грудь: 98 + 98, уложена Z-пакетом.',21,SPINE,True)
text(35,306,'Глаз и козырёк идут с верхним звеном.',21,INK)
text(636,193,'S: исходная оболочка остаётся',21,SHELL,True)
text(636,224,'брюшком прежнего размера.',21,INK)
text(636,270,'Четыре опоры выходят из нижних',21,LEG,True)
text(636,301,'четырёх ложементов; 68 + 76 каждая.',21,INK)
text(636,347,'Глаз выходит через передний люк.',21,EYE,True)
text(1230,180,'Высота ≈ 2,5 высоты ходячей капсулы.',18,MUTED)
for cx,mode in [(300,'P'),(900,'C'),(1500,'M')]:
    mechanism(cx,mode)
    line([(cx-270,GROUND_Y+3),(cx+270,GROUND_Y+3)],MUTED,2)
text(35,770,'РАЗРЕЗ ПО ГЛУБИНЕ В УПАКОВКЕ · ПРОЕКЦИОННЫЙ НАХЛЁСТ НЕ ЗНАЧИТ ПЕРЕСЕЧЕНИЕ',24,INK,True)
layers=[(-55,-51,'стенка','#b2a17a'),(-51,-33,'A far',ARM),(-31,-13,'L far',LEG),
        (-11,11,'грудь',SPINE),(13,31,'L near',LEG),(33,51,'A near',ARM),(51,55,'стенка','#b2a17a')]
zx=105
zs=6.7
for z0,z1,label,color in layers:
    x=zx+(z0+55)*zs
    rect(x,830,(z1-z0)*zs,92,color,INK)
    if z1-z0>5:
        text(x+8,861,label,19,'#fff8e8',True)
text(105,938,'z = −55',18,MUTED)
text(780,938,'+55',18,MUTED)
text(930,827,'A — хватательные лапы: два отдельных слоя по 18.',21,INK)
text(930,865,'L — передняя и задняя опоры в своём слое,',21,INK)
text(930,895,'разные продольные ложементы; локти сложены в глубину.',21,INK)
text(930,933,'Между функциональными слоями — 2 единицы зазора.',21,MUTED)
text(36,1008,'Что установлено: крупные звенья помещаются в заданные ложементы; длины и оболочка не меняются.',22,INK,True)
text(36,1047,'Что ещё проверяет rig: объём ассетов, весь путь выхода, шарнирные зазоры, окклюзия и фактическая нагрузка опор.',21,MUTED)
text(36,1080,'Это компоновочное обоснование и карта деталей, а не готовый rig, collision QA или PASS живой сцены.',20,MUTED)
svg.append('</svg>')
(OUT/'03-packing-and-mapping-v1.svg').write_text('\n'.join(svg),encoding='utf-8')
image.save(OUT/'03-packing-and-mapping-v1.png')
print('Created 03-packing-and-mapping-v1.svg + .png; rigid lengths and packed inventory contours verified inside shell.')
