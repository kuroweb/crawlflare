# 目的

- 認証方式についての設計方針をまとめる

# 設計方針

- `/api/auth/*` エンドポイントを新規実装
  - Zod でスキーマ定義
  - OpenAPIHono で API ルート実装
  - OpenAPI ドキュメント自動生成
- React Router からは API 経由で認証を実行

# 実行フロー

### ログインフロー

1. ユーザーがログインフォームに email/password を入力して Submit
2. React Router の `action` が `/api/auth/login` に POST リクエスト
3. API が email/password を検証
4. 検証成功時、JWT を生成して `Set-Cookie` ヘッダーで返却
5. `action` が `Set-Cookie` ヘッダーを取得してリダイレクトレスポンスに転送
6. ブラウザが `/` にリダイレクトし、その際に `Set-Cookie` ヘッダーから Cookie を保存

### ログアウトフロー

1. ユーザーがログアウトをクリック
2. React Router の `action` が Cookie を削除する `Set-Cookie` ヘッダーを返却
3. ブラウザが `/` にリダイレクトし、その際に `Set-Cookie` ヘッダーから Cookie を削除

### 認証チェックフロー

1. 各ページの `loader` が `isAuthenticated()` を呼び出し
2. Cookie から JWT を取得して検証
3. 検証成功時はページ表示、失敗時はログイン画面にリダイレクト

# 認証APIの設計

### ログイン API（ユーザー認証と JWT 発行）

- エンドポイント:
  - `POST /api/auth/login`
- リクエスト:

  ```json
  {
    "email": "user@example.com",
    "password": "SecurePassword123"
  }
  ```

- 成功レスポンス (200):

  ```json
  {
    "success": true,
    "message": "ログインに成功しました",
    "data": {
      "userId": 1
    }
  }
  ```

  - ヘッダー: `Set-Cookie: login-token=<JWT>; HttpOnly; SameSite=Lax; Path=/; Max-Age=86400`
- エラーレスポンス (401):

  ```json
  {
    "error": "メールアドレスまたはパスワードが正しくありません"
  }
  ```

- 実行フロー:
  1. リクエストボディから `email`, `password` を取得
  2. Zod スキーマでバリデーション
  3. `findUserByEmail(db, email)` でユーザー検索
  4. `bcryptjs.compare(password, user.password)` でパスワード検証
  5. 検証成功時に JWT を生成（ペイロード: `{ userId: user.id }`）
  6. `Set-Cookie` ヘッダーに JWT を含めて返却

### ログアウト API（セッション無効化）

- エンドポイント:
  - `POST /api/auth/logout`
- リクエスト: なし（Cookie から JWT を参照）
- 成功レスポンス (200):

  ```json
  {
    "success": true,
    "message": "ログアウトしました"
  }
  ```

  - ヘッダー: `Set-Cookie: login-token=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`
- 実行フロー:
  1. クッキーを削除する `Set-Cookie` ヘッダーを返却
  2. （オプション）JWT のブラックリスト管理（将来的に KV で実装可能）

# リソース API での認証

### ログインチェック

- 対象エンドポイント:
  - `/api/products/*` （全操作）
  - `/api/users/*` （全操作）
- 実行フロー:
  1. クライアントが API にリクエスト（Cookie に `login-token` を含む）
  2. API がリクエストを受信
  3. Cookie から `login-token` を取得
  4. `hono/jwt` の `verify()` で JWT を検証
     - 署名が正しいか
     - 有効期限が切れていないか
  5. 検証失敗 → 401 エラーを返却して終了
  6. 検証成功 → 次の処理を実行
  7. レスポンスを返却
- 実装方法:
  - 認証ミドルウェアを作成
  - 各エンドポイントに適用

### スコープ制御

- 目的:
  - ログイン中のユーザーが操作可能なリソースを制限
- 実装方針:
  - JWT から `userId` を取得
  - `userId` で DB から `currentUser` を取得
  - `currentUser` を context に設定（`c.set('currentUser', user)`）
  - 各エンドポイントでスコープ判定を実行
- 実行フロー:
  1. ログインチェックを通過
  2. JWT のペイロードから `userId` を取得
  3. `userId` で DB から `currentUser` を取得
  4. `currentUser` を context に設定
  5. 各エンドポイントで必要に応じてスコープ判定
     - 例: `/api/users/:id` では `currentUser.id` とリクエストの `:id` を比較
     - 不一致 → 403 エラーを返却
  6. 問題なければリクエストされた操作を実行
  7. レスポンスを返却
