import os
import math
from PIL import Image, ImageFilter

logos_dir = r"C:\Users\mathi\OneDrive\Escritorio\suertu2s\logos afiliados"
out_dir = r"C:\Users\mathi\OneDrive\Escritorio\suertu2s\v2\public\images\sponsors"

os.makedirs(out_dir, exist_ok=True)

def smooth_alpha_edge(img, is_dark_bg=True, threshold=40, transition=25):
    """
    Aplica Anti-Aliasing (suavizado de bordes por canal Alfa) 
    para eliminar los bordes dentados y la pixelación de compresión.
    """
    # Escalar a 4x para supersampling subpixel
    w, h = img.size
    img = img.resize((w * 3, h * 3), Image.LANCZOS)
    w3, h3 = img.size
    
    datas = list(img.getdata())
    new_data = []
    
    for r, g, b, a in datas:
        brightness = (r + g + b) / 3.0
        
        if is_dark_bg:
            # Si es fondo oscuro
            if brightness < threshold:
                alpha = 0
            elif brightness < threshold + transition:
                alpha = int(((brightness - threshold) / transition) * 255)
            else:
                alpha = 255
        else:
            # Si es fondo claro
            if brightness > (255 - threshold):
                alpha = 0
            elif brightness > (255 - threshold - transition):
                alpha = int((((255 - threshold) - brightness) / transition) * 255)
            else:
                alpha = 255
                
        # Mantener los colores originales pero con bordes suaves de transparencia
        if alpha == 0:
            new_data.append((0, 0, 0, 0))
        else:
            new_data.append((r, g, b, alpha))
            
    img.putdata(new_data)
    
    # Recortar bordes vacíos
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    # Re-dimensionar a 2x Retina con suavizado Lanczos para bordes ultra-nítidos
    final_w = max(1, img.width // 2)
    final_h = max(1, img.height // 2)
    img_hd = img.resize((final_w, final_h), Image.LANCZOS)
    return img_hd

# 1. Overdrive HD
def process_overdrive_hd():
    file = os.path.join(logos_dir, "WhatsApp Image 2026-08-17 at 10.23.07 PM.jpeg")
    img = Image.open(file).convert("RGBA")
    img_hd = smooth_alpha_edge(img, is_dark_bg=True, threshold=45, transition=30)
    out_path = os.path.join(out_dir, "overdrive.webp")
    img_hd.save(out_path, "WEBP", quality=100)
    print("Overdrive HD generado con Anti-Aliasing")

# 2. Salgado HD (Usando la imagen fuente original recortada con precisión)
def process_salgado_hd():
    file = os.path.join(logos_dir, "WhatsApp Image 2026-08-17 at 10.24.36 PM (1).jpeg")
    img = Image.open(file).convert("RGBA")
    w, h = img.size
    
    # Recortar solo el área del escudo superior (omitiendo la píldora azul inferior)
    img_upper = img.crop((0, 0, w, int(h * 0.72)))
    img_hd = smooth_alpha_edge(img_upper, is_dark_bg=True, threshold=60, transition=40)
    out_path = os.path.join(out_dir, "salgado.webp")
    img_hd.save(out_path, "WEBP", quality=100)
    print("Salgado HD generado con Anti-Aliasing")

# 3. RG Motors HD
def process_rg_motors_hd():
    file = os.path.join(logos_dir, "WhatsApp Image 2026-08-17 at 10.24.36 PM.jpeg")
    img = Image.open(file).convert("RGBA")
    img_hd = smooth_alpha_edge(img, is_dark_bg=True, threshold=40, transition=25)
    out_path = os.path.join(out_dir, "rg-motors.webp")
    img_hd.save(out_path, "WEBP", quality=100)
    print("RG Motors HD generado con Anti-Aliasing")

# 4. Unidades Chile HD
def process_unidades_chile_hd():
    file = os.path.join(logos_dir, "WhatsApp Image 2026-08-17 at 10.25.02 PM.jpeg")
    img = Image.open(file).convert("RGBA")
    img_hd = smooth_alpha_edge(img, is_dark_bg=True, threshold=45, transition=30)
    out_path = os.path.join(out_dir, "unidades-chile.webp")
    img_hd.save(out_path, "WEBP", quality=100)
    print("Unidades Chile HD generado con Anti-Aliasing")

# 5. Dtodo HD
def process_dtodo_hd():
    file = os.path.join(logos_dir, "WhatsApp Image 2026-08-17 at 10.26.29 PM.jpeg")
    img = Image.open(file).convert("RGBA")
    img_hd = smooth_alpha_edge(img, is_dark_bg=False, threshold=30, transition=20)
    out_path = os.path.join(out_dir, "dtodo.webp")
    img_hd.save(out_path, "WEBP", quality=100)
    print("Dtodo HD generado con Anti-Aliasing")

if __name__ == "__main__":
    process_overdrive_hd()
    process_salgado_hd()
    process_rg_motors_hd()
    process_unidades_chile_hd()
    process_dtodo_hd()
    print("¡Logos optimizados a resolución HD 2x Retina con Anti-Aliasing por canal Alfa!")
