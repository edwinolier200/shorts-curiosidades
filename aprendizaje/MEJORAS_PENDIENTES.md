# Mejoras pendientes (la primera que encaje con el tema de hoy se hace hoy)

| prioridad | mejora | cómo medirla | estado |
|---|---|---|---|
| 1 | Primer fotograma con gancho visual + texto grande (los primeros 2 s deciden si se quedan) | % de vistas que siguen viendo (Analytics del usuario) / revisión de la hoja | pendiente |
| 2 | organs2d.js: dibujar cerebro, pulmones, estómago, riñones, ojo e intestinos en estilo infografía | cada video de "cuerpo" usa sus órganos dibujados | pendiente |
| 3 | Onda eléctrica más nítida (banda fina azul) y destellos de "chispa" en el nodo sinusal | revisión de fotogramas | pendiente |
| 4 | Transición "zoom a través del tejido" reutilizable (para entrar a un órgano) | reutilizada en ≥ 2 videos | pendiente |
| 5 | Kit de países/ciudades en 3D: relieve real con elevación (no solo mapa plano) | videos de martes/jueves/sábado | pendiente |
| 6 | Banco de efectos de sonido orgánicos (latido real, respiración, burbujas) | mezcla más rica sin tapar la voz | pendiente |
| 7 | Miniatura A/B: generar 2-3 variantes por video y anotar cuál eligió el usuario | APRENDIZAJES.md | en marcha 24-nov: miniaturas dibujadas en estilo infografía (examples/miniatura_infografia_film.js), 3 variantes A/B/C |
| 8 | Acelerar el render | minutos de render en la bitácora | hecho 24-nov: 2D infografía 5 min (3D era 45 min) |
| 9 | Ninguna imagen quieta > 3 s (QA) | tools/qa.py | E02 v4 cumple; E01 no (5 s) |
