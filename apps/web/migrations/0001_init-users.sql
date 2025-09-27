-- Migration number: 0001 	 2025-09-27T23:37:18.568Z

-- users テーブル作成
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  password TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- デモ用の初期ユーザー（平文パスワード: admin）
INSERT OR IGNORE INTO users (id, password) VALUES ('admin', 'admin');
