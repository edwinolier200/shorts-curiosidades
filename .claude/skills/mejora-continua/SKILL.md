---
name: mejora-continua
description: Ciclo diario de mejora del canal @EdinTops. Úsalo SIEMPRE al producir el Short del día (y cuando el usuario pida mejorar los videos o aprender de los resultados) — antes de escribir el guion y después de renderizar. Mide el video anterior, aprende de los datos y de la competencia, aplica UNA mejora concreta y reutilizable al motor, y deja todo registrado en aprendizaje/.
---

# Mejora continua (un poco mejor cada día)

Regla de oro: **cada video tiene que ser medible y visiblemente mejor que el anterior en al menos una cosa**, y esa mejora se queda en el motor (engine/, tools/) para todos los videos siguientes.

## 0. Antes de empezar (5 min)
1. Lee `aprendizaje/BITACORA.md` (últimas 5 entradas), `aprendizaje/MEJORAS_PENDIENTES.md`, `aprendizaje/APRENDIZAJES.md` y `aprendizaje/METRICAS.md`.
2. Mira `aprendizaje/BITACORA_QA.md`: ¿qué control de calidad falló en los últimos videos? Eso tiene prioridad.

## 1. Elige la mejora de hoy (una sola, concreta)
Toma la primera de `MEJORAS_PENDIENTES.md` que encaje con el tema de hoy, o la que más se repita como ❌ en la bitácora QA, o la que diga el estudio semanal (`APRENDIZAJES.md`). Ejemplos de buen tamaño:
- un órgano nuevo en el kit de anatomía, o mejor material/luz de uno existente;
- una transición nueva reutilizable en motion.js / gl.js;
- un efecto de sonido nuevo sincronizado; mejor mezcla;
- un gancho de los primeros 2 s más fuerte (texto/imagen en el primer fotograma);
- miniatura con más contraste o una variante A/B.
Escríbela en la entrada de hoy de `BITACORA.md` ANTES de construir ("Mejora de hoy: …, cómo la voy a medir: …").

## 2. Produce el video siguiendo PLAYBOOK.md (v6.1: escenario real del tema)
Durante la construcción, revisa hojas de contacto (`node engine/render.mjs ... --at ...`) y corrige antes del render final: nada tapado por subtítulos, nada cortado, nada lavado, ninguna imagen genérica.

## 3. Control de calidad automático (obligatorio)
```
python3 tools/qa.py episodes/<slug>
```
Si falla algo arreglable (volumen, tramo quieto > 3 s, sobreexposición), arréglalo y vuelve a renderizar ese tramo o el video. Mira `episodes/<slug>/qa/sheet.png` con tus propios ojos y critícalo como lo haría un director: ¿cada imagen explica la frase? ¿se entiende sin sonido?

## 4. Registra lo aprendido
Añade a `aprendizaje/BITACORA.md`:
```
## AAAA-MM-DD · <slug> · <serie>
- Mejora de hoy: … → resultado: … (QA x/9; antes y/9)
- Lo que salió bien: …
- Lo que hay que mejorar: … (y añádelo a MEJORAS_PENDIENTES.md con prioridad)
- Tiempo de render: … min
```
Marca como hecha la mejora en `MEJORAS_PENDIENTES.md` y añade 1-2 ideas nuevas que hayas notado.

## 5. Guarda
Commit y push (ver el paso de git del prompt diario). Si el push falla, incluye la entrada de la bitácora en el resumen al usuario para que no se pierda.
