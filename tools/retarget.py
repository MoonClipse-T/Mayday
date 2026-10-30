# Mixamo 동작(FBX, 뼈만) → Tripo 리깅 모델(Mixamo 뼈 이름)로 옮겨 담아 GLB 하나로
#   blender -b --factory-startup -P tools/retarget.py -- <리깅 모델.fbx> <동작 폴더> <결과.glb>
#   동작 이름 = 파일 이름 (idle.fbx → 'idle'). 뼈 축이 달라도 되게 '쉬는 자세 대비 회전'을 월드에서 옮긴다
#   (양쪽 다 T 자세가 기준). 골반 이동은 골반 높이 비율로 줄인다
import bpy, sys, os, glob
from mathutils import Matrix
model, adir, out = sys.argv[sys.argv.index('--')+1:][:3]
bpy.ops.wm.read_factory_settings(use_empty=True)
key = lambda n: n.split(':')[-1].replace('mixamorig', '')

def imp(p):
    before = set(bpy.data.objects); bpy.ops.import_scene.fbx(filepath=p, automatic_bone_orientation=False)
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
for a in list(bpy.data.actions): bpy.data.actions.remove(a)
T.animation_data_create()
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
                q = sw.to_quaternion() @ srest[s].to_quaternion().inverted() @ trest[t].to_quaternion()
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
