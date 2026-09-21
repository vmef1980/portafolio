/**
 * render.js — Construye todo el contenido de index.html a partir de los datos.
 * No hay texto duplicado .es/.en en el HTML: se renderiza en el idioma activo.
 */
(function () {
  'use strict';

  const { t, pick } = {
    t: (...a) => window.I18n.t(...a),
    pick: (f) => window.I18n.pick(f)
  };

  /** Escapa HTML: los datos vienen del panel admin y no deben inyectar código. */
  function esc(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /** Solo permite enlaces http(s); cualquier otra cosa se descarta. */
  function safeUrl(url) {
    if (!url || !String(url).trim()) return '';
    try {
      const u = new URL(url, location.href);
      return ['http:', 'https:'].includes(u.protocol) ? u.href : '';
    } catch (_) { return ''; }
  }

  const $ = (sel) => document.querySelector(sel);

  function renderStaticTexts() {
    document.title = t('pageTitle');
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', t('metaDescription'));
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      el.textContent = t(el.dataset.i18n);
    });
    const langBtn = $('#btn-lang');
    langBtn.setAttribute('aria-label', t('btnLangAria'));
    const toggle = $('#menu-toggle');
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-label', t(open ? 'menuClose' : 'menuOpen'));
  }

  function renderHero(p) {
    $('#hero-name').textContent = p.nombre;
    $('#hero-title').textContent = pick(p.titulo);
    $('#hero-colegiado').textContent = `${t('colegiado')} ${p.colegiado}`;

    const img = $('#user-img');
    img.alt = t('photoAlt');
    if (img.getAttribute('src') !== p.foto) {
      img.closest('.profile-photo').classList.remove('is-missing');
      img.src = p.foto;
    }
    const initials = p.nombre.split(/\s+/).filter(Boolean);
    $('#photo-fallback').textContent =
      ((initials[0] || '')[0] || '') + ((initials[2] || initials[1] || '')[0] || '');

    const fav = $('#dynamic-favicon');
    if (fav && p.favicon) fav.href = p.favicon;

    const phoneDigits = p.telefono.replace(/[^0-9]/g, '');
    const wa = `https://wa.me/${phoneDigits}?text=${encodeURIComponent(pick(p.mensajeWhatsApp))}`;
    const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pick(p.ubicacion))}`;

    const items = [
      { icon: 'fas fa-earth-americas', href: maps, label: pick(p.ubicacion), ext: true },
      { icon: 'fas fa-phone-volume', href: `tel:+${phoneDigits}`, label: p.telefono },
      { icon: 'fab fa-whatsapp', href: wa, label: 'WhatsApp', ext: true, cls: 'contact-item--whatsapp' },
      { icon: 'fas fa-envelope-open-text', href: `mailto:${p.correo}`, label: p.correo },
      p.linkedin && { icon: 'fab fa-linkedin-in', href: safeUrl(p.linkedin), label: 'LinkedIn', ext: true },
      p.credly && { icon: 'fas fa-award', href: safeUrl(p.credly), label: 'Credly', ext: true }
    ].filter(Boolean);

    $('#contact-grid').innerHTML = items.map((it) => `
      <li><a class="contact-item spotlight ${it.cls || ''}" href="${esc(it.href)}"
        ${it.ext ? 'target="_blank" rel="noopener noreferrer"' : ''}>
        <i class="${it.icon}" aria-hidden="true"></i><span>${esc(it.label)}</span>
      </a></li>`).join('');
  }

  function renderPerfil(data) {
    $('#perfil-text').textContent = pick(data.perfil);
  }

  function renderServicios(list) {
    $('#services-grid').innerHTML = list.map((s) => `
      <article class="service-card spotlight">
        <h3>${esc(pick(s.titulo))}</h3>
        <p>${esc(pick(s.descripcion))}</p>
      </article>`).join('');
  }

  function renderExperiencia(list) {
    $('#timeline').innerHTML = list.map((e) => {
      const logros = pick(e.logros) || [];
      return `
      <article class="timeline-item spotlight">
        <header class="timeline-header">
          <div>
            <h3 class="job-title">${esc(pick(e.cargo))}</h3>
            <p class="company">${esc(e.empresa)}
              ${pick(e.nota) ? `<span class="company-note">${esc(pick(e.nota))}</span>` : ''}</p>
          </div>
          <span class="date">${esc(pick(e.periodo))}</span>
        </header>
        <ul class="timeline-body">
          ${logros.map((l) => `<li>${esc(l)}</li>`).join('')}
        </ul>
      </article>`;
    }).join('');
  }

  function renderHabilidades(list) {
    $('#skills-grid').innerHTML = list.map((s) => `
      <article class="skill-card spotlight">
        <h3>${esc(pick(s.titulo))}</h3>
        <p class="skill-tags">${esc(pick(s.tags))}</p>
      </article>`).join('');
  }

  function renderCertificaciones(list) {
    $('#cert-list').innerHTML = list.map((c) => {
      const estilo = ['destacada', 'verde', 'azul'].includes(c.estilo) ? c.estilo : 'normal';
      const url = safeUrl(c.verificacionUrl);
      const hasId = Boolean(c.verificacionId);
      return `
      <article class="cert-item spotlight cert-item--${estilo}">
        <div class="cert-info">
          <h3>${esc(pick(c.nombre))}</h3>
          <p>${esc(pick(c.emisor))}</p>
          ${hasId ? `
          <button type="button" class="cert-id" data-copy="${esc(c.verificacionId)}"
            title="${esc(t('copyId'))}" aria-label="${esc(t('copyId'))}: ${esc(c.verificacionId)}">
            <span class="cert-id__label">ID</span>
            <span class="cert-id__value">${esc(c.verificacionId)}</span>
            <i class="far fa-copy" aria-hidden="true"></i>
          </button>` : ''}
        </div>
        <div class="cert-side">
          <span class="cert-date">${esc(c.anio)}</span>
          ${url ? `
          <a class="btn-verify" href="${esc(url)}" target="_blank" rel="noopener noreferrer"
             data-verify-id="${esc(c.verificacionId || '')}" title="${esc(t('verifyTitle'))}">
            <i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i>${esc(t('verify'))}
          </a>` : ''}
        </div>
      </article>`;
    }).join('');
  }

  function renderFooter(p) {
    $('#footer-text').textContent =
      `© ${new Date().getFullYear()} ${p.nombre}. ${pick(p.ubicacion)}. ${t('footer')}`;
  }

  function renderAll(data) {
    renderStaticTexts();
    renderHero(data.personal);
    renderPerfil(data);
    renderServicios(data.servicios || []);
    renderExperiencia(data.experiencia || []);
    renderHabilidades(data.habilidades || []);
    renderCertificaciones(data.certificaciones || []);
    renderFooter(data.personal);
  }

  window.CVRender = { renderAll, esc, safeUrl };
})();
