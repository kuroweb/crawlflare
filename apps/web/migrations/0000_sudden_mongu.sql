CREATE TABLE `mercari_crawl_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`productId` integer NOT NULL,
	`keyword` text NOT NULL,
	`categoryId` integer,
	`minPrice` integer DEFAULT 0 NOT NULL,
	`maxPrice` integer DEFAULT 0 NOT NULL,
	`enabled` integer DEFAULT false NOT NULL,
	`createdAt` text DEFAULT (CURRENT_TIME),
	`updatedAt` text DEFAULT (CURRENT_TIME)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`createdAt` text DEFAULT (CURRENT_TIME),
	`updatedAt` text DEFAULT (CURRENT_TIME)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`createdAt` text DEFAULT (CURRENT_TIME),
	`updatedAt` text DEFAULT (CURRENT_TIME)
);
