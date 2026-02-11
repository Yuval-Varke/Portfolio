/* ===================================================
   YUVAL VARKE — Portfolio Scripts
   Scramble text, scroll reveals, nav behaviour
   =================================================== */

(function () {
    'use strict';

    // ---- Scramble / Decode Text Effect ----
    const scrambleEl = document.getElementById('scramble');
    const phrases = [
        'Full-Stack Developer',
        'Backend Developer',
        'C++ & JavaScript',
        'Python & Machine Learning'
    ];

    const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*!?<>{}[]';
    const RESOLVE_SPEED = 35;       // ms per character resolve
    const SCRAMBLE_CYCLES = 6;      // how many random chars before settling
    const HOLD_DURATION = 2800;     // ms to hold resolved phrase
    const STAGGER = 20;             // ms stagger between characters

    let phraseIdx = 0;

    function randomChar() {
        return CHARS[Math.floor(Math.random() * CHARS.length)];
    }

    function scrambleIn(phrase, onComplete) {
        const len = phrase.length;
        const resolved = new Array(len).fill(false);
        const display = new Array(len).fill('');

        // Initialize all positions with random chars
        for (let i = 0; i < len; i++) {
            display[i] = phrase[i] === ' ' ? '\u00A0' : randomChar();
        }
        scrambleEl.textContent = display.join('');

        let charIndex = 0;

        function resolveNext() {
            if (charIndex >= len) {
                if (onComplete) onComplete();
                return;
            }

            const idx = charIndex;
            charIndex++;

            // Space characters resolve instantly
            if (phrase[idx] === ' ') {
                resolved[idx] = true;
                display[idx] = '\u00A0';
                resolveNext();
                return;
            }

            let cycle = 0;
            const interval = setInterval(() => {
                // Scramble all unresolved characters each tick
                for (let j = 0; j < len; j++) {
                    if (!resolved[j] && phrase[j] !== ' ') {
                        display[j] = randomChar();
                    }
                }

                cycle++;
                if (cycle >= SCRAMBLE_CYCLES) {
                    clearInterval(interval);
                    resolved[idx] = true;
                    display[idx] = phrase[idx];
                }
                scrambleEl.textContent = display.join('');
            }, RESOLVE_SPEED);

            setTimeout(resolveNext, STAGGER + RESOLVE_SPEED);
        }

        resolveNext();
    }

    function scrambleOut(phrase, onComplete) {
        const len = phrase.length;
        const display = phrase.split('').map(c => c === ' ' ? '\u00A0' : c);
        const dissolved = new Array(len).fill(false);

        let charIndex = len - 1;

        function dissolveNext() {
            if (charIndex < 0) {
                scrambleEl.textContent = '';
                if (onComplete) onComplete();
                return;
            }

            const idx = charIndex;
            charIndex--;

            if (phrase[idx] === ' ') {
                dissolved[idx] = true;
                display[idx] = '';
                dissolveNext();
                return;
            }

            let cycle = 0;
            const interval = setInterval(() => {
                cycle++;
                if (cycle >= SCRAMBLE_CYCLES) {
                    clearInterval(interval);
                    display[idx] = '';
                } else {
                    display[idx] = randomChar();
                }

                scrambleEl.textContent = display.join('');
            }, RESOLVE_SPEED);

            dissolved[idx] = true;
            setTimeout(dissolveNext, STAGGER);
        }

        dissolveNext();
    }

    function runCycle() {
        const phrase = phrases[phraseIdx];

        scrambleIn(phrase, () => {
            setTimeout(() => {
                scrambleOut(phrase, () => {
                    phraseIdx = (phraseIdx + 1) % phrases.length;
                    setTimeout(runCycle, 300);
                });
            }, HOLD_DURATION);
        });
    }

    // Start the scramble after page loads
    setTimeout(runCycle, 1200);

    // ---- Scroll-triggered Reveals ----
    const reveals = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal--visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    reveals.forEach((el) => revealObserver.observe(el));

    // ---- Nav scroll state ----
    const nav = document.getElementById('nav');

    function onScroll() {
        const y = window.scrollY;

        // Add/remove scrolled class for border + bg
        if (y > 30) {
            nav.classList.add('nav--scrolled');
        } else {
            nav.classList.remove('nav--scrolled');
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });

    // ---- Active nav link on scroll ----
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav__link');

    const sectionObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navLinks.forEach((link) => {
                        link.classList.remove('nav__link--active');
                        if (link.getAttribute('href') === '#' + id) {
                            link.classList.add('nav__link--active');
                        }
                    });
                }
            });
        },
        { threshold: 0.3, rootMargin: `-${72}px 0px -40% 0px` }
    );

    sections.forEach((s) => sectionObserver.observe(s));

    // ---- Smooth scroll for nav links ----
    navLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                const top = target.offsetTop - 72;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // Also handle CTA buttons
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        if (anchor.classList.contains('nav__link') || anchor.classList.contains('nav__logo')) return;
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                const top = target.offsetTop - 72;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });
    // ---- Contact Form Handling ----
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(contactForm);

            // Show loading state
            const submitBtn = contactForm.querySelector('.form__submit');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Sending...';
            formStatus.textContent = '';
            formStatus.className = 'formStatus';

            try {
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                const data = await response.json();

                if (response.status === 200) {
                    formStatus.textContent = "Thanks! Your message has been sent successfully.";
                    formStatus.classList.add('formStatus--success');
                    contactForm.reset();
                } else {
                    formStatus.textContent = data.message || "Oops! There was a problem submitting your form.";
                    formStatus.classList.add('formStatus--error');
                }
            } catch (error) {
                formStatus.textContent = "Oops! There was a problem submitting your form.";
                formStatus.classList.add('formStatus--error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });
    }
})();
