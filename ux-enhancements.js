// ===================================
// UX ENHANCEMENTS JAVASCRIPT
// Back to Top Button
// ===================================

(function() {
    'use strict';
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    function init() {
        createBackToTopButton();
        setupScrollHandler();
    }
    
    // ===================================
    // BACK TO TOP BUTTON
    // ===================================
    function createBackToTopButton() {
        const button = document.createElement('button');
        button.className = 'back-to-top';
        button.setAttribute('aria-label', 'Back to top');
        button.setAttribute('title', 'Back to top');
        document.body.appendChild(button);
        
        button.addEventListener('click', scrollToTop);
        
        return button;
    }
    
    function toggleBackToTopButton() {
        const button = document.querySelector('.back-to-top');
        if (!button) return;
        
        const scrollThreshold = 300; // Show button after scrolling 300px
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > scrollThreshold) {
            button.classList.add('visible');
        } else {
            button.classList.remove('visible');
        }
    }
    
    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
    
    // ===================================
    // SCROLL EVENT HANDLER
    // ===================================
    function setupScrollHandler() {
        let ticking = false;
        
        window.addEventListener('scroll', function() {
            if (!ticking) {
                window.requestAnimationFrame(function() {
                    toggleBackToTopButton();
                    ticking = false;
                });
                ticking = true;
            }
        });
        
        // Initial check
        toggleBackToTopButton();
    }
    
    // ===================================
    // KEYBOARD ACCESSIBILITY
    // ===================================
    // Allow ESC key to hide back-to-top button when focused
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const button = document.querySelector('.back-to-top');
            if (button && document.activeElement === button) {
                button.blur();
            }
        }
    });
    
})();
