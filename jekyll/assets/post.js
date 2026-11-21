const post = document.querySelector('.post');
const copyButton = post.querySelector('[data-copy-post]');
const shareStatus = post.querySelector('.post-share-status');

if (navigator.clipboard?.writeText) {
  copyButton.hidden = false;
  copyButton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(copyButton.dataset.copyPost);
      shareStatus.textContent = 'Link copied';
    } catch {
      shareStatus.textContent = 'Unable to copy link';
    }
  });
}

const toc = post.querySelector('.post-toc');
const tocDetails = toc.querySelector('details');
const tocList = toc.querySelector('ul');
const headings = [...post.querySelectorAll('.post-body > :is(h2, h3, h4, h5, h6)')];
const sectionLevel = Math.min(...headings.map(heading => Number(heading.tagName[1])));
const sections = headings.filter(heading => Number(heading.tagName[1]) === sectionLevel && heading.textContent.trim());

if (sections.length) {
  const entries = sections.map((heading, index) => {
    if (!heading.id) {
      let id = `post-section-${index + 1}`;
      while (document.getElementById(id)) id += '-section';
      heading.id = id;
    }
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = '#' + encodeURIComponent(heading.id);
    link.textContent = heading.textContent.trim();
    item.append(link);
    tocList.append(item);
    return { heading, link };
  });

  const wide = matchMedia('(min-width: 64rem)');
  const updateToc = () => { tocDetails.open = wide.matches; };
  wide.addEventListener('change', updateToc);
  updateToc();
  toc.hidden = false;

  const header = document.querySelector('.site-header');
  let current;
  let frame;
  const updateCurrent = () => {
    frame = undefined;
    const threshold = header.getBoundingClientRect().bottom + 56;
    let active = entries[0];
    for (const entry of entries) {
      if (entry.heading.getBoundingClientRect().top > threshold) break;
      active = entry;
    }
    if (active === current) return;
    current?.link.removeAttribute('aria-current');
    active.link.setAttribute('aria-current', 'location');
    current = active;
  };
  const scheduleUpdate = () => { frame ??= requestAnimationFrame(updateCurrent); };
  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);
  window.addEventListener('load', scheduleUpdate, { once: true });
  updateCurrent();
}
