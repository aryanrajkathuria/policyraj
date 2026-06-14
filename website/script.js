// ========================
// POLICYRAJ – script.js
// ========================

/* ── Navbar scroll effect ── */
const navbar = document.getElementById('navbar');
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
    backToTop.classList.add('visible');
  } else {
    navbar.classList.remove('scrolled');
    backToTop.classList.remove('visible');
  }
});

/* ── Mobile menu toggle ── */
function toggleMenu() {
  const navLinks = document.getElementById('navLinks');
  navLinks.classList.toggle('open');
}

// Close menu when a link is clicked
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    document.getElementById('navLinks').classList.remove('open');
  });
});

/* ── Insurance category tabs ── */
function showTab(tab) {
  // Remove active from all
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.cat-tab').forEach(el => el.classList.remove('active'));

  // Activate selected
  const tabEl = document.getElementById('tab-' + tab);
  if (tabEl) tabEl.classList.add('active');

  // Activate button
  const tabs = ['health', 'life', 'motor', 'travel', 'home', 'business'];
  const idx = tabs.indexOf(tab);
  const btns = document.querySelectorAll('.cat-tab');
  if (btns[idx]) btns[idx].classList.add('active');
}

/* ── Member button toggle (single select within group) ── */
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('member-btn')) {
    const group = e.target.closest('.member-btns');
    if (!group) return;
    group.querySelectorAll('.member-btn').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
  }
});

/* ── Modal ── */
function openModal() {
  document.getElementById('modalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(e) {
  // If called from overlay click, only close if clicking the overlay itself
  if (e && e.target !== document.getElementById('modalOverlay')) return;
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.getElementById('modalOverlay').classList.remove('open');
    document.body.style.overflow = '';
  }
});

/* ── Toast ── */
function showToast() {
  const toast = document.getElementById('toast');
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
}

/* ── Contact form submit ── */
function submitForm(e) {
  e.preventDefault();
  
  const form = e.target;
  const formData = {
    access_key: "9f69ecb1-7990-4add-aaf3-95f2200b9dc6",
    name: form.querySelector('input[placeholder="Your Full Name"]').value,
    phone: form.querySelector('input[placeholder="Mobile Number"]').value,
    email: form.querySelector('input[placeholder="Email Address"]').value || "Not provided",
    insurance_type: form.querySelector('select').value,
    message: form.querySelector('textarea').value || "No additional requirements"
  };
  
  fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData)
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      showToast();
      form.reset();
    } else {
      console.error('Form submission error:', data);
    }
  })
  .catch(error => {
    console.error('Error:', error);
  });
}

/* ── Modal form submit ── */
function submitModal(e) {
  e.preventDefault();
  
  const form = e.target;
  const formData = {
    access_key: "9f69ecb1-7990-4add-aaf3-95f2200b9dc6",
    name: form.querySelector('input[placeholder="Your Name"]').value,
    phone: form.querySelector('input[placeholder="Mobile Number"]').value,
    insurance_type: form.querySelector('select').value,
    source: "Modal Quote Form"
  };
  
  fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData)
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      document.getElementById('modalOverlay').classList.remove('open');
      document.body.style.overflow = '';
      showToast();
      form.reset();
    } else {
      console.error('Form submission error:', data);
    }
  })
  .catch(error => {
    console.error('Error:', error);
  });
}

/* ── Back to top ── */
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ── Smooth reveal on scroll (Intersection Observer) ── */
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -40px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Apply to cards and sections on load
document.addEventListener('DOMContentLoaded', () => {
  const animateEls = document.querySelectorAll(
    '.service-card, .why-card, .testimonial-card, .insurance-card, .contact-item'
  );
  animateEls.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = `opacity 0.5s ease ${i * 0.05}s, transform 0.5s ease ${i * 0.05}s`;
    observer.observe(el);
  });
});

/* ── Active nav link on scroll ── */
const sections = document.querySelectorAll('section[id]');
const navLinksAll = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 100;
    if (window.scrollY >= sectionTop) {
      current = section.getAttribute('id');
    }
  });

  navLinksAll.forEach(link => {
    link.style.color = '';
    link.style.fontWeight = '';
    if (link.getAttribute('href') === '#' + current) {
      link.style.color = '#1a3c8f';
      link.style.fontWeight = '700';
    }
  });
});

/* ── Phone number formatting ── */
document.querySelectorAll('input[type="tel"]').forEach(input => {
  input.addEventListener('input', () => {
    input.value = input.value.replace(/[^0-9+\-\s]/g, '');
  });
});

console.log('🛡️ PolicyRaj – Website Loaded Successfully');
