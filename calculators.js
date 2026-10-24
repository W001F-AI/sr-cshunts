document.addEventListener('DOMContentLoaded', () => {
    // ============================================
    // BILLING CALCULATOR
    // ============================================
    const VAT_MULT = 1.23;
    const FIXED_FEE = 12.5;

    let selectedBillingBase = null;

    function calcTotal(base) {
        return Math.round((base * VAT_MULT + FIXED_FEE) * 100) / 100;
    }

    function calcPartial(base, days) {
        // Daily rate = (base × VAT) / 30, then add fixed fee once
        const daily = (base * VAT_MULT) / 30;
        const result = Math.round((daily * days + FIXED_FEE) * 100) / 100;
        return result;
    }

    function initBillingCalc() {
        const btns = document.querySelectorAll('.billing-plan-btn');
        const formulaEl = document.getElementById('billingFormula');
        const systemLabel = document.getElementById('billingSystemLabel');
        const fBase = document.getElementById('fBase');
        const fTotal = document.getElementById('fTotal');
        const partialSection = document.getElementById('partialCalcSection');
        const daysInput = document.getElementById('billingDaysInput');
        const partialResult = document.getElementById('partialResult');
        const partialFormulaText = document.getElementById('partialFormulaText');
        const partialTotal = document.getElementById('partialTotal');

        if (!btns.length || !formulaEl) return;

        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Toggle active state
                btns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const base = parseFloat(btn.getAttribute('data-base'));
                const name = btn.getAttribute('data-name');
                selectedBillingBase = base;

                const total = calcTotal(base);

                // Update formula display
                systemLabel.textContent = `نظام الفاتورة — ${name}`;
                fBase.textContent = base.toLocaleString();
                fTotal.textContent = total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' EGP';

                formulaEl.style.display = 'flex';
                partialSection.style.display = 'block';

                // Reset days input & partial result
                if (daysInput) daysInput.value = '';
                if (partialResult) partialResult.style.display = 'none';

                // Vibrate on mobile
                if (window.navigator && window.navigator.vibrate) window.navigator.vibrate(8);

                if (window.safeRenderIcons) window.safeRenderIcons();
            });
        });

        // Helper: format as EGP
        function toEGP(val) {
            return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' EGP';
        }

        // Shared state for all settlement values
        const settlement = { partial: 0, issued: 0, usage: 0, occ: 0 };
        const SDF_FEE = 10; // رسوم تنمية - Sustainable Development Fee

        function updateGrandTotal() {
            const total = settlement.partial + settlement.issued + settlement.usage + settlement.occ;
            const anyFilled = Object.values(settlement).some(v => v > 0);
            const grandBox = document.getElementById('grandTotalBox');
            const grandAmount = document.getElementById('grandTotalAmount');
            const breakdown = document.getElementById('grandTotalBreakdown');
            if (!grandBox) return;

            if (anyFilled) {
                grandBox.style.display = 'block';
                const totalWithSDF = total + SDF_FEE;
                grandAmount.textContent = toEGP(totalWithSDF);

                // Build breakdown lines
                const lines = [];
                if (settlement.partial > 0)  lines.push({ label: 'Partial Days',    val: settlement.partial,  sdf: false });
                if (settlement.issued > 0)   lines.push({ label: 'Issued Invoices', val: settlement.issued,   sdf: false });
                if (settlement.usage > 0)    lines.push({ label: 'Unbilled Usage',  val: settlement.usage,    sdf: false });
                if (settlement.occ > 0)      lines.push({ label: 'Unbilled OCC',    val: settlement.occ,      sdf: false });
                // Always add SDF
                lines.push({ label: 'SDF — رسوم تنمية', val: SDF_FEE, sdf: true });

                breakdown.innerHTML = lines.map(l =>
                    l.sdf
                    ? `<div class="breakdown-line sdf-line">
                            <span class="sdf-badge"><i data-lucide="plus-circle" style="width:13px;height:13px;vertical-align:middle;margin-left:4px;"></i>SDF رسوم تنمية</span>
                            <span class="sdf-amount">${toEGP(l.val)}</span>
                       </div>`
                    : `<div class="breakdown-line"><span>${l.label}</span><span>${toEGP(l.val)}</span></div>`
                ).join('');
                if (window.safeRenderIcons) window.safeRenderIcons();
            } else {
                grandBox.style.display = 'none';
            }
        }

        // 1. Partial Days
        if (daysInput) {
            daysInput.addEventListener('input', () => {
                const days = parseInt(daysInput.value);
                const partialResult = document.getElementById('partialResult');
                const partialFormulaText = document.getElementById('partialFormulaText');
                const partialTotal = document.getElementById('partialTotal');
                if (!selectedBillingBase || isNaN(days) || days < 1 || days > 31) {
                    if (partialResult) partialResult.style.display = 'none';
                    settlement.partial = 0;
                    updateGrandTotal();
                    return;
                }
                const result = calcPartial(selectedBillingBase, days);
                settlement.partial = result;
                if (partialFormulaText) partialFormulaText.textContent =
                    `(${selectedBillingBase} × ${VAT_MULT}) ÷ 30 × ${days} + ${FIXED_FEE}`;
                if (partialTotal) partialTotal.textContent = toEGP(result);
                if (partialResult) partialResult.style.display = 'flex';
                updateGrandTotal();
            });
        }

        // 2. Issued Invoices
        const issuedInput = document.getElementById('issuedInvoicesInput');
        if (issuedInput) {
            issuedInput.addEventListener('input', () => {
                const val = parseFloat(issuedInput.value) || 0;
                settlement.issued = val;
                const res = document.getElementById('issuedResult');
                const amt = document.getElementById('issuedAmount');
                if (val > 0) { if (amt) amt.textContent = toEGP(val); if (res) res.style.display = 'flex'; }
                else { if (res) res.style.display = 'none'; }
                updateGrandTotal();
            });
        }

        // 3. Unbilled Usage
        const usageInput = document.getElementById('unbilledUsageInput');
        if (usageInput) {
            usageInput.addEventListener('input', () => {
                const val = parseFloat(usageInput.value) || 0;
                settlement.usage = val;
                const res = document.getElementById('usageResult');
                const amt = document.getElementById('usageAmount');
                if (val > 0) { if (amt) amt.textContent = toEGP(val); if (res) res.style.display = 'flex'; }
                else { if (res) res.style.display = 'none'; }
                updateGrandTotal();
            });
        }

        // 4. Unbilled OCC
        const occInput = document.getElementById('unbilledOCCInput');
        if (occInput) {
            occInput.addEventListener('input', () => {
                const val = parseFloat(occInput.value) || 0;
                settlement.occ = val;
                const res = document.getElementById('occResult');
                const amt = document.getElementById('occAmount');
                if (val > 0) { if (amt) amt.textContent = toEGP(val); if (res) res.style.display = 'flex'; }
                else { if (res) res.style.display = 'none'; }
                updateGrandTotal();
            });
        }
    }

    // Initialize billing calculator on load
    initBillingCalc();

    // ============================================
    // RECHARGE CALCULATOR
    // ============================================
    function initRechargeCalc() {
        const toggleBtn = document.getElementById('toggleRechargeMode');
        const mode1 = document.getElementById('modePaidToBalance');
        const mode2 = document.getElementById('modeBalanceToPaid');
        
        const inputPaid = document.getElementById('inputPaidAmount');
        const outputCredit = document.getElementById('outputCreditAmount');
        
        const inputCredit = document.getElementById('inputRequiredCredit');
        const outputPaid = document.getElementById('outputRequiredPayment');

        const presetChips = document.querySelectorAll('.preset-chip');

        let currentMode = 1; // 1: Paid -> Balance, 2: Balance -> Paid

        if (!toggleBtn || !inputPaid || !inputCredit) return;

        function updateCalc() {
            if (currentMode === 1) {
                const val = parseFloat(inputPaid.value) || 0;
                outputCredit.value = (val * 0.7).toFixed(2);
            } else {
                const val = parseFloat(inputCredit.value) || 0;
                outputPaid.value = (val / 0.7).toFixed(2);
            }
        }

        toggleBtn.addEventListener('click', () => {
            currentMode = currentMode === 1 ? 2 : 1;
            mode1.style.display = currentMode === 1 ? 'flex' : 'none';
            mode2.style.display = currentMode === 2 ? 'flex' : 'none';
            inputPaid.value = '';
            outputCredit.value = '';
            inputCredit.value = '';
            outputPaid.value = '';
            
            // Haptic feedback on switch
            if (window.navigator && window.navigator.vibrate) window.navigator.vibrate(5);
        });

        inputPaid.addEventListener('input', updateCalc);
        inputCredit.addEventListener('input', updateCalc);

        presetChips.forEach(chip => {
            chip.addEventListener('click', () => {
                const val = chip.getAttribute('data-val');
                if (currentMode === 1) {
                    inputPaid.value = val;
                } else {
                    inputCredit.value = val;
                }
                updateCalc();
                
                // Active state for chip
                presetChips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                
                if (window.navigator && window.navigator.vibrate) window.navigator.vibrate(5);
            });
        });
    }

    // ============================================
    // PREMIER VALUE FOR MONEY INTERACTIONS
    // ============================================
    function initPremierVfm() {
        const toggleBtn = document.getElementById('vfmToggleTableBtn');
        const tableWrapper = document.getElementById('vfmFullTableWrapper');
        const toggleIcon = document.getElementById('vfmToggleIcon');

        if (toggleBtn && tableWrapper) {
            toggleBtn.addEventListener('click', () => {
                const isHidden = tableWrapper.style.display === 'none' || tableWrapper.style.display === '';
                tableWrapper.style.display = isHidden ? 'block' : 'none';
                if (toggleIcon) {
                    toggleIcon.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
                }
                const span = toggleBtn.querySelector('span');
                if (span) {
                    span.textContent = isHidden 
                        ? 'إخفاء جدول تفكيك الخدمات الـ 9' 
                        : 'عرض جدول تفكيك الخدمات الـ 9 بالكامل وقيمتها المالية';
                }
                if (window.safeRenderIcons) window.safeRenderIcons();
                if (window.navigator && window.navigator.vibrate) window.navigator.vibrate(8);
            });
        }

        // Sub-tabs switching between Premier views (Plans, Insurance, Calc, Notice, All)
        const navPills = document.querySelectorAll('.premier-quick-nav .p-nav-pill');
        const subViews = document.querySelectorAll('.premier-sub-view');
        const premierSection = document.getElementById('premierSection');

        const mobileSelect = document.getElementById('premierMobileViewSelect');

        if (subViews.length && (navPills.length || mobileSelect)) {
            document.body.classList.add('pview-managed');

            function switchSubView(viewKey) {
                navPills.forEach(p => {
                    const isTarget = p.getAttribute('data-subview-target') === viewKey;
                    p.classList.toggle('active', isTarget);
                });

                if (mobileSelect && mobileSelect.value !== viewKey) {
                    mobileSelect.value = viewKey;
                }

                if (viewKey === 'all') {
                    subViews.forEach(v => v.classList.add('active'));
                    if (premierSection) premierSection.classList.add('show-all');
                } else {
                    if (premierSection) premierSection.classList.remove('show-all');
                    subViews.forEach(v => {
                        const matches = v.getAttribute('data-subview') === viewKey;
                        v.classList.toggle('active', matches);
                    });
                }

                if (window.safeRenderIcons) window.safeRenderIcons();
                if (window.navigator && window.navigator.vibrate) window.navigator.vibrate(6);
            }

            navPills.forEach(pill => {
                pill.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetView = pill.getAttribute('data-subview-target');
                    if (targetView) switchSubView(targetView);
                });
            });

            if (mobileSelect) {
                mobileSelect.addEventListener('change', (e) => {
                    const targetView = e.target.value;
                    if (targetView) switchSubView(targetView);
                });
            }
        }
    }

    // ============================================
    // ORANGE DEVICE INSURANCE CALCULATOR
    // ============================================
    function initDeviceInsuranceCalc() {
        const priceInput = document.getElementById('insDevicePrice');
        const feeOutput = document.getElementById('insCalculatedFee');
        const presetBtns = document.querySelectorAll('.ins-preset-btn');

        if (!priceInput || !feeOutput) return;

        function updateFee() {
            const price = parseFloat(priceInput.value) || 0;
            // Insurance fee = 0.025% of device price = price * (0.025 / 100) = price * 0.00025
            const fee = price * 0.00025;
            feeOutput.textContent = fee.toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ج.م';
        }

        priceInput.addEventListener('input', updateFee);

        presetBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const val = btn.getAttribute('data-price');
                priceInput.value = val;
                presetBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                updateFee();
                if (window.navigator && window.navigator.vibrate) window.navigator.vibrate(6);
            });
        });
    }

    // ============================================
    // PREMIER COMPARISON & UPSELLING TOOL
    // ============================================
    function initPremierComparison() {
        const planASelect = document.getElementById('comparePlanA');
        const planBSelect = document.getElementById('comparePlanB');
        const swapBtn = document.getElementById('compareSwapBtn');
        const resultContainer = document.getElementById('compareResultContainer');

        if (!planASelect || !planBSelect || !resultContainer) return;

        const PREMIER_TIERS = {
            'PREMIER Lite': {
                name: 'PREMIER Lite',
                tierRank: 1,
                basePrice: 520,
                totalFees: 652,
                minutes: 2500,
                dataGb: 15,
                familyLines: 1,
                intlMinutes: 0,
                intlLabel: 'بدون دقائق دولية',
                dataRoaming: '1 GB Weekly (مرتين سنوياً)',
                installment: '30,000 ج.م',
                savings: 3110,
                subs: ['Amazon Prime', 'Spotify Premium', 'London Cab (20%)', 'Sixt (15%)', 'فنادق الجونة (15%)']
            },
            'PREMIER Plus': {
                name: 'PREMIER Plus',
                tierRank: 2,
                basePrice: 690,
                totalFees: 861,
                minutes: 3500,
                dataGb: 20,
                familyLines: 2,
                intlMinutes: 15,
                intlLabel: '15 دقيقة دولية',
                dataRoaming: '1.5 GB Weekly (مرتين سنوياً)',
                installment: '45,000 ج.م',
                savings: 3360,
                subs: ['Amazon Prime', 'Spotify Premium', 'London Cab (20%)', 'Sixt (15%)', 'فنادق الجونة (15%)', 'Gourmet (خصم)']
            },
            'PREMIER Select': {
                name: 'PREMIER Select',
                tierRank: 3,
                basePrice: 820,
                totalFees: 1021,
                minutes: 5000,
                dataGb: 25,
                familyLines: 3,
                intlMinutes: 30,
                intlLabel: '30 دقيقة دولية',
                dataRoaming: '10 GB Weekly (مرة سنوياً)',
                installment: '50,000 ج.م',
                savings: 4424,
                subs: ['Amazon Prime', 'Spotify Premium', 'TOD (3 شهور)', 'YouTube Premium', 'London Cab (20%)', 'Sixt (15%)', 'فنادق الجونة (15%)', 'Gourmet (خصم)', 'EgyptAir (أميال)']
            },
            'PREMIER Ultra': {
                name: 'PREMIER Ultra',
                tierRank: 4,
                basePrice: 1200,
                totalFees: 1489,
                minutes: 7000,
                dataGb: 40,
                familyLines: 4,
                intlMinutes: 45,
                intlLabel: '45 دقيقة دولية',
                dataRoaming: '10 GB Weekly (مرتين سنوياً)',
                installment: '60,000 ج.م',
                savings: 5424,
                subs: ['Amazon Prime', 'Spotify Premium', 'TOD (6 شهور)', 'YouTube Premium', 'London Cab (20%)', 'Sixt (15%)', 'فنادق الجونة (15%)', 'Gourmet (1,000 ج)', 'EgyptAir (أميال)']
            },
            'PREMIER Platinum': {
                name: 'PREMIER Platinum',
                tierRank: 5,
                basePrice: 1725,
                totalFees: 2134,
                minutes: 10000,
                dataGb: 70,
                familyLines: 5,
                intlMinutes: 60,
                intlLabel: '60 دقيقة دولية',
                dataRoaming: '10 GB Weekly (3 مرات سنوياً)',
                installment: '100,000 ج.م',
                savings: 6090,
                subs: ['Amazon (مدى الحياة)', 'Spotify (مدى الحياة)', 'TOD (مدى الحياة)', 'YouTube Premium', 'London Cab (20%)', 'Sixt (15%)', 'فنادق الجونة (15%)', 'Gourmet (1,500 ج)', 'EgyptAir (أميال)']
            }
        };

        const subIcons = {
            'Amazon': 'shopping-bag',
            'Spotify': 'music',
            'TOD': 'play-circle',
            'YouTube': 'video',
            'Cab': 'car',
            'Sixt': 'key',
            'الجونة': 'palmtree',
            'Gourmet': 'utensils',
            'EgyptAir': 'plane'
        };

        function getIconForSub(subText) {
            for (const key in subIcons) {
                if (subText.includes(key)) return subIcons[key];
            }
            return 'star';
        }

        function renderComparison() {
            const pAKey = planASelect.value;
            const pBKey = planBSelect.value;
            const planA = PREMIER_TIERS[pAKey];
            const planB = PREMIER_TIERS[pBKey];

            if (!planA || !planB) return;

            if (pAKey === pBKey) {
                resultContainer.innerHTML = `
                    <div class="c-same-plans-alert">
                        <i data-lucide="info"></i>
                        <span>لقد اخترت نفس الباقة (${planA.name})! اختر باقتين مختلفتين لمعرفة فرق السعر ومزايا الترقية.</span>
                    </div>
                `;
                if (window.safeRenderIcons) window.safeRenderIcons();
                return;
            }

            const feeDiff = planB.totalFees - planA.totalFees;
            const dataDiff = planB.dataGb - planA.dataGb;
            const minutesDiff = planB.minutes - planA.minutes;
            const savingsDiff = planB.savings - planA.savings;
            const familyDiff = planB.familyLines - planA.familyLines;
            const dailyDiff = Math.abs((feeDiff / 30)).toFixed(1);

            // New Perks in B that are not in A (matching substrings)
            const newPerks = planB.subs.filter(sB => {
                return !planA.subs.some(sA => {
                    const normA = sA.split('(')[0].trim().toLowerCase();
                    const normB = sB.split('(')[0].trim().toLowerCase();
                    return normA === normB;
                });
            });

            const isUpgrade = feeDiff > 0;

            if (isUpgrade) {
                // Pitch script
                let pitchPerksHighlight = newPerks.slice(0, 3).join(' و ');
                if (!pitchPerksHighlight) pitchPerksHighlight = 'مزايا حصرية إضافية';
                const pitchText = `يا فندم بفرق ${feeDiff} جنيه بس في الفاتورة الشهرية (يعني حوالي ${dailyDiff} جنيه في اليوم)، حضرتك هتاخد ${dataDiff} جيجا نت إضافية، و${minutesDiff.toLocaleString('ar-EG')} دقيقة زيادة، بالإضافة لاشتراكات (${pitchPerksHighlight}) مجاناً وتوفير إضافي ${savingsDiff.toLocaleString('ar-EG')} ج.م كل شهر!`;

                let newPerksHTML = '';
                if (newPerks.length > 0) {
                    newPerksHTML = `
                        <div class="c-new-perks-box">
                            <div class="c-box-title"><i data-lucide="sparkles"></i> مزايا ترفيهية ولايف ستايل جديدة سيحصل عليها العميل مجاناً (${newPerks.length}):</div>
                            <div class="c-perks-grid">
                                ${newPerks.map(p => `
                                    <div class="c-perk-badge">
                                        <i data-lucide="${getIconForSub(p)}"></i>
                                        <span>${p}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                }

                resultContainer.innerHTML = `
                    <div class="c-result-card upgrade-mode">
                        <div class="c-diff-banner">
                            <div class="c-diff-header">
                                <span class="c-diff-badge">فرصة الترقية الذكية (Upselling)</span>
                                <span class="c-diff-sub">من ${planA.name} ⬅️ إلى ${planB.name}</span>
                            </div>
                            <div class="c-cost-row">
                                <div class="c-main-diff">
                                    <span class="diff-sign">+</span>
                                    <span class="diff-number">${feeDiff}</span>
                                    <span class="diff-unit">ج.م / شهر</span>
                                    <span class="diff-tax-tag">شامل الضريبة</span>
                                </div>
                                <div class="c-daily-tag">
                                    <i data-lucide="clock"></i>
                                    <span>يعادل فقط <strong>${dailyDiff} ج.م / يومياً</strong>!</span>
                                </div>
                            </div>
                        </div>

                        <div class="c-gains-grid">
                            <div class="c-gain-item highlight-net">
                                <i data-lucide="wifi"></i>
                                <div class="c-gain-text">
                                    <span class="gain-lbl">الإنترنت الإضافي</span>
                                    <span class="gain-val" dir="ltr">+${dataDiff} GB Net</span>
                                    <span class="gain-sub">${planA.dataGb}GB ⬅️ <strong>${planB.dataGb}GB</strong></span>
                                </div>
                            </div>

                            <div class="c-gain-item">
                                <i data-lucide="phone"></i>
                                <div class="c-gain-text">
                                    <span class="gain-lbl">المكالمات الإضافية</span>
                                    <span class="gain-val" dir="ltr">+${minutesDiff.toLocaleString()} Min</span>
                                    <span class="gain-sub">${planA.minutes.toLocaleString()} ⬅️ <strong>${planB.minutes.toLocaleString()}</strong></span>
                                </div>
                            </div>

                            <div class="c-gain-item">
                                <i data-lucide="users"></i>
                                <div class="c-gain-text">
                                    <span class="gain-lbl">خطوط العائلة</span>
                                    <span class="gain-val">+${familyDiff} خط</span>
                                    <span class="gain-sub">${planA.familyLines} خطوط ⬅️ <strong>${planB.familyLines} خطوط</strong></span>
                                </div>
                            </div>

                            <div class="c-gain-item highlight-save">
                                <i data-lucide="gift"></i>
                                <div class="c-gain-text">
                                    <span class="gain-lbl">توفير شهري إضافي بالمزايا</span>
                                    <span class="gain-val" dir="ltr">+${savingsDiff.toLocaleString()} L.E</span>
                                    <span class="gain-sub">من ${planA.savings.toLocaleString()} ⬅️ <strong>${planB.savings.toLocaleString()} ج.م</strong></span>
                                </div>
                            </div>
                        </div>

                        <div class="c-specs-summary-row">
                            <div class="c-spec-chip">
                                <i data-lucide="globe"></i>
                                <span>الدولي: <strong>${planB.intlLabel}</strong></span>
                            </div>
                            <div class="c-spec-chip">
                                <i data-lucide="plane"></i>
                                <span>التجوال: <strong>${planB.dataRoaming}</strong></span>
                            </div>
                            <div class="c-spec-chip">
                                <i data-lucide="credit-card"></i>
                                <span>تقسيط أجهزة حتى: <strong>${planB.installment}</strong></span>
                            </div>
                        </div>

                        ${newPerksHTML}

                        <div class="c-pitch-box">
                            <div class="c-pitch-header">
                                <i data-lucide="quote"></i>
                                <span>جملة الإقناع المقترحة للعميل (Pitching Script):</span>
                            </div>
                            <p class="c-pitch-quote">"${pitchText}"</p>
                            <div class="c-pitch-actions">
                                <button type="button" class="c-copy-pitch-btn" id="copyPitchBtn">
                                    <i data-lucide="copy"></i>
                                    <span>نسخ الجملة</span>
                                </button>
                                <a href="https://wa.me/?text=${encodeURIComponent(pitchText)}" target="_blank" rel="noopener" class="c-share-wa-btn">
                                    <i data-lucide="send"></i>
                                    <span>مشاركة عبر واتساب</span>
                                </a>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                // Downgrade scenario
                const posFeeDiff = Math.abs(feeDiff);
                const posDataDiff = Math.abs(dataDiff);
                const posMinutesDiff = Math.abs(minutesDiff);

                resultContainer.innerHTML = `
                    <div class="c-result-card downgrade-mode">
                        <div class="c-diff-banner downgrade">
                            <div class="c-diff-header">
                                <span class="c-diff-badge red">تخفيض الباقة (Downgrade)</span>
                                <span class="c-diff-sub">من ${planA.name} ⬅️ إلى ${planB.name}</span>
                            </div>
                            <div class="c-cost-row">
                                <div class="c-main-diff red">
                                    <span class="diff-sign">-</span>
                                    <span class="diff-number">${posFeeDiff}</span>
                                    <span class="diff-unit">ج.م / شهر</span>
                                    <span class="diff-tax-tag">توفير بالفاتورة</span>
                                </div>
                            </div>
                        </div>
                        <div class="c-downgrade-warning">
                            <i data-lucide="alert-triangle"></i>
                            <div>
                                <strong>تنبيه للموظف:</strong> التخفيض سيوفر للعميل ${posFeeDiff} ج.م في الفاتورة، لكنه سيفقد <strong>${posDataDiff} جيجا نت</strong> و<strong>${posMinutesDiff.toLocaleString()} دقيقة</strong> بالإضافة للعديد من المزايا الحصرية والخصومات.
                            </div>
                        </div>
                    </div>
                `;
            }

            if (window.safeRenderIcons) window.safeRenderIcons();

            const copyBtn = document.getElementById('copyPitchBtn');
            if (copyBtn) {
                copyBtn.addEventListener('click', () => {
                    const quoteText = document.querySelector('.c-pitch-quote')?.textContent || '';
                    navigator.clipboard.writeText(quoteText).then(() => {
                        copyBtn.classList.add('copied');
                        copyBtn.innerHTML = `<i data-lucide="check"></i> <span>تم النسخ!</span>`;
                        if (window.safeRenderIcons) window.safeRenderIcons();
                        setTimeout(() => {
                            copyBtn.classList.remove('copied');
                            copyBtn.innerHTML = `<i data-lucide="copy"></i> <span>نسخ الجملة</span>`;
                            if (window.safeRenderIcons) window.safeRenderIcons();
                        }, 2000);
                    });
                });
            }
        }

        planASelect.addEventListener('change', renderComparison);
        planBSelect.addEventListener('change', renderComparison);

        if (swapBtn) {
            swapBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const temp = planASelect.value;
                planASelect.value = planBSelect.value;
                planBSelect.value = temp;
                renderComparison();
                if (window.navigator && window.navigator.vibrate) window.navigator.vibrate(8);
            });
        }

        renderComparison();
    }

    initRechargeCalc();
    initPremierVfm();
    initDeviceInsuranceCalc();
    initPremierComparison();
});
