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
async function submitForm(e) {
  e.preventDefault();
  const form    = e.target;
  const btn     = form.querySelector('button[type="submit"]');
  const name    = form.querySelector('input[placeholder="Your Full Name"]').value.trim();
  const mobile  = form.querySelector('input[placeholder="Mobile Number"]').value.trim();
  const email   = (form.querySelector('input[placeholder="Email Address"]') || {}).value || '';
  const insType = form.querySelector('select').value;
  const message = (form.querySelector('textarea') || {}).value || '';

  if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

  await submitQuoteLead({ type: 'contact', name, mobile, email, insuranceType: insType, message });

  showToast();
  form.reset();
  if (btn) { btn.disabled = false; btn.textContent = 'Send Request'; }
}

/* ── Modal form submit ── */
async function submitModal(e) {
  e.preventDefault();
  const form    = e.target;
  const name    = form.querySelector('input[name="name"], input[placeholder="Your Name"]').value.trim();
  const mobile  = form.querySelector('input[name="phone"], input[placeholder="Mobile Number"]').value.trim();
  const insType = form.querySelector('select').value;

  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
  showToast();
  form.reset();

  await submitQuoteLead({ type: 'contact', name, mobile, insuranceType: insType });
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
      // Clear inline styles after animation so CSS hover/active states work freely
      const el = entry.target;
      const dur = parseFloat(el.style.transitionDuration || '0.5') * 1000 + 100;
      setTimeout(() => {
        el.style.opacity = '';
        el.style.transform = '';
        el.style.transition = '';
      }, dur || 600);
    }
  });
}, observerOptions);

// Apply to cards and sections on load
document.addEventListener('DOMContentLoaded', () => {
  const animateEls = document.querySelectorAll(
    '.service-card, .why-card, .testimonial-card, .insurance-card, .calculator-card'
  );
  animateEls.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = `opacity 0.5s ease ${i * 0.05}s, transform 0.5s ease ${i * 0.05}s`;
    observer.observe(el);
  });
});

/* ── EMI CALCULATOR ── */
function calculateEMI(e) {
  e.preventDefault();
  const principal = Number(document.getElementById('loanAmount').value);
  const annualRate = Number(document.getElementById('interestRate').value);
  const years = Number(document.getElementById('loanTerm').value);

  if (!principal || !annualRate || !years) {
    alert('Please enter loan amount, interest rate, and term to calculate EMI.');
    return;
  }

  const monthlyRate = annualRate / 1200;
  const months = years * 12;
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
  const totalPayment = emi * months;
  const totalInterest = totalPayment - principal;

  document.getElementById('emiResult').textContent = `₹${emi.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  document.getElementById('totalInterest').textContent = `₹${totalInterest.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  document.getElementById('totalPayment').textContent = `₹${totalPayment.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  document.getElementById('paymentDuration').textContent = `${years} year${years > 1 ? 's' : ''}`;
}

function resetEMI() {
  document.getElementById('loanAmount').value = '';
  document.getElementById('interestRate').value = '';
  document.getElementById('loanTerm').value = '';
  document.getElementById('emiResult').textContent = '₹0';
  document.getElementById('totalInterest').textContent = '₹0';
  document.getElementById('totalPayment').textContent = '₹0';
  document.getElementById('paymentDuration').textContent = '0 years';
}

/* ── Financial Calculators ── */
function selectCalculator(key) {
  document.querySelectorAll('.calc-item').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.calc-panel').forEach(panel => panel.classList.remove('active'));
  const item = Array.from(document.querySelectorAll('.calc-item')).find(
    btn => btn.getAttribute('onclick') === `selectCalculator('${key}')`
  );
  const panel = document.getElementById(`calc-${key}`);
  if (item) item.classList.add('active');
  if (panel) panel.classList.add('active');
}

const placeholderCalculators = {
  bmi: {
    title: 'BMI Calculator',
    description: 'Use BMI to assess your healthy weight range based on height and weight.'
  },
  idealWeight: {
    title: 'Ideal Weight Calculator',
    description: 'Estimate your ideal body weight using standard health formulas.'
  },
  calorie: {
    title: 'Calorie Calculator',
    description: 'Find your daily calorie needs based on activity, age, and goals.'
  },
  bmr: {
    title: 'BMR Calculator',
    description: 'Calculate your basal metabolic rate to understand daily energy needs.'
  },
  bodyFat: {
    title: 'Body Fat Calculator',
    description: 'Estimate body fat percentage using common health formulas.'
  },
  ovulation: {
    title: 'Ovulation Calculator',
    description: 'Track your ovulation window for family planning and cycle awareness.'
  },
  pregnancy: {
    title: 'Pregnancy Calculator',
    description: 'Get pregnancy milestones and timing information for expectant mothers.'
  },
  pregnancyConception: {
    title: 'Pregnancy Conception Calculator',
    description: 'Estimate conception dates and fertile windows around your cycle.'
  },
  pregnancyWeightGain: {
    title: 'Pregnancy Weight Gain Calculator',
    description: 'Track healthy weight gain recommendations during pregnancy.'
  },
  dueDate: {
    title: 'Due Date Calculator',
    description: 'Estimate your baby’s expected due date from your last menstrual period.'
  },
  macro: {
    title: 'Macro Calculator',
    description: 'Plan your daily macronutrients for muscle gain, fat loss, or maintenance.'
  }
};

function formatCurrency(value) {
  return `₹${Number(value).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

function calculateSIP(e) {
  e.preventDefault();
  const amount = Number(document.getElementById('sipAmount').value);
  const rate = Number(document.getElementById('sipRate').value);
  const years = Number(document.getElementById('sipYears').value);
  if (!amount || !rate || !years) {
    alert('Please fill all SIP fields to calculate the result.');
    return;
  }
  const monthlyRate = rate / 1200;
  const months = years * 12;
  const futureValue = amount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
  const invested = amount * months;
  const gain = futureValue - invested;
  document.getElementById('sipFuture').textContent = formatCurrency(futureValue);
  document.getElementById('sipInvested').textContent = formatCurrency(invested);
  document.getElementById('sipGain').textContent = formatCurrency(gain);
}

function calculateNPS(e) {
  e.preventDefault();
  const amount = Number(document.getElementById('npsAmount').value);
  const rate = Number(document.getElementById('npsRate').value);
  const years = Number(document.getElementById('npsYears').value);
  if (!amount || !rate || !years) {
    alert('Please fill all NPS fields to calculate the result.');
    return;
  }
  const monthlyRate = rate / 1200;
  const months = years * 12;
  const corpus = amount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
  const contribution = amount * months;
  const gain = corpus - contribution;
  document.getElementById('npsCorpus').textContent = formatCurrency(corpus);
  document.getElementById('npsContribution').textContent = formatCurrency(contribution);
  document.getElementById('npsGain').textContent = formatCurrency(gain);
}

function calculateCompound(e) {
  e.preventDefault();
  const principal = Number(document.getElementById('compoundPrincipal').value);
  const rate = Number(document.getElementById('compoundRate').value);
  const years = Number(document.getElementById('compoundYears').value);
  const frequency = Number(document.getElementById('compoundFrequency').value);
  if (!principal || !rate || !years || !frequency) {
    alert('Please fill all Compound Interest fields to calculate the result.');
    return;
  }
  const r = rate / 100;
  const amount = principal * Math.pow((1 + r / frequency), frequency * years);
  const interest = amount - principal;
  document.getElementById('compoundMaturity').textContent = formatCurrency(amount);
  document.getElementById('compoundInterest').textContent = formatCurrency(interest);
  document.getElementById('compoundPeriod').textContent = `${years} year${years > 1 ? 's' : ''}`;
}

function calculateBMI(e) {
  e.preventDefault();
  const height = Number(document.getElementById('bmiHeight').value);
  const weight = Number(document.getElementById('bmiWeight').value);
  if (!height || !weight) return;
  const bmi = weight / ((height / 100) ** 2);
  let category = '';
  if (bmi < 18.5) category = 'Underweight';
  else if (bmi < 25) category = 'Normal';
  else if (bmi < 30) category = 'Overweight';
  else category = 'Obese';
  document.getElementById('bmiValue').textContent = bmi.toFixed(1);
  document.getElementById('bmiCategory').textContent = category;
}

function calculateIdealWeight(e) {
  e.preventDefault();
  const height = Number(document.getElementById('iwHeight').value);
  const gender = document.getElementById('iwGender').value;
  if (!height) return;
  let minWeight, maxWeight;
  if (gender === 'male') {
    minWeight = (height - 100) * 0.9;
    maxWeight = (height - 100) * 1.1;
  } else {
    minWeight = (height - 100) * 0.85;
    maxWeight = (height - 100) * 1.05;
  }
  document.getElementById('iwValue').textContent = `${minWeight.toFixed(1)} - ${maxWeight.toFixed(1)} kg`;
}

function calculateCalorie(e) {
  e.preventDefault();
  const age = Number(document.getElementById('calAge').value);
  const gender = document.getElementById('calGender').value;
  const height = Number(document.getElementById('calHeight').value);
  const weight = Number(document.getElementById('calWeight').value);
  const activity = Number(document.getElementById('calActivity').value);
  if (!age || !height || !weight) return;
  let bmr;
  if (gender === 'male') {
    bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
  } else {
    bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
  }
  const tdee = Math.round(bmr * activity);
  document.getElementById('calValue').textContent = `${tdee} kcal`;
}

function calculateBMR(e) {
  e.preventDefault();
  const age = Number(document.getElementById('bmrAge').value);
  const gender = document.getElementById('bmrGender').value;
  const height = Number(document.getElementById('bmrHeight').value);
  const weight = Number(document.getElementById('bmrWeight').value);
  if (!age || !height || !weight) return;
  let bmr;
  if (gender === 'male') {
    bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
  } else {
    bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
  }
  document.getElementById('bmrValue').textContent = `${Math.round(bmr)} kcal/day`;
}

function calculateBodyFat(e) {
  e.preventDefault();
  const age = Number(document.getElementById('bfAge').value);
  const gender = document.getElementById('bfGender').value;
  const height = Number(document.getElementById('bfHeight').value);
  const weight = Number(document.getElementById('bfWeight').value);
  if (!age || !height || !weight) return;
  const bmi = weight / ((height / 100) ** 2);
  let bodyFat;
  if (gender === 'male') {
    bodyFat = (1.20 * bmi) + (0.23 * age) - 16.2;
  } else {
    bodyFat = (1.20 * bmi) + (0.23 * age) - 5.4;
  }
  document.getElementById('bfValue').textContent = `${Math.max(0, bodyFat).toFixed(1)} %`;
}

function calculateOvulation(e) {
  e.preventDefault();
  const lmpStr = document.getElementById('ovuDate').value;
  const cycle = Number(document.getElementById('ovuCycle').value) || 28;
  if (!lmpStr) return;
  const lmp = new Date(lmpStr);
  const ovulation = new Date(lmp);
  ovulation.setDate(ovulation.getDate() + (cycle - 14));
  const fertileStart = new Date(ovulation);
  fertileStart.setDate(fertileStart.getDate() - 5);
  const fertileEnd = new Date(ovulation);
  fertileEnd.setDate(fertileEnd.getDate() + 1);
  document.getElementById('ovuDate1').textContent = ovulation.toDateString();
  document.getElementById('ovuWindow').textContent = `${fertileStart.toLocaleDateString()} to ${fertileEnd.toLocaleDateString()}`;
}

function calculatePregnancy(e) {
  e.preventDefault();
  const lmpStr = document.getElementById('pregLMP').value;
  if (!lmpStr) return;
  const lmp = new Date(lmpStr);
  const dueDate = new Date(lmp);
  dueDate.setDate(dueDate.getDate() + 280);
  const today = new Date();
  const weeksPassed = Math.floor((today - lmp) / (7 * 24 * 60 * 60 * 1000));
  let trimester = weeksPassed < 12 ? 'First' : weeksPassed < 26 ? 'Second' : 'Third';
  document.getElementById('pregDueDate').textContent = dueDate.toLocaleDateString();
  document.getElementById('pregWeeks').textContent = `${weeksPassed} weeks`;
  document.getElementById('pregTrimester').textContent = trimester;
}

function calculateConception(e) {
  e.preventDefault();
  const lmpStr = document.getElementById('concLMP').value;
  const cycle = Number(document.getElementById('concCycle').value) || 28;
  if (!lmpStr) return;
  const lmp = new Date(lmpStr);
  const conception = new Date(lmp);
  conception.setDate(conception.getDate() + (cycle - 14));
  const fertileStart = new Date(conception);
  fertileStart.setDate(fertileStart.getDate() - 5);
  const fertileEnd = new Date(conception);
  fertileEnd.setDate(fertileEnd.getDate() + 1);
  document.getElementById('concDate').textContent = conception.toLocaleDateString();
  document.getElementById('concFertile').textContent = `${fertileStart.toLocaleDateString()} to ${fertileEnd.toLocaleDateString()}`;
}

function calculatePregnancyWeight(e) {
  e.preventDefault();
  const height = Number(document.getElementById('pwHeight').value);
  const preWeight = Number(document.getElementById('pwPreWeight').value);
  if (!height || !preWeight) return;
  const bmi = preWeight / ((height / 100) ** 2);
  let minGain, maxGain, recommendedGain;
  if (bmi < 18.5) { minGain = 12.5; maxGain = 18; recommendedGain = 15; }
  else if (bmi < 25) { minGain = 11.5; maxGain = 16; recommendedGain = 13.5; }
  else if (bmi < 30) { minGain = 7; maxGain = 11.5; recommendedGain = 9; }
  else { minGain = 5; maxGain = 9; recommendedGain = 7; }
  document.getElementById('pwGain').textContent = `${recommendedGain} kg`;
  document.getElementById('pwRange').textContent = `${minGain} - ${maxGain} kg`;
}

function calculateDueDate(e) {
  e.preventDefault();
  const lmpStr = document.getElementById('ddLMP').value;
  if (!lmpStr) return;
  const lmp = new Date(lmpStr);
  const dueDate = new Date(lmp);
  dueDate.setDate(dueDate.getDate() + 280);
  const today = new Date();
  const daysLeft = Math.ceil((dueDate - today) / (24 * 60 * 60 * 1000));
  document.getElementById('ddDate').textContent = dueDate.toLocaleDateString();
  document.getElementById('ddDays').textContent = `${Math.max(0, daysLeft)}`;
}

function calculateMacro(e) {
  e.preventDefault();
  const calories = Number(document.getElementById('macCalories').value);
  const goal = document.getElementById('macGoal').value;
  if (!calories) return;
  let carbPercent, proteinPercent, fatPercent;
  if (goal === 'fat_loss') { carbPercent = 0.4; proteinPercent = 0.4; fatPercent = 0.2; }
  else if (goal === 'muscle_gain') { carbPercent = 0.5; proteinPercent = 0.3; fatPercent = 0.2; }
  else { carbPercent = 0.45; proteinPercent = 0.3; fatPercent = 0.25; }
  const carbs = Math.round((calories * carbPercent) / 4);
  const protein = Math.round((calories * proteinPercent) / 4);
  const fat = Math.round((calories * fatPercent) / 9);
  document.getElementById('macCarbs').textContent = `${carbs} g`;
  document.getElementById('macProtein').textContent = `${protein} g`;
  document.getElementById('macFat').textContent = `${fat} g`;
}

function calculateLoanEmi(e) {
  e.preventDefault();
  const P = Number(document.getElementById('loanCalcAmount').value);
  const annualRate = Number(document.getElementById('loanCalcRate').value);
  const years = Number(document.getElementById('loanCalcTenure').value);
  if (!P || !annualRate || !years) return;
  const r = annualRate / 12 / 100;
  const n = years * 12;
  const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const total = emi * n;
  const interest = total - P;
  const fmt = v => '₹' + Math.round(v).toLocaleString('en-IN');
  document.getElementById('loanEmiResult').textContent = fmt(emi);
  document.getElementById('loanTotal').textContent = fmt(total);
  document.getElementById('loanInterest').textContent = fmt(interest);
}

function calculateStudentLoan(e) {
  e.preventDefault();
  const P = Number(document.getElementById('studLoanAmount').value);
  const annualRate = Number(document.getElementById('studLoanRate').value);
  const moratoriumYears = Number(document.getElementById('studMoratorium').value);
  const repayYears = Number(document.getElementById('studRepayment').value);
  if (!P || !annualRate || !repayYears) return;
  const r = annualRate / 12 / 100;
  const moratoriumMonths = Math.round(moratoriumYears * 12);
  // Interest accrues during moratorium (simple interest on outstanding)
  const balanceAfter = P * Math.pow(1 + r, moratoriumMonths);
  const n = repayYears * 12;
  const emi = (balanceAfter * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const totalPaid = emi * n;
  const totalInterest = (balanceAfter - P) + (totalPaid - balanceAfter);
  const fmt = v => '₹' + Math.round(v).toLocaleString('en-IN');
  document.getElementById('studEmiResult').textContent = fmt(emi);
  document.getElementById('studBalance').textContent = fmt(balanceAfter);
  document.getElementById('studInterest').textContent = fmt(totalInterest);
}

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

/* ── 3D ANIMATIONS ── */

document.addEventListener('DOMContentLoaded', () => {
  spawnHeroOrbs();
  spawnHeroParticles();
  initVanillaTilt();
  initCounters();
  init3DReveal();
});

function spawnHeroOrbs() {
  const hero = document.querySelector('.hero-section');
  if (!hero) return;
  ['hero-orb hero-orb-1', 'hero-orb hero-orb-2'].forEach(cls => {
    const orb = document.createElement('div');
    orb.className = cls;
    hero.insertBefore(orb, hero.firstChild);
  });
}

function spawnHeroParticles() {
  const hero = document.querySelector('.hero-section');
  if (!hero) return;
  const container = document.createElement('div');
  container.className = 'particles-bg';
  hero.insertBefore(container, hero.firstChild);
  for (let i = 0; i < 22; i++) {
    const p = document.createElement('span');
    p.className = 'hero-particle';
    const size = (Math.random() * 7 + 3) | 0;
    p.style.cssText = [
      `left:${(Math.random() * 98).toFixed(1)}%`,
      `width:${size}px`,
      `height:${size}px`,
      `animation-duration:${(Math.random() * 9 + 6).toFixed(1)}s`,
      `animation-delay:${(Math.random() * 8).toFixed(1)}s`,
    ].join(';');
    container.appendChild(p);
  }
}

function initVanillaTilt() {
  if (typeof VanillaTilt === 'undefined') return;
  VanillaTilt.init(
    document.querySelectorAll('.service-card, .why-card, .google-rating-card'),
    { max: 7, speed: 400, glare: true, 'max-glare': 0.12, scale: 1.03 }
  );
  VanillaTilt.init(
    document.querySelectorAll('.testimonial-card'),
    { max: 6, speed: 500, glare: true, 'max-glare': 0.08, scale: 1.02 }
  );
}

function initCounters() {
  const stats = document.querySelectorAll('.hero-stats .stat strong');
  const cfg = [
    { target: 20,   suffix: '+',  decimals: 0 },
    { target: 5000, suffix: '+',  decimals: 0 },
    { target: 5.0,  suffix: ' ★', decimals: 1 },
    { target: 173,  suffix: '+',  decimals: 0 },
  ];
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const i = Array.from(stats).indexOf(entry.target);
      if (cfg[i]) animateCount(entry.target, cfg[i].target, cfg[i].suffix, cfg[i].decimals);
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.6 });
  stats.forEach(el => obs.observe(el));
}

function animateCount(el, to, suffix, decimals) {
  const duration = 1600;
  const start = performance.now();
  function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    const val = to * eased;
    el.textContent = (decimals ? val.toFixed(decimals) : Math.floor(val)) + suffix;
    if (p < 1) {
      requestAnimationFrame(tick);
    } else {
      el.classList.add('pulsing');
      setTimeout(() => el.classList.remove('pulsing'), 600);
    }
  }
  requestAnimationFrame(tick);
}

function init3DReveal() {
  const targets = [
    ...document.querySelectorAll('.section-header'),
    ...document.querySelectorAll('.trust-item'),
    ...document.querySelectorAll('.google-trust-block'),
    ...document.querySelectorAll('.cat-tab'),
  ];
  targets.forEach((el, i) => {
    el.classList.add('reveal-3d');
    el.style.transitionDelay = `${(i % 6) * 0.07}s`;
  });
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add('in-view');
      // Badge shimmer on trust items
      if (el.classList.contains('trust-item')) {
        setTimeout(() => {
          el.classList.add('shimmer');
          setTimeout(() => el.classList.remove('shimmer'), 1400);
        }, 300);
      }
      // Glow on Google rating card
      if (el.classList.contains('google-trust-block')) {
        const card = el.querySelector('.google-rating-card');
        if (card) {
          setTimeout(() => {
            card.classList.add('glow');
            setTimeout(() => card.classList.remove('glow'), 1300);
          }, 400);
        }
      }
      obs.unobserve(el);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
  targets.forEach(el => obs.observe(el));
}

// Nav dropdown — click to open/close on all screen sizes
document.querySelectorAll('.nav-dropdown-trigger').forEach(trigger => {
  trigger.addEventListener('click', function(e) {
    e.preventDefault();
    const li = this.closest('.nav-dropdown');
    const isOpen = li.classList.contains('open');
    document.querySelectorAll('.nav-dropdown.open').forEach(d => d.classList.remove('open'));
    if (!isOpen) li.classList.add('open');
  });
});

// Close when clicking a menu item link
document.querySelectorAll('.nav-dropdown-menu a').forEach(link => {
  link.addEventListener('click', function() {
    const li = this.closest('.nav-dropdown');
    if (li) li.classList.remove('open');
  });
});

// Close when clicking anywhere outside the dropdown
document.addEventListener('click', function(e) {
  if (!e.target.closest('.nav-dropdown')) {
    document.querySelectorAll('.nav-dropdown.open').forEach(d => d.classList.remove('open'));
  }
});

/* ═══════════════════════════════════════════════════════
   ASK RAKESH Q&A — Search, Filter & Chat Integration
   ═══════════════════════════════════════════════════════ */

// Open chatbot and optionally send a question
function askVeera(question) {
  const win = document.getElementById('chatbotWindow');
  if (win && !win.classList.contains('cb-open')) {
    toggleChat();
  }
  if (!question) return;
  setTimeout(function () {
    const input = document.getElementById('chatbotInput');
    if (input) {
      input.value = question;
      if (typeof sendChatMessage === 'function') sendChatMessage();
    }
  }, 450);
  // Smooth scroll to chatbot on mobile
  if (window.innerWidth < 768) {
    setTimeout(function () {
      const btn = document.getElementById('chatbotBtn');
      if (btn) btn.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 200);
  }
}

// Category tab filter
function aqFilterCat(btn) {
  document.querySelectorAll('.aq-tab').forEach(function (t) { t.classList.remove('active'); });
  btn.classList.add('active');
  var cat = btn.getAttribute('data-cat');
  document.querySelectorAll('.aq-card').forEach(function (card) {
    if (cat === 'all' || card.getAttribute('data-cat') === cat) {
      card.style.display = '';
    } else {
      card.style.display = 'none';
    }
  });
  // Clear search when switching tabs
  aqClearSearch();
  document.getElementById('aqNoResults').style.display = 'none';
}

// Search filter
function aqFilterQuestions() {
  var term = document.getElementById('aqSearch').value.toLowerCase().trim();
  var clearBtn = document.getElementById('aqClearBtn');
  clearBtn.style.display = term ? 'flex' : 'none';

  if (!term) {
    // Reset to current tab state
    document.querySelectorAll('.aq-card').forEach(function (card) { card.style.display = ''; });
    document.querySelectorAll('.aq-questions li').forEach(function (li) {
      li.style.display = '';
      li.classList.remove('aq-highlight');
    });
    document.getElementById('aqNoResults').style.display = 'none';
    return;
  }

  // Reset tab to "all"
  document.querySelectorAll('.aq-tab').forEach(function (t) { t.classList.remove('active'); });
  document.querySelector('.aq-tab[data-cat="all"]').classList.add('active');

  var totalVisible = 0;
  document.querySelectorAll('.aq-card').forEach(function (card) {
    var lis = card.querySelectorAll('.aq-questions li');
    var cardVisible = 0;
    lis.forEach(function (li) {
      if (li.textContent.toLowerCase().includes(term)) {
        li.style.display = '';
        li.classList.add('aq-highlight');
        cardVisible++;
        totalVisible++;
      } else {
        li.style.display = 'none';
        li.classList.remove('aq-highlight');
      }
    });
    card.style.display = cardVisible > 0 ? '' : 'none';
  });

  var noResults = document.getElementById('aqNoResults');
  if (totalVisible === 0) {
    document.getElementById('aqSearchTerm').textContent = term;
    noResults.style.display = 'block';
  } else {
    noResults.style.display = 'none';
  }
}

// Clear search
function aqClearSearch() {
  var input = document.getElementById('aqSearch');
  if (input) input.value = '';
  var clearBtn = document.getElementById('aqClearBtn');
  if (clearBtn) clearBtn.style.display = 'none';
  document.querySelectorAll('.aq-questions li').forEach(function (li) {
    li.style.display = '';
    li.classList.remove('aq-highlight');
  });
  document.querySelectorAll('.aq-card').forEach(function (card) { card.style.display = ''; });
  document.getElementById('aqNoResults').style.display = 'none';
}
