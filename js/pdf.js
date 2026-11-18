/**
 * pdf.js — Exportación del CV a PDF con texto real (jsPDF).
 *
 * Diseño "fusión": la barra lateral oscura y el azul eléctrico del sitio web
 * combinados con un CV moderno de dos columnas, legible al imprimir.
 *  - Barra lateral (#0b0f19): foto circular con aro azul, contacto,
 *    competencias clave, formación e idiomas; en la página 2, servicios.
 *  - Columna principal blanca: encabezado, perfil, experiencia en línea de
 *    tiempo, certificaciones en tarjetas y competencias técnicas.
 * Todo es texto vectorial (seleccionable y legible por sistemas ATS), con
 * enlaces clicables, saltos de página controlados y metadatos.
 */
(function (root) {
  'use strict';

  const PAGE = { w: 210, h: 297, top: 16, bottom: 20 };
  const SB = 66;                       // ancho de la barra lateral
  const SB_PAD = 9;
  const SB_W = SB - SB_PAD * 2;        // ancho útil de la barra
  const MX = SB + 11;                  // inicio de la columna principal
  const MR = PAGE.w - 13;              // fin de la columna principal
  const MW = MR - MX;                  // ancho útil principal
  const PT = 0.3528;                   // mm por punto tipográfico

  // Paleta tomada de css/main.css
  const COLOR = {
    sidebar: [11, 15, 25],       // --bg
    sidebar2: [17, 24, 39],      // --card-bg
    sbText: [229, 231, 235],
    sbMuted: [156, 163, 175],    // --text-secondary
    sbHead: [96, 165, 250],      // --accent-hover
    ink: [11, 15, 25],
    body: [55, 65, 81],
    muted: [107, 114, 128],
    accent: [37, 99, 235],       // --accent un tono más oscuro para papel
    accentBright: [59, 130, 246],// --accent
    green: [5, 150, 105],        // --green para papel
    amber: [217, 119, 6],        // estilo 'progreso' (en curso)
    rule: [226, 232, 240],
    pill: [241, 245, 249],
    soft: [239, 246, 255]
  };
  const SIDEBAR_HEX = '#0b0f19';

  /** Caracteres que la fuente estándar de PDF no incluye → equivalentes seguros. */
  function clean(str) {
    return String(str ?? '')
      .replace(/[‘’]/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/…/g, '...')
      .replace(/ /g, ' ')
      .trim();
  }

  function prettyUrl(url) {
    return String(url || '').replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
  }

  /**
   * Construye el documento. Es independiente del DOM para poder probarse.
   * @param {Function} JsPDF  Constructor de jsPDF
   * @param {Object}   data   Datos del CV (data.js / localStorage)
   * @param {Object}   i18n   { lang, t(key, vars), pick(field) }
   * @param {Object}   [photo] { data: dataURL, format: 'JPEG' } ya recortada en círculo
   */
  function buildCvPdf(JsPDF, data, i18n, photo) {
    const { t, pick } = i18n;
    const doc = new JsPDF({ unit: 'mm', format: 'a4', compress: true });
    const p = data.personal;
    let y = PAGE.top;

    // ---------- utilidades ----------
    const lh = (size, factor = 1.38) => size * PT * factor;

    function font(size, style = 'normal', color = COLOR.body) {
      doc.setFont('helvetica', style);
      doc.setFontSize(size);
      doc.setTextColor(...color);
    }

    function wrap(text, width, size, style = 'normal') {
      doc.setFont('helvetica', style);
      doc.setFontSize(size);
      return doc.splitTextToSize(clean(text), width);
    }

    function ensure(height) {
      if (y + height > PAGE.h - PAGE.bottom) {
        doc.addPage();
        y = PAGE.top + 2;
        return true;
      }
      return false;
    }

    /** Título de sección como en el sitio: texto fuerte y barra azul corta debajo. */
    function sectionTitle(title, minFollowing) {
      ensure(lh(12) + 7 + (minFollowing || 14));
      y += 3;
      font(12, 'bold', COLOR.ink);
      doc.text(clean(title), MX, y);
      doc.setFillColor(...COLOR.accentBright);
      doc.roundedRect(MX, y + 2, 10, 0.9, 0.45, 0.45, 'F');
      y += 8.5;
    }

    /** Píldora (como .date / .colegiado del sitio). Devuelve su ancho. */
    function pill(text, xRight, baseY, opts = {}) {
      const size = opts.size || 7.5;
      font(size, opts.bold ? 'bold' : 'normal', opts.color || COLOR.muted);
      const label = clean(text);
      const w = doc.getTextWidth(label) + 5;
      const h = size * PT + 2.6;
      const x = opts.alignLeft ? xRight : xRight - w;
      doc.setFillColor(...(opts.fill || COLOR.pill));
      if (opts.stroke) {
        doc.setDrawColor(...opts.stroke);
        doc.setLineWidth(0.25);
        doc.roundedRect(x, baseY - size * PT - 1.0, w, h, h / 2, h / 2, 'FD');
      } else {
        doc.roundedRect(x, baseY - size * PT - 1.0, w, h, h / 2, h / 2, 'F');
      }
      font(size, opts.bold ? 'bold' : 'normal', opts.color || COLOR.muted);
      doc.text(label, x + 2.5, baseY);
      return w;
    }

    // =====================================================
    // COLUMNA PRINCIPAL
    // =====================================================

    // ---------- encabezado ----------
    y += 4;
    wrap(p.nombre, MW, 23, 'bold').forEach((line) => {
      font(23, 'bold', COLOR.ink);
      doc.text(line, MX, y);
      y += lh(23, 1.08);
    });
    y += 0.5;

    const titular = pick(p.titular) || pick(p.titulo);
    wrap(titular, MW, 12, 'bold').forEach((line) => {
      font(12, 'bold', COLOR.accent);
      doc.text(line, MX, y);
      y += lh(12, 1.3);
    });

    const especialidad = pick(p.especialidad);
    if (especialidad) {
      wrap(especialidad, MW, 8.5).forEach((line) => {
        font(8.5, 'normal', COLOR.muted);
        doc.text(line, MX, y);
        y += lh(8.5, 1.4);
      });
    }

    // Grado y colegiado (la credencial formal, como la insignia del sitio)
    y += 3;
    if (pick(p.titular) && pick(p.titulo)) {
      wrap(pick(p.titulo), MW, 8.5, 'bold').forEach((line) => {
        font(8.5, 'bold', COLOR.body);
        doc.text(line, MX, y);
        y += lh(8.5, 1.35);
      });
      y += 1.6;
    }
    if (p.colegiado) {
      pill(`${t('colegiado')} ${p.colegiado}`, MX, y, {
        alignLeft: true, size: 7.5, bold: true, color: COLOR.accent, fill: COLOR.soft, stroke: [191, 219, 254]
      });
      y += 4;
    }
    y += 4;

    // ---------- perfil ----------
    const perfil = pick(data.perfil);
    if (perfil) {
      sectionTitle(t('pdfSecPerfil'));
      wrap(perfil, MW, 9.2).forEach((line) => {
        ensure(lh(9.2, 1.5));
        font(9.2, 'normal', COLOR.body);
        doc.text(line, MX, y);
        y += lh(9.2, 1.5);
      });
      y += 2;
    }

    // ---------- experiencia: línea de tiempo ----------
    const exp = data.experiencia || [];
    if (exp.length) {
      sectionTitle(t('pdfSecExperiencia'), 30);
      const TX = MX + 5;           // texto desplazado a la derecha de la línea
      const TW = MR - TX;
      exp.forEach((e, idx) => {
        const periodo = clean(pick(e.periodo));
        font(7.5, 'normal', COLOR.muted);
        const pillW = doc.getTextWidth(periodo) + 5;
        const titleLines = wrap(pick(e.cargo), TW - pillW - 4, 10.5, 'bold');
        const bullets = (pick(e.logros) || []).map((b) => wrap(b, TW - 4, 8.8));
        const bulletsH = bullets.reduce((s, l) => s + l.length * lh(8.8, 1.42) + 0.9, 0);
        const blockH = titleLines.length * lh(10.5, 1.25) + lh(9, 1.6) + bulletsH + 4;
        ensure(Math.min(blockH, PAGE.h - PAGE.top - PAGE.bottom - 10));

        const startPage = doc.getNumberOfPages();
        const dotY = y - 1.3;

        titleLines.forEach((line, i) => {
          font(10.5, 'bold', COLOR.ink);
          doc.text(line, TX, y);
          if (i === 0) pill(periodo, MR, y, { size: 7.5 });
          y += lh(10.5, 1.25);
        });

        font(9, 'bold', COLOR.accent);
        const empresa = clean(e.empresa);
        doc.text(empresa, TX, y);
        const nota = clean(pick(e.nota));
        if (nota) {
          const ew = doc.getTextWidth(empresa + ' ');
          const notaLines = wrap(nota, TW - ew, 8.3);
          font(8.3, 'normal', COLOR.muted);
          if (notaLines.length === 1) doc.text(notaLines[0], TX + ew, y);
          else { y += lh(9, 1.4); doc.text(clean(nota), TX, y); }
        }
        y += lh(9, 1.6);

        bullets.forEach((lines) => {
          if (ensure(lines.length * lh(8.8, 1.42))) { /* salto dentro del puesto */ }
          doc.setFillColor(...COLOR.accentBright);
          doc.triangle(TX, y - 2.3, TX, y - 0.3, TX + 1.7, y - 1.3, 'F');
          font(8.8, 'normal', COLOR.body);
          lines.forEach((line) => {
            doc.text(line, TX + 4, y);
            y += lh(8.8, 1.42);
          });
          y += 0.9;
        });

        // Punto y trazo de la línea de tiempo (solo si el puesto no se partió)
        if (doc.getNumberOfPages() === startPage) {
          const last = idx === exp.length - 1;
          doc.setDrawColor(...COLOR.rule);
          doc.setLineWidth(0.4);
          doc.line(MX + 1.2, dotY + 1.6, MX + 1.2, last ? y - 3 : y + 2.6);
        }
        doc.setPage(startPage);
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(...COLOR.accentBright);
        doc.setLineWidth(0.6);
        doc.circle(MX + 1.2, dotY, 1.15, 'FD');
        doc.setPage(doc.getNumberOfPages());

        y += idx < exp.length - 1 ? 3.6 : 1.5;
      });
    }

    // ---------- certificaciones: tarjetas ----------
    const certs = data.certificaciones || [];
    if (certs.length) {
      sectionTitle(t('pdfSecCertificaciones'), 22);

      const destacadas = certs.filter((c) => c.estilo === 'destacada');
      const resto = certs.filter((c) => c.estilo !== 'destacada');

      // Destacadas: tarjeta completa con fondo azul suave y barra lateral
      destacadas.forEach((c) => {
        const nameLines = wrap(pick(c.nombre), MW - 22, 9.8, 'bold');
        const emisor = clean(pick(c.emisor));
        const hasVerify = c.verificacionId || c.verificacionUrl;
        const h = 5 + nameLines.length * lh(9.8, 1.25) + lh(8.3, 1.45) + (hasVerify ? lh(8, 1.5) : 0) + 2.5;
        ensure(h + 2);
        const top = y;
        doc.setFillColor(...COLOR.soft);
        doc.roundedRect(MX, top, MW, h, 1.6, 1.6, 'F');
        doc.setFillColor(...COLOR.accentBright);
        doc.rect(MX, top, 1.1, h, 'F');

        let cy = top + 5.2;
        nameLines.forEach((line, i) => {
          font(9.8, 'bold', COLOR.ink);
          doc.text(line, MX + 5, cy);
          if (i === 0) { font(8.5, 'bold', COLOR.accent); doc.text(clean(c.anio), MR - 4, cy, { align: 'right' }); }
          cy += lh(9.8, 1.25);
        });
        font(8.3, 'bold', COLOR.accent);
        doc.text(emisor, MX + 5, cy);
        cy += lh(8.3, 1.45);
        if (hasVerify) {
          let x = MX + 5;
          if (c.verificacionId) {
            const idTxt = `ID ${clean(c.verificacionId)}`;
            font(8, 'bold', COLOR.ink);
            doc.text(idTxt, x, cy);
            x += doc.getTextWidth(idTxt) + 4;
          }
          if (c.verificacionUrl) {
            const v = `${t('pdfVerify')} ${prettyUrl(c.verificacionUrl)}`;
            font(8, 'normal', COLOR.accent);
            doc.text(clean(v), x, cy);
            doc.link(x, cy - 2.8, doc.getTextWidth(clean(v)), 3.6, { url: c.verificacionUrl });
          }
        }
        y = top + h + 3.5;
      });

      // Resto: rejilla de dos columnas con barra de color según el estilo
      const GAP = 5;
      const CW = (MW - GAP) / 2;
      const barColor = (c) => (c.estilo === 'verde' ? COLOR.green : c.estilo === 'azul' ? COLOR.accentBright
        : c.estilo === 'progreso' ? COLOR.amber : [203, 213, 225]);
      const cellLayout = (c) => {
        const name = wrap(pick(c.nombre), CW - 4, 8.6, 'bold');
        const sub = wrap(`${pick(c.emisor)} · ${pick(c.estado) || c.anio}`, CW - 4, 7.4);
        return { c, name, sub, h: name.length * lh(8.6, 1.25) + sub.length * lh(7.4, 1.35) + 1.2 };
      };
      for (let i = 0; i < resto.length; i += 2) {
        const cells = [resto[i], resto[i + 1]].filter(Boolean).map(cellLayout);
        const rowH = Math.max(...cells.map((k) => k.h));
        if (ensure(rowH + 3)) {
          // Continuación en página nueva: se repite el título de la sección
          y += 3;
          font(12, 'bold', COLOR.ink);
          doc.text(clean(`${t('pdfSecCertificaciones')} ${t('pdfCont')}`), MX, y);
          doc.setFillColor(...COLOR.accentBright);
          doc.roundedRect(MX, y + 2, 10, 0.9, 0.45, 0.45, 'F');
          y += 8.5;
        }
        cells.forEach((k, j) => {
          const x = MX + j * (CW + GAP);
          doc.setFillColor(...barColor(k.c));
          doc.rect(x, y - 3.1, 0.8, rowH, 'F');
          let cy = y;
          k.name.forEach((line) => { font(8.6, 'bold', COLOR.ink); doc.text(line, x + 3.2, cy); cy += lh(8.6, 1.25); });
          k.sub.forEach((line) => { font(7.4, 'normal', COLOR.muted); doc.text(line, x + 3.2, cy); cy += lh(7.4, 1.35); });
        });
        y += rowH + 3.2;
      }
      y += 0.5;
    }

    // ---------- competencias técnicas ----------
    const skills = data.habilidades || [];
    if (skills.length) {
      sectionTitle(t('pdfSecHabilidades'), 16);
      skills.forEach((s) => {
        const tags = wrap(pick(s.tags), MW, 8.6);
        ensure(lh(9.4) + tags.length * lh(8.6, 1.42) + 2);
        font(9.4, 'bold', COLOR.ink);
        doc.text(clean(pick(s.titulo)), MX, y);
        y += lh(9.4, 1.45);
        font(8.6, 'normal', COLOR.body);
        tags.forEach((line) => { doc.text(line, MX, y); y += lh(8.6, 1.42); });
        y += 2.6;
      });
    }

    // ---------- formación complementaria: lista compacta en dos columnas ----------
    const cursos = data.cursos || [];
    if (cursos.length) {
      sectionTitle(t('pdfSecCursos'), 14);
      const GAP2 = 5;
      const CW2 = (MW - GAP2) / 2;
      const layout = (c) => {
        const name = wrap(pick(c.nombre), CW2 - 2, 7.8, 'bold');
        const sub = wrap([pick(c.institucion), pick(c.fecha)].filter(Boolean).join(' · '), CW2 - 2, 7);
        return { name, sub, h: name.length * lh(7.8, 1.22) + sub.length * lh(7, 1.3) + 0.6 };
      };
      for (let i = 0; i < cursos.length; i += 2) {
        const cells = [cursos[i], cursos[i + 1]].filter(Boolean).map(layout);
        const rowH = Math.max(...cells.map((k) => k.h));
        if (ensure(rowH + 2)) {
          y += 3;
          font(12, 'bold', COLOR.ink);
          doc.text(clean(`${t('pdfSecCursos')} ${t('pdfCont')}`), MX, y);
          doc.setFillColor(...COLOR.accentBright);
          doc.roundedRect(MX, y + 2, 10, 0.9, 0.45, 0.45, 'F');
          y += 8.5;
        }
        cells.forEach((k, j) => {
          const x = MX + j * (CW2 + GAP2);
          let cy = y;
          k.name.forEach((line) => { font(7.8, 'bold', COLOR.ink); doc.text(line, x, cy); cy += lh(7.8, 1.22); });
          k.sub.forEach((line) => { font(7, 'normal', COLOR.muted); doc.text(line, x, cy); cy += lh(7, 1.3); });
        });
        y += rowH + 2.2;
      }
      y += 1;
    }

    // Servicios: en la barra lateral de la página 2; si el CV cabe en una
    // sola página, se agregan al final de la columna principal.
    const servicios = data.servicios || [];
    const serviciosEnLateral = doc.getNumberOfPages() >= 2;
    if (servicios.length && !serviciosEnLateral) {
      sectionTitle(t('pdfSecServicios'), 14);
      servicios.forEach((s) => {
        const desc = wrap(pick(s.descripcion), MW, 8.6);
        ensure(lh(9.4) + desc.length * lh(8.6, 1.42) + 2);
        font(9.4, 'bold', COLOR.ink);
        doc.text(clean(pick(s.titulo)), MX, y);
        y += lh(9.4, 1.45);
        font(8.6, 'normal', COLOR.body);
        desc.forEach((line) => { doc.text(line, MX, y); y += lh(8.6, 1.42); });
        y += 2.6;
      });
    }

    // =====================================================
    // BARRA LATERAL (se dibuja al final, en cada página)
    // =====================================================
    const total = doc.getNumberOfPages();
    let sy = 0;
    const SX = SB_PAD;
    const sbLimit = PAGE.h - 22;

    function sideTitle(text) {
      if (sy + 14 > sbLimit) return false;
      sy += 3;
      font(7.6, 'bold', COLOR.sbHead);
      doc.text(clean(text).toUpperCase(), SX, sy, { charSpace: 0.45 });
      doc.setDrawColor(40, 52, 74);
      doc.setLineWidth(0.25);
      doc.line(SX, sy + 1.9, SX + SB_W, sy + 1.9);
      sy += 6.4;
      return true;
    }

    function sideText(text, opts = {}) {
      const size = opts.size || 8.2;
      const indent = opts.bullet ? 3 : 0;
      const lines = wrap(text, SB_W - indent, size, opts.bold ? 'bold' : 'normal');
      if (sy + lines.length * lh(size, 1.38) > sbLimit) return false;
      if (opts.bullet) {
        doc.setFillColor(...COLOR.accentBright);
        doc.rect(SX, sy - 2.1, 1.1, 1.1, 'F');
      }
      lines.forEach((line) => {
        font(size, opts.bold ? 'bold' : 'normal', opts.color || COLOR.sbText);
        doc.text(line, SX + indent, sy);
        if (opts.url) doc.link(SX + indent, sy - size * PT * 0.85, doc.getTextWidth(line), size * PT * 1.1, { url: opts.url });
        sy += lh(size, 1.38);
      });
      sy += opts.after ?? 1.1;
      return true;
    }

    function paintSidebar(n) {
      doc.setPage(n);
      doc.setFillColor(...COLOR.sidebar);
      doc.rect(0, 0, SB, PAGE.h, 'F');
      // Banda superior ligeramente más clara (eco de las tarjetas del sitio)
      doc.setFillColor(...COLOR.sidebar2);
      doc.rect(0, 0, SB, 3, 'F');
      // Filo azul, como el brillo del acento en la web
      doc.setFillColor(...COLOR.accentBright);
      doc.rect(SB - 0.7, 0, 0.7, PAGE.h, 'F');

      // Pie de la barra: enlace a la versión web
      if (p.sitio) {
        font(6.8, 'normal', COLOR.sbMuted);
        doc.text(clean(t('pdfWebVersion')), SX, PAGE.h - 13.5);
        font(7.4, 'bold', COLOR.sbHead);
        const u = prettyUrl(p.sitio);
        doc.text(u, SX, PAGE.h - 9.8);
        doc.link(SX, PAGE.h - 12.6, doc.getTextWidth(u), 3.6, { url: p.sitio });
      }
    }

    for (let n = 1; n <= total; n++) paintSidebar(n);

    // ---------- página 1: foto, contacto, clave, formación, idiomas ----------
    doc.setPage(1);
    const PH = 38;
    const pcx = SB / 2;
    const pcy = PAGE.top + 3 + PH / 2;
    if (photo) {
      try {
        doc.addImage(photo.data, photo.format || 'JPEG', pcx - PH / 2, pcy - PH / 2, PH, PH, undefined, 'FAST');
      } catch (err) {
        console.warn('[PDF] Foto omitida:', err);
        photo = null;
      }
    }
    if (!photo) {
      doc.setFillColor(...COLOR.sidebar2);
      doc.circle(pcx, pcy, PH / 2, 'F');
      const parts = clean(p.nombre).split(/\s+/);
      font(20, 'bold', COLOR.sbHead);
      doc.text(((parts[0] || '')[0] || '') + ((parts[2] || parts[1] || '')[0] || ''), pcx, pcy + 2.5, { align: 'center' });
    }
    doc.setDrawColor(...COLOR.accentBright);
    doc.setLineWidth(0.9);
    doc.circle(pcx, pcy, PH / 2 + 0.5, 'S');
    sy = pcy + PH / 2 + 9;

    if (sideTitle(t('pdfSecContacto'))) {
      const digits = String(p.telefono || '').replace(/[^0-9]/g, '');
      if (p.telefono) sideText(p.telefono, { url: `tel:+${digits}` });
      if (p.correo) sideText(p.correo, { url: `mailto:${p.correo}` });
      if (pick(p.ubicacion)) sideText(pick(p.ubicacion));
      if (p.linkedin) sideText(prettyUrl(p.linkedin), { url: p.linkedin, color: COLOR.sbHead });
      if (p.credly) sideText(t('pdfCredly'), { url: p.credly, color: COLOR.sbHead });
      if (p.sitio) sideText(prettyUrl(p.sitio), { url: p.sitio, color: COLOR.sbHead });
    }

    const clave = pick(data.competenciasClave) || [];
    if (clave.length && sideTitle(t('pdfSecClave'))) {
      clave.forEach((c) => sideText(c, { bullet: true, after: 0.9 }));
    }

    const educacion = data.educacion || [];
    if (educacion.length && sideTitle(t('pdfSecEducacion'))) {
      educacion.forEach((ed) => {
        sideText(pick(ed.titulo), { bold: true, after: 0.3 });
        const det = [pick(ed.institucion), pick(ed.detalle)].filter(Boolean).join(' · ');
        if (det) sideText(det, { size: 7.5, color: COLOR.sbMuted, after: 2.4 });
      });
    }

    const idiomas = pick(data.idiomas) || [];
    if (idiomas.length && sideTitle(t('pdfSecIdiomas'))) {
      idiomas.forEach((l) => sideText(l, { after: 0.6 }));
    }

    // ---------- página 2: nombre + servicios ----------
    if (total >= 2) {
      doc.setPage(2);
      sy = PAGE.top + 6;
      wrap(p.nombre, SB_W, 12, 'bold').forEach((line) => {
        font(12, 'bold', [255, 255, 255]);
        doc.text(line, SX, sy);
        sy += lh(12, 1.15);
      });
      sideText(titular, { size: 7.8, color: COLOR.sbMuted, after: 4 });
      if (serviciosEnLateral && servicios.length && sideTitle(t('pdfSecServicios'))) {
        servicios.forEach((s) => {
          sideText(pick(s.titulo), { bold: true, after: 0.4 });
          sideText(pick(s.descripcion), { size: 7.5, color: COLOR.sbMuted, after: 3.2 });
        });
      }
    }

    // ---------- pie de página en la columna principal ----------
    for (let n = 1; n <= total; n++) {
      doc.setPage(n);
      const fy = PAGE.h - 10;
      doc.setDrawColor(...COLOR.rule);
      doc.setLineWidth(0.2);
      doc.line(MX, fy - 4, MR, fy - 4);
      font(7.2, 'normal', COLOR.muted);
      doc.text(clean(`${p.nombre} — ${t('pdfSubject')}`), MX, fy);
      doc.text(t('pdfPage', { n, t: total }), MR, fy, { align: 'right' });
    }
    doc.setPage(total);

    doc.setProperties({
      title: `${clean(p.nombre)} — ${t('pdfSubject')}`,
      subject: clean(titular),
      author: clean(p.nombre),
      keywords: (data.habilidades || []).map((s) => clean(pick(s.titulo))).join(', '),
      creator: 'CV web — ' + clean(p.nombre)
    });
    if (typeof doc.setLanguage === 'function') {
      try { doc.setLanguage(i18n.lang === 'en' ? 'en-US' : 'es'); } catch (_) {}
    }
    return doc;
  }

  /**
   * Carga la foto y la recorta en círculo sobre el color de la barra lateral
   * (mismo encuadre que en la web: centro horizontal, 25 % vertical).
   */
  function loadPhoto(src) {
    return new Promise((resolve) => {
      if (!src) return resolve(null);
      const img = new Image();
      if (!/^data:/.test(src)) img.crossOrigin = 'anonymous';
      const timer = setTimeout(() => resolve(null), 6000);
      img.onload = () => {
        clearTimeout(timer);
        try {
          const size = 640;
          const side = Math.min(img.naturalWidth, img.naturalHeight);
          const sx = (img.naturalWidth - side) / 2;
          const sy = (img.naturalHeight - side) * 0.25;
          const canvas = document.createElement('canvas');
          canvas.width = canvas.height = size;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = SIDEBAR_HEX;
          ctx.fillRect(0, 0, size, size);
          ctx.save();
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
          ctx.restore();
          resolve({ data: canvas.toDataURL('image/jpeg', 0.92), format: 'JPEG' });
        } catch (err) {
          // Abriendo index.html con doble clic (file://) el navegador bloquea
          // leer la imagen; en el servidor web sí se incluye.
          console.warn('[PDF] No se pudo leer la foto (¿abierto como file://?):', err);
          resolve(null);
        }
      };
      img.onerror = () => { clearTimeout(timer); resolve(null); };
      img.src = src;
    });
  }

  async function exportCvPdf(data) {
    const JsPDF = root.jspdf && root.jspdf.jsPDF;
    if (!JsPDF) throw new Error('jsPDF no está cargado');
    const photo = await loadPhoto(data.personal.foto);
    const i18n = { lang: root.I18n.lang, t: root.I18n.t.bind(root.I18n), pick: root.I18n.pick.bind(root.I18n) };
    const doc = buildCvPdf(JsPDF, data, i18n, photo);
    doc.save(`CV_Victor_Estrada_${i18n.lang.toUpperCase()}.pdf`);
  }

  root.CVPdf = { buildCvPdf, exportCvPdf };
  if (typeof module !== 'undefined' && module.exports) module.exports = { buildCvPdf };
})(typeof window !== 'undefined' ? window : globalThis);
