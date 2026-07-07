(function () {
  'use strict';
  /* ═══════════════════════════════════════════════════════
     RAKESH — PolicyRaj AI Assistant  v2.0
     50+ question knowledge base · friendly & professional
  ═══════════════════════════════════════════════════════ */

  // ── CONVERSATION CONTEXT ─────────────────────────────
  const ctx = {
    history: [],
    lastIntent: null,
    followUpCount: 0,
    userName: null,
  };

  // ── NAME CAPTURE ──────────────────────────────────────
  function tryCaptureName(text) {
    const m = text.match(/(?:my name is|i am|i'm|call me|this is)\s+([A-Za-z]+)/i);
    if (m && m[1].length > 1) {
      ctx.userName = m[1].charAt(0).toUpperCase() + m[1].slice(1).toLowerCase();
    }
  }

  function greet() {
    return ctx.userName ? `Hey ${ctx.userName}! 😊 ` : '';
  }

  // ── KNOWLEDGE BASE ───────────────────────────────────
  const KB = [

    /* ─── GREETING ─────────────────────────────────── */
    {
      id: 'greeting',
      weight: 1,
      patterns: ['hello','hi','hey','good morning','good evening','good afternoon','namaste','hola','start','help me','what can you do','who are you','help'],
      response: () => `Namaste! 🙏 I'm <strong>Veera</strong>, your AI insurance advisor at PolicyRaj.<br><br>I can help you with <em>anything</em> — insurance, investments, tax saving, financial planning, or just a friendly chat! 😊<br><br><strong>Popular topics:</strong><br>• 🏥 Health, 🛡️ Life, 🚗 Motor, ✈️ Travel, 🏠 Home insurance<br>• 📈 Investments, 💰 Tax saving, 📋 Claims<br>• 💬 General money advice & more<br><br>What's on your mind today?`,
      quickReplies: ['🏥 Health Insurance','🛡️ Life Insurance','📈 Investments','💰 Save on Taxes','📞 Speak to Sachin']
    },

    /* ─── HEALTH INSURANCE ──────────────────────────── */
    {
      id: 'health',
      weight: 2,
      patterns: ['health insurance','health','medical insurance','hospitalization','hospitalisation','hospital','mediclaim','cashless','family floater','health plan','health cover','niva bupa','bajaj allianz gic','care health','health policy','medical cover'],
      response: () => `${greet()}<strong>🏥 Health Insurance</strong> — Your financial safety net against medical emergencies.<br><br><strong>What it covers:</strong><br>• Hospitalisation & surgery bills<br>• ICU, day-care procedures<br>• Ambulance, pre & post-hospitalisation (30/60 days)<br>• Maternity (after waiting period)<br>• AYUSH treatments in many plans<br><br><strong>Our top partner plans:</strong><br>• Niva Bupa, HDFC Ergo, ICICI Lombard, Bajaj Allianz GIC Ltd.<br><br><strong>Tax Benefit:</strong> ₹25,000 deduction under Section 80D<br><br>💡 A ₹5 lakh surgery in a private hospital can wipe out your savings — a ₹10L health cover for a family of 4 costs just <strong>₹600–800/month</strong>. Absolutely worth it!`,
      quickReplies: ['How much coverage do I need?','Family Floater vs Individual','What is a top-up plan?','Tax benefit 80D']
    },

    /* ─── HEALTH COVERAGE AMOUNT ─────────────────────── */
    {
      id: 'health_coverage',
      weight: 3,
      patterns: ['how much coverage','how much health','sum insured','coverage amount','how much cover do i need','how much health insurance','minimum health cover'],
      response: () => `${greet()}<strong>How Much Health Cover Do You Need? 🎯</strong><br><br>Simple golden rule: <strong>minimum ₹10 lakh per person in 2024</strong>.<br><br>• <strong>Age 25–35, single:</strong> ₹10L<br>• <strong>Couple (30–40):</strong> ₹20–25L floater<br>• <strong>Family of 4 (35–45):</strong> ₹25–50L floater<br>• <strong>Senior citizens (60+):</strong> ₹15–25L individual<br><br>⚠️ Medical inflation in India is <strong>14% per year</strong> — ₹5L cover today = only ₹1.5L worth in 10 years.<br><br>💡 <em>Can't afford a large cover? Buy what you can + add a top-up plan for extra coverage at very low cost!</em>`,
      quickReplies: ['What is a top-up plan?','Family Floater explained','Get a quote','Back']
    },

    /* ─── FAMILY FLOATER ─────────────────────────────── */
    {
      id: 'health_family',
      weight: 3,
      patterns: ['family floater','family plan','family health insurance','family cover','cover my family','spouse insurance','children health','kids insurance','whole family'],
      response: () => `${greet()}<strong>Family Floater vs Individual Plans 👨‍👩‍👧</strong><br><br><strong>Family Floater (One policy, whole family):</strong><br>✅ Single premium covers you + spouse + kids<br>✅ Any member can use the full sum insured<br>✅ Much more affordable — ₹20L for family of 4 ≈ ₹14,000–18,000/year<br><br><strong>Individual Plans:</strong><br>✅ Each person has dedicated sum insured<br>✅ Better if a member has pre-existing conditions<br>✅ No risk of one person depleting the pool<br><br>📌 <strong>Veera's recommendation:</strong> Family floater for you + spouse + kids. Add a <strong>separate senior citizen plan for parents</strong> — including them in your floater can double your premium!`,
      quickReplies: ['Senior citizen health plan','How much for my family?','Tax benefit 80D','Get Family Quote']
    },

    /* ─── HEALTH TAX 80D ─────────────────────────────── */
    {
      id: 'health_tax',
      weight: 2,
      patterns: ['health insurance tax','80d','health tax benefit','tax on health insurance','health insurance deduction','section 80d'],
      response: () => `${greet()}<strong>💰 Health Insurance Tax Benefits (Section 80D)</strong><br><br><strong>Who</strong> → <strong>Deduction Limit</strong><br>• Self + Spouse + Kids (below 60) → <strong>₹25,000</strong><br>• Parents (below 60) → <strong>₹25,000</strong> (additional)<br>• Parents (60+, Senior Citizens) → <strong>₹50,000</strong><br><br><strong>Maximum possible:</strong> ₹25K (self) + ₹50K (senior parents) = <strong>₹75,000 deduction</strong><br><br>At 30% tax slab → saves you <strong>₹22,500 in tax</strong> from health insurance alone! 🎉<br><br>Also: Up to ₹5,000 for preventive health check-ups is included within the limit.`,
      quickReplies: ['Best health plans for 80D','ELSS vs PPF','Section 80C tax saving','Back']
    },

    /* ─── PRE-EXISTING DISEASES ──────────────────────── */
    {
      id: 'preexisting',
      weight: 3,
      patterns: ['pre existing','pre-existing','existing disease','diabetes insurance','bp insurance','thyroid insurance','heart condition insurance','waiting period','pre existing condition','preexisting disease','chronic illness insurance','diabetic patient','diabetic','insurance with diabetes'],
      response: () => `${greet()}<strong>🏥 Pre-Existing Diseases & Health Insurance</strong><br><br>Yes, you can still get health insurance even with conditions like diabetes, BP, thyroid, or heart issues! Here's how it works:<br><br><strong>Waiting Period for Pre-Existing Diseases (PED):</strong><br>• Usually <strong>2–4 years</strong> from policy start date<br>• After the waiting period → fully covered! ✅<br>• During waiting period → you pay for PED-related treatment yourself<br><br><strong>Important Tips:</strong><br>• <strong>Always disclose</strong> all health conditions honestly — hiding them = claim rejection<br>• Some insurers (Niva Bupa, HDFC Ergo) have shorter waiting periods<br>• Buy early! The longer you wait, the harder/costlier to get cover<br><br>💡 <em>Starting now means your waiting period is over sooner. 3 years from today, everything is covered.</em>`,
      quickReplies: ['Health insurance waiting periods','Which plan for diabetics?','Family floater vs individual','Get Health Quote']
    },

    /* ─── WAITING PERIODS ────────────────────────────── */
    {
      id: 'waitingperiod',
      weight: 3,
      patterns: ['waiting period','waiting periods','initial waiting period','30 day waiting','maternity waiting','ped waiting','how long before claim','when can i claim'],
      response: () => `${greet()}<strong>⏳ Health Insurance Waiting Periods — Explained Simply</strong><br><br><strong>1. Initial Waiting Period (30 days):</strong><br>First 30 days — <em>nothing</em> is covered except accidents<br><br><strong>2. Pre-Existing Disease (PED) Waiting:</strong><br>2–4 years for conditions you had before buying the policy<br><br><strong>3. Specific Disease Waiting (1–2 years):</strong><br>Hernia, cataracts, knee replacement, piles, etc.<br><br><strong>4. Maternity Waiting (2–4 years):</strong><br>Most plans have 2–4 year wait for maternity benefits<br><br>✅ <strong>What's covered from Day 1 (no waiting):</strong><br>• Accidents & injuries<br>• Emergency hospitalisation due to sudden illness<br><br>💡 <em>This is why buying health insurance at a young age is so smart — you complete your waiting periods while you're healthy!</em>`,
      quickReplies: ['Pre-existing disease cover','Health insurance portability','Get health quote','Back']
    },

    /* ─── TOP-UP PLANS ───────────────────────────────── */
    {
      id: 'top_up',
      weight: 3,
      patterns: ['top up','top-up','super top up','super top-up','top up plan','topup','health top up','enhance coverage','increase coverage cheaply','supplement health'],
      response: () => `${greet()}<strong>📈 Top-Up & Super Top-Up Health Plans — Smart Budget Coverage!</strong><br><br>A top-up plan gives you <strong>extra coverage at a very low premium</strong> — perfect if you have a basic company plan or want to enhance coverage affordably.<br><br><strong>How it works:</strong><br>• You set a "deductible" (e.g., ₹5L)<br>• For any claim, you pay the first ₹5L (from base policy or pocket)<br>• Top-up covers everything <em>above</em> ₹5L<br><br><strong>Example:</strong> ₹20L surgery → your ₹5L base policy pays first ₹5L → top-up pays remaining ₹15L ✅<br><br><strong>Super Top-Up:</strong> Even better — counts ALL claims in a year combined to trigger deductible<br><br>💰 <strong>A ₹20L super top-up with ₹5L deductible costs just ₹2,000–3,000/year!</strong><br><br>💡 <em>Best strategy: ₹5L base plan + ₹25L super top-up = ₹30L effective cover at 40% less cost.</em>`,
      quickReplies: ['How much health coverage?','Family floater plan','Get top-up quote','Back']
    },

    /* ─── CRITICAL ILLNESS ───────────────────────────── */
    {
      id: 'critical_illness',
      weight: 2,
      patterns: ['critical illness','cancer insurance','heart attack insurance','stroke insurance','critical disease','ci plan','critical care','life threatening disease','kidney failure insurance','organ transplant'],
      response: () => `${greet()}<strong>🚨 Critical Illness Insurance — Lump Sum When You Need It Most</strong><br><br>Regular health insurance pays hospitals. Critical illness insurance pays <em>you directly</em> as a lump sum — for income replacement, recovery, lifestyle adjustments, and more.<br><br><strong>Covered conditions (typically 30–64 diseases):</strong><br>• Cancer (all stages covered in most plans)<br>• Heart attack, bypass surgery<br>• Stroke with permanent effects<br>• Kidney failure requiring dialysis<br>• Major organ transplant<br>• Paralysis, multiple sclerosis<br>• And many more<br><br><strong>How much to buy:</strong> Minimum 3–5× your annual income<br><br><strong>Cost:</strong> ₹25L cover at age 35 ≈ ₹5,000–8,000/year<br><br>💡 <em>Cancer treatment in India today costs ₹15–50 lakh. A critical illness plan ensures you can focus on recovery, not finances.</em>`,
      quickReplies: ['How much CI cover?','CI vs health insurance','Get CI quote','Back']
    },

    /* ─── PERSONAL ACCIDENT ──────────────────────────── */
    {
      id: 'personal_accident',
      weight: 2,
      patterns: ['personal accident','accident insurance','accidental death','accidental disability','permanent disability','pa insurance','disability insurance','accident cover','accidental benefit'],
      response: () => `${greet()}<strong>🚑 Personal Accident Insurance — Often Overlooked, Always Needed</strong><br><br>This covers you specifically for <strong>accidents</strong> — separate from health or life insurance.<br><br><strong>What it covers:</strong><br>• Accidental death → family gets lump sum (e.g., ₹25L–1 Crore)<br>• Permanent total disability (e.g., both eyes, both legs) → 100% sum insured<br>• Permanent partial disability (e.g., one hand) → proportionate payout<br>• Temporary total disability → weekly income (can't work due to accident)<br><br><strong>Why you need it separately:</strong><br>• Accidents are the #1 cause of death for ages 15–44 in India<br>• Health insurance covers treatment — PA covers income loss & disability<br>• A ₹25L PA cover costs just <strong>₹1,500–2,500/year!</strong><br><br>💡 <em>If your job involves driving, travelling, or physical work — this is non-negotiable.</em>`,
      quickReplies: ['How much PA cover?','PA vs Term Insurance','Get PA Insurance quote','Back']
    },

    /* ─── HEALTH INSURANCE PORTABILITY ──────────────── */
    {
      id: 'portability',
      weight: 2,
      patterns: ['portability','port health insurance','switch insurer','change insurer','transfer health policy','migrate health plan','switch health plan','health insurance switch','policy portability','port my health insurance','port my policy','porting'],
      response: () => `${greet()}<strong>🔄 Health Insurance Portability — Switch Without Losing Benefits!</strong><br><br>IRDAI mandates that you can switch your health insurer while keeping your <strong>accumulated benefits</strong>.<br><br><strong>What carries over:</strong><br>• Waiting period credit (PED waiting period doesn't restart!)<br>• No-claim bonus accumulated<br>• Continuity benefits<br><br><strong>How to port:</strong><br>1. Apply to new insurer <strong>45–60 days before renewal date</strong><br>2. Fill portability form with policy details<br>3. New insurer can't reject portability unless medically unfit<br>4. New policy starts seamlessly<br><br><strong>When to consider porting:</strong><br>• Your current insurer has poor claim settlement<br>• You found a better plan elsewhere<br>• Premium increased too much at renewal<br><br>📞 <em>Sachin helps clients port their policies hassle-free. Call <strong>9013976999</strong>.</em>`,
      quickReplies: ['Best health insurers','Claim settlement ratio','Renewal tips','Speak to Sachin']
    },

    /* ─── CASHLESS HOSPITALS ─────────────────────────── */
    {
      id: 'cashless',
      weight: 3,
      patterns: ['cashless hospital','network hospital','cashless treatment','empanelled hospital','hospital list','find cashless hospital','hospital network','which hospitals cashless'],
      response: () => `${greet()}<strong>🏥 Cashless Hospital Network — How It Works</strong><br><br><strong>How to use cashless treatment:</strong><br>1. Go to a <strong>network hospital</strong> (empanelled with your insurer)<br>2. Show your health card + photo ID at TPA/insurance desk<br>3. Fill a pre-authorisation form<br>4. Insurer approves and pays hospital directly<br>5. You only pay items not covered (like food/non-medical items)<br><br><strong>Finding network hospitals:</strong><br>• Check your insurer's app or website<br>• Call the TPA helpline on your health card<br>• Or ask Sachin — we'll help you locate the nearest cashless hospital<br><br><strong>Top networks:</strong><br>• Niva Bupa: 10,000+ hospitals<br>• HDFC Ergo: 13,000+ hospitals<br>• ICICI Lombard: 6,500+ hospitals<br><br>💡 <em>For planned surgeries, always check empanelment first. For emergencies, get admission first — cashless can be arranged within hours.</em>`,
      quickReplies: ['How to file claim','Reimbursement vs cashless','Get health insurance','Speak to Sachin']
    },

    /* ─── COPAY / DEDUCTIBLE ─────────────────────────── */
    {
      id: 'copay',
      weight: 2,
      patterns: ['copay','co-pay','copayment','deductible','coinsurance','co-insurance','what is deductible','what is copay','what does copay mean','room rent limit','sub limit'],
      response: () => `${greet()}<strong>📖 Copay, Deductible & Sub-limits — Decoded Simply!</strong><br><br><strong>Copay:</strong><br>You pay a fixed % of every claim. E.g., 10% copay on ₹1L bill → you pay ₹10,000, insurer pays ₹90,000. Common in senior citizen plans to keep premiums low.<br><br><strong>Deductible:</strong><br>Fixed amount you pay first. E.g., ₹5L deductible → you pay first ₹5L of any claim. Insurer pays above that. (Used in top-up plans)<br><br><strong>Room Rent Sub-limit:</strong><br>Some policies limit room rent to 1% of sum insured/day. ₹5L policy → ₹5,000/day room limit. If you take a ₹10,000 room, <em>all charges are proportionately reduced</em>!<br><br><strong>Disease Sub-limits:</strong><br>E.g., cataracts capped at ₹30,000 even if sum insured is ₹10L.<br><br>✅ <em>Best plans have NO copay, NO room rent limits, NO sub-limits. Always check before buying!</em>`,
      quickReplies: ['Find plans with no copay','What is a top-up plan?','Get health quote','Back']
    },

    /* ─── LIFE / TERM INSURANCE ─────────────────────── */
    {
      id: 'life',
      weight: 2,
      patterns: ['life insurance','term plan','term insurance','life cover','death benefit','life policy','term','hdfc life','max life','sbi life','lic','icici prudential','kotak life','life plan','whole life'],
      response: () => `${greet()}<strong>🛡️ Life Insurance</strong> — Financial security for your loved ones.<br><br><strong>Types available:</strong><br>• <strong>Term Plan</strong> — Pure protection. ₹1 Crore at just ₹700–1,000/month (age 30). Best value for money.<br>• <strong>ULIP</strong> — Protection + market-linked investment<br>• <strong>Endowment</strong> — Protection + guaranteed savings<br>• <strong>Money Back</strong> — Protection + regular payouts every 5 years<br>• <strong>Whole Life</strong> — Covers you up to age 99/100<br>• <strong>TROP (Term + Return of Premium)</strong> — All premiums returned if you survive<br><br>💡 <strong>For most people: Buy a Term Plan first.</strong> Highest cover, lowest cost. Invest savings in ELSS/NPS separately.`,
      quickReplies: ['How much life cover?','Term vs Endowment','What is TROP?','💬 Get Life Quote']
    },

    /* ─── LIFE — HOW MUCH ────────────────────────────── */
    {
      id: 'life_howmuch',
      weight: 3,
      patterns: ['how much life cover','life sum assured','how much life insurance do i need','life insurance amount','how much term cover','ideal life insurance'],
      response: () => `${greet()}<strong>How Much Life Cover Do You Need? 🎯</strong><br><br><strong>Golden Rule: 10–15× your annual income.</strong><br><br>Annual income ₹8L → need ₹80L–1.2 Crore<br>Annual income ₹15L → need ₹1.5–2.25 Crore<br><br><strong>Also add:</strong><br>• Outstanding home loan → add full loan amount<br>• Child's education → ₹50L–1 Crore<br>• Spouse income replacement → 20+ years expenses<br><br>📊 <strong>Good target: ₹1.5–2 Crore for most working Indians.</strong><br><br>A ₹1 Crore term plan at age 30 = ~₹800/month. At age 40 = ~₹1,700/month.<br><strong>Start early. Every year of delay costs you more.</strong>`,
      quickReplies: ['Compare term plans','Term with Return of Premium','Child plan for education','Get Term Quote']
    },

    /* ─── TROP — TERM WITH RETURN OF PREMIUM ────────── */
    {
      id: 'trop',
      weight: 2,
      patterns: ['trop','return of premium','term with return','return of premium plan','money back term','ropt','premium return term'],
      response: () => `${greet()}<strong>💰 TROP — Term with Return of Premium</strong><br><br>TROP is a term plan where <strong>all your premiums are returned</strong> if you survive the policy term. Best of both worlds!<br><br><strong>Example:</strong><br>₹1 Crore, 30-year TROP at age 30<br>• Annual premium: ₹18,000–25,000/year (vs ₹9,000 regular term)<br>• If you survive 30 years → get back ₹5.4–7.5 Lakh (all premiums returned, tax-free!)<br>• If you don't → family gets ₹1 Crore<br><br><strong>TROP vs Pure Term:</strong><br>• TROP premium is ~2× regular term<br>• Pure term = cheaper; invest the difference in ELSS (better returns)<br>• TROP = peace of mind that "money isn't wasted"<br><br>📌 <strong>Veera's take:</strong> For people who feel uncomfortable "paying for nothing", TROP is perfect. For smart investors, pure term + ELSS is better.`,
      quickReplies: ['Pure Term vs TROP comparison','Life insurance riders','ELSS for investment','Get Term Quote']
    },

    /* ─── LIFE INSURANCE RIDERS ──────────────────────── */
    {
      id: 'riders',
      weight: 2,
      patterns: ['rider','riders','life insurance rider','add on life insurance','waiver of premium','accidental death benefit rider','critical illness rider','disability rider','income benefit rider','life add on'],
      response: () => `${greet()}<strong>🔧 Life Insurance Riders — Supercharge Your Policy!</strong><br><br>Riders are add-ons to your base life/term plan that add extra benefits at very low extra cost:<br><br><strong>Top Riders:</strong><br>• <strong>Accidental Death Benefit</strong> — Extra payout (e.g., 2× sum insured) if death is accidental<br>• <strong>Critical Illness Rider</strong> — Lump sum on diagnosis of 30+ critical illnesses<br>• <strong>Permanent Disability Rider</strong> — Pays full sum insured if you become disabled<br>• <strong>Waiver of Premium</strong> — All future premiums waived if you become disabled/critically ill; policy continues free<br>• <strong>Income Benefit Rider</strong> — Monthly income to family for 5–10 years after death (in addition to lump sum)<br><br>💡 <em>Riders typically cost just ₹200–2,000/year each. Adding 2–3 key riders is extremely cost-effective protection.</em>`,
      quickReplies: ['Which riders should I add?','Critical illness insurance','Term insurance details','Get Life Quote']
    },

    /* ─── WHOLE LIFE INSURANCE ───────────────────────── */
    {
      id: 'wholelife',
      weight: 2,
      patterns: ['whole life','whole life insurance','lifelong cover','lifetime insurance','cover for life','99 year insurance','100 year insurance','permanent life insurance'],
      response: () => `${greet()}<strong>♾️ Whole Life Insurance — Protection for Your Entire Life</strong><br><br>Unlike term plans (which cover for 30–40 years), <strong>whole life insurance covers you until age 99 or 100</strong>.<br><br><strong>Key Features:</strong><br>• Coverage never expires (unlike term)<br>• Accumulates a "cash value" over time you can borrow against<br>• Premiums higher than term but pay for 20–30 years only<br>• On maturity at age 100 → you or family receive full sum insured + bonuses<br><br><strong>Best for:</strong><br>• Estate planning — leaving wealth for children/grandchildren<br>• People with dependents who'll always need coverage<br>• Business owners for key person insurance<br><br><strong>Popular plans:</strong> LIC Jeevan Umang, HDFC Life Click 2 Wealth (whole life option)<br><br>💡 <em>For most people, a term plan + strong investments is more efficient. But whole life has its place in legacy planning.</em>`,
      quickReplies: ['Term vs Whole Life','Endowment policy','Life insurance for estate planning','Get Life Quote']
    },

    /* ─── MOTOR INSURANCE ───────────────────────────── */
    {
      id: 'motor',
      weight: 2,
      patterns: ['motor insurance','car insurance','bike insurance','vehicle insurance','two wheeler','four wheeler','third party','comprehensive','own damage','car accident','motor policy','vehicle insurance'],
      response: () => `${greet()}<strong>🚗 Motor Insurance</strong> — Mandatory by law, smart to have comprehensively.<br><br><strong>3 Types:</strong><br>• <strong>Third Party (TP):</strong> Legally mandatory. Covers damage to others only.<br>• <strong>Own Damage (OD):</strong> Covers your own vehicle damage<br>• <strong>Comprehensive (TP + OD):</strong> Full protection ✅ Recommended<br><br><strong>Must-have Add-ons:</strong><br>• <strong>Zero Depreciation</strong> — Full claim without depreciation deduction<br>• <strong>Engine Protect</strong> — Covers engine & gearbox waterlogging damage<br>• <strong>NCB Protect</strong> — Keeps your no-claim bonus even after a claim<br>• <strong>Roadside Assistance</strong> — 24×7 breakdown help<br>• <strong>Return to Invoice</strong> — Get original invoice value if car is stolen/totalled<br><br>⚠️ Fine for driving without insurance: <strong>₹2,000 + up to 3 months imprisonment</strong>`,
      quickReplies: ['Zero Depreciation explained','NCB explained','Renew motor insurance','Get Motor Quote']
    },

    /* ─── ZERO DEPRECIATION ──────────────────────────── */
    {
      id: 'zero_dep',
      weight: 3,
      patterns: ['zero depreciation','zero dep','nil depreciation','bumper to bumper','zero dep cover','bumper to bumper insurance','full value claim','depreciation in claim'],
      response: () => `${greet()}<strong>🛡️ Zero Depreciation — The Most Important Motor Add-On!</strong><br><br>Without Zero Dep, insurers deduct <strong>depreciation</strong> from your claim based on your car's age:<br><br>• Rubber parts (tyres): 50% deducted!<br>• Plastic parts: 30–50% deducted<br>• Metal parts: 5–25% deducted (based on age)<br><br><strong>Example:</strong><br>• 3-year-old car, ₹80,000 repair bill<br>• Without Zero Dep: You get ~₹48,000 (insurer deducts ₹32,000 depreciation!)<br>• With Zero Dep: You get <strong>₹76,000+</strong> ✅<br><br><strong>Zero Dep add-on cost:</strong> ₹2,000–5,000/year (well worth it!)<br><br>📌 Available for cars up to 5 years old. After that, many insurers don't offer it.<br><br>💡 <em>If your car is less than 5 years old and you're not on Zero Dep, call Sachin NOW to add it.</em>`,
      quickReplies: ['NCB explained','Engine Protect add-on','Renew motor insurance','Get Motor Quote']
    },

    /* ─── NCB ───────────────────────────────────────── */
    {
      id: 'ncb',
      weight: 3,
      patterns: ['ncb','no claim bonus','no claim discount','ncb protect','bonus on motor','no claim'],
      response: () => `${greet()}<strong>🎁 No Claim Bonus (NCB) — Your Reward for Safe Driving!</strong><br><br>NCB is a <strong>discount on your Own Damage premium</strong> for each year without a claim:<br><br>Year 1 → <strong>20% off</strong><br>Year 2 → <strong>25% off</strong><br>Year 3 → <strong>35% off</strong><br>Year 4 → <strong>45% off</strong><br>Year 5+ → <strong>50% off</strong><br><br>🔥 After 5 claim-free years, you pay <em>half</em> the Own Damage premium!<br><br>⚠️ One claim resets NCB to 0%.<br><br>💡 <strong>NCB Protect Add-On:</strong> For ~₹500 extra/year, protects your NCB even if you make one claim. Absolutely must-have if you have 3+ years of NCB built up.`,
      quickReplies: ['Zero Depreciation explained','Comprehensive motor cover','Renew Motor Insurance','Get Motor Quote']
    },

    /* ─── TRAVEL INSURANCE ──────────────────────────── */
    {
      id: 'travel',
      weight: 2,
      patterns: ['travel insurance','travel','international travel','abroad','schengen','visa insurance','trip cancellation','baggage loss','flight delay','medical abroad','overseas insurance','tourist insurance','travel policy','health insurance valid abroad','insurance valid abroad','cover abroad','coverage outside india'],
      response: () => `${greet()}<strong>✈️ Travel Insurance</strong> — Don't leave home without it!<br><br><strong>What's covered:</strong><br>• Medical emergency abroad — up to $5,00,000<br>• Medical evacuation back to India<br>• Trip cancellation & curtailment<br>• Baggage loss, damage & delay<br>• Flight cancellation & delay<br>• Passport loss & emergency travel documents<br>• Personal accident cover<br>• Personal liability coverage<br><br><strong>Cost:</strong> As low as ₹300 per trip. Annual multi-trip plans from ₹2,500/year!<br><br>⚠️ <strong>Schengen visa REQUIRES</strong> travel insurance with minimum €30,000 medical cover.<br><br>💡 A 3-day hospital stay in the USA can cost <strong>₹25–40 lakh</strong>. Travel insurance for the same trip? ₹1,500. Do the math! 😊`,
      quickReplies: ['Schengen visa insurance','Annual multi-trip plan','Senior citizen travel insurance','Get Travel Quote']
    },

    /* ─── HOME INSURANCE ────────────────────────────── */
    {
      id: 'home',
      weight: 2,
      patterns: ['home insurance','house insurance','property insurance','flat insurance','apartment insurance','home policy','structure insurance','contents insurance','burglary','earthquake insurance','flood insurance','home cover'],
      response: () => `${greet()}<strong>🏠 Home Insurance</strong> — Protect your most valuable asset.<br><br><strong>What it covers:</strong><br>• Fire, explosion, lightning<br>• Flood, cyclone, earthquake, landslide<br>• Burglary & theft<br>• Electronics & appliances<br>• Jewellery & valuables (declared)<br>• Alternate accommodation if home is uninhabitable<br>• Third-party liability (visitor injuries)<br><br><strong>Plans:</strong><br>• Structure only • Contents only • Comprehensive (both) ✅<br><br>💡 A ₹1 Crore home can be insured for <strong>just ₹3,000–5,000/year</strong>.<br>😟 <em>72% of Indian homes have ZERO insurance. One fire changes everything.</em>`,
      quickReplies: ['How much to insure home?','Contents vs Structure cover','Home loan insurance','Get Home Quote']
    },

    /* ─── HOME LOAN PROTECTION / MRTA ───────────────── */
    {
      id: 'mrta',
      weight: 2,
      patterns: ['home loan insurance','mrta','mortgage insurance','home loan cover','loan protection','loan insurance','home loan protection','mortgage protection','property loan insurance'],
      response: () => `${greet()}<strong>🏡 Home Loan Insurance (MRTA) — Protect Your Family's Home</strong><br><br>If you have a home loan and something happens to you, your family shouldn't have to sell the house to repay it. That's what home loan insurance solves.<br><br><strong>Two ways to cover your home loan:</strong><br><br><strong>1. MRTA (Mortgage Reducing Term Assurance):</strong><br>• Cover reduces as loan outstanding reduces<br>• Single premium (often bundled by bank at loan disbursement)<br>• Cheaper but cover reduces over time<br><br><strong>2. Regular Term Plan (Better option):</strong><br>• Buy a term plan equal to home loan amount<br>• Cover stays fixed — extra goes to family<br>• Portable if you change lender<br>• Usually <strong>cheaper and more flexible</strong><br><br>📌 <strong>Veera's recommendation:</strong> Don't buy the bank's MRTA blindly. A standalone term plan is usually better value.`,
      quickReplies: ['Term insurance details','Life insurance riders','How much life cover?','Speak to Sachin']
    },

    /* ─── BUSINESS INSURANCE ────────────────────────── */
    {
      id: 'business',
      weight: 2,
      patterns: ['business insurance','office insurance','commercial insurance','shop insurance','group health','group mediclaim','employee insurance','workmen compensation','professional indemnity','fire insurance','business policy','startup insurance'],
      response: () => `${greet()}<strong>🏢 Business Insurance</strong> — Protect your business from every risk.<br><br><strong>Key covers:</strong><br>• <strong>Group Health</strong> — Cover employees & families. Mandatory (ESI) for 20+ staff. 100% tax deductible.<br>• <strong>Fire & Property</strong> — Office, factory, stock, machinery<br>• <strong>Professional Indemnity</strong> — For doctors, CAs, IT firms, architects, consultants<br>• <strong>Workmen Compensation</strong> — Legal requirement for factories<br>• <strong>Marine/Transit</strong> — Goods in transport<br>• <strong>Cyber Insurance</strong> — Data breach, ransomware, online fraud<br>• <strong>Shop Package</strong> — All-in-one policy for small shops<br>• <strong>D&O Insurance</strong> — Directors & Officers liability<br><br>💡 <em>One uninsured fire loss can permanently shut a business. One employee injury claim can cost ₹50 lakh.</em>`,
      quickReplies: ['Group health for employees','Cyber insurance','Professional Indemnity','Get Business Quote']
    },

    /* ─── CYBER INSURANCE ────────────────────────────── */
    {
      id: 'cyber',
      weight: 2,
      patterns: ['cyber insurance','cybersecurity insurance','online fraud insurance','data breach insurance','ransomware insurance','hacking insurance','phishing insurance','cyber crime insurance','digital security insurance','online scam insurance','upi fraud insurance'],
      response: () => `${greet()}<strong>🔐 Cyber Insurance — Protection in the Digital Age</strong><br><br>With UPI frauds, identity theft, and data breaches on the rise, cyber insurance is becoming essential for both individuals and businesses.<br><br><strong>What individual cyber policies cover:</strong><br>• Online banking & UPI fraud losses<br>• Phishing & identity theft<br>• Social media account hack expenses<br>• Cyber extortion / ransomware<br>• Email fraud (CEO fraud, BEC)<br>• Cyber bullying legal expenses<br><br><strong>What business cyber policies cover:</strong><br>• Customer data breach notification costs<br>• IT forensics & recovery expenses<br>• Business interruption from cyberattack<br>• Regulatory fines & penalties<br>• Third-party liability for client data loss<br><br>💰 <strong>Personal cyber cover from just ₹1,500–3,000/year</strong><br><br>💡 <em>India had 14 lakh+ cybercrime complaints in 2023. This is the insurance of the future — today.</em>`,
      quickReplies: ['Business insurance','Professional indemnity','Get Cyber Insurance quote','Back']
    },

    /* ─── INVESTMENTS ───────────────────────────────── */
    {
      id: 'investments',
      weight: 2,
      patterns: ['investment','invest','investment plan','wealth','savings plan','grow money','financial planning','ulip','returns','where to invest','best investment'],
      response: () => `${greet()}<strong>📈 Investment Plans at PolicyRaj</strong><br><br>We offer insurance-linked investment products giving you <strong>protection + growth + tax savings</strong>:<br><br>• <strong>Child Plans</strong> — Secure your child's education & future corpus<br>• <strong>Pension Plans</strong> — Build your retirement nest egg<br>• <strong>ELSS / Tax Saving</strong> — Save up to ₹46,800 in tax annually<br>• <strong>ULIP Plans</strong> — Market-linked growth with life cover<br>• <strong>Endowment Policy</strong> — Guaranteed savings + life cover<br>• <strong>Money Back Policy</strong> — Regular payouts + life cover<br>• <strong>Annuity Plans</strong> — Guaranteed lifetime monthly income<br><br>Which sounds most interesting to you?`,
      quickReplies: ['Child Plans','Pension Plans','ELSS vs PPF','ULIP Plans']
    },

    /* ─── ULIP ───────────────────────────────────────── */
    {
      id: 'ulip',
      weight: 2,
      patterns: ['ulip','unit linked','unit linked insurance plan','ulip plan','ulip investment','ulip returns','market linked insurance','ulip vs term','ulip charges','ulip lock in'],
      response: () => `${greet()}<strong>📊 ULIP — Unit Linked Insurance Plan</strong><br><br>ULIP is a <strong>2-in-1 product</strong> combining life insurance + market-linked investment in one policy.<br><br><strong>How it works:</strong><br>• Part of premium → Life cover<br>• Rest of premium → Invested in funds (equity, debt, or balanced — you choose)<br>• Returns linked to market performance<br>• 5-year lock-in period<br><br><strong>Benefits:</strong><br>✅ Life cover + potential for high returns<br>✅ Flexibility to switch between funds<br>✅ Tax-free maturity under Section 10(10D)<br>✅ Tax deduction on premium under 80C<br><br><strong>Charges to watch:</strong><br>• Premium allocation charge (1–3%)<br>• Fund management charge (1.35%)<br>• Mortality charge (life cover cost)<br><br>📌 <strong>Veera's take:</strong> ULIPs have improved significantly after 2010 IRDA reforms. New-age ULIPs from HDFC Life, ICICI Pru, Tata AIA are genuinely competitive. Great for 10–15 year horizons.`,
      quickReplies: ['ULIP vs Mutual Fund','ULIP vs Term + ELSS','Child ULIP plan','Get ULIP Quote']
    },

    /* ─── CHILD PLAN ────────────────────────────────── */
    {
      id: 'child',
      weight: 2,
      patterns: ['child plan','child insurance','education plan','children plan','child future','child education','son education','daughter future','kid plan','child corpus','education insurance'],
      response: () => `${greet()}<strong>👶 Child Plans</strong> — Your child's future, guaranteed.<br><br><strong>How it works:</strong><br>1. You invest monthly for 15–20 years<br>2. Money grows (market-linked ULIP or guaranteed endowment)<br>3. If something happens to <em>you</em> → insurer pays remaining premiums automatically<br>4. Child receives full planned corpus at maturity<br>5. Partial withdrawals from age 18 for college fees<br><br><strong>Why start NOW:</strong><br>• Engineering will cost <strong>₹40–50L by 2035</strong>. IIM MBA = ₹50L+.<br>• Starting at birth → ₹4,000/month builds <strong>₹1 Crore+ by age 18</strong>.<br>• Wait till age 10 → need ₹14,000/month for same corpus!<br><br>⏰ <em>Every year of delay costs you lakhs. The best time to start was yesterday, the second best time is today.</em>`,
      quickReplies: ['How much corpus needed?','ULIP vs Traditional child plan','Tax benefit on child plan','💬 Get Child Plan Quote']
    },

    /* ─── PENSION / RETIREMENT ──────────────────────── */
    {
      id: 'pension',
      weight: 2,
      patterns: ['pension plan','pension','retirement plan','retirement','retire','nps','national pension system','retirement corpus','retirement savings','post retirement income','old age income','senior living'],
      response: () => `${greet()}<strong>🌴 Pension Plans</strong> — Retire on your own terms.<br><br>85% of Indians have no pension. <strong>If you don't build yours, no one will.</strong><br><br><strong>Best options:</strong><br>• <strong>NPS (National Pension System)</strong> — Government-backed, lowest charges, extra ₹50K tax deduction (80CCD1B)<br>• <strong>ULIP Pension</strong> — Higher growth potential with insurance cover<br>• <strong>Guaranteed Pension Plans</strong> — Fixed income from day 1 of retirement, zero market risk<br>• <strong>Annuity Plans</strong> — Guaranteed lifetime monthly income<br><br><strong>Quick math:</strong><br>₹50,000/month today = ₹1.9L/month needed in 20 years (7% inflation).<br>You need ₹5–6 Crore corpus for comfortable retirement.<br><br>Starting at 30 → need ₹10,000/month 💪<br>Starting at 40 → need ₹30,000+/month 😰`,
      quickReplies: ['NPS explained','How much retirement corpus?','Annuity plans','💬 Get Pension Plan']
    },

    /* ─── NPS DETAILED ───────────────────────────────── */
    {
      id: 'nps',
      weight: 3,
      patterns: ['nps','national pension system','nps account','nps tier 1','nps tier 2','nps returns','nps tax benefit','80ccd','nps withdraw','nps maturity','open nps account'],
      response: () => `${greet()}<strong>🏛️ NPS — National Pension System (Detailed)</strong><br><br>NPS is India's government-backed retirement savings plan, regulated by PFRDA.<br><br><strong>Accounts:</strong><br>• <strong>Tier 1</strong> — Mandatory, locked till age 60. Tax benefits here.<br>• <strong>Tier 2</strong> — Optional, fully liquid. No tax benefit (except Govt employees).<br><br><strong>Tax Benefits (Tier 1):</strong><br>• ₹1.5L under Section 80C (shared with other 80C investments)<br>• <strong>Extra ₹50,000 under 80CCD(1B)</strong> — exclusive to NPS! 🎉<br>• Employer contribution up to 10% of salary — tax-free (Section 80CCD(2))<br><br><strong>Withdrawal at 60:</strong><br>• 60% as lump sum — <strong>completely tax-free</strong><br>• 40% must be used to buy annuity (monthly pension)<br><br><strong>Returns:</strong> 10–12% historically (equity option)<br><strong>Charges:</strong> Just 0.01% fund management — lowest in India!`,
      quickReplies: ['How to open NPS account','NPS vs ELSS','Annuity with NPS corpus','Speak to Sachin']
    },

    /* ─── TAX SAVING ────────────────────────────────── */
    {
      id: 'tax',
      weight: 2,
      patterns: ['tax saving','tax','80c','income tax','tax benefit','tax deduction','elss','ppf','save tax','section 80','tax planning','itr','tax return','reduce tax','tax free'],
      response: () => `${greet()}<strong>💰 Tax Saving Guide — Save up to ₹46,800/year legally!</strong><br><br><strong>Section 80C — up to ₹1.5 Lakh deduction:</strong><br>• Life insurance premium (LIC, HDFC Life, etc.)<br>• ELSS Mutual Funds (3yr lock-in, highest returns)<br>• PPF (15yr, 7.1%, tax-free, government-backed)<br>• NPS, Home loan principal, Tuition fees, 5-yr FD<br><br><strong>Section 80CCD(1B):</strong><br>• Extra ₹50,000 for NPS — exclusive benefit!<br><br><strong>Section 80D:</strong><br>• ₹25,000 — self + family health insurance<br>• ₹50,000 — senior citizen parents<br><br><strong>Section 80E:</strong><br>• Education loan interest — 100% deductible (no limit!)<br><br>📊 <strong>Total: Up to ₹2,75,000 deduction → saves ₹46,800–82,500 in tax</strong>`,
      quickReplies: ['Best 80C investments','ELSS vs PPF comparison','Section 80D health','💬 Get Tax Plan']
    },

    /* ─── ELSS VS PPF ────────────────────────────────── */
    {
      id: 'elss_ppf',
      weight: 3,
      patterns: ['elss','elss vs ppf','ppf','elss or ppf','which is better elss ppf','tax saving mutual fund','elss returns','ppf returns','ppf interest','elss lock in','tax saving investment'],
      response: () => `${greet()}<strong>📊 ELSS vs PPF — The Classic Tax Saving Showdown</strong><br><br><table style="width:100%;font-size:0.88em"><tr><th style="text-align:left">Feature</th><th>ELSS</th><th>PPF</th></tr><tr><td>Lock-in</td><td><strong>3 years</strong></td><td>15 years</td></tr><tr><td>Returns</td><td><strong>12–16%</strong> (market)</td><td>7.1% (fixed)</td></tr><tr><td>Risk</td><td>Market risk</td><td><strong>Zero risk</strong></td></tr><tr><td>Tax on returns</td><td>10% LTCG above ₹1L</td><td><strong>Fully tax-free</strong></td></tr><tr><td>Limit</td><td>No upper limit</td><td>₹1.5L/year max</td></tr></table><br><strong>Veera's recommendation:</strong><br>• Age 25–45, high risk appetite: <strong>ELSS</strong> — better returns in the long run<br>• Age 45+, conservative: <strong>PPF</strong> — safe, guaranteed, fully tax-free<br>• <strong>Best approach: Split 60% ELSS + 40% PPF</strong> for balance`,
      quickReplies: ['NPS explained','Section 80C tax saving','Best investment plans','Speak to Sachin']
    },

    /* ─── ENDOWMENT ─────────────────────────────────── */
    {
      id: 'endowment',
      weight: 2,
      patterns: ['endowment','endowment policy','guaranteed savings','guaranteed plan','guaranteed returns','lic jeevan','jeevan anand','jeevan labh','maturity benefit','savings with insurance'],
      response: () => `${greet()}<strong>🏦 Endowment Policy</strong> — Guaranteed savings + life cover in one.<br><br><strong>How it works:</strong><br>• Pay premiums for 10–20 years<br>• On survival: Get <strong>Sum Assured + Annual Bonus + Terminal Bonus</strong> (all tax-free)<br>• On death: Family gets full sum assured immediately (even in year 1!)<br><br><strong>Returns:</strong> 5–6% guaranteed (zero market risk)<br><strong>Tax:</strong> 80C deduction on premium + 10(10D) tax-free maturity<br><br><strong>Best for:</strong> Risk-averse people who want forced savings with life cover.<br><strong>Popular plans:</strong> LIC Jeevan Anand, LIC Jeevan Labh, HDFC Sanchay Plus<br><br>💡 <em>Not the highest returns — but zero risk, guaranteed, and completely tax-free. For peace of mind investors, this is gold.</em>`,
      quickReplies: ['ULIP vs Endowment','LIC Jeevan Anand details','Tax saving on endowment','Get Endowment Quote']
    },

    /* ─── MONEY BACK ────────────────────────────────── */
    {
      id: 'moneyback',
      weight: 2,
      patterns: ['money back','money back policy','survival benefit','periodic payout','money back plan','jeevan tarun','jeevan umang','regular payout insurance','cash back insurance'],
      response: () => `${greet()}<strong>💸 Money Back Policy</strong> — Regular cash + life cover + maturity bonus.<br><br><strong>Example — ₹10L, 20-year plan:</strong><br>• Year 5 → Receive <strong>₹2L</strong><br>• Year 10 → Receive <strong>₹2L</strong><br>• Year 15 → Receive <strong>₹2L</strong><br>• Year 20 (maturity) → Receive <strong>₹4L + bonuses (~₹6L)</strong><br><br>🎯 <strong>Key fact most people miss:</strong> If you die at year 7, family gets <strong>FULL ₹10L</strong> — NOT ₹10L minus the ₹4L already paid! Death benefit is never reduced by survival payouts.<br><br><strong>Best for:</strong> Parents who want cash every 5 years for education fees, home renovations, or life milestones.`,
      quickReplies: ['Money Back vs Endowment','LIC Jeevan Tarun','Get Money Back Quote','Back']
    },

    /* ─── ANNUITY ────────────────────────────────────── */
    {
      id: 'annuity',
      weight: 2,
      patterns: ['annuity','annuity plan','immediate annuity','deferred annuity','lifetime income','monthly pension','guaranteed income','retirement income','joint annuity','lifetime pension'],
      response: () => `${greet()}<strong>♾️ Annuity Plans</strong> — Guaranteed monthly income for life.<br><br><strong>Income you can get:</strong><br>• ₹25L corpus → ~₹12,000–14,000/month for life<br>• ₹50L corpus → ~₹25,000–30,000/month for life<br>• ₹1 Crore → ~₹50,000–60,000/month for life<br>• ₹2 Crore → ~₹1–1.2L/month for life<br><br><strong>Types:</strong><br>• <strong>Immediate Annuity</strong> — Pay lump sum → income starts next month<br>• <strong>Deferred Annuity</strong> — Accumulate for years → pension starts at 60<br>• <strong>Joint Life</strong> — Spouse continues getting pension after you<br>• <strong>Return of Purchase Price</strong> — Corpus returned to family after your lifetime<br><br>✅ <em>The only product that guarantees you'll never outlive your money. Perfect for retirement.</em>`,
      quickReplies: ['Immediate vs Deferred annuity','Joint life annuity','How much do I need to retire?','💬 Get Annuity Quote']
    },

    /* ─── PREMIUMS / COST ───────────────────────────── */
    {
      id: 'premium',
      weight: 2,
      patterns: ['premium','cost','price','how much does it cost','how much premium','affordable','monthly payment','yearly payment','annual premium','insurance cost','cheapest','budget insurance','premium amount'],
      response: () => `${greet()}<strong>💳 Insurance Premium Quick Reference</strong><br><br>🏥 <strong>Health Insurance (Family of 4, ₹10L):</strong><br>₹14,000–18,000/year<br><br>🛡️ <strong>Term Plan (₹1 Crore):</strong><br>Age 30 → ₹700–900/month | Age 40 → ₹1,500–2,000/month<br><br>🚗 <strong>Motor (Comprehensive, 5yr car):</strong><br>2–3% of IDV per year + add-ons<br><br>✈️ <strong>Travel Insurance:</strong><br>₹300–1,500 per international trip<br><br>🏠 <strong>Home Insurance:</strong><br>₹1 Crore home → ₹3,000–5,000/year<br><br>💼 <strong>Group Health (per employee):</strong><br>₹3,000–6,000/employee/year<br><br>🚨 <strong>Critical Illness (₹25L):</strong><br>₹5,000–8,000/year (age 35)<br><br>📞 <em>For your exact premium from 20+ insurers, call Sachin at <strong>9013976999</strong>.</em>`,
      quickReplies: ['Health insurance cost','Term plan cost','Get exact quote','Compare plans']
    },

    /* ─── CLAIMS ────────────────────────────────────── */
    {
      id: 'claims',
      weight: 2,
      patterns: ['claim','claims','how to claim','claim process','claim settlement','file claim','cashless claim','reimbursement','claim pending','claim status','make a claim','insurance claim'],
      response: () => `${greet()}<strong>📋 How to File an Insurance Claim</strong><br><br><strong>🏥 Health — Cashless:</strong><br>1. Go to network hospital<br>2. Show insurance card + Aadhaar at insurance desk<br>3. Insurer pays hospital directly<br><br><strong>🏥 Health — Reimbursement:</strong><br>1. Pay bills yourself<br>2. Collect all original bills + discharge summary + prescriptions<br>3. Submit claim form + docs within 30 days<br>4. Reimbursement in 7–15 working days<br><br><strong>🚗 Motor:</strong><br>1. Call insurer's 24×7 helpline immediately<br>2. Don't repair vehicle before surveyor's visit<br>3. Photograph all damage from multiple angles<br>4. Cashless at network garage OR reimbursement<br><br>📞 <strong>Sachin personally assists all PolicyRaj clients with claims.</strong> Call <strong>9013976999</strong> — we fight for your rightful claim.`,
      quickReplies: ['Why do claims get rejected?','Documents for claim','Cashless hospitals','Speak to Sachin']
    },

    /* ─── CLAIM REJECTION ────────────────────────────── */
    {
      id: 'claim_rejection',
      weight: 3,
      patterns: ['claim rejected','claim denied','why claim rejected','claim rejection','claim repudiated','claim not paid','claim refused','avoid claim rejection','claim tips'],
      response: () => `${greet()}<strong>❌ Why Insurance Claims Get Rejected — And How to Avoid It!</strong><br><br><strong>Top reasons for claim rejection:</strong><br><br>1. <strong>Non-disclosure</strong> — Hiding pre-existing conditions at buying. Always disclose everything honestly!<br><br>2. <strong>Policy not active</strong> — Missed renewal. Set auto-pay reminders.<br><br>3. <strong>Waiting period</strong> — Claiming for PED before waiting period completes. Read policy terms!<br><br>4. <strong>Exclusions</strong> — Cosmetic surgery, self-injury, alcohol-related accidents. Know your exclusions!<br><br>5. <strong>Late intimation</strong> — Didn't inform insurer within required time. Call within 24-48 hours of incident.<br><br>6. <strong>Incorrect documents</strong> — Missing bills, discharge summaries, FIR for motor, etc.<br><br>7. <strong>Policy exclusions</strong> — Adventure sports, war, nuclear risks, etc.<br><br>📞 <em>If your claim was wrongly rejected, call Sachin — we help challenge and reprocess claims successfully.</em>`,
      quickReplies: ['How to file a claim','Insurance Ombudsman','Speak to Sachin','Documents for claim']
    },

    /* ─── DOCUMENTS ─────────────────────────────────── */
    {
      id: 'documents',
      weight: 2,
      patterns: ['documents','document needed','what documents','papers','id proof','address proof','kyc','what do i need to buy','documents required','paperwork'],
      response: () => `${greet()}<strong>📄 Documents Needed to Buy Insurance</strong><br><br><strong>All policies (basic KYC):</strong><br>• Aadhaar card (address + identity proof)<br>• PAN card<br>• Passport-size photograph<br>• Bank account details for premium payment<br><br><strong>Health Insurance:</strong><br>• Age proof (Aadhaar or birth certificate)<br>• Medical reports if age 45+ or existing conditions<br><br><strong>Term/Life Insurance:</strong><br>• Income proof (last 3 salary slips or ITR)<br>• Medical test may be required for cover ₹50L+<br><br><strong>Motor Insurance:</strong><br>• RC Book, Driving Licence<br>• Previous policy copy (for NCB transfer)<br>• Inspection photos for older vehicles<br><br>✅ <em>The entire process takes just 30 minutes. Sachin's team helps you gather everything!</em>`,
      quickReplies: ['How to buy insurance online','Renew existing policy','DigiLocker for insurance','Speak to Sachin']
    },

    /* ─── NOMINEE ────────────────────────────────────── */
    {
      id: 'nominee',
      weight: 2,
      patterns: ['nominee','nomination','change nominee','add nominee','who is nominee','nominee in insurance','beneficiary','policy nominee','update nominee','nominee details'],
      response: () => `${greet()}<strong>📝 Nominee in Insurance — Very Important!</strong><br><br>A <strong>nominee</strong> is the person who receives the insurance payout if something happens to you. This is one of the most important aspects of any insurance policy.<br><br><strong>Key rules:</strong><br>• You can nominate anyone — spouse, child, parents, sibling<br>• For minors, appoint an appointee (adult to receive money until minor turns 18)<br>• Can change nominee anytime during policy tenure<br>• Multiple nominees allowed (with percentage split)<br><br><strong>After a death claim:</strong><br>• Nominee submits death certificate + claim form<br>• Insurer verifies and pays the nominee within 30 days<br>• If no nominee was named → legal heir process (takes much longer!)<br><br>⚠️ <strong>Always update your nominee after major life events</strong> — marriage, having children, divorce.<br><br>💡 <em>Spending 5 minutes to update your nominee can save your family months of paperwork in a difficult time.</em>`,
      quickReplies: ['How to update nominee','Life insurance details','Claim process','Speak to Sachin']
    },

    /* ─── SENIOR CITIZEN INSURANCE ───────────────────── */
    {
      id: 'senior',
      weight: 2,
      patterns: ['senior citizen','senior citizen insurance','senior citizen health','insurance for parents','parents insurance','elderly insurance','60 plus insurance','health for old age','age 60 insurance','retired person insurance','best for my parents','insurance for parents','health insurance for parents','plan for my parents'],
      response: () => `${greet()}<strong>👴👵 Senior Citizen Insurance — Special Plans for Your Parents</strong><br><br>Getting insurance for parents (60+) requires some special planning, but it's definitely possible!<br><br><strong>Best options:</strong><br>• <strong>Star Senior Citizen Red Carpet</strong> — Accepts up to age 75, minimal medical tests, covers pre-existing diseases after 1 year<br>• <strong>Niva Bupa ReAssure Senior</strong> — Comprehensive cover with co-pay option to reduce premium<br>• <strong>Care Senior</strong> — Good network, annual health check-ups included<br><br><strong>Key things to know:</strong><br>• Higher premiums than younger ages (natural due to higher risk)<br>• Co-pay of 10–20% common in senior plans<br>• Pre-existing disease waiting: 1–2 years (shorter than regular plans)<br>• Buy separately — don't add to your family floater (doubles premium)<br><br>📌 <strong>Buy ASAP</strong> — the older the applicant, the fewer options available and the more exclusions.`,
      quickReplies: ['Family floater vs individual','Pre-existing disease cover','Health insurance cost','Get Senior Citizen Quote']
    },

    /* ─── NRI INSURANCE ──────────────────────────────── */
    {
      id: 'nri',
      weight: 2,
      patterns: ['nri','nri insurance','non resident indian','insurance for nri','buying insurance from abroad','nri life insurance','nri health insurance','overseas indian','insurance if i live abroad','indian diaspora insurance'],
      response: () => `${greet()}<strong>🌏 Insurance for NRIs — Yes, It's Possible!</strong><br><br>If you're an NRI, you can still buy and maintain insurance in India:<br><br><strong>Life/Term Insurance:</strong><br>✅ NRIs can buy from most major Indian insurers<br>✅ Medical tests may need to be done at approved overseas centres<br>✅ Premiums can be paid from NRE/NRO accounts<br>✅ Claim can be paid to Indian bank account or overseas account<br>✅ 10(10D) tax-free maturity applies to NRIs too<br><br><strong>Health Insurance:</strong><br>• Most standard health plans require India-based hospitalisation<br>• Consider international health plans for overseas medical coverage<br>• Maintaining an Indian health policy is still useful when visiting India<br><br><strong>Motor Insurance:</strong><br>• Vehicle must be registered in India for India-based motor insurance<br><br>📞 <em>Sachin has helped many NRI clients from the US, UK, UAE, and Canada. Call <strong>9013976999</strong> or WhatsApp for guidance.</em>`,
      quickReplies: ['Term insurance for NRI','Health insurance details','Speak to Sachin','Get Quote']
    },

    /* ─── WOMEN'S INSURANCE ──────────────────────────── */
    {
      id: 'women',
      weight: 2,
      patterns: ['women insurance','ladies insurance','women health insurance','maternity insurance','maternity cover','breast cancer insurance','cervical cancer insurance','pregnancy cover','women specific plan','female insurance'],
      response: () => `${greet()}<strong>👩 Insurance for Women — Tailored Protection</strong><br><br><strong>Key insurance needs for women:</strong><br><br><strong>🤱 Maternity Cover (Health Insurance):</strong><br>• Covers delivery expenses (normal & caesarean)<br>• Newborn baby cover from day 1<br>• Buy 2–3 years BEFORE planning pregnancy (waiting period!)<br>• Plans: Niva Bupa Aspire, HDFC Ergo Women Plan<br><br><strong>🎗️ Critical Illness — Women-Specific:</strong><br>• Breast cancer, cervical cancer, ovarian cancer<br>• Some plans cover female-specific conditions at higher sum insured<br><br><strong>💼 Term Insurance for Working Women:</strong><br>• Equal importance as for men if family depends on your income<br>• Lower premium than men of same age (women have longer life expectancy)<br>• Maternity riders on some term plans<br><br><strong>🏠 Sole Earner / Single Woman:</strong><br>Critical illness + term + health = complete protection package`,
      quickReplies: ['Maternity insurance details','Critical illness insurance','Term insurance for women','Get Quote']
    },

    /* ─── DIGILOCKER / E-INSURANCE ───────────────────── */
    {
      id: 'digilocker',
      weight: 2,
      patterns: ['digilocker','e insurance','digital insurance','paperless insurance','store policy','policy document','e-insurance account','keep insurance documents','insuratech','insurance app','digital policy'],
      response: () => `${greet()}<strong>📱 DigiLocker & E-Insurance — Go Paperless!</strong><br><br>Did you know you can store all your insurance policies digitally? Here's how:<br><br><strong>DigiLocker (Government of India):</strong><br>• Free app/web (digilocker.gov.in)<br>• Store Aadhaar, PAN, policy documents, RC, DL<br>• Legally valid — accepted everywhere<br>• Insurers can directly push your policy documents here<br><br><strong>E-Insurance Repositories (e-IA):</strong><br>• Centralised repository for all your policies<br>• NSDL, CAMS, Karvy (licensed e-IA providers)<br>• One login → see all your policies from all insurers<br>• e-KYC → faster policy issuance, no physical docs needed<br><br><strong>Benefits:</strong><br>✅ Never lose policy documents<br>✅ Easy for family to locate policies in case of claim<br>✅ Premium reminders & renewal alerts<br>✅ Faster claim processing with digital records<br><br>💡 <em>Always keep a digital copy of your policies and share the access with your spouse/family.</em>`,
      quickReplies: ['Documents needed','How to buy insurance','Nominee in insurance','Back']
    },

    /* ─── RENEWAL ───────────────────────────────────── */
    {
      id: 'renewal',
      weight: 2,
      patterns: ['renew','renewal','policy expired','policy lapsed','lapse','grace period','due date','premium due','policy due','renew insurance'],
      response: () => `${greet()}<strong>🔄 Policy Renewal — Act Before It Lapses!</strong><br><br><strong>Why timely renewal matters:</strong><br>• <strong>Health:</strong> Continuity benefits lost if you miss — PED waiting periods restart from scratch!<br>• <strong>Motor:</strong> Driving with expired insurance = ₹2,000 fine + 3 months imprisonment risk<br>• <strong>Life:</strong> 30-day grace period. After that → policy lapses, all premiums potentially lost<br><br><strong>Reviving a lapsed policy:</strong><br>• Within 6 months of lapse: just pay arrears<br>• 6 months–2 years: arrears + interest<br>• After 2 years: arrears + interest + re-medical test + fresh underwriting<br><br><strong>Grace periods:</strong><br>• Health: Usually 30 days<br>• Life: 30 days (monthly) / 30 days (annual)<br>• Motor: No grace — any accident = no cover if policy expired<br><br>📞 <em>Sachin renews policies in under 15 minutes on WhatsApp. Call <strong>9013976999</strong>.</em>`,
      quickReplies: ['Renew health insurance','Renew motor insurance','Revive lapsed policy','Speak to Sachin']
    },

    /* ─── GRIEVANCE / OMBUDSMAN ──────────────────────── */
    {
      id: 'grievance',
      weight: 2,
      patterns: ['complaint','grievance','ombudsman','irdai complaint','insurance complaint','file complaint','dispute insurer','insurance dispute','escalate claim','consumer forum insurance','unfair claim','insurance ombudsman','ombudsman'],
      response: () => `${greet()}<strong>⚖️ Insurance Complaints & Your Rights</strong><br><br>If your insurer isn't treating you fairly, you have powerful options!<br><br><strong>Step 1 — Insurer's Grievance Cell:</strong><br>• Every insurer has a grievance cell. Register online/phone.<br>• Must respond within 15 days (IRDAI mandate)<br><br><strong>Step 2 — IRDAI Bima Bharosa Portal:</strong><br>• bimabharosa.irdai.gov.in<br>• IRDAI's official consumer portal<br>• File complaints against any insurer<br><br><strong>Step 3 — Insurance Ombudsman:</strong><br>• Free, fast, binding dispute resolution<br>• 17 offices across India<br>• Handles claims up to ₹30 Lakh<br>• Decisions binding on insurers (not on you)<br><br><strong>Step 4 — Consumer Court:</strong><br>• For larger amounts or if Ombudsman fails<br><br>📞 <em>Sachin's team has successfully helped clients get wrongly rejected claims approved. Call <strong>9013976999</strong> before giving up!</em>`,
      quickReplies: ['Claim rejection reasons','Speak to Sachin','About Sachin Kathuria','Back']
    },

    /* ─── ABOUT POLICYRAJ / SACHIN ──────────────────── */
    {
      id: 'about',
      weight: 2,
      patterns: ['about','sachin','kathuria','who are you','policyraj','experience','advisor','who is sachin','company','about policyraj','about us','background','credentials'],
      response: () => `${greet()}<strong>🏢 About PolicyRaj & Sachin Kathuria</strong><br><br>Sachin Kathuria is one of Delhi-NCR's most trusted insurance advisors:<br><br>• <strong>20+ years</strong> of insurance advisory experience<br>• <strong>5,000+ clients</strong> across India<br>• <strong>5.0★ Google Rating</strong> — 173+ verified reviews<br>• <strong>IRDAI-licensed</strong> — fully certified by India's insurance regulator<br>• Works with <strong>20+ top insurers</strong> — LIC, HDFC Ergo, ICICI Lombard, Niva Bupa, Tata AIG & more<br><br>PolicyRaj is <strong>completely independent</strong> — not tied to any single company. You always get unbiased advice on the best plan for your needs, not the one with the highest commission.<br><br>📱 9013976999 / 8383813408 | sachin@policyraj.com`,
      quickReplies: ['Our insurance partners','IRDAI registration','Get a free quote','Contact us']
    },

    /* ─── CONTACT / SPEAK TO ADVISOR ────────────────── */
    {
      id: 'contact',
      weight: 2,
      patterns: ['contact','speak','talk','call','advisor','speak to advisor','human','phone number','whatsapp','email','meet','visit','connect','sachin call','speak to sachin','reach out'],
      response: () => `${greet()}<strong>📞 Connect with Sachin Kathuria</strong><br><br>I'm Veera, your AI assistant — but for personalised advice, here's how to reach Sachin directly:<br><br>📱 <strong>Phone / WhatsApp:</strong><br>• <a href="tel:9013976999" style="color:#2563EB;font-weight:600">9013976999</a><br>• <a href="tel:8383813408" style="color:#2563EB;font-weight:600">8383813408</a><br><br>📧 <strong>Email:</strong> sachin@policyraj.com<br><br>⏰ <strong>Available:</strong> Mon–Sat, 9 AM – 7 PM<br><br>💬 <strong>WhatsApp:</strong> Click the green button at the bottom-right corner for instant chat<br><br>🎯 <em>Sachin calls back within 2 hours during business hours. No pressure, no spam — just honest advice.</em>`,
      quickReplies: ['💬 Get Quote now','📱 WhatsApp Sachin','↩ Ask another question','Close chat']
    },

    /* ─── PARTNERS ───────────────────────────────────── */
    {
      id: 'partners',
      weight: 2,
      patterns: ['partners','which companies','which insurer','hdfc ergo','icici lombard','tata aig','bajaj allianz','niva bupa','hdfc life','lic of india','insurance company','insurer','which insurance company is best'],
      response: () => `${greet()}<strong>🤝 PolicyRaj Insurance Partners</strong><br><br>We compare plans from India's top IRDAI-approved insurers so you always get the best deal:<br><br><strong>General Insurance:</strong><br>HDFC Ergo • ICICI Lombard • Tata AIG • Bajaj Allianz<br><br><strong>Health Insurance:</strong><br>Niva Bupa • Bajaj Allianz GIC Ltd. • Care Health • Aditya Birla Health<br><br><strong>Life Insurance:</strong><br>LIC of India • HDFC Life • SBI Life • Max Life • ICICI Prudential • Kotak Life • Tata AIA<br><br>💡 <strong>Why it matters:</strong> We're not tied to any one company. We compare all plans and recommend what's genuinely best for you — no hidden agenda.`,
      quickReplies: ['Compare health plans','Best term plan','IRDAI registration','Get a free quote']
    },

    /* ─── IRDAI / TRUST ──────────────────────────────── */
    {
      id: 'irdai',
      weight: 2,
      patterns: ['irdai','registered','licensed','genuine','verified','legit','trust','fraud','scam','safe','regulated','is policyraj safe'],
      response: () => `${greet()}<strong>✅ IRDAI-Licensed & Fully Regulated — You're Safe With Us</strong><br><br>Sachin Kathuria is a licensed insurance advisor under <strong>IRDAI</strong> — Insurance Regulatory and Development Authority of India (a Government of India body).<br><br>This means:<br>• All advice follows IRDAI consumer protection rules<br>• You're legally protected if anything goes wrong<br>• All partner insurers are IRDAI-approved<br>• Strict anti-mis-selling regulatory oversight<br><br><strong>Additional proof of trust:</strong><br>• 5.0★ Google Rating — 173+ verified reviews<br>• 5,000+ clients served since 2004<br>• 22+ years in business<br>• Unbiased recommendations across multiple partner insurers<br><br>🛡️ <em>When buying insurance, always verify your advisor's IRDAI registration. We're proud to share ours.</em>`,
      quickReplies: ['About Sachin Kathuria','Our partners','Get a free quote','Back']
    },

    /* ─── COMPARISON ─────────────────────────────────── */
    {
      id: 'compare',
      weight: 2,
      patterns: ['compare','which is better','vs','difference between','which plan','best plan','recommend','which insurance','term vs ulip','endowment vs term','health plan comparison','best option'],
      response: () => `${greet()}<strong>🔍 Quick Plan Comparison Guide</strong><br><br>🏥 <strong>Health:</strong> Niva Bupa / HDFC Ergo family floater → best for most families<br><br>🛡️ <strong>Life:</strong> Term Plan > Endowment for pure protection. More cover, less cost.<br><br>📈 <strong>Investment:</strong><br>• Best returns: ELSS + Term plan combo<br>• Guaranteed returns: Endowment / LIC plans<br>• Retirement: NPS + Deferred annuity<br><br>🚗 <strong>Motor:</strong> Comprehensive + Zero Dep add-on. Never buy TP-only for a new/good vehicle.<br><br>💰 <strong>Tax:</strong> ELSS for high returns, PPF for guaranteed safety, NPS for extra ₹50K deduction<br><br>📞 <em>For a <strong>personalised recommendation</strong> based on your age, income, and goals — call Sachin at <strong>9013976999</strong>. Free, 20 minutes, no obligation.</em>`,
      quickReplies: ['Term vs Endowment','ELSS vs PPF','Health plan comparison','Speak to Sachin']
    },

    /* ─── QUOTE ──────────────────────────────────────── */
    {
      id: 'quote',
      weight: 2,
      patterns: ['quote','get quote','free quote','buy insurance','buy plan','how to buy','apply','purchase insurance','get a plan','need insurance','want insurance'],
      response: () => `${greet()}<strong>🎯 Get Your Free Quote in 3 Ways</strong><br><br><strong>Option 1 — Quote Form (2 mins):</strong><br>Click <strong>"Get Quote"</strong> in the top-right of this page → fill details → Sachin calls within 2 hours.<br><br><strong>Option 2 — Call directly:</strong><br>📱 <strong><a href="tel:9013976999" style="color:#2563EB">9013976999</a></strong> or <strong><a href="tel:8383813408" style="color:#2563EB">8383813408</a></strong><br><br><strong>Option 3 — WhatsApp:</strong><br>Click the 🟢 green button at the bottom-right of this page.<br><br>✅ <em>We compare plans from 20+ insurers and recommend the best for your budget. No spam. No pressure. No obligation.</em>`,
      quickReplies: ['💬 Open Quote Form','📱 WhatsApp Sachin','↩ More Questions','Close chat']
    },

    /* ─── FINANCIAL PLANNING / GENERAL MONEY ADVICE ── */
    {
      id: 'financial_planning',
      weight: 2,
      patterns: ['financial planning','money planning','wealth management','financial advice','financial goals','personal finance','manage money','money management','savings tips','how to save money','financial freedom','financial security'],
      response: () => `${greet()}<strong>💡 Financial Planning — The Big Picture</strong><br><br>Great that you're thinking about financial planning! Here's the foundation every Indian needs:<br><br><strong>The Wealth Pyramid:</strong><br><br>🔻 <strong>Step 1 — Protection (Insurance):</strong><br>• Term insurance (10-15× income)<br>• Health insurance (₹10L+ per person)<br>• Emergency fund (6 months expenses in liquid)<br><br>🔶 <strong>Step 2 — Tax Efficiency:</strong><br>• Maximize 80C (₹1.5L) + 80D (₹25-75K) + 80CCD(1B) (₹50K)<br>• Saves ₹46,000–82,000/year in tax<br><br>🔷 <strong>Step 3 — Wealth Building:</strong><br>• ELSS for equity growth<br>• NPS for retirement<br>• Child plan if you have kids<br><br>🟡 <strong>Step 4 — Passive Income:</strong><br>• Annuity, rental income, dividend stocks<br><br>📞 <em>Sachin helps with holistic financial planning, not just insurance. Call <strong>9013976999</strong> for a free session.</em>`,
      quickReplies: ['Emergency fund advice','Tax saving guide','Investment plans','Speak to Sachin']
    },

    /* ─── EMERGENCY FUND ──────────────────────────────── */
    {
      id: 'emergency_fund',
      weight: 2,
      patterns: ['emergency fund','emergency savings','rainy day fund','liquid savings','how much to save','savings for emergency','financial cushion','job loss savings','backup fund','liquid fund'],
      response: () => `${greet()}<strong>🆘 Emergency Fund — Your Financial Safety Net</strong><br><br>Before buying any investment, every person needs an emergency fund. Here's everything you need to know:<br><br><strong>How much?</strong><br>• <strong>Salaried employees:</strong> 6 months of all expenses<br>• <strong>Self-employed / business owners:</strong> 12 months of expenses<br>• <strong>Example:</strong> Monthly expenses ₹50,000 → keep ₹3–6 Lakh in emergency fund<br><br><strong>Where to keep it:</strong><br>• Savings account (instant access)<br>• Liquid mutual funds (1-day redemption, better returns than FD)<br>• Short-term FD (access in 1-2 days)<br><br>⚠️ <strong>Don't keep emergency fund in:</strong><br>• Stock market (can be down when you need it!)<br>• Long-term FDs, ELSS, PPF (locked up)<br><br>💡 <em>Insurance + Emergency Fund = You can handle any financial crisis without panic selling your investments.</em>`,
      quickReplies: ['Where to invest rest of money','Tax saving options','Health insurance details','Financial planning tips']
    },

    /* ─── ONLINE VS OFFLINE INSURANCE ───────────────── */
    {
      id: 'online_offline',
      weight: 2,
      patterns: ['online insurance','offline insurance','buy online','direct insurance','online vs offline','buy direct','online plan cheaper','web plan insurance','online policy','digital insurance buying','agent and broker','agent vs broker','broker or agent'],
      response: () => `${greet()}<strong>💻 Online vs Offline Insurance — Which is Better?</strong><br><br><strong>Online (Direct):</strong><br>✅ Usually 15–30% cheaper (no agent commission)<br>✅ Instant policy issuance<br>✅ Easy comparison on aggregator sites<br>❌ You're on your own during claims<br>❌ Need to understand terms yourself<br>❌ No personalised advice<br><br><strong>Offline (Through Advisor like Sachin):</strong><br>✅ Expert guidance — get the RIGHT policy, not just the cheapest<br>✅ Claims support — advisor fights for you during disputes<br>✅ Renewal reminders, policy review<br>✅ Explains what's covered & what's not<br>✅ End-to-end service: buying → renewal → claims<br>❌ Slight premium difference (often negligible for the value received)<br><br>📌 <strong>Veera's honest take:</strong> For a ₹500/year health policy, sure, go online. For major life, health, or business policies — having Sachin in your corner is priceless. Claims is where advisors earn their keep!`,
      quickReplies: ['Get free quote via Sachin','How to buy insurance','Claim support','Speak to Sachin']
    },

    /* ─── GOLD INVESTMENT ────────────────────────────── */
    {
      id: 'gold',
      weight: 1,
      patterns: ['gold','gold investment','sovereign gold bond','sgb','digital gold','gold etf','gold vs insurance','invest in gold','gold vs mutual fund'],
      response: () => `${greet()}<strong>🥇 Gold as an Investment — A Balanced View</strong><br><br>Gold has been Indians' favourite investment for generations. Here's where it fits:<br><br><strong>Gold Options (Ranked by smartness):</strong><br>1. <strong>Sovereign Gold Bonds (SGB)</strong> — Gold + 2.5% interest + tax-free on maturity. Best option!<br>2. <strong>Gold ETF</strong> — Liquid, no storage risk, low expense ratio<br>3. <strong>Digital Gold</strong> — Convenient for small amounts<br>4. <strong>Physical Gold</strong> — Making charges, storage risk, not ideal as pure investment<br><br><strong>Gold vs Insurance vs Mutual Funds:</strong><br>• Gold: Good inflation hedge, but no life/health protection<br>• Insurance: Protection first, then investment<br>• Mutual Funds: Best for wealth creation<br><br>💡 <em>Ideal portfolio: Insurance (protection) → Emergency Fund → ELSS/NPS (growth) → Gold (5–10% allocation) as hedge.</em><br><br>📞 <em>Sachin offers holistic financial advice. Call <strong>9013976999</strong>.</em>`,
      quickReplies: ['Investment plans','ELSS vs PPF','Financial planning','Speak to Sachin']
    },

    /* ─── MUTUAL FUNDS ───────────────────────────────── */
    {
      id: 'mutual_funds',
      weight: 1,
      patterns: ['mutual fund','mutual funds','mf','sip','systematic investment','debt fund','equity fund','balanced fund','index fund','nifty fund','sensex fund','fund manager','nav','asset management'],
      response: () => `${greet()}<strong>📊 Mutual Funds — Quick Guide</strong><br><br>Mutual funds pool money from many investors and invest in stocks/bonds/etc. managed by professional fund managers.<br><br><strong>Types (simplified):</strong><br>• <strong>Equity Funds:</strong> Invest in stocks. High risk, high reward. 12–18% long-term returns.<br>• <strong>Debt Funds:</strong> Bonds & fixed income. Low risk. 7–9% returns.<br>• <strong>Hybrid/Balanced:</strong> Mix of both. Moderate risk-reward.<br>• <strong>Index Funds:</strong> Track Nifty/Sensex. Low cost, no active management.<br>• <strong>ELSS:</strong> Equity + tax saving under 80C. 3-year lock-in.<br><br><strong>SIP (Systematic Investment Plan):</strong><br>Invest a fixed amount monthly. Best way to build wealth — automatically buys more when markets fall!<br><br>💡 <em>PolicyRaj specialises in insurance, but we can refer you to trusted mutual fund advisors. For insurance + investment planning, call Sachin at <strong>9013976999</strong>.</em>`,
      quickReplies: ['ELSS for tax saving','ULIP vs Mutual Fund','NPS for retirement','Speak to Sachin']
    },

    /* ─── INFLATION & INSURANCE ───────────────────────── */
    {
      id: 'inflation',
      weight: 2,
      patterns: ['inflation','rising costs','medical inflation','premium increase','increasing premium','why premium increased','premium hike','cost of insurance rising','hospital costs rising'],
      response: () => `${greet()}<strong>📈 Insurance & Inflation — Why Your Cover Needs to Grow</strong><br><br>Inflation quietly erodes your insurance protection. Here's what you need to know:<br><br><strong>Medical Inflation in India: ~14% per year</strong><br>• ₹5L cover today → equivalent to ₹1.5L in 10 years!<br>• A surgery costing ₹3L today → ₹11L in 10 years<br>• This is why ₹5L health cover is dangerously inadequate<br><br><strong>What to do:</strong><br>1. <strong>Buy more cover now</strong> — it's cheapest when young<br>2. <strong>Increase sum insured</strong> at every renewal if your insurer allows<br>3. <strong>Add a top-up plan</strong> as your base cover ages<br>4. <strong>Critical illness cover</strong> helps bridge the gap<br><br><strong>Why premiums increase:</strong><br>• Medical inflation hits insurer costs<br>• Ageing portfolio → more claims<br>• IRDAI allows premium revisions based on experience<br><br>💡 <em>Your ₹10L cover today should be ₹20L+ in 5 years to maintain the same protection level.</em>`,
      quickReplies: ['How much health cover?','Top-up plans','Increase my coverage','Get Health Quote']
    },

    /* ─── HOW TO CHECK POLICY STATUS ────────────────── */
    {
      id: 'policy_status',
      weight: 2,
      patterns: ['policy status','check policy','track policy','policy details','policy number','policy login','where is my policy','download policy','policy certificate','policy document download'],
      response: () => `${greet()}<strong>🔍 How to Check Your Policy Status</strong><br><br><strong>For policies bought through PolicyRaj:</strong><br>📞 Call Sachin at 9013976999 — we track everything for you!<br><br><strong>For any insurance policy (self-service):</strong><br><br>• <strong>Online:</strong> Login to your insurer's website/app with registered mobile number<br>• <strong>Email:</strong> Check your inbox for policy PDF (sent at time of purchase)<br>• <strong>DigiLocker:</strong> Many insurers push policy documents directly<br>• <strong>Call insurer helpline:</strong> Quote your policy number + registered mobile<br><br><strong>For Life Insurance — all policies in one place:</strong><br>• Visit <strong>policyholder.irdai.gov.in</strong> — IRDAI's central repository<br>• Shows all your life insurance policies across all companies<br><br><strong>Don't know your policy number?</strong><br>• Check old premium receipts, emails, bank statements for premium debits<br>• Sachin's team can help trace lost policies — call 9013976999`,
      quickReplies: ['Renew my policy','DigiLocker for insurance','Speak to Sachin','Back']
    },

    /* ─── GROUP VS INDIVIDUAL HEALTH ────────────────── */
    {
      id: 'group_individual',
      weight: 2,
      patterns: ['group insurance','company insurance','employer insurance','corporate health','office health plan','group vs individual','company policy','employee health cover','should i buy extra besides company'],
      response: () => `${greet()}<strong>🏢 Company Health Insurance vs Personal Policy — Important!</strong><br><br>Your employer's group health plan is great — but it's NOT enough. Here's why:<br><br><strong>Group Insurance — Advantages:</strong><br>✅ Free or subsidised by employer<br>✅ No waiting period for pre-existing diseases (often)<br>✅ Easy enrollment<br><br><strong>Group Insurance — Critical Weaknesses:</strong><br>❌ <strong>Ends when you leave the job</strong> — no portability historically<br>❌ Cover usually low (₹2–5L) — inadequate for serious illness<br>❌ No control over insurer or plan<br>❌ Doesn't cover you if unemployed<br><br><strong>Personal Policy — Why You Need It Too:</strong><br>✅ Stays with you regardless of job<br>✅ Continuity of waiting period builds up<br>✅ Higher cover<br>✅ You choose the insurer and plan<br><br>📌 <strong>Best strategy:</strong> Keep your employer's group plan + buy a personal policy with ₹10L+ cover.<br>If you lose your job, you're still protected!`,
      quickReplies: ['How much personal cover to buy?','Family floater plan','Health insurance portability','Get Health Quote']
    },

    /* ══════════════════════════════════════════════════
       BATCH 2 — 60 ADDITIONAL QUESTIONS
    ══════════════════════════════════════════════════ */

    /* ─── DAY CARE PROCEDURES ───────────────────────── */
    {
      id: 'day_care',
      weight: 3,
      patterns: ['day care','daycare','day care procedure','day surgery','same day surgery','outpatient surgery','cataract surgery covered','dialysis covered','chemotherapy covered','laser surgery covered','day care treatment'],
      response: () => `${greet()}<strong>🏥 Day Care Procedures — Covered Without Overnight Stay!</strong><br><br>Modern medicine means many treatments that needed 2–3 day hospitalisation are now done in a few hours. Good news: <strong>health insurance covers day care procedures</strong> even without overnight admission.<br><br><strong>Common covered day care procedures:</strong><br>• Cataract surgery<br>• Chemotherapy, radiotherapy, dialysis<br>• Knee arthroscopy, shoulder surgery<br>• Tonsillectomy (tonsil removal)<br>• Hernia repair (laparoscopic)<br>• Laser eye surgery (LASIK — in some plans)<br>• Lithotripsy (kidney stone treatment)<br>• Dental surgery under general anaesthesia<br><br><strong>What you need:</strong><br>• Doctor's prescription recommending the procedure<br>• Treatment at a registered hospital/day care centre<br>• Pre-authorisation for cashless (if planned in advance)<br><br>💡 <em>Check your policy's day care list — most modern plans now cover 500–1,000+ day care procedures!</em>`,
      quickReplies: ['Cashless hospital claim','Health insurance details','OPD coverage','Get Health Quote']
    },

    /* ─── HEALTH NCB / RENEWAL BONUS ────────────────── */
    {
      id: 'health_ncb',
      weight: 3,
      patterns: ['health ncb','no claim bonus health','health renewal bonus','cumulative bonus','health bonus','bonus in health insurance','ncb in health insurance','health insurance ncb'],
      response: () => `${greet()}<strong>🎁 No Claim Bonus in Health Insurance — Get More Free!</strong><br><br>Just like motor NCB, health insurance rewards you for not claiming:<br><br><strong>Cumulative Bonus:</strong><br>• Every claim-free year → Sum insured increases by 10–50% (insurer-specific)<br>• <em>Without paying extra premium!</em><br>• Example: ₹10L policy, no claim for 3 years → cover grows to ₹13L–₹15L<br><br><strong>No Claim Discount:</strong><br>• Some plans offer premium discount instead<br>• 5–20% off at renewal for claim-free years<br><br><strong>Which is better?</strong><br>• <strong>Cumulative bonus</strong> (more cover) > discount (saving ₹1,000 on premium is less valuable than ₹3–5L extra cover)<br><br>⚠️ <strong>What happens when you claim?</strong><br>• Most plans: bonus resets OR reduces by 50% of accumulated bonus<br>• Some premium plans: protect NCB even after a claim<br><br>💡 <em>Niva Bupa ReAssure and HDFC Ergo Optima Restore have excellent NCB structures worth knowing.</em>`,
      quickReplies: ['Restore benefit in health','Health insurance plans','Get health quote','Back']
    },

    /* ─── RESTORE / RECHARGE BENEFIT ─────────────────── */
    {
      id: 'restore_benefit',
      weight: 3,
      patterns: ['restore benefit','recharge benefit','unlimited restore','sum insured restore','policy recharge','refill benefit','restore health insurance','cover restored','sum insured replenish'],
      response: () => `${greet()}<strong>🔄 Restore / Recharge Benefit — A Game-Changer Feature!</strong><br><br>Imagine you have a ₹10L health plan and you use ₹8L in a claim. Normally you'd only have ₹2L left for the rest of the year. <strong>Restore benefit fixes exactly this problem.</strong><br><br><strong>How Restore/Recharge works:</strong><br>• Once your sum insured is partially/fully used → it automatically "refills" back to full<br>• The restored amount can be used for a <em>different illness/condition</em> in the same year<br>• Some plans offer <strong>unlimited restores</strong> in a year!<br><br><strong>Real example:</strong><br>• ₹10L plan, you use ₹9L for bypass surgery in March<br>• In July, spouse is hospitalised for appendix → restore kicks in, another ₹10L available!<br><br><strong>Plans with best restore:</strong><br>• Niva Bupa ReAssure 2.0 — unlimited restore<br>• HDFC Ergo Optima Restore — 100% restore once per year<br>• Care Supreme — restore + no sub-limits<br><br>💡 <em>For a family plan, restore benefit is absolutely essential. Never buy without it!</em>`,
      quickReplies: ['Family floater plan','How much health cover?','Get health quote','Back']
    },

    /* ─── OPD COVERAGE ───────────────────────────────── */
    {
      id: 'opd_cover',
      weight: 2,
      patterns: ['opd','opd cover','outpatient','doctor consultation','medicine coverage','pharmacy coverage','doctor visit insurance','clinic visit covered','opd treatment','outpatient cover'],
      response: () => `${greet()}<strong>🩺 OPD Coverage in Health Insurance</strong><br><br>Traditionally, health insurance only covers <em>inpatient</em> (hospitalisation 24+ hours). OPD cover is a relatively new benefit that covers your routine doctor visits.<br><br><strong>What OPD cover includes:</strong><br>• Doctor consultation fees<br>• Medicines & pharmacy bills<br>• Diagnostic tests (blood test, X-ray, etc.) — outpatient<br>• Physiotherapy sessions<br>• Specialist consultations<br><br><strong>OPD cover limits (typical):</strong><br>• ₹5,000–₹25,000 per year depending on plan<br><br><strong>Plans with OPD:</strong><br>• Niva Bupa (OPD add-on)<br>• Aditya Birla Active Health Platinum<br>• Star Comprehensive (OPD included)<br>• Care Supreme (OPD add-on)<br><br>⚠️ <strong>Is it worth paying extra for OPD?</strong><br>Calculate your annual OPD spending. If it's more than the extra premium cost — yes! For families with small children (frequent doctor visits) it often pays off.<br><br>💡 <em>The average Indian family spends ₹15,000–₹25,000 on OPD each year — often completely out of pocket.</em>`,
      quickReplies: ['Day care procedures','Health checkup benefits','Get health quote','Back']
    },

    /* ─── MENTAL HEALTH INSURANCE ────────────────────── */
    {
      id: 'mental_health',
      weight: 2,
      patterns: ['mental health','mental health insurance','depression insurance','anxiety insurance','psychiatric treatment','psychology insurance','mental illness insurance','therapy covered','counselling insurance','mental health coverage'],
      response: () => `${greet()}<strong>🧠 Mental Health Insurance — Now Mandatory to Cover!</strong><br><br>Great news: Since the <strong>Mental Healthcare Act 2017</strong>, IRDAI mandates that all health insurance policies must cover mental health conditions on par with physical illnesses.<br><br><strong>What's covered:</strong><br>• Inpatient psychiatric hospitalisation<br>• Treatment for depression, bipolar disorder, schizophrenia<br>• Substance abuse treatment (in many plans)<br>• Suicide attempt treatment hospitalisation<br><br><strong>What's typically not covered:</strong><br>• OPD therapy/counselling sessions (unless your plan has OPD cover)<br>• Routine psychiatrist visits<br><br><strong>Key plans with good mental health coverage:</strong><br>• Niva Bupa ReAssure 2.0<br>• Aditya Birla Active Health<br>• HDFC Ergo Optima Secure<br><br>💡 <em>Mental health is as real as physical health. If you or someone in your family is dealing with mental health challenges, know that your health insurance can help with inpatient treatment costs.</em><br><br>📞 <em>Sachin helps you find plans with the best mental health coverage — call <strong>9013976999</strong>.</em>`,
      quickReplies: ['OPD coverage','Health insurance details','Get health quote','Speak to Sachin']
    },

    /* ─── NEWBORN BABY COVER ──────────────────────────── */
    {
      id: 'newborn_cover',
      weight: 2,
      patterns: ['newborn','new born','baby insurance','infant insurance','newborn cover','baby health insurance','child birth insurance','cover for baby','new baby insurance','nicu cover'],
      response: () => `${greet()}<strong>👶 Newborn Baby Coverage in Health Insurance</strong><br><br>Your newborn deserves protection from day one! Here's how it works:<br><br><strong>When is the newborn covered?</strong><br>• Most plans cover newborn from <strong>Day 1 of birth</strong> under the mother's policy<br>• You must add the baby to the policy within 90 days of birth<br>• Some plans cover from Day 91<br><br><strong>What's covered for newborn:</strong><br>• NICU charges (premature babies)<br>• Congenital disorders (in modern plans)<br>• Vaccinations (in some plans with OPD cover)<br>• Jaundice treatment<br>• Birth defects treatment<br><br><strong>What to do at baby's birth:</strong><br>1. Inform your insurer within 30–90 days<br>2. Add baby to your family floater<br>3. Premium increases marginally<br>4. Baby gets continuity benefit from day of birth<br><br>💡 <em>Adding a newborn to a family floater is much cheaper than buying a separate child policy. Sachin helps families plan this perfectly — call <strong>9013976999</strong>.</em>`,
      quickReplies: ['Family floater plan','Maternity insurance','Child plan for education','Get Health Quote']
    },

    /* ─── HOSPITAL CASH / DAILY ALLOWANCE ────────────── */
    {
      id: 'hospital_cash',
      weight: 2,
      patterns: ['hospital cash','daily cash','daily allowance','hospital allowance','cash benefit hospital','income during hospitalisation','hospital daily benefit','convalescence benefit','daily hospital benefit'],
      response: () => `${greet()}<strong>💵 Hospital Daily Cash Benefit — Income During Hospitalisation</strong><br><br>Hospital Cash is a unique benefit that pays you a <strong>fixed daily allowance</strong> for every day you're hospitalised — regardless of your medical bills.<br><br><strong>How it works:</strong><br>• You're hospitalised for 7 days<br>• Your policy has ₹2,000/day hospital cash benefit<br>• You receive ₹14,000 cash — use it for <em>anything</em><br>• Food, travel, income loss, hired help at home — no questions asked!<br><br><strong>Typical benefit:</strong><br>• ₹500–₹5,000 per day depending on plan<br>• ICU cash: 2× daily cash (some plans)<br>• Maximum 30–60 days per year<br><br><strong>Why it matters:</strong><br>• When you're hospitalised, your regular income may stop<br>• EMIs, rent, bills don't pause while you recover<br>• Hospital cash fills this gap<br><br><strong>Where to find it:</strong><br>• Available as rider/add-on on most health policies<br>• Cost: ₹500–₹1,500/year for ₹1,000/day benefit<br><br>💡 <em>Especially useful for self-employed people and daily wage earners who lose income during hospitalisation.</em>`,
      quickReplies: ['Personal accident insurance','Critical illness insurance','Get health quote','Back']
    },

    /* ─── ANNUAL HEALTH CHECKUP ──────────────────────── */
    {
      id: 'health_checkup',
      weight: 2,
      patterns: ['health checkup','annual checkup','preventive health','health screening','free checkup insurance','health check','annual check up','preventive care','health test free'],
      response: () => `${greet()}<strong>🩺 Annual Health Check-Up Benefits in Insurance</strong><br><br>Many health insurance plans now include <strong>free annual preventive health check-ups</strong> — a fantastic benefit most policyholders don't use!<br><br><strong>What's typically included:</strong><br>• Complete blood count (CBC)<br>• Blood sugar (fasting & post-prandial)<br>• Lipid profile (cholesterol)<br>• Liver & kidney function tests<br>• Thyroid (TSH)<br>• ECG & chest X-ray<br>• Urine routine<br><br><strong>Value:</strong> ₹2,000–₹8,000 worth of tests — free!<br><br><strong>Plans with best health check-up benefits:</strong><br>• Aditya Birla Active Health — HealthReturns for staying fit<br>• Niva Bupa — Annual health check at empanelled labs<br>• Bajaj Allianz GIC Ltd. — Wellness benefits<br><br><strong>Section 80D bonus:</strong><br>Up to ₹5,000 spent on preventive health check-ups counts under Section 80D deduction — even if it's not through insurance!<br><br>💡 <em>Your health check-up is also your insurer's early warning system — early detection means lower treatment costs for everyone!</em>`,
      quickReplies: ['Health insurance benefits','Tax benefit 80D','Get health quote','Back']
    },

    /* ─── AYUSH TREATMENT ────────────────────────────── */
    {
      id: 'ayush',
      weight: 2,
      patterns: ['ayush','ayurveda insurance','homeopathy insurance','yoga insurance','unani insurance','siddha insurance','naturopathy insurance','ayurvedic treatment covered','alternative medicine insurance','holistic medicine insurance'],
      response: () => `${greet()}<strong>🌿 AYUSH Treatment Coverage in Health Insurance</strong><br><br>Good news for fans of traditional medicine! IRDAI now mandates that health insurers <strong>must cover AYUSH treatments</strong> on the same terms as allopathy.<br><br><strong>AYUSH stands for:</strong><br>• <strong>A</strong>yurveda<br>• <strong>Y</strong>oga & Naturopathy<br>• <strong>U</strong>nani<br>• <strong>S</strong>iddha<br>• <strong>H</strong>omeopathy<br><br><strong>Coverage conditions:</strong><br>• Must be at a government-recognised AYUSH hospital<br>• Minimum 24-hour inpatient stay (usually)<br>• Authentic registered AYUSH practitioner<br>• Some plans have a sub-limit (e.g., up to ₹25,000)<br><br><strong>What's typically covered:</strong><br>• Panchkarma (inpatient)<br>• Ayurvedic surgeries<br>• Inpatient Unani/Siddha treatment<br><br><strong>What's not covered:</strong><br>• OPD ayurvedic consultations (unless you have OPD rider)<br>• Cosmetic/beauty ayurvedic treatments<br><br>💡 <em>India is the world leader in traditional medicine. It's great that your health insurance now respects that!</em>`,
      quickReplies: ['OPD coverage','Health insurance benefits','Get health quote','Back']
    },

    /* ─── DOMICILIARY TREATMENT ──────────────────────── */
    {
      id: 'domiciliary',
      weight: 2,
      patterns: ['domiciliary','home treatment','treatment at home','home nursing','home hospitalisation','domiciliary hospitalisation','medical care at home','home care insurance','treatment home insurance'],
      response: () => `${greet()}<strong>🏠 Domiciliary / Home Treatment Coverage</strong><br><br>Sometimes hospitalisation isn't possible or practical — for elderly patients, or when hospital beds aren't available. <strong>Domiciliary hospitalisation</strong> covers treatment at home!<br><br><strong>When does domiciliary cover apply?</strong><br>• Patient's condition prevents shifting to hospital<br>• Lack of hospital bed availability<br>• Treatment can be safely administered at home<br>• Minimum 3 consecutive days of home treatment<br><br><strong>What's covered:</strong><br>• Doctor's home visit fees<br>• Nursing charges<br>• Medicines and consumables<br>• Diagnostic tests conducted at home<br><br><strong>What's NOT covered under domiciliary:</strong><br>• Asthma, bronchitis, chronic nephritis, diarrhoea (usually excluded)<br>• Conditions treatable at OPD<br><br><strong>Plans with good domiciliary cover:</strong><br>• Niva Bupa, HDFC Ergo, Care Health<br><br>💡 <em>Especially useful for elderly parents who may find hospitalisation traumatic. Domiciliary cover means they can heal in the comfort of home.</em>`,
      quickReplies: ['Senior citizen insurance','AYUSH coverage','Get health quote','Back']
    },

    /* ─── FREE LOOK PERIOD ───────────────────────────── */
    {
      id: 'free_look',
      weight: 2,
      patterns: ['free look','free look period','cancel policy','return policy','policy return','policy cancellation','refund insurance','cancel after buying','return insurance policy','15 day cancel','30 day cancel'],
      response: () => `${greet()}<strong>🔍 Free Look Period — Try Before You Commit!</strong><br><br>Bought an insurance policy and changed your mind? No worries! <strong>IRDAI gives you a "Free Look Period"</strong> to review and return any policy.<br><br><strong>Free Look Period:</strong><br>• <strong>15 days</strong> from receiving policy documents (standard)<br>• <strong>30 days</strong> for policies bought online or via distance marketing<br><br><strong>What you get back:</strong><br>• Full premium minus:<br>  - Stamp duty charges<br>  - Medical test costs (if any)<br>  - Proportionate risk premium for days covered<br><br><strong>How to cancel:</strong><br>1. Write to the insurer within the free look period<br>2. State reason for cancellation<br>3. Submit original policy documents<br>4. Refund processed in 15 days<br><br>⚠️ <strong>Important:</strong> Free look applies only once per policy. It cannot be used after the period expires.<br><br>💡 <em>Always read your policy document within the first 15 days. If something doesn't match what you were told, cancel immediately and contact Sachin for the right plan!</em>`,
      quickReplies: ['Policy documents','How to buy right policy','Speak to Sachin','Back']
    },

    /* ─── POLICY SURRENDER ───────────────────────────── */
    {
      id: 'policy_surrender',
      weight: 2,
      patterns: ['surrender policy','surrender value','policy surrender','cancel life insurance','break policy','stop premium','exit policy','surrender lic','withdraw from policy','close policy','paid up value','paid up policy','make policy paid up'],
      response: () => `${greet()}<strong>⚠️ Surrendering a Policy — Think Twice!</strong><br><br>Surrendering means cancelling your life insurance policy before maturity and taking whatever money the insurer gives back. This is usually a bad financial decision — here's why:<br><br><strong>Surrender Value Types:</strong><br>• <strong>Guaranteed Surrender Value (GSV):</strong> 30% of premiums paid (after 3 years minimum)<br>• <strong>Special Surrender Value:</strong> May be higher depending on plan performance<br><br><strong>Example of the pain:</strong><br>You paid ₹1L/year for 5 years (₹5L total). Surrender value = ₹1.5L. You just lost ₹3.5L!<br><br><strong>Before surrendering, consider these alternatives:</strong><br>• <strong>Paid-Up:</strong> Stop premiums, policy continues at reduced sum insured<br>• <strong>Policy Loan:</strong> Borrow against policy value at low interest<br>• <strong>Assignment:</strong> Assign policy as loan collateral<br>• <strong>Premium Holiday:</strong> Some ULIPs allow temporary premium pause<br><br>📞 <em>Before surrendering any policy, talk to Sachin at <strong>9013976999</strong>. There's often a better way than surrendering at a loss.</em>`,
      quickReplies: ['Policy loan option','Paid-up policy explained','Renewal tips','Speak to Sachin']
    },

    /* ─── UNDERINSURANCE ──────────────────────────────── */
    {
      id: 'underinsurance',
      weight: 2,
      patterns: ['underinsurance','under insured','insufficient cover','not enough insurance','low coverage','inadequate insurance','need more cover','am i underinsured','how do i know if i have enough insurance'],
      response: () => `${greet()}<strong>⚠️ Underinsurance — India's Biggest Financial Risk!</strong><br><br>Underinsurance means having insurance, but not <em>enough</em>. It's often more dangerous than having no insurance — because you think you're covered but you're not.<br><br><strong>Signs you may be underinsured:</strong><br>• Health cover is ₹3L or less per person<br>• Life insurance less than 10× annual income<br>• Motor policy is Third Party only (no own damage)<br>• No critical illness cover<br>• No personal accident insurance<br>• Haven't reviewed coverage in 3+ years<br><br><strong>Real consequences of underinsurance:</strong><br>• Health: ₹5L cover exhausted in a major surgery → you pay the rest from savings<br>• Life: ₹25L cover sounds big but pays out in 3 years at current expense levels<br>• Motor: TP-only → your own car repair after accident = fully out of pocket<br><br><strong>Quick self-check:</strong><br>Health: ₹10L+ per person ✅<br>Life: 10–15× income ✅<br>Critical Illness: 3–5× income ✅<br><br>📞 <em>Get a free insurance portfolio review from Sachin — call <strong>9013976999</strong>.</em>`,
      quickReplies: ['How much health cover?','Life insurance amount','Portfolio review','Speak to Sachin']
    },

    /* ─── IDV — INSURED DECLARED VALUE ──────────────── */
    {
      id: 'idv',
      weight: 3,
      patterns: ['idv','insured declared value','what is idv','vehicle value insurance','depreciation vehicle','car value insurance','market value car','idv meaning','idv calculation'],
      response: () => `${greet()}<strong>🚗 IDV — Insured Declared Value Explained Simply</strong><br><br>IDV is the <strong>current market value of your vehicle</strong> — it's what the insurer will pay if your vehicle is stolen or declared a total loss.<br><br><strong>How IDV is calculated:</strong><br>IDV = Manufacturer's listed price − Depreciation<br><br><strong>Depreciation schedule:</strong><br>• Up to 6 months old: 5% deducted<br>• 6 months–1 year: 15% deducted<br>• 1–2 years: 20% deducted<br>• 2–3 years: 30% deducted<br>• 3–4 years: 40% deducted<br>• 4–5 years: 50% deducted<br><br><strong>Why IDV matters:</strong><br>• Higher IDV = higher premium, but better payout if car is stolen/totalled<br>• Lower IDV = lower premium, but you get less money if total loss<br><br>⚠️ <strong>Common mistake:</strong> People lower IDV to save ₹500 on premium. Then lose ₹2–3 lakh on a theft claim!<br><br>💡 <em>Always insure at accurate IDV. The Return to Invoice add-on even lets you get the original invoice price — not just IDV.</em>`,
      quickReplies: ['Return to Invoice add-on','Zero depreciation cover','Comprehensive motor insurance','Get Motor Quote']
    },

    /* ─── RETURN TO INVOICE ───────────────────────────── */
    {
      id: 'return_invoice',
      weight: 3,
      patterns: ['return to invoice','rti','invoice value','original price insurance','invoice insurance','full price car stolen','theft full value','total loss invoice'],
      response: () => `${greet()}<strong>🧾 Return to Invoice (RTI) Add-On — Get Your Full Money Back!</strong><br><br>If your car is <strong>stolen or declared a total loss</strong>, standard insurance pays IDV (current market value). RTI add-on takes it a step further — you get the <strong>original invoice price</strong>!<br><br><strong>Example:</strong><br>• You bought car for ₹12L (invoice price)<br>• After 2 years, IDV = ₹8.4L (30% depreciation)<br>• Car gets stolen<br>• Without RTI: Insurer pays ₹8.4L<br>• <strong>With RTI: Insurer pays full ₹12L</strong> + road tax + registration ✅<br><br><strong>What RTI covers:</strong><br>• Theft<br>• Total loss (repair cost > 75% of IDV)<br><br><strong>RTI add-on cost:</strong><br>₹1,500–₹4,000/year depending on car value<br><br><strong>Available for:</strong><br>Cars up to 3 years old typically<br><br>💡 <em>If you bought a new or expensive car in the last 3 years, RTI is a no-brainer. One theft claim and it pays for itself 10× over!</em>`,
      quickReplies: ['Zero Depreciation add-on','IDV explained','NCB in motor insurance','Get Motor Quote']
    },

    /* ─── ELECTRIC VEHICLE INSURANCE ────────────────── */
    {
      id: 'electric_vehicle',
      weight: 2,
      patterns: ['electric vehicle','ev insurance','electric car insurance','electric bike insurance','ev car insurance','tata nexon insurance','ola electric insurance','battery insurance','ev policy','electric scooter insurance'],
      response: () => `${greet()}<strong>⚡ Electric Vehicle (EV) Insurance — What's Different?</strong><br><br>EV insurance works similarly to regular motor insurance but with some important differences:<br><br><strong>What's additional/different in EV insurance:</strong><br>• <strong>Battery cover</strong> — EV batteries cost ₹2–8L. Many policies now cover battery damage specifically.<br>• Higher IDV (EVs are expensive vehicles)<br>• Charging equipment cover (home charger damage)<br>• Roadside assistance with EV-specific support (flat battery, charging cable)<br><br><strong>EV-specific add-ons:</strong><br>• Battery secure cover<br>• EV charging cable cover<br>• Loss of key for keyless EVs<br><br><strong>Good news on premiums:</strong><br>• IRDAI reduced third-party premium for EVs by 15% to encourage adoption<br>• Own damage premium still based on vehicle value<br><br><strong>Best EV insurers:</strong><br>• Tata AIG (good for Tata EVs)<br>• HDFC Ergo, Bajaj Allianz (broad network)<br><br>💡 <em>If you drive an EV, make sure your policy explicitly covers the battery — it's the most expensive component!</em>`,
      quickReplies: ['Zero depreciation for EV','IDV for electric vehicle','New car insurance','Get Motor Quote']
    },

    /* ─── NEW CAR INSURANCE ───────────────────────────── */
    {
      id: 'new_car',
      weight: 3,
      patterns: ['new car insurance','new vehicle insurance','insurance for new car','just bought car','purchased new car','first insurance','brand new car','new bike insurance','new two wheeler'],
      response: () => `${greet()}<strong>🚗 Insurance for Your New Car — Get It Right from Day 1!</strong><br><br>Congratulations on the new vehicle! 🎉 Here's exactly what you need:<br><br><strong>Mandatory from Day 1 (legal requirement):</strong><br>• Third Party (TP) insurance<br>• Personal Accident cover (PA) for owner-driver<br><br><strong>What you SHOULD buy (recommended):</strong><br>• <strong>Comprehensive policy</strong> (TP + Own Damage)<br>• <strong>Zero Depreciation add-on</strong> — essential for new cars!<br>• <strong>Return to Invoice add-on</strong> — get full invoice if stolen/totalled<br>• <strong>Engine Protect</strong> — especially for areas with flooding<br>• <strong>NCB Protect</strong> — start building NCB safely<br>• <strong>Roadside Assistance</strong> — 24×7 help<br><br><strong>For new cars: IRDAI rules (2020):</strong><br>• TP insurance bundled for 3 years (cars) / 5 years (bikes)<br>• OD insurance can be annual or multi-year<br><br>⚠️ <strong>Don't let the dealer push you into overpriced insurance.</strong> Call Sachin at <strong>9013976999</strong> — we get better rates from 20+ insurers!`,
      quickReplies: ['Zero Depreciation must-have','Return to Invoice','IDV for new car','Get Motor Quote']
    },

    /* ─── LIC VS PRIVATE INSURERS ────────────────────── */
    {
      id: 'lic_vs_private',
      weight: 2,
      patterns: ['lic vs private','lic or private','which is better lic','government insurance','lic good or not','is lic safe','private vs government insurance','lic trust','private life insurance trust'],
      response: () => `${greet()}<strong>🏛️ LIC vs Private Life Insurers — The Honest Comparison</strong><br><br><strong>LIC (Life Insurance Corporation of India):</strong><br>✅ Government-backed — sovereign guarantee<br>✅ 65+ years of history, 25+ crore policies<br>✅ Unmatched trust factor especially for traditional plans<br>✅ Excellent for endowment, money back, pension plans<br>❌ Higher premium for term plans vs private<br>❌ Technology & service can be slower<br>❌ Term plans not as competitive in price<br><br><strong>Private Insurers (HDFC Life, ICICI Pru, Tata AIA, Max Life):</strong><br>✅ Much cheaper term insurance (same cover, lower price)<br>✅ Better technology — apps, online claims, instant service<br>✅ Innovative products (TROP, ULIPs, child plans)<br>✅ Higher claim settlement ratios in some cases<br>❌ No government guarantee (but IRDAI regulates all)<br><br><strong>Claim Settlement Ratios (2022–23):</strong><br>• LIC: 98.6% ✅<br>• HDFC Life: 99.4% ✅✅<br>• Tata AIA: 99.0% ✅<br>• Max Life: 99.5% ✅✅<br><br>📌 <strong>Veera's recommendation:</strong> Term plan? Go private. Traditional savings? LIC has a unique trust factor.`,
      quickReplies: ['Best term insurance plans','LIC endowment plans','Claim settlement ratios','Get Life Quote']
    },

    /* ─── LIMITED PAY TERM PLANS ──────────────────────── */
    {
      id: 'limited_pay',
      weight: 2,
      patterns: ['limited pay','limited payment','pay for 10 years','pay for 20 years','single pay','limited premium payment','short premium term','10 pay 30 year','pay premium for limited years'],
      response: () => `${greet()}<strong>📅 Limited Pay Term Plans — Pay Less Years, Covered for More!</strong><br><br>In a standard term plan, you pay premiums every year until the policy ends. Limited pay changes this — you pay for a shorter period but stay covered much longer.<br><br><strong>How it works:</strong><br>• <strong>Regular Pay:</strong> Pay every year for 30 years (if 30-year term)<br>• <strong>Limited Pay (10-pay):</strong> Pay for only 10 years → covered for 30 years!<br>• <strong>Single Pay:</strong> Pay once → covered for the full term<br><br><strong>Example — ₹1 Crore, 30-year term, age 30:</strong><br>• Regular pay: ₹9,000/year × 30 = ₹2.7L total<br>• 10-pay: ₹24,000/year × 10 = ₹2.4L total (slightly less overall!)<br>• After year 10: ZERO premium, full ₹1 Crore cover for 20 more years<br><br><strong>Best for:</strong><br>• High-earning younger professionals who want to be done with premiums early<br>• People planning early retirement<br>• Business owners with irregular future cash flow<br><br>💡 <em>Pay during your peak earning years, then enjoy premium-free protection in your 40s and 50s!</em>`,
      quickReplies: ['Term insurance details','TROP return of premium','Life insurance riders','Get Term Quote']
    },

    /* ─── SINGLE PREMIUM INSURANCE ───────────────────── */
    {
      id: 'single_premium',
      weight: 2,
      patterns: ['single premium','one time premium','lump sum insurance','single pay insurance','pay once','one time payment insurance','single premium life','single premium health'],
      response: () => `${greet()}<strong>💳 Single Premium Insurance — Pay Once, Stay Protected!</strong><br><br>Single premium plans let you <strong>pay the entire policy premium in one lump sum</strong> upfront — no annual payments to remember.<br><br><strong>Best single premium products:</strong><br>• <strong>Single Premium Term Plan</strong> — One payment, coverage for 10–30 years<br>• <strong>Single Premium Endowment</strong> — Invest lump sum, get back sum + bonus at maturity<br>• <strong>Single Premium ULIP</strong> — Market-linked growth with one payment<br>• <strong>Immediate Annuity</strong> — Pay lump sum, get monthly pension immediately<br><br><strong>Who it suits:</strong><br>• People who received a bonus, inheritance, or retirement payout<br>• NRIs sending money from abroad<br>• Business owners with surplus cash<br>• Those who forget to pay annual premiums<br><br><strong>Tax note:</strong><br>⚠️ If single premium > 10% of sum assured → maturity amount taxable. Ensure ratio is correct for tax-free maturity.<br><br>💡 <em>Sachin helps you pick the right single premium product based on your corpus and goals. Call <strong>9013976999</strong>.</em>`,
      quickReplies: ['Immediate annuity','Single premium ULIP','Endowment policy','Speak to Sachin']
    },

    /* ─── SELF-EMPLOYED INSURANCE ────────────────────── */
    {
      id: 'self_employed',
      weight: 2,
      patterns: ['self employed','freelancer insurance','business owner insurance','entrepreneur insurance','consultant insurance','gig worker','independent professional','own business insurance','doctor insurance','ca insurance','lawyer insurance'],
      response: () => `${greet()}<strong>💼 Insurance for Self-Employed & Business Owners</strong><br><br>If you run your own business or work for yourself, you have <strong>no employer to fall back on</strong> — making insurance even more critical!<br><br><strong>Your insurance checklist:</strong><br><br>🏥 <strong>Health Insurance:</strong> Non-negotiable. No company mediclaim for you. Buy a comprehensive personal + family plan immediately.<br><br>🛡️ <strong>Term Plan:</strong> Your family's income protection if something happens to you (the business's key person).<br><br>🚑 <strong>Personal Accident:</strong> Income replacement if injured and can't work.<br><br>💼 <strong>Professional Indemnity:</strong> If you're a doctor, CA, architect, IT consultant — protects against client claims for professional errors.<br><br>🏢 <strong>Key Person Insurance:</strong> If your business has partners — insures the most critical person.<br><br>📈 <strong>Tax Advantage:</strong> As a business owner, <em>all insurance premiums are 100% deductible as business expense!</em><br><br>🏥 <strong>Group Health for Employees:</strong> Once you have staff — it's both a legal obligation and a retention tool.<br><br>📞 <em>Sachin has built comprehensive insurance plans for 1,000+ business owners. Call <strong>9013976999</strong>.</em>`,
      quickReplies: ['Professional indemnity','Key person insurance','Group health for team','Speak to Sachin']
    },

    /* ─── GOVERNMENT SCHEMES — PMJJBY & PMSBY ─────────── */
    {
      id: 'pmjjby_pmsby',
      weight: 2,
      patterns: ['pmjjby','pmsby','pradhan mantri jeevan jyoti','pradhan mantri suraksha','government insurance scheme','₹2 lakh insurance','cheap government insurance','government life insurance scheme','bank insurance scheme','jan suraksha'],
      response: () => `${greet()}<strong>🇮🇳 Government Insurance Schemes — ₹2 Lakh Cover at ₹20/year!</strong><br><br>These are two of India's most underutilised financial products. Every Indian with a bank account should have them!<br><br><strong>1. PMJJBY — Pradhan Mantri Jeevan Jyoti Bima Yojana</strong><br>• Life cover: <strong>₹2 Lakh</strong><br>• Premium: Just <strong>₹436/year</strong> (auto-debited from bank account in June)<br>• For age 18–50<br>• Renew every year<br>• Death due to any reason covered<br><br><strong>2. PMSBY — Pradhan Mantri Suraksha Bima Yojana</strong><br>• Accidental cover: <strong>₹2 Lakh</strong> (death/total disability)<br>• Premium: Just <strong>₹20/year!</strong> (₹20 — not ₹20,000!)<br>• For age 18–70<br>• Auto-renewed<br><br><strong>How to enrol:</strong><br>• Visit your bank or net banking / app<br>• Enable both schemes<br>• Done in 5 minutes!<br><br>💡 <em>₹456/year total for ₹4 Lakh cover — best value insurance in India. These don't replace a full plan, but are a great starting point for lower-income families.</em>`,
      quickReplies: ['Atal Pension Yojana','Term insurance for more cover','Health insurance','Speak to Sachin']
    },

    /* ─── AYUSHMAN BHARAT / PMJAY ────────────────────── */
    {
      id: 'ayushman',
      weight: 2,
      patterns: ['ayushman bharat','pmjay','ayushman card','ayushman bharat health','pradhan mantri jan arogya','5 lakh government health','ayushman insurance','pm jan arogya yojana','ayushman hospital'],
      response: () => `${greet()}<strong>🏥 Ayushman Bharat — PM Jan Arogya Yojana (PMJAY)</strong><br><br>India's largest government health insurance scheme — but it's not for everyone.<br><br><strong>Who is eligible?</strong><br>• Families listed in SECC 2011 data (Socio-Economic Caste Census)<br>• Economically vulnerable families<br>• Check eligibility at: <strong>pmjay.gov.in</strong> or call 14555<br><br><strong>Coverage:</strong><br>• ₹5 Lakh per family per year<br>• 1,300+ medical procedures and packages<br>• Cashless treatment at 25,000+ empanelled hospitals<br>• Pre & post hospitalisation (3 days before, 15 days after)<br>• Pre-existing diseases covered from Day 1<br>• No cap on family size<br><br><strong>What it covers:</strong> Cancer treatment, heart surgeries, orthopaedic surgeries, ICU care, and much more<br><br>⚠️ <strong>Important:</strong> If you're eligible — use it! But middle-class families who are not eligible should buy private health insurance.<br><br>💡 <em>Ayushman + a top-up plan can be a powerful combination for eligible families.</em>`,
      quickReplies: ['PMJJBY government scheme','Health insurance for middle class','Top-up plans','Speak to Sachin']
    },

    /* ─── ATAL PENSION YOJANA ────────────────────────── */
    {
      id: 'atal_pension',
      weight: 2,
      patterns: ['atal pension','apy','atal pension yojana','government pension','small pension','guaranteed pension government','pension for workers','₹5000 pension government','minimum pension india'],
      response: () => `${greet()}<strong>🏛️ Atal Pension Yojana (APY) — Government Guaranteed Pension!</strong><br><br>APY is a government-backed pension scheme specifically for the unorganised sector — though any Indian can join!<br><br><strong>How it works:</strong><br>• Contribute a small amount monthly from ages 18–40<br>• At age 60: Receive <strong>guaranteed monthly pension of ₹1,000–₹5,000</strong> for life<br>• After your death: spouse gets same pension<br>• After both pass away: Nominee gets the corpus back<br><br><strong>Monthly contribution examples (for ₹5,000/month pension):</strong><br>• Joining at 18: ₹210/month<br>• Joining at 25: ₹376/month<br>• Joining at 35: ₹902/month<br>• Joining at 40: ₹1,454/month<br><br><strong>Tax benefit:</strong> 80CCD(1) deduction — up to ₹1.5L under 80C<br><br><strong>How to join:</strong><br>• Any bank or post office with savings account<br>• Auto-debit from account monthly<br><br>💡 <em>For those in the unorganised sector with no EPF — APY is a must. It's the simplest, safest pension plan available.</em>`,
      quickReplies: ['NPS for more pension','Pension plans','Retirement planning','Speak to Sachin']
    },

    /* ─── SUKANYA SAMRIDDHI YOJANA ───────────────────── */
    {
      id: 'sukanya',
      weight: 2,
      patterns: ['sukanya','sukanya samriddhi','ssy','girl child plan','daughter savings','girl child insurance','sukanya yojana','beti bachao beti padhao savings','government girl child scheme'],
      response: () => `${greet()}<strong>👧 Sukanya Samriddhi Yojana (SSY) — Best Scheme for Your Daughter!</strong><br><br>SSY is a government savings scheme specifically for a girl child — and it's one of the best fixed-return options available anywhere!<br><br><strong>Key Features:</strong><br>• <strong>Interest Rate:</strong> 8.2% per year (as of 2024) — higher than most FDs and PPF!<br>• <strong>Tax:</strong> Invest, earn, and withdraw — <strong>all 100% tax-free (EEE)</strong><br>• <strong>Who can open:</strong> Parents/guardians for girls below 10 years<br>• <strong>Lock-in:</strong> Account matures when girl turns 21<br>• <strong>Investment:</strong> ₹250 minimum to ₹1.5L maximum per year<br>• <strong>Partial withdrawal:</strong> 50% at age 18 for education<br><br><strong>Quick math:</strong><br>₹12,500/month (₹1.5L/year) for 15 years at 8.2% = <strong>₹60+ Lakh at maturity!</strong><br><br><strong>Section 80C:</strong> Contributions up to ₹1.5L deductible<br><br>💡 <em>Combine SSY + child insurance plan for complete protection. SSY gives guaranteed savings; child plan adds insurance protection if something happens to you.</em>`,
      quickReplies: ['Child insurance plans','PPF vs Sukanya','Tax saving 80C','Speak to Sachin']
    },

    /* ─── POWER OF SIP ───────────────────────────────── */
    {
      id: 'sip_power',
      weight: 2,
      patterns: ['sip','systematic investment plan','how sip works','sip returns','start sip','sip calculator','monthly investment','sip mutual fund','best time to sip','sip vs lump sum'],
      response: () => `${greet()}<strong>📈 SIP — Systematic Investment Plan (How It Really Works)</strong><br><br>A SIP is simply investing a fixed amount every month in a mutual fund. But the <strong>compounding effect</strong> over time is magical.<br><br><strong>The SIP Magic (real numbers):</strong><br>₹5,000/month at 12% returns:<br>• 10 years → <strong>₹11.6 Lakh</strong> invested → <strong>₹11.6L profit</strong> → Total ₹23.2L<br>• 20 years → <strong>₹12L</strong> invested → <strong>₹38L profit</strong> → Total ₹50L<br>• 30 years → <strong>₹18L</strong> invested → <strong>₹1.59 Crore!</strong> → Total ₹1.77 Crore<br><br><strong>Why SIP works so well:</strong><br>• <strong>Rupee Cost Averaging:</strong> Auto-buys more units when markets are down → lower average cost<br>• <strong>Compounding:</strong> Returns earn returns, year after year<br>• <strong>Discipline:</strong> Auto-debit ensures you invest even when you forget<br><br><strong>SIP vs Lump Sum:</strong><br>SIP wins during volatile markets. Lump sum wins when market is at a low point (hard to time!)<br><br>💡 <em>The best SIP investment is the one you start TODAY. Time in market > timing the market.</em>`,
      quickReplies: ['ELSS SIP for tax saving','NPS for retirement','Child plan via SIP','Speak to Sachin']
    },

    /* ─── POWER OF COMPOUNDING / RULE OF 72 ─────────── */
    {
      id: 'compounding',
      weight: 2,
      patterns: ['compounding','compound interest','power of compounding','rule of 72','double money','how long to double','money doubles','compound growth','long term investment','wealth creation'],
      response: () => `${greet()}<strong>🔮 Power of Compounding — The 8th Wonder of the World!</strong><br><br>Einstein reportedly called compound interest the 8th wonder. Here's why it matters for you:<br><br><strong>What is compounding?</strong><br>Your returns earn returns. Your profits make profits. The longer you wait, the faster it grows.<br><br><strong>Rule of 72 — How fast does money double?</strong><br>Divide 72 by your interest rate to find doubling time:<br>• FD at 7% → doubles in <strong>72÷7 = ~10 years</strong><br>• ELSS at 12% → doubles in <strong>72÷12 = 6 years</strong><br>• ₹1L at 15% → doubles in <strong>4.8 years</strong><br><br><strong>Real-life compounding power:</strong><br>₹1 Lakh invested at 12%:<br>• Year 10 → ₹3.1L<br>• Year 20 → ₹9.6L<br>• Year 30 → <strong>₹29.9L!</strong> (from just ₹1L)<br><br><strong>The key insight:</strong> Starting 10 years earlier roughly <em>triples</em> your final wealth at 12% returns.<br><br>💡 <em>The best financial decision of your life is starting to invest and insure TODAY. Not tomorrow. Now.</em>`,
      quickReplies: ['Start SIP today','ELSS for wealth creation','Child plan investments','Speak to Sachin']
    },

    /* ─── PPF ACCOUNT DETAILS ─────────────────────────── */
    {
      id: 'ppf',
      weight: 2,
      patterns: ['ppf','public provident fund','ppf account','ppf interest rate','ppf maturity','ppf withdrawal','ppf loan','open ppf account','ppf vs fd','ppf tenure'],
      response: () => `${greet()}<strong>🏦 PPF — Public Provident Fund (Complete Guide)</strong><br><br>PPF is India's safest, most tax-efficient long-term savings instrument. Every working Indian should have one.<br><br><strong>Key Details:</strong><br>• <strong>Interest rate:</strong> 7.1% per year (government-set, revised quarterly)<br>• <strong>Tenure:</strong> 15 years (extendable in 5-year blocks)<br>• <strong>Minimum:</strong> ₹500/year | <strong>Maximum:</strong> ₹1,50,000/year<br>• <strong>Tax status:</strong> <strong>EEE</strong> — Investment, interest, maturity all tax-FREE!<br><br><strong>Partial withdrawal:</strong><br>• From Year 7 onwards: Up to 50% of balance<br><br><strong>Loan against PPF:</strong><br>• Between Year 3 and Year 6: Loan against PPF balance at low interest<br><br><strong>Where to open:</strong><br>• Post office, SBI, nationalised banks, most private banks (online too!)<br><br><strong>PPF vs FD:</strong><br>FD interest is fully taxable. PPF interest is 100% tax-free. At 30% slab, PPF's effective return is much higher.<br><br>💡 <em>PPF + ELSS + Life Insurance Premium = most of your 80C ₹1.5L limit covered smartly!</em>`,
      quickReplies: ['ELSS vs PPF','Tax saving 80C','NPS alongside PPF','Speak to Sachin']
    },

    /* ─── FD VS INSURANCE INVESTMENT ────────────────── */
    {
      id: 'fd_vs_insurance',
      weight: 2,
      patterns: ['fd vs insurance','fixed deposit vs insurance','fd or insurance','bank fd investment','is fd better','fd returns','bank fixed deposit compare','fd vs endowment','fd vs ulip'],
      response: () => `${greet()}<strong>🏦 Fixed Deposit vs Insurance — What Should You Choose?</strong><br><br>This is one of the most common questions. The answer: <strong>they serve completely different purposes.</strong><br><br><strong>Fixed Deposit:</strong><br>✅ Guaranteed returns (6.5–8.5% currently)<br>✅ Fully liquid (break anytime with small penalty)<br>✅ Simple and transparent<br>❌ Interest fully taxable (pay 30% if in top slab → net return 4.5–6%)<br>❌ Zero life cover<br>❌ No protection for family<br><br><strong>Insurance-Investment Plans (Endowment/ULIP):</strong><br>✅ Life cover + savings in one<br>✅ Tax-free maturity (Section 10(10D))<br>✅ Disciplined long-term saving<br>❌ Long lock-in (10–20 years)<br>❌ Lower liquidity<br><br><strong>The smart strategy:</strong><br>• Emergency fund: FD / liquid fund (6 months expenses)<br>• Life protection: Term plan (NOT endowment)<br>• Long-term wealth: ELSS / NPS / ULIP<br>• FD is NOT a substitute for insurance!<br><br>💡 <em>Never mix insurance and investment in a single product unless you understand exactly what you're getting.</em>`,
      quickReplies: ['PPF better than FD','ELSS for growth','Term plan separate','Speak to Sachin']
    },

    /* ─── NEW TAX REGIME VS OLD ───────────────────────── */
    {
      id: 'new_tax_regime',
      weight: 2,
      patterns: ['new tax regime','old tax regime','new vs old tax','which tax regime','section 115bac','tax regime choice','should i choose new regime','new regime deductions','income tax slabs 2024'],
      response: () => `${greet()}<strong>📊 New Tax Regime vs Old Tax Regime — Which is Right for You?</strong><br><br><strong>New Tax Regime (Default from FY 2023–24):</strong><br>• Lower tax rates<br>• No deductions (no 80C, 80D, HRA, LTA, etc.)<br>• Simple computation<br>• Best for those with few deductions<br><br><strong>Old Tax Regime:</strong><br>• Higher rates but many deductions allowed<br>• 80C (₹1.5L) + 80D (₹75K) + HRA + 80CCD(1B) (₹50K) + home loan interest (₹2L)<br>• Can reduce taxable income by ₹4–5L or more<br>• Best for those who maximise deductions<br><br><strong>Quick guide:</strong><br>• <strong>Income below ₹7L:</strong> New regime (zero tax!)<br>• <strong>Income ₹7–12L:</strong> Calculate both — old regime often wins if you have insurance + PPF<br>• <strong>Income ₹12L+:</strong> Old regime almost always better if you invest in 80C/80D<br><br>⚠️ <strong>Insurance premiums are deductible ONLY under the old regime!</strong><br><br>💡 <em>If you're buying insurance for tax saving, ensure you're in the old regime. Consult your CA and Sachin together for the best strategy!</em>`,
      quickReplies: ['Tax saving investments','Section 80C explained','Section 80D health','Speak to Sachin']
    },

    /* ─── HOME LOAN TAX BENEFITS ──────────────────────── */
    {
      id: 'home_loan_tax',
      weight: 2,
      patterns: ['home loan tax','section 24','section 80eea','home loan interest deduction','home loan tax benefit','housing loan deduction','emi tax benefit','home loan principal deduction','first home buyer tax'],
      response: () => `${greet()}<strong>🏠 Home Loan Tax Benefits — Save Up to ₹3.5 Lakh!</strong><br><br>A home loan offers some of the best tax deductions available in India:<br><br><strong>Section 24(b) — Interest Deduction:</strong><br>• Up to <strong>₹2 Lakh/year</strong> on home loan interest (self-occupied property)<br>• No limit for let-out property (set off against rental income)<br><br><strong>Section 80C — Principal Deduction:</strong><br>• Home loan <strong>principal repayment</strong> counts within ₹1.5L 80C limit<br>• Also: Stamp duty & registration in year of purchase<br><br><strong>Section 80EEA — First-Time Home Buyer:</strong><br>• Extra ₹1.5L on interest for first-time buyers (affordable housing)<br>• Loan sanctioned between specific periods (check current eligibility)<br><br><strong>Total potential deduction:</strong><br>24(b): ₹2L + 80C principal: up to ₹1.5L + 80EEA: ₹1.5L = <strong>up to ₹5L deduction!</strong><br><br>💡 <em>Home loan + insurance + PPF can together reduce your taxable income by ₹6–8L. That's potentially ₹1.5–2.4L saved in taxes annually!</em>`,
      quickReplies: ['Tax saving complete guide','Home loan protection MRTA','Section 80C investments','Speak to Sachin']
    },

    /* ─── TPA — THIRD PARTY ADMINISTRATOR ───────────── */
    {
      id: 'tpa',
      weight: 2,
      patterns: ['tpa','third party administrator','tpa insurance','what is tpa','insurance tpa','health tpa','medi assist','health india tpa','vipul medcorp','paramount tpa','claim tpa','tpa process'],
      response: () => `${greet()}<strong>🏥 TPA — Third Party Administrator (Who Actually Processes Your Claim!)</strong><br><br>When you file a health insurance claim, it doesn't go directly to your insurer. It goes through a <strong>TPA — Third Party Administrator</strong>.<br><br><strong>What TPA does:</strong><br>• Issues your health insurance card<br>• Manages cashless authorisation at hospitals<br>• Processes reimbursement claims<br>• Maintains claim records<br>• Operates 24×7 helplines<br><br><strong>Major TPAs in India:</strong><br>• Medi Assist<br>• Health India TPA<br>• Paramount Health Services<br>• Vipul Medcorp<br>• Bajaj Allianz GIC Ltd. (uses Health India TPA)<br><br><strong>Your TPA's contact number is on:</strong><br>• Your health insurance card<br>• Policy document<br>• Insurer's website<br><br>⚠️ <strong>For cashless treatment:</strong> Always call the TPA first (not the insurer) — they are the ones who give hospital authorisation.<br><br>💡 <em>Save your TPA's number in your phone RIGHT NOW. In an emergency, this is the number you need.</em>`,
      quickReplies: ['How to claim cashless','Health insurance card','Claim documents needed','Speak to Sachin']
    },

    /* ─── LIFE INSURANCE DEATH CLAIM PROCESS ─────────── */
    {
      id: 'life_claim',
      weight: 2,
      patterns: ['death claim','life insurance claim after death','how to claim after death','nominee claim process','death benefit claim','life claim settlement','how family claims','life insurance death process','lic claim after death'],
      response: () => `${greet()}<strong>🙏 Life Insurance Claim After Death — Step by Step for Your Family</strong><br><br>This is perhaps the most important thing to know and share with your family. In a difficult time, they shouldn't have to figure this out.<br><br><strong>Documents your nominee needs:</strong><br>• Original policy document<br>• Death certificate (from municipality/hospital)<br>• Claimant's (nominee's) Aadhaar + PAN<br>• Bank account details for payout<br>• Cancelled cheque<br>• Medical records if death was illness-related<br>• FIR + post-mortem report if accidental death<br><br><strong>Process:</strong><br>1. Nominee contacts insurer / calls branch / WhatsApp/email<br>2. Submit filled claim form + documents<br>3. Insurer investigates (typically 7–30 days)<br>4. Claim approved → money transferred to nominee's account<br><br><strong>Timeline by law:</strong><br>IRDAI mandates settlement within <strong>30 days</strong> of all documents received.<br><br>📞 <em>PolicyRaj clients get claim assistance from Sachin's team — we guide families through every step. Call <strong>9013976999</strong>.</em>`,
      quickReplies: ['Nominee details','Life insurance documents','Speak to Sachin','Back']
    },

    /* ─── CLAIM DOCUMENTS CHECKLIST ──────────────────── */
    {
      id: 'claim_documents',
      weight: 3,
      patterns: ['claim documents','documents for claim','what to submit claim','claim form','bills for claim','papers for insurance claim','what papers needed claim','hospital bills claim','discharge summary claim'],
      response: () => `${greet()}<strong>📋 Insurance Claim Documents — Complete Checklist</strong><br><br><strong>🏥 Health Insurance Claim:</strong><br>• Duly filled claim form<br>• All original hospital bills & receipts<br>• Discharge summary<br>• Doctor's prescription & treatment notes<br>• Investigation reports (blood tests, X-rays, scans)<br>• Photo ID (Aadhaar/PAN)<br>• Health insurance card copy<br>• Bank account details for reimbursement<br><br><strong>🚗 Motor Insurance Claim:</strong><br>• Claim form<br>• RC Book, DL, insurance policy copy<br>• FIR (for theft or third-party accidents)<br>• Repair estimate / bills<br>• Photos of vehicle damage<br>• Surveyor's report<br><br><strong>🛡️ Life Insurance Claim:</strong><br>• Original policy document<br>• Death certificate<br>• Nominee's ID + bank details<br>• Employer certificate (if salaried)<br>• Medical records / FIR (as applicable)<br><br>💡 <em>Keep digital copies of all original bills on Google Drive or DigiLocker. Sachin's team helps with claim documentation — call 9013976999.</em>`,
      quickReplies: ['How to file claim','Claim rejection reasons','TPA process','Speak to Sachin']
    },

    /* ─── HOW LONG DOES CLAIM TAKE ───────────────────── */
    {
      id: 'claim_time',
      weight: 2,
      patterns: ['how long claim','claim time','claim days','claim settlement time','how many days for claim','claim pending','reimbursement time','cashless approval time','claim delay','claim processing time'],
      response: () => `${greet()}<strong>⏰ How Long Does Insurance Claim Settlement Take?</strong><br><br><strong>Health Insurance:</strong><br>• Cashless pre-authorisation: <strong>30–60 minutes</strong> (planned), 2–4 hours (emergency)<br>• Cashless final settlement: Discharged same day<br>• Reimbursement claim: <strong>7–15 working days</strong> after all documents received<br><br><strong>Motor Insurance:</strong><br>• Surveyor visit: Within 24–48 hours of claim<br>• Cashless garage payment: 2–5 working days<br>• Reimbursement: 7–10 working days after bill submission<br><br><strong>Life Insurance:</strong><br>• Early claim (death within 3 years of policy): Up to 90 days (investigation possible)<br>• Normal claim: <strong>30 days</strong> (IRDAI mandate after all documents submitted)<br>• With Aadhaar & nominee linked: Often under 15 days<br><br><strong>IRDAI regulations:</strong><br>• Health: 30 days to settle after docs received<br>• Life: 30 days to settle after investigation complete<br>• Delay beyond limits: Insurer pays 2% per month interest on pending amount!<br><br>📞 <em>If your claim is delayed beyond IRDAI timelines, call Sachin at <strong>9013976999</strong> — we escalate on your behalf.</em>`,
      quickReplies: ['Claim documents','Grievance complaint process','Speak to Sachin','Back']
    },

    /* ─── INSURANCE AFTER MARRIAGE ───────────────────── */
    {
      id: 'insurance_marriage',
      weight: 2,
      patterns: ['insurance after marriage','married insurance','newlywed insurance','wedding insurance','add spouse insurance','spouse on policy','married couple insurance','newly married','just got married insurance','marriage insurance checklist'],
      response: () => `${greet()}<strong>💒 Insurance Checklist After Marriage — Protect Each Other!</strong><br><br>Marriage is one of life's biggest financial milestones. Here's what you need to review and buy:<br><br><strong>✅ Immediate actions:</strong><br>1. <strong>Add spouse to health insurance</strong> — convert individual to family floater<br>2. <strong>Update nominee</strong> on all existing life insurance policies<br>3. <strong>Update nominee</strong> on EPF, NPS, bank accounts<br><br><strong>✅ New covers to buy:</strong><br>• <strong>Family floater health plan</strong> — joint cover for both<br>• <strong>Increase term cover</strong> — now you have a dependent spouse<br>• <strong>Spouse's term plan</strong> — if your spouse works, their income matters too<br><br><strong>✅ Future planning starts now:</strong><br>• Child plan — start even before planning a baby<br>• Home loan protection if you're buying a house together<br>• Maternity cover — buy now, wait out the 2-year waiting period<br><br>💡 <em>The best wedding gift you can give each other? Financial protection. Sachin helps newlyweds set up complete insurance portfolios — call <strong>9013976999</strong>.</em>`,
      quickReplies: ['Family floater plan','Maternity insurance','Update nominee','Speak to Sachin']
    },

    /* ─── INSURANCE DURING PREGNANCY ────────────────── */
    {
      id: 'insurance_pregnancy',
      weight: 2,
      patterns: ['pregnancy insurance','maternity insurance','maternity cover','pregnant insurance','delivery insurance','c-section insurance','normal delivery insurance','maternity benefit','child birth cover','expecting baby insurance'],
      response: () => `${greet()}<strong>🤱 Insurance During Pregnancy — What You Need to Know</strong><br><br>Planning to have a baby? Here's the complete guide to insurance and pregnancy:<br><br><strong>Maternity Insurance — The Catch:</strong><br>• Most health plans have a <strong>2–4 year waiting period</strong> for maternity benefits<br>• If you're already pregnant → most plans WON'T cover this delivery<br>• <strong>Plan 2–3 years in advance</strong> if possible!<br><br><strong>What maternity cover includes:</strong><br>• Normal delivery expenses (₹30,000–₹70,000 typically)<br>• C-section/caesarean (₹50,000–₹1,50,000)<br>• Pre & post-natal consultations (some plans)<br>• Newborn cover from Day 1<br>• Newborn vaccination (some plans)<br><br><strong>Already pregnant with no maternity cover?</strong><br>• Your existing policy still covers any <em>complications</em> requiring hospitalisation<br>• Delivery expenses themselves may not be covered<br>• Some group health plans have no maternity waiting period — check yours!<br><br><strong>Best maternity plans:</strong><br>Niva Bupa Aspire, Star Women Care, HDFC Ergo Optima Secure<br><br>📞 <em>Call Sachin at <strong>9013976999</strong> to find if your current plan covers maternity and what to add.</em>`,
      quickReplies: ['Newborn baby coverage','Family floater plan','Women insurance','Get Health Quote']
    },

    /* ─── INSURANCE WHEN CHANGING JOBS ──────────────── */
    {
      id: 'job_change',
      weight: 2,
      patterns: ['change jobs insurance','changing jobs','job change insurance','between jobs insurance','new job insurance','notice period insurance','resign insurance','gap between jobs','switching company insurance','resign health cover'],
      response: () => `${greet()}<strong>💼 Insurance When Changing Jobs — Don't Leave a Gap!</strong><br><br>One of the biggest insurance mistakes people make is assuming their company health plan covers them after they resign. It often doesn't.<br><br><strong>What happens to company insurance when you leave:</strong><br>• Group health cover typically ends on <strong>last working day</strong> (sometimes last day of month)<br>• Any claims after that → not covered<br>• This gap can be dangerous, especially for those with pre-existing conditions<br><br><strong>What to do BEFORE resigning:</strong><br>1. <strong>Check your last day of coverage</strong> — ask HR<br>2. <strong>Buy a personal health policy</strong> before resigning (IRDAI portability allows you to carry health benefits)<br>3. <strong>Review your life insurance</strong> — is any policy tied to your employer?<br><br><strong>What to do at new employer:</strong><br>• Enrol in group health from Day 1<br>• Check if waiting periods apply (many group plans waive them)<br><br>💡 <em>A personal health policy that's yours regardless of employer is the best protection against job transition gaps. Sachin sets this up for many working professionals — call <strong>9013976999</strong>.</em>`,
      quickReplies: ['Personal vs company health insurance','Health insurance portability','Get personal health plan','Speak to Sachin']
    },

    /* ─── INSURANCE AT RETIREMENT ────────────────────── */
    {
      id: 'insurance_retirement',
      weight: 2,
      patterns: ['retiring soon','retirement insurance','insurance at retirement age','insurance after 60','senior health after retirement','insurance when retired','pension and insurance','post retirement health','retiring insurance checklist'],
      response: () => `${greet()}<strong>🌴 Insurance Planning at Retirement — Don't Let Your Guard Down!</strong><br><br>Retirement is when you need insurance MOST — not when you should cancel it. Here's what to review:<br><br><strong>Health Insurance — Most Critical:</strong><br>• If company mediclaim is ending → immediately get personal senior health plan<br>• Best senior plans: Star Red Carpet, Niva Bupa ReAssure Senior, Care Senior<br>• Buy BEFORE you retire — it's harder and more expensive after<br>• Co-pay is normal in senior plans (10–20%)<br><br><strong>Life Insurance — Reassess:</strong><br>• If children are financially independent → Term plan may be less critical<br>• But: If spouse is financially dependent → Keep life cover<br>• Whole life plans can serve estate planning needs<br><br><strong>Critical Illness:</strong><br>• Risk of cancer/heart disease increases with age<br>• If you don't have CI cover, consider a standalone critical illness plan<br><br><strong>Income Protection:</strong><br>• Annuity plans — guaranteed monthly income for life<br>• NPS maturity annuity — ensure you chose the right annuity option<br><br>💡 <em>Plan your retirement insurance portfolio 5 years before retirement — don't wait until the day you retire!</em>`,
      quickReplies: ['Senior citizen health insurance','Annuity plans','Pension planning','Speak to Sachin']
    },

    /* ─── INSURANCE FOR STUDENTS ──────────────────────── */
    {
      id: 'student_insurance',
      weight: 2,
      patterns: ['student insurance','college insurance','university insurance','student health insurance','insurance for college','young adult insurance','22 year old insurance','first insurance','insurance for kids going abroad','education abroad insurance'],
      response: () => `${greet()}<strong>🎓 Insurance for Students — Smart Starts Early!</strong><br><br>Whether studying in India or abroad, students need the right insurance coverage:<br><br><strong>Studying in India:</strong><br>• <strong>Health:</strong> Stay on parents' family floater if under 25 — add to their plan<br>• <strong>Personal Accident:</strong> Low cost (₹1,500–₹2,500/year) — very useful for active students<br>• <strong>Term Plan:</strong> Even at 22, if you have education loan, a term plan protects family from loan liability<br><br><strong>Studying Abroad:</strong><br>• <strong>International Student Health Plan</strong> — mandatory at most universities<br>• <strong>Travel Insurance</strong> — for the journey and any short trips<br>• <strong>Baggage & Laptop Cover</strong> — theft/damage during studies<br><br><strong>Why term plan at young age?</strong><br>• Cheapest premiums ever — lock in low rate for 30–40 years<br>• Education loan: ₹30L loan → if something happens → family doesn't repay it<br>• Start early, thank yourself at 40!<br><br>💡 <em>A 22-year-old can get ₹1 Crore term plan for just ₹600/month — the same coverage costs ₹1,700/month at 40.</em>`,
      quickReplies: ['Term plan at young age','Education abroad insurance','Travel insurance','Speak to Sachin']
    },

    /* ─── INSURANCE FOR SMOKERS ──────────────────────── */
    {
      id: 'smoker_insurance',
      weight: 2,
      patterns: ['smoker insurance','tobacco insurance','i smoke insurance','smoking insurance','cigarette insurance','non smoker discount','smoker premium','smoking term plan','bidi insurance','tobacco user'],
      response: () => `${greet()}<strong>🚬 Insurance for Smokers — Yes, You Can Still Get Covered!</strong><br><br>Being a smoker doesn't disqualify you from insurance — but it does affect your premium:<br><br><strong>Term/Life Insurance for Smokers:</strong><br>• Premium is <strong>25–50% higher</strong> than non-smokers of same age<br>• Insurers ask about tobacco use at buying stage<br>• <strong>Always declare honestly</strong> — if you die and concealment is found, claim can be rejected<br>• Most insurers classify: Smoker / Non-smoker / Ex-smoker<br><br><strong>Health Insurance for Smokers:</strong><br>• Premium loading of 10–20%<br>• Some insurers do medical tests and price accordingly<br>• Smoking-related illnesses ARE covered after waiting periods<br>• Critical illness cover is especially important for smokers (cancer/heart risk is higher)<br><br><strong>Ex-smoker?</strong><br>• Most insurers require 12–24 months of non-smoking to classify you as non-smoker<br>• Worth declaring honestly — saves significant premium!<br><br>💡 <em>Quitting smoking = financial benefits beyond health. Your insurance premium drops significantly too!</em>`,
      quickReplies: ['Critical illness cover','Health insurance details','Term insurance quotes','Speak to Sachin']
    },

    /* ─── KEY PERSON INSURANCE ───────────────────────── */
    {
      id: 'key_person',
      weight: 2,
      patterns: ['key person','key man insurance','keyman insurance','business continuity','important employee insurance','protect business partner','business owner life insurance','company insurance key employee'],
      response: () => `${greet()}<strong>🔑 Key Person Insurance — Protect Your Business's Most Important Asset</strong><br><br>In every business, there's usually one or two people whose absence would be catastrophic. <strong>Key Person Insurance</strong> protects the business if that person dies or is critically ill.<br><br><strong>How it works:</strong><br>• Business buys a life/CI policy on the key person<br>• Business pays the premium<br>• If key person dies/becomes critically ill → business receives the claim payout<br>• Money used to: Find/train replacement, repay loans, pay suppliers during transition, compensate for lost revenue<br><br><strong>Who typically needs it:</strong><br>• Tech startups — the founding engineer/developer<br>• Medical practices — the senior doctor<br>• CA/law firms — senior partner<br>• Manufacturing — the technical expert<br>• Any business with bank loan where banker asks for key person cover!<br><br><strong>Tax treatment:</strong><br>• Premium: Deductible as business expense (not 80C)<br>• Claim: Taxable as business income<br><br>📞 <em>Sachin has structured key person insurance for 200+ businesses. Call <strong>9013976999</strong>.</em>`,
      quickReplies: ['Business insurance','Group health for employees','Professional indemnity','Speak to Sachin']
    },

    /* ─── MARINE / CARGO INSURANCE ───────────────────── */
    {
      id: 'marine_cargo',
      weight: 2,
      patterns: ['marine insurance','cargo insurance','transit insurance','goods in transit','shipping insurance','import export insurance','stock in transit','delivery insurance','goods transport insurance','supply chain insurance'],
      response: () => `${greet()}<strong>🚢 Marine / Cargo Insurance — Protect Your Goods in Transit</strong><br><br>If your business involves buying or selling goods that are transported — marine/cargo insurance is essential.<br><br><strong>What it covers:</strong><br>• Damage during road/rail/sea/air transit<br>• Fire, theft, accident during transit<br>• Loading/unloading damage<br>• Natural disasters during transit<br>• General average (maritime emergencies)<br><br><strong>Types:</strong><br>• <strong>Specific Policy:</strong> Single consignment<br>• <strong>Open Policy / Annual Policy:</strong> All your consignments for a year — most common for traders<br>• <strong>Sales Turnover Policy:</strong> Premium based on annual sales turnover<br><br><strong>Who needs it:</strong><br>• Importers & exporters<br>• Manufacturers sending goods to distributors<br>• E-commerce businesses<br>• Traders and wholesalers<br>• Any business that ships valuable goods<br><br>💡 <em>One truck accident can destroy ₹20–50 lakh worth of goods. A marine policy covering your full year's transit costs ₹15,000–₹50,000/year typically.</em>`,
      quickReplies: ['Business insurance','Fire property insurance','Get Business Quote','Speak to Sachin']
    },

    /* ─── EVENT / WEDDING INSURANCE ──────────────────── */
    {
      id: 'event_insurance',
      weight: 2,
      patterns: ['event insurance','wedding insurance','shaadi insurance','function insurance','party insurance','concert insurance','wedding cancellation','event cancellation','venue insurance','wedding risk'],
      response: () => `${greet()}<strong>🎊 Event & Wedding Insurance — Protect Your Big Day!</strong><br><br>Indian weddings are expensive — often ₹10–50 lakh or more. Event insurance protects that investment.<br><br><strong>What event insurance covers:</strong><br>• <strong>Event cancellation</strong> — due to natural disaster, fire, venue issues, vendor no-show<br>• <strong>Liability insurance</strong> — if a guest is injured at the event<br>• <strong>Property damage</strong> at the venue<br>• <strong>Wedding gifts</strong> theft at venue<br>• <strong>Vendor default</strong> — caterer, photographer, decorator fails to show up<br>• <strong>Jewellery</strong> at the event<br><br><strong>What it doesn't cover:</strong><br>• Change of mind / cold feet (!) <br>• Pre-existing legal disputes<br><br><strong>Cost:</strong><br>₹5,000–₹25,000 depending on event size and cover<br><br><strong>When to buy:</strong><br>• At least 30–45 days before the event<br>• Earlier is better<br><br>💡 <em>When you're spending ₹30 lakh on a wedding, paying ₹10,000 to protect it from unforeseen cancellations is simply wise.</em>`,
      quickReplies: ['Home insurance','Business insurance','Jewellery insurance','Speak to Sachin']
    },

    /* ─── LIABILITY INSURANCE ────────────────────────── */
    {
      id: 'liability',
      weight: 2,
      patterns: ['liability insurance','public liability','third party liability','personal liability','product liability','employer liability','legal liability insurance','general liability','liability cover'],
      response: () => `${greet()}<strong>⚖️ Liability Insurance — Protection Against Legal Claims</strong><br><br>If someone holds you legally responsible for injury, damage, or financial loss — liability insurance pays the legal costs and compensation.<br><br><strong>Types of liability insurance:</strong><br><br>• <strong>Public Liability:</strong> Business owner responsible if customer/visitor gets injured at your premises. E.g., slips and falls in your shop.<br><br>• <strong>Product Liability:</strong> Your manufactured/sold product causes injury or damage to consumer.<br><br>• <strong>Professional Indemnity (PI):</strong> Professional advice/service causes client financial loss. For doctors, CAs, architects, IT firms.<br><br>• <strong>Employer's Liability / Workmen Compensation:</strong> Employee injured at workplace — mandatory for factories.<br><br>• <strong>Directors & Officers (D&O):</strong> Company directors personally liable for management decisions.<br><br>• <strong>Personal Liability:</strong> Homeowners policy add-on — if someone gets hurt on your property.<br><br>💡 <em>India is becoming increasingly litigation-friendly. One liability claim can bankrupt a small business. Protection is non-negotiable for any customer-facing business.</em>`,
      quickReplies: ['Professional indemnity','Workmen compensation','Business insurance','Speak to Sachin']
    },

    /* ─── PORTFOLIO REVIEW ───────────────────────────── */
    {
      id: 'portfolio_review',
      weight: 2,
      patterns: ['insurance review','portfolio review','review my insurance','check my insurance','am i well covered','insurance audit','annual insurance review','what insurance do i need','complete insurance check','insurance gap'],
      response: () => `${greet()}<strong>🔍 Insurance Portfolio Review — Are You Truly Protected?</strong><br><br>Most people buy insurance and forget it. An annual review ensures your coverage grows with your life. Here's a checklist:<br><br><strong>Health Insurance Review:</strong><br>□ Sum insured still adequate? (Add 10% yearly for medical inflation)<br>□ Any new family members to add?<br>□ Any new pre-existing conditions to declare?<br>□ Is your insurer's claim settlement ratio still good?<br><br><strong>Life Insurance Review:</strong><br>□ Is cover still 10–15× current income? (Income may have grown)<br>□ Any new loans to cover?<br>□ Nominee updated after major life events?<br><br><strong>Motor Insurance Review:</strong><br>□ NCB correctly applied?<br>□ Add-ons still relevant?<br>□ IDV correctly stated?<br><br><strong>Investment Plans Review:</strong><br>□ On track for child education corpus?<br>□ On track for retirement corpus?<br>□ Tax optimisation maximised?<br><br>📞 <em>Sachin offers a <strong>free annual insurance portfolio review</strong> to all PolicyRaj clients. Call <strong>9013976999</strong> to book yours.</em>`,
      quickReplies: ['How much health cover?','Life insurance amount check','Underinsurance risks','Speak to Sachin']
    },

    /* ─── ASSIGNMENT OF POLICY ───────────────────────── */
    {
      id: 'assignment',
      weight: 2,
      patterns: ['assignment','assign policy','policy assignment','loan against insurance','bank insurance assignment','home loan insurance assignment','mortgage policy','assign life insurance bank','collateral insurance'],
      response: () => `${greet()}<strong>📝 Assignment of Insurance Policy — Using Policy as Loan Collateral</strong><br><br>Insurance policy assignment means <strong>transferring rights of the policy</strong> to another party, typically a bank or lender as collateral for a loan.<br><br><strong>Two types of assignment:</strong><br><br><strong>1. Absolute Assignment:</strong><br>• Complete and permanent transfer to assignee (bank)<br>• Used as collateral for home loans<br>• Assignee (bank) has full rights until loan is repaid<br>• After loan closure → policy rights return to you<br><br><strong>2. Conditional Assignment:</strong><br>• Rights transfer only if a specific condition occurs<br>• Common in child endowment plans<br><br><strong>Why banks ask for it:</strong><br>• Home loan: Bank wants MRTA/term policy assigned to them<br>• If borrower dies → bank directly receives death benefit to close the loan<br><br><strong>Process:</strong><br>• Fill assignment form from insurer<br>• Endorse on back of policy<br>• Register with insurer<br>• Inform bank<br><br>💡 <em>Unlike nomination (which you can change freely), assignment needs formal reversal after loan closure. Don't forget to get it reversed once your loan is paid!</em>`,
      quickReplies: ['Home loan insurance','Life insurance nominee','Policy surrender','Speak to Sachin']
    },

    /* ─── HEALTH VS LIFE — WHICH FIRST ───────────────── */
    {
      id: 'health_vs_life',
      weight: 2,
      patterns: ['health vs life insurance','which first health or life','health important or life important','should i buy health or life first','priority insurance','most important insurance','which insurance to buy first'],
      response: () => `${greet()}<strong>🏥 vs 🛡️ Health Insurance vs Life Insurance — Which to Buy First?</strong><br><br>This is the single most common question, and here's the honest answer:<br><br><strong>Buy HEALTH INSURANCE first.</strong><br><br>Here's why:<br>• A medical emergency can hit you TOMORROW<br>• Your family has bills to pay whether you're alive or not<br>• Without health insurance, one hospitalisation can drain your savings<br>• Health is high probability, life claim is lower probability (hopefully!)<br><br><strong>Then buy LIFE (TERM) INSURANCE second.</strong><br><br>• Protects your family's FUTURE if you're gone<br>• Your income-replacement for dependents<br>• Absolutely critical if you have spouse, children, or ageing parents depending on you<br><br><strong>The ideal order for a 30-year-old with family:</strong><br>1. ✅ Health insurance (family floater ₹10–20L) — Week 1<br>2. ✅ Term insurance (₹1.5–2 Crore) — Week 2<br>3. ✅ Personal Accident (₹25–50L) — Month 2<br>4. ✅ Critical Illness (₹25–50L) — Month 3<br><br>💡 <em>If budget is tight: Buy health insurance and a smaller term plan simultaneously. Increase both over time.</em>`,
      quickReplies: ['Health insurance details','Term insurance details','How much cover?','Speak to Sachin']
    },

    /* ─── INSURANCE VS INVESTMENT DEBATE ────────────── */
    {
      id: 'insurance_vs_investment',
      weight: 2,
      patterns: ['insurance vs investment','is insurance an investment','insurance for investment','investment or insurance','insurance as investment','mixing insurance investment','insurance returns','should insurance give returns'],
      response: () => `${greet()}<strong>💡 Insurance vs Investment — The Most Important Concept in Personal Finance</strong><br><br>Here's the #1 mistake people make: treating insurance as an investment.<br><br><strong>Insurance and Investment are fundamentally different things:</strong><br><br>🛡️ <strong>Insurance = PROTECTION</strong><br>• Purpose: Financial safety net for your family<br>• Primary metric: Does my family get enough if I'm gone?<br>• Best product: Term plan (pure protection, zero investment)<br><br>📈 <strong>Investment = WEALTH CREATION</strong><br>• Purpose: Making your money grow<br>• Primary metric: Returns on investment<br>• Best products: ELSS, NPS, mutual funds, PPF<br><br><strong>Why mixing them is expensive:</strong><br>• Endowment plan: ₹10L cover + ₹30K/year premium<br>• vs Term + ELSS: ₹1 Crore cover + ₹9K term + ₹21K ELSS<br>• Same ₹30K spent → 10× more life cover + better investment returns!<br><br><strong>Exception:</strong><br>ULIPs have improved and for disciplined 10+ year investors, they can work well.<br><br>📌 <strong>Veera's golden rule:</strong> <em>"Buy insurance for protection. Invest for growth. Keep them separate unless you truly understand ULIPs."</em>`,
      quickReplies: ['Best term insurance','ELSS for investment','ULIP explained','Speak to Sachin']
    },

    /* ─── HOW MANY POLICIES TO HAVE ──────────────────── */
    {
      id: 'how_many_policies',
      weight: 2,
      patterns: ['how many insurance policies','too many policies','multiple policies','two health insurance','double insured','two term plans','can i have multiple','multiple insurance same type','which policies to have'],
      response: () => `${greet()}<strong>📋 How Many Insurance Policies Should You Have?</strong><br><br>There's no magic number, but here's a framework for a well-covered individual:<br><br><strong>Minimum Essential Portfolio (₹8–12K/month budget):</strong><br>✅ 1 Family Floater Health Plan (₹15–25L) — ₹15,000/yr<br>✅ 1 Term Life Plan (₹1.5–2 Crore) — ₹9,000/yr<br>✅ 1 Motor Insurance (Comprehensive) — as required<br><br><strong>Enhanced Portfolio (additional):</strong><br>✅ 1 Top-up Health Plan (₹20–30L) — ₹3,000/yr<br>✅ 1 Critical Illness Plan (₹25–50L) — ₹6,000/yr<br>✅ 1 Personal Accident Plan (₹50L) — ₹2,000/yr<br><br><strong>Multiple policies of same type — is it OK?</strong><br>• Health: Yes! You can claim from multiple insurers (coordination of benefits). Worth having.<br>• Term: Yes! Having 2 term plans from 2 insurers = double protection.<br>• Motor: No — double insurance not allowed; one policy only.<br><br><strong>Avoid over-buying:</strong><br>• Don't buy policies you don't understand<br>• Consolidate overlapping covers<br><br>📞 <em>Sachin does a free portfolio review to identify gaps and overlaps — call <strong>9013976999</strong>.</em>`,
      quickReplies: ['Insurance portfolio review','Underinsurance risks','Get complete insurance plan','Speak to Sachin']
    },

    /* ─── INSURANCE MYTHS BUSTED ──────────────────────── */
    {
      id: 'insurance_myths',
      weight: 2,
      patterns: ['insurance myths','myth about insurance','wrong about insurance','misconception insurance','insurance facts','is insurance worth it','waste money insurance','insurance misunderstood','insurance truths'],
      response: () => `${greet()}<strong>🚫 Top Insurance Myths — Busted!</strong><br><br><strong>Myth 1: "I'm young and healthy, I don't need insurance."</strong><br>✅ Truth: Accidents happen at any age. Young means cheaper premiums NOW. Buy now, thank yourself later.<br><br><strong>Myth 2: "My company gives group health — I'm covered."</strong><br>✅ Truth: Company cover ends when you leave. It's usually just ₹2–5L — often inadequate for serious illness.<br><br><strong>Myth 3: "Insurance is a waste if I don't claim."</strong><br>✅ Truth: Not claiming = you stayed healthy/safe. Insurance is like a car seatbelt — you don't want to 'use' it, but you're grateful it's there when you do.<br><br><strong>Myth 4: "Higher premium = better coverage."</strong><br>✅ Truth: Some expensive plans have sub-limits, copays, and exclusions. Cheaper plans with no sub-limits can be FAR better.<br><br><strong>Myth 5: "I'll buy insurance when I'm older."</strong><br>✅ Truth: Premiums double every decade. Pre-existing diseases lock you out. Start young, save lakhs.<br><br><strong>Myth 6: "Insurance is for dying/accidents only."</strong><br>✅ Truth: Health insurance is used by 1 in 4 families every year for hospitalisation. It's a routine financial tool.`,
      quickReplies: ['Start with health insurance','Term insurance facts','Get insurance now','Speak to Sachin']
    },

    /* ─── REAL ESTATE VS INSURANCE ───────────────────── */
    {
      id: 'real_estate',
      weight: 1,
      patterns: ['real estate','property investment','buy flat','buy apartment','real estate vs insurance','plot investment','house as investment','property vs insurance','invest in property','real estate returns'],
      response: () => `${greet()}<strong>🏠 Real Estate vs Insurance/Investment — A Balanced View</strong><br><br>Real estate is India's most loved investment. Here's how it compares:<br><br><strong>Real Estate:</strong><br>✅ Tangible asset, emotional satisfaction<br>✅ Rental income potential<br>✅ Inflation hedge (mostly)<br>❌ Completely illiquid — can't sell 20% of your flat in an emergency<br>❌ High transaction costs (stamp duty 5–7%, registration, brokerage)<br>❌ Maintenance, tenant issues, vacancy risk<br>❌ Actual returns after inflation & costs often 4–8%<br>❌ Zero life cover or insurance protection<br><br><strong>Financial Instruments (Insurance + Mutual Funds):</strong><br>✅ Highly liquid — withdraw anytime<br>✅ Life and health protection built in<br>✅ Diversified risk<br>✅ Tax efficient (ELSS, PPF, NPS)<br>✅ No management headache<br>❌ No emotional satisfaction of physical asset<br><br><strong>Veera's balanced view:</strong><br>• <em>Buy a home to live in</em> — there's emotional value<br>• <em>Don't buy 5 properties as "investment"</em> — diversify into financial assets too<br>• <em>Always protect your home with home insurance and your life with term insurance</em><br><br>📞 <em>Sachin helps you plan the right balance — call <strong>9013976999</strong>.</em>`,
      quickReplies: ['Home insurance','Term insurance importance','Investment plans','Speak to Sachin']
    },

    /* ─── CLAIM SETTLEMENT RATIO ──────────────────────── */
    {
      id: 'claim_ratio',
      weight: 2,
      patterns: ['claim settlement ratio','csr','claim ratio','best claim settlement','insurer claim ratio','which insurer settles most claims','claims paid ratio','incurred claim ratio','which health insurer best claims'],
      response: () => `${greet()}<strong>📊 Claim Settlement Ratio — How to Pick a Trustworthy Insurer</strong><br><br>Claim Settlement Ratio (CSR) is the % of claims settled vs claims filed. Higher = more trustworthy.<br><br><strong>Life Insurance CSR (2022–23 IRDAI data):</strong><br>• Max Life: <strong>99.51%</strong> 🥇<br>• HDFC Life: <strong>99.39%</strong><br>• Tata AIA: <strong>99.01%</strong><br>• LIC: <strong>98.62%</strong><br>• ICICI Prudential: <strong>97.84%</strong><br><br><strong>Health Insurance — Key metric (Incurred Claim Ratio):</strong><br>• Ideal range: 65–85%<br>• Too high (90%+): Insurer may increase premiums or restrict claims<br>• Too low (40–50%): May mean strict claim rejection<br>• Niva Bupa, HDFC Ergo, Bajaj Allianz GIC Ltd. have strong health CSRs<br><br><strong>Other factors to check alongside CSR:</strong><br>• Network hospitals count<br>• Speed of claim settlement (days)<br>• Complaint ratio (IRDAI data)<br>• Premium at renewal history<br><br>💡 <em>CSR matters, but don't choose ONLY on CSR. A plan with good features + 98% CSR beats a plan with 99.5% CSR but bad coverage terms.</em>`,
      quickReplies: ['Best health insurers','LIC vs private','Compare insurance plans','Speak to Sachin']
    },

    /* ─── INCOME TAX RETURN & INSURANCE ─────────────── */
    {
      id: 'itr_insurance',
      weight: 2,
      patterns: ['itr','income tax return','file itr','tax filing insurance','insurance in itr','show insurance in itr','80c in itr','80d in itr','tax return insurance deduction','form 16 insurance'],
      response: () => `${greet()}<strong>📑 Insurance & Your Income Tax Return (ITR)</strong><br><br>Filing ITR? Here's how to claim your insurance-related tax deductions correctly:<br><br><strong>Where to enter in ITR:</strong><br>• ITR-1 or ITR-2 (for salaried) → Schedule VI-A (Deductions)<br>• Section 80C: Life insurance premium paid<br>• Section 80D: Health insurance premium paid<br>• Section 80CCD(1B): NPS contributions<br><br><strong>What to keep as proof:</strong><br>• Life insurance: Premium receipt for the financial year<br>• Health insurance: Premium receipt<br>• Many insurers send 80C/80D certificates in March-April<br><br><strong>Form 16 vs actual deduction:</strong><br>• Your employer includes 80C/80D in Form 16 only if you declared it in investment declaration<br>• If you missed declaring → claim it yourself in ITR!<br>• ITR deadline: Usually July 31 (check current year)<br><br><strong>Maturity proceeds in ITR:</strong><br>• Life insurance maturity (10(10D) exempt): Don't include in income<br>• But: Some ULIPs (premium >10% of sum insured) → maturity taxable<br><br>💡 <em>Always keep all premium receipts safely. Sachin provides premium certificates for all policies purchased through PolicyRaj.</em>`,
      quickReplies: ['Tax saving guide','Section 80C explained','Section 80D explained','Speak to Sachin']
    },

    /* ─── LONG TERM CAPITAL GAINS ─────────────────────── */
    {
      id: 'ltcg',
      weight: 2,
      patterns: ['ltcg','long term capital gains','capital gains tax','elss tax','mutual fund tax','10 percent ltcg','equity tax','shares tax','stock tax','capital gains insurance','capital gains elss'],
      response: () => `${greet()}<strong>📊 Long Term Capital Gains (LTCG) Tax — Insurance & Investments</strong><br><br><strong>What is LTCG?</strong><br>Tax on profits from selling investments held for more than 1 year (equity). As of Budget 2024:<br><br><strong>Equity LTCG (ELSS, Stocks, Equity Mutual Funds):</strong><br>• Gains up to ₹1,25,000/year → <strong>ZERO tax</strong><br>• Gains above ₹1,25,000 → <strong>12.5% tax</strong> (no indexation)<br>• Holding period: 1 year+<br><br><strong>Debt Funds / Fixed Income LTCG (from April 2023):</strong><br>• Taxed as per your income tax slab (same as FD now)<br>• The previous 20% with indexation benefit was removed<br><br><strong>Insurance Maturity — Tax Free! 🎉</strong><br>• Life insurance maturity (under 10(10D)) → <strong>completely tax-free</strong><br>• ULIP maturity (if annual premium ≤ ₹2.5L) → tax-free<br>• NPS lump sum 60% at retirement → <strong>completely tax-free</strong><br><br>💡 <em>This is why insurance-linked investments have a tax advantage — the maturity is tax-exempt unlike pure market investments. But don't buy insurance just for tax; get actual protection!</em>`,
      quickReplies: ['ELSS tax saving','NPS tax benefit','ULIP tax','Tax planning complete guide']
    },

    /* ─── HRA EXEMPTION ────────────────────────────────── */
    {
      id: 'hra',
      weight: 2,
      patterns: ['hra','house rent allowance','hra exemption','rent paid deduction','rent tax exemption','section 10 hra','rent receipt tax','hra calculation','rental income tax'],
      response: () => `${greet()}<strong>🏠 HRA Exemption — Save Tax on Your Rent!</strong><br><br>If your salary includes HRA (House Rent Allowance) and you pay rent, you can save significant tax!<br><br><strong>HRA Exemption = Minimum of:</strong><br>1. Actual HRA received from employer<br>2. Rent paid − 10% of basic salary<br>3. 50% of basic salary (metro cities) OR 40% (non-metro)<br><br><strong>Example (Delhi, metro):</strong><br>• Basic: ₹60,000/month<br>• HRA received: ₹24,000/month<br>• Rent paid: ₹22,000/month<br><br>Calculation:<br>1. HRA received: ₹24,000<br>2. Rent − 10% basic = ₹22,000 − ₹6,000 = ₹16,000<br>3. 50% of basic = ₹30,000<br>Minimum = <strong>₹16,000/month → ₹1,92,000/year tax-free!</strong><br><br><strong>Important:</strong><br>• Rent receipts required (and landlord PAN if rent > ₹1L/year)<br>• <strong>HRA benefit is ONLY in old tax regime</strong><br>• If you own a house in same city → cannot claim HRA<br><br>💡 <em>HRA + 80C (₹1.5L) + 80D (₹75K) together → substantial tax saving in old regime.</em>`,
      quickReplies: ['New vs old tax regime','Tax saving guide','Home loan tax benefits','Speak to Sachin']
    },


    /* ─── LIFE INSURANCE EXTRAS ─────────────────────── */
    {
      id: 'joint_life',
      weight: 2,
      patterns: ['joint life insurance','joint term plan','husband wife insurance','couple insurance','joint policy','both spouse insurance','joint life policy'],
      response: () => `${greet()}<strong>👫 Joint Life Insurance — One Policy for Both Spouses!</strong><br><br>A Joint Life Term Plan covers both husband and wife under a single policy.<br><br><strong>How it works:</strong><br>• One premium covers both lives<br>• On first death → full sum assured paid to survivor<br>• Policy continues/ends depending on plan type<br><br><strong>Types:</strong><br>📌 <strong>First Death Benefit:</strong> Pays out on first death, policy ends<br>📌 <strong>First + Second Death:</strong> Pays on first death AND again on survivor's death<br><br><strong>Is it better than 2 individual policies?</strong><br>• Joint plan: slightly cheaper, simpler<br>• 2 individual plans: more flexible, better control, recommended<br><br><strong>Sachin's Advice:</strong> If budget is tight, joint plan works. Otherwise, two separate term plans give better protection.<br><br>📱 Call 9013976999 for a joint life quote today!`,
      quickReplies: ['How much life cover?','Riders in term plan','Single premium term','Speak to Sachin']
    },
    {
      id: 'group_term',
      weight: 2,
      patterns: ['group term insurance','employer life insurance','company provides insurance','office insurance','corporate life cover','group life policy','employee term plan'],
      response: () => `${greet()}<strong>🏢 Group Term Insurance — What Your Employer Gives You</strong><br><br>Many companies provide Group Term Life Insurance as an employee benefit. Here's what you must know:<br><br><strong>What it covers:</strong><br>• Life cover (usually 3–5× annual salary)<br>• Accidental death sometimes included<br>• Zero medical underwriting for employees<br><br><strong>Limitations:</strong><br>⚠️ Coverage ENDS when you leave the job<br>⚠️ Coverage may be inadequate for your family's needs<br>⚠️ You can't port it easily<br>⚠️ Premium paid by employer — you have no control<br><br><strong>Golden Rule:</strong><br>👉 <strong>Never rely ONLY on employer insurance.</strong> Always have your own personal term plan.<br><br>Example: If salary is ₹10L and company gives 4× cover = ₹40L. But you need ₹1–1.5 Cr for real protection!<br><br>💡 Buy your own term plan now — it's cheapest when you're young and healthy.`,
      quickReplies: ['How much cover do I need?','Term plan options','TROP plan','Call Sachin']
    },
    {
      id: 'homemaker_ins',
      weight: 2,
      patterns: ['homemaker insurance','housewife insurance','stay at home spouse insurance','non working spouse coverage','housewife life cover','homemaker life insurance','spouse who doesnt work insurance'],
      response: () => `${greet()}<strong>👩‍🍳 Insurance for Homemakers — Often Overlooked, Always Critical!</strong><br><br>Homemakers contribute enormous economic value — childcare, cooking, managing home. If something happens to them, the family bears huge costs!<br><br><strong>What homemakers need:</strong><br>🏥 <strong>Health Insurance:</strong> Individual plan or family floater (MUST HAVE)<br>🚑 <strong>Critical Illness:</strong> Lump sum for cancer, heart attack, stroke<br>💀 <strong>Personal Accident:</strong> Covers accidental death/disability<br>🛡️ <strong>Term Plan:</strong> Most insurers allow cover up to spouse's income level<br><br><strong>Documents typically needed:</strong><br>• Spouse's income proof<br>• Marriage certificate<br>• Age proof & medical if required<br><br>💡 <em>A homemaker's economic replacement value is often ₹30,000–50,000/month. Protect that value!</em><br><br>📱 Sachin can design the right protection plan: <strong>9013976999</strong>`,
      quickReplies: ['Health for family','Personal accident plan','Critical illness','Get a quote']
    },
    {
      id: 'premium_frequency',
      weight: 2,
      patterns: ['monthly premium','annual premium','quarterly insurance','half yearly premium','single premium plan','premium payment mode','monthly vs annual insurance','premium frequency'],
      response: () => `${greet()}<strong>📅 Premium Payment Frequency — Monthly vs Annual vs Single</strong><br><br>You can pay insurance premiums in different frequencies. Here's the comparison:<br><br><table style="width:100%;border-collapse:collapse;font-size:12px"><tr style="background:#f0f4ff"><th style="padding:4px;text-align:left">Mode</th><th>Annual Cost</th><th>Convenience</th></tr><tr><td><strong>Monthly</strong></td><td>~8% more</td><td>✅ Easy on budget</td></tr><tr><td><strong>Quarterly</strong></td><td>~5% more</td><td>✅ Moderate</td></tr><tr><td><strong>Half-Yearly</strong></td><td>~3% more</td><td>✅ Good balance</td></tr><tr><td><strong>Annual</strong></td><td>Cheapest</td><td>⭐ Recommended</td></tr><tr><td><strong>Single Pay</strong></td><td>One-time</td><td>✅ No renewal hassle</td></tr></table><br><strong>💡 Sachin's Tip:</strong> Annual payment saves 5–8% vs monthly. If possible, pay yearly. For tight budgets, monthly is fine — <em>having insurance is more important than payment mode.</em>`,
      quickReplies: ['Term plan quote','What is single premium?','Limited pay plan','Contact Sachin']
    },
    {
      id: 'life_policy_loan',
      weight: 2,
      patterns: ['loan against life insurance','policy loan','borrow against policy','insurance as collateral','loan from lic policy','premium loan','policy surrender vs loan'],
      response: () => `${greet()}<strong>💳 Loan Against Life Insurance Policy</strong><br><br>Did you know you can take a loan against your life insurance policy? Yes — for traditional plans (endowment, whole life, money-back)!<br><br><strong>How it works:</strong><br>• Loan up to 80–90% of Surrender Value<br>• Available after 3 years of premium payment<br>• Interest typically 9–11% per annum<br>• Policy remains active — cover continues<br>• Easy approval — no credit score check<br><br><strong>When to use it:</strong><br>✅ Emergency cash need<br>✅ Short-term bridge financing<br>✅ Better than surrendering the policy<br><br><strong>Note:</strong> Term plans & ULIPs don't offer loans. Only traditional plans with maturity value.<br><br>💡 <em>Loan is better than surrendering — you keep your coverage AND get cash!</em><br><br>📱 Ask Sachin which of your policies qualifies: <strong>9013976999</strong>`,
      quickReplies: ['What is surrender value?','Endowment plan','Whole life plan','Call Sachin']
    },
    {
      id: 'maturity_options',
      weight: 2,
      patterns: ['life insurance maturity','policy maturity benefit','maturity claim','what happens at end of policy','endowment maturity','money back maturity','policy matures'],
      response: () => `${greet()}<strong>🎯 Life Insurance Maturity — What Happens When Your Policy Ends?</strong><br><br>When a life insurance policy completes its term, it matures and pays the Maturity Benefit.<br><br><strong>What you receive on maturity:</strong><br>• <strong>Sum Assured</strong> (the face value)<br>• <strong>Bonuses</strong> (for with-profit plans — LIC especially)<br>• <strong>Final Addition Bonus</strong> (if applicable)<br><br><strong>Tax on Maturity:</strong><br>✅ Fully Tax-Free under Section 10(10D) — IF annual premium ≤ 10% of sum assured<br>⚠️ Taxable if premium exceeded 10% of sum assured (post-2012 policies)<br><br><strong>What to do with maturity amount:</strong><br>1. Reinvest in a new plan (if still need cover)<br>2. Put in MF/NPS for retirement<br>3. Use for child's education<br><br>💡 Always get your maturity claim processed well before policy end date.`,
      quickReplies: ['Tax on maturity','Endowment vs term','What is ULIP?','Speak to Sachin']
    },
    {
      id: 'life_senior_ins',
      weight: 2,
      patterns: ['life insurance for senior','insurance after 60','old age life cover','senior citizen term plan','life cover at 65','insurance for retired person','life policy for parents'],
      response: () => `${greet()}<strong>👴 Life Insurance for Seniors — What's Possible After 60?</strong><br><br>Getting life cover after 60 is harder and costlier, but options exist!<br><br><strong>Available options:</strong><br>📌 <strong>Term Plans (60–65 max entry):</strong> Some insurers allow entry till 65. Premiums very high.<br>📌 <strong>Whole Life Plans:</strong> Cover till 99/100 years. Suitable for estate planning.<br>📌 <strong>Senior Citizen Health Insurance:</strong> More important than life cover at this age.<br>📌 <strong>Pradhan Mantri Vaya Vandana Yojana (PMVVY):</strong> Pension scheme for 60+ — ₹15L max.<br><br><strong>Sachin's honest advice:</strong><br>If you're 60+ and asking about life insurance — focus more on:<br>✅ <strong>Health Insurance</strong> (critical at this age)<br>✅ <strong>Critical Illness Cover</strong><br>✅ <strong>Pension/Annuity</strong> for regular income<br><br>📱 Let Sachin assess your needs: <strong>9013976999</strong>`,
      quickReplies: ['Senior health insurance','Annuity plans','Govt schemes for seniors','Call Sachin']
    },

    /* ─── MOTOR INSURANCE EXTRAS ─────────────────────── */
    {
      id: 'bike_insurance',
      weight: 2,
      patterns: ['two wheeler insurance','bike insurance','motorcycle insurance','scooter insurance','two wheeler policy','bike cover','motorbike insurance'],
      response: () => `${greet()}<strong>🏍️ Two-Wheeler Insurance — Complete Guide</strong><br><br>In India, <strong>third-party bike insurance is mandatory by law</strong>. Here's everything you need to know:<br><br><strong>Types:</strong><br>📌 <strong>Third-Party Only:</strong> Legally required. Covers damage to others. (Cheapest)<br>📌 <strong>Comprehensive:</strong> Own damage + Third party. (Recommended)<br>📌 <strong>Own Damage Add-On:</strong> Can buy separately if you have TP already<br><br><strong>Key Add-ons for bikes:</strong><br>• Zero Depreciation (strongly recommended)<br>• Engine Protection<br>• Roadside Assistance<br>• Personal Accident for owner-driver<br><br><strong>Premium factors:</strong><br>• CC of bike (higher CC = higher premium)<br>• City of registration<br>• Age of bike<br>• NCB (up to 50% discount!)<br><br>💡 <em>Always opt for comprehensive + zero dep for bikes — repair costs are high!</em><br><br>📱 Get your bike insured: <strong>9013976999</strong>`,
      quickReplies: ['Zero depreciation add-on','What is NCB?','IDV for bike','Get bike insurance quote']
    },
    {
      id: 'vehicle_transfer',
      weight: 2,
      patterns: ['transfer car insurance','insurance transfer vehicle','buy second hand car insurance','used car insurance transfer','vehicle ownership transfer insurance','rc transfer insurance'],
      response: () => `${greet()}<strong>🚗 Insurance Transfer When Buying a Used Car</strong><br><br>When you buy a second-hand car, the insurance MUST be transferred to your name. Here's how:<br><br><strong>Steps to transfer motor insurance:</strong><br>1. Get RC (Registration Certificate) transferred first at RTO<br>2. Inform the insurance company within <strong>14 days of purchase</strong><br>3. Submit: Sale deed, Form 29/30, New RC copy, your KYC<br>4. Pay transfer fee (~₹50–200)<br><br><strong>What happens to NCB?</strong><br>• NCB belongs to the seller, NOT the car<br>• Seller can get an NCB Transfer Certificate and use on their next car<br>• As buyer, you start with 0% NCB — but you build it fresh<br><br><strong>⚠️ Risk if you don't transfer:</strong><br>Any claim made before transfer is invalid — you'll pay from pocket!<br><br>💡 Always insist seller gives you a clean transfer within the deadline.`,
      quickReplies: ['What is NCB?','Zero dep motor','Renew motor insurance','Call Sachin']
    },
    {
      id: 'engine_protect',
      weight: 2,
      patterns: ['engine protection insurance','engine cover motor','waterlogging engine damage','hydrostatic lock engine','engine add on','engine gear protect','engine damage flood','hydrostatic lock','hydrostatic'],
      response: () => `${greet()}<strong>⚙️ Engine Protection Cover — Must-Have Add-On!</strong><br><br>Standard comprehensive motor insurance does NOT cover engine damage due to waterlogging or hydrostatic lock. Engine Protection Add-On fills this gap!<br><br><strong>What it covers:</strong><br>✅ Engine damage due to water ingression/flooding<br>✅ Hydrostatic lock (engine seized after driving in water)<br>✅ Gear box & differential damage<br>✅ Lubricant oil contamination<br><br><strong>What it does NOT cover:</strong><br>❌ Regular wear and tear<br>❌ Damage due to own negligence<br>❌ Mechanical/electrical breakdown<br><br><strong>Why it matters:</strong><br>Engine repairs cost ₹50,000–₹3,00,000+. Engine protection add-on costs just ₹500–₹2,000/year.<br><br>💡 <strong>Essential if you live in flood-prone cities</strong> like Mumbai, Chennai, Kolkata, Bangalore!<br><br>📱 Add it to your motor policy: <strong>9013976999</strong>`,
      quickReplies: ['Zero depreciation','Roadside assistance','Comprehensive motor','Get motor quote']
    },
    {
      id: 'roadside_assist',
      weight: 2,
      patterns: ['roadside assistance','breakdown assistance','towing insurance','flat tyre help','car stuck road','vehicle breakdown help','rsa motor insurance','emergency towing'],
      response: () => `${greet()}<strong>🛣️ Roadside Assistance (RSA) — Never Get Stranded Again!</strong><br><br>Roadside Assistance is a motor insurance add-on that helps when your vehicle breaks down anywhere.<br><br><strong>Services included:</strong><br>✅ Emergency towing to nearest garage<br>✅ Flat tyre change<br>✅ Fuel delivery if you run out<br>✅ Battery jump start<br>✅ Minor on-spot repairs<br>✅ Key lockout assistance<br>✅ Arrangement of cab (in some plans)<br><br><strong>Cost:</strong><br>• RSA add-on: ₹200–₹800/year<br>• Available 24x7, pan-India for most insurers<br><br><strong>How to use:</strong><br>Call your insurer's helpline → they dispatch assistance → service is cashless<br><br>💡 <em>Worth every rupee — one tow alone can cost ₹2,000–₹5,000!</em><br><br>📱 Add RSA to your motor policy today: <strong>9013976999</strong>`,
      quickReplies: ['Engine protection','Comprehensive car insurance','Zero dep','Motor add-ons']
    },
    {
      id: 'consumables_add',
      weight: 2,
      patterns: ['consumables cover','oil change insurance','nuts bolts insurance','filter coolant insurance','consumables add on motor','consumables motor insurance'],
      response: () => `${greet()}<strong>🔧 Consumables Cover — The Hidden Motor Add-On!</strong><br><br>During a car repair/claim, the workshop replaces many consumable items. Standard policies DON'T pay for these. Consumables Cover does!<br><br><strong>What's covered:</strong><br>✅ Engine oil, brake fluid, coolant<br>✅ Nuts, bolts, screws, clips<br>✅ Filters (oil, air, fuel)<br>✅ Washers, gaskets<br>✅ Greases and lubricants<br><br><strong>Why it matters:</strong><br>On a typical claim, consumables cost ₹2,000–₹8,000. Without this add-on, you pay from pocket.<br><br><strong>Cost:</strong> ₹300–₹600/year<br><br>💡 <em>Best combined with Zero Depreciation for maximum protection in claims!</em><br><br>📱 Bundle all add-ons wisely: <strong>9013976999</strong>`,
      quickReplies: ['Zero depreciation','Return to invoice','Engine protection','Motor quote']
    },
    {
      id: 'motor_theft_cl',
      weight: 2,
      patterns: ['car theft claim','bike stolen claim','vehicle theft insurance','stolen car insurance claim','my car was stolen','vehicle theft process','how to claim stolen vehicle'],
      response: () => `${greet()}<strong>🚨 Vehicle Theft — How to File a Motor Insurance Claim</strong><br><br>If your car or bike is stolen, here's exactly what to do:<br><br><strong>Step 1 — Immediate (within 24 hours):</strong><br>• File FIR at nearest police station<br>• Inform your insurance company<br><br><strong>Step 2 — Documents to submit:</strong><br>📄 Copy of FIR<br>📄 Original RC (Registration Certificate)<br>📄 All keys (both sets)<br>📄 Insurance policy copy<br>📄 Transfer papers if second-hand car<br>📄 PAN Card & NEFT details<br><br><strong>Step 3 — Waiting period:</strong><br>• Police investigations (usually 90 days)<br>• If not recovered → insurance pays IDV (Insured Declared Value)<br><br><strong>Payout:</strong> You receive the IDV of your vehicle at time of theft<br><br>⚠️ <strong>Don't delay FIR or insurer intimation — both are mandatory!</strong><br><br>📱 Need help with a theft claim? Call Sachin: <strong>9013976999</strong>`,
      quickReplies: ['What is IDV?','Zero dep add-on','New car insurance','Contact Sachin']
    },
    {
      id: 'motor_renew_tip',
      weight: 2,
      patterns: ['motor insurance renewal tips','renew car insurance','car insurance renewal','dont lose ncb renewal','motor policy expiry','how to renew motor insurance','lapse motor policy renewal'],
      response: () => `${greet()}<strong>🔄 Motor Insurance Renewal — Do It Right!</strong><br><br>Renewing motor insurance smartly can save you thousands. Here's how:<br><br><strong>Before renewing, check:</strong><br>✅ <strong>IDV (Insured Declared Value)</strong> — Don't let insurer underprice your car<br>✅ <strong>NCB (No Claim Bonus)</strong> — Verify your discount is correctly applied<br>✅ <strong>Add-ons</strong> — Do you need Zero Dep, Engine Protect, RSA?<br>✅ <strong>Compare premiums</strong> — Switch if you find better rate (NCB transfers!)<br><br><strong>Key deadlines:</strong><br>• Renew BEFORE expiry for continuity (no break in cover)<br>• 30-day grace period for own-damage (TP has no grace period — TP expires instantly!)<br>• Lapsed over 90 days → fresh inspection required before renewal<br><br><strong>Don't just auto-renew!</strong><br>Many people renew with same insurer out of habit. A quick comparison saves ₹2,000–₹5,000.<br><br>📱 Let Sachin compare and renew: <strong>9013976999</strong>`,
      quickReplies: ['What is NCB?','What is IDV?','Compare insurers','Call for renewal']
    },
    {
      id: 'third_party_motor_cl',
      weight: 2,
      patterns: ['third party claim','tp motor claim','accident injured person claim','damage to another car','third party liability motor','someone hit my car claim','i hit someone car'],
      response: () => `${greet()}<strong>⚖️ Third-Party Motor Claims — When Someone Else is Involved</strong><br><br>Third-party (TP) motor insurance covers damage/injury you cause to OTHER people or property.<br><br><strong>Two scenarios:</strong><br><br>🔵 <strong>You caused the accident (at-fault):</strong><br>• Your TP insurance pays for damage to other party<br>• File claim with your insurer<br>• Injured person/claimant goes to Motor Accident Claims Tribunal (MACT)<br><br>🔴 <strong>Someone else hit you (not at fault):</strong><br>• Claim against at-fault driver's TP insurance<br>• File FIR, get motor accident report<br>• You can file at MACT for compensation<br><br><strong>TP Claim doesn't affect YOUR NCB</strong> ✅<br><br><strong>TP Insurance limits:</strong><br>• Property damage: ₹7.5 lakh<br>• Personal injury/death: Unlimited (court decided)<br><br>⚠️ Always have your own Comprehensive insurance — TP alone doesn't protect YOUR vehicle!`,
      quickReplies: ['Comprehensive motor','What is NCB?','Motor claim process','Call Sachin']
    },
    {
      id: 'commercial_veh',
      weight: 2,
      patterns: ['commercial vehicle insurance','truck insurance','bus insurance','goods carrier insurance','auto rickshaw insurance','taxi insurance','cab insurance','lorry insurance','fleet insurance'],
      response: () => `${greet()}<strong>🚛 Commercial Vehicle Insurance — For Business Vehicles</strong><br><br>If you own vehicles used for business (trucks, buses, taxis, autos, goods vehicles), you need Commercial Vehicle Insurance — not standard private car insurance.<br><br><strong>Types of commercial vehicles covered:</strong><br>🚛 Goods Carrying Vehicles (trucks, tempos, lorries)<br>🚌 Passenger Carrying Vehicles (buses, taxis, cabs)<br>🛺 Three-wheelers (auto rickshaws)<br>🚜 Agricultural/Special vehicles<br><br><strong>Mandatory covers:</strong><br>• Third Party Liability (by law)<br>• Personal Accident for owner-driver<br><br><strong>Optional add-ons:</strong><br>• Comprehensive own damage<br>• IMT 23 (for goods-in-transit)<br>• Passenger liability<br>• Fleet discounts (for 5+ vehicles)<br><br>💡 <em>Using a private vehicle for commercial purposes without commercial insurance → claim can be rejected!</em><br><br>📱 Get a fleet or commercial vehicle quote: <strong>9013976999</strong>`,
      quickReplies: ['Marine cargo insurance','Business insurance','Liability insurance','Call Sachin']
    },



    /* ─── TRAVEL & HOME EXTRAS ──────────────────────── */
    {
      id: 'schengen_ins',
      weight: 2,
      patterns: ['schengen visa insurance','europe travel insurance','schengen travel policy','europe trip insurance','schengen medical insurance','visa insurance europe'],
      response: () => `${greet()}<strong>🇪🇺 Schengen Travel Insurance — Mandatory for Europe Visa!</strong><br><br>If you're applying for a Schengen visa (26 European countries), travel insurance with minimum <strong>€30,000 (≈₹27 lakh) medical coverage</strong> is mandatory.<br><br><strong>What your Schengen policy must cover:</strong><br>✅ Medical emergency expenses (min €30,000)<br>✅ Medical evacuation & repatriation<br>✅ Cover for entire Schengen area<br>✅ Valid for full duration of stay<br><br><strong>Popular options:</strong><br>• HDFC ERGO Travel Insurance<br>• Bajaj Allianz Travel Insurance<br>• Care Travel Insurance<br><br><strong>Cost:</strong> ~₹500–₹1,500 for 10–15 day Europe trip<br><br><strong>Pro tips:</strong><br>💡 Buy from Indian insurer — it's cheaper & equally accepted<br>💡 Policy must start from day of travel, not visa date<br>💡 Keep soft copy on phone during travel<br><br>📱 Get your Schengen policy instantly: <strong>9013976999</strong>`,
      quickReplies: ['Annual travel plan','Travel insurance basics','Trip cancellation cover','Get travel quote']
    },
    {
      id: 'annual_travel_ins',
      weight: 2,
      patterns: ['annual travel insurance','multi trip insurance','frequent traveler insurance','annual multi trip','yearly travel policy','frequent flyer insurance','multiple trips insurance'],
      response: () => `${greet()}<strong>✈️ Annual Multi-Trip Travel Insurance — Best for Frequent Travelers!</strong><br><br>If you travel abroad more than 2–3 times a year, an Annual Multi-Trip policy saves money and hassle!<br><br><strong>How it works:</strong><br>• One premium covers ALL international trips in 12 months<br>• Each trip covered up to 30/45/60 days (varies by plan)<br>• No need to buy fresh policy each time<br><br><strong>What's covered:</strong><br>✅ Medical emergencies (same as single-trip)<br>✅ Trip cancellation/delay<br>✅ Lost baggage<br>✅ Emergency evacuation<br><br><strong>Cost comparison:</strong><br>• Single trip (10 days): ~₹800<br>• Annual multi-trip: ~₹5,000–₹8,000<br>• Break-even: Just 3–4 trips per year!<br><br>💡 <em>Business travelers and frequent vacationers — annual plan is a no-brainer!</em><br><br>📱 Compare annual travel plans: <strong>9013976999</strong>`,
      quickReplies: ['Schengen insurance','Travel basics','What does travel cover?','Get a quote']
    },
    {
      id: 'senior_travel_ins',
      weight: 2,
      patterns: ['senior citizen travel insurance','travel insurance for elderly','parents travel insurance','old age travel insurance','travel policy for 65','international travel senior'],
      response: () => `${greet()}<strong>✈️ Senior Citizen Travel Insurance — Safe Travels After 60!</strong><br><br>Senior citizens (60+) absolutely need travel insurance when traveling abroad. Medical costs abroad can be devastating!<br><br><strong>Key things to know:</strong><br>⚠️ Pre-existing diseases may be excluded OR covered with waiting period<br>⚠️ Some insurers cap age at 70 or 80<br>⚠️ Premiums are significantly higher for seniors<br><br><strong>Look for plans that cover:</strong><br>✅ Pre-existing disease stabilization (emergency treatment)<br>✅ Medical evacuation & repatriation<br>✅ Hospitalization abroad (min $1,00,000)<br>✅ 24x7 emergency assistance helpline<br><br><strong>Best insurers for seniors:</strong><br>• Bajaj Allianz Senior Travel Plan<br>• HDFC ERGO Optima Travel<br>• Tata AIG Travel Guard Senior<br><br>💡 Declare ALL pre-existing conditions honestly — hiding leads to claim rejection!<br><br>📱 Sachin can find the best senior travel plan: <strong>9013976999</strong>`,
      quickReplies: ['Parents traveling abroad','Travel insurance basics','Senior health insurance','Call Sachin']
    },
    {
      id: 'student_travel_ins',
      weight: 2,
      patterns: ['student travel insurance','study abroad insurance','foreign education insurance','university insurance abroad','student visa insurance','overseas student insurance'],
      response: () => `${greet()}<strong>🎓 Student Travel Insurance — For Education Abroad</strong><br><br>If your child is going abroad for higher studies, a comprehensive Student Travel Insurance is essential!<br><br><strong>What it covers (beyond standard travel):</strong><br>✅ Medical expenses abroad<br>✅ Study interruption (due to illness/accident)<br>✅ Sponsor protection (if earning parent dies/disabled)<br>✅ Personal liability<br>✅ Loss of passport/baggage<br>✅ Mental health & counseling (some plans)<br><br><strong>Duration:</strong> Plans available for 1–4 years (full study period)<br><br><strong>Premium:</strong> ₹15,000–₹40,000/year depending on country & coverage<br><br><strong>Countries with mandatory insurance:</strong><br>🇺🇸 USA, 🇨🇦 Canada, 🇦🇺 Australia — university insurance often required<br><br>💡 <em>Many universities require proof of insurance before enrollment. Don't wait!</em><br><br>📱 Get student abroad insurance: <strong>9013976999</strong>`,
      quickReplies: ['Annual travel plan','NRI insurance','Child plans','Contact Sachin']
    },
    {
      id: 'adventure_travel_ins',
      weight: 2,
      patterns: ['adventure sports insurance','trekking insurance','skiing insurance','skydiving insurance','scuba diving insurance','extreme sports travel','adventure activity insurance'],
      response: () => `${greet()}<strong>🏔️ Adventure Sports Travel Insurance — For the Thrill-Seekers!</strong><br><br>Standard travel insurance EXCLUDES adventure sports. If you're trekking, skiing, scuba diving, or doing extreme activities — you need a special add-on or specialized policy!<br><br><strong>Standard exclusions (without adventure add-on):</strong><br>❌ Trekking above 3,500m<br>❌ Skiing & snowboarding<br>❌ Scuba diving<br>❌ Skydiving & paragliding<br>❌ Bungee jumping<br><br><strong>With Adventure Sports Add-On:</strong><br>✅ Evacuation from remote/mountain areas<br>✅ Medical treatment for sports injuries<br>✅ Equipment loss/damage (some plans)<br><br><strong>Popular trekking destinations:</strong><br>🏔️ Himalayan treks, Nepal, Ladakh → Many tour operators require this coverage<br><br>💡 <em>Mountain helicopter evacuation alone costs ₹2–5 lakhs. Don't take the risk!</em><br><br>📱 Get adventure travel insurance: <strong>9013976999</strong>`,
      quickReplies: ['Standard travel insurance','Personal accident','Travel basics','Call Sachin']
    },
    {
      id: 'jewellery_ins',
      weight: 2,
      patterns: ['jewellery insurance','gold insurance','ornament insurance','valuable insurance','diamond insurance','jewelry cover','insure gold jewellery'],
      response: () => `${greet()}<strong>💎 Jewellery & Valuables Insurance — Protect Your Gold!</strong><br><br>Indian families hold enormous wealth in gold and jewellery. You can (and should) insure it!<br><br><strong>What jewellery insurance covers:</strong><br>✅ Theft/burglary<br>✅ Loss during travel<br>✅ Accidental damage/breakage<br>✅ Fire damage<br><br><strong>How to insure jewellery:</strong><br>• As part of Home Insurance (household valuables section)<br>• Standalone All-Risk Policy for high-value pieces<br>• Bank locker-stored jewellery: sometimes covered by bank<br><br><strong>Documents needed:</strong><br>📄 Purchase receipts / valuation certificate<br>📄 Photographs of jewellery<br>📄 List with weights and descriptions<br><br><strong>Premium:</strong> ~₹500–₹2,000/year per ₹10 lakh of jewellery value<br><br>💡 <em>If you have jewellery worth ₹10L+, insurance is a must — especially if kept at home!</em><br><br>📱 Insure your valuables today: <strong>9013976999</strong>`,
      quickReplies: ['Home insurance','Burglary insurance','Personal accident','Get a quote']
    },
    {
      id: 'tenant_ins',
      weight: 2,
      patterns: ['tenant insurance','renter insurance','rental flat insurance','insurance for rented house','flat tenant protection','renter belongings insurance','insurance for tenant'],
      response: () => `${greet()}<strong>🏠 Tenant/Renter Insurance — Protect Yourself Even in a Rented Home!</strong><br><br>If you live in a rented flat, the landlord's insurance covers the building — NOT your belongings. You need your own cover!<br><br><strong>Tenant Insurance covers:</strong><br>✅ Personal belongings (electronics, furniture, clothing)<br>✅ Theft/burglary<br>✅ Fire & water damage to your stuff<br>✅ Personal liability (if guest gets injured in your home)<br>✅ Temporary accommodation costs if home becomes uninhabitable<br><br><strong>Does NOT cover:</strong><br>❌ The building/structure (that's landlord's responsibility)<br>❌ Normal wear and tear<br><br><strong>Cost:</strong> ₹2,000–₹5,000/year for ₹5–10L of coverage<br><br>💡 <em>Most tenants don't know this exists! A laptop + TV + phone alone worth ₹1–2L — worth protecting.</em><br><br>📱 Get renter's insurance advice: <strong>9013976999</strong>`,
      quickReplies: ['Home insurance','Contents cover','Fire insurance','Call Sachin']
    },
    {
      id: 'home_contents',
      weight: 2,
      patterns: ['home contents insurance','household items insurance','furniture insurance','electronics insurance at home','belongings insurance','contents cover home','appliance insurance'],
      response: () => `${greet()}<strong>🛋️ Home Contents Insurance — Protect Everything Inside Your Home!</strong><br><br>Home insurance has two parts: Structure (building) and Contents (everything inside). Most people forget the Contents part!<br><br><strong>What contents insurance covers:</strong><br>✅ Furniture & fixtures<br>✅ Electronics (TV, laptop, refrigerator, AC)<br>✅ Clothing & personal effects<br>✅ Kitchen appliances<br>✅ Jewellery (up to a limit)<br>✅ Sports equipment<br><br><strong>Covered events:</strong><br>🔥 Fire & explosion<br>💧 Water damage (burst pipes, floods)<br>⚡ Lightning & electrical damage<br>🏠 Burglary & theft<br><br><strong>How to value contents:</strong><br>Make an inventory! Total your: electronics + furniture + appliances + jewellery + clothing<br>Most urban homes: ₹5–15 lakh in contents value<br><br>💡 <em>Premium is just ₹1,500–₹4,000/year. One claim pays for decades of premium!</em><br><br>📱 Get contents covered: <strong>9013976999</strong>`,
      quickReplies: ['Home structure insurance','Tenant insurance','Jewellery cover','Get home quote']
    },
    {
      id: 'fire_ins_standalone',
      weight: 2,
      patterns: ['fire insurance','fire policy','building fire cover','fire damage insurance','shop fire insurance','property fire insurance','standalone fire policy'],
      response: () => `${greet()}<strong>🔥 Fire Insurance — Standalone Property Protection</strong><br><br>Fire Insurance (also called Standard Fire & Special Perils Policy) is one of the oldest and most important property covers.<br><br><strong>What it covers:</strong><br>✅ Fire & lightning<br>✅ Explosion & implosion<br>✅ Aircraft damage<br>✅ Riot, strike & civil commotion<br>✅ Storm, cyclone, typhoon, floods<br>✅ Earthquake (if opted)<br>✅ Bursting of pipes/tanks<br><br><strong>What it does NOT cover:</strong><br>❌ Wear and tear<br>❌ Electrical short-circuit (standalone)<br>❌ War & nuclear perils<br><br><strong>Who needs it:</strong><br>🏠 Homeowners<br>🏭 Factory owners<br>🏪 Shop owners<br>🏢 Offices & commercial premises<br><br><strong>Premium:</strong> Very affordable — ~0.05%–0.1% of property value annually<br><br>📱 Get property protected: <strong>9013976999</strong>`,
      quickReplies: ['Home insurance','Shop insurance','Business insurance','Call Sachin']
    },
    {
      id: 'home_valuation',
      weight: 2,
      patterns: ['home insurance valuation','how much home insurance','house cover amount','property insurance value','building sum insured','how to decide home cover'],
      response: () => `${greet()}<strong>🏡 How Much Home Insurance Cover Do I Need?</strong><br><br>The biggest mistake in home insurance is being under-insured. Here's how to calculate the right cover:<br><br><strong>For the STRUCTURE (building):</strong><br>• Insure the RECONSTRUCTION cost — NOT the market value<br>• Market value includes land, which can't be destroyed<br>• Formula: Carpet area × Construction cost per sq ft<br>• Construction cost: ₹1,500–₹3,000/sq ft depending on city & quality<br>• Example: 1,000 sq ft × ₹2,000 = ₹20 lakh structure cover<br><br><strong>For CONTENTS:</strong><br>• List all furniture, electronics, appliances, jewellery<br>• Add up replacement cost at today's prices<br>• Most urban homes: ₹5–15 lakh<br><br><strong>Total recommended cover:</strong><br>• 3BHK flat in a metro: Structure ₹30–50L + Contents ₹8–15L<br><br>💡 <em>Over-insuring costs slightly more but under-insuring hurts badly at claim time due to proportionate deduction!</em>`,
      quickReplies: ['Home structure insurance','Contents cover','Fire insurance','Get home insurance quote']
    },
    {
      id: 'home_renovation_ins',
      weight: 2,
      patterns: ['home renovation insurance','house construction insurance','renovation cover','under construction insurance','renovation accident insurance','builder risk insurance home'],
      response: () => `${greet()}<strong>🏗️ Home Renovation Insurance — Protect Your Project!</strong><br><br>Renovating your home? The regular home insurance may not cover the work in progress. Here's what to know:<br><br><strong>Risks during renovation:</strong><br>• Worker accidents (you as owner could be liable!)<br>• Theft of materials from site<br>• Damage to neighbouring property<br>• Fire during construction/welding work<br><br><strong>Options available:</strong><br>📌 <strong>Contractor's All Risk (CAR) Policy:</strong> For large renovations/construction<br>📌 <strong>Workmen's Compensation:</strong> If you hire workers — mandatory in some cases<br>📌 <strong>Notification to home insurer:</strong> Always inform them when major work starts<br><br><strong>Important:</strong><br>⚠️ Many home policies have exclusions for vacant homes or homes under major renovation<br>⚠️ If a worker is injured at your site, you can be held liable under Workmen's Compensation Act<br><br>📱 Protect your renovation project: <strong>9013976999</strong>`,
      quickReplies: ['Home insurance','Business insurance','Liability cover','Call Sachin']
    },
    {
      id: 'pet_insurance',
      weight: 2,
      patterns: ['pet insurance','dog insurance','cat insurance','animal insurance','pet health insurance','veterinary insurance','pet medical cover'],
      response: () => `${greet()}<strong>🐾 Pet Insurance — Because They're Family Too!</strong><br><br>Pet insurance is growing in India as vet costs rise significantly. Here's what's available:<br><br><strong>What pet insurance covers:</strong><br>✅ Veterinary treatment (accidents & illness)<br>✅ Surgery costs<br>✅ Vaccination expenses (some plans)<br>✅ Death due to accident<br>✅ Third-party liability (if your pet injures someone)<br><br><strong>Common exclusions:</strong><br>❌ Pre-existing conditions<br>❌ Cosmetic procedures<br>❌ Breeding/whelping costs<br><br><strong>Available for:</strong><br>🐕 Dogs (most popular) & 🐈 Cats<br>Some insurers also cover cattle, horses<br><br><strong>Premium:</strong> ₹3,000–₹15,000/year depending on breed and coverage<br><br><strong>Insurers offering pet cover:</strong><br>• Bajaj Allianz, New India, Oriental, United India<br><br>💡 <em>One surgery can cost ₹20,000–₹1,00,000 — pet insurance pays for itself fast!</em><br><br>📱 Explore pet insurance options: <strong>9013976999</strong>`,
      quickReplies: ['Home insurance','Personal accident','Health insurance','Get a quote']
    },
    {
      id: 'gadget_insurance',
      weight: 2,
      patterns: ['gadget insurance','mobile phone insurance','laptop insurance','smartphone insurance','device insurance','electronics insurance','screen break insurance','phone damage insurance'],
      response: () => `${greet()}<strong>📱 Gadget Insurance — Protect Your Phone, Laptop & Devices!</strong><br><br>Gadget insurance covers your smartphones, laptops, tablets and other electronic devices against damage, theft, and breakdown.<br><br><strong>What's covered:</strong><br>✅ Accidental damage (cracked screen, water damage)<br>✅ Theft<br>✅ Mechanical/electrical breakdown (after warranty)<br>✅ Screen damage<br>✅ Fire damage<br><br><strong>What's NOT covered:</br><br>❌ Cosmetic damage (scratches without functional impact)<br>❌ Software issues/viruses<br>❌ Pre-existing damage<br><br><strong>Cost:</strong><br>• Phone worth ₹30,000: Premium ~₹1,200–₹2,500/year<br>• Laptop worth ₹60,000: Premium ~₹2,500–₹4,000/year<br><br><strong>Where to buy:</strong><br>• At time of phone purchase (Flipkart, Amazon plans)<br>• Through insurance companies (Bajaj Allianz, TATA AIG)<br><br>💡 <em>If you've ever broken a screen — gadget insurance will pay for itself!</em><br><br>📱 Explore gadget cover: <strong>9013976999</strong>`,
      quickReplies: ['Home contents insurance','Laptop theft cover','Mobile insurance','Call Sachin']
    },
    {
      id: 'art_collectibles',
      weight: 2,
      patterns: ['art insurance','painting insurance','antique insurance','collectibles insurance','fine art insurance','artwork insurance','valuable collection insurance'],
      response: () => `${greet()}<strong>🎨 Art & Collectibles Insurance — Protect Your Valuable Collections!</strong><br><br>If you own fine art, antiques, rare books, stamps, coins, or collectibles — they need specialized insurance beyond standard home policies.<br><br><strong>Standard home insurance limitations:</strong><br>• Usually covers items at "market value" (depreciated)<br>• Low sub-limits for valuables<br>• Art and antiques often excluded<br><br><strong>Art Insurance covers:</strong><br>✅ Accidental damage<br>✅ Theft<br>✅ Fire, water, and transit damage<br>✅ Agreed value (you agree the value upfront — no depreciation!)<br><br><strong>How to get covered:</strong><br>1. Get a professional valuation/appraisal<br>2. Photograph and document each piece<br>3. Buy an All-Risk or Fine Art Floater policy<br><br><strong>Premium:</strong> ~0.5–1.5% of agreed value per year<br><br>📱 Specialized coverage solutions: <strong>9013976999</strong>`,
      quickReplies: ['Jewellery insurance','Home insurance','Valuable items','Call Sachin']
    },

    /* ─── BUSINESS INSURANCE EXTRAS ──────────────────── */
    {
      id: 'shop_policy',
      weight: 2,
      patterns: ['shop insurance','shopkeeper insurance','retail insurance','shop policy','small business insurance','grocery store insurance','shop fire theft insurance','shopskeeper policy','burglary insurance','burglary cover','burglary'],
      response: () => `${greet()}<strong>🏪 Shopkeeper's Package Insurance — One Policy, Full Protection!</strong><br><br>If you own a shop, one comprehensive Shopkeeper's Package Policy covers everything!<br><br><strong>What's typically included:</strong><br>✅ <strong>Building/structure</strong> against fire, flood, earthquake<br>✅ <strong>Stock & inventory</strong> against fire, flood, theft<br>✅ <strong>Money in safe/transit</strong><br>✅ <strong>Neon signs & board</strong><br>✅ <strong>Electronic equipment</strong> (computers, billing machines)<br>✅ <strong>Public liability</strong> (if customer injured in shop)<br>✅ <strong>Plate glass</strong> (shop front glass breakage)<br><br><strong>Premium:</strong> ~₹3,000–₹15,000/year depending on stock value and location<br><br><strong>Who needs it:</strong><br>🛒 Grocery stores, 💊 Pharmacies, 👗 Clothing shops, 📱 Mobile stores, 🍕 Restaurants<br><br>💡 <em>One fire or flood can wipe out years of savings — ₹5,000/year premium vs ₹20 lakh loss!</em><br><br>📱 Get your shop insured today: <strong>9013976999</strong>`,
      quickReplies: ['Business insurance','Fire insurance','Liability cover','Call Sachin']
    },
    {
      id: 'doctors_pi',
      weight: 2,
      patterns: ['doctor professional indemnity','medical professional insurance','malpractice insurance','doctors liability insurance','clinical negligence insurance','hospital liability','medical indemnity'],
      response: () => `${greet()}<strong>🩺 Professional Indemnity for Doctors — Legal Protection!</strong><br><br>Medical malpractice cases are rising in India. Doctors and hospitals need Professional Indemnity (PI) Insurance.<br><br><strong>What it covers:</strong><br>✅ Legal costs if a patient sues you<br>✅ Compensation payments to patients<br>✅ Negligence claims (missed diagnosis, wrong treatment)<br>✅ Defense costs even if not at fault<br><br><strong>Who needs it:</strong><br>👨‍⚕️ Doctors (all specialties)<br>🏥 Hospitals & clinics<br>👩‍⚕️ Nurses, physiotherapists, dentists<br>💊 Pharmacies<br><br><strong>Important:</strong><br>⚠️ MCI (Medical Council) increasingly requires PI coverage<br>⚠️ Without PI, a single lawsuit can cost ₹25 lakhs–₹1 crore+<br><br><strong>Premium:</strong> ₹5,000–₹50,000/year depending on specialty and practice size<br><br>💡 <em>One court case without insurance = career risk. PI insurance = peace of mind.</em><br><br>📱 Medical professionals, call Sachin: <strong>9013976999</strong>`,
      quickReplies: ['Professional indemnity','Business insurance','Liability cover','Get a quote']
    },
    {
      id: 'it_insurance',
      weight: 2,
      patterns: ['it company insurance','software company insurance','tech startup insurance','technology insurance','it firm insurance','software professional indemnity','tech company coverage'],
      response: () => `${greet()}<strong>💻 IT & Technology Company Insurance — Comprehensive Protection!</strong><br><br>IT companies face unique risks. Here's what you need:<br><br><strong>Essential covers for IT firms:</strong><br><br>📌 <strong>Professional Indemnity (E&O):</strong> If your software/code causes client losses<br>📌 <strong>Cyber Insurance:</strong> Data breaches, ransomware, client data theft<br>📌 <strong>D&O Insurance:</strong> Directors & Officers liability<br>📌 <strong>Group Health Insurance:</strong> For your team (talent retention tool)<br>📌 <strong>Workmen's Compensation:</strong> Employee injury/disability<br><br><strong>Why IT specifically needs PI:</strong><br>• Software bugs causing client losses → you're liable<br>• Data loss/breach → huge penalties under IT Act<br>• GDPR violations for companies with EU clients<br><br><strong>Premium:</strong> Depends on revenue, headcount, and contract values<br><br>💡 <em>Most IT client contracts now require proof of PI/Cyber insurance before onboarding!</em><br><br>📱 Get IT company coverage: <strong>9013976999</strong>`,
      quickReplies: ['Cyber insurance','Professional indemnity','D&O insurance','Call Sachin']
    },
    {
      id: 'directors_officers_ins',
      weight: 2,
      patterns: ['directors officers insurance','do insurance','management liability','board member insurance','executive liability insurance','company director insurance'],
      response: () => `${greet()}<strong>👔 Directors & Officers (D&O) Insurance — Protect Your Leadership!</strong><br><br>Company directors and officers can be personally sued for management decisions. D&O Insurance protects them.<br><br><strong>What D&O covers:</strong><br>✅ Claims by shareholders for mismanagement<br>✅ Regulatory investigations (SEBI, RBI, MCA)<br>✅ Employment practices disputes<br>✅ Breach of fiduciary duty allegations<br>✅ Legal defense costs<br><br><strong>Three coverage sections:</strong><br>📌 <strong>Side A:</strong> Covers directors personally when company can't indemnify<br>📌 <strong>Side B:</strong> Reimburses company for indemnifying directors<br>📌 <strong>Side C:</strong> Company's own securities liability<br><br><strong>Who needs D&O:</strong><br>• Listed companies (mandatory)<br>• Startups receiving VC funding (investors often require it)<br>• Large private companies<br>• NGOs and non-profits<br><br>💡 <em>Startup founders — investors increasingly require D&O as a condition of funding!</em><br><br>📱 Set up D&O coverage: <strong>9013976999</strong>`,
      quickReplies: ['Professional indemnity','Cyber insurance','Business insurance','Call Sachin']
    },
    {
      id: 'fidelity_ins',
      weight: 2,
      patterns: ['fidelity insurance','employee theft insurance','employee dishonesty insurance','staff fraud insurance','fidelity guarantee','employee embezzlement insurance','cash handling insurance'],
      response: () => `${greet()}<strong>💼 Fidelity Guarantee Insurance — Protect Against Employee Fraud!</strong><br><br>Employee theft and fraud is more common than business owners like to admit. Fidelity Insurance covers this risk.<br><br><strong>What it covers:</strong><br>✅ Theft of money by employees<br>✅ Embezzlement & fraud<br>✅ Forgery by employees<br>✅ Loss of cash in safe<br><br><strong>Types:</strong><br>📌 <strong>Individual Policy:</strong> Covers named high-risk employees<br>📌 <strong>Collective Policy:</strong> Covers all employees up to a limit<br>📌 <strong>Blanket Policy:</strong> Overall coverage for entire workforce<br><br><strong>Who needs it:</strong><br>• Businesses handling significant cash (retailers, restaurants)<br>• Financial services firms<br>• Businesses with warehouse/inventory access<br><br><strong>Premium:</strong> ₹5,000–₹30,000/year depending on coverage amount and number of employees<br><br>💡 <em>Background checks + Fidelity Insurance = best protection combo!</em><br><br>📱 Protect your business from internal theft: <strong>9013976999</strong>`,
      quickReplies: ['Cyber insurance','Business insurance','Key person insurance','Call Sachin']
    },
    {
      id: 'product_liability_ins',
      weight: 2,
      patterns: ['product liability insurance','product recall insurance','manufacturer insurance','defective product insurance','consumer complaint insurance','product injury insurance'],
      response: () => `${greet()}<strong>📦 Product Liability Insurance — If Your Product Causes Harm!</strong><br><br>If you manufacture, distribute, or sell physical products and a customer is injured or suffers loss due to your product — you're liable. Product Liability Insurance protects you.<br><br><strong>What it covers:</strong><br>✅ Bodily injury caused by your product<br>✅ Property damage caused by your product<br>✅ Legal defense costs<br>✅ Consumer court settlements<br>✅ Product recall costs (in extended plans)<br><br><strong>Who needs it:</strong><br>🏭 Manufacturers<br>🏪 Retailers & distributors<br>🍕 Food businesses<br>💊 Pharma & medical device companies<br>🧴 Consumer goods companies<br><br><strong>Important:</strong><br>Consumer Protection Act 2019 has increased liability for businesses significantly.<br><br><strong>Premium:</strong> Depends on product type, revenue, and export markets<br><br>📱 Protect your business from product claims: <strong>9013976999</strong>`,
      quickReplies: ['Business insurance','Liability cover','Professional indemnity','Call Sachin']
    },
    {
      id: 'contractors_ar_ins',
      weight: 2,
      patterns: ['contractors all risk','car insurance construction','building under construction insurance','civil engineering insurance','contractor insurance','construction project insurance','building project insurance'],
      response: () => `${greet()}<strong>🏗️ Contractor's All Risk (CAR) Insurance — For Construction Projects!</strong><br><br>If you're involved in any construction activity — as a builder, contractor, or project owner — CAR Insurance is essential.<br><br><strong>What CAR covers:</strong><br>✅ Physical damage to construction works<br>✅ Damage to materials/equipment on site<br>✅ Third-party bodily injury<br>✅ Third-party property damage<br>✅ Fire, flood, storm damage<br>✅ Collapse & damage during construction<br><br><strong>Sections of a CAR policy:</strong><br>📌 <strong>Section I:</strong> Material Damage (to works being constructed)<br>📌 <strong>Section II:</strong> Third-Party Liability<br><br><strong>Who takes this policy:</strong><br>• Project owner or developer<br>• Main contractor or subcontractor<br>• Banks financing construction projects<br><br><strong>Premium:</strong> ~0.1–0.5% of project value<br><br>💡 <em>Many banks require CAR insurance as a loan condition for construction projects!</em><br><br>📱 Get your project insured: <strong>9013976999</strong>`,
      quickReplies: ['Home renovation insurance','Business insurance','Fire insurance','Call Sachin']
    },
    {
      id: 'hotel_ins',
      weight: 2,
      patterns: ['hotel insurance','restaurant insurance','hospitality insurance','food business insurance','cafe insurance','resort insurance','hotel risk insurance'],
      response: () => `${greet()}<strong>🏨 Hotel & Restaurant Insurance — Hospitality Business Coverage!</strong><br><br>Hotels, restaurants, cafes and resorts face unique risks. A comprehensive package policy handles them all.<br><br><strong>Key covers for hospitality businesses:</strong><br>✅ <strong>Property Insurance:</strong> Building, furniture, equipment, kitchen<br>✅ <strong>Public Liability:</strong> Guest injuries on premises<br>✅ <strong>Food Liability:</strong> Food poisoning claims<br>✅ <strong>Fire Insurance:</strong> Kitchen fires are a significant risk<br>✅ <strong>Money Insurance:</strong> Cash at front desk/safe<br>✅ <strong>Fidelity:</strong> Employee dishonesty<br>✅ <strong>Electronic Equipment:</strong> POS, CCTV, kitchen tech<br>✅ <strong>Business Interruption:</strong> Income loss during closure<br><br><strong>Premium factors:</strong><br>• Number of rooms/seats<br>• Annual revenue<br>• Location & building type<br><br>💡 <em>One food poisoning lawsuit can close a restaurant. Food liability cover is a must!</em><br><br>📱 Protect your hospitality business: <strong>9013976999</strong>`,
      quickReplies: ['Business insurance','Liability insurance','Fire insurance','Call Sachin']
    },
    {
      id: 'startup_ins_check',
      weight: 2,
      patterns: ['startup insurance','new business insurance','what insurance does startup need','insurance checklist startup','first insurance for business','new company insurance'],
      response: () => `${greet()}<strong>🚀 Insurance Checklist for Startups — What You Need!</strong><br><br>Starting a business? Here's your insurance checklist by growth stage:<br><br><strong>🌱 Early Stage (0–10 employees):</strong><br>✅ Group Health Insurance (retain talent)<br>✅ Professional Indemnity / E&O<br>✅ Cyber Insurance (if handling data)<br><br><strong>📈 Growth Stage (10–50 employees):</strong><br>✅ All of above, plus:<br>✅ D&O Insurance (especially if raising VC)<br>✅ Workmen's Compensation<br>✅ Commercial General Liability<br><br><strong>🏢 Scale Stage (50+ employees):</strong><br>✅ All of above, plus:<br>✅ Key Person Insurance<br>✅ Group Term Life Insurance<br>✅ Business Interruption<br><br><strong>Sachin's startup tip:</strong><br>💡 Many VCs and accelerators now require D&O + Cyber as due diligence. Get insured before your Series A!<br><br>📱 Complete startup insurance setup: <strong>9013976999</strong>`,
      quickReplies: ['D&O insurance','Cyber insurance','Professional indemnity','Call Sachin']
    },
    {
      id: 'ngo_ins',
      weight: 2,
      patterns: ['ngo insurance','charity insurance','trust insurance','non profit insurance','society insurance','foundation insurance','voluntary organization insurance'],
      response: () => `${greet()}<strong>🤝 NGO & Non-Profit Insurance — Protecting the Protectors!</strong><br><br>NGOs, trusts, and charitable organizations have unique insurance needs that are often overlooked.<br><br><strong>Key insurances for NGOs:</strong><br>✅ <strong>D&O Insurance:</strong> Protects trustees/board members<br>✅ <strong>Public Liability:</strong> Events, community programs<br>✅ <strong>Workmen's Compensation:</strong> Staff and volunteers<br>✅ <strong>Volunteer Accident Insurance:</strong> Medical cover for volunteers<br>✅ <strong>Event Insurance:</strong> Fundraisers, campaigns<br>✅ <strong>Professional Indemnity:</strong> For NGOs providing legal/medical/education services<br><br><strong>Important considerations:</strong><br>• Trustees CAN be personally liable for NGO's wrongful acts<br>• Volunteer medical coverage is often forgotten<br>• FCRA-funded NGOs have additional compliance requirements<br><br><strong>Premium:</strong> Very affordable — ₹10,000–₹50,000/year for comprehensive cover<br><br>📱 Set up NGO insurance: <strong>9013976999</strong>`,
      quickReplies: ['D&O insurance','Liability insurance','Event insurance','Call Sachin']
    },



    /* ─── PERSONAL PROTECTION EXTRAS ────────────────── */
    {
      id: 'pa_women_ins',
      weight: 2,
      patterns: ['personal accident for women','women accident insurance','accident cover for women','women safety insurance','lady accident insurance','accident insurance female'],
      response: () => `${greet()}<strong>👩 Personal Accident Insurance for Women — Special Plans!</strong><br><br>Several insurers offer Personal Accident plans specifically designed for women's needs.<br><br><strong>What women's PA plans typically cover:</strong><br>✅ Accidental death<br>✅ Permanent & temporary disability<br>✅ Burn injuries (special high coverage)<br>✅ Acid attack (special provisions)<br>✅ Sexual assault (some plans)<br>✅ Ambulance costs<br>✅ Child education benefit (if mother dies in accident)<br><br><strong>Additional covers in women-specific plans:</strong><br>• Hospitalization for rape/assault trauma<br>• Domestic violence coverage (select plans)<br>• Maternity complications due to accidents<br><br><strong>Premium:</strong> ₹2,000–₹8,000/year for ₹25L coverage<br><br>💡 <em>Working women with dependents — PA insurance is as important as life insurance!</em><br><br>📱 Find the right plan for you: <strong>9013976999</strong>`,
      quickReplies: ['Personal accident basics','Women insurance','Health for women','Call Sachin']
    },
    {
      id: 'pa_children_ins',
      weight: 2,
      patterns: ['personal accident for children','child accident insurance','kids accident cover','child safety insurance','accident insurance for child','student accident insurance'],
      response: () => `${greet()}<strong>👶 Personal Accident Insurance for Children — Protect Your Child!</strong><br><br>Children are active, adventurous, and prone to accidents. A Personal Accident plan for kids gives peace of mind.<br><br><strong>What's covered:</strong><br>✅ Accidental death<br>✅ Permanent disability (e.g., losing a limb or sight)<br>✅ Fractures & burns<br>✅ Hospitalization due to accidents<br>✅ Education fund (if parent dies in accident)<br><br><strong>Child PA key features:</strong><br>• Low premium (₹1,000–₹3,000/year for ₹10–25L cover)<br>• Can be added as rider to parent's PA policy<br>• School-time and sports activities covered<br>• No medical tests required<br><br><strong>Who should buy:</strong><br>• Parents of school-going children<br>• Parents with sporty/active kids<br>• Schools can buy group PA for students<br><br>💡 <em>One sports accident can mean ₹2–5 lakh in treatment — PA insurance covers it completely!</em><br><br>📱 Protect your child today: <strong>9013976999</strong>`,
      quickReplies: ['Child plans','Family floater health','Personal accident','Get a quote']
    },
    {
      id: 'group_pa_ins',
      weight: 2,
      patterns: ['group personal accident','employee accident insurance','staff accident cover','group pa policy','employee pa plan','workmen accident group'],
      response: () => `${greet()}<strong>👥 Group Personal Accident Insurance — For Your Entire Team!</strong><br><br>Group Personal Accident (GPA) insurance covers all employees under one policy — affordable and comprehensive.<br><br><strong>What GPA covers:</strong><br>✅ Accidental death<br>✅ Permanent Total & Partial Disability<br>✅ Temporary Total Disability (weekly compensation)<br>✅ Medical expenses due to accident<br>✅ Education benefit for dependent children<br><br><strong>Benefits for employer:</strong><br>• Cheaper than individual policies (group discount 20–40%)<br>• Easy administration (one policy, one renewal)<br>• Employee welfare benefit (improves retention)<br>• Tax deductible as business expense<br><br><strong>Benefits for employee:</strong><br>• Coverage from day 1, no waiting period<br>• No individual medical tests<br>• Covers on & off duty accidents<br><br><strong>Premium:</strong> ₹300–₹600/employee/year for ₹10L coverage<br><br>📱 Set up GPA for your team: <strong>9013976999</strong>`,
      quickReplies: ['Group health insurance','Key person insurance','Business insurance','Call Sachin']
    },
    {
      id: 'disability_income_ins',
      weight: 2,
      patterns: ['disability income insurance','income replacement disability','monthly income disability','disability benefit insurance','work disability insurance','income protection disability'],
      response: () => `${greet()}<strong>💸 Disability Income Insurance — Your Salary Replacement!</strong><br><br>If a disability prevents you from working, your income stops — but your expenses don't. Disability Income Insurance replaces your lost income.<br><br><strong>How it works:</strong><br>• Policy pays a monthly income (usually 60–80% of salary)<br>• Triggered by: accident, illness causing disability<br>• Payment continues until you recover or for a fixed term<br><br><strong>Types of disability covered:</strong><br>📌 <strong>Total Disability:</strong> Cannot work at all<br>📌 <strong>Partial Disability:</strong> Can work but at reduced capacity<br>📌 <strong>Permanent Disability:</strong> Ongoing monthly benefit for life<br><br><strong>How it differs from PA Insurance:</strong><br>• PA pays a lump sum on disability<br>• Disability Income pays monthly over time<br>• Both can be held together<br><br><strong>Who needs it most:</strong><br>• Self-employed professionals<br>• Physical labor workers<br>• Sole breadwinners<br><br>📱 Design your income protection plan: <strong>9013976999</strong>`,
      quickReplies: ['Personal accident','Critical illness','Income protection','Call Sachin']
    },
    {
      id: 'cancer_ins',
      weight: 2,
      patterns: ['cancer insurance','cancer plan','cancer cover','cancer specific policy','cancer benefit plan','oncology insurance','cancer treatment insurance'],
      response: () => `${greet()}<strong>🎗️ Cancer Insurance — Specialized Cover for India's #1 Feared Disease!</strong><br><br>Cancer is the most feared disease in India. Treatment costs ₹5–50 lakh+. Cancer-specific insurance provides extra protection beyond regular health insurance.<br><br><strong>How cancer insurance works:</strong><br>• Pays a lump sum on cancer diagnosis<br>• Money can be used for: treatment, loss of income, home help, travel<br>• Complements (doesn't replace) your regular health insurance<br><br><strong>Stages covered:</strong><br>📌 <strong>Early Stage:</strong> 25–50% of sum assured<br>📌 <strong>Major Stage:</strong> 100% of sum assured<br><br><strong>Features to look for:</strong><br>✅ Waiver of premium on diagnosis<br>✅ Income benefit (monthly payout)<br>✅ All cancer types covered<br>✅ No waiting period for accidental diagnosis<br><br><strong>Premium:</strong> ₹5,000–₹15,000/year for ₹25–50L coverage<br><br>💡 <em>At 30, cancer insurance costs ~₹5,000/year. By 50, it's 3× more. Buy early!</em><br><br>📱 Get cancer coverage today: <strong>9013976999</strong>`,
      quickReplies: ['Critical illness cover','Health insurance','Top-up plan','Call Sachin']
    },
    {
      id: 'dengue_ins',
      weight: 2,
      patterns: ['dengue insurance','vector borne disease insurance','mosquito disease insurance','malaria insurance','chikungunya insurance','dengue fever cover','vector disease policy'],
      response: () => `${greet()}<strong>🦟 Dengue & Vector-Borne Disease Insurance!</strong><br><br>Dengue, malaria, chikungunya and other vector-borne diseases are increasingly common in India. Specialized insurance covers treatment costs.<br><br><strong>What vector disease insurance covers:</strong><br>✅ Dengue fever hospitalization<br>✅ Malaria treatment<br>✅ Chikungunya<br>✅ Zika virus<br>✅ Japanese Encephalitis<br>✅ Kala-azar<br><br><strong>Features:</strong><br>• Daily hospital cash benefit (₹1,000–₹5,000/day)<br>• Lump sum on diagnosis<br>• Very short waiting period (usually 15 days only)<br>• Low premium<br><br><strong>Who needs it:</strong><br>• Anyone living in high-risk areas (monsoon-prone cities)<br>• Families with children and elderly<br><br><strong>Premium:</strong> As low as ₹500–₹2,000/year per person<br><br>💡 <em>Dengue hospitalizations cost ₹30,000–₹1,00,000. This insurance is extremely affordable by comparison!</em><br><br>📱 Add this to your health coverage: <strong>9013976999</strong>`,
      quickReplies: ['Health insurance','Hospital cash','Top-up plan','Call Sachin']
    },
    {
      id: 'hospital_indemnity',
      weight: 2,
      patterns: ['hospital cash insurance','hospital indemnity','daily hospital allowance','hospital daily cash benefit','per day hospital cash','daily cash on hospitalization'],
      response: () => `${greet()}<strong>🏥 Hospital Cash / Daily Indemnity — Cash During Hospitalization!</strong><br><br>Hospital Cash (also called Hospital Daily Indemnity) pays you a fixed daily cash amount for every day you're hospitalized — regardless of actual medical expenses.<br><br><strong>How it works:</strong><br>• Hospitalized → Insurer pays ₹1,000–₹5,000 per day<br>• ICU admission → 2× daily benefit (many plans)<br>• Surgery → Additional one-time benefit<br>• Cash in hand — use it for anything!<br><br><strong>What you can use the cash for:</strong><br>✅ Food & travel for family visiting hospital<br>✅ Home expenses while you're away<br>✅ Income replacement (if self-employed)<br>✅ Non-medical expenses not covered by health plan<br><br><strong>Premium:</strong> Very affordable — ₹2,000–₹5,000/year<br><br>💡 <em>Think of it as "pocket money" during hospital stays. It fills the gap your main health policy doesn't!</em><br><br>📱 Add hospital cash to your coverage: <strong>9013976999</strong>`,
      quickReplies: ['Health insurance','Critical illness','Personal accident','Get a quote']
    },
    {
      id: 'fracture_care',
      weight: 2,
      patterns: ['fracture insurance','bone break insurance','fracture care plan','broken bone cover','orthopaedic insurance','accident fracture cover'],
      response: () => `${greet()}<strong>🦴 Fracture Care Insurance — Bone Breaks Are Expensive!</strong><br><br>A fracture or broken bone can mean surgery, plaster casts, physiotherapy, and weeks of lost income. Fracture Care insurance provides immediate financial support.<br><br><strong>What fracture care covers:</strong><br>✅ Fracture diagnosis → Lump sum payout<br>✅ Hospitalization costs<br>✅ Surgery & implant costs (rods, pins)<br>✅ Physiotherapy reimbursement<br>✅ Ambulance costs<br><br><strong>Payout structure (example):</strong><br>• Hairline fracture: 10–25% of sum assured<br>• Single fracture (arm, leg): 50% of sum assured<br>• Multiple fractures: 100% of sum assured<br><br><strong>Who benefits most:</strong><br>• Sports players & athletes<br>• Senior citizens (osteoporosis risk)<br>• Construction workers<br>• Bike riders<br><br><strong>Premium:</strong> ₹1,000–₹3,000/year<br><br>📱 Add fracture cover to your plan: <strong>9013976999</strong>`,
      quickReplies: ['Personal accident','Hospital cash','Critical illness','Call Sachin']
    },
    {
      id: 'income_protection',
      weight: 2,
      patterns: ['income protection','income replacement insurance','salary protection insurance','job loss insurance income','income safety net','protect my salary'],
      response: () => `${greet()}<strong>💰 Income Protection Insurance — Your Financial Safety Net!</strong><br><br>What if an illness or accident stops you from working for months? Income Protection Insurance ensures your lifestyle continues.<br><br><strong>How it works:</strong><br>• Illness or accident → Can't work → Policy pays monthly income<br>• Covers 50–80% of your monthly salary<br>• Payments start after a waiting/deferral period (30–90 days)<br>• Benefits paid until recovery or end of policy term<br><br><strong>Difference from Critical Illness:</strong><br>• Critical Illness = lump sum on diagnosis of specific diseases<br>• Income Protection = monthly income for ANY illness/injury preventing work<br><br><strong>Who needs it most:</strong><br>• Self-employed and freelancers (no sick pay!)<br>• Sole earners in family<br>• Anyone with significant EMIs<br><br><strong>Premium:</strong> 1–3% of annual income covered<br><br>💡 <em>If you stopped earning tomorrow, how long would your savings last? Income protection answers that!</em><br><br>📱 Build your income safety net: <strong>9013976999</strong>`,
      quickReplies: ['Critical illness','Disability income','Personal accident','Call Sachin']
    },
    {
      id: 'high_risk_profession_ins',
      weight: 2,
      patterns: ['high risk job insurance','risky job insurance','dangerous profession insurance','pilot insurance','miner insurance','firefighter insurance','high risk occupation'],
      response: () => `${greet()}<strong>⚠️ Insurance for High-Risk Professions — Special Considerations!</strong><br><br>If you work in a high-risk occupation, standard insurance policies may have exclusions or higher premiums. Here's what you need to know.<br><br><strong>High-risk occupations (Class III/IV):</strong><br>• Mining, oil & gas workers<br>• Pilots & aviation crew<br>• Divers<br>• Construction workers<br>• Security personnel<br>• Chemical plant workers<br><br><strong>What changes for high-risk professionals:</strong><br>📌 <strong>Life Insurance:</strong> Loading (extra premium) of 25–100%<br>📌 <strong>Personal Accident:</strong> Occupational risks may be excluded or extra charged<br>📌 <strong>Health Insurance:</strong> Usually no occupational exclusions<br><br><strong>Solutions:</strong><br>• Group policies via employer (often includes occupational risk)<br>• Specialized PA policies for high-risk occupations<br>• Workmen's Compensation (employer's obligation)<br><br>💡 <em>Always disclose your occupation accurately — hiding it leads to claim rejection!</em><br><br>📱 Find the right cover: <strong>9013976999</strong>`,
      quickReplies: ['Personal accident','Life insurance','Workmen compensation','Call Sachin']
    },
    {
      id: 'spine_back_ins',
      weight: 2,
      patterns: ['spine insurance','back injury insurance','spinal cord injury cover','back problem insurance','neck injury insurance','disc problem insurance','vertebral injury insurance'],
      response: () => `${greet()}<strong>🦴 Spine & Back Injury Insurance — Protect Your Most Vital Asset!</strong><br><br>Spinal cord injuries are among the most expensive to treat and can permanently end a career. Specialized cover is available.<br><br><strong>Why spine injuries need special attention:</strong><br>• Spinal surgery: ₹3–15 lakh<br>• Paraplegia/quadriplegia: Lifelong care costs<br>• Long rehabilitation period<br>• May permanently prevent working<br><br><strong>How to protect yourself:</strong><br>✅ <strong>Comprehensive Health Insurance</strong> (₹10–25L) — covers surgery<br>✅ <strong>Personal Accident</strong> — covers disability from spine injury<br>✅ <strong>Critical Illness</strong> — some plans include total paralysis<br>✅ <strong>Disability Income</strong> — replaces income if can't work<br><br><strong>Specific medical procedures covered:</strong><br>• Discectomy, laminectomy<br>• Spinal fusion surgery<br>• Physiotherapy (some health plans)<br><br>💡 <em>Office workers with desk jobs — back problems are the #1 reason for long-term work absence!</em><br><br>📱 Build a spine injury protection plan: <strong>9013976999</strong>`,
      quickReplies: ['Critical illness','Personal accident','Health coverage','Call Sachin']
    },
    {
      id: 'senior_pa_ins',
      weight: 2,
      patterns: ['senior citizen accident insurance','accident insurance for elderly','old age personal accident','pa insurance for 60 plus','accident cover senior citizen'],
      response: () => `${greet()}<strong>👴 Personal Accident Insurance for Senior Citizens!</strong><br><br>Falls are the #1 cause of injury in people above 60. Personal Accident insurance for seniors is affordable and essential.<br><br><strong>Key features of senior PA plans:</strong><br>✅ Entry up to 70–80 years (most insurers)<br>✅ Coverage for accidental death<br>✅ Bone fracture benefit (very relevant for seniors)<br>✅ Permanent disability coverage<br>✅ Ambulance charges<br>✅ Hospital convalescence benefit<br><br><strong>Common risks for seniors:</strong><br>• Falls at home (bathroom, stairs)<br>• Road accidents<br>• Fractures due to osteoporosis<br><br><strong>What makes senior PA unique:</strong><br>No medical test required in most cases. Just age proof.<br><br><strong>Premium:</strong> ₹3,000–₹8,000/year for ₹10–25L coverage<br><br>💡 <em>Combine with a senior health insurance policy for complete protection!</em><br><br>📱 Senior-focused insurance planning: <strong>9013976999</strong>`,
      quickReplies: ['Senior health insurance','Govt schemes seniors','Annuity plans','Call Sachin']
    },
    {
      id: 'accidental_death_benefit',
      weight: 2,
      patterns: ['accidental death benefit','adb rider','accident death cover','additional death benefit accident','pa death only','accident death insurance'],
      response: () => `${greet()}<strong>💀 Accidental Death Benefit (ADB) — Extra Life Cover for Accidents!</strong><br><br>Accidental Death Benefit is an add-on (rider) or standalone cover that pays an ADDITIONAL sum if death occurs due to an accident.<br><br><strong>How ADB works:</strong><br>Example: ₹1 Cr Term Plan + ₹50L ADB Rider<br>• Natural death → Family gets ₹1 Cr<br>• Accidental death → Family gets ₹1 Cr + ₹50L = <strong>₹1.5 Cr</strong><br><br><strong>Standalone ADB policy:</strong><br>• Even if you don't have life insurance<br>• Death must be solely due to accidental, external, violent means<br>• Suicide excluded, natural death excluded<br><br><strong>Why it's valuable:</strong><br>• Very cheap (₹500–₹2,000/year for ₹25L coverage)<br>• Accident is more sudden and unexpected than illness<br>• Extra payout helps family at most vulnerable time<br><br>💡 <em>Always combine ADB with a comprehensive Personal Accident policy for full protection!</em><br><br>📱 Add ADB to your coverage: <strong>9013976999</strong>`,
      quickReplies: ['Personal accident plan','Term plan riders','Life insurance','Call Sachin']
    },
    {
      id: 'vector_disease_ins',
      weight: 2,
      patterns: ['vector disease insurance','tropical disease insurance','scrub typhus insurance','leptospirosis insurance','leishmaniasis insurance','filaria insurance'],
      response: () => `${greet()}<strong>🦟 Vector & Tropical Disease Insurance — Beyond Just Dengue!</strong><br><br>India's tropical climate means many vector-borne diseases beyond dengue. Comprehensive vector disease insurance covers all of them.<br><br><strong>Diseases covered in specialized plans:</strong><br>✅ Dengue Fever<br>✅ Malaria (including Falciparum malaria)<br>✅ Chikungunya<br>✅ Zika Virus<br>✅ Japanese Encephalitis<br>✅ Kala-Azar (Leishmaniasis)<br>✅ Lymphatic Filariasis<br>✅ Scrub Typhus<br>✅ Leptospirosis<br><br><strong>Benefits offered:</strong><br>• Hospitalization cover<br>• Daily hospital cash<br>• Convalescence benefit (post-discharge recovery)<br>• OPD treatment (some plans)<br><br><strong>Best for:</strong> Families in rural areas, flood-prone zones, or those who travel frequently<br><br><strong>Premium:</strong> ₹800–₹2,500/year per family<br><br>📱 Get comprehensive vector disease coverage: <strong>9013976999</strong>`,
      quickReplies: ['Health insurance','Dengue insurance','Hospital cash','Call Sachin']
    },

    /* ─── INVESTMENTS EXTRAS ─────────────────────────── */
    {
      id: 'swp_plan',
      weight: 2,
      patterns: ['swp','systematic withdrawal plan','monthly income from mutual fund','mutual fund income plan','withdrawal from mutual fund monthly','regular income mutual fund'],
      response: () => `${greet()}<strong>📤 SWP — Systematic Withdrawal Plan for Regular Income!</strong><br><br>SWP is the REVERSE of SIP. Instead of putting money IN every month, you take money OUT every month from your mutual fund corpus.<br><br><strong>How SWP works:</strong><br>• You invest a lump sum (e.g., ₹50 lakhs) in a mutual fund<br>• Set up monthly withdrawal: e.g., ₹30,000/month<br>• Fund sells units worth ₹30,000 each month and pays you<br>• Remaining corpus continues to grow<br><br><strong>Why SWP is great for retirement:</strong><br>✅ Regular monthly income (like salary/pension)<br>✅ Corpus keeps growing (if withdrawal < return %)<br>✅ Tax-efficient (only gains taxed, not principal)<br>✅ Flexible — change amount or stop anytime<br><br><strong>SWP vs Annuity:</strong><br>• SWP: More flexible, higher returns, not guaranteed<br>• Annuity: Guaranteed income, but less flexible<br><br>💡 <em>Retire with ₹1 Cr in balanced mutual fund + SWP at 0.6%/month = ₹60,000/month income!</em><br><br>📱 Plan your retirement income: <strong>9013976999</strong>`,
      quickReplies: ['Annuity plans','NPS pension','SIP investments','Retirement planning']
    },
    {
      id: 'balanced_funds',
      weight: 2,
      patterns: ['balanced fund','hybrid fund','balanced advantage fund','baf investment','aggressive hybrid fund','equity debt mix fund','dynamic asset allocation'],
      response: () => `${greet()}<strong>⚖️ Balanced / Hybrid Funds — Best of Both Worlds!</strong><br><br>Balanced or Hybrid Mutual Funds invest in BOTH equity (stocks) and debt (bonds) — giving you growth with stability.<br><br><strong>Types of Hybrid Funds:</strong><br>📌 <strong>Aggressive Hybrid (65–80% equity):</strong> Higher returns, more risk<br>📌 <strong>Conservative Hybrid (75–90% debt):</strong> Stable, lower returns<br>📌 <strong>Balanced Advantage Fund (BAF):</strong> Dynamic allocation — increases debt when markets are high<br>📌 <strong>Equity Savings Fund (65–90% combined):</strong> Tax-efficient<br><br><strong>Who should invest:</strong><br>• First-time investors<br>• Risk-averse investors who still want equity exposure<br>• Retirees wanting some growth<br>• 3–7 year investment horizon<br><br><strong>Returns (historical):</strong><br>• Aggressive Hybrid: 10–13% CAGR<br>• Conservative Hybrid: 7–9% CAGR<br><br>💡 <em>BAFs automatically reduce equity when markets are expensive — built-in risk management!</em><br><br>📱 Choose the right hybrid fund: <strong>9013976999</strong>`,
      quickReplies: ['ELSS mutual funds','SIP investments','Retirement planning','Call Sachin']
    },
    {
      id: 'elss_selection',
      weight: 2,
      patterns: ['which elss to choose','best elss fund','elss fund selection','how to pick elss','top elss funds','elss comparison','select elss fund'],
      response: () => `${greet()}<strong>📊 How to Choose the Best ELSS Fund — Simple Guide!</strong><br><br>ELSS (Equity Linked Saving Scheme) gives tax benefits AND market-linked returns. But which fund to pick?<br><br><strong>Criteria for selecting ELSS:</strong><br>1️⃣ <strong>Track Record:</strong> Look at 5–10 year returns (not just 1 year)<br>2️⃣ <strong>Fund Manager:</strong> Experience and consistency<br>3️⃣ <strong>Fund Size (AUM):</strong> ₹2,000–₹15,000 Cr is ideal range<br>4️⃣ <strong>Expense Ratio:</strong> Lower is better (below 1% for direct plans)<br>5️⃣ <strong>Portfolio Quality:</strong> Quality companies, not just chasing returns<br><br><strong>Direct vs Regular ELSS:</strong><br>• Direct Plan: Higher returns (0.5–1% more p.a.) — no advisor commission<br>• Regular Plan: Slightly lower returns — advisor support included<br><br><strong>How much to invest:</strong><br>Max ₹1.5L/year for full 80C deduction<br><br>💡 <em>Sachin recommends splitting ₹1.5L across 2 ELSS funds — diversifies fund manager risk!</em><br><br>📱 Get personalized ELSS guidance: <strong>9013976999</strong>`,
      quickReplies: ['ELSS vs PPF','Tax saving guide','SIP planning','Call Sachin']
    },
    {
      id: 'retirement_calc_inv',
      weight: 2,
      patterns: ['retirement corpus calculation','how much to retire','retirement planning investment','retirement fund target','how much money for retirement','retirement savings goal'],
      response: () => `${greet()}<strong>🧮 Retirement Corpus Calculator — How Much Do You Actually Need?</strong><br><br>The right retirement corpus depends on your lifestyle, age, and inflation. Here's how to calculate it:<br><br><strong>Step 1 — Find your monthly expenses today:</strong><br>Example: ₹60,000/month<br><br><strong>Step 2 — Calculate future monthly expense (at retirement):</strong><br>Assuming 6% inflation, in 25 years: ₹60,000 × (1.06)^25 ≈ <strong>₹2.5 lakh/month</strong><br><br><strong>Step 3 — Calculate corpus needed:</strong><br>Use 4% withdrawal rate (safe): ₹2.5L × 12 ÷ 0.04 = <strong>₹7.5 Crore corpus</strong><br><br><strong>Step 4 — How to reach it:</strong><br>₹7.5 Cr in 25 years at 12% returns = <strong>₹23,000/month SIP</strong><br><br><strong>Retirement vehicles:</strong><br>• NPS (tax efficient)<br>• ELSS + SIP<br>• PPF<br>• Annuity at retirement<br><br>💡 <em>Starting at 30 vs 40 = half the monthly investment for same corpus!</em><br><br>📱 Get your retirement plan built: <strong>9013976999</strong>`,
      quickReplies: ['NPS pension','ELSS vs PPF','Annuity plans','Call Sachin']
    },
    {
      id: 'stp_plan',
      weight: 2,
      patterns: ['stp investment','systematic transfer plan','lump sum to sip','how to invest lump sum','transfer from debt to equity','stp mutual fund'],
      response: () => `${greet()}<strong>🔄 STP — Systematic Transfer Plan (Smart Lump Sum Investing!)</strong><br><br>Got a lump sum (bonus, maturity, inheritance)? Don't dump it all in equity at once. Use STP!<br><br><strong>How STP works:</strong><br>1. Park lump sum in a Liquid/Debt Fund<br>2. Set up automatic monthly transfer to Equity Fund<br>3. E.g., ₹12L → Transfer ₹1L/month for 12 months to an equity fund<br><br><strong>Why STP is smarter than lump sum:</strong><br>✅ Rupee cost averaging (same as SIP benefit)<br>✅ Earn 4–5% on parking fund while slowly moving to equity<br>✅ Reduces risk of investing at market peak<br>✅ Fully automated — set and forget<br><br><strong>STP vs SIP:</strong><br>• SIP: New money from bank each month<br>• STP: Existing lump sum transferred from one fund to another<br><br>💡 <em>Received ₹20L maturity/bonus? STP is the safest way to put it to work in equity markets!</em><br><br>📱 Set up a smart STP plan: <strong>9013976999</strong>`,
      quickReplies: ['SIP investments','ELSS funds','Lump sum investment','Call Sachin']
    },
    {
      id: 'diversification_inv',
      weight: 2,
      patterns: ['investment diversification','diversify portfolio','don t put eggs one basket','asset diversification','spread investment','how to diversify','portfolio diversification'],
      response: () => `${greet()}<strong>🥚 Investment Diversification — Don't Put All Eggs in One Basket!</strong><br><br>Diversification is spreading your investments across asset classes so a loss in one doesn't destroy your portfolio.<br><br><strong>The 4 main asset classes to diversify across:</strong><br><br>📊 <strong>Equity (Stocks/MF):</strong> High growth, high risk — long term (7+ years)<br>🏦 <strong>Debt (FD, Bonds, PPF):</strong> Stable, moderate returns — medium term<br>🥇 <strong>Gold:</strong> Hedge against inflation — 10-15% of portfolio<br>🏠 <strong>Real Estate:</strong> Long-term wealth — requires large capital<br><br><strong>Sample allocation by age:</strong><br>• Age 30: 70% equity, 20% debt, 10% gold<br>• Age 45: 50% equity, 35% debt, 15% gold<br>• Age 60: 30% equity, 55% debt, 15% gold<br><br><strong>Within equity, diversify further:</strong><br>• Large-cap, mid-cap, small-cap funds<br>• Indian + International exposure<br><br>💡 <em>Rebalance every year — sell what grew most, buy what's behind. Stay disciplined!</em><br><br>📱 Get portfolio review: <strong>9013976999</strong>`,
      quickReplies: ['Portfolio review','Balanced funds','SIP investments','Call Sachin']
    },



    /* ─── TAX SAVING EXTRAS ─────────────────────────── */
    {
      id: 'sec_80g',
      weight: 2,
      patterns: ['section 80g','charity tax deduction','donation tax benefit','ngo donation tax','80g deduction','tax benefit for donation','charitable donation tax'],
      response: () => `${greet()}<strong>🙏 Section 80G — Tax Deduction for Charitable Donations!</strong><br><br>Did you know your donations to approved charities reduce your taxable income?<br><br><strong>How 80G works:</strong><br>• Donate to approved NGOs/charitable trusts<br>• Get 50% or 100% deduction on donation amount<br>• No upper limit for many approved organizations<br><br><strong>Deduction rates:</strong><br>📌 <strong>100% deduction with no limit:</strong> National Defence Fund, PM Relief Fund, National Children's Fund<br>📌 <strong>50% deduction with no limit:</strong> Nehru Fund, Rajiv Gandhi Foundation, Indira Gandhi Memorial Trust<br>📌 <strong>100% deduction (up to 10% of income):</strong> Government approved local charities<br>📌 <strong>50% deduction (up to 10% of income):</strong> Most NGOs with 80G certificate<br><br><strong>How to claim:</strong><br>• Get 80G receipt with NGO's PAN & 80G registration number<br>• Declare in ITR under Chapter VI-A<br><br>💡 <em>Donate smartly — support a cause AND save taxes. Win-win!</em><br><br>📱 Tax planning consultation: <strong>9013976999</strong>`,
      quickReplies: ['Tax saving guide','Section 80C','Section 80D','Call Sachin']
    },
    {
      id: 'sec_80e_edu',
      weight: 2,
      patterns: ['section 80e','education loan tax','student loan tax benefit','education loan interest deduction','80e deduction','higher education loan tax','study loan tax benefit'],
      response: () => `${greet()}<strong>🎓 Section 80E — Tax Benefit on Education Loan Interest!</strong><br><br>If you took a loan for higher education, you can deduct the FULL interest paid from your taxable income!<br><br><strong>Key features of Section 80E:</strong><br>✅ <strong>Deduction:</strong> 100% of interest paid (no upper limit!)<br>✅ <strong>Duration:</strong> Up to 8 years or until loan repaid (whichever is earlier)<br>✅ <strong>What qualifies:</strong> Loan from bank/approved institution for self, spouse, or children<br>✅ <strong>Courses:</strong> Any regular full-time course (in India or abroad)<br><br><strong>What's NOT covered:</strong><br>❌ Principal repayment (only interest is deductible)<br>❌ Loans from family members<br>❌ Part-time or distance education (varies)<br><br><strong>Example:</strong><br>Loan interest paid: ₹2,50,000/year → Full ₹2.5L deducted from income!<br>At 30% tax slab → Tax saved: ₹75,000/year<br><br>💡 <em>Combine 80E + 80C + 80D to maximize deductions in old tax regime!</em>`,
      quickReplies: ['Tax saving guide','Section 80C','NPS tax benefit','Call Sachin']
    },
    {
      id: 'maturity_tax_10d',
      weight: 2,
      patterns: ['section 10 10d','maturity amount tax','life insurance maturity tax free','ulip maturity tax','endowment maturity tax','policy maturity taxable','insurance proceeds tax','tds on maturity','policy maturity amount','tds deducted'],
      response: () => `${greet()}<strong>💰 Section 10(10D) — Tax-Free Life Insurance Maturity!</strong><br><br>Life insurance maturity proceeds can be completely TAX FREE under Section 10(10D). Here's when:<br><br><strong>Tax-Free conditions (all must be met):</strong><br>✅ Annual premium ≤ 10% of Sum Assured (for policies issued after April 2012)<br>✅ Policy issued before April 1, 2012 → Just need premium ≤ 20% of SA<br>✅ ULIPs issued before Feb 1, 2021 → Also tax free under 10(10D)<br><br><strong>When is it TAXABLE:</strong><br>❌ ULIP premiums > ₹2.5L/year (post Feb 1, 2021 ULIPs) → taxed like equity MF<br>❌ Non-ULIP premiums > ₹5L/year (post April 1, 2023) → Maturity taxable<br>❌ Single premium plans where premium > 10% of SA<br><br><strong>Death claim:</strong><br>• ALWAYS tax free — regardless of premium amount ✅<br><br><strong>Important:</strong><br>💡 <em>Before buying a policy for tax purposes, verify the 10(10D) eligibility with your advisor!</em><br><br>📱 Tax-efficient insurance planning: <strong>9013976999</strong>`,
      quickReplies: ['Life insurance','ULIP tax','Tax saving guide','Call Sachin']
    },
    {
      id: 'lta_exemption',
      weight: 2,
      patterns: ['lta exemption','leave travel allowance','lta tax benefit','travel tax exemption','lta claim rules','leave travel concession','ltc exemption'],
      response: () => `${greet()}<strong>✈️ LTA — Leave Travel Allowance Tax Exemption!</strong><br><br>LTA (Leave Travel Allowance) is a salary component that's exempt from tax when you actually travel!<br><br><strong>How LTA works:</strong><br>• Employer includes LTA in your CTC<br>• You travel within India → submit bills → get tax exemption<br>• Exempt = actual travel cost OR LTA amount (whichever is less)<br><br><strong>Rules:</strong><br>📌 Only domestic travel (within India)<br>📌 Shortest route airfare/train fare only<br>📌 Only 2 journeys in a block of 4 calendar years<br>📌 Current block: 2022–2025<br>📌 Can carry forward 1 unclaimed trip to next block<br><br><strong>What's covered:</strong><br>✅ Train fare (any class)<br>✅ Airfare (economy class)<br>✅ NOT: Hotels, food, local transport<br><br><strong>Family coverage:</strong><br>Spouse + 2 children + dependent parents/siblings<br><br>💡 <em>LTA exemption is ONLY available in the OLD tax regime — not in new regime!</em>`,
      quickReplies: ['New vs old tax regime','HRA exemption','Tax saving guide','Call Sachin']
    },
    {
      id: 'nps_employer_80ccd',
      weight: 2,
      patterns: ['80ccd 2','employer nps contribution tax','nps employer contribution','additional nps deduction','nps 80ccd','employer contribution nps tax free','corporate nps tax benefit'],
      response: () => `${greet()}<strong>🏛️ Section 80CCD(2) — The Most Under-Used Tax Benefit!</strong><br><br>This is one of the biggest tax saving opportunities most employees miss!<br><br><strong>What is 80CCD(2)?</strong><br>If your EMPLOYER contributes to your NPS account, you get an EXTRA deduction — OVER AND ABOVE the ₹1.5L 80C and ₹50K 80CCD(1B) limits!<br><br><strong>How much is the deduction?</strong><br>• Government employees: Up to 14% of basic salary<br>• Private sector employees: Up to 10% of basic salary<br>• This extra deduction has NO upper rupee limit!<br><br><strong>Example:</strong><br>Basic salary: ₹1,00,000/month = ₹12L/year<br>Employer NPS 10%: ₹1.2L/year → 100% deductible from income!<br>At 30% tax slab → Tax saved: ₹36,000 EXTRA per year<br><br><strong>Best part:</strong><br>✅ Available in BOTH old AND new tax regimes!<br>✅ Over and above all other deductions<br><br>💡 <em>Ask your employer/HR to route your salary component through NPS — it's win-win!</em>`,
      quickReplies: ['NPS explained','Tax saving guide','Old vs new regime','Call Sachin']
    },
    {
      id: 'senior_tax_plan',
      weight: 2,
      patterns: ['senior citizen tax planning','tax for retired person','tax saving after retirement','pension tax planning','senior tax benefits','tax for 60 plus'],
      response: () => `${greet()}<strong>👴 Tax Planning for Senior Citizens — Special Benefits!</strong><br><br>India's tax laws have special provisions for senior citizens. Here's what you're entitled to:<br><br><strong>Higher basic exemption limits:</strong><br>• Regular: ₹2.5 lakh<br>• Senior (60–80 yrs): ₹3 lakh<br>• Super Senior (80+): ₹5 lakh<br><br><strong>Special deductions for seniors:</strong><br>📌 <strong>Section 80D:</strong> ₹50,000 health insurance (vs ₹25K for others)<br>📌 <strong>Section 80DDB:</strong> ₹1 lakh deduction for serious illness treatment<br>📌 <strong>Section 80TTB:</strong> ₹50,000 interest income exempt (FD/savings interest)<br>📌 <strong>Section 194P:</strong> No ITR filing if income < ₹3L (pension + FD only)<br><br><strong>No advance tax for senior citizens:</strong><br>✅ Seniors with NO business income don't need to pay advance tax<br><br><strong>SCSS (Senior Citizen Saving Scheme):</strong><br>• 8.2% interest (Q1 2024) + 80C benefit<br><br>💡 <em>A proper tax plan can save seniors ₹50,000–₹1,50,000/year!</em><br><br>📱 Senior tax planning session: <strong>9013976999</strong>`,
      quickReplies: ['Senior health insurance','SCSS scheme','Pension plans','Call Sachin']
    },
    {
      id: 'tax_free_income_list',
      weight: 2,
      patterns: ['tax free income','income not taxable','exempt income list','what income is tax free','tax exempt income india','non taxable income'],
      response: () => `${greet()}<strong>💚 Tax-Free Income in India — Complete List!</strong><br><br>Not all income is taxable! Here are key sources that are 100% tax-free:<br><br><strong>Completely Tax-Free:</strong><br>✅ Agricultural income (any amount!)<br>✅ PPF maturity amount<br>✅ Life insurance maturity (if premium ≤ 10% of SA) [Section 10(10D)]<br>✅ Life insurance death claim (always tax-free)<br>✅ Gratuity up to ₹20 lakh [10(10)]<br>✅ EPF maturity (after 5 years service)<br>✅ Sukanya Samriddhi Yojana maturity<br>✅ Long-term capital gains on equity up to ₹1 lakh [Section 112A]<br>✅ HUF gifts to members<br>✅ Scholarship income<br>✅ Interest on government securities (partly)<br>✅ Dividends up to ₹10/share (basic exemption)<br><br><strong>Partially Tax-Free:</strong><br>• HRA exemption<br>• LTA (for actual travel)<br>• Standard deduction (₹50,000 from salary)<br><br>💡 <em>Structure your income around these to minimize tax burden legally!</em>`,
      quickReplies: ['Tax saving guide','PPF explained','LTA exemption','Call Sachin']
    },
    {
      id: 'form_16_explained',
      weight: 2,
      patterns: ['form 16','what is form 16','form 16 for itr','salary certificate form 16','tds certificate form 16','how to use form 16 itr'],
      response: () => `${greet()}<strong>📄 Form 16 — Your Most Important Tax Document!</strong><br><br>Form 16 is a TDS certificate issued by your employer. It's essential for filing your Income Tax Return (ITR).<br><br><strong>What Form 16 contains:</strong><br><br>📌 <strong>Part A — TDS Details:</strong><br>• Employer's TAN & PAN<br>• Employee's PAN<br>• Total TDS deducted quarter by quarter<br><br>📌 <strong>Part B — Income Details:</strong><br>• Gross salary<br>• All allowances and exemptions (HRA, LTA)<br>• All deductions claimed (80C, 80D)<br>• Net taxable salary<br>• Tax calculated and deducted<br><br><strong>When do you get Form 16?</strong><br>• Employer must issue by June 15 of each year<br>• For previous financial year (April–March)<br><br><strong>No Form 16?</strong><br>• Employer with no TDS deduction may not issue one<br>• You can still file ITR using salary slips + Form 26AS<br><br>💡 <em>Always verify Form 16 figures match your Form 26AS on the Income Tax portal!</em>`,
      quickReplies: ['Tax saving guide','ITR and insurance','Section 80C','Call Sachin']
    },

    /* ─── CLAIMS EXTRAS ──────────────────────────────── */
    {
      id: 'motor_theft_claim2',
      weight: 2,
      patterns: ['car theft claim process','stolen vehicle insurance claim','report stolen car insurance','insurance after car theft','vehicle stolen what to do insurance'],
      response: () => `${greet()}<strong>🚔 Step-by-Step: Motor Theft Insurance Claim Process</strong><br><br>Your vehicle was stolen. Here's exactly what to do next:<br><br><strong>Immediate Steps (within 24 hours):</strong><br>1. 🚔 File FIR at the nearest police station<br>2. 📞 Inform your insurance company immediately<br>3. 🔑 Keep BOTH sets of keys safe (you'll need them for claim)<br><br><strong>Documents to submit to insurer:</strong><br>📄 Certified copy of FIR<br>📄 Original RC (Registration Certificate)<br>📄 Both sets of keys<br>📄 Insurance policy documents<br>📄 KYC + NEFT bank details (for payout)<br>📄 No Trace Report from police (after 90 days)<br><br><strong>Claim process timeline:</strong><br>• Day 1: FIR + Intimation to insurer<br>• Day 1–90: Police investigation<br>• Day 90+: Police issues "untraceable" report<br>• Within 30 days of report: Insurer pays IDV<br><br><strong>Payout = Current IDV of vehicle</strong><br><br>⚠️ Delay reporting = claim risk. Always report within 48 hours max!<br><br>📱 Claim assistance: <strong>9013976999</strong>`,
      quickReplies: ['What is IDV?','Car insurance basics','NCB on stolen car','Call Sachin']
    },
    {
      id: 'network_nonnetwork_health',
      weight: 2,
      patterns: ['network hospital cashless','non network hospital reimbursement','cashless vs reimbursement','hospital not in network insurance','out of network hospital claim','non empanelled hospital claim'],
      response: () => `${greet()}<strong>🏥 Network vs Non-Network Hospital — What Changes in Claims?</strong><br><br>This is one of the most important distinctions in health insurance:<br><br><strong>🟢 Network Hospital (Cashless):</strong><br>• Hospital is empanelled with your insurer's TPA<br>• You show insurance card → No cash payment needed<br>• Insurer pays hospital directly<br>• Pre-authorization needed for planned surgery (24–48 hrs)<br>• Emergency: Just show card and call helpline<br><br><strong>🔴 Non-Network Hospital (Reimbursement):</strong><br>• Hospital not empanelled with insurer<br>• You pay ALL bills upfront<br>• Submit original bills within 30–60 days for reimbursement<br>• Insurer reviews and pays (minus deductibles/co-pay)<br>• Takes 15–30 days for settlement<br><br><strong>Which is better?</strong><br>• Cashless = zero stress during hospitalization<br>• Reimbursement = you choose any hospital but need cash upfront<br><br>💡 <em>Always check your insurer's network before hospitalization — Google "[insurer name] network hospitals [city]"</em>`,
      quickReplies: ['Cashless hospitalization','TPA explained','Health claim process','Call Sachin']
    },
    {
      id: 'pre_auth_surgery',
      weight: 2,
      patterns: ['pre authorization surgery','cashless approval surgery','planned hospitalization cashless','pre auth health insurance','prior approval for operation','scheduled surgery cashless process'],
      response: () => `${greet()}<strong>🏥 Pre-Authorization for Planned Surgery — Step by Step!</strong><br><br>For planned (non-emergency) surgeries at a network hospital, you need pre-authorization. Here's the process:<br><br><strong>Step 1 — Planning (3–5 days before surgery):</strong><br>• Confirm hospital is in your insurer's network<br>• Get doctor's recommendation letter & diagnosis<br>• Contact hospital's insurance desk<br><br><strong>Step 2 — Submit Pre-Auth Request:</strong><br>• Hospital sends pre-authorization form to insurer/TPA<br>• Includes: diagnosis, procedure, estimated cost, doctor details<br><br><strong>Step 3 — Insurer Review (24–48 hrs):</strong><br>• Insurer reviews policy coverage & medical necessity<br>• May ask for additional medical records<br><br><strong>Step 4 — Approval/Denial:</strong><br>✅ Approved → Go for surgery cashless<br>❌ Denied → You can appeal or switch to reimbursement mode<br><br><strong>Emergency surgery:</strong><br>• Call insurer helpline within 24 hours of admission<br>• Pre-auth done after admission (not before)<br><br>📱 Need claim help? Call Sachin: <strong>9013976999</strong>`,
      quickReplies: ['Cashless health claim','TPA role','Claim rejection','Health insurance']
    },
    {
      id: 'surveyor_ins_role',
      weight: 2,
      patterns: ['insurance surveyor','loss assessor','what does surveyor do','insurance surveyor visit','surveyor in claim process','loss survey insurance','surveyor report claim'],
      response: () => `${greet()}<strong>🔍 Insurance Surveyor — Who Are They and What Do They Do?</strong><br><br>A Surveyor (or Loss Assessor) is a licensed professional appointed by the insurance company to assess losses in large claims.<br><br><strong>When is a Surveyor appointed?</strong><br>• Motor insurance claims (for own damage)<br>• Property claims (fire, flood, burglary)<br>• Marine cargo claims<br>• Any claim above ₹50,000 (IRDAI mandates licensed surveyor for non-life claims > ₹75,000)<br><br><strong>Surveyor's responsibilities:</strong><br>✅ Inspect the damage on-site<br>✅ Verify policy coverage vs claimed items<br>✅ Assess accurate market value of loss<br>✅ Submit Survey Report to insurer<br>✅ May recommend partial/full approval or rejection<br><br><strong>Your rights during survey:</strong><br>• Be present during inspection<br>• Provide all supporting documents<br>• Can hire your own independent Loss Assessor<br>• Can dispute survey report through IRDAI grievance<br><br>💡 <em>Don't repair vehicle/property before surveyor's visit — it may invalidate your claim!</em>`,
      quickReplies: ['Claim process','Claim rejection reasons','Grievance insurance','Call Sachin']
    },
    {
      id: 'early_life_claim',
      weight: 2,
      patterns: ['early death claim life insurance','life insurance claim shortly after buying','claim within 2 years life insurance','contestability period life','contestable claim life insurance','death soon after policy purchase'],
      response: () => `${greet()}<strong>⚠️ Life Insurance Claim Within 2 Years — Special Rules!</strong><br><br>If the insured person dies within 2 years of buying a policy, the claim goes through extra scrutiny. Here's why and what to expect:<br><br><strong>The Contestability Period (2 years):</strong><br>• Insurer has the RIGHT to investigate the claim thoroughly<br>• They check: medical records, lifestyle, non-disclosure<br>• Claim paid but often with detailed investigation first<br><br><strong>What the insurer investigates:</strong><br>• Was all health information disclosed truthfully?<br>• Any pre-existing conditions hidden?<br>• Any material facts concealed?<br><br><strong>If investigation finds non-disclosure:</strong><br>❌ Claim may be reduced or rejected<br><br><strong>After 2 years (beyond contestability):</strong><br>• Much easier claim process<br>• Very few grounds for rejection<br>• IRDAI protects policyholder strongly<br><br><strong>Golden Rule:</strong><br>💡 <em>Always disclose 100% of health info when buying life insurance. Nothing to hide = nothing to fear!</em><br><br>📱 Life insurance claim help: <strong>9013976999</strong>`,
      quickReplies: ['Life insurance claim','Claim rejection reasons','Term plan','Call Sachin']
    },
    {
      id: 'multiple_policy_claim',
      weight: 2,
      patterns: ['claim from two policies','multiple health insurance claim','two health policies claim','claim both insurers','double insurance claim','multiple insurers claim'],
      response: () => `${greet()}<strong>📋 Claiming from Multiple Insurance Policies — Complete Guide!</strong><br><br>If you have two or more health insurance policies, you CAN claim from both. But rules differ by type.<br><br><strong>Health Insurance (Indemnity Plans):</strong><br>• You can claim from both, but TOTAL payout ≤ actual medical bill<br>• Use "Contribution Clause" — both insurers share the bill proportionally<br>• Best practice: File primary claim first, then file balance with second insurer<br>• Declare both policies to both insurers<br><br><strong>Life Insurance:</strong><br>• You CAN have multiple life/term policies<br>• On death — ALL policies pay their full sum assured independently<br>• No "contribution" concept — each policy pays 100%<br><br><strong>Critical Illness:</strong><br>• Usually pays a FIXED sum on diagnosis (not based on bills)<br>• Multiple CI policies → multiple payouts ✅<br><br><strong>Personal Accident:</strong><br>• Fixed benefit → multiple PA policies = multiple payouts ✅<br><br>💡 <em>Declare all existing policies when buying new ones — hiding leads to rejection!</em><br><br>📱 Portfolio review: <strong>9013976999</strong>`,
      quickReplies: ['How many policies need?','Health claim process','Life insurance','Call Sachin']
    },
    {
      id: 'natural_disaster_claim',
      weight: 2,
      patterns: ['flood claim insurance','earthquake insurance claim','cyclone damage claim','natural disaster insurance','storm claim property','flood car damage claim','act of god insurance'],
      response: () => `${greet()}<strong>🌊 Natural Disaster Insurance Claims — What's Covered?</strong><br><br>Floods, earthquakes, cyclones — "Acts of God" can devastate property and vehicles. Here's what insurance covers:<br><br><strong>Motor Insurance (Comprehensive):</strong><br>✅ Flood damage to car/bike<br>✅ Damage from fallen trees/debris<br>✅ Fire/explosion during disaster<br>⚠️ Engine waterlogging → ONLY covered if Engine Protection add-on exists<br>⚠️ Total loss → Pays IDV value<br><br><strong>Home Insurance (if you have it):</strong><br>✅ Flood, storm, cyclone damage to structure<br>✅ Earthquake damage (if opted as add-on)<br>✅ Lightning damage<br>✅ Contents damage<br><br><strong>What's typically excluded:</strong><br>❌ Damage due to landslide (unless specifically covered)<br>❌ War & nuclear perils<br><br><strong>How to claim after disaster:</strong><br>1. Document all damage (photos/videos)<br>2. Notify insurer within 48–72 hours<br>3. Don't repair before survey (or get written permission)<br>4. File FIR/Police report if area has disaster declaration<br><br>📱 Disaster claim help: <strong>9013976999</strong>`,
      quickReplies: ['Comprehensive motor','Home insurance','Claim process','Call Sachin']
    },
    {
      id: 'consumer_court_ins',
      weight: 2,
      patterns: ['insurance consumer court','complaint against insurer','insurance ombudsman','sue insurance company','insurance dispute resolution','how to fight insurer','unfair claim rejection complaint'],
      response: () => `${greet()}<strong>⚖️ Fighting Unfair Insurance Claim Rejections — Your Rights!</strong><br><br>If your insurance claim was unfairly rejected, you have multiple escalation options:<br><br><strong>Level 1 — Internal Grievance (try first):</strong><br>• Write to insurer's Grievance Officer (email works)<br>• They must respond within 15 working days<br>• Reference: IRDAI Circular on Grievance Redressal<br><br><strong>Level 2 — IRDAI Bima Bharosa Portal:</strong><br>• File at: bimabharosa.irdai.gov.in<br>• IRDAI will direct insurer to respond<br>• Free, online process<br><br><strong>Level 3 — Insurance Ombudsman:</strong><br>• 17 Ombudsman offices across India (free service!)<br>• For claims up to ₹50 lakh (post 2021)<br>• Decision within 3 months<br>• Binding on insurer (you can still go to court if unsatisfied)<br><br><strong>Level 4 — Consumer Forum / NCDRC:</strong><br>• If claim > ₹50L or Ombudsman unsatisfactory<br>• Consumer Protection Act 2019 protects you<br><br>💡 <em>Keep ALL policy documents, claim documents, and correspondence safely!</em><br><br>📱 Sachin can guide your complaint: <strong>9013976999</strong>`,
      quickReplies: ['Claim rejection reasons','Grievance process','IRDAI','Call Sachin']
    },



    /* ─── POLICY MANAGEMENT EXTRAS ──────────────────── */
    {
      id: 'update_details_ins',
      weight: 2,
      patterns: ['update insurance details','change address insurance','update contact insurance','change mobile number policy','change email insurance','update nominee details','edit policy information'],
      response: () => `${greet()}<strong>✏️ Updating Your Insurance Policy Details — Easy Steps!</strong><br><br>Life changes — your insurance details should stay updated. Here's how to make changes:<br><br><strong>Changes you can make:</strong><br>📝 Nominee name/details<br>📝 Contact number & email<br>📝 Correspondence address<br>📝 Bank details (for claims)<br>📝 Marital status<br><br><strong>How to update (multiple options):</strong><br>1. <strong>Online:</strong> Login to insurer's website/app → Policy → Edit Details<br>2. <strong>Email:</strong> Send request to insurer's customer service email with documents<br>3. <strong>Branch visit:</strong> Fill endorsement form + submit documents<br>4. <strong>Through advisor:</strong> Sachin can help process changes<br><br><strong>Documents typically needed:</strong><br>• Proof of new details (Aadhaar/utility bill for address)<br>• Signed request letter<br>• Policy number<br><br>⚠️ <strong>Always update nominee details after marriage, birth of child, or death of existing nominee!</strong><br><br>📱 Policy update assistance: <strong>9013976999</strong>`,
      quickReplies: ['Nominee update','Portability','Auto renewal','Call Sachin']
    },
    {
      id: 'duplicate_policy_doc',
      weight: 2,
      patterns: ['lost policy document','duplicate policy copy','policy document lost','how to get duplicate policy','insurance bond lost','policy certificate lost','reissue policy document'],
      response: () => `${greet()}<strong>📄 Lost Your Insurance Policy Document? Here's What To Do!</strong><br><br>Don't panic — lost insurance documents can be replaced. And modern insurance is mostly digital anyway!<br><br><strong>Getting a duplicate policy document:</strong><br><br>📌 <strong>Online (easiest):</strong><br>• Login to insurer's website or app<br>• Download policy PDF from your account<br>• This is legally valid<br><br>📌 <strong>Through DigiLocker:</strong><br>• Many insurers push policies to DigiLocker<br>• Download from digilocker.gov.in (government platform)<br><br>📌 <strong>Email request:</strong><br>• Write to insurer's customer service<br>• Provide: policy number, DOB, registered mobile<br>• They'll email a digital copy<br><br>📌 <strong>Physical duplicate (for older policies):</strong><br>• Submit indemnity bond (notarized)<br>• FIR copy (if stolen)<br>• Small fee may apply<br>• 7–15 working days for physical copy<br><br>💡 <em>Best practice: Save policy PDFs in email, DigiLocker, AND Google Drive for backup!</em><br><br>📱 Document help: <strong>9013976999</strong>`,
      quickReplies: ['DigiLocker insurance','Policy management','Renewal help','Call Sachin']
    },
    {
      id: 'auto_renewal_ins',
      weight: 2,
      patterns: ['auto renewal insurance','automatic policy renewal','insurance auto debit renewal','auto renew motor health','should i auto renew insurance','auto renewal pros cons'],
      response: () => `${greet()}<strong>🔁 Auto-Renewal Insurance — Pros & Cons to Know!</strong><br><br>Most insurers now offer auto-renewal (automatic payment deduction). Here's the complete picture:<br><br><strong>Benefits of auto-renewal:</strong><br>✅ Never forget to renew — no lapse in coverage<br>✅ No-Claim Bonus preserved automatically<br>✅ Pre-approved paperwork saves time<br>✅ Some insurers give 2–3% discount for auto-renewal<br><br><strong>Risks/Downsides of auto-renewal:</strong><br>⚠️ Premium increases may go unnoticed<br>⚠️ You may miss better deals from other insurers<br>⚠️ IDV for motor may be set lower than ideal<br>⚠️ Cover amount for health may not have kept up with inflation<br><br><strong>Best practice:</strong><br>• Enable auto-renewal to avoid lapse<br>• BUT review your policy 30–45 days before renewal<br>• Check: premium change, coverage adequacy, better alternatives<br>• Cancel auto-renewal only AFTER you've arranged alternate cover<br><br>💡 <em>Auto-renewal = convenience. Annual review = smart insurance!</em><br><br>📱 Policy review consultation: <strong>9013976999</strong>`,
      quickReplies: ['Renewal tips','Compare insurers','Motor renewal','Call Sachin']
    },
    {
      id: 'payment_modes_ins',
      weight: 2,
      patterns: ['insurance payment methods','pay premium online','insurance premium UPI','how to pay insurance premium','premium payment options','insurance payment modes','emi insurance premium'],
      response: () => `${greet()}<strong>💳 Insurance Premium Payment Methods — All Options!</strong><br><br>Paying your insurance premium is easier than ever. Here are all the ways:<br><br><strong>Online Payment Methods:</strong><br>✅ Net Banking<br>✅ UPI (PhonePe, GPay, Paytm, BHIM)<br>✅ Credit Card / Debit Card<br>✅ NEFT/RTGS (for large premiums)<br>✅ NACH/ECS Auto Debit (for EMI)<br><br><strong>Offline Payment Methods:</strong><br>✅ Cash at insurer branch<br>✅ Cheque payment<br>✅ NEFT/IMPS transfer<br>✅ Through insurance agent<br><br><strong>EMI options:</strong><br>• Monthly, quarterly, half-yearly<br>• Credit card EMI for large premiums (check if insurer supports)<br>• Auto-debit NACH mandate<br><br><strong>Premium payment apps:</strong><br>• Insurer's own app (most convenient)<br>• PolicyBazaar, Coverfox (comparison + payment)<br>• BankBazaar<br><br>💡 <em>Save your payment receipts digitally — you'll need them for tax deductions!</em><br><br>📱 Premium assistance: <strong>9013976999</strong>`,
      quickReplies: ['Premium frequency','Auto renewal','Policy management','Call Sachin']
    },
    {
      id: 'policy_schedule_understand',
      weight: 2,
      patterns: ['policy schedule','read insurance policy','understand policy document','what is policy schedule','policy terms document','how to read insurance policy','insurance policy document explained'],
      response: () => `${greet()}<strong>📋 How to Read Your Insurance Policy Schedule!</strong><br><br>Your policy document has key sections. Here's what each means:<br><br><strong>Key sections to check:</strong><br><br>📌 <strong>Policy Schedule (first page):</strong><br>• Your name, address, DOB — check for errors!<br>• Policy number, start & end date<br>• Sum Insured / Sum Assured<br>• Premium amount & frequency<br>• Nominee name — critical!<br><br>📌 <strong>Coverage / Benefits Section:</strong><br>• What exactly is covered<br>• Sub-limits (especially in health — room rent, ICU limits)<br>• Waiting periods<br><br>📌 <strong>Exclusions Section:</strong><br>• What is NOT covered — READ THIS CAREFULLY!<br><br>📌 <strong>Claims Procedure:</strong><br>• How to file a claim<br>• Claim intimation timeline<br><br>📌 <strong>Endorsements (if any):</strong><br>• Any changes made to the base policy<br><br>⚠️ <em>Most people never read their policy until claim time — read it within the free-look period and ask questions!</em><br><br>📱 Policy review assistance: <strong>9013976999</strong>`,
      quickReplies: ['Free look period','Claim process','Policy renewal','Call Sachin']
    },
    {
      id: 'change_insurer',
      weight: 2,
      patterns: ['switch insurance company','change health insurer','move to different insurance','portability switch insurer','better insurance company switch','leaving current insurer'],
      response: () => `${greet()}<strong>🔄 Switching Your Insurance Company — Smart Moves!</strong><br><br>Unhappy with your insurer? You can switch — here's how to do it right:<br><br><strong>For Health Insurance (Portability):</strong><br>• Apply to new insurer 45 days BEFORE your renewal date<br>• Credit for waiting periods served carries over<br>• Pre-existing disease waiting not restarted<br>• NCB accumulated may transfer (some insurers)<br><br><strong>For Motor Insurance:</strong><br>• No portability concept — just renew with different insurer<br>• NCB follows YOU (not the car) — get NCB certificate<br>• Can switch at any renewal<br><br><strong>For Life/Term Insurance:</strong><br>• Cannot "transfer" — buy new, then cancel old<br>• Wait for new policy to be fully accepted before cancelling old<br>• Don't let coverage lapse!<br><br><strong>When should you switch?</strong><br>• Better premium at same coverage<br>• Better network hospitals<br>• Poor claim settlement experience<br>• Better features in new plan<br><br>💡 <em>Compare claim settlement ratio (CSR) of new insurer — choose above 95%!</em><br><br>📱 Get switching guidance: <strong>9013976999</strong>`,
      quickReplies: ['Health portability','NCB transfer','Compare insurers','Call Sachin']
    },
    {
      id: 'insurance_will_estate',
      weight: 2,
      patterns: ['insurance and will','insurance estate planning','life insurance will','nomination vs will insurance','insurance after death planning','inheritance insurance','policy after death'],
      response: () => `${greet()}<strong>📜 Insurance, Wills & Estate Planning — Connecting the Dots!</strong><br><br>Insurance and estate planning work together to protect your family. Here's the relationship:<br><br><strong>Nomination in Insurance:</strong><br>• Nominee receives policy proceeds directly on death<br>• Quick claim settlement — no probate needed<br>• Nominee is just a "trustee" — they must pass money to legal heirs<br><br><strong>How Will affects insurance:</strong><br>• A Will can direct how insurance proceeds should be distributed<br>• Without a Will: legal heirs determined by personal law (Hindu/Muslim/Christian)<br>• With MWP Act (Married Women's Property Act):<br>  → Policy creates a TRUST — only wife & children can claim<br>  → Protected from creditors even in bankruptcy!<br><br><strong>Estate planning basics:</strong><br>✅ Write a Will (everyone should have one)<br>✅ Keep nominations updated<br>✅ Consider MWP Act for term plans<br>✅ Consider HUF for tax efficiency<br><br>💡 <em>Without a Will + proper nomination = family disputes and court fights after death!</em><br><br>📱 Estate planning consultation: <strong>9013976999</strong>`,
      quickReplies: ['Nominee update','MWP act','Life insurance','Call Sachin']
    },

    /* ─── LIFE SITUATIONS EXTRAS ────────────────────── */
    {
      id: 'disability_life_ins',
      weight: 2,
      patterns: ['disabled person insurance','insurance for disability','physically challenged insurance','wheelchair insurance','disability health insurance','insurance with disability'],
      response: () => `${greet()}<strong>♿ Insurance for People with Disabilities — Your Rights!</strong><br><br>People with disabilities face unique challenges in getting insurance. Here's what to know:<br><br><strong>Your rights (IRDAI guidelines):</strong><br>• Insurers CANNOT refuse health insurance solely on grounds of disability<br>• They can add loading (extra premium) or exclusions for disability-related conditions<br>• IRDAI Circular 2020 mandates insurers to offer basic health cover to disabled individuals<br><br><strong>Best options available:</strong><br>✅ <strong>Health Insurance:</strong> Standard floater plans (some loading may apply)<br>✅ <strong>Personal Accident:</strong> Covers future accidents (existing disability excluded)<br>✅ <strong>Term Life Insurance:</strong> Subject to medical underwriting — possible with loading<br>✅ <strong>Govt Schemes:</strong> Ayushman Bharat covers disabled individuals<br><br><strong>Tax benefits for disabled individuals:</strong><br>📌 Section 80U: ₹75,000 (40–80% disability) / ₹1,25,000 (80%+ disability) deduction<br>📌 Section 80DD: Deduction for expenses on disabled dependent<br><br>📱 Disability-specific insurance planning: <strong>9013976999</strong>`,
      quickReplies: ['Health insurance','Govt schemes','Personal accident','Call Sachin']
    },
    {
      id: 'job_loss_ins_advice',
      weight: 2,
      patterns: ['lost my job insurance','insurance after job loss','unemployed insurance','insurance if company shuts down','what to do insurance after layoff','insurance between jobs'],
      response: () => `${greet()}<strong>😟 Lost Your Job? Here's Your Insurance Action Plan!</strong><br><br>Job loss is stressful. Your insurance shouldn't add to it. Here's what to do immediately:<br><br><strong>Immediate Actions (within 30 days):</strong><br><br>🏥 <strong>Health Insurance:</strong><br>• Employer health coverage ends on last working day<br>• Quickly buy individual/family health insurance<br>• Port from group policy if possible (within 30 days)<br>• Don't let coverage lapse — medical emergency has no timeline!<br><br>🛡️ <strong>Life/Term Insurance:</strong><br>• Personal term plan → continues regardless of job (you pay directly)<br>• Group term from employer → ENDS! If you only had employer term, buy individual plan NOW<br><br>💰 <strong>Emergency Fund:</strong><br>• Use emergency fund first, don't surrender insurance<br>• Surrendering LIC/endowment = big financial loss<br><br><strong>Job Loss Insurance:</strong><br>Some insurers offer "job loss" riders — check if you have one.<br><br>💡 <em>Best protection: Always have your OWN personal policies — never depend solely on employer's group insurance!</em><br><br>📱 Emergency insurance consultation: <strong>9013976999</strong>`,
      quickReplies: ['Health insurance urgently','Term plan','Emergency fund','Call Sachin']
    },
    {
      id: 'single_parent_ins',
      weight: 2,
      patterns: ['single parent insurance','single mother insurance','single father insurance','solo parent insurance needs','divorced insurance planning','widowed insurance needs'],
      response: () => `${greet()}<strong>👩‍👧 Insurance for Single Parents — Double the Responsibility!</strong><br><br>As a single parent, you are the ONLY financial safety net for your child. Your insurance needs are critical.<br><br><strong>Essential insurance checklist for single parents:</strong><br><br>🛡️ <strong>Term Life Insurance (MUST HAVE):</strong><br>• Cover = 15–20× annual income (higher than average — no backup earner!)<br>• Include child's education costs in cover calculation<br><br>🏥 <strong>Health Insurance:</strong><br>• Family floater covering you + child(ren)<br>• Min ₹10–15L cover<br><br>💀 <strong>Personal Accident + Critical Illness:</strong><br>• Disability means no income and child at risk<br>• Critical illness pays lump sum for major diagnosis<br><br>👶 <strong>Child Plan / Education Plan:</strong><br>• Secures child's education even if you're gone<br>• Waiver of premium feature is critical<br><br><strong>Special tip:</strong><br>💡 Assign a trusted guardian in your Will for the child AND ensure they know about all your policies.<br><br>📱 Single parent protection plan: <strong>9013976999</strong>`,
      quickReplies: ['Child education plan','Term insurance','Family health plan','Call Sachin']
    },
    {
      id: 'joint_family_ins',
      weight: 2,
      patterns: ['joint family insurance','large family insurance','insurance for joint family','family of 8 insurance','grandparents insurance family','extended family insurance'],
      response: () => `${greet()}<strong>👨‍👩‍👧‍👦 Insurance for Joint Families — What Works Best!</strong><br><br>Joint families have unique insurance dynamics. Here's the smart approach:<br><br><strong>Health Insurance Strategy:</strong><br><br>📌 <strong>Option 1 — Multi-generational Family Floater:</strong><br>• Single policy for all members<br>• Cheaper premium than individual policies<br>• Risk: One elderly person's claims can exhaust pool<br>• Tip: Max entry age check (usually 60–65 for floater)<br><br>📌 <strong>Option 2 — Split strategy (Recommended):</strong><br>• Young family (parents + kids): One floater<br>• Grandparents: Separate senior citizen policy<br>• Reason: Senior claims don't affect younger family's NCB<br><br><strong>Life Insurance:</strong><br>• Each earning member needs individual term plan<br>• Homemakers need cover too (replacement cost)<br><br><strong>Property:</strong><br>• One home insurance covers the joint family home<br>• Specify contents clearly — jewellery, electronics<br><br>💡 <em>In a joint family, if one person has no health cover and gets hospitalized — everyone pays!</em><br><br>📱 Joint family insurance planning: <strong>9013976999</strong>`,
      quickReplies: ['Family floater health','Senior health insurance','Home insurance','Call Sachin']
    },
    {
      id: 'hazardous_job_ins',
      weight: 2,
      patterns: ['army insurance','police insurance','dangerous job insurance','defence forces insurance','paramilitary insurance','coal miner insurance','high danger job insurance'],
      response: () => `${greet()}<strong>⚠️ Insurance for Hazardous Jobs (Army, Police, Miners)</strong><br><br>If you work in defence forces, police, mining, or other high-risk jobs — here's what to know about insurance:<br><br><strong>Defence Forces (Army/Navy/Air Force):</strong><br>• AGIF (Army Group Insurance Fund) — mandatory group life insurance<br>• ECHS (Ex-Servicemen Contributory Health Scheme) — post-retirement<br>• PBOR (Personnel Below Officer Rank) — specific schemes<br>• War risk coverage included in service policies<br><br><strong>Police Personnel:</strong><br>• State government provides group insurance<br>• CGHS (Central Government Health Scheme) for central services<br>• Separate personal policies recommended<br><br><strong>Private sector hazardous jobs:</strong><br>• Workmen's Compensation: Employer's obligation<br>• Personal Accident: May have occupational loading<br>• Declare occupation honestly — claim rejection risk if hidden<br><br><strong>Additional tip:</strong><br>Life insurers classify occupations as Class I–IV. Hazardous jobs may have higher premiums or exclusions.<br><br>📱 Specialized coverage consultation: <strong>9013976999</strong>`,
      quickReplies: ['Personal accident','Workmen compensation','Life insurance','Call Sachin']
    },
    {
      id: 'relocate_abroad_ins',
      weight: 2,
      patterns: ['moving abroad insurance','relocating internationally insurance','expat insurance','insurance when moving overseas','NRI insurance from india','insurance for overseas relocation','going to work abroad insurance'],
      response: () => `${greet()}<strong>🌍 Moving Abroad? Your Insurance Checklist!</strong><br><br>Relocating internationally changes your insurance needs significantly. Plan before you leave:<br><br><strong>What to do with Indian policies:</strong><br><br>🛡️ <strong>Term Life Insurance:</strong><br>• Continues as long as you pay premiums (even from abroad)<br>• Nominees in India can claim without issues<br>• Buy before you leave — easier when still resident<br><br>🏥 <strong>Health Insurance:</strong><br>• Indian health policy doesn't work abroad<br>• Either port to NRI-specific plan OR pause/lapse<br>• Buy international health insurance in destination country<br>• Student abroad: Buy student international health plan<br><br>🚗 <strong>Motor Insurance:</strong><br>• Cancel Indian motor policy if car not in use<br>• Or gift/sell car to family — transfer insurance<br><br>🏠 <strong>Home Insurance:</strong><br>• Continue if you own property in India<br>• Vacancy clause — inform insurer if home will be unoccupied<br><br>💡 <em>Buy term insurance NOW, before leaving. Health abroad: buy local or international plan.</em><br><br>📱 NRI insurance planning: <strong>9013976999</strong>`,
      quickReplies: ['NRI insurance','Term plan before going abroad','International health','Call Sachin']
    },

    /* ─── GOVT SCHEMES EXTRAS ────────────────────────── */
    {
      id: 'pmfby_crop',
      weight: 2,
      patterns: ['pmfby','pradhan mantri fasal bima yojana','crop insurance','farm insurance','agricultural insurance','kisan insurance','farmer crop protection'],
      response: () => `${greet()}<strong>🌾 PMFBY — Pradhan Mantri Fasal Bima Yojana (Crop Insurance)</strong><br><br>India's flagship crop insurance scheme protects farmers from crop failure due to natural calamities.<br><br><strong>Coverage:</strong><br>✅ Natural calamities (drought, flood, hailstorm, cyclone)<br>✅ Pest & disease attacks<br>✅ Post-harvest losses (for specified crops)<br>✅ Prevented sowing (if calamity prevents planting)<br><br><strong>Premium rates (farmer's share):</strong><br>• Kharif crops: Max 2% of sum insured<br>• Rabi crops: Max 1.5%<br>• Commercial/horticultural crops: Max 5%<br>• Government pays remaining premium<br><br><strong>Who can apply:</strong><br>• All farmers (loanee and non-loanee)<br>• Sharecroppers and tenant farmers also eligible<br><br><strong>How to enroll:</strong><br>• Through nearest Bank/CSC/PM Fasal Bima mobile app<br>• Deadline: Cut-off date before sowing season<br><br><strong>Claim process:</strong><br>• Report crop loss within 72 hours to insurer/bank/Krishi Vibhag<br><br>📱 Farmer insurance guidance: <strong>9013976999</strong>`,
      quickReplies: ['Govt schemes list','Kisan insurance','Agricultural help','Call Sachin']
    },
    {
      id: 'pmvvy_scheme',
      weight: 2,
      patterns: ['pmvvy','pradhan mantri vaya vandana yojana','senior pension scheme govt','pension for 60 plus govt','lIC senior pension','guaranteed pension senior'],
      response: () => `${greet()}<strong>👴 PMVVY — Pradhan Mantri Vaya Vandana Yojana</strong><br><br>PMVVY is a government-backed pension scheme for senior citizens (60+) managed by LIC of India.<br><br><strong>Key features:</strong><br>• <strong>Investment:</strong> Lump sum (max ₹15 lakh per senior)<br>• <strong>Guaranteed return:</strong> 7.4% per annum (fixed)<br>• <strong>Pension options:</strong> Monthly, quarterly, half-yearly, or annual<br>• <strong>Tenure:</strong> 10 years<br>• <strong>On death:</strong> Purchase price returned to nominee<br>• <strong>Loan facility:</strong> Up to 75% of purchase price after 3 years<br><br><strong>Example:</strong><br>Invest ₹15L → Monthly pension: ~₹9,250/month for 10 years<br><br><strong>Tax treatment:</strong><br>• Pension is taxable as income<br>• No TDS on pension (inform bank)<br><br><strong>Where to buy:</strong><br>• LIC branches (only LIC manages PMVVY)<br>• LIC website<br>• Validity: Extended till March 31, 2023 (check current status)<br><br>📱 Senior pension planning: <strong>9013976999</strong>`,
      quickReplies: ['NPS for senior','Annuity plans','SCSS scheme','Call Sachin']
    },
    {
      id: 'scss_scheme',
      weight: 2,
      patterns: ['scss','senior citizen saving scheme','senior savings account','scss post office','8 percent senior scheme','senior citizen deposit scheme'],
      response: () => `${greet()}<strong>🏦 SCSS — Senior Citizen Saving Scheme (Best Safe Returns!)</strong><br><br>SCSS is one of the best government-backed savings instruments for senior citizens.<br><br><strong>Key details:</strong><br>📌 <strong>Interest rate:</strong> 8.2% p.a. (Q1 FY25 — highest safe return!)<br>📌 <strong>Eligibility:</strong> 60+ years (or 55+ if retired on superannuation)<br>📌 <strong>Max investment:</strong> ₹30 lakh per person<br>📌 <strong>Tenure:</strong> 5 years (extendable by 3 more years)<br>📌 <strong>Interest payout:</strong> Quarterly (great for regular income)<br>📌 <strong>Tax benefit:</strong> Qualifies for 80C deduction!<br>📌 <strong>Premature closure:</strong> Allowed with penalty<br><br><strong>Where to open:</strong><br>• Any post office<br>• Authorized banks (SBI, HDFC, ICICI, etc.)<br><br><strong>SCSS vs FD comparison:</strong><br>• SCSS: 8.2% — government guaranteed<br>• Bank FD: 6.5–7.5% — lower rate, not 80C eligible<br><br>💡 <em>Retire + Put ₹30L in SCSS = ₹61,500/quarter guaranteed income!</em><br><br>📱 Senior financial planning: <strong>9013976999</strong>`,
      quickReplies: ['PMVVY scheme','Senior tax planning','PPF scheme','Call Sachin']
    },
    {
      id: 'epf_insurance_conn',
      weight: 2,
      patterns: ['epf insurance','provident fund insurance','edli scheme','employee deposit linked insurance','pf life cover','epf death benefit','employee provident fund insurance'],
      response: () => `${greet()}<strong>🏭 EDLI — Employee Deposit Linked Insurance (Free Life Cover from EPF!)</strong><br><br>Did you know every EPF member gets FREE life insurance through EDLI (Employee Deposit Linked Insurance Scheme)?<br><br><strong>EDLI Key Facts:</strong><br>• <strong>Coverage:</strong> 30× average monthly wages in last 12 months<br>• <strong>Maximum:</strong> ₹7 lakh (as of latest revision)<br>• <strong>Minimum:</strong> ₹2.5 lakh<br>• <strong>Premium:</strong> ZERO for employee — employer pays 0.5% of wages<br>• <strong>Eligibility:</strong> All EPF members (active on date of death)<br><br><strong>How to claim EDLI death benefit:</strong><br>1. Nominee/legal heir applies to EPFO office<br>2. Submit: Death certificate, EPF account details, nominee documents<br>3. Claim settled within 30 days<br><br><strong>Important limitation:</strong><br>• EDLI max ₹7L is insufficient for most families (need at least ₹50L–₹1Cr term plan additionally)<br>• Only covers death while in active employment<br><br>💡 <em>EDLI is a bonus — NOT a replacement for your own term insurance!</em><br><br>📱 Complete life protection planning: <strong>9013976999</strong>`,
      quickReplies: ['Term insurance','Life insurance basics','Govt schemes','Call Sachin']
    },
    {
      id: 'esic_scheme',
      weight: 2,
      patterns: ['esic','employees state insurance','esi scheme','esic hospital','esic benefit','employee state insurance corporation','factory worker insurance'],
      response: () => `${greet()}<strong>🏥 ESIC — Employees' State Insurance Corporation</strong><br><br>ESIC is a social security scheme providing comprehensive medical and financial benefits to factory and organized sector workers.<br><br><strong>Who is covered:</strong><br>• Employees earning ≤ ₹21,000/month<br>• In factories, shops, hotels, restaurants, cinemas, offices<br><br><strong>Contribution rates:</strong><br>• Employee: 0.75% of wages<br>• Employer: 3.25% of wages<br><br><strong>Benefits provided:</strong><br>✅ <strong>Medical care:</strong> Free treatment at ESIC hospitals for self & family<br>✅ <strong>Sickness benefit:</strong> 70% wages for up to 91 days<br>✅ <strong>Maternity benefit:</strong> 100% wages for 26 weeks<br>✅ <strong>Disablement benefit:</strong> 90% wages (temporary disability)<br>✅ <strong>Dependant's benefit:</strong> 90% wages to family on employee's death<br>✅ <strong>Funeral expenses:</strong> ₹15,000 lump sum<br><br>💡 <em>ESIC hospitals have improved significantly. But if your salary exceeds ₹21K/month, you need your own health insurance!</em>`,
      quickReplies: ['Health insurance','Govt schemes','EPF insurance','Call Sachin']
    },
    {
      id: 'saral_jeevan',
      weight: 2,
      patterns: ['saral jeevan bima','standard life insurance','simple term plan','saral term insurance','simple life policy india','standard insurance product'],
      response: () => `${greet()}<strong>🛡️ Saral Jeevan Bima — India's Standardized Term Insurance!</strong><br><br>IRDAI introduced Saral Jeevan Bima — a simple, standardized term life insurance product that every insurer must offer.<br><br><strong>Key features:</strong><br>📌 <strong>Sum Assured:</strong> ₹5 lakh to ₹25 lakh<br>📌 <strong>Policy term:</strong> 5 to 40 years<br>📌 <strong>Entry age:</strong> 18–65 years<br>📌 <strong>Coverage:</strong> Life cover only (no riders)<br>📌 <strong>Death benefit:</strong> 100% sum assured on death (any cause after waiting period)<br>📌 <strong>Waiting period:</strong> 45 days (death by accident: no waiting period)<br><br><strong>Why Saral Jeevan Bima?</strong><br>• Simple — standard policy across all insurers<br>• Easy to compare (same features everywhere)<br>• No rejection based on occupation (most occupations covered)<br>• Great for first-time life insurance buyers<br><br><strong>Who should consider it:</strong><br>• Those who want simple ₹25L life cover<br>• People who find regular term plans confusing<br>• Budget-conscious buyers<br><br>💡 <em>For higher cover (₹50L+), a regular term plan is better and often cheaper per lakh!</em>`,
      quickReplies: ['Term insurance','Life insurance basics','How much cover?','Call Sachin']
    },
    {
      id: 'arogya_sanjeevani',
      weight: 2,
      patterns: ['arogya sanjeevani','standard health policy','simple health insurance','basic health insurance india','arogya standard policy','standard health product'],
      response: () => `${greet()}<strong>🏥 Arogya Sanjeevani — India's Standardized Health Insurance!</strong><br><br>Just like Saral Jeevan Bima for life, IRDAI created Arogya Sanjeevani — a standard health insurance policy that ALL general insurers must offer.<br><br><strong>Key features:</strong><br>📌 <strong>Sum Insured:</strong> ₹1 lakh to ₹5 lakh<br>📌 <strong>Entry age:</strong> 18–65 years (children from 3 months)<br>📌 <strong>Available:</strong> Individual or family floater<br>📌 <strong>Co-payment:</strong> 5% of claim amount<br>📌 <strong>Room rent:</strong> 2% of SI per day (max ₹5,000 for basic rooms)<br><br><strong>What it covers:</strong><br>✅ Hospitalization expenses<br>✅ ICU charges up to 5% of SI per day<br>✅ Pre & post hospitalization (30/60 days)<br>✅ Cataract surgery, AYUSH treatment<br>✅ COVID-19<br><br><strong>Why buy Arogya Sanjeevani?</strong><br>• Same features across all insurers — easy comparison<br>• Affordable premium for basic coverage<br>• Good for first-time health insurance buyers<br>• Top-up it with a super top-up for more coverage<br><br>📱 Get the right health plan: <strong>9013976999</strong>`,
      quickReplies: ['Health insurance basics','Super top-up','Family floater','Call Sachin']
    },
    {
      id: 'railway_ins',
      weight: 2,
      patterns: ['railway insurance','train travel insurance','irctc insurance','railway accident insurance','rail travel insurance','train ticket insurance'],
      response: () => `${greet()}<strong>🚂 Railway Travel Insurance — Just 35 Paise for ₹10 Lakh Cover!</strong><br><br>IRCTC offers one of the cheapest insurance products in the world — ₹0.35 (35 paise!) for ₹10 lakh accident cover on each train ticket!<br><br><strong>What IRCTC travel insurance covers:</strong><br>✅ Accidental death: ₹10 lakh<br>✅ Permanent total disability: ₹10 lakh<br>✅ Permanent partial disability: Up to ₹7.5 lakh<br>✅ Hospitalization for injury: Up to ₹2 lakh<br>✅ Transportation of mortal remains: ₹10,000<br><br><strong>How to opt in:</strong><br>• While booking ticket on IRCTC website/app<br>• Check the insurance opt-in option<br>• Premium (₹0.35) added to ticket cost<br><br><strong>For filing a claim:</strong><br>• Nominee must report accident to Railway authorities<br>• File claim with designated insurer (mentioned in policy)<br>• Within 4 months of accident<br><br>💡 <em>ALWAYS opt for this! At 35 paise, it's the world's best value insurance!</em><br><br>📱 Need help with railway insurance claim: <strong>9013976999</strong>`,
      quickReplies: ['Travel insurance','Personal accident','Govt schemes','Call Sachin']
    },
    {
      id: 'state_health_schemes',
      weight: 2,
      patterns: ['state health scheme','state government health insurance','mahatma jyotiba phule scheme','chief minister health scheme','yeshasvini scheme','mukhyamantri health scheme','state medical scheme'],
      response: () => `${greet()}<strong>🏥 State Government Health Schemes — State-Level Health Protection!</strong><br><br>Beyond central schemes, many Indian states run their own health insurance programs for residents:<br><br><strong>Major State Health Schemes:</strong><br>📌 <strong>Maharashtra:</strong> Mahatma Jyotiba Phule Jan Arogya Yojana (₹5L cover)<br>📌 <strong>Karnataka:</strong> Arogya Karnataka (free treatment in govt hospitals)<br>📌 <strong>Tamil Nadu:</strong> Chief Minister's Comprehensive Health Insurance (₹5L)<br>📌 <strong>Andhra Pradesh:</strong> YSR Aarogyasri (₹5L + free medicines)<br>📌 <strong>Telangana:</strong> Aarogyasri (₹10L for below poverty line)<br>📌 <strong>Delhi:</strong> Ayushman Bharat + Delhi Arogya Kosh<br>📌 <strong>Kerala:</strong> Karunya Health Scheme<br><br><strong>Who qualifies:</strong><br>• Usually below-poverty-line (BPL) families<br>• Some states extend to all residents<br>• Requires state resident proof<br><br>💡 <em>These schemes complement Ayushman Bharat. Check your state's specific program!</em><br><br>📱 Health coverage guidance: <strong>9013976999</strong>`,
      quickReplies: ['Ayushman Bharat','Govt schemes list','Health insurance','Call Sachin']
    },
    {
      id: 'jan_dhan_ins',
      weight: 2,
      patterns: ['jan dhan insurance','pmjdy insurance','jan dhan account insurance','zero balance account insurance','basic savings account insurance','jan dhan yojana benefit'],
      response: () => `${greet()}<strong>🏦 Jan Dhan + Insurance — Hidden Benefits of Your Jan Dhan Account!</strong><br><br>Pradhan Mantri Jan Dhan Yojana (PMJDY) accounts come with built-in insurance benefits most account holders don't know about!<br><br><strong>Insurance benefits with Jan Dhan account:</strong><br><br>📌 <strong>Accidental Insurance:</strong><br>• RuPay card holders: ₹2 lakh accidental death cover<br>• Must have made 1 transaction in 90 days before accident<br>• Free — no premium!<br><br>📌 <strong>Life Insurance (for eligible accounts):</strong><br>• ₹30,000 life cover (for accounts opened Oct 2014 – Jan 2015)<br>• This cover has expired for most old accounts<br><br><strong>How to claim RuPay accidental insurance:</strong><br>• Nominee files claim with bank<br>• Death certificate + FIR (if applicable)<br>• Bank forwards to National Payments Corporation<br><br><strong>What you also get:</strong><br>• Overdraft up to ₹10,000<br>• Access to PMJJBY and PMSBY at subsidized rates<br><br>💡 <em>Make sure your Jan Dhan RuPay card is active and you use it regularly to maintain the free insurance!</em>`,
      quickReplies: ['PMJJBY scheme','Govt schemes','Health insurance','Call Sachin']
    },
    {
      id: 'kcc_insurance',
      weight: 2,
      patterns: ['kcc insurance','kisan credit card insurance','farmer loan insurance','kcc crop insurance','credit card farmer insurance','agricultural credit insurance'],
      response: () => `${greet()}<strong>🌾 Kisan Credit Card (KCC) & Linked Insurance!</strong><br><br>Kisan Credit Card is not just a loan facility — it comes with built-in insurance protection for farmers!<br><br><strong>Insurance bundled with KCC:</strong><br><br>📌 <strong>Personal Accident Insurance:</strong><br>• Accidental death: ₹50,000<br>• Permanent disability: ₹25,000<br>• Premium: ₹15/year (very nominal!)<br><br>📌 <strong>Asset Insurance:</strong><br>• Coverage for assets purchased through KCC loan<br>• Agricultural equipment, cattle, crops<br><br>📌 <strong>PMFBY (Fasal Bima) Integration:</strong><br>• Crop insurance can be linked to KCC<br>• Premium deducted from KCC account automatically<br>• Banks may enroll KCC holders compulsorily (can opt out)<br><br><strong>How to claim KCC insurance:</strong><br>• Contact your issuing bank (SBI, cooperative banks, etc.)<br>• Submit accident report / crop loss report<br>• Bank coordinates with insurer<br><br>💡 <em>All farmers with KCC — know your insurance rights! Banks must explain benefits to you.</em><br><br>📱 Farmer insurance consultation: <strong>9013976999</strong>`,
      quickReplies: ['Crop insurance','Govt schemes','Farm insurance','Call Sachin']
    },
    {
      id: 'nsc_kvp_schemes',
      weight: 2,
      patterns: ['nsc','kvp','national savings certificate','kisan vikas patra','post office savings','fixed return post office','government savings schemes'],
      response: () => `${greet()}<strong>📯 NSC & KVP — Safe Post Office Savings Schemes!</strong><br><br>These government-backed post office schemes are among the safest investments in India with guaranteed returns.<br><br><strong>National Savings Certificate (NSC):</strong><br>• <strong>Interest:</strong> 7.7% p.a. (Q1 FY25), compounded annually, paid at maturity<br>• <strong>Maturity:</strong> 5 years<br>• <strong>Tax benefit:</strong> Investment qualifies for Section 80C deduction<br>• <strong>Min investment:</strong> ₹1,000 (no maximum!)<br>• <strong>TDS:</strong> No TDS, but interest is taxable income<br><br><strong>Kisan Vikas Patra (KVP):</strong><br>• <strong>Interest:</strong> 7.5% p.a. — doubles your money in ~9.5 years<br>• <strong>Maturity:</strong> 115 months (~9.5 years)<br>• <strong>Tax benefit:</strong> NO Section 80C benefit<br>• <strong>Min investment:</strong> ₹1,000<br>• <strong>Premature exit:</strong> Allowed after 2.5 years<br><br><strong>Both offer:</strong><br>✅ Government guarantee (sovereign security)<br>✅ Available at all post offices<br>✅ Can be used as collateral for loans<br><br>📱 Savings planning consultation: <strong>9013976999</strong>`,
      quickReplies: ['PPF vs NSC','Tax saving guide','Post office schemes','Call Sachin']
    },

    /* ─── FINANCIAL KNOWLEDGE EXTRA ─────────────────── */
    {
      id: 'asset_allocation',
      weight: 2,
      patterns: ['asset allocation','how to allocate investments','investment allocation strategy','where to put money','investment mix strategy','portfolio allocation','money allocation plan'],
      response: () => `${greet()}<strong>📊 Asset Allocation — The Most Important Investment Decision!</strong><br><br>Research shows that <strong>asset allocation determines 90% of investment returns</strong> — not individual stock/fund selection!<br><br><strong>The core asset classes:</strong><br>📈 <strong>Equity:</strong> Stocks, Equity Mutual Funds, ELSS<br>🏦 <strong>Debt:</strong> FD, PPF, Bonds, Debt Funds<br>🥇 <strong>Gold:</strong> SGBs, Gold ETF, Physical gold<br>🏠 <strong>Real Estate:</strong> Property, REITs<br><br><strong>Age-based rule of thumb:</strong><br>Equity % = 100 − Your Age<br>• Age 30: 70% equity, 30% debt+gold<br>• Age 45: 55% equity, 45% debt+gold<br>• Age 60: 40% equity, 60% debt+gold<br><br><strong>Annual rebalancing:</strong><br>• Review allocation every year<br>• Sell outperformers, buy underperformers<br>• Keeps risk in check automatically<br><br><strong>Common mistakes:</strong><br>❌ Too much in FD + LIC only (inflation loss!)<br>❌ 100% equity (too risky, can't sleep!)<br>❌ Never reviewing allocation<br><br>💡 <em>Sachin helps you build a diversified, age-appropriate portfolio!</em><br><br>📱 Portfolio review: <strong>9013976999</strong>`,
      quickReplies: ['Portfolio review','SIP investments','Balanced funds','Call Sachin']
    },



    /* ─── ABOUT POLICYRAJ EXTRAS ────────────────────── */
    {
      id: 'policyraj_services',
      weight: 3,
      patterns: ['what services policyraj offers','policyraj services','what does policyraj do','policyraj help me with','services provided policyraj','policyraj offerings'],
      response: () => `${greet()}<strong>🏢 PolicyRaj — Complete Insurance & Financial Advisory Services</strong><br><br>At PolicyRaj, we don't just sell insurance — we <em>build financial protection plans</em> for individuals, families, and businesses.<br><br><strong>Our services include:</strong><br><br>🏥 <strong>Health Insurance:</strong> Individuals, families, senior citizens, corporates<br>🛡️ <strong>Life & Term Insurance:</strong> Term plans, ULIPs, endowments, child plans<br>🚗 <strong>Motor Insurance:</strong> Car, bike, commercial vehicles<br>✈️ <strong>Travel Insurance:</strong> Domestic & international<br>🏠 <strong>Property Insurance:</strong> Home, shop, office<br>💼 <strong>Business Insurance:</strong> SME, corporate, professional indemnity<br>📈 <strong>Investments:</strong> Mutual funds, SIP planning, NPS, PPF advisory<br>💰 <strong>Tax Planning:</strong> 80C, 80D strategies, ITR assistance<br>📋 <strong>Claim Assistance:</strong> End-to-end support<br><br>✅ All leading insurers under one roof<br>✅ Unbiased advice — we compare for you<br>✅ Post-sale service for life<br><br>📱 Start your protection journey: <strong>9013976999</strong>`,
      quickReplies: ['Get a quote','Annual review','Claim help','Call Sachin']
    },
    {
      id: 'policyraj_fees',
      weight: 3,
      patterns: ['policyraj fees','is policyraj free','how does policyraj charge','policyraj commission','cost of advice policyraj','policyraj consultation charges','do you charge fees'],
      response: () => `${greet()}<strong>💰 Are PolicyRaj's Services Free?</strong><br><br>Great question! Here's how our advisory model works:<br><br><strong>Our consultations are FREE:</strong><br>✅ Initial insurance needs analysis — FREE<br>✅ Policy comparison & recommendation — FREE<br>✅ Claims assistance guidance — FREE<br>✅ Annual policy review — FREE<br>✅ Tax planning discussion — FREE<br><br><strong>How we earn:</strong><br>Insurance companies pay advisors a commission when policies are sold. This is built into the premium you pay anyway — working with an advisor doesn't make it costlier!<br><br><strong>Why use an advisor (us) instead of buying directly?</strong><br>• We compare 20+ insurers for you<br>• We guide you to the right product (not the highest commission one)<br>• We assist with claims — something websites can't do<br>• We do annual reviews to keep your cover adequate<br><br>💡 <em>Direct purchase online = same premium, zero after-sales support. Sachin = same premium + lifelong guidance!</em><br><br>📱 Free consultation: <strong>9013976999</strong>`,
      quickReplies: ['Get a free quote','Annual review','Claim help','WhatsApp Sachin']
    },
    {
      id: 'policyraj_area',
      weight: 3,
      patterns: ['policyraj location','where is policyraj','policyraj area','do you serve my city','policyraj delhi','policyraj service area','where does policyraj operate'],
      response: () => `${greet()}<strong>📍 PolicyRaj — Where We Operate!</strong><br><br>PolicyRaj operates across India! We serve clients both in-person and remotely.<br><br><strong>Our reach:</strong><br>✅ <strong>Pan-India digital advisory:</strong> Video call, WhatsApp, email consultations for any state<br>✅ <strong>Primary office:</strong> Delhi NCR (Sachin's base)<br>✅ <strong>In-person meetings:</strong> Delhi NCR clients<br>✅ <strong>Remote clients:</strong> 100% online service — same quality<br><br><strong>How we serve clients anywhere:</strong><br>📱 WhatsApp: Share requirements, receive recommendations<br>📹 Video call: Detailed discussion & comparison<br>📧 Email: Policy documents, comparisons, renewals<br>☎️ Phone: Quick queries & guidance<br><br><strong>Policy issuance:</strong><br>• Completely digital for most plans<br>• Policy documents on email<br>• DigiLocker integration available<br><br>💡 <em>Whether you're in Mumbai, Bangalore, or Jaipur — Sachin is just a call/WhatsApp away!</em><br><br>📱 Connect with us: <strong>9013976999</strong>`,
      quickReplies: ['Contact PolicyRaj','WhatsApp Sachin','Get a quote','About us']
    },
    {
      id: 'policyraj_claim_help',
      weight: 3,
      patterns: ['policyraj claim help','sachin help claim','claim assistance policyraj','help with insurance claim','support during claim','policyraj claim support'],
      response: () => `${greet()}<strong>🆘 PolicyRaj Claim Assistance — We're With You When It Matters!</strong><br><br>The real test of an insurance advisor is what they do when you need to claim. At PolicyRaj, we stand with you.<br><br><strong>How we help with claims:</strong><br><br>🏥 <strong>Health Claims:</strong><br>• Pre-authorization assistance for planned surgeries<br>• TPA coordination<br>• Document checklist guidance<br>• Appeal support if claim is initially denied<br><br>💀 <strong>Life Insurance Claims:</strong><br>• Complete document support for family<br>• Insurer follow-up on your behalf<br>• Ombudsman referral if needed<br><br>🚗 <strong>Motor Claims:</strong><br>• Garage coordination<br>• Surveyor meeting support<br>• Settlement tracking<br><br><strong>Our commitment:</strong><br>We don't disappear after policy issuance. Claims time is when you need us most — and we're available 24/7 during emergencies.<br><br>📱 <strong>Emergency claim line: 9013976999</strong><br>📧 Email: aryanrajkathuria@gmail.com`,
      quickReplies: ['Health claim process','Motor claim','Life insurance claim','Contact now']
    },
    {
      id: 'policyraj_annual_review',
      weight: 3,
      patterns: ['policyraj annual review','insurance review','annual policy review','yearly review insurance','update my coverage','review my insurance portfolio'],
      response: () => `${greet()}<strong>📅 Annual Insurance Review — Why It Matters and How PolicyRaj Does It!</strong><br><br>Just like you get an annual health checkup, your insurance portfolio needs an annual review.<br><br><strong>What we check in your annual review:</strong><br><br>✅ <strong>Coverage Adequacy:</strong> Has your income grown? Is your life cover still enough?<br>✅ <strong>Health Cover:</strong> Is the sum insured keeping up with medical inflation?<br>✅ <strong>New Life Events:</strong> Marriage, child birth, home purchase — new needs?<br>✅ <strong>Premium Optimization:</strong> Are you getting the best premium for your coverage?<br>✅ <strong>Tax Benefits:</strong> Maximizing 80C/80D deductions<br>✅ <strong>Claim History:</strong> NCB impact, renewal strategy<br>✅ <strong>New Products:</strong> Better options available in market now?<br><br><strong>Frequency:</strong><br>• Minimum: Once a year (at renewal time)<br>• Ideal: At any major life event + annual<br><br>💡 <em>Sachin proactively reaches out to all PolicyRaj clients 45 days before renewal every year!</em><br><br>📱 Schedule your review: <strong>9013976999</strong>`,
      quickReplies: ['Get a review','Update coverage','New policy need','Call Sachin']
    },
    {
      id: 'policyraj_nri',
      weight: 3,
      patterns: ['policyraj for nri','nri insurance policyraj','insurance from abroad policyraj','sachin help nri','overseas indian insurance policyraj'],
      response: () => `${greet()}<strong>🌍 PolicyRaj for NRIs — Insurance & Investments from Anywhere!</strong><br><br>Living abroad? PolicyRaj helps NRIs manage their Indian insurance and investments seamlessly.<br><br><strong>How we help NRIs:</strong><br><br>🛡️ <strong>Term Insurance:</strong> Many insurers allow NRIs to buy term plans in India — we guide the process<br>🏥 <strong>Health Insurance:</strong> For family members still in India<br>🏠 <strong>Property Insurance:</strong> For your home/property in India<br>📈 <strong>Investments:</strong> NRE/NRO account-based MF investments, NPS for NRIs<br><br><strong>How it works remotely:</strong><br>• Video KYC available for most products<br>• Documents submitted digitally<br>• Policies issued on email<br>• Sachin coordinates everything — you don't need to travel<br><br><strong>Important for NRIs:</strong><br>• Some plans have residency restrictions<br>• FEMA regulations apply for certain investments<br>• Repatriation of proceeds has rules<br><br>💡 <em>Sachin has helped NRI clients in USA, UK, UAE, Canada, Singapore manage their Indian insurance portfolios!</em><br><br>📱 WhatsApp Sachin for NRI consultation: <strong>9013976999</strong>`,
      quickReplies: ['NRI insurance guide','Home insurance India','Term plan NRI','Call Sachin']
    },
    {
      id: 'policyraj_business_clients',
      weight: 3,
      patterns: ['policyraj business','corporate insurance policyraj','company insurance sachin','business client policyraj','sme insurance policyraj','group insurance policyraj'],
      response: () => `${greet()}<strong>💼 PolicyRaj Business & Corporate Insurance Solutions!</strong><br><br>PolicyRaj serves SMEs, startups, and corporates with comprehensive business insurance solutions.<br><br><strong>Corporate solutions we offer:</strong><br><br>👥 <strong>Group Health Insurance:</strong> For 5–500+ employees<br>💀 <strong>Group Term Life Insurance:</strong> Employee life cover<br>💀 <strong>Group Personal Accident:</strong> All-employee PA coverage<br>💼 <strong>Professional Indemnity:</strong> IT, consulting, medical firms<br>🔐 <strong>Cyber Insurance:</strong> Data breach, ransomware coverage<br>🏢 <strong>Property & Fire:</strong> Office, factory, warehouse<br>⚖️ <strong>D&O Insurance:</strong> Director & Officer liability<br><br><strong>Why businesses choose PolicyRaj:</strong><br>✅ Single point of contact for all insurance needs<br>✅ Bulk pricing negotiation with insurers<br>✅ Employee onboarding/offboarding for group policies<br>✅ Claims support for employees<br>✅ Annual corporate insurance review<br><br>💡 <em>Group health insurance also counts as employee benefit — reduces attrition!</em><br><br>📱 Business insurance consultation: <strong>9013976999</strong>`,
      quickReplies: ['Group health insurance','D&O insurance','Cyber insurance','Call Sachin']
    },
    {
      id: 'policyraj_success_stories',
      weight: 3,
      patterns: ['policyraj success story','client helped policyraj','sachin helped customer','policyraj customer story','real story policyraj','client testimonial'],
      response: () => `${greet()}<strong>❤️ PolicyRaj Success Stories — Real Clients, Real Impact!</strong><br><br>Nothing speaks louder than real outcomes. Here are some of the ways PolicyRaj has made a difference:<br><br><strong>Story 1 — The Rejected Claim We Got Settled:</strong><br>A client's health insurance claim was rejected for "non-disclosure." Sachin reviewed the case, found the rejection was unjustified, escalated to IRDAI Grievance, and got ₹3.8 lakh claim settled within 45 days.<br><br><strong>Story 2 — Term Insurance That Paid When It Mattered:</strong><br>A client bought ₹1 Crore term plan through PolicyRaj in 2019. He passed away in 2022. Sachin helped his wife file the claim — full ₹1 Cr settled in 23 days.<br><br><strong>Story 3 — Smart Tax + Insurance Planning:</strong><br>A 35-year-old IT professional was paying ₹45,000 extra tax. Sachin restructured his insurance + investment portfolio — saved ₹38,000 in tax annually!<br><br>💡 <em>These are real outcomes from real clients who trusted PolicyRaj with their financial protection.</em><br><br>📱 Let Sachin write YOUR success story: <strong>9013976999</strong>`,
      quickReplies: ['Get a quote','Claim help','Tax planning','Call Sachin now']
    },
    {
      id: 'policyraj_get_started',
      weight: 3,
      patterns: ['how to start with policyraj','get started policyraj','first step policyraj','begin insurance journey','new customer policyraj','onboard policyraj'],
      response: () => `${greet()}<strong>🚀 Getting Started with PolicyRaj — 3 Easy Steps!</strong><br><br>Starting your insurance and financial protection journey with PolicyRaj is simple:<br><br><strong>Step 1 — Free Needs Assessment (15 minutes):</strong><br>📞 Call or WhatsApp Sachin at <strong>9013976999</strong><br>Share: age, family size, income range, existing policies<br>Sachin identifies gaps and priorities<br><br><strong>Step 2 — Personalized Recommendation:</strong><br>📊 Sachin compares products from 20+ insurers<br>Gets you the best coverage at best price<br>No pressure, no pushy sales — just honest advice<br><br><strong>Step 3 — Easy Onboarding:</strong><br>📱 Complete digitally (Aadhaar + PAN for KYC)<br>Policy issued on email within minutes–24 hours<br>Sachin stays with you for annual reviews & claims<br><br><strong>What you'll need:</strong><br>• Basic details (age, health conditions)<br>• Aadhaar / PAN<br>• Bank account details<br>• 30 minutes of your time<br><br>💡 <em>The best time to get insurance was yesterday. The second best time is RIGHT NOW!</em><br><br>📱 <strong>Start today: 9013976999</strong>`,
      quickReplies: ['WhatsApp Sachin','Get a quote','Annual review','About PolicyRaj']
    },
    {
      id: 'sachin_biography',
      weight: 3,
      patterns: ['who is sachin kathuria','sachin kathuria background','about sachin','policyraj founder story','sachin insurance advisor','sachin kathuria experience','tell me about sachin'],
      response: () => `${greet()}<strong>👨‍💼 Meet Sachin Kathuria — Founder of PolicyRaj</strong><br><br>Sachin Kathuria is a seasoned insurance and financial advisor with over a decade of experience helping Indian families protect what matters most.<br><br><strong>Background:</strong><br>• Insurance advisor since 2012<br>• IRDAI certified (LIC, General Insurance)<br>• Specializes in: comprehensive family protection, tax-efficient investment planning, claim settlements<br>• Based in Delhi NCR<br><br><strong>Sachin's philosophy:</strong><br><em>"Insurance is not about death — it's about protecting life. The right cover at the right time can change a family's entire story."</em><br><br><strong>What makes Sachin different:</strong><br>✅ Unbiased advisor — recommends what's right for YOU<br>✅ 24x7 availability during claims (his clients know this!)<br>✅ Annual review discipline — no client left behind<br>✅ Deep product knowledge across 20+ insurers<br>✅ Plain language — no jargon, just clarity<br><br><strong>His track record:</strong><br>• 500+ families protected<br>• Crores in claims settled<br>• Zero unresolved client grievances<br><br>📱 <strong>Connect with Sachin: 9013976999</strong>`,
      quickReplies: ['Get a quote','PolicyRaj services','Success stories','Call Sachin now']
    },
    {
      id: 'policyraj_compare_service',
      weight: 3,
      patterns: ['policyraj compare insurers','compare insurance policyraj','which insurer better policyraj','best insurance company recommendation','policyraj help compare','compare vs buy direct'],
      response: () => `${greet()}<strong>⚖️ How PolicyRaj Compares Insurance — Our Process!</strong><br><br>We don't push one company's products — we compare across 20+ insurers and find what's genuinely best for you.<br><br><strong>Our comparison process:</strong><br><br>📊 <strong>We evaluate 8 key factors:</strong><br>1. Claim Settlement Ratio (CSR) — most important!<br>2. Network hospital/garage size<br>3. Premium vs coverage value<br>4. Sub-limits and exclusions<br>5. Waiting period clauses<br>6. Renewal terms (lifetime renewability?)<br>7. Customer service reviews<br>8. Financial strength of insurer<br><br><strong>Our partner insurers include:</strong><br>Niva Bupa, HDFC ERGO, Bajaj Allianz GIC Ltd., ICICI Lombard, TATA AIG, Care Health, LIC, Max Life, SBI Life, and 10+ more<br><br><strong>What you get:</strong><br>• Top 3 recommended options with pros/cons<br>• Clear explanation of differences<br>• No hidden commissions — transparent advice<br><br>💡 <em>PolicyBazaar shows you products. PolicyRaj explains what each means for YOUR specific situation!</em><br><br>📱 Get a comparison: <strong>9013976999</strong>`,
      quickReplies: ['Get a quote now','Health comparison','Motor comparison','Call Sachin']
    },

    /* ─── GENERAL CHAT EXTRAS ────────────────────────── */
    {
      id: 'first_time_buyer_chat',
      weight: 2,
      patterns: ['never bought insurance','first time insurance','buying insurance for first time','new to insurance','where to start insurance','don t know which insurance'],
      response: () => `${greet()}<strong>🎯 First-Time Insurance Buyer — Here's Your Perfect Starting Point!</strong><br><br>Welcome! You've made a great decision to start thinking about insurance. Let's keep it simple.<br><br><strong>Priority order for first-time buyers:</strong><br><br>1️⃣ <strong>Health Insurance (Most Urgent!):</strong><br>A medical emergency can cost ₹5–20 lakh. This is #1 priority for everyone.<br>→ Start with ₹10L individual or family floater<br><br>2️⃣ <strong>Term Life Insurance (If you have dependents):</strong><br>If family depends on your income, they need protection if something happens to you.<br>→ ₹1 Crore term for 30 years costs just ₹700–1,000/month<br><br>3️⃣ <strong>Motor Insurance (If you have a vehicle):</strong><br>Third-party is mandatory by law. Comprehensive is strongly recommended.<br><br><strong>Start small, grow coverage:</strong><br>Even ₹3,000–5,000/month protects you, your health, and your family's future.<br><br>💡 <em>The biggest mistake first-time buyers make is waiting until something goes wrong!</em><br><br>📱 Let Sachin build your first plan: <strong>9013976999</strong>`,
      quickReplies: ['Health insurance basics','Term insurance','Motor insurance','Get started now']
    },
    {
      id: 'tight_budget_chat',
      weight: 2,
      patterns: ['insurance on tight budget','affordable insurance','cheap insurance','insurance for low income','minimum insurance','budget insurance options','insurance with little money'],
      response: () => `${greet()}<strong>💸 Insurance on a Tight Budget — Smart Choices!</strong><br><br>Good news: you don't need a lot of money to get meaningful protection. Here's the most impactful coverage per rupee:<br><br><strong>Budget: ₹1,000–₹2,000/month:</strong><br>✅ Term life (₹1 Cr cover): ~₹700–900/month<br>✅ Govt schemes: PMJJBY (₹436/year!) + PMSBY (₹20/year!)<br><br><strong>Budget: ₹2,000–₹4,000/month:</strong><br>✅ Add basic health insurance (₹5L cover): ~₹8,000–12,000/year<br>✅ Keep government schemes active<br><br><strong>Budget: ₹4,000–₹6,000/month:</strong><br>✅ Upgrade health to ₹10L cover<br>✅ Add personal accident cover<br>✅ Motor insurance (if vehicle)<br><br><strong>Sachin's budget advice:</strong><br>1. Govt schemes first (PMJJBY + PMSBY) — just ₹456/year for life + accident cover!<br>2. Term plan (if earning) — pure life cover is cheapest way to protect family<br>3. Health insurance — even ₹5L is better than nothing<br><br>💡 <em>Prioritize: health > term life > accident > everything else</em><br><br>📱 Budget-optimized plan: <strong>9013976999</strong>`,
      quickReplies: ['PMJJBY scheme','Term insurance','Cheap health insurance','Call Sachin']
    },
    {
      id: 'confused_what_need_chat',
      weight: 2,
      patterns: ['confused about insurance','what insurance do i need','which insurance to buy','help me choose insurance','don t know what to buy insurance','insurance guidance needed'],
      response: () => `${greet()}<strong>😊 Not Sure Which Insurance You Need? Let Me Help!</strong><br><br>Feeling confused is completely normal — there are hundreds of products! Let me ask a few quick questions to guide you:<br><br><strong>Answer these and I'll point you right:</strong><br><br>1️⃣ <strong>Do you have dependents?</strong> (spouse, children, parents who need your income)<br>→ Yes = You need Term Life Insurance urgently<br><br>2️⃣ <strong>Do you have health insurance?</strong><br>→ No = This is #1 priority. Medical bills destroy savings.<br><br>3️⃣ <strong>Do you own a vehicle?</strong><br>→ Yes = Comprehensive motor insurance is both legal and essential<br><br>4️⃣ <strong>Are you self-employed?</strong><br>→ Yes = Income protection & disability cover becomes critical<br><br>5️⃣ <strong>Planning a foreign trip?</strong><br>→ Yes = Travel insurance is a must<br><br><strong>Quick rule:</strong><br>• Everyone → Health Insurance<br>• Have family → Term Life<br>• Have vehicle → Motor Insurance<br>• Rest: depends on life stage<br><br>📱 Let Sachin ask the right questions and build YOUR plan: <strong>9013976999</strong>`,
      quickReplies: ['Health insurance','Term insurance','Motor insurance','Call Sachin now']
    },
    {
      id: 'good_time_buy_chat',
      weight: 2,
      patterns: ['right time to buy insurance','when to buy insurance','good time for insurance','is now good time buy insurance','waiting to buy insurance','should i buy now'],
      response: () => `${greet()}<strong>⏰ The Right Time to Buy Insurance? RIGHT NOW!</strong><br><br>This is the most common procrastination people face with insurance. Let me show you why waiting always costs more:<br><br><strong>Why NOW is always the best time:</strong><br><br>📈 <strong>Age factor:</strong> Premium increases 5–8% for every year older you get<br>🏥 <strong>Health factor:</strong> Pre-existing conditions are easier to cover when young and healthy<br>💰 <strong>Inflation factor:</strong> Insurance sum required increases every year with rising medical costs<br>⚡ <strong>Accidents don't schedule:</strong> By definition, you can't predict when you'll need it<br><br><strong>Real cost of waiting 5 years:</strong><br>Term plan at 30: ₹8,000/year<br>Same plan at 35: ₹13,000/year<br>Difference: ₹5,000/year × 30 remaining years = <strong>₹1.5 lakh extra paid!</strong><br><br><strong>The one exception:</strong><br>If you're unsure about the right product — that's valid. But get FREE advice now and decide quickly. Don't let advice-seeking become a reason to delay!<br><br>📱 Book your free consultation: <strong>9013976999</strong>`,
      quickReplies: ['Term insurance quote','Health insurance','First time buyer','Call Sachin']
    },
    {
      id: 'already_covered_chat',
      weight: 2,
      patterns: ['already have insurance','i have insurance already','company provides insurance','have policy from work','have group insurance','have lic policy'],
      response: () => `${greet()}<strong>✅ Already Have Insurance? Let's See If It's Enough!</strong><br><br>Great that you're already protected! But many people discover their coverage has gaps. Let's check:<br><br><strong>If you have employer health insurance:</strong><br>⚠️ Typically ₹2–4L — inadequate for serious illness (ICU alone costs ₹50K/day)<br>⚠️ Ends when you change jobs<br>✅ <strong>Recommendation:</strong> Add personal health insurance ₹5–10L<br><br><strong>If you have an LIC endowment policy:</strong><br>⚠️ ₹5–25L sum assured — usually inadequate (need ₹1 Cr+ if family depends on you)<br>⚠️ Returns are below inflation (4–5%)<br>✅ <strong>Recommendation:</strong> Keep LIC if surrender isn't wise, but ADD a term plan for pure life protection<br><br><strong>If you have a motor policy:</strong><br>⚠️ Check: Is it comprehensive or just third-party?<br>⚠️ Check: Do you have zero dep add-on?<br><br><strong>Quick coverage audit questions:</strong><br>• Is my health cover ₹10L+ per person? ✓/✗<br>• Is my life cover 10–15× annual income? ✓/✗<br>• Is my motor comprehensive? ✓/✗<br><br>📱 Free coverage review: <strong>9013976999</strong>`,
      quickReplies: ['Review my coverage','Add health insurance','Term plan','Call Sachin']
    },
    {
      id: 'robot_question_chat',
      weight: 2,
      patterns: ['are you a robot','talking to ai','am i talking to bot','chatbot or human','is this automated','real person or bot'],
      response: () => `${greet()}<strong>🤖 Am I a Robot? Sort of — but a Very Well-Trained One!</strong><br><br>Ha! Great question! I'm <strong>Veera</strong> — PolicyRaj's AI insurance advisor. I'm not a human, but I've been trained with deep knowledge of insurance products, government schemes, tax laws, and financial planning.<br><br><strong>What I can do:</strong><br>✅ Answer 250+ insurance and financial questions<br>✅ Explain complex concepts in simple language<br>✅ Help you understand what coverage you need<br>✅ Guide you through claims processes<br>✅ Available 24x7 — humans need sleep! 😄<br><br><strong>What only Sachin (human!) can do:</strong><br>👨‍💼 Personalized needs assessment for YOUR specific situation<br>📋 Compare real quotes across 20+ insurers<br>📝 Complete the actual purchase<br>🆘 Physically help during a claim crisis<br><br>I'm the starting point — Sachin is the destination! 😊<br><br>💡 <em>Think of me as a very knowledgeable friend who then introduces you to the expert!</em><br><br>📱 Meet the human: <strong>9013976999</strong>`,
      quickReplies: ['Ask me a question','Speak to Sachin','What can you help with?','Get a quote']
    },
    {
      id: 'emergency_chat',
      weight: 3,
      patterns: ['emergency insurance help','urgent insurance help','accident happened insurance','hospitalized now insurance','need insurance help now','urgent claim help','insurance emergency'],
      response: () => `${greet()}<strong>🚨 EMERGENCY? Here's Immediate Help!</strong><br><br>If you or a family member is facing a medical/accident emergency RIGHT NOW:<br><br><strong>For Health Insurance Emergency:</strong><br>📞 Call your insurer's 24x7 helpline (on your insurance card/policy)<br>📞 Or call: Sachin: <strong>9013976999</strong> — he'll guide you immediately<br>• Go to nearest network hospital → Show insurance card<br>• For non-network hospital → Pay, save ALL bills, claim later<br><br><strong>For Motor Accident:</strong><br>📞 Insurer emergency line (on policy)<br>📞 Or: <strong>9013976999</strong><br>• Take photos of accident scene<br>• Get third-party details<br>• Don't repair car before insurer survey<br><br><strong>Key helplines:</strong><br>• HDFC ERGO: 1800-2700-700<br>• Bajaj Allianz: 1800-209-5858<br>• Bajaj Allianz GIC Ltd.: 1800-209-5858<br>• ICICI Lombard: 1800-2666<br>• Niva Bupa: 1800-200-3366<br><br>⚠️ <strong>Don't delay — call RIGHT NOW if it's an active emergency!</strong><br><br>📱 Sachin available 24x7: <strong>9013976999</strong>`,
      quickReplies: ['Health claim process','Motor claim','Call Sachin NOW','Claim documents']
    },
    {
      id: 'not_interested_chat',
      weight: 2,
      patterns: ['not interested insurance','don t need insurance','insurance waste of money','i will think about it insurance','maybe later insurance','no thanks insurance'],
      response: () => `${greet()}I completely understand — and I respect that! 😊<br><br>Insurance is a deeply personal decision. But before you go, let me share just one thought:<br><br><strong>Insurance isn't for YOU — it's for the people you love.</strong><br><br>A ₹1 Crore term plan for a 30-year-old costs less than ₹30/day. That's the price of a cup of chai — to ensure your family never faces a financial crisis if something happens to you.<br><br>Similarly, one uninsured hospitalization can cost ₹5–15 lakh — wiping out years of savings in days.<br><br>You don't have to decide today! But when the time feels right — or after a life event like marriage, child, home purchase — Sachin at PolicyRaj is here, no pressure, no pushy calls.<br><br><strong>Just remember:</strong><br>The best time to buy insurance is before you need it. 🙏<br><br>📱 Whenever you're ready: <strong>9013976999</strong><br><br>Is there anything else I can help you understand today?`,
      quickReplies: ['Tell me more about term insurance','What if I have LIC?','Just browsing','Speak to Sachin']
    },
    {
      id: 'just_browsing_chat',
      weight: 2,
      patterns: ['just browsing','just looking','exploring insurance','curious about insurance','window shopping insurance','learning about insurance'],
      response: () => `${greet()}That's perfectly fine — and honestly, the best time to learn about insurance is when there's no pressure! 😊<br><br>Welcome to PolicyRaj. I'm Veera, your AI insurance guide. Feel free to ask me ANYTHING — I won't push you to buy anything.<br><br><strong>Things you might want to explore:</strong><br>🏥 <strong>Health Insurance</strong> — The #1 financial priority<br>🛡️ <strong>Term Life Insurance</strong> — Most underused wealth protector<br>🚗 <strong>Motor Insurance</strong> — Beyond the mandatory minimum<br>💰 <strong>Tax Saving</strong> — Insurance that cuts your tax bill<br>📈 <strong>Investments</strong> — SIPs, ELSS, NPS, PPF<br>🇮🇳 <strong>Govt Schemes</strong> — Free/subsidized protection you may not know about<br><br>No registration required, no personal details needed right now — just ask!<br><br>💡 <em>Every question you ask today could save you or your family lakhs in the future!</em><br><br>What would you like to know first? 😊`,
      quickReplies: ['Health insurance basics','Term insurance 101','Tax saving guide','Government schemes']
    },
    {
      id: 'spouse_finances_chat',
      weight: 2,
      patterns: ['spouse insurance','wife insurance planning','husband insurance advice','partner insurance','my spouse needs insurance','getting insurance for family'],
      response: () => `${greet()}<strong>👫 Insurance Planning for You & Your Spouse — Together is Stronger!</strong><br><br>Financial protection works best when both partners are covered. Here's the smart approach:<br><br><strong>If both spouses earn:</strong><br>✅ Both need separate Term Insurance (each covers the other's income)<br>✅ Family Floater Health Insurance (covers both + kids)<br>✅ Both can claim 80D tax deduction (up to ₹50K combined)<br><br><strong>If one spouse doesn't earn (homemaker):</strong><br>✅ Earning spouse: Higher term cover (replace both incomes effectively)<br>✅ Homemaker: Health insurance + critical illness + PA<br>✅ Homemaker's economic value is ₹30K–60K/month (child care, household management)<br><br><strong>Joint life planning tips:</strong><br>• Review every 3–5 years or after major life events<br>• Nominate each other in ALL policies<br>• Both should know where ALL policies are stored<br>• Jointly understand claim process<br><br>💡 <em>Many families realize how underinsured they were ONLY after a crisis. Plan together now!</em><br><br>📱 Joint family consultation: <strong>9013976999</strong>`,
      quickReplies: ['Joint life insurance','Family floater health','Homemaker insurance','Call Sachin']
    },
    {
      id: 'age_advice_chat',
      weight: 2,
      patterns: ['insurance for my age','what insurance at 25','what insurance at 30','what insurance at 40','what insurance at 50','insurance recommendations age'],
      response: () => `${greet()}<strong>📅 Insurance Recommendations by Age — What You Need NOW!</strong><br><br><strong>🎓 Age 20–25 (Young & Unattached):</strong><br>• Health Insurance (must — medical bills hurt)<br>• Term Insurance (buy now = lowest premium for life!)<br>• PMJJBY + PMSBY (government schemes, nearly free)<br><br><strong>💒 Age 25–35 (New Family):</strong><br>• Term Insurance (increase to cover spouse + children)<br>• Family Floater Health Insurance<br>• Motor Insurance (if you drive)<br>• Start SIP for long-term wealth<br><br><strong>🏠 Age 35–45 (Peak Earning, Peak Responsibility):</strong><br>• Review & increase life cover (income probably grew)<br>• Add Critical Illness Insurance<br>• Child Education Plan<br>• Portfolio review & tax optimization<br><br><strong>🧘 Age 45–60 (Pre-Retirement):</strong><br>• Senior health insurance for parents<br>• NPS/pension planning urgently<br>• Review term plan (is it enough?)<br>• Estate planning (Will, nomination updates)<br><br><strong>🏖️ Age 60+ (Retirement):</strong><br>• Senior health insurance (mandatory)<br>• Pension/annuity income<br>• Government schemes (SCSS, PMVVY)<br><br>📱 Age-specific planning: <strong>9013976999</strong>`,
      quickReplies: ['Term insurance','Health insurance','Retirement planning','Call Sachin']
    },
    {
      id: 'language_hindi_chat',
      weight: 2,
      patterns: ['hindi mein baat karo','hindi mein samjhao','hindi me insurance','hindi language please','mujhe hindi chahiye','speak hindi insurance'],
      response: () => `${greet()}Namaste! 🙏 Bilkul samajh gaya!<br><br>Main Veera hoon — PolicyRaj ka AI Insurance Advisor. Aap mujhse Hindi mein puch sakte hain, main poori koshish karunga samjhane ki!<br><br><strong>Main in topics mein madad kar sakta hoon:</strong><br><br>🏥 <strong>Health Insurance:</strong> Swasthya bima ke baare mein<br>🛡️ <strong>Life Insurance:</strong> Jeevan bima — apne parivaar ki suraksha<br>🚗 <strong>Motor Insurance:</strong> Gaadi ka bima<br>💰 <strong>Tax Saving:</strong> Tax bachane ke tarike<br>📈 <strong>Investment:</strong> Paisa badhane ke tarike<br>🇮🇳 <strong>Sarkar ki Yojanaein:</strong> PMJJBY, Ayushman Bharat<br><br><strong>Directly Sachin se baat karein (Hindi mein):</strong><br>📱 <strong>9013976999</strong><br><br>Koi bhi sawaal puchein — main yahan hoon! 😊`,
      quickReplies: ['Health Insurance kya hai?','Term Insurance kya hai?','Tax kaise bachaye?','Sachin se baat karein']
    },
    {
      id: 'quick_question_chat',
      weight: 2,
      patterns: ['quick question insurance','just one question','one thing i want to know','fast answer insurance','quick doubt insurance','simple question'],
      response: () => `${greet()}Of course! I love quick questions — ask away! 😊<br><br>I'm Veera, PolicyRaj's AI advisor, and I can answer questions on:<br><br>• Health, life, motor, travel, home insurance<br>• Government schemes & tax saving<br>• Claims process & policy management<br>• Investments & retirement planning<br><br>No question is too basic or too complicated — what's on your mind?`,
      quickReplies: ['Health insurance question','Term plan doubt','Claims help','Tax query']
    },
    {
      id: 'recommendation_chat',
      weight: 2,
      patterns: ['recommend insurance','suggest me best insurance','which is best insurance','what should i buy','best policy recommendation','good insurance recommendation'],
      response: () => `${greet()}<strong>🎯 My Top Recommendations — Based on What Most Matters!</strong><br><br>For a good recommendation, I need to know your situation. But here are the most universally important covers:<br><br><strong>If you could only buy 3 things:</strong><br><br>1️⃣ <strong>Health Insurance — ₹10L minimum</strong><br>Bajaj Allianz GIC Ltd., Niva Bupa, or HDFC ERGO are excellent<br>Premium: ₹8,000–15,000/year for individual<br><br>2️⃣ <strong>Term Life Insurance — ₹1 Crore minimum</strong><br>If family depends on you. Max Life, HDFC Life, or ICICI Prudential<br>Premium: ₹8,000–15,000/year if you're 30–35<br><br>3️⃣ <strong>Comprehensive Motor Insurance + Zero Dep</strong><br>If you own a vehicle. Don't skip zero dep add-on!<br><br><strong>For a truly personalized recommendation based on YOUR age, income, family, and health — Sachin is the best person!</strong><br><br>💡 <em>Generic recommendations are a starting point. Your needs are unique!</em><br><br>📱 Get personalized recommendation: <strong>9013976999</strong>`,
      quickReplies: ['Health insurance options','Term plan options','Motor insurance','Call Sachin']
    },
    {
      id: 'share_phone_chat',
      weight: 2,
      patterns: ['give me your number','contact number policyraj','whatsapp number sachin','phone number insurance advisor','how to contact policyraj','sachin phone number'],
      response: () => `${greet()}<strong>📱 Here's How to Reach PolicyRaj!</strong><br><br><strong>Primary Contact:</strong><br>📞 <strong>Phone / WhatsApp: 9013976999</strong><br>(Sachin Kathuria — your personal insurance advisor)<br><br><strong>Available:</strong><br>• Mon–Sat: 9 AM – 8 PM<br>• Emergency claims assistance: 24/7<br><br><strong>You can reach via:</strong><br>• 📞 Direct call<br>• 💬 WhatsApp (preferred for documents & queries)<br>• 📧 Email for formal requests<br><br><strong>What to say when you call/WhatsApp:</strong><br>"Hi Sachin, I came from the PolicyRaj website. I need help with [your need]."<br><br>Or just say "Hi" — he'll guide you from there! 😊<br><br>💡 <em>First consultation is completely FREE — no commitment, no pressure!</em>`,
      quickReplies: ['WhatsApp Sachin now','Get a free quote','About PolicyRaj','Ask a question']
    },

    /* ─── GREET/BYE/THANKS EXTRAS ────────────────────── */
    {
      id: 'morning_greeting',
      weight: 2,
      patterns: ['good morning','morning insurance','subah','good morning sachin','morning policyraj'],
      response: () => `${greet()}<strong>🌅 Good Morning!</strong><br><br>What a great way to start the day — thinking about financial protection! 😊<br><br>I'm Veera, PolicyRaj's AI advisor. How can I help you this morning?<br><br>Quick ideas to get you started:<br>• 🏥 Check if your health insurance is adequate<br>• 🛡️ Explore term insurance for your family<br>• 💰 Plan your tax saving for this financial year<br>• 📋 Review a pending insurance query<br><br>What's on your mind today?`,
      quickReplies: ['Health insurance','Term insurance','Tax saving','Just browsing']
    },
    {
      id: 'evening_greeting',
      weight: 2,
      patterns: ['good evening','evening policyraj','shaam ko','good evening sachin','evening query insurance'],
      response: () => `${greet()}<strong>🌆 Good Evening!</strong><br><br>Hope your day went well! Evening is actually a great time to think about financial planning — the day's work is done and you have a few quiet moments. 😊<br><br>I'm Veera, here to help with any insurance or financial questions.<br><br>What can I help you with today?`,
      quickReplies: ['Insurance question','Tax saving','Get a quote','Speak to Sachin']
    },
    {
      id: 'hindi_greeting',
      weight: 2,
      patterns: ['namaste','namaskar','jai hind','ram ram','sat sri akal','assalam alaikum','adaab'],
      response: () => `${greet()}Namaste! 🙏 Bahut swagat hai PolicyRaj mein!<br><br>Main hoon Veera — aapka AI Insurance Advisor. Aap mujhse koi bhi sawaal Hindi ya English mein puch sakte hain!<br><br>Aaj main aapki kaise madad kar sakti hoon?`,
      quickReplies: ['Health Insurance kya hai?','Term Insurance batao','Tax bachana chahta hoon','Sachin se baat']
    },
    {
      id: 'festival_greeting',
      weight: 2,
      patterns: ['happy diwali','happy holi','eid mubarak','merry christmas','happy new year','happy dussehra','happy navratri','happy baisakhi','happy onam'],
      response: () => `${greet()}<strong>🎉 Season's Greetings to You!</strong><br><br>Wishing you and your family abundant joy, health, and prosperity during this festive season! 🙏<br><br>Festivals are also a great reminder — the people we celebrate with are the ones we should protect most. If you haven't reviewed your insurance recently, this festive season is a perfect time!<br><br>🎁 <em>The best gift for your family: Knowing they'll be financially secure no matter what.</em><br><br>Is there anything I can help you with today?`,
      quickReplies: ['Family insurance review','Health insurance','Term insurance','Call Sachin']
    },
    {
      id: 'birthday_response',
      weight: 2,
      patterns: ['my birthday','it s my birthday','birthday today','happy birthday to me','today is my birthday'],
      response: () => `${greet()}<strong>🎂 Happy Birthday to You!</strong><br><br>Many many happy returns of the day! 🥳🎉<br><br>Fun fact: Birthdays are actually the BEST time to think about insurance — here's why:<br><br>🎯 <strong>Age affects insurance premiums!</strong> Each birthday makes your next policy slightly more expensive. So if you've been thinking about buying term insurance or increasing your health cover — your birthday is nature's reminder to do it NOW!<br><br>💡 <em>Lock in today's premium — it only goes up from here!</em><br><br>What a meaningful birthday gift you could give yourself today: financial security for the people you love! 🙏<br><br>📱 Birthday special consultation: <strong>9013976999</strong>`,
      quickReplies: ['Term insurance now','Health coverage review','Get a quote','Call Sachin']
    },
    {
      id: 'free_consultation_query',
      weight: 3,
      patterns: ['free consultation','free advice insurance','no cost insurance help','free guidance insurance','consult for free','free insurance check'],
      response: () => `${greet()}<strong>✅ Yes — PolicyRaj Offers FREE Consultations!</strong><br><br>You're in the right place. All our consultations are completely FREE with zero obligation.<br><br><strong>What's included in a free consultation with Sachin:</strong><br><br>✅ Insurance needs assessment (15–20 minutes)<br>✅ Gap analysis of your current coverage<br>✅ Product comparison across 20+ insurers<br>✅ Personalized recommendation with clear reasoning<br>✅ Premium estimates for your chosen covers<br>✅ Tax saving opportunities review<br><br><strong>What happens after:</strong><br>• You decide if you want to proceed — no pressure<br>• If you buy: Sachin handles all paperwork<br>• Annual reviews and claims assistance — lifelong free service<br><br><strong>How to book your free consultation:</strong><br>📱 WhatsApp "PolicyRaj" to <strong>9013976999</strong><br>📞 Or just call directly<br><br>💡 <em>Thousands of families have made better insurance decisions after one conversation with Sachin!</em>`,
      quickReplies: ['WhatsApp Sachin','Call now','About PolicyRaj','Get started']
    },
    {
      id: 'privacy_assurance',
      weight: 2,
      patterns: ['is my data safe','privacy insurance','data privacy policyraj','personal info safe policyraj','confidential information insurance','share data policyraj safe'],
      response: () => `${greet()}<strong>🔐 Your Privacy is Sacred to Us!</strong><br><br>We take your personal and financial information very seriously at PolicyRaj.<br><br><strong>Our privacy commitments:</strong><br>✅ Your information is shared ONLY with the insurance company you choose<br>✅ We never sell your data to third parties<br>✅ All insurer data sharing follows IRDAI regulations<br>✅ No spam calls from us — we contact only with your permission<br>✅ You can ask us to delete your information anytime<br><br><strong>What information we typically need (and why):</strong><br>• Age & DOB: To calculate premiums accurately<br>• Health conditions: For accurate underwriting (not sharing your medical history unnecessarily)<br>• Nominee details: For claim settlement purposes<br>• Bank details: Only collected by insurer directly, not by us<br><br><strong>Safe practices we recommend:</strong><br>• Never share OTPs — even to us<br>• Read policy documents before signing<br>• Keep your own copies of all documents<br><br>📱 Any privacy concerns? Call Sachin: <strong>9013976999</strong>`,
      quickReplies: ['Get a quote safely','About PolicyRaj','Speak to Sachin','Data protection']
    },
    {
      id: 'call_request',
      weight: 3,
      patterns: ['call me back','request callback','schedule call','book appointment sachin','arrange call insurance','want to speak advisor','phone call insurance'],
      response: () => `${greet()}<strong>📞 Request a Callback from Sachin!</strong><br><br>Sachin will be happy to call you back at your convenient time!<br><br><strong>Ways to schedule a call:</strong><br><br>📱 <strong>WhatsApp (fastest):</strong><br>Send "CALL ME BACK + your preferred time" to <strong>9013976999</strong><br><br>📞 <strong>Direct call:</strong><br>Call <strong>9013976999</strong> directly<br>(Available Mon–Sat, 9 AM – 8 PM)<br><br>📧 <strong>Email:</strong><br>aryanrajkathuria@gmail.com (for detailed queries)<br><br><strong>When you reach out, mention:</strong><br>• Your name<br>• What you need help with (health/life/motor/tax etc.)<br>• Preferred time for callback<br><br><strong>Response time:</strong><br>📱 WhatsApp: Usually within 30 minutes during business hours<br>📞 Call: Immediate<br>📧 Email: Within 24 hours<br><br>💡 <em>No question is too basic or complex — Sachin is here to help, not to judge!</em>`,
      quickReplies: ['WhatsApp now','Call directly','Ask a question first','About PolicyRaj']
    },
    {
      id: 'long_thanks_response',
      weight: 1,
      patterns: ['you were very helpful','this was so helpful','learned a lot','great information','really useful','very informative','thank you so much','bahut shukriya','dil se shukriya'],
      response: () => `${greet()}<strong>🙏 Thank You — That Means the World to Me!</strong><br><br>It genuinely makes me happy to hear that! Helping people understand insurance and make better financial decisions is exactly why PolicyRaj exists.<br><br><strong>A few parting thoughts:</strong><br>• Knowledge is the first step — the next step is ACTION 💪<br>• Share what you've learned with family and friends — many people are dangerously under-insured<br>• Come back anytime — I'm available 24x7<br><br><strong>If you're ready to take action:</strong><br>📱 Sachin Kathuria — <strong>9013976999</strong><br>He'll translate this knowledge into a personalized protection plan!<br><br><strong>Remember PolicyRaj for:</strong><br>✅ Insurance (all types)<br>✅ Investments & tax planning<br>✅ Claims assistance<br>✅ Annual policy review<br><br>Take care and stay protected! 🌟`,
      quickReplies: ['Get a quote now','WhatsApp Sachin','Ask another question','Close chat']
    },
    {
      id: 'are_you_ai_chat',
      weight: 2,
      patterns: ['are you ai','are you chatgpt','which ai are you','what ai powers you','technology behind you','powered by which ai'],
      response: () => `${greet()}<strong>🤖 About Me — Veera, PolicyRaj's AI Advisor!</strong><br><br>I'm Veera, an AI assistant specifically trained for insurance and financial advisory by PolicyRaj.<br><br><strong>What makes me different from generic AI:</strong><br>• Deep knowledge of Indian insurance products & regulations<br>• Updated with IRDAI guidelines and government schemes<br>• Trained on 250+ insurance topics specific to Indian market<br>• Connected to PolicyRaj's philosophy of honest, unbiased advice<br><br><strong>What I can't replace:</strong><br>• Human judgment for complex situations<br>• Actual policy issuance<br>• Claims assistance (Sachin handles this personally)<br>• The nuanced understanding that comes from years of experience<br><br><strong>Best of both worlds:</strong><br>Me (24x7 knowledge) + Sachin (human expertise) = Complete support!<br><br>Is there anything specific I can help you understand? 😊`,
      quickReplies: ['Ask me anything','Speak to Sachin','About PolicyRaj','Get a quote']
    },
    {
      id: 'how_help_chat',
      weight: 2,
      patterns: ['how can you help me','what can you do','what can veera do','capabilities of chatbot','what topics can you answer','what do you know'],
      response: () => `${greet()}<strong>🎯 Here's Everything I Can Help You With!</strong><br><br>I'm Veera — your 24x7 AI insurance and financial guide. Here's my full range:<br><br>🏥 <strong>Health Insurance:</strong> Plans, coverage, cashless, claims, family floater<br>🛡️ <strong>Life Insurance:</strong> Term, ULIP, endowment, whole life, child plans<br>🚗 <strong>Motor Insurance:</strong> Car, bike, NCB, zero dep, claims<br>✈️ <strong>Travel & Home:</strong> Domestic, international, home protection<br>💼 <strong>Business Insurance:</strong> SME, cyber, D&O, professional indemnity<br>💀 <strong>Personal Protection:</strong> Critical illness, PA, cancer, disability<br>📈 <strong>Investments:</strong> SIP, ELSS, NPS, PPF, annuity<br>💰 <strong>Tax Saving:</strong> 80C, 80D, HRA, LTA, new vs old regime<br>📋 <strong>Claims Guidance:</strong> Step-by-step for all policy types<br>🏛️ <strong>Govt Schemes:</strong> PMJJBY, Ayushman Bharat, PMFBY, SCSS<br><br><strong>Just ask your question naturally — I'll find the right answer!</strong><br><br>📱 For personalized help: <strong>9013976999</strong>`,
      quickReplies: ['Health insurance','Tax saving','Investment plans','Call Sachin']
    },
    {
      id: 'reassurance_chat',
      weight: 2,
      patterns: ['worried about finances','financial stress','anxious about money','money problems help','not sure if covered','am i protected enough'],
      response: () => `${greet()}<strong>🤗 I Understand — Financial Worry is Real!</strong><br><br>First, take a breath. The fact that you're thinking about this means you're already ahead of most people. 💙<br><br><strong>Let's break it down simply:</strong><br>Financial security has just 3 pillars:<br><br>1️⃣ <strong>Protection</strong> (Insurance) — ensures family is safe if something goes wrong<br>2️⃣ <strong>Emergency Fund</strong> — 6 months expenses in liquid form<br>3️⃣ <strong>Long-term Wealth</strong> — SIP/PPF/NPS for future<br><br><strong>Most common gaps people have:</strong><br>• No health insurance or inadequate cover ← Start here<br>• No term life insurance if family depends on income ← Critical<br>• No emergency fund — only policy is used in emergencies<br><br><strong>What Sachin can do:</strong><br>In ONE free consultation, he can assess where you stand and what's most urgent to fix — without overwhelming you.<br><br>You don't have to solve everything today. Just take one step.<br><br>📱 One step: <strong>9013976999</strong> 🙏`,
      quickReplies: ['Get free help','Health insurance','Emergency fund','Call Sachin']
    },
    {
      id: 'whatsapp_query',
      weight: 3,
      patterns: ['whatsapp sachin','whatsapp policyraj','connect via whatsapp','message on whatsapp insurance','whatsapp number insurance'],
      response: () => `${greet()}<strong>💬 Connect with Sachin on WhatsApp!</strong><br><br>WhatsApp is the fastest and most convenient way to reach PolicyRaj!<br><br><strong>📱 WhatsApp Number: 9013976999</strong><br><br><strong>You can WhatsApp for:</strong><br>✅ Insurance quotes & recommendations<br>✅ Premium comparisons<br>✅ Claims assistance & document guidance<br>✅ Policy renewal reminders<br>✅ Quick questions & doubts<br>✅ Sharing existing policy documents for review<br><br><strong>How to start:</strong><br>Just send: "Hi Sachin, I came from PolicyRaj website" and mention your need<br><br><strong>Sachin responds to WhatsApp:</strong><br>• Business hours: Within 30 minutes typically<br>• After hours: Will respond next morning<br>• Claims emergencies: Available 24x7<br><br>💡 <em>WhatsApp is also great for sharing policy documents, premium receipts, and claim documents securely!</em><br><br><button onclick="window.open('https://wa.me/919013976999?text=Hi%20Sachin%2C%20I%20came%20from%20PolicyRaj%20website%20and%20need%20insurance%20guidance','_blank')" style="background:#25D366;color:white;border:none;padding:10px 20px;border-radius:20px;cursor:pointer;font-size:14px;margin-top:8px">💬 Open WhatsApp</button>`,
      quickReplies: ['Call directly','Get a quote','About PolicyRaj','Ask a question']
    },



    /* ─── KB AUDIT ADDITIONS (July 2026) ─────────────── */
    {
      id: 'mwp_act',
      weight: 2,
      patterns: ['mwp act','mwp','married womens property','married women property act','protect policy from creditors'],
      response: () => `${greet()}<strong>👩‍👧 MWP Act — Ring-Fence Your Life Cover for Your Family</strong><br><br>Buying a term plan under the <strong>Married Womens Property Act, 1874</strong> creates a special trust so the claim money goes <strong>only to your wife and/or children</strong>.<br><br><strong>Why it matters:</strong><br>• Creditors and lenders <strong>cannot touch</strong> the payout — even if you have business loans<br>• Other family members cannot stake a claim<br>• Essential for businessmen and anyone with liabilities<br><br><strong>Key points:</strong><br>• Must be chosen <strong>at the time of buying</strong> — cannot be added later<br>• Beneficiaries cannot be changed after issue<br>• Zero extra cost — just a form (MWP addendum) at proposal stage<br><br>📞 <em>Sachin sets up MWP term plans for business owners regularly. Call <strong>9013976999</strong>.</em>`,
      quickReplies: ['Term insurance', 'How much cover do I need?', 'Nominee rules', 'Speak to Sachin']
    },
    {
      id: 'reversionary_bonus',
      weight: 2,
      patterns: ['reversionary bonus','terminal bonus','policy bonus','bonus in lic policy','bonus declared','what is bonus in insurance'],
      response: () => `${greet()}<strong>🎁 Policy Bonuses — Decoded Simply</strong><br><br>Participating (with-profit) plans like endowment and money-back share the insurers profits with you as bonuses:<br><br><strong>1. Simple Reversionary Bonus</strong> — declared yearly as ₹ per ₹1,000 of sum assured; once declared it is <strong>guaranteed</strong> and paid at maturity/claim<br><strong>2. Compound Reversionary Bonus</strong> — bonus also earns bonus (rarer, better)<br><strong>3. Terminal Bonus</strong> — one-time loyalty bonus added at maturity or death claim<br><strong>4. Interim Bonus</strong> — if claim falls between two declarations<br><br><strong>Remember:</strong><br>• Bonuses are paid at the END, not yearly in hand<br>• Future bonuses are <strong>not guaranteed</strong> — they depend on insurer performance<br>• Term plans and ULIPs do not have bonuses<br><br>📞 <em>Want Sachin to project realistic maturity value of your policy? Call <strong>9013976999</strong>.</em>`,
      quickReplies: ['Endowment policy', 'Money back policy', 'Surrender value', 'Speak to Sachin']
    },
    {
      id: 'alcohol_disclosure',
      weight: 2,
      patterns: ['alcohol','drink alcohol','drinking habits','drinker insurance','alcohol disclosure','social drinker'],
      response: () => `${greet()}<strong>🍷 Alcohol & Insurance — Honesty is Everything</strong><br><br>Yes, drinkers <strong>can</strong> get life and health insurance — insurers just price the risk.<br><br><strong>How it works:</strong><br>• <strong>Social/occasional drinker:</strong> usually standard premiums, simple declaration<br>• <strong>Regular/heavy drinker:</strong> possible premium loading or medical tests<br>• <strong>Alcohol-related illness history:</strong> case-by-case underwriting<br><br><strong>The golden rule:</strong> ALWAYS disclose honestly. If a claim investigation finds undisclosed alcohol habits, the claim can be <strong>rejected entirely</strong> — the premium you saved becomes meaningless.<br><br>💡 <em>Insurers rarely reject for moderate drinking — they reject for hiding it.</em><br><br>📞 <em>Unsure how to declare? Sachin guides you through the proposal honestly and optimally: <strong>9013976999</strong>.</em>`,
      quickReplies: ['Smoker insurance', 'Term insurance', 'Why claims get rejected', 'Speak to Sachin']
    },
    {
      id: 'modern_treatments',
      weight: 3,
      patterns: ['bariatric','bariatric surgery','robotic surgery','modern treatment','stem cell therapy','oral chemotherapy','deep brain stimulation','immunotherapy'],
      response: () => `${greet()}<strong>🔬 Modern Treatments — Yes, Covered by IRDAI Mandate!</strong><br><br>Since Oct 2019, IRDAI requires health insurers to cover <strong>12 modern treatments</strong>, including:<br><br>• <strong>Robotic surgeries</strong><br>• <strong>Bariatric surgery</strong> (if medically necessary, not cosmetic)<br>• Oral chemotherapy & immunotherapy<br>• Stem cell therapy (approved uses)<br>• Deep brain stimulation<br>• Balloon sinuplasty, bronchial thermoplasty & more<br><br><strong>Watch the fine print:</strong><br>• Insurers may cap these at a % of sum insured (e.g., 50%)<br>• Bariatric surgery needs medical criteria (BMI thresholds, comorbidities)<br>• Cosmetic weight-loss surgery is NOT covered<br><br>📞 <em>Sachin can tell you exactly what your policy caps these treatments at — call <strong>9013976999</strong>.</em>`,
      quickReplies: ['What health insurance covers', 'Day care procedures', 'Waiting periods', 'Speak to Sachin']
    },
    {
      id: 'organ_donor_air_amb',
      weight: 3,
      patterns: ['organ donor','donor expenses','organ transplant','air ambulance','moratorium period','moratorium','ambulance','zone based','different cities','city wise premium','premium different in cities'],
      response: () => `${greet()}<strong>🚁 Lesser-Known Health Insurance Benefits & Rules</strong><br><br><strong>🫀 Organ Donor Expenses:</strong> Most good policies cover the donors hospitalisation (harvesting surgery) when YOU are the recipient — check the sub-limit.<br><br><strong>🚁 Air Ambulance:</strong> Increasingly covered in premium plans (usually capped, e.g., ₹2.5–5L per year). Crucial for emergencies in smaller cities.<br><br><strong>🗺️ Zone-Based Pricing:</strong> Insurers price by city zones — Delhi/Mumbai (Zone A) premiums are higher than smaller cities. Moving cities? Update your zone to avoid claim deductions.<br><br><strong>⏳ Moratorium Rule (Big one!):</strong> After <strong>5 years of continuous coverage</strong>, the insurer cannot reject claims for non-disclosure except proven fraud. Your policy becomes nearly incontestable — one more reason never to let it lapse.<br><br>📞 <em>Want Sachin to check if your policy has these benefits? Call <strong>9013976999</strong>.</em>`,
      quickReplies: ['What health insurance covers', 'Waiting periods', 'Claim rejection reasons', 'Speak to Sachin']
    },
    {
      id: 'wellness_rewards',
      weight: 3,
      patterns: ['wellness discount','walking steps','step count','wellness rewards','fitness discount','healthy lifestyle discount','steps discount premium'],
      response: () => `${greet()}<strong>🏃 Wellness Rewards — Get Paid to Stay Fit!</strong><br><br>Many modern health plans reward healthy habits:<br><br><strong>How it works:</strong><br>• Link your fitness tracker or app to the insurer<br>• Hit step/activity targets (e.g., 10,000 steps/day)<br>• Earn <strong>renewal premium discounts up to 30%</strong>, vouchers, or booster covers<br><br><strong>Examples of reward programs:</strong><br>• Aditya Birla Activ Health — up to 100% HealthReturns™<br>• Niva Bupa Health Pulse rewards<br>• HDFC ERGO wellness credits<br><br><strong>Also commonly rewarded:</strong> gym membership, health check-ups, no tobacco, controlled BMI.<br><br>📞 <em>Sachin can shortlist plans where your fitness actually cuts your premium — call <strong>9013976999</strong>.</em>`,
      quickReplies: ['Health insurance', 'Free health checkup', 'No claim bonus', 'Speak to Sachin']
    },
    {
      id: 'cng_kit',
      weight: 3,
      patterns: ['cng kit','cng car','lpg kit','cng endorsement','cng fitted car insurance','bifuel kit'],
      response: () => `${greet()}<strong>⛽ CNG/LPG Kit & Car Insurance — Must Declare!</strong><br><br><strong>The rule:</strong> If your car has a CNG/LPG kit (factory-fitted or aftermarket), it MUST be:<br>1. Endorsed on your <strong>RC</strong> (registration certificate)<br>2. Declared to your <strong>insurer</strong> and added to the policy<br><br><strong>Cost:</strong> Small extra premium (~₹60 on third-party + ~2–4% of kit value on own damage).<br><br><strong>If you dont declare it:</strong><br>• Claims involving the kit are rejected<br>• Even a normal accident/fire claim can be rejected — kits change the risk profile<br>• Legal issues at renewal/transfer<br><br>💡 <em>Factory-fitted CNG cars usually come pre-declared — aftermarket kits are where people slip.</em><br><br>📞 <em>Adding a kit? Sachin will get your policy endorsed correctly: <strong>9013976999</strong>.</em>`,
      quickReplies: ['Motor insurance', 'Zero depreciation', 'Engine protection', 'Speak to Sachin']
    },
    {
      id: 'motor_addons_extra',
      weight: 3,
      patterns: ['key replacement','tyre protect','tyre cover','ncb protect addon','daily allowance car','loss of personal belongings','rim damage'],
      response: () => `${greet()}<strong>🔑 Smart Motor Add-Ons Most People Miss</strong><br><br><strong>🔑 Key Replacement Cover</strong> — lost/stolen smart keys cost ₹15–40K to replace; this covers key + lockset<br><br><strong>🛞 Tyre Protect</strong> — covers tyre/rim damage WITHOUT an accident (potholes!) — normally excluded<br><br><strong>🛡️ NCB Protect</strong> — make 1–2 claims a year without losing your No Claim Bonus<br><br><strong>💼 Loss of Personal Belongings</strong> — laptop/bag stolen from car<br><br><strong>🏨 Daily Allowance</strong> — ₹500–1,000/day cab allowance while your car is in the garage<br><br><strong>Worth it?</strong> Each costs a few hundred rupees. For city driving with bad roads — tyre protect and NCB protect usually pay for themselves.<br><br>📞 <em>Sachin builds the right add-on stack for your car and usage: <strong>9013976999</strong>.</em>`,
      quickReplies: ['Zero depreciation', 'Engine protection', 'Roadside assistance', 'Speak to Sachin']
    },
    {
      id: 'pay_as_you_drive',
      weight: 2,
      patterns: ['pay as you drive','usage based insurance','pay per km','drive less pay less','telematics insurance','payd'],
      response: () => `${greet()}<strong>🚗 Pay As You Drive (PAYD) — Insurance by the Kilometre</strong><br><br>Drive less? Pay less. IRDAI-approved usage-based motor insurance:<br><br><strong>How it works:</strong><br>• Choose a km slab (e.g., 2,500 / 5,000 / 7,500 km per year)<br>• Own-damage premium drops <strong>10–25%</strong> vs regular policies<br>• Usage tracked via odometer declaration or telematics app/device<br><br><strong>Perfect for:</strong><br>• Work-from-home professionals<br>• Second cars that mostly sit in parking<br>• Metro users who drive only on weekends<br><br><strong>Watch out:</strong> exceed your slab and claims may face deductions — top up the slab before you cross it.<br><br>📞 <em>Sachin can check if PAYD beats your current premium: <strong>9013976999</strong>.</em>`,
      quickReplies: ['Motor insurance', 'IDV explained', 'No claim bonus', 'Speak to Sachin']
    },
    {
      id: 'group_gratuity',
      weight: 2,
      patterns: ['gratuity','group gratuity','gratuity scheme','gratuity funding','gratuity liability'],
      response: () => `${greet()}<strong>🏢 Group Gratuity Scheme — Fund It Smartly</strong><br><br>Gratuity is a <strong>statutory liability</strong> — every employee with 5+ years of service is entitled (15 days salary per year of service, up to ₹20L tax-free).<br><br><strong>Why fund it via a Group Gratuity Plan:</strong><br>• Company contributions are <strong>tax-deductible business expense</strong><br>• Fund grows tax-free with the insurer<br>• Built-in life cover for employees (future service gratuity paid even on death)<br>• Smooths cash flow — no sudden lump-sum hits when seniors retire<br><br><strong>Best for:</strong> Companies with 10+ employees, schools, hospitals, family businesses maturing into structured firms.<br><br>📞 <em>Sachin sets up group gratuity, group mediclaim and group term for businesses — call <strong>9013976999</strong>.</em>`,
      quickReplies: ['Business insurance', 'Group mediclaim', 'Key person insurance', 'Speak to Sachin']
    },
    {
      id: 'reverse_mortgage',
      weight: 2,
      patterns: ['reverse mortgage','loan against house for seniors','house pension scheme','rml scheme'],
      response: () => `${greet()}<strong>🏠 Reverse Mortgage — Your House Pays You a Pension</strong><br><br>For seniors (60+) who own a house but need monthly income:<br><br><strong>How it works:</strong><br>• Bank values your self-occupied house<br>• Pays you a <strong>monthly income / lump sum</strong> against it (up to ~60% of value)<br>• You LIVE in the house for life — no repayment while alive<br>• After both spouses pass, heirs can repay the loan and keep the house, or the bank sells and returns the surplus<br><br><strong>Key facts:</strong><br>• The monthly payouts are <strong>not taxable</strong> (loan, not income)<br>• Tenure typically 10–20 years<br>• Available at SBI, PNB, LIC HFL and others<br><br>💡 <em>Best used AFTER annuities/pension are explored — it is a last-resort income tool, not a first choice.</em><br><br>📞 <em>Sachin helps seniors design complete retirement income — call <strong>9013976999</strong>.</em>`,
      quickReplies: ['Annuity plans', 'Pension plans', 'Senior citizen insurance', 'Speak to Sachin']
    },
    {
      id: 'underwriting_info',
      weight: 2,
      patterns: ['underwriting','underwriter','how insurers assess risk','risk assessment insurance','proposal assessment'],
      response: () => `${greet()}<strong>🔍 Underwriting — How Insurers Decide Your Premium</strong><br><br>Underwriting is the insurers process of assessing YOUR risk before issuing a policy.<br><br><strong>What they look at:</strong><br>• <strong>Age & gender</strong> — biggest premium factors<br>• <strong>Health:</strong> medical history, BMI, existing conditions, family history<br>• <strong>Lifestyle:</strong> smoking, alcohol, adventure sports<br>• <strong>Occupation:</strong> hazardous jobs pay more<br>• <strong>Income:</strong> determines max life cover eligibility (usually 15–25x annual income)<br><br><strong>Possible outcomes:</strong><br>✅ Standard acceptance • 📈 Premium loading (higher rate) • 📋 Exclusions added • ❌ Postpone/decline<br><br>💡 <em>This is why buying insurance YOUNG and healthy locks in cheap premiums for life.</em><br><br>📞 <em>Sachin pre-screens your profile so your proposal sails through: <strong>9013976999</strong>.</em>`,
      quickReplies: ['Medical tests', 'Why claims get rejected', 'Term insurance', 'Speak to Sachin']
    },
    {
      id: 'reinsurance_info',
      weight: 1,
      patterns: ['reinsurance','reinsurer','insurance of insurers','gic re'],
      response: () => `${greet()}<strong>🌐 Reinsurance — The Insurance Behind Your Insurance</strong><br><br>Reinsurance is how insurance companies insure <strong>themselves</strong>.<br><br><strong>Why it matters to YOU:</strong><br>• Your insurer passes part of every big risk to global reinsurers (GIC Re, Munich Re, Swiss Re)<br>• So even a catastrophe (floods, pandemics) cannot wipe out your insurer<br>• It is a big reason claims get paid even in disaster years<br><br><strong>Fun fact:</strong> When an insurer offers you a very large cover (₹5 Cr+ term plan), the reinsurers underwriting rules often apply too — that is why big covers need more medicals.<br><br>💡 <em>Combined with IRDAI solvency rules, this is why regulated Indian insurers are extremely safe.</em><br><br>📞 <em>Questions about insurer safety? Ask Sachin: <strong>9013976999</strong>.</em>`,
      quickReplies: ['Is my insurer safe?', 'Claim settlement ratio', 'About IRDAI', 'Speak to Sachin']
    },
    {
      id: 'solvency_ratio_info',
      weight: 2,
      patterns: ['solvency ratio','solvency','insurer financial strength','financially strong insurer','can insurer go bankrupt'],
      response: () => `${greet()}<strong>🏦 Solvency Ratio — Can Your Insurer Actually Pay?</strong><br><br>The solvency ratio measures an insurers <strong>financial cushion</strong> — assets vs the claims it may have to pay.<br><br><strong>The rule:</strong> IRDAI requires every insurer to maintain a solvency ratio of at least <strong>1.5 (150%)</strong> at all times.<br><br><strong>How to use it:</strong><br>• Check the insurers latest solvency ratio (published quarterly, shown on IRDAI site)<br>• 1.5–2.0+ = comfortably safe<br>• Consistently near 1.5 = fine, but watch trends<br><br><strong>Along with solvency, check:</strong><br>• Claim Settlement Ratio (CSR) — % of claims paid<br>• Incurred Claim Ratio (ICR) — sustainability of pricing<br><br>💡 <em>No Indian life insurer has ever defaulted on valid claims — the regulatory system works.</em><br><br>📞 <em>Sachin compares insurers on ALL these metrics, not just price: <strong>9013976999</strong>.</em>`,
      quickReplies: ['Claim settlement ratio', 'Compare insurers', 'About IRDAI', 'Speak to Sachin']
    },
    {
      id: 'advisor_commission',
      weight: 3,
      patterns: ['commission','how much commission','agent commission','do you earn commission','your commission','why is advice free'],
      response: () => `${greet()}<strong>💰 How PolicyRaj Earns — Complete Transparency</strong><br><br>Fair question, and we answer it openly!<br><br><strong>How it works:</strong><br>• Advisors earn a commission from the insurer, built into the premium by IRDAI-regulated rates<br>• <strong>You pay the SAME premium</strong> whether you buy through an advisor or directly from the insurer — the price is regulated<br>• So our advice, comparisons, claim support and lifetime service cost you <strong>nothing extra</strong><br><br><strong>Why choose an advisor then?</strong><br>• Direct buying = you are alone at claim time<br>• Through PolicyRaj = Sachin personally assists your claims, renewals and reviews for life<br><br><strong>Our promise:</strong> We recommend from multiple partner insurers based on YOUR fit — our 22-year reputation is worth more than any commission.<br><br>📞 <em>Ask Sachin anything about this directly: <strong>9013976999</strong>.</em>`,
      quickReplies: ['About PolicyRaj', 'Why trust PolicyRaj?', 'Get a quote', 'Speak to Sachin']
    },

    /* ─── THANKS ─────────────────────────────────────── */
    {
      id: 'thanks',
      weight: 1,
      patterns: ['thank you','thanks','thank','great','helpful','awesome','good','nice','perfect','excellent','brilliant','amazing','superb','well done','bahut accha','shukriya'],
      response: () => `${greet()}You're very welcome! 😊 Truly happy I could help!<br><br>Remember, for detailed personalised advice, Sachin Kathuria is just a call away:<br>📱 <strong>9013976999</strong><br><br>Is there anything else on your mind? I'm here for anything — insurance, investments, or just general money questions! 🙏`,
      quickReplies: ['More questions','💬 Get a Quote','📞 Speak to Sachin','Close chat']
    },

    /* ─── GENERAL KNOWLEDGE / OFF-TOPIC FRIENDLY ────── */
    {
      id: 'general_friendly',
      weight: 1,
      patterns: ['weather','news','cricket','sports','politics','movie','food','recipe','joke','how are you','what time is it','who is pm','capital of','population','history','education','career advice','relationship','health tips'],
      response: () => `${greet()}Ha! I appreciate your curiosity 😄 — I'm Veera, PolicyRaj's AI insurance advisor, so finance and insurance is my superpower!<br><br>That said, I'm happy to chat. While I might not have the latest weather or cricket scores, I <em>am</em> exceptional at:<br><br>• 🏥 Health & medical insurance planning<br>• 💰 Saving money on taxes<br>• 📈 Investment & retirement planning<br>• 🛡️ Protecting your family's financial future<br><br>These topics impact your life more than the weather! 😊 What would you like to know?`,
      quickReplies: ['Health Insurance','Tax Saving','Investment Plans','Financial Planning']
    },

    /* ─── GOODBYE ────────────────────────────────────── */
    {
      id: 'bye',
      weight: 1,
      patterns: ['bye','goodbye','good night','see you','cya','exit','quit','close','done','no more questions','that\'s all','ok thanks','ok thank you'],
      response: () => `${greet()}Thank you so much for chatting with me! 🙏 It was great talking with you.<br><br>Whenever you need insurance advice — I'm right here. And for personalised help, Sachin is always just a call away at <strong>9013976999</strong>.<br><br>Take care and have a wonderful day! 🌟`,
      quickReplies: ['Actually, one more question','Get a Quote','Speak to Sachin']
    }
  ];

  // ── INTENT DETECTOR ──────────────────────────────────
  function detectIntent(input) {
    const text = input.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const words = text.split(' ');
    let bestIntent = null;
    let bestScore = 0;

    for (const entry of KB) {
      let score = 0;
      for (const pattern of entry.patterns) {
        if (text.includes(pattern)) {
          score += pattern.split(' ').length * 12 * entry.weight;
        }
        const pw = pattern.split(' ');
        if (pw.length === 1 && words.includes(pw[0])) {
          score += 6 * entry.weight;
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestIntent = entry;
      }
    }

    // Context-aware follow-up
    if (bestScore < 8 && ctx.lastIntent) {
      const related = {
        health: ['modern_treatments','organ_donor_air_amb','wellness_rewards','health_coverage','health_family','health_tax','preexisting','waitingperiod','top_up','cashless','copay','portability','day_care','health_ncb','restore_benefit','opd_cover','mental_health','newborn_cover','hospital_cash','health_checkup','ayush','domiciliary','group_individual','network_nonnetwork_health','pre_auth_surgery','dengue_ins','hospital_indemnity','cancer_ins','arogya_sanjeevani'],
        life: ['mwp_act','reversionary_bonus','alcohol_disclosure','life_howmuch','trop','riders','wholelife','mrta','lic_vs_private','limited_pay','single_premium','joint_life','self_employed','life_claim','group_term','homemaker_ins','premium_frequency','life_policy_loan','maturity_options','life_senior_ins','saral_jeevan','early_life_claim'],
        motor: ['cng_kit','motor_addons_extra','pay_as_you_drive','ncb','zero_dep','idv','return_invoice','electric_vehicle','new_car','bike_insurance','vehicle_transfer','engine_protect','roadside_assist','consumables_add','motor_theft_cl','motor_renew_tip','third_party_motor_cl','commercial_veh','motor_theft_claim2','natural_disaster_claim'],
        tax: ['elss_ppf','nps','ppf','new_tax_regime','home_loan_tax','ltcg','hra','itr_insurance','sec_80g','sec_80e_edu','maturity_tax_10d','lta_exemption','nps_employer_80ccd','senior_tax_plan','tax_free_income_list','form_16_explained','elss_selection'],
        pension: ['reverse_mortgage','annuity','nps','atal_pension','pmvvy_scheme','scss_scheme','swp_plan','retirement_calc_inv'],
        investments: ['child','ulip','elss_ppf','sip_power','compounding','ppf','sukanya','fd_vs_insurance','swp_plan','balanced_funds','elss_selection','retirement_calc_inv','stp_plan','diversification_inv','asset_allocation'],
        claims: ['claim_rejection','grievance','tpa','life_claim','claim_documents','claim_time','motor_theft_claim2','network_nonnetwork_health','pre_auth_surgery','surveyor_ins_role','early_life_claim','multiple_policy_claim','natural_disaster_claim','consumer_court_ins'],
        business: ['group_gratuity','key_person','marine_cargo','event_insurance','liability','cyber','shop_policy','doctors_pi','it_insurance','directors_officers_ins','fidelity_ins','product_liability_ins','contractors_ar_ins','hotel_ins','startup_ins_check','ngo_ins'],
        financial_planning: ['emergency_fund','health_vs_life','insurance_vs_investment','how_many_policies','portfolio_review','underinsurance','asset_allocation','diversification_inv','retirement_calc_inv'],
        personal_protection: ['critical_illness','personal_accident','pa_women_ins','pa_children_ins','group_pa_ins','disability_income_ins','cancer_ins','dengue_ins','hospital_indemnity','fracture_care','income_protection','high_risk_profession_ins','spine_back_ins','senior_pa_ins','accidental_death_benefit','vector_disease_ins'],
        travel_home: ['travel','home','schengen_ins','annual_travel_ins','senior_travel_ins','student_travel_ins','adventure_travel_ins','jewellery_ins','tenant_ins','home_contents','fire_ins_standalone','home_valuation','home_renovation_ins','pet_insurance','gadget_insurance','art_collectibles'],
        govt_schemes: ['pmjjby_pmsby','ayushman','atal_pension','sukanya','pmfby_crop','pmvvy_scheme','scss_scheme','epf_insurance_conn','esic_scheme','saral_jeevan','arogya_sanjeevani','railway_ins','state_health_schemes','jan_dhan_ins','kcc_insurance','nsc_kvp_schemes'],
        policy_mgmt: ['renewal','portability','digilocker','free_look','policy_surrender','policy_status','premium','nominee','assignment','update_details_ins','duplicate_policy_doc','auto_renewal_ins','payment_modes_ins','policy_schedule_understand','change_insurer','insurance_will_estate'],
        about_policyraj: ['advisor_commission','about','contact','partners','irdai','compare','quote','policyraj_services','policyraj_fees','policyraj_area','policyraj_claim_help','policyraj_annual_review','policyraj_nri','policyraj_business_clients','policyraj_success_stories','policyraj_get_started','sachin_biography','policyraj_compare_service'],
      };
      const rels = related[ctx.lastIntent] || [];
      for (const relId of rels) {
        const rel = KB.find(k => k.id === relId);
        if (rel) {
          let s = 0;
          for (const p of rel.patterns) {
            if (text.includes(p)) s += p.split(' ').length * 10;
          }
          if (s > bestScore) { bestScore = s; bestIntent = rel; }
        }
      }
    }

    if (bestScore < 4) {
      return {
        id: 'fallback',
        response: () => `${greet()}Hmm, I want to make sure I give you the right answer! 🤔<br><br>Here's what I know really well:<br><br>🏥 <strong>Insurance:</strong> Health, Life, Motor, Travel, Home, Business, Critical Illness, Personal Accident<br>📈 <strong>Investments:</strong> Child Plans, Pension, ULIP, ELSS, NPS, Endowment, Annuity<br>💰 <strong>Finance:</strong> Tax saving, Financial planning, Claims help, Renewals<br><br>Try asking something like:<br>• <em>"How much health insurance do I need?"</em><br>• <em>"What is zero depreciation?"</em><br>• <em>"How do I save tax?"</em><br><br>Or speak with Sachin directly at <strong>9013976999</strong> for any question! 😊`,
        quickReplies: ['🏥 Health Insurance','🛡️ Life Insurance','📈 Investment Plans','📞 Speak to Sachin']
      };
    }

    ctx.lastIntent = bestIntent.id;
    return bestIntent;
  }

  // ── UI HELPERS ────────────────────────────────────────
  function getEl(id) { return document.getElementById(id); }

  function appendMessage(html, sender) {
    const wrap = getEl('chatbotMessages');
    const msg = document.createElement('div');
    msg.className = 'cb-msg cb-msg-' + sender;

    if (sender === 'bot') {
      const av = document.createElement('img');
      av.src = 'rakesh-avatar.svg';
      av.className = 'cb-bot-avatar';
      av.alt = 'Veera';
      msg.appendChild(av);
    }

    const col = document.createElement('div');
    col.className = 'cb-col';

    const bubble = document.createElement('div');
    bubble.className = 'cb-bubble';
    bubble.innerHTML = html;

    const time = document.createElement('span');
    time.className = 'cb-time';
    const now = new Date();
    time.textContent = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');

    col.appendChild(bubble);
    col.appendChild(time);
    msg.appendChild(col);

    msg.style.opacity = '0';
    msg.style.transform = 'translateY(10px)';
    wrap.appendChild(msg);
    requestAnimationFrame(() => {
      msg.style.transition = 'opacity 0.28s ease, transform 0.28s ease';
      msg.style.opacity = '1';
      msg.style.transform = 'translateY(0)';
    });
    wrap.scrollTop = wrap.scrollHeight;
  }

  function showTyping() {
    const wrap = getEl('chatbotMessages');
    const el = document.createElement('div');
    el.className = 'cb-msg cb-msg-bot';
    el.id = 'cb-typing';

    const av = document.createElement('img');
    av.src = 'rakesh-avatar.svg';
    av.className = 'cb-bot-avatar';
    el.appendChild(av);

    const col = document.createElement('div');
    col.className = 'cb-col';
    col.innerHTML = '<div class="cb-bubble cb-typing-bub"><span></span><span></span><span></span></div>';
    el.appendChild(col);
    wrap.appendChild(el);
    wrap.scrollTop = wrap.scrollHeight;
  }

  function removeTyping() {
    const t = getEl('cb-typing');
    if (t) t.remove();
  }

  function setQuickReplies(replies) {
    const qr = getEl('chatbotQuickReplies');
    qr.innerHTML = '';
    if (!replies || !replies.length) return;
    replies.forEach(r => {
      const btn = document.createElement('button');
      btn.className = 'cb-qr-btn';
      btn.textContent = r;
      btn.onclick = () => handleUserInput(r);
      qr.appendChild(btn);
    });
  }

  function botReply(html, quickReplies, delay) {
    delay = delay || 700;
    showTyping();
    setTimeout(() => {
      removeTyping();
      appendMessage(html, 'bot');
      setQuickReplies(quickReplies || []);
    }, delay);
  }

  // ── SPECIAL ACTIONS ───────────────────────────────────
  const SPECIAL = {
    'Close chat': () => toggleChat(),
    '↩ Ask another question': () => botReply(`${greet()}Of course! What else would you like to know? 😊`, ['🏥 Health Insurance','🛡️ Life Insurance','📈 Investments','📞 Speak to Sachin'], 400),
    '↩ More Questions': () => botReply(`${greet()}Sure thing! What else can I help you with? 😊`, ['🏥 Health Insurance','🛡️ Life Insurance','📈 Investments','📞 Speak to Sachin'], 400),
    'Back': () => botReply('What would you like to explore?', ['Insurance Plans','Investment Plans','Premium Costs','Speak to Sachin'], 400),
    'Back to main menu': () => botReply('What would you like to explore?', ['Insurance Plans','Investment Plans','Premium Costs','Speak to Sachin'], 400),
    'Insurance Plans': () => botReply('Which type of insurance interests you?', ['🏥 Health Insurance','🛡️ Life Insurance','🚗 Motor Insurance','✈️ Travel Insurance','🏠 Home Insurance','🏢 Business Insurance'], 500),
    'Investment Plans': () => botReply('Which investment product would you like to know about?', ['👶 Child Plans','🌴 Pension Plans','💰 Tax Saving (80C)','🏦 Endowment Policy','💸 Money Back Policy','♾️ Annuity Plans'], 500),
    '💬 Get Quote now': () => { botReply('Opening the quote form for you!', [], 400); setTimeout(() => { if (typeof openModal === 'function') openModal(); }, 500); },
    '💬 Open Quote Form': () => { botReply('Opening the quote form for you!', [], 400); setTimeout(() => { if (typeof openModal === 'function') openModal(); }, 500); },
    '📱 WhatsApp Sachin': () => { botReply('Opening WhatsApp! 💬', [], 400); setTimeout(() => window.open('https://wa.me/919013976999','_blank'), 500); },
    '📱 WhatsApp Us': () => { botReply('Opening WhatsApp! 💬', [], 400); setTimeout(() => window.open('https://wa.me/919013976999','_blank'), 500); },
    '📞 Speak to Sachin': () => { botReply('Connecting you to Sachin! 📞', [], 400); setTimeout(() => window.open('tel:9013976999'), 500); },
    'Speak to Sachin': () => { botReply('Connecting you to Sachin! 📞', [], 400); setTimeout(() => window.open('tel:9013976999'), 500); },
    'Premium Costs': () => handleUserInput('premium'),
    'Compare plans': () => handleUserInput('compare plans'),
    'Financial planning tips': () => handleUserInput('financial planning'),
  };

  // ── NAME GREETING SPECIAL CASE ─────────────────────────
  function handleNameIntro(text) {
    const m = text.match(/(?:my name is|i am|i'm|call me|this is)\s+([A-Za-z]+)/i);
    if (m && m[1].length > 1 && !['am','just','here','from','at','not','the','a'].includes(m[1].toLowerCase())) {
      ctx.userName = m[1].charAt(0).toUpperCase() + m[1].slice(1).toLowerCase();
      botReply(
        `Nice to meet you, <strong>${ctx.userName}!</strong> 😊 I'm Veera, your PolicyRaj AI advisor.<br><br>How can I help you today, ${ctx.userName}? Whether it's insurance, investments, tax saving, or any money question — I'm all ears!`,
        ['🏥 Health Insurance','🛡️ Life Insurance','📈 Investments','💰 Save on Taxes'],
        600
      );
      return true;
    }
    return false;
  }

  // ── PROCESS INPUT ─────────────────────────────────────
  function handleUserInput(text) {
    if (!text.trim()) return;
    appendMessage(text, 'user');
    setQuickReplies([]);
    getEl('chatbotInput').value = '';

    const cleanText = text.replace(/[\u{1F300}-\u{1FFFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();

    if (SPECIAL[text]) { SPECIAL[text](); return; }

    // Try name intro
    if (handleNameIntro(cleanText)) return;

    // Also capture name passively (for future greetings)
    tryCaptureName(cleanText);

    const match = detectIntent(cleanText);
    const delay = 500 + Math.floor(Math.random() * 600);
    botReply(match.response(), match.quickReplies || [], delay);
  }

  window.sendChatMessage = function () {
    const input = getEl('chatbotInput');
    const val = input.value.trim();
    if (val) handleUserInput(val);
  };

  window.handleChatKey = function (e) {
    if (e.key === 'Enter') window.sendChatMessage();
  };

  // ── TOGGLE ────────────────────────────────────────────
  let chatOpen = false;
  let welcomed = false;
  let badgeDone = false;

  window.toggleChat = function () {
    chatOpen = !chatOpen;
    const win = getEl('chatbotWindow');
    const btn = getEl('chatbotBtn');
    if (chatOpen) {
      win.classList.add('open');
      btn.classList.add('active');
      getEl('chatbotBadge').style.display = 'none';
      badgeDone = true;
      if (!welcomed) {
        welcomed = true;
        setTimeout(() => {
          botReply(
            `Namaste! 🙏 I'm <strong>Veera</strong>, your AI insurance advisor at PolicyRaj!<br><br>I can help you with <em>anything</em> — insurance plans, investments, tax saving, claims, premiums, or just general money advice. Feel free to ask me anything! 😊<br><br>What's on your mind today?`,
            ['🏥 Health Insurance','🛡️ Life Insurance','📈 Investment Plans','💰 Save on Taxes','📞 Speak to Sachin'],
            900
          );
        }, 200);
      }
      setTimeout(() => getEl('chatbotInput').focus(), 500);
    } else {
      win.classList.remove('open');
      btn.classList.remove('active');
    }
  };

  window.addEventListener('load', function () {
    setTimeout(() => {
      if (!badgeDone) getEl('chatbotBadge').style.display = 'flex';
    }, 3500);
  });

})();
