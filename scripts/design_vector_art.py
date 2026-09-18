# Script to generate rich organic vector clouds and layered 3D mountain ridges

def generate_cumulus_cloud(cx, cy, scale=1.0):
    # Organic billowy cloud path
    # Multi-arc cumulus cloud with flat shaded bottom
    return (
        f"M{cx - 140*scale},{cy + 15*scale} "
        f"C{cx - 150*scale},{cy - 10*scale} {cx - 110*scale},{cy - 40*scale} {cx - 70*scale},{cy - 30*scale} "
        f"C{cx - 50*scale},{cy - 65*scale} {cx + 20*scale},{cy - 70*scale} {cx + 50*scale},{cy - 35*scale} "
        f"C{cx + 90*scale},{cy - 45*scale} {cx + 140*scale},{cy - 15*scale} {cx + 140*scale},{cy + 15*scale} "
        f"C{cx + 140*scale},{cy + 25*scale} {cx - 140*scale},{cy + 25*scale} {cx - 140*scale},{cy + 15*scale} Z"
    )

def generate_cirrus_streak(x1, y1, w, h):
    # Sleek wind-swept wispy cirrus cloud band
    x2 = x1 + w
    return (
        f"M{x1},{y1} "
        f"C{x1 + w*0.3},{y1 - h} {x1 + w*0.7},{y1 - h*0.8} {x2},{y1} "
        f"C{x1 + w*0.7},{y1 + h*0.6} {x1 + w*0.3},{y1 + h*0.5} {x1},{y1} Z"
    )

print("Cumulus sample:", generate_cumulus_cloud(200, 150, 0.8))
print("Cirrus sample:", generate_cirrus_streak(50, 100, 400, 12))
