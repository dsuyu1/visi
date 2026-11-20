const hubCards = document.getElementById('hub-cards');
const hubControls = document.querySelector('[data-hub-controls]');
const [previous, next] = hubControls.querySelectorAll('button');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

function updateControls() {
  const maxScroll = hubCards.scrollWidth - hubCards.clientWidth;
  previous.setAttribute('aria-disabled', String(hubCards.scrollLeft <= 1));
  next.setAttribute('aria-disabled', String(hubCards.scrollLeft >= maxScroll - 1));
  hubControls.hidden = maxScroll <= 1;
}

for (const button of [previous, next]) {
  button.addEventListener('click', () => {
    if (button.getAttribute('aria-disabled') === 'true') return;

    const [first, second] = hubCards.children;
    const step = second.offsetLeft - first.offsetLeft;
    const position = hubCards.scrollLeft;
    const target = button === next
      ? (Math.floor((position + 1) / step) + 1) * step
      : (Math.ceil((position - 1) / step) - 1) * step;
    hubCards.scrollTo({ left: target, behavior: reduceMotion.matches ? 'instant' : 'smooth' });
  });
}

hubCards.addEventListener('scroll', updateControls, { passive: true });
new ResizeObserver(updateControls).observe(hubCards);
updateControls();
