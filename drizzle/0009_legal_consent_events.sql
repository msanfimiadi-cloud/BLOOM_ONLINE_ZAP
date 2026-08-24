CREATE TABLE `legal_consent_events` (
    `id` text PRIMARY KEY NOT NULL,
    `organization_id` text,
    `subject_identifier` text NOT NULL,
    `document_type` text NOT NULL,
    `document_version` text NOT NULL,
    `context` text NOT NULL,
    `created_at` text NOT NULL,
    FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `legal_consent_events_organization_id_idx` ON `legal_consent_events` (`organization_id`);
--> statement-breakpoint
CREATE INDEX `legal_consent_events_subject_identifier_idx` ON `legal_consent_events` (`subject_identifier`);
