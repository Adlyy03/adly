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
  const tabIds = ['projects', 'skills', 'certificates', 'contact'];
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
//  PROJECTS CRUD
// ===================================

// Default projects data (seed jika localStorage kosong)
const DEFAULT_PROJECTS = [
  {
    id: 'proj-1',
    title: 'Arradea Marketplace',
    desc: 'Marketplace e-commerce lengkap dengan dashboard berbasis peran untuk pembeli, penjual, dan admin. Dibangun dengan backend Laravel dan aplikasi mobile React Native.',
    tag: 'Fullstack',
    year: '2026',
    tech: ['Laravel', 'MySQL', 'Tailwind'],
    liveUrl: 'https://arradea.my.id/',
    githubUrl: 'https://github.com/Adlyy03/arradea-laravel',
    gradient: 'gradient-1',
    featured: true,
  },
  {
    id: 'proj-2',
    title: 'ResepRahasia',
    desc: 'Aplikasi resep masakan dengan berbagai resep lezat dan mudah dibuat.',
    tag: 'Fullstack',
    year: '2024',
    tech: ['HTML', 'CSS', 'JS', 'PHP'],
    liveUrl: '#',
    githubUrl: 'https://github.com/Adlyy03/ResepRahasia',
    gradient: 'gradient-2',
    featured: false,
  },
  {
    id: 'proj-3',
    title: 'Layanan REST API',
    desc: 'Layanan API RESTful yang robust dibangun dengan Laravel Sanctum, menampilkan otentikasi, manajemen peran, dan dokumentasi API yang komprehensif.',
    tag: 'Backend',
    year: '2023',
    tech: ['PHP', 'Laravel', 'Sanctum', 'MySQL'],
    liveUrl: '#',
    githubUrl: '#',
    gradient: 'gradient-3',
    featured: false,
  },
];

const STORAGE_KEY = 'adli_portfolio_projects';

function loadProjects() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return DEFAULT_PROJECTS.map(p => ({ ...p }));
}

function saveProjects(projects) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

function generateId() {
  return 'proj-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
}

// SVG icons reusable
const ICON_LIVE = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  <polyline points="15 3 21 3 21 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <line x1="10" y1="14" x2="21" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
</svg>`;

const ICON_GITHUB = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"
    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const ICON_EDIT = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none">
  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const ICON_DELETE = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none">
  <polyline points="3 6 5 6 21 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M10 11v6M14 11v6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

function buildMockupHTML(gradient) {
  if (gradient === 'gradient-1') {
    return `<div class="mockup-bar"></div>
      <div class="mockup-content">
        <div class="mockup-line"></div>
        <div class="mockup-line short"></div>
        <div class="mockup-grid">
          <div class="mockup-card"></div>
          <div class="mockup-card"></div>
          <div class="mockup-card"></div>
        </div>
      </div>`;
  } else if (gradient === 'gradient-2') {
    return `<div class="mockup-bar"></div>
      <div class="mockup-content">
        <div class="mockup-line"></div>
        <div class="mockup-line short"></div>
        <div class="mockup-chart"></div>
      </div>`;
  }
  return `<div class="mockup-bar"></div>
    <div class="mockup-content">
      <div class="mockup-line"></div>
      <div class="mockup-line"></div>
      <div class="mockup-line short"></div>
      <div class="mockup-btn"></div>
    </div>`;
}

function buildProjectCardHTML(project, index) {
  const isFeatured = project.featured;
  const techHTML = (project.tech || []).map(t => `<span>${t}</span>`).join('');
  const delay = index * 100;

  // Gunakan gambar jika ada, fallback ke mockup
  const hasImage = project.imageData && project.imageData.length > 0;
  const imageContent = hasImage
    ? `<img src="${project.imageData}" alt="${project.title}" class="project-real-img" loading="lazy">`
    : `<div class="project-img-placeholder ${project.gradient || 'gradient-1'}">
        <div class="project-mockup">${buildMockupHTML(project.gradient || 'gradient-1')}</div>
       </div>`;

  return `
    <article class="project-card${isFeatured ? ' featured' : ''}" data-animate="fade-up" data-delay="${delay}" data-project-id="${project.id}">
      <!-- CRUD action buttons -->
      <div class="project-crud-actions">
        <button class="crud-action-btn btn-edit" title="Edit proyek" data-id="${project.id}" aria-label="Edit ${project.title}">
          ${ICON_EDIT}
        </button>
        <button class="crud-action-btn btn-delete" title="Hapus proyek" data-id="${project.id}" aria-label="Hapus ${project.title}">
          ${ICON_DELETE}
        </button>
      </div>
      <div class="project-card-inner">
        <div class="project-image">
          ${imageContent}
          <div class="project-overlay">
            <div class="project-links">
              ${project.liveUrl && project.liveUrl !== '#' ? `<a href="${project.liveUrl}" class="project-link" title="View Live" target="_blank" rel="noopener">${ICON_LIVE}</a>` : ''}
              ${project.githubUrl && project.githubUrl !== '#' ? `<a href="${project.githubUrl}" class="project-link" title="View Code" target="_blank" rel="noopener">${ICON_GITHUB}</a>` : ''}
            </div>
          </div>
        </div>
        <div class="project-info">
          <div class="project-meta">
            <span class="project-tag">${project.tag || 'Proyek'}</span>
            <span class="project-year">${project.year || ''}</span>
          </div>
          <h3 class="project-title">${project.title}</h3>
          <p class="project-desc">${project.desc}</p>
          <div class="project-tech">${techHTML}</div>
        </div>
      </div>
    </article>`;
}

function renderProjects() {
  const grid = document.getElementById('projectsGrid');
  if (!grid) return;

  const projects = loadProjects();

  if (projects.length === 0) {
    grid.innerHTML = `
      <div class="projects-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.5"/>
          <path d="M9 9h6M9 13h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <p>Belum ada proyek. Klik <strong>Tambah Proyek</strong> untuk mulai.</p>
      </div>`;
    return;
  }

  grid.innerHTML = projects.map((p, i) => buildProjectCardHTML(p, i)).join('');

  // Re-init tilt & scroll animations for new cards
  initCardTilt();
  initScrollAnimations();

  // Bind edit/delete buttons
  grid.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openEditModal(btn.dataset.id);
    });
  });

  grid.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openDeleteModal(btn.dataset.id);
    });
  });
}

// ===== IMAGE UPLOAD HELPERS =====

/**
 * Upload file ke Vercel Blob via /api/upload
 * Kembalikan URL publik atau null jika gagal
 */
async function uploadImageToServer(file, errorEl) {
  if (errorEl) errorEl.hidden = true;

  const MAX_SIZE = 2 * 1024 * 1024; // 2MB
  if (!file.type.startsWith('image/')) return null;
  if (file.size > MAX_SIZE) {
    if (errorEl) {
      errorEl.textContent = 'File terlalu besar (maks 2MB).';
      errorEl.hidden = false;
    }
    return null;
  }

  // Buat nama file unik
  const ext = file.name.split('.').pop().toLowerCase() || 'jpg';
  const base = file.name.replace(/\.[^.]+$/, '').replace(/[^a-z0-9]/gi, '-').toLowerCase().slice(0, 40);
  const filename = `${base}-${Date.now()}.${ext}`;

  try {
    const res = await fetch(`/api/upload?filename=${encodeURIComponent(filename)}`, {
      method: 'POST',
      headers: { 'content-type': file.type },
      body: file,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Upload gagal.');
    }

    const data = await res.json();
    return data.url;
  } catch (err) {
    console.error('Upload error:', err);
    if (errorEl) {
      errorEl.textContent = err.message || 'Gagal mengunggah gambar.';
      errorEl.hidden = false;
    }
    return null;
  }
}

/**
 * Hapus gambar lama dari server jika bukan base64 (migrasi data lama)
 */
async function deleteImageFromServer(url) {
  if (!url || url.startsWith('data:')) return; // skip base64 lama
  try {
    await fetch('/api/upload', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
  } catch (_) {}
}

function setImagePreview(urlOrData) {
  const hidden = document.getElementById('crudImageData');
  const preview = document.getElementById('imgUploadPreview');
  const placeholder = document.getElementById('imgUploadPlaceholder');
  const removeBtn = document.getElementById('imgUploadRemove');
  const fileInput = document.getElementById('crudImageFile');

  if (urlOrData) {
    hidden.value = urlOrData;
    preview.src = urlOrData;
    preview.hidden = false;
    placeholder.hidden = true;
    removeBtn.hidden = false;
  } else {
    hidden.value = '';
    preview.src = '';
    preview.hidden = true;
    placeholder.hidden = false;
    removeBtn.hidden = true;
    if (fileInput) fileInput.value = '';
  }
}

function initImageUpload() {
  const area = document.getElementById('imgUploadArea');
  const fileInput = document.getElementById('crudImageFile');
  const removeBtn = document.getElementById('imgUploadRemove');
  const errorMsg = document.getElementById('imgUploadError');

  if (!area || !fileInput) return;

  area.addEventListener('click', (e) => {
    if (e.target === removeBtn || removeBtn.contains(e.target)) return;
    fileInput.click();
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) handleProjectImageFile(fileInput.files[0]);
  });

  area.addEventListener('dragover', (e) => { e.preventDefault(); area.classList.add('drag-over'); });
  area.addEventListener('dragleave', () => area.classList.remove('drag-over'));
  area.addEventListener('drop', (e) => {
    e.preventDefault();
    area.classList.remove('drag-over');
    if (e.dataTransfer.files[0]) handleProjectImageFile(e.dataTransfer.files[0]);
  });

  removeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    setImagePreview('');
    if (errorMsg) errorMsg.hidden = true;
  });

  async function handleProjectImageFile(file) {
    const localUrl = URL.createObjectURL(file);
    setImagePreview(localUrl);
    area.classList.add('uploading');

    const serverUrl = await uploadImageToServer(file, errorMsg);
    area.classList.remove('uploading');

    if (serverUrl) {
      URL.revokeObjectURL(localUrl);
      setImagePreview(serverUrl);
    } else {
      setImagePreview('');
    }
  }
}

// ===== CRUD MODAL =====
let pendingDeleteId = null;

function openAddModal() {
  const form = document.getElementById('crudForm');
  const title = document.getElementById('modalTitle');
  const submitBtn = document.getElementById('crudSubmitBtn');

  title.textContent = 'Tambah Proyek';
  submitBtn.querySelector('.btn-text').textContent = 'Simpan Proyek';
  form.reset();
  document.getElementById('crudProjectId').value = '';
  setImagePreview('');

  showModal('crudModalOverlay');
}

function openEditModal(id) {
  const projects = loadProjects();
  const project = projects.find(p => p.id === id);
  if (!project) return;

  document.getElementById('modalTitle').textContent = 'Edit Proyek';
  document.getElementById('crudSubmitBtn').querySelector('.btn-text').textContent = 'Perbarui Proyek';
  document.getElementById('crudProjectId').value = project.id;
  document.getElementById('crudTitle').value = project.title || '';
  document.getElementById('crudYear').value = project.year || '';
  document.getElementById('crudDesc').value = project.desc || '';
  document.getElementById('crudTag').value = project.tag || 'Fullstack';
  document.getElementById('crudGradient').value = project.gradient || 'gradient-1';
  document.getElementById('crudLiveUrl').value = project.liveUrl || '';
  document.getElementById('crudGithubUrl').value = project.githubUrl || '';
  document.getElementById('crudTech').value = (project.tech || []).join(', ');

  // Load existing image
  setImagePreview(project.imageData || '');

  showModal('crudModalOverlay');
}

function openDeleteModal(id) {
  const projects = loadProjects();
  const project = projects.find(p => p.id === id);
  if (!project) return;

  pendingDeleteId = id;
  document.getElementById('deleteProjectName').textContent = project.title;
  showModal('deleteModalOverlay');
}

function showModal(id) {
  const overlay = document.getElementById(id);
  if (!overlay) return;
  overlay.hidden = false;
  document.body.style.overflow = 'hidden';
  // Focus first focusable element
  setTimeout(() => {
    const first = overlay.querySelector('input, select, textarea, button:not(.crud-modal-close)');
    if (first) first.focus();
  }, 100);
}

function closeModal(id) {
  const overlay = document.getElementById(id);
  if (!overlay) return;
  overlay.hidden = true;
  document.body.style.overflow = '';
}

// ===================================
//  CERTIFICATES CRUD
// ===================================

const CERT_STORAGE_KEY = 'adli_portfolio_certificates';

const DEFAULT_CERTIFICATES = [
  {
    id: 'cert-1',
    title: 'Belajar Membuat Aplikasi Web dengan React',
    issuer: 'Dicoding',
    category: 'Web Development',
    year: '2024',
    credentialUrl: 'https://www.dicoding.com/certificates/',
    imageData: '',
  },
  {
    id: 'cert-2',
    title: 'Belajar Back-End Pemula dengan JavaScript',
    issuer: 'Dicoding',
    category: 'Web Development',
    year: '2024',
    credentialUrl: 'https://www.dicoding.com/certificates/',
    imageData: '',
  },
  {
    id: 'cert-3',
    title: 'Laravel: Build RESTful API',
    issuer: 'Udemy',
    category: 'Web Development',
    year: '2023',
    credentialUrl: '',
    imageData: '',
  },
];

function loadCertificates() {
  try {
    const raw = localStorage.getItem(CERT_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return DEFAULT_CERTIFICATES.map(c => ({ ...c }));
}

function saveCertificates(certs) {
  localStorage.setItem(CERT_STORAGE_KEY, JSON.stringify(certs));
}

function generateCertId() {
  return 'cert-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
}

const CERT_CATEGORY_COLORS = {
  'Web Development': 'gradient-1',
  'Mobile': 'gradient-2',
  'Cloud': 'gradient-3',
  'Data Science': 'gradient-2',
  'UI/UX': 'gradient-1',
  'Cybersecurity': 'gradient-3',
  'Lainnya': 'gradient-1',
};

function buildCertCardHTML(cert, index) {
  const delay = index * 80;
  const hasImage = cert.imageData && cert.imageData.length > 0;
  const gradientClass = CERT_CATEGORY_COLORS[cert.category] || 'gradient-1';

  const imageContent = hasImage
    ? `<img src="${cert.imageData}" alt="${cert.title}" class="cert-card-img" loading="lazy">`
    : `<div class="cert-card-placeholder ${gradientClass}">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.5"/>
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M9 14l1.5 4L12 16l1.5 2L15 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>`;

  // Tombol "Lihat Kredensial":
  // - kalau ada foto → buka lightbox (pop-up gambar)
  // - kalau tidak ada foto tapi ada URL → buka URL
  const viewBtn = hasImage
    ? `<button type="button" class="cert-credential-btn cert-view-btn" data-src="${cert.imageData}" aria-label="Lihat kredensial">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
        </svg>
        Lihat Kredensial
      </button>`
    : cert.credentialUrl
      ? `<a href="${cert.credentialUrl}" class="cert-credential-btn" target="_blank" rel="noopener">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <polyline points="15 3 21 3 21 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="10" y1="14" x2="21" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          Lihat Kredensial
        </a>`
      : '';

  return `
    <article class="cert-card" data-animate="fade-up" data-delay="${delay}" data-cert-id="${cert.id}">
      <div class="project-crud-actions">
        <button class="crud-action-btn btn-edit" title="Edit sertifikat" data-id="${cert.id}" aria-label="Edit ${cert.title}">
          ${ICON_EDIT}
        </button>
        <button class="crud-action-btn btn-delete" title="Hapus sertifikat" data-id="${cert.id}" aria-label="Hapus ${cert.title}">
          ${ICON_DELETE}
        </button>
      </div>
      <div class="cert-card-image" ${hasImage ? 'data-has-image="true"' : ''}>
        ${imageContent}
      </div>
      <div class="cert-card-body">
        <div class="cert-card-meta">
          <span class="cert-category-badge">${cert.category || 'Lainnya'}</span>
          <span class="cert-year">${cert.year || ''}</span>
        </div>
        <h3 class="cert-title">${cert.title}</h3>
        <p class="cert-issuer">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          ${cert.issuer}
        </p>
        ${viewBtn}
      </div>
    </article>`;
}

function renderCertificates() {
  const grid = document.getElementById('certificatesGrid');
  if (!grid) return;

  const certs = loadCertificates();

  if (certs.length === 0) {
    grid.innerHTML = `
      <div class="projects-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.5"/>
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <p>Belum ada sertifikat. Klik <strong>★</strong> di footer untuk menambahkan.</p>
      </div>`;
    return;
  }

  grid.innerHTML = certs.map((c, i) => buildCertCardHTML(c, i)).join('');
  initScrollAnimations();

  // Bind edit/delete
  grid.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openCertEditModal(btn.dataset.id);
    });
  });
  grid.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openCertDeleteModal(btn.dataset.id);
    });
  });

  // Lightbox — tombol "Lihat Sertifikat"
  grid.querySelectorAll('.cert-view-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openCertLightbox(btn.dataset.src);
    });
  });
}

// ===== CERT IMAGE UPLOAD =====
function setCertImagePreview(urlOrData) {
  const hidden = document.getElementById('certImageData');
  const preview = document.getElementById('certImgPreview');
  const placeholder = document.getElementById('certImgPlaceholder');
  const removeBtn = document.getElementById('certImgRemove');
  const fileInput = document.getElementById('certImageFile');

  if (urlOrData) {
    hidden.value = urlOrData;
    preview.src = urlOrData;
    preview.hidden = false;
    placeholder.hidden = true;
    removeBtn.hidden = false;
  } else {
    hidden.value = '';
    preview.src = '';
    preview.hidden = true;
    placeholder.hidden = false;
    removeBtn.hidden = true;
    if (fileInput) fileInput.value = '';
  }
}

function initCertImageUpload() {
  const area = document.getElementById('certImgUploadArea');
  const fileInput = document.getElementById('certImageFile');
  const removeBtn = document.getElementById('certImgRemove');
  const errorMsg = document.getElementById('certImgError');

  if (!area || !fileInput) return;

  area.addEventListener('click', (e) => {
    if (removeBtn && (e.target === removeBtn || removeBtn.contains(e.target))) return;
    fileInput.click();
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) handleCertImageFile(fileInput.files[0]);
  });

  area.addEventListener('dragover', (e) => { e.preventDefault(); area.classList.add('drag-over'); });
  area.addEventListener('dragleave', () => area.classList.remove('drag-over'));
  area.addEventListener('drop', (e) => {
    e.preventDefault();
    area.classList.remove('drag-over');
    if (e.dataTransfer.files[0]) handleCertImageFile(e.dataTransfer.files[0]);
  });

  removeBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    setCertImagePreview('');
    if (errorMsg) errorMsg.hidden = true;
  });

  async function handleCertImageFile(file) {
    const localUrl = URL.createObjectURL(file);
    setCertImagePreview(localUrl);
    area.classList.add('uploading');

    const serverUrl = await uploadImageToServer(file, errorMsg);
    area.classList.remove('uploading');

    if (serverUrl) {
      URL.revokeObjectURL(localUrl);
      setCertImagePreview(serverUrl);
    } else {
      setCertImagePreview('');
    }
  }
}


// ===== CERT MODALS =====
let pendingDeleteCertId = null;

function openCertAddModal() {
  document.getElementById('certModalTitle').textContent = 'Tambah Sertifikat';
  document.getElementById('certSubmitBtn').querySelector('.btn-text').textContent = 'Simpan Sertifikat';
  document.getElementById('certForm').reset();
  document.getElementById('certId').value = '';
  setCertImagePreview('');
  showModal('certModalOverlay');
}

function openCertEditModal(id) {
  const certs = loadCertificates();
  const cert = certs.find(c => c.id === id);
  if (!cert) return;

  document.getElementById('certModalTitle').textContent = 'Edit Sertifikat';
  document.getElementById('certSubmitBtn').querySelector('.btn-text').textContent = 'Perbarui Sertifikat';
  document.getElementById('certId').value = cert.id;
  document.getElementById('certTitle').value = cert.title || '';
  document.getElementById('certYear').value = cert.year || '';
  document.getElementById('certIssuer').value = cert.issuer || '';
  document.getElementById('certCategory').value = cert.category || 'Web Development';
  document.getElementById('certCredentialUrl').value = cert.credentialUrl || '';
  setCertImagePreview(cert.imageData || '');
  showModal('certModalOverlay');
}

function openCertDeleteModal(id) {
  const certs = loadCertificates();
  const cert = certs.find(c => c.id === id);
  if (!cert) return;
  pendingDeleteCertId = id;
  document.getElementById('deleteCertName').textContent = cert.title;
  showModal('deleteCertModalOverlay');
}

// ===== CERT LIGHTBOX =====
function openCertLightbox(src) {
  const lb = document.getElementById('certLightbox');
  const img = document.getElementById('certLightboxImg');
  if (!lb || !img) return;
  img.src = src;
  lb.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeCertLightbox() {
  const lb = document.getElementById('certLightbox');
  if (!lb) return;
  lb.hidden = true;
  document.body.style.overflow = '';
}

function initCertificatesCRUD() {
  renderCertificates();
  initCertImageUpload();

  document.getElementById('btnAddCertificate')?.addEventListener('click', openCertAddModal);

  // Close buttons
  document.getElementById('certModalClose')?.addEventListener('click', () => closeModal('certModalOverlay'));
  document.getElementById('certCancelBtn')?.addEventListener('click', () => closeModal('certModalOverlay'));
  document.getElementById('deleteCertModalClose')?.addEventListener('click', () => closeModal('deleteCertModalOverlay'));
  document.getElementById('deleteCertCancelBtn')?.addEventListener('click', () => closeModal('deleteCertModalOverlay'));

  // Overlay click close
  document.getElementById('certModalOverlay')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal('certModalOverlay');
  });
  document.getElementById('deleteCertModalOverlay')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal('deleteCertModalOverlay');
  });

  // Lightbox
  document.getElementById('certLightboxClose')?.addEventListener('click', closeCertLightbox);
  document.getElementById('certLightbox')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeCertLightbox();
  });

  // Escape key (extend existing listener)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal('certModalOverlay');
      closeModal('deleteCertModalOverlay');
      closeCertLightbox();
    }
  });

  // Form submit
  document.getElementById('certForm')?.addEventListener('submit', (e) => {
    e.preventDefault();

    const id = document.getElementById('certId').value;
    const title = document.getElementById('certTitle').value.trim();
    const year = document.getElementById('certYear').value.trim();
    const issuer = document.getElementById('certIssuer').value.trim();

    if (!title || !year || !issuer) {
      const modal = document.querySelector('#certModalOverlay .crud-modal');
      if (modal && typeof anime !== 'undefined') {
        anime({ targets: modal, translateX: [-8, 8, -8, 8, 0], duration: 400, easing: 'easeInOutQuad' });
      }
      return;
    }

    const certData = {
      title,
      year,
      issuer,
      category: document.getElementById('certCategory').value,
      credentialUrl: document.getElementById('certCredentialUrl').value.trim(),
      imageData: document.getElementById('certImageData').value || '',
    };

    let certs = loadCertificates();

    if (id) {
      const idx = certs.findIndex(c => c.id === id);
      if (idx !== -1) certs[idx] = { ...certs[idx], ...certData };
    } else {
      certs.push({ id: generateCertId(), ...certData });
    }

    saveCertificates(certs);
    renderCertificates();
    closeModal('certModalOverlay');
  });

  // Delete confirm
  document.getElementById('deleteCertConfirmBtn')?.addEventListener('click', () => {
    if (!pendingDeleteCertId) return;
    let certs = loadCertificates();
    const deleted = certs.find(c => c.id === pendingDeleteCertId);
    certs = certs.filter(c => c.id !== pendingDeleteCertId);
    saveCertificates(certs);
    renderCertificates();
    // Hapus file gambar dari server
    if (deleted?.imageData) deleteImageFromServer(deleted.imageData);
    pendingDeleteCertId = null;
    closeModal('deleteCertModalOverlay');
  });
}

function initProjectsCRUD() {
  // Render initial projects
  renderProjects();

  // Image upload
  initImageUpload();

  // Add project button
  const btnAdd = document.getElementById('btnAddProject');
  if (btnAdd) btnAdd.addEventListener('click', openAddModal);

  // Close buttons
  document.getElementById('crudModalClose')?.addEventListener('click', () => closeModal('crudModalOverlay'));
  document.getElementById('crudCancelBtn')?.addEventListener('click', () => closeModal('crudModalOverlay'));
  document.getElementById('deleteModalClose')?.addEventListener('click', () => closeModal('deleteModalOverlay'));
  document.getElementById('deleteCancelBtn')?.addEventListener('click', () => closeModal('deleteModalOverlay'));

  // Close on overlay click
  document.getElementById('crudModalOverlay')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal('crudModalOverlay');
  });
  document.getElementById('deleteModalOverlay')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal('deleteModalOverlay');
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal('crudModalOverlay');
      closeModal('deleteModalOverlay');
    }
  });

  // Form submit (Create / Update)
  document.getElementById('crudForm')?.addEventListener('submit', (e) => {
    e.preventDefault();

    const id = document.getElementById('crudProjectId').value;
    const title = document.getElementById('crudTitle').value.trim();
    const year = document.getElementById('crudYear').value.trim();
    const desc = document.getElementById('crudDesc').value.trim();

    if (!title || !year || !desc) {
      // Simple shake feedback
      const modal = document.querySelector('.crud-modal');
      if (modal && typeof anime !== 'undefined') {
        anime({ targets: modal, translateX: [-8, 8, -8, 8, 0], duration: 400, easing: 'easeInOutQuad' });
      }
      return;
    }

    const techRaw = document.getElementById('crudTech').value;
    const tech = techRaw.split(',').map(t => t.trim()).filter(Boolean);

    const projectData = {
      title,
      year,
      desc,
      tag: document.getElementById('crudTag').value,
      gradient: document.getElementById('crudGradient').value,
      liveUrl: document.getElementById('crudLiveUrl').value.trim() || '#',
      githubUrl: document.getElementById('crudGithubUrl').value.trim() || '#',
      tech,
      imageData: document.getElementById('crudImageData').value || '',
    };

    let projects = loadProjects();

    if (id) {
      // UPDATE
      const idx = projects.findIndex(p => p.id === id);
      if (idx !== -1) {
        projects[idx] = { ...projects[idx], ...projectData };
      }
    } else {
      // CREATE — first project becomes featured if list is empty
      const newProject = {
        id: generateId(),
        featured: projects.length === 0,
        ...projectData,
      };
      projects.push(newProject);
    }

    saveProjects(projects);
    renderProjects();
    closeModal('crudModalOverlay');
  });

  // Delete confirm
  document.getElementById('deleteConfirmBtn')?.addEventListener('click', () => {
    if (!pendingDeleteId) return;
    let projects = loadProjects();
    const deleted = projects.find(p => p.id === pendingDeleteId);
    projects = projects.filter(p => p.id !== pendingDeleteId);
    // If first project was deleted, make next one featured
    if (projects.length > 0 && !projects.some(p => p.featured)) {
      projects[0].featured = true;
    }
    saveProjects(projects);
    renderProjects();
    // Hapus file gambar dari server
    if (deleted?.imageData) deleteImageFromServer(deleted.imageData);
    pendingDeleteId = null;
    closeModal('deleteModalOverlay');
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
  initProjectsCRUD();
  initCertificatesCRUD();
});
