/**
 * cursor.js — Efecto del ratón.
 *  1) Halo de luz suave que sigue al puntero con inercia.
 *  2) Reflejo ("spotlight") en el borde de las tarjetas bajo el puntero.
 * Se desactiva en pantallas táctiles y si el usuario pidió reducir movimiento.
 */
(function () {
  'use strict';

  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!finePointer.matches || reducedMotion.matches) return;

  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  glow.setAttribute('aria-hidden', 'true');
  document.body.appendChild(glow);
  document.documentElement.classList.add('has-cursor-fx');

  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 3;
  let x = targetX;
  let y = targetY;
  let rafId = null;

  function tick() {
    x += (targetX - x) * 0.14;
    y += (targetY - y) * 0.14;
    glow.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    rafId = Math.abs(targetX - x) + Math.abs(targetY - y) > 0.3 ? requestAnimationFrame(tick) : null;
  }

  document.addEventListener('pointermove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
    glow.classList.add('is-visible');
    if (!rafId) rafId = requestAnimationFrame(tick);

    const card = e.target.closest && e.target.closest('.spotlight');
    if (card) {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    }
  }, { passive: true });

  document.addEventListener('pointerleave', () => glow.classList.remove('is-visible'));
  document.addEventListener('mouseout', (e) => { if (!e.relatedTarget) glow.classList.remove('is-visible'); });
})();
