# Generate the episode's photo-real images locally (SSD-1B + LCM-LoRA, CPU, ~100 s each).
#   python3 tools/gen_images.py episodes/<slug> [key ...]
# Reads <episode>/assets/img/prompts.json, writes <episode>/assets/img/<key>.png (640x1136, 9:16).
import torch, json, time, sys, os, zlib
from diffusers import StableDiffusionXLPipeline, LCMScheduler
ep = sys.argv[1]; only = sys.argv[2:]
torch.set_num_threads(os.cpu_count() or 4)
pipe = StableDiffusionXLPipeline.from_pretrained("segmind/SSD-1B", torch_dtype=torch.float32, use_safetensors=True)
pipe.scheduler = LCMScheduler.from_config(pipe.scheduler.config)
pipe.load_lora_weights("latent-consistency/lcm-lora-ssd-1b"); pipe.fuse_lora()
P = json.load(open(f'{ep}/assets/img/prompts.json'))
neg = "cartoon, illustration, drawing, text, letters, watermark, logo, deformed, extra fingers"
for k in (only or list(P)):
    t = time.time(); seed = int(os.environ.get('SEED', 0)) + zlib.crc32(k.encode()) % 10000
    im = pipe(P[k] + ", 35mm photo, highly detailed", negative_prompt=neg, num_inference_steps=6, guidance_scale=1.5,
              width=640, height=1136, generator=torch.Generator().manual_seed(seed)).images[0]
    im.save(f'{ep}/assets/img/{k}.png'); print(k, round(time.time() - t), 's', flush=True)
