CREATE TABLE `mercari_crawl_results` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`productId` integer NOT NULL,
	`externalId` text NOT NULL,
	`name` text NOT NULL,
	`price` integer NOT NULL,
	`sellingUrl` text NOT NULL,
	`imageUrl` text NOT NULL,
	`sellingStatus` integer NOT NULL,
	`sellerType` integer NOT NULL,
	`sellerId` text NOT NULL,
	`soldOutAt` text,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `product_external_unique_idx` ON `mercari_crawl_results` (`productId`,`externalId`);--> statement-breakpoint
CREATE INDEX `product_id_idx` ON `mercari_crawl_results` (`productId`);--> statement-breakpoint
CREATE INDEX `external_id_idx` ON `mercari_crawl_results` (`externalId`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `mercari_crawl_results` (`createdAt`);--> statement-breakpoint
CREATE INDEX `updated_at_idx` ON `mercari_crawl_results` (`updatedAt`);