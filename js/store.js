/**
 * store.js — Capa de datos compartida por index.html y admin.html.
 * Una sola clave de localStorage para evitar el error anterior
 * (admin guardaba en 'cv_master_data' y el index leía 'cv_config_data').
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'cv_data_v2';
  const LEGACY_KEYS = ['cv_master_data', 'cv_config_data'];

  const clone = (obj) => JSON.parse(JSON.stringify(obj));

  /** Rellena claves faltantes (objetos) sin tocar los arreglos guardados. */
  function fillMissing(target, defaults) {
    Object.keys(defaults).forEach((key) => {
      const def = defaults[key];
      if (target[key] === undefined || target[key] === null) {
        target[key] = clone(def);
      } else if (def && typeof def === 'object' && !Array.isArray(def) &&
                 typeof target[key] === 'object' && !Array.isArray(target[key])) {
        fillMissing(target[key], def);
      }
    });
    return target;
  }

  function readStored() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed && parsed.version === 2 ? parsed : null;
    } catch (err) {
      console.warn('[CV] No se pudo leer localStorage:', err);
      return null;
    }
  }

  /**
   * Devuelve los datos vigentes. Si data.js es igual o más reciente que la
   * copia local (p. ej. tras publicar un data.js nuevo), gana data.js.
   */
  function load() {
    const defaults = window.CV_DEFAULT_DATA;
    const stored = readStored();
    if (!stored) return clone(defaults);
    const storedTime = Date.parse(stored.updatedAt || 0) || 0;
    const defaultTime = Date.parse(defaults.updatedAt || 0) || 0;
    if (defaultTime >= storedTime) return clone(defaults);
    return fillMissing(stored, defaults);
  }

  function save(data) {
    data.version = 2;
    data.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    LEGACY_KEYS.forEach((k) => localStorage.removeItem(k));
    return data;
  }

  function reset() {
    localStorage.removeItem(STORAGE_KEY);
    LEGACY_KEYS.forEach((k) => localStorage.removeItem(k));
  }

  function hasLocalChanges() {
    return readStored() !== null;
  }

  window.CVStore = { STORAGE_KEY, load, save, reset, hasLocalChanges, clone };
})();
