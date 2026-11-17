#!/usr/bin/env bash
# One-time setup in a fresh cloud session (~10 min). Run from the repo root: bash tools/setup.sh
set -e
export HF_HUB_DISABLE_XET=1
command -v espeak-ng >/dev/null || (apt-get update -q && apt-get install -y -q espeak-ng) >/dev/null
pip install -q torch diffusers transformers accelerate peft faster-whisper soundfile numpy num2words 2>&1 | grep -v WARNING || true
if [ ! -e .kenv ]; then
  if [ -x /opt/kenv/bin/python ]; then ln -s /opt/kenv .kenv; else uv venv -q -p 3.12 .kenv && VIRTUAL_ENV=$PWD/.kenv uv pip install -q kokoro soundfile; fi
fi
[ -f package.json ] || echo '{"name":"shorts-kit","private":true}' > package.json
# warm the model caches so the first episode does not stall
python3 -c "from faster_whisper import WhisperModel; WhisperModel('small',device='cpu',compute_type='int8')"
.kenv/bin/python -c "from kokoro import KPipeline; KPipeline(lang_code='e', repo_id='hexgrad/Kokoro-82M')" 2>/dev/null
python3 -c "
from huggingface_hub import snapshot_download
snapshot_download('segmind/SSD-1B', allow_patterns=['*.json','*.txt','unet/diffusion_pytorch_model.safetensors','vae/diffusion_pytorch_model.safetensors','text_encoder/model.safetensors','text_encoder_2/model.safetensors','tokenizer*/*'])
snapshot_download('latent-consistency/lcm-lora-ssd-1b')"
echo "setup ok"
