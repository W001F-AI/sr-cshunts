/* ============================================
   NEWS & CHANGELOG SYSTEM
   Placeholder for future updates
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    const newsBtn = document.getElementById('newsToggleBtn');
    
    if (newsBtn) {
        // Show badge if there's unread news
        const newsBadge = newsBtn.querySelector('.news-badge');
        const lastReadNews = localStorage.getItem('lastReadNews') || '0';
        const currentNewsVersion = '1.0.5'; // Increment this to show badge

        if (lastReadNews !== currentNewsVersion && newsBadge) {
            newsBadge.style.display = 'block';
        }

        newsBtn.addEventListener('click', () => {
            if (window.showToast) {
                window.showToast('قريباً: سجل التحديثات والجديد في الموسوعة! ✨', 'sparkles');
            } else {
                alert('قريباً: سجل التحديثات والجديد في الموسوعة! ✨');
            }
            
            // Mark as read
            localStorage.setItem('lastReadNews', currentNewsVersion);
            if (newsBadge) newsBadge.style.display = 'none';
        });
    }
});
