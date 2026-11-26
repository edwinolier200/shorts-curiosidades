# Bitácora de producción (una entrada por video; lo más nuevo abajo)

## 2026-11-23 · E01-viaje-de-tu-sangre · cuerpo
- Mejora: anatomía dibujada 100 % en código (sin imágenes de IA). QA 8/9 (falla: un tramo quieto > 3 s).
- Lo que salió bien: inicio-gancho-final claro; la gota como hilo conductor.
- A mejorar: el usuario pidió más realismo y escenarios adaptados al tema.

## 2026-11-23 · E02-el-secreto-de-tu-corazon · cuerpo
- Mejora: v1 cine 3D (three.js) → rechazado ("corazón muy genérico"). v2: corazón anatómico REAL (BodyParts3D) dentro del pecho, latido sincronizado con la música, onda eléctrica del nodo sinusal, barriles que se llenan, gancho al próximo capítulo (hígado).
- Lo que salió bien: cada frase tiene su imagen literal; historia enlazada con el siguiente capítulo.
- A mejorar: los pulmones tapaban el corazón (resuelto con fundido); la onda eléctrica aún se ve algo lechosa; render lento (~45 min).

## 2026-11-24 · E02-el-secreto-de-tu-corazon · cuerpo (v4 definitiva)
- El usuario: "menos real", "modo dibujo que haya tenido éxito" → eligió la INFOGRAFÍA (opción A de engine/organs2d.js): corazón dibujado con anatomía simplificada (no ❤), fondo azul noche con estrellas y glóbulos, gráficos planos por frase.
- Mejora de hoy: estilo infografía 2D + biblioteca organs2d.js (corazón, hígado, torso, mano, glóbulo). Render 5 min (antes 45 min en 3D). QA 9/9 (E01: 8/9).
- Mejora del QA: "imagen quieta" ahora mide qué parte de la pantalla cambia de verdad (antes daba falsos quietos).
- A mejorar: dibujar más órganos en este estilo (cerebro, pulmones, estómago, riñones, ojo); transiciones entre escenas más vistosas.

## 2026-11-25 · 012-camina-despues-de-comer · 🧪 Prueba en casa (1)
- Mejora de hoy: nuevo formato "Prueba en casa" con narrador propio Don Tito (boca sincronizada con la voz: tools/mouth.py), subtítulos karaoke arriba y kit props2d ampliado (plato, silla, persona caminando, cubos de azúcar, barras, cuadra). QA 9/9. Render ~10 min (2D, 2 muestras de desenfoque).
- Lo que salió bien: una imagen literal por frase; el estudio se muestra con su contexto (diabetes tipo 2, comparado con 1 caminata al día); aviso médico en video y descripción.
- Cuidado aprendido: la miniatura C decía "−22 % con 10 minutos" sin contexto → cambiada por la regla de Don Tito. Las miniaturas tampoco pueden exagerar una cifra.
- A mejorar: la persona que camina es muy simple (añadir cara y ropa con más detalle); transiciones entre escenas (hoy solo aparece/desaparece).

## 2026-11-26 · 012-camina-despues-de-comer · v3 (corrección pedida por el usuario)
- Problemas reportados: inconsistencias de lenguaje y final cortado.
- Encontrado (transcripción con Whisper medium + análisis de los últimos segundos): "comprébalo", "mírete", "plecómetro/bucómetro", "Dontito"; frase del estudio enredada y sin "30 minutos"; tarjeta "adultos" vs voz "personas"; leyenda "caminando" antes de tiempo; valores del medidor sin "ejemplo"; final = 3 s de imagen quieta + música desvaneciéndose.
- Arreglado en el video: frases reescritas con palabras fáciles ("haz la prueba", "medidor de azúcar"), toma de "Don Tito" claro, voz = pantalla, leyendas sincronizadas, "valores de ejemplo", escena de próxima prueba + tarjeta final + remate musical. QA 12/12 (antes 9/9 con el QA viejo, que no veía estos fallos).
- Arreglado en el sistema: TTS rechaza palabras mal dichas y recorta/desvanece cada línea; QA con pronunciación (medium), final completo y cierre audible; score con remate; fin calculado desde la última palabra; reglas en PLAYBOOK.
