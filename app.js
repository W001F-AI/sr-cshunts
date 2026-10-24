// ============================================
// GLOBAL UTILITIES & CORE FUNCTIONS
// ============================================

window.safeRenderIcons = () => {
    try {
        if (typeof lucide !== 'undefined' && lucide.createIcons) {
            lucide.createIcons();
        }
    } catch (e) { console.warn('Icons render delayed:', e); }
};

window.showToast = (msg, icon = 'info') => {
    let toast = document.getElementById('globalToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'globalToast';
        toast.style.cssText = `
            position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%) translateY(100px);
            background: #333; color: #fff; padding: 12px 24px; border-radius: 30px;
            font-family: 'Cairo', sans-serif; font-size: 0.95rem; font-weight: 600;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3); z-index: 10000; opacity: 0;
            transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            display: flex; align-items: center; gap: 8px; border: 1px solid rgba(255,255,255,0.1);
        `;
        document.body.appendChild(toast);
    }
    toast.innerHTML = `<i data-lucide="${icon}" style="width:18px;height:18px;color:var(--primary)"></i> <span>${msg}</span>`;
    window.safeRenderIcons();
    
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
    
    if (window.toastTimeout) clearTimeout(window.toastTimeout);
    window.toastTimeout = setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(100px)';
    }, 3000);
};

window.copyText = (text, type = 'النص') => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showToast(`تم نسخ ${type} بنجاح!`, 'check-circle-2');
            if (window.navigator && window.navigator.vibrate) window.navigator.vibrate(50);
        }).catch(() => showToast('حدث خطأ أثناء النسخ', 'x-circle'));
    } else {
        const input = document.createElement('input');
        input.value = text;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        showToast(`تم نسخ ${type} بنجاح!`, 'check-circle-2');
    }
};

window.triggerHaptic = (type = 'light') => {
    if (!window.navigator || !window.navigator.vibrate) return;
    switch(type) {
        case 'light': navigator.vibrate(10); break;
        case 'medium': navigator.vibrate(20); break;
        case 'heavy': navigator.vibrate([30, 50, 30]); break;
        case 'success': navigator.vibrate([10, 30, 20, 30, 40]); break;
        default: navigator.vibrate(10);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    let srData = [];

    safeRenderIcons();
    window.addEventListener('load', safeRenderIcons);



    // ============================================
    // PWA MASTERPIECE INITIALIZATION
    // ============================================
    const welcomeDashboard = document.getElementById('welcomeDashboard');
    const dashGreeting = document.getElementById('dashGreeting');
    const dashDate = document.getElementById('dashDate');
    const dashTime = document.getElementById('dashTime');
    const pwaBanner = document.getElementById('pwaInstallBanner');
    const pwaBtn = document.getElementById('pwaInstallBtn');
    const pwaClose = document.getElementById('pwaCloseBanner');
    const ptrElement = document.getElementById('pullToRefresh');

    // 1. Dashboard Greeting & Live Clock Logic
    const updateDashboard = () => {
        if (!dashGreeting || !dashDate) return;
        const now = new Date();
        const hour = now.getHours();
        
        // Professional Greeting based on time
        let greeting = "أهلاً بك";
        if (hour >= 5 && hour < 12) greeting = "صباح الخير";
        else if (hour >= 12 && hour < 17) greeting = "طاب يومك";
        else if (hour >= 17 || hour < 5) greeting = "مساء الخير";
        
        dashGreeting.textContent = greeting;

        // Arabic Date Formatting
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dashDate.textContent = now.toLocaleDateString('ar-EG', options);

        // Live Clock
        if (dashTime) {
            dashTime.textContent = now.toLocaleTimeString('ar-EG', { 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit',
                hour12: true 
            });
        }
    };

    updateDashboard();
    setInterval(updateDashboard, 1000); // Update every second

    // 2. PWA Installation Logic
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent Chrome 67 and earlier from automatically showing the prompt
        e.preventDefault();
        // Stash the event so it can be triggered later.
        deferredPrompt = e;
        // Show the custom banner
        if (pwaBanner) pwaBanner.classList.add('active');
    });

    if (pwaBtn) {
        pwaBtn.addEventListener('click', async () => {
            if (!deferredPrompt) return;
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`User response to install prompt: ${outcome}`);
            deferredPrompt = null;
            if (pwaBanner) pwaBanner.classList.remove('active');
        });
    }

    if (pwaClose) {
        pwaClose.addEventListener('click', () => {
            if (pwaBanner) pwaBanner.classList.remove('active');
        });
    }

    // 3. Pull-to-Refresh (Native Feel)
    let touchStart = 0;
    let touchLength = 0;
    const scrollContainer = document.body;

    window.addEventListener('touchstart', (e) => {
        if (window.scrollY === 0) touchStart = e.touches[0].pageY;
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
        const touch = e.touches[0].pageY;
        if (window.scrollY === 0 && touch > touchStart) {
            touchLength = touch - touchStart;
            if (touchLength > 10 && touchLength < 150) {
                const rotation = touchLength * 2;
                if (ptrElement) {
                    ptrElement.style.transform = `translateY(${touchLength / 2}px)`;
                    ptrElement.querySelector('i').style.transform = `rotate(${rotation}deg)`;
                }
            }
        }
    }, { passive: true });

    window.addEventListener('touchend', () => {
        if (touchLength > 100) {
            if (ptrElement) {
                ptrElement.style.transform = `translateY(40px)`;
                ptrElement.querySelector('i').style.animation = 'ptrRotate 1s linear infinite';
                // Trigger reload after a small "wow" delay
                setTimeout(() => window.location.reload(), 800);
            }
        } else {
            if (ptrElement) ptrElement.style.transform = `translateY(0)`;
        }
        touchLength = 0;
    });

    // Edge Swipe Navigation (Go Back Home)
    let swipeStartX = 0;
    window.addEventListener('touchstart', (e) => {
        if (e.touches.length > 1) return; // ignore multi-touch
        swipeStartX = e.touches[0].screenX;
    }, { passive: true });
    
    window.addEventListener('touchend', (e) => {
        if (e.changedTouches.length > 1) return;
        const swipeEndX = e.changedTouches[0].screenX;
        // If swipe right from the very left edge (x < 30) and swipe distance > 80
        if (swipeStartX < 30 && (swipeEndX - swipeStartX > 80)) {
            if (window.location.hash && window.location.hash !== '#home') {
                window.triggerHaptic('medium');
                window.activateTab('home');
            }
        }
    }, { passive: true });

    // --- Safety icon render ---
    safeRenderIcons();
    // SPLASH SCREEN LOGIC - iOS Safari Safe
    // ============================================
    const splashScreen = document.getElementById('splashScreen');
    const startJourneyBtn = document.getElementById('startJourneyBtn');

    window.hideSplash = () => {
        if (!splashScreen) return;
        splashScreen.classList.add('hiding');
        document.body.classList.add('app-ready');
        setTimeout(() => {
            splashScreen.style.display = 'none';
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
        }, 650);
    };

    if (splashScreen && startJourneyBtn) {
        // Lock background scroll while splash is showing
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';

        // Click event (desktop + iOS fallback)
        startJourneyBtn.addEventListener('click', hideSplash);

        // Touchstart for instant iOS response (no 300ms delay)
        startJourneyBtn.addEventListener('touchstart', (e) => {
            e.preventDefault(); // Prevent ghost click
            hideSplash();
        }, { passive: false });
    }

    // ============================================
    // 3D WOW LOGO - Mouse/Gyroscope Tracking
    // ============================================
    const wow3DLogo = document.getElementById('wow3DLogo');
    const wow3DContainer = document.getElementById('wow3DContainer');
    const devSignature = document.getElementById('devSignature');

    if (wow3DLogo && wow3DContainer) {
        // Desktop Mouse movement
        document.addEventListener('mousemove', (e) => {
            if (splashScreen && !splashScreen.classList.contains('hiding')) {
                const xAxis = (window.innerWidth / 2 - e.pageX) / 20;
                const yAxis = (window.innerHeight / 2 - e.pageY) / 20;
                
                // Animate Logo
                wow3DLogo.style.animation = 'none';
                wow3DLogo.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
                
                // Animate Signature with slight parallax
                if (devSignature) {
                    devSignature.style.transform = `translateX(${xAxis * 1.5}px) translateY(${yAxis * 1.5}px)`;
                }
            }
        });

        // Mobile Gyroscope movement
        window.addEventListener('deviceorientation', (e) => {
            if (splashScreen && !splashScreen.classList.contains('hiding') && e.beta && e.gamma) {
                let x = Math.max(-25, Math.min(25, e.beta - 45)); 
                let y = Math.max(-25, Math.min(25, e.gamma));
                
                // Animate Logo
                wow3DLogo.style.animation = 'none';
                wow3DLogo.style.transform = `rotateY(${y}deg) rotateX(${-x}deg)`;

                // Animate Signature with slight parallax
                if (devSignature) {
                    devSignature.style.transform = `translateX(${y * 2}px) translateY(${-x * 2}px)`;
                }
            }
        });
    }


    // ============================================
    // GLOBAL 3D SEARCH LOGIC
    // ============================================
    const globalSearchInput = document.getElementById('globalSearchInput');
    const globalSearchModal = document.getElementById('globalSearchModal');
    const globalSearchResults = document.getElementById('globalSearchResults');
    const globalSearchEmpty = document.getElementById('globalSearchEmpty');
    const closeGlobalSearch = document.getElementById('closeGlobalSearch');

    window.performGlobalSearch = (query) => {
        if (!query || query.length < 2) {
            globalSearchModal.classList.remove('active');
            document.body.style.overflow = '';
            document.body.style.position = '';
            return;
        }

        const normalizedQuery = query.toLowerCase().trim();

        // Search plans data
        const plansData = window.ORANGE_PLANS_DATA || [];
        const planResults = [];
        plansData.forEach(category => {
            (category.plans || []).forEach(plan => {
                if (plan.name.toLowerCase().includes(normalizedQuery) ||
                    (plan.fees && plan.fees.toLowerCase().includes(normalizedQuery)) ||
                    category.category.toLowerCase().includes(normalizedQuery)) {
                    planResults.push({ ...plan, categoryName: category.category });
                }
            });
        });

        const results = {
            srs: (window.ORANGE_SR_DATA || []).filter(item => 
                item.title.toLowerCase().includes(normalizedQuery) || 
                (item.titleAr && item.titleAr.includes(normalizedQuery)) ||
                item.id.toString().includes(normalizedQuery) ||
                (item.description && item.description.toLowerCase().includes(normalizedQuery))
            ),
            hunts: (window.ORANGE_HUNTS_DATA || []).filter(item => 
                item.name.toLowerCase().includes(normalizedQuery) || 
                item.number.replace(/\s/g, '').includes(normalizedQuery)
            ),
            emails: (window.ORANGE_EMAILS_DATA || []).filter(item => 
                item.name.toLowerCase().includes(normalizedQuery) || 
                item.email.toLowerCase().includes(normalizedQuery)
            ),
            docs: (window.ORANGE_DOCS_DATA || []).filter(doc =>
                doc.title.toLowerCase().includes(normalizedQuery) ||
                doc.description.toLowerCase().includes(normalizedQuery)
            ),
            plans: planResults
        };

        renderGlobalSearchResults(results);
        globalSearchModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
    }

    function renderGlobalSearchResults(results) {
        const query = globalSearchInput.value.trim();

        // Highlight matching text in orange
        function highlightText(text, q) {
            if (!q || !text) return text || '';
            const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            return text.replace(new RegExp(`(${escaped})`, 'gi'),
                '<mark class="search-highlight">$1</mark>');
        }

        globalSearchResults.innerHTML = '';
        let hasResults = false;

        // Group: SRs
        if (results.srs.length > 0) {
            hasResults = true;
            const section = createSearchSection('موسوعة الـ SR', 'database');
            results.srs.slice(0, 5).forEach(item => {
                const div = document.createElement('div');
                div.className = 'global-result-item';
                div.innerHTML = `
                    <div class="result-main">
                        <span class="result-badge">SR #${item.id}</span>
                        <div class="result-title">${highlightText(item.title, query)} ${item.titleAr ? `<span class="ar-tag">${highlightText(item.titleAr, query)}</span>` : ''}</div>
                    </div>
                    <i data-lucide="chevron-left"></i>
                `;
                div.onclick = () => {
                    globalSearchModal.classList.remove('active');
                    openModal(item);
                };
                section.appendChild(div);
            });
            globalSearchResults.appendChild(section);
        }

        // Group: Documents
        if (results.docs.length > 0) {
            hasResults = true;
            const section = createSearchSection('الملفات والنماذج', 'file-text');
            results.docs.slice(0, 5).forEach(doc => {
                const div = document.createElement('div');
                div.className = 'global-result-item';
                div.innerHTML = `
                    <div class="result-main">
                        <span class="result-badge docs">FILE</span>
                        <div class="result-title">${highlightText(doc.title, query)}</div>
                    </div>
                    <i data-lucide="download"></i>
                `;
                div.onclick = () => window.open(doc.url, '_blank');
                section.appendChild(div);
            });
            globalSearchResults.appendChild(section);
        }

        // Group: Plans
        if (results.plans.length > 0) {
            hasResults = true;
            const section = createSearchSection('الباقات', 'star');
            results.plans.slice(0, 5).forEach(plan => {
                const div = document.createElement('div');
                div.className = 'global-result-item';
                div.innerHTML = `
                    <div class="result-main">
                        <span class="result-badge plans">${plan.categoryName}</span>
                        <div class="result-title">${highlightText(plan.name, query)} &mdash; <span style="color:var(--primary)">${plan.fees || ''}</span></div>
                    </div>
                    <i data-lucide="chevron-left"></i>
                `;
                div.onclick = () => {
                    globalSearchModal.classList.remove('active');
                    document.querySelector('[data-tab="premier"]')?.click() ||
                    document.querySelector('[data-tab="go"]')?.click();
                };
                section.appendChild(div);
            });
            globalSearchResults.appendChild(section);
        }

        // Group: Hunts
        if (results.hunts.length > 0) {
            hasResults = true;
            const section = createSearchSection('أرقام التواصل', 'phone');
            results.hunts.slice(0, 5).forEach(item => {
                const div = document.createElement('div');
                div.className = 'global-result-item';
                div.innerHTML = `
                    <div class="result-main">
                        <span class="result-badge hunts">HUNT</span>
                        <div class="result-title">${highlightText(item.name, query)} (${item.number})</div>
                    </div>
                    <i data-lucide="phone-outgoing"></i>
                `;
                div.onclick = () => window.location.href = `tel:${item.number.replace(/\s/g, '')}`;
                section.appendChild(div);
            });
            globalSearchResults.appendChild(section);
        }

        globalSearchEmpty.style.display = hasResults ? 'none' : 'block';
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    function createSearchSection(title, icon) {
        const wrapper = document.createElement('div');
        wrapper.className = 'search-result-group';
        wrapper.innerHTML = `<div class="search-group-title"><i data-lucide="${icon}"></i> ${title}</div>`;
        return wrapper;
    }

    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    }

    if (globalSearchInput) {
        const debouncedSearch = debounce((e) => performGlobalSearch(e.target.value), 300);
        globalSearchInput.addEventListener('input', debouncedSearch);
        globalSearchInput.addEventListener('focus', (e) => {
            if (e.target.value.length >= 2) globalSearchModal.classList.add('active');
        });
    }

    if (closeGlobalSearch) {
        closeGlobalSearch.addEventListener('click', () => {
            globalSearchModal.classList.remove('active');
            // Restore body scroll and position (Haptic Feedback)
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
            globalSearchInput.value = '';
            if (window.navigator && window.navigator.vibrate) window.navigator.vibrate(12);
        });
    }

    // Close on escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            globalSearchModal.classList.remove('active');
            globalSearchInput.blur();
        }
        // "/" shortcut to open search (skip if already typing in an input)
        if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
            e.preventDefault();
            globalSearchModal.classList.add('active');
            setTimeout(() => globalSearchInput.focus(), 100);
        }
    });

    // Tab & Dashboard Logic
    const bentoCards = document.querySelectorAll('.bento-card');
    const tabContents = document.querySelectorAll('.tab-content');
    const homeDashboard = document.getElementById('homeNavDashboard');
    const bottomTabs = document.querySelectorAll('.bottom-tab-bar .tab-btn');

    function updateBottomTabs(activeTab) {
        if (bottomTabs.length === 0) return;
        bottomTabs.forEach(t => t.classList.remove('active'));
        const activeBtn = document.querySelector(`.bottom-tab-bar .tab-btn[data-nav="${activeTab}"]`);
        const indicator = document.querySelector('.tab-indicator');
        const bar = document.getElementById('bottomTabBar');
        
        if (activeBtn && indicator && bar) {
            activeBtn.classList.add('active');
            indicator.style.opacity = '1';
            
            // Precise centering logic
            const barRect = bar.getBoundingClientRect();
            const btnRect = activeBtn.getBoundingClientRect();
            const centerX = (btnRect.left + btnRect.width / 2) - barRect.left;
            
            indicator.style.transform = `translateX(${centerX}px) translateX(-50%)`;
        } else if (indicator) {
            indicator.style.opacity = '0';
        }
    }

    window.activateTab = (targetTab) => {
        // Dynamic Status Bar
        const themeMeta = document.getElementById('themeColorMeta');
        if (themeMeta) {
            const colors = {
                'home': '#ff7900', 'sr': '#ff7900', 'hunts': '#1e293b', 
                'emails': '#1e293b', 'premier': '#111111', 'go': '#ea580c', 
                'freemax': '#6b21a8', 'docs': '#0f172a', 'tracker': '#0f172a',
                'dsl': '#ff7900'
            };
            themeMeta.content = colors[targetTab] || '#ff7900';
        }

        if (!targetTab || targetTab === 'home') {
            goHome();
            return;
        }
        
        const targetSection = document.getElementById(`${targetTab}Section`);
        if (!targetSection) return;

        // Hide Dashboard & Welcome Area
        if (homeDashboard) homeDashboard.classList.remove('active');
        if (welcomeDashboard) welcomeDashboard.style.display = 'none';

        // Manage Sections
        tabContents.forEach(c => c.classList.remove('active'));
        targetSection.classList.add('active');
        
        // Render content based on tab
        if (targetTab === 'dsl') window.initDslTab();
        if (targetTab === 'hunts') renderHunts(window.ORANGE_HUNTS_DATA || []);
        if (targetTab === 'emails') renderEmails(window.ORANGE_EMAILS_DATA || []);
        if (targetTab === 'premier') renderPlans(window.ORANGE_PLANS_DATA || []);
        if (targetTab === 'go') renderGoPlans(window.ORANGE_PLANS_DATA || []);
        if (targetTab === 'docs') renderDocs(window.ORANGE_DOCS_DATA || []);
        if (targetTab === 'freemax') {
            renderFreemax(window.ORANGE_FREEMAX_DATA || {});
            initFreemaxWizard();
        }
        
        // Update Bottom Nav: If it's tracker, highlight tracker, else highlight home
        if (targetTab === 'tracker') {
            updateBottomTabs('tracker');
        } else {
            updateBottomTabs('home');
        }

        // Re-render icons for any static content
        window.safeRenderIcons();
    }

    function goHome() {
        // Reset Dynamic Status Bar
        const themeMeta = document.getElementById('themeColorMeta');
        if (themeMeta) themeMeta.content = '#ff7900';

        window.location.hash = 'home';
        tabContents.forEach(c => c.classList.remove('active'));
        
        // Show Dashboard & Welcome Area
        if (homeDashboard) homeDashboard.classList.add('active');
        if (welcomeDashboard) welcomeDashboard.style.display = 'block';

        updateBottomTabs('home');
    }

    // Bottom Tab Bar Click Logic
    if (bottomTabs.length > 0) {
        bottomTabs.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                window.triggerHaptic('light'); // Trigger enhanced haptic feedback
                
                const navTarget = btn.getAttribute('data-nav');
                if (navTarget === 'home') {
                    goHome();
                } else if (navTarget === 'tracker') {
                    window.location.hash = 'tracker';
                    updateBottomTabs('tracker');
                }
            });
        });
    }

    // Expose Global Tab Switcher for the Bot
    window.switchToTab = (tabId) => {
        window.location.hash = tabId;
    };

    if (bentoCards.length > 0) {
        bentoCards.forEach(card => {
            card.addEventListener('click', (e) => {
                // Haptic Feedback for mobile
                if (window.navigator && window.navigator.vibrate) {
                    window.navigator.vibrate(10);
                }

                // Ripple Effect
                const ripple = document.createElement('span');
                ripple.className = 'ripple';
                const rect = card.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                ripple.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size/2}px;top:${e.clientY - rect.top - size/2}px;`;
                card.appendChild(ripple);
                ripple.addEventListener('animationend', () => ripple.remove());

                const targetTab = card.getAttribute('data-tab');
                window.location.hash = targetTab;
            });
        });

        // Show saved-data badge on tracker card if data exists
        const trackerData = JSON.parse(localStorage.getItem('orange_tracker_data') || '{}');
        const hasData = Object.values(trackerData).some(v => v && v !== '' && v !== 0);
        if (hasData) {
            const trackerCard = document.querySelector('.bento-card[data-tab="tracker"] .bento-content');
            if (trackerCard && !trackerCard.querySelector('.bento-saved-badge')) {
                const badge = document.createElement('div');
                badge.className = 'bento-saved-badge';
                badge.textContent = '● بيانات الشفت محفوظة';
                trackerCard.appendChild(badge);
            }
        }
    }

    // Handle Hash Changes for Back Button Support
    window.addEventListener('hashchange', () => {
        let hash = window.location.hash.replace('#', '');
        activateTab(hash);
        
        // Extra polish: scroll to top of section on mobile
        const targetSection = document.getElementById(`${hash}Section`);
        if (targetSection && window.innerWidth < 768 && hash !== 'home') {
            window.scrollTo({ top: Math.max(0, targetSection.offsetTop - 100), behavior: 'smooth' });
        }
    });

    // Check hash on initialization
    let initialHash = window.location.hash.replace('#', '');
    if (initialHash) {
        setTimeout(() => activateTab(initialHash), 100);
    } else {
        // Default to home in bottom bar
        updateBottomTabs('home');
    }

    // Load Data safely
    function loadData() {
        console.log('Loading app data...');
        try {
            if (window.ORANGE_SR_DATA) {
                srData = window.ORANGE_SR_DATA;
                renderResults(srData);
            } else {
                console.warn('ORANGE_SR_DATA not found');
                renderResults([]); // Render empty state instead of crashing
            }
            
            if (window.ORANGE_HUNTS_DATA) renderHunts(window.ORANGE_HUNTS_DATA);
            if (window.ORANGE_EMAILS_DATA) renderEmails(window.ORANGE_EMAILS_DATA);
            
            if (window.ORANGE_PLANS_DATA) {
                renderPlans(window.ORANGE_PLANS_DATA);
                renderGoPlans(window.ORANGE_PLANS_DATA);
            }
            if (window.ORANGE_DOCS_DATA) renderDocs(window.ORANGE_DOCS_DATA);
            if (window.ORANGE_FREEMAX_DATA) {
                renderFreemax(window.ORANGE_FREEMAX_DATA);
                initFreemaxWizard();
            }
        } catch (e) {
            console.error('Initial data load failed:', e);
        }
    }

    function renderDocs(data) {
        const grid = document.getElementById('docsGrid');
        if (!grid) return;
        grid.innerHTML = '';
        (data || []).forEach((doc, index) => {
            const card = document.createElement('a');
            card.href = doc.url;
            card.target = '_blank';
            card.rel = 'noopener noreferrer';
            card.className = 'hunt-card doc-card';
            card.style.borderLeft = `4px solid ${doc.color || 'var(--primary)'}`;
            card.style.animationDelay = `${index * 0.07}s`;
            card.innerHTML = `
                <div class="hunt-info">
                    <div class="hunt-name doc-title">${doc.title}</div>
                    <div class="doc-subtitle" style="font-size:0.85rem;color:var(--text-muted);margin-top:5px;line-height:1.5;">${doc.description}</div>
                </div>
                <div class="call-icon doc-icon" style="color:${doc.color || 'var(--primary)'}">
                    <i data-lucide="${doc.icon || 'file-text'}"></i>
                </div>
            `;
            grid.appendChild(card);
        });
        window.safeRenderIcons();
    }

    function linkifyNumbers(text) {
        if (!text) return "";
        const phoneRegex = /(\b01[0125][0-9]{8}\b|\b02[0-9]{8}\b|\b[0-9]{5,8}\b)/g;
        let newText = text.replace(phoneRegex, (match) => `<a href="tel:${match.replace(/\s/g, '')}" class="inline-link">${match}</a>`);
        const ussdRegex = /(\*\d+(?:\*\d+)*#)/g;
        newText = newText.replace(ussdRegex, (match) => {
            const encoded = match.replace(/#/g, '%23');
            return `<a href="tel:${encoded}" class="inline-link" style="color: #ff7900; font-weight: bold; background: rgba(255, 121, 0, 0.1); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(255,121,0,0.2);"><i data-lucide="smartphone" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; margin-left: 2px;"></i>${match}</a>`;
        });
        
        const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/g;
        newText = newText.replace(emailRegex, (match) => `<a href="mailto:${match}" class="inline-link" style="color: #007bff; border-bottom-color: #007bff;"><i data-lucide="mail" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; margin-left: 4px;"></i>${match}</a>`);

        return newText;
    }

    // Offline & Online Detection
    window.addEventListener('offline', () => window.showToast('أنت الآن أوفلاين.. الموسوعة تعمل بكفاءة! 🟢', 'wifi-off'));
    window.addEventListener('online', () => window.showToast('عاد الاتصال بالإنترنت 🌐', 'wifi'));

    let currentObserver = null;

    function renderResults(data) {
        const grid = document.getElementById('resultsGrid');
        const count = document.getElementById('resultCount');
        if (!grid || !count) return;
        
        // Clean up previous observer
        if (currentObserver) {
            currentObserver.disconnect();
            currentObserver = null;
        }

        grid.innerHTML = '';
        const safeData = data || [];
        count.textContent = `${safeData.length} عنصر`;

        let favorites = JSON.parse(localStorage.getItem('orange_sr_favorites') || '[]');

        function saveFavorites() {
            localStorage.setItem('orange_sr_favorites', JSON.stringify(favorites));
        }

        function renderFavoritesSection() {
            const existing = grid.querySelector('.favorites-section');
            if (existing) existing.remove();
            if (favorites.length === 0) return;

            const favItems = favorites.map(id => safeData.find(d => d.id == id)).filter(Boolean);
            if (favItems.length === 0) return;

            const section = document.createElement('div');
            section.className = 'favorites-section';
            section.innerHTML = `<div class="favorites-header"><i data-lucide="star"></i> المفضلة (${favItems.length})</div>`;
            favItems.forEach(item => {
                const favCard = document.createElement('div');
                favCard.className = 'sr-card fav-card';
                favCard.innerHTML = `
                    <div class="sr-card-header">
                        <span class="sr-category">${item.category}</span>
                        <span class="sr-id">#${item.id}</span>
                    </div>
                    <div class="sr-title">${item.title} ${item.titleAr ? `<br><small style="color:var(--text-muted);font-weight:600;">${item.titleAr}</small>` : ''}</div>`;
                favCard.onclick = () => openModal(item);
                section.appendChild(favCard);
            });
            grid.insertBefore(section, grid.firstChild);
            window.safeRenderIcons();
        }

        renderFavoritesSection();

        let currentIndex = 0;
        const chunkSize = 20;

        function loadMore() {
            const chunk = safeData.slice(currentIndex, currentIndex + chunkSize);
            if (chunk.length === 0) return;

            chunk.forEach((item, index) => {
                const card = document.createElement('div');
                card.className = 'sr-card';
                card.style.animationDelay = `${(index % chunkSize) * 0.05}s`;
                card.innerHTML = `
                    <div class="sr-card-header">
                        <span class="sr-category">${item.category}</span>
                        <span class="sr-id" style="cursor:pointer;" onclick="event.stopPropagation(); window.copyText('${item.id}', 'رقم الـ SR')" title="اضغط للنسخ">#${item.id}</span>
                    </div>
                    <div class="sr-title">${item.title} ${item.titleAr ? `<br><small style="color:var(--text-muted);font-weight:600;">${item.titleAr}</small>` : ''}</div>
                    <p class="sr-desc">${linkifyNumbers(item.description)}</p>
                    <div class="card-footer">
                        <span class="view-btn">عرض التفاصيل <i data-lucide="arrow-left"></i></span>
                        <button class="sr-fav-btn ${favorites.includes(String(item.id)) ? 'active' : ''}" title="إضافة للمفضلة">
                            <i data-lucide="star"></i>
                        </button>
                    </div>
                `;
                card.querySelector('.sr-fav-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    const id = String(item.id);
                    const idx = favorites.indexOf(id);
                    if (idx === -1) { favorites.push(id); } else { favorites.splice(idx, 1); }
                    saveFavorites();
                    e.currentTarget.classList.toggle('active', favorites.includes(id));
                    renderFavoritesSection();
                    if (window.navigator?.vibrate) window.navigator.vibrate(8);
                });
                card.onclick = () => openModal(item);
                grid.appendChild(card);
            });

            currentIndex += chunkSize;
            window.safeRenderIcons();

            // Setup observer for next load
            if (currentIndex < safeData.length) {
                const lastCard = grid.lastElementChild;
                currentObserver = new IntersectionObserver((entries) => {
                    if (entries[0].isIntersecting) {
                        currentObserver.disconnect();
                        loadMore();
                    }
                }, { rootMargin: '200px' });
                currentObserver.observe(lastCard);
            }
        }

        loadMore();
    }

    function renderHunts(data) {
        const orangeGrid = document.getElementById('orangeHuntsGrid');
        const adslGrid = document.getElementById('adslHuntsGrid');
        const count = document.getElementById('huntResultCount');
        if (!orangeGrid || !adslGrid || !count) return;
        
        orangeGrid.innerHTML = '';
        adslGrid.innerHTML = '';
        count.textContent = `${data.length} جهة`;

        const orangeData = data.filter(h => h.type === 'Orange');
        const adslData = data.filter(h => h.type === 'ADSL');

        const createHuntCard = (item, index) => {
            const card = document.createElement('div');
            card.className = 'hunt-card';
            card.style.animationDelay = `${index * 0.05}s`;
            const cleanNumber = item.number.replace(/\s/g, '');
            card.innerHTML = `
                <a href="tel:${cleanNumber}" class="hunt-card-link">
                    <div class="hunt-info">
                        <div class="hunt-name">${item.name}</div>
                        <div class="hunt-number">${item.number}</div>
                    </div>
                    <div class="call-icon"><i data-lucide="phone-call"></i></div>
                </a>
                <button class="hunt-copy-btn" data-number="${cleanNumber}" title="نسخ الرقم">
                    <i data-lucide="copy"></i>
                </button>
            `;
            card.querySelector('.hunt-copy-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                window.copyText(cleanNumber, 'الرقم');
                if (window.navigator?.vibrate) window.navigator.vibrate(8);
            });
            return card;
        };

        orangeData.forEach((item, i) => orangeGrid.appendChild(createHuntCard(item, i)));
        adslData.forEach((item, i) => adslGrid.appendChild(createHuntCard(item, i)));
        window.safeRenderIcons();
    }

    function renderEmails(data) {
        const grid = document.getElementById('emailsGrid');
        const count = document.getElementById('emailResultCount');
        if (!grid || !count) return;
        
        grid.innerHTML = '';
        count.textContent = `${data.length} إيميلات`;

        data.forEach((item, index) => {
            const card = document.createElement('a');
            card.href = `mailto:${item.email}`;
            card.className = 'hunt-card';
            card.style.animationDelay = `${index * 0.05}s`;
            card.innerHTML = `
                <div class="hunt-info">
                    <div class="hunt-name">${item.name}</div>
                    <div class="hunt-number" style="font-size: 0.95rem; text-transform: lowercase;">${item.email}</div>
                    <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 5px;">${item.description || ''}</div>
                </div>
                <div class="call-icon"><i data-lucide="mail"></i></div>
            `;
            grid.appendChild(card);
        });
        window.safeRenderIcons();
    }

    function renderPlans(data) {
        const container = document.getElementById('plansContainer');
        if (!container) return;
        container.innerHTML = '';

        data.forEach(category => {
            if (['Go Monthly', 'Go Extra', 'MBB GO', 'Home Wireless', 'Home Wireless Extra'].includes(category.category)) return; // Handled by GoPlans

            const catTitle = document.createElement('h2');
            catTitle.className = 'plan-category-title';
            catTitle.textContent = category.category;
            container.appendChild(catTitle);

            const grid = document.createElement('div');
            grid.className = 'plans-grid';

            category.plans.forEach((plan, index) => {
                const card = document.createElement('div');
                card.className = 'plan-card';
                card.style.animationDelay = `${index * 0.1}s`;
                
                let metricsHTML = '';
                if (plan.minutes) metricsHTML += `<div class="metric-item"><span class="metric-value" dir="ltr">${plan.minutes}</span><span class="metric-label">Min</span></div>`;
                if (plan.data) metricsHTML += `<div class="metric-item"><span class="metric-value" dir="ltr">${plan.data}</span><span class="metric-label">Data</span></div>`;
                if (plan.units) metricsHTML += `<div class="metric-item"><span class="metric-value" dir="ltr">${plan.units}</span><span class="metric-label">Units</span></div>`;
                if (plan.internet) metricsHTML += `<div class="metric-item"><span class="metric-value" dir="ltr">${plan.internet}</span><span class="metric-label">Net</span></div>`;

                let featuresHTML = '';
                const isPremier = category.category === 'Orange Premier';

                if (isPremier) {
                    if (plan.familyLines && plan.familyLines !== '-') {
                        featuresHTML += `<li class="feature-item"><i data-lucide="users"></i> <span>العائلة: <strong dir="ltr">${plan.familyLines} خطوط</strong></span></li>`;
                    }
                    if (plan.adslDiscount && plan.adslDiscount !== '-') {
                        featuresHTML += `<li class="feature-item"><i data-lucide="wifi"></i> <span>خصم نت: <strong dir="ltr">${plan.adslDiscount} ج</strong></span></li>`;
                    }
                    if (plan.hwDiscount && plan.hwDiscount !== '-') {
                        featuresHTML += `<li class="feature-item"><i data-lucide="smartphone"></i> <span>خصم جهاز: <strong dir="ltr">${plan.hwDiscount} ج</strong></span></li>`;
                    }
                    if (plan.intlMinutes && plan.intlMinutes !== '-') {
                        featuresHTML += `<li class="feature-item"><i data-lucide="globe"></i> <span>دولي: <strong dir="ltr">${plan.intlMinutes}</strong></span></li>`;
                    }
                    if (plan.installment && plan.installment !== '-') {
                        featuresHTML += `<li class="feature-item span-full"><i data-lucide="credit-card"></i> <span>التقسيط: <strong dir="ltr">${plan.installment}</strong></span></li>`;
                    }
                    if (plan.dataRoaming && plan.dataRoaming !== '-') {
                        featuresHTML += `<li class="feature-item span-full"><i data-lucide="plane"></i> <span>التجوال: <strong dir="ltr">${plan.dataRoaming}</strong></span></li>`;
                    }
                    if (plan.afterFinish) {
                        featuresHTML += `<li class="feature-item span-full"><i data-lucide="alert-circle"></i> <span dir="ltr">${plan.afterFinish}</span></li>`;
                    }
                } else {
                    if (plan.familyLines && plan.familyLines !== '-') featuresHTML += `<li class="feature-item"><i data-lucide="users"></i> Family Lines: ${plan.familyLines}</li>`;
                    if (plan.adslDiscount && plan.adslDiscount !== '-') featuresHTML += `<li class="feature-item"><i data-lucide="wifi"></i> ADSL Discount: ${plan.adslDiscount} L.E</li>`;
                    if (plan.hwDiscount && plan.hwDiscount !== '-') featuresHTML += `<li class="feature-item"><i data-lucide="smartphone"></i> Handset Discount: ${plan.hwDiscount} L.E</li>`;
                    if (plan.dataRoaming && plan.dataRoaming !== '-') featuresHTML += `<li class="feature-item"><i data-lucide="plane"></i> Roaming: ${plan.dataRoaming}</li>`;
                    if (plan.intlMinutes && plan.intlMinutes !== '-') featuresHTML += `<li class="feature-item"><i data-lucide="globe"></i> International: ${plan.intlMinutes}</li>`;
                    if (plan.installment && plan.installment !== '-') featuresHTML += `<li class="feature-item"><i data-lucide="credit-card"></i> Installment: ${plan.installment}</li>`;
                    if (plan.afterFinish) featuresHTML += `<li class="feature-item"><i data-lucide="alert-circle"></i> Extra: ${plan.afterFinish}</li>`;
                }

                let subsHTML = '';
                if (plan.subscriptions && plan.subscriptions.length > 0) {
                    const totalSubs = plan.subscriptions.length;
                    const primarySubs = plan.subscriptions.slice(0, 4);
                    const extraSubs = plan.subscriptions.slice(4);
                    const planIdSafe = (plan.name || 'plan').replace(/[^a-zA-Z0-9]/g, '_') + '_' + index;

                    const renderBadge = (s) => {
                        let icon = 'star';
                        if (s.includes('Amazon')) icon = 'shopping-bag';
                        else if (s.includes('Spotify')) icon = 'music';
                        else if (s.includes('TOD')) icon = 'play-circle';
                        else if (s.includes('YouTube')) icon = 'video';
                        else if (s.includes('Cab')) icon = 'car';
                        else if (s.includes('Sixt')) icon = 'key';
                        else if (s.includes('الجونة')) icon = 'palmtree';
                        else if (s.includes('Gourmet')) icon = 'utensils';
                        else if (s.includes('EgyptAir')) icon = 'plane';
                        return `<span class="sub-badge"><i data-lucide="${icon}"></i> <span>${s}</span></span>`;
                    };

                    let extraSubsHTML = '';
                    let toggleBtnHTML = '';

                    if (extraSubs.length > 0) {
                        extraSubsHTML = `
                            <div class="subs-extra-wrapper" id="subsExtra_${planIdSafe}">
                                <div class="subs-list extra-subs-list">
                                    ${extraSubs.map(renderBadge).join('')}
                                </div>
                            </div>
                        `;
                        toggleBtnHTML = `
                            <button type="button" class="subs-toggle-btn" data-target="subsExtra_${planIdSafe}" data-extra-count="${extraSubs.length}" aria-expanded="false">
                                <span class="btn-text">+ ${extraSubs.length} مزايا إضافية (سفر ولايف ستايل)</span>
                                <i data-lucide="chevron-down" class="btn-icon"></i>
                            </button>
                        `;
                    }

                    subsHTML = `
                        <div class="subs-container">
                            <div class="subs-header-row">
                                <span class="subs-heading"><i data-lucide="sparkles"></i> المزايا والاشتراكات (${totalSubs})</span>
                                <span class="subs-included-badge">مجاناً</span>
                            </div>
                            <div class="subs-list primary-subs-list">
                                ${primarySubs.map(renderBadge).join('')}
                            </div>
                            ${extraSubsHTML}
                            ${toggleBtnHTML}
                        </div>`;
                }

                let savingsHTML = '';
                if (plan.savings) {
                    savingsHTML = `<div class="plan-savings-pill"><i data-lucide="sparkles"></i> ${plan.savings}</div>`;
                }

                const featureListClass = isPremier ? 'feature-list premier-specs-grid' : 'feature-list';
                card.innerHTML = `
                    <div class="plan-header">
                        <div class="plan-name">${plan.name}</div>
                        <div class="plan-price">${plan.fees} / mo</div>
                        ${savingsHTML}
                    </div>
                    <div class="plan-metrics">
                        ${metricsHTML}
                    </div>
                    <div class="plan-features">
                        <ul class="${featureListClass}">
                            ${featuresHTML}
                        </ul>
                    </div>
                    ${subsHTML}
                `;
                grid.appendChild(card);
            });
            container.appendChild(grid);
        });

        // Initialize delegated click listener for expandable subs toggle once
        if (!window._subsToggleInit) {
            window._subsToggleInit = true;
            document.addEventListener('click', (e) => {
                const btn = e.target.closest('.subs-toggle-btn');
                if (!btn) return;
                e.preventDefault();
                const targetId = btn.getAttribute('data-target');
                const extraCount = btn.getAttribute('data-extra-count') || '';
                const wrapper = document.getElementById(targetId);
                if (!wrapper) return;

                const isExpanded = btn.classList.contains('expanded');
                if (isExpanded) {
                    wrapper.classList.remove('open');
                    btn.classList.remove('expanded');
                    btn.setAttribute('aria-expanded', 'false');
                    const textSpan = btn.querySelector('.btn-text');
                    if (textSpan) textSpan.textContent = `+ ${extraCount} مزايا إضافية (سفر ولايف ستايل)`;
                    const icon = btn.querySelector('.btn-icon');
                    if (icon) icon.setAttribute('data-lucide', 'chevron-down');
                } else {
                    wrapper.classList.add('open');
                    btn.classList.add('expanded');
                    btn.setAttribute('aria-expanded', 'true');
                    const textSpan = btn.querySelector('.btn-text');
                    if (textSpan) textSpan.textContent = `إخفاء المزايا الإضافية`;
                    const icon = btn.querySelector('.btn-icon');
                    if (icon) icon.setAttribute('data-lucide', 'chevron-up');
                }
                if (window.safeRenderIcons) window.safeRenderIcons();
                else if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
            });
        }

        window.safeRenderIcons();
    }

    function renderGoPlans(data) {
        const container = document.getElementById('goContainer');
        if (!container) return;
        container.innerHTML = '';

        const goCategories = data.filter(cat => cat.category === 'Go Monthly' || cat.category === 'Go Extra' || cat.category === 'MBB GO');
        const hwCategory = data.find(cat => cat.category === 'Home Wireless');
        const hwExtraCategory = data.find(cat => cat.category === 'Home Wireless Extra');

        // Render GO Sections
        goCategories.forEach(category => {
            const catTitle = document.createElement('h2');
            catTitle.className = 'plan-category-title';
            catTitle.textContent = category.category;
            container.appendChild(catTitle);

            const grid = document.createElement('div');
            grid.className = 'plans-grid';

            category.plans.forEach((plan, index) => {
                const card = document.createElement('div');
                card.className = 'plan-card';
                card.style.animationDelay = `${index * 0.05}s`;
                
                let icon = 'globe';
                if (plan.name.toLowerCase().includes('video')) icon = 'play-circle';
                if (plan.name.toLowerCase().includes('social')) icon = 'share-2';
                if (plan.name.toLowerCase().includes('home') && !plan.name.includes('Wireless')) icon = 'home';
                if (plan.name.toLowerCase().includes('amazon')) icon = 'shopping-bag';
                if (plan.name.toLowerCase().includes('tiktok')) icon = 'music';
                if (plan.categoryName === 'MBB GO' || plan.name.includes('MBB')) icon = 'wifi';

                const validityText = plan.validity || 'شهر واحد';

                card.innerHTML = `
                    <div class="plan-header">
                        <div class="plan-name"><i data-lucide="${icon}" class="go-plan-icon"></i> ${plan.name}</div>
                        <div class="plan-price">${plan.fees}</div>
                    </div>
                    <div class="plan-metrics go-plan-metrics">
                        <div class="metric-item"><span class="metric-value">${plan.data}</span><span class="metric-label">Quota</span></div>
                    </div>
                    <div class="plan-features"><ul class="feature-list"><li class="feature-item"><i data-lucide="check-circle"></i> صالحة لمدة ${validityText}</li>${plan.afterFinish ? `<li class="feature-item"><i data-lucide="info"></i> ${plan.afterFinish}</li>` : ''}</ul></div>
                `;
                grid.appendChild(card);
            });
            container.appendChild(grid);
        });

        // Add Premium Separator if Home Wireless exists
        if (hwCategory) {
            const divider = document.createElement('div');
            divider.className = 'section-premium-divider';
            container.appendChild(divider);

            const hwTitle = document.createElement('h2');
            hwTitle.className = 'plan-category-title';
            hwTitle.style.color = '#818cf8'; // Specialized color for HW
            hwTitle.innerHTML = `<i data-lucide="router" style="vertical-align: middle; margin-left: 10px;"></i> ${hwCategory.category}`;
            container.appendChild(hwTitle);

            const hwGrid = document.createElement('div');
            hwGrid.className = 'plans-grid';

            hwCategory.plans.forEach((plan, index) => {
                const card = document.createElement('div');
                card.className = 'plan-card';
                card.style.animationDelay = `${index * 0.05}s`;
                
                card.innerHTML = `
                    <div class="plan-header">
                        <div class="plan-name">${plan.name}</div>
                        <div class="plan-price">${plan.fees}</div>
                    </div>
                    <div class="plan-metrics go-plan-metrics">
                        <div class="metric-item"><span class="metric-value">${plan.data}</span><span class="metric-label">Quota</span></div>
                    </div>
                    <div class="plan-features"><ul class="feature-list"><li class="feature-item"><i data-lucide="check-circle"></i> صالحة للتجديد التلقائي</li></ul></div>
                `;
                hwGrid.appendChild(card);
            });
            container.appendChild(hwGrid);
        }

        // Add Home Wireless Extra if it exists
        if (hwExtraCategory) {
            const hwExtraTitle = document.createElement('h2');
            hwExtraTitle.className = 'plan-category-title';
            hwExtraTitle.style.marginTop = '30px';
            hwExtraTitle.innerHTML = `<i data-lucide="plus-circle" style="vertical-align: middle; margin-left: 10px;"></i> ${hwExtraCategory.category}`;
            container.appendChild(hwExtraTitle);

            const hwExtraGrid = document.createElement('div');
            hwExtraGrid.className = 'plans-grid';

            hwExtraCategory.plans.forEach((plan, index) => {
                const card = document.createElement('div');
                card.className = 'plan-card';
                card.style.animationDelay = `${index * 0.05}s`;
                
                card.innerHTML = `
                    <div class="plan-header">
                        <div class="plan-name">${plan.name}</div>
                        <div class="plan-price">${plan.fees}</div>
                    </div>
                    <div class="plan-metrics go-plan-metrics">
                        <div class="metric-item"><span class="metric-value">${plan.data}</span><span class="metric-label">Quota</span></div>
                    </div>
                    <div class="plan-features"><ul class="feature-list"><li class="feature-item"><i data-lucide="check-circle"></i> باقة إضافية</li></ul></div>
                `;
                hwExtraGrid.appendChild(card);
            });
            container.appendChild(hwExtraGrid);
        }

        window.safeRenderIcons();
    }

    function renderFreemax(data) {
        const container = document.getElementById('freemaxContainer');
        const weeklyContainer = document.getElementById('freemaxWeeklyContainer');
        const perksContainer = document.getElementById('freemaxPerks');
        const highlightsContainer = document.getElementById('freemaxHighlights');
        const tagline = document.getElementById('freemaxTagline');
        
        if (!container || !data) return;

        // 1. Tagline
        if (tagline && data.tagline) tagline.textContent = data.tagline;

        // 2. Highlights
        if (highlightsContainer && data.highlights) {
            highlightsContainer.innerHTML = data.highlights.map((h, i) => {
                let icon = 'check-circle-2';
                let iconColor = 'var(--primary)';
                
                if (h.toLowerCase().includes('facebook')) {
                    icon = 'facebook';
                    iconColor = '#1877F2';
                } else if (h.toLowerCase().includes('whatsapp')) {
                    icon = 'message-circle';
                    iconColor = '#25D366';
                }
                
                return `
                    <div class="freemax-highlight-item" style="animation-delay: ${i * 0.1}s">
                        <i data-lucide="${icon}" style="color: ${iconColor}"></i>
                        <span>${h}</span>
                    </div>
                `;
            }).join('');
        }

        // 3. Global Perks (Brands)
        if (perksContainer && data.globalPerks) {
            perksContainer.innerHTML = data.globalPerks.map((p, i) => `
                <div class="freemax-perk-card" style="animation-delay: ${i * 0.15}s">
                    <div class="perk-icon-wrapper" style="background: ${p.color}15; border-color: ${p.color}30">
                        <i data-lucide="${p.icon}" style="color: ${p.color}"></i>
                    </div>
                    <div class="perk-info">
                        <div class="perk-label">${p.label}</div>
                        <div class="perk-detail">${p.detail}</div>
                    </div>
                </div>
            `).join('');
        }

        // 4. Main Plans
        container.innerHTML = '';
        const grid = document.createElement('div');
        grid.className = 'plans-grid freemax-grid';
        
        (data.plans || []).forEach((plan, index) => {
            const card = document.createElement('div');
            card.className = 'plan-card freemax-card';
            if (plan.hasPerks) card.classList.add('has-perks');
            card.style.animationDelay = `${index * 0.05}s`;
            card.style.borderTop = `5px solid ${plan.color || 'var(--primary)'}`;
            
            card.innerHTML = `
                <div class="freemax-card-header">
                    <div class="freemax-name-group">
                        <div class="freemax-name">${plan.name}</div>
                        <div class="freemax-price-badge">${plan.price} LE</div>
                    </div>
                    ${plan.hasPerks ? '<span class="perk-badge-mini">مميز</span>' : ''}
                </div>

                <div class="freemax-metrics">
                    <div class="freemax-metric">
                        <span class="m-val">${plan.units}</span>
                        <span class="m-key">وحدة</span>
                    </div>
                    <div class="freemax-metric-divider"></div>
                    <div class="freemax-social">
                        <div class="s-row"><i data-lucide="facebook" style="color:#1877F2"></i> ${plan.facebook}</div>
                        <div class="s-row"><i data-lucide="message-circle" style="color:#25D366"></i> ${plan.whatsapp}</div>
                    </div>
                </div>

                <div class="freemax-pricing-grid">
                    <div class="p-col activation">
                        <div class="p-label">سعر التفعيل<br>(الموظف)</div>
                        <div class="p-amount">${plan.activationWithTax} <span class="p-curr">جنيه</span></div>
                        <div class="p-sub">إجمالي شامل الضريبة</div>
                    </div>
                    <div class="p-col renewal">
                        <div class="p-label">سعر التجديد<br>(العميل)</div>
                        <div class="p-amount">${plan.renewalPrice} <span class="p-curr">جنيه</span></div>
                        <div class="p-sub">قيمة الشحن المطلوبة</div>
                    </div>
                </div>

                ${plan.perks && plan.perks.length > 0 ? `
                <div class="freemax-perks-list-mini">
                    ${plan.perks.map(p => `<span><i data-lucide="sparkles"></i> ${p}</span>`).join('')}
                </div>
                ` : ''}

                <div class="freemax-footer">
                    <div class="sim-cost">سعر الخط: <b>${data.simPrice} جنيه</b></div>
                    <i data-lucide="chevron-left"></i>
                </div>
            `;
            grid.appendChild(card);
        });
        container.appendChild(grid);

        // 5. Weekly Plan
        if (weeklyContainer && data.weekly) {
            const w = data.weekly;
            weeklyContainer.innerHTML = `
                <div class="freemax-weekly-banner">
                    <div class="weekly-content">
                        <div class="weekly-header">
                            <span class="weekly-badge">WEEKLY</span>
                            <h3>${w.name} — ${w.tagline}</h3>
                        </div>
                        <div class="weekly-main">
                            <div class="w-metric"><b>${w.units}</b> وحدة</div>
                            <div class="w-price">بـ <b>${w.renewalPrice} جنيه</b></div>
                        </div>

                        <div class="weekly-platforms">
                            <span>متاح التحويل عبر:</span>
                            <div class="platforms-list">
                                ${w.channels.map(c => `<span class="plat-item">${c}</span>`).join('')}
                            </div>
                        </div>
                    </div>
                    <div class="weekly-icon">
                        <i data-lucide="calendar"></i>
                    </div>
                </div>
            `;
        }

        window.safeRenderIcons();
    }

    function initFreemaxWizard() {
        const internetRange = document.getElementById('usageInternetRange');
        const internetValEl = document.getElementById('usageInternetVal');
        const minutesRange = document.getElementById('usageMinutesRange');
        const minutesValEl = document.getElementById('usageMinutesVal');
        const budgetChips = document.querySelectorAll('.budget-chip');
        const resName = document.getElementById('resPlanName');
        const resDetail = document.getElementById('resPlanDetail');
        const startNowBtn = document.getElementById('freemaxStartNow');
        const viewPlansBtn = document.getElementById('freemaxViewPlans');

        if (!internetRange || !minutesRange || !resName) return;

        // 1. Hero Buttons Logic
        if (startNowBtn) {
            startNowBtn.onclick = () => {
                const wizard = document.getElementById('freemaxWizard');
                if (wizard) wizard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            };
        }
        if (viewPlansBtn) {
            viewPlansBtn.onclick = () => {
                const container = document.getElementById('freemaxContainer');
                if (container) container.scrollIntoView({ behavior: 'smooth' });
            };
        }

        // 2. Wizard Logic
        let currentInternet = parseInt(internetRange.value);
        let currentMinutes = parseInt(minutesRange.value);
        let currentBudget = 80; // Default active chip (now 80)

        const updateRecommendation = () => {
            const data = window.ORANGE_FREEMAX_DATA;
            if (!data || !data.plans) return;

            const plans = data.plans;
            const totalNeeded = currentInternet + currentMinutes;
            
            // 1. Find the ideal plan (smallest plan covering usage, regardless of budget)
            let idealPlan = plans.find(p => parseInt(p.units.replace(/,/g, '')) >= totalNeeded);
            if (!idealPlan) idealPlan = plans[plans.length - 1]; // Max plan if usage is huge

            // 2. Find best affordable plan (largest plan within budget)
            const affordablePlans = plans.filter(p => p.price <= currentBudget);
            let bestAffordablePlan = affordablePlans.length > 0 ? affordablePlans[affordablePlans.length - 1] : plans[0];

            let bestPlan = bestAffordablePlan;
            let showUpgradeSuggestion = false;

            if (parseInt(bestAffordablePlan.units.replace(/,/g, '')) >= totalNeeded) {
                // Usage is covered within budget! Suggest the smallest plan that covers it.
                bestPlan = plans.find(p => parseInt(p.units.replace(/,/g, '')) >= totalNeeded && p.price <= currentBudget);
            } else {
                // Usage NOT covered within budget
                showUpgradeSuggestion = true;
            }

            // Update UI
            if (resName) resName.textContent = bestPlan.nameAr || bestPlan.name;
            if (resDetail) {
                if (!showUpgradeSuggestion) {
                    resDetail.textContent = `بتديلك ${bestPlan.units} وحدة وتكفي احتياجاتك (${totalNeeded.toLocaleString()}) بالتمام! (سعر التجديد ${bestPlan.renewalPrice} ج)`;
                } else {
                    resDetail.textContent = `دي أكبر باقة في ميزانيتك (${bestAffordablePlan.units} وحدة). عشان تغطي استهلاكك (${totalNeeded.toLocaleString()})، الأنسب ليك ${idealPlan.nameAr || idealPlan.name} بتديلك ${idealPlan.units} وحدة وتجديدها بـ ${idealPlan.renewalPrice} ج.`;
                }
            }
            
            // Re-trigger animation
            const resultBox = document.getElementById('wizardResult');
            if (resultBox) {
                resultBox.style.animation = 'none';
                resultBox.offsetHeight; // trigger reflow
                resultBox.style.animation = 'resultPop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            }
        };

        internetRange.oninput = (e) => {
            currentInternet = parseInt(e.target.value);
            if (internetValEl) internetValEl.textContent = currentInternet.toLocaleString();
            updateRecommendation();
        };

        minutesRange.oninput = (e) => {
            currentMinutes = parseInt(e.target.value);
            if (minutesValEl) minutesValEl.textContent = currentMinutes.toLocaleString();
            updateRecommendation();
        };

        budgetChips.forEach(chip => {
            chip.onclick = () => {
                budgetChips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                currentBudget = parseInt(chip.getAttribute('data-budget')) || 345;
                if (chip.textContent.includes('345+')) currentBudget = 1000;
                updateRecommendation();
            };
        });

        // Initial update
        updateRecommendation();
    }


    function normalizeInput(str) {
        if (!str) return '';
        const arabicNumbers = [/٠/g, /١/g, /٢/g, /٣/g, /٤/g, /٥/g, /٦/g, /٧/g, /٨/g, /٩/g];
        let normalized = str;
        for (let i = 0; i < 10; i++) normalized = normalized.replace(arabicNumbers[i], i);
        return normalized.trim().toLowerCase();
    }

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        const handleSRSearch = debounce((e) => {
            const term = normalizeInput(e.target.value);
            if (!term) { renderResults(srData); return; }
            const filtered = srData.filter(item => 
                item.id?.toLowerCase().includes(term) || 
                item.title?.toLowerCase().includes(term) || 
                item.description?.toLowerCase().includes(term) ||
                item.category?.toLowerCase().includes(term)
            );
            renderResults(filtered);
        }, 250);
        searchInput.addEventListener('input', handleSRSearch);
    }

    const huntSearchInput = document.getElementById('huntSearchInput');
    if (huntSearchInput) {
        const handleHuntSearch = debounce((e) => {
            const term = normalizeInput(e.target.value);
            const data = window.ORANGE_HUNTS_DATA || [];
            if (!term) { renderHunts(data); return; }
            const filtered = data.filter(item => 
                item.name?.toLowerCase().includes(term) || 
                item.number?.toLowerCase().includes(term)
            );
            renderHunts(filtered);
        }, 250);
        huntSearchInput.addEventListener('input', handleHuntSearch);
    }

    const emailSearchInput = document.getElementById('emailSearchInput');
    if (emailSearchInput) {
        const handleEmailSearch = debounce((e) => {
            const term = normalizeInput(e.target.value);
            const data = window.ORANGE_EMAILS_DATA || [];
            if (!term) { renderEmails(data); return; }
            const filtered = data.filter(item => 
                item.name?.toLowerCase().includes(term) || 
                item.email?.toLowerCase().includes(term)
            );
            renderEmails(filtered);
        }, 250);
        emailSearchInput.addEventListener('input', handleEmailSearch);
    }

    const modal = document.getElementById('detailModal');
    const modalBody = document.getElementById('modalBody');
    const closeModal = document.getElementById('closeModal');

    // Lock body scroll on iOS when modal is open
    function lockBodyScroll() {
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
    }

    function unlockBodyScroll() {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
    }

    function copyToClipboard(text, btn) {
        // Strip HTML tags for clean plain-text copy
        const tmp = document.createElement('div');
        tmp.innerHTML = text;
        const plainText = tmp.textContent || tmp.innerText || '';

        navigator.clipboard.writeText(plainText).then(() => {
            btn.innerHTML = `<i data-lucide="check"></i> تم النسخ!`;
            btn.classList.add('copied');
            window.safeRenderIcons();
            setTimeout(() => {
                btn.innerHTML = `<i data-lucide="copy"></i> نسخ الخطوات`;
                btn.classList.remove('copied');
                window.safeRenderIcons();
            }, 2000);
        }).catch(() => {
            // Fallback for older browsers / http environments
            const ta = document.createElement('textarea');
            ta.value = plainText;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            btn.innerHTML = `<i data-lucide="check"></i> تم النسخ!`;
            btn.classList.add('copied');
            window.safeRenderIcons();
            setTimeout(() => {
                btn.innerHTML = `<i data-lucide="copy"></i> نسخ الخطوات`;
                btn.classList.remove('copied');
                window.safeRenderIcons();
            }, 2000);
        });
    }

    function shareToWhatsApp(item) {
        // Strip HTML tags
        const tmp = document.createElement('div');
        tmp.innerHTML = item.steps;
        const plainSteps = tmp.textContent || tmp.innerText || '';

        const msg =
            `📋 *SR #${item.id} — ${item.titleAr || item.title}*\n\n` +
            `📝 *الوصف:*\n${item.description ? item.description.replace(/<[^>]+>/g, '') : ''}\n\n` +
            `✅ *خطوات الحل:*\n${plainSteps.trim()}\n\n` +
            `_Orange SR Encyclopedia 🧡_`;

        const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
        window.open(url, '_blank');
    }

    function openModal(item) {
        if (!modal || !modalBody) return;
        modalBody.innerHTML = `
            <div class="sr-category modal-category">${item.category}</div>
            <h2 class="modal-title">${item.title} ${item.titleAr ? `<small style="display:block;margin-top:5px;font-size:0.9rem;opacity:0.7;">${item.titleAr}</small>` : ''}</h2>
            <div class="sr-id modal-id">${item.id}</div>
            <p class="modal-description">${linkifyNumbers(item.description)}</p>
            <h3 class="modal-steps-title">خطوات الحل:</h3>
            <div class="modal-steps" id="modalStepsContent">${linkifyNumbers(item.steps)}</div>
            <div class="modal-action-btns">
                <button class="copy-steps-btn" id="copyStepsBtn">
                    <i data-lucide="copy"></i> نسخ الخطوات
                </button>
                <button class="whatsapp-share-btn" id="whatsappShareBtn">
                    <i data-lucide="message-circle"></i> مشاركة واتساب
                </button>
            </div>
        `;
        modal.classList.add('active');
        modal.scrollTop = 0;
        lockBodyScroll();
        window.safeRenderIcons();

        // Attach copy button listener
        const copyBtn = document.getElementById('copyStepsBtn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => copyToClipboard(item.steps, copyBtn));
        }

        // Attach WhatsApp share button listener
        const waBtn = document.getElementById('whatsappShareBtn');
        if (waBtn) {
            waBtn.addEventListener('click', () => shareToWhatsApp(item));
        }
    }

    function closeModalFn() {
        if (!modal) return;
        modal.classList.remove('active');
        unlockBodyScroll();
    }

    // Close button: supports both click and touchstart for iOS responsiveness
    if (closeModal) {
        closeModal.addEventListener('click', (e) => {
            e.stopPropagation();
            closeModalFn();
        });
        closeModal.addEventListener('touchstart', (e) => {
            e.stopPropagation();
            e.preventDefault();
            closeModalFn();
        }, { passive: false });
    }

    // Click on backdrop (modal overlay) to close
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModalFn();
        });
        // Touch support for backdrop close on iOS
        modal.addEventListener('touchstart', (e) => {
            if (e.target === modal) {
                e.preventDefault();
                closeModalFn();
            }
        }, { passive: false });
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
            closeModalFn();
        }
    });

    // ============================================
    // HOME INTERNET (DSL) LOGIC & DATA
    // ============================================
    const dslPlans = [
        { name: "Home DSL 150", speed: 30, quota: 50, price: 171, oldPlan: "باقة جديدة" },
        { name: "Home DSL 260", speed: 30, quota: 150, price: 296.4, oldPlan: "Home DSL 210" },
        { name: "Home DSL 330", speed: 30, quota: 200, price: 376.2, oldPlan: "Home DSL 290" },
        { name: "Home DSL 395", speed: 30, quota: 250, price: 450.3, oldPlan: "Home DSL 360" },
        { name: "Home DSL 460", speed: 30, quota: 300, price: 524.4, oldPlan: "Home DSL 420" },
        { name: "Home DSL 660", speed: 30, quota: 500, price: 752.4, oldPlan: "Home DSL 680" },
        { name: "Home DSL 925", speed: 30, quota: 750, price: 1054.5, oldPlan: "Home DSL 1040" },
        { name: "Home DSL 590", speed: 70, quota: 250, price: 672.6, oldPlan: "Home DSL 520" },
        { name: "Home DSL 1175", speed: 70, quota: 750, price: 1339.5, oldPlan: "Home DSL 1040" },
        { name: "Home DSL 2000", speed: 70, quota: 1500, price: 2280, oldPlan: "Home DSL 1560" },
        { name: "Home DSL 880", speed: 100, quota: 300, price: 1003.2, oldPlan: "Home DSL 700" },
        { name: "Home DSL 1000", speed: 100, quota: 400, price: 1140, oldPlan: "Home DSL 880" },
        { name: "Home DSL 1425", speed: 100, quota: 750, price: 1624.5, oldPlan: "Home DSL 1230" },
        { name: "Home DSL 2350", speed: 200, quota: 1500, price: 2679, oldPlan: "Home DSL 1760" },
        { name: "Home DSL 2670", speed: 500, quota: 1500, price: 3043.8, oldPlan: "باقة جديدة" }
    ];

    const dslAddons = [
        { quota: "20 GB", price: 68.4 },
        { quota: "60 GB", price: 159.6 },
        { quota: "100 GB", price: 216.6 },
        { quota: "150 GB", price: 319.2 },
        { quota: "400 GB", price: 570 }
    ];

    window.initDslTab = function initDslTab() {
        console.log("Initializing Home Internet (DSL) Tab...");
        
        // Elements
        const promoToggle = document.getElementById('dslPromoToggle');
        const speedTabs = document.querySelectorAll('#dslSpeedTabs .dsl-tab-btn');
        const budgetRange = document.getElementById('dslBudgetRange');
        const budgetVal = document.getElementById('dslBudgetVal');
        const quotaRange = document.getElementById('dslQuotaRange');
        const quotaVal = document.getElementById('dslQuotaVal');

        let currentPromoActive = promoToggle ? promoToggle.checked : false;
        let currentSpeedFilter = 'all';

        // 1. Initial renders
        renderDslPlans(currentSpeedFilter, currentPromoActive);
        renderDslAddons();
        updateDslAdvisor();

        // 2. Event: Promo Toggle Change
        if (promoToggle) {
            // Remove any existing listener to prevent doubling
            const newPromoToggle = promoToggle.cloneNode(true);
            promoToggle.parentNode.replaceChild(newPromoToggle, promoToggle);
            
            newPromoToggle.addEventListener('change', (e) => {
                window.triggerHaptic('medium');
                currentPromoActive = e.target.checked;
                renderDslPlans(currentSpeedFilter, currentPromoActive);
                updateDslAdvisor();
            });
        }

        // 3. Event: Speed Filters Click
        if (speedTabs.length > 0) {
            speedTabs.forEach(btn => {
                btn.addEventListener('click', () => {
                    window.triggerHaptic('light');
                    speedTabs.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    currentSpeedFilter = btn.getAttribute('data-speed');
                    renderDslPlans(currentSpeedFilter, currentPromoActive);
                });
            });
        }

        // 4. Events: Advisor sliders change
        if (budgetRange) {
            budgetRange.addEventListener('input', (e) => {
                if (budgetVal) budgetVal.textContent = e.target.value;
                updateDslAdvisor();
            });
        }
        if (quotaRange) {
            quotaRange.addEventListener('input', (e) => {
                if (quotaVal) quotaVal.textContent = e.target.value;
                updateDslAdvisor();
            });
        }

        // 5. Event: Router Customer Type buttons
        const routerCustBtns = document.querySelectorAll('.router-cust-btn');
        const vdslHighEndCashPrice = document.getElementById('vdslHighEndCashPrice');
        const vdslHighEndDiscountBadge = document.getElementById('vdslHighEndDiscountBadge');

        if (routerCustBtns.length > 0) {
            routerCustBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    window.triggerHaptic('light');
                    routerCustBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    const customerType = btn.getAttribute('data-cust');
                    
                    if (vdslHighEndCashPrice && vdslHighEndDiscountBadge) {
                        if (customerType === 'new') {
                            vdslHighEndCashPrice.textContent = '855 ج';
                            vdslHighEndDiscountBadge.textContent = 'خصم 50%';
                        } else {
                            vdslHighEndCashPrice.textContent = '1,285 ج';
                            vdslHighEndDiscountBadge.textContent = 'خصم 25%';
                        }
                    }
                });
            });
        }
    }

    function getPlanPromoDetails(planName) {
        if (planName === "Home DSL 150" || planName === "Home DSL 260") {
            return { hasPromo: false, duration: 0 };
        } else if (planName === "Home DSL 330") {
            return { hasPromo: true, duration: 3 };
        } else {
            return { hasPromo: true, duration: 6 };
        }
    }

    function renderDslPlans(speedFilter, promoActive) {
        const grid = document.getElementById('dslPlansGrid');
        if (!grid) return;
        grid.innerHTML = '';

        let filteredPlans = dslPlans;
        if (speedFilter !== 'all') {
            if (speedFilter === 'super') {
                filteredPlans = dslPlans.filter(p => p.speed >= 200);
            } else {
                const targetSpeed = parseInt(speedFilter);
                filteredPlans = dslPlans.filter(p => p.speed === targetSpeed);
            }
        }

        filteredPlans.forEach((plan, index) => {
            const card = document.createElement('div');
            card.className = 'dsl-card';
            card.style.animationDelay = `${index * 0.05}s`;

            const promoDetails = getPlanPromoDetails(plan.name);
            const showPromo = promoActive && promoDetails.hasPromo;
            const promoPrice = (plan.price / 2).toFixed(1);

            // Display of old/cross plan info
            let oldPlanText = plan.oldPlan;
            if (plan.oldPlan !== 'باقة جديدة') {
                oldPlanText = `سابقاً: <span>${plan.oldPlan}</span>`;
            }

            card.innerHTML = `
                <div class="dsl-card-header">
                    <div class="dsl-card-name">${plan.name}</div>
                    <span class="dsl-card-badge">${plan.speed} Mbps</span>
                </div>
                <div class="dsl-card-metrics">
                    <div class="dsl-metric">
                        <span class="dsl-metric-val">${plan.quota} GB</span>
                        <span class="dsl-metric-label">حجم الباقة</span>
                    </div>
                </div>
                <div class="dsl-card-prices">
                    <div class="dsl-old-plan">${oldPlanText}</div>
                    <div class="dsl-price-row">
                        <div class="dsl-price-current" style="display: ${showPromo ? 'none' : 'flex'}">
                            ${plan.price.toLocaleString('en-US')} <span>جنيه / شهر</span>
                        </div>
                        <div class="dsl-price-promo" style="display: ${showPromo ? 'flex' : 'none'}">
                            ${promoPrice} <span>جنيه / شهر</span>
                        </div>
                        ${showPromo ? `<span class="dsl-promo-badge-inline">خصم 50% (أول ${promoDetails.duration} شهور)</span>` : ''}
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
        window.safeRenderIcons();
    }

    function renderDslAddons() {
        const grid = document.getElementById('dslAddonsGrid');
        if (!grid) return;
        grid.innerHTML = '';

        dslAddons.forEach(addon => {
            const item = document.createElement('div');
            item.className = 'addon-card-item';
            item.innerHTML = `
                <span class="addon-quota">${addon.quota}</span>
                <span class="addon-price">${addon.price} جنيه</span>
            `;
            item.addEventListener('click', () => {
                window.triggerHaptic('light');
                window.copyText(`${addon.quota} - ${addon.price} جنيه`, 'الباقة الإضافية');
            });
            grid.appendChild(item);
        });
    }

    function updateDslAdvisor() {
        const budgetRange = document.getElementById('dslBudgetRange');
        const quotaRange = document.getElementById('dslQuotaRange');
        
        const planNameEl = document.getElementById('advDslPlanName');
        const planPriceEl = document.getElementById('advDslPlanPrice');
        const planDescEl = document.getElementById('advDslPlanDesc');
        const promoBreakdown = document.getElementById('advDslPromoBreakdown');
        
        const promoValEl = document.getElementById('advPromoVal');
        const savingsEl = document.getElementById('advPromoSavings');

        if (!budgetRange || !quotaRange || !planNameEl) return;

        const maxBudget = parseFloat(budgetRange.value);
        const minQuota = parseFloat(quotaRange.value);
        const promoActive = document.getElementById('dslPromoToggle') ? document.getElementById('dslPromoToggle').checked : false;

        // Find matches: Filter plans that satisfy quota requirements
        let candidates = dslPlans.filter(p => p.quota >= minQuota);

        // Sort by price ascending
        candidates.sort((a, b) => a.price - b.price);

        let suggestedPlan = null;
        for (let plan of candidates) {
            const promoDetails = getPlanPromoDetails(plan.name);
            const effectivePrice = (promoActive && promoDetails.hasPromo) ? (plan.price / 2) : plan.price;
            if (effectivePrice <= maxBudget) {
                suggestedPlan = plan;
                break;
            }
        }

        // Fallback: lookup by budget first
        if (!suggestedPlan) {
            let budgetPlans = dslPlans.filter(p => {
                const promoDetails = getPlanPromoDetails(p.name);
                const effectivePrice = (promoActive && promoDetails.hasPromo) ? (p.price / 2) : p.price;
                return effectivePrice <= maxBudget;
            });
            budgetPlans.sort((a, b) => b.quota - a.quota || a.price - b.price);
            if (budgetPlans.length > 0) {
                suggestedPlan = budgetPlans[0];
            }
        }

        // Display results
        if (suggestedPlan) {
            const price = suggestedPlan.price;
            const promoDetails = getPlanPromoDetails(suggestedPlan.name);
            const showPromo = promoActive && promoDetails.hasPromo;
            const effectivePrice = showPromo ? (price / 2) : price;

            planNameEl.textContent = suggestedPlan.name;
            planPriceEl.textContent = `${effectivePrice.toFixed(1)} جنيه / شهرياً`;
            planDescEl.textContent = `سرعة الباقة ${suggestedPlan.speed} Mbps وسعة التحميل ${suggestedPlan.quota} GB. السعر شامل الضريبة.`;
            
            if (showPromo) {
                if (promoBreakdown) promoBreakdown.style.display = 'flex';
                if (promoValEl) promoValEl.textContent = `${(price / 2).toFixed(1)} جنيه / شهر`;
                
                // Update duration labels in advisor promo breakdown
                const labelTextEl = promoBreakdown.querySelector('.promo-item:nth-child(1) span');
                if (labelTextEl) {
                    labelTextEl.textContent = `السعر في العرض (أول ${promoDetails.duration} شهور):`;
                }
                const savingsLabelEl = promoBreakdown.querySelector('.promo-item:nth-child(2) span');
                if (savingsLabelEl) {
                    savingsLabelEl.textContent = `التوفير الإجمالي في ${promoDetails.duration} شهور:`;
                }

                if (savingsEl) savingsEl.textContent = `${((price - (price / 2)) * promoDetails.duration).toFixed(1)} جنيه`;
            } else {
                if (promoBreakdown) promoBreakdown.style.display = 'none';
            }
        } else {
            planNameEl.textContent = "لا توجد باقة مطابقة";
            planPriceEl.textContent = "—";
            planDescEl.textContent = "حاول زيادة ميزانية البحث لرؤية الباقات المتاحة.";
            if (promoBreakdown) promoBreakdown.style.display = 'none';
        }
    }

    // Calculators logic has been moved to calculators.js
    loadData();
});

// ===== SCROLL TO TOP =====
(function() {
    const btn = document.getElementById('scrollToTopBtn');
    if (!btn) return;
    window.addEventListener('scroll', () => {
        btn.classList.toggle('visible', window.scrollY > 300);
    }, { passive: true });
    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (window.navigator?.vibrate) window.navigator.vibrate(8);
    });
    // Re-render icon after lucide loads
    window.addEventListener('load', () => { if (window.safeRenderIcons) window.safeRenderIcons(); });
})();

// ============================================
// MASTERPIECE PREMIUM LOGIC (WOW FACTORS)
// ============================================
(function() {
    // 1. Scroll Progress Logic
    const progressBar = document.getElementById('scrollProgress');
    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        if (progressBar) progressBar.style.width = scrolled + "%";
    }, { passive: true });

    // 2. Magnetic 3D Card Tilt Effect
    const cards = document.querySelectorAll('.bento-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            if (window.innerWidth < 768) return; 
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        });
    });

    // 3. Haptic Feedback Simulation for Touch
    cards.forEach(card => {
        card.addEventListener('touchstart', () => {
            if (window.navigator?.vibrate) window.navigator.vibrate(10);
        }, { passive: true });
    });
})();

// ============================================
// OFFLINE UI TOAST LOGIC (PWA)
// ============================================
(function() {
    function updateOnlineStatus() {
        const toast = document.getElementById('offlineToast');
        if (!toast) return;
        
        if (navigator.onLine) {
            toast.classList.remove('active');
            setTimeout(() => {
                if(!navigator.onLine) return; // double check
                toast.style.display = 'none';
            }, 500); // Wait for transition
        } else {
            toast.style.display = 'flex';
            // Force reflow
            void toast.offsetWidth;
            toast.classList.add('active');
            if (window.navigator?.vibrate) window.navigator.vibrate([10, 50, 10]);
        }
    }

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    // Initial check (delay slightly to not block render)
    setTimeout(updateOnlineStatus, 1500);
})();


