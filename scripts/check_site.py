"""Validate generated site structure using only the Python standard library."""

from html.parser import HTMLParser
from pathlib import Path
import re
import sys
from urllib.parse import unquote, urlsplit
import xml.etree.ElementTree as ET


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.ids = set()
        self.references = []
        self.headings = 0
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "id" in attrs:
            self.ids.add(attrs["id"])
        if tag == "h1":
            self.headings += 1
        for attribute in ("href", "src"):
            if attribute in attrs:
                self.references.append(attrs[attribute])


def check(root):
    root = root.resolve()
    errors = []
    pages = {}
    for path in root.rglob("*.html"):
        text = path.read_text()
        pages[path] = Page(text)
        if re.search(r"[\u3400-\u9fff]", text):
            errors.append(f"Non-English CJK text in {path.relative_to(root)}")
        if "{{" in text or "{%" in text:
            errors.append(f"Unrendered Liquid in {path.relative_to(root)}")
    for path, page in pages.items():
        if page.headings != 1:
            errors.append(f"Expected one h1: {path.relative_to(root)}")
        for reference in page.references:
            url = urlsplit(reference)
            if url.scheme or url.netloc:
                continue
            relative = unquote(url.path)
            destination = (root / relative.lstrip("/")) if relative.startswith("/") else (path.parent / relative)
            if not relative:
                destination = path
            if destination.is_dir():
                destination /= "index.html"
            destination = destination.resolve()
            if not destination.is_relative_to(root) or not destination.exists():
                errors.append(f"Missing target {reference} from {path.relative_to(root)}")
            elif url.fragment and destination in pages:
                if unquote(url.fragment) not in pages[destination].ids:
                    errors.append(f"Missing fragment {reference} from {path.relative_to(root)}")
    for filename in ("feed.xml", "sitemap.xml"):
        try:
            ET.parse(root / filename)
        except (ET.ParseError, OSError) as error:
            errors.append(f"Invalid {filename}: {error}")
    for name in ("AGENTS.md", "README.md", "Gemfile", "scripts", ".github", "_drafts"):
        if (root / name).exists():
            errors.append(f"Unpublished source included in site: {name}")
    if not pages:
        errors.append("No HTML pages generated")
    if errors:
        print("\n".join(errors), file=sys.stderr)
        return 1
    print(f"Passed: {len(pages)} HTML pages, internal links and fragments, XML, language, and source exclusions.")
    return 0


if __name__ == "__main__":
    sys.exit(check(Path(sys.argv[1] if len(sys.argv) > 1 else "_site")))
