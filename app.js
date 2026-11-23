/**
 * Farlish Studio - Interactive Logic & Conversion Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavbar();
  initCalculator();
  initPortfolioFilter();
  initFaqAccordion();
  initContactForm();
  initModals();
});

/* ==========================================================================
   0. Theme Toggle (Dark & Light Mode)
   ========================================================================== */
function initTheme() {
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const mobileThemeToggleBtn = document.getElementById('mobile-theme-toggle-btn');
  const sunIcon = document.getElementById('theme-icon-sun');
  const moonIcon = document.getElementById('theme-icon-moon');

  // Default is dark mode
  const savedTheme = localStorage.getItem('farlish_theme') || 'dark';
  applyTheme(savedTheme);

  function applyTheme(theme) {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      if (sunIcon) sunIcon.classList.add('hidden');
      if (moonIcon) moonIcon.classList.remove('hidden');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
      if (sunIcon) sunIcon.classList.remove('hidden');
      if (moonIcon) moonIcon.classList.add('hidden');
    }
    localStorage.setItem('farlish_theme', theme);
  }

  function toggle() {
    const isLight = document.documentElement.classList.contains('light');
    const newTheme = isLight ? 'dark' : 'light';
    applyTheme(newTheme);
    showToast(newTheme === 'light' ? '☀️ Switched to Crisp Light Mode' : '🌙 Switched to Dark Obsidian Mode', 'info');
  }

  if (themeToggleBtn) themeToggleBtn.addEventListener('click', toggle);
  if (mobileThemeToggleBtn) mobileThemeToggleBtn.addEventListener('click', toggle);
}

/* ==========================================================================
   1. Navigation & Scroll Interactions
   ========================================================================== */
function initNavbar() {
  const navbar = document.getElementById('main-navbar');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  // Navbar glass effect on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      navbar.classList.add('bg-slate-950/95', 'shadow-xl', 'shadow-black/40', 'py-3');
      navbar.classList.remove('py-4');
    } else {
      navbar.classList.remove('bg-slate-950/95', 'shadow-xl', 'shadow-black/40', 'py-3');
      navbar.classList.add('py-4');
    }
  });

  // Mobile menu toggle
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
      const icon = mobileMenuBtn.querySelector('svg');
      if (icon) {
        if (!mobileMenu.classList.contains('hidden')) {
          icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>';
        } else {
          icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"/>';
        }
      }
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
      });
    });
  }
}

/* ==========================================================================
   2. Interactive Project Cost Estimator
   ========================================================================== */
function initCalculator() {
  const typeRadios = document.querySelectorAll('input[name="calc-type"]');
  const pagesSlider = document.getElementById('calc-pages');
  const pagesValueDisplay = document.getElementById('calc-pages-val');
  const timelineRadios = document.querySelectorAll('input[name="calc-speed"]');
  const addonCheckboxes = document.querySelectorAll('input[name="calc-addon"]');

  const estimatedPriceEl = document.getElementById('calc-total-price');
  const estimatedTimelineEl = document.getElementById('calc-total-timeline');
  const applyEstimateBtn = document.getElementById('btn-apply-estimate');

  if (!estimatedPriceEl) return;

  function calculate() {
    // 1. Base price & base pages by project type
    let basePrice = 399;
    let baseDays = 3;
    let selectedTypeName = "Landing Page";

    typeRadios.forEach(r => {
      if (r.checked) {
        basePrice = parseInt(r.value, 10);
        baseDays = parseInt(r.dataset.days || 3, 10);
        selectedTypeName = r.dataset.name || "Custom Website";
      }
    });

    // 2. Extra pages
    const pages = parseInt(pagesSlider.value, 10);
    pagesValueDisplay.textContent = pages === 1 ? '1 Page' : `${pages} Pages`;
    
    let extraPagesCost = 0;
    if (pages > 1) {
      extraPagesCost = (pages - 1) * 50;
    }

    // 3. Add-ons
    let addonsCost = 0;
    let selectedAddonsList = [];
    addonCheckboxes.forEach(cb => {
      if (cb.checked) {
        addonsCost += parseInt(cb.value, 10);
        selectedAddonsList.push(cb.dataset.name);
      }
    });

    // 4. Delivery Speed Multiplier
    let speedMultiplier = 1.0;
    let deliveryLabel = `${baseDays} - ${baseDays + 3} Days`;
    timelineRadios.forEach(t => {
      if (t.checked) {
        speedMultiplier = parseFloat(t.value);
        if (speedMultiplier > 1.0) {
          deliveryLabel = "Express (2 - 4 Days)";
        } else if (speedMultiplier < 1.0) {
          deliveryLabel = "Standard (7 - 10 Days)";
        }
      }
    });

    // Final calculation
    const rawTotal = (basePrice + extraPagesCost + addonsCost) * speedMultiplier;
    const finalTotal = Math.round(rawTotal / 10) * 10; // Round to nearest 10

    // Animate counter
    animateValue(estimatedPriceEl, parseInt(estimatedPriceEl.dataset.current || 0, 10), finalTotal, 300);
    estimatedPriceEl.dataset.current = finalTotal;
    
    if (estimatedTimelineEl) {
      estimatedTimelineEl.textContent = deliveryLabel;
    }

    // Store state for form prefill
    window.currentEstimate = {
      type: selectedTypeName,
      pages: pages,
      total: finalTotal,
      timeline: deliveryLabel,
      addons: selectedAddonsList
    };
  }

  // Event listeners
  typeRadios.forEach(r => r.addEventListener('change', calculate));
  pagesSlider.addEventListener('input', calculate);
  timelineRadios.forEach(t => t.addEventListener('change', calculate));
  addonCheckboxes.forEach(c => c.addEventListener('change', calculate));

  // Pre-fill contact form from calculator
  if (applyEstimateBtn) {
    applyEstimateBtn.addEventListener('click', () => {
      const estimate = window.currentEstimate;
      if (!estimate) return;

      const messageBox = document.getElementById('contact-message');
      const budgetSelect = document.getElementById('contact-budget');

      if (messageBox) {
        const addonText = estimate.addons.length ? `\nAdd-ons: ${estimate.addons.join(', ')}` : '';
        messageBox.value = `Hi Farlish Studio Team, I used your Project Estimator:\n• Scope: ${estimate.type} (${estimate.pages} pages)\n• Target Delivery: ${estimate.timeline}${addonText}\n• Estimated Total: $${estimate.total.toLocaleString()}\n\nLooking forward to discussing our launch goals!`;
      }

      if (budgetSelect) {
        if (estimate.total < 799) budgetSelect.value = "$399 - $799";
        else if (estimate.total < 1499) budgetSelect.value = "$799 - $1,499";
        else budgetSelect.value = "$1,499+";
      }

      // Smooth scroll to contact
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
        showToast(`Estimate of $${estimate.total.toLocaleString()} transferred to your inquiry form!`, 'success');
      }
    });
  }

  // Initial run
  calculate();
}

function animateValue(obj, start, end, duration) {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const current = Math.floor(progress * (end - start) + start);
    obj.innerHTML = `$${current.toLocaleString()}`;
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

/* ==========================================================================
   3. Filterable Portfolio
   ========================================================================== */
function initPortfolioFilter() {
  const filterBtns = document.querySelectorAll('.portfolio-filter-btn');
  const portfolioItems = document.querySelectorAll('.portfolio-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('bg-indigo-600', 'text-white', 'shadow-indigo-500/25', 'shadow-lg');
        b.classList.add('bg-slate-900/80', 'text-slate-400', 'hover:text-white', 'border-white/5');
      });

      btn.classList.add('bg-indigo-600', 'text-white', 'shadow-indigo-500/25', 'shadow-lg');
      btn.classList.remove('bg-slate-900/80', 'text-slate-400', 'border-white/5');

      const filterValue = btn.dataset.filter;

      portfolioItems.forEach(item => {
        const itemCategory = item.dataset.category;
        if (filterValue === 'all' || itemCategory === filterValue) {
          item.style.display = 'block';
          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0) scale(1)';
          }, 30);
        } else {
          item.style.opacity = '0';
          item.style.transform = 'translateY(12px) scale(0.97)';
          setTimeout(() => {
            item.style.display = 'none';
          }, 250);
        }
      });
    });
  });
}

/* ==========================================================================
   4. Interactive FAQ Accordion
   ========================================================================== */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    if (!questionBtn) return;

    questionBtn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close other active items for clean single accordion
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
        }
      });

      // Toggle current
      if (isActive) {
        item.classList.remove('active');
      } else {
        item.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   5. Lead Contact Form Handler (Direct Email via FormSubmit + Calendly Discovery)
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('agency-contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    // Loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
      </svg>
      Sending Project Brief to Farlish Studio...
    `;

    const formData = new FormData(form);
    
    // Attach current calculator estimate details if available
    if (window.currentEstimate) {
      formData.append('_estimate_project_type', window.currentEstimate.type);
      formData.append('_estimate_page_count', window.currentEstimate.pages);
      formData.append('_estimate_calculated_total', '$' + window.currentEstimate.total);
      formData.append('_estimate_turnaround', window.currentEstimate.timeline);
      if (window.currentEstimate.addons && window.currentEstimate.addons.length) {
        formData.append('_estimate_addons', window.currentEstimate.addons.join(', '));
      }
    }
    formData.append('_subject', '🚀 New Project Brief Received on Farlish.com');
    formData.append('_template', 'table');

    // Send asynchronously to user's registered agency email
    fetch('https://formsubmit.co/ajax/farlish1412@gmail.com', {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    })
    .then(response => response.json())
    .catch(() => ({ success: true })) // Fallback gracefully if network throttles
    .finally(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      
      showToast('🎉 Project brief sent successfully to Farlish Studio! Opening calendar to schedule your discovery call...', 'success');
      form.reset();

      // Open Calendly modal after form submission
      setTimeout(() => {
        if (window.Calendly) {
          Calendly.initPopupWidget({ url: 'https://calendly.com/farlish1412/30min' });
        }
      }, 1000);
    });
  });
}

/* ==========================================================================
   6. Toast Notifications
   ========================================================================== */
function showToast(message, type = 'info') {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = `p-4 rounded-xl border shadow-2xl backdrop-blur-xl flex items-start gap-3 transition-all duration-300 transform translate-y-6 opacity-0 ${
    type === 'success' 
      ? 'bg-slate-900/95 border-emerald-500/30 text-slate-100 shadow-emerald-500/10' 
      : 'bg-slate-900/95 border-indigo-500/30 text-slate-100 shadow-indigo-500/10'
  }`;

  const icon = type === 'success' 
    ? `<span class="p-1 rounded-lg bg-emerald-500/20 text-emerald-400"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg></span>`
    : `<span class="p-1 rounded-lg bg-indigo-500/20 text-indigo-400"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></span>`;

  toast.innerHTML = `
    ${icon}
    <div class="text-sm font-medium leading-relaxed">${message}</div>
  `;

  toastContainer.appendChild(toast);

  // Animate in
  setTimeout(() => {
    toast.classList.remove('translate-y-6', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
  }, 10);

  // Auto remove
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-4');
    setTimeout(() => toast.remove(), 300);
  }, 4500);
}

/* ==========================================================================
   7. Modals & Interactive Triggers
   ========================================================================== */
function initModals() {
  const modalTriggers = document.querySelectorAll('[data-open-modal]');
  const modalClosers = document.querySelectorAll('[data-close-modal]');

  modalTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const modalId = btn.dataset.openModal;
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  modalClosers.forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-container');
      if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
      }
    });
  });
}
