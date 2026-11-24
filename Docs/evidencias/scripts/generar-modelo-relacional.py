"""Genera Docs/referencia-tecnica/modelo-relacional.md a partir de la salida de
verificacion-mr.sql ejecutado (solo lectura) sobre la base REAL `classkids`.

Uso (desde la raíz del repositorio):
  docker exec -i -e PGOPTIONS=-cdefault_transaction_read_only=on classkids_db \
    psql -U postgres -d classkids -P pager=off < Docs/evidencias/scripts/verificacion-mr.sql > Docs/evidencias/verificacion-mr-real.txt
  python Docs/evidencias/scripts/generar-modelo-relacional.py Docs/evidencias/verificacion-mr-real.txt AAAA-MM-DD
"""
import pathlib
import re
import sys

RAIZ = pathlib.Path(__file__).resolve().parents[3]
salida, fecha = pathlib.Path(sys.argv[1]), sys.argv[2]
texto = salida.read_text(encoding="utf-8")


def seccion(n):
    bloque = texto.split(f"== {n}.")[1].split("\n== ")[0]
    filas = []
    for linea in bloque.splitlines()[3:]:
        if not linea.strip() or linea.startswith("(") or set(linea.strip()) <= set("-+"):
            continue
        filas.append([c.strip() for c in linea.split("|")])
    return filas


columnas, restricciones, fks, indices, puntos = (seccion(i) for i in range(1, 6))

pk = {(r[0], m) for r in restricciones if r[2] == "PRIMARY KEY" for m in re.findall(r"\((\w+)\)", r[3])}
uk = {(r[0], c.strip()) for r in restricciones if r[2] == "UNIQUE" for c in re.search(r"\(([^)]*)\)", r[3]).group(1).split(",")}
fk = {}
for t, nombre, d, od, ou in fks:
    col, ref = re.search(r"FOREIGN KEY \((\w+)\) REFERENCES (\w+)\((\w+)\)", d).group(1, 2), re.search(r"REFERENCES (\w+)\((\w+)\)", d).group(1, 2)
    fk[(t, col[0])] = (ref, od)

tablas = []
for t, n, c, tipo, nulo, defecto in columnas:
    if t not in tablas:
        tablas.append(t)


def tipo_mermaid(tipo):
    return tipo.replace(" without time zone", "").replace("character varying", "varchar").replace("(", "_").replace(",", "_").replace(")", "")


def defecto_legible(d):
    if d.startswith("nextval("):
        return "autoincremental"
    return re.sub(r"::[\w ]+", "", d).strip("'")


# Relaciones para Mermaid: cardinalidad según nulabilidad de la FK
rel = []
for (t, col), ((rt, rc), od) in sorted(fk.items()):
    nula = next(f[4] for f in columnas if f[0] == t and f[2] == col) == "YES"
    rel.append(f'  {rt} {"|o" if nula else "||"}--o{{ {t} : "{col} ({od})"')

er = ["erDiagram"] + rel
for t in tablas:
    er.append(f"  {t} {{")
    for f in [f for f in columnas if f[0] == t]:
        claves = ",".join(k for k, ok in (("PK", (t, f[2]) in pk), ("FK", (t, f[2]) in fk), ("UK", (t, f[2]) in uk)) if ok)
        er.append(f"    {tipo_mermaid(f[3])} {f[2]}{(' ' + claves) if claves else ''}")
    er.append("  }")

md = [
    "# Modelo relacional verificado (base real)",
    "",
    f"Verificado el **{fecha}** con consultas de **solo lectura** sobre la base real `classkids` (contenedor `classkids_db`, puerto 5432), mediante [`verificacion-mr.sql`](../evidencias/scripts/verificacion-mr.sql). La salida completa está en [`verificacion-mr-real.txt`](../evidencias/verificacion-mr-real.txt). Este documento se genera con [`generar-modelo-relacional.py`](../evidencias/scripts/generar-modelo-relacional.py), así que no se edita a mano.",
    "",
    "> **Columna `entregado`:** NO existe en la base real. La migración 001, que la agrega, sigue **pendiente de autorización** y solo está aplicada en la base de pruebas `classkids_test`. Por eso no aparece en este modelo.",
    "",
    "Versiones del diagrama: editable (Mermaid, abajo) · [PNG](../diagramas/modelo-relacional.png) · [PDF](../diagramas/modelo-relacional.pdf).",
    "",
    "## 1. Diagrama",
    "",
    "Cardinalidad: `||--o{` es «uno a muchos, obligatorio» (la FK no admite nulos) y `|o--o{` es «cero o uno a muchos» (la FK admite nulos). Entre paréntesis va la acción `ON DELETE`.",
    "",
    "```mermaid",
    *er,
    "```",
    "",
    "## 2. Llaves foráneas y acciones ON DELETE",
    "",
    "| Tabla.columna | Referencia | Admite nulo | ON DELETE | Qué significa |",
    "|---|---|---|---|---|",
]
SIGNIFICA = {
    "CASCADE": "Al borrar el registro padre se borran también estos registros",
    "SET NULL": "Al borrar el registro padre, este campo queda vacío y el registro se conserva",
    "NO ACTION": "No se puede borrar el registro padre mientras tenga registros relacionados",
}
for (t, col), ((rt, rc), od) in sorted(fk.items()):
    nula = next(f[4] for f in columnas if f[0] == t and f[2] == col)
    md.append(f"| `{t}.{col}` | `{rt}.{rc}` | {'Sí' if nula == 'YES' else 'No'} | {od} | {SIGNIFICA.get(od, '')} |")

md += ["", "## 3. Restricciones (PK, UNIQUE, CHECK)", "", "| Tabla | Restricción | Tipo | Definición |", "|---|---|---|---|"]
md += [f"| `{r[0]}` | `{r[1]}` | {r[2]} | `{r[3]}` |" for r in restricciones]
md += ["", "## 4. Índices", "", "| Tabla | Índice | Definición |", "|---|---|---|"]
md += [f"| `{r[0]}` | `{r[1]}` | `{r[2].replace('CREATE UNIQUE INDEX', 'UNIQUE').replace(' USING btree', '')}` |" for r in indices]
md += ["", "## 5. Diccionario de datos", ""]
for t in tablas:
    md += [f"### `{t}`", "", "| # | Columna | Tipo | Nulo | Por defecto | Clave |", "|---:|---|---|---|---|---|"]
    for f in [f for f in columnas if f[0] == t]:
        claves = []
        if (t, f[2]) in pk: claves.append("PK")
        if (t, f[2]) in uk: claves.append("UK")
        if (t, f[2]) in fk: claves.append(f"FK → `{fk[(t, f[2])][0][0]}.{fk[(t, f[2])][0][1]}`")
        md.append(f"| {f[1]} | `{f[2]}` | {f[3]} | {'Sí' if f[4] == 'YES' else 'No'} | {defecto_legible(f[5])} | {' · '.join(claves)} |")
    md.append("")

md += ["## 6. Puntos revisados", "", "| Punto | Resultado |", "|---|---|"]
md += [f"| {p[0]} | {p[1]} |" for p in puntos]
open(RAIZ / "Docs" / "referencia-tecnica" / "modelo-relacional.md", "w", encoding="utf-8").write("\n".join(md) + "\n")
print("ok", len(tablas), "tablas,", len(columnas), "columnas,", len(fk), "FK")
