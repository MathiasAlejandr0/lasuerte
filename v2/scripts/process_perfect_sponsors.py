import os
import math
from PIL import Image, ImageFilter, ImageEnhance
import pypdfium2 as pdfium

logos_dir = r"C:\Users\mathi\OneDrive\Escritorio\suertu2s\logos afiliados"
out_dir = r"C:\Users\mathi\OneDrive\Escritorio\suertu2s\v2\public\images\sponsors"

os.makedirs(out_dir, exist_ok=True)

def add_white_stroke(img, stroke_width=2, stroke_color=(255, 255, 255, 230)):
    """Añade un delineado blanco nítido (stroke 3D) alrededor del contorno del logo."""
    alpha = img.split()[3]
    # Dilatar el canal alpha para crear el borde
    dilated_alpha = alpha.filter(ImageFilter.MaxFilter(stroke_width * 2 + 1))
    
    # Crear imagen con el color de borde
    stroke_bg = Image.new("RGBA", img.size, stroke_color)
    stroke_mask = Image.new("RGBA", img.size, (0, 0, 0, 0))
    stroke_mask.paste(stroke_bg, (0, 0), dilated_alpha)
    
    # Combinar el borde por debajo de la imagen original
    final_img = Image.alpha_composite(stroke_mask, img)
    return final_img

# 1. Mechanicars
def process_mechanicars():
    pdf_path = os.path.join(logos_dir, "LOGO MECHANICARS.pdf")
    pdf = pdfium.PdfDocument(pdf_path)
    page = pdf[0]
    img = page.render(scale=4).to_pil().convert("RGBA")
    
    datas = img.getdata()
    new_data = []
    for r, g, b, a in datas:
        # Fondo blanco a transparente
        if r > 235 and g > 235 and b > 235:
            new_data.append((0, 0, 0, 0))
        # Convertir texto "MECHANICARS" (azul oscuro) y V inferior a blanco brillante para máximo contraste en fondo oscuro
        elif b > 100 and r < 80 and g < 100:
            new_data.append((255, 255, 255, 255))
        # Mantener autos y escudo en rojo vivo con transparencia limpia
        else:
            new_data.append((r, g, b, 255))
            
    img.putdata(new_data)
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    # Añadir delineado blanco nítido
    img = add_white_stroke(img, stroke_width=2)
    img.save(os.path.join(out_dir, "mechanicars.webp"), "WEBP", quality=98)
    print("Mechanicars listo con delineado blanco y texto brillante")

# 2. El Nuevo Stylo Barbería
def process_barberia():
    img_path = os.path.join(logos_dir, "barberianuevostylo.jpeg")
    img = Image.open(img_path).convert("RGBA")
    w, h = img.size
    cx, cy = w / 2.0, h / 2.0
    radius = min(w, h) * 0.415
    
    datas = img.getdata()
    new_data = []
    for y in range(h):
        for x in range(w):
            i = y * w + x
            r, g, b, a = datas[i]
            dist = math.sqrt((x - cx) ** 2 + (y - cy) ** 2)
            if dist > radius:
                new_data.append((0, 0, 0, 0))
            else:
                # Anillo exterior blanco limpio
                if dist > radius - 18 and (r > 160 or g > 160 or b > 160):
                    new_data.append((255, 255, 255, 255))
                else:
                    new_data.append((r, g, b, 255))
                    
    img.putdata(new_data)
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    img = add_white_stroke(img, stroke_width=3)
    img.save(os.path.join(out_dir, "barberianuevostylo.webp"), "WEBP", quality=98)
    print("Barbería listo con delineado blanco")

# 3. Overdrive
def process_overdrive():
    file = os.path.join(logos_dir, "WhatsApp Image 2026-08-17 at 10.23.07 PM.jpeg")
    img = Image.open(file).convert("RGBA")
    datas = img.getdata()
    new_data = []
    for r, g, b, a in datas:
        brightness = (r + g + b) / 3
        # Fondo oscuro a transparente
        if brightness < 60 and not (r > 100 and g > 60 and b < 50):
            new_data.append((0, 0, 0, 0))
        else:
            # Hacer textos de subtítulos blancos brillantes
            if brightness > 90:
                new_data.append((255, 255, 255, 255))
            else:
                new_data.append((r, g, b, 255))
                
    img.putdata(new_data)
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    img = add_white_stroke(img, stroke_width=2)
    img.save(os.path.join(out_dir, "overdrive.webp"), "WEBP", quality=98)
    print("Overdrive listo con delineado blanco")

# 4. Salgado Automotriz
def process_salgado():
    file = os.path.join(logos_dir, "WhatsApp Image 2026-08-17 at 10.24.36 PM (1).jpeg")
    img = Image.open(file).convert("RGBA")
    datas = img.getdata()
    new_data = []
    for r, g, b, a in datas:
        brightness = (r + g + b) / 3
        if brightness < 80:
            new_data.append((0, 0, 0, 0))
        else:
            new_data.append((255, 255, 255, 255))
            
    img.putdata(new_data)
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    img = add_white_stroke(img, stroke_width=2)
    img.save(os.path.join(out_dir, "salgado.webp"), "WEBP", quality=98)
    print("Salgado listo con delineado blanco")

# 5. RG Motors
def process_rg_motors():
    file = os.path.join(logos_dir, "WhatsApp Image 2026-08-17 at 10.24.36 PM.jpeg")
    img = Image.open(file).convert("RGBA")
    datas = img.getdata()
    new_data = []
    for r, g, b, a in datas:
        brightness = (r + g + b) / 3
        is_red = r > 140 and g < 60 and b < 60
        is_blue = b > 120 and r < 60
        if brightness < 40 and not (is_red or is_blue):
            new_data.append((0, 0, 0, 0))
        elif brightness > 100 and not (is_red or is_blue):
            new_data.append((255, 255, 255, 255))
        else:
            new_data.append((r, g, b, 255))
            
    img.putdata(new_data)
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    img = add_white_stroke(img, stroke_width=2)
    img.save(os.path.join(out_dir, "rg-motors.webp"), "WEBP", quality=98)
    print("RG Motors listo con delineado blanco")

# 6. Unidades Chile
def process_unidades_chile():
    file = os.path.join(logos_dir, "WhatsApp Image 2026-08-17 at 10.25.02 PM.jpeg")
    img = Image.open(file).convert("RGBA")
    datas = img.getdata()
    new_data = []
    for r, g, b, a in datas:
        brightness = (r + g + b) / 3
        is_red = r > 120 and g < 60 and b < 60
        if brightness < 50 and not is_red:
            new_data.append((0, 0, 0, 0))
        elif brightness > 110:
            new_data.append((255, 255, 255, 255))
        else:
            new_data.append((r, g, b, 255))
            
    img.putdata(new_data)
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    img = add_white_stroke(img, stroke_width=2)
    img.save(os.path.join(out_dir, "unidades-chile.webp"), "WEBP", quality=98)
    print("Unidades Chile listo con delineado blanco")

# 7. Frío Austral
def process_frio_austral():
    file = os.path.join(logos_dir, "WhatsApp Image 2026-08-17 at 10.25.53 PM.jpeg")
    img = Image.open(file).convert("RGBA")
    w, h = img.size
    cx, cy = w / 2.0, h / 2.0
    radius = min(w, h) * 0.485
    
    datas = img.getdata()
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
        
    img = add_white_stroke(img, stroke_width=3)
    img.save(os.path.join(out_dir, "frio-austral.webp"), "WEBP", quality=98)
    print("Frío Austral listo con delineado blanco")

# 8. Dtodo
def process_dtodo():
    file = os.path.join(logos_dir, "WhatsApp Image 2026-08-17 at 10.26.29 PM.jpeg")
    img = Image.open(file).convert("RGBA")
    datas = img.getdata()
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
        
    img = add_white_stroke(img, stroke_width=2)
    img.save(os.path.join(out_dir, "dtodo.webp"), "WEBP", quality=98)
    print("Dtodo listo con delineado blanco")

# 9. Godplay
def process_godplay():
    file = os.path.join(logos_dir, "WhatsApp Image 2026-08-17 at 10.28.52 PM.jpeg")
    img = Image.open(file).convert("RGBA")
    w, h = img.size
    cx, cy = w / 2.0, h / 2.0
    radius = min(w, h) * 0.485
    
    datas = img.getdata()
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
        
    img = add_white_stroke(img, stroke_width=3)
    img.save(os.path.join(out_dir, "godplay.webp"), "WEBP", quality=98)
    print("Godplay listo con delineado blanco")

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
    print("Todos los 9 logos procesados perfectamente con delineado blanco nítido 3D!")
