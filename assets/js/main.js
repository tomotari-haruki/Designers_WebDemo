document.documentElement.classList.add('js');

const searchInput = document.querySelector('#search');
const categorySelect = document.querySelector('#category');
const cards = Array.from(document.querySelectorAll('.post-card'));
const tagButtons = Array.from(document.querySelectorAll('[data-tag]'));
const resultCount = document.querySelector('#result-count');
const emptyState = document.querySelector('#empty-state');
const progressBar = document.querySelector('#reading-progress');
let activeTag = 'all';

function normalize(value) {
  return (value || '').toString().trim().toLowerCase();
}

function filterPosts() {
  if (!cards.length) return;

  const query = normalize(searchInput?.value);
  const category = categorySelect?.value || 'all';
  let visibleCount = 0;

  cards.forEach((card) => {
    const searchable = normalize([
      card.dataset.search,
      card.textContent,
      card.dataset.tags,
    ].join(' '));
    const tags = normalize(card.dataset.tags).split(/\s+/);
    const matchesText = !query || searchable.includes(query);
    const matchesCategory = category === 'all' || card.dataset.category === category;
    const matchesTag = activeTag === 'all' || tags.includes(activeTag);
    const isVisible = matchesText && matchesCategory && matchesTag;

    card.hidden = !isVisible;
    visibleCount += isVisible ? 1 : 0;
  });

  if (resultCount) {
    resultCount.textContent = `${visibleCount}件の記事を表示中`;
  }

  if (emptyState) {
    emptyState.hidden = visibleCount !== 0;
  }
}

tagButtons.forEach((button) => {
  button.addEventListener('click', () => {
    activeTag = button.dataset.tag || 'all';
    tagButtons.forEach((item) => {
      const isActive = item === button;
      item.classList.toggle('is-active', isActive);
      item.setAttribute('aria-pressed', String(isActive));
    });
    filterPosts();
  });
});

searchInput?.addEventListener('input', filterPosts);
categorySelect?.addEventListener('change', filterPosts);
filterPosts();

function updateReadingProgress() {
  if (!progressBar) return;

  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? Math.min(scrollTop / maxScroll, 1) : 0;
  progressBar.style.width = `${progress * 100}%`;
}

window.addEventListener('scroll', updateReadingProgress, { passive: true });
window.addEventListener('resize', updateReadingProgress);
updateReadingProgress();

const revealTargets = Array.from(document.querySelectorAll('.reveal'));

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });

  revealTargets.forEach((target) => observer.observe(target));
} else {
  revealTargets.forEach((target) => target.classList.add('is-visible'));
}
