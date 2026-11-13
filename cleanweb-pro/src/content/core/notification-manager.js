/**
 * @file notification-manager.js (classic script — see shared/namespace.js)
 */
(function () {
  const { createEl } = window.CWP.shared.utils;
  const NOTIFICATION_DURATION_MS = window.CWP.shared.constants.NOTIFICATION_DURATION_MS;
  const MAX_NOTIFICATION_QUEUE = window.CWP.shared.constants.MAX_NOTIFICATION_QUEUE;

  let containerEl = null;
  let queue = [];
  let showing = false;
  let enabled = true;

  function ensureContainer() {
    if (containerEl && document.body.contains(containerEl)) return containerEl;
    containerEl = createEl('div', {
      className: 'cwp-toast-container',
      attrs: { role: 'status', 'aria-live': 'polite' }
    });
    document.documentElement.appendChild(containerEl);
    return containerEl;
  }

  function setNotificationsEnabled(value) {
    enabled = Boolean(value);
  }

  function renderNext() {
    if (showing || queue.length === 0) return;
    const { message, icon } = queue.shift();
    showing = true;

    const container = ensureContainer();
    const toast = createEl('div', { className: 'cwp-toast' });
    if (icon) toast.appendChild(createEl('span', { className: 'cwp-toast-icon', text: icon }));
    toast.appendChild(createEl('span', { className: 'cwp-toast-message', text: message }));
    container.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('cwp-toast-visible'));

    setTimeout(() => {
      toast.classList.remove('cwp-toast-visible');
      toast.classList.add('cwp-toast-leaving');
      setTimeout(() => {
        toast.remove();
        showing = false;
        renderNext();
      }, 220);
    }, NOTIFICATION_DURATION_MS);
  }

  function notify(message, options = {}) {
    if (!enabled) return;
    if (queue.length >= MAX_NOTIFICATION_QUEUE) queue.shift();
    queue.push({ message, icon: options.icon || '' });
    renderNext();
  }

  function clearNotifications() {
    queue = [];
    if (containerEl) containerEl.textContent = '';
  }

  window.CWP.core.notificationManager = { notify, setNotificationsEnabled, clearNotifications };
})();
