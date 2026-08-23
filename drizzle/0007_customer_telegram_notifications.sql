ALTER TABLE `appointments` ADD `customer_telegram_chat_id` text NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE `appointments` ADD `customer_notifications_enabled` integer NOT NULL DEFAULT 0;
--> statement-breakpoint
CREATE TABLE `appointment_telegram_links` (
    `id` text PRIMARY KEY NOT NULL,
    `appointment_id` text NOT NULL,
    `token_hash` text NOT NULL,
    `created_at` text NOT NULL,
    `expires_at` text NOT NULL,
    `used_at` text,
    FOREIGN KEY (`appointment_id`) REFERENCES `appointments`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `appointment_telegram_links_token_hash_unique` ON `appointment_telegram_links` (`token_hash`);
--> statement-breakpoint
CREATE INDEX `appointment_telegram_links_appointment_id_idx` ON `appointment_telegram_links` (`appointment_id`);
