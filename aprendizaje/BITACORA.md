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
