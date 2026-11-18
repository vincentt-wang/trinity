#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""集數文章要 7 分鐘內讀完。算每篇已發布文章的中英正文字數與閱讀分鐘，超過就 exit 1。

用法：python3 scripts/check_story_length.py

算法只有一份，在 src/storyLength.ts（頁面標題下的「約 N 分鐘」也用它），這支透過 node 呼叫。
正文不含出處清單。中文 400 字／分鐘，英文 230 字／分鐘，上限 READ_MAX_MIN 分鐘。
規則來源：Vincent 2026-11-18「7 分鐘內要可以讀完，不要太冗長。」
接法：package.json 的 prebuild、deploy、deploy:cf 都會先跑；手動部署照 README 先跑這支。
"""
import json, pathlib, subprocess, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
JS = """
import { EP_STORY } from './src/epStories.ts'
import { EPISODES } from './src/episodeData.ts'
import { countWords, readMinutes, READ_MAX_MIN } from './src/storyLength.ts'
const out = { max: READ_MAX_MIN, eps: [] }
for (const [slug, s] of Object.entries(EP_STORY)) {
  const ep = EPISODES.find((e) => e.slug === slug)
  out.eps.push({ slug, published: !!(ep && ep.published),
    zh: [countWords(s.zh, 'zh'), readMinutes(s.zh, 'zh')], en: [countWords(s.en, 'en'), readMinutes(s.en, 'en')] })
}
console.log(JSON.stringify(out))
"""


def main():
    r = subprocess.run(['node', '--experimental-strip-types', '--no-warnings', '--input-type=module', '-e', JS],
                       cwd=ROOT, capture_output=True, text=True)
    if r.returncode != 0:
        print(r.stderr, file=sys.stderr)
        sys.exit(2)
    d = json.loads(r.stdout.strip().splitlines()[-1])
    bad = 0
    for e in d['eps']:
        tag = '' if e['published'] else '（未發布，不檢查）'
        print(f"{e['slug']}  中文 {e['zh'][0]:>5} 字 約 {e['zh'][1]} 分鐘 ｜ 英文 {e['en'][0]:>5} words {e['en'][1]} min {tag}")
        if e['published'] and (e['zh'][1] > d['max'] or e['en'][1] > d['max']):
            bad += 1
    if bad:
        print(f"\n{bad} 篇超過 {d['max']} 分鐘，請精簡後再部署。", file=sys.stderr)
        sys.exit(1)
    print(f"\n已發布文章都在 {d['max']} 分鐘內。")


if __name__ == '__main__':
    main()
