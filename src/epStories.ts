// 集數文章 v2（261118）：統一版型。手寫正本，不由 gen_episodes.py 產生，重跑腳本不會蓋掉。
// 版型順序：情境圖 → 影片回顧（約兩成，含影片）→ 延伸（約八成，中間插分析圖）→ 投票 → 出處 → 點子 CTA → 系列輪播。
// 事實出處：V怪客影片/03_查核/ 的 EP_黃仁勳願意回來_261118.md、EP_黃仁勳回得來嗎_261117.md、JE02_董事會名單_261116.md、
// FounderMarketFit_YC_261116.md、結尾名人觀點_261116.md、L02_FirstRound_Superhuman原文_261114.md；261118 另查的都附在 sources。
// 規則：不編事實與原話；中文零破折號；改完把中英文字抽出來跑 check_voice.py。

export type Source = { what: string; label: string; url: string; level: 'p' | 'n' | 's' }

export type StoryItem = { k: string; v: string; src?: string }
export type StorySec = { h: string; lead?: string; paras?: string[]; items?: StoryItem[]; note?: string }
export type ChartRow = { label: string; v: number; show: string; hl?: boolean }
export type StoryChart = { h: string; lead?: string; max: number; rows: ChartRow[]; line?: { v: number; label: string }; note: string }
export type SceneData =
  | { kind: 'board'; cap: string; groups: { n: number; label: string }[]; empty: string }
  | { kind: 'handoff'; cap: string; from: { name: string; sub: string }; to: { name: string; sub: string }; mid: string }
  | { kind: 'paths'; cap: string; him: { who: string; said: string }; board: { who: string; said: string }; door: string; paths: string[] }
  | { kind: 'three'; cap: string; cards: { q: string; bar: string }[] }
export type StoryPoll = { id: string; q: string; opts: { k: string; t: string }[]; after: string }
export type StoryLang = {
  scene: SceneData
  recapH: string; recap: string[]
  sections: StorySec[]
  chartAfter: number
  chart: StoryChart
  poll: StoryPoll
  sourcesH: string; levels: { p: string; n: string; s: string }; sources: Source[]; srcNote: string
}

const U = {
  jensenX: 'https://x.com/JensenHuang/status/2122726005219737649',
  cnbcTv: 'https://www.youtube.com/watch?v=XjdqKUf5cUk&t=13s',
  bbgTv: 'https://www.youtube.com/watch?v=N3zMAoJijpc&t=118s',
  bylaws: 'https://www.sec.gov/Archives/edgar/data/1045810/000104581024000069/exhibit31-amendedandrestat.htm',
  nasdaq: 'https://listingcenter.nasdaq.com/rulebook/nasdaq/rules/nasdaq-5600-series',
  nvproxy: 'https://www.sec.gov/Archives/edgar/data/1045810/000104581026000036/nvda-20260512.htm',
  k8nora: 'https://www.sec.gov/Archives/edgar/data/1045810/000104581026000028/nvda-20260507.htm',
  innis24: 'https://corpgov.law.harvard.edu/2024/06/15/2024-proxy-season-trends-mid-season-review/',
  innis23: 'https://corpgov.law.harvard.edu/2024/02/28/2024-proxy-season-trends-zenith-or-nadir/',
  disneyWsj: 'https://pages.stern.nyu.edu/~adamodar/New_Home_Page/articles/Disney/Disneymeeting.htm',
  disneyCc: 'https://www.thecorporatecounsel.net/blog/2005/07/truce-in-the-disney-boardroom-but-is-having-a-director-emeritus-good-governance.html',
  hpCnn: 'https://money.cnn.com/2002/03/19/news/deals/hp_compaq/index.htm',
  hpTally: 'https://www.plansponsor.com/h-p-claims-victory-again-in-shareholder-tally/',
  hpEweek: 'https://www.eweek.com/pc-hardware/hewlett-wont-appeal-ruling/',
  oaiX: 'https://x.com/OpenAI/status/1727206187077370115',
  verge: 'https://www.theverge.com/2024/3/8/24094885/openai-sam-altman-investigation-board-results',
  pjPill: 'https://fortune.com/2018/07/23/papa-johns-adopts-poison-pill/',
  pjExit: 'https://www.nbcnews.com/business/business-news/papa-john-s-founder-john-schnatter-leave-board-settlement-deal-n979306',
  cnbcBoard: 'https://www.cnbc.com/2026/11/16/nvidia-ceo-jensen-huang.html',
  newsroom: 'https://nvidianews.nvidia.com/news/nvidia-announces-ceo-transition',
  buffett: 'https://www.berkshirehathaway.com/letters/2002pdf.pdf',
  semafor: 'https://www.semafor.com/article/11/16/2026/altimeters-gerstner-urges-nvidias-board-to-reconsider-huangs-ouster-to-get-this-right',
  tenK: 'https://www.sec.gov/Archives/edgar/data/1045810/000104581026000021/nvda-20260125.htm',
  kress: 'https://nvidianews.nvidia.com/bios/colette-kress',
  dixon: 'https://cdixon.org/2011/06/19/foundermarket-fit/',
  horowitz: 'https://a16z.com/why-we-prefer-founding-ceos/',
  ycFriedman: 'https://www.ycombinator.com/library/8g-how-to-get-startup-ideas',
  ap: 'https://www.pbs.org/newshour/politics/trump-backs-campaign-to-reinstate-huang-as-ceo-of-nvidia',
  superhuman: 'https://review.firstround.com/how-superhuman-built-an-engine-to-find-product-market-fit',
  ellis: 'http://web.archive.org/web/20100101133515/http://startup-marketing.com:80/the-startup-pyramid/',
  ycRetain: 'https://www.youtube.com/watch?v=VNxBZ7ka5J0',
  ycMetrics: 'https://www.youtube.com/watch?v=fdD4y4Civp4',
}
const LV_ZH = { p: '一手', n: '媒體報導', s: '多家轉述' }
const LV_EN = { p: 'Primary', n: 'News report', s: 'Secondary' }

/* ───────────────────────── EP03 ───────────────────────── */

const EP03_ZH: StoryLang = {
  scene: {
    kind: 'paths',
    cap: '他說好，董事會說不。門外還有四條路。',
    him: { who: '黃仁勳，11/17 在 X', said: '如果董事會認為我回來，對股東、員工、公司和美國最好，我很榮幸回任執行長。' },
    board: { who: '董事長 Harvey Jones，同日財報會議', said: '董事會不打算讓他回任執行長。' },
    door: '董事會 10 席',
    paths: ['代理權之爭', 'Proxy access 兩席', '股東臨時會', '撤換董事'],
  },
  recapH: '影片的結論：董事會說了算',
  recap: [
    '影片從一個數字開始：美國一份研究裡，大約 45% 的年輕人分手後又復合過。公司也會跟創辦人分手。Jobs 回到 Apple，靠的是 Apple 買下 NeXT；馬斯克被 X.com 換掉後，再也沒回去。結論只有一句：<mark>除非創辦人握有投票權，不然董事會說了算。</mark>黃仁勳持股 3.58%，一股一票，連董事席也辭了。',
  ],
  sections: [
    {
      h: '11 月 17 日，他說好，董事會說不',
      paras: [
        '美東時間 11 月 17 日上午，黃仁勳在 X 發了一篇長文。他先認錯：沒有做到 Nvidia 對每個人的要求，私生活上犯了嚴重的錯，會配合董事會的獨立調查。',
        '接著他寫，如果董事會認為他回來，對股東、員工、公司和美國最好，他「很榮幸回應這些呼聲，回任執行長」。他講的是執行長，<b>董事席一個字都沒提</b>。',
        '大約五個半小時後，Nvidia 開第三季財報電話會議。董事長 Harvey Jones 一開場就說，董事會一致接受他的辭職，<mark>「不打算讓 Jensen 回任執行長」</mark>。前一天各家報導只能引述匿名人士，這次是董事長具名、公開講，錄音查得到。',
        '他也說，接班人選內部、外部都會找，不會為了快而隨便定人。',
      ],
      note: '董事長這句話沒有公開的表決紀錄，是他以董事長身分代表董事會發言。',
    },
    {
      h: '董事會說不，股東手上還有四條路',
      lead: '董事會不點頭，就要換掉董事會裡的人，或讓股東直接表態。依 Nvidia 章程（2024 年 3 月修訂版），股東有這四條路。',
      items: [
        { k: '1. 代理權之爭（proxy fight）', v: '股東自己提名董事候選人，自己寄委託書（proxy，寄給全體股東的投票說明與選票）拉票，跟公司提的名單對決。章程沒有限制被提名人的身分，所以黃仁勳<b>可以自費提名自己</b>。有對手的選舉，改成得票最多的人當選。', src: 'Nvidia 章程第 5(b) 條' },
        { k: '2. Proxy access（借公司的委託書提名）', v: '持股 3% 以上、滿三年的股東，最多 20 人合併計算，可以把候選人直接放進公司寄出的委託書，省下自己拉票的錢。名額是兩席或董事人數的 20%，取大的；十席就是<b>兩席</b>。條件是被提名人必須獨立。', src: 'Nvidia 章程第 5(h) 條' },
        { k: '3. 股東臨時會', v: '持股 15% 以上、持有滿一年的股東，可以書面要求召開臨時會，不必等年會。最大的兩家股東 BlackRock 7.43% 加 Vanguard 7.31%，合計 14.74%，<b>兩家加起來還差一點</b>。', src: 'Nvidia 章程第 6 條；Nvidia 2026 年委託書' },
        { k: '4. 直接撤換現任董事', v: '有正當理由，過半數就能撤換；沒有理由，要三分之二（66⅔%）的票。', src: 'Nvidia 章程第 21 條' },
      ],
    },
    {
      h: '他能提兩位盟友，提不了自己',
      paras: [
        'Proxy access 是最便宜的一條。他持股 3.58%，跨過 3% 的門檻，持有時間也早就超過三年。',
        '卡住的是獨立性。Nasdaq 規則規定，三年內當過公司員工的人，不算獨立董事，從離職那天起算。他 2026 年 11 月卸任，<mark>要到 2029 年才算獨立</mark>。這條路他能送兩位盟友進董事會，送不了自己。',
        '兩位盟友就算當選，離董事會過半還很遠。',
        '要提名自己，只能走第一條：自費打代理權之爭。提名窗口在前一年股東會週年日前 120 到 90 天。Nvidia 2026 年股東會在 6 月 24 日，推算 2027 年的窗口大約是 <b>2 月 24 日到 3 月 26 日</b>。',
      ],
      note: '窗口是依章程推算；如果 2027 年股東會日期移動超過 30 天，規則另算。他辭職後有沒有賣股，查無。',
    },
    {
      h: '代理權之爭，經營層比較常贏嗎？',
      paras: [
        '要看年份。委託書徵求公司 Innisfree 統計了 2024 年上半年美國走到投票的 8 場代理權之爭：<mark>7 場經營層一席都沒丟</mark>。唯一的例外是鐵路公司 Norfolk Southern。',
        '2023 年卻反過來。同一家公司的另一份統計：市值 10 億美元以上的大型公司，代理權之爭經營層全拿的比例只有 25%，2020 到 2022 年是 68.4%。',
        'Innisfree 兩邊的案子都接，算不上利益方，但 8 場的樣本很小。比較穩的講法是：經營層有主場優勢，但大公司的挑戰者，近年贏得比以前多。',
      ],
    },
    {
      h: '四個前例，四種結局',
      items: [
        { k: 'Roy E. Disney，迪士尼，2003 到 2005', v: '迪士尼家族成員。2003 年 11 月，董事會準備用退休年齡規定讓他下台，他先辭了董事，和盟友 Stanley Gold 發起 Save Disney 運動。2004 年 3 月股東會，<b>43% 的投票股數</b>拒投執行長 Michael Eisner。當晚董事會拔掉 Eisner 的董事長，由 George Mitchell 接任，Eisner 留任執行長。2005 年 7 月和解，Roy 回來當沒有表決權的榮譽董事；同年 9 月 Eisner 離任。這是號召股東拒投，不是另提名單。', src: 'WSJ 2004-03-04（NYU 轉載）；TheCorporateCounsel.net，2005-07-12' },
        { k: 'Walter Hewlett，HP，2002', v: 'HP 共同創辦人 Bill Hewlett 的兒子，當時是 HP 董事。他反對 HP 併購 Compaq，自己打代理權之爭。初步計票 <b>51.4% 對 48.6%</b>，併購過關。他告 HP 施壓德意志銀行在最後一刻改票，2002 年 4 月德拉瓦法院判 HP 勝訴，他沒有上訴。', src: 'CNN Money，2002-03-19；PlanSponsor；eWeek，2002' },
        { k: 'Sam Altman，OpenAI，2023', v: 'OpenAI 是非營利組織控制，沒有一般股東可以投票，他的籌碼是員工。被開除後，大部分員工簽信揚言離職。五天後他回任執行長，<b>同時換上新的董事會</b>：Bret Taylor、Larry Summers、Adam D\'Angelo。他自己的董事席，要到 2024 年 3 月才回來。', src: 'OpenAI 官方 X，2023-11-22；The Verge，2024-03-08' },
        { k: 'John Schnatter，Papa John\'s，2018 到 2019', v: '創辦人。2018 年 7 月，他在內部電話會議用了種族歧視字眼，被揭露後辭去董事長。他和關係人當時持股超過 30%，董事會隨即通過毒丸（poison pill，有人持股超過門檻，其他股東就能低價增股，把他稀釋掉）。2019 年 3 月和解，他離開董事會。<b>持股約三成，也沒能回去。</b>', src: 'Fortune，2018-07-23；NBC News，2019-03-05' },
      ],
    },
    {
      h: '接下來幾個月，能改變結果的只有董事會',
      paras: [
        '四條路排開，時間表很清楚。代理權之爭和 proxy access，都要等 2027 年 2 月底的提名窗口，再等年中的股東會。臨時會要湊滿 15%，最大的兩家股東加起來都不夠。',
        '在那之前，能改變結果的只有董事會自己。Altman 的例子說明董事會也會改口，但那次推動它的，是幾乎整間公司的員工。',
        '董事會手上還有一份獨立調查沒做完，董事長說財報會議上不回答相關問題。黃仁勳在貼文裡說，他會配合。',
      ],
    },
  ],
  chartAfter: 1,
  chart: {
    h: '四條路的門檻，和他手上的票',
    lead: '單位是持股或投票權的百分比。黃仁勳那一列是 2026 年委託書的持股。',
    max: 70,
    rows: [
      { label: '黃仁勳持股', v: 3.58, show: '3.58%', hl: true },
      { label: 'Proxy access 門檻', v: 3, show: '3%' },
      { label: 'BlackRock 加 Vanguard', v: 14.74, show: '14.74%' },
      { label: '股東臨時會門檻', v: 15, show: '15%' },
      { label: '無理由撤換董事', v: 66.67, show: '66⅔%' },
    ],
    note: '出處：Nvidia 章程（2024-03-12 修訂版）第 5(h)、6、21 條；Nvidia 2026 年委託書，持股基準日 2026-03-23。',
  },
  poll: {
    id: 'ep03-path',
    q: '你覺得黃仁勳該走哪條路回來？',
    opts: [
      { k: 'a', t: '等董事會自己改變主意' },
      { k: 'b', t: '2027 年自費打代理權之爭' },
      { k: 'c', t: '先用 proxy access 送兩位盟友進董事會' },
      { k: 'd', t: '不該回來' },
    ],
    after: '股東這一邊的路，除了湊滿 15% 開臨時會，最快都要等 2027 年 2 月底的提名窗口。',
  },
  sourcesH: '出處',
  levels: LV_ZH,
  sources: [
    { what: '黃仁勳表態願意回任執行長的全文，沒有提董事席。', label: '黃仁勳 X 貼文，2026-11-17', url: U.jensenX, level: 'p' },
    { what: '董事長在財報會議開場說不打算讓他回任。', label: 'CNBC Television，Nvidia 財報會議直播，2026-11-17（0:13 起）', url: U.cnbcTv, level: 'p' },
    { what: '接班人選內外部都找、不會為了快而定人的問答。', label: 'Bloomberg Television，2026-11-17（1:58 起）', url: U.bbgTv, level: 'p' },
    { what: '代理權之爭、proxy access、臨時會、撤換董事四條規定。', label: 'Nvidia 章程，2024-03-12 修訂版', url: U.bylaws, level: 'p' },
    { what: '三年內當過員工就不算獨立董事。', label: 'Nasdaq Rule 5605(a)(2)', url: U.nasdaq, level: 'p' },
    { what: '黃仁勳 3.58%、BlackRock 7.43%、Vanguard 7.31%，以及 2026 年股東會日期。', label: 'Nvidia 2026 年委託書（DEF 14A）', url: U.nvproxy, level: 'p' },
    { what: '2024 年上半年 8 場走到投票，7 場經營層全拿。', label: 'Innisfree M&A，Harvard Law School Forum，2024-06-15', url: U.innis24, level: 'n' },
    { what: '2023 年大型公司經營層全拿只有 25%，2020 到 2022 年是 68.4%。', label: 'Innisfree M&A，Harvard Law School Forum，2024-02-28', url: U.innis23, level: 'n' },
    { what: 'Disney 股東會 43% 拒投、當晚拔掉 Eisner 董事長。', label: 'WSJ，2004-03-04（NYU Damodaran 轉載）', url: U.disneyWsj, level: 'n' },
    { what: 'Roy Disney 和解後任沒有表決權的榮譽董事。', label: 'TheCorporateCounsel.net，2005-07-12', url: U.disneyCc, level: 'n' },
    { what: 'HP 股東會當天的經過。', label: 'CNN Money，2002-03-19', url: U.hpCnn, level: 'n' },
    { what: 'IVS Associates 初步計票 51.4% 對 48.6%。', label: 'PlanSponsor，2002', url: U.hpTally, level: 's' },
    { what: 'Hewlett 敗訴後不上訴。', label: 'eWeek，2002', url: U.hpEweek, level: 'n' },
    { what: 'Altman 回任執行長、換上新董事會。', label: 'OpenAI 官方 X，2023-11-22', url: U.oaiX, level: 'p' },
    { what: 'Altman 2024 年 3 月回到董事會。', label: 'The Verge，2024-03-08', url: U.verge, level: 'n' },
    { what: 'Papa John\'s 董事會通過毒丸。', label: 'Fortune，2018-07-23', url: U.pjPill, level: 'n' },
    { what: 'Schnatter 和解離開董事會。', label: 'NBC News，2019-03-05', url: U.pjExit, level: 'n' },
  ],
  srcNote: '一手指原始文件、本人貼文或會議錄音。媒體報導都標了等級，文中只照它們的層級引用。',
}

const EP03_EN: StoryLang = {
  scene: {
    kind: 'paths',
    cap: 'He said yes. The board said no. Four paths are left.',
    him: { who: 'Jensen Huang on X, Nov 17', said: 'If the board decides my return is in the best interest of our shareholders, our employees, the company and America, I would be honored to answer these calls and return as CEO.' },
    board: { who: 'Chair Harvey Jones, earnings call the same day', said: 'The board does not intend to reinstate Jensen as CEO.' },
    door: 'Board: 10 seats',
    paths: ['Proxy fight', 'Proxy access: 2 seats', 'Special meeting', 'Remove directors'],
  },
  recapH: 'What the video says: the board decides',
  recap: [
    'The video opens with one number: in one US study, about 45 percent of young adults broke up and got back together. Companies break up with founders too. Steve Jobs got back to Apple because Apple bought NeXT. Elon Musk, replaced at X.com, never went back. The point fits in one line: <mark>unless a founder controls the votes, the board decides.</mark> Jensen Huang owns 3.58 percent, one vote per share, and he gave up his board seat too.',
  ],
  sections: [
    {
      h: 'November 17: he said yes, the board said no',
      paras: [
        'On the morning of November 17, Eastern time, Jensen Huang posted a long statement on X. He opened with an apology. He said he fell short of Nvidia\'s standards, made serious mistakes in his personal life, and will cooperate with the board\'s independent investigation.',
        'Then he wrote that if the board decides his return is in the best interest of shareholders, employees, the company and America, he "would be honored to answer these calls and return as CEO." He talked about the CEO job. <b>He never mentioned his board seat.</b>',
        'About five and a half hours later, Nvidia held its third-quarter earnings call. Chair Harvey Jones opened it. He said the board unanimously accepted the resignation and <mark>"does not intend to reinstate Jensen as CEO."</mark> The day before, reporters could only cite unnamed sources. This time the chair said it on the record, and the recording is public.',
        'He added that the board will look at internal and external candidates, and won\'t rush the pick.',
      ],
      note: 'There is no public record of a board vote on this. Jones spoke for the board as its chair.',
    },
    {
      h: 'When the board says no, shareholders still have four moves',
      lead: 'If the board won\'t budge, you change who sits on it, or let shareholders vote directly. Nvidia\'s bylaws, as amended in March 2024, give shareholders four ways.',
      items: [
        { k: '1. Proxy fight', v: 'A shareholder nominates its own directors, mails its own proxy (the voting packet every shareholder gets) and campaigns against the company\'s slate. The bylaws put no limits on who can be nominated, so Jensen <b>could nominate himself and pay for it</b>. In a contested election, the top vote-getters win.', src: 'Nvidia bylaws, Section 5(b)' },
        { k: '2. Proxy access', v: 'Shareholders who have owned 3 percent or more for three years, up to 20 of them pooled together, can put nominees straight into the company\'s own proxy. That saves the cost of a campaign. The cap is two seats or 20 percent of the board, whichever is larger. With ten directors, that\'s <b>two seats</b>. The catch: nominees must be independent.', src: 'Nvidia bylaws, Section 5(h)' },
        { k: '3. Special meeting', v: 'Holders of 15 percent who have owned their shares for a year can demand a special meeting instead of waiting for the annual one. The two largest holders, BlackRock at 7.43 percent and Vanguard at 7.31 percent, add up to 14.74 percent. <b>Even together, they fall just short.</b>', src: 'Nvidia bylaws, Section 6; 2026 proxy' },
        { k: '4. Remove sitting directors', v: 'With cause, a majority vote removes a director. Without cause, it takes two-thirds.', src: 'Nvidia bylaws, Section 21' },
      ],
    },
    {
      h: 'He can nominate two allies, but not himself',
      paras: [
        'Proxy access is the cheapest route. At 3.58 percent, he clears the 3 percent bar, and he has held his stock far longer than three years.',
        'Independence is the problem. Under Nasdaq rules, anyone employed by the company in the past three years is not an independent director, counting from the day the job ended. He left in November 2026, so <mark>he can\'t count as independent until 2029</mark>. This route can put two allies on the board. It can\'t put him there.',
        'Even if both allies win, they are a long way from a majority.',
        'To nominate himself, he needs route one: a full proxy fight on his own dime. Nominations open 120 days and close 90 days before the anniversary of last year\'s annual meeting. Nvidia met on June 24, 2026, so the 2027 window runs roughly <b>February 24 to March 26</b>.',
      ],
      note: 'The window is our reading of the bylaws. If the 2027 meeting date moves by more than 30 days, different rules apply. We could not find whether he has sold shares since resigning.',
    },
    {
      h: 'Does management usually win a proxy fight?',
      paras: [
        'Depends on the year. Proxy solicitor Innisfree counted eight US proxy fights that went to a vote in the first half of 2024. In <mark>seven, management kept every seat</mark>. The one exception was railroad Norfolk Southern.',
        '2023 went the other way. In another Innisfree count, management swept only 25 percent of proxy fights at companies worth more than $1 billion. From 2020 to 2022, it was 68.4 percent.',
        'Innisfree works for both sides, so it has no stake here, but eight fights is a small sample. The safer read: management has home-field advantage, and challengers at big companies have been winning more often.',
      ],
    },
    {
      h: 'Four precedents, four endings',
      items: [
        { k: 'Roy E. Disney, Disney, 2003 to 2005', v: 'A member of the Disney family. In November 2003 the board moved to push him off using its age limit, so he quit first. With ally Stanley Gold, he launched Save Disney. At the March 2004 annual meeting, <b>43 percent of the votes cast</b> withheld support from CEO Michael Eisner. That night the board stripped Eisner of the chairman title and gave it to George Mitchell. Eisner stayed CEO. In July 2005 they settled, and Roy came back as a non-voting director emeritus. Eisner left that September. This was a vote-no campaign, not a rival slate.', src: 'WSJ, Mar 4, 2004 (NYU reprint); TheCorporateCounsel.net, Jul 12, 2005' },
        { k: 'Walter Hewlett, HP, 2002', v: 'The son of HP co-founder Bill Hewlett, and an HP director at the time. He opposed HP\'s deal for Compaq and ran a proxy fight against it. The preliminary count was <b>51.4 percent to 48.6 percent</b>, and the deal passed. He sued, saying HP pressured Deutsche Bank to switch its vote at the last minute. A Delaware court ruled for HP in April 2002, and he did not appeal.', src: 'CNN Money, Mar 19, 2002; PlanSponsor; eWeek, 2002' },
        { k: 'Sam Altman, OpenAI, 2023', v: 'OpenAI is controlled by a nonprofit, so there were no regular shareholders to vote. What he had was the staff. After he was fired, most employees signed a letter threatening to quit. Five days later he was back as CEO, <b>with a new board</b>: Bret Taylor, Larry Summers and Adam D\'Angelo. He didn\'t get his own board seat back until March 2024.', src: 'OpenAI on X, Nov 22, 2023; The Verge, Mar 8, 2024' },
        { k: 'John Schnatter, Papa John\'s, 2018 to 2019', v: 'The founder. In July 2018, after it came out that he used a racial slur on an internal call, he resigned as chairman. He and his affiliates owned more than 30 percent. The board quickly adopted a poison pill (a plan that lets other shareholders buy cheap stock and dilute anyone who crosses a set stake). In March 2019 he settled and left the board. <b>Owning about 30 percent wasn\'t enough to get back.</b>', src: 'Fortune, Jul 23, 2018; NBC News, Mar 5, 2019' },
      ],
    },
    {
      h: 'For the next few months, only the board can change the outcome',
      paras: [
        'Line the four routes up and the calendar is clear. A proxy fight and proxy access both wait for the window in late February 2027, then the annual meeting around midyear. A special meeting needs 15 percent, and the two largest holders together don\'t have it.',
        'Until then, only the board can change the answer. Altman shows a board can reverse itself. But that time, nearly the whole company pushed.',
        'The board also has an independent investigation still open, and the chair would not take questions about it on the call. Jensen said in his post that he will cooperate.',
      ],
    },
  ],
  chartAfter: 1,
  chart: {
    h: 'The bar for each route, and the votes he holds',
    lead: 'Percent of shares or voting power. Jensen\'s row is his stake in the 2026 proxy.',
    max: 70,
    rows: [
      { label: 'Jensen\'s stake', v: 3.58, show: '3.58%', hl: true },
      { label: 'Proxy access bar', v: 3, show: '3%' },
      { label: 'BlackRock plus Vanguard', v: 14.74, show: '14.74%' },
      { label: 'Special meeting bar', v: 15, show: '15%' },
      { label: 'Remove a director, no cause', v: 66.67, show: '66⅔%' },
    ],
    note: 'Sources: Nvidia bylaws (amended Mar 12, 2024), Sections 5(h), 6 and 21; Nvidia 2026 proxy, ownership as of Mar 23, 2026.',
  },
  poll: {
    id: 'ep03-path',
    q: 'Which way back should Jensen take?',
    opts: [
      { k: 'a', t: 'Wait for the board to change its mind' },
      { k: 'b', t: 'Run his own proxy fight in 2027' },
      { k: 'c', t: 'Use proxy access to seat two allies first' },
      { k: 'd', t: 'He shouldn\'t come back' },
    ],
    after: 'Apart from rounding up 15 percent for a special meeting, every shareholder route waits for the nomination window in late February 2027.',
  },
  sourcesH: 'Sources',
  levels: LV_EN,
  sources: [
    { what: 'Jensen\'s full statement offering to return as CEO. It does not mention the board seat.', label: 'Jensen Huang on X, Nov 17, 2026', url: U.jensenX, level: 'p' },
    { what: 'The chair opens the earnings call: no plan to reinstate him.', label: 'CNBC Television, Nvidia earnings call live, Nov 17, 2026 (from 0:13)', url: U.cnbcTv, level: 'p' },
    { what: 'Internal and external candidates, and no rush.', label: 'Bloomberg Television, Nov 17, 2026 (from 1:58)', url: U.bbgTv, level: 'p' },
    { what: 'The rules for proxy fights, proxy access, special meetings and removing directors.', label: 'Nvidia bylaws, amended Mar 12, 2024', url: U.bylaws, level: 'p' },
    { what: 'Employment in the past three years rules out independence.', label: 'Nasdaq Rule 5605(a)(2)', url: U.nasdaq, level: 'p' },
    { what: 'Jensen at 3.58 percent, BlackRock 7.43, Vanguard 7.31, and the 2026 meeting date.', label: 'Nvidia 2026 proxy statement (DEF 14A)', url: U.nvproxy, level: 'p' },
    { what: 'Seven of eight 2024 proxy fights that reached a vote were management sweeps.', label: 'Innisfree M&A, Harvard Law School Forum, Jun 15, 2024', url: U.innis24, level: 'n' },
    { what: 'Large-cap sweeps fell to 25 percent in 2023, from 68.4 percent in 2020 to 2022.', label: 'Innisfree M&A, Harvard Law School Forum, Feb 28, 2024', url: U.innis23, level: 'n' },
    { what: 'Disney meeting: 43 percent withheld, Eisner loses the chair that night.', label: 'WSJ, Mar 4, 2004 (reprinted by NYU\'s Aswath Damodaran)', url: U.disneyWsj, level: 'n' },
    { what: 'Roy Disney returns as a non-voting director emeritus.', label: 'TheCorporateCounsel.net, Jul 12, 2005', url: U.disneyCc, level: 'n' },
    { what: 'The day of the HP vote.', label: 'CNN Money, Mar 19, 2002', url: U.hpCnn, level: 'n' },
    { what: 'IVS Associates preliminary count, 51.4 to 48.6 percent.', label: 'PlanSponsor, 2002', url: U.hpTally, level: 's' },
    { what: 'Hewlett decides not to appeal.', label: 'eWeek, 2002', url: U.hpEweek, level: 'n' },
    { what: 'Altman returns as CEO with a new board.', label: 'OpenAI on X, Nov 22, 2023', url: U.oaiX, level: 'p' },
    { what: 'Altman rejoins the board in March 2024.', label: 'The Verge, Mar 8, 2024', url: U.verge, level: 'n' },
    { what: 'Papa John\'s adopts a poison pill.', label: 'Fortune, Jul 23, 2018', url: U.pjPill, level: 'n' },
    { what: 'Schnatter settles and leaves the board.', label: 'NBC News, Mar 5, 2019', url: U.pjExit, level: 'n' },
  ],
  srcNote: 'Primary means the original document, the person\'s own post, or the call recording. News reports are labeled, and the article uses them only as far as they go.',
}

/* ───────────────────────── EP01 ───────────────────────── */

const EP01_ZH: StoryLang = {
  scene: {
    kind: 'board',
    cap: '十位董事，沒有一位在 Nvidia 上班。',
    groups: [
      { n: 3, label: '1990 年代就在' },
      { n: 2, label: '2008、2013 年加入' },
      { n: 5, label: '2019 年之後加入' },
    ],
    empty: '執行長，空著',
  },
  recapH: '影片的結論：要回來，十位要六位點頭',
  recap: [
    '影片用分手後的朋友圈比喻董事會：誰還會被約出來吃飯，要看他們原本是誰的朋友。2026 年 11 月 12 日，黃仁勳辭去總裁、執行長與董事，董事會剩下十位，沒有一位是員工。依 Nvidia 章程，補一個董事空缺要在任董事過半數，<mark>十位要六位點頭</mark>。',
  ],
  sections: [
    {
      h: '坐最久的董事，開口說不',
      paras: [
        'Harvey Jones 1993 年進 Nvidia 董事會，跟公司同一年起步。11 月 12 日，他成了 Nvidia 史上第一位董事會主席。',
        '11 月 17 日，黃仁勳在 X 表態：如果董事會認為他回來，對股東、員工、公司和美國最好，他很榮幸回任執行長。同一天的財報電話會議，開口回應的就是 Jones。他說董事會一致接受辭職，<mark>「不打算讓 Jensen 回任執行長」</mark>。',
        '影片問的是朋友圈站哪一邊。這次的答案，來自從 1993 年就坐在董事會裡的人。',
      ],
    },
    {
      h: '十位董事是誰',
      lead: '依加入年份排列。經歷出自 Nvidia 2026 年股東會委託書與官網董事頁。',
      items: [
        { k: 'Harvey C. Jones，1993', v: '1981 年共同創辦 Daisy Systems；1987 到 1998 年帶領晶片設計軟體公司 Synopsys，其中七年任執行長；共同創辦 Tensilica。2026 年 11 月出任董事會主席。' },
        { k: 'Tench Coxe，1993', v: '1989 到 2020 年任創投 Sutter Hill Ventures 董事總經理。' },
        { k: 'A. Brooke Seawell，1997', v: '1991 到 1997 年任 Synopsys 財務長，現為創投 NEA 的 Venture Partner。審計委員會主席。' },
        { k: 'Mark A. Stevens，2008（1993 到 2006 年也在）', v: '1993 到 2011 年任 Sequoia Capital 管理合夥人，更早在 Intel 做技術業務與行銷。' },
        { k: 'Dawn Hudson，2013', v: '2005 到 2007 年任 Pepsi-Cola 北美總裁兼執行長，2014 到 2018 年任 NFL 行銷長。薪酬委員會主席。' },
        { k: 'Stephen C. Neal，2019', v: '2001 到 2008 年任律師事務所 Cooley 執行長；2011 到 2021 年任 Levi Strauss 董事長。提名與公司治理委員會主席。' },
        { k: 'John O. Dabiri，2020', v: '加州理工學院航空與機械工程講座教授，麥克阿瑟獎得主；2021 到 2025 年任總統科技顧問委員會（PCAST）委員。' },
        { k: 'Aarti Shah，2020', v: '在禮來（Eli Lilly）27 年，最後任資深副總裁兼資訊與數位長，2021 年離開。' },
        { k: 'Melissa B. Lora，2023', v: '在 Taco Bell 31 年，2018 年以 Taco Bell International 總裁退休。' },
        { k: 'Suzanne Nora Johnson，2026', v: '在高盛 21 年，以副董事長退休；2007 到 2025 年任 Intuit 董事長。2026 年 7 月 13 日加入。' },
      ],
    },
    {
      h: '每年都能換，實際上很少換',
      paras: [
        'Nvidia 每位董事任期一年，每年股東會改選。理論上，股東每年都有機會換掉任何一位。',
        '實際上，候選人是董事會自己的提名與公司治理委員會挑的，主席是 2019 年加入的律師 Stephen Neal。股東收到的委託書（proxy，寄給全體股東的投票說明與選票）上，只有公司提的名單。要換人，就得自己提名、自己拉票，也就是代理權之爭（proxy fight）。',
        '三個委員會的主席裡，審計的 Brooke Seawell 坐了 29 年，薪酬的 Dawn Hudson 坐了 13 年。',
      ],
    },
    {
      h: '有禮貌的董事會，很難開口換人',
      paras: [
        '巴菲特 2002 年寫給股東的信說，一屋子有禮貌的董事，幾乎不可能開口問要不要換執行長。',
        'Nvidia 這次是黃仁勳自己先辭職，董事會接受。辭職的經過還在董事會的獨立調查裡，董事長說財報會議上不回答。',
        '所以問題倒過來了：不是董事會敢不敢換掉他，而是董事會願不願意讓他回來。坐了三十年的董事跟他最熟。熟，可以是幫他的理由，也可以是避嫌的理由。',
      ],
    },
    {
      h: '這一週發生了什麼',
      items: [
        { k: '11/13', v: '兩位 Nvidia 股東，Altimeter 的 Brad Gerstner 與 Atreides 的 Gavin Baker，去信董事會，要求接班程序慢一點，把他回任留在選項裡。', src: 'Semafor，11/16' },
        { k: '11/16', v: 'CNBC 引述一位知情人士：董事會沒有考慮讓他回任執行長。', src: 'CNBC，11/16' },
        { k: '11/17 上午', v: '黃仁勳在 X 表態，願意回任執行長，沒有提董事席。', src: '黃仁勳 X 貼文' },
        { k: '11/17 傍晚', v: '董事長 Harvey Jones 在財報會議開場，具名說董事會不打算讓他回任執行長。', src: 'CNBC Television 直播' },
      ],
      note: '時間是美東時間，查到 2026 年 11 月 18 日。',
    },
  ],
  chartAfter: 0,
  chart: {
    h: '十位董事，各坐了幾年',
    lead: '以 2026 年減去加入年份。藍色那一列，是 11 月 17 日開口說不的董事長。',
    max: 35,
    rows: [
      { label: 'Harvey Jones', v: 33, show: '33 年', hl: true },
      { label: 'Tench Coxe', v: 33, show: '33 年' },
      { label: 'Brooke Seawell', v: 29, show: '29 年' },
      { label: 'Mark Stevens', v: 18, show: '18 年' },
      { label: 'Dawn Hudson', v: 13, show: '13 年' },
      { label: 'Stephen Neal', v: 7, show: '7 年' },
      { label: 'John Dabiri', v: 6, show: '6 年' },
      { label: 'Aarti Shah', v: 6, show: '6 年' },
      { label: 'Melissa Lora', v: 3, show: '3 年' },
      { label: 'Suzanne Nora Johnson', v: 0.4, show: '不到 1 年' },
    ],
    note: '自算，誤差正負一年；平均約 14.8 年，中位數 10 年。Stevens 1993 到 2006 年的第一段任期沒算進去。出處：Nvidia 2026 年委託書「Director Since」欄、2026 年 5 月 8-K。',
  },
  poll: {
    id: 'ep01-board',
    q: '跟他坐了三十年的董事，該投票讓他回來嗎？',
    opts: [
      { k: 'a', t: '該，他們最了解他' },
      { k: 'b', t: '不該，正因為太熟要避嫌' },
      { k: 'c', t: '等獨立調查的結果再說' },
    ],
    after: '董事每年改選一次；股東下一次用選票表態，是 2027 年的股東會。',
  },
  sourcesH: '出處',
  levels: LV_ZH,
  sources: [
    { what: 'Nvidia 官方公告：辭職、代理執行長、首任董事會主席。', label: 'Nvidia Newsroom〈NVIDIA Announces CEO Transition〉，2026-11-12', url: U.newsroom, level: 'p' },
    { what: '每位董事的經歷、加入年份、委員會職務，以及「任期一年、每年改選」。', label: 'Nvidia 2026 年委託書（DEF 14A），2026-05-12', url: U.nvproxy, level: 'p' },
    { what: '補上委託書之後才加入的 Suzanne Nora Johnson。', label: 'Nvidia Form 8-K，2026 年 5 月', url: U.k8nora, level: 'p' },
    { what: '「十位要六位」：第 19 條補董事缺額。', label: 'Nvidia 章程，2024-03-12 修訂版', url: U.bylaws, level: 'p' },
    { what: '黃仁勳表態願意回任執行長。', label: '黃仁勳 X 貼文，2026-11-17', url: U.jensenX, level: 'p' },
    { what: '董事長在財報會議說不打算讓他回任，也不回答調查相關問題。', label: 'CNBC Television，Nvidia 財報會議直播，2026-11-17', url: U.cnbcTv, level: 'p' },
    { what: '匿名人士說董事會不考慮讓他回任。', label: 'CNBC，2026-11-16', url: U.cnbcBoard, level: 'n' },
    { what: 'Gerstner 與 Baker 的信要求什麼、沒要求什麼。', label: 'Semafor，2026-11-16', url: U.semafor, level: 'n' },
    { what: '巴菲特談有禮貌的董事會。', label: 'Berkshire Hathaway 2002 年股東信', url: U.buffett, level: 'p' },
  ],
  srcNote: '一手指原始申報文件、本人貼文或會議錄音。媒體報導都標了等級，文中只照它們的層級引用。',
}

const EP01_EN: StoryLang = {
  scene: {
    kind: 'board',
    cap: 'Ten directors. None of them work at Nvidia.',
    groups: [
      { n: 3, label: 'Since the 1990s' },
      { n: 2, label: 'Joined 2008 or 2013' },
      { n: 5, label: 'Joined 2019 or later' },
    ],
    empty: 'CEO: empty',
  },
  recapH: 'What the video says: six of ten have to say yes',
  recap: [
    'The video compares a board to your friends after a breakup: who still gets invited to dinner depends on whose friends they were first. On November 12, 2026, Jensen Huang resigned as Nvidia\'s president, CEO and director. That left ten directors, none of them employees. Under Nvidia\'s bylaws, an open seat is filled by a majority of the directors in office, so <mark>six of ten have to say yes</mark>.',
  ],
  sections: [
    {
      h: 'A director since 1993 said no',
      paras: [
        'Harvey Jones joined Nvidia\'s board in 1993, the year the company started. On November 12, he became its first-ever board chair.',
        'On November 17, Jensen posted on X that if the board decides his return is in the best interest of shareholders, employees, the company and America, he would be honored to return as CEO. On the earnings call that same day, Jones was the one who answered. He said the board unanimously accepted the resignation and <mark>"does not intend to reinstate Jensen as CEO."</mark>',
        'The video asks whose side the friends will take. This time the answer came from someone who has been in the room since 1993.',
      ],
    },
    {
      h: 'Who the ten directors are',
      lead: 'Listed by the year each one joined. Backgrounds come from Nvidia\'s 2026 proxy statement and its board pages.',
      items: [
        { k: 'Harvey C. Jones, 1993', v: 'Co-founded Daisy Systems in 1981. Led chip design software company Synopsys from 1987 to 1998, seven of those years as CEO. Co-founded Tensilica. Named board chair in November 2026.' },
        { k: 'Tench Coxe, 1993', v: 'Managing director at venture firm Sutter Hill Ventures from 1989 to 2020.' },
        { k: 'A. Brooke Seawell, 1997', v: 'CFO of Synopsys from 1991 to 1997. Now a venture partner at NEA. Chairs the audit committee.' },
        { k: 'Mark A. Stevens, 2008 (also 1993 to 2006)', v: 'Managing partner at Sequoia Capital from 1993 to 2011. Earlier worked in technical sales and marketing at Intel.' },
        { k: 'Dawn Hudson, 2013', v: 'CEO of Pepsi-Cola North America from 2005 to 2007. NFL chief marketing officer from 2014 to 2018. Chairs the compensation committee.' },
        { k: 'Stephen C. Neal, 2019', v: 'CEO of law firm Cooley from 2001 to 2008. Chaired Levi Strauss from 2011 to 2021. Chairs the nominating and governance committee.' },
        { k: 'John O. Dabiri, 2020', v: 'Caltech professor of aeronautics and mechanical engineering. MacArthur Fellow. Served on the President\'s Council of Advisors on Science and Technology from 2021 to 2025.' },
        { k: 'Aarti Shah, 2020', v: '27 years at Eli Lilly, last as SVP and chief information and digital officer. Left in 2021.' },
        { k: 'Melissa B. Lora, 2023', v: '31 years at Taco Bell. Retired in 2018 as president of Taco Bell International.' },
        { k: 'Suzanne Nora Johnson, 2026', v: '21 years at Goldman Sachs, retired as vice chairman. Chaired Intuit from 2007 to 2025. Joined on July 13, 2026.' },
      ],
    },
    {
      h: 'Directors can be replaced every year. They rarely are.',
      paras: [
        'Every Nvidia director serves a one-year term and stands for election at each annual meeting. On paper, shareholders can replace any of them every year.',
        'In practice, the candidates are picked by the board\'s own nominating and governance committee, chaired by Stephen Neal, a lawyer who joined in 2019. The proxy (the voting packet every shareholder gets) lists only the company\'s nominees. To change that, you nominate your own people and campaign for votes. That\'s a proxy fight.',
        'Of the three committee chairs, audit chair Brooke Seawell has served 29 years and compensation chair Dawn Hudson 13.',
      ],
    },
    {
      h: 'Polite boards rarely ask the hard question',
      paras: [
        'Warren Buffett wrote in 2002 that in a boardroom full of well-mannered people, it\'s almost impossible to ask whether the CEO should be replaced.',
        'At Nvidia, Jensen resigned first and the board accepted. Why he resigned is part of the board\'s independent investigation, and the chair would not discuss it on the call.',
        'So the question has flipped. It\'s no longer whether the board dares to replace him. It\'s whether the board will let him back. The directors who sat beside him for thirty years know him best. That can be a reason to help him, or a reason to step back.',
      ],
    },
    {
      h: 'What happened this week',
      items: [
        { k: 'Nov 13', v: 'Two Nvidia shareholders, Brad Gerstner of Altimeter and Gavin Baker of Atreides, asked the board in a letter for a slow, deliberate search that keeps his return on the table.', src: 'Semafor, Nov 16' },
        { k: 'Nov 16', v: 'CNBC cited one person familiar with the matter: the board is not considering bringing him back as CEO.', src: 'CNBC, Nov 16' },
        { k: 'Nov 17, morning', v: 'Jensen posted on X that he would return as CEO. He did not mention the board seat.', src: 'Jensen Huang on X' },
        { k: 'Nov 17, evening', v: 'Chair Harvey Jones opened the earnings call and said, on the record, the board does not intend to reinstate him as CEO.', src: 'CNBC Television live' },
      ],
      note: 'Eastern time. Last checked November 18, 2026.',
    },
  ],
  chartAfter: 0,
  chart: {
    h: 'How long each director has served',
    lead: '2026 minus the year each one joined. The blue bar is the chair who said no on November 17.',
    max: 35,
    rows: [
      { label: 'Harvey Jones', v: 33, show: '33 yrs', hl: true },
      { label: 'Tench Coxe', v: 33, show: '33 yrs' },
      { label: 'Brooke Seawell', v: 29, show: '29 yrs' },
      { label: 'Mark Stevens', v: 18, show: '18 yrs' },
      { label: 'Dawn Hudson', v: 13, show: '13 yrs' },
      { label: 'Stephen Neal', v: 7, show: '7 yrs' },
      { label: 'John Dabiri', v: 6, show: '6 yrs' },
      { label: 'Aarti Shah', v: 6, show: '6 yrs' },
      { label: 'Melissa Lora', v: 3, show: '3 yrs' },
      { label: 'Suzanne Nora Johnson', v: 0.4, show: 'Under 1' },
    ],
    note: 'Our math, give or take a year. Average about 14.8 years, median 10. Stevens\'s first stint, 1993 to 2006, is not counted. Sources: "Director Since" in Nvidia\'s 2026 proxy; 8-K, May 2026.',
  },
  poll: {
    id: 'ep01-board',
    q: 'Should directors who sat beside him for 30 years vote to bring him back?',
    opts: [
      { k: 'a', t: 'Yes, they know him best' },
      { k: 'b', t: 'No, they\'re too close to him' },
      { k: 'c', t: 'Wait for the investigation' },
    ],
    after: 'Directors stand for election every year. Shareholders get their next vote at the 2027 annual meeting.',
  },
  sourcesH: 'Sources',
  levels: LV_EN,
  sources: [
    { what: 'Nvidia\'s announcement: the resignation, the interim CEO and the first board chair.', label: 'Nvidia Newsroom, "NVIDIA Announces CEO Transition," Nov 12, 2026', url: U.newsroom, level: 'p' },
    { what: 'Every director\'s bio, join year and committee role, plus one-year terms elected annually.', label: 'Nvidia 2026 proxy statement (DEF 14A), May 12, 2026', url: U.nvproxy, level: 'p' },
    { what: 'Adds Suzanne Nora Johnson, who joined after the proxy.', label: 'Nvidia Form 8-K, May 2026', url: U.k8nora, level: 'p' },
    { what: 'Six of ten: Section 19 on filling an open seat.', label: 'Nvidia bylaws, amended Mar 12, 2024', url: U.bylaws, level: 'p' },
    { what: 'Jensen offers to return as CEO.', label: 'Jensen Huang on X, Nov 17, 2026', url: U.jensenX, level: 'p' },
    { what: 'The chair says no on the earnings call and declines questions on the investigation.', label: 'CNBC Television, Nvidia earnings call live, Nov 17, 2026', url: U.cnbcTv, level: 'p' },
    { what: 'An unnamed source says the board is not considering his return.', label: 'CNBC, Nov 16, 2026', url: U.cnbcBoard, level: 'n' },
    { what: 'What the Gerstner and Baker letter asked for, and what it did not.', label: 'Semafor, Nov 16, 2026', url: U.semafor, level: 'n' },
    { what: 'Buffett on polite boardrooms.', label: 'Berkshire Hathaway 2002 letter to shareholders', url: U.buffett, level: 'p' },
  ],
  srcNote: 'Primary means the original filing, the person\'s own post, or the call recording. News reports are labeled, and the article uses them only as far as they go.',
}

/* ───────────────────────── EP02 ───────────────────────── */

const EP02_ZH: StoryLang = {
  scene: {
    kind: 'handoff',
    cap: '創辦人走了，懂這一行的那種深度，交得出去嗎？',
    from: { name: '黃仁勳', sub: '帶 Nvidia 33 年' },
    to: { name: 'Colette Kress', sub: '代理執行長，2013 年進 Nvidia' },
    mid: '交棒',
  },
  recapH: '影片的結論：契合要用年數換',
  recap: [
    '影片拿新舊對象來比：新對象一週就記得你咖啡怎麼點，要像前任那樣懂你，得花好幾年。新創圈把這種深度叫 founder-market fit（創辦人與市場契合），也就是創辦人是不是他在做的這件事的專家。黃仁勳創業前在 AMD 設計微處理器，在 LSI Logic 待了八年，之後帶 Nvidia 33 年。現在代理執行長的，是財務長 Colette Kress。',
  ],
  sections: [
    {
      h: '代理的人是誰',
      paras: [
        'Colette Kress 2013 年 9 月進 Nvidia 當財務長，到現在 13 年。之前她在財務線上做了大約 25 年。Microsoft 待了 13 年，其中四年是伺服器與工具部門的財務長。Cisco 三年，任資深副總裁兼一個事業組織的財務長。更早在 Texas Instruments。',
        '她的專長是財務。黃仁勳那一種，是從晶片設計一路長上來的。',
      ],
    },
    {
      h: '契合能不能養出來，兩位投資人看法不同',
      items: [
        { k: 'Chris Dixon：可以靠經驗養', v: '2011 年他寫，判斷一家新創能不能做到產品市場契合，最好的指標是 founder/market fit，並註明這個詞來自 David Lee。他也寫了兩句常被略過的話：這種契合「可以靠經驗養出來」，而且「常常被高估」。', src: 'cdixon.org，2011-06-19' },
        { k: 'Ben Horowitz：a16z 偏好創辦人當執行長', v: '2010 年他寫，專業經理人很會把產品週期做到最大，但找不到下一個；創辦人執行長剛好相反，很會找，不擅長做到最大。他列了創新者的三個條件：完整的知識、道德上的權威（moral authority，大家願意跟著他做難的決定），以及對長期的全心投入。好的創辦人執行長通常三樣都有，專業經理人常常缺。', src: 'a16z，2010-04-28' },
        { k: 'YC：你是不是這一行的專家', v: 'YC 合夥人 Jared Friedman 舉 Flexport 為例：創辦人 Ryan 創業前在國際貿易做了 10 年，什麼都懂。他給這種契合打「10 分滿分」。', src: 'YC Startup Library' },
      ],
    },
    {
      h: '董事會說內外都找，政府那邊有人要外人',
      paras: [
        '11 月 17 日的財報會議，董事長 Harvey Jones 說，接班人選內部、外部都會找，不會為了快而隨便定人。',
        '財政部長 Bessent 則在 Fox News 說，Nvidia 需要大幅改組，下一任執行長應該找外部的人。',
        '套用 Horowitz 的分法：內部的財務長也好，外部的專業經理人也好，擅長的是把現在的產品週期做到最大。下一個週期由誰去找，才是這次選人真正的題目。',
      ],
    },
    {
      h: '黃仁勳自己說要回來',
      paras: [
        '同一天上午，黃仁勳在 X 表態：如果董事會認為他回來，對股東、員工、公司和美國最好，他很榮幸回任執行長。',
        '幾個小時後，董事長在財報會議上說，董事會不打算讓他回任執行長。人選名單上，暫時沒有那位帶了 Nvidia 33 年的人。',
      ],
    },
  ],
  chartAfter: 0,
  chart: {
    h: '在這一行累積了幾年',
    lead: '以年為單位。藍色是黃仁勳在 Nvidia 的年數。',
    max: 35,
    rows: [
      { label: '黃仁勳在 Nvidia', v: 33, show: '33 年', hl: true },
      { label: '黃仁勳在 LSI Logic', v: 8, show: '8 年' },
      { label: 'Kress 在 Nvidia', v: 13, show: '13 年' },
      { label: 'Kress 在 Microsoft', v: 13, show: '13 年' },
      { label: 'Kress 在 Cisco', v: 3, show: '3 年' },
    ],
    note: '出處：Nvidia 2026 年 10-K（黃仁勳 1985 到 1993 年在 LSI Logic）、Nvidia 官網 Colette Kress 簡介。黃仁勳在 AMD 的起始年份，Nvidia 自己的兩份文件寫法不同（1983 或 1984），所以沒畫。',
  },
  poll: {
    id: 'ep02-successor',
    q: 'Nvidia 下一任執行長，該找誰？',
    opts: [
      { k: 'a', t: '內部的人，例如 Colette Kress' },
      { k: 'b', t: '外部的專業經理人' },
      { k: 'c', t: '讓黃仁勳回來' },
    ],
    after: '董事長說內外都找。Horowitz 2010 年的說法是，擅長找到下一個產品週期的，是創辦人執行長。',
  },
  sourcesH: '出處',
  levels: LV_ZH,
  sources: [
    { what: 'YC 對 founder/market fit 的說法與 Flexport 的例子。', label: 'Jared Friedman〈How to Get Startup Ideas〉，YC Startup Library', url: U.ycFriedman, level: 'p' },
    { what: '黃仁勳在 AMD 與 LSI Logic 的經歷。', label: 'Nvidia Form 10-K，2026-02-25', url: U.tenK, level: 'p' },
    { what: 'Kress 2013 年 9 月進 Nvidia，以及 Microsoft、Cisco、Texas Instruments 的經歷。', label: 'Nvidia Newsroom，Colette Kress 簡介', url: U.kress, level: 'p' },
    { what: '可以靠經驗養、常常被高估，以及這個詞來自 David Lee。', label: 'Chris Dixon〈Founder/market fit〉，2011-06-19', url: U.dixon, level: 'p' },
    { what: '找到與做到最大，以及創新者的三個條件。', label: 'Ben Horowitz〈Why We Prefer Founding CEOs〉，a16z，2010-04-28', url: U.horowitz, level: 'p' },
    { what: '董事長說內外部人選都會找。', label: 'Bloomberg Television，2026-11-17（1:58 起）', url: U.bbgTv, level: 'p' },
    { what: '董事長說不打算讓他回任執行長。', label: 'CNBC Television，Nvidia 財報會議直播，2026-11-17', url: U.cnbcTv, level: 'p' },
    { what: '黃仁勳表態願意回任執行長。', label: '黃仁勳 X 貼文，2026-11-17', url: U.jensenX, level: 'p' },
    { what: 'Bessent 說要大幅改組、找外部的人。', label: 'AP（PBS NewsHour 轉載），2026-11-16', url: U.ap, level: 'n' },
  ],
  srcNote: '一手指原始文件、本人文章、貼文或會議錄音。媒體報導都標了等級，文中只照它們的層級引用。',
}

const EP02_EN: StoryLang = {
  scene: {
    kind: 'handoff',
    cap: 'The founder is gone. Can that kind of depth be handed over?',
    from: { name: 'Jensen Huang', sub: 'Ran Nvidia for 33 years' },
    to: { name: 'Colette Kress', sub: 'Interim CEO, at Nvidia since 2013' },
    mid: 'Handoff',
  },
  recapH: 'What the video says: fit takes years',
  recap: [
    'The video compares a new partner with an old one. The new person learns your coffee order in a week. Knowing you like your ex did takes years. Startups call that depth founder-market fit: are the founders experts in what they\'re doing? Before Nvidia, Jensen Huang designed microprocessors at AMD and spent eight years at LSI Logic. Then he ran Nvidia for 33 years. The interim CEO now is CFO Colette Kress.',
  ],
  sections: [
    {
      h: 'Who is running Nvidia for now',
      paras: [
        'Colette Kress joined Nvidia as CFO in September 2013, thirteen years ago. Before that she spent about 25 years in finance: 13 at Microsoft, four of them as CFO of the Server and Tools division; three at Cisco as SVP and CFO of one of its finance organizations; and earlier, roles at Texas Instruments.',
        'Her expertise is finance. Jensen\'s kind of depth came from growing up through chip design.',
      ],
    },
    {
      h: 'Can fit be built? Two investors disagree',
      items: [
        { k: 'Chris Dixon: you can grow into it', v: 'In 2011 he wrote that the best predictor of product-market fit is founder/market fit, and credited the term to David Lee. He also wrote two lines people tend to skip: founder/market fit "can be developed through experience," and it "is frequently overestimated."', src: 'cdixon.org, Jun 19, 2011' },
        { k: 'Ben Horowitz: a16z prefers founding CEOs', v: 'In 2010 he wrote that professional CEOs are good at maximizing product cycles but not at finding them. Founding CEOs are the opposite. He listed three ingredients of a great innovator: comprehensive knowledge, moral authority (people will follow you through hard calls), and total commitment to the long term. Great founding CEOs tend to have all three. Professional CEOs often lack them.', src: 'a16z, Apr 28, 2010' },
        { k: 'YC: are you an expert in this?', v: 'YC partner Jared Friedman points to Flexport. Its founder, Ryan, worked in international trade for ten years before starting it and knew everything about it. Friedman calls that "10 out of 10 founder/market fit."', src: 'YC Startup Library' },
      ],
    },
    {
      h: 'The board will look inside and out. Washington wants an outsider.',
      paras: [
        'On the November 17 earnings call, chair Harvey Jones said the board will look at internal and external candidates and won\'t rush the pick.',
        'Treasury Secretary Scott Bessent said on Fox News that Nvidia needs a dramatic shake-up and the next CEO should come from outside.',
        'Run that through Horowitz\'s split. An inside CFO or an outside pro is built to maximize the current product cycle. The real question in this search is who finds the next one.',
      ],
    },
    {
      h: 'Jensen says he wants to come back',
      paras: [
        'That same morning, Jensen posted on X that if the board decides his return is in the best interest of shareholders, employees, the company and America, he would be honored to return as CEO.',
        'Hours later, the chair said on the earnings call that the board does not intend to reinstate him. For now, the man who ran Nvidia for 33 years is not on the list.',
      ],
    },
  ],
  chartAfter: 0,
  chart: {
    h: 'Years in the business',
    lead: 'In years. The blue bar is Jensen\'s time at Nvidia.',
    max: 35,
    rows: [
      { label: 'Jensen at Nvidia', v: 33, show: '33 yrs', hl: true },
      { label: 'Jensen at LSI Logic', v: 8, show: '8 yrs' },
      { label: 'Kress at Nvidia', v: 13, show: '13 yrs' },
      { label: 'Kress at Microsoft', v: 13, show: '13 yrs' },
      { label: 'Kress at Cisco', v: 3, show: '3 yrs' },
    ],
    note: 'Sources: Nvidia 10-K, Feb 2026 (Jensen at LSI Logic, 1985 to 1993); Nvidia\'s bio of Colette Kress. Nvidia\'s own filings disagree on when Jensen started at AMD (1983 or 1984), so it is left out.',
  },
  poll: {
    id: 'ep02-successor',
    q: 'Who should be Nvidia\'s next CEO?',
    opts: [
      { k: 'a', t: 'An insider, like Colette Kress' },
      { k: 'b', t: 'A professional CEO from outside' },
      { k: 'c', t: 'Bring Jensen back' },
    ],
    after: 'The chair says the board will look both inside and out. Horowitz\'s answer in 2010: founding CEOs are the ones who find the next product cycle.',
  },
  sourcesH: 'Sources',
  levels: LV_EN,
  sources: [
    { what: 'YC on founder/market fit, and the Flexport example.', label: 'Jared Friedman, "How to Get Startup Ideas," YC Startup Library', url: U.ycFriedman, level: 'p' },
    { what: 'Jensen\'s years at AMD and LSI Logic.', label: 'Nvidia Form 10-K, Feb 25, 2026', url: U.tenK, level: 'p' },
    { what: 'Kress joins in September 2013; Microsoft, Cisco and Texas Instruments before that.', label: 'Nvidia Newsroom, Colette Kress bio', url: U.kress, level: 'p' },
    { what: 'Fit can be developed, is often overestimated, and the term comes from David Lee.', label: 'Chris Dixon, "Founder/market fit," Jun 19, 2011', url: U.dixon, level: 'p' },
    { what: 'Finding versus maximizing, and the three ingredients.', label: 'Ben Horowitz, "Why We Prefer Founding CEOs," a16z, Apr 28, 2010', url: U.horowitz, level: 'p' },
    { what: 'The chair on internal and external candidates.', label: 'Bloomberg Television, Nov 17, 2026 (from 1:58)', url: U.bbgTv, level: 'p' },
    { what: 'The chair says no return as CEO.', label: 'CNBC Television, Nvidia earnings call live, Nov 17, 2026', url: U.cnbcTv, level: 'p' },
    { what: 'Jensen offers to return as CEO.', label: 'Jensen Huang on X, Nov 17, 2026', url: U.jensenX, level: 'p' },
    { what: 'Bessent on a shake-up and an outside CEO.', label: 'AP via PBS NewsHour, Nov 16, 2026', url: U.ap, level: 'n' },
  ],
  srcNote: 'Primary means the original filing, the author\'s own essay or post, or the call recording. News reports are labeled, and the article uses them only as far as they go.',
}

/* ───────────────────────── EP04 ───────────────────────── */

const EP04_ZH: StoryLang = {
  scene: {
    kind: 'three',
    cap: '三把尺，要同時過。',
    cards: [
      { q: '他會不會想你？', bar: '至少四成說「非常失望」' },
      { q: '他會不會一直回來？', bar: '留存曲線要走平' },
      { q: '划不划得來？', bar: '毛利是取得成本的三倍' },
    ],
  },
  recapH: '影片的結論：三把尺要同時過',
  recap: [
    '影片把談戀愛時問過的三件事，換成產品市場契合（product-market fit）的三把尺。用戶會不會想你：至少四成說「非常失望」。會不會一直回來：留存曲線要走平。划不划得來：一個客戶賺回的毛利，要是拿下他所花成本的三倍。<mark>三把尺要同時過。</mark>',
  ],
  sections: [
    {
      h: '四成這條線，是比出來的',
      paras: [
        'Sean Ellis 的問題只有一句：如果再也不能用這個產品，你會怎樣？他比較了將近一百家新創。成長卡住的公司，回答「非常失望」的幾乎都不到四成；跑得起來的，幾乎都超過。他自己也寫，這條線有點隨意。',
        'Slack 是一個參照。2015 年 Hiten Shah 拿同一題問了 731 位 Slack 用戶，51% 說會非常失望。當時 Slack 大約有 50 萬付費用戶。',
      ],
    },
    {
      h: 'Superhuman 怎麼從 22% 做到 58%',
      lead: 'Superhuman 是一款收費的電子郵件軟體。創辦人 Rahul Vohra 2017 年夏天第一次量，只有 22%。他把這個數字變成每週追的指標，分四步做。',
      items: [
        { k: '1. 只看最愛你的人', v: '先找出回答「非常失望」的人長什麼樣：創辦人、經理、主管、業務開發。只看這群人的輪廓，分數從 22% 跳到 33%。', src: 'First Round Review，2018' },
        { k: '2. 問他們愛的是什麼', v: '非常失望的那群人，最常講的好處是快。有點失望、但也覺得快是主要好處的人最值得追，一定是某個小地方卡住他們。覺得快不是重點的人，就禮貌地放掉。', src: 'First Round Review，2018' },
        { k: '3. 路線圖一半一半', v: '一半的開發時間，加碼最愛用戶已經喜歡的；另一半，解決卡住那群人的問題。用成本高低、影響大小排順序，先做便宜又有效的。', src: 'First Round Review，2018' },
        { k: '4. 一直重量', v: '持續問新用戶，同一個人不問第二次，把「非常失望」的比例當成最重要的數字。三季之後，分數做到 <b>58%</b>。', src: 'First Round Review，2018' },
      ],
    },
    {
      h: '另外兩把尺，一個看曲線，一個看倍數',
      paras: [
        '留存看的是曲線的形狀。每個月的新用戶，留下來的比例會往下掉，關鍵是掉到最後會不會走平。YC 的 Startup School 把它講成留存曲線要走平：走平，代表有一群人一直留下來。',
        '划不划得來看兩個數字。一個是客戶帶來的毛利總和（LTV，lifetime value），一個是拿下他的成本（CAC，customer acquisition cost）。影片用的標準是三倍。低於這個數，就沒剩多少錢經營公司。',
        'Superhuman 的四步，修的是第一把尺。另外兩把也一樣，先找出最弱的那一把，一次修一把。',
      ],
    },
  ],
  chartAfter: 0,
  chart: {
    h: '說會「非常失望」的用戶比例',
    lead: '虛線是 Sean Ellis 的四成門檻。',
    max: 70,
    line: { v: 40, label: '門檻 40%' },
    rows: [
      { label: 'Superhuman，2017 年夏天', v: 22, show: '22%' },
      { label: 'Superhuman，只看核心用戶', v: 33, show: '33%' },
      { label: 'Superhuman，三季之後', v: 58, show: '58%', hl: true },
      { label: 'Slack，2015 年', v: 51, show: '51%' },
    ],
    note: '出處：Rahul Vohra〈How Superhuman Built an Engine to Find Product Market Fit〉，First Round Review，2018。Slack 數字是 Hiten Shah 2015 年的調查，731 位用戶，由同一篇文章轉述。',
  },
  poll: {
    id: 'ep04-weakest',
    q: '你的產品，三把尺裡最弱的是哪一把？',
    opts: [
      { k: 'a', t: '不夠多人會想它' },
      { k: 'b', t: '用戶不會一直回來' },
      { k: 'c', t: '賺回的毛利不夠' },
      { k: 'd', t: '三把都過了' },
    ],
    after: 'Superhuman 的做法是一次修一把：先找出最愛它的人，再看卡住其他人的是什麼。',
  },
  sourcesH: '出處',
  levels: LV_ZH,
  sources: [
    { what: 'Sean Ellis 的「非常失望」問題與四成門檻。', label: 'Sean Ellis〈The Startup Pyramid〉，約 2009 年（Wayback 存檔）', url: U.ellis, level: 'p' },
    { what: 'Superhuman 從 22%、33% 到 58% 的經過與四個步驟，以及 Slack 51%。', label: 'Rahul Vohra〈How Superhuman Built an Engine to Find Product Market Fit〉，First Round Review，2018', url: U.superhuman, level: 'p' },
    { what: '留存曲線要走平。', label: 'Y Combinator〈How To Keep Your Users〉，Startup School（11:54）', url: U.ycRetain, level: 'p' },
    { what: 'LTV 與 CAC。', label: 'Y Combinator〈Consumer Startup Metrics〉，Startup School（7:37）', url: U.ycMetrics, level: 'p' },
  ],
  srcNote: '一手指作者本人的文章或演講。Slack 的數字是 Superhuman 那篇文章轉述 Hiten Shah 的調查。',
}

const EP04_EN: StoryLang = {
  scene: {
    kind: 'three',
    cap: 'Three tests. You need all three at once.',
    cards: [
      { q: 'Would they miss you?', bar: '40%+ say "very disappointed"' },
      { q: 'Do they keep coming back?', bar: 'Retention levels off' },
      { q: 'Is it worth it?', bar: 'Gross profit 3x the cost to win them' },
    ],
  },
  recapH: 'What the video says: pass all three tests at once',
  recap: [
    'The video turns three questions from dating into three tests for product-market fit. Would they miss you: at least 40 percent say "very disappointed." Do they keep coming back: the retention curve levels off. Is it worth it: a customer earns back three times what it cost to win them, in gross profit. <mark>You need all three at once.</mark>',
  ],
  sections: [
    {
      h: 'The 40 percent line came from comparing startups',
      paras: [
        'Sean Ellis asked one question: how would you feel if you could no longer use the product? He compared nearly a hundred startups. Companies that struggled to grow almost always had fewer than 40 percent answer "very disappointed." Companies with traction almost always beat it. He admitted the line was a bit arbitrary.',
        'Slack is a useful benchmark. In 2015 Hiten Shah asked 731 Slack users the same question. 51 percent said they\'d be very disappointed, back when Slack had about half a million paying users.',
      ],
    },
    {
      h: 'How Superhuman went from 22 to 58 percent',
      lead: 'Superhuman is a paid email app. Founder Rahul Vohra first ran the survey in the summer of 2017 and got 22 percent. He made that number a weekly metric and worked it in four steps.',
      items: [
        { k: '1. Look only at the people who love you', v: 'Profile the users who said "very disappointed": founders, managers, executives, business development. Counting only people who fit that profile, the score jumped from 22 to 33 percent.', src: 'First Round Review, 2018' },
        { k: '2. Find out what they love', v: 'The very disappointed group named speed as the main benefit. Users who were only somewhat disappointed but also valued speed were the ones to chase. Something small was holding them back. Users who didn\'t care about speed got politely set aside.', src: 'First Round Review, 2018' },
        { k: '3. Split the roadmap in half', v: 'Spend half the work doubling down on what fans already love. Spend the other half fixing what holds the near-fans back. Rank projects by cost and impact, and start with cheap wins.', src: 'First Round Review, 2018' },
        { k: '4. Keep measuring', v: 'Keep surveying new users, never the same person twice, and treat the "very disappointed" share as the most important number. Three quarters later, the score hit <b>58 percent</b>.', src: 'First Round Review, 2018' },
      ],
    },
    {
      h: 'The other two tests: one is a curve, one is a ratio',
      paras: [
        'Retention is about the shape of the curve. Of each month\'s new users, the share still around keeps dropping. What matters is whether it levels off. YC\'s Startup School teaches it as a flattening retention curve: flat means a group of people keeps coming back.',
        'Worth it comes down to two numbers: the gross profit a customer brings in over time (LTV, lifetime value) and the cost of winning them (CAC, customer acquisition cost). The video uses three to one. Below that, there\'s little left to run the company.',
        'Superhuman\'s four steps fix the first test. The other two work the same way: find the weakest one and fix that first.',
      ],
    },
  ],
  chartAfter: 0,
  chart: {
    h: 'Share of users who\'d be "very disappointed"',
    lead: 'The dashed line is Sean Ellis\'s 40 percent bar.',
    max: 70,
    line: { v: 40, label: '40% bar' },
    rows: [
      { label: 'Superhuman, summer 2017', v: 22, show: '22%' },
      { label: 'Superhuman, core users only', v: 33, show: '33%' },
      { label: 'Superhuman, three quarters later', v: 58, show: '58%', hl: true },
      { label: 'Slack, 2015', v: 51, show: '51%' },
    ],
    note: 'Source: Rahul Vohra, "How Superhuman Built an Engine to Find Product Market Fit," First Round Review, 2018. The Slack figure is Hiten Shah\'s 2015 survey of 731 users, as cited in the same article.',
  },
  poll: {
    id: 'ep04-weakest',
    q: 'Which of the three tests is your product weakest on?',
    opts: [
      { k: 'a', t: 'Not enough people would miss it' },
      { k: 'b', t: 'Users don\'t keep coming back' },
      { k: 'c', t: 'Customers don\'t earn back enough' },
      { k: 'd', t: 'It passes all three' },
    ],
    after: 'Superhuman fixed one test at a time: find the people who love it most, then see what holds everyone else back.',
  },
  sourcesH: 'Sources',
  levels: LV_EN,
  sources: [
    { what: 'Sean Ellis\'s "very disappointed" question and the 40 percent bar.', label: 'Sean Ellis, "The Startup Pyramid," about 2009 (Wayback snapshot)', url: U.ellis, level: 'p' },
    { what: 'Superhuman\'s 22, 33 and 58 percent, the four steps, and Slack\'s 51 percent.', label: 'Rahul Vohra, "How Superhuman Built an Engine to Find Product Market Fit," First Round Review, 2018', url: U.superhuman, level: 'p' },
    { what: 'Retention should level off.', label: 'Y Combinator, "How To Keep Your Users," Startup School (11:54)', url: U.ycRetain, level: 'p' },
    { what: 'LTV and CAC.', label: 'Y Combinator, "Consumer Startup Metrics," Startup School (7:37)', url: U.ycMetrics, level: 'p' },
  ],
  srcNote: 'Primary means the author\'s own essay or talk. The Slack figure is Hiten Shah\'s survey as cited in the Superhuman article.',
}

export const EP_STORY: Record<string, { en: StoryLang; zh: StoryLang; ogDesc?: string }> = {
  ep01: { en: EP01_EN, zh: EP01_ZH, ogDesc: 'Nvidia\'s board has ten directors, and none of them work at Nvidia. The one who has served longest said no to Jensen Huang\'s return. Who they are, and how long each has served.' },
  ep02: { en: EP02_EN, zh: EP02_ZH },
  ep03: { en: EP03_EN, zh: EP03_ZH },
  ep04: { en: EP04_EN, zh: EP04_ZH },
}
