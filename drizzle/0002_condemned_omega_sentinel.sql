CREATE TABLE `booking_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`fingerprint` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `customer_notes` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`phone` text NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`blocked` integer DEFAULT 0 NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `customer_organization_phone_unique` ON `customer_notes` (`organization_id`,`phone`);--> statement-breakpoint
CREATE TABLE `schedule_exceptions` (
	`id` text PRIMARY KEY NOT NULL,
	`staff_id` text NOT NULL,
	`organization_id` text NOT NULL,
	`exception_date` text NOT NULL,
	`is_day_off` integer DEFAULT 1 NOT NULL,
	`work_start` text DEFAULT '' NOT NULL,
	`work_end` text DEFAULT '' NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`staff_id`) REFERENCES `staff`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `staff_exception_day_unique` ON `schedule_exceptions` (`staff_id`,`exception_date`);--> statement-breakpoint
CREATE TABLE `staff_services` (
	`id` text PRIMARY KEY NOT NULL,
	`staff_id` text NOT NULL,
	`service_id` text NOT NULL,
	`organization_id` text NOT NULL,
	FOREIGN KEY (`staff_id`) REFERENCES `staff`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `staff_service_unique` ON `staff_services` (`staff_id`,`service_id`);--> statement-breakpoint
DROP INDEX `appointment_staff_slot_unique`;--> statement-breakpoint
ALTER TABLE `appointments` ADD `original_price` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `appointments` ADD `discount_amount` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `appointments` ADD `public_token` text DEFAULT '' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `appointment_staff_slot_unique` ON `appointments` (`staff_id`,`appointment_date`,`appointment_time`) WHERE status != 'cancelled';--> statement-breakpoint
ALTER TABLE `organizations` ADD `booking_lead_minutes` integer DEFAULT 60 NOT NULL;--> statement-breakpoint
ALTER TABLE `organizations` ADD `slot_step_minutes` integer DEFAULT 30 NOT NULL;--> statement-breakpoint
ALTER TABLE `staff` ADD `work_days` text DEFAULT '1,2,3,4,5,6' NOT NULL;--> statement-breakpoint
ALTER TABLE `staff` ADD `break_start` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `staff` ADD `break_end` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `staff` ADD `buffer_minutes` integer DEFAULT 0 NOT NULL;