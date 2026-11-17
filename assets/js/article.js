const article = document.querySelector('#article-content');

async function renderDiagrams() {
  const blocks = [...article.querySelectorAll('pre > code.language-mermaid')];
  if (!blocks.length) return;
  try {
    const { default: mermaid } = await import('https://cdn.jsdelivr.net/npm/mermaid@11.12.0/dist/mermaid.esm.min.mjs');
    mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: 'base', themeVariables: { primaryColor: '#edf1e9', primaryTextColor: '#173f35', primaryBorderColor: '#779185', lineColor: '#779185', fontFamily: 'system-ui, sans-serif' } });
    for (const [index, block] of blocks.entries()) {
      const source = block.textContent;
      const figure = document.createElement('figure');
      figure.className = 'diagram';
      try {
        const { svg } = await mermaid.render(`article-diagram-${index}`, source);
        const visual = document.createElement('div');
        visual.className = 'diagram-visual';
        visual.innerHTML = svg;
        const details = document.createElement('details');
        const summary = document.createElement('summary');
        summary.textContent = 'View diagram source';
        const pre = document.createElement('pre');
        pre.textContent = source;
        details.append(summary, pre);
        figure.append(visual, details);
        block.parentElement.replaceWith(figure);
      } catch (error) {
        console.warn('Diagram could not be rendered; keeping its source.', error);
      }
    }
  } catch (error) {
    console.warn('Diagram library unavailable; keeping readable source.', error);
  }
}

async function renderMath() {
  try {
    const [{ default: katex }, { default: renderMathInElement }] = await Promise.all([
      import('https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.mjs'),
      import('https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/contrib/auto-render.mjs')
    ]);
    // Kramdown versions emit either TeX delimiters or math/tex script nodes.
    renderMathInElement(article, { throwOnError: false, trust: false });
    article.querySelectorAll('script[type^="math/tex"]').forEach(node => {
      const displayMode = node.type.includes('mode=display');
      const replacement = document.createElement(displayMode ? 'div' : 'span');
      replacement.className = 'math-output';
      katex.render(node.textContent, replacement, { displayMode, throwOnError: false, trust: false });
      node.replaceWith(replacement);
    });
  } catch (error) {
    article.querySelectorAll('script[type^="math/tex"]').forEach(node => {
      const fallback = document.createElement('code');
      fallback.textContent = node.textContent;
      node.replaceWith(fallback);
    });
    console.warn('Math library unavailable; keeping readable source.', error);
  }
}

if (article) {
  await Promise.all([
    article.dataset.mermaid === 'true' ? renderDiagrams() : Promise.resolve(),
    article.dataset.math === 'true' ? renderMath() : Promise.resolve()
  ]);
}
