# 구조정 R-1 안(blender/05_구조정R1.blend) → web/assets/r1.glb
# Blender 의 Text Editor 에서 이 스크립트(텍스트 블록 export_r1)를 열고 Run Script.
# 내보낸 뒤 꼭 : node tools/webp_plain.mjs web/assets/r1.glb  (three r128 이 WebP 그림을 읽게 고친다) → index.html 의 window.V 올리기
# 이름 규칙 : SPAWN · SPOT_<자리> · LIGHT_<이름>(color · i · d 속성) · IT_hatchdoor(외부 해치 — 코드가 연다) · ANIM_steering/throttle(조종간 · 추력 손잡이)
# 무거운 소품은 Decimate 수정자(dec)로 줄여 둔다 — export_apply 로 적용된 채 나간다
import bpy, os
root = os.path.dirname(os.path.dirname(bpy.data.filepath))
bpy.ops.object.select_all(action='DESELECT')
for o in bpy.context.scene.objects:
    if o.name != 'LookCam': o.select_set(True)
win = bpy.context.window_manager.windows[0]
area = next((a for a in win.screen.areas if a.type == 'VIEW_3D'), win.screen.areas[0])
out = os.path.join(root, 'web', 'assets', 'r1.glb')
with bpy.context.temp_override(window=win, area=area):
    bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', use_selection=True, export_apply=True, export_extras=True,
                              export_cameras=False, export_lights=False, export_image_format='WEBP', export_image_quality=78,
                              export_meshopt_compression_enable=True)
print('r1.glb', os.path.getsize(out), '→ 이제 node tools/webp_plain.mjs web/assets/r1.glb')
