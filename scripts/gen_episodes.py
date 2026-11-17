"""把 V 影片六集（vr_content.py）搬進 Trinity：產 src/episodes.ts，複製影片與縮圖到 public/ep/。
usage: python3 scripts/gen_episodes.py   （改 vr_content.py 之後重跑，再 build）"""
import json, os, shutil, sys
SRC = "/Users/admin/Downloads/0｜Other/2｜Studio/09_vincent-profile/_social_kit/V怪客影片/06_網站"
sys.path.insert(0, SRC)
from vr_content import EPISODES, LEVEL_EN
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# published：Vincent 准許發布才改 true（261117）。重跑時保留 src/episodeData.ts 現有的值，新集數預設 false。
PUBLISHED = {}
_cur = os.path.join(HERE, "src", "episodeData.ts")
if os.path.exists(_cur):
    _s = open(_cur, encoding="utf-8").read()
    _k = "EPISODES: Episode[] = "
    if _k in _s:
        for _e in json.loads(_s[_s.index(_k) + len(_k):].strip()):
            PUBLISHED[_e["slug"]] = bool(_e.get("published", False))
out = []
for e in EPISODES:
    nn = f"{e['n']:02d}"
    out.append({
        "slug": f"ep{nn}", "n": e["n"], "published": PUBLISHED.get(f"ep{nn}", False),
        "en": {"title": e["title_en"], "term": e["term_en"], "desc": e["desc_en"], "body": [b[0] for b in e["body"]],
               "quoteBy": e["quote_by_en"], "quote": e["quote_en"], "quoteNote": e.get("quote_note_en", ""), "ask": ((e["ask_en"] + " ") if e["ask_en"] else "") + "What do you think?"},
        "zh": {"title": e["title_zh"], "term": e["term_zh"], "desc": e["desc_zh"], "body": [b[1] for b in e["body"]],
               "quoteBy": e["quote_by_zh"], "quote": e["quote_zh"], "quoteNote": e.get("quote_note_zh", ""), "ask": (e["ask_zh"] or "") + "你怎麼想？", "quoteOrig": e["quote_en"]},
        "sources": [{"label": s[0], "levelZh": s[1], "levelEn": LEVEL_EN.get(s[1], s[1]), "url": s[2] if (s[2] and s[1] == "一手") else None} for s in e["sources"]],
    })
    for ext in ("mp4", "jpg"):
        shutil.copy2(os.path.join(SRC, "public", "media", f"ep{nn}.{ext}"), os.path.join(HERE, "public", "ep", f"ep{nn}.{ext}"))
ts = ("// 由 scripts/gen_episodes.py 從 V怪客影片/06_網站/vr_content.py 產生，不要手改。\n"
      "// body 內含 <mark>，是我們自己寫的正本文字。\n"
      "// published：Vincent 准許發布才改成 true。false 的集數不出現在列表、網址顯示未發布並 noindex（重跑本腳本會保留這個值）。\n"
      "export type EpLang = { title: string; term: string; desc: string; body: string[]; quoteBy: string; quote: string; quoteNote: string; ask: string; quoteOrig?: string }\n"
      "export type Episode = { slug: string; n: number; published: boolean; en: EpLang; zh: EpLang; sources: { label: string; levelZh: string; levelEn: string; url: string | null }[] }\n"
      f"export const EPISODES: Episode[] = {json.dumps(out, ensure_ascii=False, indent=1)}\n")
open(os.path.join(HERE, "src", "episodeData.ts"), "w", encoding="utf-8").write(ts)
print("episodes:", len(out))
