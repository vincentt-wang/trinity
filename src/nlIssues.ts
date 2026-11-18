// Venture Relations 週信文案（261118）。一集一份，手寫，不從影片描述貼。
// 每週四 08:30（台北）由 vincent.easeai.com.tw 的 worker 自動挑一篇寄出，挑的是「已發布、沒寄過、成效最好」的那集。
// 沒有在這裡寫文案的集數，不會被挑中（feed.json 的 pending 會列出來，週三預覽信也會提醒）。
// 改完跑：node --experimental-strip-types scripts/nl_build.mjs（產 public/nl/feed.json 與數據圖），再照 README 部署。
// 規則：每一句都要指得回 epStories.ts 的延伸內容；中文零破折號；不寫影片已經講過的結論；跑 check_voice.py 要 exit 0。
//   subject：主旨，帶一個具體數字或人名，不重複文章標題。
//   opener：一句開場，指向一個具體事實。
//   points：三點，取自文章延伸段落（不是影片回顧）。
//   chartNote：數據圖下方的出處一行，不要重複圖裡的說明（圖本身由 epStories 的 chart 產生）。

export type NlCopy = { subject: string; opener: string; points: [string, string, string]; chartNote: string }
export type NlIssue = { zh: NlCopy; en: NlCopy }

export const NL_ISSUES: Record<string, NlIssue> = {
  ep01: {
    zh: {
      subject: 'Nvidia 十位董事，坐最久的已經 33 年',
      opener: '11 月 17 日開口說「不打算讓 Jensen 回任執行長」的董事長 Harvey Jones，1993 年就進了 Nvidia 董事會。',
      points: [
        '黃仁勳辭職後，董事會剩十位，沒有一位在 Nvidia 上班。依章程，補一個董事空缺要過半數，十位要六位點頭。',
        '董事每年改選，但候選人是董事會自己的提名委員會挑的。股東要換人，得自己提名、自己拉票。',
        '十位董事平均坐了約 14.8 年。審計委員會主席 Brooke Seawell 坐了 29 年。',
      ],
      chartNote: '誤差正負一年。出處：Nvidia 2026 年委託書、2026 年 5 月 8-K。',
    },
    en: {
      subject: 'Nvidia\'s longest-serving director has been there 33 years',
      opener: 'The chair who said on Nov 17 that the board has no plans to bring Jensen back as CEO is Harvey Jones. He joined Nvidia\'s board in 1993.',
      points: [
        'With Jensen gone, ten directors remain, and none of them work at Nvidia. Filling a board seat takes a majority, so six of ten have to say yes.',
        'Directors stand for election every year, but the board\'s own nominating committee picks the candidates. Shareholders who want change have to nominate and campaign on their own.',
        'The ten have served about 14.8 years on average. Audit chair Brooke Seawell has been there 29.',
      ],
      chartNote: 'Plus or minus a year. Source: Nvidia 2026 proxy statement and May 2026 8-K.',
    },
  },
  ep02: {
    zh: {
      subject: '黃仁勳說，Nvidia 和台積電做了三十年生意，沒有合約',
      opener: 'Founder-market fit 拆開來，是外人買不到的三樣東西：資料、洞見、人脈。黃仁勳在 Nvidia 33 年，三樣都有。',
      points: [
        '資料：2006 年推出的 CUDA，到 2026 年的年報有超過 750 萬名開發者在用。這一格屬於公司，人走了還在。',
        '洞見：他說 CUDA 曾吃掉公司全部的毛利，那時 Nvidia 是毛利率 35% 的公司。他沒收手，之後全押深度學習。',
        '人脈：張忠謀說合作起於 1997 年左右黃仁勳寫的一封信。黃仁勳說兩家三十年、幾百億美元的生意，沒有合約。',
      ],
      chartNote: '出處：Nvidia 公司年表、1998 年新聞稿、2026 年 10-K、Kress 官方簡介。',
    },
    en: {
      subject: 'Jensen says Nvidia and TSMC have done three decades of business with no contract',
      opener: 'Break founder-market fit apart and you get three things outsiders can\'t buy: data, insight and network. Jensen Huang built all three over 33 years at Nvidia.',
      points: [
        'Data: CUDA launched in 2006. Nvidia\'s 2026 annual report counts over 7.5 million developers using it and its other tools. That part belongs to the company and stays.',
        'Insight: he says CUDA once ate all of Nvidia\'s gross profit, at a company with a 35% gross margin. He kept it, and later went all in on deep learning.',
        'Network: Morris Chang says the partnership began with a letter from Jensen around 1997. Jensen says three decades and hundreds of billions of dollars of business, and no contract.',
      ],
      chartNote: 'Sources: Nvidia corporate timeline, 1998 press release, 2026 10-K, Kress bio.',
    },
  },
  ep03: {
    zh: {
      subject: '黃仁勳持股 3.58%，夠他回董事會嗎？',
      opener: '11 月 17 日上午，黃仁勳說願意回任執行長；大約五個半小時後，董事長在財報會議上說不打算讓他回來。',
      points: [
        '董事會說不，股東手上還有四條路：代理權之爭、proxy access（借公司的委託書提名）、股東臨時會、撤換董事。每一條都有門檻。',
        '他持股 3.58%，跨過 proxy access 的 3% 門檻。但 Nasdaq 規定三年內當過員工的人不算獨立董事，這條路他能送兩位盟友進去，送不了自己。',
        '回得來的創辦人，靠的不是持股。Jobs 在 1998 年的 Apple 委託書上只有 1 股；PayPal 上市前持股 13.0% 的 Musk，沒再當回執行長。',
      ],
      chartNote: '出處：Nvidia 章程（2024-03-12 修訂版）、Nvidia 2026 年委託書。',
    },
    en: {
      subject: 'Jensen owns 3.58%. Is that enough to get back on the board?',
      opener: 'On the morning of Nov 17, Jensen said he would return as CEO. About five and a half hours later, the chair said on the earnings call that the board has no plans to bring him back.',
      points: [
        'If the board says no, shareholders have four routes: a proxy fight, proxy access, a special meeting, or removing directors. Each one has a bar to clear.',
        'His 3.58 percent clears the 3 percent bar for proxy access. But under Nasdaq rules, anyone employed by the company in the last three years isn\'t independent. That route can seat two allies, not Jensen himself.',
        'Founders who made it back didn\'t do it on ownership. Jobs held 1 share on Apple\'s 1998 proxy. Musk owned 13.0 percent of PayPal before its IPO and never became CEO again.',
      ],
      chartNote: 'Source: Nvidia bylaws (amended Mar 12, 2024) and Nvidia 2026 proxy statement.',
    },
  },
  ep04: {
    zh: {
      subject: 'Superhuman 從 22% 做到 58%，分四步',
      opener: 'Superhuman 第一次問用戶「再也不能用會怎樣」，只有 22% 說會非常失望。三季之後，是 58%。',
      points: [
        '四成這條線，是 Sean Ellis 比了將近一百家新創畫出來的：成長卡住的公司，說「非常失望」的幾乎都不到四成。',
        'Superhuman 先只看最愛它的那群人，分數從 22% 跳到 33%。接著開發時間一半加碼他們愛的，一半修卡住其他人的地方。',
        '另外兩把尺：留存曲線要走平；一個客戶賺回的毛利（LTV），要是拿下他的成本（CAC）的三倍。先修最弱的那一把。',
      ],
      chartNote: '出處：Rahul Vohra，First Round Review，2018；Slack 數字是 Hiten Shah 2015 年的調查。',
    },
    en: {
      subject: 'How Superhuman went from 22% to 58%, in four steps',
      opener: 'The first time Superhuman asked users how they\'d feel without the product, 22 percent said very disappointed. Three quarters later, it was 58.',
      points: [
        'Sean Ellis drew the 40 percent line after comparing nearly a hundred startups. The ones that struggled to grow almost always fell short of it.',
        'Superhuman first looked only at the people who loved it most, and the score jumped from 22 to 33 percent. Then it split the roadmap: half on what fans love, half on what holds the near-fans back.',
        'The other two tests: retention has to level off, and a customer has to earn back three times what it cost to win them (LTV to CAC). Fix the weakest one first.',
      ],
      chartNote: 'Source: Rahul Vohra, First Round Review, 2018. The Slack figure is Hiten Shah\'s 2015 survey.',
    },
  },
}

// 下一篇預告：只有 Vincent 已經確定上線日期的集數才填，例如 { slug: 'ep05', zh: '下週：…', en: 'Next week: …' }。沒填就不出現。
export const NL_NEXT: { slug: string; zh: string; en: string } | null = null
