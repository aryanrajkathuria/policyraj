const { chromium } = require('playwright');

const QUESTIONS = [
  { q: 'hello',                                   label: '01. Greeting' },
  { q: 'What is health insurance?',               label: '02. Health Insurance Basics' },
  { q: 'How much health coverage do I need?',     label: '03. Health Coverage Amount' },
  { q: 'What is a family floater plan?',          label: '04. Family Floater' },
  { q: 'What is a top-up plan?',                  label: '05. Top-Up Plan' },
  { q: 'What is Section 80D?',                    label: '06. Section 80D Tax Benefit' },
  { q: 'I have diabetes, can I get health insurance?', label: '07. Pre-Existing Disease' },
  { q: 'What are waiting periods?',               label: '08. Waiting Periods' },
  { q: 'What is a cashless hospital?',            label: '09. Cashless Hospital' },
  { q: 'What is copay in health insurance?',      label: '10. Copay / Deductible' },
  { q: 'What is term insurance?',                 label: '11. Life / Term Insurance' },
  { q: 'How much life cover do I need?',          label: '12. Life Cover Amount' },
  { q: 'What is zero depreciation in motor insurance?', label: '13. Zero Depreciation' },
  { q: 'What is NCB?',                            label: '14. No Claim Bonus' },
  { q: 'What does travel insurance cover?',       label: '15. Travel Insurance' },
  { q: 'What is critical illness insurance?',     label: '16. Critical Illness' },
  { q: 'How do I file an insurance claim?',       label: '17. Claims Process' },
  { q: 'Why do claims get rejected?',             label: '18. Claim Rejection Reasons' },
  { q: 'How do I save tax using insurance?',      label: '19. Tax Saving Guide' },
  { q: 'What is ELSS vs PPF?',                    label: '20. ELSS vs PPF' },
  { q: 'What is NPS?',                            label: '21. NPS Pension Scheme' },
  { q: 'Tell me about annuity plans',             label: '22. Annuity Plans' },
  { q: 'What is a child plan?',                   label: '23. Child Insurance Plans' },
  { q: 'What is IDV in motor insurance?',         label: '24. IDV Explained' },
  { q: 'What are insurance myths?',               label: '25. Insurance Myths Busted' },
  { q: 'What is PMJJBY PMSBY scheme?',            label: '26. Government Schemes' },
  { q: 'Tell me about Ayushman Bharat',           label: '27. Ayushman Bharat PMJAY' },
  { q: 'What is Sukanya Samriddhi Yojana?',       label: '28. Sukanya Yojana' },
  { q: 'Insurance after marriage checklist',      label: '29. Insurance After Marriage' },
  { q: 'Power of compounding rule of 72',         label: '30. Power of Compounding' },
];

(async () => {
  console.log('\n🚀 PolicyRaj Chatbot — Live Test Session');
  console.log('═'.repeat(60));

  const browser = await chromium.launch({ headless: false, slowMo: 400 });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });

  await page.goto('http://localhost:5500/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Open chatbot
  await page.click('#chatbotBtn');
  await page.waitForTimeout(2500);
  console.log('✅ Chatbot opened\n');

  // Wait for welcome message (bot uses .chatbot-messages > div)
  await page.waitForSelector('#chatbotMessages div', { timeout: 8000 });
  await page.waitForTimeout(1000);

  let passed = 0, failed = 0;

  for (const test of QUESTIONS) {
    try {
      const inputBox = await page.$('#chatbotInput');
      await inputBox.fill('');
      await inputBox.type(test.q, { delay: 30 });
      await page.keyboard.press('Enter');

      // Wait for bot response
      await page.waitForTimeout(2000);

      // Count messages — use chatbot-messages children
      const msgs = await page.$$('#chatbotMessages .cb-bubble');
      const lastMsg = msgs[msgs.length - 1];
      const text = await lastMsg.innerHTML();

      const isFallback = text.includes("not sure") || text.includes("Hmm");
      const status = isFallback ? '⚠️  FALLBACK' : '✅ ANSWERED';
      if (!isFallback) passed++; else failed++;

      const preview = text.replace(/<[^>]*>/g, '').substring(0, 70).trim();
      console.log(`${status} | ${test.label}`);
      console.log(`          → "${preview}..."\n`);

      await page.waitForTimeout(600);
    } catch (e) {
      failed++;
      console.log(`❌ ERROR   | ${test.label} → ${e.message}\n`);
    }
  }

  console.log('═'.repeat(60));
  console.log(`📊 RESULTS: ${passed}/${QUESTIONS.length} questions answered correctly`);
  console.log(`   ✅ Passed: ${passed}  |  ⚠️  Fallback: ${failed}`);
  console.log(`   Success Rate: ${Math.round(passed/QUESTIONS.length*100)}%`);
  console.log('═'.repeat(60));
  console.log('\n🎉 Test complete! Browser stays open for your review.\n');

  // Keep browser open for manual inspection
  // await browser.close();
})();
