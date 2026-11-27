// Hover (or focus, or tap) an author's name to see their member profile.
// Cards come from the hub's public author endpoint; a name with no public
// profile stays plain text.
const names = [...document.querySelectorAll('.author-name[data-author]')];
const cache = new Map();
let card;
let owner;
let hideTimer;

function load(el) {
  const name = el.dataset.author;
  if (!cache.has(name)) {
    cache.set(
      name,
      fetch(`${el.dataset.hub}/api/public/authors/${encodeURIComponent(name)}`, { credentials: 'omit' })
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null)
    );
  }
  return cache.get(name);
}

function build(data, hub) {
  const root = document.createElement('div');
  root.className = 'author-card';
  root.id = 'author-card';
  root.setAttribute('role', 'tooltip');

  const head = document.createElement('div');
  head.className = 'author-card-head';
  if (data.avatarUrl) {
    const img = document.createElement('img');
    img.src = hub + data.avatarUrl;
    img.alt = '';
    img.width = 48;
    img.height = 48;
    head.append(img);
  } else {
    const initial = document.createElement('span');
    initial.className = 'author-card-initial';
    initial.setAttribute('aria-hidden', 'true');
    initial.textContent = data.name.trim().charAt(0).toUpperCase();
    head.append(initial);
  }
  const who = document.createElement('div');
  const strong = document.createElement('strong');
  strong.textContent = data.name;
  who.append(strong);
  const sub = [data.title, data.pronouns].filter(Boolean).join(', ');
  if (sub) {
    const s = document.createElement('span');
    s.className = 'meta';
    s.textContent = sub;
    who.append(s);
  }
  head.append(who);
  root.append(head);

  for (const [text, cls] of [[data.headline, 'author-card-headline'], [data.bio, 'author-card-bio']]) {
    if (!text) continue;
    const p = document.createElement('p');
    p.className = cls;
    p.textContent = text;
    root.append(p);
  }

  const links = (data.links || []).filter((l) => /^https:\/\//.test(l.url));
  if (links.length) {
    const ul = document.createElement('ul');
    ul.className = 'author-card-links';
    for (const l of links) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = l.url;
      a.rel = 'noopener';
      a.target = '_blank';
      a.textContent = l.label;
      li.append(a);
      ul.append(li);
    }
    root.append(ul);
  }
  return root;
}

function place(el) {
  const r = el.getBoundingClientRect();
  const w = card.offsetWidth;
  const left = Math.max(8, Math.min(window.innerWidth - w - 8, r.left));
  const below = r.bottom + 8;
  const top = below + card.offsetHeight > window.innerHeight && r.top > card.offsetHeight + 16 ? r.top - card.offsetHeight - 8 : below;
  card.style.left = `${left + window.scrollX}px`;
  card.style.top = `${top + window.scrollY}px`;
}

function hide() {
  clearTimeout(hideTimer);
  if (owner) owner.removeAttribute('aria-describedby');
  card?.remove();
  card = owner = undefined;
}

async function show(el) {
  clearTimeout(hideTimer);
  if (owner === el) return;
  hide();
  const data = await load(el);
  // Skip if the reader moved on while the card loaded.
  if (!data || !el.matches(':hover, :focus, .author-open')) return;
  hide();
  card = build(data, el.dataset.hub);
  card.addEventListener('pointerenter', () => clearTimeout(hideTimer));
  card.addEventListener('pointerleave', () => (hideTimer = setTimeout(hide, 150)));
  document.body.append(card);
  owner = el;
  el.setAttribute('aria-describedby', 'author-card');
  place(el);
}

for (const el of names) {
  el.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'touch') show(el); });
  el.addEventListener('pointerleave', () => (hideTimer = setTimeout(hide, 150)));
  el.addEventListener('focus', () => show(el));
  el.addEventListener('blur', () => (hideTimer = setTimeout(hide, 150)));
  el.addEventListener('click', () => {
    if (owner === el) return hide();
    el.classList.add('author-open');
    show(el);
  });
  // A name with no public profile stays plain text.
  load(el).then((data) => { if (!data) { el.removeAttribute('tabindex'); el.classList.add('author-plain'); } });
}

document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hide(); });
document.addEventListener('pointerdown', (e) => {
  if (card && !card.contains(e.target) && e.target !== owner) { owner?.classList.remove('author-open'); hide(); }
});
addEventListener('scroll', () => { if (owner) place(owner); }, { passive: true });
