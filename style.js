document.addEventListener('DOMContentLoaded', function() {
    loadRandomQuote();
    initSmoothScrolling();
    addScrollAnimations();
    initParallaxEffect();
    updateActiveNav();
});

function loadRandomQuote() {
    const quotes = [
        "my aura is massive",
        "early blue hive propaganda",
        "im sigma",
        "mitochondia, the powerhouse of the cell",
        "im literally fyr bro on everything",
        "you lowk pmo",
        "reload this page and see the typewriting effect i spent an unreasonable amount of time on",
        "get off my profile and go get sum huzz twin",
        "blueberry",
        "no quote for u buddy",
        "HAII POOKIE :3",
        "fuck off my profile page",
        "SDIYBT 🥀",
        "jst Sybau",
        "Hi twin ✌️",
        "SIXXXX SEVENNNN 🗣️"
    ];
    
    const quoteElement = document.getElementById('quote');
    if (quoteElement) {
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

        quoteElement.textContent = '';
        quoteElement.style.opacity = '1';
        
        let i = 0;
        const typeSpeed = 30;
        
        function typeWriter() {
            if (i < randomQuote.length) {
                quoteElement.textContent += randomQuote.charAt(i);
                i++;
                setTimeout(typeWriter, typeSpeed);
            }
        }
        
        setTimeout(typeWriter, 500);
    }
}

function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const target = document.getElementById(targetId);
            
            if (target) {
                const targetPosition = target.offsetTop - 80;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

function addScrollAnimations() {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        },
        {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        }
    );

    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
}

function initParallaxEffect() {
    let ticking = false;
    
    function updateParallax() {
        const scrolled = window.pageYOffset;
        const heroGlow = document.querySelector('.hero::before');
        
        if (heroGlow) {
            const rate = scrolled * -0.5;
            document.documentElement.style.setProperty('--hero-offset', `${rate}px`);
        }
        
        ticking = false;
    }
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    });
}

let ticking = false;
function updateActiveNav() {
    if (!ticking) {
        requestAnimationFrame(() => {
            const sections = document.querySelectorAll('.section[id]');
            const navLinks = document.querySelectorAll('.nav-links a');
            const viewportCenter = window.scrollY + window.innerHeight / 2;

            let closestSection = sections[0];
            let minDistance = Infinity;

            sections.forEach(section => {
                const sectionCenter = section.offsetTop + section.offsetHeight / 2;
                const distance = Math.abs(viewportCenter - sectionCenter);
                if (distance < minDistance) {
                    closestSection = section;
                    minDistance = distance;
                }
            });

            const currentId = closestSection.getAttribute('id');

            navLinks.forEach(link => {
                link.style.color = '';
                link.style.transform = '';
                if (link.getAttribute('href') === '#' + currentId) {
                    link.style.color = 'var(--accent)';
                    link.style.transform = 'translateY(-1px)';
                }
            });

            ticking = false;
        });
        ticking = true;
    }
}

window.addEventListener('scroll', updateActiveNav);

function initMouseTracking() {
    const cards = document.querySelectorAll('.spotify-card, .game-card, .tech-stack span, .links a, .project-card');

    cards.forEach(card => {
        let targetX = 0;
        let targetY = 0;
        let currentX = 0;
        let currentY = 0;

        function updateTransform() {
            currentX += (targetX - currentX) * 0.1;
            currentY += (targetY - currentY) * 0.1;

            card.style.transform = `perspective(1000px) rotateX(${currentX}deg) rotateY(${currentY}deg) translateZ(10px)`;
            requestAnimationFrame(updateTransform);
        }
        requestAnimationFrame(updateTransform);

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            let factor = 10;
            if (card.classList.contains('project-card')) {
                factor = 25;
            }

            targetX = (y - centerY) / factor;
            targetY = (centerX - x) / factor;
        });

        card.addEventListener('mouseleave', () => {
            targetX = 0;
            targetY = 0;
        });
    });
}

setTimeout(initMouseTracking, 1000);

window.profileUtils = {
    loadRandomQuote,
    updateActiveNav
};