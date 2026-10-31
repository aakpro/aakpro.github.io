"""Overwrite a PDF's Info dictionary in place (same byte length), leaving page content untouched.

Rewriting the PDF through PDFKit/Quartz would reorder the text layer, so the Info object is
patched at the byte level instead. Usage: pdf_metadata.py in.pdf out.pdf
"""
import re, sys

TITLE = 'Amir Kashani — Resume'
AUTHOR = 'Amir Kashani'
SUBJECT = 'Senior iOS Engineer - Staff and Lead roles'  # ASCII only: the new dict must not outgrow the old one

src, dst = sys.argv[1], sys.argv[2]
b = open(src, 'rb').read()
trailer = re.findall(rb'trailer\s*(<<.*?>>)', b, re.S)[-1]
info_num = re.search(rb'/Info\s+(\d+)\s+0\s+R', trailer).group(1)
m = re.search(rb'(?<![0-9])' + info_num + rb'\s+0\s+obj\s*(<<.*?>>)\s*endobj', b, re.S)
old = m.group(1)

def text(s):
    return b'<FEFF' + s.encode('utf-16-be').hex().upper().encode() + b'>'

producer = re.search(rb'/Producer\s*(\([^)]*\))', old).group(1)
dates = b'\n'.join(re.findall(rb'/(?:CreationDate|ModDate)\s*\([^)]*\)', old))
new = (b'<</Title ' + text(TITLE) +
       b'\n/Author (' + AUTHOR.encode() + b')\n/Creator (' + AUTHOR.encode() + b')' +
       b'\n/Subject (' + SUBJECT.encode() + b')' +
       b'\n/Producer ' + producer + b'\n' + dates + b'>>')
assert len(new) <= len(old), (len(new), len(old))
new += b' ' * (len(old) - len(new))
out = b[:m.start(1)] + new + b[m.end(1):]
assert len(out) == len(b)
open(dst, 'wb').write(out)
print(f'Info object {info_num.decode()}: {len(old)} bytes rewritten in place; file size unchanged ({len(out)} bytes)')
