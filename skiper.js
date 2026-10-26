/**
 * SKIPER UI - RUNTIME ENGINE ✨
 * Powers Spotlight, Quick Action Chips & Dynamic 3D Parallax Tilt
 * Cleaned & Production-Ready for Deployment
 */

(function () {
    'use strict';

    // 1. SKIPER SPOTLIGHT ENGINE (Tracks cursor & touch coordinates)
    function initSpotlight() {
        const cards = document.querySelectorAll('.bento-card');
        if (!cards || cards.length === 0) return;

        cards.forEach(card => {
            function updateCoordinates(clientX, clientY) {
                const rect = card.getBoundingClientRect();
                const x = clientX - rect.left;
                const y = clientY - rect.top;
                card.style.setProperty('--spotlight-x', `${x}px`);
                card.style.setProperty('--spotlight-y', `${y}px`);
            }

            card.addEventListener('pointermove', (e) => {
                updateCoordinates(e.clientX, e.clientY);
            }, { passive: true });

            card.addEventListener('touchmove', (e) => {
                if (e.touches && e.touches[0]) {
                    updateCoordinates(e.touches[0].clientX, e.touches[0].clientY);
                }
            }, { passive: true });

            card.addEventListener('click', () => {
                triggerHaptic();
            });
        });
    }

    // Safe tactile feedback helper
    function triggerHaptic() {
        if (typeof window.triggerHaptic === 'function') {
            window.triggerHaptic('light');
        } else if ('vibrate' in navigator) {
            try { navigator.vibrate(12); } catch (err) {}
        }
    }

    // 2. QUICK ACTION FILTER CHIPS
    function initQuickChips() {
        const chips = document.querySelectorAll('.skiper-chip');
        if (!chips || chips.length === 0) return;

        chips.forEach(chip => {
            chip.addEventListener('click', () => {
                triggerHaptic();
                chips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');

                const action = chip.getAttribute('data-action');
                if (action === 'all') {
                    if (typeof window.activateTab === 'function') window.activateTab('home');
                } else if (action === 'tab') {
                    const target = chip.getAttribute('data-target');
                    if (target && typeof window.activateTab === 'function') {
                        window.activateTab(target);
                    }
                } else if (action === 'search') {
                    const query = chip.getAttribute('data-query');
                    if (query) {
                        if (typeof window.activateTab === 'function') {
                            window.activateTab('sr');
                        }
                        const searchInput = document.getElementById('searchInput');
                        if (searchInput) {
                            searchInput.value = query;
                            searchInput.dispatchEvent(new Event('input', { bubbles: true }));
                            searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    }
                }
            });
        });
    }

    // 3. DYNAMIC 3D TILT & PARALLAX HOVER ENGINE
    function init3DTilt() {
        const tiltCards = document.querySelectorAll('.bento-card, .dash-link-card');
        if (!tiltCards || tiltCards.length === 0) return;

        tiltCards.forEach(card => {
            card.classList.add('skiper-3d-card');

            let isHovered = false;

            card.addEventListener('mouseenter', () => {
                isHovered = true;
                card.style.transition = 'transform 0.08s ease-out, box-shadow 0.2s ease-out';
            });

            card.addEventListener('mousemove', (e) => {
                if (!isHovered) return;
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const maxTilt = card.classList.contains('bento-large') ? 7 : 11;
                const rotateX = ((y - centerY) / centerY) * -maxTilt;
                const rotateY = ((x - centerX) / centerX) * maxTilt;

                const glareX = (x / rect.width) * 100;
                const glareY = (y / rect.height) * 100;

                card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(8px) scale3d(1.025, 1.025, 1.025)`;
                card.style.setProperty('--glare-x', `${glareX}%`);
                card.style.setProperty('--glare-y', `${glareY}%`);
            });

            card.addEventListener('mouseleave', () => {
                isHovered = false;
                card.style.transition = 'transform 0.55s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.55s ease';
                card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale3d(1, 1, 1)';
            });

            // Mobile tactile press
            card.addEventListener('touchstart', () => {
                card.style.transition = 'transform 0.15s ease-out';
                card.style.transform = 'perspective(800px) scale3d(0.96, 0.96, 0.96) rotateX(3deg)';
            }, { passive: true });

            card.addEventListener('touchend', () => {
                card.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
                card.style.transform = 'perspective(800px) scale3d(1, 1, 1) rotateX(0deg)';
            }, { passive: true });
        });

        // 3D Logo Tilt Interaction
        const logoWrapper = document.getElementById('center3dLogoWrapper');
        if (logoWrapper) {
            logoWrapper.addEventListener('mousemove', (e) => {
                const rect = logoWrapper.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -16;
                const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 16;
                const logo = logoWrapper.querySelector('.center-3d-logo');
                if (logo) {
                    logo.style.animation = 'none';
                    logo.style.transform = `scale(0.82) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
                }
            });
            logoWrapper.addEventListener('mouseleave', () => {
                const logo = logoWrapper.querySelector('.center-3d-logo');
                if (logo) {
                    logo.style.animation = '';
                    logo.style.transform = '';
                }
            });
        }
    }

    // Initialize on DOM load
    document.addEventListener('DOMContentLoaded', () => {
        initSpotlight();
        initQuickChips();
        init3DTilt();

        if (typeof window.safeRenderIcons === 'function') {
            window.safeRenderIcons();
        }
    });

})();
