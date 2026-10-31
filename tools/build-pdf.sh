#!/usr/bin/env bash
# Rebuild Amir_Kashani_Resume.pdf from resume.html with headless Chrome, then check it.
# The checks guard against what went wrong before: Type3 fonts that split words, and a scrambled text layer.
set -euo pipefail
cd "$(dirname "$0")/.."
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# The host-resolver rule blocks the network, so analytics never fires during the build.
"$CHROME" --headless=new --disable-gpu --no-first-run --no-default-browser-check \
  --user-data-dir="$TMP/profile" --host-resolver-rules="MAP * ~NOTFOUND" \
  --no-pdf-header-footer --print-to-pdf="$TMP/raw.pdf" "file://$PWD/resume.html"

python3 -I tools/pdf_metadata.py "$TMP/raw.pdf" "$TMP/final.pdf"
python3 -I tools/visible_text.py resume.html > "$TMP/visible.txt"

if python3 -I -c "import sys; sys.exit(0 if b'/Type3' in open(sys.argv[1],'rb').read() else 1)" "$TMP/final.pdf"; then
  echo "FAIL: PDF contains Type3 fonts (they split words in the text layer)"; exit 1
fi
if python3 -I -c "import sys; sys.exit(0 if b'HeadlessChrome' in open(sys.argv[1],'rb').read() else 1)" "$TMP/final.pdf"; then
  echo "FAIL: PDF metadata mentions HeadlessChrome"; exit 1
fi
swift tools/check-pdf.swift "$TMP/final.pdf" "$TMP/visible.txt"

cp "$TMP/final.pdf" Amir_Kashani_Resume.pdf
echo "Wrote Amir_Kashani_Resume.pdf"
