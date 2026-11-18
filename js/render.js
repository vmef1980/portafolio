/**
 * render.js — Construye el contenido de index.html y vinculos.html a partir de los datos.
 * No hay texto duplicado .es/.en en el HTML: se renderiza en el idioma activo.
 * Cada sección se dibuja solo si su contenedor existe en la página actual.
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

  /** Solo clases de Font Awesome (letras, números, guiones y espacios). */
  function safeIcon(icon) {
    return /^[a-z0-9 -]+$/i.test(icon || '') ? icon : 'fas fa-link';
  }

  const $ = (sel) => document.querySelector(sel);
  const page = () => document.body.dataset.page || 'cv';

  function renderStaticTexts() {
    const isLinks = page() === 'vinculos';
    document.title = t(isLinks ? 'linksPageTitle' : 'pageTitle');
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', t(isLinks ? 'linksMetaDescription' : 'metaDescription'));
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      el.textContent = t(el.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      el.setAttribute('aria-label', t(el.dataset.i18nAria));
      el.setAttribute('title', t(el.dataset.i18nAria));
    });
    const langBtn = $('#btn-lang');
    if (langBtn) langBtn.setAttribute('aria-label', t('btnLangAria'));
    const toggle = $('#menu-toggle');
    if (toggle) {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-label', t(open ? 'menuClose' : 'menuOpen'));
    }
  }

  function contactItems(p) {
    const phoneDigits = p.telefono.replace(/[^0-9]/g, '');
    const wa = `https://wa.me/${phoneDigits}?text=${encodeURIComponent(pick(p.mensajeWhatsApp))}`;
    const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pick(p.ubicacion))}`;
    return [
      { icon: 'fas fa-earth-americas', href: maps, label: pick(p.ubicacion), ext: true },
      { icon: 'fas fa-phone-volume', href: `tel:+${phoneDigits}`, label: p.telefono },
      { icon: 'fab fa-whatsapp', href: wa, label: 'WhatsApp', ext: true, cls: 'contact-item--whatsapp' },
      { icon: 'fas fa-envelope-open-text', href: `mailto:${p.correo}`, label: p.correo },
      p.linkedin && { icon: 'fab fa-linkedin-in', href: safeUrl(p.linkedin), label: 'LinkedIn', ext: true },
      p.credly && { icon: 'fas fa-award', href: safeUrl(p.credly), label: 'Credly', ext: true }
    ].filter(Boolean);
  }

  function renderHero(p) {
    if (!$('#hero-name')) return;
    $('#hero-name').textContent = p.nombre;
    $('#hero-title').textContent = pick(p.titulo);
    $('#hero-colegiado').textContent = `${t('colegiado')} ${p.colegiado}`;

    const eyebrow = $('#hero-eyebrow');
    if (eyebrow) {
      eyebrow.textContent = pick(p.titular);
      eyebrow.hidden = !pick(p.titular);
    }
    const chips = $('#hero-chips');
    if (chips) {
      const items = String(pick(p.especialidad) || '').split('·').map((s) => s.trim()).filter(Boolean);
      chips.innerHTML = items.map((s) => `<li>${esc(s)}</li>`).join('');
    }

    const img = $('#user-img');
    img.alt = t('photoAlt');
    if (img.getAttribute('src') !== p.foto) {
      img.closest('.profile-photo').classList.remove('is-missing');
      img.src = p.foto;
    }
    const initials = p.nombre.split(/\s+/).filter(Boolean);
    $('#photo-fallback').textContent =
      ((initials[0] || '')[0] || '') + ((initials[2] || initials[1] || '')[0] || '');

    $('#contact-grid').innerHTML = contactItems(p).map((it) => `
      <li><a class="contact-item spotlight ${it.cls || ''}" href="${esc(it.href)}"
        ${it.ext ? 'target="_blank" rel="noopener noreferrer"' : ''}>
        <i class="${it.icon}" aria-hidden="true"></i><span>${esc(it.label)}</span>
      </a></li>`).join('');
  }

  function renderFavicon(p) {
    const fav = $('#dynamic-favicon');
    if (fav && p.favicon) fav.href = p.favicon;
  }

  function renderIndicadores(list) {
    const el = $('#stats');
    if (!el) return;
    el.hidden = !list.length;
    el.innerHTML = list.map((s) => `
      <div class="stat spotlight">
        <span class="stat__value">${esc(s.valor)}</span>
        <span class="stat__label">${esc(pick(s.etiqueta))}</span>
      </div>`).join('');
  }

  function renderPerfil(data) {
    const el = $('#perfil-text');
    if (el) el.textContent = pick(data.perfil);
  }

  function renderServicios(list) {
    const el = $('#services-grid');
    if (!el) return;
    el.innerHTML = list.map((s, i) => `
      <article class="service-card spotlight">
        <span class="service-card__num" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
        <h3>${esc(pick(s.titulo))}</h3>
        <p>${esc(pick(s.descripcion))}</p>
      </article>`).join('');
  }

  function renderExperiencia(list) {
    const el = $('#timeline');
    if (!el) return;
    el.innerHTML = list.map((e) => {
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

  function progressBadge(show) {
    return show ? `<span class="badge badge--progress"><span class="badge__dot" aria-hidden="true"></span>${esc(t('estadoProgreso'))}</span>` : '';
  }

  function renderEducacion(data) {
    const el = $('#edu-grid');
    if (!el) return;
    const list = data.educacion || [];
    el.innerHTML = list.map((ed) => `
      <article class="edu-card spotlight ${ed.estado === 'progreso' ? 'edu-card--progress' : ''}">
        <div class="edu-card__icon" aria-hidden="true"><i class="fas ${ed.estado === 'progreso' ? 'fa-shield-halved' : 'fa-graduation-cap'}"></i></div>
        <div>
          ${progressBadge(ed.estado === 'progreso')}
          <h3>${esc(pick(ed.titulo))}</h3>
          <p class="edu-card__inst">${esc(pick(ed.institucion))}</p>
          ${pick(ed.detalle) ? `<p class="edu-card__detail">${esc(pick(ed.detalle))}</p>` : ''}
        </div>
      </article>`).join('');

    const langs = $('#lang-list');
    if (langs) {
      const idiomas = pick(data.idiomas) || [];
      langs.innerHTML = idiomas.map((l) => {
        const [name, level] = String(l).split('·').map((s) => s.trim());
        return `<li class="lang-chip"><span>${esc(name)}</span>${level ? `<small>${esc(level)}</small>` : ''}</li>`;
      }).join('');
      langs.closest('.langs').hidden = !idiomas.length;
    }
  }

  function renderHabilidades(list) {
    const el = $('#skills-grid');
    if (!el) return;
    el.innerHTML = list.map((s) => {
      const tags = String(pick(s.tags) || '').replace(/\.\s*$/, '');
      // Separa por comas que no estén dentro de paréntesis
      const parts = tags.split(/,(?![^()]*\))/).map((x) => x.trim()).filter(Boolean)
        .map((x) => x.charAt(0).toLocaleUpperCase() + x.slice(1));
      return `
      <article class="skill-card spotlight">
        <h3>${esc(pick(s.titulo))}</h3>
        <ul class="skill-tags" aria-label="${esc(pick(s.titulo))}">
          ${parts.map((x) => `<li>${esc(x)}</li>`).join('')}
        </ul>
      </article>`;
    }).join('');
  }

  function renderCertificaciones(list) {
    const el = $('#cert-list');
    if (!el) return;
    el.innerHTML = list.map((c) => {
      const estilo = ['destacada', 'verde', 'azul', 'progreso'].includes(c.estilo) ? c.estilo : 'normal';
      const url = safeUrl(c.verificacionUrl);
      const hasId = Boolean(c.verificacionId);
      const estado = pick(c.estado);
      return `
      <article class="cert-item spotlight cert-item--${estilo}">
        <div class="cert-info">
          ${progressBadge(estilo === 'progreso')}
          <h3>${esc(pick(c.nombre))}</h3>
          <p>${esc(pick(c.emisor))}</p>
          ${estado ? `<p class="cert-status">${esc(estado)}</p>` : ''}
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

  function renderCursos(list) {
    const box = $('#courses');
    if (!box) return;
    box.hidden = !list.length;
    $('#courses-summary').textContent = t('cursosResumen', { n: list.length });
    $('#courses-list').innerHTML = list.map((c) => `
      <li class="course">
        <span class="course__name">${esc(pick(c.nombre))}</span>
        <span class="course__meta">${esc(pick(c.institucion))}</span>
        <span class="course__date">${esc(pick(c.fecha))}</span>
      </li>`).join('');
  }

  function renderVinculos(list) {
    const el = $('#links-groups');
    if (!el) return;
    const groups = [];
    list.forEach((v) => {
      const g = pick(v.grupo) || '';
      let group = groups.find((x) => x.name === g);
      if (!group) { group = { name: g, items: [] }; groups.push(group); }
      group.items.push(v);
    });
    el.innerHTML = groups.map((g) => `
      <section class="links-group">
        ${g.name ? `<h2>${esc(g.name)}</h2>` : ''}
        <div class="links-grid">
          ${g.items.map((v) => {
            const url = safeUrl(v.url);
            const host = url ? new URL(url).hostname.replace(/^www\./, '') : '';
            return `
            <a class="link-card spotlight" href="${esc(url || '#')}" target="_blank" rel="noopener noreferrer">
              <span class="link-card__icon" aria-hidden="true"><i class="${esc(safeIcon(v.icono))}"></i></span>
              <span class="link-card__body">
                <span class="link-card__title">${esc(pick(v.nombre))}</span>
                <span class="link-card__desc">${esc(pick(v.descripcion))}</span>
                <span class="link-card__host">${esc(host)}</span>
              </span>
              <span class="link-card__go" aria-hidden="true"><i class="fas fa-arrow-right"></i></span>
              <span class="sr-only">${esc(t('linksVisit'))}</span>
            </a>`;
          }).join('')}
        </div>
      </section>`).join('');
  }

  function renderFooter(p) {
    const el = $('#footer-text');
    if (el) el.textContent = `© ${new Date().getFullYear()} ${p.nombre}. ${pick(p.ubicacion)}. ${t('footer')}`;
  }

  function renderAll(data) {
    renderStaticTexts();
    renderFavicon(data.personal);
    renderHero(data.personal);
    renderIndicadores(data.indicadores || []);
    renderPerfil(data);
    renderServicios(data.servicios || []);
    renderExperiencia(data.experiencia || []);
    renderEducacion(data);
    renderHabilidades(data.habilidades || []);
    renderCertificaciones(data.certificaciones || []);
    renderCursos(data.cursos || []);
    renderVinculos(data.vinculos || []);
    renderFooter(data.personal);
  }

  window.CVRender = { renderAll, esc, safeUrl };
})();
