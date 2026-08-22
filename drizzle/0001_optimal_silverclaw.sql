CREATE TABLE `account_access` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`display_name` text DEFAULT '' NOT NULL,
	`role` text DEFAULT 'partner' NOT NULL,
	`organization_id` text,
	`active` integer DEFAULT 1 NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `account_access_email_unique` ON `account_access` (`email`);--> statement-breakpoint
CREATE TABLE `notification_events` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`appointment_id` text,
	`channel` text DEFAULT 'telegram' NOT NULL,
	`event_type` text NOT NULL,
	`status` text NOT NULL,
	`detail` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`appointment_id`) REFERENCES `appointments`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `organizations` ADD `telegram_chat_id` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `organizations` ADD `notifications_enabled` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `organizations` ADD `bloom_discount_percent` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `organizations` ADD `timezone` text DEFAULT 'Asia/Novosibirsk' NOT NULL;