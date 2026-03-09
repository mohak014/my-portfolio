/**
 * Mohak Srivastava Portfolio - JavaScript
 * Premium, Modern Portfolio Interactions
 * Batman Theme Edition
 * Cross-platform compatible (Mobile, Mac, Windows)
 */

// Feature detection
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons with error handling
    try {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    } catch (e) {
        console.warn('Lucide icons failed to load:', e);
    }

    // Initialize all modules
    initNavbar();
    initScrollAnimations();
    initSmoothScroll();

    // Only initialize parallax on non-touch devices
    if (!isTouchDevice && !prefersReducedMotion.matches) {
        initParallaxEffects();
    }

    // Only initialize hover effects on non-touch devices
    if (!isTouchDevice) {
        initHoverEffects();
    }

    // Fix iOS 100vh issue
    if (isIOS) {
        fixIOSViewportHeight();
    }
});

/**
 * Fix iOS 100vh issue
 * iOS Safari doesn't correctly calculate 100vh
 */
function fixIOSViewportHeight() {
    const setVH = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVH();
    window.addEventListener('resize', debounce(setVH, 100));
    window.addEventListener('orientationchange', () => {
        setTimeout(setVH, 100);
    });
}

/**
 * Navbar Functionality
 * - Sticky behavior with scroll detection
 * - Mobile menu toggle
 * - Active link highlighting
 */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (!navbar || !navToggle || !navMenu) return;

    // Scroll behavior
    let lastScroll = 0;
    const scrollThreshold = 50;
    let ticking = false;

    function handleScroll() {
        const currentScroll = window.scrollY || window.pageYOffset;

        // Add scrolled class for styling
        if (currentScroll > scrollThreshold) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    }

    // Mobile menu toggle
    function toggleMenu(e) {
        if (e) e.preventDefault();

        const isActive = navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
        navToggle.setAttribute('aria-expanded', String(isActive));

        // Prevent body scroll when menu is open
        if (isActive) {
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
            document.body.style.top = `-${window.scrollY}px`;
        } else {
            const scrollY = document.body.style.top;
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
            document.body.style.top = '';
            window.scrollTo(0, parseInt(scrollY || '0') * -1);
        }
    }

    // Close menu on link click
    function closeMenu() {
        if (!navMenu.classList.contains('active')) return;

        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');

        const scrollY = document.body.style.top;
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.top = '';
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }

    // Update active link based on scroll position
    function updateActiveLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPosition = (window.scrollY || window.pageYOffset) + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    // Optimized scroll handler using requestAnimationFrame
    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(() => {
                handleScroll();
                updateActiveLink();
                ticking = false;
            });
            ticking = true;
        }
    }

    // Event listeners
    window.addEventListener('scroll', onScroll, { passive: true });

    // Support both click and touch events
    navToggle.addEventListener('click', toggleMenu);
    if (isTouchDevice) {
        navToggle.addEventListener('touchend', (e) => {
            e.preventDefault();
            toggleMenu(e);
        }, { passive: false });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
            closeMenu();
        }
    });

    // Close menu on outside click/touch
    document.addEventListener('click', (e) => {
        if (navMenu.classList.contains('active') &&
            !navMenu.contains(e.target) &&
            !navToggle.contains(e.target)) {
            closeMenu();
        }
    });

    // Handle orientation change
    window.addEventListener('orientationchange', () => {
        setTimeout(closeMenu, 100);
    });

    // Initialize
    handleScroll();
}

/**
 * Scroll Animations
 * - Intersection Observer for reveal animations
 * - Staggered animations for grouped elements
 */
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    // Skip animations if user prefers reduced motion
    if (prefersReducedMotion.matches) {
        animatedElements.forEach(element => {
            element.classList.add('visible');
        });
        return;
    }

    if ('IntersectionObserver' in window) {
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -50px 0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    // Add staggered delay for grouped items
                    const delay = entry.target.dataset.delay || 0;

                    // Use setTimeout for better cross-browser compatibility
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, delay * 100);

                    // Unobserve after animation
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe each element with staggered delays
        animatedElements.forEach((element, index) => {
            // Add index-based delay for siblings
            const parent = element.parentElement;
            if (parent) {
                const siblings = parent.querySelectorAll('.animate-on-scroll');
                const siblingIndex = Array.from(siblings).indexOf(element);
                element.dataset.delay = siblingIndex;
            }

            observer.observe(element);
        });
    } else {
        // Fallback for older browsers
        animatedElements.forEach(element => {
            element.classList.add('visible');
        });
    }
}

/**
 * Smooth Scroll
 * - Enhanced smooth scrolling for anchor links
 * - Cross-browser compatible
 */
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    const navbarHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--navbar-height')) || 72;

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');

            if (href === '#' || href === '#!') return;

            const target = document.querySelector(href);

            if (target) {
                e.preventDefault();

                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight;

                // Use native smooth scroll if supported
                if ('scrollBehavior' in document.documentElement.style) {
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                } else {
                    // Fallback for browsers without smooth scroll support
                    smoothScrollTo(targetPosition, 600);
                }

                // Update URL without scroll
                if (history.pushState) {
                    history.pushState(null, '', href);
                }
            }
        });
    });
}

/**
 * Fallback smooth scroll function
 */
function smoothScrollTo(targetPosition, duration) {
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;

    function easeInOutCubic(t) {
        return t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        const easeProgress = easeInOutCubic(progress);

        window.scrollTo(0, startPosition + distance * easeProgress);

        if (timeElapsed < duration) {
            requestAnimationFrame(animation);
        }
    }

    requestAnimationFrame(animation);
}

/**
 * Parallax Effects
 * - Subtle parallax on hero shapes
 * - Mouse-following effects
 * - Desktop only
 */
function initParallaxEffects() {
    const shapes = document.querySelectorAll('.shape');
    const heroCards = document.querySelectorAll('.hero-card');

    if (shapes.length === 0 && heroCards.length === 0) return;
    if (window.innerWidth <= 1024) return;

    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    let animationId = null;

    // Smooth mouse tracking
    function handleMouseMove(e) {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    }

    document.addEventListener('mousemove', handleMouseMove, { passive: true });

    function animate() {
        // Smooth interpolation
        targetX += (mouseX - targetX) * 0.05;
        targetY += (mouseY - targetY) * 0.05;

        // Apply parallax to shapes
        shapes.forEach((shape, index) => {
            const speed = (index + 1) * 10;
            const x = targetX * speed;
            const y = targetY * speed;
            shape.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        });

        // Subtle tilt on hero cards
        heroCards.forEach((card) => {
            const speed = 3;
            const rotateX = targetY * speed;
            const rotateY = -targetX * speed;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        animationId = requestAnimationFrame(animate);
    }

    animate();

    // Reset on resize
    function handleResize() {
        if (window.innerWidth <= 1024) {
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
            shapes.forEach(shape => {
                shape.style.transform = '';
            });
            heroCards.forEach(card => {
                card.style.transform = '';
            });
            document.removeEventListener('mousemove', handleMouseMove);
        }
    }

    window.addEventListener('resize', debounce(handleResize, 250));
}

/**
 * Hover Effects
 * - Magnetic button effect
 * - Card glow effects
 * - Desktop only
 */
function initHoverEffects() {
    // Skip on touch devices
    if (isTouchDevice) return;

    // Magnetic effect for buttons
    const buttons = document.querySelectorAll('.btn');

    buttons.forEach(button => {
        button.addEventListener('mousemove', (e) => {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            button.style.transform = `translate3d(${x * 0.15}px, ${y * 0.15}px, 0)`;
        }, { passive: true });

        button.addEventListener('mouseleave', () => {
            button.style.transform = '';
        });
    });

    // Glow effect following cursor on cards
    const cards = document.querySelectorAll('.achievement-card, .skills-category, .highlight-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        }, { passive: true });
    });
}

/**
 * Utility: Debounce function
 * - Limits how often a function can be called
 */
function debounce(func, wait = 10) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Utility: Throttle function
 * - Ensures function is called at most once per interval
 */
function throttle(func, limit = 100) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Handle page visibility changes
 * - Pause animations when page is not visible
 */
document.addEventListener('visibilitychange', () => {
    const shapes = document.querySelectorAll('.shape');
    shapes.forEach(shape => {
        shape.style.animationPlayState = document.hidden ? 'paused' : 'running';
    });
});

/**
 * Prefers Reduced Motion
 * - Respect user's motion preferences
 */
if (prefersReducedMotion.matches) {
    document.documentElement.style.setProperty('--transition-fast', '0ms');
    document.documentElement.style.setProperty('--transition-base', '0ms');
    document.documentElement.style.setProperty('--transition-slow', '0ms');
    document.documentElement.style.setProperty('--transition-bounce', '0ms');
    document.documentElement.style.setProperty('--transition-smooth', '0ms');

    // Disable floating animations
    const shapes = document.querySelectorAll('.shape');
    shapes.forEach(shape => {
        shape.style.animation = 'none';
    });
}

// Listen for changes in reduced motion preference
prefersReducedMotion.addEventListener('change', (e) => {
    if (e.matches) {
        document.documentElement.style.setProperty('--transition-fast', '0ms');
        document.documentElement.style.setProperty('--transition-base', '0ms');
        document.documentElement.style.setProperty('--transition-slow', '0ms');
        document.documentElement.style.setProperty('--transition-bounce', '0ms');
        document.documentElement.style.setProperty('--transition-smooth', '0ms');
    } else {
        // Restore default transitions
        document.documentElement.style.setProperty('--transition-fast', '150ms cubic-bezier(0.4, 0, 0.2, 1)');
        document.documentElement.style.setProperty('--transition-base', '300ms cubic-bezier(0.4, 0, 0.2, 1)');
        document.documentElement.style.setProperty('--transition-slow', '500ms cubic-bezier(0.4, 0, 0.2, 1)');
        document.documentElement.style.setProperty('--transition-bounce', '500ms cubic-bezier(0.34, 1.56, 0.64, 1)');
        document.documentElement.style.setProperty('--transition-smooth', '400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)');
    }
});

/**
 * Console Easter Egg - Batman Theme
 */
console.log(
    '%c🦇 Welcome to the Batcave',
    'font-size: 24px; font-weight: bold; color: #F6C744; background: #0A0A0B; padding: 10px 20px; border-radius: 8px;'
);
console.log(
    '%cInterested in connecting? Reach out at mohak014@gmail.com',
    'font-size: 14px; color: #A1A1AA;'
);
