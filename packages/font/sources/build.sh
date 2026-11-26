#!/bin/sh
# Rebuild the Kashi fonts from Dastkhat.
#   pip install fontmake fonttools brotli ufoLib2
#   git clone https://github.com/dastyar-io/dastkhat-font <dastkhat_dir>
#   git -C <dastkhat_dir> checkout 19f4a12b56a89567b07e02500f0e4aed670e3644   # Dastkhat v1.220
#   sh sources/build.sh <dastkhat_dir> <output_dir>
# Output: <output_dir>/{Main,FaNum,NoEn}/<Family>/{Variable,TTF,Webfonts}
set -e
DK="${1:?usage: build.sh <dastkhat_dir> <output_dir>}"
OUT="${2:?usage: build.sh <dastkhat_dir> <output_dir>}"
HERE="$(cd "$(dirname "$0")" && pwd)"
TMP="$(mktemp -d)"
python3 -I "$HERE/derive.py" "$DK" "$TMP/ufo"
fontmake -m "$TMP/ufo/Kashi.designspace" -o variable --output-dir "$TMP/vf" --no-production-names
python3 -I "$HERE/release.py" "$OUT" "$TMP/vf"
rm -rf "$TMP"
