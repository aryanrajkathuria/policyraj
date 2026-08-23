const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('http://localhost:5500/home.html', { waitUntil: 'load' });
  await page.waitForTimeout(2000);

  const results = {};

  async function testCalc(key, inputs, resultIds) {
    await page.evaluate((k) => selectCalculator(k), key);
    await page.waitForTimeout(200);
    for (const [id, val] of Object.entries(inputs)) {
      const el = await page.locator('id=' + id).first();
      const count = await page.locator('id=' + id).count();
      if (!count) { results[key] = 'MISSING INPUT: ' + id; return; }
      const tag = await el.evaluate(e => e.tagName);
      if (tag === 'SELECT') {
        await page.selectOption('id=' + id, val);
      } else {
        await el.fill('');
        await el.fill(val);
      }
    }
    const submitBtn = page.locator('id=calc-' + key + ' button[type=submit]');
    const btnCount = await page.locator('[id="calc-' + key + '"] button[type=submit]').count();
    if (!btnCount) { results[key] = 'MISSING SUBMIT BUTTON'; return; }
    await page.locator('[id="calc-' + key + '"] button[type=submit]').click();
    await page.waitForTimeout(300);
    const res = {};
    for (const id of resultIds) {
      const count = await page.locator('id=' + id).count();
      res[id] = count ? await page.locator('id=' + id).textContent() : 'MISSING_ELEMENT';
    }
    const anyMissing = Object.values(res).some(v => v === 'MISSING_ELEMENT');
    const allZero = Object.values(res).every(v =>
      v === '₹0' || v === '0' || v === '0 kg' || v === '0 kcal' ||
      v === '0%' || v === '0 g' || v === 'N/A' || v === '' || v === '₹0.00'
    );
    results[key] = ((anyMissing || allZero) ? 'BROKEN' : 'OK') + ' => ' + JSON.stringify(res);
  }

  await testCalc('sip',       { sipAmount: '5000', sipRate: '12', sipYears: '10' },
                              ['sipFuture','sipInvested','sipGain']);

  await testCalc('nps',       { npsAmount: '5000', npsRate: '10', npsYears: '20' },
                              ['npsCorpus','npsContribution','npsGain']);

  await testCalc('compound',  { compoundPrincipal: '100000', compoundRate: '8', compoundYears: '5', compoundFrequency: '12' },
                              ['compoundMaturity','compoundInterest','compoundPeriod']);

  await testCalc('loanEmi',   { loanCalcAmount: '500000', loanCalcRate: '10.5', loanCalcTenure: '5' },
                              ['loanEmiResult','loanTotal','loanInterest']);

  await testCalc('studentLoan', { studLoanAmount: '1000000', studLoanRate: '8.5', studMoratorium: '4', studRepayment: '7' },
                              ['studEmiResult','studBalance','studInterest']);

  await testCalc('bmi',       { bmiHeight: '170', bmiWeight: '70' },
                              ['bmiCategory']);

  await testCalc('idealWeight', { iwHeight: '170', iwGender: 'male' },
                              ['iwValue']);

  await testCalc('calorie',   { calAge: '25', calGender: 'male', calHeight: '170', calWeight: '70', calActivity: '1.55' },
                              ['calValue']);

  await testCalc('bmr',       { bmrAge: '25', bmrGender: 'male', bmrHeight: '170', bmrWeight: '70' },
                              ['bmrValue']);

  await testCalc('bodyFat',   { bfAge: '25', bfGender: 'male', bfHeight: '170', bfWeight: '70' },
                              ['bfValue']);

  await testCalc('ovulation', { ovuDate: '2026-06-01', ovuCycle: '28' },
                              ['ovuDate1','ovuWindow']);

  await testCalc('pregnancy', { pregLMP: '2026-01-01' },
                              ['pregDueDate','pregWeeks','pregTrimester']);

  await testCalc('pregnancyConception', { concLMP: '2026-01-01', concCycle: '28' },
                              ['concDate','concFertile']);

  await testCalc('pregnancyWeightGain', { pwHeight: '160', pwPreWeight: '55' },
                              ['pwGain','pwRange']);

  await testCalc('dueDate',   { ddLMP: '2026-01-01' },
                              ['ddDate','ddDays']);

  await testCalc('macro',     { macCalories: '2000', macGoal: 'maintenance' },
                              ['macCarbs','macProtein','macFat']);

  console.log('\n=== CALCULATOR TEST RESULTS ===');
  for (const [key, val] of Object.entries(results)) {
    const status = val.startsWith('OK') ? '✓' : '✗';
    console.log(status + ' ' + key + ': ' + val);
  }

  await browser.close();
})();
