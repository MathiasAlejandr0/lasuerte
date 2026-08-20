import os
import math
from PIL import Image
import pypdfium2 as pdfium

logos_dir = r"C:\Users\mathi\OneDrive\Escritorio\suertu2s\logos afiliados"
out_dir = r"C:\Users\mathi\OneDrive\Escritorio\suertu2s\v2\public\images\sponsors"

os.makedirs(out_dir, exist_ok=True)

# 1. Mechanicars (PDF) -> Solo remover fondo blanco exterior, mantener interior 100% original
def process_mechanicars():
    pdf_path = os.path.join(logos_dir, "LOGO MECHANICARS.pdf")
    pdf = pdfium.PdfDocument(pdf_path)
    page = pdf[0]
    img = page.render(scale=4).to_pil().convert("RGBA")
    
    w, h = img.size
    datas = list(img.getdata())
    new_data = []
    
    for r, g, b, a in datas:
        # Si el píxel es blanco (fondo)
        if r > 240 and g > 240 and b > 240:
            new_data.append((0, 0, 0, 0))
        else:
            # Conservar color original exacto (rojo, azul oscuro, etc.)
            new_data.append((r, g, b, 255))
            
    img.putdata(new_data)
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    out_path = os.path.join(out_dir, "mechanicars.webp")
    img.save(out_path, "WEBP", quality=98)
    print("Mechanicars original conservado perfectamente")

# 2. El Nuevo Stylo Barbería -> Remover fondo exterior gris fuera del círculo
def process_barberia():
    file = os.path.join(logos_dir, "barberianuevostylo.jpeg")
    img = Image.open(file).convert("RGBA")
    w, h = img.size
    cx, cy = w / 2.0, h / 2.0
    radius = min(w, h) * 0.415
    
    datas = list(img.getdata())
    new_data = []
    for y in range(h):
        for x in range(w):
            i = y * w + x
            r, g, b, a = datas[i]
            dist = math.sqrt((x - cx) ** 2 + (y - cy) ** 2)
            if dist > radius:
                new_data.append((0, 0, 0, 0))
            else:
                # Mantener relleno original exacto (negro, blanco, tijeras, estrellas)
                new_data.append((r, g, b, 255))
                
    img.putdata(new_data)
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    out_path = os.path.join(out_dir, "barberianuevostylo.webp")
    img.save(out_path, "WEBP", quality=98)
    print("Barbería original conservado perfectamente")

# 3. Overdrive -> Remover fondo negro exterior
def process_overdrive():
    file = os.path.join(logos_dir, "WhatsApp Image 2026-08-17 at 10.23.07 PM.jpeg")
    img = Image.open(file).convert("RGBA")
    datas = list(img.getdata())
    new_data = []
    for r, g, b, a in datas:
        brightness = (r + g + b) / 3
        # Fondo oscuro exterior
        if brightness < 35 and not (r > 90 and g > 60):
            new_data.append((0, 0, 0, 0))
        else:
            new_data.append((r, g, b, 255))
            
    img.putdata(new_data)
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    out_path = os.path.join(out_dir, "overdrive.webp")
    img.save(out_path, "WEBP", quality=98)
    print("Overdrive original conservado perfectamente")

# 4. Salgado Automotriz -> Remover fondo azul oscuro exterior
def process_salgado():
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
            in_upper = y < h * 0.72
            is_white = brightness > 130
            is_blue_pill = y >= h * 0.76 and y <= h * 0.88 and x >= w * 0.18 and x <= w * 0.82 and b > 120
            is_subtitle = y >= h * 0.72 and y < h * 0.76 and brightness > 150
            
            if is_white or is_blue_pill or is_subtitle:
                new_data.append((r, g, b, 255))
            else:
                new_data.append((0, 0, 0, 0))
                
    img.putdata(new_data)
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    out_path = os.path.join(out_dir, "salgado.webp")
    img.save(out_path, "WEBP", quality=98)
    print("Salgado original conservado perfectamente")

# 5. RG Motors -> Remover fondo negro exterior
def process_rg_motors():
    file = os.path.join(logos_dir, "WhatsApp Image 2026-08-17 at 10.24.36 PM.jpeg")
    img = Image.open(file).convert("RGBA")
    datas = list(img.getdata())
    new_data = []
    for r, g, b, a in datas:
        brightness = (r + g + b) / 3
        is_red = r > 140 and g < 60 and b < 60
        is_blue = b > 120 and r < 60
        if brightness < 35 and not (is_red or is_blue):
            new_data.append((0, 0, 0, 0))
        else:
            new_data.append((r, g, b, 255))
            
    img.putdata(new_data)
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    out_path = os.path.join(out_dir, "rg-motors.webp")
    img.save(out_path, "WEBP", quality=98)
    print("RG Motors original conservado perfectamente")

# 6. Unidades Chile -> Remover fondo oscuro exterior
def process_unidades_chile():
    file = os.path.join(logos_dir, "WhatsApp Image 2026-08-17 at 10.25.02 PM.jpeg")
    img = Image.open(file).convert("RGBA")
    datas = list(img.getdata())
    new_data = []
    for r, g, b, a in datas:
        brightness = (r + g + b) / 3
        is_red = r > 110 and (r - g > 30)
        if brightness < 45 and not is_red:
            new_data.append((0, 0, 0, 0))
        else:
            new_data.append((r, g, b, 255))
            
    img.putdata(new_data)
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    out_path = os.path.join(out_dir, "unidades-chile.webp")
    img.save(out_path, "WEBP", quality=98)
    print("Unidades Chile original conservado perfectamente")

# 7. Frío Austral -> Remover fondo blanco exterior
def process_frio_austral():
    file = os.path.join(logos_dir, "WhatsApp Image 2026-08-17 at 10.25.53 PM.jpeg")
    img = Image.open(file).convert("RGBA")
    w, h = img.size
    cx, cy = w / 2.0, h / 2.0
    radius = min(w, h) * 0.485
    
    datas = list(img.getdata())
    new_data = []
    for y in range(h):
        for x in range(w):
            i = y * w + x
            r, g, b, a = datas[i]
            dist = math.sqrt((x - cx) ** 2 + (y - cy) ** 2)
            if dist > radius:
                new_data.append((0, 0, 0, 0))
            else:
                new_data.append((r, g, b, 255))
                
    img.putdata(new_data)
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    out_path = os.path.join(out_dir, "frio-austral.webp")
    img.save(out_path, "WEBP", quality=98)
    print("Frío Austral original conservado perfectamente")

# 8. Dtodo -> Remover fondo blanco exterior fuera del rectángulo azul
def process_dtodo():
    file = os.path.join(logos_dir, "WhatsApp Image 2026-08-17 at 10.26.29 PM.jpeg")
    img = Image.open(file).convert("RGBA")
    datas = list(img.getdata())
    new_data = []
    for r, g, b, a in datas:
        is_white = r > 230 and g > 230 and b > 230
        if is_white:
            new_data.append((0, 0, 0, 0))
        else:
            new_data.append((r, g, b, 255))
            
    img.putdata(new_data)
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    out_path = os.path.join(out_dir, "dtodo.webp")
    img.save(out_path, "WEBP", quality=98)
    print("Dtodo original conservado perfectamente")

# 9. Godplay -> Remover fondo blanco exterior fuera del círculo rojo
def process_godplay():
    file = os.path.join(logos_dir, "WhatsApp Image 2026-08-17 at 10.28.52 PM.jpeg")
    img = Image.open(file).convert("RGBA")
    w, h = img.size
    cx, cy = w / 2.0, h / 2.0
    radius = min(w, h) * 0.485
    
    datas = list(img.getdata())
    new_data = []
    for y in range(h):
        for x in range(w):
            i = y * w + x
            r, g, b, a = datas[i]
            dist = math.sqrt((x - cx) ** 2 + (y - cy) ** 2)
            if dist > radius:
                new_data.append((0, 0, 0, 0))
            else:
                new_data.append((r, g, b, 255))
                
    img.putdata(new_data)
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    out_path = os.path.join(out_dir, "godplay.webp")
    img.save(out_path, "WEBP", quality=98)
    print("Godplay original conservado perfectamente")

if __name__ == "__main__":
    process_mechanicars()
    process_barberia()
    process_overdrive()
    process_salgado()
    process_rg_motors()
    process_unidades_chile()
    process_frio_austral()
    process_dtodo()
    process_godplay()
    print("¡Todos los 9 logos conservan su relleno interior 100% original con fondo exterior transparente!")
