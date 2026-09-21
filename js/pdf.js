/**
 * pdf.js — Exportación del CV a PDF con texto real (jsPDF).
 *
 * Antes se "fotografiaba" la página con html2pdf: el texto quedaba como
 * imagen (no seleccionable, borroso, ilegible para los sistemas ATS de
 * reclutamiento) y los cortes de página partían tarjetas por la mitad.
 * Ahora el documento se compone línea por línea: texto vectorial, enlaces
 * clicables, saltos de página controlados, pie con numeración y metadatos.
 */
(function (root) {
  'use strict';

  const PAGE = { w: 210, h: 297, left: 17, right: 17, top: 17, bottom: 20 };
  const CONTENT_W = PAGE.w - PAGE.left - PAGE.right;
  const PT = 0.3528; // mm por punto tipográfico

  const COLOR = {
    ink: [17, 24, 39],
    body: [55, 65, 81],
    muted: [107, 114, 128],
    accent: [37, 99, 235],
    rule: [214, 220, 229],
    soft: [239, 244, 255]
  };

  /** Caracteres que la fuente estándar de PDF no incluye → equivalentes seguros. */
  function clean(str) {
    return String(str ?? '')
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/\u2026/g, '...')
      .replace(/\u00A0/g, ' ')
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
   * @param {Object}   [photo] { data: dataURL, format: 'JPEG' }
   */
  function buildCvPdf(JsPDF, data, i18n, photo) {
    const { t, pick } = i18n;
    const doc = new JsPDF({ unit: 'mm', format: 'a4', compress: true });
    const p = data.personal;
    let y = PAGE.top;

    // ---------- utilidades de composición ----------
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
        y = PAGE.top;
        return true;
      }
      return false;
    }

    /** Escribe segmentos en línea (con enlaces opcionales) y salta de línea si no caben. */
    function inlineSegments(segments, x0, maxW, size, sep) {
      const lineH = lh(size, 1.55);
      let x = x0;
      segments.forEach((seg, i) => {
        font(size, seg.bold ? 'bold' : 'normal', seg.color || COLOR.body);
        const label = clean(seg.text);
        const sepW = i > 0 ? doc.getTextWidth(sep) : 0;
        const w = doc.getTextWidth(label);
        if (i > 0 && x + sepW + w > x0 + maxW) {
          y += lineH;
          x = x0;
        } else if (i > 0) {
          font(size, 'normal', COLOR.rule);
          doc.text(sep, x, y);
          x += sepW;
          font(size, seg.bold ? 'bold' : 'normal', seg.color || COLOR.body);
        }
        doc.text(label, x, y);
        if (seg.url) doc.link(x, y - size * PT * 0.8, w, size * PT, { url: seg.url });
        x += w;
      });
      y += lineH;
    }

    function sectionTitle(title, minFollowing) {
      const h = lh(11) + 4.5;
      ensure(h + (minFollowing || 12));
      y += 2.5;
      font(11, 'bold', COLOR.accent);
      doc.text(clean(title), PAGE.left, y);
      doc.setDrawColor(...COLOR.rule);
      doc.setLineWidth(0.25);
      doc.line(PAGE.left, y + 1.8, PAGE.w - PAGE.right, y + 1.8);
      y += 7;
    }

    // ---------- cabecera ----------
    const photoSize = 30;
    const headerTextW = photo ? CONTENT_W - photoSize - 6 : CONTENT_W;
    const headerTop = y;

    if (photo) {
      const px = PAGE.w - PAGE.right - photoSize;
      try {
        doc.addImage(photo.data, photo.format || 'JPEG', px, headerTop - 4, photoSize, photoSize, undefined, 'FAST');
        doc.setDrawColor(...COLOR.rule);
        doc.setLineWidth(0.3);
        doc.rect(px, headerTop - 4, photoSize, photoSize);
      } catch (err) {
        console.warn('[PDF] Foto omitida:', err);
      }
    }

    font(21, 'bold', COLOR.ink);
    y += 3;
    wrap(p.nombre, headerTextW, 21, 'bold').forEach((line) => {
      doc.text(line, PAGE.left, y);
      y += lh(21, 1.15);
    });

    y += 0.5;
    wrap(pick(p.titulo), headerTextW, 10.5, 'bold').forEach((line) => {
      font(10.5, 'bold', COLOR.accent);
      doc.text(line, PAGE.left, y);
      y += lh(10.5);
    });

    font(9, 'normal', COLOR.muted);
    doc.text(clean(`${t('colegiado')} ${p.colegiado}`), PAGE.left, y);
    y += lh(9) + 2.5;

    const digits = String(p.telefono).replace(/[^0-9]/g, '');
    inlineSegments([
      { text: p.telefono, url: `tel:+${digits}` },
      { text: p.correo, url: `mailto:${p.correo}` },
      { text: pick(p.ubicacion) }
    ], PAGE.left, headerTextW, 8.5, '   |   ');

    const links = [];
    if (p.linkedin) links.push({ text: prettyUrl(p.linkedin), url: p.linkedin, color: COLOR.accent });
    if (p.credly) links.push({ text: prettyUrl(p.credly), url: p.credly, color: COLOR.accent });
    if (links.length) inlineSegments(links, PAGE.left, headerTextW, 8.5, '   |   ');

    y = Math.max(y, headerTop - 4 + (photo ? photoSize : 0) + 3);
    doc.setDrawColor(...COLOR.accent);
    doc.setLineWidth(0.7);
    doc.line(PAGE.left, y, PAGE.w - PAGE.right, y);
    y += 6;

    // ---------- perfil ----------
    const perfil = pick(data.perfil);
    if (perfil) {
      sectionTitle(t('pdfSecPerfil'));
      const lines = wrap(perfil, CONTENT_W, 9.5);
      lines.forEach((line) => {
        ensure(lh(9.5, 1.45));
        font(9.5, 'normal', COLOR.body);
        doc.text(line, PAGE.left, y);
        y += lh(9.5, 1.45);
      });
      y += 3;
    }

    // ---------- experiencia ----------
    const exp = data.experiencia || [];
    if (exp.length) {
      const first = exp[0];
      sectionTitle(t('pdfSecExperiencia'), 22 + (pick(first.logros) || []).length * 4);
      exp.forEach((e, idx) => {
        const periodo = clean(pick(e.periodo));
        font(9, 'normal', COLOR.muted);
        const dateW = doc.getTextWidth(periodo);
        const titleLines = wrap(pick(e.cargo), CONTENT_W - dateW - 6, 10.5, 'bold');
        const bullets = (pick(e.logros) || []).map((b) => wrap(b, CONTENT_W - 5, 9));
        const bulletsH = bullets.reduce((s, l) => s + l.length * lh(9, 1.4) + 1, 0);
        const blockH = titleLines.length * lh(10.5) + lh(9.5, 1.5) + bulletsH + 3;
        ensure(Math.min(blockH, PAGE.h - PAGE.top - PAGE.bottom));

        font(10.5, 'bold', COLOR.ink);
        titleLines.forEach((line, i) => {
          doc.text(line, PAGE.left, y);
          if (i === 0) {
            font(9, 'normal', COLOR.muted);
            doc.text(periodo, PAGE.w - PAGE.right, y, { align: 'right' });
            font(10.5, 'bold', COLOR.ink);
          }
          y += lh(10.5);
        });

        font(9.5, 'bold', COLOR.accent);
        const empresa = clean(e.empresa);
        doc.text(empresa, PAGE.left, y);
        const nota = clean(pick(e.nota));
        if (nota) {
          const ew = doc.getTextWidth(empresa + ' ');
          font(9, 'normal', COLOR.muted);
          doc.text(nota, PAGE.left + ew, y);
        }
        y += lh(9.5, 1.55);

        bullets.forEach((lines) => {
          ensure(lines.length * lh(9, 1.4));
          font(9, 'bold', COLOR.accent);
          doc.text('•', PAGE.left + 1, y);
          font(9, 'normal', COLOR.body);
          lines.forEach((line) => {
            doc.text(line, PAGE.left + 5, y);
            y += lh(9, 1.4);
          });
          y += 1;
        });
        y += idx < exp.length - 1 ? 3.5 : 2;
      });
    }

    // ---------- competencias ----------
    const skills = data.habilidades || [];
    if (skills.length) {
      sectionTitle(t('pdfSecHabilidades'), 16);
      skills.forEach((s) => {
        const tags = wrap(pick(s.tags), CONTENT_W, 9);
        ensure(lh(9.5) + tags.length * lh(9, 1.4) + 2);
        font(9.5, 'bold', COLOR.ink);
        doc.text(clean(pick(s.titulo)), PAGE.left, y);
        y += lh(9.5, 1.45);
        font(9, 'normal', COLOR.body);
        tags.forEach((line) => { doc.text(line, PAGE.left, y); y += lh(9, 1.4); });
        y += 2.5;
      });
    }

    // ---------- certificaciones ----------
    const certs = data.certificaciones || [];
    if (certs.length) {
      sectionTitle(t('pdfSecCertificaciones'), 14);
      certs.forEach((c) => {
        const anio = clean(c.anio);
        font(9, 'normal', COLOR.muted);
        const aw = doc.getTextWidth(anio);
        const nameLines = wrap(pick(c.nombre), CONTENT_W - aw - 6, 9.5, 'bold');
        const emisorLines = wrap(pick(c.emisor), CONTENT_W - aw - 6, 8.5);
        const hasVerify = c.verificacionId || c.verificacionUrl;
        const h = nameLines.length * lh(9.5, 1.3) + emisorLines.length * lh(8.5, 1.35) + (hasVerify ? lh(8.5, 1.5) : 0) + 2.5;
        ensure(h);

        nameLines.forEach((line, i) => {
          font(9.5, 'bold', COLOR.ink);
          doc.text(line, PAGE.left, y);
          if (i === 0) {
            font(9, 'normal', COLOR.muted);
            doc.text(anio, PAGE.w - PAGE.right, y, { align: 'right' });
          }
          y += lh(9.5, 1.3);
        });
        font(8.5, 'normal', COLOR.muted);
        emisorLines.forEach((line) => { doc.text(line, PAGE.left, y); y += lh(8.5, 1.35); });

        if (hasVerify) {
          const segs = [];
          if (c.verificacionId) segs.push({ text: `ID: ${c.verificacionId}`, bold: true, color: COLOR.ink });
          if (c.verificacionUrl) segs.push({ text: `${t('pdfVerify')} ${prettyUrl(c.verificacionUrl)}`, url: c.verificacionUrl, color: COLOR.accent });
          inlineSegments(segs, PAGE.left, CONTENT_W, 8.5, '   |   ');
        }
        y += 2.5;
      });
    }

    // ---------- servicios ----------
    const servicios = data.servicios || [];
    if (servicios.length) {
      sectionTitle(t('pdfSecServicios'), 14);
      servicios.forEach((s) => {
        const desc = wrap(pick(s.descripcion), CONTENT_W, 9);
        ensure(lh(9.5) + desc.length * lh(9, 1.4) + 2);
        font(9.5, 'bold', COLOR.ink);
        doc.text(clean(pick(s.titulo)), PAGE.left, y);
        y += lh(9.5, 1.45);
        font(9, 'normal', COLOR.body);
        desc.forEach((line) => { doc.text(line, PAGE.left, y); y += lh(9, 1.4); });
        y += 2.5;
      });
    }

    // ---------- pie de página en todas las hojas ----------
    const total = doc.getNumberOfPages();
    for (let n = 1; n <= total; n++) {
      doc.setPage(n);
      const fy = PAGE.h - 11;
      doc.setDrawColor(...COLOR.rule);
      doc.setLineWidth(0.2);
      doc.line(PAGE.left, fy - 4, PAGE.w - PAGE.right, fy - 4);
      font(7.5, 'normal', COLOR.muted);
      doc.text(clean(`${p.nombre} — ${t('pdfSubject')}`), PAGE.left, fy);
      doc.text(t('pdfPage', { n, t: total }), PAGE.w - PAGE.right, fy, { align: 'right' });
    }

    doc.setProperties({
      title: `${clean(p.nombre)} — ${t('pdfSubject')}`,
      subject: t('pdfSubject'),
      author: clean(p.nombre),
      keywords: (data.habilidades || []).map((s) => clean(pick(s.titulo))).join(', '),
      creator: 'CV web — ' + clean(p.nombre)
    });
    if (typeof doc.setLanguage === 'function') {
      try { doc.setLanguage(i18n.lang === 'en' ? 'en-US' : 'es'); } catch (_) {}
    }
    return doc;
  }

  /** Carga la foto y la recorta cuadrada (mismo encuadre que en la web). */
  function loadPhoto(src) {
    return new Promise((resolve) => {
      if (!src) return resolve(null);
      const img = new Image();
      if (!/^data:/.test(src)) img.crossOrigin = 'anonymous';
      const timer = setTimeout(() => resolve(null), 6000);
      img.onload = () => {
        clearTimeout(timer);
        try {
          const size = 600;
          const side = Math.min(img.naturalWidth, img.naturalHeight);
          const sx = (img.naturalWidth - side) / 2;
          const sy = (img.naturalHeight - side) * 0.25; // object-position: center 25%
          const canvas = document.createElement('canvas');
          canvas.width = canvas.height = size;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, size, size);
          ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
          resolve({ data: canvas.toDataURL('image/jpeg', 0.9), format: 'JPEG' });
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
