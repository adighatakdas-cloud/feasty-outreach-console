CREATE TABLE `app_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`settingKey` varchar(120) NOT NULL,
	`settingValue` text NOT NULL,
	`updatedBy` int,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `app_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `app_settings_settingKey_unique` UNIQUE(`settingKey`)
);
--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`actorUserId` int,
	`action` varchar(120) NOT NULL,
	`targetType` varchar(80),
	`targetId` int,
	`details` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `campaign_leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campaignId` int NOT NULL,
	`leadId` int NOT NULL,
	`accountId` int,
	`sequenceState` enum('queued','sent','replied','stopped','booked') NOT NULL DEFAULT 'queued',
	`assignedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `campaign_leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `campaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(160) NOT NULL,
	`status` enum('draft','active','paused','complete') NOT NULL DEFAULT 'draft',
	`sourceFilter` varchar(80),
	`followerMin` int,
	`followerMax` int,
	`includeKeywords` json,
	`excludeKeywords` json,
	`nonResponderFollowupsEnabled` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `campaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`leadId` int NOT NULL,
	`accountId` int NOT NULL,
	`campaignId` int,
	`state` enum('no_reply','interested','not_interested','follow_up','booked') NOT NULL DEFAULT 'no_reply',
	`stateSource` enum('ai','operator') NOT NULL DEFAULT 'ai',
	`lockedByOperator` boolean NOT NULL DEFAULT false,
	`lastMessageAt` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`username` varchar(120) NOT NULL,
	`displayName` varchar(160),
	`bio` text,
	`source` varchar(80) NOT NULL,
	`followers` int,
	`verified` boolean,
	`lastPostAt` timestamp,
	`accountJoinedAt` timestamp,
	`qualificationStatus` json,
	`qualificationVerdict` enum('qualified','unqualified','partial') NOT NULL DEFAULT 'partial',
	`contactStatus` enum('never','contacted','replied','booked') NOT NULL DEFAULT 'never',
	`scrapedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `leads_id` PRIMARY KEY(`id`),
	CONSTRAINT `leads_username_unique` UNIQUE(`username`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`direction` enum('inbound','outbound') NOT NULL,
	`senderType` enum('automation','operator','lead') NOT NULL,
	`body` text NOT NULL,
	`sentAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sending_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`handle` varchar(80) NOT NULL,
	`label` varchar(120) NOT NULL,
	`status` enum('healthy','warming','attention','paused') NOT NULL DEFAULT 'warming',
	`coldCap` int NOT NULL DEFAULT 15,
	`warmCap` int NOT NULL DEFAULT 40,
	`coldSentToday` int NOT NULL DEFAULT 0,
	`warmSentToday` int NOT NULL DEFAULT 0,
	`workingHours` varchar(80) NOT NULL DEFAULT '09:00–17:30',
	`spintaxTemplate` text,
	`enabled` boolean NOT NULL DEFAULT true,
	`lastActivityAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sending_accounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `sending_accounts_handle_unique` UNIQUE(`handle`)
);
