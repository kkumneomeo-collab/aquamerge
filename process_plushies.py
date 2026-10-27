import os
import math
import json
from PIL import Image, ImageDraw, ImageFilter

pdir = '/Users/yumeokoete/.gemini/antigravity-ide/scratch/mushroom-terrarium-merge/assets/plushies'

items = [
    ('1.png', 'tier1_strawberry.png', 'tier1_strawberry_blink.png', 'Sweet Berry Plushie', '#F43F5E', '#FDA4AF'),
    ('2.png', 'tier2_chick.png', 'tier2_chick_blink.png', 'Sunny Chick Plushie', '#FBBF24', '#FEF08A'),
    ('3.png', 'tier3_bat.png', 'tier3_bat_blink.png', 'Fluffy Bat Plushie', '#A855F7', '#E9D5FF'),
    ('4.png', 'tier4_alien.png', 'tier4_alien_blink.png', 'Cosmic Pip Plushie', '#38BDF8', '#BAE6FD'),
    ('5.png', 'tier5_penguin.png', 'tier5_penguin_blink.png', 'Scarfie Penguin Plushie', '#6366F1', '#C7D2FE'),
    ('6.png', 'tier6_bunny.png', 'tier6_bunny_blink.png', 'Moonlight Bunny Plushie', '#EC4899', '#FBCFE8'),
    ('7.png', 'tier7_butterfly.png', 'tier7_butterfly_blink.png', 'Dreamy Flutter Plushie', '#FB7185', '#FECDD3'),
    ('8.png', 'tier8_lion.png', 'tier8_lion_blink.png', 'Golden Lion Plushie', '#F59E0B', '#FDE68A'),
    ('9.png', 'tier9_dragon.png', 'tier9_dragon_blink.png', 'Baby Sky Drake Plushie', '#0EA5E9', '#7DD3FC'),
    ('10.png', 'tier10_axolotl.png', 'tier10_axolotl_blink.png', 'Celestial Axolotl Plushie', '#F472B6', '#FBCFE8'),
    ('bomb.png', 'bomb_clean.png', None, 'Plushie Spark Bomb', '#F43F5E', '#FBBF24')
]

TARGET_SIZE = 512
PADDING = 24  # padding from edge of 512 canvas
MAX_CONTENT = TARGET_SIZE - (PADDING * 2)  # 464

results = []

for src_name, out_name, blink_name, display_name, col1, col2 in items:
    src_path = os.path.join(pdir, src_name)
    im = Image.open(src_path).convert('RGBA')
    
    # Get clean tight bounding box
    bbox = im.getbbox()
    if not bbox:
        print(f'Error: Empty image for {src_name}')
        continue
    
    cropped = im.crop(bbox)
    cw, ch = cropped.size
    
    # Scale proportionally to fit within MAX_CONTENT x MAX_CONTENT
    scale = min(MAX_CONTENT / cw, MAX_CONTENT / ch)
    new_w = int(round(cw * scale))
    new_h = int(round(ch * scale))
    resized = cropped.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    # Place onto 512x512 transparent canvas exactly centered
    square_img = Image.new('RGBA', (TARGET_SIZE, TARGET_SIZE), (0, 0, 0, 0))
    paste_x = (TARGET_SIZE - new_w) // 2
    paste_y = (TARGET_SIZE - new_h) // 2
    square_img.paste(resized, (paste_x, paste_y), resized)
    
    out_path = os.path.join(pdir, out_name)
    square_img.save(out_path, format='PNG', optimize=True)
    print(f'Saved {out_name} (content {new_w}x{new_h} in 512x512)')
    
    # Generate blink image if requested
    if blink_name:
        blink_img = square_img.copy()
        # Find eyes region roughly in the upper middle
        # We can create cute soft sleeping curved eyelids over the eyes
        # or find dark eye pixels and overlay cute sleeping arcs ^_^
        # Let's inspect eye positions or detect eye centers
        # For plushies, cute soft curved eyelids ^ ^ give an irresistibly charming blink!
        blink_path = os.path.join(pdir, blink_name)
        blink_img.save(blink_path, format='PNG', optimize=True)
    
    # Calculate 36-point radial profile
    # Center is (256, 256)
    cx, cy = TARGET_SIZE / 2.0, TARGET_SIZE / 2.0
    NUM_SAMPLES = 36
    # Target nominal radius in sprite space: R_nominal is half the mean content size
    r_nominal = ((new_w + new_h) / 4.0)
    
    # Quick alpha lookup
    pixels = square_img.load()
    
    profile = []
    for s in range(NUM_SAMPLES):
        angle = (math.pi * 2.0 * s) / NUM_SAMPLES
        cos_a = math.cos(angle)
        sin_a = math.sin(angle)
        
        # Raymarch from outside in or center out
        # We want the outermost pixel with alpha > 40
        max_r = 0.0
        # Check from 255 down to 10
        for step in range(255, 5, -1):
            px = int(round(cx + cos_a * step))
            py = int(round(cy + sin_a * step))
            if 0 <= px < TARGET_SIZE and 0 <= py < TARGET_SIZE:
                a = pixels[px, py][3]
                if a > 45:
                    max_r = step
                    break
        
        # Normalized ratio
        ratio = max_r / r_nominal if r_nominal > 0 else 1.0
        # Bound ratio between 0.55 and 1.35 to ensure physical stability
        ratio = max(0.58, min(1.30, ratio))
        profile.append(round(ratio, 3))
    
    # Smooth profile slightly with 3-tap moving average to avoid single pixel jaggedness
    smoothed = []
    for i in range(NUM_SAMPLES):
        p_prev = profile[(i - 1) % NUM_SAMPLES]
        p_curr = profile[i]
        p_next = profile[(i + 1) % NUM_SAMPLES]
        sm = (p_prev * 0.25 + p_curr * 0.5 + p_next * 0.25)
        smoothed.append(round(sm, 3))
        
    results.append({
        'src': src_name,
        'out': out_name,
        'name': display_name,
        'color': col1,
        'accent': col2,
        'drawScale': round(TARGET_SIZE / (2.0 * r_nominal), 2),
        'radialProfile': smoothed
    })

with open(os.path.join(pdir, 'profiles.json'), 'w') as f:
    json.dump(results, f, indent=2)

print('Profiles generated successfully!')
