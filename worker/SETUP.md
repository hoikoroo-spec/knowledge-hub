# Knowledge Hub — Notion連携セットアップ

GitHub Pages上のKnowledge HubからNotionへ安全に登録するためのCloudflare Workerです。

## 1. Notion側
1. Notionのインテグレーションを作成し、Internal Integration Secretを取得します。
2. 登録対象のDB「📔 ナレッジ用」の接続設定で、作成したインテグレーションにページ作成権限を付与します。
3. 登録先は「📔 ナレッジ用」のみに固定しています。

## 2. Cloudflare Worker
1. CloudflareでWorkerを作り、`worker/notion-relay.js` の内容をデプロイします。
2. WorkerのSecretsに `NOTION_TOKEN`（Notionのシークレット）と `APP_ACCESS_KEY`（長いランダム文字列）を登録します。
3. WorkerのVariablesに `ALLOWED_ORIGIN` = `https://hoikoroo-spec.github.io` を登録します。
4. WorkerのURL（例 `https://your-worker.workers.dev`）を控えます。

## 3. アプリ側
1. GitHub PagesのKnowledge Hubを開き、会話またはメモを選択します。
2. 「Notion自動登録」欄の設定を開き、Worker URLとアクセスキーを入力します。
3. 内容（原文/整理案）を選択し「Notionに登録」を押します。
4. 成功するとページURLが記録され、登録済みになります。

**重要**
- Worker URLはブラウザ内に保存、アクセスキーはタブのセッション内だけに保持します。
- NotionトークンはブラウザやGitHubに置かず、WorkerのSecretsだけに保管してください。
- この方式は個人利用の試作向けです。アクセスキー共有、複数ユーザー運用、レート制限や監査ログには別途強化が必要です。
- GitHub PagesのHTMLだけでは自動登録できません。Workerのデプロイが必要です。
- 登録後に元のメモを編集してもNotionのページは自動更新されません。
