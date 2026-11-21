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
    github: { label: 'GitHub Light', mode: 'light', collection: 'Open themes' },
    ayu: { label: 'Ayu Mirage', mode: 'dark', collection: 'Open themes' },
    catppuccin: { label: 'Catppuccin Mocha', mode: 'dark', collection: 'Open themes' },
    dracula: { label: 'Dracula', mode: 'dark', collection: 'Open themes' },
    everforest: { label: 'Everforest', mode: 'dark', collection: 'Open themes' },
    gruvbox: { label: 'Gruvbox Light', mode: 'light', collection: 'Open themes' },
  };


function normalizeAppearance(input) {
  input = input && typeof input === 'object' ? input : {};
  function theme(value) {
    value = value && typeof value === 'object' ? value : {};
    var result = {};
    for (var key of ['accent', 'background', 'foreground']) {
      if (typeof value[key] === 'string' && /^#[0-9a-f]{6}$/i.test(value[key])) result[key] = value[key].toLowerCase();
    }
    if (['inter', 'system', 'serif', 'mono'].includes(value.font)) result.font = value.font;
    if (PALETTES[value.preset] && Object.hasOwn(PALETTES, value.preset)) result.preset = value.preset;
    return result;
  }
  function bounded(key, min, max, fallback) {
    return Number.isInteger(input[key]) ? Math.min(max, Math.max(min, input[key])) : fallback;
  }
  return {
    separate: input.separate === true,
    shared: theme(input.shared), light: theme(input.light), dark: theme(input.dark),
    uiSize: bounded('uiSize', 12, 22, 14), contentSize: bounded('contentSize', 13, 25, 15),
    codeSize: bounded('codeSize', 10, 21, 13), contrast: bounded('contrast', 50, 100, 60),
    motion: ['on', 'off'].includes(input.motion) ? input.motion : 'system',
    punctuation: input.punctuation === true, fullWidth: input.fullWidth === true,
    markers: input.markers === 'symbols' ? 'symbols' : 'color',
  };
}

  function valid(value) {
    return ['system', 'light', 'dark'].includes(value) || Object.hasOwn(PALETTES, value) ? value : null;
  }

  // "; Domain=visiutrgv.org" on hub.visiutrgv.org and lilac.visiutrgv.org;
  // nothing on localhost or an IP address, where the cookie stays host-only.
  function cookie(name) {
    var entry = document.cookie.split('; ').find(function (part) { return part.startsWith(name + '='); });
    return entry ? entry.slice(name.length + 1) : null;
  }

  function writeCookie(name, value) {
    var host = location.hostname;
    var domain = host === 'visiutrgv.org' || host.endsWith('.visiutrgv.org') ? '; Domain=visiutrgv.org' : '';
    document.cookie = name + '=' + value + '; Path=/; Max-Age=31536000; SameSite=Lax' + domain +
      (location.protocol === 'https:' ? '; Secure' : '');
  }

  function readShared() {
    return valid(cookie(KEY));
  }

  function readAppearance() {
    try {
      var value = cookie('visi-appearance');
      return value ? normalizeAppearance(JSON.parse(decodeURIComponent(value))) : null;
    } catch (error) { return null; }
  }

  var appearance = readAppearance() || normalizeAppearance();

  var choice = readShared();

  if (!choice) {
    try {
      choice = valid(localStorage.getItem(KEY));
    } catch (e) {
      // Storage blocked (private window, strict settings) — follow the OS.
    }
  }

  var media = window.matchMedia('(prefers-color-scheme: light)');
  var motionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');

  function apply(value) {
    var palette = Object.hasOwn(PALETTES, value) ? PALETTES[value] : null;
    var resolved = value === 'system' ? (media.matches ? 'light' : 'dark') : palette?.mode || value;

    var root = document.documentElement;
    var active = appearance.separate ? appearance[resolved] : appearance.shared;
    var activePreset = appearance.separate ? active.preset : palette ? value : null;
    if (activePreset && PALETTES[activePreset]?.mode === resolved) root.dataset.palette = activePreset;
    else delete root.dataset.palette;
    root.dataset.theme = resolved;
    root.dataset.themeChoice = value;
    root.dataset.motion = appearance.motion;
    root.toggleAttribute('data-reduced-motion', appearance.motion === 'on' || (appearance.motion === 'system' && motionMedia.matches));
    root.dataset.diffMarkers = appearance.markers;
    root.toggleAttribute('data-full-width', appearance.fullWidth);
    root.toggleAttribute('data-appearance-contrast', appearance.contrast !== 60);
    root.toggleAttribute('data-appearance-ui', appearance.uiSize !== 14);
    root.toggleAttribute('data-appearance-content', appearance.contentSize !== 15);
    root.toggleAttribute('data-appearance-code', appearance.codeSize !== 13);
    for (var key of ['accent', 'background', 'foreground']) {
      root.toggleAttribute('data-appearance-' + key, Boolean(active[key]));
      if (active[key]) root.style.setProperty('--appearance-' + key, active[key]);
      else root.style.removeProperty('--appearance-' + key);
    }
    if (active.accent) {
      var channels = active.accent.slice(1).match(/../g).map(function (hex) {
        var channel = parseInt(hex, 16) / 255;
        return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
      });
      var luminance = channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
      root.style.setProperty('--appearance-accent-ink', luminance > 0.179 ? '#000000' : '#ffffff');
    } else root.style.removeProperty('--appearance-accent-ink');
    var fonts = { inter: 'Inter, system-ui, sans-serif', system: 'system-ui, sans-serif',
      serif: 'Georgia, serif', mono: 'ui-monospace, monospace' };
    if (active.font) root.style.setProperty('--appearance-font', fonts[active.font]);
    else root.style.removeProperty('--appearance-font');
    root.toggleAttribute('data-appearance-font', Boolean(active.font));
    root.style.setProperty('--appearance-ui', appearance.uiSize + 'px');
    root.style.setProperty('--appearance-content', appearance.contentSize + 'px');
    root.style.setProperty('--appearance-code', appearance.codeSize + 'px');
    root.style.setProperty('--appearance-contrast', Math.max(0, appearance.contrast - 50) + '%');
  }

  window.visiTheme = {
    palettes: PALETTES,
    normalizeAppearance: normalizeAppearance,
    appearance: function () { return normalizeAppearance(appearance); },
    sharedAppearance: readAppearance,
    setAppearance: function (value) {
      appearance = normalizeAppearance(value);
      writeCookie('visi-appearance', encodeURIComponent(JSON.stringify(appearance)));
      apply(this.get());
      document.dispatchEvent(new CustomEvent('visi:theme'));
    },
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

      writeCookie(KEY, value);
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

  motionMedia.addEventListener('change', function () { apply(window.visiTheme.get()); });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) return;
    var shared = readShared() || window.visiTheme.get();
    var customization = readAppearance();
    if (shared === window.visiTheme.get() && (!customization || JSON.stringify(customization) === JSON.stringify(appearance))) return;
    if (customization) appearance = customization;
    apply(shared);
    document.dispatchEvent(new CustomEvent('visi:theme'));
  });

  document.addEventListener('input', function (event) {
    var field = event.target;
    if (!appearance.punctuation || !field.matches('textarea[data-smart-punctuation]') ||
        event.isComposing || event.inputType !== 'insertText' || field.selectionStart !== field.selectionEnd) return;
    var end = field.selectionEnd;
    var before = field.value.slice(0, end);
    var rules = [
      [/---$/, '—'], [/--$/, '—'], [/\.\.\.$/, '…'], [/->$/, '→'],
      [/(^|[\s([])"$/, '“'], [/"$/, '”'],
      [/(^|[\s([])'$/, '‘'], [/'$/, '’'],
    ];
    for (var pair of rules) {
      var match = pair[0].exec(before);
      if (!match) continue;
      var start = end - (match[1] === undefined ? match[0].length : 1);
      field.setRangeText(pair[1], start, end, 'end');
      break;
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
