// =============================================
//  PORTFOLIO MAIN.JS
//  Three.js background + Anime.js animations
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

// ===== NAVBAR =====
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const menu = document.getElementById('navbarMenu');
  const links = document.querySelectorAll('.nav-link');

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
  }

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
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--navbar-h'));
      window.scrollTo({
        top: target.offsetTop - navH,
        behavior: 'smooth',
      });
    });
  });

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
  if (!form) return;

  // Focus glow animations
  form.querySelectorAll('.form-input').forEach(input => {
    input.addEventListener('focus', () => {
      anime({
        targets: input,
        borderColor: 'rgba(99, 102, 241, 0.8)',
        duration: 300,
        easing: 'easeOutQuad',
      });
    });
    input.addEventListener('blur', () => {
      anime({
        targets: input,
        borderColor: 'rgba(255, 255, 255, 0.06)',
        duration: 300,
        easing: 'easeOutQuad',
      });
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Button submit animation
    anime({
      targets: btn,
      scale: [1, 0.96, 1],
      duration: 500,
      easing: 'easeInOutQuad',
    });

    setTimeout(() => {
      form.reset();
      if (success) {
        success.style.display = 'flex';
        anime({
          targets: success,
          opacity: [0, 1],
          translateY: [10, 0],
          duration: 500,
          easing: 'easeOutQuad',
        });

        setTimeout(() => {
          anime({
            targets: success,
            opacity: 0,
            duration: 400,
            easing: 'easeInQuad',
            complete: () => { success.style.display = 'none'; success.style.opacity = 1; }
          });
        }, 4000);
      }
    }, 500);
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
  initNavbar();
  initContactForm();
  initCardTilt();
  initSkillTags();
});
