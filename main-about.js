const mainMenu = document.querySelector('.mainMenu');
const closeMenu = document.querySelector('.closeMenu');
const openMenu = document.querySelector('.openMenu');
const menuItems = document.querySelectorAll('.mainMenu-links a');
const mainMenuBrand = document.querySelector('.mainMenu-brand');
const ANIM_TIME = 450;

let menuClosing = false;

function showMenu() {
    if (!mainMenu || !openMenu || menuClosing) return;

    mainMenu.classList.remove('is-closing');
    mainMenu.classList.add('is-open');
    mainMenu.setAttribute('aria-hidden', 'false');
    openMenu.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
}

function closeMenuOverlay(callback) {
    if (!mainMenu || !openMenu || menuClosing) {
        if (typeof callback === 'function') callback();
        return;
    }

    menuClosing = true;
    mainMenu.classList.remove('is-open');
    mainMenu.classList.add('is-closing');
    mainMenu.setAttribute('aria-hidden', 'true');
    openMenu.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');

    setTimeout(() => {
        mainMenu.classList.remove('is-closing');
        menuClosing = false;

        if (typeof callback === 'function') callback();

        if (window.ScrollTrigger) {
            setTimeout(() => {
                ScrollTrigger.refresh(true);
            }, 60);
        }
    }, ANIM_TIME);
}

if (openMenu) {
    openMenu.addEventListener('click', showMenu);
}

if (closeMenu) {
    closeMenu.addEventListener('click', () => {
        closeMenuOverlay();
    });
}

menuItems.forEach((item) => {
    item.addEventListener('click', function (e) {
        const href = this.getAttribute('href');

        if (!href) {
            closeMenuOverlay();
            return;
        }

        e.preventDefault();

        closeMenuOverlay(() => {
            if (href.startsWith('#')) {
                const target = document.querySelector(href);

                if (target) {
                    const targetTop = target.getBoundingClientRect().top + window.pageYOffset;

                    window.scrollTo({
                        top: targetTop,
                        behavior: 'auto'
                    });

                    if (window.ScrollTrigger) {
                        setTimeout(() => {
                            ScrollTrigger.refresh(true);
                        }, 60);
                    }
                } else {
                    window.location.hash = href;

                    if (window.ScrollTrigger) {
                        setTimeout(() => {
                            ScrollTrigger.refresh(true);
                        }, 60);
                    }
                }
            } else {
                window.location.href = href;
            }
        });
    });
});

if (mainMenuBrand) {
    mainMenuBrand.addEventListener('click', function (e) {
        const currentPath = window.location.pathname;
        const isHomepage =
            currentPath.endsWith('index.html') ||
            currentPath === '/' ||
            currentPath.endsWith('/');

        e.preventDefault();

        closeMenuOverlay(() => {
            if (isHomepage) {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });

                if (window.ScrollTrigger) {
                    setTimeout(() => {
                        ScrollTrigger.refresh(true);
                    }, 60);
                }
            } else {
                window.location.href = 'index.html';
            }
        });
    });
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mainMenu && mainMenu.classList.contains('is-open')) {
        closeMenuOverlay();
    }
});

import { initAboutScene } from './scene/app.js';

async function bootAboutPage() {
  await initAboutScene();

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.body.classList.remove('about-is-entering');
    });
  });
}

bootAboutPage();