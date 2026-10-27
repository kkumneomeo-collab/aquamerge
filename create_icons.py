"""
Generate branded app icons for Android and iOS using Python PIL
"""
from PIL import Image, ImageDraw
import os

def create_badge(size, bg_color=(253, 242, 248), border_color=(244, 63, 94), round_shape=False):
    # High-res canvas for antialiasing
    scale = 4
    hs = size * scale
    canvas = Image.new('RGBA', (hs, hs), (0, 0, 0, 0))
    draw = ImageDraw.Draw(canvas)

    pad = int(hs * 0.05)
    r = int(hs * 0.22) if not round_shape else hs // 2

    if round_shape:
        draw.ellipse([pad, pad, hs - pad, hs - pad], fill=bg_color, outline=border_color, width=int(hs * 0.03))
    else:
        # Rounded rectangle
        draw.rounded_rectangle([pad, pad, hs - pad, hs - pad], radius=r, fill=bg_color, outline=border_color, width=int(hs * 0.03))

    # Add Strawberry Plushie sprite in center
    sprite_path = 'assets/plushies/tier1_strawberry.png'
    if os.path.exists(sprite_path):
        sprite = Image.open(sprite_path).convert('RGBA')
        sprite_dim = int(hs * 0.72)
        sprite = sprite.resize((sprite_dim, sprite_dim), Image.Resampling.LANCZOS)
        offset = (hs - sprite_dim) // 2
        canvas.paste(sprite, (offset, offset), sprite)

    return canvas.resize((size, size), Image.Resampling.LANCZOS)

# 1. Android Mipmap sizes
android_res = 'android/app/src/main/res'
densities = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192
}

for folder, s in densities.items():
    target_dir = os.path.join(android_res, folder)
    if os.path.exists(target_dir):
        # Square / squircle icon
        img = create_badge(s, round_shape=False)
        img.save(os.path.join(target_dir, 'ic_launcher.png'), format='PNG')
        # Round icon
        img_round = create_badge(s, round_shape=True)
        img_round.save(os.path.join(target_dir, 'ic_launcher_round.png'), format='PNG')
        # Foreground
        img_round.save(os.path.join(target_dir, 'ic_launcher_foreground.png'), format='PNG')
        print(f"Generated Android icons for {folder} ({s}x{s})")

# 2. iOS AppIcon (1024x1024)
ios_icon_path = 'ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png'
if os.path.exists(os.path.dirname(ios_icon_path)):
    ios_icon = create_badge(1024, round_shape=False)
    # iOS App Store icon requires no alpha transparency
    ios_bg = Image.new('RGB', (1024, 1024), (253, 242, 248))
    ios_bg.paste(ios_icon, (0, 0), ios_icon)
    ios_bg.save(ios_icon_path, format='PNG')
    print("Generated iOS AppIcon (1024x1024)")

print("All app icons successfully generated!")
