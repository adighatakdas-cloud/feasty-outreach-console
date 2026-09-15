CREATE TABLE `ab_experiments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(140) NOT NULL,
	`status` enum('draft','running','paused','complete') NOT NULL DEFAULT 'draft',
	`objective` varchar(80) NOT NULL DEFAULT 'booked_call',
	`variants` json NOT NULL,
	`allocation` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ab_experiments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `account_health` (
	`id` int AUTO_INCREMENT NOT NULL,
	`accountId` int NOT NULL,
	`status` enum('unknown','healthy','degraded','blocked','cooldown') NOT NULL DEFAULT 'unknown',
	`lastSuccessAt` timestamp,
	`lastErrorCode` varchar(80),
	`lastError` text,
	`consecutiveFailures` int NOT NULL DEFAULT 0,
	`cooldownUntil` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `account_health_id` PRIMARY KEY(`id`),
	CONSTRAINT `account_health_accountId_unique` UNIQUE(`accountId`)
);
--> statement-breakpoint
CREATE TABLE `adapter_configs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`adapterKey` varchar(80) NOT NULL,
	`displayName` varchar(140) NOT NULL,
	`enabled` boolean NOT NULL DEFAULT false,
	`mode` enum('official_api','operator_assist','disabled') NOT NULL DEFAULT 'disabled',
	`settings` json,
	`secretRef` varchar(160),
	`lastHealthAt` timestamp,
	`lastError` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `adapter_configs_id` PRIMARY KEY(`id`),
	CONSTRAINT `adapter_configs_adapterKey_unique` UNIQUE(`adapterKey`)
);
--> statement-breakpoint
CREATE TABLE `automation_jobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`jobType` varchar(100) NOT NULL,
	`adapterKey` varchar(80),
	`accountId` int,
	`status` enum('queued','running','succeeded','failed','paused','cancelled') NOT NULL DEFAULT 'queued',
	`attempts` int NOT NULL DEFAULT 0,
	`lastErrorCode` varchar(80),
	`lastError` text,
	`payload` json,
	`runAfter` timestamp,
	`startedAt` timestamp,
	`finishedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `automation_jobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `message_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(140) NOT NULL,
	`channel` varchar(40) NOT NULL DEFAULT 'instagram',
	`variantKey` varchar(80),
	`body` text NOT NULL,
	`enabled` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `message_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notification_rules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`channel` varchar(40) NOT NULL,
	`targetRef` varchar(220),
	`events` json NOT NULL,
	`enabled` boolean NOT NULL DEFAULT false,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notification_rules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workspace_config` (
	`id` int AUTO_INCREMENT NOT NULL,
	`section` varchar(80) NOT NULL,
	`config` json NOT NULL,
	`updatedBy` int,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `workspace_config_id` PRIMARY KEY(`id`),
	CONSTRAINT `workspace_config_section_unique` UNIQUE(`section`)
);
