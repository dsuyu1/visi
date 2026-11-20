// Picks the colour theme before the first paint, so it loads without defer.
// A visitor's choice from the header toggle is kept in localStorage; with no
// choice, or one that matches the OS again, the OS setting wins. Without
// JavaScript the stylesheet follows prefers-color-scheme on its own.
(function () {
  var root = document.documentElement;
  var media = window.matchMedia("(prefers-color-scheme: dark)");
  var KEY = "visi-theme";
  var stored = null;

  try {
    stored = localStorage.getItem(KEY);
  } catch (e) {
    // Storage blocked (private window, strict settings): follow the OS.
  }

  function system() {
    return media.matches ? "dark" : "light";
  }

  function current() {
    return root.dataset.theme || system();
  }

  function syncToggle() {
    var button = document.querySelector("[data-theme-toggle]");
    if (!button) return;
    var next = current() === "dark" ? "light" : "dark";
    button.setAttribute("aria-label", "Switch to " + next + " theme");
    button.title = "Switch to " + next + " theme";
  }

  function apply(choice) {
    var theme = choice === "light" || choice === "dark" ? choice : system();
    root.dataset.theme = theme;
    root.dataset.themeChoice = choice === "light" || choice === "dark" ? choice : "system";
    document.querySelectorAll('meta[name="theme-color"]').forEach(function (meta) {
      meta.content = theme === "dark" ? "#1c1c1c" : "#ffffff";
    });
    syncToggle();
  }

  media.addEventListener("change", function () {
    if (root.dataset.themeChoice === "system") apply("system");
  });

  document.addEventListener("DOMContentLoaded", function () {
    var button = document.querySelector("[data-theme-toggle]");
    if (!button) return;
    button.hidden = false;
    syncToggle();
    button.addEventListener("click", function () {
      var next = current() === "dark" ? "light" : "dark";
      var choice = next === system() ? "system" : next;
      try {
        if (choice === "system") localStorage.removeItem(KEY);
        else localStorage.setItem(KEY, choice);
      } catch (e) {}
      apply(choice);
    });
  });

  apply(stored);
})();
