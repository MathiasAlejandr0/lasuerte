import os
import math
from PIL import Image, ImageEnhance
import pypdfium2 as pdfium

logos_dir = r"C:\Users\mathi\OneDrive\Escritorio\suertu2s\logos afiliados"
out_dir = r"C:\Users\mathi\OneDrive\Escritorio\suertu2s\v2\public\images\sponsors"

os.makedirs(out_dir, exist_ok=True)

# 1. Mechanicars PDF processing
def process_mechanicars():
    pdf_path = os.path.join(logos_dir, "LOGO MECHANICARS.pdf")
    pdf = pdfium.PdfDocument(pdf_path)
    page = pdf[0]
    # Render at 4x scale for crisp ultra-high definition
    image = page.render(scale=4).to_pil().convert("RGBA")
    
    datas = image.getdata()
    new_data = []
    for r, g, b, a in datas:
        # If pixel is white / background
        if r > 240 and g > 240 and b > 240:
            new_data.append((0, 0, 0, 0))
        else:
            new_data.append((r, g, b, 255))
            
    image.putdata(new_data)
    bbox = image.getbbox()
    if bbox:
        image = image.crop(bbox)
        
    out_path = os.path.join(out_dir, "mechanicars.webp")
    image.save(out_path, "WEBP", quality=98)
    print("Mechanicars saved successfully at:", out_path)

# 2. El Nuevo Stylo Barberia processing
def process_barberia():
    img_path = os.path.join(logos_dir, "barberianuevostylo.jpeg")
    image = Image.open(img_path).convert("RGBA")
    width, height = image.size
    
    cx, cy = width / 2.0, height / 2.0
    # Circular emblem radius is ~41% of min dimension
    radius = min(width, height) * 0.415
    
    datas = image.getdata()
    new_data = []
    
    for y in range(height):
        for x in range(width):
            i = y * width + x
            r, g, b, a = datas[i]
            dist = math.sqrt((x - cx) ** 2 + (y - cy) ** 2)
            
            # Outside circular emblem -> transparent
            if dist > radius:
                new_data.append((0, 0, 0, 0))
            else:
                # Enhance white ring contrast
                if dist > radius - 15 and r > 180 and g > 180 and b > 180:
                    new_data.append((255, 255, 255, 255))
                else:
                    new_data.append((r, g, b, 255))
                    
    image.putdata(new_data)
    bbox = image.getbbox()
    if bbox:
        image = image.crop(bbox)
        
    out_path = os.path.join(out_dir, "barberianuevostylo.webp")
    image.save(out_path, "WEBP", quality=98)
    print("Barberia saved successfully at:", out_path)

if __name__ == "__main__":
    process_mechanicars()
    process_barberia()
