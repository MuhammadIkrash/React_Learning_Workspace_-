/**
 * @file youtube-player.js (classic script — see shared/namespace.js)
 */
(function () {
  const PLAYBACK_SPEEDS = window.CWP.shared.constants.PLAYBACK_SPEEDS;
  const QUALITY_LEVELS = window.CWP.shared.constants.QUALITY_LEVELS;
  const VOLUME_BOOST_LEVELS = window.CWP.shared.constants.VOLUME_BOOST_LEVELS;
  const { createEl, formatSpeed, guard } = window.CWP.shared.utils;
  const { notify } = window.CWP.core.notificationManager;
  const { logger } = window.CWP.shared.logger;
  const { registerCleanup, unregisterCleanup } = window.CWP.core.cleanupManager;

  const ID = 'youtube-player-control-center';

  function getPlayerContainer() {
    return document.querySelector('#movie_player');
  }

  async function captureScreenshot() {
    const video = document.querySelector('#movie_player video, video.html5-main-video');
    if (!video || video.readyState < 2) {
      notify('No video frame available yet', { icon: '📸' });
      return;
    }
    await guard(async () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx2d = canvas.getContext('2d');
      ctx2d.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/png');

      const link = document.createElement('a');
      link.href = dataUrl;
      const titleEl = document.querySelector('h1.ytd-watch-metadata yt-formatted-string, .title.ytd-video-primary-info-renderer');
      const safeTitle = (titleEl?.textContent || 'cleanweb-screenshot').trim().slice(0, 60).replace(/[^a-z0-9-_ ]/gi, '');
      link.download = `${safeTitle || 'cleanweb-screenshot'}.png`;
      link.click();
      notify('Screenshot saved', { icon: '📸' });
    }, (err) => {
      logger.error('Screenshot capture failed', err);
      notify('Screenshot failed — this video may be protected', { icon: '📸' });
    })();
  }

  function buildPanel(ctx) {
    const Speed = window.CWP.youtube.speed;
    const Quality = window.CWP.youtube.quality;
    const Volume = window.CWP.youtube.volume;
    const PiP = window.CWP.youtube.pip;
    const Theater = window.CWP.youtube.theater;
    const Cinema = window.CWP.youtube.cinema;

    const panel = createEl('div', { className: 'cwp-control-center', attrs: { role: 'toolbar', 'aria-label': 'CleanWeb Pro player controls' } });

    const speedBtn = createEl('button', {
      className: 'cwp-cc-btn',
      attrs: { type: 'button', title: 'Playback speed', 'aria-label': 'Playback speed' },
      text: formatSpeed(Speed.getSpeed())
    });
    const qualityBtn = createEl('button', {
      className: 'cwp-cc-btn',
      attrs: { type: 'button', title: 'Video quality', 'aria-label': 'Video quality' },
      text: 'Auto'
    });
    const volumeBtn = createEl('button', {
      className: 'cwp-cc-btn',
      attrs: { type: 'button', title: 'Volume boost', 'aria-label': 'Volume boost' },
      text: '🔊'
    });
    const pipBtn = createEl('button', {
      className: 'cwp-cc-btn',
      attrs: { type: 'button', title: 'Picture-in-Picture', 'aria-label': 'Picture-in-Picture' },
      text: '⧉'
    });
    const theaterBtn = createEl('button', {
      className: 'cwp-cc-btn',
      attrs: { type: 'button', title: 'Theater mode', 'aria-label': 'Theater mode' },
      text: '🎬'
    });
    const cinemaBtn = createEl('button', {
      className: 'cwp-cc-btn',
      attrs: { type: 'button', title: 'Cinema mode', 'aria-label': 'Cinema mode' },
      text: '🎥'
    });
    const screenshotBtn = createEl('button', {
      className: 'cwp-cc-btn',
      attrs: { type: 'button', title: 'Screenshot', 'aria-label': 'Screenshot' },
      text: '📸'
    });

    const speedMenu = createEl('div', { className: 'cwp-cc-menu cwp-cc-menu-hidden' });
    for (const speed of PLAYBACK_SPEEDS) {
      const item = createEl('button', { className: 'cwp-cc-menu-item', attrs: { type: 'button' }, text: formatSpeed(speed) });
      item.addEventListener('click', () => {
        Speed.applySpeed(speed);
        Speed.persistPreferredSpeed(speed);
        speedBtn.textContent = formatSpeed(speed);
        speedMenu.classList.add('cwp-cc-menu-hidden');
      });
      speedMenu.appendChild(item);
    }

    const qualityMenu = createEl('div', { className: 'cwp-cc-menu cwp-cc-menu-hidden' });
    function renderQualityMenu() {
      qualityMenu.textContent = '';
      const available = Quality.getAvailableQualities();
      for (const level of QUALITY_LEVELS) {
        const isAvailable = level.value === 'auto' || available.includes(level.value);
        const item = createEl('button', {
          className: `cwp-cc-menu-item${isAvailable ? '' : ' cwp-cc-menu-item-disabled'}`,
          attrs: { type: 'button', disabled: isAvailable ? undefined : 'disabled' },
          text: isAvailable ? level.label : `${level.label} — Unavailable`
        });
        if (isAvailable) {
          item.addEventListener('click', () => {
            Quality.setQuality(level.value);
            Quality.persistPreferredQuality(level.value);
            qualityBtn.textContent = level.label;
            qualityMenu.classList.add('cwp-cc-menu-hidden');
          });
        }
        qualityMenu.appendChild(item);
      }
    }

    const volumeMenu = createEl('div', { className: 'cwp-cc-menu cwp-cc-menu-hidden' });
    for (const level of VOLUME_BOOST_LEVELS) {
      const item = createEl('button', { className: 'cwp-cc-menu-item', attrs: { type: 'button' }, text: `${level}%` });
      item.addEventListener('click', () => {
        Volume.setBoostLevel(level);
        Volume.persistBoostLevel(level);
        volumeMenu.classList.add('cwp-cc-menu-hidden');
      });
      volumeMenu.appendChild(item);
    }

    function closeAllMenus(except) {
      for (const menu of [speedMenu, qualityMenu, volumeMenu]) {
        if (menu !== except) menu.classList.add('cwp-cc-menu-hidden');
      }
    }

    speedBtn.addEventListener('click', () => {
      closeAllMenus(speedMenu);
      speedMenu.classList.toggle('cwp-cc-menu-hidden');
    });
    qualityBtn.addEventListener('click', () => {
      renderQualityMenu();
      closeAllMenus(qualityMenu);
      qualityMenu.classList.toggle('cwp-cc-menu-hidden');
    });
    volumeBtn.addEventListener('click', () => {
      closeAllMenus(volumeMenu);
      volumeMenu.classList.toggle('cwp-cc-menu-hidden');
    });
    pipBtn.addEventListener('click', () => {
      closeAllMenus();
      PiP.togglePiP();
    });
    theaterBtn.addEventListener('click', () => {
      closeAllMenus();
      const isActive = Theater.toggleTheater();
      theaterBtn.classList.toggle('cwp-cc-btn-active', Boolean(isActive));
    });
    cinemaBtn.addEventListener('click', () => {
      closeAllMenus();
      const isActive = Cinema.toggleCinema();
      cinemaBtn.classList.toggle('cwp-cc-btn-active', Boolean(isActive));
    });
    screenshotBtn.addEventListener('click', () => {
      closeAllMenus();
      captureScreenshot();
    });

    document.addEventListener('click', (e) => {
      if (!panel.contains(e.target)) closeAllMenus();
    });

    const wrapSpeed = createEl('div', { className: 'cwp-cc-item', children: [speedBtn, speedMenu] });
    const wrapQuality = createEl('div', { className: 'cwp-cc-item', children: [qualityBtn, qualityMenu] });
    const wrapVolume = createEl('div', { className: 'cwp-cc-item', children: [volumeBtn, volumeMenu] });

    panel.appendChild(wrapSpeed);
    if (ctx.settings.features.qualityControl) panel.appendChild(wrapQuality);
    if (ctx.settings.features.volumeBoost) panel.appendChild(wrapVolume);
    if (ctx.settings.features.pictureInPicture) panel.appendChild(pipBtn);
    if (ctx.settings.features.theaterMode) panel.appendChild(theaterBtn);
    if (ctx.settings.features.cinemaMode) panel.appendChild(cinemaBtn);
    if (ctx.settings.features.screenshotTool) panel.appendChild(screenshotBtn);

    panel.classList.add(`cwp-cc-density-${ctx.settings.player.controlsDensity === 'compact' ? 'compact' : 'expanded'}`);
    panel.classList.add(`cwp-cc-position-${ctx.settings.appearance.controlPosition || 'bottom-right'}`);
    if (ctx.settings.player.controlsVisibility === 'hide') panel.classList.add('cwp-cc-hidden');

    return panel;
  }

  async function init(ctx) {
    if (!ctx.settings.features.speedControl) return { mounted: false };

    const container = getPlayerContainer();
    if (!container) {
      logger.warn('Player container not found — Control Center not mounted');
      return { mounted: false };
    }

    const panel = buildPanel(ctx);
    container.appendChild(panel);

    registerCleanup(ID, () => {
      guard(() => panel.remove(), () => {});
      unregisterCleanup(ID);
    });

    return { mounted: true, panel };
  }

  function destroy(instance) {
    guard(() => instance?.panel?.remove(), () => {});
    unregisterCleanup(ID);
  }

  window.CWP.youtube.player = { init, destroy };
})();
