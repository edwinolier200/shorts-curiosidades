# Playbook: un Short diario de curiosidades para Colombia y Latinoamérica

Canal: **@EdinTops**. Úsalo en la marca de agua, en la descripción ("Suscríbete a @EdinTops") y en el texto de REDES.

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




## Estilo visual v5 (obligatorio desde el 2026-11-23): "maqueta 3D" + mapa en relieve
Inspirado en el lenguaje visual de los Shorts latinos que más crecen. Ejemplo completo y probado: `examples/estilo_v5_film.js` (con `examples/estilo_v5_captions.json`).
- **Imágenes = objetos en miniatura tipo juguete o plastilina sobre una mesa de madera con fondo azul oscuro.** Añade SIEMPRE este final a cada prompt de `prompts.json`:
  `", 3D render, cute miniature, clay toy style, soft studio lighting, on a warm wooden table, dark navy blue background, centered, isometric view, octane render, smooth plastic materials, no text"`.
  Un objeto protagonista por imagen (taza, barco, flores, balón, montaña…). **Nunca pidas números ni letras en la imagen** (la IA los escribe mal): los números van en `UI.statCard`, `UI.pill` y `UI.stamp`.
- **Mapas en relieve** (`MAP.relief`, cámara con `tilt: 1`): países como bloques pastel; el protagonista se eleva con `lift`, con `MAP.mountains` y `MAP.flag` (banderas en `MAP.FLAGS`). Ejemplo en las escenas 0-5 s del demo.
- **Interfaz (`lib/ui.js`):**
  - `UI.captionsTop(ctx, CAP, t)`: subtítulos ARRIBA (y≈340), en blanco, ortografía normal (no todo en mayúsculas) y la palabra clave en amarillo. Sustituye a los subtítulos grandes del centro.
  - `UI.dayBadge(ctx, 'SIN COLOMBIA', 'LUNES', t, t0, {tEnd})`: la etiqueta del bloque aparece grande y luego se queda en la esquina superior izquierda (el texto rojo es el tema del vídeo).
  - `UI.statCard(ctx, '5.700 M $', 'lo que gana el canal en un año 🚢', t, t0)`: cada cifra clave va en una tarjeta azul oscuro con el número amarillo.
  - `UI.pill(...)` (PRECIO ↑) y `UI.stamp(...)` (EN PARO, CANCELADO) como remates visuales de los chistes.
  - `UI.stage(ctx)` dibuja el escenario de mesa de madera y fondo azul para objetos dibujados en código (podios, barras, contadores).
  - `UI.watermark(ctx)`: pone **@EdinTops** (el @ del canal), pequeño, a media altura a la izquierda. Va en TODOS los vídeos.
- Ritmo: un cambio visual cada 2-3 s (nuevo objeto, tarjeta, sello o movimiento de cámara). Cámara siempre con un acercamiento lento.
- Lo que el usuario ve en YouTube tapa la parte de arriba (y < 260), la columna derecha (x > 930, y 1000-1700) y la parte de abajo (y > 1700): no pongas nada importante ahí.

## Formato v4: la ESCALERA (obligatorio en todos los vídeos desde el 2026-11-23)
Inspirado en lo que mejor funciona ahora con el público colombiano ("¿Qué pasaría si Colombia desapareciera?", 178 mil vistas en 1-2 días, 5,4 % de me gusta). Se aplica a **todos** los temas, no solo a la serie de los domingos. **No copies guiones ni ideas concretas de otros canales: copia la estructura, con tus propios datos verificados.**
1. **Gancho con pregunta o dato imposible que toque al espectador** (su país, su cuerpo, su ciudad): "¿Qué pasaría si…?", "¿Qué le pasa a tu cuerpo si…?", "46 tarjetas rojas…".
2. **Escalera de 5 a 7 bloques** con etiqueta en pantalla (días de la semana LUNES…DOMINGO, pasos 1/7…, años, kilómetros…). Usa `lib/blocks.js`: `blockTag(ctx, 'LUNES', '☕', t, T.lunes)` y `ladder(...)` para los puntos de progreso. Cada bloque dura 6-10 s: **un dato verificado y un remate con humor** ("tu cafecito a precio de cóctel"). El humor es ligero y nunca se burla de personas, países ni grupos.
3. **Golpe emocional cerca del final** (orgullo, nostalgia, la familia o la diáspora), y luego un **remate final con humor o rivalidad sana** entre países (arepa, café, fútbol), siempre con cariño.
4. **Cierre:** una pregunta para comentar y una **llamada a compartir concreta**: "Envíaselo a ese amigo [colombiano/mexicano…] que [rasgo reconocible]". Ponla también en la descripción y en el texto de REDES.
- **Duración:** 60-90 s con la escalera (pueden llegar a 110 s si cada bloque cumple). Sin escalera, 35-55 s. Si un bloque no aporta un dato nuevo o un remate, se corta.
- **Serie de los domingos desde el 29-11: "🤯 ¿Qué pasaría si…?"**, un escenario hipotético contado día a día o paso a paso. Lo hipotético debe quedar claro ("solo es un vídeo") y cada consecuencia tiene que apoyarse en datos reales y verificados.
- La regla de verificación no cambia: cada cifra de cada bloque, con 2 fuentes.

## Estrategia de crecimiento v3 (obligatoria desde el 2026-11-21)
Objetivo de cada Short: que el espectador **no deslice en los primeros 2 segundos**, lo vea **entero** y lo **repita**, y que **comente**.

**Guion (fórmula GANCHO, BUCLE ABIERTO, ESCALADA, GIRO, PREGUNTA):**
1. **Primera frase = el dato más brutal, sin introducción.** Mal: "Este hombre pasó…". Bien: "Cuarenta y seis tarjetas rojas. Nadie en la historia del fútbol fue expulsado tantas veces."
   El primer fotograma ya muestra el número gigante y el texto: es lo que se ve en el feed.
2. **Bucle abierto en los primeros 5 s:** promete algo para el final ("…y lo último que hizo es todavía más loco").
3. **Escalada:** de 3 a 4 datos que van a más, con un cambio visual cada 2-3 s.
4. **Giro final:** el dato que nadie espera (cumple la promesa del bucle).
5. **Pregunta de identidad para comentar:** "¿Desde qué país lo ves?", "¿Tú lo viste jugar?", "¿En tu ciudad pasa lo mismo?". La última frase debe enlazar con la primera para que la repetición se sienta continua.
- **Duración:** ver el Formato v4 (60-90 s con la escalera; 35-55 s sin ella).
- Lenguaje de conversación latinoamericano, frases cortas, verbos en presente. Sin relleno ("hoy te voy a contar…").

**Título (≤ 55 caracteres):** `[Sujeto conocido o palabra clave]: [dato con número] [1 emoji]`.
Ejemplos: "Gerardo Bedoya: 46 tarjetas rojas 🟥", "¿Por qué Ciudad de México se hunde cada año? 😳", "¿Cuántos países de Europa caben en Colombia? 🇨🇴". Alterna los patrones de pregunta, "lo que nadie te contó", "no es lo que crees" y "X contra Y". La palabra clave va primero (búsqueda) y el número debe ser real.

**Descripción:** la primera línea repite la palabra clave en forma de pregunta; luego 3-4 viñetas, las fuentes, el aviso de IA y **solo 3 hashtags**: `#shorts #curiosidades #<país o tema>`.

**Comentario fijado:** siempre una pregunta para opinar o elegir (por ejemplo, "¿Qué jugador quieres que contemos el próximo viernes? 👇"). Los comentarios alimentan los temas futuros.

**En `titulo_y_descripcion.txt` añade también:**
- `SERIE:` el nombre de la serie del día (para la lista de reproducción del mismo nombre).
- `REDES:` un texto corto para TikTok, Instagram Reels y Facebook Reels, con 3-5 hashtags de esa red. Se sube **el mismo vídeo** a las cuatro plataformas: en Latinoamérica TikTok y Facebook mueven muchísimo alcance.
- `IDEA DE ENCUESTA:` una encuesta para la pestaña Comunidad de YouTube, para que el público vote el próximo tema de la serie.


### Lo que funciona en la competencia (análisis con TubeAlfred, 2026-11-20)
Canales revisados: Chris Torres (@GEOchristorres, geografía de Latinoamérica, vídeos de 3 a 9,7 M de vistas), Línea Discontinua, Historia en Vena, Un Dato al Día.
- **Identidad y orgullo latino:** los más vistos tocan "nosotros" frente al mundo ("El mexicano que humilló al ejército de EE. UU." 7,6 M; "México contra el mundo: las guerras que nadie te contó" 8,7 M; "Por qué la altitud salvó a Colombia del calor" 3 M).
- **Mapas y comparaciones de tamaño:** "¿Sabías el tamaño real de estos países?" 9,7 M; "Si sales de Madrid en línea recta, ¿dónde acabas?" 731 K. Los temas de países y ciudades se cuentan sobre un mapa siempre que se pueda.
- **El título apela a "tú" y a "tu":** "¿Tu ciudad está en la lista?", "¿Tu apellido viene de…?".
- **Patrones de título que más rinden:** pregunta directa ("¿Por qué…?", "¿Cuántos…?"), "…que nadie te contó", "…no es lo que crees", "X contra Y", y un número sorprendente.
- **Duración de los éxitos:** de 35 a 57 s. Nuestro objetivo de 35-45 s está bien; nunca pasar de 58 s.
- **Qué comenta la gente:** de dónde es ("Saludos desde Perú 🇵🇪"), rivalidades entre países, correcciones y peticiones ("haz uno de América contra Asia"). Por eso la pregunta final pide país o ciudad, y se piden ideas para el próximo vídeo.
- **Nunca** metas errores a propósito para provocar correcciones: es engañoso y daña la confianza. Si hay un error real, corrígelo en el comentario fijado.


### Mapas animados (`engine/maps.js`, en los episodios `lib/maps.js`)
Para **martes (ciudades), jueves (países) y sábados (lugares)**, siempre que el tema tenga geografía, cuenta la historia **sobre un mapa** en al menos 2 escenas: es el formato con más vistas de la competencia.
- `await MAP.load()` en `init()`; `MAP.camera(lon, lat, zoom)` (anima lon, lat y zoom con `springKeys`/`kf`; el zoom en escala logarítmica); `MAP.fit(MAP.bbox('Colombia'), 0.8)` calcula el zoom que encuadra un país.
- `MAP.world(ctx, cam)` dibuja el océano y todos los países; `MAP.country(ctx, cam, 'Colombia', {k})` lo resalta (con `k` de 0 a 1 para que entre "creciendo"); `MAP.label(...)` pone la etiqueta en español (`MAP.ES`).
- `MAP.trueSize(ctx, cam, 'Spain', [lon, lat])` coloca un país a su **tamaño real** en otro lugar (comparaciones del tipo "¿cuántos caben?"); `MAP.city(...)` dibuja un marcador con pulso; `MAP.route(ctx, cam, a, b, p)` traza una línea recta sobre el globo (ruta ortodrómica).
- Los nombres de país siguen Natural Earth en inglés ('Brazil', 'Mexico', 'United States of America'). Para Francia sin la Guayana usa `{ minLon: -10, maxLon: 20 }`.
- **Comprueba cada afirmación de tamaño con `MAP.areaKm2(name)`** antes de escribirla en el guion, y cita la superficie oficial en la descripción. Ejemplo verificado: España (506 mil km²) + Francia metropolitana (544 mil) = 1,05 M km² < Colombia (1,14 M) → "en superficie, España y Francia juntas caben en Colombia". Con Italia y Reino Unido ya no caben: nunca afirmes lo que el mapa no demuestra.
- Ejemplo completo y probado: `examples/mapa_demo_film.js` (zoom del mundo a Colombia, España y Francia a tamaño real, ruta Bogotá-Madrid).

**Domingos de reto:** formato de adivinanza con 3 pistas que se van revelando, una cuenta atrás de 3 s y la respuesta al final. Pide "escribe tu respuesta antes de que se revele". Es el formato que más comentarios genera.

## 0. Preparación (unos 10 min)
```
bash tools/setup.sh
```
Instala PyTorch, el generador de imágenes (SSD-1B + LCM), la voz Chatterbox (y Kokoro de respaldo) (Python 3.12 en `.kenv`),
faster-whisper y espeak-ng, y precarga los modelos. Chromium y Playwright ya vienen en el contenedor.

## 1. Elegir el tema
- Toma el tema cuya **Fecha** en `CALENDARIO.md` es la de hoy (hora de Colombia); si no hay, el primer `pendiente` con fecha pasada.
- Haz 1 o 2 búsquedas web para ver si hay un ángulo de actualidad (efeméride del día, noticia
  viral, tendencia de Shorts en español). Si hay uno mejor, puedes usarlo en su lugar y añadirlo al calendario.
- **Comprueba los datos con al menos 2 fuentes fiables** (enciclopedias, medios, papers). Si un dato
  no se puede confirmar, no lo uses o suavízalo ("según los registros de la época…"). Nunca inventes
  cifras, fechas ni citas. Guarda las fuentes: van en la descripción.

## 2. Guion (Formato v4: 60-90 s con la escalera, unas 160-230 palabras)
Usa la estructura viral del episodio 001 (`episodes/001-11-dias-sin-dormir/audio/vo/lines.txt`):
1. **Gancho (0-3 s):** lo más imposible o chocante, con un número grande. "Este hombre…", "¿Qué pasa si…?".
2. **Contexto (3-10 s):** quién, cuándo, dónde, en una frase.
3. **Escalada (10-38 s):** 3 o 4 pasos que crecen (una cuenta atrás de días, de cifras, de etapas…).
   Cada paso debe traer algo nuevo para ver cada 2-4 s.
4. **Giro (38-48 s):** "Lo más loco…": el dato que nadie espera.
5. **Cierre en bucle:** una pregunta al espectador que enlace con el gancho.

Reglas para la voz (Chatterbox multilingüe, más natural; `VOICE=kokoro` vuelve a la voz anterior):
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
La voz se genera línea a línea (unos 8 min) y cada toma se comprueba con Whisper: si sale mal pronunciada se repite sola (hasta 4 veces).
Si existe `voices/narrador.wav` (una grabación de 10-20 s con derechos de uso), todas las líneas salen con esa voz.
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

## Estilo v6: cine 3D con historia enlazada (desde E02)
Referencia de calidad: episodes/E02-el-secreto-de-tu-corazon (three.js vía engine/gl.js; render ~0,9 fps).
No copiamos la referencia: tomamos su *calidad* (luz, metal, niebla, cámara que fluye) y la ponemos al servicio del tema.
1. **Cada frase = su imagen literal.** Antes de escribir film.js, haz una tabla frase → qué se ve. Si la voz dice "bombea 7.000 litros", se ven barriles llenándose con cada latido; si dice "desde antes de que nacieras", el objeto nace diminuto y crece. Prohibido un fondo genérico que no explique la frase.
2. **Un protagonista que no desaparece.** Un objeto 3D del tema (el corazón, el país en relieve, la camiseta, la ciudad) está presente en todo el video y cambia de tamaño/posición; las demás cosas (números, barriles, notas) aparecen a su alrededor y reaccionan a él (laten con él, se llenan con él).
3. **Cámara continua.** Dentro de un mundo nunca se corta: la cámara se desliza entre tomas (keys() con 0,8-1 s de transición). Entre mundos (pasillo ↔ mesa) disolvencia de 0,35 s.
4. **Estructura que retiene:** gancho (pregunta o imposible) → promesa ("guarda un secreto, te lo cuento al final") → escalera de 3-5 datos cada vez más fuertes → apagón + giro → humor → gesto físico del espectador ("pon la mano en tu pecho") → ENLACE.
5. **Historias enlazadas.** Cada episodio termina anunciando el próximo capítulo de su serie ("Sígueme, que en el próximo capítulo te cuento…") y ese episodio abre recordando el anterior ("En el capítulo anterior te conté…"). Nunca digas "mañana" si mañana toca otra serie. Anota el enlace en CALENDARIO.md.
6. **Calidad:** materiales PBR (oro metálico, vidrio/laca con clearcoat), bloom moderado, niebla, rayos de luz, viñeta; subtítulos grandes centrados (Heavy, blanco + palabra clave dorada, y≈1270); números siempre en 3D o UI, nunca generados por IA.

### v6.1 · Escenario adaptado a cada tema (sin estilo fijo)
- No hay un "estilo de la casa": cada video construye el escenario REAL de su tema. Cuerpo humano → dentro del cuerpo, con órganos anatómicos reales (engine/anatomy.js + assets3d/anatomy, BodyParts3D). País/ciudad → relieve y mapa real (engine/maps.js). Fútbol → estadio/cancha. Nunca un objeto genérico tipo emoji (el corazón ♥ de E02 v1 fue rechazado: "se ve muy genérico").
- Órganos disponibles: heart_wall, coronary_arteries, cardiac_veins, aorta, vena_cava, pulmonary_artery, lungs, ribs, sternum, diaphragm, liver. Para otro órgano: buscar su FMA en BodyParts3D (parts_list_e.txt / composite_parts.txt), añadirlo a tools/anatomy_glb.py y un material en anatomy.js.
- Siempre poner en la descripción: "Modelos anatómicos 3D: BodyParts3D, © DBCLS, CC BY-SA 2.1 JP" (y en los últimos 3 s del video).
- Cada video debe mejorar algo respecto al anterior (anotarlo en el commit): más realismo, mejor luz, mejor sincronía, mejor gancho.
- Revisión obligatoria de fotogramas (contact sheet) antes del render final: nada tapado por subtítulos, nada cortado, nada lavado/sobreexpuesto.

## Ciclo de mejora continua (desde 2026-11-23)
Cada día: skill .claude/skills/mejora-continua (una mejora medible y reutilizable por video) + control de calidad tools/qa.py + registro en aprendizaje/. Cada domingo 5:23 p. m.: estudio semanal (métricas públicas con TubeAlfred + 2 Shorts de la competencia) que actualiza APRENDIZAJES.md, MEJORAS_PENDIENTES.md y, si los datos lo respaldan, este PLAYBOOK.

### v6.2 · Estilo de la serie del CUERPO: infografía (elegido por el usuario el 2026-11-24)
- Órganos DIBUJADOS en estilo infografía con engine/organs2d.js (heart style 'flat', liver, torso, hand, bloodCell): anatomía simplificada y reconocible, nunca el símbolo ❤ ni la malla médica exacta. Fondo azul noche con estrellas y glóbulos flotando. Ejemplo completo: episodes/E02-el-secreto-de-tu-corazon/film.js.
- Si falta un órgano, dibújalo en organs2d.js con el mismo lenguaje (silueta redondeada, degradado claro→oscuro, una sombra, un brillo, detalles en color de acento) y muéstralo en una hoja de contacto antes de usarlo.
- El kit 3D (engine/anatomy.js) queda solo como opción si el usuario lo pide.

### Miniaturas v3 (desde 2026-11-24): dibujadas en el mismo estilo del video
- Ya no se usa el recorte borroso dentro de un círculo. Se dibuja la miniatura con código (ejemplo: examples/miniatura_infografia_film.js): protagonista GRANDE (60-70 % del alto), fondo azul noche con rayos y estrellas, máximo 2 líneas grandes arriba (una blanca + una en marcador dorado) y un rótulo pequeño abajo, un icono que cuente la idea (Zzz, "?", reloj). Nada importante por debajo de y=1700 en vertical.
- Generar 3 variantes (A afirmación, B pregunta, C cifra) en 9x16 y 16x9; A por defecto; anotar en APRENDIZAJES.md cuál elige el usuario o cuál rinde mejor.

## Formato "PRUEBA EN CASA" (salud práctica) — desde 2026-11-24
Inspirado en el tipo de Short de salud práctica que más se comparte (ver aprendizaje/APRENDIZAJES.md). No copiamos personajes, siglas ni guiones.
- Narrador propio y recurrente: **Don Tito** (abuelo médico dibujado: calvo con pelo blanco a los lados, gafas redondas, bigote gris, bata y corbatín rojo), engine/props2d.js → K.tito(). Habla en primera persona o se cita ("Don Tito siempre dice…"); su boca se mueve con la voz (mouth 0..1).
- Kit de objetos: K.meter (glucómetro/termómetro/oxímetro con número que cambia en su pantalla, estado ok/warn), K.clock (reloj con barrido), K.chart (curva verde vs roja), K.check (palomita), K.texturedBg (fondo azul con textura). Más los órganos de organs2d.js cuando haga falta.
- Guion (35-50 s): 1) pregunta personal ("¿cuál de estos te hace daño A TI?") 2) Don Tito y una regla fácil de recordar 3) "cada cuerpo es distinto" 4) la PRUEBA EN CASA paso a paso con números concretos 5) cómo interpretar (verde = bien / rojo = cuidado) 6) consecuencia o beneficio 7) llamada a compartir ("mándaselo a tu mamá / a tu tío que…").
- Subtítulos arriba tipo karaoke (frase tenue, palabra actual blanca y gruesa, palabra clave resaltada en caja).
- Seguridad: cada número de salud con 2 fuentes médicas (OMS, ADA, AHA, MedlinePlus, estudios revisados), siempre rangos oficiales, nunca diagnósticos ni tratamientos; en la descripción y al final: "Esto no reemplaza la consulta con tu médico".
- Temas candidatos (verificar antes): caminar 10 min después de comer baja el pico de azúcar; la prueba de pararse en un pie 10 s después de los 50; tómate el pulso en reposo (60-100 lpm); la prueba de sentarse y levantarse del piso; el color de tu orina y la hidratación; cuánta sal escondida tiene el pan.
