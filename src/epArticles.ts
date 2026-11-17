// 集數的長文版（261117）。手寫正本，不由 gen_episodes.py 產生，重跑腳本不會蓋掉。
// EP01 事實全部出自 V怪客影片/03_查核/JE02_董事會名單_261116.md 與文末出處；最新動態查到 2026-11-17。
// 規則：只寫事實不評價；中文零破折號；改完跑 check_voice.py。

export type Director = { name: string; since: string; bg: string }
export type Update = { date: string; text: string; src: string }
export type Source = { what: string; label: string; url: string; level: 'p' | 'n' | 's' }
export type LongLang = {
  open: string[]
  metaphorH: string; metaphor: string[]
  boardH: string; boardLead: string; colName: string; colSince: string; colBg: string; directors: Director[]; boardNote: string
  votesH: string; votes: string[]; seatsCap: string
  newsH: string; newsLead: string; updates: Update[]; newsNote: string
  closeH: string
  sourcesH: string; levels: { p: string; n: string; s: string }; sources: Source[]; srcNote: string
}


// 通用分節長文（EP03 起）：每節可有段落與「條目」，條目各自帶出處
export type SecItem = { k: string; v: string; src: string }
export type Sec = { h: string; lead?: string; paras?: string[]; items?: SecItem[]; seats?: { on: number; cap: string }; note?: string }
export type SecLang = { open: string[]; sections: Sec[]; quoteNote?: string; sourcesH: string; levels: { p: string; n: string; s: string }; sources: Source[]; srcNote: string }

const SRC_URL = {
  newsroom: 'https://nvidianews.nvidia.com/news/nvidia-announces-ceo-transition',
  k8: 'https://www.sec.gov/Archives/edgar/data/1045810/000104581026000082/nvda-20261111.htm',
  proxy: 'https://www.sec.gov/Archives/edgar/data/1045810/000104581026000036/nvda-20260512.htm',
  k8nora: 'https://www.sec.gov/Archives/edgar/data/1045810/000104581026000028/nvda-20260507.htm',
  bylaws: 'https://www.sec.gov/Archives/edgar/data/1045810/000104581024000069/exhibit31-amendedandrestat.htm',
  cnbcLive: 'https://www.cnbc.com/2026/11/12/nvidia-jensen-huang-ceo-live-updates.html',
  cnbcBoard: 'https://www.cnbc.com/2026/11/16/nvidia-ceo-jensen-huang.html',
  cnbcCalls: 'https://www.cnbc.com/2026/11/16/nvidia-jensen-huang-return-tech.html',
  semafor: 'https://www.semafor.com/article/11/16/2026/altimeters-gerstner-urges-nvidias-board-to-reconsider-huangs-ouster-to-get-this-right',
  kobeissi: 'https://x.com/KobeissiLetter/status/2121500939680891215',
  buffett: 'https://www.berkshirehathaway.com/letters/2002pdf.pdf',
}

const EP01_EN: LongLang = {
  open: [
    'On November 12, 2026, Jensen Huang resigned as Nvidia\'s president, CEO and director, effective immediately. CFO Colette Kress became interim CEO. Harvey C. Jones became the board\'s first-ever chair.',
    'That leaves ten directors. None of them work at Nvidia. If Jensen wants his seat back, these ten people decide.',
  ],
  metaphorH: 'Think of it as a breakup',
  metaphor: [
    'After a breakup, your friends decide who still gets invited to dinner. A lot depends on whose friends they were first.',
    'A company has that circle too: the board. Who sits on it is called <mark>board composition</mark>. Three of Nvidia\'s ten have sat on the board since the 1990s. Five joined in 2019 or later.',
  ],
  boardH: 'The ten directors',
  boardLead: 'Listed by the year each one joined. Backgrounds come from Nvidia\'s 2026 proxy statement and its board pages.',
  colName: 'Director', colSince: 'Joined', colBg: 'Background',
  directors: [
    { name: 'Harvey C. Jones', since: '1993', bg: 'Co-founded Daisy Systems in 1981. Led Synopsys from 1987 to 1998, seven of those years as CEO. Co-founded Tensilica. Named board chair in November 2026.' },
    { name: 'Tench Coxe', since: '1993', bg: 'Managing director at venture firm Sutter Hill Ventures from 1989 to 2020.' },
    { name: 'A. Brooke Seawell', since: '1997', bg: 'CFO of Synopsys from 1991 to 1997. Now a venture partner at NEA. Chairs the audit committee.' },
    { name: 'Mark A. Stevens', since: '2008 (also 1993 to 2006)', bg: 'Managing partner at Sequoia Capital from 1993 to 2011. Earlier worked in technical sales and marketing at Intel.' },
    { name: 'Dawn Hudson', since: '2013', bg: 'CEO of Pepsi-Cola North America from 2005 to 2007. NFL chief marketing officer from 2014 to 2018. Chairs the compensation committee.' },
    { name: 'Stephen C. Neal', since: '2019', bg: 'CEO of law firm Cooley from 2001 to 2008, now chairman emeritus. Chaired Levi Strauss from 2011 to 2021. Chairs the nominating and governance committee.' },
    { name: 'John O. Dabiri', since: '2020', bg: 'Caltech professor of aeronautics and mechanical engineering. MacArthur Fellow. Served on the President\'s Council of Advisors on Science and Technology from 2021 to 2025.' },
    { name: 'Aarti Shah', since: '2020', bg: '27 years at Eli Lilly, last as SVP and chief information and digital officer. Left in 2021.' },
    { name: 'Melissa B. Lora', since: '2023', bg: '31 years at Taco Bell. Retired in 2018 as president of Taco Bell International.' },
    { name: 'Suzanne Nora Johnson', since: '2026', bg: '21 years at Goldman Sachs, retired as vice chairman. Chaired Intuit from 2007 to 2025. Joined Nvidia\'s board on July 13, 2026.' },
  ],
  boardNote: 'Join years are the "Director Since" column in the 2026 proxy. Nora Johnson joined after the proxy, per an 8-K filed in May 2026.',
  votesH: 'How many votes would it take?',
  votes: [
    'It depends on which job.',
    '<b>His board seat.</b> Section 19 of Nvidia\'s bylaws says an open seat is filled by a majority of the directors in office. Ten are in office, so <mark>six have to say yes</mark>.',
    '<b>The CEO job.</b> The board appoints officers. A normal board vote needs a majority of the directors present, once a quorum shows up. A quorum is six. So in theory, four yes votes out of six in the room could do it.',
    'Many reports mix the two numbers up. The seat takes six of ten. The CEO job takes a majority of whoever attends.',
  ],
  seatsCap: 'Ten directors in office. Six yes votes fill an open seat.',
  newsH: 'What happened next',
  newsLead: 'Since he resigned, investors, founders and the White House have spoken up. The board has not said anything on the record about a return.',
  updates: [
    { date: 'Nov 13', text: 'Elon Musk posted on X: "A petition is underway to reinstate Jensen and I\'m signing it too." The petition had close to 180,000 signatures by November 16.', src: 'CNBC, Nov 15' },
    { date: 'Nov 13', text: 'Brad Gerstner of Altimeter Capital and Gavin Baker of Atreides Management, both Nvidia shareholders, wrote to the board. They asked for "a slow, measured, and deliberate process" that "leaves all options on the table," including Jensen\'s return.', src: 'Semafor and CNBC, Nov 16' },
    { date: 'Nov 14', text: 'Musk reportedly questioned the board itself: "This is the board making decisions about what used to be the most valuable company on Earth!?" We could not open the original post.', src: 'The Kobeissi Letter and TokenPost' },
    { date: 'Nov 16', text: 'Gerstner said the letter was not a demand for Jensen\'s immediate return. He said the board needs "to get this right."', src: 'Semafor, Nov 16' },
    { date: 'Nov 16', text: 'President Trump told reporters he is open to Jensen returning as CEO.', src: 'CNBC, Nov 16' },
    { date: 'Nov 16', text: 'A person familiar with the matter told CNBC the board is not considering bringing Jensen back as CEO and is focused on its investigation. A board representative said it is selecting a search firm for the CEO role.', src: 'CNBC, Nov 16' },
  ],
  newsNote: 'Last checked November 17, 2026. The "not considering" report is about the CEO job and comes from one unnamed source.',
  closeH: 'One more thing',
  sourcesH: 'Sources',
  levels: { p: 'Primary', n: 'News report', s: 'Secondary' },
  sources: [
    { what: 'Nvidia\'s own announcement. Confirms the resignation, the interim CEO and the new board chair.', label: 'Nvidia Newsroom, "NVIDIA Announces CEO Transition," Nov 12, 2026', url: SRC_URL.newsroom, level: 'p' },
    { what: 'The SEC filing where the board accepted his resignation as CEO and director, effective immediately.', label: 'Nvidia Form 8-K, event date Nov 11, 2026', url: SRC_URL.k8, level: 'p' },
    { what: 'Where every director\'s bio, join year and committee role comes from.', label: 'Nvidia 2026 proxy statement (DEF 14A), May 12, 2026', url: SRC_URL.proxy, level: 'p' },
    { what: 'Adds Suzanne Nora Johnson, the one director who joined after the proxy.', label: 'Nvidia Form 8-K, May 2026', url: SRC_URL.k8nora, level: 'p' },
    { what: 'The rule behind "six of ten." Section 19 covers open seats; Section 23 covers quorum and normal votes.', label: 'Nvidia bylaws, amended March 12, 2024', url: SRC_URL.bylaws, level: 'p' },
    { what: 'Same-day coverage noting that all ten remaining directors are non-employees.', label: 'CNBC live updates, Nov 12, 2026', url: SRC_URL.cnbcLive, level: 'n' },
    { what: 'The report that the board is not considering a return as CEO, plus Trump\'s comments.', label: 'CNBC, "Nvidia board is not considering bringing Jensen Huang back as CEO," Nov 16, 2026', url: SRC_URL.cnbcBoard, level: 'n' },
    { what: 'Who is calling for a return: Musk, the petition, and the Gerstner and Baker letter.', label: 'CNBC, "The tech world\'s calls for Jensen Huang to return to Nvidia are growing," Nov 15, 2026', url: SRC_URL.cnbcCalls, level: 'n' },
    { what: 'Gerstner on what the letter asked for and what it did not.', label: 'Semafor, "Altimeter\'s Gerstner says Nvidia\'s board should keep door open to Huang\'s return," Nov 16, 2026', url: SRC_URL.semafor, level: 'n' },
    { what: 'Musk\'s comment about the board, as quoted by others. His original post could not be opened.', label: 'The Kobeissi Letter on X, Nov 14, 2026 (TokenPost quotes the same line)', url: SRC_URL.kobeissi, level: 's' },
    { what: 'The Buffett line at the end, in his own words.', label: 'Berkshire Hathaway 2002 letter to shareholders', url: SRC_URL.buffett, level: 'p' },
  ],
  srcNote: 'Primary means the original filing or document. News reports and secondary reports are labeled, and the article uses them only as far as they go.',
}

const EP01_ZH: LongLang = {
  open: [
    '2026 年 11 月 12 日，黃仁勳辭去 Nvidia 總裁、執行長與董事，即時生效。財務長 Colette Kress 代理執行長，Harvey C. Jones 出任 Nvidia 史上第一位董事會主席。',
    '董事會剩下十位，沒有一位在 Nvidia 上班。黃仁勳想回到董事會，要看這十個人。',
  ],
  metaphorH: '用分手來想',
  metaphor: [
    '分手之後，朋友圈決定誰還會被約出來吃飯。很大一部分，要看他們原本是誰的朋友。',
    '公司也有這個朋友圈，叫董事會。誰坐在裡面，叫<mark>董事會組成</mark>。Nvidia 這十位裡，三位從 1990 年代就在董事會，五位是 2019 年之後才加入。',
  ],
  boardH: '十位董事是誰',
  boardLead: '依加入年份排列。經歷出自 Nvidia 2026 年股東會委託書與官網董事頁。',
  colName: '董事', colSince: '加入', colBg: '經歷',
  directors: [
    { name: 'Harvey C. Jones', since: '1993', bg: '1981 年共同創辦 Daisy Systems；1987 到 1998 年帶領晶片設計軟體公司 Synopsys，其中七年任執行長；共同創辦 Tensilica。2026 年 11 月出任董事會主席。' },
    { name: 'Tench Coxe', since: '1993', bg: '1989 到 2020 年任創投 Sutter Hill Ventures 董事總經理。' },
    { name: 'A. Brooke Seawell', since: '1997', bg: '1991 到 1997 年任 Synopsys 財務長，現為創投 NEA 的 Venture Partner。審計委員會主席。' },
    { name: 'Mark A. Stevens', since: '2008（1993 到 2006 年曾任董事）', bg: '1993 到 2011 年任 Sequoia Capital 管理合夥人，更早在 Intel 做技術業務與行銷。' },
    { name: 'Dawn Hudson', since: '2013', bg: '2005 到 2007 年任 Pepsi-Cola 北美總裁兼執行長，2014 到 2018 年任 NFL 行銷長。薪酬委員會主席。' },
    { name: 'Stephen C. Neal', since: '2019', bg: '2001 到 2008 年任律師事務所 Cooley 執行長，現為榮譽董事長；2011 到 2021 年任 Levi Strauss 董事長。提名與治理委員會主席。' },
    { name: 'John O. Dabiri', since: '2020', bg: '加州理工學院航空與機械工程講座教授，麥克阿瑟獎得主；2021 到 2025 年任總統科技顧問委員會（PCAST）委員。' },
    { name: 'Aarti Shah', since: '2020', bg: '在禮來（Eli Lilly）27 年，最後任資深副總裁兼資訊與數位長，2021 年離開。' },
    { name: 'Melissa B. Lora', since: '2023', bg: '在 Taco Bell 31 年，2018 年以 Taco Bell International 總裁退休。' },
    { name: 'Suzanne Nora Johnson', since: '2026', bg: '在高盛 21 年，以副董事長退休；2007 到 2025 年任 Intuit 董事長。2026 年 7 月 13 日加入 Nvidia 董事會。' },
  ],
  boardNote: '加入年份取自 2026 年委託書的「Director Since」欄。Nora Johnson 在委託書之後才加入，依據是 2026 年 5 月的 8-K。',
  votesH: '要回來，需要幾票？',
  votes: [
    '要看回的是哪個位子。',
    '<b>回董事會。</b>Nvidia 章程第 19 條規定，董事出缺由在任董事過半數補選。在任十位，<mark>要有六位點頭</mark>。',
    '<b>回任執行長。</b>執行長由董事會任命。一般決議只要出席董事過半數，前提是出席人數達到法定人數，而法定人數是六位。換句話說，理論上六人出席、四人同意就能通過。',
    '不少報導把兩個數字混在一起。回董事會要十位裡的六位；回任執行長，要的是當天出席者的過半數。',
  ],
  seatsCap: '在任董事十位，補一個空缺要六票。',
  newsH: '最新動態',
  newsLead: '他辭職之後，投資人、創業者和白宮都表態了。董事會至今沒有公開談過讓他回來的事。',
  updates: [
    { date: '11/13', text: '馬斯克在 X 發文：「A petition is underway to reinstate Jensen and I\'m signing it too.」（有一份請願書要讓黃仁勳回來，我也要簽。）到 11/16，請願書接近 18 萬人連署。', src: 'CNBC，11/15' },
    { date: '11/13', text: '兩位 Nvidia 股東，Altimeter Capital 的 Brad Gerstner 與 Atreides Management 的 Gavin Baker，去信董事會，要求接班程序「慢一點、審慎一點」，並把黃仁勳回任留在選項裡。', src: 'Semafor 與 CNBC，11/16' },
    { date: '11/14', text: '據轉述，馬斯克質疑董事會本身：「This is the board making decisions about what used to be the most valuable company on Earth!?」（就是這個董事會，在決定曾經全球市值最高的公司？）原貼文我們沒能打開核對。', src: 'The Kobeissi Letter、TokenPost' },
    { date: '11/16', text: 'Gerstner 說那封信不是要求黃仁勳馬上回來，董事會要做的是「把這件事做對」。', src: 'Semafor，11/16' },
    { date: '11/16', text: '川普對記者表示，對黃仁勳回任執行長持開放態度。', src: 'CNBC，11/16' },
    { date: '11/16', text: '知情人士告訴 CNBC，董事會沒有考慮讓黃仁勳回任執行長，重心放在內部調查。董事會代表表示，正在挑選執行長的獵才公司。', src: 'CNBC，11/16' },
  ],
  newsNote: '查到 2026 年 11 月 17 日。「不考慮」講的是執行長職位，來源是一位匿名人士。',
  closeH: '最後一個問題',
  sourcesH: '出處',
  levels: { p: '一手', n: '媒體報導', s: '多家轉述' },
  sources: [
    { what: 'Nvidia 官方公告，確認辭職、代理執行長與新任董事會主席。', label: 'Nvidia Newsroom〈NVIDIA Announces CEO Transition〉，2026-11-12', url: SRC_URL.newsroom, level: 'p' },
    { what: '向美國證管會申報的文件，董事會接受他辭去執行長與董事，即時生效。', label: 'Nvidia Form 8-K，事件日 2026-11-11', url: SRC_URL.k8, level: 'p' },
    { what: '每位董事的經歷、加入年份與委員會職務都出自這份。', label: 'Nvidia 2026 年股東會委託書（DEF 14A），2026-05-12', url: SRC_URL.proxy, level: 'p' },
    { what: '補上委託書之後才加入的 Suzanne Nora Johnson。', label: 'Nvidia Form 8-K，2026 年 5 月', url: SRC_URL.k8nora, level: 'p' },
    { what: '「十位要六位」的依據。第 19 條講補缺額，第 23 條講法定人數與一般決議。', label: 'Nvidia 章程，2024-03-12 修訂版', url: SRC_URL.bylaws, level: 'p' },
    { what: '當天報導，指出剩下的十位董事都不是員工。', label: 'CNBC 即時報導，2026-11-12', url: SRC_URL.cnbcLive, level: 'n' },
    { what: '董事會不考慮讓他回任執行長的報導，以及川普的發言。', label: 'CNBC〈Nvidia board is not considering bringing Jensen Huang back as CEO〉，2026-11-16', url: SRC_URL.cnbcBoard, level: 'n' },
    { what: '誰在呼籲他回來：馬斯克、請願書、Gerstner 與 Baker 的信。', label: 'CNBC〈The tech world\'s calls for Jensen Huang to return to Nvidia are growing〉，2026-11-15', url: SRC_URL.cnbcCalls, level: 'n' },
    { what: 'Gerstner 親口說明那封信要求什麼、沒有要求什麼。', label: 'Semafor〈Altimeter\'s Gerstner says Nvidia\'s board should keep door open to Huang\'s return〉，2026-11-16', url: SRC_URL.semafor, level: 'n' },
    { what: '馬斯克質疑董事會那句話的轉述來源，原貼文無法打開。', label: 'The Kobeissi Letter 在 X 的貼文，2026-11-14（TokenPost 引用同一句）', url: SRC_URL.kobeissi, level: 's' },
    { what: '結尾巴菲特那句話的原文。', label: 'Berkshire Hathaway 2002 年股東信', url: SRC_URL.buffett, level: 'p' },
  ],
  srcNote: '一手指原始申報文件或原文。媒體報導與轉述都標了等級，文中只照它們的層級引用。',
}


// EP03（JE09）事實全部出自 V怪客影片/03_查核/EP_黃仁勳回得來嗎_261117.md、L02_控制權查核_261115.md、L02_利益與幕後說法查核_261115.md；
// 「董事會怎麼換」一節另查 Darden 2014（Nation's Restaurant News）與 Exxon 2021（CNBC）。查到 2026-11-17。
const S3 = {
  tars: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3924753',
  jmf: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3757923',
  apple98: 'https://www.sec.gov/Archives/edgar/data/320193/0001047469-98-010062.txt',
  apple97: 'https://www.mactech.com/1997/08/07/md1-apple-keynote-ms-announcement/',
  oaiX: 'https://x.com/OpenAI/status/1727206187077370115',
  verge: 'https://www.theverge.com/2024/3/8/24094885/openai-sam-altman-investigation-board-results',
  paypal: 'https://www.sec.gov/Archives/edgar/data/1103415/000091205702006471/a2071068z424b4.htm',
  fortune: 'https://fortune.com/2023/07/26/elon-musk-second-try-twitter-x-dot-com-paypal/',
  darden: 'https://nrn.com/corporate/darden-board-ousted',
  exxon: 'https://www.cnbc.com/2021/06/02/activist-firm-engine-no-1-claims-third-exxon-board-seat-.html',
  meta: 'https://www.sec.gov/Archives/edgar/data/1326801/000162828026025532/meta-20260416.htm',
  zuck: 'https://www.cnbc.com/2019/10/03/zuckerberg-if-i-didnt-have-control-of-facebook-i-wouldve-been-fired.html',
  twitter: 'https://www.sec.gov/Archives/edgar/data/1418091/000119312516543310/d131234ddef14a.htm',
  nvproxy: 'https://www.sec.gov/Archives/edgar/data/1045810/000104581026000036/nvda-20260512.htm',
  ap: 'https://www.pbs.org/newshour/politics/trump-backs-campaign-to-reinstate-huang-as-ceo-of-nvidia',
  stanford: 'https://news.stanford.edu/stories/2005/06/youve-got-find-love-jobs-says',
}

const EP03_EN: SecLang = {
  open: [
    'On November 12, 2026, Jensen Huang resigned as Nvidia\'s CEO and gave up his board seat. Within days, Elon Musk, President Trump and a petition with more than 170,000 self-reported names said they want him back.',
    'So can a founder get back with his company? Start with couples.',
  ],
  sections: [
    {
      h: 'Getting back together is common',
      paras: [
        'Researchers in Ohio followed 792 young adults, ages 17 to 24, who were dating or living with a partner. About <mark>45 percent</mark> had broken up with that partner and gotten back together. The paper calls it relationship churning.',
        'The number describes one group of young Americans interviewed in 2006. It is not a figure for everyone. Using the same data, the same team found couples who churned were about twice as likely to report physical violence as couples who stayed together. Common does not mean good.',
      ],
      note: 'We found no peer-reviewed share for couples who split again after getting back together. The figures that circulate online come from coaching sites or unnamed surveys, so we left them out.',
    },
    {
      h: 'Two came back. One did not.',
      items: [
        { k: 'Steve Jobs, Apple', v: 'In 1985 Apple\'s board sided with John Sculley, the CEO Jobs had hired, and Jobs left. In December 1996 Apple agreed to buy his company NeXT. He became interim CEO in September 1997. Apple\'s 1998 proxy lists his holding as <b>one share</b>.', src: 'Apple 1998 proxy; Stanford speech, 2005' },
        { k: 'Sam Altman, OpenAI', v: 'OpenAI\'s board removed him on November 17, 2023, saying he had not been consistently candid with it. Most of the staff signed a letter threatening to leave. Five days later OpenAI announced he would return as CEO <b>with a new initial board</b>.', src: 'OpenAI on X, Nov 22, 2023' },
        { k: 'Elon Musk, X.com', v: 'He ran X.com, the company that became PayPal, until September 2000. The board replaced him with Peter Thiel while he was flying to Sydney for a delayed honeymoon. He held <b>13.0 percent</b>, the largest stake, and never went back as CEO.', src: 'PayPal 2002 IPO prospectus; Fortune, 2023' },
      ],
      note: 'Shares did not decide any of the three. One share was enough for Jobs. Thirteen percent was not enough for Musk.',
    },
    {
      h: 'How a board actually changes',
      lead: 'A founder comes back when the board says yes. Here are the ways the people on that board get changed, each with a real case.',
      items: [
        { k: '1. Shareholders vote directors out', v: 'Directors are elected at the annual meeting, and an outside investor can run its own slate. This is a proxy fight. In October 2014, Darden Restaurants shareholders elected all 12 nominees of activist fund Starboard Value, which held about 8.8 percent, and <b>replaced the entire board</b>. In 2021, Engine No. 1 owned about 0.02 percent of Exxon and still won three of twelve seats, with votes from big pension funds and BlackRock.', src: 'Nation\'s Restaurant News, 2014; CNBC, 2021' },
        { k: '2. The board remakes itself', v: 'After Altman\'s firing, three of the four directors who voted him out left OpenAI\'s board. Bret Taylor, Larry Summers and Adam D\'Angelo formed the new initial board. Altman did not get his own seat back until March 2024.', src: 'OpenAI on X, 2023; The Verge, 2024' },
        { k: '3. A deal brings the founder in', v: 'Apple bought NeXT, and Jobs came with it. In August 1997 Apple announced a six-person board, <b>replacing all but two former directors</b>. The new members were Jobs, Larry Ellison, Bill Campbell and Jerry York.', src: 'Apple press release, Aug 6, 1997' },
        { k: '4. The founder holds the votes', v: 'With dual-class shares, a founder can keep control without owning most of the company. Mark Zuckerberg holds <b>60.8 percent</b> of Meta\'s votes, per its 2026 proxy. He told employees in 2019 that without that control, "there were several points where I would\'ve been fired."', src: 'Meta 2026 proxy; CNBC, 2019' },
        { k: '5. The founder never leaves the board', v: 'Twitter replaced Jack Dorsey as CEO in October 2008. He stayed on as board chairman, and in 2015 he became CEO again. He owned 3.40 percent, one vote per share. The seat he kept was the way back.', src: 'Twitter 2016 proxy' },
      ],
    },
    {
      h: 'Where Jensen stands',
      seats: { on: 6, cap: 'Ten directors in office. Six yes votes fill an open seat.' },
      paras: [
        'He gave up his board seat along with the CEO job, so the Dorsey route is closed. Nvidia has one class of stock, one vote per share, and he held 3.58 percent, so the Zuckerberg route is closed too.',
        '<b>Back on the board.</b> Nvidia\'s bylaws fill an open seat by a majority of the directors in office. Ten are in office, so <mark>six have to say yes</mark>.',
        '<b>Back as CEO.</b> The board appoints the CEO by a majority of the directors present at a meeting, once a quorum of six shows up.',
        'Reportedly, the board won\'t bring him back as CEO. CNBC and AP each cite one unnamed person, and the board has made no formal statement. Two shareholders, Brad Gerstner and Gavin Baker, asked the board for a slow, deliberate process that keeps his return among the options. They did not demand it.',
      ],
      note: 'Last checked November 17, 2026. Nvidia reports quarterly results after the market closes that day; this article does not cover them.',
    },
  ],
  quoteNote: 'Jobs did not go back because he was still in love. He went back because Apple bought NeXT.',
  sourcesH: 'Sources',
  levels: { p: 'Primary', n: 'News report', s: 'Secondary' },
  sources: [
    { what: 'The 45 percent: 792 young adults in Lucas County, Ohio, ages 17 to 24, interviewed in 2006.', label: 'Halpern-Meekin et al., "Relationship Churning in Emerging Adulthood," Journal of Adolescent Research 28(2), 2013', url: S3.tars, level: 'p' },
    { what: 'Same data, same team: churning couples reported more violence and verbal abuse.', label: 'Halpern-Meekin et al., Journal of Marriage and Family 75(1), 2013', url: S3.jmf, level: 'p' },
    { what: 'Jobs\'s holding of one share, in the ownership table.', label: 'Apple 1998 proxy statement', url: S3.apple98, level: 'p' },
    { what: 'The 1997 board: six directors, all but two replaced.', label: 'Apple press release, Aug 6, 1997 (reprinted by MacTech)', url: S3.apple97, level: 'p' },
    { what: 'Altman\'s return as CEO with a new initial board.', label: 'OpenAI on X, Nov 22, 2023', url: S3.oaiX, level: 'p' },
    { what: 'Altman rejoins the board in March 2024 with three new directors.', label: 'The Verge, Mar 8, 2024', url: S3.verge, level: 'n' },
    { what: 'Musk\'s dates as CEO and his 13.0 percent stake.', label: 'PayPal IPO prospectus (424B4), Feb 2002', url: S3.paypal, level: 'p' },
    { what: 'How the board replaced Musk while he flew to Sydney.', label: 'Fortune, Jul 26, 2023', url: S3.fortune, level: 'n' },
    { what: 'Darden shareholders replace all 12 directors with Starboard\'s slate.', label: 'Nation\'s Restaurant News, Oct 2014', url: S3.darden, level: 'n' },
    { what: 'Engine No. 1 wins a third Exxon seat with about 0.02 percent of the stock.', label: 'CNBC, Jun 2, 2021', url: S3.exxon, level: 'n' },
    { what: 'Zuckerberg\'s 60.8 percent of the votes.', label: 'Meta 2026 proxy statement', url: S3.meta, level: 'p' },
    { what: 'Zuckerberg: "there were several points where I would\'ve been fired."', label: 'CNBC, Oct 3, 2019, on leaked internal Q&A audio', url: S3.zuck, level: 'n' },
    { what: 'Dorsey as chairman from 2008 to 2015, his 3.40 percent and one vote per share.', label: 'Twitter 2016 proxy statement', url: S3.twitter, level: 'p' },
    { what: 'Jensen Huang\'s 3.58 percent and Nvidia\'s single class of stock.', label: 'Nvidia 2026 proxy statement', url: S3.nvproxy, level: 'p' },
    { what: 'The six-of-ten rule for an open board seat.', label: 'Nvidia bylaws, amended Mar 12, 2024', url: SRC_URL.bylaws, level: 'p' },
    { what: 'The report that the board is not considering a return as CEO.', label: 'CNBC, Nov 16, 2026', url: SRC_URL.cnbcBoard, level: 'n' },
    { what: 'A second outlet with the same report, from its own unnamed source.', label: 'AP via PBS NewsHour, Nov 16, 2026', url: S3.ap, level: 'n' },
    { what: 'Gerstner on what the shareholder letter asked for and what it did not.', label: 'Semafor, Nov 16, 2026', url: SRC_URL.semafor, level: 'n' },
    { what: 'The Jobs line at the end, from the prepared text Stanford published.', label: 'Stanford News, "You\'ve got to find what you love," Jobs says, Jun 2005', url: S3.stanford, level: 'p' },
  ],
  srcNote: 'Primary means the original filing, paper or speech text. News reports are labeled, and the article uses them only as far as they go. The petition count is the site\'s own self-reported counter.',
}

const EP03_ZH: SecLang = {
  open: [
    '2026 年 11 月 12 日，黃仁勳辭去 Nvidia 執行長，連董事席也一起辭了。幾天之內，馬斯克、川普，還有一份超過十七萬個自填簽名的請願，都說要他回來。',
    '創辦人回得去自己的公司嗎？先從情侶講起。',
  ],
  sections: [
    {
      h: '復合其實很常見',
      paras: [
        '美國俄亥俄州一份研究，追蹤 792 位 17 到 24 歲、正在交往或同居的年輕人。大約 <mark>45%</mark> 跟同一個人分手後又復合過，論文把這叫做「分分合合」（relationship churning）。',
        '這個數字只代表 2006 年受訪的那一群美國年輕人，不能套到所有人身上。同一組研究者用同一批資料還發現，分分合合的情侶回報肢體暴力的比例，大約是穩定交往者的兩倍。常見，不等於好。',
      ],
      note: '復合之後又分手的比例，我們在同儕審查的期刊裡查不到。網路上流傳的百分比出自復合教練網站或來源不明的調查，所以不寫。',
    },
    {
      h: '兩個回來了，一個沒有',
      items: [
        { k: 'Steve Jobs，Apple', v: '1985 年 Apple 董事會站在他找來的執行長 John Sculley 那邊，Jobs 離開。1996 年 12 月 Apple 同意買下他的公司 NeXT，1997 年 9 月他出任臨時執行長。Apple 1998 年委託書的持股表上，他只有<b>一股</b>。', src: 'Apple 1998 年委託書；2005 年史丹佛演講' },
        { k: 'Sam Altman，OpenAI', v: '2023 年 11 月 17 日，OpenAI 董事會以他「對董事會溝通不夠坦白」為由拿掉他。大部分員工聯署揚言離職。五天後，OpenAI 宣布他回任執行長，<b>同時換上新的董事會</b>。', src: 'OpenAI 官方 X，2023-11-22' },
        { k: 'Elon Musk，X.com', v: '他帶領 X.com（後來的 PayPal）到 2000 年 9 月。他飛去雪梨度遲來的蜜月時，董事會改由 Peter Thiel 接任。他持股 <b>13.0%</b>，是最大股東，從此沒再回任執行長。', src: 'PayPal 2002 年公開說明書；Fortune，2023' },
      ],
      note: '三個人都不是股份決定的。Jobs 一股就夠，Musk 13% 還不夠。',
    },
    {
      h: '董事會是怎麼換掉的',
      lead: '創辦人能不能回來，看董事會點不點頭。董事會裡的人怎麼換，常見有這幾種，各舉一個真實例子。',
      items: [
        { k: '1. 股東投票把董事換掉', v: '董事在股東會選出，外部投資人可以提自己的名單拉票，這叫委託書爭奪戰（proxy fight）。2014 年 10 月，持股約 8.8% 的激進基金 Starboard Value 提名的 12 人全數當選，Darden Restaurants <b>整個董事會被換掉</b>。2021 年，只持有 Exxon 約 0.02% 股份的 Engine No. 1，靠大型退休基金與 BlackRock 的票，拿下 12 席裡的 3 席。', src: 'Nation\'s Restaurant News，2014；CNBC，2021' },
        { k: '2. 董事會自己改組', v: 'Altman 被開除後，投票拿掉他的四位董事有三位離開 OpenAI 董事會，改由 Bret Taylor、Larry Summers、Adam D\'Angelo 組成新董事會。Altman 自己要到 2024 年 3 月才回到董事席。', src: 'OpenAI 官方 X，2023；The Verge，2024' },
        { k: '3. 一筆交易把創辦人帶回來', v: 'Apple 買下 NeXT，Jobs 跟著回來。1997 年 8 月 Apple 宣布董事會改成六人，<b>原本的董事只留兩位</b>，新加入的是 Jobs、Larry Ellison、Bill Campbell、Jerry York。', src: 'Apple 新聞稿，1997-08-06' },
        { k: '4. 創辦人握有投票權', v: '用雙層股權，創辦人不必持有過半股份也能掌控公司。依 Meta 2026 年委託書，祖克柏握有 <b>60.8%</b> 的投票權。他 2019 年跟員工說，沒有這個控制權，「有好幾次我一定會被開除」。', src: 'Meta 2026 年委託書；CNBC，2019' },
        { k: '5. 創辦人一直沒離開董事會', v: 'Twitter 2008 年 10 月換掉 Jack Dorsey 的執行長，他留下來當董事長，2015 年再度出任執行長。他持股 3.40%，一股一票。他回得來，靠的是一直沒讓出來的那個位子。', src: 'Twitter 2016 年委託書' },
      ],
    },
    {
      h: '黃仁勳現在在哪一格',
      seats: { on: 6, cap: '在任董事十位，補一個空缺要六票。' },
      paras: [
        '他辭執行長時，董事席也一起辭了，所以 Dorsey 那條路走不通。Nvidia 只有一種普通股、一股一票，他持股 3.58%，祖克柏那條路也走不通。',
        '<b>回董事會。</b>Nvidia 章程規定，董事出缺由在任董事過半數補選。在任十位，<mark>要有六位點頭</mark>。',
        '<b>回任執行長。</b>執行長由董事會任命，出席董事達到法定人數六位後，出席者過半數同意即可。',
        '據報導，董事會不打算讓他回任執行長。CNBC 與 AP 各自引述一位匿名人士，董事會沒有正式聲明。兩位股東 Brad Gerstner 與 Gavin Baker 去信董事會，要求慢慢來、把他回任留在選項裡，但沒有要求讓他回來。',
      ],
      note: '查到 2026 年 11 月 17 日。Nvidia 當天美股收盤後公布季報，本文不含季報內容。',
    },
  ],
  quoteNote: 'Jobs 不是因為還愛著才回得去，是因為 Apple 買下了 NeXT。',
  sourcesH: '出處',
  levels: { p: '一手', n: '媒體報導', s: '多家轉述' },
  sources: [
    { what: '45% 的出處：俄亥俄州 Lucas County 792 位 17 到 24 歲年輕人，2006 年訪談。', label: 'Halpern-Meekin 等，〈Relationship Churning in Emerging Adulthood〉，Journal of Adolescent Research 28(2)，2013', url: S3.tars, level: 'p' },
    { what: '同一批資料、同一組研究者：分分合合的情侶回報較多肢體與言語暴力。', label: 'Halpern-Meekin 等，Journal of Marriage and Family 75(1)，2013', url: S3.jmf, level: 'p' },
    { what: 'Jobs 只持有一股，見持股表。', label: 'Apple 1998 年委託書', url: S3.apple98, level: 'p' },
    { what: '1997 年董事會改成六人、原董事只留兩位。', label: 'Apple 新聞稿，1997-08-06（MacTech 轉載）', url: S3.apple97, level: 'p' },
    { what: 'Altman 回任執行長、換上新董事會。', label: 'OpenAI 官方 X，2023-11-22', url: S3.oaiX, level: 'p' },
    { what: 'Altman 2024 年 3 月回到董事會，同時加入三位新董事。', label: 'The Verge，2024-03-08', url: S3.verge, level: 'n' },
    { what: 'Musk 擔任執行長的期間，以及 13.0% 持股。', label: 'PayPal 公開說明書（424B4），2002 年 2 月', url: S3.paypal, level: 'p' },
    { what: '董事會趁他飛雪梨時換人的經過。', label: 'Fortune，2023-07-26', url: S3.fortune, level: 'n' },
    { what: 'Darden 股東選出 Starboard 提名的 12 人，整個董事會換掉。', label: 'Nation\'s Restaurant News，2014 年 10 月', url: S3.darden, level: 'n' },
    { what: 'Engine No. 1 以約 0.02% 持股拿下 Exxon 第三席。', label: 'CNBC，2021-06-02', url: S3.exxon, level: 'n' },
    { what: '祖克柏 60.8% 投票權。', label: 'Meta 2026 年委託書', url: S3.meta, level: 'p' },
    { what: '祖克柏「有好幾次我一定會被開除」。', label: 'CNBC，2019-10-03，引述外流的內部問答錄音', url: S3.zuck, level: 'n' },
    { what: 'Dorsey 2008 到 2015 年任董事長、持股 3.40%、一股一票。', label: 'Twitter 2016 年委託書', url: S3.twitter, level: 'p' },
    { what: '黃仁勳持股 3.58%、Nvidia 只有一種普通股。', label: 'Nvidia 2026 年委託書', url: S3.nvproxy, level: 'p' },
    { what: '「十位要六位」補董事缺額的規定。', label: 'Nvidia 章程，2024-03-12 修訂版', url: SRC_URL.bylaws, level: 'p' },
    { what: '董事會不考慮讓他回任執行長的報導。', label: 'CNBC，2026-11-16', url: SRC_URL.cnbcBoard, level: 'n' },
    { what: '另一家各自取得消息、內容相同的報導。', label: 'AP（PBS NewsHour 轉載），2026-11-16', url: S3.ap, level: 'n' },
    { what: 'Gerstner 說明股東信要求什麼、沒要求什麼。', label: 'Semafor，2026-11-16', url: SRC_URL.semafor, level: 'n' },
    { what: '結尾 Jobs 那句話，出自史丹佛公布的演講稿。', label: 'Stanford News〈You\'ve got to find what you love, Jobs says〉，2005 年 6 月', url: S3.stanford, level: 'p' },
  ],
  srcNote: '一手指原始申報文件、論文或演講稿。媒體報導都標了等級，文中只照它們的層級引用。請願人數是網站自己的計數器，身分沒有驗證。',
}

export const EP_SEC: Record<string, { en: SecLang; zh: SecLang; ogDesc?: string }> = {
  ep03: {
    en: EP03_EN, zh: EP03_ZH,
    ogDesc: 'Getting back with an ex is common. Founders get back with their companies too, but shares never decided it. The five ways a board gets changed, and what it would take for Jensen Huang.',
  },
}

export const EP_LONG: Record<string, { en: LongLang; zh: LongLang; ogDesc?: string }> = {
  ep01: {
    en: EP01_EN, zh: EP01_ZH,
    // share preview text (Threads, LinkedIn): what the reader gets, in one breath
    ogDesc: 'Nvidia\'s board now has ten directors, and none of them work at Nvidia. Who they are, how many votes a return would take, and what Trump, Musk and investors said this week.',
  },
}
