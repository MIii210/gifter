CREATE TABLE `notebooks` (
	`owner` text PRIMARY KEY NOT NULL,
	`data` text NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `surveys` (
	`token` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`friend_id` text NOT NULL,
	`kind` text NOT NULL,
	`created` text NOT NULL,
	`result` text
);
