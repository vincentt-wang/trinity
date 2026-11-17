# Trinity Check intake Worker（2026-11-15 版）

trinity.easeai.com.tw 上每一個表單都送到這支 Worker：`POST /api/intake`。
它做四件事，照順序：存進 KV（先存，再寄）、寄確認信給填表人、寄通知給 Vincent、把兩封信的狀態寫回那一筆。

| 表單 | kind | answers.plan | 編號開頭 |
|---|---|---|---|
| /analyze 免費初步判讀 | analyze | free | A- |
| /analyze 完整報告 US$100 | analyze | report | R- |
| /analyze 報告＋Meet US$200 | analyze | report-meet | M- |
| /deck 原則卡等候名單 | waitlist | （只有 email） | W- |
| 頁尾「教材購買」等候名單（261117） | course | （name、email、topics、note） | C- |

## 部署（一行）
```
bash /Users/admin/trinity-app/deploy_261115.sh
```
腳本做的事：`wrangler deploy` → `secret put RESEND_API_KEY`（讀 ~/.config/secure/vs-site.env）→ `secret put INTAKE_TOKEN`（存 ~/.config/secure/trinity_intake_token）→ 前端 build 與 `pages deploy` → 打 /api/health。

## 設定在哪
- `wrangler.toml`：KV `STORE` 綁 COUNTER（3a7a86a7…，跟 trinity-counter 同一個，等候名單 `wl:<email>` 還是同一份）；vars `NOTIFY_TO`、`PUBLIC_EMAIL`、`MAIL_FROM`；route `trinity.easeai.com.tw/api/*`。
- 寄件人 `Trinity Check <trinity@vs.easeai.com.tw>`：vs.easeai.com.tw 是 Resend 已驗證的網域，`easeai.com.tw` 沒驗證（2026-11-15 實測 403）。要換成 easeai.com.tw 得先在 Resend 加網域並改 DNS。
- R2：這個帳號還沒開（API 回 10042）。開了之後 `npx wrangler r2 bucket create trinity-submissions`，把 wrangler.toml 裡三行 `r2_buckets` 取消註解再 deploy，Worker 會自動多寫一份到 `intake/<kind>/<id>.json`。

## 看收到的東西
```
curl "https://trinity.easeai.com.tw/api/intake/list?token=$(cat ~/.config/secure/trinity_intake_token)"
```
或 Cloudflare 後台 → Storage & Databases → KV → COUNTER → key `in:<編號>`。

## 本機測
```
cd worker && npx wrangler dev --port 8787        # 讀 .dev.vars：MAIL_SINK_URL 指到本機 sink，信不會真寄
cd .. && npx vite                                  # /api 會 proxy 到 8787
```
`.dev.vars` 不進 git。沒有 `RESEND_API_KEY` 也沒有 `MAIL_SINK_URL` 時，Worker 照存、信的狀態記 `skipped_nokey`。

## 前端對口
`src/intake.ts` 是唯一的客戶端；失敗會丟 `IntakeError`，頁面顯示「沒送出」並保留填的內容，附 mailto 備援到 `PUBLIC_EMAIL`。
