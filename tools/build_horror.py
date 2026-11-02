# 공포 소품 (7 · 8장) → blender/21_공포소품.blend + web/assets/horror.glb
#   blender -b --factory-startup -P tools/build_horror.py
#   좌표는 게임 세계 그대로 (Blender x, y, z = three x, −z, y). ROOM_horror 아래 IT_ 이름 = 엔진의 조사 대상 이름
#   IT_vent_sj   라운지 문 옆 천장 환기구 (비상등 스위치로 간 서준이 끌려 올라간다) · 창살 vent_grate_sj
#   IT_vent_dn   라운지 천장 환기구 (다니엘을 덮친다)           · 창살 vent_grate_dn
#   IT_vent_bd   복도 함교 문 앞 천장 환기구 (마야)              · 창살 vent_grate_bd
#   IT_gore_hall / IT_gore_sj / IT_gore_bd : 끌려간 뒤에야 보이는 피 (천장 번짐 · 바닥 웅덩이 · 손자국 · 할퀸 자국)
#   IT_lamp      마야의 손전등 (보이지 않는 곳에 두고 엔진이 복제한다)
import bpy, bmesh, os, math
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEX = os.path.join(ROOT, 'blender', 'tex_story')
bpy.ops.wm.read_factory_settings(use_empty=True)
col = bpy.data.collections.new('HORROR'); bpy.context.scene.collection.children.link(col)

def mat(name, rgb, rough=.6, metal=0, emit=None, img=None):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; b = next(n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED')
    b.inputs['Base Color'].default_value = (*rgb, 1); b.inputs['Roughness'].default_value = rough; b.inputs['Metallic'].default_value = metal
    if emit: b.inputs['Emission Color'].default_value = (*emit[0], 1); b.inputs['Emission Strength'].default_value = emit[1]
    if img:
        t = nt.nodes.new('ShaderNodeTexImage'); t.image = bpy.data.images.load(os.path.join(TEX, img))
        nt.links.new(t.outputs['Color'], b.inputs['Base Color']); nt.links.new(t.outputs['Alpha'], b.inputs['Alpha'])
        m.surface_render_method = 'BLENDED'
    return m
M = {'steel': mat('hz_steel', (.07, .075, .08), .45, .85), 'hole': mat('hz_hole', (.004, .004, .005), 1),
     'slat': mat('hz_slat', (.11, .115, .12), .5, .8), 'gouge': mat('hz_gouge', (.03, .006, .005), .95),
     'pool': mat('hz_blood_pool', (1, 1, 1), .35, img='blood_pool.png'), 'drag': mat('hz_blood_drag', (1, 1, 1), .4, img='blood_drag.png'),
     'hand': mat('hz_blood_hand', (1, 1, 1), .4, img='blood_hand.png'),
     'lbody': mat('hz_lamp_body', (.05, .052, .055), .4, .7), 'lgrip': mat('hz_lamp_grip', (.015, .015, .016), .9),
     'lens': mat('hz_lamp_lens', (1, .95, .85), .1, emit=((1, .93, .8), 6))}

def obj(name, me, parent, loc=(0, 0, 0), rot=(0, 0, 0)):
    o = bpy.data.objects.new(name, me); col.objects.link(o); o.parent = parent; o.location = loc; o.rotation_euler = rot; return o
def empty(name, loc=(0, 0, 0), parent=None):
    o = bpy.data.objects.new(name, None); col.objects.link(o); o.parent = parent; o.location = loc; return o
def box(name, size, m, parent, loc=(0, 0, 0), rot=(0, 0, 0)):
    me = bpy.data.meshes.new(name); bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1)
    for v in bm.verts: v.co.x *= size[0]; v.co.y *= size[1]; v.co.z *= size[2]
    bm.to_mesh(me); bm.free(); me.materials.append(m); return obj(name, me, parent, loc, rot)
def plane(name, w, h, m, parent, loc=(0, 0, 0), rot=(0, 0, 0)):
    me = bpy.data.meshes.new(name); bm = bmesh.new(); bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=.5)
    for v in bm.verts: v.co.x *= w; v.co.y *= h
    uv = bm.loops.layers.uv.new()
    for f in bm.faces:
        for l in f.loops: l[uv].uv = (l.vert.co.x / w + .5, l.vert.co.y / h + .5)
    bm.to_mesh(me); bm.free(); me.materials.append(m); return obj(name, me, parent, loc, rot)
def cyl(name, r, d, m, parent, loc=(0, 0, 0), rot=(0, 0, 0), seg=16, r2=None):
    me = bpy.data.meshes.new(name); bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, segments=seg, radius1=r, radius2=r2 if r2 is not None else r, depth=d)
    bm.to_mesh(me); bm.free(); me.materials.append(m); o = obj(name, me, parent, loc, rot)
    for p in me.polygons: p.use_smooth = True
    return o

room = empty('ROOM_horror')
# 천장 환기구 : 검은 구멍 + 테두리 + 창살(따로 — 엔진이 젖혀 연다). 구멍은 천장 바로 아래, 아래를 본다
def vent(key, x, z_three, ceil):
    it = empty('IT_vent_' + key, (x, -z_three, ceil), room)
    plane('vent_hole_' + key, .9, .7, M['hole'], it, (0, 0, -.004), (math.pi, 0, 0))
    for i, (sx, sy, lx, ly) in enumerate([(.98, .05, 0, .375), (.98, .05, 0, -.375), (.05, .7, .465, 0), (.05, .7, -.465, 0)]):
        box(f'vent_rim{i}_{key}', (sx, sy, .035), M['steel'], it, (lx, ly, -.02))
    g = empty('vent_grate_' + key, (0, 0, -.03), it)
    box('vent_gframe_' + key, (.88, .68, .015), M['slat'], g)
    for i in range(7): box(f'vent_slat{i}_{key}', (.84, .035, .045), M['slat'], g, (0, -.27 + i * .09, -.01), (.5, 0, 0))
    return it
vent('sj', 16.2, 14.6, 6.395); vent('dn', 16.0, 24.5, 6.285); vent('bd', 2.8, 10.4, 2.555)

# 피 : 끌려간 뒤에 엔진이 보이게 한다
def gore(key, parts):
    it = empty('IT_gore_' + key, (0, 0, 0), room)
    for n, (kind, w, h, loc, rot) in enumerate(parts): plane(f'gore_{key}_{n}', w, h, M[kind], it, loc, rot)
    return it
DOWN, UP = (math.pi, 0, 0), (0, 0, 0)
gore('hall', [('pool', 1.3, 1.3, (34, -10.5, 2.548), DOWN), ('pool', .9, .9, (34.1, -10.4, .012), UP), ('drag', .5, 1.4, (34.3, -10.5, 2.547), (math.pi, 0, .4))])
gore('sj', [('pool', 1.6, 1.6, (16.2, -14.6, 6.388), DOWN), ('pool', 1.2, 1.2, (16.3, -14.5, .012), UP), ('hand', .35, .35, (15.6, -12.74, 1.45), (math.pi / 2, 0, 0)),
            ('drag', .4, 1.2, (16.0, -12.74, 2.2), (math.pi / 2, 0, .1))])      # 문 옆 벽 (라운지 북쪽 벽 z 12.75) : 손자국 · 위로 끌린 자국
gore('bd', [('pool', 1.2, 1.2, (2.8, -10.4, 2.548), DOWN), ('pool', .8, .8, (2.9, -10.3, .012), UP), ('drag', .45, 1.5, (2.4, -10.0, .013), (0, 0, 1.2)),
            ('hand', .3, .3, (2.2, -8.94, 1.15), (math.pi / 2, 0, 0))])
# 할퀸 자국 : 함교 문 옆 벽 (복도 북쪽 벽 z 8.9) — 깊게 패인 네 줄
cl = bpy.data.objects['IT_gore_bd']
for i in range(4):
    box(f'gore_bd_claw{i}', (.03, .02, .85 - i * .06), M['gouge'], cl, (1.45 + i * .1, -8.93, 1.55 - i * .03), (0, .28, 0))

# 마야의 손전등 : 몸통 · 손잡이 홈 · 머리 · 빛나는 렌즈 (x 축 방향이 앞) — 바닥 아래 숨겨 둔다
lp = empty('IT_lamp', (0, 0, -5), room)
cyl('lamp_body', .022, .2, M['lbody'], lp, (-.02, 0, 0), (0, math.pi / 2, 0))
for i in range(4): cyl(f'lamp_grip{i}', .0235, .012, M['lgrip'], lp, (-.09 + i * .028, 0, 0), (0, math.pi / 2, 0))
cyl('lamp_head', .032, .07, M['lbody'], lp, (.11, 0, 0), (0, math.pi / 2, 0), r2=.024)
cyl('lamp_lens', .028, .006, M['lens'], lp, (.147, 0, 0), (0, math.pi / 2, 0))

blend = os.path.join(ROOT, 'blender', '21_공포소품.blend')
bpy.ops.wm.save_as_mainfile(filepath=blend)
for o in bpy.context.view_layer.objects: o.select_set(o.users_collection[0] == col)
out = os.path.join(ROOT, 'web', 'assets', 'horror.glb')
bpy.ops.export_scene.gltf(filepath=out, use_selection=True, export_format='GLB', export_extras=True, export_apply=True, export_image_format='JPEG',
                          export_image_quality=85, export_yup=True, export_animations=False, export_cameras=False, export_lights=False)
print('done', out, os.path.getsize(out))
