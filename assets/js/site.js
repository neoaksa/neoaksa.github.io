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
  // Wrap tables without changing their semantics or making the page overflow.
  content.querySelectorAll('table').forEach(table => {
    const wrapper = document.createElement('div');
    wrapper.className = 'table-scroll';
    wrapper.tabIndex = 0;
    wrapper.setAttribute('role', 'region');
    wrapper.setAttribute('aria-label', 'Scrollable article table');
    table.replaceWith(wrapper);
    wrapper.append(table);
  });
})();
