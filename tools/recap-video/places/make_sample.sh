#!/bin/bash
# The sample: chosen places cut from the real full film, at their real place in the song, joined on downbeats.
#   places/make_sample.sh "open 11 18 23 15 30 close" "John walk - build sample"
set -euo pipefail
cd "$(dirname "$0")/.."; LIST="$1"; NAME="$2"; TMP=out/sample-parts; mkdir -p "$TMP"; : > "$TMP/list.txt"; A=""; n=0; F=""
for id in $LIST; do
  read -r FROM TO < <(node places/when.mjs "$id"); [ "$id" = open ] && FROM=0
  if [ -z "${ONLY:-}" ] || [[ " $ONLY " == *" $id "* ]]; then PAGE=walk-full.html OUTNAME="sample-parts/$id.mp4" node render.mjs video 30 - "$FROM" "$TO" | tail -1; fi   # ONLY="11" re-renders just that part
  echo "file '$id.mp4'" >> "$TMP/list.txt"
  F="$F[0:a]atrim=$FROM:$TO,asetpts=PTS-STARTPTS,afade=t=in:d=0.015,afade=t=out:st=$(python3 -c "print($TO-$FROM-0.015)"):d=0.015[a$n];"; A="$A[a$n]"; n=$((n+1))
done
ffmpeg -y -loglevel error -i out/music/pulse/pulse.wav -filter_complex "$F${A}concat=n=$n:v=0:a=1[o]" -map '[o]' -c:a aac -b:a 192k "$TMP/audio.m4a"
ffmpeg -y -loglevel error -f concat -safe 0 -i "$TMP/list.txt" -i "$TMP/audio.m4a" -map 0:v -map 1:a -c:v copy -c:a copy -movflags +faststart "out/$NAME.mp4"
ffmpeg -y -loglevel error -i "out/$NAME.mp4" -vf scale=540:-2 -c:v libx264 -crf 24 -c:a aac -b:a 128k "out/$NAME (phone).mp4"
ffprobe -v error -show_entries format=duration -of csv=p=0 "out/$NAME.mp4"
