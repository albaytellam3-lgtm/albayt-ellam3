/* ==========================================================================
   البيت اللامع لخدمات النظافة والصيانة المنزلية العامة - ملف التفاعلات (Main JavaScript)
   ========================================================================== */

(function () {
  'use strict';

  // 1. Idempotent initialization guard to prevent duplicate event listener bindings
  if (window.__APP_SCRIPT_INITIALIZED__) {
    return;
  }
  window.__APP_SCRIPT_INITIALIZED__ = true;

  // Automatically sync active state for navigation links across all pages
  function syncActiveNavLinks() {
    const rawPath = window.location.pathname.split('/').pop() || 'index.html';
    const currentFile = rawPath.split('#')[0] || 'index.html';

    // Desktop nav items
    document.querySelectorAll('.desktop-nav > .nav-item').forEach((item) => {
      const href = item.getAttribute('href');
      if (href) {
        const itemFile = href.split('/').pop().split('#')[0];
        item.classList.toggle('active', itemFile === currentFile);
      }
    });

    // Special category highlights for Appliance Maintenance vs Cleaning & Pest Control
    const megaWrapper = document.getElementById('megaMenuWrapper');
    const cleaningWrapper = document.getElementById('cleaningNavWrapper');

    if (
      currentFile === 'service-marble-polishing.html' ||
      currentFile === 'service-cleaning.html' ||
      currentFile === 'service-tanks.html' ||
      currentFile === 'service-upholstery.html' ||
      currentFile === 'service-pest-control.html'
    ) {
      cleaningWrapper?.classList.add('active');
      megaWrapper?.classList.remove('active');
    } else if (
      currentFile === 'services.html' ||
      currentFile.startsWith('service-') ||
      currentFile.startsWith('brand-') ||
      currentFile === 'cooling.html' ||
      currentFile === 'cooking.html' ||
      currentFile === 'dishwashers.html' ||
      currentFile === 'dryers.html' ||
      currentFile === 'heaters.html'
    ) {
      megaWrapper?.classList.add('active');
      cleaningWrapper?.classList.remove('active');
    }

    // Mobile drawer links
    document.querySelectorAll('.drawer-content .drawer-link').forEach((link) => {
      const href = link.getAttribute('href');
      if (href) {
        const linkFile = href.split('/').pop().split('#')[0];
        link.classList.toggle('active', linkFile === currentFile);
      }
    });
  }

  // -------------------------------------------------------------
  // Global Mobile Drawer Navigation Handlers
  // -------------------------------------------------------------
  window.toggleMobileMenu = function(e) {
    if (e) {
      if (e.cancelable) e.preventDefault();
      e.stopPropagation();
    }
    const drawer = document.getElementById('mobileDrawer');
    const backdrop = document.getElementById('drawerBackdrop');
    const btn = document.getElementById('hamburgerBtn');
    if (!drawer) return;
    const isOpen = drawer.classList.contains('open');
    if (isOpen) {
      window.closeMobileMenu(e);
    } else {
      drawer.classList.add('open');
      if (backdrop) backdrop.classList.add('active');
      if (btn) btn.setAttribute('aria-expanded', 'true');
      document.documentElement.classList.add('drawer-open');
      document.body.classList.add('drawer-open');
    }
  };

  window.closeMobileMenu = function(e) {
    if (e) {
      if (e.cancelable) e.preventDefault();
      e.stopPropagation();
    }
    const drawer = document.getElementById('mobileDrawer');
    const backdrop = document.getElementById('drawerBackdrop');
    const btn = document.getElementById('hamburgerBtn');
    if (drawer) drawer.classList.remove('open');
    if (backdrop) backdrop.classList.remove('active');
    if (btn) btn.setAttribute('aria-expanded', 'false');
    document.documentElement.classList.remove('drawer-open');
    document.body.classList.remove('drawer-open');
  };

  window.switchMobileSegment = function(btnId, panelId) {
    const btns = document.querySelectorAll('.mobile-nav-segment .segment-btn');
    btns.forEach((b) => {
      b.classList.toggle('active', b.id === btnId || b.getAttribute('data-target') === panelId);
    });
    const panels = document.querySelectorAll('.mobile-panel-section');
    panels.forEach((p) => {
      p.classList.toggle('active', p.id === panelId);
    });
  };

  window.toggleMobileAccordion = function(btn, e) {
    if (e) {
      if (e.cancelable) e.preventDefault();
      e.stopPropagation();
    }
    var header = btn.closest ? (btn.closest('.mob-accordion-header') || btn) : btn;
    var item = header.closest ? header.closest('.mob-accordion-item') : null;
    var body = item ? item.querySelector('.mob-accordion-body') : header.nextElementSibling;
    if (!body) return;
    var isOpen = body.classList.contains('open');
    if (isOpen) {
      body.classList.remove('open');
      header.setAttribute('aria-expanded', 'false');
      var ch = header.querySelector('.chevron');
      if (ch) ch.style.transform = 'rotate(0deg)';
    } else {
      body.classList.add('open');
      header.setAttribute('aria-expanded', 'true');
      var ch = header.querySelector('.chevron');
      if (ch) ch.style.transform = 'rotate(180deg)';
    }
  };


  window.toggleMobileAccordion = function(headerBtn, e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const body = headerBtn.nextElementSibling;
    if (!body) return;
    const isOpen = body.classList.toggle('open');
    headerBtn.setAttribute('aria-expanded', String(isOpen));
    const chevron = headerBtn.querySelector('.chevron');
    if (chevron) {
      chevron.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0deg)';
    }
  };

  function initApp() {
    if (window.__APP_INIT_DONE__) return;
    window.__APP_INIT_DONE__ = true;

    // Apply active navigation state
    syncActiveNavLinks();

    // -------------------------------------------------------------
    // Mobile Drawer Navigation Bindings
    // -------------------------------------------------------------
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const closeDrawerBtn = document.getElementById('closeDrawerBtn');
    const mobileDrawer = document.getElementById('mobileDrawer');
    const drawerBackdrop = document.getElementById('drawerBackdrop');

    if (hamburgerBtn) {
      hamburgerBtn.onclick = window.toggleMobileMenu;
    }
    if (closeDrawerBtn) {
      closeDrawerBtn.onclick = window.closeMobileMenu;
    }
    if (drawerBackdrop) {
      drawerBackdrop.onclick = window.closeMobileMenu;
    }

    // Global document-level event delegation
    document.addEventListener('click', (e) => {
      const targetHamburger = e.target.closest('#hamburgerBtn, .hamburger-btn');
      if (targetHamburger) {
        window.toggleMobileMenu(e);
        return;
      }

      const targetClose = e.target.closest('#closeDrawerBtn, .close-drawer-btn');
      if (targetClose) {
        window.closeMobileMenu(e);
        return;
      }

      const targetBackdrop = e.target.closest('#drawerBackdrop, .drawer-backdrop');
      if (targetBackdrop) {
        window.closeMobileMenu(e);
        return;
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        window.closeMobileMenu(e);
      }
    });

    // Mobile drawer link clicks
    document.querySelectorAll('.mobile-drawer a').forEach((link) => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href) return;

        if (
          href.startsWith('tel:') ||
          href.startsWith('mailto:') ||
          href.startsWith('http') ||
          link.getAttribute('target') === '_blank'
        ) {
          window.closeMobileMenu();
          return;
        }

        if (href.startsWith('#')) {
          e.preventDefault();
          window.closeMobileMenu();
          const target = document.querySelector(href);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
          }
          return;
        }

        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        const [linkPage, linkHash] = href.split('#');

        if (linkHash && (linkPage === '' || linkPage === currentPath)) {
          e.preventDefault();
          window.closeMobileMenu();
          const target = document.getElementById(linkHash);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
          }
          return;
        }

        window.closeMobileMenu();
      });
    });

    // -------------------------------------------------------------
    // Desktop Mega Menu Tabs (Appliance vs Brand vs Cleaning)
    // -------------------------------------------------------------
    const tabApplianceTrigger = document.getElementById('tabApplianceTrigger');
    const tabBrandTrigger = document.getElementById('tabBrandTrigger');
    const tabCleaningTrigger = document.getElementById('tabCleaningTrigger');
    const panelByAppliance = document.getElementById('panelByAppliance');
    const panelByBrand = document.getElementById('panelByBrand');
    const panelByCleaning = document.getElementById('panelByCleaning');

    function switchDesktopMode(activeBtn, targetPanel) {
      [tabApplianceTrigger, tabBrandTrigger, tabCleaningTrigger].forEach((btn) => {
        if (!btn) return;
        btn.classList.toggle('active', btn === activeBtn);
        btn.setAttribute('aria-selected', String(btn === activeBtn));
      });
      [panelByAppliance, panelByBrand, panelByCleaning].forEach((panel) => {
        if (!panel) return;
        panel.classList.toggle('active', panel === targetPanel);
      });
    }

    tabApplianceTrigger?.addEventListener('click', (e) => {
      e.preventDefault();
      switchDesktopMode(tabApplianceTrigger, panelByAppliance);
    });

    tabBrandTrigger?.addEventListener('click', (e) => {
      e.preventDefault();
      switchDesktopMode(tabBrandTrigger, panelByBrand);
    });

    tabCleaningTrigger?.addEventListener('click', (e) => {
      e.preventDefault();
      switchDesktopMode(tabCleaningTrigger, panelByCleaning);
    });

    // -------------------------------------------------------------
    // Desktop Navigation Dropdowns: Mutual Exclusion & Grace Delay
    // Prevents conflicting active states between Appliance Mega Menu & Cleaning Dropdown
    // -------------------------------------------------------------
    const megaWrapper = document.querySelector('#megaMenuWrapper');
    const megaPanel = document.querySelector('#desktopMegaMenu');
    const cleanWrapper = document.querySelector('#cleaningNavWrapper');
    const cleanPanel = document.querySelector('#cleaningDropdownPanel');

    let megaCloseTimer = null;
    let cleanCloseTimer = null;

    function openMega() {
      if (cleanCloseTimer) {
        clearTimeout(cleanCloseTimer);
        cleanCloseTimer = null;
      }
      closeCleanImmediate();

      if (megaCloseTimer) {
        clearTimeout(megaCloseTimer);
        megaCloseTimer = null;
      }
      if (megaWrapper && megaPanel) {
        megaWrapper.classList.add('hover-active');
        megaPanel.classList.add('open');
        megaPanel.style.opacity = '1';
        megaPanel.style.visibility = 'visible';
        megaPanel.style.pointerEvents = 'auto';
        megaPanel.style.transform = 'translateY(0)';
      }
    }

    function scheduleCloseMega() {
      if (megaCloseTimer) clearTimeout(megaCloseTimer);
      megaCloseTimer = setTimeout(() => {
        closeMegaImmediate();
        if (tabApplianceTrigger && panelByAppliance) {
          switchDesktopMode(tabApplianceTrigger, panelByAppliance);
        }
      }, 250);
    }

    function closeMegaImmediate() {
      if (megaCloseTimer) {
        clearTimeout(megaCloseTimer);
        megaCloseTimer = null;
      }
      if (megaWrapper && megaPanel) {
        megaWrapper.classList.remove('hover-active');
        megaPanel.classList.remove('open');
        megaPanel.style.opacity = '';
        megaPanel.style.visibility = '';
        megaPanel.style.pointerEvents = '';
        megaPanel.style.transform = '';
      }
    }

    function openClean() {
      if (megaCloseTimer) {
        clearTimeout(megaCloseTimer);
        megaCloseTimer = null;
      }
      closeMegaImmediate();

      if (cleanCloseTimer) {
        clearTimeout(cleanCloseTimer);
        cleanCloseTimer = null;
      }
      if (cleanWrapper && cleanPanel) {
        cleanWrapper.classList.add('hover-active');
        cleanPanel.classList.add('open');
        cleanPanel.style.opacity = '1';
        cleanPanel.style.visibility = 'visible';
        cleanPanel.style.pointerEvents = 'auto';
        cleanPanel.style.transform = 'translateY(0)';
      }
    }

    function scheduleCloseClean() {
      if (cleanCloseTimer) clearTimeout(cleanCloseTimer);
      cleanCloseTimer = setTimeout(() => {
        closeCleanImmediate();
      }, 250);
    }

    function closeCleanImmediate() {
      if (cleanCloseTimer) {
        clearTimeout(cleanCloseTimer);
        cleanCloseTimer = null;
      }
      if (cleanWrapper && cleanPanel) {
        cleanWrapper.classList.remove('hover-active');
        cleanPanel.classList.remove('open');
        cleanPanel.style.opacity = '';
        cleanPanel.style.visibility = '';
        cleanPanel.style.pointerEvents = '';
        cleanPanel.style.transform = '';
      }
    }

    if (megaWrapper && megaPanel) {
      megaWrapper.addEventListener('mouseenter', openMega);
      megaWrapper.addEventListener('mouseleave', scheduleCloseMega);
      megaPanel.addEventListener('mouseenter', openMega);
      megaPanel.addEventListener('mouseleave', scheduleCloseMega);
    }

    if (cleanWrapper && cleanPanel) {
      cleanWrapper.addEventListener('mouseenter', openClean);
      cleanWrapper.addEventListener('mouseleave', scheduleCloseClean);
      cleanPanel.addEventListener('mouseenter', openClean);
      cleanPanel.addEventListener('mouseleave', scheduleCloseClean);
    }

    // Master-Detail Category Switcher (Hover & Click)
    const applianceNavButtons = document.querySelectorAll('.appliance-nav-btn');
    const subpanels = document.querySelectorAll('.mega-subpanel');

    function activateSubpanel(targetId, activeBtn) {
      applianceNavButtons.forEach((btn) => btn.classList.toggle('active', btn === activeBtn));
      subpanels.forEach((panel) => {
        panel.classList.toggle('active', panel.id === targetId);
      });
    }

    applianceNavButtons.forEach((btn) => {
      const targetId = btn.getAttribute('data-target');
      const href = btn.getAttribute('data-href');
      btn.addEventListener('mouseenter', () => activateSubpanel(targetId, btn));
      btn.addEventListener('click', (e) => {
        if (e.target.closest('.category-direct-link')) {
          return;
        }
        if (btn.classList.contains('active') && href) {
          window.location.href = href;
          return;
        }
        e.preventDefault();
        activateSubpanel(targetId, btn);
      });
    });

    // -------------------------------------------------------------
    // Mobile Segmented Tab Controller (Appliances | Cleaning | Brands)
    // -------------------------------------------------------------
    const mobTabApplianceBtn = document.getElementById('mobTabApplianceBtn');
    const mobTabCleaningBtn = document.getElementById('mobTabCleaningBtn');
    const mobTabBrandBtn = document.getElementById('mobTabBrandBtn');
    const mobPanelAppliance = document.getElementById('mobPanelAppliance');
    const mobPanelCleaning = document.getElementById('mobPanelCleaning');
    const mobPanelBrand = document.getElementById('mobPanelBrand');

    function switchMobileSegment(activeBtn, targetPanel) {
      [mobTabApplianceBtn, mobTabCleaningBtn, mobTabBrandBtn].forEach((btn) => {
        btn?.classList.toggle('active', btn === activeBtn);
      });
      [mobPanelAppliance, mobPanelCleaning, mobPanelBrand].forEach((panel) => {
        panel?.classList.toggle('active', panel === targetPanel);
      });
    }

    mobTabApplianceBtn?.addEventListener('click', () => {
      switchMobileSegment(mobTabApplianceBtn, mobPanelAppliance);
    });

    mobTabCleaningBtn?.addEventListener('click', () => {
      switchMobileSegment(mobTabCleaningBtn, mobPanelCleaning);
    });

    mobTabBrandBtn?.addEventListener('click', () => {
      switchMobileSegment(mobTabBrandBtn, mobPanelBrand);
    });

    // Mobile Sub-Accordion Toggle handled by window.toggleMobileAccordion

    // -------------------------------------------------------------
    // FAQ Accordion
    // -------------------------------------------------------------
    document.querySelectorAll('.faq-question').forEach((btn) => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        if (!item) return;
        const isOpen = item.classList.contains('open');

        const parent = item.parentElement;
        parent?.querySelectorAll('.faq-item.open').forEach((other) => {
          if (other !== item) other.classList.remove('open');
        });

        item.classList.toggle('open', !isOpen);
      });
    });

    // -------------------------------------------------------------
    // Booking & Contact Forms Handling
    // -------------------------------------------------------------
    const bookingForms = document.querySelectorAll('form[id*="booking"], form[id*="contact"], form[id*="Form"]');
    bookingForms.forEach((form) => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();

        const nameInput = form.querySelector('input[name="name"], input[id*="name"], input[id*="Name"]');
        const phoneInput = form.querySelector('input[name="phone"], input[id*="phone"], input[id*="Phone"]');

        if (nameInput && !nameInput.value.trim()) {
          alert('يرجى إدخال الاسم الكريم.');
          nameInput.focus();
          return;
        }

        if (phoneInput && !phoneInput.value.trim()) {
          alert('يرجى إدخال رقم الهاتف للتواصل.');
          phoneInput.focus();
          return;
        }

        let feedback = form.querySelector('.form-feedback');
        if (!feedback) {
          feedback = document.createElement('div');
          feedback.className = 'form-feedback success';
          form.appendChild(feedback);
        }

        feedback.innerHTML = `
          <strong>تم استلام بيانات طلبك بنجاح!</strong><br>
          سيتواصل معك ممثل خدمة العملاء في أقرب وقت لتأكيد الموعد ونوع الخدمة.<br>
          للحصول على خدمة فورية الآن، يمكنك الاتصال مباشرة على: 
          <a href="tel:0570406738" style="color:#059669;font-weight:bold;">0570406738</a> أو مراسلتنا عبر 
          <a href="https://wa.me/966570406738" target="_blank" rel="noopener" style="color:#25d366;font-weight:bold;">واتساب</a>.
        `;
        feedback.style.display = 'block';
        form.reset();
      });
    });
  }

  function checkDynamicNavbar(callback) {
    const placeholder = document.querySelector('site-navbar, #navbar-placeholder, [data-navbar-placeholder]');
    if (placeholder && placeholder.innerHTML.trim() === '') {
      fetch('navbar.html')
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.text();
        })
        .then((html) => {
          placeholder.innerHTML = html;
          callback();
        })
        .catch((err) => {
          console.warn('Dynamic navbar fetch skipped:', err);
          callback();
        });
    } else {
      callback();
    }
  }

  if (typeof customElements !== 'undefined' && !customElements.get('site-navbar')) {
    customElements.define('site-navbar', class extends HTMLElement {});
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => checkDynamicNavbar(initApp));
  } else {
    checkDynamicNavbar(initApp);
  }
})();
