"""Genera el documento académico de ClassKids (Word) a partir de los capítulos
Markdown de la carpeta Docs/. Así el Word, Docs/ y el README contienen la misma
información verificada.

Uso:  pip install python-docx
      python Docs/entregable/build_docx.py
"""
import os
import re
import sys

from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor

HERE = os.path.dirname(os.path.abspath(__file__))
DOCS = os.path.dirname(HERE)
# La versión 2.0 se conserva como archivo histórico; esta genera la 3.0.
OUT = os.path.join(HERE, "ClassKids_Documento_Proyecto_v3.docx")

GREEN = RGBColor(0x1F, 0x7A, 0x5A)
NAVY = RGBColor(0x1E, 0x2A, 0x3A)
GREY = RGBColor(0x6B, 0x72, 0x80)
FONT = "Calibri"
MAX_IMG_CM = 16.0

# (archivo, tipo) – "cap" = capítulo numerado; "anexo" = anexo con letra
CHAPTERS = [
    ("conceptos/descripcion-general.md", "cap"),
    ("conceptos/casos-de-uso.md", "cap"),
    ("conceptos/RFs.md", "cap"),
    ("conceptos/NFs.md", "cap"),
    ("conceptos/reglas-de-negocio.md", "cap"),
    ("referencia-tecnica/architecture.md", "cap"),
    ("referencia-tecnica/database-schema.md", "cap"),
    ("referencia-tecnica/modelo-relacional.md", "cap"),
    ("referencia-tecnica/modelo-relacional-diferencias.md", "cap"),
    ("referencia-tecnica/integracion.md", "cap"),
    ("referencia-tecnica/flujos.md", "cap"),
    ("referencia-tecnica/interfaces.md", "cap"),
    ("pruebas.md", "cap"),
    ("pruebas/plan-de-pruebas.md", "cap"),
    ("pruebas/reporte-ejecucion-2026-11-20.md", "cap"),
    ("pruebas/reporte-ejecucion-2026-11-24.md", "cap"),
    ("pruebas/registro-defectos.md", "cap"),
    ("frontend/renovacion-visual.md", "cap"),
    ("frontend/organizacion-codigo.md", "cap"),
    ("backend/auditoria-backend.md", "cap"),
    ("despliegue.md", "cap"),
    ("comparativa-documentacion.md", "cap"),
    ("hallazgos.md", "cap"),
    ("conceptos/plan-ejecucion.md", "cap"),
    ("deuda-tecnica.md", "cap"),
    ("backends-comparativa.md", "cap"),
    ("conclusiones.md", "cap"),
    ("conceptos/HUs.md", "anexo"),
    ("conceptos/trazabilidad.md", "anexo"),
    ("referencia-tecnica/api-endpoints.md", "anexo"),
    ("manual-usuario.md", "anexo"),
    ("manual-tecnico.md", "anexo"),
    ("diagramas/uml-y-modelo-relacional.md", "anexo"),
    ("scrum/README.md", "anexo"),
    ("scrum/etapas-retrospectivas.md", "anexo"),
    ("scrum/product-backlog.md", "anexo"),
    ("scrum/retrospectiva-cierre.md", "anexo"),
    ("equipo/README.md", "anexo"),
    ("repositorio-git.md", "anexo"),
    ("iot/propuesta-iot.md", "anexo"),
    ("evidencias/permisos/verificacion-api-permisos.md", "anexo"),
    ("evidencias/escala-notas/verificacion-escala.md", "anexo"),
    ("demo/guia-demostracion.md", "anexo"),
]

VERSIONS = [
    ("1.0", "04/11/2025", "Alejandra Guio, Andrés Gutiérrez (ya no forma parte del equipo), Johanna Ortiz",
     "Documento inicial: idea de negocio, casos de uso CU-01 a CU-13, requisitos, MER y diccionario de datos."),
    ("2.0", "20/11/2026", "Equipo ClassKids (María Alejandra Guio, Faloon Johanna Ortiz, Jan Llanos)",
     "Actualización completa contra la implementación: CU-14 a CU-16, RF-16 a RF-25, reglas de negocio, "
     "escala oficial 0.0–5.0, arquitectura, MER y diccionario desde la base de datos real, auditoría de "
     "integración entre capas, verificación de la base de datos en DBeaver, interfaces, pruebas ejecutadas, "
     "comparación con la versión 1.0, hallazgos y manuales."),
    ("3.0", "23/11/2026", "Equipo ClassKids (María Alejandra Guio, Faloon Johanna Ortiz, Jan Llanos)",
     "Renovación visual del frontend, plan de pruebas, reporte de ejecución (102 pruebas), registro de defectos "
     "H-01 a H-37, auditoría del backend, despliegue, deuda técnica, comparativa de backends, modelo relacional, "
     "diagramas UML de clases, componentes y despliegue, modo claro y oscuro, modelo relacional verificado contra la base real, "
     "Scrum y trabajo en equipo (con pendientes del equipo)."),
    ("3.1", "24/11/2026", "Equipo ClassKids (María Alejandra Guio, Faloon Johanna Ortiz, Jan Llanos)",
     "Motivo: corrección de seguridad. Permisos por rol y por asignación docente–materia–grupo (H-08) y "
     "autoprotección del administrador en la API (H-18): RF-26, RNF-18, RN-33 a RN-38, HU-21 y HU-22, casos de uso, "
     "arquitectura, referencia de la API, matriz de trazabilidad, manual de usuario por rol, Dashboard del docente "
     "por materia, filtro por materia en Análisis, reporte de ejecución del 24/11/2026 (152 pruebas), verificación "
     "de permisos de la API y capturas actualizadas."),
    ("3.2", "25/11/2026", "Equipo ClassKids (María Alejandra Guio, Faloon Johanna Ortiz, Jan Llanos)",
     "Escala 0.0–5.0 verificada de extremo a extremo (H-44), avisos en el celular (H-45) y motivo del cierre de "
     "sesión (H-46); base de demostración reproducible; prototipo IoT «Semáforo de Comprensión» simulado en Wokwi, "
     "con receptor corregido (H-47, H-48); deuda técnica revisada contra los hallazgos corregidos; registro de "
     "defectos H-01 a H-48."),
]

stats = {"figuras": 0, "tablas": 0, "faltantes": []}


# ----------------------------------------------------------------- utilidades XML
def shade(cell, hex_color):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:color"), "auto")
    shd.set(qn("w:fill"), hex_color)
    tc_pr.append(shd)


def repeat_header(row):
    tr_pr = row._tr.get_or_add_trPr()
    el = OxmlElement("w:tblHeader")
    el.set(qn("w:val"), "true")
    tr_pr.append(el)


def add_field(paragraph, instr, placeholder=""):
    run = paragraph.add_run()
    b = OxmlElement("w:fldChar"); b.set(qn("w:fldCharType"), "begin")
    t = OxmlElement("w:instrText"); t.set(qn("xml:space"), "preserve"); t.text = instr
    s = OxmlElement("w:fldChar"); s.set(qn("w:fldCharType"), "separate")
    run._r.append(b); run._r.append(t); run._r.append(s)
    paragraph.add_run(placeholder)
    end_run = paragraph.add_run()
    e = OxmlElement("w:fldChar"); e.set(qn("w:fldCharType"), "end")
    end_run._r.append(e)


def set_update_fields(doc):
    settings = doc.settings.element
    el = OxmlElement("w:updateFields")
    el.set(qn("w:val"), "true")
    settings.append(el)


# ----------------------------------------------------------------- estilos
def setup_styles(doc):
    st = doc.styles
    normal = st["Normal"]
    normal.font.name = FONT
    normal.font.size = Pt(11)
    normal.element.rPr.rFonts.set(qn("w:eastAsia"), FONT)
    normal.paragraph_format.space_after = Pt(6)
    normal.paragraph_format.line_spacing = 1.15
    for lvl, size, color in ((1, 18, GREEN), (2, 14, NAVY), (3, 12, NAVY), (4, 11, NAVY)):
        h = st[f"Heading {lvl}"]
        h.font.name = FONT
        h.font.size = Pt(size)
        h.font.bold = True
        h.font.color.rgb = color
        rfonts = h.element.rPr.find(qn("w:rFonts"))
        if rfonts is None:
            rfonts = OxmlElement("w:rFonts"); h.element.rPr.append(rfonts)
        for a in ("w:ascii", "w:hAnsi", "w:cs", "w:eastAsia"):
            rfonts.set(qn(a), FONT)
        for a in ("w:asciiTheme", "w:hAnsiTheme", "w:cstheme", "w:eastAsiaTheme"):
            if rfonts.get(qn(a)) is not None:
                del rfonts.attrib[qn(a)]
        h.paragraph_format.space_before = Pt(18 if lvl == 1 else 12)
        h.paragraph_format.space_after = Pt(6)
        h.paragraph_format.keep_with_next = True
    for name in ("List Bullet", "List Number", "List Bullet 2"):
        st[name].font.name = FONT
        st[name].font.size = Pt(11)


# ----------------------------------------------------------------- texto en línea
INLINE = re.compile(r"(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\)|\*[^*\s][^*]*\*)")


def add_inline(paragraph, text, size=None, bold=None, color=None):
    for part in INLINE.split(text):
        if not part:
            continue
        b, it, mono = bold, False, False
        if part.startswith("**") and part.endswith("**"):
            part, b = part[2:-2], True
        elif part.startswith("`") and part.endswith("`"):
            part, mono = part[1:-1], True
        elif part.startswith("[") and "](" in part:
            part = part[1:part.index("](")]
            if part.startswith("`") and part.endswith("`"):
                part, mono = part[1:-1], True
        elif part.startswith("*") and part.endswith("*") and len(part) > 2:
            part, it = part[1:-1], True
        run = paragraph.add_run(part)
        if b:
            run.bold = True
        if it:
            run.italic = True
        if mono:
            run.font.name = "Consolas"
            run.font.size = Pt((size or 11) - 1)
        elif size:
            run.font.size = Pt(size)
        if color is not None:
            run.font.color.rgb = color
    return paragraph


# ----------------------------------------------------------------- bloques
def add_table(doc, rows):
    header, body = rows[0], rows[1:]
    ncols = len(header)
    table = doc.add_table(rows=1, cols=ncols)
    table.style = "Table Grid"
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    fs = 8 if ncols >= 7 else (9 if ncols >= 5 else 9.5)
    for i, txt in enumerate(header):
        cell = table.rows[0].cells[i]
        cell.text = ""
        p = cell.paragraphs[0]
        add_inline(p, txt, size=fs, bold=True, color=RGBColor(0xFF, 0xFF, 0xFF))
        shade(cell, "1F7A5A")
    repeat_header(table.rows[0])
    for r_i, r in enumerate(body):
        cells = table.add_row().cells
        for i in range(ncols):
            txt = r[i] if i < len(r) else ""
            p = cells[i].paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            add_inline(p, txt, size=fs)
            if r_i % 2 == 1:
                shade(cells[i], "F1F7F4")
    # Tablas de dos columnas «Campo | Detalle»: primera columna angosta y en negrita
    if ncols == 2 and header[0] in ("Campo", "Elemento", "Pregunta"):
        table.autofit = False
        for row in table.rows:
            row.cells[0].width = Cm(4.2)
            row.cells[1].width = Cm(11.8)
    # Matriz de integración por módulo (7 columnas): reparto según el contenido
    elif ncols == 7 and header[0] == "Módulo":
        table.autofit = False
        for row in table.rows:
            for c, w in zip(row.cells, (1.7, 2.6, 2.6, 1.8, 1.6, 3.2, 2.5)):
                c.width = Cm(w)
    # Tabla «Ciclo de una calificación»: la descripción necesita más espacio
    elif ncols == 4 and header[0] == "Etapa":
        table.autofit = False
        for row in table.rows:
            for c, w in zip(row.cells, (2.6, 7.6, 2.3, 3.5)):
                c.width = Cm(w)
    # Tablas cuya primera columna es un código corto (Paso, ID, RF...): primera columna angosta
    elif ncols >= 3 and header[0] in ("Paso", "Código", "ID", "N.°", "RF", "RNF", "Versión", "Orden"):
        table.autofit = False
        first = 1.4 if header[0] in ("Paso", "N.°", "Orden") else 1.9
        rest = (16.0 - first) / (ncols - 1)
        for row in table.rows:
            row.cells[0].width = Cm(first)
            for c in row.cells[1:]:
                c.width = Cm(rest)
    doc.add_paragraph().paragraph_format.space_after = Pt(2)
    stats["tablas"] += 1


def add_image(doc, md_dir, alt, path):
    full = os.path.normpath(os.path.join(md_dir, path))
    if not os.path.exists(full):
        stats["faltantes"].append(full)
        doc.add_paragraph(f"[Imagen no encontrada: {path}]")
        return
    from PIL import Image  # Pillow: medidas y rotación del MER
    with Image.open(full) as im:
        w, h = im.size
        if "entidad-relación" in alt and w > h:
            # El MER es muy ancho: se rota 90° para ocupar la página vertical completa
            rotated = os.path.join(HERE, "assets", "_mer_rotado.png")
            im.rotate(90, expand=True).save(rotated)
            full, (w, h) = rotated, (h, w)
        elif w >= 1000 and h > w * 1.6 and "_celular_" not in os.path.basename(full):
            # Captura de escritorio de página completa: en el Word se usa la parte superior
            # para que se lea; la imagen completa sigue en la carpeta de evidencias.
            os.makedirs(os.path.join(HERE, "assets", "_recortes"), exist_ok=True)
            recorte = os.path.join(HERE, "assets", "_recortes", os.path.basename(full))
            im.crop((0, 0, w, int(w * 0.95))).save(recorte)
            full, (w, h) = recorte, (w, int(w * 0.95))
            alt = f"{alt} (parte superior; la captura completa está en la carpeta de evidencias)"
    width = MAX_IMG_CM
    if h > w * 1.25:  # imágenes altas: limitar altura a ~21 cm
        width = min(MAX_IMG_CM, 21.0 * w / h)
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.keep_with_next = True
    p.add_run().add_picture(full, width=Cm(width))
    stats["figuras"] += 1
    cap = doc.add_paragraph()
    cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = cap.add_run(f"Figura {stats['figuras']}. {alt}")
    r.italic = True
    r.font.size = Pt(9)
    r.font.color.rgb = GREY


def split_row(line):
    line = line.strip()
    if line.startswith("|"):
        line = line[1:]
    if line.endswith("|"):
        line = line[:-1]
    return [c.strip() for c in line.split("|")]


def render_markdown(doc, md_path, kind, counters):
    md_dir = os.path.dirname(md_path)
    with open(md_path, encoding="utf-8") as f:
        lines = f.read().split("\n")
    i, para_buf = 0, []

    def flush_para():
        if para_buf:
            add_inline(doc.add_paragraph(), " ".join(s.strip() for s in para_buf))
            para_buf.clear()

    while i < len(lines):
        line = lines[i]
        stripped = line.strip()
        # Bloques de código
        if stripped.startswith("```"):
            flush_para()
            lang = stripped[3:].strip()
            i += 1
            code = []
            while i < len(lines) and not lines[i].strip().startswith("```"):
                code.append(lines[i]); i += 1
            i += 1
            if lang == "mermaid":
                continue
            p = doc.add_paragraph()
            p.paragraph_format.left_indent = Cm(0.5)
            for k, c in enumerate(code):
                run = p.add_run(c)
                run.font.name = "Consolas"; run.font.size = Pt(8.5)
                if k < len(code) - 1:
                    run.add_break()
            continue
        # Encabezados
        m = re.match(r"^(#{1,4})\s+(.*)$", line)
        if m:
            flush_para()
            level, title = len(m.group(1)), m.group(2).strip()
            if kind == "anexo" and level >= 2:
                # En los anexos los subtítulos bajan un nivel: el índice muestra solo el título del anexo
                h = doc.add_heading("", level=min(level + 1, 4))
                add_inline(h, title)
                i += 1
                continue
            if level == 1:
                if kind == "cap":
                    counters["cap"] += 1; counters["h2"] = 0; counters["h3"] = 0
                    title = f"{counters['cap']}. {title}"
                else:
                    letter = chr(ord("A") + counters["anexo"]); counters["anexo"] += 1
                    counters["h2"] = 0; counters["h3"] = 0
                    title = f"Anexo {letter}. {title}"
                h = doc.add_heading(title, level=1)
                h.paragraph_format.page_break_before = True
            elif level == 2:
                counters["h2"] += 1; counters["h3"] = 0
                if kind == "cap":
                    title = f"{counters['cap']}.{counters['h2']} {title}"
                doc.add_heading(title, level=2)
            else:
                if level == 3:
                    counters["h3"] += 1
                    if kind == "cap":
                        title = f"{counters['cap']}.{counters['h2']}.{counters['h3']} {title}"
                h = doc.add_heading("", level=min(level, 4))
                add_inline(h, title)
            i += 1
            continue
        # Tablas
        if stripped.startswith("|") and i + 1 < len(lines) and re.match(r"^\s*\|?\s*:?-{3,}", lines[i + 1]):
            flush_para()
            rows = [split_row(line)]
            i += 2
            while i < len(lines) and lines[i].strip().startswith("|"):
                rows.append(split_row(lines[i])); i += 1
            add_table(doc, rows)
            continue
        # Imágenes
        m = re.match(r"^!\[([^\]]*)\]\(([^)]+)\)\s*$", stripped)
        if m:
            flush_para()
            add_image(doc, md_dir, m.group(1), m.group(2))
            i += 1
            continue
        # Notas (blockquote)
        if stripped.startswith(">"):
            flush_para()
            quote = []
            while i < len(lines) and lines[i].strip().startswith(">"):
                quote.append(lines[i].strip().lstrip(">").strip()); i += 1
            p = doc.add_paragraph()
            p.paragraph_format.left_indent = Cm(0.6)
            pPr = p._p.get_or_add_pPr()
            bdr = OxmlElement("w:pBdr"); left = OxmlElement("w:left")
            for k, v in (("w:val", "single"), ("w:sz", "18"), ("w:space", "8"), ("w:color", "1F7A5A")):
                left.set(qn(k), v)
            bdr.append(left); pPr.append(bdr)
            add_inline(p, " ".join(quote), size=10, color=NAVY)
            continue
        # Listas
        m = re.match(r"^(\s*)([-*]|\d+\.)\s+(.*)$", line)
        if m:
            flush_para()
            indent = len(m.group(1))
            numbered = m.group(2)[0].isdigit()
            style = "List Number" if numbered else ("List Bullet 2" if indent >= 2 else "List Bullet")
            if numbered:
                p = doc.add_paragraph(style="List Bullet" if indent >= 2 else None)
                if indent < 2:
                    p.paragraph_format.left_indent = Cm(0.9)
                    p.paragraph_format.first_line_indent = Cm(-0.5)
                    p.add_run(m.group(2) + " ")
            else:
                p = doc.add_paragraph(style=style)
            p.paragraph_format.space_after = Pt(3)
            add_inline(p, m.group(3))
            i += 1
            continue
        if not stripped:
            flush_para(); i += 1; continue
        para_buf.append(line)
        i += 1
    flush_para()


# ----------------------------------------------------------------- portada, control, índice
def cover(doc):
    for _ in range(2):
        doc.add_paragraph()
    p = doc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.add_run().add_picture(os.path.join(HERE, "assets", "logo-classkids.png"), width=Cm(4))

    def centered(text, size, bold=False, color=NAVY, after=6):
        q = doc.add_paragraph(); q.alignment = WD_ALIGN_PARAGRAPH.CENTER
        q.paragraph_format.space_after = Pt(after)
        r = q.add_run(text); r.font.size = Pt(size); r.bold = bold; r.font.color.rgb = color
        return q

    centered("PROYECTO CLASS KIDS", 28, True, GREEN, 4)
    centered("Sistema de apoyo al seguimiento académico con alertas tempranas", 14, False, NAVY, 18)
    centered("Documento del proyecto — Versión 3.1", 13, True, NAVY, 30)
    centered("APRENDICES", 11, True, GREY, 4)
    for name in ("María Alejandra Guio", "Faloon Johanna Ortiz", "Jan Llanos"):
        centered(name, 12, False, NAVY, 2)
    centered("", 6)
    centered("Tecnólogo en Análisis y Desarrollo de Software (ADSO)", 11, False, NAVY, 2)
    centered("Servicio Nacional de Aprendizaje — SENA", 11, True, NAVY, 30)
    p = doc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.add_run().add_picture(os.path.join(HERE, "assets", "logo-sena.png"), width=Cm(2.6))
    centered("Colombia, noviembre de 2026", 11, False, GREY)


def version_control(doc):
    h = doc.add_heading("Control de versiones", level=1)
    h.paragraph_format.page_break_before = True
    add_table(doc, [["Versión", "Fecha", "Autores", "Descripción de los cambios"]] + [list(v) for v in VERSIONS])
    doc.add_heading("Acerca de esta versión", level=2)
    add_inline(doc.add_paragraph(),
               "Esta versión toma como fuente de verdad el sistema construido. Cada funcionalidad descrita se "
               "verificó contra el código del frontend y del backend, la base de datos PostgreSQL en ejecución y "
               "la aplicación en el navegador el 20/11/2026. Lo que todavía no existe se identifica como "
               "**Pendiente**. La versión 3.0 incorpora la renovación visual implementada y validada en el entorno "
               "de pruebas, y la documentación de los 14 criterios de evaluación. La versión 3.1 (24/11/2026) agrega "
               "los permisos por rol y por asignación docente–materia–grupo y la autoprotección del administrador, "
               "verificados con pruebas automatizadas y con peticiones reales a la API. Las secciones marcadas "
               "**PENDIENTE** (Scrum, trabajo en equipo y comparativa de backends) las completa el equipo: no se "
               "inventaron datos.")
    add_inline(doc.add_paragraph(),
               "Este documento se genera automáticamente a partir de los archivos de la carpeta `Docs/` del "
               "repositorio, por lo que coincide con la documentación técnica y con el README.")


def toc(doc):
    # Título con formato de encabezado pero sin estilo Heading, para que no aparezca en el propio índice
    h = doc.add_paragraph()
    h.paragraph_format.page_break_before = True
    h.paragraph_format.space_after = Pt(12)
    r = h.add_run("Contenido"); r.bold = True; r.font.size = Pt(18); r.font.color.rgb = GREEN
    p = doc.add_paragraph()
    add_field(p, 'TOC \\o "1-2" \\h \\z \\u',
              "Haga clic derecho aquí y seleccione «Actualizar campo» para generar la tabla de contenido.")


def header_footer(section):
    section.different_first_page_header_footer = True
    hp = section.header.paragraphs[0]
    hp.text = ""
    hp.add_run().add_picture(os.path.join(HERE, "assets", "logo-sena.png"), width=Cm(1.1))
    r = hp.add_run("\tClassKids — Documento del proyecto v3.0")
    r.font.size = Pt(9); r.font.color.rgb = GREY
    hp.paragraph_format.tab_stops.add_tab_stop(Cm(16))
    fp = section.footer.paragraphs[0]
    fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = fp.add_run("Página "); r.font.size = Pt(9); r.font.color.rgb = GREY
    add_field(fp, "PAGE", "1")


def main():
    doc = Document()
    sec = doc.sections[0]
    sec.page_width, sec.page_height = Cm(21.59), Cm(27.94)
    sec.left_margin = sec.right_margin = Cm(2.5)
    sec.top_margin = sec.bottom_margin = Cm(2.5)
    setup_styles(doc)
    header_footer(sec)
    doc.core_properties.title = "Proyecto Class Kids — Documento del proyecto v3.0"
    doc.core_properties.author = "María Alejandra Guio, Faloon Johanna Ortiz, Jan Llanos"
    doc.core_properties.subject = "Seguimiento académico con alertas tempranas — SENA ADSO"

    cover(doc)
    version_control(doc)
    toc(doc)
    counters = {"cap": 0, "anexo": 0, "h2": 0, "h3": 0}
    for rel, kind in CHAPTERS:
        path = os.path.join(DOCS, rel)
        if not os.path.exists(path):
            stats["faltantes"].append(path)
            continue
        render_markdown(doc, path, kind, counters)
    set_update_fields(doc)
    doc.save(OUT)
    tmp = os.path.join(HERE, "assets", "_mer_rotado.png")
    if os.path.exists(tmp):
        os.remove(tmp)
    print(f"Documento generado: {OUT}")
    print(f"Capítulos: {counters['cap']} · Anexos: {counters['anexo']} · Tablas: {stats['tablas']} · Figuras: {stats['figuras']}")
    if stats["faltantes"]:
        print("ARCHIVOS FALTANTES:")
        for f in stats["faltantes"]:
            print("  -", f)
        sys.exit(1)


if __name__ == "__main__":
    main()
