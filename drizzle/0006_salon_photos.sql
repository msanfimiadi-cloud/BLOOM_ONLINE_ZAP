ALTER TABLE `organizations` ADD `image_url` text NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE `staff` ADD `image_url` text NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE `services` ADD `image_url` text NOT NULL DEFAULT '';
--> statement-breakpoint
CREATE TABLE `uploaded_media` (
    `id` text PRIMARY KEY NOT NULL,
    `organization_id` text,
    `mime_type` text NOT NULL,
    `content` blob NOT NULL,
    `created_at` text NOT NULL,
    FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `uploaded_media_organization_id_idx` ON `uploaded_media` (`organization_id`);
