import os
from PIL import Image

logos_dir = r"C:\Users\mathi\OneDrive\Escritorio\suertu2s\logos afiliados"
out_dir = r"C:\Users\mathi\OneDrive\Escritorio\suertu2s\v2\public\images\sponsors"

os.makedirs(out_dir, exist_ok=True)

# 1. Overdrive: Extracción HD limpia sin NINGÚN fondo gris/negro
def fix_overdrive_perfect():
    file = os.path.join(logos_dir, "WhatsApp Image 2026-08-17 at 10.23.07 PM.jpeg")
    img = Image.open(file).convert("RGBA")
    w, h = img.size
    datas = list(img.getdata())
    new_data = []
    
    for r, g, b, a in datas:
        brightness = (r + g + b) / 3.0
        is_gold = r > 110 and g > 75 and (r - b > 25)
        is_white = brightness > 110
        
        if is_gold or is_white:
            # Píxel de logo/texto: mantener color o hacer texto blanco puro
            if is_gold:
                new_data.append((r, g, b, 255))
            else:
                new_data.append((255, 255, 255, 255))
        else:
            # Fondo gris/negro exterior -> 100% transparente
            new_data.append((0, 0, 0, 0))
            
    img.putdata(new_data)
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    out_path = os.path.join(out_dir, "overdrive.webp")
    img.save(out_path, "WEBP", quality=100)
    print("Overdrive perfecto: solo emblema dorado y letras blancas transparentes")

# 2. Salgado: Extracción HD limpia del escudo y texto blanco (sin esquinas azules)
def fix_salgado_perfect():
    file = os.path.join(logos_dir, "WhatsApp Image 2026-08-17 at 10.24.36 PM (1).jpeg")
    img = Image.open(file).convert("RGBA")
    w, h = img.size
    
    # Recortar estrictamente la zona del escudo superior
    img_crop = img.crop((0, 0, w, int(h * 0.72)))
    datas = list(img_crop.getdata())
    new_data = []
    
    for r, g, b, a in datas:
        brightness = (r + g + b) / 3.0
        # Píxeles blancos del escudo y texto "SALGADO AUTOMOTRIZ"
        if brightness > 120 and r > 100 and g > 110 and b > 110:
            new_data.append((255, 255, 255, 255))
        else:
            # Fondo azul a 100% transparente
            new_data.append((0, 0, 0, 0))
            
    img_crop.putdata(new_data)
    bbox = img_crop.getbbox()
    if bbox:
        img_crop = img_crop.crop(bbox)
        
    out_path = os.path.join(out_dir, "salgado.webp")
    img_crop.save(out_path, "WEBP", quality=100)
    print("Salgado perfecto: escudo y texto blanco puro con fondo transparente")

if __name__ == "__main__":
    fix_overdrive_perfect()
    fix_salgado_perfect()
