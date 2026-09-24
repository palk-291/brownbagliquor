(() => {
  'use strict';

  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('#main-navigation');

  function closeMenu(returnFocus = false) {
    if (!navigation || !menuButton) return;
    navigation.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
    document.body.classList.remove('menu-open');
    if (returnFocus) menuButton.focus();
  }

  if (menuButton && navigation) {
    menuButton.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') !== 'true';
      navigation.classList.toggle('is-open', open);
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      document.body.classList.toggle('menu-open', open);
    });
    navigation.addEventListener('click', event => {
      if (event.target.closest('a')) closeMenu();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') closeMenu(true);
    });
    document.addEventListener('click', event => {
      if (!event.target.closest('.site-header')) closeMenu();
    });
    if (window.matchMedia && window.matchMedia('(min-width: 701px)').addEventListener) {
      window.matchMedia('(min-width: 701px)').addEventListener('change', event => {
        if (event.matches) closeMenu();
      });
    }
  }

  // Age gate. Stored locally so the visitor only confirms once on this computer/browser.
  const ageGate = document.querySelector('#age-gate');
  let verified = false;
  try { verified = localStorage.getItem('bbl-age-verified') === 'yes'; } catch (_) {}

  const syncModalLock = () => document.body.classList.toggle('modal-open', Boolean(document.querySelector('dialog[open]')));

  if (ageGate) {
    if (!verified) {
      try { ageGate.showModal(); } catch (_) { ageGate.setAttribute('open', ''); }
      syncModalLock();
    }
    ageGate.addEventListener('cancel', event => event.preventDefault());
    document.querySelector('#age-yes')?.addEventListener('click', () => {
      try { localStorage.setItem('bbl-age-verified', 'yes'); } catch (_) {}
      verified = true;
      ageGate.close();
      syncModalLock();
      openCategoryFromHash();
    });
    document.querySelector('#age-no')?.addEventListener('click', () => {
      document.querySelector('#age-actions').hidden = true;
      document.querySelector('#age-denied').hidden = false;
      document.querySelector('#age-back').focus();
    });
    document.querySelector('#age-back')?.addEventListener('click', () => {
      document.querySelector('#age-actions').hidden = false;
      document.querySelector('#age-denied').hidden = true;
      document.querySelector('#age-yes').focus();
    });
  }

  let categoryOpener = null;
  function openCategory(id, opener = null) {
    const dialog = document.getElementById(`detail-${id}`);
    if (!dialog || !verified || dialog.open) return;
    categoryOpener = opener;
    dialog.showModal();
    syncModalLock();
  }
  function openCategoryFromHash() { openCategory(window.location.hash.slice(1)); }

  document.querySelectorAll('[data-category]').forEach(trigger => {
    trigger.addEventListener('click', event => {
      event.preventDefault();
      history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${trigger.dataset.category}`);
      openCategory(trigger.dataset.category, trigger);
    });
  });

  document.querySelectorAll('.category-dialog').forEach(dialog => {
    dialog.querySelector('[data-close]')?.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => {
      syncModalLock();
      history.replaceState(null, '', window.location.pathname + window.location.search);
      if (categoryOpener) categoryOpener.focus();
    });
  });
  window.addEventListener('hashchange', openCategoryFromHash);
  openCategoryFromHash();

  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('[data-reveal]').forEach(element => {
      if (element.getBoundingClientRect().top > window.innerHeight) {
        element.classList.add('will-reveal');
        observer.observe(element);
      }
    });
  }

  // Standalone contact form: no server is required.
  // Add the store email below later if you want the form to open an email draft.
  const CONTACT_EMAIL = '';
  const form = document.querySelector('#contact-form');
  if (form) {
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!form.reportValidity()) return;

      const data = Object.fromEntries(new FormData(form));
      if (data.website) return;
      const status = document.querySelector('#form-status');
      const body = [
        `Name: ${data.name || ''}`,
        `Email: ${data.email || ''}`,
        `Phone: ${data.phone || ''}`,
        '',
        `Message: ${data.message || ''}`
      ].join('\n');

      if (CONTACT_EMAIL) {
        window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Brown Bag Liquor website inquiry')}&body=${encodeURIComponent(body)}`;
        status.textContent = `Your email app should open with the message prepared for ${CONTACT_EMAIL}.`;
      } else {
        status.textContent = 'This offline preview does not send messages. Add the store email in assets/app.js or call 346-643-0079.';
      }
      status.classList.remove('error');
      status.focus();
    });
  }
})();
