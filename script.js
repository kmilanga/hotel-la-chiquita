// ── BACK TO TOP BUTTON ──
function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            btn.classList.add('show');
        } else {
            btn.classList.remove('show');
        }
    });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackEvent('back_to_top', { source: 'button' });
    });
}

initBackToTop();

function trackEvent(eventName, params = {}) {
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, params);
    }
}

document.addEventListener('DOMContentLoaded', () => {

    // DATEPICKER DE RANGO — Flatpickr
    
    const dateRangeInput = document.getElementById('dateRange');

    if (dateRangeInput) {
        const hoy = new Date();
        const mañana = new Date(hoy);
        mañana.setDate(hoy.getDate() + 1);

        const hoyISO = hoy.toISOString().split('T')[0];
        const mañanaISO = mañana.toISOString().split('T')[0];

        // Valores iniciales en los inputs ocultos
        document.getElementById('checkin').value = hoyISO;
        document.getElementById('checkout').value = mañanaISO;

        flatpickr(dateRangeInput, {
            mode: 'range',
            minDate: 'today',
            dateFormat: 'd/m/Y',
            defaultDate: [hoyISO, mañanaISO],
            locale: document.documentElement.lang === 'es' ? 'es' : 'default',
            disableMobile: true, // Usa siempre flatpickr en lugar del nativo

            onChange: function (selectedDates) {
                if (selectedDates.length === 2) {
                    const checkin = selectedDates[0].toISOString().split('T')[0];
                    const checkout = selectedDates[1].toISOString().split('T')[0];

                    document.getElementById('checkin').value = checkin;
                    document.getElementById('checkout').value = checkout;
                }
            }
        });
    }

    // LÓGICA DE HUÉSPEDES AL CLICAR EN HABITACIÓN

    const guestSelect = document.getElementById('guests');
    const roomCards = document.querySelectorAll('.room-card');

    roomCards.forEach(card => {
        card.addEventListener('click', () => {
            const maxGuests = card.getAttribute('data-max');

            if (guestSelect) guestSelect.value = maxGuests;

            const navHeight = document.querySelector('nav').offsetHeight;
            const bookingBar = document.querySelector('.booking-bar-container');

            window.scrollTo({
                top: bookingBar.offsetTop - navHeight - 20,
                behavior: 'smooth'
            });

            guestSelect.style.outline = '2px solid #B87333';
            setTimeout(() => guestSelect.style.outline = 'none', 800);

            // Analytics — interés en habitación
            trackEvent('select_item', {
                item_name: card.querySelector('h3').textContent,
                item_category: document.documentElement.lang === 'es' ? 'Habitación' : 'Room'
            });
        });
    });

    // NAVEGACIÓN SUAVE (SMOOTH SCROLL)

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const navHeight = document.querySelector('nav').offsetHeight;
                window.scrollTo({
                    top: targetElement.offsetTop - navHeight - 20,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ANIMACIONES DE APARICIÓN (REVEAL)
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

    // BOTÓN DE RESERVA — ACI Group + tracking GA4 integrado en el mismo listener

    const bookingBtn = document.querySelector('.booking-submit');

    if (bookingBtn) {
        bookingBtn.addEventListener('click', () => {
            const checkin = document.getElementById('checkin').value;
            const checkout = document.getElementById('checkout').value;
            const guests = document.getElementById('guests').value;

            // PENDIENTE: sustituir con los datos de ACI Group
            const BASE_URL = 'PENDIENTE_URL_ACI_GROUP';    // ej: https://booking.acigroup.es/hotel/lachiquita
            const PARAM_CHECKIN = 'PENDIENTE_PARAM_CHECKIN';    // ej: checkin / arrival / date_from
            const PARAM_CHECKOUT = 'PENDIENTE_PARAM_CHECKOUT';   // ej: checkout / departure / date_to
            const PARAM_GUESTS = 'PENDIENTE_PARAM_GUESTS';     // ej: adults / guests / pax

            // Analytics — conversión principal
            trackEvent('begin_checkout', {
                currency: 'EUR',
                checkin,
                checkout,
                guests
            });

            const url = `${BASE_URL}?${PARAM_CHECKIN}=${checkin}&${PARAM_CHECKOUT}=${checkout}&${PARAM_GUESTS}=${guests}`;
            window.open(url, '_blank');
        });
    }

    // MENÚ HAMBURGER
    
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            const isOpen = navLinks.classList.toggle('active');
            navToggle.classList.toggle('active');
            navToggle.setAttribute('aria-expanded', isOpen);
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                navToggle.classList.remove('active');
                navToggle.setAttribute('aria-expanded', false);
            });
        });
    }

    // ANALYTICS GA4 — Función helper + eventos - Clic en enlace del restaurante
    const restauranteLink = document.querySelector('a[href="https://latabernadequini.es/"]');
    if (restauranteLink) {
        restauranteLink.addEventListener('click', () => {
            trackEvent('click_restaurante', {
                destination: 'latabernadequini.es'
            });
        });
    }

    // Scroll depth 50% y 90%
    const scrollMilestones = { 50: false, 90: false };
    window.addEventListener('scroll', () => {
        const scrollPct = Math.round(
            (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
        );
        if (scrollPct >= 50 && !scrollMilestones[50]) {
            scrollMilestones[50] = true;
            trackEvent('scroll_depth', { depth: '50%' });
        }
        if (scrollPct >= 90 && !scrollMilestones[90]) {
            scrollMilestones[90] = true;
            trackEvent('scroll_depth', { depth: '90%' });
        }
    });

    // Cambio de idioma
    const langSwitch = document.querySelector('.lang-switch');
    if (langSwitch) {
        langSwitch.addEventListener('click', () => {
            trackEvent('language_switch', {
                from: document.documentElement.lang,
                to: langSwitch.textContent.trim()
            });
        });
    }

    // 8. TRACKING WHATSAPP FLOTANTE

    const waFloat = document.querySelector('.whatsapp-float');
    if (waFloat) {
        waFloat.addEventListener('click', () => {
            trackEvent('whatsapp_contact', {
                source: 'floating_button'
            });
        });
    }

});

// Función para aceptar
function acceptCookies() {
    localStorage.setItem('cookieConsent', 'accepted');
    document.getElementById('cookieBanner').classList.remove('visible');

    // Avisa a Google Analytics que puede activarse
    gtag('consent', 'update', {
        'analytics_storage': 'granted',
        'ad_storage': 'granted'
    });
}

// Función para rechazar
function rejectCookies() {
    localStorage.setItem('cookieConsent', 'rejected');
    document.getElementById('cookieBanner').classList.remove('visible');

    // Mantiene a Google Analytics bloqueado
    gtag('consent', 'update', {
        'analytics_storage': 'denied'
    });
}

// Lógica al cargar la página
window.addEventListener('load', () => {
    const consent = localStorage.getItem('cookieConsent');

    if (!consent) {
        // Si es la primera vez, muestra el banner con retraso
        setTimeout(() => {
            document.getElementById('cookieBanner').classList.add('visible');
        }, 1500);
    } else if (consent === 'accepted') {
        // Si ya aceptó en el pasado, activa Analytics de inmediato
        gtag('consent', 'update', {
            'analytics_storage': 'granted'
        });
    }
});