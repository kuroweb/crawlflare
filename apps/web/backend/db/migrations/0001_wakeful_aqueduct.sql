PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_mercari_crawl_settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`productId` integer NOT NULL,
	`keyword` text NOT NULL,
	`categoryId` integer,
	`minPrice` integer DEFAULT 0 NOT NULL,
	`maxPrice` integer DEFAULT 0 NOT NULL,
	`enabled` integer DEFAULT false NOT NULL,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_mercari_crawl_settings`("id", "productId", "keyword", "categoryId", "minPrice", "maxPrice", "enabled", "createdAt", "updatedAt") SELECT "id", "productId", "keyword", "categoryId", "minPrice", "maxPrice", "enabled", "createdAt", "updatedAt" FROM `mercari_crawl_settings`;--> statement-breakpoint
DROP TABLE `mercari_crawl_settings`;--> statement-breakpoint
ALTER TABLE `__new_mercari_crawl_settings` RENAME TO `mercari_crawl_settings`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_products`("id", "name", "createdAt", "updatedAt") SELECT "id", "name", "createdAt", "updatedAt" FROM `products`;--> statement-breakpoint
DROP TABLE `products`;--> statement-breakpoint
ALTER TABLE `__new_products` RENAME TO `products`;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "email", "password", "createdAt", "updatedAt") SELECT "id", "email", "password", "createdAt", "updatedAt" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;