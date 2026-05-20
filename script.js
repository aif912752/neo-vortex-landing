gsap.registerPlugin(ScrollTrigger);

/* --- SMOOTH SCROLL (LENIS) --- */
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
})

function raf(time) {
    lenis.raf(time)
    requestAnimationFrame(raf)
}
requestAnimationFrame(raf)

// Sync ScrollTrigger with Lenis
lenis.on('scroll', ScrollTrigger.update)

// Smooth scroll for nav links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        lenis.scrollTo(targetId, {
            offset: 0,
            duration: 1.5,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
        });
    });
});

/* --- CONFIGURATOR --- */
// Preload all car images on page load
const carImages = {
    'CYAN': './assets/car-base-cyan.png',
    'PURPLE': './assets/car-base-purple.png',
    'OBSIDIAN': './assets/car-base-obsidian.png'
};

// Preload function
const preloadImages = () => {
    Object.values(carImages).forEach(src => {
        const img = new Image();
        img.src = src;
    });
};

window.changeColor = (name, hex, imgPath) => {
    const img = document.getElementById('car-preview');
    const title = document.getElementById('color-name');
    const glow = document.getElementById('glow-bg');

    // Preload the new image first
    const tempImg = new Image();

    tempImg.onload = () => {
        // Image loaded successfully, now animate the transition
        gsap.to(img, {
            opacity: 0,
            scale: 0.98,
            duration: 0.25,
            ease: "power2.in",
            onComplete: () => {
                img.src = imgPath;
                title.innerText = name;
                title.style.color = hex;
                gsap.to(glow, { backgroundColor: hex, duration: 0.5 });

                // Fade in with smooth easing
                gsap.to(img, {
                    opacity: 1,
                    scale: 1,
                    duration: 0.4,
                    ease: "power2.out"
                });
            }
        });
    };

    tempImg.onerror = () => {
        // Image doesn't exist, use fallback
        console.warn(`Image not found: ${imgPath}, using fallback`);
        gsap.to(img, {
            opacity: 0,
            scale: 0.98,
            duration: 0.25,
            ease: "power2.in",
            onComplete: () => {
                img.src = `https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1200&blend=${hex.replace('#', '')}&blend-mode=multiply`;
                title.innerText = name;
                title.style.color = hex;
                gsap.to(glow, { backgroundColor: hex, duration: 0.5 });
                gsap.to(img, {
                    opacity: 1,
                    scale: 1,
                    duration: 0.4,
                    ease: "power2.out"
                });
            }
        });
    };

    tempImg.src = imgPath;
};

/* --- THREE.JS PARTICLES --- */
const initThree = () => {
    const canvas = document.querySelector('#bg-canvas');
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 3;

    const geo = new THREE.BufferGeometry();
    const count = 5000;
    const pos = new Float32Array(count * 3);
    for(let i=0; i<count*3; i++) pos[i] = (Math.random() - 0.5) * 10;
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ size: 0.005, color: 0x00F2FE, transparent: true, opacity: 0.3 });
    const points = new THREE.Points(geo, mat);
    scene.add(points);

    function animate() {
        requestAnimationFrame(animate);
        points.rotation.y += 0.0005;
        renderer.render(scene, camera);
    }
    animate();
};

/* --- CURSOR --- */
const initCursor = () => {
    // Only initialize custom cursor on desktop devices
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        const dot = document.querySelector('#cursor-dot');
        const frame = document.querySelector('#cursor-frame');
        window.addEventListener('mousemove', e => {
            gsap.to(dot, { x: e.clientX, y: e.clientY, duration: 0.1 });
            gsap.to(frame, { x: e.clientX, y: e.clientY, duration: 0.4, ease: "power2.out" });
        });
        document.querySelectorAll('a, button, input').forEach(el => {
            el.addEventListener('mouseenter', () => gsap.to(frame, { scale: 1.8, backgroundColor: 'rgba(0,242,254,0.1)', borderColor: '#00F2FE' }));
            el.addEventListener('mouseleave', () => gsap.to(frame, { scale: 1, backgroundColor: 'transparent', borderColor: 'rgba(0,242,254,0.5)' }));
        });
    }
};

/* --- GSAP ANIMATIONS --- */
const initAnims = () => {
    // Hero
    const heroTl = gsap.timeline();
    heroTl.to(".hero-main-title", { y: 0, duration: 1.5, stagger: 0.2, ease: "expo.out" })
          .to("#hero-pre", { opacity: 0.5, duration: 1 }, "-=1")
          .from(".scroll-line", { scaleY: 0, transformOrigin: "top", duration: 1.5 }, "-=1");

    // Reveal on Scroll
    gsap.utils.toArray(".reveal-up").forEach(el => {
        gsap.from(el, {
            scrollTrigger: { trigger: el, start: "top 90%" },
            y: 100, opacity: 0, duration: 1.2, ease: "power4.out"
        });
    });

    // Parallax BG
    gsap.utils.toArray(".parallax-bg").forEach(el => {
        const speed = el.dataset.speed;
        gsap.to(el, {
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
            y: 100 * speed, ease: "none"
        });
    });

    // Aero Video Floating
    gsap.to(".aero-visual", { y: -30, duration: 3, repeat: -1, yoyo: true, ease: "sine.inOut" });

    // Horizontal Specs
    const specsWrapper = document.querySelector("#specs-wrapper");
    gsap.to(specsWrapper, {
        xPercent: -66.6,
        ease: "none",
        scrollTrigger: {
            trigger: "#specs-container",
            pin: true, scrub: 1,
            end: () => "+=" + specsWrapper.offsetWidth
        }
    });

    // Magnetic Button
    const mBtn = document.querySelector('#magnetic-btn');
    mBtn.addEventListener('mousemove', (e) => {
        const rect = mBtn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width/2;
        const y = e.clientY - rect.top - rect.height/2;
        gsap.to(mBtn, { x: x * 0.2, y: y * 0.2, duration: 0.4 });
    });
    mBtn.addEventListener('mouseleave', () => {
        gsap.to(mBtn, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.3)" });
    });
};

window.onload = () => {
    preloadImages(); // Preload car images for smooth transitions
    initThree();
    initCursor();
    initAnims();
    initMobileMenu();
};

/* --- MOBILE MENU --- */
const initMobileMenu = () => {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenuClose = document.getElementById('mobile-menu-close');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            // Hide hamburger button when menu opens
            mobileMenuBtn.style.display = 'none';

            mobileMenu.classList.remove('hidden');
            mobileMenu.classList.add('flex');

            gsap.fromTo(mobileMenu.children[1].children,
                { y: 50, opacity: 0 },
                { y: 0, opacity: 0.7, duration: 0.4, stagger: 0.1, ease: "power2.out" }
            );
        });

        mobileMenuClose.addEventListener('click', () => {
            gsap.to(mobileMenu, {
                opacity: 0,
                duration: 0.3,
                onComplete: () => {
                    mobileMenu.classList.add('hidden');
                    mobileMenu.classList.remove('flex');
                    mobileMenu.style.opacity = 1;

                    // Show hamburger button again when menu closes
                    mobileMenuBtn.style.display = 'block';
                }
            });
        });

        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                gsap.to(mobileMenu, {
                    opacity: 0,
                    duration: 0.3,
                    onComplete: () => {
                        mobileMenu.classList.add('hidden');
                        mobileMenu.classList.remove('flex');
                        mobileMenu.style.opacity = 1;

                        // Show hamburger button again when menu closes
                        mobileMenuBtn.style.display = 'block';
                    }
                });
            });
        });
    }
};
