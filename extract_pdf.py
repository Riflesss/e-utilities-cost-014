from pathlib import Path
from pypdf import PdfReader

p = Path(r'c:\Users\444\Downloads\e-utilities-cost-plan.md.pdf')
print('exists:', p.exists(), 'size:', p.stat().st_size if p.exists() else 'n/a')
r = PdfReader(str(p))
print('pages:', len(r.pages))
text = '\n'.join(page.extract_text() or '' for page in r.pages)
print(text[:12000])
