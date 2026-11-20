const hero = document.querySelector('[data-hero]');
const heroSlides = hero.querySelector('.hero-slides');
const heroPanels = [...heroSlides.children];
const heroPicker = hero.querySelector('.hero-picker');
const heroButtons = [...heroPicker.querySelectorAll('button')];
const heroMotion = matchMedia('(prefers-reduced-motion: reduce)');

let currentSlide = 0;
let rotating = !heroMotion.matches;
let hovered = false;
let timer;

function showHeroSlide(index) {
  if (index === currentSlide) return;
  heroPanels[currentSlide].hidden = true;
  heroButtons[currentSlide].removeAttribute('aria-current');
  currentSlide = index;
  heroPanels[currentSlide].hidden = false;
  heroButtons[currentSlide].setAttribute('aria-current', 'true');
}

function updateHeroPlayback() {
  clearInterval(timer);
  heroSlides.setAttribute('aria-live', rotating ? 'off' : 'polite');

  if (rotating && !hovered && !document.hidden) {
    timer = setInterval(() => showHeroSlide((currentSlide + 1) % heroPanels.length), 8000);
  }
}

heroButtons.forEach((button, index) => {
  button.addEventListener('click', () => {
    rotating = false;
    updateHeroPlayback();
    showHeroSlide(index);
  });
});

hero.addEventListener('focusin', () => {
  rotating = false;
  updateHeroPlayback();
});

hero.addEventListener('pointerenter', (event) => {
  if (event.pointerType !== 'mouse') return;
  hovered = true;
  updateHeroPlayback();
});
hero.addEventListener('pointerleave', () => {
  hovered = false;
  updateHeroPlayback();
});

heroMotion.addEventListener('change', () => {
  if (heroMotion.matches) rotating = false;
  updateHeroPlayback();
});
document.addEventListener('visibilitychange', updateHeroPlayback);
heroPicker.hidden = false;
updateHeroPlayback();
