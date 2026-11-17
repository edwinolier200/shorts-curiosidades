#!/usr/bin/env bash
# contact sheet:  bash tools/render.sh episodes/<slug> contact
# final video:    bash tools/render.sh episodes/<slug> final     -> out/episodes/<slug>/final.mp4
set -e; E=$1; MODE=${2:-final}
if [ "$MODE" = contact ]; then node engine/render.mjs --film $E --format 9x16 --contact --every 2 --noblur; exit; fi
node engine/render.mjs --film $E --format 9x16 --video-only --fps 30 --workers 4
node engine/sfx.mjs $E && node engine/mix.mjs $E --vo-db 4 --music-db -3
