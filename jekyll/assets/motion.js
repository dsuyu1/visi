const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
const nav = document.querySelector(".site-nav");
const indicator = nav.querySelector(".nav-indicator");
const active = nav.querySelector('[aria-current="page"]');
let hoveredLink = null;

function positionIndicator() {
  const focusedLink = nav.contains(document.activeElement) ? document.activeElement : null;
  const target = hoveredLink || focusedLink || active;
  nav.toggleAttribute("data-motion-ready", Boolean(target) && !reducedMotion.matches);

  if (!target || reducedMotion.matches) return;

  const bounds = target.getBoundingClientRect();
  const frame = nav.getBoundingClientRect();
  indicator.style.width = bounds.width + "px";
  indicator.style.height = bounds.height + "px";
  indicator.style.transform = `translate(${bounds.left - frame.left - nav.clientLeft}px, ${bounds.top - frame.top - nav.clientTop}px)`;
}

nav.addEventListener("pointerover", (event) => {
  const link = event.target.closest("a");
  if (!link || !finePointer.matches || event.pointerType === "touch") return;
  hoveredLink = link;
  positionIndicator();
});
nav.addEventListener("pointerleave", () => {
  hoveredLink = null;
  positionIndicator();
});
nav.addEventListener("focusin", positionIndicator);
nav.addEventListener("focusout", () => requestAnimationFrame(positionIndicator));
reducedMotion.addEventListener("change", positionIndicator);
new ResizeObserver(positionIndicator).observe(nav);
positionIndicator();
// Place the indicator once the web font has set the link widths, then let it
// animate. Otherwise it slides from its pre-font position on every page load.
document.fonts.ready.then(() => {
  positionIndicator();
  indicator.getBoundingClientRect(); // commit the position before transitions turn on
  nav.setAttribute("data-motion-settled", "");
});

if (!reducedMotion.matches && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      if (!reducedMotion.matches) entry.target.classList.add("reveal-enter");
    }
  }, { rootMargin: "0px 0px -8% 0px" });

  document.querySelectorAll("[data-reveal]").forEach((section) => {
    if (section.getBoundingClientRect().top > window.innerHeight) observer.observe(section);
  });
}
