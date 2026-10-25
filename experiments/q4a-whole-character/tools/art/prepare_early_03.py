"""Stage A: source-coordinate cloth tracing only. Does not alter live art/parts.json.
Source and previous attempts are read-only. No raster repair or pose changes.
"""
from pathlib import Path
import json
from PIL import Image, ImageDraw, ImageFont

ROOT=Path(__file__).resolve().parents[2]
ART=ROOT/'art';OUT=ART/'early-v02-03'
OUT.mkdir(parents=True,exist_ok=True)
SOURCE=ART/'source/whole-v02.png'
im=Image.open(SOURCE).convert('RGBA')
crop=(420,575,655,800);scale=4
base=Image.new('RGBA',im.size,(239,240,235,255));base.alpha_composite(im)
detail=base.crop(crop).resize(((crop[2]-crop[0])*scale,(crop[3]-crop[1])*scale))
draw=ImageDraw.Draw(detail)
for x in range(420,656,20):
    px=(x-crop[0])*scale
    draw.line((px,0,px,detail.height),fill=(70,160,185,100),width=1)
    draw.text((px+2,2),str(x),fill='#00516b')
for y in range(580,801,20):
    py=(y-crop[1])*scale
    draw.line((0,py,detail.width,py),fill=(70,160,185,100),width=1)
    draw.text((2,py+2),str(y),fill='#00516b')
detail.convert('RGB').save(OUT/'source-detail-grid.jpg',quality=95)
plate=Image.open(ART/'repairs/torso-under-arms-v01.png').convert('RGBA')
platebase=Image.new('RGBA',plate.size,(239,240,235,255));platebase.alpha_composite(plate)
pd=platebase.crop(crop).resize(((crop[2]-crop[0])*scale,(crop[3]-crop[1])*scale))
dr=ImageDraw.Draw(pd)
for x in range(420,656,20):
    xx=(x-crop[0])*scale;dr.line((xx,0,xx,pd.height),fill=(70,160,185,100));dr.text((xx+2,2),str(x),fill='#00516b')
for y in range(580,801,20):
    yy=(y-crop[1])*scale;dr.line((0,yy,pd.width,yy),fill=(70,160,185,100));dr.text((2,yy+2),str(y),fill='#00516b')
pd.convert('RGB').save(OUT/'existing-repair-detail-grid.jpg',quality=95)

# Manual tracing after inspecting the 4x source/repair grids. Polylines are
# source-coordinate curves; no vertical-x classifier or meshing is performed.
curves={
 'waist_back_visible':{'points':[[450,600],[461,597],[474,594],[489,592],[502,591]],'owner':'near','observation':'visible_v02'},
 'waist_occluded':{'points':[[502,591],[522,592],[544,594],[564,596],[582,599],[598,603]],'owner':'near','observation':'occluded_v02_existing_repair_reference'},
 'waist_front_visible':{'points':[[598,603],[608,607],[618,611],[625,614]],'owner':'far','observation':'visible_v02_with_partial_arm_occlusion'},
 'original_center_seam':{'points':[[522,598],[524,615],[525,633],[525,651],[524,670],[522,687],[520,700]],'owner':'near','observation':'upper_occluded_below_633_visible_v02','role':'internal_drawn_seam_ending_at_near_side_slit_NOT_near_far_partition'},
 'near_back_side':{'points':[[450,600],[444,613],[439,628],[438,646],[439,665],[440,684],[443,701],[446,715],[444,733],[442,750]],'owner':'near','observation':'visible_v02_except_small_far_hand_contact'},
 'near_hem_skin_boundary':{'points':[[446,751],[460,748],[475,744],[489,739],[501,733],[510,723],[516,712],[520,700],[524,711],[531,720],[540,728],[553,733],[568,737],[583,741],[594,746]],'owner':'near','observation':'visible_v02; front_end_partial_arm_occlusion'},
 'near_back_fold_lip':{'points':[[442,750],[443,754],[449,757],[458,759]],'owner':'near','observation':'visible_v02','role':'outer_fold_not_separate_panel'},
 'near_front_fold_lip':{'points':[[594,746],[598,750],[598,754],[592,757]],'owner':'near','observation':'visible_v02','role':'nearHem_anchor_inside_front_fold'},
 'far_front_side':{'points':[[625,614],[625,633],[628,654],[631,676],[632,698],[633,721],[636,741],[638,754]],'owner':'far','observation':'mostly_occluded_v02_existing_repair_reference'},
 'far_hem':{'points':[[596,765],[607,763],[618,761],[630,758],[638,754]],'owner':'far','observation':'left_portion_visible_v02_remainder_occluded_existing_repair'},
 'panel_separation_proposal':{'points':[[598,603],[605,615],[609,630],[610,646],[610,664],[608,682],[604,701],[600,720],[602,736],[603,748],[600,757],[592,757]],'owner':'near_front_edge_far_hidden_underlap','observation':'inferred_occlusion_boundary_supported_by_existing_repair_NOT_fully_observed_v02','role':'curved_panel_boundary_to_agree_with_Builder'}
}
curves['original_center_seam']['segments']=[{'indices':[0,2],'evidence':'occluded_v02_existing_repair_reference'}, {'indices':[2,6],'evidence':'visible_v02'}]
curves['far_hem']['segments']=[{'indices':[0,1],'evidence':'visible_v02'}, {'indices':[1,4],'evidence':'occluded_v02_existing_repair_reference'}]
waist_near=curves['waist_back_visible']['points']+curves['waist_occluded']['points'][1:]
split=curves['panel_separation_proposal']['points']
hem=curves['near_hem_skin_boundary']['points']
near_boundary=waist_near+split[1:]+[[598,754],[598,750],[594,746]]+list(reversed(hem[:-1]))+[[458,759],[449,757],[443,754],[442,750]]+list(reversed(curves['near_back_side']['points'][:-1]))
far_boundary=curves['waist_front_visible']['points']+curves['far_front_side']['points'][1:]+list(reversed(curves['far_hem']['points'][:-1]))+[[592,757]]+list(reversed(split[:-1]))
def clean_boundary(points):
    out=[]
    for p in points:
        if not out or p!=out[-1]:out.append(p)
    if out[-1]==out[0]:out.pop()
    return out
near_boundary=clean_boundary(near_boundary);far_boundary=clean_boundary(far_boundary)
trace={
 'stage':'A_TRACE_FOR_BUILDER_AGREEMENT_ONLY','source':'source/whole-v02.png','sourceSize':[1024,1536],
 'referenceOnly':'repairs/torso-under-arms-v01.png','coordinates':'original source pixels; x right y down',
 'curveType':'manual_piecewise_linear_source_trace_not_vertical_threshold',
 'curves':curves,
 'anchors':{'nearHem':{'point':[592,757],'owner':'near','locked':True},'nearSlitApex':{'point':[520,700],'owner':'near'},
            'nearHip':{'point':[525,685],'owner':'near'},'farHip':{'point':[570,690],'owner':'far'}},
 'proposedPanels':{'near':{'boundary':near_boundary,'ownsOriginalCenterSeam':True,'ownsNearHem592757':True},
                   'far':{'boundary':far_boundary,'visibleFarHem':curves['far_hem']['points']}},
 'uncertainty':{'visibleTracePixels':3,'occludedReferencePixels':8,'note':'Manual anatomical/material interpretation; hidden boundary is a proposal, not directly observed ground truth.'},
 'hiddenOverlap':{'side':'far under near','guideCurve':'panel_separation_proposal','maxSourcePixels':8,
                  'rule':'only behind near-owned seam/interior, never two visible contours or extension of outer hems; no new raster pixels'},
 'requiresExplicitBuilderAgreement':True,
 'forbidden':'vertical x split; phase-B coverage edits; raster repair; altered limb lengths or shallower low'
}
(OUT/'CLOTH_TRACE.json').write_text(json.dumps(trace,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

colors={'near':'#007aaf','far':'#d02c7b','seam':'#e57d00','proposal':'#146d32'}
def xy(p):return ((p[0]-crop[0])*scale,(p[1]-crop[1])*scale)
def trace_image(background,label):
    canvas=background.copy();d=ImageDraw.Draw(canvas)
    for name,c in curves.items():
        color=colors['proposal'] if name=='panel_separation_proposal' else colors['seam'] if name=='original_center_seam' else colors[c['owner']]
        pts=[xy(p) for p in c['points']]
        inferred='occluded' in c['observation'] or 'inferred' in c['observation']
        if inferred:
            # Dotted drawing keeps the difference between observed and inferred.
            for A,B in zip(pts,pts[1:]):
                length=((B[0]-A[0])**2+(B[1]-A[1])**2)**.5
                n=max(1,int(length/7))
                for k in range(0,n,2):
                    t0=k/n;t1=min(1,(k+1)/n)
                    d.line([(A[0]+(B[0]-A[0])*t0,A[1]+(B[1]-A[1])*t0),(A[0]+(B[0]-A[0])*t1,A[1]+(B[1]-A[1])*t1)],fill=color,width=3)
        else:d.line(pts,fill=color,width=3)
        for segment in c.get('segments',[]):
            if segment['evidence']=='visible_v02':
                lo,hi=segment['indices'];d.line(pts[lo:hi+1],fill=color,width=3)
        for x,y in pts:d.ellipse((x-3,y-3,x+3,y+3),fill=color)
    a=xy([592,757]);d.ellipse((a[0]-10,a[1]-10,a[0]+10,a[1]+10),outline='#00a8dc',width=4)
    d.text((a[0]-135,a[1]+13),'(592,757) NEAR',fill='#007aaf')
    # Legend outside the traced source field; nothing here is a production asset.
    result=Image.new('RGB',(canvas.width,canvas.height+105),'#f4f4ef');result.paste(canvas,(0,0));r=ImageDraw.Draw(result)
    lines=[label,'BLUE near | PINK far | ORANGE original internal seam | GREEN proposed occlusion boundary',
           'SOLID = observed source; DOTTED = occluded/reference/inferred. Coordinates: original 1024x1536.',
           'Stage A only. No mesh, repair, parts replacement or PASS. Hidden split needs Builder agreement.']
    for i,line in enumerate(lines):r.text((12,canvas.height+8+i*22),line,fill='#17212a')
    return result
trace_image(detail,'WHOLE-V02: manual curves over original source').save(OUT/'TRACE_ON_V02.png')
trace_image(pd,'EXISTING REPAIR REFERENCE: hidden curve proposal, not new art').save(OUT/'TRACE_ON_EXISTING_REPAIR.png')

diagram=Image.new('RGBA',detail.size,(244,244,239,255));dd=ImageDraw.Draw(diagram,'RGBA')
dd.polygon([xy(p) for p in far_boundary],fill=(218,49,124,100),outline='#d02c7b',width=3)
dd.polygon([xy(p) for p in near_boundary],fill=(0,139,188,115),outline='#007aaf',width=3)
trace_image(diagram,'PROPOSED VISIBLE OWNERSHIP: far under near; this is geometry guidance').save(OUT/'PANEL_OWNERSHIP.png')
print(OUT/'CLOTH_TRACE.json')
print(OUT/'source-detail-grid.jpg')
