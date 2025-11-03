# プロジェクト構造ガイド

## ディレクトリ構造

```
crawlflare/
├── apps/
│   ├── web/                                    # React Router + Vite フルスタック Web アプリ
│   │   ├── frontend/                           # フロントエンド（React Router）
│   │   │   ├── routes/                         # ルート定義ファイル
│   │   │   │   ├── admin.login.tsx
│   │   │   │   ├── admin.products.tsx
│   │   │   │   └── ...
│   │   │   ├── components/                     # React コンポーネント
│   │   │   │   ├── layouts/
│   │   │   │   └── features/
│   │   │   ├── lib/                            # フロントエンド用ユーティリティ
│   │   │   │   ├── api.ts
│   │   │   │   └── isAuthenticated.ts
│   │   │   ├── root.tsx                        # ルートコンポーネント
│   │   │   ├── routes.ts                       # ルート設定
│   │   │   ├── entry.server.tsx                # SSR エントリーポイント
│   │   │   └── app.css                         # グローバルスタイル
│   │   │
│   │   ├── backend/                            # バックエンド（Hono + Cloudflare Workers）
│   │   │   ├── app.ts                          # Hono アプリのエントリーポイント
│   │   │   ├── api/                            # API エンドポイント
│   │   │   │   ├── auth.ts
│   │   │   │   ├── products.ts
│   │   │   │   └── users.ts
│   │   │   ├── db/                             # データベース関連
│   │   │   │   ├── schema.ts                   # Drizzle ORM スキーマ定義
│   │   │   │   ├── client.ts                   # データベースクライアント作成
│   │   │   │   └── migrations/                 # マイグレーションファイル（Rails風）
│   │   │   │       ├── 0000_*.sql
│   │   │   │       └── meta/
│   │   │   ├── models/                         # データモデル層
│   │   │   │   ├── products.ts
│   │   │   │   └── users.ts
│   │   │   ├── schemas/                        # Zod スキーマ定義
│   │   │   │   ├── common.ts
│   │   │   │   ├── products.ts
│   │   │   │   └── users.ts
│   │   │   ├── middleware/                     # ミドルウェア
│   │   │   │   ├── auth.ts
│   │   │   │   ├── logger.ts
│   │   │   │   └── react-router.ts
│   │   │   ├── lib/                            # バックエンド用ユーティリティ
│   │   │   └── env.d.ts                        # 環境変数の型定義
│   │   │
│   │   ├── build/                              # ビルド成果物
│   │   │   ├── client/
│   │   │   └── server/
│   │   ├── public/                             # 静的アセット
│   │   ├── drizzle.config.ts                   # Drizzle ORM 設定
│   │   ├── wrangler.jsonc                      # Cloudflare Workers 設定
│   │   ├── worker-configuration.d.ts           # Cloudflare Workers 型定義（自動生成）
│   │   ├── vite.config.ts                      # Vite ビルド設定
│   │   ├── react-router.config.ts              # React Router 設定（appDirectory: "frontend"）
│   │   └── tsconfig*.json                      # TypeScript 設定
│   │
│   ├── job/                                    # バックグラウンド処理やキュー処理用（現状は空）
│   │
│   └── shared/                                 # 共有コード/型置き場（現状は空）
│
└── README.md                                   # ルートの説明
```

## 運用コマンド

- **デプロイ**: `apps/web` 直下で `npm run deploy`（`wrangler` を使用）
- **ローカル開発**: `npm run dev`（React Router Dev Server）/ `npm run preview`（Workers プレビュー）
- **データベース**:
  - `npm run db:generate` - マイグレーション生成
  - `npm run db:migrate:dev` - 開発環境マイグレーション実行
  - `npm run db:migrate:prod` - 本番環境マイグレーション実行
