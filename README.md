# Crawlflare

- React Router + Hono + Cloudflare Workers を使用した価格監視ツール

## 概要

- Crawlflare は、Cloudflare Workers 上で動作するモダンなフルスタック Web アプリケーション
- スクレイピング処理をバックグラウンドジョブで実行し、計測対象商品の最安価格を自動的に調査・記録する価格監視ツールとして開発中
- 現在は、サーバーサイドレンダリング（SSR）に対応し、JWT ベースの認証システムを備えた管理機能が実装されている

## 主な機能

### 現在実装済み

- 🔐 **認証システム**: JWT ベースのログイン/ログアウト機能
- 👥 **ユーザー管理**: ユーザーの作成・編集・削除・一覧表示
- 📊 **計測管理**: 計測対象（products）の作成・編集・削除・一覧表示
- 🚀 **サーバーサイドレンダリング**: React Router による SSR
- ⚡️ **高速な開発体験**: Hot Module Replacement (HMR) 対応
- 📦 **型安全**: TypeScript による完全な型サポート
- 🎨 **モダンな UI**: Tailwind CSS + DaisyUI によるレスポンシブデザイン

### 将来の機能（開発予定）

- 🕷️ **スクレイピング機能**: 計測対象商品の価格情報を自動取得
- 📈 **価格監視**: 定期的なバックグラウンドジョブによる価格チェック
- 💰 **最安価格追跡**: 複数サイトから取得した価格を比較し、最安価格を記録
- 📊 **価格推移グラフ**: 価格の変動を可視化

## 技術スタック

### フロントエンド

- **React Router v7**: ルーティングと SSR
- **React 19**: UI ライブラリ
- **Tailwind CSS**: スタイリング
- **DaisyUI**: UI コンポーネント
- **React Hook Form**: フォーム管理
- **Zod**: スキーマバリデーション

### バックエンド

- **Hono**: Web フレームワーク
- **Cloudflare Workers**: エッジランタイム
- **Drizzle ORM**: データベース ORM
- **Cloudflare D1**: SQLite データベース
- **bcryptjs**: パスワードハッシュ化
- **OpenAPI**: API ドキュメント自動生成

### 開発ツール

- **Vite (rolldown-vite)**: ビルドツール
- **TypeScript**: 型システム
- **Wrangler**: Cloudflare Workers 開発・デプロイツール
- **Drizzle Kit**: データベースマイグレーション

## インフラ構成

### Development

- **開発サーバー**: Vite + React Router Dev Server
- **データベース**: better-sqlite3

### Production

- **Cloudflare Workers**: エッジコンピューティングプラットフォーム
- **Cloudflare D1**: SQLite ベースのデータベース
- **Cloudflare Assets**: 静的アセットの配信

## 環境構築

- Node.js 18 以上、npm または yarn が必要

- 依存関係をインストール

  ```bash
  npm install
  ```

- 環境変数を設定（プロジェクトルートに `.env` ファイルを作成）

  ```env
  # JWT シークレットキー
  JWT_SECRET=your-secret-key-here

  # Basic Auth
  BASIC_AUTH_USER=your-username
  BASIC_AUTH_PASS=your-password
  ```

- マイグレーションファイルを生成

  ```bash
  npm run db:generate
  ```

- マイグレーションを実行

  ```bash
  npm run db:migrate:dev
  ```

- Drizzle Studio でデータベースを確認（オプション）

  ```bash
  npm run db:studio:dev
  ```

## 開発

- 開発サーバーを起動

  ```bash
  npm run dev
  ```

  - 開発サーバーは `http://localhost:5173` で起動

- 本番ビルドをプレビュー

  ```bash
  npm run preview
  ```

- 型チェックを実行

  ```bash
  npm run typecheck
  ```

## ビルド

- 本番用のビルドを作成

  ```bash
  npm run build
  ```

  - ビルド成果物は `build/` ディレクトリに出力

## デプロイ

- 本番環境にデプロイ

  ```bash
  npm run deploy
  ```

- デプロイサイズを確認（デプロイなし）

  ```bash
  npm run dry-run
  ```

- プレビュー URL にデプロイ（バージョンをアップロード）

  ```bash
  npx wrangler versions upload
  ```

- 検証後、本番環境にプロモート

  ```bash
  npx wrangler versions deploy
  ```

## プロジェクト構造

- [プロジェクト構造ガイド](docs/project-structure.md) を参照

## API エンドポイント

- Swagger UI: http://localhost:5173/api/docs
- Basic Auth が必要（環境変数 `BASIC_AUTH_USER` と `BASIC_AUTH_PASS` で設定）
- 認証が必要なエンドポイントは、Cookie に `login-token`（JWT）を含める必要がある
- 詳細は [認証設計ドキュメント](docs/authentication-design.md) を参照

## データベース操作

### Development

- マイグレーションファイルを生成

  ```bash
  npm run db:generate
  ```

- マイグレーションを実行

  ```bash
  npm run db:migrate:dev
  ```

- Drizzle Studio でデータベースを確認

  ```bash
  npm run db:studio:dev
  ```

### Production

- マイグレーションを実行

  ```bash
  npm run db:migrate:prod
  ```

- Drizzle Studio でデータベースを確認

  ```bash
  npm run db:studio:prod
  ```

## スクリプト一覧

| スクリプト | 説明 |
|-----------|------|
| `npm run dev` | 開発サーバーを起動（HMR 有効） |
| `npm run preview` | 本番ビルドをプレビュー |
| `npm run build` | 本番用ビルドを作成 |
| `npm run deploy` | ビルドして Cloudflare Workers にデプロイ |
| `npm run dry-run` | デプロイサイズを確認（デプロイなし） |
| `npm run typecheck` | TypeScript の型チェックを実行 |
| `npm run db:generate` | マイグレーションファイルを生成 |
| `npm run db:migrate:dev` | 開発環境でマイグレーションを実行 |
| `npm run db:migrate:prod` | 本番環境でマイグレーションを実行 |
| `npm run db:studio:dev` | 開発環境で Drizzle Studio を起動 |
| `npm run db:studio:prod` | 本番環境で Drizzle Studio を起動 |

## ロードマップ

### 現在のフェーズ

- ✅ 認証システムの実装
- ✅ ユーザー管理機能
- ✅ 計測対象（products）管理機能

### 次のフェーズ（開発予定）

- 🔄 スクレイピング機能の実装
  - 計測対象商品の価格情報を取得するスクレイパーの開発
  - 複数のECサイトに対応したスクレイピング処理
- 🔄 バックグラウンドジョブ処理
  - Cloudflare Workers の Cron Triggers を活用した定期実行
  - 価格情報の自動取得とデータベースへの保存
- 🔄 価格比較・最安価格追跡
  - 複数サイトから取得した価格の比較機能
  - 最安価格の自動検出と記録
- 🔄 価格推移の可視化
  - グラフやチャートによる価格変動の表示
  - 価格アラート機能（指定価格以下になった際の通知）
