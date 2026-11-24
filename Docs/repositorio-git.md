# Estado del repositorio Git (criterio 12)

Revisión de solo lectura del 20/11/2026. **No se hicieron commits, push, merge, checkout ni limpieza.** El archivo `ClassKids_presentacion.pdf` sigue en el área de preparación, tal como estaba antes de esta etapa.

Remoto: `https://github.com/Jortiz0206/ClassKids_A.git` · rama actual: **`stg`**.

## 1. Ramas

| Rama | Apunta a | Relación con el remoto |
|---|---|---|
| `stg` (actual) | `4f7667e` | Igual a `origin/stg` |
| `master` (local) | `4f7667e` | 1 commit por delante de `origin/master` (`872f55a`) |
| `develop` (local) | `4f7667e` | 1 por delante y 1 por detrás de `origin/develop` |
| `show-cocurrent` (solo local) | `30da6ba` | Sin remoto; apunta al primer commit |
| `origin/develop` | `7c98b7d` | Contiene un commit que no está en `stg` ni en `master` |

## 2. Historial (6 commits en todas las ramas)

| Commit | Fecha | Cuenta | Ramas | Mensaje |
|---|---|---|---|---|
| `4f7667e` | 16/10/2026 | Faloon Johanna Ortiz | stg, master, develop (locales), origin/stg | fix: send recovery email to registered address |
| `7c98b7d` | 07/09/2026 | Fervelop | origin/develop | feat:Actualizacion Backend (modifica `init.sql` y `Estudiantes.tsx`) |
| `872f55a` | 03/09/2026 | Jortiz0206 | origin/master | fix: corrige condición de carrera que sacaba a un administrador de /admin |
| `c810388` | 03/09/2026 | Jortiz0206 | | fix: corrige open redirect en recuperación de contraseña y SQL por f-string |
| `e5e0f75` | 03/09/2026 | Jortiz0206 | | feat: amplía grupos y datos demo, agrega políticas legales y refuerza seguridad de credenciales |
| `30da6ba` | 01/09/2026 | Jortiz0206 | show-cocurrent | feat: version completa ClassKids |

No se confirmó a qué integrante pertenece cada cuenta de Git; lo debe indicar el equipo.

## 3. Cambios sin commit (20/11/2026)

- 1 archivo en el área de preparación: `ClassKids_presentacion.pdf` (no se tocó).
- 48 archivos modificados y 44 entradas nuevas sin seguimiento (algunas son carpetas completas, como `Docs/diagramas/`, `e2e/` o `backend/tests/`).
- Corresponden a la auditoría, las correcciones autorizadas (D1–D7), el entorno de pruebas, la suite de pruebas, la renovación visual y la documentación de la rúbrica.

## 4. Observaciones

| Observación | Riesgo | Recomendación para el cierre |
|---|---|---|
| Todo el trabajo desde el 16/10/2026 está sin commit | Pérdida de trabajo; historial poco explicativo | Commits por grupo lógico (ver la sección 5) |
| `7c98b7d` en `origin/develop` no está integrado y modifica `init.sql` | Conflicto con los datos demo verificados | Revisarlo con su autor antes de integrarlo; no integrarlo a ciegas |
| `master` y `develop` locales difieren de sus remotos | Confusión sobre cuál es la versión oficial | Definir el flujo `stg` → `develop` → `master` mediante PR |
| Rama `show-cocurrent` sin uso | Ruido | Eliminarla solo si el equipo lo autoriza |
| Mensajes de commit mezclan español e inglés | Menor | Usar un solo idioma con prefijos `feat:`, `fix:`, `docs:`, `test:` |
| Archivos sensibles | `.env`, `backend/backups/` y `backend/CREDENCIALES_LOCALES.md` están en `.gitignore` (verificado) | Mantenerlos fuera del repositorio |

## 5. Propuesta de commits para el cierre (no ejecutada; requiere autorización expresa)

1. `fix: correcciones autorizadas D1–D7 en backend y frontend (H-24 a H-33)`
2. `test: entorno de pruebas aislado y suites pytest, Vitest y Playwright`
3. `feat: renovación visual del frontend (sistema de diseño, navegación móvil, módulos)`
4. `test: pruebas unitarias y E2E de la renovación`
5. `docs: documentación técnica, rúbrica y carpeta ENTREGA_FINAL_CLASSKIDS`
6. `chore: migración 001 e informes` (sin ejecutar la migración)

Luego, un PR `stg` → `develop` y otro `develop` → `master`, revisados por el equipo.
