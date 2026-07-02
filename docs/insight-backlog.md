# Insight 素材待辦庫（Trinity Insight Backlog）

從舊版 Trinity Analyzer（即將退役）的 research 筆記中，收割仍有價值的內容，供新版 Trinity 網站的 Insight 頁與 deal-lens 引擎後續取用。此檔只做內容萃取，不含舊 build 的流程雜訊（動畫時序、GSAP 參數、DOM 結構、CSS token 等一律略去）。

來源檔（唯讀，未修改）：
- research/spec-math-models.md
- research/spec-investor-fit.md
- research/investor-landscape.md
- research/business-model-research.md
- research/corpus-notes.md

彙整日期：2026-07-02。

---

## 最該優先取用的高價值項目（Highest-value items to reuse first）

1. 四大量化模型的真實公式（Fermi TAM、Monte Carlo lognormal+loss、敏感度 tornado、Bear/Base/Bull 情境）：可直接寫成 Insight 文章，也是 deal-lens 引擎的核心算法。（見一）
2. D/F/V 三透鏡完整評分 rubric（D19／F16／V18 維度、權重三層、knockout 條件、綜合裁決矩陣）：deal-lens 引擎的判準骨幹，也是最有深度的 Insight 系列題材。（見五）
3. 創業階段分類法（用「證據」而非「年資」定義，含營收／輪次／估值／稀釋帶）＋ 12 類投資人 × 階段熱力圖：可直接變成一篇「你在哪一階段、該找誰」的高流量 Insight，也是引擎「投資人適配層」的輸出契約。（見二、三、五）
4. 美國＋台灣真實機構名錄（含類型、階段、官網、聯絡路徑、open/warm 接觸模式，2026-06-28 查證）：網站可用的實料，需定期重新查證（尤其台灣資料）。（見三）
5. 「本質先行」再校正原則（先看 founder × market fit 與市場拉力，DD／量化是下游確認而非搶分；信心點而非假精準單點；ρ≈0.1）：新版產品定位與 Insight 敘事的定調。（見五）
6. 責任框架與法律紅線（禁收成交型引薦費＝未註冊 broker-dealer；不承諾募到資；隱私與訓練資料承諾）：任何對外文案與 terms 必守。（見四）

---

## 一、spec-math-models.md — 四大量化模型（真實公式）

價值最高的是四個模型的算法本體，這些是「不是包一層提示詞，是一台量化引擎」的證據。

### Fermi TAM 由下而上拆解
公式：
```
N   = 10 ^ fam                 // 家戶數，fam 為 log10
TAM = N × (pen/100) × arpu × freq   // NT$/年，bottom-up
```
示範輸入：fam=5（N=100,000）、pen=5%、arpu=12,000、freq=1 → TAM = NT$60,000,000（6,000 萬）。
交叉查核原則：Top-Down 與 Bottom-Up 若相差超過 3 倍，代表某個假設壞掉。
格式化函式：n≥1e8 顯示「億」、n≥1e4 顯示「萬」。

### Monte Carlo 報酬分佈
真實引擎用的是 loss probability + lognormal body（非三角分佈），上限 cap 在 300x：
```
loss=0.62, med=3, sigma=0.62, mu=ln(med)
每次抽樣：若 random < loss → random×0.8（歸零群 <0.8x）
          否則 → min(exp(mu + sigma×gauss()), 300)   // 存活者 lognormal
```
百分位用 nearest-rank：P10 / P50 / P90，並算 P(≥10x)。
判準：P(≥10x) < 20% 黃燈、< 10% 紅燈。
核心洞見句：看分佈勝過看單點，下檔（P10）才是誠實的數字。
（另有三角分佈 triangular(a,c,b) 版本，供較簡單的 what-if 模式，非預設。）

### 敏感度 Tornado
公式：裁決均分 avg = (D% + F% + V%)/3。對每個透鏡 L，把 L 內所有訊號 +2 重算 avg（hi）、-2 重算（lo），span = |hi - lo|。span 由大到小排序，最長的那條就是裁決最敏感（命門）的透鏡。取 top 3-5 = 最高風險假設，各給一個檢查點。

### 情境 Bear / Base / Bull
公式：把每個訊號分數乘 0.8 / 1.0 / 1.15，四捨五入、clamp 到 [0,10]，重算裁決與均分。裁決分箱由 D 當硬門（D× → PASS；D△ → CONDITIONAL；否則 F● 且 V● → GO，其餘 CONDITIONAL）。
示範輸出：Bear ×0.8 → CONDITIONAL avg 54；Base ×1.0 → GO avg 71；Bull ×1.15 → GO avg 82。

一句話用途：四個模型可各寫成一篇「引擎內部」Insight 文章（費米／蒙地卡羅／敏感度／情境），公式同時直接餵 deal-lens 引擎的量化層。

---

## 二、spec-investor-fit.md — 階段定位、投資人類型權重、接觸與退出

### 階段帶（band metrics，可直接做成表）
| 階段 | 證明什麼 | 營收 | 輪次規模(US) | 估值(post,US) | 稀釋 | Trinity 重心 |
|---|---|---|---|---|---|---|
| Pre-Seed | 團隊＋洞見＋第一個訊號 | $0-100K ARR | $250K-1.5M | $3M-12M | 10-20% | F(團隊)＋D(洞見) |
| Seed | 可重複的早期 PMF | $100K-1M（中位 ~$500K） | $2.5M-3.2M | $14M-17M | 12-15% | D(PMF) 上升，V 浮現 |
| Series A | 成形的成長引擎 | $1M-3M+，150-200% YoY，NRR>110% | $10M-15M | $50M-75M | 18-22% | V(單位經濟、可擴張) |
| Growth(B+) | 規模與市場領導 | $5M-10M+，有效率成長 | $20M+ | $100M+ | 15-20% | V 主導(效率、護城河) |

### 投資人類型 D/F/V 權重（依階段）
- Pre-Seed：加速器・微型創投・天使・創投工作室；支票 $50K-1.5M；多為公開申請；權重 D35/F45/V20（可行性主導，人就是資產）。
- Seed：機構種子基金・加速器・做種子的多階段；$500K-3M；偏好溫暖引薦；權重 D45/F25/V30（欲求性主導，買可重複 PMF）。
- Series A：多階段／成長創投・CVC；$10M-15M；需溫暖引薦；權重 D25/F25/V50（存續性主導：單位經濟、NRR、可擴張）。
- Growth：成長型股權・多階段・家族辦公室；$20M+；引薦／投行；權重 D20/F20/V60（規模階段資本效率被定價而非被原諒）。

規則：越早期越看 F(團隊)＋D(洞見)，越後期越看 V(經濟)。

### 接觸方式與退出敘事（依階段）
- Pre-Seed：直接申請加速器與微型創投，冷投可行；用團隊與洞見開場；並行跑非稀釋補助（不重置階段）。退出：太早優化退出，先顧乾淨股權表與 12-18 個月的可信種子輪。
- Seed：找投資組合創辦人或 operator 引薦勝過群發；公開申請加速器當平行冷投路徑；展示可重複的拉力而非單一推手。退出：把退出當選擇權，M&A 是多數公司主路，列可對標收購方。
- Series A：引薦來自種子投資人；帶撐得過盡調的指標（ARR、NRR>110%、有效率成長）；B2B 提案前先盤點五個決策者。退出：承保創投級結果，Burn Multiple>3 會被複核。
- Growth：透過投行與既有投資人；故事是效率與市場領導而非願景。退出：IPO 或策略 M&A，依現金跑道與利率環境模擬退出窗口。

一句話用途：可做成一篇互動式「你在哪一階段、該找哪類投資人、怎麼接觸」的網站 Insight／工具頁；權重數字與接觸規則也是引擎投資人適配層的參數。

---

## 三、investor-landscape.md — 真實機構名錄與媒合訊號

### 階段分類器快速訊號（引擎用）
- 無營收、無產品 → Pre-Seed，看團隊(F)＋市場洞見(D)。
- 有產品、少量付費、ARR < $1M 且成長中 → Seed。
- ARR ~$1M+、強 YoY 成長＋留存 → Series A。
- 政府／非稀釋補助可與任一階段並行，不重置階段。
- 台灣輪次金額通常比美國小 30-60%。

### 投資人類型分類（支票、階段、看重透鏡、接觸）
天使 $5K-250K(F)／天使會或 syndicate $100K-1M(F+D)／加速器 $50K-500K+program(F+D)／微型創投 $250K-1.5M(F+早期 D)／機構種子 $500K-3M(D+V)／多階段成長創投 $3M-50M+(V)／CVC $500K-20M(V+策略)／政府補助 非稀釋 $50K-2M(F 技術 R&D)／家族辦公室 $250K-10M+(視 mandate)／創投工作室 免費 residency→投資(F 人才)。

### 真實機構名錄（2026-06-28 查證，URL 當時 live）
美國（參考市場，最完整）：Y Combinator（加速器，$125K+$375K SAFE，公開申請 ycombinator.com/apply）、Techstars（$20K+$200K SAFE，公開）、500 Global、Antler、South Park Commons、Precursor Ventures（微型創投，warm）、Hustle Fund（公開 pitch form）、Pear VC、Uncork Capital、First Round Capital、SV Angel、Long Journey Ventures、Spark Capital、Founders Fund、a16z、Greylock、Sequoia（Arc program）、GV、Tech Coast Angels、Golden Seeds（女性主導）、NSF SBIR/STTR（政府非稀釋，$50K-1.8M，Project Pitch 全年）、SBIR.gov、Seedcamp。

台灣（本地層）：AppWorks（加速器＋創投，$212M AUM，AI/Web3/東南亞，公開申請）、SparkLabs Taiwan（AI-first，每年兩梯）、Anchor Taiwan、TAcc+、Cherubic Ventures（美＋大中華）、Hive Ventures 蜂行資本（數據與 AI 種子）、Taiwania Capital 台杉（最活躍，深科技／健康）、CDIB Capital 中華開發（最大，~30% 市佔）、Darwin Venture、Taiwan Tech Arena TTA（國科會政府基地，info@taiwanarena.tech）、Taiwan Startup Terrace、Garage+（Epoch Foundation，硬體）、StarFab、BE Accelerator、NDF Business Angel Program（國發會共同投資 NT$2B，<3 年、≤NT$80M）、SBIR Taiwan（Phase I ≤NT$1.5M、II ≤NT$12M）、Startup Portal Taiwan（SMEA）、NTPC-AWS Joint Innovation Center。

排除：indie.vc（已歇業）。Founders Fund 用長網域 foundersfund.com（ff.co 擋 bot）。

### 五軸媒合邏輯（引擎輸出 top 3-5）
1. 階段硬過濾（先做）：丟掉階段帶不含創辦人階段的機構。
2. 地理：美國創辦人用美國名錄、台灣用台灣；跨境浮現橋樑型（Cherubic、AppWorks、Anchor、500、Antler、Taiwania）。政府補助地理綁定（NSF/SBIR 須美國實體；台灣 SBIR/NDF/TTA 須台灣註冊）。
3. 產業：AI/深科技/SaaS → a16z/Greylock/Sequoia/GV；AppWorks/SparkLabs/Hive/Taiwania。硬體/IoT → Taiwania/Garage+/TAcc+/TTA、SBIR。消費/marketplace → Founders Fund/First Round/500；AppWorks。女性/弱勢 → Golden Seeds/Precursor/Hustle。Web3 → AppWorks/a16z。
4. 牽引力 → Trinity 權重（關鍵判別）：把創辦人最強透鏡對到投資人最看重透鏡。強 D 但團隊薄 → 領投 PMF 的種子基金；強 F 但無產品 → 團隊優先下注；強 V 有 ARR → 成長／多階段；三者皆弱但 R&D 重 → 先拿非稀釋補助去風險。
5. 接觸路徑：公開申請（冷投友善）vs 溫暖引薦偏好（該建議找投資組合創辦人／operator 引薦，勿群發信箱）。

輸出契約：每個媒合機構輸出「名稱・類型・一句為何適合（綁階段＋最強透鏡）・官網・聯絡路徑・接觸模式（open/warm）」。

一句話用途：直接是網站可用的機構名錄實料與引擎媒合層規則；名錄須定期重查（台灣最需人工維護）。

---

## 四、business-model-research.md — 商業模式、定價、風險與法律紅線

### 競品定價地景（2025-26，可引用）
- Inodash（每次分析 $2.49，最乾淨的 pay-per-use 底價）。
- IdeaProof（credit bundle 標竿：validation=40cr、market analysis=100cr、business plan=100cr；90 免費 credits，Starter €19.99/150cr、Builder €49.99/700cr、Founder €99.99/1500cr）。
- Evalyze（Pro $7.5/月年繳，創辦人 ARPU 很低）、SaaStr.ai（免費 fundability score，lead-gen）、StartupShortcut（$59/月，Perplexity 引用報告）、ThinkUp（$29/月起）、Gamma/Alai/PlusAI（免費層＋signup credits）、Visible.vc（永久免費 Starter，freemium 護城河）、DocSend（$15/月無免費層）、Dealroom（€12.5k-17k/年，企業級錨點）。

### 可複用的定價原則
1. 每次分析底價很便宜（$2.49），單一分析撐不起生意，價值在報告深度＋投資人名錄＋外聯暖身。
2. Credit bundle 勝過純單價（可折量、上賣重動作、避免 bill-shock）。
3. 免費 teaser 是標配，但要保留載重資產（完整機構名錄＋聯絡＋email 匯出）在付費牆後。
4. 創辦人 ARPU 低、交易型；真正利潤在 B2B（加速器／創投）與深度升級。
5. 61% SaaS 已採混合制（訂閱＋用量）。

### 計量計費（usage-based）三積木與精實實作
Metering（事件層記錄，一次分析一列，含類型/tokens/時間/用戶）→ Rating（事件轉 credits，light=1、full report=4、deep=8）→ Invoicing（餘額、扣款、加值、收據）。
Bill-shock 是產品問題：即時餘額、門檻警示、硬上限、動作前「這會花 N credits，確認」。
精實 Cloudflare 原生 meter：email magic-link 身分；D1/KV append-only ledger（user_id, event_id, action_type, credits_charged, balance_after, ts, deck_ref）；pricing map 放 config；Worker 預檢餘額；Stripe 收款＋收據；HITL gate 用 status: queued|delivered，delivered 才 commit credits、失敗自動退；submit 用 idempotency key 防雙扣。

### Trinity Analyzer 建議定價（創辦人側，1 credit ≈ US$1）
- Tier 0 免費 teaser：D/F/V 分數＋一句本質裁決＋階段判讀；名錄／聯絡／深度推導／風險登記／匯出留在牆後；每 email 限一次。
- Tier 1 credit packs：Single $19/20cr、Founder 5-pack $69/80cr、Raise-Ready $149/200cr。動作：完整報告 15cr、深度報告 +10cr、改版重跑 8cr（折扣獎勵迭代）、email/PDF 免費。
- Tier 2 訂閱 $29/月：250cr/月、deck 歷史、版本 diff、投資人追蹤、優先 HITL；設計成 3 個月募資週期後優雅降級。
- 與 EaseLens AOR（NT$9,900-14,900/月，賣給創投）不互相蠶食：同引擎、兩扇門、兩條付費意願曲線。創辦人側＝高量低 ARPU、PLG 自助；投資人側＝低量高 ARPU、HITL 邀請制。

### 每次分析以外的營收
Premium/Raise-Ready 報告（每機構客製外聯角度，最高毛利升級）／B2B 加速器孵化器授權（真正利潤池，seat 或年費，台灣大學創業處與政府是天然早期段）／白標 co-brand 給創投與天使會／匿名 opt-in 聚合數據產品（benchmark，餵 SEO 內容飛輪，絕不賣或訓練可識別 deck）／內容導向工具聯盟（data room、cap-table 揭露式推薦，非引薦費）／工作坊課程 pull-through（報告＋30 分 teardown 高價包）。

### 三階段 roadmap
Phase 1 MVP（0-3 月）：沿用 deal-lens skill／D/F/V→S，只出中立層；fork apply.html 意圖表單；HITL 交付；免費 teaser＋credit packs（Stripe payment links＋KV/D1 ledger）；人工維護美＋小台名錄；目標 3-5 免費 pilot → 首批付費、驗證 $19 願付。
Phase 2 成長（3-9 月）：前段轉即時 AI API，premium 保 HITL；階段分類器與投資人類型媒合成一級模組；上 $29 訂閱、餘額／花費上限／確認扣款；saved history、版本 diff、投資人追蹤；開始匿名 benchmark；首個加速器／大學 pilot。
Phase 3 平台（9-18+ 月）：codify 完整 Trinity Deal Flow（多代理獨立 D/F/V、fact-check、中立綜合、E-config 留投資人側）；三側（創辦人 PLG／EaseLens AOR／加速器 cohort）同引擎；數據產品成獨立 benchmark 線；深化台灣資料至與美國並駕。

### 風險與責任框架（對外必守）
1. 投資人聯絡資訊只用機構自己公開的（官網、公開 submit 表單、合夥人頁 email），提供移除路徑，框成「這家基金公開如何邀約」而非「私人後門」。
2. 法律紅線：美國證券法下，成交型（transaction-based）連接創投與投資人的報酬＝未註冊 broker-dealer 行為，SEC 從未採納正式 finder 豁免（2020 提案未通過），後果含 SEC 執法、刑責、費用協議不可執行、投資人 rescission 追回資金。故絕不收成交／closing-based 引薦費（亮線）；若真要引薦收入，結構成「引薦本身的固定費、與是否 close 無關」並先問證券律師；文案只說「evaluate 與 prepare 並指向投資人公開受理處」，不說「get you funded／introduce／match-make」，只說「evaluated/optimized by the tool」不說「endorsed by [fund]」。
3. 不承諾募到資：報告是分析意見，非投資建議、非募資保證、非投資人興趣保證。
4. 隱私／訓練資料信任：deck 不用於訓練模型、實體隔離、僅 opt-in 保留匿名 metadata；違反即毀品牌。
5. 準確與負責任裁決：premium／邊界案保 HITL，附推理與信心點，把裁決框成「這是要補的缺口」而非最終判決。
6. Bill-shock 與緊張用戶流失：花費上限、確認扣款、失敗免費、可見餘額，MVP 就要有。
7. 機構資料過時（尤其台灣）：人工維護、標時間戳、定期刷新。
8. 與 EaseLens／EvoScale 的通路衝突：Trinity Analyzer 須保持中立創辦人工具，不能像把創辦人導入 EvoScale 自己案子的漏斗（COI）；保中立報告層／E-config 牆，任何 EvoScale 關係保持臂距並揭露。

一句話用途：新版產品的定價、GTM roadmap 與 terms／對外文案骨架；風險段落是任何 Insight 或 CTA 文案的合規護欄。

---

## 五、corpus-notes.md — Innovation Trinity 引擎本體（最深的一份）

### 三層架構（D/F/V → S → E）
- Review 層（D/F/V）：三個獨立的頂級創投評審，用通用 VC 標準判斷，彼此不見（anti-anchoring），不知任何基金偏好。
- Synthesis 層（S）：中立整合者，合三個獨立意見成一個客觀投資判斷＋3 頁報告本體，仍不代表任何機構。這是創辦人產品該曝光的層。
- Config 層（E）：機構專屬（可插拔 Fund Profile），只有 E 帶機構偏見，keep OUT of 創辦人產品。切分的意義：D/F/V/S 是可白標、客觀、可複用資產。

### 執行引擎（7 步強制順序，不可先下結論）
1. 事實抽取分三欄：已知（附來源）／缺口／待查，缺口不幻覺。
2. 逐維度 1-10 評分，每分須引用 deck 文字／數據為證；證據「未提供」的維度 cap 在 3（逼補件、擋幻覺高分）。
3. Knockout 先做：任何致命門檻 → 該透鏡直接 ×，不再加總。
4. 加權聚合：權重依階段不同（core ×3），透鏡仍隔離。
4b. 交叉推導：獨立分數後，強制在六個方向各跑一次（D→F、D→V、F→D、F→V、V→D、V→F），每次 ≤1 次、幅度 ≤±1 notch，產出交叉連動表。
5. 客觀裁決：三透鏡狀態 → S 裁決矩陣。
6. 矛盾＋量化交叉查核：質性 vs 量化（Fermi/Monte Carlo/敏感度），衝突標紅、修分。
7. 信心標記：每個關鍵結論 high/med/low ＋整體資料完整度%；完整度 <50% 把裁決 cap 在 conditional。

透鏡分數公式：`lens score = Σ(dim × weight) ÷ Σ(10 × weight)`。映射：≥75% 且無 knockout = ●（pass）；50-74% = △（待驗證）；<50% 或任一 knockout = ×（不適合）。權重三層：core ×3、important ×2、reference ×1，每季對真實 closing 重新校準。

1/10 錨點：痛點強度 1=維他命／10=止痛藥級（急迫、無替代、預算已存在）；FMF 1=不相關／10=罕見不公平優勢（領域＋人脈＋戰績）；付費驗證 1=零／10=陌生人重複付費／可規模化預購；單位經濟 1=LTV/CAC<1／10=≥3 且回本 ≤12 月。

### D 欲求性 rubric（19 維）
Core ×3：D1 止痛藥 vs 維他命、D2 Tar Pit test、D5 完美市場 4 特徵（痛/購買力/可觸及/動能）、D8 量化痛點成本（Fermi）、D18 FMF。Important ×2：D3 可創投化、D6 痛點六測、D7 top-down vs bottom-up、D9 Persona→ICP→HXC、D10 B2B 決策者矩陣、D11 JTBD 三層、D16 北極星 2×2＋保齡球、D19 地理與政策。Reference ×1：D4 三大永恆市場（健康/財富/關係）、D12 五層洞見、D13 TPO 場景、D14 感知價值 3D、D15 Octalysis 8、D17 黃金交集。
D Knockouts：D2≤2（確認 Tar Pit）／D1≤2 且 D6≤2（零真實痛點）／D5 可觸及 ≤2（CAC→∞）。

### F 可行性 rubric（16 維）
Core ×3：F1 階段定位、F3 付費意願驗證、F6 技術第一性原理健全、F12 執行 FMF。Important ×2：F2 三閘（PSF→PMF→Scaling）、F4 PMF 三訊號（行動/評價/MoM>20%）、F5 四種 MVP＋Solid Data、F7 BMC 九格閉合、F8 模式選擇＋各邊需求%、F10 五種護城河、F11 團隊三特質（自驅/低 ego/頂尖）、F13 技術毛利、F14 跑道與死亡谷、F16 可 demo 性。Reference ×1：F9 生態角色、F15 最高風險假設（48hr 可測）。
F Knockouts：F6≤2（技術被第一性原理推翻）／F5≤2 且 F6≤3（做不出 MVP）／F11≤2 且 F12≤2（無執行力）／IP 未正式歸屬公司（knockout）。

### V 存續性 rubric（18 維）
Core ×3：V1 市場 TAM/SAM/SOM＋動能 D×P×Q×F÷T、V2 PMF 三支柱（organic/留存>40%/NPS>50）、V3 六個關鍵數字（CAC/LTV/毛利/回本/留存/成長）、V4 單位經濟（LTV/CAC≥3、回本≤12月、churn≤5%）。Important ×2：V5 Rule of 40、V6 Burn Multiple（<1 佳／>2 紅旗）、V7 階段對輪次門檻、V8 CFA、V11 損益兩平、V12 多重估值交叉、V18 估值合理性對 comps。Reference ×1：V9 Hormozi 價值方程、V10 定價、V13 退出路徑、V14 清算優先、V15 VC 10× 觀、V16 D2C 陷阱／B2B 毛利、V17 Pitch 10 元素完整度。
V Knockouts：V4≤2 無 pivot（結構性負單位經濟）／V11 損益兩平量 > SOM／V6 Burn Multiple >3 且跑道 <6 月。

### 綜合裁決矩陣（D 是門，D× = 否決）
- D●F●V● → Strong case（客觀值得投）。
- D●F●V△／D●F△V● → Conditional（把 △ 透鏡最高風險假設設成有日期的檢查點）。
- D●F●V× → 財務不可行（需續命資本或重建模式）。
- D●F×V● → 技術受阻（需技術共同創辦人／深科技資源）。
- D△ → Keep Going（設回訪日，等 PMF 訊號：陌生人付費／MoM>20%）。
- D× → 否決（無需求，再好的 F/V 也救不了）。

交叉推導命題：D 強×F 弱＝對的需求、錯的時機；F 強×V 弱＝做得出、活不下去；V 強×D 弱＝好試算表、nice-to-have 需求（D 門否決）。

### 量化方法（真實算法）
Fermi TAM（拆解公式＋三點估計＋top-down/bottom-up 交叉，>3× 分歧＝壞假設）。Monte Carlo（三角分佈、10k runs、P10/P50/P90＋P(10×)；<20% 黃、<10% 紅）。敏感度 tornado（±1 notch、排序、取 top 3-5 最高風險假設、各給檢查點）。估值方法依 階段×產業 路由：早期 SaaS/消費＝Comps＋情境/Monte Carlo＋VC 回報觀；生技加 rNPV；成長/PE 加 DCF。早期用 DCF 是反訊號。估值帶由三線收斂（Comps 骨架 → 本案調整 → V15 天花板），帶寬本身是訊號（>3× spread＝資料薄、低信心）。

### 「本質先行」再校正（2026-06，對產品定位最重要）
系統第一價值是快速呈現本質（founder × market fit、deck 說了什麼、幾個關鍵指標）供人判斷，而非做盡職調查。DD/fact-check/量化是下游確認與 kill-switch，依階段 gate，不與評分搶。F（founder）＋FMF 是領先門（團隊解釋 96% 成功，Gompers NBER 22587）。先跑「一頁快速否決」（founder＋FMF＋市場拉力/Why-Now）。輸出信心點（high/med/low）而非假精準單點（篩選分與結果的 ρ≈0.1）。加市場耐久度（horse）軸與 outlier/上檔天花板軸（冪律：~6% deals ≈ 60% 回報）。

### 階段引擎 K（同透鏡、不同階段看不同東西，MECE）
| 階段 | Core ×3 焦點 | 致命缺口 | 別要求 |
|---|---|---|---|
| Pre-Seed/Prototype | founder+FMF、真痛、PSF、洞見深度 | 假需求、無 FMF | 牽引力、獲利 |
| Seed/MVP | MVP 完整、早期付費驗證、ICP 收斂、早期留存 | 零真實付費、做不出 MVP | 規模、Rule of 40 |
| Series A/PMF | PMF 三訊號、留存曲線、可重複獲客、單位經濟萌芽、成長 | 無 PMF 訊號、留存崩 | 全面獲利 |
| Series B+/Scaling | 六個數字、NRR、CAC 回本、成長效率、Burn Multiple | 結構性負單位經濟 | — |
| Late/Pre-IPO/PE | Rule of 40、獲利路徑、現金流、規模護城河 | 無獲利路徑、到不了下個里程碑 | — |

2026 真實 VC 門檻：Seed ARR $300-500K、MoM 15-20%；Series A ARR $1-3M、毛利 >70%、Burn Multiple <1.5(頂)/>2 紅旗、跑道 18-24 月。

### 中立報告＝三層（正是創辦人產品該產出的輸出）
1. 本質結論：一句 XYZ（for [誰] do [什麼] to achieve [什麼]）＋裁決 chip＋信心點＋FMF hero（founder＋一個非顯而易見的致勝理由）＋PMF 原型（Sequoia Arc：Hair-on-Fire/Hard Fact/Future Vision）＋3-5 個以 delta 呈現的生命徵象指標（成長率/NRR/CAC 回本/burn-runway）＋top-3 風險＋QR＋免責。
2. 深度推導：D⇄F⇄V 交叉連動表（骨幹）＋fact-check 三態（verified/to-verify/self-claimed）＋量化重算＋第一性原理＋buying-committee × approved-vendor。
3. 投資人適配：12 類型 × 階段熱力圖（●/△/✕＋理由）＋退出/獲利方式標示，只到類別層、不點名具體基金（那是 E 層）。

免責語：基於公開資訊＋AI 結構化分析，未經獨立財務查核，是初步篩選工具、非投資建議。中立報告可外送申請人，故用「建議澄清／與公開資料有出入／建議補件佐證」，不用「毒舌／一查就破」攻擊語。

完整度 gate（省 token）：缺 0-3 項＝完整審查；4-6＝初步低信心；7+＝只做門檻判斷（Tar Pit＋止痛藥/維他命＋是否值得續）並 STOP。

任一報告（即使一頁）必出現三樣：第一性原理結論＋最高槓桿（top 3-5）＋最高風險假設（top 3-5）。

### 12 類投資人 × 階段熱力圖（取代舊 A/B/C 三分法）
12 類：個人天使／天使會／Syndicate／VC 早期／VC 中期／VC 後期／PE／CVC／家族辦公室／政府／加速器／孵化器／創投債／群募。每格 適合●/部分△/不適合✕＋一句理由，交叉階段引擎 K。並輸出退出/獲利方式主路標示：M&A/IPO/二級/分紅/策略併購/授權。M&A 是現實主路（~85% VC 退出），其次 acquihire、二級、IPO。

### 產品化與 HITL（承 EaseLens）
前端全自動體感、後端人親自把關：AI 把 30 頁 deck 跑成草稿，前創投評案官補跨產業判斷與信心點。4 步：intake → AI 首過 D/F/V 草稿 → 人審（Vincent 補判斷＋信心點）→ 一頁 A4 中立決策簡報 24h 內回信。中立層與 E-config 層為結構性隔離牆（同 deck 對所有人同結論；只抽判斷模式 metadata、不存商業機密；多機構須實體資料隔離，非口頭）。護城河：judgment-pattern metadata（跨 N 案迭代判斷邏輯，非記憶財務）＋domain know-how＋HITL＋生態暖線背書。

一句話用途：deal-lens 引擎的完整判準骨幹（rubric／knockout／裁決矩陣／量化／階段引擎），也是最深、最能連載的 Insight 系列題材（三透鏡、本質先行、12 類投資人、報告三層都各自可成篇）。

---

## 附註：更深資料的原始位置（本檔未搬運、需要時去挖）
- 引擎提示詞庫（588 行 v4.1，D19/F16/V18、階段引擎、12 投資人類型）：B2B/ai-dealflow-prompts.md
- deal-lens skill 執行手冊與 A4 模板：~/.claude/skills/deal-lens/（SKILL.md、a4-template-neutral.html、a4-template-fastbrowse.html、export-pdf.sh）
- A4 spec 與 runbook：B2B/a4_decision_brief_spec.html、B2B/dealflow-runbook.md
- 公開引擎說明頁：B2B/df-overview.html、df-desirability.html、df-feasibility.html、df-viability.html
- 意圖表單與 worker：B2B/apply.html、B2B/worker/、vincent-site/easelens/worker/
- EaseLens 產品類比與商業計畫：vincent-site/easelens/、vincent-site/vincent-self-audit/plan/business-plan.html
- 標竿比較案：B2B/Review/260614_阿基里斯/
