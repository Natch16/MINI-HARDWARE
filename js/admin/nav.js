/**
 * admin/nav.js — Mobile hamburger menu for admin panel
 * Injects a hamburger button into the admin navbar and wires a slide-in
 * drawer that mirrors the desktop sidebar links.
 */
(function initAdminNav() {
  // ── Add hamburger button to navbar ────────────────────────────────────────
  var navbar = document.querySelector('.navbar');
  if (!navbar) return;

  var hamburger = document.createElement('button');
  hamburger.id = 'admin-hamburger';
  hamburger.setAttribute('aria-label', 'Open menu');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.innerHTML = '<span></span><span></span><span></span>';
  navbar.appendChild(hamburger);

  // ── Build drawer overlay ──────────────────────────────────────────────────
  var overlay = document.createElement('div');
  overlay.id = 'admin-drawer-overlay';

  var drawer = document.createElement('nav');
  drawer.id = 'admin-drawer';

  // Collect links from the desktop sidebar
  var sidebarLinks = document.querySelectorAll('.admin-sidebar .admin-nav a');
  var linksHtml = Array.from(sidebarLinks).map(function(a) {
    var href    = a.getAttribute('href') || '#';
    var icon    = a.querySelector('.nav-icon') ? a.querySelector('.nav-icon').innerHTML : '';
    var text    = a.textContent.trim();
    var active  = a.classList.contains('active') ? ' class="active"' : '';
    var style   = a.getAttribute('style') ? ' style="' + a.getAttribute('style') + '"' : '';
    var id      = a.id ? ' id="' + a.id + '"' : '';
    return '<a href="' + href + '"' + active + style + id + '>'
      + '<span class="nav-icon">' + icon + '</span> ' + text + '</a>';
  }).join('');

  drawer.innerHTML = '<div class="admin-drawer-header">'
    + '<span class="admin-drawer-logo">JUDY\'S <span>Hardware</span></span>'
    + '<button id="admin-drawer-close" aria-label="Close menu">&times;</button>'
    + '</div>'
    + '<div class="admin-drawer-links">' + linksHtml + '</div>';

  document.body.appendChild(overlay);
  document.body.appendChild(drawer);

  // ── Toggle helpers ────────────────────────────────────────────────────────
  function openDrawer() {
    drawer.classList.add('open');
    overlay.classList.add('open');
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', function() {
    drawer.classList.contains('open') ? closeDrawer() : openDrawer();
  });
  overlay.addEventListener('click', closeDrawer);
  document.getElementById('admin-drawer-close').addEventListener('click', closeDrawer);

  // Close on Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeDrawer();
  });

  // Wire logout in drawer (mirrors sidebar-logout confirm)
  var drawerLogout = drawer.querySelector('#sidebar-logout');
  if (drawerLogout) {
    drawerLogout.addEventListener('click', function(e) {
      e.preventDefault();
      closeDrawer();
      if (!confirm('Are you sure you want to log out?')) return;
      if (typeof AdminAuth !== 'undefined') {
        AdminAuth.logout();
        window.location.href = 'login.html';
      }
    });
  }
})();
