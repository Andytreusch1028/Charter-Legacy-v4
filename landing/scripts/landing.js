// Charter Legacy Landing Page - Interactive Elements

// CTA Button Handlers
document.getElementById('startCharter')?.addEventListener('click', function() {
    // UPL-safe: Redirect to conversational intake, not automatic form
    window.location.href = 'https://app.charterlegacy.com/intake';
});

// Product Selection
document.querySelectorAll('[data-product]').forEach(button => {
    button.addEventListener('click', function() {
        const product = this.getAttribute('data-product');
        
        // UPL-safe: Route to intake with product hint, user still chooses
        window.location.href = `https://app.charterlegacy.com/intake?product=${product}`;
    });
});

// Smooth Scroll for Mobile
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Mobile Menu Toggle (if needed in future)
// Currently using simple link, but prepared for expansion

// Analytics Hook (Privacy-Conscious)
function trackEvent(category, action, label) {
    // TODO: Implement privacy-first analytics
    // No personal data, aggregate only
    console.log(`Analytics: ${category} - ${action} - ${label}`);
}

// Track CTA clicks
document.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', function() {
        const text = this.textContent.trim();
        trackEvent('CTA', 'Click', text);
    });
});
