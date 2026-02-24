#!/bin/bash
# Download curated gallery images from Unsplash CDN
# Run: bash scripts/download-gallery.sh

cd "$(dirname "$0")/.."
ROOT=$(pwd)
COVER_DIR="$ROOT/public/gallery/covers"
BG_DIR="$ROOT/public/gallery/backgrounds"
COVER_THUMB="$COVER_DIR/thumb"
BG_THUMB="$BG_DIR/thumb"

mkdir -p "$COVER_DIR" "$COVER_THUMB" "$BG_DIR" "$BG_THUMB"

dl() {
  local url="$1" dest="$2"
  if [ -f "$dest" ]; then
    echo "  SKIP $(basename "$dest")"
    return 0
  fi
  curl -sL -o "$dest" "$url"
  if [ $? -eq 0 ] && [ -s "$dest" ]; then
    echo "  OK   $(basename "$dest") ($(du -k "$dest" | cut -f1)K)"
  else
    echo "  FAIL $(basename "$dest")"
    rm -f "$dest"
    return 1
  fi
}

# Cover photos — full: 1920×1080, thumb: 400×225
cover() {
  local id="$1" tag="$2" num="$3"
  local fname="cover-${tag}-${num}.jpg"
  local base="https://images.unsplash.com/${id}"
  echo "[$tag] $fname"
  dl "${base}?w=1920&h=1080&fit=crop&q=80&auto=format" "$COVER_DIR/$fname"
  dl "${base}?w=400&h=225&fit=crop&q=70&auto=format" "$COVER_THUMB/$fname"
}

# Background photos — full: 1200×1600, thumb: 400×533
bg() {
  local id="$1" tag="$2" num="$3"
  local fname="bg-${tag}-${num}.jpg"
  local base="https://images.unsplash.com/${id}"
  echo "[$tag] $fname"
  dl "${base}?w=1200&h=1600&fit=crop&q=80&auto=format" "$BG_DIR/$fname"
  dl "${base}?w=400&h=533&fit=crop&q=70&auto=format" "$BG_THUMB/$fname"
}

echo "=== COVER PHOTOS ==="

echo "--- Abstract ---"
cover "photo-1557683316-973673baf926" "abstract" "01"
cover "photo-1579546929518-9e396f3cc135" "abstract" "02"
cover "photo-1618005182384-a83a8bd57fbe" "abstract" "03"
cover "photo-1557682250-33bd709cbe85" "abstract" "04"
cover "photo-1558591710-4b4a1ae0f04d" "abstract" "05"
cover "photo-1604076913837-52ab5f34d2e6" "abstract" "06"
cover "photo-1614850523296-d8c1af93d400" "abstract" "07"
cover "photo-1620641788421-7a1c342ea42e" "abstract" "08"

echo "--- City ---"
cover "photo-1480714378408-67cf0d13bc1b" "city" "01"
cover "photo-1449824913935-59a10b8d2000" "city" "02"
cover "photo-1477959858617-67f85cf4f1df" "city" "03"
cover "photo-1514565131-fce0801e5785" "city" "04"
cover "photo-1519501025264-65ba15a82390" "city" "05"

echo "--- Nature ---"
cover "photo-1506744038136-46273834b3fb" "nature" "01"
cover "photo-1470071459604-3b5ec3a7fe05" "nature" "02"
cover "photo-1507525428034-b723cf961d3e" "nature" "03"
cover "photo-1469474968028-56623f02e42e" "nature" "04"
cover "photo-1441974231531-c6227db76b6e" "nature" "05"

echo "--- Workspace ---"
cover "photo-1497366216548-37526070297c" "workspace" "01"
cover "photo-1497215728101-856f4ea42174" "workspace" "02"
cover "photo-1517502884422-41eaead166d4" "workspace" "03"

echo "--- Dark ---"
cover "photo-1534796636912-3b95b3ab5986" "dark" "01"
cover "photo-1478760329108-5c3ed9d495a0" "dark" "02"
cover "photo-1536566482680-fca31930a0bd" "dark" "03"
cover "photo-1533134486753-c833f0ed4866" "dark" "04"

echo ""
echo "=== BACKGROUND PHOTOS ==="

echo "--- Texture ---"
bg "photo-1558618666-fcd25c85f82e" "texture" "01"
bg "photo-1533035353720-f1c6a75cd8ab" "texture" "02"
bg "photo-1553949345-eb786bb3f7ba" "texture" "03"
bg "photo-1588345921523-c2dcdb7f1dcd" "texture" "04"
bg "photo-1516117172878-fd2c41f4a759" "texture" "05"

echo "--- Gradient ---"
bg "photo-1557682224-5b8590cd9ec5" "gradient" "01"
bg "photo-1557683311-eac922361b44" "gradient" "02"
bg "photo-1614854262318-831574f15f1f" "gradient" "03"
bg "photo-1620121692029-d088224ddc74" "gradient" "04"

echo "--- Pattern ---"
bg "photo-1518893494013-386c8d5f8ee5" "pattern" "01"
bg "photo-1528722828814-77b9b83aafb2" "pattern" "02"
bg "photo-1531685250784-7569952593d2" "pattern" "03"

echo "--- Atmospheric ---"
bg "photo-1419242902214-272b3f66ee7a" "atmospheric" "01"
bg "photo-1502790671504-542ad42d5189" "atmospheric" "02"
bg "photo-1502481851512-e9e2529b8784" "atmospheric" "03"

echo ""
echo "=== SUMMARY ==="
echo "Covers: $(ls "$COVER_DIR"/*.jpg 2>/dev/null | wc -l) full, $(ls "$COVER_THUMB"/*.jpg 2>/dev/null | wc -l) thumbs"
echo "Backgrounds: $(ls "$BG_DIR"/*.jpg 2>/dev/null | wc -l) full, $(ls "$BG_THUMB"/*.jpg 2>/dev/null | wc -l) thumbs"
echo "Total size: $(du -sh "$ROOT/public/gallery" | cut -f1)"
echo "Done!"
