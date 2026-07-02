# Trinity 安全基線與上線檢查清單

更新：2026-07-02。全站健檢結論與正式網域上線前必做事項。

## 現況（已到位）

- npm audit 零漏洞（rolldown-vite + React 19）
- 無 XSS sink：全站零 dangerouslySetInnerHTML / innerHTML / eval，使用者輸入只經 React 轉義渲染
- 無 secrets：src 與 worker-counter 內無任何 key/token；KV namespace id 非機密
- 外連面僅三個：fonts.googleapis/gstatic、formsubmit.co、trinity-counter workers.dev
- CSP：build 時由 vite.config.ts 的 inject-csp plugin 注入 meta 標籤（dev 不注入，HMR 需要 inline/eval）
  - default-src 'self'；script-src 'self'；connect-src 只開 formsubmit + counter
  - 已用 vite preview 實測正式 bundle：零 securitypolicyviolation，字體、canvas、動畫全正常
- Referrer-Policy: strict-origin-when-cross-origin（meta，隨 CSP 一起注入）
- robots noindex,nofollow（上線前維持）
- localStorage 只存語言偏好與計數 fallback，無個資
- counter worker 已寫好防灌水（見下方「待部署」）

## 待辦（依優先序）

1. 部署硬化版 counter worker（代碼已完成在 worker-counter/index.js）：
   POST 限 Origin 白名單（403 其他來源）＋每 IP 每小時一次＋全域每日上限 25 次。
   部署：`cd ~/trinity-app/worker-counter && npx wrangler deploy`
   換網域時記得把新網域加進 ORIGINS 陣列再部署一次。
2. formsubmit 信箱明碼在 bundle（vincent@easeai.com.tw 可被爬蟲收割）：
   到 formsubmit.co 取得 random alias，把 src/Analyze.tsx 的 FORM_TO 換成 alias 字串。
   功能不變，信箱不再曝光。
3. 換正式網域時（建議 Cloudflare Pages，headers 全可控），加 `_headers`：
   ```
   /*
     Content-Security-Policy: <同 vite.config.ts 的 CSP> ; frame-ancestors 'none'
     X-Frame-Options: DENY
     X-Content-Type-Options: nosniff
     Referrer-Policy: strict-origin-when-cross-origin
     Permissions-Policy: camera=(), microphone=(), geolocation=()
     Strict-Transport-Security: max-age=31536000; includeSubDomains
   ```
   header 版 CSP 生效後可移除 meta 注入（header 優先且能表達 frame-ancestors，
   GitHub Pages 期間 meta 是唯一選項所以保留）。
4. 上線同時：移除 noindex、補 og:image 與 sitemap、CSP 的 connect-src/ORIGINS 換新網域。

## 健康（非安全）備忘

- bundle 550KB（gzip 181KB）超過 500KB 警告線：Analyze/Insight 可用 React.lazy 切分，
  首頁首載可再減；動手前注意 AnimatePresence view 切換過場不要閃白。
- 無 target=_blank 缺 noopener 的連結；copy.ts 零破折號、零 emoji。
