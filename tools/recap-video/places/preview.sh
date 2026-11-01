#!/bin/bash
# Preview one lesson without rendering the film: stills + contact sheet + a short clip with the real music at its real place
# in the song, plus the sync check. Output in out/preview/l<N>/.     places/preview.sh 18
# Then READ out/preview/l<N>/sheet.png yourself, and watch the clip if you can.
set -euo pipefail
N="$1"; cd "$(dirname "$0")/.."
PY="${RECAP_PY:-python3}"; DIR="out/preview/l$N"; mkdir -p "$DIR"; find "$DIR" -name 'still-*.png' -delete
read -r FROM TO < <(node places/when.mjs "$N")
PAGE=walk-full.html STILLPREFIX="preview/l$N/" node render.mjs stills "W$N,A$N,M$N,L$N" | tail -1
"$PY" places/sheet.py "$DIR/sheet.png" 4 900 $(ls "$DIR"/still-*.png | sort -t- -k2 -n)
PAGE=walk-full.html OUTNAME="preview/l$N/l$N.mp4" node render.mjs video 30 out/music/pulse/pulse.wav "$FROM" "$TO" | tail -1
node places/check_sync.mjs | tail -2
echo "Stills and clip in $DIR. Read $DIR/sheet.png."
