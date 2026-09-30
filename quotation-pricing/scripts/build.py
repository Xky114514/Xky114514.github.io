from pathlib import Path
import shutil
ROOT = Path(__file__).resolve().parent.parent
WORK = ROOT / 'src'
OUT = ROOT
css = '\n'.join((WORK / f).read_text(encoding='utf-8') for f in ['gm-style.css','gm-supplement.css'])
layout = (WORK / 'gm-layout.html').read_text(encoding='utf-8')
scripts = '\n'.join((WORK / f).read_text(encoding='utf-8') for f in ['gm-data.js', 'gm-engine.js', 'gm-evidence.js', 'chat-intent-engine.js', 'gm-app.js'])
html = '<!doctype html>\n<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>定价助手 · 观麦口径演示</title><style>' + css + '</style></head><body>' + layout + '<script>' + scripts + '</script></body></html>'
(OUT / 'index.html').write_text(html, encoding='utf-8')
print(f'Built index.html: {len(html):,} characters')
