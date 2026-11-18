// Trinity 新集數信（261118）。名單與寄信都在 vincent.easeai.com.tw 的 worker（09_vincent-profile/src/nl.js），這支只負責把集數內容送過去。
//
// ★ 261118 晚起，預設走 Venture Relations 週信自動排程（worker 的 nl_weekly.js）：週三 08:30 預覽給 Vincent、週四 08:30 寄出，
//   挑已發布、沒寄過、成效最好的一篇。文案寫在 src/nlIssues.ts，改完跑 scripts/nl_build.mjs 再部署。
//   下面的 test／send 是舊的手動路徑，留給主線特殊情況用，平常不要用（send 寄出的集數也會被週信記成已寄，不會重複）。
//
//   node --experimental-strip-types scripts/nl_ep.mjs wk dry [--bad]       週信挑選結果與寄前檢查，不寄信（--bad 塞一條壞連結驗證會擋）
//   node --experimental-strip-types scripts/nl_ep.mjs wk test [ep04] [--bad] [--preview]   週信測試信，只寄 vincent@easeai.com.tw
//
//   node --experimental-strip-types scripts/nl_ep.mjs check          已發布、還沒寄過測試信的集數：各寄一組測試信（中英各一封）只給 vincent@easeai.com.tw
//   node --experimental-strip-types scripts/nl_ep.mjs test ep04 [--force]   指定集數寄測試信（--force 重寄）
//   node --experimental-strip-types scripts/nl_ep.mjs send ep04 --dry       只看會寄給幾位訂閱者
//   node --experimental-strip-types scripts/nl_ep.mjs send ep04 --yes       真的寄給訂閱者。只在 Vincent 於 V Studio 按「寄給訂閱者」之後跑
//
// 安全：兩支 API 都要 owner token（~/.config/secure/vincent_nl_test_token），worker 端另外擋：沒寄過測試信不能 send、同一集只能 send 一次。
// 信件內容：標題＝episodeData 的 title，摘要＝desc（我們自己寫的正本，不另寫）。連結 /insight/epNN?s=email-epNN，圖 /ep/epNN.jpg。
import { readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { EPISODES } from '../src/episodeData.ts'

const API = 'https://vincent.easeai.com.tw/api/nl/'
// 261118 以前就上線的集數，Vincent 沒決定前不補寄
const NO_BACKFILL = ['ep01', 'ep02', 'ep03']

const [cmd, slug, ...flags] = process.argv.slice(2)
const tok = readFileSync(homedir() + '/.config/secure/vincent_nl_test_token', 'utf8').trim()
const call = async (p, body) => {
  const r = await fetch(API + p, { method: 'POST', headers: { 'x-nl-token': tok, 'content-type': 'application/json' }, body: JSON.stringify(body) })
  const j = await r.json().catch(() => ({}))
  return { status: r.status, ...j }
}
const payload = (e) => ({ slug: e.slug, n: e.n, zh: { t: e.zh.title, s: e.zh.desc }, en: { t: e.en.title, s: e.en.desc } })
const find = (s) => {
  const e = EPISODES.find((x) => x.slug === s)
  if (!e) { console.error('找不到集數', s); process.exit(1) }
  if (!e.published) { console.error(s, '還沒發布（published:false），不寄'); process.exit(1) }
  return e
}

if (cmd === 'wk' && (slug === 'dry' || slug === 'test')) {
  const ep = flags.find((x) => /^ep\d\d$/.test(x))
  const body = { slug: ep, preview: flags.includes('--preview'), badLink: flags.includes('--bad') ? 'https://vincent.easeai.com.tw/nl/this-link-is-broken' : '' }
  const r = await call(slug === 'dry' ? 'wk-dry' : 'wk-test', body)
  console.log(JSON.stringify(r, null, 1))
  if (r.ok === false) process.exit(1)
} else if (cmd === 'check') {
  for (const e of EPISODES.filter((x) => x.published && !NO_BACKFILL.includes(x.slug))) {
    const r = await call('ep-test', payload(e))
    console.log(e.slug, r.skipped ? '已寄過測試信 ' + r.at : r.ok ? '測試信已寄（只寄 vincent@easeai.com.tw）' : '失敗 ' + JSON.stringify(r))
  }
} else if (cmd === 'test' && slug) {
  const r = await call('ep-test', { ...payload(find(slug)), force: flags.includes('--force') })
  console.log(slug, JSON.stringify(r))
} else if (cmd === 'send' && slug && (flags.includes('--dry') || flags.includes('--yes'))) {
  find(slug)
  const r = await call('ep-send', { slug, dry: !flags.includes('--yes') })
  console.log(slug, JSON.stringify(r))
  if (!r.ok) process.exit(1)
} else {
  console.log('用法見檔頭註解。send 一定要帶 --dry 或 --yes。')
  process.exit(2)
}
