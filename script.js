// DOM Elements - Will be initialized when DOM is ready
let floatingCTA, videoModal, mobileMenuToggle, nav;
let testimonials, dots;

// Testimonial Carousel
let currentTestimonial = 0;

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Initialize DOM elements
    floatingCTA = document.getElementById('floatingCTA');
    videoModal = document.getElementById('videoModal');
    mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    nav = document.querySelector('.nav');
    testimonials = document.querySelectorAll('.testimonial');
    dots = document.querySelectorAll('.dot');
    
    // Initialize functionality
    initializeAOS();
    initializeFloatingCTA();
    initializeSmoothScrolling();
    initializeFormValidation();
    initializeAnalytics();
    initializeCarousel();
    initializeFAQ();
    initializeMobileMenu();
    initializeVideoModal();
    initializeCookieConsent();
    initializeConversionTracking();
});

// Animate on Scroll (Simple implementation)
function initializeAOS() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll(
        '.problem-card, .feature-card, .testimonial, .step, .faq-item'
    );
    
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Floating CTA functionality
function initializeFloatingCTA() {
    let showFloatingCTA = false;
    
    // Set up close button
    const floatingCloseBtn = document.querySelector('.floating-cta-close');
    if (floatingCloseBtn) {
        floatingCloseBtn.addEventListener('click', hideFloatingCTA);
    }
    
    window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY;
        const windowHeight = window.innerHeight;
        const heroSection = document.querySelector('.hero');
        const heroHeight = heroSection ? heroSection.offsetHeight : 800;
        
        // Show floating CTA after scrolling past hero section
        if (scrollPosition > heroHeight && !showFloatingCTA) {
            showFloatingCTA = true;
            if (floatingCTA) {
                floatingCTA.classList.add('show');
            }
        } else if (scrollPosition <= heroHeight && showFloatingCTA) {
            showFloatingCTA = false;
            if (floatingCTA) {
                floatingCTA.classList.remove('show');
            }
        }
    });
}

// Hide floating CTA
function hideFloatingCTA() {
    if (floatingCTA) {
        floatingCTA.classList.remove('show');
    }
}

// Testimonial Carousel Functions
function showTestimonial(index) {
    if (testimonials && testimonials.length > 0) {
        testimonials.forEach((testimonial, i) => {
            testimonial.classList.toggle('active', i === index);
        });
    }
    
    if (dots && dots.length > 0) {
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }
}

function nextTestimonial() {
    if (testimonials && testimonials.length > 0) {
        currentTestimonial = (currentTestimonial + 1) % testimonials.length;
        showTestimonial(currentTestimonial);
    }
}

function previousTestimonial() {
    if (testimonials && testimonials.length > 0) {
        currentTestimonial = (currentTestimonial - 1 + testimonials.length) % testimonials.length;
        showTestimonial(currentTestimonial);
    }
}

function goToTestimonial(index) {
    if (testimonials && testimonials.length > 0) {
        currentTestimonial = index - 1;
        showTestimonial(currentTestimonial);
    }
}

// Initialize Carousel functionality
function initializeCarousel() {
    // Set up carousel controls
    const prevBtn = document.querySelector('.carousel-btn.prev');
    const nextBtn = document.querySelector('.carousel-btn.next');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', previousTestimonial);
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', nextTestimonial);
    }
    
    // Set up dot navigation
    if (dots && dots.length > 0) {
        dots.forEach((dot, index) => {
            dot.addEventListener('click', function() {
                goToTestimonial(index + 1);
            });
        });
    }
    
    // Auto-rotate testimonials
    if (testimonials && testimonials.length > 1) {
        setInterval(nextTestimonial, 8000);
    }
}

// Initialize FAQ functionality
function initializeFAQ() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            toggleFAQ(this);
        });
    });
}

// FAQ Toggle
function toggleFAQ(element) {
    const faqItem = element.parentElement;
    const faqAnswer = faqItem.querySelector('.faq-answer');
    const isActive = element.classList.contains('active');
    
    // Close all FAQ items
    document.querySelectorAll('.faq-question').forEach(q => {
        q.classList.remove('active');
        q.parentElement.querySelector('.faq-answer').classList.remove('active');
    });
    
    // Toggle current item
    if (!isActive) {
        element.classList.add('active');
        faqAnswer.classList.add('active');
    }
}

// Video Modal Functions
function openVideo() {
    const videoContainer = videoModal.querySelector('.video-container');
    
    // Clear existing content and create video element
    videoContainer.innerHTML = `
        <video controls preload="metadata" style="width: 100%; height: 100%; border-radius: 8px; background: #000;">
            <source src="./fivverpro.mp4" type="video/mp4">
            <source src="fivverpro.mp4" type="video/mp4">
            <p style="color: white; text-align: center; padding: 20px;">
                Your browser does not support the video tag. 
                <br><a href="fivverpro.mp4" target="_blank" style="color: #1DBF73;">Click here to download and watch the video</a>
            </p>
        </video>
    `;
    
    const video = videoContainer.querySelector('video');
    
    // Add event listeners for debugging
    video.addEventListener('loadstart', () => console.log('Video loading started'));
    video.addEventListener('loadeddata', () => console.log('Video data loaded'));
    video.addEventListener('canplay', () => {
        console.log('Video can start playing');
        video.play().catch(e => console.log('Autoplay prevented:', e));
    });
    video.addEventListener('error', (e) => {
        console.error('Video error:', e);
        videoContainer.innerHTML = `
            <div style="padding: 40px; text-align: center; color: white;">
                <h3>Video Loading Issue</h3>
                <p>Unable to load the video. This might be due to:</p>
                <ul style="text-align: left; display: inline-block;">
                    <li>Browser security restrictions</li>
                    <li>Video format compatibility</li>
                    <li>File path issues</li>
                </ul>
                <br>
                <a href="fivverpro.mp4" target="_blank" 
                   style="background: #1DBF73; color: white; padding: 12px 24px; 
                          text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px;">
                    Open Video in New Tab
                </a>
            </div>
        `;
    });
    
    videoModal.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    // Track video open event
    trackEvent('video_opened', {
        event_category: 'engagement',
        event_label: 'hero_video'
    });
}

function closeVideo() {
    videoModal.classList.remove('show');
    const videoContainer = videoModal.querySelector('.video-container');
    if (videoContainer) {
        videoContainer.innerHTML = '';
    }
    document.body.style.overflow = 'auto';
}

// Note: Video modal event listeners are now in initializeVideoModal()

// Initialize Mobile Menu
function initializeMobileMenu() {
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            nav.classList.toggle('show');
            const icon = this.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            }
        });
    }
}

// Initialize Video Modal
function initializeVideoModal() {
    // Set up play button
    const playBtn = document.querySelector('.play-btn');
    if (playBtn) {
        playBtn.addEventListener('click', openVideo);
    }
    
    // Set up close button
    const videoCloseBtn = document.querySelector('.video-close');
    if (videoCloseBtn) {
        videoCloseBtn.addEventListener('click', closeVideo);
    }
    
    // Close video modal on outside click
    if (videoModal) {
        videoModal.addEventListener('click', function(e) {
            if (e.target === videoModal) {
                closeVideo();
            }
        });
    }
    
    // Escape key to close modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && videoModal && videoModal.classList.contains('show')) {
            closeVideo();
        }
    });
}

// Smooth Scrolling for anchor links
function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Form Validation (if forms are added later)
function initializeFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            // Basic validation
            let isValid = true;
            const requiredFields = form.querySelectorAll('[required]');
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('error');
                } else {
                    field.classList.remove('error');
                }
            });
            
            if (isValid) {
                // Track form submission
                trackEvent('form_submit', {
                    event_category: 'lead_generation',
                    event_label: form.id || 'contact_form'
                });
                
                // Show success message
                showNotification('Thank you! We\'ll be in touch soon.', 'success');
                form.reset();
            } else {
                showNotification('Please fill in all required fields.', 'error');
            }
        });
    });
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    
    // Add styles if not already present
    if (!document.querySelector('.notification-styles')) {
        const style = document.createElement('style');
        style.className = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                max-width: 400px;
                padding: 20px 24px;
                border-radius: 12px;
                background: white;
                box-shadow: 0 8px 32px rgba(0,0,0,0.12);
                z-index: 10000;
                display: flex;
                align-items: flex-start;
                gap: 16px;
                animation: slideInDown 0.4s ease;
                font-size: 15px;
                line-height: 1.5;
            }
            .notification-success { 
                border-left: 4px solid #1DBF73;
                background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
            }
            .notification-error { 
                border-left: 4px solid #FF6B35;
                background: linear-gradient(135deg, #fef2f2 0%, #ffffff 100%);
            }
            .notification-info { 
                border-left: 4px solid #3b82f6;
                background: linear-gradient(135deg, #eff6ff 0%, #ffffff 100%);
            }
            .notification span {
                flex: 1;
                color: #374151;
            }
            .notification a {
                color: #1DBF73;
                text-decoration: underline;
                font-weight: 500;
            }
            .notification a:hover {
                color: #19A463;
            }
            .notification button {
                background: none;
                border: none;
                font-size: 20px;
                cursor: pointer;
                color: #9ca3af;
                padding: 2px;
                border-radius: 4px;
                transition: all 0.2s ease;
                flex-shrink: 0;
            }
            .notification button:hover {
                background: #f3f4f6;
                color: #6b7280;
            }
            @keyframes slideInDown {
                from { transform: translateY(-100px) translateX(20px); opacity: 0; }
                to { transform: translateY(0) translateX(0); opacity: 1; }
            }
            @media (max-width: 480px) {
                .notification {
                    top: 10px;
                    right: 10px;
                    left: 10px;
                    max-width: none;
                    padding: 16px 20px;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Auto-remove after 8 seconds (longer for cookie info)
    setTimeout(() => {
        notification.style.animation = 'slideInDown 0.4s ease reverse';
        setTimeout(() => notification.remove(), 400);
    }, 8000);
}

// Analytics and Tracking
function initializeAnalytics() {
    // Track page view
    trackEvent('page_view', {
        event_category: 'engagement',
        page_title: document.title,
        page_location: window.location.href
    });
    
    // Track CTA clicks
    document.querySelectorAll('.cta-btn, .feature-cta, .step-cta').forEach(cta => {
        cta.addEventListener('click', function() {
            const ctaText = this.textContent.trim();
            const section = this.closest('section')?.className || 'unknown';
            
            trackEvent('cta_click', {
                event_category: 'conversion',
                event_label: ctaText,
                section: section
            });
        });
    });
    
    // Track scroll depth
    let maxScrollDepth = 0;
    const scrollDepthThresholds = [25, 50, 75, 90, 100];
    
    window.addEventListener('scroll', () => {
        const scrollPercent = Math.round(
            (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
        );
        
        if (scrollPercent > maxScrollDepth) {
            maxScrollDepth = scrollPercent;
            
            scrollDepthThresholds.forEach(threshold => {
                if (scrollPercent >= threshold && maxScrollDepth >= threshold) {
                    trackEvent('scroll_depth', {
                        event_category: 'engagement',
                        event_label: `${threshold}%`,
                        value: threshold
                    });
                }
            });
        }
    });
    
    // Track time on page
    let timeOnPage = 0;
    const timeTracker = setInterval(() => {
        timeOnPage += 10;
        
        // Track engagement milestones
        if (timeOnPage === 30 || timeOnPage === 60 || timeOnPage === 120) {
            trackEvent('time_on_page', {
                event_category: 'engagement',
                event_label: `${timeOnPage}s`,
                value: timeOnPage
            });
        }
    }, 10000);
    
    // Track when user leaves page
    window.addEventListener('beforeunload', () => {
        clearInterval(timeTracker);
        trackEvent('page_exit', {
            event_category: 'engagement',
            value: timeOnPage
        });
    });
}

// Generic event tracking function
function trackEvent(eventName, parameters = {}) {
    // Google Analytics 4 (gtag)
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, parameters);
    }
    
    // Facebook Pixel
    if (typeof fbq !== 'undefined') {
        fbq('track', eventName, parameters);
    }
    
    // Custom analytics
    console.log('Event tracked:', eventName, parameters);
    
    // You can add other analytics services here
    // Example: Mixpanel, Segment, etc.
}

// Performance monitoring
function initializePerformanceMonitoring() {
    // Monitor page load performance
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            if (perfData) {
                trackEvent('performance', {
                    event_category: 'site_performance',
                    load_time: Math.round(perfData.loadEventEnd - perfData.loadEventStart),
                    dom_content_loaded: Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart),
                    first_paint: Math.round(performance.getEntriesByType('paint')[0]?.startTime || 0)
                });
            }
        }, 0);
    });
}

// Call performance monitoring
initializePerformanceMonitoring();

// Lazy loading for images (if needed)
function initializeLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
    trackEvent('javascript_error', {
        event_category: 'error',
        error_message: e.message,
        error_filename: e.filename,
        error_lineno: e.lineno
    });
});

// Page visibility API for tracking user engagement
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        trackEvent('page_hidden', {
            event_category: 'engagement'
        });
    } else {
        trackEvent('page_visible', {
            event_category: 'engagement'
        });
    }
});

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Optimize scroll events
window.addEventListener('scroll', throttle(function() {
    // Scroll-based logic here is already optimized
}, 100));

// Add loading states for CTA buttons
document.querySelectorAll('.cta-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        // Don't add loading state for external links
        if (this.href && this.href.includes('http')) {
            return;
        }
        
        const originalText = this.innerHTML;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        this.style.pointerEvents = 'none';
        
        // Simulate loading (remove this in production)
        setTimeout(() => {
            this.innerHTML = originalText;
            this.style.pointerEvents = 'auto';
        }, 2000);
    });
});

// Feature detection and polyfills
if (!window.IntersectionObserver) {
    // Fallback for browsers without IntersectionObserver
    console.warn('IntersectionObserver not supported, animations disabled');
}

if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback) {
        return setTimeout(callback, 1000 / 60);
    };
}

// Cookie Consent Management
function initializeCookieConsent() {
    const cookieConsent = document.getElementById('cookieConsent');
    
    // Set up button event listeners
    const acceptBtn = document.querySelector('.cookie-btn.accept');
    const customizeBtn = document.querySelector('.cookie-btn.customize');
    const declineBtn = document.querySelector('.cookie-btn.decline');
    
    if (acceptBtn) {
        acceptBtn.addEventListener('click', acceptCookies);
    }
    if (customizeBtn) {
        customizeBtn.addEventListener('click', customizeCookies);
    }
    if (declineBtn) {
        declineBtn.addEventListener('click', declineCookies);
    }
    
    // Check if user has already made a choice
    const cookieChoice = localStorage.getItem('cookieConsent');
    
    if (!cookieChoice) {
        // Show banner after 2 seconds
        setTimeout(() => {
            if (cookieConsent) {
                cookieConsent.classList.add('show');
            }
        }, 2000);
    } else {
        // Apply previous choice
        if (cookieChoice === 'accepted') {
            enableAllCookies();
        }
    }
}

function acceptCookies() {
    localStorage.setItem('cookieConsent', 'accepted');
    document.getElementById('cookieConsent').classList.remove('show');
    enableAllCookies();
    
    // Show success notification
    showNotification('✅ Cookie preferences saved. All cookies enabled for better experience.', 'success');
    
    trackEvent('cookie_consent', {
        event_category: 'compliance',
        consent_type: 'accepted'
    });
}

function customizeCookies() {
    // For now, redirect to privacy policy
    // In a full implementation, you'd show a detailed cookie settings modal
    localStorage.setItem('cookieConsent', 'customized');
    document.getElementById('cookieConsent').classList.remove('show');
    
    // Show elegant notification instead of alert
    showNotification(
        'Cookie customization coming soon. Only essential cookies are enabled for now. View our <a href="privacy-policy.html" style="color: #1DBF73; text-decoration: underline;">Privacy Policy</a> for details.',
        'info'
    );
    
    trackEvent('cookie_consent', {
        event_category: 'compliance',
        consent_type: 'customized'
    });
}

function declineCookies() {
    localStorage.setItem('cookieConsent', 'declined');
    document.getElementById('cookieConsent').classList.remove('show');
    
    // Disable non-essential cookies
    disableNonEssentialCookies();
    
    // Show informative notification
    showNotification('Cookie preferences saved. Only essential cookies are enabled.', 'info');
    
    trackEvent('cookie_consent', {
        event_category: 'compliance',
        consent_type: 'declined'
    });
}

function enableAllCookies() {
    // Enable Google Analytics and other tracking
    if (typeof gtag !== 'undefined') {
        gtag('consent', 'update', {
            'analytics_storage': 'granted',
            'ad_storage': 'granted',
            'functionality_storage': 'granted',
            'personalization_storage': 'granted'
        });
    }
}

function disableNonEssentialCookies() {
    // Disable non-essential tracking
    if (typeof gtag !== 'undefined') {
        gtag('consent', 'update', {
            'analytics_storage': 'denied',
            'ad_storage': 'denied',
            'functionality_storage': 'denied',
            'personalization_storage': 'denied'
        });
    }
}

// Enhanced Conversion Tracking System
function initializeConversionTracking() {
    // Define conversion button mapping
    const conversionButtons = {
        // Primary CTAs (highest value)
        primary_cta: {
            selectors: [
                'a[href*="go.fiverr.com"][class*="cta-btn primary large"]', // Hero main CTA
                'a[href*="go.fiverr.com"][class*="cta-btn primary extra-large"]', // Final CTA
                'a[href*="go.fiverr.com"][class*="pricing-btn"]' // Pricing CTAs
            ],
            value: 10,
            category: 'high_intent_conversion'
        },
        
        // Secondary CTAs (medium value)
        secondary_cta: {
            selectors: [
                'a[href*="go.fiverr.com"][class*="cta-btn secondary"]', // Problem section CTA
                'a[href*="go.fiverr.com"][class*="cta-btn-header"]', // Header CTA
                'a[href*="go.fiverr.com"][class*="feature-cta"]', // Feature CTAs
                'a[href*="go.fiverr.com"][class*="step-cta"]' // How it works CTAs
            ],
            value: 7,
            category: 'medium_intent_conversion'
        },
        
        // Navigation/Engagement (lower value but important for funnel)
        engagement: {
            selectors: [
                '.play-btn', // Video play button
                '.faq-question', // FAQ toggles
                '.mobile-menu-toggle', // Mobile menu
                'a[href^="#"]' // Internal anchor links
            ],
            value: 3,
            category: 'user_engagement'
        }
    };
    
    // Track all conversion buttons
    Object.entries(conversionButtons).forEach(([buttonType, config]) => {
        config.selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(element => {
                trackButtonClicks(element, buttonType, config);
            });
        });
    });
    
    // Track form interactions
    trackFormInteractions();
    
    // Track video engagement
    trackVideoEngagement();
    
    // Track scroll milestones for conversion optimization
    trackScrollMilestones();
}

function trackButtonClicks(element, buttonType, config) {
    element.addEventListener('click', function(e) {
        const buttonText = this.textContent.trim();
        const buttonHref = this.href || '';
        const section = getPageSection(this);
        const isExternalLink = buttonHref.includes('go.fiverr.com');
        
        // Create detailed event data
        const eventData = {
            event_category: config.category,
            event_label: buttonText,
            value: config.value,
            button_type: buttonType,
            page_section: section,
            button_position: getElementPosition(this),
            is_conversion: isExternalLink,
            destination_url: buttonHref
        };
        
        // Track the event
        trackButtonClick(buttonType, eventData);
        
        // For external Fiverr Pro links, track as conversion
        if (isExternalLink) {
            trackConversion(buttonText, section, config.value);
        }
        
        // Add visual feedback for better UX
        addClickFeedback(this);
    });
}

function trackButtonClick(buttonType, eventData) {
    // Main tracking event
    trackEvent('button_click', eventData);
    
    // Additional conversion-specific tracking
    if (eventData.is_conversion) {
        trackEvent('fiverr_pro_click', {
            event_category: 'conversion',
            event_label: eventData.event_label,
            value: eventData.value,
            section: eventData.page_section
        });
        
        // Enhanced e-commerce tracking for GA4
        trackEvent('generate_lead', {
            event_category: 'conversion',
            currency: 'USD',
            value: eventData.value,
            lead_source: 'fiverr_pro_cta',
            button_text: eventData.event_label,
            page_section: eventData.page_section
        });
    }
}

function trackConversion(buttonText, section, value) {
    // Primary conversion event
    trackEvent('conversion', {
        event_category: 'goal_completion',
        event_label: `${section}_${buttonText}`,
        value: value,
        conversion_type: 'fiverr_pro_referral'
    });
    
    // Google Ads conversion tracking (if conversion ID is set)
    if (typeof gtag !== 'undefined') {
        gtag('event', 'conversion', {
            'send_to': 'AW-CONVERSION_ID/CONVERSION_LABEL', // Replace with actual values
            'value': value,
            'currency': 'USD',
            'transaction_id': Date.now().toString()
        });
    }
    
    // Facebook Pixel conversion
    if (typeof fbq !== 'undefined') {
        fbq('track', 'Lead', {
            value: value,
            currency: 'USD',
            content_name: buttonText,
            content_category: section
        });
    }
}

function trackFormInteractions() {
    // Track form focus events
    document.querySelectorAll('input, textarea, select').forEach(field => {
        field.addEventListener('focus', function() {
            trackEvent('form_field_focus', {
                event_category: 'lead_generation',
                field_name: this.name || this.id,
                field_type: this.type
            });
        });
        
        // Track form completion progress
        field.addEventListener('blur', function() {
            if (this.value) {
                trackEvent('form_field_complete', {
                    event_category: 'lead_generation',
                    field_name: this.name || this.id,
                    progress: calculateFormProgress(this.form)
                });
            }
        });
    });
}

function trackVideoEngagement() {
    document.querySelectorAll('.play-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            trackEvent('video_play', {
                event_category: 'engagement',
                event_label: 'success_stories_video',
                value: 5
            });
        });
    });
    
    // Track video modal interactions
    const videoModal = document.getElementById('videoModal');
    if (videoModal) {
        videoModal.addEventListener('click', function(e) {
            if (e.target === this) {
                trackEvent('video_close', {
                    event_category: 'engagement',
                    event_label: 'modal_background_click'
                });
            }
        });
    }
}

function trackScrollMilestones() {
    const sections = [
        { name: 'hero', threshold: 10 },
        { name: 'problem', threshold: 25 },
        { name: 'solution', threshold: 40 },
        { name: 'testimonials', threshold: 60 },
        { name: 'pricing', threshold: 80 },
        { name: 'final_cta', threshold: 95 }
    ];
    
    let trackedMilestones = new Set();
    
    window.addEventListener('scroll', throttle(() => {
        const scrollPercent = Math.round(
            (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
        );
        
        sections.forEach(section => {
            const milestoneKey = `${section.name}_${section.threshold}`;
            if (scrollPercent >= section.threshold && !trackedMilestones.has(milestoneKey)) {
                trackedMilestones.add(milestoneKey);
                
                trackEvent('scroll_milestone', {
                    event_category: 'engagement',
                    event_label: section.name,
                    value: section.threshold,
                    scroll_depth: scrollPercent
                });
            }
        });
    }, 500));
}

// Utility functions for tracking
function getPageSection(element) {
    const section = element.closest('section');
    if (section) {
        const className = section.className;
        if (className.includes('hero')) return 'hero';
        if (className.includes('problem')) return 'problem';
        if (className.includes('solution')) return 'solution';
        if (className.includes('social-proof')) return 'testimonials';
        if (className.includes('pricing')) return 'pricing';
        if (className.includes('how-it-works')) return 'how_it_works';
        if (className.includes('faq')) return 'faq';
        if (className.includes('final-cta')) return 'final_cta';
    }
    
    const header = element.closest('header');
    if (header) return 'header';
    
    const footer = element.closest('footer');
    if (footer) return 'footer';
    
    return 'unknown';
}

function getElementPosition(element) {
    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const position = rect.top / viewportHeight;
    
    if (position < 0.3) return 'above_fold';
    if (position < 0.7) return 'mid_fold';
    return 'below_fold';
}

function calculateFormProgress(form) {
    if (!form) return 0;
    const fields = form.querySelectorAll('input[required], textarea[required], select[required]');
    const completed = form.querySelectorAll('input[required]:valid, textarea[required]:valid, select[required]:valid');
    return Math.round((completed.length / fields.length) * 100);
}

function addClickFeedback(element) {
    // Add subtle visual feedback
    element.style.transform = 'scale(0.95)';
    element.style.transition = 'transform 0.1s ease';
    
    setTimeout(() => {
        element.style.transform = 'scale(1)';
        setTimeout(() => {
            element.style.transform = '';
            element.style.transition = '';
        }, 100);
    }, 100);
}

// Advanced tracking for user behavior patterns
function trackUserBehaviorPatterns() {
    let mouseMovements = 0;
    let clicks = 0;
    let keystrokes = 0;
    
    document.addEventListener('mousemove', throttle(() => {
        mouseMovements++;
    }, 1000));
    
    document.addEventListener('click', () => {
        clicks++;
    });
    
    document.addEventListener('keydown', () => {
        keystrokes++;
    });
    
    // Send behavior data every 30 seconds
    setInterval(() => {
        if (mouseMovements > 0 || clicks > 0 || keystrokes > 0) {
            trackEvent('user_behavior', {
                event_category: 'engagement',
                mouse_movements: mouseMovements,
                clicks: clicks,
                keystrokes: keystrokes
            });
            
            // Reset counters
            mouseMovements = clicks = keystrokes = 0;
        }
    }, 30000);
}

// Initialize advanced tracking
trackUserBehaviorPatterns();

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        trackEvent,
        trackButtonClick,
        trackConversion,
        showNotification,
        nextTestimonial,
        previousTestimonial,
        toggleFAQ,
        acceptCookies,
        declineCookies,
        initializeConversionTracking
    };
}