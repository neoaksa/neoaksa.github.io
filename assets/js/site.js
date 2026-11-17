(() => {
  const content = document.querySelector('#article-content');
  const toc = document.querySelector('.toc');
  const list = document.querySelector('#toc-list');
  if (!content || !toc || !list) return;
  const headings = [...content.querySelectorAll('h2')];
  headings.forEach((heading, index) => {
    if (!heading.id) heading.id = `section-${index + 1}`;
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = `#${heading.id}`;
    link.textContent = heading.textContent;
    item.append(link);
    list.append(item);
  });
  if (headings.length) toc.hidden = false;
  const tocMenu = toc.querySelector('details');
  if (tocMenu && window.matchMedia('(max-width: 1000px)').matches) tocMenu.open = false;
  const links = [...list.querySelectorAll('a')];
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting);
      if (!visible.length) return;
      const id = visible[0].target.id;
      links.forEach(link => {
        if (link.hash === `#${id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '0px 0px -65% 0px' });
    headings.forEach(heading => observer.observe(heading));
  }
  // Wrap tables without changing their semantics or making the page overflow.
  content.querySelectorAll('table').forEach(table => {
    const wrapper = document.createElement('div');
    wrapper.className = 'table-scroll';
    wrapper.tabIndex = 0;
    wrapper.setAttribute('role', 'region');
    wrapper.setAttribute('aria-label', 'Scrollable article table');
    table.replaceWith(wrapper);
    wrapper.append(table);
    const hint = document.createElement('p');
    hint.className = 'table-hint';
    hint.textContent = 'Scroll horizontally to read all columns.';
    hint.hidden = true;
    wrapper.before(hint);
    const updateHint = () => { hint.hidden = wrapper.scrollWidth <= wrapper.clientWidth + 1; };
    updateHint();
    if ('ResizeObserver' in window) new ResizeObserver(updateHint).observe(wrapper);
  });
})();
