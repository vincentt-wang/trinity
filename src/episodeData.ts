// 由 scripts/gen_episodes.py 從 V怪客影片/06_網站/vr_content.py 產生，不要手改。
// body 內含 <mark>，是我們自己寫的正本文字。
// published：Vincent 准許發布才改成 true。false 的集數不出現在列表、網址顯示未發布並 noindex（重跑本腳本會保留這個值）。
export type EpLang = { title: string; term: string; desc: string; body: string[]; quoteBy: string; quote: string; quoteNote: string; ask: string; quoteOrig?: string }
export type Episode = { slug: string; n: number; published: boolean; en: EpLang; zh: EpLang; sources: { label: string; levelZh: string; levelEn: string; url: string | null }[] }
export const EPISODES: Episode[] = [
 {
  "slug": "ep01",
  "n": 1,
  "published": true,
  "en": {
   "title": "Who decides if Jensen Huang gets his seat back?",
   "term": "Board composition",
   "desc": "After a breakup, your friends decide who still gets invited to dinner. Nvidia's board works the same way.",
   "body": [
    "After a breakup, your friends decide who still gets invited to dinner. A lot depends on whose friends they were first.",
    "A company has that circle too: the board. Who sits on it is called <mark>board composition</mark>.",
    "On November 12, 2026, Jensen Huang resigned as Nvidia's president, CEO and director, effective immediately. CFO Colette Kress became interim CEO, and Harvey C. Jones became board chair. That leaves <mark>ten directors, none of them employees</mark>. Three have sat next to Jensen since the 1990s. Five joined in 2019 or later.",
    "They come from venture capital, chip design software, law, science, Goldman Sachs, PepsiCo and Taco Bell. Their bios and start dates are in Nvidia's 2026 proxy statement.",
    "Elon Musk reportedly asked whether this board should be deciding Nvidia's fate. The math for a return is short: Nvidia's bylaws fill an open board seat by a majority of the directors in office. With ten in office, <mark>six have to say yes</mark>."
   ],
   "quoteBy": "Warren Buffett, 2002 letter to Berkshire Hathaway shareholders",
   "quote": "It's almost impossible, for example, in a boardroom populated by well-mannered people, to raise the question of whether the CEO should be replaced.",
   "quoteNote": "",
   "ask": "Did Nvidia's board ask, or did Jensen leave first? What do you think?"
  },
  "zh": {
   "title": "黃仁勳能不能回到董事會，誰說了算？",
   "term": "董事會組成",
   "desc": "分手之後，朋友圈決定誰還會被約出來吃飯。Nvidia 的董事會也是這樣運作。",
   "body": [
    "分手之後，朋友圈決定誰還會被約出來吃飯。很大一部分，要看他們原本是誰的朋友。",
    "公司也有這個朋友圈，叫董事會。誰坐在裡面，叫<mark>董事會組成</mark>。",
    "2026 年 11 月 12 日，黃仁勳辭去 Nvidia 總裁、執行長與董事，即時生效。財務長 Colette Kress 代理執行長，Harvey C. Jones 出任董事會主席。董事會剩下<mark>十位，沒有一位是員工</mark>。三位從 1990 年代就跟黃仁勳坐在一起，五位是 2019 年之後才加入的。",
    "他們來自創投、晶片設計軟體、法律、學界、高盛、PepsiCo 和 Taco Bell。每位的經歷與加入年份，都寫在 Nvidia 2026 年的股東會委託書裡。",
    "據轉述，馬斯克質疑這個董事會該不該決定 Nvidia 的命運。要回來的算式很短：Nvidia 章程規定，董事會出缺由在任董事過半數補選。在任十位，<mark>要有六位點頭</mark>。"
   ],
   "quoteBy": "巴菲特，2002 年波克夏股東信",
   "quote": "一屋子有禮貌的董事，幾乎不可能開口問要不要換執行長。",
   "quoteNote": "",
   "ask": "Nvidia 的董事會是開了口，還是黃仁勳先走了？你怎麼想？",
   "quoteOrig": "It's almost impossible, for example, in a boardroom populated by well-mannered people, to raise the question of whether the CEO should be replaced."
  },
  "sources": [
   {
    "label": "Nvidia Newsroom, NVIDIA Announces CEO Transition, 2026-11-12",
    "levelZh": "一手",
    "levelEn": "Primary",
    "url": "https://nvidianews.nvidia.com/news/nvidia-announces-ceo-transition"
   },
   {
    "label": "Nvidia Form 8-K on the board accepting the resignation, 2026-11",
    "levelZh": "一手",
    "levelEn": "Primary",
    "url": "https://www.sec.gov/Archives/edgar/data/1045810/000104581026000082/nvda-20261111.htm"
   },
   {
    "label": "Nvidia 2026 proxy statement (DEF 14A), director bios and Director Since",
    "levelZh": "一手",
    "levelEn": "Primary",
    "url": "https://www.sec.gov/Archives/edgar/data/1045810/000104581026000036/nvda-20260512.htm"
   },
   {
    "label": "Nvidia bylaws (amended 2024-03-12), Section 19: vacancies filled by a majority of directors in office",
    "levelZh": "一手",
    "levelEn": "Primary",
    "url": "https://www.sec.gov/Archives/edgar/data/1045810/000104581024000069/exhibit31-amendedandrestat.htm"
   },
   {
    "label": "Berkshire Hathaway 2002 Annual Letter to Shareholders",
    "levelZh": "一手",
    "levelEn": "Primary",
    "url": "https://www.berkshirehathaway.com/letters/2002pdf.pdf"
   },
   {
    "label": "CNBC live coverage, 2026-11-12: the ten remaining directors are all non-employees",
    "levelZh": "媒體報導",
    "levelEn": "News report",
    "url": null
   },
   {
    "label": "Elon Musk's 2026-11-14 post, as quoted by The Kobeissi Letter and TokenPost; the original post was not opened",
    "levelZh": "多家轉述",
    "levelEn": "Multiple secondary reports",
    "url": null
   }
  ]
 },
 {
  "slug": "ep02",
  "n": 2,
  "published": true,
  "en": {
   "title": "Can someone new replace the one who knew you for years?",
   "term": "Founder-market fit",
   "desc": "The new person learns your coffee order in a week. Knowing you like your ex did takes years. Can that kind of fit be handed over?",
   "body": [
    "Start over after a long relationship, and the new person learns your coffee order in a week. Knowing you like your ex did takes years.",
    "Startups call that kind of depth <mark>founder-market fit</mark>. YC partner Jared Friedman puts the test in one line: are the founders experts in what they're doing?",
    "Before Nvidia, Jensen Huang designed microprocessors at AMD, then spent 1985 to 1993 at chipmaker LSI Logic. He co-founded Nvidia in April 1993 and ran it for <mark>33 years</mark>.",
    "On November 12, 2026, he resigned. Colette Kress, Nvidia's CFO since 2013, is interim CEO. The question: can that kind of fit be handed over?",
    "Two investors wrote about it years ago, and they lean different ways. Chris Dixon wrote in 2011 that founder-market fit can be developed through experience. Ben Horowitz wrote in 2010 about why a16z prefers founding CEOs."
   ],
   "quoteBy": "Ben Horowitz, a16z, Why We Prefer Founding CEOs (2010)",
   "quote": "Professional CEOs are effective at maximizing, but not finding, product cycles.",
   "quoteNote": "",
   "ask": "Can that kind of fit be handed over? What do you think?"
  },
  "zh": {
   "title": "新的人，取代得了認識你很多年的那個人嗎？",
   "term": "創辦人與市場契合",
   "desc": "新對象一週就記得你咖啡怎麼點，要像前任那樣懂你得花好幾年。這種契合，交得出去嗎？",
   "body": [
    "一段長感情之後重新開始，新對象一週就記得你咖啡怎麼點。要像前任那樣懂你，得花好幾年。",
    "新創圈把這種深度叫 <mark>founder-market fit</mark>。YC 合夥人 Jared Friedman 的檢驗只有一句：創辦人是不是他在做的這件事的專家？",
    "創立 Nvidia 之前，黃仁勳在 AMD 設計微處理器，1985 到 1993 年在晶片公司 LSI Logic 待了八年。1993 年 4 月共同創立 Nvidia，之後帶了 <mark>33 年</mark>。",
    "2026 年 11 月 12 日，他辭職了。2013 年起擔任 Nvidia 財務長的 Colette Kress 代理執行長。問題是：這種契合，交得出去嗎？",
    "兩位投資人很早就寫過這件事，方向不太一樣。Chris Dixon 2011 年寫過：founder-market fit 可以靠經驗養出來。Ben Horowitz 2010 年寫過 a16z 為什麼偏好創辦人當執行長。"
   ],
   "quoteBy": "a16z 的 Ben Horowitz，〈Why We Prefer Founding CEOs〉（2010）",
   "quote": "專業經理人很會把產品週期做到最大，但不擅長找到下一個。",
   "quoteNote": "",
   "ask": "這種契合，交得出去嗎？你怎麼想？",
   "quoteOrig": "Professional CEOs are effective at maximizing, but not finding, product cycles."
  },
  "sources": [
   {
    "label": "Jared Friedman, How to Get Startup Ideas, YC Startup Library",
    "levelZh": "一手",
    "levelEn": "Primary",
    "url": "https://www.ycombinator.com/library/8g-how-to-get-startup-ideas"
   },
   {
    "label": "Y Combinator, How to Get and Evaluate Startup Ideas, Startup School (7:20)",
    "levelZh": "一手",
    "levelEn": "Primary",
    "url": "https://www.youtube.com/watch?v=Th8JoIan4dg&t=440s"
   },
   {
    "label": "Nvidia Form 10-K (2026-02-25): AMD and LSI Logic 1985 to 1993",
    "levelZh": "一手",
    "levelEn": "Primary",
    "url": "https://www.sec.gov/Archives/edgar/data/1045810/000104581026000021/nvda-20260125.htm"
   },
   {
    "label": "Nvidia Corporate Timeline: founded April 5, 1993",
    "levelZh": "一手",
    "levelEn": "Primary",
    "url": "https://www.nvidia.com/en-us/about-nvidia/corporate-timeline/"
   },
   {
    "label": "Nvidia Newsroom, NVIDIA Announces CEO Transition, 2026-11-12",
    "levelZh": "一手",
    "levelEn": "Primary",
    "url": "https://nvidianews.nvidia.com/news/nvidia-announces-ceo-transition"
   },
   {
    "label": "Colette Kress named EVP and CFO in September 2013: Nvidia SEC Form 8-K and FY2026 annual report",
    "levelZh": "一手",
    "levelEn": "Primary",
    "url": null
   },
   {
    "label": "Chris Dixon, Founder/market fit, cdixon.org, 2011-06-19",
    "levelZh": "一手",
    "levelEn": "Primary",
    "url": "https://cdixon.org/2011/06/19/foundermarket-fit/"
   },
   {
    "label": "Ben Horowitz, Why We Prefer Founding CEOs, a16z, 2010-04-28",
    "levelZh": "一手",
    "levelEn": "Primary",
    "url": "https://a16z.com/why-we-prefer-founding-ceos/"
   }
  ]
 },
 {
  "slug": "ep03",
  "n": 3,
  "published": false,
  "en": {
   "title": "Can Jensen Huang come back?",
   "term": "Getting back together",
   "desc": "Getting back with an ex is common. Founders get back with their companies too. Unless a founder holds the votes, the board decides.",
   "body": [
    "In one US study, 45 percent of young adults broke up and got back together. Companies break up with founders too.",
    "By the third funding round, half of founder CEOs are replaced.",
    "Jensen Huang has left Nvidia. Elon Musk and over 180,000 petition signers want him back. The board reportedly says no.",
    "Who decides? Steve Jobs was pushed out in 1985 and came back when Apple bought NeXT. Musk himself, replaced at X.com, never went back.",
    "<mark>Unless a founder controls the votes, the board decides.</mark> Mark Zuckerberg controls 61 percent of Meta's votes. Jensen holds 3.6 percent.",
    "He left the board too. Getting back on takes six of ten directors."
   ],
   "quoteBy": "Steve Jobs, Stanford commencement address, 2005",
   "quote": "I had been rejected, but I was still in love.",
   "quoteNote": "",
   "ask": "Can Jensen come back? What do you think?"
  },
  "zh": {
   "title": "黃仁勳回得來嗎？",
   "term": "復合",
   "desc": "跟前任復合很常見，創辦人也會回到自己的公司。除非創辦人握有投票權，不然董事會說了算。",
   "body": [
    "美國一份研究裡，45% 的年輕人分手後又復合了。公司也會跟創辦人分手。",
    "募到第三輪時，一半的創辦人執行長已被換掉。",
    "黃仁勳已經離開 Nvidia。馬斯克和超過 18 萬個連署人都要他回來；據報導，董事會說不要。",
    "誰說了算？Jobs 1985 年被擠出 Apple，Apple 買下 NeXT 之後他回來了。馬斯克自己被 X.com（PayPal 前身）換掉，再也沒回去。",
    "<mark>除非創辦人手上握有投票權，不然董事會說了算。</mark>祖克柏握有 Meta 61% 的投票權，黃仁勳只有 3.6%。",
    "他連董事會也退出了。要回董事會，十位董事要六位點頭。"
   ],
   "quoteBy": "Steve Jobs，2005 年史丹佛畢業演講",
   "quote": "我被拒絕了，但我還愛著。",
   "quoteNote": "",
   "ask": "黃仁勳回得來嗎？你怎麼想？",
   "quoteOrig": "I had been rejected, but I was still in love."
  },
  "sources": [
   {
    "label": "Halpern-Meekin et al., Relationship Churning in Emerging Adulthood, Journal of Adolescent Research 28(2), 2013",
    "levelZh": "一手",
    "levelEn": "Primary",
    "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC3924753"
   },
   {
    "label": "Noam Wasserman interview, CKGSB Knowledge, 2013-01-31: 52% of founder-CEOs who reached a third round were replaced",
    "levelZh": "本人訪談",
    "levelEn": "Interview",
    "url": "https://english.ckgsb.edu.cn/knowledge/article/the-hypergrowth-conundrum-qa-with-noam-wasserman-start-up-statistician/"
   },
   {
    "label": "CBS News, petition passes 180,000 signatures (count reported by the petition site), 2026-11-16",
    "levelZh": "媒體報導",
    "levelEn": "News report",
    "url": null
   },
   {
    "label": "CNBC, Nvidia board is not considering bringing Jensen Huang back as CEO, 2026-11-16",
    "levelZh": "媒體報導",
    "levelEn": "News report",
    "url": null
   },
   {
    "label": "Meta 2026 proxy statement: Zuckerberg holds 60.8% of voting power",
    "levelZh": "一手",
    "levelEn": "Primary",
    "url": null
   },
   {
    "label": "Nvidia 2026 proxy statement: Jensen Huang holds 3.58% (record date 2026-03-23)",
    "levelZh": "一手",
    "levelEn": "Primary",
    "url": null
   },
   {
    "label": "Nvidia Newsroom, NVIDIA Announces CEO Transition, 2026-11-12",
    "levelZh": "一手",
    "levelEn": "Primary",
    "url": "https://nvidianews.nvidia.com/news/nvidia-announces-ceo-transition"
   },
   {
    "label": "Steve Jobs, Stanford commencement address, 2005-06-12",
    "levelZh": "一手",
    "levelEn": "Primary",
    "url": "https://news.stanford.edu/stories/2005/06/youve-got-find-love-jobs-says"
   }
  ]
 },
 {
  "slug": "ep04",
  "n": 4,
  "published": false,
  "en": {
   "title": "If you disappeared tomorrow, who'd actually miss you?",
   "term": "Product-market fit",
   "desc": "Three questions you asked while dating are the same three tests for product-market fit. You need all three at once.",
   "body": [
    "Think back to dating. When you were away, did they text? Months later, were they still around? Was it worth the effort?",
    "Swap the date for a customer and you get the same three questions. That's <mark>product-market fit</mark>.",
    "<b>One: would they miss you?</b> Sean Ellis asked users how they'd feel if they could no longer use the product. After comparing results across nearly 100 startups, he set the bar at <mark>at least 40 percent saying \"very disappointed\"</mark>. He called the threshold a bit arbitrary himself.",
    "<b>Two: do they keep coming back?</b> Of each month's new users, the share still around should <mark>level off, not hit zero</mark>. YC's Startup School teaches it as a flattening retention curve.",
    "<b>Three: is it worth it?</b> A customer should earn back <mark>three times</mark> what it costs to win them, in gross profit. Below that, there's little left to run the company.",
    "You need all three at once. Miss one, and that's the next thing to fix."
   ],
   "quoteBy": "Marc Andreessen, co-founder of Andreessen Horowitz, 2007",
   "quote": "The only thing that matters is getting to product/market fit.",
   "quoteNote": "",
   "ask": "Is that really the only thing? What do you think?"
  },
  "zh": {
   "title": "如果你明天消失，誰會真的想你？",
   "term": "產品市場契合",
   "desc": "談戀愛時你一定問過的三件事，就是產品市場契合的三個標準。三個要同時成立。",
   "body": [
    "回想一下談戀愛的時候。你不在，他會不會傳訊息？幾個月後，他還在不在？你花的心力，值不值得？",
    "把約會對象換成客戶，問的是同樣三件事。這就是<mark>產品市場契合</mark>。",
    "<b>第一，他會不會想你？</b>Sean Ellis 問用戶：如果再也不能用這個產品，你會怎樣？他比較了將近一百家新創的結果，把門檻定在<mark>至少四成回答「非常失望」</mark>。他自己也寫，這個門檻有點隨意。",
    "<b>第二，他會不會一直回來？</b>每個月的新用戶裡，還留著的比例要<mark>走平，不能掉到零</mark>。YC 的 Startup School 把它講成留存曲線要走平。",
    "<b>第三，划不划得來？</b>一個客戶賺回的毛利，要是拿下他所花成本的<mark>三倍</mark>。低於這個數，就沒剩多少錢經營公司。",
    "三個要同時成立。少一個，就是下一個要修的地方。"
   ],
   "quoteBy": "a16z 共同創辦人 Marc Andreessen，2007 年",
   "quote": "唯一重要的事，就是做到產品市場契合。",
   "quoteNote": "",
   "ask": "真的只有這件事嗎？你怎麼想？",
   "quoteOrig": "The only thing that matters is getting to product/market fit."
  },
  "sources": [
   {
    "label": "Sean Ellis, The Startup Pyramid, Startup Marketing Blog, about 2009 (Wayback snapshot 2010-01-01)",
    "levelZh": "一手",
    "levelEn": "Primary",
    "url": "http://web.archive.org/web/20100101133515/http://startup-marketing.com:80/the-startup-pyramid/"
   },
   {
    "label": "Rahul Vohra, How Superhuman Built an Engine to Find Product/Market Fit, First Round Review, 2018",
    "levelZh": "一手",
    "levelEn": "Primary",
    "url": "https://review.firstround.com/how-superhuman-built-an-engine-to-find-product-market-fit"
   },
   {
    "label": "Rahul Vohra, The Product-Market Fit Engine, Business of Software (3:43 and 12:47)",
    "levelZh": "一手",
    "levelEn": "Primary",
    "url": "https://www.youtube.com/watch?v=uf246kh5les"
   },
   {
    "label": "Y Combinator, How To Keep Your Users, Startup School (11:54, retention should flatten)",
    "levelZh": "一手",
    "levelEn": "Primary",
    "url": "https://www.youtube.com/watch?v=VNxBZ7ka5J0"
   },
   {
    "label": "Y Combinator, Consumer Startup Metrics, Startup School (7:37, LTV and CAC)",
    "levelZh": "一手",
    "levelEn": "Primary",
    "url": "https://www.youtube.com/watch?v=fdD4y4Civp4"
   },
   {
    "label": "Marc Andreessen, The Pmarca Guide to Startups, part 4: The only thing that matters, 2007-06-25 (Stanford course mirror)",
    "levelZh": "一手",
    "levelEn": "Primary",
    "url": "https://web.stanford.edu/class/ee204/ProductMarketFit.html"
   }
  ]
 },
 {
  "slug": "ep05",
  "n": 5,
  "published": false,
  "en": {
   "title": "Why could Nvidia's board let Jensen Huang go?",
   "term": "Governance",
   "desc": "Open a joint account, and every purchase gets a second vote. Take investor money, and every big decision does too.",
   "body": [
    "Move in together, and your private life gets shareholders. Single, you spend how you like. Open a joint account, and every purchase gets a second vote.",
    "Take investor money, and every big decision gets a second vote. Startups call it <mark>governance</mark>.",
    "On November 8, 2026, Jensen Huang emailed all of Nvidia: he had been unfaithful to his wife, and he apologized to shareholders too. <mark>Four days later</mark>, on November 12, he resigned.",
    "Forbes asked why some founders are harder to remove. The answer is votes. Nvidia is one share, one vote, and Jensen held about <mark>3.6 percent</mark>, per the 2026 proxy. Mark Zuckerberg holds about <mark>61 percent</mark> of Meta's voting power through ten-vote Class B shares.",
    "Over half picks the board. The board picks the CEO."
   ],
   "quoteBy": "Fred Wilson, co-founder of Union Square Ventures, AVC (2012)",
   "quote": "VCs have control when things don't work. Entrepreneurs have control when they do.",
   "quoteNote": "",
   "ask": "What do you think?"
  },
  "zh": {
   "title": "為什麼 Nvidia 董事會可以讓黃仁勳走？",
   "term": "公司治理",
   "desc": "開了共同帳戶，每一筆開銷都多了一票。拿了投資人的錢，每個重大決定也是。",
   "body": [
    "同居之後，你的私生活就有股東了。單身的時候，錢怎麼花是你的事。開了共同帳戶，每一筆開銷都多了一票。",
    "拿了投資人的錢，每個重大決定也多了一票。新創圈叫它<mark>公司治理</mark>。",
    "2026 年 11 月 8 日，黃仁勳寫信給 Nvidia 全體員工，承認對妻子不忠，也向股東道歉。<mark>四天後</mark>，11 月 12 日，他辭職。",
    "Forbes 問，為什麼有些創辦人比較難被換掉？答案是票。Nvidia 一股一票，依 2026 年委託書，黃仁勳持有大約 <mark>3.6%</mark>。祖克柏靠每股十票的 B 股，握有 Meta 大約<mark>六成一</mark>的投票權。",
    "過半的人選董事會，董事會選執行長。"
   ],
   "quoteBy": "Union Square Ventures 共同創辦人 Fred Wilson，AVC（2012）",
   "quote": "事情不順，創投說了算；事情順，創業者說了算。",
   "quoteNote": "",
   "ask": "你怎麼想？",
   "quoteOrig": "VCs have control when things don't work. Entrepreneurs have control when they do."
  },
  "sources": [
   {
    "label": "Nvidia Newsroom, A Message to Our Company, 2026-11-08",
    "levelZh": "一手",
    "levelEn": "Primary",
    "url": "https://nvidianews.nvidia.com/news/a-message-to-our-company"
   },
   {
    "label": "Nvidia Newsroom, Statement from NVIDIA Board of Directors, 2026-11-08",
    "levelZh": "一手",
    "levelEn": "Primary",
    "url": "https://nvidianews.nvidia.com/news/statement-from-nvidia-board-of-directors"
   },
   {
    "label": "Nvidia Newsroom, NVIDIA Announces CEO Transition, 2026-11-12",
    "levelZh": "一手",
    "levelEn": "Primary",
    "url": "https://nvidianews.nvidia.com/news/nvidia-announces-ceo-transition"
   },
   {
    "label": "Nvidia 2026 proxy statement (DEF 14A): one vote per share; Jen-Hsun Huang 3.58 percent",
    "levelZh": "一手",
    "levelEn": "Primary",
    "url": "https://www.sec.gov/Archives/edgar/data/1045810/000104581026000036/nvda-20260512.htm"
   },
   {
    "label": "Meta 2026 proxy statement: Class B ten votes per share; Mark Zuckerberg 60.8 percent of voting power",
    "levelZh": "一手",
    "levelEn": "Primary",
    "url": "https://www.sec.gov/Archives/edgar/data/1326801/000162828026025532/meta-20260416.htm"
   },
   {
    "label": "Forbes, Why Jensen Huang's Firing Couldn't Happen To Mark Zuckerberg, 2026-11-13 (only the question is cited; numbers come from SEC filings)",
    "levelZh": "媒體報導",
    "levelEn": "News report",
    "url": null
   },
   {
    "label": "Fred Wilson, Entrepreneurs Have Control When Things Work, VCs Have Control When Things Don't Work, AVC, 2012-07",
    "levelZh": "一手",
    "levelEn": "Primary",
    "url": "https://avc.com/2012/07/entrepreneurs-have-control-when-things-work-vcs-have-control-when-things-dont-work/"
   }
  ]
 },
 {
  "slug": "ep06",
  "n": 6,
  "published": false,
  "en": {
   "title": "Do risk-takers cheat more?",
   "term": "Risk-taking founders",
   "desc": "A small gene study says yes. A 52-country survey says cheating tracks with being less dependable, not with loving new things.",
   "body": [
    "You fell for them because they quit a safe job to start a company. Then a friend says: people who gamble like that cheat.",
    "A 2010 study of 181 young adults found that people with one dopamine gene variant reported <mark>over 50 percent more</mark> instances of infidelity. It was self-reported, and the sample was tiny.",
    "Bigger reviews found that variant doesn't reliably predict a love of novelty: three meta-analyses from 2002 to 2008 found no stable link for that variant. And a survey of 16,362 people in 52 countries found cheating tracked with being <mark>less dependable and less agreeable</mark>, not with loving new things.",
    "Risk isn't the red flag. In The Hypomanic Edge (2005), psychologist John Gartner argues it's why America has so many founders: it's a nation of immigrants, and the people who leave home to start over self-select for risk.",
    "Gartner called his own argument an inference, and critics at the time said the evidence wasn't there. Take it as a thesis, not a finding."
   ],
   "quoteBy": "John Gartner, interview with Entrepreneur (2005)",
   "quote": "Immigration was a risk very much like starting a new business.",
   "quoteNote": "",
   "ask": "Cheater, or founder? What do you think?"
  },
  "zh": {
   "title": "愛冒險的人，比較會偷吃嗎？",
   "term": "敢冒險的創辦人",
   "desc": "一份小型基因研究說會；一份 52 國的大調查說，出軌跟不可靠有關，跟愛嘗鮮無關。",
   "body": [
    "你愛上他，是因為他敢辭掉穩定的工作去創業。然後朋友跟你說：這麼敢賭的人，會偷吃。",
    "2010 年一份 181 位年輕人的研究：帶某種多巴胺基因變異的人，自陳出軌多<mark>五成以上</mark>。這是自陳資料，樣本也很小。",
    "後來更大規模的統合研究發現，這個變異跟愛新鮮沒有穩定關聯，2002 到 2008 年三份統合分析都沒撐住。而一份橫跨 52 國、16,362 人的調查顯示：出軌跟<mark>比較不可靠、比較不隨和</mark>有關，跟愛嘗鮮無關。",
    "愛冒險不是警訊。心理學家 John Gartner 在《The Hypomanic Edge》（2005）裡主張，這正是美國創業者這麼多的原因：美國是移民國家，敢離家重來的人，本來就是自己篩選出來的冒險者。",
    "Gartner 自己說這是推論，當年也有學者批評證據不足。把它當成一個主張來看，不是研究結論。"
   ],
   "quoteBy": "John Gartner，2005 年 Entrepreneur 專訪",
   "quote": "移民就像創業一樣，是一場冒險。",
   "quoteNote": "",
   "ask": "會偷吃的人，還是創業者？你怎麼想？",
   "quoteOrig": "Immigration was a risk very much like starting a new business."
  },
  "sources": [
   {
    "label": "Garcia et al., Associations between Dopamine D4 Receptor Gene Variation with Both Infidelity and Sexual Promiscuity, PLoS ONE 2010;5(11):e14162",
    "levelZh": "一手",
    "levelEn": "Primary",
    "url": "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0014162"
   },
   {
    "label": "Kluger, Siegfried and Ebstein, meta-analysis of DRD4 and novelty seeking, Molecular Psychiatry 2002",
    "levelZh": "一手",
    "levelEn": "Primary",
    "url": "https://pubmed.ncbi.nlm.nih.gov/12192615/"
   },
   {
    "label": "Schinka, Letsch and Crawford, DRD4 and novelty seeking meta-analysis, American Journal of Medical Genetics 2002",
    "levelZh": "一手",
    "levelEn": "Primary",
    "url": "https://pubmed.ncbi.nlm.nih.gov/12210280/"
   },
   {
    "label": "Munafo et al., Dopamine D4 receptor gene and approach-related traits, Biological Psychiatry 2008",
    "levelZh": "一手",
    "levelEn": "Primary",
    "url": "https://pubmed.ncbi.nlm.nih.gov/17574217/"
   },
   {
    "label": "Schmitt, The Big Five related to risky sexual behaviour across 10 world regions, European Journal of Personality 2004 (16,362 people, 52 nations)",
    "levelZh": "一手",
    "levelEn": "Primary",
    "url": "https://doi.org/10.1002/per.520"
   },
   {
    "label": "John Gartner, America's Manic Entrepreneurs, AEI, 2005-07-01 (adapted from The Hypomanic Edge)",
    "levelZh": "一手",
    "levelEn": "Primary",
    "url": "https://www.aei.org/articles/americas-manic-entrepreneurs/"
   },
   {
    "label": "Sara Wilson, National Treasure (Q&A with John Gartner), Entrepreneur, 2005-10-01",
    "levelZh": "一手",
    "levelEn": "Primary",
    "url": "https://www.entrepreneur.com/article/79824"
   },
   {
    "label": "Annie Murphy Paul, The Hypomanic American, Boston Globe, 2005-02-27 (Gartner on inference; Jon McClellan's criticism)",
    "levelZh": "多家轉述",
    "levelEn": "Multiple secondary reports",
    "url": null
   }
  ]
 }
]
