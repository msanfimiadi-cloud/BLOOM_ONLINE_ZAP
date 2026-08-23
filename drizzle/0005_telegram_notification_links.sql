CREATE TABLE `telegram_link_tokens` (
    `id` text PRIMARY KEY NOT NULL,
    `organization_id` text NOT NULL,
    `token_hash` text NOT NULL,
    `created_at` text NOT NULL,
    `expires_at` text NOT NULL,
    `used_at` text,
    FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `telegram_link_tokens_token_hash_unique` ON `telegram_link_tokens` (`token_hash`);
--> statement-breakpoint
CREATE INDEX `telegram_link_tokens_organization_id_idx` ON `telegram_link_tokens` (`organization_id`);
