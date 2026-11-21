const hero = document.querySelector('[data-hero]');
const heroSlides = hero.querySelector('.hero-slides');
const heroPanels = [...heroSlides.children];
const heroPicker = hero.querySelector('.hero-picker');
const heroButtons = [...heroPicker.querySelectorAll('button')];
const heroMotion = matchMedia('(prefers-reduced-motion: reduce)');

let currentSlide = 0;
let rotating = !heroMotion.matches;

function showHeroSlide(index) {
  if (index === currentSlide) return;
  heroPanels[currentSlide].hidden = true;
  heroButtons[currentSlide].removeAttribute('aria-current');
  currentSlide = index;
  heroPanels[currentSlide].hidden = false;
  heroButtons[currentSlide].setAttribute('aria-current', 'true');
}

function updateHeroPlayback() {
  heroPicker.toggleAttribute('data-rotating', rotating);
  heroPicker.toggleAttribute('data-rotation-paused', document.hidden);
  heroSlides.setAttribute('aria-live', rotating ? 'off' : 'polite');
}

heroPicker.addEventListener('animationend', (event) => {
  if (rotating && event.animationName === 'hero-progress' && event.target === heroButtons[currentSlide]) {
    showHeroSlide((currentSlide + 1) % heroPanels.length);
  }
});

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

heroMotion.addEventListener('change', () => {
  if (heroMotion.matches) rotating = false;
  updateHeroPlayback();
});
document.addEventListener('visibilitychange', updateHeroPlayback);
heroPicker.hidden = false;
updateHeroPlayback();
