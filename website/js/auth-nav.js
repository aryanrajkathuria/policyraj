/**
 * PolicyRaj — Auth Nav
 * Include this on every page. Checks login state and updates the navbar Login button.
 * No imports needed — reads localStorage directly.
 */
(function () {
  const token   = localStorage.getItem('pr_id_token');
  const session = JSON.parse(localStorage.getItem('pr_dev_session') || 'null');
  if (!token || !session) return; // not logged in — keep Login button as-is

  const name     = session.name || session.email || 'User';
  const initials = name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();

  // Wait for DOM
  document.addEventListener('DOMContentLoaded', function () {
    const btn = document.getElementById('navAuthBtn');
    if (!btn) return;

    // Replace Login button with avatar + name dropdown
    const wrap = document.createElement('div');
    wrap.className = 'nav-user-wrap';
    wrap.innerHTML = `
      <button class="nav-user-btn" onclick="toggleNavUserMenu(event)">
        <span class="nav-user-avatar">${initials}</span>
        <span class="nav-user-name">${name.split(' ')[0]}</span>
        <i class="fa fa-chevron-down nav-user-chevron"></i>
      </button>
      <div class="nav-user-menu" id="navUserMenu">
        <div class="num-greeting">Hi, ${name.split(' ')[0]} 👋</div>
        <a href="dashboard.html" class="num-item"><i class="fa fa-th-large"></i> My Account</a>
        <a href="health.html"    class="num-item"><i class="fa fa-heartbeat"></i> Health Insurance</a>
        <a href="life.html"      class="num-item"><i class="fa fa-heart"></i> Life Insurance</a>
        <a href="motor.html"     class="num-item"><i class="fa fa-car"></i> Motor Insurance</a>
        <hr class="num-divider" />
        <button class="num-item num-logout" onclick="navLogout()"><i class="fa fa-sign-out-alt"></i> Sign Out</button>
      </div>
    `;
    btn.replaceWith(wrap);
  });

  window.toggleNavUserMenu = function (e) {
    e.stopPropagation();
    document.getElementById('navUserMenu').classList.toggle('open');
  };

  window.navLogout = function () {
    localStorage.removeItem('pr_id_token');
    localStorage.removeItem('pr_dev_session');
    localStorage.removeItem('pr_access_token');
    localStorage.removeItem('pr_refresh_token');
    window.location.href = 'index.html';
  };

  document.addEventListener('click', function () {
    const m = document.getElementById('navUserMenu');
    if (m) m.classList.remove('open');
  });
})();
