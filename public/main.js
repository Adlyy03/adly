// =============================================
//  PORTFOLIO MAIN.JS
//  Three.js background + Anime.js animations + GSAP
// =============================================

'use strict';

// ===== STATE =====
const state = {
  isMouseMoving: false,
  mouseX: 0,
  mouseY: 0,
  mouseTimeout: null,
  cursorX: 0,
  cursorY: 0,
  followerX: 0,
  followerY: 0,
};

// ===== CURSOR =====
function initCursor() {
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursorFollower');
  if (!cursor || !follower) return;

  document.addEventListener('mousemove', (e) => {
    state.cursorX = e.clientX;
    state.cursorY = e.clientY;
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  });

  function animateFollower() {
    state.followerX += (state.cursorX - state.followerX) * 0.12;
    state.followerY += (state.cursorY - state.followerY) * 0.12;
    follower.style.left = state.followerX + 'px';
    follower.style.top = state.followerY + 'px';
    requestAnimationFrame(animateFollower);
  }
  animateFollower();
}

// ===== THREE.JS BACKGROUND =====
let scene, camera, renderer, particlesMesh;

function initThreeJS() {
  const canvas = document.getElementById('canvas3d');
  if (!canvas || typeof THREE === 'undefined') return;

  const hero = document.querySelector('.hero');
  const W = hero.clientWidth;
  const H = hero.clientHeight;

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 200);
  camera.position.z = 8;

  renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  // === Particle field ===
  const COUNT = 6000;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(COUNT * 3);
  const colors = new Float32Array(COUNT * 3);

  const c1 = new THREE.Color('#6366f1'); // indigo
  const c2 = new THREE.Color('#06b6d4'); // cyan
  const c3 = new THREE.Color('#1a1a3e'); // dark

  for (let i = 0; i < COUNT; i++) {
    const i3 = i * 3;
    const r = Math.random() * 12;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);

    // Slightly disc-flattened sphere
    positions[i3]     = r * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.4;
    positions[i3 + 2] = r * Math.cos(phi);

    // Color: inner indigo → outer cyan → far dark
    const t = r / 12;
    let col;
    if (t < 0.4) {
      col = c1.clone().lerp(c2, t / 0.4);
    } else {
      col = c2.clone().lerp(c3, (t - 0.4) / 0.6);
    }
    colors[i3]     = col.r;
    colors[i3 + 1] = col.g;
    colors[i3 + 2] = col.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.018,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  particlesMesh = new THREE.Points(geometry, material);
  scene.add(particlesMesh);

  // Resize handler
  window.addEventListener('resize', () => {
    const w = hero.clientWidth;
    const h = hero.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });

  // Mouse influence
  document.addEventListener('mousemove', (e) => {
    state.mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    state.mouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
    state.isMouseMoving = true;
    clearTimeout(state.mouseTimeout);
    state.mouseTimeout = setTimeout(() => { state.isMouseMoving = false; }, 1500);
  });

  // Animation loop
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // Slow auto-rotation
    particlesMesh.rotation.y = t * 0.04;
    particlesMesh.rotation.x = Math.sin(t * 0.02) * 0.15;

    // Mouse tilt
    if (state.isMouseMoving) {
      particlesMesh.rotation.y += state.mouseX * 0.003;
      particlesMesh.rotation.x += state.mouseY * 0.002;
    }

    // Subtle scale breathing
    const s = 1 + Math.sin(t * 0.5) * 0.02;
    particlesMesh.scale.setScalar(s);

    renderer.render(scene, camera);
  }

  animate();
}

// ===== TYPED TEXT =====
function initTyped() {
  const el = document.getElementById('roleTyped');
  if (!el) return;

  const words = ['Creative Coder', 'UI/UX Enthusiast', 'Laravel Developer', 'React Developer'];
  let wordIdx = 0;
  let charIdx = 0;
  let deleting = false;
  let paused = false;

  function type() {
    if (paused) return;
    const current = words[wordIdx];

    if (!deleting) {
      el.textContent = current.slice(0, ++charIdx);
      if (charIdx === current.length) {
        paused = true;
        setTimeout(() => { paused = false; deleting = true; type(); }, 2200);
        return;
      }
    } else {
      el.textContent = current.slice(0, --charIdx);
      if (charIdx === 0) {
        deleting = false;
        wordIdx = (wordIdx + 1) % words.length;
      }
    }

    setTimeout(type, deleting ? 45 : 90);
  }

  setTimeout(type, 1800);
}

// ===== HERO ANIMATION =====
function animateHero() {
  const badge = document.getElementById('heroBadge');
  const name = document.getElementById('heroName');
  const role = document.getElementById('heroRole');
  const desc = document.getElementById('heroDesc');
  const actions = document.getElementById('heroActions');
  const scroll = document.getElementById('heroScroll');
  const pills = document.querySelectorAll('.tech-pill');

  const tl = [badge, name, role, desc, actions, scroll];
  const delays = [0, 200, 450, 650, 850, 1100];

  tl.forEach((el, i) => {
    if (!el) return;
    anime({
      targets: el,
      opacity: [0, 1],
      translateY: [i === 0 ? 0 : 28, 0],
      duration: 900,
      easing: 'easeOutQuart',
      delay: delays[i],
    });
  });

  if (pills.length) {
    anime({
      targets: pills,
      opacity: [0, 1],
      scale: [0.85, 1],
      duration: 700,
      easing: 'easeOutBack',
      delay: anime.stagger(120, { start: 1200 }),
    });
  }
}

// ===== INTERSECTION OBSERVER (scroll animations) =====
function initScrollAnimations() {
  // General fade animations
  const animatables = document.querySelectorAll('[data-animate]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const delay = parseInt(el.getAttribute('data-delay') || '0');

      setTimeout(() => {
        el.classList.add('is-visible');
      }, delay);

      observer.unobserve(el);
    });
  }, { threshold: 0.12 });

  animatables.forEach(el => observer.observe(el));

  // Skill bar observer
  const skillBarsWrap = document.querySelector('.skills-bars-wrap');
  if (skillBarsWrap) {
    let filled = false;
    const barsObserver = new IntersectionObserver((entries) => {
      if (filled || !entries[0].isIntersecting) return;
      filled = true;

      const bars = document.querySelectorAll('.skill-bar-fill');
      bars.forEach((bar, i) => {
        const targetW = bar.getAttribute('data-width') + '%';
        setTimeout(() => {
          bar.style.width = targetW;
        }, i * 120 + 400);
      });
    }, { threshold: 0.3 });

    barsObserver.observe(skillBarsWrap);
  }
}

// ===== ABOUT ANIMATIONS - PREMIUM EFFECTS =====
function initAboutAnimations() {
  const aboutSection = document.querySelector('.about');
  const imageWrap = document.querySelector('.about-image-wrap');
  const imageFrame = document.querySelector('.about-image-frame');
  const imageDots = document.querySelector('.image-dots');
  const aboutContent = document.querySelector('.about-content');
  const badges = document.querySelectorAll('.about-badge');
  const orbitLayers = document.querySelectorAll('.about-orbit-layer');
  const infoItems = document.querySelectorAll('.info-item');

  if (!aboutSection || !imageWrap || !imageFrame) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Keep initial reveal effect for the image.
  imageFrame.classList.add('reveal-animation');

  // Stagger reveal for info rows.
  if (infoItems.length > 0) {
    const infoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        infoItems.forEach((item, idx) => {
          setTimeout(() => item.classList.add('is-in'), idx * 90);
        });
        infoObserver.unobserve(entry.target);
      });
    }, { threshold: 0.26 });

    infoObserver.observe(infoItems[0]);
  }

  if (reduceMotion) return;

  const hoverState = new WeakMap();
  infoItems.forEach(item => {
    hoverState.set(item, 0);
    item.addEventListener('mouseenter', () => hoverState.set(item, 1));
    item.addEventListener('mouseleave', () => hoverState.set(item, 0));
  });

  const stateParallax = {
    targetMouseX: 0,
    targetMouseY: 0,
    mouseX: 0,
    mouseY: 0,
    targetScroll: 0,
    scroll: 0,
  };

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const lerp = (start, end, factor) => start + (end - start) * factor;

  function updateScrollDepth() {
    const rect = aboutSection.getBoundingClientRect();
    const viewH = window.innerHeight || document.documentElement.clientHeight;
    const progress = (viewH - rect.top) / (viewH + rect.height);
    stateParallax.targetScroll = clamp(progress, 0, 1);
  }

  function handleMouseMove(e) {
    const rect = imageWrap.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    stateParallax.targetMouseX = clamp(nx, -1, 1);
    stateParallax.targetMouseY = clamp(ny, -1, 1);
  }

  function handleMouseLeave() {
    stateParallax.targetMouseX = 0;
    stateParallax.targetMouseY = 0;
  }

  imageWrap.addEventListener('mousemove', handleMouseMove);
  imageWrap.addEventListener('mouseleave', handleMouseLeave);
  window.addEventListener('scroll', updateScrollDepth, { passive: true });
  window.addEventListener('resize', updateScrollDepth);
  updateScrollDepth();

  function animateParallax() {
    stateParallax.mouseX = lerp(stateParallax.mouseX, stateParallax.targetMouseX, 0.08);
    stateParallax.mouseY = lerp(stateParallax.mouseY, stateParallax.targetMouseY, 0.08);
    stateParallax.scroll = lerp(stateParallax.scroll, stateParallax.targetScroll, 0.09);

    const mx = stateParallax.mouseX;
    const my = stateParallax.mouseY;
    const scr = stateParallax.scroll;

    const frameX = mx * 13;
    const frameY = (scr * -28) + (my * -10);
    const frameRotateX = my * -5;
    const frameRotateY = mx * 7;
    const frameScale = 1 + (scr * 0.06);
    imageFrame.style.transform = `translate3d(${frameX}px, ${frameY}px, 0) rotateX(${frameRotateX}deg) rotateY(${frameRotateY}deg) scale(${frameScale})`;

    if (aboutContent) {
      aboutContent.style.transform = `translate3d(${mx * 6}px, ${(scr * -10) + (my * 4)}px, 0)`;
    }

    if (imageDots) {
      imageDots.style.transform = `translate3d(${mx * -14}px, ${(scr * -16) + (my * -8)}px, 0)`;
    }

    badges.forEach((badge, idx) => {
      const dir = idx % 2 === 0 ? 1 : -1;
      const tx = mx * (8 + idx * 4) * dir;
      const ty = (scr * -10 * dir) + (my * 7 * dir);
      badge.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
    });

    orbitLayers.forEach((layer, idx) => {
      const dir = idx % 2 === 0 ? 1 : -1;
      const tx = mx * (16 + idx * 4) * dir;
      const ty = (my * 10) + (scr * -14 * dir);
      layer.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
    });

    infoItems.forEach((item, idx) => {
      const isIn = item.classList.contains('is-in');
      const baseY = isIn ? 0 : 22;
      const depth = 1 + (idx * 0.23);
      const hover = hoverState.get(item) || 0;
      const scale = 1 + (hover * 0.03);
      const tx = mx * 4 * depth;
      const ty = baseY + (scr * -(6 + idx * 2)) + (my * 2.2 * depth);
      item.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${scale})`;
    });

    requestAnimationFrame(animateParallax);
  }

  requestAnimationFrame(animateParallax);
}

// ===== NAVBAR =====
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const menu = document.getElementById('navbarMenu');
  const links = document.querySelectorAll('.nav-link');
  const subnavLinks = document.querySelectorAll('.subnav-link');
  const tabPanels = document.querySelectorAll('[data-tab-panel]');
  const tabIds = ['projects', 'skills', 'contact'];
  let activeTabId = 'projects';

  function setActiveTab(tabId, opts = {}) {
    if (!tabIds.includes(tabId)) return;
    const { updateHash = false } = opts;

    activeTabId = tabId;
    tabPanels.forEach(panel => {
      const isActive = panel.id === tabId;
      panel.classList.toggle('is-active', isActive);
      panel.hidden = !isActive;
    });

    subnavLinks.forEach(link => {
      const isActive = link.getAttribute('data-section') === tabId;
      link.classList.toggle('active', isActive);
      link.setAttribute('aria-current', isActive ? 'page' : 'false');
    });

    if (updateHash) {
      history.replaceState(null, '', `#${tabId}`);
    }
  }

  const hashTab = window.location.hash.replace('#', '');
  if (tabIds.includes(hashTab)) {
    setActiveTab(hashTab);
  } else {
    setActiveTab('projects');
  }

  // Scroll state
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    navbar.classList.toggle('scrolled', y > 20);
    lastScroll = y;

    // Back to top
    const btn = document.getElementById('backToTop');
    if (btn) btn.classList.toggle('visible', y > 400);

    // Active nav link
    updateActiveLink();
  }, { passive: true });

  // Active link highlighting
  function updateActiveLink() {
    const sections = document.querySelectorAll('section[id]');
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 200) {
        current = sec.getAttribute('id');
      }
    });
    links.forEach(link => {
      link.classList.toggle('active', link.getAttribute('data-section') === current);
    });
    subnavLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('data-section') === activeTabId);
    });
  }

  subnavLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const tabId = link.getAttribute('data-section');
      setActiveTab(tabId, { updateHash: true });
    });
  });

  // Hamburger
  if (hamburger && menu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      menu.classList.toggle('open');
    });

    // Close on link click
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        menu.classList.remove('open');
      });
    });
  }

  // Smooth scroll for all anchor links
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      if (link.classList.contains('subnav-link')) return;

      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;

      if (tabIds.includes(target.id)) {
        e.preventDefault();
        setActiveTab(target.id, { updateHash: true });
        const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--navbar-h'));
        const subnavWrap = document.getElementById('sectionSubnavWrap');
        const scrollTarget = subnavWrap ? subnavWrap.offsetTop : target.offsetTop;
        window.scrollTo({
          top: scrollTarget - navH,
          behavior: 'smooth',
        });
        return;
      }

      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--navbar-h'));
      window.scrollTo({
        top: target.offsetTop - navH,
        behavior: 'smooth',
      });
    });
  });

  updateActiveLink();

  // Back to top
  const backBtn = document.getElementById('backToTop');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

// ===== CONTACT FORM =====
function initContactForm() {
  const form = document.getElementById('contactForm');
  const btn = document.getElementById('submitBtn');
  const success = document.getElementById('formSuccess');
  const alert = document.getElementById('formAlert');
  if (!form) return;

  // Validation helper functions
  const validators = {
    name: (value) => value.trim().length > 0,
    email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message: (value) => value.trim().length >= 10,
  };

  const fieldConfig = {
    inputName: { validator: 'name', errorMsg: 'Nama tidak boleh kosong' },
    inputEmail: { validator: 'email', errorMsg: 'Email tidak valid' },
    inputMessage: { validator: 'message', errorMsg: 'Pesan minimal 10 karakter' },
  };

  // Show/hide error state
  function setFieldError(fieldId, hasError, errorMsg = null) {
    const input = document.getElementById(fieldId);
    const group = input?.parentElement;
    if (!group) return;

    if (hasError) {
      group.classList.add('error');
      group.classList.remove('success');
      if (errorMsg) {
        const errorSpan = group.querySelector('.form-error span');
        if (errorSpan) errorSpan.textContent = errorMsg;
      }
    } else {
      group.classList.remove('error');
      group.classList.add('success');
    }
  }

  // Clear all error states
  function clearFieldErrors() {
    form.querySelectorAll('.form-group').forEach(group => {
      group.classList.remove('error', 'success');
    });
    if (alert) {
      alert.classList.remove('show');
    }
  }

  // Real-time validation on blur
  form.querySelectorAll('.form-input').forEach(input => {
    input.addEventListener('blur', () => {
      const fieldId = input.id;
      const config = fieldConfig[fieldId];
      if (!config) return;

      const isValid = validators[config.validator](input.value);
      setFieldError(fieldId, !isValid, config.errorMsg);
    });

    // Clear error on focus
    input.addEventListener('focus', () => {
      const group = input.parentElement;
      group.classList.remove('error');
    });
  });

  // Form submission with validation
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearFieldErrors();

    // Validate all required fields
    let hasErrors = false;
    Object.entries(fieldConfig).forEach(([fieldId, config]) => {
      const input = document.getElementById(fieldId);
      if (!input) return;

      const isValid = validators[config.validator](input.value);
      if (!isValid) {
        setFieldError(fieldId, true, config.errorMsg);
        hasErrors = true;
      } else {
        setFieldError(fieldId, false);
      }
    });

    // Show alert with shake animation if there are validation errors
    if (hasErrors) {
      if (alert) {
        alert.classList.add('show');
        const alertMsg = document.getElementById('alertMessage');
        if (alertMsg) alertMsg.textContent = 'Mohon periksa kembali formulir Anda';
      }
      // Shake animation on error
      anime({
        targets: form,
        translateX: [-8, 8, -8, 8, 0],
        duration: 400,
        easing: 'easeInOutQuad',
      });
      return;
    }

    // Set loading state
    form.classList.add('loading');
    btn.classList.add('loading');
    btn.disabled = true;

    // Hide normal button text/icon
    const btnText = btn.querySelector('.btn-text');
    const btnLoadingText = btn.querySelector('.btn-loading-text');
    const btnIcon = btn.querySelector('.btn-icon');
    if (btnText) btnText.style.display = 'none';
    if (btnLoadingText) btnLoadingText.style.display = 'block';
    if (btnIcon) btnIcon.style.display = 'none';

    // Disable all form inputs during submission
    form.querySelectorAll('.form-input').forEach(input => {
      input.disabled = true;
    });

    // Simulate API call (2-3 seconds)
    const submissionDelay = 2000 + Math.random() * 1000;

    // Random success/error for demo (90% success rate)
    const isSuccess = Math.random() < 0.9;

    setTimeout(() => {
      if (isSuccess) {
        // Success state
        form.classList.remove('loading', 'error');
        form.classList.add('success');

        // Animate button completion
        anime({
          targets: btn,
          scale: [1, 0.96, 1],
          duration: 400,
          easing: 'easeInOutQuad',
        });

        // Show success message with animation
        if (success) {
          success.style.display = 'flex';
          anime({
            targets: success,
            opacity: [0, 1],
            translateY: [12, 0],
            duration: 500,
            easing: 'easeOutQuad',
          });
        }

        // Reset form after delay
        setTimeout(() => {
          form.reset();
          form.classList.remove('success');
          clearFieldErrors();

          // Reset button
          btn.classList.remove('loading');
          btn.disabled = false;
          if (btnText) btnText.style.display = 'block';
          if (btnLoadingText) btnLoadingText.style.display = 'none';
          if (btnIcon) btnIcon.style.display = 'block';

          // Hide success message
          if (success) {
            anime({
              targets: success,
              opacity: 0,
              duration: 300,
              easing: 'easeInQuad',
              complete: () => { success.style.display = 'none'; success.style.opacity = 1; }
            });
          }
        }, 3000);
      } else {
        // Error state - failed to send
        form.classList.remove('loading');
        form.classList.add('error');

        // Shake animation on error
        anime({
          targets: form,
          translateX: [-8, 8, -8, 8, 0],
          duration: 400,
          easing: 'easeInOutQuad',
        });

        // Show error alert
        if (alert) {
          alert.classList.add('show');
          const alertMsg = document.getElementById('alertMessage');
          if (alertMsg) alertMsg.textContent = 'Gagal mengirim pesan. Coba lagi nanti.';

          // Animate error alert
          anime({
            targets: alert,
            opacity: [0, 1],
            translateY: [12, 0],
            duration: 400,
            easing: 'easeOutQuad',
          });
        }

        // Reset button state
        btn.classList.remove('loading');
        btn.disabled = false;
        if (btnText) btnText.style.display = 'block';
        if (btnLoadingText) btnLoadingText.style.display = 'none';
        if (btnIcon) btnIcon.style.display = 'block';

        // Enable form inputs
        form.querySelectorAll('.form-input').forEach(input => {
          input.disabled = false;
        });

        // Remove error state after 5 seconds
        setTimeout(() => {
          form.classList.remove('error');
          if (alert) alert.classList.remove('show');
        }, 5000);
      }
    }, submissionDelay);
  });
}

// ===== PROJECT HOVER TILT =====
function initCardTilt() {
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);

      card.style.transform = `
        translateY(-4px)
        rotateY(${dx * 3}deg)
        rotateX(${-dy * 2}deg)
      `;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

// ===== SKILL TAGS ANIMATION =====
function initSkillTags() {
  const tags = document.querySelectorAll('.skill-tag');
  tags.forEach(tag => {
    tag.addEventListener('mouseenter', () => {
      anime({
        targets: tag,
        scale: [1, 1.06],
        duration: 200,
        easing: 'easeOutBack',
      });
    });
    tag.addEventListener('mouseleave', () => {
      anime({
        targets: tag,
        scale: 1,
        duration: 200,
        easing: 'easeOutQuad',
      });
    });
  });
}

// ===================================
//  INIT
// ===================================
document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initThreeJS();
  animateHero();
  initTyped();
  initScrollAnimations();
  initAboutAnimations();
  initNavbar();
  initContactForm();
  initCardTilt();
  initSkillTags();
});
