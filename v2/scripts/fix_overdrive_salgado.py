import os
from PIL import Image

logos_dir = r"C:\Users\mathi\OneDrive\Escritorio\suertu2s\logos afiliados"
out_dir = r"C:\Users\mathi\OneDrive\Escritorio\suertu2s\v2\public\images\sponsors"

os.makedirs(out_dir, exist_ok=True)

# 1. Overdrive: eliminar completamente el fondo negro/gris plano alrededor
def fix_overdrive():
    file = os.path.join(logos_dir, "WhatsApp Image 2026-08-17 at 10.23.07 PM.jpeg")
    img = Image.open(file).convert("RGBA")
    datas = list(img.getdata())
    new_data = []
    
    for r, g, b, a in datas:
        # Píxel del logo dorado/amarillo o texto blanco/plateado
        is_gold = r > 110 and g > 75 and (r - b > 30)
        is_white_text = r > 120 and g > 120 and b > 120
        
        if is_gold or is_white_text:
            new_data.append((r, g, b, 255))
        else:
            # Fondo gris/negro a 100% transparente
            new_data.append((0, 0, 0, 0))
            
    img.putdata(new_data)
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    out_path = os.path.join(out_dir, "overdrive.webp")
    img.save(out_path, "WEBP", quality=98)
    print("Overdrive ajustado: fondo totalmente removido, solo logo y letras")

# 2. Salgado: extraer únicamente el escudo blanco y texto blanco (sin píldora ni fondo azul)
def fix_salgado():
    file = os.path.join(logos_dir, "WhatsApp Image 2026-08-17 at 10.24.36 PM (1).jpeg")
    img = Image.open(file).convert("RGBA")
    w, h = img.size
    datas = list(img.getdata())
    new_data = []
    
    for y in range(h):
        for x in range(w):
            i = y * w + x
            r, g, b, a = datas[i]
            brightness = (r + g + b) / 3
            
            # Solo la parte superior del escudo y el texto blanco "SALGADO AUTOMOTRIZ"
            is_white_graphic = brightness > 125 and r > 100 and g > 110 and b > 110 and y < h * 0.73
            
            if is_white_graphic:
                new_data.append((255, 255, 255, 255))
            else:
                new_data.append((0, 0, 0, 0))
                
    img.putdata(new_data)
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    out_path = os.path.join(out_dir, "salgado.webp")
    img.save(out_path, "WEBP", quality=98)
    print("Salgado ajustado: escudo y texto blanco impecables")

if __name__ == "__main__":
    fix_overdrive()
    fix_salgado()
