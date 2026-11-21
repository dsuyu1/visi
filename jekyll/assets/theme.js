// Runs before the stylesheet so the first paint already has the right theme.
//
// The choice is kept in a `visi-theme` cookie on the parent domain
// (visiutrgv.org), which the hub and the Detection Lab both read, so picking
// a theme in one is picking it in the other. localStorage is the fallback
// for hosts without a shared parent (localhost). The hub also saves the
// choice to the member's account so it follows them to other devices; its
// app.js reconciles the two.
//
// Keep this file in sync across VISI apps.
(function () {
  var KEY = 'visi-theme';
  var PALETTES = {
    porcelain: { label: 'Porcelain', mode: 'light' },
    sage: { label: 'Sage', mode: 'light' },
    sand: { label: 'Sand', mode: 'light' },
    midnight: { label: 'Midnight Blue', mode: 'dark' },
    pine: { label: 'Pine', mode: 'dark' },
    violet: { label: 'Violet', mode: 'dark' },
  };

  function valid(value) {
    return ['system', 'light', 'dark'].includes(value) || Object.hasOwn(PALETTES, value) ? value : null;
  }

  // "; Domain=visiutrgv.org" on hub.visiutrgv.org and lilac.visiutrgv.org;
  // nothing on localhost or an IP address, where the cookie stays host-only.
  function domainAttr() {
    var host = location.hostname;

    if (host.indexOf('.') === -1 || /^[\d.]+$/.test(host) || host.indexOf(':') !== -1) return '';

    return '; Domain=' + host.split('.').slice(-2).join('.');
  }

  function readShared() {
    var match = document.cookie.match(/(?:^|;\s*)visi-theme=([a-z]+)/);

    return match ? valid(match[1]) : null;
  }

  function writeShared(value) {
    document.cookie =
      KEY + '=' + value + '; Path=/; Max-Age=31536000; SameSite=Lax' + domainAttr() + (location.protocol === 'https:' ? '; Secure' : '');
  }

  var choice = readShared();

  if (!choice) {
    try {
      choice = valid(localStorage.getItem(KEY));
    } catch (e) {
      // Storage blocked (private window, strict settings) — follow the OS.
    }
  }

  var media = window.matchMedia('(prefers-color-scheme: light)');

  function apply(value) {
    var palette = Object.hasOwn(PALETTES, value) ? PALETTES[value] : null;
    var resolved = value === 'system' ? (media.matches ? 'light' : 'dark') : palette?.mode || value;

    if (palette) document.documentElement.dataset.palette = value;
    else delete document.documentElement.dataset.palette;
    document.documentElement.dataset.theme = resolved;
    document.documentElement.dataset.themeChoice = value;
  }

  window.visiTheme = {
    palettes: PALETTES,
    modeChoice: function () {
      var value = this.get();
      return Object.hasOwn(PALETTES, value) ? PALETTES[value].mode : value;
    },
    get: function () {
      return document.documentElement.dataset.themeChoice || 'system';
    },
    /** The choice in the shared cookie, or null when there isn't one yet. */
    shared: readShared,
    set: function (value) {
      value = valid(value) || 'system';

      try {
        localStorage.setItem(KEY, value);
      } catch (e) {}

      writeShared(value);
      apply(value);
      document.dispatchEvent(new CustomEvent('visi:theme'));
    },
  };

  media.addEventListener('change', function () {
    if (window.visiTheme.get() === 'system') {
      apply('system');
      document.dispatchEvent(new CustomEvent('visi:theme'));
    }
  });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) return;
    var shared = readShared();
    if (shared && shared !== window.visiTheme.get()) {
      apply(shared);
      document.dispatchEvent(new CustomEvent('visi:theme'));
    }
  });

  apply(choice || 'system');
})();

// The public site uses a single light/dark button in its header.
(function () {
  function update() {
    var root = document.documentElement;
    var button = document.querySelector('[data-theme-toggle]');
    var next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    if (button) {
      button.setAttribute('aria-label', 'Switch to ' + next + ' theme');
      button.title = 'Switch to ' + next + ' theme';
    }
    var color = getComputedStyle(root).getPropertyValue('--page').trim();
    if (color) document.querySelectorAll('meta[name="theme-color"]').forEach(function (meta) {
      meta.content = color;
    });
  }

  document.addEventListener('visi:theme', update);
  document.addEventListener('DOMContentLoaded', function () {
    var button = document.querySelector('[data-theme-toggle]');
    if (button) {
      button.hidden = false;
      button.addEventListener('click', function () {
        var next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
        var system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        window.visiTheme.set(next === system ? 'system' : next);
      });
    }
    update();
  });
})();
