# Guía de la demostración de ClassKids

Esta guía explica cómo instalar ClassKids desde GitHub, crear la base de demostración con datos sintéticos y recorrer la plataforma como administrador y como docente.

Todos los registros de la demostración se guardan en PostgreSQL, en la base `classkids_demo`, y se crean con las operaciones reales del sistema. Nada de lo que se ve está escrito en los componentes.

## 1. Los tres entornos

| Entorno | Base de datos | Puerto PostgreSQL | Backend | Frontend | Para qué sirve |
|---|---|---|---|---|---|
| Real | `classkids` | 5432 | 8000 | 8080 | Uso del colegio. La demostración no la toca. |
| Pruebas | `classkids_test` | 5433 | 8001 | 8081 | Pruebas automatizadas (pytest, Playwright). |
| **Demostración** | `classkids_demo` | 5434 | 8002 | 8082 | Presentaciones y sustentación. |

Cada base vive en su propio contenedor de Docker, con su propio volumen.

**Protecciones:**
- **El backend:** si `CLASSKIDS_ENTORNO=demo`, solo arranca cuando `DATABASE_URL` apunta a `classkids_demo`. Al iniciar muestra `[ClassKids] Entorno: demo | base de datos: classkids_demo`, y `GET /` devuelve el entorno y la base.
- **El generador:** solo escribe si se cumplen tres condiciones: la URL apunta a `classkids_demo`, el puerto no es 5432 ni 5433, y en ese servidor no existen las bases `classkids` ni `classkids_test`.

## 2. Requisitos

- Docker Desktop.
- Python 3.12 o superior.
- Node.js 20 o superior, con npm o pnpm.
- Git.

## 3. Instalación y creación de la base (una sola vez)

Desde la raíz del repositorio clonado:

```powershell
# Backend: entorno virtual y dependencias
cd backend
python -m venv venv
venv\Scripts\activate          # en Linux o macOS: source venv/bin/activate
pip install -r requirements.txt

# Base de demostración (contenedor classkids_demo_db, puerto 5434)
docker compose -f docker-compose.demo.yml up -d

# Configuración local: crea backend/.env.demo con una clave JWT y contraseñas aleatorias
python demo/generar_demo.py preparar

# Datos sintéticos (tarda unos 6 minutos)
python demo/generar_demo.py generar

# Frontend: dependencias
cd ..\frontend
npm install
```

Al terminar, el generador:
- muestra un resumen con los conteos y la huella de los datos;
- escribe las credenciales en `backend/CREDENCIALES_DEMO.md`.

## 4. Credenciales locales

Las contraseñas no están en GitHub:
- `preparar` las genera al azar y las guarda en `backend/.env.demo` (variables `DEMO_ADMIN_PASSWORD` y `DEMO_DOCENTE_PASSWORD`).
- `generar` las anota en `backend/CREDENCIALES_DEMO.md`, junto con las asignaciones de cada cuenta.

Los dos archivos están excluidos de Git. Para usar contraseñas propias, edítalas en `backend/.env.demo` y ejecuta `python demo/generar_demo.py generar --reiniciar`.

| Cuenta | Correo | Asignaciones |
|---|---|---|
| Administradora (Marta Rivas) | `admin@demo.classkids.local` | Todas: gestión global |
| Lucía Méndez | `lucia.mendez@demo.classkids.local` | Matemáticas y Ciencias Naturales en 1A–3B (12) |
| Hernán Villamizar | `hernan.villamizar@demo.classkids.local` | Matemáticas y Ciencias Naturales en 4A–5B (8) |
| Carolina Restrepo | `carolina.restrepo@demo.classkids.local` | Lenguaje en los 10 grupos |
| Mauricio Peña | `mauricio.pena@demo.classkids.local` | Ciencias Sociales en los 10 grupos |
| Diana Castaño | `diana.castano@demo.classkids.local` | Inglés en los 10 grupos y Educación Artística en 1A–2B (14) |

Lucía y Hernán no comparten grupos. Con ellos se ven mejor las restricciones de acceso.

## 5. Iniciar y detener la demostración

Usa dos terminales:

```powershell
# Terminal 1: backend de demostración (puerto 8002)
cd backend
venv\Scripts\activate
$env:CLASSKIDS_ENV_FILE = ".env.demo"            # en bash: export CLASSKIDS_ENV_FILE=.env.demo
python -m uvicorn main:app --port 8002

# Terminal 2: frontend de demostración (puerto 8082)
cd frontend
npm run demo
```

Abre `http://localhost:8082` en el navegador.

**Para detener:**
- Los servidores: `Ctrl + C` en cada terminal.
- La base: `docker compose -f docker-compose.demo.yml stop` (desde `backend/`).

Los datos se conservan al cerrar sesión, al detener el backend o el frontend, al detener Docker y al reiniciar el equipo. El contenedor usa un volumen propio (`classkids_demo_data`) y la política `restart: unless-stopped`.

## 6. Datos que contiene

**Población y estructura:**

| Elemento | Cantidad | Detalle |
|---|---|---|
| Administrador | 1 | Creado directamente: el sistema no tiene un endpoint para el primer administrador. |
| Docentes | 5 | Invitados por la administradora y activados con el enlace de invitación, como en la aplicación. |
| Materias | 6 | Matemáticas, Lenguaje, Ciencias Naturales, Ciencias Sociales, Inglés y Educación Artística. |
| Grupos | 10 | Grado 1A a 5B: jornada matutina (A) y vespertina (B). |
| Asignaciones | 54 | Un docente por materia en cada grupo. |
| Estudiantes | 200 | 20 por grupo. Nombres combinados al azar y documentos `DEMO-0001` a `DEMO-0200`. |

**Registros académicos:**

| Elemento | Cantidad | Detalle |
|---|---|---|
| Actividades | 270 | Por materia y grupo, una calificada en cada periodo (1 a 4) y una pendiente con fecha futura. |
| Calificaciones | 3.861 | Escala 0.0–5.0 con un decimal. Se registraron en orden cronológico. |
| Observaciones | 96 | Académicas, convivenciales y de reconocimiento. |
| Alertas | 51 | Las creó la regla real del backend al registrar las notas. Hay activas, en revisión (marcadas por docentes) y resueltas. |

**Fechas simuladas:**
- El año lectivo se toma de la fecha en que se genera la base.
- Las calificaciones y observaciones se reparten a lo largo de ese año.
- Cada alerta lleva la fecha de la nota que la provocó.

Es la única modificación que no pasa por la API: todo lo demás usa los endpoints reales.

Todos los datos son ficticios:
- los correos usan el dominio reservado `demo.classkids.local`;
- las pruebas comprueban que no aparezcan los apellidos del equipo ni de otras personas mencionadas en el proyecto.

## 7. Escenarios disponibles

| Escenario | Estudiantes | Qué se ve |
|---|---|---|
| Rendimiento excelente | 30 | Promedio cercano a 4.6; ninguno tiene alertas. |
| Rendimiento aprobado | 66 | Promedio cercano a 3.9. |
| Cerca del umbral | 36 | Promedio cercano a 3.2. Algunos activaron la alerta y otros no. |
| Rendimiento bajo | 20 | Promedio cercano a 2.4, con alerta activa. |
| Mejora progresiva | 14 | Empiezan cerca de 2.3 y terminan cerca de 4.1. Su alerta ya está resuelta. |
| Disminución del rendimiento | 14 | Empiezan cerca de 4.3 y terminan cerca de 2.5. La alerta aparece en el último periodo. |
| Diferencias entre materias | 12 | Muy bien en una materia y mal en otra. |
| Sin calificaciones | 6 | Matriculados recientemente. |
| Retirados | 2 | Estudiantes inactivos, con notas del primer semestre. |
| Varias observaciones | 10 | Tres a cinco observaciones cada uno. |

**Actividades pendientes:** 54 actividades con fecha futura y sin notas, una por cada materia y grupo.

## 8. Recorrido sugerido

### Administradora (`admin@demo.classkids.local`)
1. **Panel de administración:** docentes, grupos, estudiantes, actividades y alertas activas leídos de la base.
2. **Usuarios:** invitar un docente nuevo. Se muestra el enlace de prueba; ábrelo en otra ventana para activar la cuenta.
3. **Materias:**
   - crear una materia;
   - vincular la materia al docente nuevo en un grupo, con «Vincular a Grupo».
4. **Grupos y Estudiantes:** crear o editar registros, y filtrar por grupo y estado.
5. **Análisis:** la vista global, con el filtro por materia.

### Docente (por ejemplo, Lucía Méndez)
1. **Inicio:** «Mis asignaciones» muestra solo sus 12 pares de materia y grupo, con su promedio.
2. **Actividades:** crear una actividad para uno de sus grupos.
3. **Calificaciones:**
   - elegir *Grado 1A* y *Repaso de geometría*, que es una actividad pendiente;
   - escribir notas de 0.0 a 5.0, por ejemplo `3.8` (también vale `3,8`);
   - junto a cada nota se ve la equivalencia, por ejemplo «76 % · 15.2 / 20»;
   - una nota como `80`, `5.1` o `2.96` se marca en rojo y no se puede guardar.
4. **Estudiantes:** abrir un estudiante y registrar una observación.
5. **Alertas:** las alertas de sus grupos, con su estado.
6. **Análisis:** promedios y gráficas en la escala 0.0–5.0.

### Restricciones de acceso
- Hernán Villamizar no ve los grupos de 1° a 3°.
- Si intenta calificar a un estudiante de 1A desde la API, recibe 403.
- Ningún docente entra a Usuarios ni al panel de administración.

### Generación de alertas
Registra una nota baja, por ejemplo `1.0`, a un estudiante del escenario «cerca del umbral» que no tenga alerta. Si su promedio acumulado queda por debajo de 3.0, el backend crea la alerta en ese momento (RN-09).

## 9. Reinicializar la demostración

```powershell
cd backend
venv\Scripts\activate
python demo/generar_demo.py generar --reiniciar
```

**Qué hace:**
- Borra únicamente los datos de `classkids_demo` y la vuelve a generar.
- Con la misma semilla (2026) y la misma fecha de referencia, el resultado es idéntico: la huella que muestra el resumen coincide.
- Sin `--reiniciar`, el generador se niega a escribir si la base ya tiene datos de demostración; así nunca se duplican.

**Otras opciones:**
- `--fecha-referencia AAAA-MM-DD`: fija el «hoy» de la demostración, para reproducir exactamente una generación anterior.
- `--semilla N`: produce otra población.

**Borrar la base por completo:** `docker compose -f docker-compose.demo.yml down -v`. Después repite el paso 3.

## 10. Verificación

```powershell
cd backend
python demo/generar_demo.py verificar      # comprobaciones de solo lectura
python -m pytest tests_demo                # 11 pruebas sobre classkids_demo (no dejan datos)
```

Con el backend y el frontend de demostración encendidos, desde la raíz:

```powershell
node node_modules/@playwright/test/cli.js test -c e2e/demo/playwright.demo.config.ts
```

Son 6 pruebas de recorrido en el navegador. Las que crean registros los eliminan al terminar. La prueba de invitación reutiliza la cuenta `docente.recorrido@demo.classkids.local`: la API solo desactiva cuentas, no las borra, así que esa cuenta queda desactivada.

**Qué comprueba `verificar`:**
- notas dentro de 0.0–5.0 y con un decimal;
- sin calificaciones duplicadas;
- cada nota corresponde a la materia y al grupo de su actividad;
- cada actividad tiene un docente asignado;
- un solo docente por materia y grupo;
- todo estudiante con promedio menor que 3.0 tiene alerta;
- ninguna alerta corresponde a un estudiante sin notas;
- como máximo una alerta abierta por estudiante;
- sin documentos ni correos repetidos.

## 11. Archivos

| Archivo | En GitHub | Contenido |
|---|---|---|
| `backend/docker-compose.demo.yml` | Sí | Contenedor y volumen de la base de demostración. |
| `backend/.env.demo.example` | Sí | Configuración de ejemplo, sin secretos. |
| `backend/demo/catalogo.py` | Sí | Catálogo de datos sintéticos (nombres, materias, actividades, escenarios). |
| `backend/demo/plan.py` | Sí | Plan determinista de la demostración (semilla fija). |
| `backend/demo/generar_demo.py` | Sí | Generador: preparar, generar y verificar. |
| `backend/tests/test_demo_generador.py` | Sí | 28 pruebas del plan y de las protecciones, sin base de datos. |
| `backend/tests_demo/` | Sí | 11 pruebas sobre la base generada. |
| `e2e/demo/` | Sí | 6 pruebas de recorrido en el navegador. |
| `backend/.env.demo` | **No** | Clave JWT y contraseñas de demostración. |
| `backend/CREDENCIALES_DEMO.md` | **No** | Credenciales locales. |
| Volumen `classkids_demo_data` | **No** | Los datos se reconstruyen con el generador. |
