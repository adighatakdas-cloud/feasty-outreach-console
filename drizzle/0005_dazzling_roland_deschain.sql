CREATE TABLE `learning_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventType` varchar(80) NOT NULL,
	`entityType` varchar(80) NOT NULL,
	`entityId` int NOT NULL,
	`predictedLabel` varchar(80),
	`finalLabel` varchar(80) NOT NULL,
	`confidence` int,
	`features` json,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `learning_events_id` PRIMARY KEY(`id`)
);
