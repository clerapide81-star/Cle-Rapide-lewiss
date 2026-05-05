/*
  Clé Rapide — script partagé
  Duplication multi-ville standard : ne pas modifier ce fichier.
  La configuration de page est lue dans le HTML via les attributs data-* du <body>.
*/

(function () {
  const bodyData = document.body ? document.body.dataset : {};
  const redirectTo = bodyData.redirectTo || '';
  if (redirectTo && window.location.pathname === '/') {
    window.location.replace(redirectTo);
    return;
  }
  window.CleRapideConfig = {
    siteName: bodyData.siteName || window.location.hostname,
    pageType: bodyData.pageType || 'ville',
    templateName: bodyData.templateName || 'ville',
    makeWebhookUrl: bodyData.makeWebhookUrl || ''
  };

  const gtmId = bodyData.gtmId || ''; 
  if (gtmId) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    const firstScript = document.getElementsByTagName('script')[0];
    const gtmScript = document.createElement('script');
    gtmScript.async = true;
    gtmScript.src = 'https://www.googletagmanager.com/gtm.js?id=' + gtmId;
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(gtmScript, firstScript);
    } else {
      document.head.appendChild(gtmScript);
    }
  }
})();

function initTracking() {
  const config = window.CleRapideConfig || {};
  const pageData = document.body ? document.body.dataset : {};
  const pageType = pageData.pageType || config.pageType || 'ville';
  const siteName = pageData.siteName || config.siteName || window.location.hostname;
  const templateName = pageData.templateName || config.templateName || 'ville';

  window.dataLayer = window.dataLayer || [];
  window.pushDataLayerEvent = (eventName, eventData = {}) => {
    window.dataLayer.push({
      event: eventName,
      page_type: pageType,
      site_name: siteName,
      page_path: window.location.pathname,
      ...eventData,
    });
  };

  window.pushDataLayerEvent('page_ready', {
    template_name: templateName,
  });

  document.querySelectorAll('a[href^="tel:"]').forEach((element) => {
    element.addEventListener('click', () => {
      window.pushDataLayerEvent('click_call', {
        phone_number: (element.getAttribute('href') || '').replace('tel:', ''),
        cta_label: (element.textContent || element.getAttribute('aria-label') || 'appel').trim(),
      });
    });
  });

  document.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp"]').forEach((element) => {
    element.addEventListener('click', () => {
      window.pushDataLayerEvent('click_whatsapp', {
        cta_label: (element.textContent || element.getAttribute('aria-label') || 'whatsapp').trim(),
      });
    });
  });
}

function initMenu() {
  const body = document.body;
  const menuBtn = document.getElementById('menu-btn');
  const menu = document.getElementById('site-menu');
  const backdrop = document.getElementById('site-menu-backdrop');
  const closeBtn = document.getElementById('site-menu-close');
  if (!body || !menuBtn || !menu || !backdrop || !closeBtn) return;

  let closeTimer = null;
  let lastTrigger = null;

  const getStickyOffset = () => {
    const topbar = document.querySelector('.topbar');
    const header = document.querySelector('.header');
    return (topbar ? topbar.offsetHeight : 0) + (header ? header.offsetHeight : 0) + 14;
  };

  const scrollToAnchorTarget = (target) => {
    if (!target) return;
    const targetTop = window.scrollY + target.getBoundingClientRect().top - getStickyOffset();
    window.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
  };

  const revealMenu = () => {
    clearTimeout(closeTimer);
    menu.hidden = false;
    backdrop.hidden = false;
    requestAnimationFrame(() => {
      body.classList.add('menu-open');
      menuBtn.classList.add('is-active');
      menuBtn.setAttribute('aria-expanded', 'true');
      menu.setAttribute('aria-hidden', 'false');
    });
  };

  const concealMenu = (restoreFocus = true) => {
    body.classList.remove('menu-open');
    menuBtn.classList.remove('is-active');
    menuBtn.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
    clearTimeout(closeTimer);
    closeTimer = window.setTimeout(() => {
      menu.hidden = true;
      backdrop.hidden = true;
      if (restoreFocus && lastTrigger) lastTrigger.focus();
    }, 280);
  };

  const openMenu = () => {
    lastTrigger = document.activeElement;
    revealMenu();
  };

  const closeMenu = (restoreFocus = true) => {
    if (!body.classList.contains('menu-open')) return;
    concealMenu(restoreFocus);
  };

  menuBtn.addEventListener('click', () => {
    if (body.classList.contains('menu-open')) {
      closeMenu(false);
      menuBtn.focus();
      return;
    }
    openMenu();
  });

  closeBtn.addEventListener('click', () => closeMenu(true));
  backdrop.addEventListener('click', () => closeMenu(false));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu(true);
  });

  menu.querySelectorAll('[data-menu-close]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href') || '';
      if (href.startsWith('#')) {
        const target = document.querySelector(href);
        event.preventDefault();
        closeMenu(false);
        if (target) {
          window.setTimeout(() => {
            scrollToAnchorTarget(target);
          }, 120);
        }
        return;
      }
      closeMenu(false);
    });
  });
}

function initAnimations() {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

  const track = document.getElementById('marques-track');
  if (track && !track.dataset.duplicated) {
    track.innerHTML += track.innerHTML;
    track.dataset.duplicated = 'true';
  }

  const twEl = document.getElementById('tw-word');
  if (twEl) {
    const words = ['Reproduction', 'Perte totale', 'Programmation'];
    let wordIndex = 0;
    let charIndex = 0;
    twEl.textContent = '';
    const tick = () => {
      const currentWord = words[wordIndex];
      charIndex += 1;
      twEl.textContent = currentWord.slice(0, charIndex);
      if (charIndex < currentWord.length) {
        setTimeout(tick, 60);
      } else {
        charIndex = 0;
        wordIndex = (wordIndex + 1) % words.length;
        setTimeout(tick, 1000);
      }
    };
    setTimeout(tick, 400);
  }

  const animateCounter = (el) => {
    const type = el.dataset.type || 'number';
    const suffix = el.dataset.suffix || '';
    const duration = 1400;
    const start = performance.now();
    if (type === 'hour') {
      const updateHour = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        if (progress < 1) {
          el.innerHTML = `${Math.floor(ease * 60)}<span class="suffix">min</span>`;
          requestAnimationFrame(updateHour);
        } else {
          el.innerHTML = '1<span class="suffix">h</span>';
        }
      };
      requestAnimationFrame(updateHour);
      return;
    }
    const target = parseInt(el.dataset.target || '0', 10);
    const display = el.dataset.display || String(target);
    const update = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(ease * target);
      if (progress < 1) {
        el.innerHTML = `${current}<span class="suffix">${suffix}</span>`;
        requestAnimationFrame(update);
      } else {
        el.innerHTML = `${display}<span class="suffix">${suffix}</span>`;
      }
    };
    requestAnimationFrame(update);
  };

  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const counter = entry.target.querySelector('.counter');
        if (counter && !counter.dataset.animated) {
          counter.dataset.animated = '1';
          setTimeout(() => animateCounter(counter), 150);
        }
        statObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0, rootMargin: '0px 0px -10px 0px' });
  document.querySelectorAll('.pitch-stat').forEach((element) => statObserver.observe(element));

  const whyBarObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const fill = entry.target.querySelector('.why-arg-bar-fill');
        const indicator = entry.target.querySelector('.why-arg-bar-indicator');
        if (fill && !fill.dataset.animated) {
          fill.dataset.animated = '1';
          setTimeout(() => {
            fill.style.width = `${fill.dataset.width}%`;
            setTimeout(() => { if (indicator) indicator.classList.add('done'); }, 1500);
          }, 300);
        }
        whyBarObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.why-arg').forEach((element) => whyBarObserver.observe(element));

  const processObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        processObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.process-step-left,.process-step-right').forEach((element) => processObserver.observe(element));

  const avisTrack = document.querySelector('.avis-carousel-track');
  if (avisTrack) {
    let avisResumeTimer = null;
    const pauseAvis = () => {
      avisTrack.classList.add('is-paused');
      if (avisResumeTimer) clearTimeout(avisResumeTimer);
    };
    const resumeAvis = (delay = 0) => {
      if (avisResumeTimer) clearTimeout(avisResumeTimer);
      avisResumeTimer = setTimeout(() => {
        avisTrack.classList.remove('is-paused');
      }, delay);
    };
    avisTrack.addEventListener('mouseenter', pauseAvis);
    avisTrack.addEventListener('mouseleave', () => resumeAvis(0));
    avisTrack.addEventListener('touchstart', pauseAvis, { passive: true });
    avisTrack.addEventListener('touchend', () => resumeAvis(4500), { passive: true });
    avisTrack.addEventListener('touchcancel', () => resumeAvis(0), { passive: true });
    avisTrack.addEventListener('focusin', pauseAvis);
    avisTrack.addEventListener('focusout', () => resumeAvis(1200));
    avisTrack.querySelectorAll('.avis-card').forEach((card) => {
      card.addEventListener('pointerdown', pauseAvis);
      card.addEventListener('pointerup', () => resumeAvis(3500));
    });
  }

  document.querySelectorAll('.brands-item').forEach((item) => {
    const triggerPulse = () => {
      item.classList.remove('is-pressed');
      void item.offsetWidth;
      item.classList.add('is-pressed');
      setTimeout(() => item.classList.remove('is-pressed'), 220);
    };
    item.addEventListener('click', (event) => {
      if (event.target.closest('.brands-link')) return;
      triggerPulse();
    });
    item.addEventListener('touchstart', (event) => {
      if (event.target.closest('.brands-link')) return;
      triggerPulse();
    }, { passive: true });
  });
}

function initRemboursement() {
  const rembSelect = document.getElementById('remb-bank-select');
  const rembResult = document.getElementById('remb-result');
  const rembBankName = document.getElementById('remb-bank-name');
  const rembBankAmount = document.getElementById('remb-bank-amount');
  if (rembSelect && rembResult && rembBankName && rembBankAmount) {
    rembSelect.addEventListener('change', (event) => {
      const value = event.target.value;
      if (!value) return;
      const parts = value.split('|');
      rembBankName.textContent = parts[0] || '';
      rembBankAmount.textContent = `${parts[1] || ''}€`;
      rembResult.classList.remove('show');
      void rembResult.offsetWidth;
      rembResult.classList.add('show');
      setTimeout(() => {
        rembResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    });
  }
  const rembTrack = document.getElementById('remb-banks-track');
  if (rembTrack && !rembTrack.dataset.duplicated) {
    rembTrack.innerHTML += rembTrack.innerHTML;
    rembTrack.dataset.duplicated = 'true';
  }
}

function initZoneAccordion() {
  const zoneSection = document.getElementById('zone-intervention');
  const zoneCarImg = document.getElementById('zone-car-img');
  if (zoneSection && zoneCarImg) {
    const updateZoneCar = () => {
      const rect = zoneSection.getBoundingClientRect();
      const start = rect.top - window.innerHeight * 0.3;
      const progress = Math.max(0, Math.min(1, -start / (rect.height * 0.7)));
      const travel = window.innerWidth >= 1200 ? 320 : window.innerWidth >= 768 ? 280 : 250;
      zoneCarImg.style.transform = `translateX(calc(-50% + ${progress * travel}px))`;
    };
    updateZoneCar();
    window.addEventListener('scroll', updateZoneCar, { passive: true });
    window.addEventListener('resize', updateZoneCar, { passive: true });
  }

  document.querySelectorAll('.faq-section .faq-item').forEach((item) => {
    const question = item.querySelector('.faq-question');
    if (!question) return;
    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-section .faq-item').forEach((node) => node.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  document.querySelectorAll('.sf-section .sf-item').forEach((item) => {
    const question = item.querySelector('.sf-question');
    if (!question) return;
    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.sf-section .sf-item').forEach((node) => node.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  const rappelBtn = document.querySelector('#rappel-form .rappel-btn');
  if (rappelBtn) rappelBtn.setAttribute('data-open-form', '1');
}

function initForm() {
  const config = window.CleRapideConfig || {};
  const pageData = document.body ? document.body.dataset : {};
  const pushEvent = window.pushDataLayerEvent || (() => {});
  const siteName = pageData.siteName || config.siteName || window.location.hostname;
  const defaultDepartment = pageData.departmentDefault || '';
  const contactPhoneDisplay = pageData.contactPhoneDisplay || '';
  const formSection = document.getElementById('devis');
  const formBackdrop = document.getElementById('form-modal-backdrop');
  const formCloseBtn = document.getElementById('form-modal-close');
  const progressBar = document.getElementById('progress-bar');
  const formStepCounter = document.getElementById('form-step-counter');
  const plateInput = document.getElementById('plate-input');
  const vehicleResult = document.getElementById('vehicle-result');
  const btnNext2 = document.getElementById('btn-next-2');
  const manualFields = document.getElementById('manual-fields');
  const plateSkipBtn = document.getElementById('plate-skip-btn');
  const manualMarque = document.getElementById('manual-marque');
  const manualModele = document.getElementById('manual-modele');
  const manualAnnee = document.getElementById('manual-annee');
  const telInput = document.getElementById('tel-input');
  const villeInput = document.getElementById('ville-input');
  const btnSubmit = document.getElementById('btn-submit');
  const formFinal = document.getElementById('form-final');
  const selectedServiceInput = document.getElementById('selected-service');
  const prenomInput = document.getElementById('prenom-input');
  const deptInput = document.getElementById('dept-input');
  let formSavedScrollY = 0;
  let formSavedFocus = null;
  let plateTimer = null;
  let detectedVehicle = null;
  const parisDateTimeFormat = new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const formStepMap = { 2: 1, 3: 2, 4: 3 };
  const MIN_FORM_FILL_MS = 1800;
  let formStartedAt = Date.now();
  let honeypotInput = null;

  const normalizePhoneDigits = (value = '') => value.replace(/\D/g, '');
  const isValidPhone = (value = '') => {
    const digits = normalizePhoneDigits(value);
    return /^0[1-9]\d{8}$/.test(digits)
      || /^33[1-9]\d{8}$/.test(digits)
      || /^0033[1-9]\d{8}$/.test(digits);
  };

  const syncPhoneValidity = () => {
    if (!telInput) return false;
    const rawValue = telInput.value.trim();
    if (!rawValue) {
      telInput.setCustomValidity('');
      return false;
    }
    const valid = isValidPhone(rawValue);
    telInput.setCustomValidity(valid ? '' : 'Entrez un numéro complet, par exemple 07 58 50 32 03.');
    return valid;
  };

  const ensureFormHardening = () => {
    if (telInput) {
      telInput.setAttribute('inputmode', 'tel');
      telInput.setAttribute('maxlength', '16');
      telInput.setAttribute('minlength', '10');
      telInput.setAttribute('pattern', '(?:0[1-9](?:[ .-]?\\d{2}){4}|(?:\\+33|0033)[ .-]?[1-9](?:[ .-]?\\d{2}){4})');
      telInput.setAttribute('title', 'Entrez un numéro complet, par exemple 07 58 50 32 03');
    }
    if (formFinal && !formFinal.querySelector('#website-input')) {
      const honeypotWrap = document.createElement('div');
      honeypotWrap.className = 'form-hp-wrap';
      honeypotWrap.setAttribute('aria-hidden', 'true');
      honeypotWrap.innerHTML = '<label for="website-input">Website</label><input autocomplete="off" class="form-hp-input" id="website-input" name="website" tabindex="-1" type="text">';
      formFinal.appendChild(honeypotWrap);
    }
    honeypotInput = formFinal ? formFinal.querySelector('#website-input') : null;
  };

  const resetFormState = () => {
    if (!formSection) return;
    clearTimeout(plateTimer);
    formStartedAt = Date.now();
    if (formFinal) formFinal.reset();
    if (plateInput) plateInput.value = '';
    if (honeypotInput) honeypotInput.value = '';
    if (telInput) telInput.setCustomValidity('');
    detectedVehicle = null;
    if (vehicleResult) {
      vehicleResult.classList.remove('show');
      vehicleResult.innerHTML = '';
    }
    if (manualFields) manualFields.classList.remove('is-visible');
    [manualMarque, manualModele, manualAnnee].forEach((field) => {
      if (field) field.value = '';
    });
    formSection.querySelectorAll('.svc-btn').forEach((node) => node.classList.remove('active'));
    if (selectedServiceInput) selectedServiceInput.value = '';
    if (btnNext2) btnNext2.disabled = true;
    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.textContent = 'Envoyer ma demande →';
    }
    formSection.querySelectorAll('.step').forEach((node) => node.classList.remove('active'));
    const firstStep = document.getElementById('step-2');
    if (firstStep) firstStep.classList.add('active');
    if (progressBar) progressBar.style.width = '33.333%';
    if (formStepCounter) formStepCounter.textContent = '1 / 3';
    formSection.scrollTop = 0;
  };

  const scrollFormIntoView = () => {
    if (!formSection) return;
    if (formSection.classList.contains('is-modal')) {
      formSection.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({
        top: window.scrollY + formSection.getBoundingClientRect().top - 24,
        behavior: 'smooth',
      });
    }
  };

  const setFormStep = (step) => {
    if (!formSection) return;
    formSection.querySelectorAll('.step').forEach((node) => node.classList.remove('active'));
    const target = document.getElementById(`step-${step}`);
    if (target) target.classList.add('active');
    const progressIndex = formStepMap[step] || 3;
    if (progressBar) progressBar.style.width = `${(progressIndex / 3) * 100}%`;
    if (formStepCounter) formStepCounter.textContent = `${progressIndex} / 3`;
    if (step !== 'success') {
      pushEvent('form_step_view', {
        form_name: 'devis',
        step_id: String(step),
        step_index: progressIndex,
      });
    }
    scrollFormIntoView();
  };

  const closeFormModal = () => {
    if (!formSection || !formSection.classList.contains('is-modal')) return;
    formSection.classList.remove('is-modal');
    document.body.classList.remove('form-modal-open');
    if (formBackdrop) formBackdrop.classList.remove('is-visible');
    window.scrollTo(0, formSavedScrollY);
    if (formSavedFocus && typeof formSavedFocus.focus === 'function') {
      formSavedFocus.focus({ preventScroll: true });
    }
  };

  const openFormModal = (trigger) => {
    if (!formSection) return;
    pushEvent('open_form', {
      cta_label: ((trigger && (trigger.textContent || trigger.getAttribute('aria-label'))) || 'formulaire').trim(),
      cta_location: trigger && trigger.closest('.hero') ? 'hero' : 'page',
    });
    formSavedScrollY = window.scrollY;
    formSavedFocus = trigger || document.activeElement;
    resetFormState();
    formSection.classList.add('is-modal');
    document.body.classList.add('form-modal-open');
    if (formBackdrop) formBackdrop.classList.add('is-visible');
    requestAnimationFrame(() => { formSection.scrollTop = 0; });
    if (formCloseBtn) setTimeout(() => formCloseBtn.focus({ preventScroll: true }), 60);
  };

  const toggleManualFields = () => {
    if (!manualFields || !btnNext2) return;
    const isVisible = manualFields.classList.toggle('is-visible');
    if (isVisible) {
      if (plateInput) plateInput.value = '';
      detectedVehicle = null;
      if (vehicleResult) {
        vehicleResult.classList.remove('show');
        vehicleResult.innerHTML = '';
      }
      btnNext2.disabled = true;
    } else {
      btnNext2.disabled = true;
      manualMarque.value = '';
      manualModele.value = '';
      manualAnnee.value = '';
    }
  };

  const checkManual = () => {
    if (!btnNext2) return;
    const ready = !!(manualMarque && manualMarque.value && manualModele && manualModele.value.trim().length >= 2 && manualAnnee && manualAnnee.value);
    btnNext2.disabled = !ready;
  };

  const normalizeVehicleData = (data = {}) => {
    const marque = (data.marque || '').toString().trim();
    const modele = (data.modele || '').toString().trim();
    const rawYear = (data.date_mise_en_circulation || data.annee || '').toString().trim();
    const year = /^\d{4}/.test(rawYear) ? rawYear.slice(0, 4) : '';
    return {
      marque,
      modele,
      annee: year,
      date_mise_en_circulation: rawYear,
      source: data.source || '',
    };
  };

  const getVehicleSnapshot = () => {
    const manualVehicle = {
      marque: manualMarque ? manualMarque.value.trim() : '',
      modele: manualModele ? manualModele.value.trim() : '',
      annee: manualAnnee ? manualAnnee.value.trim() : '',
      source: 'manuel',
    };
    if (manualFields && manualFields.classList.contains('is-visible')) return manualVehicle;
    if (detectedVehicle && (detectedVehicle.marque || detectedVehicle.modele || detectedVehicle.annee)) {
      return detectedVehicle;
    }
    return {
      marque: '',
      modele: '',
      annee: '',
      source: plateInput && plateInput.value.trim() ? 'plaque_sans_details' : '',
    };
  };

  const getParisDateParts = () => {
    const parts = parisDateTimeFormat.formatToParts(new Date());
    const map = {};
    parts.forEach((part) => {
      if (part.type !== 'literal') map[part.type] = part.value;
    });
    return {
      date_fr: `${map.day || ''}/${map.month || ''}/${map.year || ''}`,
      time_fr: `${map.hour || ''}:${map.minute || ''}:${map.second || ''}`,
      timezone: 'Europe/Paris',
    };
  };

  const showVehicleResult = (brandText, yearText) => {
    if (!vehicleResult || !btnNext2) return;
    vehicleResult.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22C55E" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg><div class="vr-info"><span class="vr-brand">${brandText}</span><span class="vr-year">${yearText}</span></div>`;
    vehicleResult.classList.add('show');
    btnNext2.disabled = false;
  };

  const requestJson = (url, onSuccess, onError) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = () => {
      if (xhr.readyState !== 4) return;
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          onSuccess(JSON.parse(xhr.responseText || '{}'));
        } catch (error) {
          onError(error);
        }
      } else {
        onError(new Error(`HTTP ${xhr.status}`));
      }
    };
    xhr.onerror = () => onError(new Error('Network error'));
    xhr.send();
  };

  const postJson = (url, payload) => new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = () => {
      if (xhr.readyState !== 4) return;
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(true);
      } else {
        reject(new Error(`HTTP ${xhr.status}`));
      }
    };
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.send(JSON.stringify(payload));
  });

  if (formSection) {
    document.querySelectorAll('a[href="#devis"]').forEach((link) => {
      if (link.closest('.form-section')) return;
      link.setAttribute('data-open-form', '1');
      link.addEventListener('click', (event) => {
        event.preventDefault();
        openFormModal(link);
      });
    });
  }
  if (formCloseBtn) formCloseBtn.addEventListener('click', closeFormModal);
  if (formBackdrop) formBackdrop.addEventListener('click', closeFormModal);
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeFormModal(); });
  if (plateSkipBtn) plateSkipBtn.addEventListener('click', toggleManualFields);
  [manualMarque, manualModele, manualAnnee].forEach((field) => {
    if (!field) return;
    field.addEventListener(field.tagName === 'SELECT' ? 'change' : 'input', checkManual);
  });

  if (plateInput) {
    plateInput.addEventListener('input', () => {
      clearTimeout(plateTimer);
      const value = plateInput.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 8);
      plateInput.value = value;
      if (vehicleResult) {
        vehicleResult.classList.remove('show');
        vehicleResult.innerHTML = '';
      }
      if (btnNext2) btnNext2.disabled = true;
      if (manualFields && manualFields.classList.contains('is-visible')) return;
      if (value.length >= 7) {
        if (vehicleResult) {
          vehicleResult.innerHTML = '<span class="vr-loading">Recherche du véhicule...</span>';
          vehicleResult.classList.add('show');
        }
        plateTimer = setTimeout(() => {
          requestJson(
            `https://api-plaque-immatriculation.com/api.php?immat=${encodeURIComponent(value)}&token=demo`,
            (data) => {
              if (data && data.marque) {
                detectedVehicle = normalizeVehicleData({ ...data, source: 'auto_plaque' });
                const brandLabel = [detectedVehicle.marque, detectedVehicle.modele].filter(Boolean).join(' ').trim();
                const yearLabel = detectedVehicle.annee || 'Véhicule identifié';
                showVehicleResult(brandLabel || 'Véhicule identifié', yearLabel);
              } else {
                detectedVehicle = { marque: '', modele: '', annee: '', source: 'plaque_sans_details' };
                showVehicleResult('Plaque enregistrée', 'Cliquez sur Continuer');
              }
            },
            () => {
              detectedVehicle = { marque: '', modele: '', annee: '', source: 'plaque_sans_details' };
              showVehicleResult('Plaque enregistrée', 'Cliquez sur Continuer');
            }
          );
        }, 650);
      }
    });
  }

  if (btnNext2) btnNext2.addEventListener('click', () => setFormStep(3));
  if (formSection) {
    formSection.querySelectorAll('[data-form-back]').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        setFormStep(Number(button.getAttribute('data-form-back')) || 2);
      });
    });
    formSection.querySelectorAll('.svc-btn').forEach((button) => {
      button.addEventListener('click', () => {
        formSection.querySelectorAll('.svc-btn').forEach((node) => node.classList.remove('active'));
        button.classList.add('active');
        if (selectedServiceInput) selectedServiceInput.value = button.dataset.service || '';
        pushEvent('select_service', { service_name: button.dataset.service || '' });
        setTimeout(() => setFormStep(4), 220);
      });
    });
  }

  const checkSubmit = () => {
    if (!btnSubmit || !telInput || !villeInput) return;
    const villeValue = villeInput.value.trim();
    const phoneOk = syncPhoneValidity();
    btnSubmit.disabled = !phoneOk || villeValue.length < 2;
  };
  ensureFormHardening();
  if (telInput) {
    telInput.addEventListener('input', checkSubmit);
    telInput.addEventListener('blur', syncPhoneValidity);
  }
  if (villeInput) villeInput.addEventListener('input', checkSubmit);

  const buildLeadPayload = () => {
    const submittedAt = new Date();
    const vehicle = getVehicleSnapshot();
    const parisDate = getParisDateParts();
    return {
      source: 'site-web',
      site: siteName,
      page_url: window.location.href,
      referrer: document.referrer || '',
      submitted_at: submittedAt.toISOString(),
      submitted_date_fr: parisDate.date_fr,
      submitted_time_fr: parisDate.time_fr,
      submitted_timezone: parisDate.timezone,
      prenom: prenomInput ? prenomInput.value.trim() : '',
      telephone: telInput ? telInput.value.trim() : '',
      ville: villeInput ? villeInput.value.trim() : '',
      departement: deptInput ? (deptInput.value.trim() || defaultDepartment) : defaultDepartment,
      service: selectedServiceInput ? selectedServiceInput.value.trim() : '',
      plaque: plateInput ? plateInput.value.trim() : '',
      marque_vehicule: vehicle.marque || '',
      modele_vehicule: vehicle.modele || '',
      annee_vehicule: vehicle.annee || '',
      vehicle_source: vehicle.source || '',
      marque_detectee: detectedVehicle && detectedVehicle.marque ? detectedVehicle.marque : '',
      modele_detecte: detectedVehicle && detectedVehicle.modele ? detectedVehicle.modele : '',
      annee_detectee: detectedVehicle && detectedVehicle.annee ? detectedVehicle.annee : '',
      marque_manuelle: manualMarque ? manualMarque.value.trim() : '',
      modele_manuel: manualModele ? manualModele.value.trim() : '',
      annee_manuelle: manualAnnee ? manualAnnee.value.trim() : '',
      user_agent: navigator.userAgent,
    };
  };

  const showFormSuccess = () => {
    if (!formSection) return;
    formSection.querySelectorAll('.step').forEach((node) => node.classList.remove('active'));
    const successStep = document.getElementById('step-success');
    if (successStep) successStep.classList.add('active');
    if (progressBar) progressBar.style.width = '100%';
    if (formStepCounter) formStepCounter.textContent = '3 / 3';
    scrollFormIntoView();
  };

  const sendLeadToMake = async (payload) => {
    const webhookUrl = pageData.makeWebhookUrl || config.makeWebhookUrl || '';
    if (!webhookUrl) throw new Error('Missing webhook URL');
    try {
      return await postJson(webhookUrl, payload);
    } catch (error) {
      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(payload)], { type: 'text/plain;charset=UTF-8' });
        if (navigator.sendBeacon(webhookUrl, blob)) return true;
      }
      throw error;
    }
  };

  if (formFinal) {
    formFinal.addEventListener('submit', async (event) => {
      event.preventDefault();
      const originalBtnText = btnSubmit ? btnSubmit.textContent : '';
      if (!formFinal.checkValidity() || !syncPhoneValidity()) {
        formFinal.reportValidity();
        checkSubmit();
        return;
      }
      if (honeypotInput && honeypotInput.value.trim()) {
        if (btnSubmit) {
          btnSubmit.disabled = false;
          btnSubmit.textContent = originalBtnText || 'Envoyer ma demande →';
        }
        return;
      }
      if (Date.now() - formStartedAt < MIN_FORM_FILL_MS) {
        if (btnSubmit) {
          btnSubmit.disabled = false;
          btnSubmit.textContent = originalBtnText || 'Envoyer ma demande →';
        }
        window.alert('Merci de vérifier vos informations puis de renvoyer votre demande.');
        return;
      }
      if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.textContent = 'Envoi en cours...';
      }
      const payload = buildLeadPayload();
      try {
        await sendLeadToMake(payload);
        pushEvent('generate_lead', {
          currency: 'EUR',
          value: 1,
          service_name: payload.service || 'demande',
          city: payload.ville || '',
          department: payload.departement || '',
        });
        showFormSuccess();
      } catch (error) {
        console.error('Erreur envoi webhook Make:', error);
        if (btnSubmit) {
          btnSubmit.disabled = false;
          btnSubmit.textContent = originalBtnText || 'Envoyer ma demande →';
        }
        window.alert(`Une erreur est survenue lors de l'envoi. Réessayez ou appelez-nous directement au ${contactPhoneDisplay}.`);
      }
    });
  }
}


function initDepartmentPicker() {
  const form = document.getElementById('departments-picker');
  const select = document.getElementById('department-select');
  const submit = document.getElementById('departments-submit');
  const note = document.getElementById('department-select-note');
  if (!form || !select || !submit) return;

  const syncPickerState = () => {
    const value = select.value || '';
    const isActive = Boolean(value);
    submit.disabled = !isActive;
    submit.setAttribute('aria-disabled', String(!isActive));
    if (note) {
      note.textContent = isActive
        ? 'Vous allez être redirigé vers la page locale active.'
        : 'Sélectionnez votre département pour continuer.';
    }
  };

  select.addEventListener('change', syncPickerState);
  form.addEventListener('submit', (event) => {
    const value = select.value || '';
    if (!value) {
      event.preventDefault();
      syncPickerState();
      select.focus();
      return;
    }
    form.setAttribute('action', value);
  });

  syncPickerState();
}

document.addEventListener('DOMContentLoaded', () => {
  initTracking();
  initMenu();
  initAnimations();
  initDepartmentPicker();
  initRemboursement();
  initZoneAccordion();
  initForm();
});
