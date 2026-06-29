
document.addEventListener('DOMContentLoaded', function () {
	const navbar = document.querySelector('.navbar');
	const menuToggle = document.querySelector('.menu-toggle');
	const navLinks = document.querySelector('.nav-links');
	const dropdowns = document.querySelectorAll('.nav-dropdown');
	const themeToggle = document.querySelector('.theme-toggle');

	function closeDropdowns() {
		dropdowns.forEach(dropdown => {
			dropdown.classList.remove('is-open');
			const button = dropdown.querySelector('.dropdown-toggle');
			if (button) button.setAttribute('aria-expanded', 'false');
		});
	}

	function setTheme(isLight) {
		document.body.classList.toggle('light-mode', isLight);
		localStorage.setItem('siteTheme', isLight ? 'light' : 'dark');

		if (!themeToggle) return;
		themeToggle.setAttribute('aria-pressed', String(isLight));
		themeToggle.setAttribute('aria-label', isLight ? 'Dunkelmodus aktivieren' : 'Hellmodus aktivieren');
		themeToggle.innerHTML = isLight ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>';
	}

	if (themeToggle) {
		setTheme(localStorage.getItem('siteTheme') === 'light');

		themeToggle.addEventListener('click', () => {
			setTheme(!document.body.classList.contains('light-mode'));
		});
	}

	if (navbar && menuToggle && navLinks) {
		menuToggle.addEventListener('click', () => {
			const isOpen = navbar.classList.toggle('menu-open');
			menuToggle.setAttribute('aria-expanded', String(isOpen));
			menuToggle.setAttribute('aria-label', isOpen ? 'Navigation schließen' : 'Navigation öffnen');
			menuToggle.innerHTML = isOpen ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
		});

		navLinks.querySelectorAll('a').forEach(link => {
			link.addEventListener('click', () => {
				navbar.classList.remove('menu-open');
				closeDropdowns();
				menuToggle.setAttribute('aria-expanded', 'false');
				menuToggle.setAttribute('aria-label', 'Navigation öffnen');
				menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
			});
		});

		window.addEventListener('resize', () => {
			if (window.innerWidth > 860) {
				navbar.classList.remove('menu-open');
				closeDropdowns();
				menuToggle.setAttribute('aria-expanded', 'false');
				menuToggle.setAttribute('aria-label', 'Navigation öffnen');
				menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
			}
		});
	}

	dropdowns.forEach(dropdown => {
		const button = dropdown.querySelector('.dropdown-toggle');
		if (!button) return;

		button.addEventListener('click', (e) => {
			e.stopPropagation();
			const isOpen = dropdown.classList.contains('is-open');
			closeDropdowns();
			dropdown.classList.toggle('is-open', !isOpen);
			button.setAttribute('aria-expanded', String(!isOpen));
		});
	});

	document.addEventListener('click', (e) => {
		if (!e.target.closest('.nav-dropdown')) closeDropdowns();
	});

	// Smooth scroll for internal navigation links
	document.querySelectorAll('a[href^="#"], .nav-links a').forEach(a => {
		a.addEventListener('click', (e) => {
			const href = a.getAttribute('href');
			if (!href) return;
			if (href.startsWith('#')) {
				e.preventDefault();
				const target = document.querySelector(href);
				if (target) target.scrollIntoView({ behavior: 'smooth' });
			}
		});
	});

	// Scroll-in animation for cards
	const cardObserver = new IntersectionObserver((entries) => {
		entries.forEach(entry => {
			if (entry.isIntersecting) {
				entry.target.classList.add('is-visible');
				cardObserver.unobserve(entry.target);
			}
		});
	}, { threshold: 0.1 });

	document.querySelectorAll('.service-card, .process-card, .why-card, .stat-card').forEach(card => {
		cardObserver.observe(card);
	});

	// Count-up numbers when stats enter viewport
	const statObserver = new IntersectionObserver((entries, obs) => {
		entries.forEach(entry => {
			if (!entry.isIntersecting) return;
			const el = entry.target.querySelector('h2');
			if (!el) return;
			const raw = el.textContent.trim();
			// extract numeric part
			const num = parseInt(raw.replace(/[^0-9]/g, '')) || 0;
			const duration = 1200;
			const start = performance.now();
			requestAnimationFrame(function step(now) {
				const t = Math.min(1, (now - start) / duration);
				el.textContent = Math.round(t * num) + (raw.replace(/\d+/,'') || '');
				if (t < 1) requestAnimationFrame(step);
			});
			obs.unobserve(entry.target);
		});
	}, { threshold: 0.4 });

	document.querySelectorAll('.stat-card').forEach(card => statObserver.observe(card));

	// Simple contact form handler: basic validation + toast
	const form = document.querySelector('.contact-form');
	if (form) {
		form.addEventListener('submit', (e) => {
			e.preventDefault();
			const email = form.querySelector('input[type="email"]');
			const msg = form.querySelector('textarea');
			if (email && (!email.value || !/\S+@\S+\.\S+/.test(email.value))) return showToast('Bitte gültige E-Mail eingeben');
			if (msg && !msg.value.trim()) return showToast('Bitte eine Nachricht eingeben');
			showToast('Nachricht gesendet — wir melden uns bald.');
			form.reset();
		});
	}

	// toast helper
	function showToast(text) {
		let t = document.createElement('div');
		t.className = 'site-toast';
		t.textContent = text;
		Object.assign(t.style, {
			position: 'fixed',
			right: '20px',
			bottom: '20px',
			background: 'rgba(0,0,0,0.85)',
			color: '#fff',
			padding: '12px 16px',
			borderRadius: '6px',
			zIndex: 9999,
			boxShadow: '0 6px 18px rgba(0,0,0,0.3)'
		});
		document.body.appendChild(t);
		setTimeout(() => t.style.opacity = '0', 2600);
		setTimeout(() => t.remove(), 3000);
	}

});

// Add small CSS via JS for scroll-in effect
(function injectStyles(){
	const css = `
		.service-card, .process-card, .why-card, .stat-card{ opacity: 0; transform: translateY(20px); transition: opacity .6s ease, transform .6s ease; }
		.is-visible{ opacity: 1; transform: translateY(0); }
		.site-toast{ transition: opacity .4s ease; }
		.dark-mode{ background: #121212; color: #f4f4f4; }
		.dark-mode a{ color: #9ecfff; }
		.dark-mode-toggle{ appearance: none; border: 1px solid rgba(255,255,255,.5); background: rgba(255,255,255,.08); color: #fff; padding: 8px 12px; border-radius: 999px; cursor: pointer; margin-left: 12px; }
		.dark-mode-toggle:hover{ background: rgba(255,255,255,.18); }
	`;
	const s = document.createElement('style'); s.appendChild(document.createTextNode(css)); document.head.appendChild(s);
})();
