"""Static construction geometry only. No renderer runtime, animation or old inputs.

Run from D:/dev/R4D: python experiments/q5a-construction-first/construction/build_package.py [--check]
"""
import argparse
import json
import math
import io
import hashlib
import subprocess
import xml.etree.ElementTree as ET
from pathlib import Path
from html import escape

HERE = Path(__file__).resolve().parent
V2_COMMIT = 'd3bdf8f1cffebe2179805eeb54a8a36faab08805'


def signed_area(a,b,c):
    return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])


def rigid_triangles(poly):
    """Author explicit topology for a rigid polygon, never used for cloth."""
    ids=list(range(len(poly)))
    if poly[0]==poly[-1]:ids.pop()
    orient=sum(poly[ids[i]][0]*poly[ids[(i+1)%len(ids)]][1]-poly[ids[(i+1)%len(ids)]][0]*poly[ids[i]][1] for i in range(len(ids)))
    sign=1 if orient>0 else -1
    out=[]
    while len(ids)>3:
        for j,b in enumerate(ids):
            a,c=ids[j-1],ids[(j+1)%len(ids)]
            if sign*signed_area(poly[a],poly[b],poly[c])<1e-8:continue
            if any(all(sign*x>1e-8 for x in [signed_area(poly[a],poly[b],poly[k]),signed_area(poly[b],poly[c],poly[k]),signed_area(poly[c],poly[a],poly[k])]) for k in ids if k not in (a,b,c)):continue
            out.append([a,b,c] if sign>0 else [a,c,b]);ids.pop(j);break
        else:raise ValueError('non-simple rigid polygon')
    out.append(ids if sign>0 else list(reversed(ids)))
    return out


def row_mesh(rows,positive=True):
    rows=[[list(point) for point in row] for row in rows]
    vertices=[p for row in rows for p in row]
    triangles=[]
    for i in range(len(rows)-1):
        n=2*i
        triangles.extend([[n,n+1,n+2],[n+1,n+3,n+2]] if positive else [[n,n+2,n+1],[n+1,n+2,n+3]])
    return {'vertices':vertices,'triangles':triangles,
            'outline':[r[0] for r in rows]+[r[1] for r in reversed(rows)],
            'parameter_rows':rows,'topology_policy':'explicit_constant_rows_no_fallback'}


def add(a, b):
    return [a[0] + b[0], a[1] + b[1]]


def delta(a, b):
    return [a[0] - b[0], a[1] - b[1]]


def length(v):
    return math.hypot(*v)


def unit(v):
    n = length(v)
    assert n > 1e-8
    return [v[0] / n, v[1] / n]


def lerp(a, b, t):
    return [a[i] * (1 - t) + b[i] * t for i in range(2)]


def quadratic(a,c,b,t):
    return [(1-t)**2*a[i]+2*(1-t)*t*c[i]+t*t*b[i] for i in range(2)]


def soften_closed(points):
    # Corner-cut only inside the explicit anatomical control polygon; no overshoot.
    return [lerp(a,b,t) for a,b in zip(points,points[1:]+points[:1]) for t in (.25,.75)]


def rotate(v, degrees):
    r = math.radians(degrees)
    c, s = math.cos(r), math.sin(r)
    return [v[0] * c - v[1] * s, v[0] * s + v[1] * c]


def limb_tip(p, size, degrees):
    # 0 = down, positive = forward (+x).
    return add(p, [size * math.sin(math.radians(degrees)), -size * math.cos(math.radians(degrees))])


def knee(hip, ankle):
    a, b = 98.0, 94.0
    v = delta(ankle, hip)
    d = length(v)
    assert abs(a - b) < d < a + b, ('unreachable', hip, ankle, d)
    u = unit(v)
    along = (a*a - b*b + d*d) / (2*d)
    height = math.sqrt(max(0, a*a - along*along))
    return add(hip, [u[0]*along - u[1]*height, u[1]*along + u[0]*height])


def flex(a, joint, b):
    u, v = unit(delta(a, joint)), unit(delta(b, joint))
    return 180 - math.degrees(math.acos(max(-1, min(1, u[0]*v[0] + u[1]*v[1]))))


def chain_mesh(points, stations, roots, names, root_frame=None):
    """Continuous ribbon with shared joint, not separate capped segments.

    Station: normalized distance on first+second bone (joint = 1), half width.
    Joint bisector and coalesced inner-fold vertices keep a bounded fold.
    Geometry is a review envelope; no UV texture or production skinning here.
    """
    a, j, b = points
    u, v = unit(delta(j, a)), unit(delta(b, j))
    bisector = unit(add(u, v))
    theta = flex(a, j, b)
    rows, weights = [], []
    for t, width in stations:
        c = lerp(a, j, t) if t <= 1 else lerp(j, b, t - 1)
        tangent = u if t < .82 else v if t > 1.18 else unit(lerp(u, v, (t - .82)/.36))
        if t == 1:
            tangent = bisector
        normal = [-tangent[1], tangent[0]]
        # Inner fold uses offset-line intersection, avoiding inverted triangles.
        # Outer width stays anatomical; no joint disc is introduced.
        bend = max(0, 1 - abs(t-1)/.22) * min(theta/140, 1)
        turn = u[0]*v[1] - u[1]*v[0]
        inner = 1 if turn > 0 else -1
        row = []
        for sign in (1, -1):
            miter = 1 / max(.34, math.cos(math.radians(theta/2)))
            w = width * (1 + (miter-1)*bend if sign == inner else 1)
            row.append(add(c, [sign*normal[0]*w, sign*normal[1]*w]))
        rows.append(row)
        w2 = max(0, min(1, (t-.78)/.44))
        w1 = 1-w2
        root_weight = max(0, (0.45-t)/.45) * roots
        if root_frame and root_weight:
            # Actual chest-carried material points, not metadata-only weights.
            rest_angle, chest_tilt = root_frame
            rest_u = [math.sin(math.radians(rest_angle)), -math.cos(math.radians(rest_angle))]
            rest_n = [-rest_u[1],rest_u[0]]
            bone_length=length(delta(j,a))
            chest_center=add(a,rotate([rest_u[0]*bone_length*t,rest_u[1]*bone_length*t],-chest_tilt))
            blended_center=lerp(c,chest_center,root_weight)
            for k,sign in enumerate((1,-1)):
                chest_p=add(chest_center,rotate([sign*width*rest_n[0],sign*width*rest_n[1]],-chest_tilt))
                weighted=lerp(row[k],chest_p,root_weight)
                # Deltoid volume corrective after the real frame blend.
                radial=unit(delta(weighted,blended_center))
                row[k]=add(blended_center,[radial[0]*width,radial[1]*width])
        weights.extend([{names[0]: root_weight, names[1]: w1*(1-root_weight), names[2]: w2*(1-root_weight)}]*2)
    # At deep flex the inner skin folds onto itself. Coalesce the three inner
    # fold vertices continuously; do not enlarge a round patch or invert UV faces.
    collapse = max(0, min(1, (theta-70)/20))
    collapse = collapse*collapse*(3-2*collapse)
    inner_index = 0 if inner == 1 else 1
    joint_row = next(i for i,(t,_) in enumerate(stations) if t == 1)
    fold_point = rows[joint_row][inner_index][:]
    for i,(t,_) in enumerate(stations):
        if .77 <= t <= 1.23:
            rows[i][inner_index] = lerp(rows[i][inner_index],fold_point,collapse)
    hem_correction=0
    if stations==LEG_STATIONS:
        # General calf/shorts self-contact constraint at the fixed t=.5 hem.
        # Only the inner calf is constrained; bones and outer joint contour stay.
        h0,h1=rows[2]
        h_inner=rows[2][inner_index]
        outside=unit(delta(h_inner,rows[2][1-inner_index]))
        for i in range(joint_row+1,len(rows)-1):
            p,q=rows[i][inner_index],rows[i+1][inner_index]
            crossing=(signed_area(p,q,h0)*signed_area(p,q,h1)<-1e-7 and
                      signed_area(h0,h1,p)*signed_area(h0,h1,q)<-1e-7)
            if crossing:
                distance=sum(x*y for x,y in zip(delta(p,h_inner),outside))
                shift=max(0,.35-distance)
                rows[i][inner_index]=add(p,[outside[0]*shift,outside[1]*shift])
                hem_correction=max(hem_correction,shift)
    vertices = [p for row in rows for p in row]
    triangles = []
    for i in range(len(rows)-1):
        n = 2*i
        for tri in [[n,n+1,n+2],[n+1,n+3,n+2]]:
            aa,bb,cc=[vertices[k] for k in tri]
            area=(bb[0]-aa[0])*(cc[1]-aa[1])-(bb[1]-aa[1])*(cc[0]-aa[0])
            # Fixed topology: zero-area fold faces stay present; never pop out.
            triangles.append(tri)
    outline = [r[0] for r in rows] + [r[1] for r in reversed(rows)]
    # Smooth outer bend, preserving the original anatomical joint extremum.
    # Replace only the two outer-edge faces; the two intentional inner fold
    # faces retain their indices and their zero-area behaviour.
    outer=1-inner_index
    oa,om,ob=[2*i+outer for i in (joint_row-1,joint_row,joint_row+1)]
    control=[2*vertices[om][k]-.5*(vertices[oa][k]+vertices[ob][k]) for k in range(2)]
    arc=[]
    for k in range(9):
        if k in (0,4,8):index={0:oa,4:om,8:ob}[k]
        else:
            index=len(vertices);vertices.append(quadratic(vertices[oa],control,vertices[ob],k/8))
            lo,hi,t=(oa,om,k/4) if k<4 else (om,ob,(k-4)/4)
            weights.append({name:weights[lo].get(name,0)*(1-t)+weights[hi].get(name,0)*t for name in names})
        arc.append(index)
    for first,last,sequence in [(oa,om,arc[:5]),(om,ob,arc[4:])]:
        old=next(t for t in triangles if first in t and last in t)
        pivot=next(i for i in old if i not in (first,last))
        orientation=1 if old[(old.index(first)+1)%3]==last else -1
        triangles.remove(old)
        for p,q in zip(sequence,sequence[1:]):
            triangles.append([p,q,pivot] if orientation>0 else [p,pivot,q])
    chains=[[2*i+side for i in range(len(rows))] for side in (0,1)]
    start=chains[outer].index(oa);end=chains[outer].index(ob)
    chains[outer][start:end+1]=arc
    outline=[vertices[i] for i in chains[0]]+[vertices[i] for i in reversed(chains[1])]
    # Concave inner fold fillet is part of the SAME continuous skin mesh.
    # The coalescing material vertices remain real internal fold vertices;
    # this connected fillet makes them interior, rather than a pointed silhouette.
    fold_id=2*joint_row+inner_index
    centre=vertices[fold_id]
    radius=8 if stations==LEG_STATIONS else 6
    t0=add(centre,[-u[0]*radius,-u[1]*radius])
    t1=add(centre,[v[0]*radius,v[1]*radius])
    fillet=[]
    for k in range(9):
        p=quadratic(t0,centre,t1,k/8)
        index=len(vertices);vertices.append(p);fillet.append(index)
        source_id=2*(joint_row-2)+inner_index if k<4 else 2*(joint_row+2)+inner_index
        weights.append({name:.8*weights[fold_id].get(name,0)+.2*weights[source_id].get(name,0) for name in names})
    for p,q in zip(fillet,fillet[1:]):
        triangles.append([fold_id,q,p] if inner_index==0 else [fold_id,p,q])
    inner_region=[vertices[fold_id]]+[vertices[i] for i in fillet]
    cap=[]
    cap_start=len(vertices)
    if root_frame:
        # Continuous clavicle/deltoid contour returning into chest, no flat cut
        # and no separate circular cover. Its chest-carried controls affect geometry.
        offset=rotate([-8,8],-root_frame[1])
        root_normal=unit(delta(rows[0][0],rows[0][1]))
        root_forward=[root_normal[1],-root_normal[0]]
        along=offset[0]*root_forward[0]+offset[1]*root_forward[1]
        if along>-8:
            offset=add(offset,[-root_forward[0]*(along+8),-root_forward[1]*(along+8)])
        end0,end1=rows[0][1],rows[0][0]
        cap=bezier(end0,add(end0,offset),add(end1,offset),end1,8)[1:-1]
        previous=1
        for p in cap:
            index=len(vertices)
            vertices.append(p)
            weights.append({names[0]:.35,names[1]:.65,names[2]:0})
            triangles.append([0,index,previous])
            previous=index
        outline+=cap
    result={'vertices': vertices, 'triangles': triangles, 'outline': outline, 'weights': weights,
            'joint_flex_deg': theta, 'station_t_width': stations,
            'fold_inner_vertex_ids':[2*i+inner_index for i,(t,_) in enumerate(stations) if .77<=t<=1.23],
            'fold_compression':collapse,'uv_policy':'immutable_bind_vertex_id_no_reprojection',
            'root_frame':list(root_frame) if root_frame else None,'root_weight_applied_to_geometry':bool(root_frame),
            'contour_chains':chains,'outer_bend_control':control,'outer_bend_vertex_ids':arc,
            'inner_fillet_vertex_ids':fillet,'inner_fillet_pivot':fold_id,
            'silhouette_regions':[outline,inner_region]}
    result['calf_hem_contact_correction']=hem_correction
    if root_frame:
        result['root_outline']=[r[0] for r in rows[:3]]+[r[1] for r in reversed(rows[:3])]+cap
        result['limb_outline']=[vertices[i] for i in chains[0] if i not in (0,2)]+[vertices[i] for i in reversed(chains[1]) if i not in (1,3)]
        result['root_rows']=rows[:3]
        result['limb_rows']=rows[2:]
        result['cap_vertex_ids']=list(range(cap_start,len(vertices)))
    return result


ARM_STATIONS = [[0,15],[.18,15],[.45,13],[.78,10],[1,9],[1.22,11],[1.55,9],[1.85,6.5],[2,6]]
LEG_STATIONS = [[0,25],[.22,26],[.5,23],[.8,17],[1,14],[1.22,18],[1.5,18],[1.82,11],[2,8]]
# No time values: these are independent construction extremes, not motion keys.
POSES = [
    dict(id='bind', root=[0,202], lean=0, ankles=[[-12,16],[12,16]], arms=[[-24,20],[8,20]], contact=['flat','flat']),
    dict(id='idle_shift', root=[3,199], lean=-2, ankles=[[-12,16],[12,16]], arms=[[-25,22],[5,24]], contact=['flat','flat']),
    dict(id='low_mid', root=[-18,154], lean=18, ankles=[[-12,16],[12,16]], arms=[[25,45],[32,48]], contact=['flat','flat']),
    dict(id='low_deep', root=[-35,100], lean=32, ankles=[[-12,16],[12,16]], arms=[[48,65],[55,70]], contact=['toe','flat']),
    dict(id='walk_far_contact', root=[0,192], lean=5, ankles=[[54,16],[-46,16]], arms=[[-28,25],[32,22]], contact=['heel','toe']),
    dict(id='walk_near_contact', root=[0,192], lean=5, ankles=[[-46,16],[54,16]], arms=[[32,22],[-28,25]], contact=['toe','heel']),
    dict(id='walk_far_pass', root=[0,199], lean=5, ankles=[[5,40],[-3,16]], arms=[[8,35],[-8,35]], contact=['air','flat']),
    dict(id='walk_near_pass', root=[0,199], lean=5, ankles=[[-3,16],[5,40]], arms=[[-28,20],[8,35]], contact=['flat','air']),
    dict(id='jump_prepare', root=[-28,114], lean=28, ankles=[[-12,16],[12,16]], arms=[[-30,50],[-22,55]], contact=['toe','flat']),
    dict(id='jump_push', root=[3,216], lean=3, ankles=[[-10,30],[14,30]], arms=[[110,25],[115,30]], contact=['toe','toe']),
    dict(id='jump_apex', root=[0,302], lean=6, ankles=[[-26,160],[38,143]], arms=[[125,45],[130,50]], contact=['air','air']),
    dict(id='jump_precontact', root=[5,207], lean=10, ankles=[[-18,30],[20,30]], arms=[[55,45],[65,50]], contact=['air','air']),
    dict(id='jump_landing', root=[-25,116], lean=26, ankles=[[-12,16],[12,16]], arms=[[45,65],[52,70]], contact=['toe','flat']),
    dict(id='interrupt_low_to_walk', root=[-20,143], lean=22, ankles=[[-12,16],[25,32]], arms=[[32,40],[18,55]], contact=['flat','air']),
    dict(id='interrupt_low_to_jump', root=[-20,149], lean=22, ankles=[[-12,16],[12,16]], arms=[[35,55],[40,60]], contact=['flat','flat']),
    dict(id='range_compression', root=[-28,90], lean=35, ankles=[[-12,16],[12,16]], arms=[[35,130],[45,135]], contact=['toe','toe']),
    dict(id='range_reach', root=[0,202], lean=0, ankles=[[-12,16],[12,16]], arms=[[140,15],[140,20]], contact=['flat','flat']),
    dict(id='idle_settle_left', root=[-2,201], lean=1, ankles=[[-12,16],[12,16]], arms=[[-24,20],[7,22]], contact=['flat','flat']),
    dict(id='idle_settle_right', root=[2,200], lean=-1, ankles=[[-12,16],[12,16]], arms=[[-26,22],[6,23]], contact=['flat','flat']),
]


def surface_polygon(poly):
    return {'outline': poly, 'vertices': poly, 'triangles': []}


HAND_CONTROLS=[[-7,-5],[-3,-5.6],[2,-5.5],[8,-6],[13,-6.3],[18,-5.7],
               [21,-4.6],[22.4,-2.4],[21.8,-.6],[23,1],[22.3,2.8],[20,4],
               [16,4.5],[12,5],[8,4.8],[8.7,7.7],[7.7,10],[5.8,10.6],
               [4.2,9.8],[1,6],[-2,5.5],[-7,5]]


def hand_surface(wrist,angle,side):
    local=soften_closed(HAND_CONTROLS)
    sign=-1 if side=='far' else 1
    direction=[math.sin(math.radians(angle)),-math.cos(math.radians(angle))]
    normal=[-direction[1]*sign,direction[0]*sign]
    convert=lambda p:add(wrist,[direction[0]*p[0]+normal[0]*p[1],direction[1]*p[0]+normal[1]*p[1]])
    mesh=surface_polygon([convert(p) for p in local])
    thumb=max(range(len(local)),key=lambda i:local[i][1])
    fingertip=max(range(len(local)),key=lambda i:local[i][0])
    mesh.update({'anatomical_local_outline':local,'anatomical_controls':HAND_CONTROLS,
                 'wrist_overlap':7,'thumb_vertex_id':thumb,'finger_vertex_id':fingertip,
                 'anatomical_landmarks':{'wrist':wrist,'palm_center':convert([8,0]),
                                         'thumb_tip':convert(local[thumb]),'finger_tip':convert(local[fingertip])},
                 'hand_frame':{'direction':direction,'normal':normal},
                 'silhouette_policy':'explicit rounded palm/thumb/grouped-finger outline, not bounding quad'})
    return mesh


def bezier(a,b,c,d,steps=8):
    return [[(1-t)**3*a[i]+3*(1-t)**2*t*b[i]+3*(1-t)*t*t*c[i]+t**3*d[i] for i in range(2)]
            for t in [k/steps for k in range(steps+1)]]


def seated_shorts(root,lean,joints,legs):
    """Two material panels, each seated on its own actual hip/thigh frame.

    Back waist -> cubic glute curve -> posterior thigh at t=.28, tangent
    aligned with that thigh. No independent downward rear flap/notch.
    """
    patches=[]
    for side in ('far','near'):
        hip=joints[side+'_hip']
        direction=unit(delta(joints[side+'_knee'],hip))
        normal=[-direction[1],direction[0]]
        posterior=lerp(legs[side]['vertices'][3],legs[side]['vertices'][5],(.28-.22)/(.5-.22))
        anterior=lerp(legs[side]['vertices'][2],legs[side]['vertices'][4],(.28-.22)/(.5-.22))
        back_waist=add(root,rotate([-19,24],-lean*.25))
        # Raise only hidden front waist registration; the old front Bezier
        # crossed the waist edge when the thigh approached horizontal.
        front_waist=add(root,rotate([18,36],-lean*.25))
        back_control=add(back_waist,rotate([-5,-15],-lean*.25))
        join_control=add(posterior,[-direction[0]*18,-direction[1]*18])
        rear=bezier(back_waist,back_control,join_control,posterior,16)
        front=[lerp(front_waist,anterior,k/16) for k in range(17)]
        mesh=row_mesh(list(zip(rear,front)),positive=False)
        mesh.update({'side':side,'posterior_join':posterior,
                        'anterior_join':anterior,'thigh_direction':direction,
                        'rear_curve_controls':[back_waist,back_control,join_control,posterior],
                        'material_owner':side+'_hip','join_t':.28,
                        'parameter_domain':{'s':[0,1],'u':[0,1],'rows':17,'columns':2},
                        'deformation':'cubic_rear_linear_front_ruled_rows'})
        patches.append(mesh)
    vertices=[p for patch in patches for p in patch['vertices']]
    triangles=[t for t in patches[0]['triangles']]+[[i+len(patches[0]['vertices']) for i in t] for t in patches[1]['triangles']]
    return {'outline':patches[1]['outline'],'patches':patches,'vertices':vertices,'triangles':triangles,
            'deformation':'v3_independent_ruled_hip_panels'}


def torso_mesh(local,root,lean):
    left=local[:6];right=list(reversed(local[6:]))
    def at(chain,y):
        for a,b in zip(chain,chain[1:]):
            if a[1]<=y<=b[1]:return [a[0]+(b[0]-a[0])*(y-a[1])/(b[1]-a[1]),y]
        raise ValueError(y)
    rows=[]
    for y in range(12,141,2):
        angle=-lean*(.25+.75*max(0,min(1,(y-12)/87)))
        rows.append([add(root,rotate(at(chain,y),angle)) for chain in (left,right)])
    result=row_mesh(rows)
    result['parameter_domain']={'y':[12,140],'step':2,'rows':65,'columns':2}
    return result


def surface_outlines(surface):
    if 'patches' in surface:return [p['outline'] for p in surface['patches']]
    return surface.get('silhouette_regions',[surface['outline']])


def convex_hull(points):
    points=sorted(set(tuple(p) for p in points))
    def half(sequence):
        out=[]
        for p in sequence:
            while len(out)>=2 and signed_area(out[-2],out[-1],p)<=0:out.pop()
            out.append(p)
        return out
    return [list(p) for p in half(points)[:-1]+half(reversed(points))[:-1]]


def foot(ankle, contact):
    # Same shoe outline, rotation about ball for toe contact, heel for heel contact.
    local = [[-19,-16],[-20,-5],[-10,5],[0,9],[16,-4],[37,-7],[40,-12],[36,-16]]
    pivot = [-19,-16] if contact == 'heel' else [36,-16] if contact == 'toe' else [0,-16]
    angle = 12 if contact == 'heel' else -20 if contact == 'toe' else -8 if contact == 'air' else 0
    pts = [add(pivot, rotate(delta(p,pivot), angle)) for p in local]
    # Contact sets the sole reference exactly on ground; ankle follows rotated shoe.
    shift = [ankle[0], 16 if contact in ('flat','heel','toe') else ankle[1]]
    origin = add(shift, add(pivot, rotate([-pivot[0],-pivot[1]], angle)))
    return origin, [add(shift,p) for p in pts]


def solve(spec):
    root = spec['root']
    lean = spec['lean']
    torso_point = lambda p: add(root, rotate(p, -lean))
    joints = {'pelvis':root, 'chest':torso_point([0,90]), 'neck':torso_point([0,138]),
              'head':torso_point([5,158])}
    geom = {}
    for side, i in [('far',0),('near',1)]:
        hip = add(root, rotate([-4 if side=='far' else 4,0],-lean*.25))
        ankle, shoe = foot(spec['ankles'][i], spec['contact'][i])
        k = knee(hip,ankle)
        shoulder = torso_point([-6 if side=='far' else 6,124])
        upper, bend = spec['arms'][i]
        elbow = limb_tip(shoulder,68,upper)
        wrist = limb_tip(elbow,62,upper+bend)
        for name,p in [('hip',hip),('knee',k),('ankle',ankle),('shoulder',shoulder),('elbow',elbow),('wrist',wrist)]:
            joints[f'{side}_{name}'] = p
        leg = chain_mesh([hip,k,ankle],LEG_STATIONS,.65,['pelvis',f'{side}_hip',f'{side}_knee'])
        arm = chain_mesh([shoulder,elbow,wrist],ARM_STATIONS,.35,['chest',f'{side}_shoulder',f'{side}_elbow'],
                         root_frame=(-24 if side=='far' else 8,lean))
        geom[f'{side}_leg_skin'] = leg
        # Fixed garment boundary: skin above the t=.5 hem is an exported hidden
        # continuation, not an exposed rectangular root behind the soft seat.
        leg['visible_from_t']=.5
        leg['visible_outline']=[leg['vertices'][k] for k in leg['contour_chains'][0] if k not in (0,2)]+[leg['vertices'][k] for k in reversed(leg['contour_chains'][1]) if k not in (1,3)]
        geom[f'{side}_arm_skin'] = arm
        # Posterior upper corner ends at the exact seated-curve join t=.28.
        # Keeping the old root/back corner here would reintroduce the rear flap.
        anterior=lerp(leg['vertices'][2],leg['vertices'][4],(.28-.22)/(.5-.22))
        posterior=lerp(leg['vertices'][3],leg['vertices'][5],(.28-.22)/(.5-.22))
        geom[f'{side}_shorts_leg'] = surface_polygon([leg['vertices'][0],leg['vertices'][2],anterior,
                                                     leg['vertices'][4],leg['vertices'][5],posterior])
        geom[f'{side}_shoe'] = surface_polygon(shoe)
        geom[f'{side}_hand'] = hand_surface(wrist,upper+bend+5,side)
    # Torso uses shaped chest/waist rows, separate from short saddle. No circular joint caps.
    armhole_lift=max(0,min(1,spec['arms'][1][0]/140))
    torso_local = [[-21,12],[-23,63],[-30,99],[-27,119],[-17,130],[-12,140],
                   [9,140],[15,134],[8-2*armhole_lift,120+4*armhole_lift],
                   [11,108+6*armhole_lift],[29,97+2*armhole_lift],[30,93],[24,62],[20,12]]
    # Soft waist gradually transfers pelvic tilt into chest tilt; hem stays overlapped.
    geom['torso_top'] = torso_mesh(torso_local,root,lean)
    geom['torso_top']['armhole_lift']=armhole_lift
    geom['torso_top']['armhole_chest_local']=torso_local[7:11]
    geom['pelvis_shorts'] = seated_shorts(root,lean,joints,{s:geom[s+'_leg_skin'] for s in ('far','near')})
    geom['neck_skin'] = surface_polygon([torso_point(p) for p in [[-12,125],[-11,151],[10,151],[12,125]]])
    h = joints['head']
    head = [[-19,-21],[-23,-5],[-22,16],[-12,29],[5,30],[20,22],[23,5],[29,0],[24,-5],[21,-17],[8,-29],[-9,-29]]
    geom['head_face'] = surface_polygon([add(h,rotate(p,-lean*.2)) for p in head])
    hair = [[-23,-11],[-26,7],[-21,24],[-10,32],[7,32],[22,23],[19,15],[4,20],[-7,11],[-14,-5]]
    geom['hair'] = surface_polygon([add(h,rotate(p,-lean*.2)) for p in hair])
    angles={}
    for side,i in [('far',0),('near',1)]:
        thigh=delta(joints[side+'_knee'],joints[side+'_hip'])
        shin=delta(joints[side+'_ankle'],joints[side+'_knee'])
        pitch={'flat':0,'heel':12,'toe':-20,'air':-8}[spec['contact'][i]]
        angles[side]={'hip_flex':math.degrees(math.atan2(thigh[0],-thigh[1]))+lean*.25,
                      'knee_flex':geom[side+'_leg_skin']['joint_flex_deg'],
                      'elbow_flex':geom[side+'_arm_skin']['joint_flex_deg'],
                      'upper_arm_from_world_down':spec['arms'][i][0],
                      'ankle_dorsiflex':pitch-math.degrees(math.atan2(shin[0],-shin[1]))}
    return {'id':spec['id'],'inputs':spec,'landmarks':joints,'joint_angles_deg':angles,'surfaces':geom}


DRAW = ['far_shoe','far_leg_skin','far_shorts_leg','near_shoe','near_leg_skin',
        'near_shorts_leg','pelvis_shorts','far_arm_skin','far_hand','torso_top',
        'neck_skin','head_face','near_arm_skin','near_hand','hair']
COLORS = {'far':'#acb5bf','near':'#d1d7df','torso_top':'#93b6be','pelvis_shorts':'#b8a6a0',
          'far_shorts_leg':'#a39795','near_shorts_leg':'#c0aca4','head_face':'#d1d7df','neck_skin':'#d1d7df','hair':'#727b88'}


def color(name):
    return COLORS.get(name,COLORS.get(name.split('_')[0],'#d1d7df'))


def polygon_svg(poly, fill, stroke='#404b59', width=1):
    return f'<polygon points="{" ".join(f"{x:.3f},{y:.3f}" for x,y in poly)}" fill="{fill}" stroke="{stroke}" stroke-width="{width}" stroke-linejoin="round"/>'


DRAW_OPS = [(name,fragment) for name in DRAW for fragment in
            (['limb'] if name=='near_arm_skin' else ['all'])]
DRAW_OPS.insert(next(i for i,(n,_) in enumerate(DRAW_OPS) if n=='head_face'),('near_arm_skin','root'))


def draw_shapes(pose):
    for name,fragment in DRAW_OPS:
        surface=pose['surfaces'][name]
        if 'arm_skin' in name:
            rows=surface['root_rows']
            first=[r[0] for r in rows] if fragment=='root' else [surface['vertices'][i] for i in surface['contour_chains'][0] if fragment!='limb' or i not in (0,2)]
            second=[r[1] for r in rows] if fragment=='root' else [surface['vertices'][i] for i in surface['contour_chains'][1] if fragment!='limb' or i not in (1,3)]
            cap=[surface['vertices'][i] for i in surface['cap_vertex_ids']] if fragment!='limb' else []
            edges=[first,second]
            if cap:
                edges.append([surface['vertices'][1]]+cap+[surface['vertices'][0]])
            yield name,first+list(reversed(second))+cap,edges
            if fragment!='root':yield name,surface['silhouette_regions'][1],[[surface['vertices'][i] for i in surface['inner_fillet_vertex_ids']]]
        elif 'leg_skin' in name:
            yield name,surface['visible_outline'],None
            yield name,surface['silhouette_regions'][1],[[surface['vertices'][i] for i in surface['inner_fillet_vertex_ids']]]
        else:
            for poly in surface_outlines(surface):
                yield name,poly,None


def figure(pose, x, y, scale=1, guides=True):
    out = [f'<g transform="translate({x} {y}) scale({scale} {-scale})">']
    for name,poly,edges in draw_shapes(pose):
        out.append(polygon_svg(poly,color(name),stroke='none' if edges else '#404b59'))
        for edge in edges or []:
            out.append(f'<polyline points="{" ".join(f"{a:.3f},{b:.3f}" for a,b in edge)}" fill="none" stroke="#404b59" stroke-width="1"/>')
    if guides:
        for side in ('far','near'):
            for chain in (['hip','knee','ankle'],['shoulder','elbow','wrist']):
                points=[pose['landmarks'][side+'_'+p] for p in chain]
                out.append(f'<polyline points="{" ".join(f"{a:.3f},{b:.3f}" for a,b in points)}" fill="none" stroke="#b8323e" stroke-width=".8" stroke-dasharray="3 3"/>')
        # Crosses only: these are landmark marks, not joint discs.
        for name,p in pose['landmarks'].items():
            out.append(f'<path d="M{p[0]-2},{p[1]}h4 M{p[0]},{p[1]-2}v4" stroke="#9c2633" stroke-width=".7"/>')
    out.append('</g>')
    return ''.join(out)


def svg(w,h,content):
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}"><rect width="100%" height="100%" fill="#f3f5f7"/><g font-family="Arial, sans-serif" fill="#293444">{content}</g></svg>\n'


def sheets(poses):
    # Full 1x figure including raised hands and jump travel, no animation.
    body = '<text x="18" y="25" font-size="18">NELA / CONSTRUCTION ONLY / 1 unit = 1 screen px / no clean art</text>'
    for i,p in enumerate(poses):
        x,y = (i%4)*320,(i//4)*650+45
        body += f'<rect x="{x+2}" y="{y}" width="316" height="646" fill="none" stroke="#cbd0d7"/><text x="{x+12}" y="{y+24}" font-size="14">{escape(p["id"])}</text>'
        body += f'<path d="M{x+8} {y+614}h304" stroke="#687885"/>'
        body += figure(p,x+140,y+614)
    target = poses[0]
    stage = '<text x="24" y="30" font-size="18">TARGET 960 x 640 / bind crown 390 px (hair +2) / construction envelope</text><path d="M50 560H910" stroke="#687885"/>' + figure(target,480,560)
    diagnostic = '<text x="24" y="30" font-size="18">DIAGNOSTIC x2 / low_deep / continuous surface envelopes, no texture</text><path d="M20 880H1260" stroke="#687885"/>' + figure(poses[3],640,880,2)
    bind = '<text x="20" y="25" font-size="17">EXPORT registration 1024 x 1024 / source px = 2 units / ground (512,900)</text>' + figure(target,512,900,2)
    calm=[p for p in poses if p['id'] in ('bind','idle_shift','idle_settle_left','idle_settle_right','walk_near_pass')]
    readability='<text x="18" y="25" font-size="18">v4 / FAR ARM / 1:1 / no joint guides / construction only</text>'
    for i,p in enumerate(calm):
        readability+=f'<text x="{i*320+12}" y="65" font-size="16">{p["id"]}</text><path d="M{i*320+8} 659h304" stroke="#687885"/>'
        readability+=figure(p,i*320+140,659,guides=False)
    return {'poses.svg': svg(1280,45+650*math.ceil(len(poses)/4),body),
            'target.svg':svg(960,640,stage),'diagnostic.svg':svg(1280,960,diagnostic),
            'bind-registration.svg':svg(1024,1024,bind),
            'settle-readability.svg':svg(1600,695,readability)}


def raster_preview(poses):
    # Neutral polygon diagram from the exact same outlines as SVG, no painting.
    from PIL import Image, ImageDraw
    result={}
    calm=[p for p in poses if p['id'] in ('bind','idle_shift','idle_settle_left','idle_settle_right','walk_near_pass')]
    for name,size,items in [('poses.png',(1280,45+650*math.ceil(len(poses)/4)),[(p,(i%4)*320+140,(i//4)*650+659,1) for i,p in enumerate(poses)]),
                            ('diagnostic.png',(1280,960),[(poses[3],640,880,2)]),
                            ('settle-readability.png',(1600,695),[(p,i*320+140,659,1) for i,p in enumerate(calm)])]:
        img=Image.new('RGB',size,'#f3f5f7')
        pen=ImageDraw.Draw(img)
        pen.text((15,10),'NELA - CONSTRUCTION ONLY - NO CLEAN ART',fill='#293444')
        for p,x,y,scale in items:
            pen.text((x-120, y-610 if scale==1 else 45),p['id'],fill='#293444')
            pen.line((x-125,y,x+177,y),fill='#687885')
            for surface,outline,edges in draw_shapes(p):
                poly=[(x+scale*a,y-scale*b) for a,b in outline]
                pen.polygon(poly,fill=color(surface),outline=None if edges else '#404b59')
                for edge in edges or []:
                    pen.line([(x+scale*a,y-scale*b) for a,b in edge],fill='#404b59')
            for a,b in ([] if name=='settle-readability.png' else p['landmarks'].values()):
                px,py=x+scale*a,y-scale*b
                pen.line((px-2,py,px+2,py),fill='#9c2633')
                pen.line((px,py-2,px,py+2),fill='#9c2633')
        buf=io.BytesIO()
        img.save(buf,format='PNG')
        result[name]=buf.getvalue()
    return result


def build():
    poses = [solve(p) for p in POSES]
    bind = poses[0]
    # All render topology and material coordinates are authored here, once.
    # The integration renderer is forbidden to infer bind-fallback diagonals.
    for name,b in bind['surfaces'].items():
        if not b['triangles']:
            b['triangles']=rigid_triangles(b['vertices'])
        for pose in poses:
            g=pose['surfaces'][name]
            assert len(g['vertices'])==len(b['vertices'])
            g['triangles']=b['triangles']
            g['uv']=[[(512+2*x)/1024,(900-2*y)/1024] for x,y in b['vertices']]
            if 'patches' in b:
                for bp,gp in zip(b['patches'],g['patches']):
                    gp['triangles']=bp['triangles']
                    gp['uv']=[[(512+2*x)/1024,(900-2*y)/1024] for x,y in bp['vertices']]
    surfaces=[]
    for rank,name in enumerate(DRAW):
        parent = 'head' if name in ('head_face','hair') else 'neck' if name=='neck_skin' else 'pelvis'
        side = name.split('_')[0]
        if side in ('near','far'):
            parent=side+('_shoulder' if 'arm' in name else '_wrist' if 'hand' in name else '_ankle' if 'shoe' in name else '_hip')
        elif name=='torso_top':
            parent='chest'
        pivot=bind['landmarks'][parent]
        surfaces.append({'id':name,'draw_rank':rank*10,'pivot_landmark':parent,'pivot_bind':pivot,
                         'pivot_source_px':[512+2*pivot[0],900-2*pivot[1]],
                         'source_size_px':[1024,1024], 'export_file':name+'.png',
                         'deformation':'pose_corrected_continuous_mesh' if '_skin' in name and ('arm' in name or 'leg' in name)
                                       else 'v3_explicit_horizontal_rows' if name=='torso_top'
                                       else 'v3_explicit_ruled_hip_panels' if name=='pelvis_shorts'
                                       else 'shared_thigh_rows' if 'shorts_leg' in name else 'rigid_registered_surface',
                         'geometry_bind':bind['surfaces'][name]})
    data={'format':'r4d-q5a-construction-v4','status':'V4_SILHOUETTE_TECHNICAL_ONLY_AWAITING_TWO_REVIEWS_NO_ATTEMPT03',
          'supersedes_json_sha256':'4c26901562ded5cd43dac994cd308a3e23743e055c94b71fee43d527ab8977fc',
          'supersedes_commit':V2_COMMIT,
          'author':'builder-r4d-q5a-01','base':'93194c5cab8a7be0913faa0ffa57dcc7ca9ae7a6',
          'units':{'logical':'screen px at target','x':'forward/right','y':'up','ground_y':0,
                   'source_transform':{'x_offset':512,'y_offset':900,'scale':2,'flip_y':True}},
          'viewport':{'target':[960,640],'ground_screen_y':560,'root_screen_x':480,
                      'anatomical_height':390,'hair_extra':2,'diagnostic':[1280,960],'diagnostic_scale':2},
          'lengths':{'thigh':98,'shin':94,'upper_arm':68,'forearm':62,'hand':23,'head_height':60},
          'hierarchy':{'pelvis':None,'chest':'pelvis','neck':'chest','head':'neck'},
          'surfaces':surfaces,'draw_order':DRAW,
          'draw_operations':[{'surface':s,'fragment':f} for s,f in DRAW_OPS],'poses':poses,
          'integration_contract':{'meshes':'explicit constant triangles and immutable bind UV for every surface/panel; renderer may not infer diagonals',
                                  'solid_material_coverage':'outer v4 anatomical silhouette clips all coverage per surface; internal triangle seam coverage may never extend beyond it',
                                  'sampling':'own-material RGB input, optional authored silhouette alpha may subtract from outer mesh envelope; conservative seam footprint clipped before composition',
                                  'invalid_faces':'reject flipped faces; do not rasterize zero-area fold faces',
                                  'art_status':'attempt02 is immutable rejected evidence, technical RGB input only; attempt03 prohibited until two v4 reviews and CTO release'},
          'ranges_deg':{'torso_forward':[-5,35],'upper_arm_from_down':[-35,140],
                        'elbow_flex':[10,135],'knee_flex':[0,140],
                        'hip_from_pelvis_down':[-35,135],'ankle_shoe_pitch':[-30,20],
                        'ankle_dorsiflex':[-35,45]},
          'hidden_continuation_units':{'neck_under_head':12,'neck_under_top':15,'hand_under_wrist':7,
                                       'shoe_over_ankle':9,'top_over_shorts':12,
                                       'shorts_over_thigh':49,'pelvis_under_shorts_leg':22},
          'static_only':True,'times_or_clips':None}
    for side in ('far','near'):
        for child,parent in [('hip','pelvis'),('knee',side+'_hip'),('ankle',side+'_knee'),
                             ('shoulder','chest'),('elbow',side+'_shoulder'),('wrist',side+'_elbow')]:
            data['hierarchy'][side+'_'+child]=parent
    # Add source-space vertices/UVs. Artist exports share one common canvas, never recentered.
    for s in surfaces:
        s['source_vertices_px']=[[512+2*x,900-2*y] for x,y in s['geometry_bind']['vertices']]
        s['uv']=[[x/1024,y/1024] for x,y in s['source_vertices_px']]
    fold_contracts={}
    for surface in surfaces:
        name=surface['id']
        if name.endswith(('_arm_skin','_leg_skin')):
            mesh=surface['geometry_bind']
            inner=mesh['fold_inner_vertex_ids']
            row_bases=[i-i%2 for i in inner]
            zone_ids=sorted(set([k for i in row_bases for k in (i,i+1)]+mesh['outer_bend_vertex_ids']+mesh['inner_fillet_vertex_ids']))
            zone=convex_hull([mesh['vertices'][i] for i in zone_ids])
            contract={'vertex_ids':list(range(len(mesh['vertices']))),'topology':mesh['triangles'],
                      'immutable_uv':surface['uv'],'fold_inner_vertex_ids':inner,
                      'source_low_contrast_zone_px':[[512+2*x,900-2*y] for x,y in zone],
                      'low_contrast_vertex_ids':zone_ids,
                      'source_guard_px':4,'compression_start_deg':70,'compression_end_deg':90,
                      'compression_curve':'smoothstep((flex-70)/20)',
                      'visibility':'no alpha cutoff; fixed faces lose projected area continuously, zero faces remain in topology',
                      'texture':'skin base and broad light only in full joint band+guard; no interior dark line, contour ring, embroidery or high-frequency detail; continuous exterior outline allowed on outer edge only',
                      'sampling':'straight alpha source; clamp at texture border; duplicate skin color through 4px guard; no per-pose UV projection'}
            fold_contracts[name]=contract
            for pose in poses:
                pm=pose['surfaces'][name]
                pm['uv']=surface['uv']
                pm['vertex_ids']=contract['vertex_ids']
                pm['fold_contract_id']=name
    data['fold_contracts']=fold_contracts
    outputs={'construction.json':json.dumps(data,ensure_ascii=False,indent=2,allow_nan=False)+'\n'}
    outputs.update(sheets(poses))
    outputs.update(raster_preview(poses))
    uv_body='<text x="15" y="25" font-size="18">v4 immutable source registration / blue = full bend controls +4 source px guard / NOT ART</text>'
    for i,(name,contract) in enumerate(fold_contracts.items()):
        ox=(i%2)*1024
        oy=(i//2)*1024+45
        surface=next(s for s in surfaces if s['id']==name)
        poly=[[ox+512+2*x,oy+900-2*y] for x,y in surface['geometry_bind']['outline']]
        uv_body+=f'<text x="{ox+15}" y="{oy+25}" font-size="18">{name}</text>'
        uv_body+=polygon_svg(poly,'#d1d7df')
        uv_body+=polygon_svg([[ox+x,oy+y] for x,y in contract['source_low_contrast_zone_px']],'#81b9ce')
    outputs['uv-fold-zones.svg']=svg(2048,2093,uv_body)
    return data,outputs


def validate(data):
    assert len(data['surfaces'])==len(set(data['draw_order']))==15
    assert set(data['hierarchy'])==set(data['poses'][0]['landmarks'])
    for s in data['surfaces']:
        assert s['pivot_landmark'] in data['hierarchy']
        assert all(0 <= u <= 1 and 0 <= v <= 1 for u,v in s['uv'])
    bounds={}
    for p in data['poses']:
        j=p['landmarks']
        for side in ('far','near'):
            for a,b,n in [('hip','knee',98),('knee','ankle',94),('shoulder','elbow',68),('elbow','wrist',62)]:
                assert abs(length(delta(j[side+'_'+a],j[side+'_'+b]))-n)<1e-6
            for kind in ('arm','leg'):
                mesh=p['surfaces'][side+'_'+kind+'_skin']
                assert all(abs(sum(w.values())-1)<1e-8 for w in mesh['weights'])
                assert all(set(w)<=set(data['hierarchy']) for w in mesh['weights'])
                assert all(0<=index<len(mesh['vertices']) for tri in mesh['triangles'] for index in tri)
                assert 0<=mesh['joint_flex_deg']<=140
                verts=mesh['vertices']
                for a,b,c in mesh['triangles']:
                    area=(verts[b][0]-verts[a][0])*(verts[c][1]-verts[a][1])-(verts[b][1]-verts[a][1])*(verts[c][0]-verts[a][0])
                    assert area>=-1e-7,('inverted triangle',p['id'],side,kind,area)
                reference=next(s for s in data['surfaces'] if s['id']==side+'_'+kind+'_skin')
                assert mesh['triangles']==reference['geometry_bind']['triangles']
                assert mesh['uv']==reference['uv']
                assert mesh['weights']==reference['geometry_bind']['weights']
            assert -35<=p['joint_angles_deg'][side]['hip_flex']<=135
            assert -35<=p['joint_angles_deg'][side]['ankle_dorsiflex']<=45,(p['id'],side,p['joint_angles_deg'][side])
            i=0 if side=='far' else 1
            shoe=p['surfaces'][side+'_shoe']['outline']
            low=min(pt[1] for pt in shoe)
            if p['inputs']['contact'][i]!='air':
                assert abs(low)<1e-6,(p['id'],side,low)
            else:
                assert low>0,(p['id'],side,low)
        pts=[v for s in p['surfaces'].values() for poly in surface_outlines(s) for v in poly]
        box=[min(v[0] for v in pts),min(v[1] for v in pts),max(v[0] for v in pts),max(v[1] for v in pts)]
        assert box[0]>-130 and box[2]<178 and box[1]>=-1e-6 and box[3]<560,(p['id'],box)
        bounds[p['id']]=[round(v,3) for v in box]
    for node in data['hierarchy']:
        visited=set()
        while node is not None:
            assert node not in visited
            visited.add(node)
            node=data['hierarchy'][node]
    return bounds


def validate_fold_sweep():
    # Geometry envelope sweep only; no frames, durations, clips or final motion.
    for stations,a,b in [(ARM_STATIONS,68,62),(LEG_STATIONS,98,94)]:
        for angle in range(141):
            points=[[0,a],[0,0],[b*math.sin(math.radians(angle)),-b*math.cos(math.radians(angle))]]
            mesh=chain_mesh(points,stations,.65,['root','a','b'])
            v=mesh['vertices']
            for i,j,k in mesh['triangles']:
                area=(v[j][0]-v[i][0])*(v[k][1]-v[i][1])-(v[j][1]-v[i][1])*(v[k][0]-v[i][0])
                assert area>=-1e-7,('fold sweep',angle)


def inside(point,polygon):
    x,y=point
    result=False
    for a,b in zip(polygon,polygon[1:]+polygon[:1]):
        if (a[1]>y)!=(b[1]>y) and x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]:
            result=not result
    return result


def validate_v2(data):
    archive=HERE/'attempts'/'v1'
    manifest_bytes=(archive/'manifest.json').read_bytes()
    assert hashlib.sha256(manifest_bytes).hexdigest()=='6f95e72cd683b2c8644fc9a26e951a091138db86a8836d2a762772d9041fd243'
    manifest=json.loads(manifest_bytes)
    for item in manifest['files']:
        raw=(archive/item['file']).read_bytes()
        assert len(raw)==item['bytes'] and hashlib.sha256(raw).hexdigest()==item['sha256']
    first=json.loads((archive/'construction.json').read_text(encoding='utf-8'))
    assert data['viewport']==first['viewport'] and data['lengths']==first['lengths']
    for old,new in zip(first['poses'],data['poses']):
        assert old['id']==new['id']
        for key in ('root','lean','ankles','contact'):
            assert old['inputs'][key]==new['inputs'][key],('range weakened',old['id'],key)
    # A1: verify the displayed root equals actual chest/bone frame blend + volume corrective.
    for pose in data['poses']:
        for side,rest in [('far',-24),('near',8)]:
            mesh=pose['surfaces'][side+'_arm_skin']
            shoulder=pose['landmarks'][side+'_shoulder']
            upper=pose['inputs']['arms'][0 if side=='far' else 1][0]
            bone_normal=[math.cos(math.radians(upper)),math.sin(math.radians(upper))]
            chest_normal=rotate([math.cos(math.radians(rest)),math.sin(math.radians(rest))],-pose['inputs']['lean'])
            mixed=unit(lerp(bone_normal,chest_normal,.35))
            expected=add(shoulder,[mixed[0]*15,mixed[1]*15])
            assert length(delta(expected,mesh['vertices'][0]))<1e-8
            assert mesh['root_weight_applied_to_geometry'] and len(mesh['cap_vertex_ids'])==7
    # Wider combined chest/arm envelope, not just the chosen endpoints.
    for rest in (-24,8):
        for lean in (-5,0,18,35):
            for angle in range(-35,141,5):
                a=[0,326];j=limb_tip(a,68,angle);b=limb_tip(j,62,angle+20)
                mesh=chain_mesh([a,j,b],ARM_STATIONS,.35,['chest','shoulder','elbow'],(rest,lean))
                v=mesh['vertices']
                for i,j,k in mesh['triangles']:
                    area=(v[j][0]-v[i][0])*(v[k][1]-v[i][1])-(v[j][1]-v[i][1])*(v[k][0]-v[i][0])
                    assert area>=-1e-7,('A1 root inversion',rest,lean,angle)
    # A2/C1: exact position and tangent continuity at the two independent posterior joins.
    for pose in data['poses']:
        for patch in pose['surfaces']['pelvis_shorts']['patches']:
            side=patch['side'];shorts=pose['surfaces'][side+'_shorts_leg']['outline']
            assert length(delta(patch['posterior_join'],shorts[-1]))<1e-8
            tangent=unit(delta(patch['rear_curve_controls'][3],patch['rear_curve_controls'][2]))
            assert sum(a*b for a,b in zip(tangent,patch['thigh_direction']))>1-1e-8
            leg=pose['surfaces'][side+'_leg_skin']
            assert leg['visible_from_t']==.5
            assert leg['visible_outline'][0]==leg['vertices'][4] and shorts[3]==leg['vertices'][4]
    p=data['poses'][3]
    joints=dict(p['landmarks']);legs={s:p['surfaces'][s+'_leg_skin'] for s in ('far','near')}
    before=seated_shorts(p['inputs']['root'],p['inputs']['lean'],joints,legs)
    changed_joints=dict(joints);changed_joints['near_knee']=add(joints['near_knee'],[5,-2])
    changed_legs=dict(legs);changed_legs['near']=chain_mesh([joints['near_hip'],changed_joints['near_knee'],joints['near_ankle']],LEG_STATIONS,.65,['pelvis','near_hip','near_knee'])
    after=seated_shorts(p['inputs']['root'],p['inputs']['lean'],changed_joints,changed_legs)
    assert before['patches'][0]==after['patches'][0] and before['patches'][1]!=after['patches'][1]
    # A3: immutable faces/UV/weights, degenerate faces entirely in the declared source band.
    degenerate=0
    for pose in data['poses']:
        for name,contract in data['fold_contracts'].items():
            mesh=pose['surfaces'][name];v=mesh['vertices']
            assert mesh['triangles']==contract['topology'] and mesh['uv']==contract['immutable_uv']
            for i,j,k in mesh['triangles']:
                area=(v[j][0]-v[i][0])*(v[k][1]-v[i][1])-(v[j][1]-v[i][1])*(v[k][0]-v[i][0])
                if abs(area)<1e-7:
                    degenerate+=1
                    assert {i,j,k}<=set(contract['low_contrast_vertex_ids'])
    # C2: forearm centreline is visible without guides through all calm/settle cases.
    visibility={}
    for pose in data['poses']:
        if pose['id'] not in ('bind','idle_shift','idle_settle_left','idle_settle_right','walk_near_pass'):
            continue
        elbow=pose['landmarks']['far_elbow'];wrist=pose['landmarks']['far_wrist']
        occluders=[poly for name,poly,_ in draw_shapes(pose) if name in ('torso_top','neck_skin','head_face','near_arm_skin','near_hand','hair')]
        visible=sum(not any(inside(lerp(elbow,wrist,k/20),poly) for poly in occluders) for k in range(1,21))
        visibility[pose['id']]=visible/20
        assert visible>=18,('C2 forearm occluded',pose['id'],visible)
        assert inside(wrist,pose['surfaces']['far_hand']['outline'])
    return {'A1':'PASS actual chest blend, armhole and shoulder sweep',
            'A2_C1':'PASS shared posterior positions/tangents, side independence, fixed garment hem',
            'A3':'PASS immutable UV/topology/weights; nonnegative faces; zero faces only in declared full joint band',
            'C2_forearm_visible_fraction':visibility,'zero_fold_faces_across_static_poses':degenerate,
            'v1_archive':'PASS 9 byte hashes and pinned manifest; original 17 body/foot configurations retained'}


def validate_v3(data):
    raw=subprocess.check_output(['git','show',V2_COMMIT+':experiments/q5a-construction-first/construction/construction.json'],cwd=HERE.parents[2])
    assert hashlib.sha256(raw).hexdigest()=='70f324aa7126f7aea0eca24e42aa370b18bb48d070810f3819a5cab16116e092'
    v2=json.loads(raw)
    assert data['viewport']==v2['viewport'] and data['ranges_deg']==v2['ranges_deg'] and data['lengths']==v2['lengths']
    inversions=0;intersections=0;contact=[]
    for pose,old in zip(data['poses'],v2['poses']):
        assert pose['id']==old['id'] and pose['inputs']==old['inputs'] and pose['landmarks']==old['landmarks']
        for name,g in pose['surfaces'].items():
            if name.endswith(('_arm_skin','_leg_skin')):
                assert g['uv'][:18]==old['surfaces'][name]['uv'][:18]
                for i,(a,b) in enumerate(zip(g['vertices'][:18],old['surfaces'][name]['vertices'][:18])):
                    if a!=b:
                        assert 'leg_skin' in name and i%2==1 and g['calf_hem_contact_correction']>0
                if g.get('calf_hem_contact_correction'):contact.append([pose['id'],name,g['calf_hem_contact_correction']])
            for q in g.get('patches',[g]):
                assert q['triangles'] and len(q['uv'])==len(q['vertices'])
                for tri in q['triangles']:
                    sa=signed_area(*[q['uv'][i] for i in tri]);pa=signed_area(*[q['vertices'][i] for i in tri])
                    inversions+=int(sa*pa>1e-10)
                poly=q['outline'];n=len(poly)
                for i in range(n):
                    for j in range(i+2,n):
                        if (j+1)%n==i:continue
                        a,b,c,d=poly[i],poly[(i+1)%n],poly[j],poly[(j+1)%n]
                        intersections+=int(signed_area(a,b,c)*signed_area(a,b,d)<-1e-7 and signed_area(c,d,a)*signed_area(c,d,b)<-1e-7)
    assert inversions==0 and intersections==0,(inversions,intersections)
    return {'inversions':inversions,'unintended_self_intersections':intersections,
            'v2_regression':'PASS all 19 inputs, landmarks, lengths, viewport and ranges identical; original segment UV unchanged; v4 contour UV explicit',
            'inner_calf_hem_contact_corrective':contact}


def validate_v4(data):
    archive=HERE/'attempts/v3'
    raw=(archive/'manifest.json').read_bytes()
    assert hashlib.sha256(raw).hexdigest()=='c0ea2fb64a0beb71dbae4a6718311b774583a22d0b1eaa750f4b0a18f0793c3c'
    manifest=json.loads(raw)
    for entry in manifest['files']:
        content=(archive/entry['file']).read_bytes()
        assert len(content)==entry['bytes'] and hashlib.sha256(content).hexdigest()==entry['sha256']
    old=json.loads((archive/'construction.json').read_bytes())
    for key in ('viewport','units','lengths','hierarchy','ranges_deg','hidden_continuation_units','draw_order','draw_operations'):
        assert data[key]==old[key],key
    hand_checks=[];regions_checked=0
    def area(poly):return abs(sum(a[0]*b[1]-b[0]*a[1] for a,b in zip(poly,poly[1:]+poly[:1]))/2)
    for pose,previous in zip(data['poses'],old['poses']):
        assert pose['inputs']==previous['inputs'] and pose['landmarks']==previous['landmarks']
        for name,g in pose['surfaces'].items():
            before=previous['surfaces'][name]
            if not name.endswith(('_hand','_arm_skin','_leg_skin')):assert g==before,('cloth/rigid changed',name)
            if name.endswith(('_arm_skin','_leg_skin')):
                assert g['vertices'][:18]==before['vertices'][:18] and g['uv'][:18]==before['uv'][:18]
                assert g['fold_inner_vertex_ids']==before['fold_inner_vertex_ids']
                assert len(g['outer_bend_vertex_ids'])==9 and len(g['inner_fillet_vertex_ids'])==9
            if name.endswith('_hand'):
                wrist=pose['landmarks'][name.replace('hand','wrist')]
                assert wrist==g['anatomical_landmarks']['wrist'] and inside(wrist,g['outline'])
                frame=g['hand_frame'];local=[]
                for p in g['vertices']:
                    d=delta(p,wrist)
                    local.append([sum(x*y for x,y in zip(d,frame[k])) for k in ('direction','normal')])
                assert max(abs(x-y) for a,b in zip(local,g['anatomical_local_outline']) for x,y in zip(a,b))<1e-10
                reference=data['poses'][0]['surfaces'][name]
                assert g['uv']==reference['uv'] and g['triangles']==reference['triangles']
                assert abs(area(g['outline'])-area(reference['outline']))<1e-8
                thumb=g['vertices'][g['thumb_vertex_id']];finger=g['vertices'][g['finger_vertex_id']]
                assert thumb==g['anatomical_landmarks']['thumb_tip'] and finger==g['anatomical_landmarks']['finger_tip']
                assert 9<max(p[1] for p in local)<11 and max(p[0] for p in local)>22
                bbox=(max(p[0] for p in local)-min(p[0] for p in local))*(max(p[1] for p in local)-min(p[1] for p in local))
                assert area(local)/bbox<.85 and not inside([21,9],local)
                assert inside([-3,0],local) and inside([8,0],local)
                arm=pose['surfaces'][name.replace('hand','arm_skin')]
                for offset in (-3,0,3):
                    overlap=add(wrist,[-3*frame['direction'][k]+offset*frame['normal'][k] for k in range(2)])
                    assert inside(overlap,g['outline']) and any(inside(overlap,p) for p in surface_outlines(arm)),('wrist continuity',pose['id'],name)
                hand_checks.append({'pose':pose['id'],'surface':name,'area_units2':round(area(local),9),'vertices':len(local),'faces':len(g['triangles']),'wrist_landmarks':'PASS','bbox_area_fraction':round(area(local)/bbox,6)})
            for poly in surface_outlines(g):
                regions_checked+=1;n=len(poly)
                for i in range(n):
                    for j in range(i+2,n):
                        if (j+1)%n==i:continue
                        a,b,c,d=poly[i],poly[(i+1)%n],poly[j],poly[(j+1)%n]
                        assert not (signed_area(a,b,c)*signed_area(a,b,d)<-1e-7 and signed_area(c,d,a)*signed_area(c,d,b)<-1e-7),('region crossing',pose['id'],name,i,j)
    return {'v3_archive':'PASS 13 byte hashes and pinned manifest','v3_geometry_preserved':'PASS original skin rows, all cloth/rigid meshes, 19 inputs/landmarks, bones/pivots/feet/ranges',
            'hands':hand_checks,'silhouette_regions_checked':regions_checked,'outer_bend':'9 quadratic samples through original joint extremum',
            'inner_bend':'9 quadratic samples in same skin mesh, original fold faces retained'}


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--check',action='store_true',help='read-only: validate data and compare deterministic outputs')
    args=parser.parse_args()
    data,outputs=build()
    boxes=validate(data)
    validate_fold_sweep()
    correction_checks=validate_v2(data)
    mesh_checks=validate_v3(data)
    silhouette_checks=validate_v4(data)
    if args.check:
        parsed=json.loads((HERE/'construction.json').read_text(encoding='utf-8'))
        validate(parsed)
        assert parsed==data
    for name,body in outputs.items():
        if name.endswith('.svg'):
            ET.fromstring(body)
        target=HERE/name
        raw=body if isinstance(body,bytes) else body.encode('utf-8')
        if args.check:
            assert target.read_bytes()==raw,f'non-reproducible: {name}'
        else:
            target.write_bytes(raw)
    print(json.dumps({'result':'PASS','mode':'read-only check' if args.check else 'generate',
                      'static_poses':len(data['poses']),'surfaces':len(data['surfaces']),
                      'outputs':list(outputs),'correction_checks':correction_checks,'v3_mesh_checks':mesh_checks,'v4_silhouette_checks':silhouette_checks,'bounds':boxes},ensure_ascii=False,indent=2))


if __name__=='__main__':
    main()
