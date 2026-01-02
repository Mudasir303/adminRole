/**
 * Mobile Scroll Active State
 * Automatically highlights service cards when they scroll into view on mobile devices.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Only activate on mobile devices (width < 992px)
    // You can adjust this breakpoint as needed
    const isMobile = () => window.innerWidth < 992;

    const observerOptions = {
        root: null, // viewport
        rootMargin: '-10% 0px -10% 0px', // Trigger when card is well within viewport
        threshold: 0.3 // Trigger when 30% of the element is visible
    };

    const observer = new IntersectionObserver((entries) => {
        // If not mobile, we can optionally clear all active classes or just do nothing
        if (!isMobile()) {
            entries.forEach(entry => entry.target.classList.remove('active'));
            return;
        }

        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add active class
                entry.target.classList.add('active');
            } else {
                // Remove active class when out of view
                entry.target.classList.remove('active');
            }
        });
    }, observerOptions);

    // Select all service cards that need highlighting
    // Targeting .single-service-inner.style-white for the 'What We Do' section
    const serviceCards = document.querySelectorAll('.single-service-inner.style-white, .single-service-inner');

    serviceCards.forEach(card => {
        observer.observe(card);
    });

    // Handle resize events to cleanup/re-check
    window.addEventListener('resize', () => {
        if (!isMobile()) {
            serviceCards.forEach(card => card.classList.remove('active'));
        }
    });
});
