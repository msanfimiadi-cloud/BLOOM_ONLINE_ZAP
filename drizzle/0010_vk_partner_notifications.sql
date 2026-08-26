ALTER TABLE `organizations` ADD `vk_peer_id` text NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE `organizations` ADD `vk_notifications_enabled` integer NOT NULL DEFAULT 0;
--> statement-breakpoint
CREATE TABLE `vk_link_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`token_hash` text NOT NULL,
	`created_at` text NOT NULL,
	`expires_at` text NOT NULL,
	`used_at` text,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `vk_link_tokens_token_hash_unique` ON `vk_link_tokens` (`token_hash`);
