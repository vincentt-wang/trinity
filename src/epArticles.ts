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

export const EP_LONG: Record<string, { en: LongLang; zh: LongLang; ogDesc?: string }> = {
  ep01: {
    en: EP01_EN, zh: EP01_ZH,
    // share preview text (Threads, LinkedIn): what the reader gets, in one breath
    ogDesc: 'Nvidia\'s board now has ten directors, and none of them work at Nvidia. Who they are, how many votes a return would take, and what Trump, Musk and investors said this week.',
  },
}
