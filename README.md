# Trinity 部署

部署一律用 `npm run deploy:cf`，它會先跑 `scripts/check_story_meta.py`，集數文章有生產過程或自我保留的文字（沒畫、查無、推算、樣本、our reading、left out 等）就 exit 1 停下來。

手動部署時，`DEPLOY_TARGET=cf npx vite build` 不會觸發 npm 的 prebuild，要先自己跑：

```
python3 scripts/check_story_meta.py && DEPLOY_TARGET=cf npx vite build && npx wrangler pages deploy dist --project-name=trinity --branch=main
```

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

## 訂閱文章與新集數信（261118）
- 每集文章最下方（系列輪播之後）有訂閱框，`src/EpStory.tsx` 的 `Subscribe`。送出寫進 vincent.easeai.com.tw 的電子報名單（KV `nl:sub:<email>`，雙重確認，來源標 `trinity-epNN`），跟個人部落格共用同一份。CSP 的 connect-src 在 `public/_headers` 與 `vite.config.ts` 兩處都加了 `https://vincent.easeai.com.tw`（兩處都要改，meta 那份也會擋）。
- 新集數 published 改成 true 並部署後，跑 `node --experimental-strip-types scripts/nl_ep.mjs check`：只寄測試信（中英各一封）給 vincent@easeai.com.tw。ep01 到 ep03 不補寄。
- Vincent 在 V Studio 按「寄給訂閱者」後，主線跑 `node --experimental-strip-types scripts/nl_ep.mjs send epNN --yes`（先 `--dry` 看人數）。worker 端擋：沒寄過測試信不能寄、同一集只寄一次。
- 後端程式：`09_vincent-profile/src/nl.js`（ep-test、ep-send）、`nl_email.js`（buildEp、buildEpTest）。
