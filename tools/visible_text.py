"""Print the text inside <main> of an HTML file, one chunk per line (what the PDF should contain).

Elements with the class "eyebrow" are skipped because the print stylesheet hides them.
"""
import sys
from html.parser import HTMLParser

class P(HTMLParser):
    def __init__(self):
        super().__init__()
        self.depth = 0
        self.skip = 0
        self.hidden_tag = None  # tag name of the open "eyebrow" element, if any
    def handle_starttag(self, tag, attrs):
        if tag == 'main': self.depth += 1
        if tag in ('script', 'style'): self.skip += 1
        if 'eyebrow' in (dict(attrs).get('class') or '').split():
            self.hidden_tag = tag
            self.skip += 1
    def handle_endtag(self, tag):
        if tag == 'main': self.depth -= 1
        if tag in ('script', 'style'): self.skip -= 1
        if tag == self.hidden_tag:
            self.hidden_tag = None
            self.skip -= 1
    def handle_data(self, data):
        if self.depth and not self.skip and data.strip(): print(data.strip())

P().feed(open(sys.argv[1], encoding='utf-8').read())
