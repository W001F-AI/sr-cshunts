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

    initRechargeCalc();
});
