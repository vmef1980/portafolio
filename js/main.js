/**
 * main.js — Arranque de index.html: render, idioma, menú, copiar ID,
 * verificación de certificado y exportación a PDF.
 */
(function () {
  'use strict';

  const { t } = { t: (...a) => window.I18n.t(...a) };
  let data = window.CVStore.load();

  // ---------- aviso flotante ----------
  let toastTimer = null;
  function toast(message, type = 'ok') {
    const el = document.getElementById('toast');
    el.textContent = message;
    el.dataset.type = type;
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-visible'), 6000);
  }

  // ---------- portapapeles (con respaldo para http:// y file://) ----------
  // Primero el método síncrono: se ejecuta dentro del clic, antes de que la
  // pestaña nueva del portal robe el foco (con la API asíncrona fallaba).
  function copySync(text) {
    const active = document.activeElement;
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:-1000px;left:0;opacity:0;';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (_) { ok = false; }
    ta.remove();
    if (active && typeof active.focus === 'function') active.focus({ preventScroll: true });
    return ok;
  }

  async function copyText(text) {
    if (copySync(text)) return true;
    if (navigator.clipboard && window.isSecureContext) {
      try { await navigator.clipboard.writeText(text); return true; } catch (_) { /* sin permiso */ }
    }
    return false;
  }

  // ---------- menú móvil ----------
  const navbar = document.getElementById('navbar');
  const menuToggle = document.getElementById('menu-toggle');

  function setMenu(open) {
    navbar.classList.toggle('is-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', t(open ? 'menuClose' : 'menuOpen'));
    menuToggle.querySelector('i').className = open ? 'fas fa-xmark' : 'fas fa-bars';
  }
  menuToggle.addEventListener('click', () => setMenu(!navbar.classList.contains('is-open')));
  navbar.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  // ---------- idioma ----------
  function render() { window.CVRender.renderAll(data); }

  document.getElementById('btn-lang').addEventListener('click', () => {
    window.I18n.toggle();
    render();
    setMenu(false);
  });

  // ---------- foto: si no carga, se muestran iniciales ----------
  document.getElementById('user-img').addEventListener('error', (e) => {
    e.target.closest('.profile-photo').classList.add('is-missing');
  });

  // ---------- copiar ID / verificar certificado ----------
  document.addEventListener('click', async (e) => {
    const copyBtn = e.target.closest('[data-copy]');
    if (copyBtn) {
      const ok = await copyText(copyBtn.dataset.copy);
      if (ok) {
        copyBtn.classList.add('is-copied');
        setTimeout(() => copyBtn.classList.remove('is-copied'), 1800);
      }
      toast(ok ? t('copied') : t('copyFail'), ok ? 'ok' : 'error');
      return;
    }

    // El enlace abre el portal oficial en una pestaña nueva (navegación
    // normal, sin trucos entre dominios) y a la vez copia el ID.
    const verify = e.target.closest('[data-verify-id]');
    if (verify && verify.dataset.verifyId) {
      copyText(verify.dataset.verifyId).then((ok) => toast(ok ? t('copiedVerify') : t('copyFail'), ok ? 'ok' : 'error'));
    }
  });

  // ---------- PDF ----------
  const pdfBtn = document.getElementById('btn-pdf');
  pdfBtn.addEventListener('click', async () => {
    setMenu(false);
    const label = pdfBtn.querySelector('span');
    pdfBtn.disabled = true;
    label.textContent = t('btnPdfLoading');
    try {
      await window.CVPdf.exportCvPdf(data);
      toast(t('pdfDone'));
    } catch (err) {
      console.error('[PDF]', err);
      toast(t('pdfError'), 'error');
    } finally {
      pdfBtn.disabled = false;
      label.textContent = t('btnPdf');
    }
  });

  // ---------- sección activa en el menú ----------
  if ('IntersectionObserver' in window) {
    const links = Array.from(navbar.querySelectorAll('a[href^="#"]'));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === `#${entry.target.id}`));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach((a) => { const s = document.querySelector(a.getAttribute('href')); if (s) io.observe(s); });
  }

  // ---------- cambios guardados desde admin.html en otra pestaña ----------
  window.addEventListener('storage', (e) => {
    if (e.key === window.CVStore.STORAGE_KEY) { data = window.CVStore.load(); render(); }
  });

  render();
})();
