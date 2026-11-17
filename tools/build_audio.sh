#!/usr/bin/env bash
# Voice (Kokoro em_alex) -> word alignment -> timing.json -> captions.json -> music + beats.json -> film.json duration.
#   bash tools/build_audio.sh episodes/<slug>
set -e; export HF_HUB_DISABLE_XET=1; R=$PWD; E=$1
cd $E/audio && $R/.kenv/bin/python kokoro_lines.py 2>&1 | grep -E "^[0-9]+ " && python3 build_vo.py pre 1 0.12 2>&1 | grep -v -i warn
cd .. && python3 audio/timing.py && python3 audio/captions.py >/dev/null && python3 audio/score.py
python3 -c "
import json;f=json.load(open('film.json'));t=json.load(open('timing.json'));f['duration']=t['T']['end'];f['poster']=round(t['T']['end']*0.85,2);json.dump(f,open('film.json','w'),indent=1,ensure_ascii=False);print('duration',f['duration'])"
