/**
 * nav.js — Injects sticky navbar and handles hamburger toggle
 * Shows login/account links based on auth state.
 */
(function initNav() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const isAdmin = window.location.pathname.includes('/admin/');
  const base = isAdmin ? '../' : '';

  // Auth state (auth.js must be loaded before nav.js on pages that need it)
  const user = (typeof Auth !== 'undefined') ? Auth.currentUser() : null;

  function isActive(page) {
    return currentPage === page ? 'active' : '';
  }

  const authLinks = user
    ? `<li><a href="${base}account.html" class="${isActive('account.html')}" style="display:flex;align-items:center;gap:6px;"><i class="fa-solid fa-circle-user"></i> ${user.name.split(' ')[0]}</a></li>`
    : `<li><a href="${base}login.html" class="${isActive('login.html')} nav-btn"><i class="fa-solid fa-right-to-bracket"></i> Sign In</a></li>`;

  const navHTML = `
    <nav class="navbar">
      <a href="${base}index.html" class="navbar-logo"><i class="fa-solid fa-screwdriver-wrench" style="color:var(--vibrant-growth);margin-right:6px;"></i>JUDY'S <span>Hardware</span></a>
      <button class="hamburger" id="hamburger" aria-label="Toggle menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
      <ul class="nav-links" id="nav-links">
        <li><a href="${base}index.html" class="${isActive('index.html')}"><i class="fa-solid fa-house"></i> Home</a></li>
        <li><a href="${base}products.html" class="${isActive('products.html')}"><i class="fa-solid fa-box-open"></i> Products</a></li>
        <li><a href="${base}about.html" class="${isActive('about.html')}"><i class="fa-solid fa-circle-info"></i> About</a></li>
        <li><a href="${base}contact.html" class="${isActive('contact.html')}"><i class="fa-solid fa-envelope"></i> Contact</a></li>
        ${authLinks}
      </ul>
    </nav>`;

  document.body.insertAdjacentHTML('afterbegin', navHTML);

  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('nav-links');

  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('nav-open');
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('nav-open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });
})();
