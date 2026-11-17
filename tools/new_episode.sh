#!/usr/bin/env bash
# Start a new episode from the reference one:  bash tools/new_episode.sh 002-<slug>
set -e
SLUG=$1; REF=episodes/001-11-dias-sin-dormir; E=episodes/$SLUG
[ -n "$SLUG" ] && [ ! -e "$E" ] || { echo "usage: new_episode.sh <NNN-slug> (must not exist)"; exit 1; }
mkdir -p $E/audio/vo $E/assets/img $E/publicar
cp $REF/{film.js,film.json,index.html} $E/
cp $REF/audio/{build_vo.py,captions.py,timing.py,kokoro_lines.py} $E/audio/; cp tools/score_generic.py $E/audio/score.py
cp $REF/publicar/thumb.html $E/publicar/
ln -s ../../engine $E/lib; ln -s ../../fonts $E/fonts
cp fonts/*.woff2 $E/publicar/ 2>/dev/null; (cd $E/publicar && mv display.woff2 anton.woff2 && mv ui.woff2 inter.woff2)
echo "$E ready: now write audio/vo/lines.txt, assets/img/prompts.json, then adapt timing.py, captions.py, film.js"
