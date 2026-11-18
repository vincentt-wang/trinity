#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""集數文章不准出現生產過程與自我保留的文字。命中就列出並 exit 1。

用法：
  python3 scripts/check_story_meta.py                 掃 src/epStories.ts 的字串（註解不掃）
  python3 scripts/check_story_meta.py --text a.txt    掃純文字檔（線上頁面抓下來的可見文字）

規則來源：Vincent 2026-11-18。文章只寫事實與判斷，不寫我們怎麼查、查不到什麼、
哪裡推算、文件互相矛盾、樣本大小的保留、「比較穩的講法」，
也不寫更新殘骸（「前一天…這次…」「影片定稿時…」這種拿版本或報導狀態前後變化當內容的句子）。圖表下方只留一行出處。
接法：package.json 的 prebuild 與 deploy／deploy:cf 都會先跑這支。
"""
import re, sys, pathlib

ZH = [
    '沒畫', '沒放', '查無', '查不到', '待查', '待補', '推算', '自算', '樣本', '比較穩',
    '我們的讀法', '這裡比的', '量的不是', '寫法不同', '表決紀錄', '誤差', '沒算進去',
    '定稿', '查得到', '我們查', '無法確認', '無法查證', '尚未查證', '未經查證',
    r'查到\s*20\d\d', r'文中只照',
    # 11/18 補：更新殘骸（拿文章、影片或報導狀態的前後變化當內容）
    '前一天', '這次是', '影片定稿時', '先前只有', '錄音查得到', '當時只有', '後來才',
    '只有匿名', '只能引述匿名', '具名',
]
EN = [
    r'\bour reading\b', r'\bour math\b', r'\bwe could not\b', r'\bwe couldn\\?\'t\b',
    r'\bcould not find\b', r'\bcouldn\\?\'t find\b', r'\bleft out\b', r'\bsmall samples?\b',
    r'\bsafer read\b', r'\bgive or take\b', r'\blast checked\b', r'\bmeasure different\b',
    r'\bnot counted\b', r'\bour estimate\b', r'\bwe estimate\b', r'\bunverified\b',
    r'\bwe were unable\b', r'\bwhen the video was made\b', r'\bfilings disagree\b',
    r'\bthe comparison is about\b', r'\bas far as they go\b', r'\bwe checked\b',
    # 11/18 補：更新殘骸
    r'\bon the record\b', r'\bthis time\b', r'\bat the time the video\b', r'\bearlier reports?\b',
    r'\bthe day before\b', r'\bonly (?:from|cite[ds]?) unnamed\b', r'\bas of when\b',
]
PATS = [(re.compile(p), p) for p in ZH] + [(re.compile(p, re.I), p) for p in EN]


def strings_from_ts(src: str):
    """回傳 (行號, 字串內容)。先剝註解，再抓單引號字串。"""
    out = []
    i, n, line = 0, len(src), 1
    while i < n:
        c = src[i]
        if c == '\n':
            line += 1; i += 1; continue
        if src.startswith('//', i):
            j = src.find('\n', i); i = n if j < 0 else j; continue
        if src.startswith('/*', i):
            j = src.find('*/', i + 2); seg = src[i:(n if j < 0 else j + 2)]
            line += seg.count('\n'); i += len(seg); continue
        if c in "'\"`":
            q, j, buf, start = c, i + 1, [], line
            while j < n and src[j] != q:
                if src[j] == '\\' and j + 1 < n:
                    buf.append(src[j + 1]); j += 2; continue
                if src[j] == '\n':
                    line += 1
                buf.append(src[j]); j += 1
            out.append((start, ''.join(buf))); i = j + 1; continue
        i += 1
    return out


def scan(items):
    hits = []
    for where, text in items:
        if text.startswith('http'):
            continue
        plain = re.sub(r'<[^>]+>', '', text)
        for rx, p in PATS:
            m = rx.search(plain)
            if m:
                a = max(0, m.start() - 25)
                hits.append((where, p, plain[a:m.end() + 25]))
    return hits


def main():
    args = sys.argv[1:]
    if args and args[0] == '--text':
        items = []
        for f in args[1:]:
            for k, ln in enumerate(pathlib.Path(f).read_text().splitlines(), 1):
                items.append((f'{f}:{k}', ln))
    else:
        root = pathlib.Path(__file__).resolve().parent.parent
        f = root / 'src' / 'epStories.ts'
        items = [(f'epStories.ts:{ln}', s) for ln, s in strings_from_ts(f.read_text())]
    hits = scan(items)
    for where, p, ctx in hits:
        print(f'{where}  [{p}]  …{ctx}…')
    if hits:
        print(f'\n{len(hits)} 處生產過程／自我保留文字。改成只寫事實，或拿掉那個事實。')
        sys.exit(1)
    print(f'check_story_meta: 0 hits（{len(items)} 段）')


if __name__ == '__main__':
    main()
