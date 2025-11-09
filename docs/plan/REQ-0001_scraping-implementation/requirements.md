# 目的

- REQ-0001: スクレイピング機能の実装に関する要件定義を実施する
- productsに保持している条件に基づいて、メルカリをクローリングして結果を格納する機能の要件を定義する
- 影響箇所の推定と要件ジャッジを実施する

# 入力データ

- **要望ID**: REQ-0001
- **タイトル**: スクレイピング機能の実装
- **概要**: productsに保持している条件に基づいて、メルカリをクローリングして結果を格納する機能を実装する。クロール結果はDBに格納する。

# 影響箇所の推定

## 画面

- なし（バックグラウンド処理のため、直接的な画面変更は不要）
- 将来的にクロール結果を表示する画面が必要になる可能性あり

## クラス・メソッド

### 新規作成が必要なファイル・関数

バックエンド:

- `backend/lib/scraper.ts`（新規）
  - `scrapeMercariSearch(settings: MercariCrawlSetting, isFirstRun: boolean): Promise<MercariCrawlResult[]>` - メルカリ検索画面スクレイピング実行（初回は全ページ、それ以外は2〜3ページ）
  - `scrapeMercariItemDetail(itemUrl: string): Promise<MercariItemDetail>` - メルカリ商品詳細画面スクレイピング実行（削除確認・売り切れ日取得用）
  - `buildMercariSearchUrl(settings: MercariCrawlSetting, page: number): string` - メルカリ検索URL構築
  - `parseMercariSearchResults(html: string): MercariCrawlResult[]` - 検索結果HTML解析
  - `parseMercariItemDetail(html: string): MercariItemDetail` - 商品詳細HTML解析
- `backend/models/crawlResults.ts`（新規）
  - `createOrUpdateCrawlResult(db, productId, externalId, data)` - クロール結果の作成または更新（同じ `product_id` と `external_id` の組み合わせが既に存在する場合は更新、存在しない場合は新規作成）
  - `getCrawlResultByProductAndExternalId(db, productId, externalId)` - productIDと外部IDでクロール結果取得（重複チェック用）
  - `getCrawlResultsByProductId(db, productId)` - 商品IDでクロール結果取得（検索画面との比較用）
  - `getLatestCrawlResultByProductId(db, productId)` - 最新のクロール結果取得
  - `findMissingItemsInSearchResults(db, productId, searchResults)` - 検索結果に存在しないDB内の商品を特定
  - `findSoldOutItemsInSearchResults(db, productId, searchResults)` - 検索結果で売り切れ表示になった商品を特定
- `backend/api/crawl.ts`（新規）
  - `POST /api/crawl/execute` - 手動実行用エンドポイント（開発・テスト用、実装初期段階で使用）
  - `GET /api/crawl/results/:productId` - クロール結果取得エンドポイント
- `backend/jobs/crawl.ts`（新規）
  - `executeCrawlJob(env: Env)` - Cron Trigger から呼び出されるジョブ実行関数
  - `getEnabledCrawlSettings(db)` - enabled=true の設定を取得（products と mercari_crawl_settings を JOIN）
  - `processCrawlResults(db, productId, settings, searchResults)` - 検索結果とDBを比較して、詳細ページクロールが必要な商品を特定・処理
  - `checkDeletedItems(db, productId, missingItemIds)` - 削除された商品のステータスを更新
  - `checkSoldOutItems(db, productId, soldOutItemIds)` - 売り切れ商品の売り切れ日を更新
- `backend/app.ts`（変更）
  - `scheduled` ハンドラーの追加（Cron Trigger 対応）

### 既存ファイルの変更

- `backend/db/schema.ts`（変更）
  - `mercari_crawl_results` テーブルの追加
- `backend/schemas/products.ts`（変更、オプション）
  - クロール結果のスキーマ追加

## DB テーブル

### 新規テーブル

mercari_crawl_results:

- `id`: integer (PRIMARY KEY, AUTOINCREMENT)
- `product_id`: integer (NOT NULL, FK to products.id)
- `external_id`: text (NOT NULL) - メルカリ商品ID（外部システムのID）
- `name`: text (NOT NULL) - 商品名
- `price`: integer (NOT NULL) - 価格
- `product_url`: text (NOT NULL) - 商品URL
- `image_url`: text (NOT NULL) - 商品画像URL
- `status`: text - 商品ステータス（販売中、売り切れ、削除など）
- `sold_out_at`: text - 売り切れ日時（売り切れになった日時を記録）
- `created_at`: text (NOT NULL, DEFAULT CURRENT_TIMESTAMP)
- `updated_at`: text (NOT NULL, DEFAULT CURRENT_TIMESTAMP)

アソシエーション:

- `products` -> `mercari_crawl_results` (1対多)
- `products` -> `mercari_crawl_settings` (1対1)

ユニーク制約:

- `product_id` と `external_id` の組み合わせでユニーク制約（同じproductに対して同じ商品が重複しないようにする）

インデックス:

- `product_id` にインデックス（検索性能向上）
- `external_id` にインデックス（検索結果との比較用）
- `created_at` にインデックス（時系列検索用）
- `product_id` と `external_id` の複合インデックス（ユニーク制約と検索性能向上のため）

# 要件ジャッジ

## やるべきか

- Yes

## 優先度

- 高

## 影響範囲メモ

- **データベース**: 新規テーブル追加が必要
- **バックエンド**: スクレイピング処理、ジョブ実行機能の実装が必要
- **インフラ**: Cloudflare Workers の Cron Triggers 設定が必要（1時間ごとの実行）
- **外部依存**: メルカリのHTML構造に依存（変更時に影響を受ける可能性）
- **法的リスク**: スクレイピングの利用規約遵守が必要
- **ban対策**: VPS経由の実装を検討中（要検討）
- **エラー通知**: BugSnag通知の実装が必要

## 判断理由

- プロジェクトのコア機能: README.md のロードマップに明記されており、価格監視ツールとして必須の機能
- 既存インフラとの整合性: Cloudflare Workers は Cron Triggers をサポートしており、バックグラウンドジョブ実行が可能
- データ構造の準備: `mercari_crawl_settings` テーブルが既に存在し、スクレイピング条件が管理可能な状態
- 段階的な実装が可能: まずは手動実行から開始し、後でCron Trigger化が可能

## 確定事項

スクレイピング実行タイミング:

- 定期実行（Cron Trigger）で1時間ごと（hourly）に実行
- 実装方針: 一旦は手動実行で実装し、最終的にCron実行できるようにする

メルカリAPIの利用可否:

- メルカリAPIは利用不可のため、HTMLスクレイピングで実装
- メルカリの利用規約遵守が必要

ban対策:

- VPSを経由したスクレイピングを検討（要検討）
- 現時点では直接実装を想定

スクレイピング対象の範囲:

- `enabled=true` の設定のみをスクレイピング対象とする

実行失敗時のリトライポリシー:

- 実行に失敗した場合、即座のリトライは行わず、次回のhourly実行（1時間後）で再試行する

クロール結果の保持期間:

- 一旦無期限とする
- データ量の増加にともない要検討

レート制限・エラーハンドリング:

- レート制限を考慮してhourly（1時間ごと）の実行頻度としている
- エラー発生時はBugSnag通知を想定している

スクレイピング結果の粒度:

- 検索画面で商品一覧をクロールし、結果をDBに格納
- 初回実行以外は2〜3ページクロールすれば十分
- クロール結果とDBを比較して、DBにあるデータが検索画面に出ていない場合は、その商品の詳細ページを個別クロールして、削除された商品ならステータスを反映
- 検索画面で売り切れ表示になったもので、DBにデータがすでに存在するものは、その商品の詳細ページを個別クロールして売り切れ日をDBに反映

重複データの扱い:

- 計測設定（products）と紐づく計測結果は重複しない（同じ `product_id` に対しては重複しない）
- 別のproductsにすでに紐づいているデータがあって、それと重複するのは問題ない（異なる `product_id` に対しては同じ商品（`external_id`）が重複しても問題ない）

## 追加ヒアリング事項

- 現在、追加ヒアリング事項はありません

# 営業/クライアント向けヒアリング依頼文

## スクレイピング機能実装に関する確認事項

- REQ-0001「スクレイピング機能の実装」について、以下の点について確認をお願いする

### 実行タイミング・頻度について

- ✅ **確定**: 定期実行（Cron Trigger）で1時間ごと（hourly）に実行
- ✅ **確定**: 実装方針として、一旦は手動実行で実装し、最終的にCron実行できるようにする

### メルカリAPIの利用について

- ✅ **確定**: メルカリAPIは利用不可のため、HTMLスクレイピングで実装
- ⚠️ **注意**: メルカリの利用規約に準拠しているかご確認ください
- 🔍 **検討中**: ban対策としてVPSを経由したスクレイピングを検討中

### スクレイピング対象について

- ✅ **確定**: `enabled=true` に設定されている商品のみをスクレイピング対象とする

### 実行失敗時のリトライポリシーについて

- ✅ **確定**: 実行に失敗した場合、即座のリトライは行わず、次回のhourly実行（1時間後）で再試行する

### データ保持期間について

- ✅ **確定**: 一旦無期限とする
- 🔍 **検討事項**: データ量の増加にともない要検討

### スクレイピング結果の粒度について

- ✅ **確定**: 検索画面で商品一覧をクロールし、結果をDBに格納
- ✅ **確定**: 初回実行以外は2〜3ページクロールすれば十分
- ✅ **確定**: クロール結果とDBを比較して、DBにあるデータが検索画面に出ていない場合は、その商品の詳細ページを個別クロールして、削除された商品ならステータスを反映
- ✅ **確定**: 検索画面で売り切れ表示になったもので、DBにデータがすでに存在するものは、その商品の詳細ページを個別クロールして売り切れ日をDBに反映

### 重複データの扱いについて

- ✅ **確定**: 計測設定（products）と紐づく計測結果は重複しない（同じ `product_id` に対しては重複しない）
- ✅ **確定**: 別のproductsにすでに紐づいているデータがあって、それと重複するのは問題ない（異なる `product_id` に対しては同じ商品（`external_id`）が重複しても問題ない）

### レート制限・エラーハンドリングについて

- ✅ **確定**: レート制限を考慮してhourly（1時間ごと）の実行頻度としている
- ✅ **確定**: エラー発生時はBugSnag通知を想定している
- 回答いただければ、詳細設計に反映する
