/**
 * i18n.js — Textos fijos de la interfaz (ES/EN) y estado del idioma.
 * El contenido editable (perfil, experiencia, etc.) vive en data.js.
 */
(function () {
  'use strict';

  const STRINGS = {
    es: {
      pageTitle: 'Víctor Manuel Estrada Funes | CV y Consultoría',
      metaDescription: 'Currículum de Víctor Manuel Estrada Funes: infraestructura de TI, centros de datos, continuidad del negocio y automatización.',
      skipLink: 'Saltar al contenido',
      navPerfil: 'Perfil',
      navServicios: 'Servicios',
      navExperiencia: 'Experiencia',
      navHabilidades: 'Habilidades',
      navCertificaciones: 'Certificaciones',
      btnPdf: 'Exportar PDF',
      btnPdfLoading: 'Generando…',
      btnLang: 'English',
      btnLangAria: 'Switch to English',
      menuOpen: 'Abrir menú',
      menuClose: 'Cerrar menú',
      colegiado: 'Colegiado n.º',
      secPerfil: 'Perfil profesional',
      secServicios: 'Servicios de consultoría e infraestructura',
      secExperiencia: 'Experiencia profesional',
      secHabilidades: 'Competencias técnicas',
      secCertificaciones: 'Certificaciones destacadas',
      phone: 'Teléfono',
      email: 'Correo',
      location: 'Ubicación',
      verify: 'Verificar',
      verifyTitle: 'Abre el portal oficial de verificación y copia el ID',
      copyId: 'Copiar ID',
      copied: 'ID copiado. Pégalo (Ctrl+V) en el campo del portal de verificación.',
      copiedVerify: 'ID copiado. Si el portal muestra «Session expired», espera a que cargue su página de inicio y pulsa Verificar de nuevo.',
      copyFail: 'No se pudo copiar automáticamente. Selecciona el ID y cópialo manualmente.',
      pdfError: 'No se pudo generar el PDF. Revisa tu conexión e inténtalo de nuevo.',
      pdfDone: 'PDF descargado.',
      footer: 'Todos los derechos reservados.',
      photoAlt: 'Fotografía de Víctor Manuel Estrada Funes',
      // PDF
      pdfSecPerfil: 'Perfil profesional',
      pdfSecExperiencia: 'Experiencia profesional',
      pdfSecHabilidades: 'Competencias técnicas',
      pdfSecCertificaciones: 'Certificaciones',
      pdfSecServicios: 'Servicios de consultoría',
      pdfVerify: 'Verificable en',
      pdfPage: 'Página {n} de {t}',
      pdfSubject: 'Currículum vitae'
    },
    en: {
      pageTitle: 'Víctor Manuel Estrada Funes | Résumé & Consulting',
      metaDescription: 'Résumé of Víctor Manuel Estrada Funes: IT infrastructure, data centers, business continuity and automation.',
      skipLink: 'Skip to content',
      navPerfil: 'Profile',
      navServicios: 'Services',
      navExperiencia: 'Experience',
      navHabilidades: 'Skills',
      navCertificaciones: 'Certifications',
      btnPdf: 'Export PDF',
      btnPdfLoading: 'Generating…',
      btnLang: 'Español',
      btnLangAria: 'Cambiar a español',
      menuOpen: 'Open menu',
      menuClose: 'Close menu',
      colegiado: 'Professional Registration No.',
      secPerfil: 'Professional profile',
      secServicios: 'Consulting & infrastructure services',
      secExperiencia: 'Professional experience',
      secHabilidades: 'Technical skills',
      secCertificaciones: 'Featured certifications',
      phone: 'Phone',
      email: 'Email',
      location: 'Location',
      verify: 'Verify',
      verifyTitle: 'Opens the official verification portal and copies the ID',
      copyId: 'Copy ID',
      copied: 'ID copied. Paste it (Ctrl+V) into the verification portal field.',
      copiedVerify: 'ID copied. If the portal shows "Session expired", wait for its home page to load and click Verify again.',
      copyFail: 'Could not copy automatically. Select the ID and copy it manually.',
      pdfError: 'The PDF could not be generated. Check your connection and try again.',
      pdfDone: 'PDF downloaded.',
      footer: 'All rights reserved.',
      photoAlt: 'Photo of Víctor Manuel Estrada Funes',
      // PDF
      pdfSecPerfil: 'Professional profile',
      pdfSecExperiencia: 'Professional experience',
      pdfSecHabilidades: 'Technical skills',
      pdfSecCertificaciones: 'Certifications',
      pdfSecServicios: 'Consulting services',
      pdfVerify: 'Verifiable at',
      pdfPage: 'Page {n} of {t}',
      pdfSubject: 'Résumé'
    }
  };

  const LANG_KEY = 'cv_lang';
  const SUPPORTED = ['es', 'en'];

  function initialLang() {
    const fromUrl = new URLSearchParams(location.search).get('lang');
    if (SUPPORTED.includes(fromUrl)) return fromUrl;
    try {
      const saved = localStorage.getItem(LANG_KEY);
      if (SUPPORTED.includes(saved)) return saved;
    } catch (_) { /* almacenamiento bloqueado */ }
    return 'es';
  }

  let current = initialLang();

  const I18n = {
    get lang() { return current; },
    set(lang) {
      if (!SUPPORTED.includes(lang)) return;
      current = lang;
      try { localStorage.setItem(LANG_KEY, lang); } catch (_) {}
      document.documentElement.lang = lang;
    },
    toggle() { this.set(current === 'es' ? 'en' : 'es'); },
    /** Texto fijo de la interfaz. */
    t(key, vars) {
      let str = (STRINGS[current] && STRINGS[current][key]) || STRINGS.es[key] || key;
      if (vars) Object.keys(vars).forEach((k) => { str = str.replace(`{${k}}`, vars[k]); });
      return str;
    },
    /** Campo bilingüe de data.js: { es, en } → texto en el idioma actual. */
    pick(field) {
      if (field == null) return '';
      if (typeof field === 'string' || Array.isArray(field)) return field;
      const val = field[current];
      const empty = val == null || val === '' || (Array.isArray(val) && val.length === 0);
      return empty ? (field.es ?? '') : val;
    }
  };

  document.documentElement.lang = current;
  window.I18n = I18n;
})();
