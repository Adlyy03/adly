// main.js
let scene, camera, renderer, cube;

// Initialize Three.js 3D Scene
function initThreeJS() {
  const canvas = document.getElementById('canvas3d');
  const container = document.querySelector('.hero-3d-container');

  // Scene setup
  scene = new THREE.Scene();
  
  // Camera setup
  camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.z = 3;

  // Renderer setup
  renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setClearColor(0x000000, 0);

  // Create 3D Cube
  const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
  const material = new THREE.MeshPhongMaterial({
    color: 0xffdd59,
    emissive: 0x664400,
    shininess: 100
  });
  cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  // Add wireframe
  const wireframe = new THREE.EdgesGeometry(geometry);
  const line = new THREE.LineSegments(wireframe, new THREE.LineBasicMaterial({ color: 0x00ffff }));
  cube.add(line);

  // Lighting
  const light = new THREE.PointLight(0xffffff, 1, 100);
  light.position.set(10, 10, 10);
  scene.add(light);

  const ambientLight = new THREE.AmbientLight(0x404040);
  scene.add(ambientLight);

  // Handle resize
  window.addEventListener('resize', () => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  });

  // Mouse tracking
  document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = -(e.clientY / window.innerHeight) * 2 + 1;

    // Rotate cube based on mouse
    cube.rotation.x = y * 0.5;
    cube.rotation.y = x * 0.5;

    // Move spotlight
    const spotlight = document.querySelector('.spotlight');
    spotlight.style.left = e.clientX + 'px';
    spotlight.style.top = e.clientY + 'px';
    spotlight.style.transform = 'translate(-50%, -50%)';
  });

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);

    // Auto rotate when mouse not moving
    if (!isMouseMoving) {
      cube.rotation.x += 0.005;
      cube.rotation.y += 0.01;
    }

    renderer.render(scene, camera);
  }

  animate();
}

let isMouseMoving = true;
let mouseTimeout;

document.addEventListener('mousemove', () => {
  isMouseMoving = true;
  clearTimeout(mouseTimeout);
  mouseTimeout = setTimeout(() => {
    isMouseMoving = false;
  }, 1000);
});

// Animate text on load
document.addEventListener('DOMContentLoaded', () => {
  // Initialize 3D
  initThreeJS();

  // Animate hero title
  const heroTitle = document.querySelector('.hero-title');
  anime({
    targets: heroTitle,
    opacity: [0, 1],
    rotateX: [90, 0],
    translateY: [30, 0],
    duration: 1200,
    easing: 'easeOutQuad'
  });

  // Animate subtitle
  const heroSubtitle = document.querySelector('.hero-subtitle');
  anime({
    targets: heroSubtitle,
    opacity: [0, 1],
    translateY: [20, 0],
    duration: 1000,
    easing: 'easeOutQuad',
    delay: 300
  });

  // ===== ABOUT SECTION ANIMATIONS =====
  const aboutSection = document.querySelector('.about');
  let aboutAnimated = false;

  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !aboutAnimated) {
        aboutAnimated = true;

        // Animate about title
        const aboutTitle = document.querySelector('.about-title');
        anime({
          targets: aboutTitle,
          opacity: [0, 1],
          translateY: [20, 0],
          duration: 800,
          easing: 'easeOutQuad'
        });

        // Animate avatar
        const avatarCircle = document.querySelector('.avatar-circle');
        anime({
          targets: avatarCircle,
          opacity: [0, 1],
          scale: [0.8, 1],
          duration: 800,
          easing: 'easeOutQuad',
          delay: 100
        });

        // Animate bio
        const bioParagraph = document.querySelector('.bio-text');
        anime({
          targets: bioParagraph,
          opacity: [0, 1],
          translateX: [30, 0],
          duration: 800,
          easing: 'easeOutQuad',
          delay: 200
        });

        // Animate skills title
        const skillsTitle = document.querySelector('.skills-title');
        anime({
          targets: skillsTitle,
          opacity: [0, 1],
          translateX: [30, 0],
          duration: 600,
          easing: 'easeOutQuad',
          delay: 300
        });

        // Animate skill cards with stagger
        const skillCards = document.querySelectorAll('.skill-card');
        anime({
          targets: skillCards,
          opacity: [0, 1],
          scale: [0.8, 1],
          duration: 600,
          easing: 'easeOutQuad',
          delay: anime.stagger(80, { start: 350 })
        });

        // Animate progress bars
        const skillProgress = document.querySelectorAll('.skill-progress');
        skillProgress.forEach((progress) => {
          const finalWidth = progress.style.width;
          progress.style.width = '0%';
          anime({
            targets: progress,
            width: [0, parseFloat(finalWidth)],
            duration: 1500,
            easing: 'easeOutQuad',
            delay: anime.stagger(100, { start: 500 })
          });
        });
      }
    });
  }, observerOptions);

  if (aboutSection) {
    observer.observe(aboutSection);
  }

  // ===== SKILLS & TOOLS ANIMATIONS =====
  const skillsToolsSection = document.querySelector('.skills-tools');
  let skillsAnimated = false;

  const skillsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !skillsAnimated) {
        skillsAnimated = true;

        // Animate skill bars
        const skillBars = document.querySelectorAll('.bar-fill');
        skillBars.forEach((bar) => {
          const finalWidth = bar.getAttribute('data-width') || bar.parentElement.querySelector('.bar-fill').style.width;
          anime({
            targets: bar,
            width: [0, finalWidth],
            duration: 2000,
            easing: 'easeOutQuad',
            delay: anime.stagger(100)
          });
        });

        // Animate tool icons
        const toolIcons = document.querySelectorAll('.icon-circle');
        anime({
          targets: toolIcons,
          opacity: [0, 1],
          scale: [0.5, 1],
          duration: 600,
          easing: 'easeOutQuad',
          delay: anime.stagger(80, { start: 200 })
        });
      }
    });
  }, observerOptions);

  // ===== SKILL BARS DATA FIX =====
  const barFills = document.querySelectorAll('.bar-fill');
  barFills.forEach((bar) => {
    const label = bar.closest('.skill-bar-item').querySelector('.bar-percent');
    const percentText = label.textContent;
    const percentValue = parseInt(percentText);
    bar.setAttribute('data-width', percentValue);
  });

  if (skillsToolsSection) {
    skillsObserver.observe(skillsToolsSection);
  }

  // ===== TESTIMONIALS SECTION ANIMATIONS =====
  const testimonialsSection = document.querySelector('.testimonials');
  let testimonialsAnimated = false;

  const testimonialsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !testimonialsAnimated) {
        testimonialsAnimated = true;

        // Animate testimonial cards
        const testimonialCards = document.querySelectorAll('.testimonial-card');
        anime({
          targets: testimonialCards,
          opacity: [0, 1],
          scale: [0.9, 1],
          duration: 600,
          easing: 'easeOutQuad'
        });
      }
    });
  }, observerOptions);

  if (testimonialsSection) {
    testimonialsObserver.observe(testimonialsSection);
  }

  // ===== CONTACT SECTION ANIMATIONS =====
  const contactSection = document.querySelector('.contact');
  let contactAnimated = false;

  const contactObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !contactAnimated) {
        contactAnimated = true;

        // Animate contact title
        const contactTitle = contactSection.querySelector('.section-title');
        anime({
          targets: contactTitle,
          opacity: [0, 1],
          translateY: [20, 0],
          duration: 800,
          easing: 'easeOutQuad'
        });

        // Animate form inputs
        const inputs = contactSection.querySelectorAll('.form-group');
        anime({
          targets: inputs,
          opacity: [0, 1],
          translateY: [20, 0],
          duration: 600,
          easing: 'easeOutQuad',
          delay: anime.stagger(80, { start: 200 })
        });
      }
    });
  }, observerOptions);

  if (contactSection) {
    contactObserver.observe(contactSection);
  }
  let currentTestimonial = 0;
  const testimonialCards = document.querySelectorAll('.testimonial-card');
  const carouselPrevBtn = document.querySelector('.carousel-btn.prev');
  const carouselNextBtn = document.querySelector('.carousel-btn.next');

  function showTestimonial(index) {
    testimonialCards.forEach((card, i) => {
      card.classList.remove('active');
      if (i === index) {
        card.classList.add('active');
      }
    });
  }

  function nextTestimonial() {
    currentTestimonial = (currentTestimonial + 1) % testimonialCards.length;
    showTestimonial(currentTestimonial);
  }

  function prevTestimonial() {
    currentTestimonial = (currentTestimonial - 1 + testimonialCards.length) % testimonialCards.length;
    showTestimonial(currentTestimonial);
  }

  if (carouselNextBtn && carouselPrevBtn) {
    carouselNextBtn.addEventListener('click', nextTestimonial);
    carouselPrevBtn.addEventListener('click', prevTestimonial);
  }

  // Initialize first testimonial
  if (testimonialCards.length > 0) {
    showTestimonial(0);
  }

  // ===== CONTACT FORM ANIMATIONS =====
  const contactForm = document.querySelector('.contact-form');
  const formInputs = document.querySelectorAll('.form-input');

  formInputs.forEach((input) => {
    input.addEventListener('focus', () => {
      anime({
        targets: input,
        borderColor: '#ffdd59',
        duration: 300,
        easing: 'easeOutQuad'
      });
    });

    input.addEventListener('blur', () => {
      anime({
        targets: input,
        borderColor: 'rgba(255, 221, 89, 0.2)',
        duration: 300,
        easing: 'easeOutQuad'
      });
    });
  });

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('.submit-btn');
      
      // Animate button
      anime({
        targets: submitBtn,
        scale: [1, 0.95, 1],
        duration: 600,
        easing: 'easeOutQuad'
      });

      // Simple validation and reset
      setTimeout(() => {
        alert('Thank you for your message! I will get back to you soon.');
        contactForm.reset();
      }, 600);
    });
  }

  // ===== BACK TO TOP BUTTON =====
  const backToTopBtn = document.getElementById('backToTop');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      backToTopBtn.classList.remove('hidden');
    } else {
      backToTopBtn.classList.add('hidden');
    }
  });

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      anime({
        targets: window,
        scrollTop: 0,
        duration: 1000,
        easing: 'easeInOutQuad'
      });

      // Fallback for browsers that don't support scrollTop animation
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // Add hidden class initially
  backToTopBtn.classList.add('hidden');
});

// Navbar functionality
const hamburger = document.querySelector('.hamburger');
const navbarMenu = document.querySelector('.navbar-menu');

if (hamburger && navbarMenu) {
  hamburger.addEventListener('click', () => {
    navbarMenu.classList.toggle('active');
    hamburger.classList.toggle('toggle');
  });

  // Close menu when clicking on a link
  const navbarLinks = navbarMenu.querySelectorAll('a');
  navbarLinks.forEach(link => {
    link.addEventListener('click', () => {
      navbarMenu.classList.remove('active');
      hamburger.classList.remove('toggle');
    });
  });
}
