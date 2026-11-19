# Playbook: un Short diario de curiosidades para Colombia y Latinoamérica

Este repositorio produce un YouTube Short en español al día, listo para subir: vídeo vertical
1080x1920, miniaturas, título, descripción, etiquetas y ajustes. Lo ejecuta una sesión programada
que empieza desde cero cada día. Sigue estos pasos en orden y no te los saltes.


## Reglas de temática y personas reales (desde el 2026-11-20)
- Público: **Colombia y toda Latinoamérica**. Usa referencias, unidades y ejemplos cercanos (pesos, kilómetros, fútbol, ciudades de la región). Español neutro latinoamericano.
- Bloques que se alternan: ⚽/⭐ famosos y deportistas, 🌎 países y lugares, 🏙️ ciudades, 🫀 partes del cuerpo.
- **Personas reales y famosas:**
  - **Nunca generes con IA la cara ni un cuerpo reconocible de una persona real.** Represéntala con símbolos: un objeto icónico (tarjeta roja, guayos, micrófono, bicicleta), una camiseta genérica con su número, un estadio, una silueta de espaldas o un contador. En los prompts escribe "no people" o "seen from behind, silhouette" si sale alguien.
  - Nada de escudos de clubes, logos de marcas o federaciones, ni fragmentos de partidos o canciones: tienen derechos de autor. Usa camisetas y estadios genéricos.
  - Solo hechos públicos y verificados, en tono neutral o de admiración. Nada de burlas, rumores, vida privada, salud no pública ni temas judiciales.
  - Los récords cambian con el tiempo: escribe "hasta hoy" o "según [fuente]" cuando la cifra pueda variar, y cuenta en la descripción si las fuentes no coinciden.
- **Países y ciudades:** datos de fuentes oficiales o de medios reconocidos. Evita los rankings sin fuente ("la más peligrosa", "la mejor") salvo que los cites.

## 0. Preparación (unos 10 min)
```
bash tools/setup.sh
```
Instala PyTorch, el generador de imágenes (SSD-1B + LCM), la voz Kokoro (Python 3.12 en `.kenv`),
faster-whisper y espeak-ng, y precarga los modelos. Chromium y Playwright ya vienen en el contenedor.

## 1. Elegir el tema
- Toma el tema cuya **Fecha** en `CALENDARIO.md` es la de hoy (hora de Colombia); si no hay, el primer `pendiente` con fecha pasada.
- Haz 1 o 2 búsquedas web para ver si hay un ángulo de actualidad (efeméride del día, noticia
  viral, tendencia de Shorts en español). Si hay uno mejor, puedes usarlo en su lugar y añadirlo al calendario.
- **Comprueba los datos con al menos 2 fuentes fiables** (enciclopedias, medios, papers). Si un dato
  no se puede confirmar, no lo uses o suavízalo ("según los registros de la época…"). Nunca inventes
  cifras, fechas ni citas. Guarda las fuentes: van en la descripción.

## 2. Guion (40-55 s, unas 110-140 palabras)
Usa la estructura viral del episodio 001 (`episodes/001-11-dias-sin-dormir/audio/vo/lines.txt`):
1. **Gancho (0-3 s):** lo más imposible o chocante, con un número grande. "Este hombre…", "¿Qué pasa si…?".
2. **Contexto (3-10 s):** quién, cuándo, dónde, en una frase.
3. **Escalada (10-38 s):** 3 o 4 pasos que crecen (una cuenta atrás de días, de cifras, de etapas…).
   Cada paso debe traer algo nuevo para ver cada 2-4 s.
4. **Giro (38-48 s):** "Lo más loco…": el dato que nadie espera.
5. **Cierre en bucle:** una pregunta al espectador que enlace con el gancho.

Reglas para la voz (Kokoro `em_alex`):
- Escribe los números en letras ("mil novecientos sesenta y cuatro").
- No uses "…" ni pausas largas: la voz debe ir de corrido.
- Nombres extranjeros: escríbelos como se pronuncian en español ("Súlivan", "Guínes") y devuélvelos a su grafía correcta en los subtítulos con `REP`. No empieces una línea con un nombre propio: la primera palabra a veces se pierde.
- Una línea de `lines.txt` = un bloque o escena.

## 3. Crear el episodio
```
bash tools/new_episode.sh NNN-slug-del-tema
```
Luego, dentro de `episodes/NNN-slug/`:
- `audio/vo/lines.txt`: el guion, una escena por línea (normalmente 8-10 líneas).
- `assets/img/prompts.json`: un prompt por escena, en inglés, fotorrealista y cinematográfico,
  **sin texto en la imagen** (la IA escribe mal las letras; el texto se pone en el vídeo).
  No pidas caras de personas reales concretas: usa planos de espaldas, siluetas, manos u objetos.
- `audio/timing.py`: cambia el diccionario `T` por las palabras clave del nuevo guion
  (`at(numero_de_linea, 'inicio_de_palabra')`). Ahí cuelgan los golpes visuales.
- `audio/captions.py`: cambia `REP` (números escritos en letras -> cifras en los subtítulos) y `KEY`
  (palabras que se resaltan en rojo).
- `film.js`: adapta las escenas (`SCENES`, `PHOTOS`, `hitList`). Reutiliza los elementos del 001:
  `photo()` (foto a pantalla completa con Ken Burns), `dayCard()` (tarjeta de calendario o de cifra), `tracker()`
  (barra de progreso arriba), contadores, sellos, `lids()` (párpados que se cierran), subtítulos palabra a palabra.
  Mantén la paleta (fondo de foto oscurecido, acento rojo #FF3B30, Anton + Inter).

## 4. Imágenes (~100 s cada una)
```
python3 tools/gen_images.py episodes/NNN-slug
```
Mira cada imagen. Evita en los prompts objetos con letras (matrículas, carteles) y pide colores naturales. Si una sale con texto raro, manos deformes o no se entiende, cambia el prompt y
regenérala sola (`python3 tools/gen_images.py episodes/NNN-slug clave`; `SEED=7` cambia la semilla).

## 5. Audio
```
bash tools/build_audio.sh episodes/NNN-slug
```
Revisa la salida: la columna `match` de cada línea debería estar en 0.9 o más. Si una palabra sale
mal (nombres propios en inglés, siglas), reescríbela en `lines.txt` y vuelve a ejecutar.

## 6. Revisión visual
```
bash tools/render.sh episodes/NNN-slug contact
```
Abre `out/episodes/NNN-slug/contact_9x16.png` y compruébalo: nada se solapa con los subtítulos
(y≈1300-1450), el texto se lee y cada golpe visual cae sobre su palabra. Corrige y repite.

## 7. Render final (~7 min)
```
bash tools/render.sh episodes/NNN-slug final
python3 tools/check_audio.py out/episodes/NNN-slug/final.mp4
```
La transcripción debe coincidir con el guion.

## 8. Paquete para publicar (`episodes/NNN-slug/publicar/`)
- **Miniaturas (v2):** escribe `publicar/thumb.json` y ejecuta `node tools/thumbs.cjs episodes/NNN-slug`
  (las instrucciones de cada campo están al principio de `tools/thumbs.cjs`). Ejemplo:
  `{"bg":"stadium","hero":"redcard","big":"46","unit":"TARJETAS ROJAS","line1":"EL JUGADOR MÁS","mark":"EXPULSADO","line2":"DE LA HISTORIA","badge":"RÉCORD MUNDIAL","emoji":"😱","flag":"🇨🇴"}`
  Reglas: el número o la palabra gigante es el dato más impactante; como mucho 3 líneas cortas; una sola palabra en el
  marcador amarillo; el `hero` es la imagen más reconocible (el objeto icónico), nunca una cara de persona real.
  Revisa los dos PNG antes de enviarlos: nada cortado ni tapado.
  `node tools/thumbs.cjs episodes/NNN-slug`.
- `titulo_y_descripcion.txt` con el mismo formato que el del 001:
  - 3 títulos de menos de 60 caracteres: número + curiosidad + emoji, sin mentir (nada de clickbait falso).
  - Descripción: gancho, de 3 a 5 viñetas con emojis, pregunta para comentar, llamada a suscribirse,
    **fuentes**, aviso "Imágenes ilustrativas generadas con IA", hashtags (#Shorts #curiosidades …).
  - Etiquetas, la casilla de contenido sintético en SÍ, "no es para niños", la categoría Educación, un comentario fijado y la hora sugerida.
- Copia el `final.mp4` como `publicar/video_<slug>.mp4`.

## 9. Entrega
- Envía al usuario los 4 archivos (vídeo, 2 miniaturas, txt) con SendUserFile, `status: proactive`.
- Escribe en español un resumen de 3 líneas: tema, título recomendado y cualquier dato que no se haya podido verificar.
- Marca el tema como `hecho (AAAA-MM-DD)` en `CALENDARIO.md`, haz commit del episodio
  (sin los .mp4 ni los .wav) y push. Si el push falla por permisos, no es grave: el calendario va por fechas,
  así que el día siguiente no repite tema. Dilo en el resumen y no envíes parches al usuario.
