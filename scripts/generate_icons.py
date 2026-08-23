#!/usr/bin/env python3
import os
import subprocess
import sys
from PIL import Image

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)

SOURCE_IMAGE = os.path.join(PROJECT_ROOT, "brewi_app_icon_1786428100017.png")
TAURI_ICONS_DIR = os.path.join(PROJECT_ROOT, "src-tauri/icons")
PUBLIC_DIR = os.path.join(PROJECT_ROOT, "public")
SRC_ASSETS_DIR = os.path.join(PROJECT_ROOT, "src/assets")
WEBSITE_ASSETS_DIR = os.path.join(PROJECT_ROOT, "website/assets")

def process_icons():
    if not os.path.exists(SOURCE_IMAGE):
        # Fallback to source icon in assets if root file isn't present
        fallback_source = os.path.join(SRC_ASSETS_DIR, "logo.png")
        if os.path.exists(fallback_source):
            source_file = fallback_source
        else:
            print(f"Error: Source image not found at {SOURCE_IMAGE}")
            sys.exit(1)
    else:
        source_file = SOURCE_IMAGE

    os.makedirs(TAURI_ICONS_DIR, exist_ok=True)
    os.makedirs(PUBLIC_DIR, exist_ok=True)
    os.makedirs(SRC_ASSETS_DIR, exist_ok=True)
    os.makedirs(WEBSITE_ASSETS_DIR, exist_ok=True)

    img = Image.open(source_file).convert("RGBA")
    print(f"Loaded source icon: {img.size}")

    # Standard PNG Icon target sizes
    sizes = {
        "32x32.png": (32, 32),
        "128x128.png": (128, 128),
        "128x128@2x.png": (256, 256),
        "icon.png": (512, 512),
        "Square30x30Logo.png": (30, 30),
        "Square44x44Logo.png": (44, 44),
        "Square71x71Logo.png": (71, 71),
        "Square89x89Logo.png": (89, 89),
        "Square107x107Logo.png": (107, 107),
        "Square142x142Logo.png": (142, 142),
        "Square150x150Logo.png": (150, 150),
        "Square284x284Logo.png": (284, 284),
        "Square310x310Logo.png": (310, 310),
        "StoreLogo.png": (50, 50),
    }

    for filename, (w, h) in sizes.items():
        out_path = os.path.join(TAURI_ICONS_DIR, filename)
        resized = img.resize((w, h), Image.Resampling.LANCZOS)
        resized.save(out_path, "PNG")
        print(f"Generated: {out_path} ({w}x{h})")

    # Copy logo for frontend sidebar, public dir, & marketing website
    app_logo_path = os.path.join(SRC_ASSETS_DIR, "logo.png")
    public_logo_path = os.path.join(PUBLIC_DIR, "logo.png")
    website_logo_path = os.path.join(WEBSITE_ASSETS_DIR, "logo.png")
    favicon_path = os.path.join(PUBLIC_DIR, "favicon.ico")

    img.resize((512, 512), Image.Resampling.LANCZOS).save(app_logo_path, "PNG")
    img.resize((512, 512), Image.Resampling.LANCZOS).save(public_logo_path, "PNG")
    img.resize((512, 512), Image.Resampling.LANCZOS).save(website_logo_path, "PNG")
    img.resize((64, 64), Image.Resampling.LANCZOS).save(favicon_path, "ICO")
    print("Saved frontend & marketing website logo assets.")

    # Generate macOS .icns file using iconutil
    iconset_dir = os.path.join(TAURI_ICONS_DIR, "app.iconset")
    os.makedirs(iconset_dir, exist_ok=True)

    iconset_mapping = [
        ("icon_16x16.png", 16),
        ("icon_16x16@2x.png", 32),
        ("icon_32x32.png", 32),
        ("icon_32x32@2x.png", 64),
        ("icon_128x128.png", 128),
        ("icon_128x128@2x.png", 256),
        ("icon_256x256.png", 256),
        ("icon_256x256@2x.png", 512),
        ("icon_512x512.png", 512),
        ("icon_512x512@2x.png", 1024),
    ]

    for name, s in iconset_mapping:
        p = os.path.join(iconset_dir, name)
        img.resize((s, s), Image.Resampling.LANCZOS).save(p, "PNG")

    icns_path = os.path.join(TAURI_ICONS_DIR, "icon.icns")
    try:
        subprocess.run(["iconutil", "-c", "icns", iconset_dir, "-o", icns_path], check=True)
        print(f"Generated macOS ICNS: {icns_path}")
    except Exception as e:
        print(f"Warning: iconutil failed ({e}). ICNS might be skipped.")

    # Generate Windows .ico
    ico_path = os.path.join(TAURI_ICONS_DIR, "icon.ico")
    img.save(ico_path, format="ICO", sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])
    print(f"Generated Windows ICO: {ico_path}")

    # Cleanup temp iconset
    import shutil
    shutil.rmtree(iconset_dir, ignore_errors=True)

    print("All app icons successfully generated!")

if __name__ == "__main__":
    process_icons()
