(() => {
  const shell = document.querySelector('.header-nav-wrapper');
  if (!shell) return;

  document.body.classList.add('admin-shell-page');

  const menuButton = shell.querySelector('.mobile-menu-toggle');
  const navs = Array.from(shell.querySelectorAll('.header-nav'));
  if (!navs.length) return;

  const isVisible = (element) => getComputedStyle(element).display !== 'none';
  const activeNav = () => navs.find(isVisible) || navs[0];

  const backdrop = document.createElement('button');
  backdrop.type = 'button';
  backdrop.className = 'sidebar-backdrop';
  backdrop.setAttribute('aria-label', 'Close navigation');
  shell.parentNode.insertBefore(backdrop, shell.nextSibling);

  const setOpen = (open) => {
    document.body.classList.toggle('sidebar-open', open);
    const nav = activeNav();
    navs.forEach(item => item.classList.toggle('is-open', open && item === nav));
    if (menuButton) menuButton.setAttribute('aria-expanded', String(open));
  };

  if (menuButton) {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.addEventListener('click', () => setOpen(!document.body.classList.contains('sidebar-open')));
  }

  backdrop.addEventListener('click', () => setOpen(false));
  shell.addEventListener('click', (event) => {
    if (event.target.closest('.nav-link, .switch-role-link')) setOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setOpen(false);
  });

  // Keep tab controls accessible without coupling the shell to page-specific tab logic.
  document.querySelectorAll('.sa-side-nav').forEach((tabList) => {
    tabList.setAttribute('role', 'tablist');
    const buttons = Array.from(tabList.querySelectorAll('button[data-tab]'));
    buttons.forEach((button) => {
      const key = button.dataset.tab;
      const panel = document.getElementById(`tab-${key}`);
      if (!panel) return;
      const buttonId = button.id || `tab-trigger-${key}`;
      button.id = buttonId;
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-controls', panel.id);
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', buttonId);
      button.setAttribute('aria-selected', String(button.classList.contains('active')));
    });
    tabList.addEventListener('click', (event) => {
      const selected = event.target.closest('button[data-tab]');
      if (!selected) return;
      buttons.forEach((button) => button.setAttribute('aria-selected', String(button === selected)));
    });
  });
})();
