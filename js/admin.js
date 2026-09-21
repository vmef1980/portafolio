/**
 * admin.js — Panel de administración.
 * Edita TODAS las secciones (agregar, modificar, eliminar, reordenar),
 * guarda en la misma clave que lee index.html y permite publicar
 * descargando un data.js nuevo.
 */
(function () {
  'use strict';

  const { esc } = {
    esc: (v) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  };

  let state = window.CVStore.load();
  let dirty = false;

  // ---------- esquema de campos ----------
  const F = {
    text: (key, label, opts = {}) => ({ key, label, type: 'text', ...opts }),
    bi: (key, label, opts = {}) => ({ key, label, type: 'bi', ...opts }),
    biArea: (key, label, opts = {}) => ({ key, label, type: 'bi', area: true, ...opts }),
    biLines: (key, label, opts = {}) => ({ key, label, type: 'bi', lines: true, ...opts })
  };

  const LISTS = {
    servicios: {
      title: 'Servicios',
      itemName: 'servicio',
      summary: (it) => it.titulo && it.titulo.es,
      fields: [F.bi('titulo', 'Título', { required: true }), F.biArea('descripcion', 'Descripción')],
      blank: () => ({ titulo: { es: '', en: '' }, descripcion: { es: '', en: '' } })
    },
    experiencia: {
      title: 'Experiencia',
      itemName: 'puesto',
      summary: (it) => [it.cargo && it.cargo.es, it.empresa].filter(Boolean).join(' · '),
      fields: [
        F.bi('cargo', 'Cargo', { required: true }),
        F.text('empresa', 'Empresa', { required: true }),
        F.bi('nota', 'Nota junto a la empresa', { help: 'Ej.: «(antes Xerox…)» o «— El Salvador». Opcional.' }),
        F.bi('periodo', 'Período', { help: 'Ej.: 2013 – Actualidad / 2013 – Present' }),
        F.biLines('logros', 'Logros y funciones', { help: 'Un renglón por viñeta.' })
      ],
      blank: () => ({ cargo: { es: '', en: '' }, empresa: '', nota: { es: '', en: '' }, periodo: { es: '', en: '' }, logros: { es: [], en: [] } })
    },
    habilidades: {
      title: 'Competencias técnicas',
      itemName: 'bloque',
      summary: (it) => it.titulo && it.titulo.es,
      fields: [F.bi('titulo', 'Título', { required: true }), F.biArea('tags', 'Tecnologías', { help: 'Separadas por comas.' })],
      blank: () => ({ titulo: { es: '', en: '' }, tags: { es: '', en: '' } })
    },
    certificaciones: {
      title: 'Certificaciones',
      itemName: 'certificación',
      summary: (it) => [it.nombre && it.nombre.es, it.anio].filter(Boolean).join(' · '),
      fields: [
        F.bi('nombre', 'Nombre', { required: true }),
        F.bi('emisor', 'Emisor / descripción'),
        F.text('anio', 'Año', { half: true }),
        { key: 'estilo', label: 'Estilo de tarjeta', type: 'select', half: true,
          options: [['normal', 'Normal'], ['destacada', 'Destacada (ancho completo, azul)'], ['azul', 'Acento azul'], ['verde', 'Acento verde']] },
        F.text('verificacionId', 'ID de verificación', { half: true, help: 'Se muestra con botón «Copiar ID».' }),
        F.text('verificacionUrl', 'URL de verificación', { half: true, inputType: 'url', help: 'Muestra el botón «Verificar».' })
      ],
      blank: () => ({ nombre: { es: '', en: '' }, emisor: { es: '', en: '' }, anio: String(new Date().getFullYear()), estilo: 'normal', verificacionId: '', verificacionUrl: '' })
    }
  };

  const PERSONAL = [
    F.text('personal.nombre', 'Nombre completo', { required: true }),
    F.bi('personal.titulo', 'Título profesional', { required: true }),
    F.text('personal.colegiado', 'Número de colegiado', { half: true }),
    F.text('personal.telefono', 'Teléfono (también se usa para WhatsApp)', { half: true, required: true, help: 'Incluye el código de país: (502) …' }),
    F.text('personal.correo', 'Correo electrónico', { half: true, required: true, inputType: 'email' }),
    F.bi('personal.ubicacion', 'Ubicación'),
    F.text('personal.linkedin', 'LinkedIn', { half: true, inputType: 'url' }),
    F.text('personal.credly', 'Credly', { half: true, inputType: 'url' }),
    F.biArea('personal.mensajeWhatsApp', 'Mensaje inicial de WhatsApp'),
    F.text('personal.favicon', 'Ruta del favicon', { half: true, help: 'Ej.: img/perfil.ico' })
  ];

  // ---------- acceso por ruta "a.b.0.c" ----------
  function getPath(obj, path) {
    return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
  }
  function setPath(obj, path, value) {
    const keys = path.split('.');
    const last = keys.pop();
    const target = keys.reduce((o, k) => {
      if (o[k] == null) o[k] = /^\d+$/.test(k) ? [] : {};
      return o[k];
    }, obj);
    target[last] = value;
  }

  // ---------- render de campos ----------
  function fieldId(path) { return 'f-' + path.replace(/\./g, '-'); }

  function inputHtml(path, value, def, lang) {
    const id = fieldId(path);
    const req = def.required && (!lang || lang === 'es') ? 'required' : '';
    const langAttr = lang ? ` lang="${lang}"` : '';
    if (def.lines) {
      const text = Array.isArray(value) ? value.join('\n') : (value || '');
      return `<textarea id="${id}" data-path="${path}" data-kind="lines" rows="5"${langAttr} ${req}>${esc(text)}</textarea>`;
    }
    if (def.area) {
      return `<textarea id="${id}" data-path="${path}" rows="4"${langAttr} ${req}>${esc(value)}</textarea>`;
    }
    return `<input id="${id}" type="${def.inputType || 'text'}" data-path="${path}" value="${esc(value)}"${langAttr} ${req}>`;
  }

  function fieldHtml(def, base) {
    const path = base ? `${base}.${def.key}` : def.key;
    const value = getPath(state, path);
    const help = def.help ? `<p class="help">${esc(def.help)}</p>` : '';
    const reqMark = def.required ? ' <span class="req" aria-hidden="true">*</span>' : '';

    if (def.type === 'bi') {
      const v = value || {};
      return `
        <fieldset class="field field--bi">
          <legend>${esc(def.label)}${reqMark}</legend>
          <div class="bi-grid">
            <label class="bi-col"><span class="lang-tag">ES</span>${inputHtml(path + '.es', v.es, def, 'es')}</label>
            <label class="bi-col"><span class="lang-tag">EN</span>${inputHtml(path + '.en', v.en, def, 'en')}</label>
          </div>
          ${help}
        </fieldset>`;
    }
    if (def.type === 'select') {
      return `
        <div class="field ${def.half ? 'field--half' : ''}">
          <label for="${fieldId(path)}">${esc(def.label)}</label>
          <select id="${fieldId(path)}" data-path="${path}">
            ${def.options.map(([val, txt]) => `<option value="${val}" ${val === value ? 'selected' : ''}>${esc(txt)}</option>`).join('')}
          </select>${help}
        </div>`;
    }
    return `
      <div class="field ${def.half ? 'field--half' : ''}">
        <label for="${fieldId(path)}">${esc(def.label)}${reqMark}</label>
        ${inputHtml(path, value, def)}${help}
      </div>`;
  }

  function renderPersonal() {
    document.getElementById('personal-fields').innerHTML =
      `<div class="fields">${PERSONAL.map((d) => fieldHtml(d)).join('')}</div>`;
    const perfilDef = F.biArea('perfil', 'Descripción del perfil', { required: true });
    document.getElementById('perfil-fields').innerHTML = fieldHtml(perfilDef);
    updatePhotoPreview();
  }

  function renderList(name, openIndex) {
    const cfg = LISTS[name];
    const items = state[name] || [];
    const container = document.getElementById(`list-${name}`);
    container.innerHTML = items.length ? items.map((item, i) => `
      <details class="item" data-list="${name}" data-index="${i}" ${i === openIndex ? 'open' : ''}>
        <summary>
          <span class="item__num">${i + 1}</span>
          <span class="item__title">${esc(cfg.summary(item) || `Nuevo ${cfg.itemName}`)}</span>
          <span class="item__actions">
            <button type="button" class="icon-btn" data-action="up" aria-label="Subir" title="Subir" ${i === 0 ? 'disabled' : ''}>↑</button>
            <button type="button" class="icon-btn" data-action="down" aria-label="Bajar" title="Bajar" ${i === items.length - 1 ? 'disabled' : ''}>↓</button>
            <button type="button" class="icon-btn icon-btn--danger" data-action="delete" aria-label="Eliminar" title="Eliminar">✕</button>
          </span>
        </summary>
        <div class="fields">${cfg.fields.map((d) => fieldHtml(d, `${name}.${i}`)).join('')}</div>
      </details>`).join('')
      : `<p class="empty">No hay ningún ${cfg.itemName}. Usa «Agregar ${cfg.itemName}» para crear el primero.</p>`;
    document.getElementById(`count-${name}`).textContent = items.length;
  }

  function renderAll() {
    renderPersonal();
    Object.keys(LISTS).forEach((n) => renderList(n));
  }

  // ---------- estado sucio ----------
  function setDirty(value) {
    dirty = value;
    const status = document.getElementById('save-status');
    status.textContent = value ? 'Cambios sin guardar' : (window.CVStore.hasLocalChanges() ? 'Guardado en este navegador' : 'Sin cambios');
    status.dataset.state = value ? 'dirty' : 'clean';
  }

  // ---------- edición ----------
  document.addEventListener('input', (e) => {
    const el = e.target.closest('[data-path]');
    if (!el) return;
    let value = el.value;
    if (el.dataset.kind === 'lines') value = value.split('\n').map((s) => s.trim()).filter(Boolean);
    setPath(state, el.dataset.path, value);
    el.classList.remove('is-invalid');
    setDirty(true);

    const item = el.closest('.item');
    if (item) {
      const cfg = LISTS[item.dataset.list];
      const data = state[item.dataset.list][Number(item.dataset.index)];
      item.querySelector('.item__title').textContent = cfg.summary(data) || `Nuevo ${cfg.itemName}`;
    }
    if (el.dataset.path === 'personal.foto') updatePhotoPreview();
  });
  document.addEventListener('change', (e) => {
    if (e.target.matches('select[data-path]')) {
      setPath(state, e.target.dataset.path, e.target.value);
      setDirty(true);
    }
  });

  // Acciones de lista: subir / bajar / eliminar / agregar
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;

    if (action === 'add') {
      const name = btn.dataset.list;
      state[name] = state[name] || [];
      state[name].push(LISTS[name].blank());
      renderList(name, state[name].length - 1);
      setDirty(true);
      const last = document.querySelector(`#list-${name} .item:last-child`);
      if (last) { last.scrollIntoView({ behavior: 'smooth', block: 'center' }); const f = last.querySelector('input, textarea'); if (f) f.focus({ preventScroll: true }); }
      return;
    }

    const item = btn.closest('.item');
    if (!item) return;
    e.preventDefault(); // evita abrir/cerrar el <details>
    const name = item.dataset.list;
    const i = Number(item.dataset.index);
    const list = state[name];

    if (action === 'delete') {
      const label = LISTS[name].summary(list[i]) || LISTS[name].itemName;
      if (!confirm(`¿Eliminar «${label}»?`)) return;
      list.splice(i, 1);
      renderList(name);
    } else if (action === 'up' && i > 0) {
      [list[i - 1], list[i]] = [list[i], list[i - 1]];
      renderList(name, i - 1);
    } else if (action === 'down' && i < list.length - 1) {
      [list[i + 1], list[i]] = [list[i], list[i + 1]];
      renderList(name, i + 1);
    }
    setDirty(true);
  });

  // ---------- validación ----------
  function validate() {
    const errors = [];
    document.querySelectorAll('.is-invalid').forEach((el) => el.classList.remove('is-invalid'));

    document.querySelectorAll('[data-path]').forEach((el) => {
      let msg = '';
      if (el.required && !el.value.trim()) msg = 'es obligatorio';
      else if (el.type === 'email' && el.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value)) msg = 'no es un correo válido';
      else if (el.type === 'url' && el.value && !/^https?:\/\/\S+\.\S+/.test(el.value)) msg = 'debe empezar con https://';
      if (msg) {
        el.classList.add('is-invalid');
        const details = el.closest('details');
        if (details) details.open = true;
        const label = (el.closest('.field') || el.closest('fieldset'))?.querySelector('label, legend')?.textContent.replace('*', '').trim();
        errors.push({ el, text: `${label || el.dataset.path} ${msg}` });
      }
    });
    return errors;
  }

  // ---------- guardar ----------
  function showAlert(message, type = 'ok') {
    const box = document.getElementById('alert');
    box.innerHTML = message;
    box.dataset.type = type;
    box.hidden = false;
    clearTimeout(showAlert.timer);
    if (type === 'ok') showAlert.timer = setTimeout(() => { box.hidden = true; }, 6000);
  }

  function save() {
    const errors = validate();
    if (errors.length) {
      showAlert(`<strong>No se guardó.</strong> Corrige ${errors.length === 1 ? 'este campo' : `estos ${errors.length} campos`}:<ul>${errors.slice(0, 6).map((e) => `<li>${esc(e.text)}</li>`).join('')}</ul>`, 'error');
      errors[0].el.focus();
      return false;
    }
    try {
      window.CVStore.save(state);
    } catch (err) {
      showAlert('<strong>No se guardó.</strong> El navegador no tiene espacio suficiente (la foto subida puede ser muy grande). Usa una ruta de imagen en lugar de subirla.', 'error');
      return false;
    }
    setDirty(false);
    showAlert('<strong>Guardado.</strong> Recarga index.html en este navegador para ver los cambios. Para que los vean todos los visitantes, usa «Descargar data.js» y súbelo al servidor.');
    return true;
  }

  document.getElementById('btn-save').addEventListener('click', save);
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); save(); }
  });

  // ---------- foto ----------
  function updatePhotoPreview() {
    const img = document.getElementById('photo-preview');
    const input = document.getElementById('f-personal-foto');
    const src = state.personal.foto || '';
    if (input && input.value !== src && !src.startsWith('data:')) input.value = src;
    if (input) input.placeholder = src.startsWith('data:') ? 'Imagen subida (incrustada)' : 'img/perfil.jpg';
    img.src = src;
  }

  document.getElementById('photo-file').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const max = 480;
        const scale = Math.min(1, max / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
        state.personal.foto = canvas.toDataURL('image/jpeg', 0.85);
        document.getElementById('f-personal-foto').value = '';
        updatePhotoPreview();
        setDirty(true);
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  });

  // ---------- publicar / respaldo ----------
  function download(filename, content, type) {
    const blob = new Blob([content], { type });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  document.getElementById('btn-datajs').addEventListener('click', () => {
    if (dirty && !save()) return;
    const header = `/**\n * data.js — Contenido por defecto del CV (fuente única de verdad).\n * Generado desde admin.html el ${new Date().toLocaleString('es-GT')}\n * Reemplaza js/data.js en el servidor con este archivo.\n */\n`;
    download('data.js', `${header}window.CV_DEFAULT_DATA = ${JSON.stringify(state, null, 2)};\n`, 'text/javascript');
  });

  document.getElementById('btn-export').addEventListener('click', () => {
    const stamp = new Date().toISOString().slice(0, 10);
    download(`cv-respaldo-${stamp}.json`, JSON.stringify(state, null, 2), 'application/json');
  });

  document.getElementById('import-file').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    file.text().then((text) => {
      const data = JSON.parse(text);
      if (!data || !data.personal || !Array.isArray(data.experiencia)) throw new Error('formato');
      data.version = 2;
      state = data;
      renderAll();
      setDirty(true);
      showAlert('<strong>Respaldo importado.</strong> Revisa los datos y pulsa «Guardar cambios».');
    }).catch(() => showAlert('<strong>No se pudo importar.</strong> El archivo no es un respaldo JSON de este CV.', 'error'));
    e.target.value = '';
  });

  document.getElementById('btn-reset').addEventListener('click', () => {
    if (!confirm('Se descartarán los cambios guardados en este navegador y se volverá al contenido de js/data.js. ¿Continuar?')) return;
    window.CVStore.reset();
    state = window.CVStore.load();
    renderAll();
    setDirty(false);
    showAlert('<strong>Restablecido.</strong> Se cargó el contenido original de js/data.js.');
  });

  window.addEventListener('beforeunload', (e) => {
    if (!dirty) return;
    e.preventDefault();
    e.returnValue = '';
  });

  renderAll();
  setDirty(false);
})();
