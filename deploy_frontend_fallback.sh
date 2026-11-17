#!/bin/bash
# 261116：trinity.easeai.com.tw/api/* 的 route 沒綁上（easeai.com.tw zone），
# 前端改直接打 Worker 自己的網址。Worker 已部署且正常（/api/health ok）。
set -e
cd /Users/admin/trinity-app
echo "== 1/2 前端用 Worker 網址重 build 並部署"
VITE_INTAKE_API=https://trinity-check-intake.comicbnb.workers.dev DEPLOY_TARGET=cf npx vite build
npx wrangler@latest pages deploy dist --project-name=trinity --commit-dirty=true
echo "== 2/2 自動驗證"
echo -n "Worker health: "; curl -s https://trinity-check-intake.comicbnb.workers.dev/api/health; echo
echo -n "dist 裡打 Worker 網址的檔案數（要 >=1）: "; grep -l "trinity-check-intake.comicbnb.workers.dev" dist/assets/*.js | wc -l
echo "接著到 https://trinity.easeai.com.tw/analyze 送一筆（公司名寫 QA 測試 請忽略，Email 填你自己的），兩個信箱各收一封就完成。"
