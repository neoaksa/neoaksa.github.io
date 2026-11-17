# Neoaksa Notes

A Markdown-first personal blog at https://neoaksa.github.io.

## Publishing policy

All published content must be in English, including articles, interface text, documentation, filenames, and commit messages.

## Add an article

Create `_posts/YYYY-MM-DD-short-slug.md`:

```yaml
---
title: "An article title"
description: "A short summary for article lists and search previews."
date: 2026-11-17 10:00:00 -0500
categories: [Data Science]
tags: [Feature Engineering]
permalink: /articles/a-stable-slug/
mermaid: false
math: false
---
```

Write Markdown below the front matter. Use one broad category and a few specific tags. Keep `permalink` unchanged when editing titles or categories. Use distinct permalinks and avoid category/tag names that normalize to the same URL fragment.

Set `mermaid: true` for fenced `mermaid` diagrams. Set `math: true` for Kramdown math notation: inline `$$x^2$$` or a display block with `$$` on separate lines. Mermaid and KaTeX load only when requested, from pinned CDN versions. Diagrams retain a source toggle, and the script preserves readable source if loading fails.

Put images under `assets/images/<article-slug>/` and use descriptive alt text. No images are required for the first article; its diagrams are generated from text.

## Preview locally

With a compatible Ruby and Bundler installation:

```sh
bundle install
bundle exec jekyll serve --strict_front_matter
```

Open http://127.0.0.1:4000. For a production build:

```sh
JEKYLL_ENV=production bundle exec jekyll build --strict_front_matter
python3 scripts/check_site.py _site
```

The checker verifies generated internal links, fragments, XML feeds, English-only content, and unpublished-file exclusions. Also check diagrams, math, keyboard navigation, and mobile layout in a browser.

## Deploy

The site uses GitHub Pages' built-in Jekyll build from `main` at `/`, preserving the repository's existing publishing setup. In **Settings → Pages**, use **Deploy from a branch**, select `main`, and select `/ (root)`.

GitHub Pages automatically builds and deploys pushes to the publishing branch. The separate `Validate blog` workflow builds and checks pushes and pull requests. It does not gate the built-in deployment; use a pull request and wait for validation before merging future changes.

The public repository exposes every committed file. An `_drafts/` directory prevents normal publication to the site, but does not make draft text private. Keep private or unfinished material outside this repository until publication is authorized.

## Structure

- `_posts/`: published Markdown articles.
- `_layouts/`, `_includes/`: reusable page templates.
- `assets/`: styles, scripts, and images.
- `_config.yml`: site settings.
- `articles.html`, `categories.html`, `tags.html`: generated browsing pages.
- `scripts/check_site.py`: output checks.

No third-party theme or Jekyll plugin is required.
