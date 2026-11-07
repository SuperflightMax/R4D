"""Связать авторские SVG с текущей схемой Concept C2 и экспортировать риг.

Запуск из Q3C: python assets/production-v1/source/export_rig.py
--preview записывает локальный HTML лист собранных поз в output/playwright.
Трансформы листа рассчитаны из тех же данных, которые получает Builder.
"""

from __future__ import annotations

import argparse
import base64
from copy import deepcopy
import hashlib
import html
import json
import math
from pathlib import Path

PACK = Path(__file__).resolve().parents[1]
Q3C = PACK.parents[1]
CONCEPT = Q3C / "design/concept-stage-c"
SPEC_FILE = CONCEPT / "C2_ART_RIG_SPEC.json"
MOTION_FILE = CONCEPT / "C2_MOTION_CURVES.json"
OUT = Q3C / "assets/rig/FULL_RIG_V1.json"
BASE = "21fbafcfb435838bc84aed931fe68e57cae9fdbc"
TURN = "01a1b358-29eb-7ba3-b5cc-794608b31d4e"
CONTINUATION = "01a1b4a0-371d-73f2-a929-3a80fc4630f4"
CONCEPT_COMMIT = "31de274f0468ad39a68dcd308791ef376e8a95b2"
PROJECTION_X = .30
PROJECTION_Y = -.10


def read_json(file):
    return json.loads(file.read_text(encoding="utf-8-sig"))


def rel(file):
    return file.relative_to(Q3C).as_posix()


def ydown(point):
    return [point[0], -point[1], *(point[2:] or [0])]


def paint(asset, offset=(0, 0), back=None):
    result = {"asset": asset, "offset": list(offset)}
    if back:
        result["backAsset"] = back
    return result


def binding(item):
    name = item["id"]
    bindings = {
        "cradle": paint("cradle"),
        "shell.rear": paint("roof-rear-front", back="roof-rear-back"),
        "shell.front": paint("roof-front-front", back="roof-front-back"),
        "belly.rim": paint("belly-rim", (0,21)),
        "thorax.lower": paint("thorax-lower"),
        "thorax.upper": paint("thorax-upper"),
        "thorax.piston.sleeve": paint("piston-thorax-barrel"),
        "thorax.piston.rod": paint("piston-thorax-rod"),
        "eye.front_hatch": paint("shell-front-hatch", back="shell-front-hatch-back"),
        "eye.well": paint("eye-well"),
        "head.carriage.sleeve": paint("carriage-sleeve"),
        "head.carriage.section1": paint("carriage-section-1"),
        "head.carriage.section2": paint("carriage-section-2"),
        "head.yoke": paint("knuckle-cap"),
        "head.chassis": paint("head-chassis"),
        "eye.brow": paint("eye-brow", (4,5)),
        "eye.gimbal": None,
        "eye.barrel": paint("eye-collar"),
        "eye.lens": paint("eye-glass"),
    }
    if name in bindings:
        return bindings[name]
    if name.startswith("eye.iris.leaf."):
        return paint("iris-leaf")
    tokens = name.split(".")
    if name.startswith("bay.rapt."):
        side, part = tokens[2:]
        return {
            "liner": paint("rapt-pocket", (2,35)),
            "door": paint(f"shell-gate-{side}", (67,0), f"shell-gate-back-{side}"),
            "catch": paint("buckle-latch"),
        }[part]
    if name.startswith("bay.walk."):
        fore, side, part = tokens[2:]
        x = -75 if fore == "rear" else 75
        if part == "liner":
            return paint(f"leg-pocket-{fore}", (-x,20))
        return paint(f"leg-gate-{fore}-{side}-front", (-x,0), f"leg-gate-{fore}-{side}-back")
    if name.startswith("walk."):
        fore, side = tokens[1:3]
        part = ".".join(tokens[3:])
        return paint({
            "hip_fork": "hip-bearing", "femur": f"leg-femur-{fore}-{side}",
            "tibia": f"leg-tibia-{side}", "foot": f"leg-foot-{side}",
            "piston.sleeve": "piston-walk-barrel", "piston.rod": "piston-walk-rod",
        }[part])
    if name.startswith("rapt."):
        side = tokens[1]
        part = ".".join(tokens[2:])
        cap = "knuckle-cap" if side == "near" else "knuckle-cap-far"
        return paint({
            "shoulder_fork": cap, "joint_cap": cap, "femur": f"rapt-femur-{side}",
            "tibia": f"rapt-blade-{side}", "latch": "buckle-latch",
            "piston.sleeve": "piston-rapt-barrel", "piston.rod": "piston-rapt-rod",
        }[part])
    raise KeyError(f"Missing authored binding for {name}")


def build_nodes(spec, assets):
    nodes = {}
    for item in spec["inventory"]:
        name = item["id"]
        node = {
            "id": name, "parent": item["parent"], "kind": item["kind"],
            "pivot": ydown(item["pivot"]), "zOrder": item["drawLayer"],
            "physicalDepth": item["physicalDepth"],
            "artDepth": sum(item["physicalDepth"]) / 2,
            "draw": binding(item),
        }
        if item.get("axis"):
            node["axisConceptYUp"] = item["axis"]
        if "length" in item:
            node["length"] = item["length"]
        for key in ("roofPanel", "freeXY", "portSlackXY", "groundConstraint"):
            if key in item:
                node[key] = item[key]
        if name.startswith("bay.walk.") and name.endswith(".door"):
            # Наружная ось перенесена к верхней кромке выреза. При
            # открытии вся створка выходит из объёма ходячего лотка.
            node["pivot"][1] = -28
            node["rollSignScreen"] = 1 if ".near." in name else -1
        if name == "bay.rapt.near.liner":
            node["zOrder"] = 62.4
        if name.startswith("bay.rapt.") and name.endswith(".catch"):
            node["pivot"][0] = 44
        if name == "shell.front":
            node["roofPanel"]["seatCutInPanelCoordinates"] = {"x":[24,63],"z":[-33,3]}
        if name.startswith("rapt."):
            side = -1 if ".far." in name else 1
            if name.endswith((".tibia",".joint_cap")):
                node["physicalDepth"] = [-50,-43] if side < 0 else [43,50]
                node["artDepth"] = side*46
            elif name.endswith((".femur",".piston.sleeve",".piston.rod",".latch")):
                node["physicalDepth"] = [-41,-34] if side < 0 else [34,41]
                node["artDepth"] = side*38
        if item.get("axis", [0]) and abs(item["axis"][0]) == 1:
            node.setdefault("rollSignScreen", -item["axis"][0])
        if name == "eye.front_hatch":
            # Передний лист ниже оси, его знак противоположен верхним крышкам.
            node["pivot"] = [54,-75,35]
            node["rollSignScreen"] = 1
        if "pinB" in item:
            pin_a = ydown(item["pivot"])
            pin_b = ydown(item["pinB"]["local"])
            design = item["actuator"]
            barrel, sections, overlap = design["housingLength"],design["sections"],design["minOverlap"]
            section_ids = [name.removesuffix("sleeve") + part for part in (("inner","rod") if len(sections)==2 else ("rod",))]
            node["drive"] = {
                "pinA": {"part": item["parent"], "local": list(pin_a)},
                "pinB": {"part": item["pinB"]["part"], "local": pin_b},
                "barrelLength": barrel, "sectionLengths": sections,"minimumInsertion":overlap,
                "pinDistanceAllowed":[barrel,barrel+sum(length-overlap for length in sections)],
                "sectionIds":section_ids,
            }
        nodes[name] = node

    # Художественные накладки на те же кости. Они не создают новую
    # массу или нового родителя при переходе между позами.
    extras = [
        ("shell.interior", "cradle", [0,0,0], 6, -54, "shell-interior"),
        ("shell.fixed.far", "cradle", [0,0,0], 8, -52, "shell-fixed-far"),
        ("shell.fixed.near", "cradle", [0,0,0], 67.8, 52, "shell-fixed-near"),
        ("shell.regulator", "cradle", [-18,-15,49], 73, 49, "regulator"),
        ("eye.pupil", "eye.lens", [0,0,0], 53.35, 0, "eye-pupil"),
        ("eye.glint", "eye.lens", [0,0,0], 53.58, 0, "eye-glint"),
        ("thorax.base.cap", "thorax.lower", [0,0,0], 46.1, 10, "knuckle-cap"),
        ("thorax.elbow.cap", "thorax.upper", [0,0,0], 46.2, 11, "knuckle-cap"),
    ]
    for side in ("far","near"):
        for fore in ("rear","front"):
            prefix = f"walk.{fore}.{side}"
            cap = "knuckle-cap" if side == "near" else "knuckle-cap-far"
            base = 59.2 if side == "near" else 21.2
            depth = nodes[prefix+".tibia"]["artDepth"]
            extras += [
                (prefix+".knee.cap", prefix+".tibia", [0,0,0], base, depth, cap),
                (prefix+".ankle.cap", prefix+".foot", [0,0,0], base-.42, depth, cap),
            ]
    for name, parent, origin, layer, depth, asset in extras:
        assert name not in nodes
        nodes[name] = {"id":name,"parent":parent,"kind":"art-layer","pivot":origin,
                       "zOrder":layer,"artDepth":depth,"draw":paint(asset)}

    for node in list(nodes.values()):
        drive = node.get("drive")
        if not drive or len(drive["sectionIds"]) != 2:
            continue
        name, rod = drive["sectionIds"]
        family = "thorax" if node["id"].startswith("thorax.") else "walk"
        nodes[name] = {"id":name,"parent":node["id"],"kind":"prismatic-drive-section","pivot":[0,0,0],
                       "zOrder":nodes[rod]["zOrder"]-.1,"artDepth":nodes[rod]["artDepth"],"draw":paint(f"piston-{family}-inner")}

    for node in nodes.values():
        node["identityAcross"] = ["P","K0","K1","K2","K3","K4","K5"]
        if node["parent"] is not None:
            assert node["parent"] in nodes, node
        if node["draw"]:
            for key in ("asset","backAsset"):
                if key in node["draw"]:
                    assert node["draw"][key] in assets, node
    return nodes


def bezier(t, x1, y1, x2, y2):
    def coordinate(u, a, b):
        return 3*(1-u)**2*u*a + 3*(1-u)*u*u*b + u**3
    low, high = 0.0, 1.0
    for _ in range(23):
        middle = (low+high)/2
        if coordinate(middle, x1, x2) < t:
            low = middle
        else:
            high = middle
    return coordinate((low+high)/2, y1, y2)


def evaluate(motion, time):
    results = {}
    for key, track in motion["tracks"].items():
        value = track["initial"]
        for step in track["segments"]:
            if time < step["start"]:
                break
            if time >= step["end"]:
                value = step["to"]
                continue
            q = (time-step["start"])/(step["end"]-step["start"])
            value = step["from"] + (step["to"]-step["from"])*bezier(q, *motion["curves"][step["ease"]])
            break
        results[key] = value
    return results


def rotate(point, angle):
    a = math.radians(angle)
    return [point[0]*math.cos(a)-point[1]*math.sin(a), point[0]*math.sin(a)+point[1]*math.cos(a)]


def angle_to(a, b):
    return math.degrees(math.atan2(b[1]-a[1], b[0]-a[0]))


def append_point(a, b):
    return [a[0]+b[0], a[1]+b[1]]


def solve_legs(channels, motion, packed):
    result = {}
    for leg, contact in motion["footContacts"]["contactX"].items():
        fore = leg.split(".")[0]
        sign = -1 if fore == "rear" else 1
        if packed:
            result[leg] = [0 if sign < 0 else 180, 180 if sign < 0 else 0, 0]
            continue
        hip = [75*sign+channels["cradle.x"], -20-channels["cradle.rise"]]
        roll_up = channels[f"walk.{leg}.foot.roll"]
        roll = -roll_up
        contact_point = [-6 if roll_up >= 0 else 6, 2]
        pin = [contact["x"]+contact_point[0], 30]
        rotated = rotate(contact_point, roll)
        ankle = [pin[0]-rotated[0], pin[1]-rotated[1]]
        dx, dy = ankle[0]-hip[0], ankle[1]-hip[1]
        distance = math.hypot(dx,dy)
        assert 8 < distance < 144, (leg,distance)
        along = (68**2-76**2+distance**2)/(2*distance)
        aside = math.sqrt(68**2-along**2)
        # Raw y-up branch from the approved scheme reflected to screen-down.
        knee = [hip[0]+(along*dx+sign*aside*dy)/distance,
                hip[1]+(along*dy-sign*aside*dx)/distance]
        assert abs(math.dist(hip,knee)-68) < 1e-7 and abs(math.dist(knee,ankle)-76) < 1e-7
        assert knee[1] < 28, (leg,knee)
        result[leg] = [angle_to(hip,knee),angle_to(knee,ankle),roll]
    return result


def state_at(nodes, motion, time, packed=False):
    channels = evaluate(motion,time)
    if packed:
        channels.update({"head.chassis.abs":-25,"eye.front_hatch.open":0,
                         "head.carriage.section1.stroke":0,"head.carriage.section2.stroke":0,
                         "eye.brow.angle":0,"eye.iris.open":.8,"eye.gimbal.aim":0})
    leg_angles = solve_legs(channels,motion,packed)
    world = {}

    def solve(name):
        if name in world:
            return world[name]
        node = nodes[name]
        parent = solve(node["parent"]) if node["parent"] else {"xy":[0,0],"r":0}
        local = node["pivot"][:2]
        angle = parent["r"]
        roll = 0
        if name == "cradle":
            local = [channels["cradle.x"], 35 if packed else -channels["cradle.rise"]]
        if name in ("thorax.lower","thorax.upper","head.chassis","rapt.far.femur","rapt.near.femur"):
            angle = -channels[name+".abs"]
        if name.startswith("rapt.") and name.endswith(".tibia"):
            angle -= channels[name+".relative"]
        if name.startswith("walk.") and name.endswith((".femur",".tibia",".foot")):
            leg = ".".join(name.split(".")[1:3])
            angle = leg_angles[leg][["femur","tibia","foot"].index(name.split(".")[-1])]
        if "rollSignScreen" in node:
            amount = channels.get(name+".open", 0 if packed else 104)
            roll = node["rollSignScreen"]*amount
        if name.endswith((".catch",".latch")):
            angle -= channels[name+".open"]
        if name == "head.carriage.sleeve":
            angle = -channels["head.carriage.sleeve.abs"]
        if name.startswith("head.carriage.section"):
            local = [channels[name+".stroke"],0]
        if name == "eye.brow":
            angle -= channels["eye.brow.angle"]
        if name == "eye.gimbal":
            angle -= channels["eye.gimbal.aim"]*.38
        if name == "eye.pupil":
            local = [max(-2.4,min(2.4,channels["eye.gimbal.aim"]*.17)),0]
        if name.startswith("eye.iris.leaf."):
            angle += math.degrees(math.atan2(local[1],local[0])) + 180 + 84*channels["eye.iris.open"]
        xy = append_point(parent["xy"], rotate(local,parent["r"]))
        if "drive" in node:
            pin_b = node["drive"]["pinB"]
            distal = solve(pin_b["part"])
            other = append_point(distal["xy"], rotate(pin_b["local"],distal["r"]))
            angle = angle_to(xy,other)
        if name.endswith((".piston.rod",".piston.inner")):
            drive = nodes[node["parent"]]["drive"]
            pin_b = drive["pinB"]
            distal = solve(pin_b["part"])
            end = append_point(distal["xy"], rotate(pin_b["local"],distal["r"]))
            if name.endswith(".piston.rod"):
                xy = end
            else:
                distance = math.dist(parent["xy"],end)
                extension = distance-drive["barrelLength"]
                capacities = [length-drive["minimumInsertion"] for length in drive["sectionLengths"]]
                position = drive["barrelLength"]+extension*capacities[0]/sum(capacities)
                xy = append_point(parent["xy"],rotate([position,0],angle))
        world[name] = {"xy":xy,"r":angle,"rx":roll,"z":node["artDepth"]}
        return world[name]

    for name in nodes:
        solve(name)
    return {"channels":channels,"world":world}


def pack_rig():
    spec, motion = read_json(SPEC_FILE), read_json(MOTION_FILE)
    assert spec["base"] == motion["base"] == BASE
    assets = read_json(PACK / "PARTS_INDEX.json")
    nodes = build_nodes(spec,assets)
    motion = deepcopy(motion)
    motion["idle"]["capsule"].append({"channel":"shell.regulator.rotation","type":"continuousRotation","degPerSecond":7.8,"phaseFromSeed":True})
    motion["idle"]["mantis"].append({"channel":"shell.regulator.rotation","type":"continuousRotation","degPerSecond":5.6,"phaseFromSeed":True})
    keys = [{"id":"P","t":0,"title":"Упакованная капсула"},*motion["keys"]]
    poses = {}
    for key in keys:
        sampled = state_at(nodes,motion,key["t"],key["id"]=="P")
        poses[key["id"]] = {
            "t": key["t"], "title":key["title"],
            "channels": {k:round(v,6) for k,v in sampled["channels"].items()},
            "drawTransforms": {k:[round(v["xy"][0],6),round(v["xy"][1],6),round(v["r"],6),round(v["rx"],6),v["z"]] for k,v in sampled["world"].items()},
        }
    for asset in assets.values():
        data = (Q3C / "assets" / asset["path"]).read_bytes()
        asset["sha256"] = hashlib.sha256(data).hexdigest()
    used_assets = {value for n in nodes.values() if n["draw"] for key,value in n["draw"].items() if key in ("asset","backAsset")}
    assert used_assets == set(assets), (set(assets)-used_assets, used_assets-set(assets))
    return {
        "schemaVersion":1,"id":"q3c.full-rig.v1","checkpoint":"C2_FULL_RIG_TRANSFORM",
        "base":BASE,"conceptCommit":CONCEPT_COMMIT,"owner":"asset-artist-r4d-q3c-01","turnId":TURN,"continuationTurnId":CONTINUATION,
        "sources":[{"path":rel(f),"sha256":hashlib.sha256(f.read_bytes()).hexdigest()} for f in (SPEC_FILE,MOTION_FILE)],
        "coordinates":{
            "units":"U=180; +x right, +y down, +z toward camera. Angle degrees clockwise in XY. Motion source channels marked abs/relative and rise retain original y-up signs.",
            "sampledFloorY":30,"runtimeFloorOffsetY":-30,
            "texturePixelsPerUnit":4,
            "drawTransformTuple":["x","y","rzDegScreen","rxDegScreen","z"],
            "projection":{"xPerZ":PROJECTION_X,"yPerZ":PROJECTION_Y},
            "planeRoll":"Before global actor rotation, a flat door uses X=x+kx*z and Y=y+ky*z after R_x. Local Y column is (kx*sin(rx), cos(rx)+ky*sin(rx)). Use backAsset when determinant is negative; draw edge thickness from lip/hinge, not alpha.",
            "opticalRail":"Root stays attached at thorax.upper end; its absolute track holds +X for emergence and turns toward +68deg (y-up) after clearance. Two rigid 18-unit sections extend 0..12 each. Head chassis turns on the terminal pivot.",
        },
        "identity":{"root":"cradle","eyeLens":"eye.lens","sameTopology":True,"allNodesPresentIn":[k["id"] for k in keys]},
        "visualTarget":spec["visualTarget"],"massGroups":spec["massGroups"],"seams":spec["seams"],
        "apertures":{
            "raptorial":spec["release"],
            "walk":{"bodyOpeningsXYUp":{"rear":[[-89,-3],[0,28]],"front":[[3,89],[0,28]]},"separatePerDepth":True,"lowerHingeYUp":28,"sideRollMagnitude":104,"crossSectionBudget":[5.4,3.6]},
            "optics":{"glassDiameter":18,"boreFree":20,"eyeHeadExitLocalXYUp":[[-14,58],[-26,14]],"independentShellHatch":"eye.front_hatch","frontSkinReliefXYUp":{"x":[50,96],"y":[40,86]},"retainedSideCatchX":44},
            "thoraxSeat":{"panel":"shell.front","cutInPanelCoordinates":{"x":[24,63],"z":[-33,3]},"retainedBridgeZ":[3,33],"scope":"Physical throat around C1 during front roof seating. The surviving near bridge remains attached to the same hinge. The notch is painted as a real silhouette cutout in both roof-front faces."},
        },
        "assets":assets,"nodes":list(nodes.values()),"drawOrder":sorted(nodes,key=lambda k:(nodes[k]["zOrder"],k)),
        "poses":poses,"motion":motion,
        "channelRules":{
            "zRotation":"Negate absolute/relative Concept angles for screen-down; local absolute follower = requested world angle minus parent world angle.",
            "roll":"open degrees times node.rollSignScreen. Positive front-hatch roll carries the leaf outside its front seat. Lower rail gates are 0 in P and fully open by K0.",
            "iris":"Per-leaf absolute in barrel frame = atan2(pivotY,pivotX) + 180 + 84*clamp(open,0,1); pupil separate from glass and glint.",
            "gimbal":"Lens yaw in XY = -0.38*aim degrees. Pupil.x = clamp(aim*0.17,-2.4,2.4); use user gaze plus sampled micro offsets.",
            "drives":"Resolve pins A and B, rotate sleeve to A→B, put distal section at B. Split excess distance over housing between nested stages in proportion to their available strokes. Preserve insertion and test distance bounds for new Stage D trajectories.",
            "support":"Apply root and foot rolls, then solve 68/76 IK. Retain projected contact on physically selected heel/toe. Never ease the solved leg angles independently away from the anchor.",
        },
        "stageDInterfaces":{
            "walk":[{"foot":f"walk.{leg}.foot","heel":[-6,2],"toe":[6,2],"legLengths":[68,76]} for leg in motion["footContacts"]["contactX"]],
            "aim":{"lens":"eye.lens","controller":"eye.gimbal","pupil":"eye.pupil","neutralForward":[1,0]},
            "capture":[{"side":side,"blade":f"rapt.{side}.tibia","tip":[88,0],"contactSeat":[63.4,5],"opposingFemur":f"rapt.{side}.femur"} for side in ("near","far")],
            "contactEvent":{"space":"actual world contact point on bound blade/target","payload":["contactWorldXY","strikeDirection","victimId","seed"],"targetAssetOwnerStage":"D"},
        },
        "adjustments":[
            {"kind":"lower hinge seat","conceptYUp":13,"productionYUp":28,"basis":"Place axis on upper edge of real elongated cutout; leaf moves completely out of pocket instead of turning its upper part inward."},
            {"kind":"eye hatch seat","conceptPivotYUp":[64,58,35],"productionPivotYUp":[54,75,35],"basis":"Seat on the upper edge of the physical eye opening. The outward-opening plate clears the amber lens in K0 at the exact Concept projection."},
            {"kind":"optical cutout and catch seat","conceptCatchX":58,"productionCatchX":44,"basis":"The solid catch is seated behind the brow of the pocket at x=44. The cheek, its lining and the optical hatch meet at x=50, freeing the original 18-unit amber aperture under the corrected projection."},
            {"kind":"pocket composition","conceptNearLinerZOrder":66,"productionNearLinerZOrder":62.4,"basis":"Recess behind the near limb. Render moving arm ahead of its own opaque liner when the door opens."},
            {"kind":"projection and arm depth","basis":"Use exact Concept screen projection x+.30*z, y-.10*z and blade face planes at +/-46. Reverse the far slab allocation inside its original bay so the far blade, cap and near counterparts have matching outer planes and 2 units between solids. Preserve IDs, link lengths and the 12-unit sole."},
            {"kind":"front roof saddle","basis":"A 24..63 by -33..3 open seat remains around rising lower thorax as the front roof settles. Keep the near-side metal bridge attached; both faces of the part have the throat cutout."},
            {"kind":"additional art layers","basis":"Fixed shell rims, continuous inner faces, one regulator, knee/ankle caps, pupil and glint bind to existing geometry with static IDs."},
        ],
    }


def art_matrix(transform, rig):
    x,y,rz,rx,z = transform
    cos_x, sin_x = math.cos(math.radians(rx)),math.sin(math.radians(rx))
    y_column = [PROJECTION_X*sin_x,cos_x+PROJECTION_Y*sin_x]
    a,b = rotate([1,0],rz)
    c,d = rotate(y_column,rz)
    return [a,b,c,d,x+PROJECTION_X*z,y+PROJECTION_Y*z], y_column[1]<0


def render_pose(rig, pose_name, images):
    transforms = rig["poses"][pose_name]["drawTransforms"]
    nodes = {n["id"]:n for n in rig["nodes"]}
    layer = []
    for name in rig["drawOrder"]:
        art = nodes[name]["draw"]
        if not art:
            continue
        matrix, back = art_matrix(transforms[name],rig)
        asset = art.get("backAsset",art["asset"]) if back else art["asset"]
        x,y,w,h = rig["assets"][asset]["viewBox"]
        off_x,off_y = art["offset"]
        svg_matrix = ' '.join(f'{n:.6f}' for n in matrix)
        layer.append(f'<image data-part="{name}" href="{images[asset]}" x="{x+off_x}" y="{y+off_y}" width="{w}" height="{h}" transform="matrix({svg_matrix})"/>')
    return ''.join(layer)


def preview(rig):
    folder = PACK / "output/playwright"
    folder.mkdir(parents=True,exist_ok=True)
    images = {name:"data:image/svg+xml;base64,"+base64.b64encode((Q3C/"assets"/asset["path"]).read_bytes()).decode("ascii") for name,asset in rig["assets"].items()}
    panels = []
    for name in ("K0","K1","K2","K3","K4","K5"):
        label = html.escape(rig["poses"][name]["title"])
        transform = rig["poses"][name]["drawTransforms"]
        soles = []
        for contact in rig["motion"]["footContacts"]["contactX"]:
            x,_,_,_,z = transform[f"walk.{contact}.foot"]
            soles.append(f'<ellipse cx="{x+PROJECTION_X*z:.4f}" cy="{30+PROJECTION_Y*z:.4f}" rx="9" ry="2" fill="#141715" opacity=".56"/>')
        svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-167 -316 360 366" role="img" aria-label="{name} {label}">'
               '<defs><radialGradient id="shadow"><stop stop-color="#060c10" stop-opacity=".8"/><stop offset="1" stop-color="#0b1219" stop-opacity="0"/></radialGradient></defs>'
               '<ellipse cx="0" cy="31" rx="155" ry="14" fill="url(#shadow)"/><path d="M-167 33H193" stroke="#777167" opacity=".39" stroke-width=".45"/>'
               +''.join(soles)+render_pose(rig,name,images)+'</svg>')
        panels.append(f'<section><header><b>{name}</b><span>{label}</span></header>{svg}</section>')
    content = '''<!doctype html><html lang="ru"><meta charset="utf-8"><link rel="icon" href="data:,"><title>Q3C · проверка сборки SVG</title><style>
*{box-sizing:border-box}body{margin:0;padding:24px;background:#101921;color:#f1dbb0;font-family:Georgia,serif}
h1{font-size:22px;letter-spacing:.09em;margin:0 0 5px}p{margin:0 0 17px;color:#acb2ac;font:14px system-ui}
main{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}section{border:1px solid #4d4439;border-radius:8px;background:radial-gradient(ellipse at 52% 55%,#53534b,#2d3438 58%,#18232a);overflow:hidden}
header{display:flex;gap:14px;padding:10px 12px;background:#151d21;color:#e9c98d;font:15px Georgia}header span{color:#b8b6a8}svg{width:100%;display:block;aspect-ratio:360/366}
@media(max-width:680px){body{padding:12px}main{grid-template-columns:1fr}h1{font-size:17px}}
</style><h1>Q3C · ВИКТОРИАНСКИЙ АВТОМАТ</h1><p>Одинаковые детали в шести позах. Сборка из production SVG.</p><main>'''
    (folder/"poses.html").write_text(content+''.join(panels)+"</main></html>",encoding="utf-8",newline="\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--preview",action="store_true")
    args = parser.parse_args()
    rig = pack_rig()
    OUT.write_text(json.dumps(rig,ensure_ascii=False,indent=2)+"\n",encoding="utf-8",newline="\n")
    if args.preview:
        preview(rig)
    print(f'{len(rig["assets"])} SVG; {len(rig["nodes"])} persistent IDs; {len(rig["motion"]["tracks"])} profiles; {len(rig["poses"])} poses')
