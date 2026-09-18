import os
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter, median_filter

output_dir = '/Users/swum/Desktop/Projects/EngineeringCLubWebsite/public/landing'
os.makedirs(output_dir, exist_ok=True)

img_path = '/Users/swum/.gemini/antigravity/brain/62da8f74-50fa-4341-8347-84fdf60cb9a4/.user_uploaded/media_1789698352712.png'
base_img = Image.open(img_path).convert('RGB')
W_orig, H_orig = base_img.size

# Upscale 3x to 1920x1437 with high quality Lanczos
SCALE = 3
W = W_orig * SCALE
H = H_orig * SCALE
img = base_img.resize((W, H), Image.Resampling.LANCZOS)
arr = np.array(img, dtype=float)

# -------------------------------------------------------------
# 1. Clean Watermark from Foreground Field
# -------------------------------------------------------------
y1, y2 = int(435 * SCALE), int(466 * SCALE)
x1, x2 = int(285 * SCALE), int(355 * SCALE)
H_box = y2 - y1
W_box = x2 - x1

clean_donor = arr[y1:y2, int(360 * SCALE):int(360 * SCALE) + W_box, :].copy()
for c in range(3):
    orig_band = arr[y1:y2, :, c]
    col_profile = np.mean(orig_band, axis=0)
    target_mean = np.mean(col_profile[x1:x2])
    src_mean = np.mean(col_profile[int(360 * SCALE):int(360 * SCALE) + W_box])
    clean_donor[:, :, c] = np.clip(clean_donor[:, :, c] + (target_mean - src_mean), 0, 255)

mask = np.ones((H_box, W_box), dtype=float)
feather = 18
for y in range(H_box):
    for x in range(W_box):
        dist = min(y, H_box - 1 - y, x, W_box - 1 - x)
        if dist < feather:
            mask[y, x] = dist / float(feather)

for c in range(3):
    arr[y1:y2, x1:x2, c] = arr[y1:y2, x1:x2, c] * (1.0 - mask) + clean_donor[:, :, c] * mask

print("Watermark removed cleanly.")

# -------------------------------------------------------------
# 2. Extract Precise Ridges and Boundaries
# -------------------------------------------------------------
# Skyline
skyline = np.zeros(W, dtype=float)
for x in range(W):
    x_orig = x / SCALE
    col = arr[:, x, :]
    r, g, b = col[:, 0], col[:, 1], col[:, 2]
    lum = 0.299 * r + 0.587 * g + 0.114 * b
    
    if x_orig < 380:
        candidates = []
        for y in range(int(150 * SCALE), int(250 * SCALE)):
            if lum[y] < 135 and r[y] < 145 and (r[y] < g[y] + 20 or g[y] < 90):
                candidates.append(y)
        skyline[x] = candidates[0] if candidates else int(195 * SCALE)
    else:
        candidates = []
        for y in range(int(195 * SCALE), int(275 * SCALE)):
            if (r[y] - b[y] < 12) and lum[y] < 185:
                candidates.append(y)
        skyline[x] = candidates[0] if candidates else int(220 * SCALE)

skyline = median_filter(skyline, size=9)
skyline = gaussian_filter(skyline, sigma=1.2)

# Mid-ridge in front of Longs Peak
mid_right_crest = np.zeros(W, dtype=float)
for x in range(W):
    x_orig = x / SCALE
    if x_orig < 380:
        mid_right_crest[x] = skyline[x]
    else:
        col = arr[:, x, :]
        lum = 0.299 * col[:, 0] + 0.587 * col[:, 1] + 0.114 * col[:, 2]
        crest_y = int(275 * SCALE)
        for y in range(int(235 * SCALE), int(315 * SCALE)):
            if lum[y] < 88 and lum[y+9] < 80:
                crest_y = y
                break
        mid_right_crest[x] = crest_y

mid_right_crest = median_filter(mid_right_crest, size=15)
mid_right_crest = gaussian_filter(mid_right_crest, sigma=2.5)

# Foreground treeline boundary:
fore_crest = np.zeros(W, dtype=float)
for x in range(W):
    col = arr[:, x, :]
    r, g, b = col[:, 0], col[:, 1], col[:, 2]
    best_y = int(414 * SCALE)
    for y in range(int(408 * SCALE), int(424 * SCALE)):
        if r[y] > 100 and g[y] > 85 and (r[y] > b[y] + 12):
            best_y = y
            break
    fore_crest[x] = best_y

fore_crest = median_filter(fore_crest, size=21)
fore_crest = gaussian_filter(fore_crest, sigma=4.0)

# -------------------------------------------------------------
# 3. Layer 0: Sky & Clouds (Real sky untouched, extrapolated ONLY below crest)
# -------------------------------------------------------------
sky_arr = arr.copy()
for x in range(W):
    sy = int(skyline[x])
    # Take sample from genuine sky right above the mountain crest (sy - 20 .. sy - 5)
    ref_col = arr[max(0, sy - 20):max(1, sy - 4), x, :]
    horizon_glow = np.mean(ref_col, axis=0)
    # Extrapolate downward ONLY starting below the crest sy
    for y in range(sy, H):
        depth = min(1.0, (y - sy) / 300.0)
        # Smoothly warm up toward sunset peach horizon
        sky_arr[y, x, :] = horizon_glow * (1.0 - 0.1 * depth) + np.array([245.0, 195.0, 180.0]) * (0.1 * depth)

# Mild horizontal filter applied strictly to the occluded region (below minimum skyline)
min_sy = int(np.min(skyline))
occluded_sky = sky_arr[min_sy + 20:, :, :]
sky_arr[min_sy + 20:, :, :] = gaussian_filter(occluded_sky, sigma=[1.0, 10.0, 0])

sky_img = Image.fromarray(np.clip(sky_arr, 0, 255).astype(np.uint8))
sky_path = os.path.join(output_dir, 'sky.webp')
sky_img.save(sky_path, quality=90)
print(f"Layer 0 saved: {sky_path} ({os.path.getsize(sky_path)/1024:.1f} KB)")

# -------------------------------------------------------------
# 4. Layer 1: Longs Peak & Distant Range
# -------------------------------------------------------------
longs_arr = np.zeros((H, W, 4), dtype=np.uint8)
start_x = int(360 * SCALE)
for x in range(start_x, W):
    fade_x = min(1.0, (x - start_x) / float(30 * SCALE))
    sy = skyline[x]
    my = mid_right_crest[x] + 90
    for y in range(max(0, int(sy - 3)), min(H, int(my + 20))):
        alpha = 1.0
        if y < sy:
            alpha = max(0.0, 1.0 - (sy - y) / 2.2)
        elif y > my:
            alpha = max(0.0, 1.0 - (y - my) / 15.0)
        total_alpha = int(alpha * fade_x * 255)
        if total_alpha > 0:
            if y <= int(mid_right_crest[x]):
                color = arr[y, x, :]
            else:
                d = min(1.0, (y - mid_right_crest[x]) / 90.0)
                color = arr[int(mid_right_crest[x]), x, :] * (1.0 - 0.4 * d)
            longs_arr[y, x, :3] = np.clip(color, 0, 255).astype(np.uint8)
            longs_arr[y, x, 3] = total_alpha

longs_img = Image.fromarray(longs_arr, mode='RGBA')
longs_path = os.path.join(output_dir, 'longs_peak.webp')
longs_img.save(longs_path, quality=90)
print(f"Layer 1 saved: {longs_path} ({os.path.getsize(longs_path)/1024:.1f} KB)")

# -------------------------------------------------------------
# 5. Layer 2: Flatirons & Midground Ridge
# -------------------------------------------------------------
flat_arr = np.zeros((H, W, 4), dtype=np.uint8)
for x in range(W):
    top_y = skyline[x] if x < int(380 * SCALE) else mid_right_crest[x]
    for y in range(max(0, int(top_y - 3)), H):
        alpha = 1.0
        if y < top_y:
            alpha = max(0.0, 1.0 - (top_y - y) / 2.2)
        total_alpha = int(alpha * 255)
        if total_alpha > 0:
            flat_arr[y, x, :3] = np.clip(arr[y, x, :], 0, 255).astype(np.uint8)
            flat_arr[y, x, 3] = total_alpha

flat_img = Image.fromarray(flat_arr, mode='RGBA')
flat_path = os.path.join(output_dir, 'flatirons.webp')
flat_img.save(flat_path, quality=90)
print(f"Layer 2 saved: {flat_path} ({os.path.getsize(flat_path)/1024:.1f} KB)")

# -------------------------------------------------------------
# 6. Layer 3: Foreground Plains & Road
# -------------------------------------------------------------
fore_arr = np.zeros((H, W, 4), dtype=np.uint8)
for x in range(W):
    top_y = fore_crest[x]
    for y in range(max(0, int(top_y - 4)), H):
        alpha = 1.0
        if y < top_y:
            alpha = max(0.0, 1.0 - (top_y - y) / 3.0)
        total_alpha = int(alpha * 255)
        if total_alpha > 0:
            fore_arr[y, x, :3] = np.clip(arr[y, x, :], 0, 255).astype(np.uint8)
            fore_arr[y, x, 3] = total_alpha

fore_img = Image.fromarray(fore_arr, mode='RGBA')
fore_path = os.path.join(output_dir, 'foreground.webp')
fore_img.save(fore_path, quality=90)
print(f"Layer 3 saved: {fore_path} ({os.path.getsize(fore_path)/1024:.1f} KB)")

print("Perfected production layers generated successfully!")
