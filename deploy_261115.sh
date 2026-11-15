#!/usr/bin/env bash
# Trinity 收件口修復（2026-11-15）：部署收件 Worker ＋ 前端，然後驗三件事。
# 用法：bash /Users/admin/trinity-app/deploy_261115.sh
# 需要：這台機器的 wrangler 登入（new.vincent21@gmail.com 的帳號）、~/.config/secure/vs-site.env 裡的 RESEND_API_KEY
#      （就是個人網站 vincent.easeai.com.tw 在用、只能寄信的那把；寄件網域 vs.easeai.com.tw 已驗證）。
set -euo pipefail
cd /Users/admin/trinity-app

ENV_FILE="$HOME/.config/secure/vs-site.env"
KEY=$(grep '^RESEND_API_KEY=' "$ENV_FILE" | cut -d= -f2- | tr -d '"' | tr -d "'")
[ -n "$KEY" ] || { echo "找不到 RESEND_API_KEY（$ENV_FILE）"; exit 1; }

# 看名單用的 token：第一次產生就存地端（600），之後每次都用同一把
TOK_FILE="$HOME/.config/secure/trinity_intake_token"
if [ ! -s "$TOK_FILE" ]; then ( umask 077; openssl rand -hex 16 > "$TOK_FILE" ); fi
TOK=$(cat "$TOK_FILE")

echo "== 1/3 Worker trinity-check-intake（route trinity.easeai.com.tw/api/*，KV COUNTER）"
(
  cd worker
  npx wrangler@latest deploy
  printf '%s' "$KEY" | npx wrangler@latest secret put RESEND_API_KEY
  printf '%s' "$TOK" | npx wrangler@latest secret put INTAKE_TOKEN
)

echo "== 2/3 前端 Pages（trinity → trinity.easeai.com.tw）"
DEPLOY_TARGET=cf npx vite build
npx wrangler@latest pages deploy dist --project-name=trinity --commit-dirty=true

echo "== 3/3 驗證（自動的部分）"
sleep 6
printf 'health（要看到 {"ok":true,...,"mail":"resend"}）: '
curl -s --max-time 20 https://trinity.easeai.com.tw/api/health; echo
printf 'CSP 放行 Cloudflare Web Analytics（要 1）: '
curl -sI --max-time 20 https://trinity.easeai.com.tw/ | grep -ci 'static.cloudflareinsights.com' || true
printf '首頁還有 formsubmit（要 0）: '
curl -s --max-time 20 https://trinity.easeai.com.tw/ | grep -c formsubmit || true

cat <<EOF

接下來三件事你親手做：
1. 開 https://trinity.easeai.com.tw/analyze ，公司名寫「QA 測試 請忽略」，Email 填你自己的，送出；要看到「收到了，你的編號是 X-xxxxxx-xxxx」。
2. 兩封信：new.vincent21@gmail.com 收到「Trinity <編號>｜QA 測試 請忽略｜…」的通知；你填的信箱收到「收到你的案子 <編號>」的確認信。
3. 存起來的那一筆：
   curl "https://trinity.easeai.com.tw/api/intake/list?token=$TOK" | head -c 800
   （或 Cloudflare 後台 → Storage & Databases → KV → COUNTER → 找 in:<編號>）
EOF
