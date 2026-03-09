/**
 * Mohak Srivastava Portfolio - JavaScript
 * Premium, Modern Portfolio Interactions
 * Batman Theme Edition
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    lucide.createIcons();

    // Initialize all modules
    initNavbar();
    initScrollAnimations();
    initSmoothScroll();
    initParallaxEffects();
    initHoverEffects();
});

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

    // Scroll behavior
    let lastScroll = 0;
    const scrollThreshold = 50;

    function handleScroll() {
        const currentScroll = window.scrollY;

        // Add scrolled class for styling
        if (currentScroll > scrollThreshold) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    }

    // Mobile menu toggle
    function toggleMenu() {
        const isActive = navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
        navToggle.setAttribute('aria-expanded', isActive);
        document.body.style.overflow = isActive ? 'hidden' : '';
    }

    // Close menu on link click
    function closeMenu() {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    // Update active link based on scroll position
    function updateActiveLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPosition = window.scrollY + 100;

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

    // Event listeners with throttle for performance
    window.addEventListener('scroll', throttle(() => {
        handleScroll();
        updateActiveLink();
    }, 16), { passive: true });

    navToggle.addEventListener('click', toggleMenu);

    navLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
            closeMenu();
        }
    });

    // Close menu on outside click
    document.addEventListener('click', (e) => {
        if (navMenu.classList.contains('active') &&
            !navMenu.contains(e.target) &&
            !navToggle.contains(e.target)) {
            closeMenu();
        }
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

    if ('IntersectionObserver' in window) {
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -80px 0px',
            threshold: 0.15
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    // Add staggered delay for grouped items
                    const delay = entry.target.dataset.delay || 0;

                    requestAnimationFrame(() => {
                        setTimeout(() => {
                            entry.target.classList.add('visible');
                        }, delay * 120);
                    });

                    // Unobserve after animation
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe each element with staggered delays
        animatedElements.forEach((element, index) => {
            // Add index-based delay for siblings
            const parent = element.parentElement;
            const siblings = parent.querySelectorAll('.animate-on-scroll');
            const siblingIndex = Array.from(siblings).indexOf(element);
            element.dataset.delay = siblingIndex;

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
 * - Custom easing function
 */
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    const navbarHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--navbar-height')) || 72;

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');

            if (href === '#') return;

            const target = document.querySelector(href);

            if (target) {
                e.preventDefault();

                const targetPosition = target.offsetTop - navbarHeight;
                const startPosition = window.scrollY;
                const distance = targetPosition - startPosition;
                const duration = Math.min(Math.abs(distance) * 0.5, 1000); // Dynamic duration based on distance
                let start = null;

                // Custom easing function (easeInOutCubic)
                function easeInOutCubic(t) {
                    return t < 0.5
                        ? 4 * t * t * t
                        : 1 - Math.pow(-2 * t + 2, 3) / 2;
                }

                function animation(currentTime) {
                    if (start === null) start = currentTime;
                    const timeElapsed = currentTime - start;
                    const progress = Math.min(timeElapsed / duration, 1);
                    const easeProgress = easeInOutCubic(progress);

                    window.scrollTo(0, startPosition + distance * easeProgress);

                    if (timeElapsed < duration) {
                        requestAnimationFrame(animation);
                    }
                }

                requestAnimationFrame(animation);

                // Update URL without scroll
                history.pushState(null, null, href);
            }
        });
    });
}

/**
 * Parallax Effects
 * - Subtle parallax on hero shapes
 * - Mouse-following effects
 */
function initParallaxEffects() {
    const shapes = document.querySelectorAll('.shape');
    const heroCards = document.querySelectorAll('.hero-card');

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return; // Skip parallax for users who prefer reduced motion
    }

    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    // Smooth mouse tracking
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    function animate() {
        // Smooth interpolation
        targetX += (mouseX - targetX) * 0.05;
        targetY += (mouseY - targetY) * 0.05;

        // Apply parallax to shapes
        shapes.forEach((shape, index) => {
            const speed = (index + 1) * 10;
            const x = targetX * speed;
            const y = targetY * speed;
            shape.style.transform = `translate(${x}px, ${y}px)`;
        });

        // Subtle tilt on hero cards
        heroCards.forEach((card, index) => {
            const speed = 3;
            const rotateX = targetY * speed;
            const rotateY = -targetX * speed;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        requestAnimationFrame(animate);
    }

    // Only run parallax on desktop
    if (window.innerWidth > 1024) {
        animate();
    }

    // Reset on resize
    window.addEventListener('resize', debounce(() => {
        if (window.innerWidth <= 1024) {
            shapes.forEach(shape => {
                shape.style.transform = '';
            });
            heroCards.forEach(card => {
                card.style.transform = '';
            });
        }
    }, 250));
}

/**
 * Hover Effects
 * - Magnetic button effect
 * - Card tilt effects
 */
function initHoverEffects() {
    // Magnetic effect for buttons
    const buttons = document.querySelectorAll('.btn');

    buttons.forEach(button => {
        button.addEventListener('mousemove', (e) => {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            button.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
        });

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
        });
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
            func(...args);
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
            func(...args);
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
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

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
