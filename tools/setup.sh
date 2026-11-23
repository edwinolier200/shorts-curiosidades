#!/usr/bin/env bash
# One-time setup in a fresh cloud session (~10 min). Run from the repo root: bash tools/setup.sh
set -e
export HF_HUB_DISABLE_XET=1
command -v espeak-ng >/dev/null || (apt-get update -q && apt-get install -y -q espeak-ng) >/dev/null
pip install -q -U setuptools 2>&1 | grep -v WARNING || true
pip install -q torch diffusers transformers accelerate peft faster-whisper soundfile numpy num2words 2>&1 | grep -v WARNING || true
# the image of the container ships a broken system Pillow (cannot import _imaging)
python3 -c 'import PIL.Image' 2>/dev/null || pip install -q --ignore-installed pillow 2>&1 | grep -v WARNING || true
if [ ! -e .kenv ]; then
  if [ -x /opt/kenv/bin/python ]; then ln -s /opt/kenv .kenv; else uv venv -q -p 3.12 .kenv && VIRTUAL_ENV=$PWD/.kenv uv pip install -q kokoro soundfile; fi
fi
# Chatterbox multilingual voice (installed on top of the existing torch; its pinned versions are too old)
python3 -c 'import chatterbox' 2>/dev/null || { pip install -q --no-deps chatterbox-tts && pip install -q resemble-perth conformer s3tokenizer librosa omegaconf pyloudnorm; } 2>&1 | grep -v WARNING || true
[ -f package.json ] || echo '{"name":"shorts-kit","private":true}' > package.json
# warm the model caches so the first episode does not stall
python3 -c "from faster_whisper import WhisperModel; WhisperModel('small',device='cpu',compute_type='int8')"
PYTHONPATH=tools/shim python3 -c "from chatterbox.mtl_tts import ChatterboxMultilingualTTS; ChatterboxMultilingualTTS.from_pretrained(device='cpu')" 2>&1 | grep -iE "error" || true
python3 -c "
from huggingface_hub import snapshot_download
snapshot_download('segmind/SSD-1B', allow_patterns=['*.json','*.txt','unet/diffusion_pytorch_model.safetensors','vae/diffusion_pytorch_model.safetensors','text_encoder/model.safetensors','text_encoder_2/model.safetensors','tokenizer*/*'])
snapshot_download('latent-consistency/lcm-lora-ssd-1b')"
echo "setup ok"
# 3-D cinematic style (three.js via engine/gl.js; served from /node_modules by render.mjs)
[ -d node_modules/three ] || npm i --no-audit --no-fund three@0.170.0 opentype.js@1.3.4
