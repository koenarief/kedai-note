from PIL import Image

# Path input/output
input_path = "idkasir-favicon.png"
output_path = "pwa-512x512-maskable.png"

# Buka gambar dan konversi ke RGBA
img = Image.open(input_path).convert("RGBA")

# Ukuran target PWA
target_size = 512
inner_size = int(target_size * 0.8)  # 20% padding agar aman untuk maskable area

# Hitung rasio dan ukuran baru
ratio = img.width / img.height
if ratio > 1:
    new_width = inner_size
    new_height = int(inner_size / ratio)
else:
    new_height = inner_size
    new_width = int(inner_size * ratio)

# Resize dan tempel ke background transparan
resized = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
background = Image.new("RGBA", (target_size, target_size), (0, 0, 0, 0))
offset = ((target_size - new_width) // 2, (target_size - new_height) // 2)
background.paste(resized, offset, resized)

# Simpan hasil
background.save(output_path, format="PNG")
print("✅ Maskable icon saved as", output_path)
