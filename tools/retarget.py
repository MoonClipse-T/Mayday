# Mixamo 동작(FBX, 뼈만) → Tripo 리깅 모델(Mixamo 뼈 이름)로 옮겨 담아 GLB 하나로
#   blender -b --factory-startup -P tools/retarget.py -- <리깅 모델.fbx> <동작 폴더> <결과.glb>
#   동작 이름 = 파일 이름 (idle.fbx → 'idle'). 뼈 축이 달라도 되게 '쉬는 자세 대비 회전'을 월드에서 옮긴다
#   쉬는 자세가 달라도 된다(Tripo 비행복 대원은 팔을 내린 자세) : 대상 뼈를 원본 쉬는 자세 방향으로 먼저 돌려 둔다. 골반 이동은 골반 높이 비율로 줄인다
#   리깅 모델이 .glb 면 원래 있던 동작(idle · walk)은 그대로 두고 새 동작을 더한다
import bpy, sys, os, glob
from mathutils import Matrix
model, adir, out = sys.argv[sys.argv.index('--')+1:][:3]
bpy.ops.wm.read_factory_settings(use_empty=True)
key = lambda n: n.split(':')[-1].replace('mixamorig', '')

def imp(p):
    before = set(bpy.data.objects)
    if p.lower().endswith('.glb'): bpy.ops.import_scene.gltf(filepath=p)
    else: bpy.ops.import_scene.fbx(filepath=p, automatic_bone_orientation=False)
    new = [o for o in bpy.data.objects if o not in before]
    return next(o for o in new if o.type == 'ARMATURE'), new

T, tnew = imp(model)
# FBX 뼈대의 0.01 배율 · 90° 회전을 굳힌다 (안 그러면 glTF 에서 뼈와 살 단위가 어긋난다)
bpy.ops.object.select_all(action='DESELECT')
for o in tnew: o.select_set(True)
bpy.context.view_layer.objects.active = T
bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
for o in tnew:
    if o.type == 'MESH':
        for m in o.modifiers: m.show_viewport = False          # 굽는 동안 살 변형 계산을 끈다
# Tripo 대원은 팔을 내린 자세로 리깅돼 손이 허벅지에 붙어 있다 → 팔을 벌리면 천이 지느러미처럼 늘어난다
#   손 · 아래팔 무게와 허벅지 · 골반 무게가 섞인 점은 더 큰 쪽만 남기고, 두 쪽에 걸친 면은 지운다 (닿아 있던 자리라 안 보인다)
def unweld(me):
    import bmesh
    g = {x.index: x.name for x in me.vertex_groups}
    cat = lambda n: 'A' if ('Hand' in n or 'ForeArm' in n) else 'L' if (n.endswith('UpLeg') or n.endswith('Hips')) else ''
    dom = {}
    for v in me.data.vertices:
        gs = [(x.group, x.weight) for x in v.groups if x.weight > 0]
        if not gs: continue
        top = cat(g[max(gs, key=lambda t: t[1])[0]]); dom[v.index] = top
        other = {'A': 'L', 'L': 'A'}.get(top)
        for i, w in gs:
            if other and cat(g[i]) == other: me.vertex_groups[i].remove([v.index])
    bm = bmesh.new(); bm.from_mesh(me.data)
    kill = [f for f in bm.faces if {dom.get(v.index, '') for v in f.verts} >= {'A', 'L'}]
    bmesh.ops.delete(bm, geom=kill, context='FACES_ONLY'); bm.to_mesh(me.data); bm.free()
    print('unweld', me.name, len(kill), 'faces')
if model.lower().endswith('.glb'):
    for o in tnew:
        if o.type == 'MESH' and o.vertex_groups: unweld(o)
keep = set(bpy.data.actions) if model.lower().endswith('.glb') else set()
for a in list(bpy.data.actions):
    if a not in keep: bpy.data.actions.remove(a)
T.animation_data_create(); T.animation_data.action = None
tb = {key(b.name): b.name for b in T.data.bones}
depth = lambda b: 0 if not b.parent else 1 + depth(b.parent)
TW = T.matrix_world.copy(); TWq = TW.to_quaternion()
trest = {b.name: TW @ b.matrix_local for b in T.data.bones}
hipT = tb.get('Hips')
for pb in T.pose.bones: pb.rotation_mode = 'QUATERNION'

for f in sorted(glob.glob(os.path.join(adir, '*.fbx'))):
    name = os.path.splitext(os.path.basename(f))[0]
    S, snew = imp(f); sa = S.animation_data.action
    sb = {key(b.name): b.name for b in S.data.bones}
    pairs = sorted([(tb[k], sb[k]) for k in tb if k in sb], key=lambda p: depth(T.data.bones[p[0]]))
    SW = S.matrix_world
    srest = {s: SW @ S.data.bones[s].matrix_local for _, s in pairs}
    # 쉬는 자세 맞추기 : 뼈 → 같은 이름 자식 뼈 방향이 원본과 같아지도록 돌린 대상 자세(tpose). 자식 없는 뼈는 부모만큼 돈다
    s2t = {s: t for t, s in pairs}; swing = {}
    for t, s in pairs:
        tb_ = T.data.bones[t]; ch = next((c for c in tb_.children if key(c.name) in sb and 'Middle1' in c.name), None) or next((c for c in tb_.children if key(c.name) in sb), None)
        if ch:
            dt = (TW @ ch.head_local) - (TW @ tb_.head_local); sc = S.data.bones[sb[key(ch.name)]]
            ds = (SW @ sc.head_local) - (SW @ S.data.bones[s].head_local)
            swing[t] = dt.normalized().rotation_difference(ds.normalized()) if dt.length > 1e-6 and ds.length > 1e-6 else None
        else: swing[t] = None
    for t, s in sorted(pairs, key=lambda p: depth(T.data.bones[p[0]])):
        if swing[t] is None:
            par = T.data.bones[t].parent; swing[t] = swing.get(par.name) if par else None
            if swing[t] is None: swing[t] = TWq.rotation_difference(TWq)
    tpose = {t: swing[t] @ trest[t].to_quaternion() for t, _ in pairs}
    ratio = trest[hipT].translation.z / max(1e-6, srest[sb['Hips']].translation.z)
    act = bpy.data.actions.new(name); act.use_fake_user = True; T.animation_data.action = act
    levels = {}
    for t, s in pairs: levels.setdefault(depth(T.data.bones[t]), []).append((t, s))
    f0, f1 = map(int, sa.frame_range)
    for fr in range(f0, f1 + 1):
        bpy.context.scene.frame_set(fr)
        for d in sorted(levels):
            for t, s in levels[d]:
                sw = SW @ S.pose.bones[s].matrix
                q = sw.to_quaternion() @ srest[s].to_quaternion().inverted() @ tpose[t]
                pb = T.pose.bones[t]; cur = pb.matrix.copy()
                loc = cur.translation
                if t == hipT: loc = TW.inverted() @ (trest[t].translation + (sw.translation - srest[s].translation) * ratio)
                pb.matrix = Matrix.LocRotScale(loc, TWq.inverted() @ q, cur.to_scale())
                pb.keyframe_insert('rotation_quaternion', frame=fr)
                if t == hipT: pb.keyframe_insert('location', frame=fr)
            bpy.context.view_layer.update()
    T.animation_data.action = None
    for o in snew: bpy.data.objects.remove(o)
    bpy.data.actions.remove(sa)
    print('clip', name, f0, f1, len(pairs), 'bones')

for o in tnew:
    if o.type == 'MESH':
        for m in o.modifiers: m.show_viewport = True
for pb in T.pose.bones: pb.matrix_basis = Matrix()
# ACTIONS : 동작마다 제 길이로 (NLA 로 내보내면 모두 가장 긴 동작 길이가 된다)
bpy.ops.export_scene.gltf(filepath=out, export_animation_mode='ACTIONS', export_force_sampling=True)
print('done', out, os.path.getsize(out))
