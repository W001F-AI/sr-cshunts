document.addEventListener('DOMContentLoaded', () => {
    const kpis = [
        { id: 'gas', title: "GA'S", shortTitle: "GA'S", weight: 40 },
        { id: 'points', title: 'POINTS', shortTitle: "POINTS", weight: 15 },
        { id: 'ocex', title: 'OC.EX', shortTitle: "OC.EX", weight: 10 },
        { id: 'postpaid', title: 'POSTPAID', shortTitle: "POST", weight: 10 },
        { id: 'dsl', title: 'DSL', shortTitle: "DSL", weight: 10 },
        { id: 'cashin', title: 'CASHIN', shortTitle: "CASH", weight: 0 },
        { id: 'home4g', title: 'Home4&5G', shortTitle: "H4/5G", weight: 0 },
        { id: 'quality', title: 'Quality', shortTitle: "QUAL", weight: 15, isPercentage: true },
        { id: 'ocn', title: 'OC.N (Condition)', shortTitle: "OC.N", weight: 0, isPercentage: true }
    ];

    const grid = document.querySelector('.tracker-grid');
    if (!grid) return;

    // ===== LIVE DATE BADGE =====
    function updateDateBadge() {
        const badge = document.getElementById('trackerDateBadge');
        if (!badge) return;
        const now = new Date();
        const dayName = now.toLocaleDateString('ar-EG', { weekday: 'long' });
        const dateStr = now.toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' });
        const timeStr = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
        badge.textContent = `${dayName} ${dateStr} — ${timeStr}`;
    }
    updateDateBadge();
    setInterval(updateDateBadge, 60000);

    let state = JSON.parse(localStorage.getItem('orange_tracker_data')) || {};

    // Render cards
    grid.innerHTML = kpis.map(kpi => {
        const savedTarget = state[`${kpi.id}_target`];
        const valTarget = savedTarget !== undefined ? savedTarget : (kpi.isPercentage ? 100 : '');
        const savedActual = state[`${kpi.id}_actual`];
        const valActual = (savedActual !== undefined && savedActual !== null) ? savedActual : '';
        const wLabel = kpi.weight > 0 ? `${kpi.weight}%` : 'Condition';
        
        return `
        <div class="tracker-card" data-id="${kpi.id}">
            <div class="tracker-card-header">
                <h3>${kpi.title}</h3>
                <span class="tracker-weight">${wLabel}</span>
            </div>
            <div class="tracker-inputs">
                <div class="tracker-input-group">
                    <label>${kpi.isPercentage ? 'الهدف (%)' : 'Target'}</label>
                    <input type="number" id="tr_${kpi.id}_target" value="${valTarget}" placeholder="${kpi.isPercentage ? '100' : '0'}">
                </div>
                <div class="tracker-input-group">
                    <label>${kpi.isPercentage ? 'المُحقق (%)' : 'Actual'}</label>
                    <div class="tr-actual-row">
                        <button class="tr-dec-btn" data-id="${kpi.id}" type="button">−</button>
                        <input type="number" id="tr_${kpi.id}_actual" value="${valActual}" placeholder="0">
                        <button class="tr-inc-btn" data-id="${kpi.id}" type="button">+</button>
                    </div>
                </div>
            </div>
            <div class="tracker-progress-bar">
                <div class="tracker-progress-fill" id="tr_${kpi.id}_fill"></div>
            </div>
            <div class="tracker-score" id="tr_${kpi.id}_score">الإنجاز: <span>0%</span></div>
        </div>
        `;
    }).join('');

    // Elements
    const inputs = document.querySelectorAll('.tracker-card input');
    const gaugeFill = document.getElementById('kpiGaugeFill');
    const totalValue = document.getElementById('kpiTotalValue');
    const alertMsg = document.getElementById('kpiAlertMessage');
    const resetBtn = document.getElementById('resetTrackerBtn');

    const trendChart = document.getElementById('kpiTrendChart');
    const chartTooltip = document.getElementById('chartTooltip');

    function updateChart(kpiChartData) {
        if (!trendChart) return;

        const container = document.querySelector('.svg-chart-container');
        const containerWidth = container ? container.clientWidth : 500;
        const W = containerWidth > 0 ? containerWidth : 500;
        const H = 220;

        trendChart.setAttribute('viewBox', `0 0 ${W} ${H}`);

        const margin = { left: 45, right: 15, top: 20, bottom: 20 };
        const chartWidth = W - margin.left - margin.right;
        const spacing = chartWidth / kpiChartData.length;
        const barWidth = Math.min(28, spacing * 0.6);
        const barMaxHeight = 180;

        let html = `
            <!-- Grid Lines -->
            <line x1="${margin.left}" y1="20" x2="${W - margin.right}" y2="20" class="chart-grid-line" stroke-dasharray="4"/>
            <line x1="${margin.left}" y1="65" x2="${W - margin.right}" y2="65" class="chart-grid-line" stroke-dasharray="4"/>
            <line x1="${margin.left}" y1="110" x2="${W - margin.right}" y2="110" class="chart-grid-line" stroke-dasharray="4"/>
            <line x1="${margin.left}" y1="155" x2="${W - margin.right}" y2="155" class="chart-grid-line" stroke-dasharray="4"/>
            <line x1="${margin.left}" y1="200" x2="${W - margin.right}" y2="200" class="chart-grid-line-bottom"/>

            <!-- Grid Labels Y-axis -->
            <text x="${margin.left - 8}" y="204" class="chart-label-y" text-anchor="end">0%</text>
            <text x="${margin.left - 8}" y="159" class="chart-label-y" text-anchor="end">25%</text>
            <text x="${margin.left - 8}" y="114" class="chart-label-y" text-anchor="end">50%</text>
            <text x="${margin.left - 8}" y="69" class="chart-label-y" text-anchor="end">75%</text>
            <text x="${margin.left - 8}" y="24" class="chart-label-y" text-anchor="end">100%</text>
        `;

        kpiChartData.forEach((data, i) => {
            const x = margin.left + i * spacing + (spacing - barWidth) / 2;
            const labelX = margin.left + i * spacing + spacing / 2;
            const ratio = Math.min(data.pct / 100, 1.0);
            const barHeight = barMaxHeight * ratio;
            const y = 200 - barHeight;

            html += `
                <!-- Background Bar Track -->
                <rect x="${x}" y="20" width="${barWidth}" height="180" class="chart-bar-bg" rx="4" data-id="${data.id}"></rect>
                
                <!-- Active Fill Bar -->
                <rect x="${x}" y="${y}" width="${barWidth}" height="${Math.max(barHeight, 1)}" fill="${data.color}" class="chart-bar-fill" rx="4" data-id="${data.id}"></rect>
                
                <!-- X-Axis Label -->
                <text x="${labelX}" y="215" text-anchor="middle" class="chart-label-x" data-id="${data.id}">${data.shortTitle}</text>
            `;
        });

        trendChart.innerHTML = html;
        setupChartEvents(kpiChartData);
    }

    function setupChartEvents(kpiChartData) {
        if (!chartTooltip || !trendChart) return;
        const elements = trendChart.querySelectorAll('.chart-bar-fill, .chart-bar-bg, .chart-label-x');
        const wrapper = document.querySelector('.chart-body-wrapper');

        elements.forEach(element => {
            const showTooltip = (e) => {
                const id = element.getAttribute('data-id');
                const item = kpiChartData.find(k => k.id === id);
                if (!item) return;

                chartTooltip.innerHTML = `
                    <div class="tooltip-title">${item.title}</div>
                    <div class="tooltip-row">
                        <span>الهدف:</span>
                        <span class="tooltip-value">${item.target}${item.isPercentage ? '%' : ''}</span>
                    </div>
                    <div class="tooltip-row">
                        <span>المحقق:</span>
                        <span class="tooltip-value">${item.actual}${item.isPercentage ? '%' : ''}</span>
                    </div>
                    <div class="tooltip-row" style="color:${item.color}">
                        <span>الإنجاز:</span>
                        <span class="tooltip-value">${item.pct}%</span>
                    </div>
                `;

                const rect = wrapper.getBoundingClientRect();
                
                let clientX, clientY;
                if (e.touches && e.touches.length > 0) {
                    clientX = e.touches[0].clientX;
                    clientY = e.touches[0].clientY;
                } else {
                    clientX = e.clientX;
                    clientY = e.clientY;
                }

                const x = clientX - rect.left;
                const y = clientY - rect.top;

                chartTooltip.style.opacity = '1';
                chartTooltip.style.left = `${x - 70}px`;
                chartTooltip.style.top = `${y - 110}px`;
            };

            const hideTooltip = () => {
                chartTooltip.style.opacity = '0';
            };

            element.addEventListener('mouseenter', showTooltip);
            element.addEventListener('mousemove', showTooltip);
            element.addEventListener('mouseleave', hideTooltip);

            element.addEventListener('touchstart', (e) => {
                showTooltip(e);
            }, { passive: true });
            element.addEventListener('touchend', hideTooltip);
        });
    }

    // Calculate overall KPI
    function calculateKPI() {
        let totalKPI = 0;
        let ocnAchieved = 0;
        let kpiChartData = [];

        // 1. Calculate each card's raw achievement
        kpis.forEach(kpi => {
            const target = parseFloat(document.getElementById(`tr_${kpi.id}_target`).value) || (kpi.isPercentage ? 100 : 0);
            const actual = parseFloat(document.getElementById(`tr_${kpi.id}_actual`).value) || 0;
            
            // Save state for ALL KPIs (including percentage ones now editable)
            state[`${kpi.id}_target`] = target;
            state[`${kpi.id}_actual`] = actual;

            let achievementRatio = target > 0 ? (actual / target) : 0;
            if (achievementRatio > 1) achievementRatio = 1; // Cap at 100%

            const pct = Math.round(achievementRatio * 100);
            
            // Update UI for this card
            const fill = document.getElementById(`tr_${kpi.id}_fill`);
            fill.style.width = `${pct}%`;
            fill.style.background = pct >= 100 ? '#10b981'
                                  : pct >= 75  ? 'var(--primary)'
                                  : pct >= 50  ? '#f59e0b'
                                  : pct > 0    ? '#ef4444'
                                  : 'rgba(255,255,255,0.1)';
            
            // Colorize score text & show weight contribution
            const scoreEl = document.getElementById(`tr_${kpi.id}_score`);
            const scoreColor = pct >= 100 ? '#10b981' : pct >= 75 ? '#ff7900' : pct >= 50 ? '#f59e0b' : pct > 0 ? '#ef4444' : '#666';
            
            if (kpi.weight > 0) {
                const contribution = (achievementRatio * kpi.weight).toFixed(1);
                scoreEl.innerHTML = `الإنجاز: <span style="color:${scoreColor};font-weight:800">${pct}%</span> <small style="display:block;font-size:0.75rem;color:#888;margin-top:2px;">(المساهمة: ${contribution}% من ${kpi.weight}%)</small>`;
                totalKPI += (achievementRatio * kpi.weight);
            } else {
                scoreEl.innerHTML = `الإنجاز: <span style="color:${scoreColor};font-weight:800">${pct}%</span>`;
            }
            
            const card = document.querySelector(`.tracker-card[data-id="${kpi.id}"]`);
            card.classList.remove('achieved', 'failed');
            if (pct >= 100) card.classList.add('achieved');

            // Store specific logic values
            if (kpi.id === 'ocn') ocnAchieved = pct;

            kpiChartData.push({
                id: kpi.id,
                title: kpi.title,
                shortTitle: kpi.shortTitle || kpi.title,
                target: target,
                actual: actual,
                pct: pct,
                color: scoreColor,
                isPercentage: kpi.isPercentage || false
            });
        });

        // Update Total Gauge UI
        const finalScore = totalKPI.toFixed(1);
        totalValue.textContent = finalScore;

        // Circle Math (circumference = 283)
        const offset = 283 - (283 * (Math.min(finalScore, 100) / 100));
        gaugeFill.style.strokeDashoffset = offset;

        const wasSuccess = gaugeFill.classList.contains('success');
        if (finalScore >= 100) {
            gaugeFill.classList.add('success');
            // 🎉 Celebrate ONCE when first hitting 100%
            if (!wasSuccess && window.showToast) {
                window.showToast('🏆 مبروك! وصلت 100% — أنت نجم الشفت!', 'star');
                if (window.navigator?.vibrate) window.navigator.vibrate([50, 30, 50, 30, 100]);
            }
        } else {
            gaugeFill.classList.remove('success');
        }

        // Update achieved KPI counter
        const achievedCount = kpis.filter(kpi => {
            if (kpi.weight === 0 && kpi.id !== 'ocn') return false;
            const t = parseFloat(document.getElementById(`tr_${kpi.id}_target`)?.value) || 0;
            const a = parseFloat(document.getElementById(`tr_${kpi.id}_actual`)?.value) || 0;
            return t > 0 && a >= t;
        }).length;
        const totalTracked = kpis.filter(k => k.weight > 0 || k.id === 'ocn').length;
        const counterEl = document.getElementById('kpiAchievedCounter');
        if (counterEl) counterEl.textContent = `${achievedCount} / ${totalTracked} مؤشرات محققة`;

        alertMsg.style.display = 'none';

        updateChart(kpiChartData);

        localStorage.setItem('orange_tracker_data', JSON.stringify(state));
    }

    // Attach input events
    inputs.forEach(input => {
        input.addEventListener('input', calculateKPI);
    });

    // ===== +/- QUICK BUTTONS =====
    grid.addEventListener('click', (e) => {
        const inc = e.target.closest('.tr-inc-btn');
        const dec = e.target.closest('.tr-dec-btn');
        const btn = inc || dec;
        if (!btn) return;

        const id = btn.dataset.id;
        const input = document.getElementById(`tr_${id}_actual`);
        if (!input) return;

        const step = kpis.find(k => k.id === id)?.isPercentage ? 1 : 1;
        let val = parseFloat(input.value) || 0;
        val = inc ? val + step : Math.max(0, val - step);
        input.value = val;
        calculateKPI();
        if (window.navigator?.vibrate) window.navigator.vibrate(8);
    });

    resetBtn.addEventListener('click', () => {
        kpis.forEach(kpi => {
            const actualInput = document.getElementById(`tr_${kpi.id}_actual`);
            if (actualInput) actualInput.value = '';
        });
        calculateKPI();
    });

    // ===== SHARE TRACKER REPORT =====
    const shareBtn = document.getElementById('shareTrackerBtn');
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            const now = new Date();
            const dateStr = now.toLocaleDateString('ar-EG', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            });
            const timeStr = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

            let report = `📊 *تقرير التارجت اليومي — Orange*\n`;
            report += `📅 ${dateStr} | ${timeStr}\n`;
            report += `${'━'.repeat(28)}\n\n`;

            kpis.forEach(kpi => {
                const targetEl = document.getElementById(`tr_${kpi.id}_target`);
                const actualEl = document.getElementById(`tr_${kpi.id}_actual`);
                const fillEl   = document.getElementById(`tr_${kpi.id}_fill`);
                if (!targetEl || !actualEl) return;

                const target = targetEl.value || '—';
                const actual = actualEl.value || '—';
                const pct    = fillEl ? parseInt(fillEl.style.width) || 0 : 0;

                // Skip 0-weight KPIs that have no data
                if (kpi.weight === 0 && kpi.id !== 'ocn') return;

                const emoji = pct >= 100 ? '✅' : pct >= 75 ? '🟡' : pct > 0 ? '🔴' : '⚪';
                const label = kpi.weight > 0 ? `(${kpi.weight}%)` : '(شرط)';

                report += `${emoji} *${kpi.title}* ${label}\n`;
                report += `   هدف: ${target}  |  محقق: ${actual}  |  إنجاز: ${pct}%\n\n`;
            });

            const totalEl = document.getElementById('kpiTotalValue');
            const total   = totalEl ? totalEl.textContent : '0';
            const totalPct = parseFloat(total);
            const totalEmoji = totalPct >= 100 ? '🏆' : totalPct >= 80 ? '🎯' : totalPct >= 50 ? '⚡' : '💪';

            report += `${'━'.repeat(28)}\n`;
            report += `${totalEmoji} *إجمالي KPI: ${total}%*\n`;
            report += `_Generated by Orange SR Encyclopedia_`;

            const encoded = encodeURIComponent(report);
            window.open(`https://wa.me/?text=${encoded}`, '_blank');

            if (window.navigator && window.navigator.vibrate) window.navigator.vibrate([10, 50, 10]);
            window.showToast && window.showToast('تم تجهيز التقرير للمشاركة! 📤', 'share-2');
        });
    }

    // Redraw chart on resize
    window.addEventListener('resize', calculateKPI);

    // Initial calculation mapping
    calculateKPI();
});
