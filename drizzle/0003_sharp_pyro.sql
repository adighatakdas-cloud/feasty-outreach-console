CREATE TABLE `api_clients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(120) NOT NULL,
	`keyPrefix` varchar(20) NOT NULL,
	`keyHash` varchar(128) NOT NULL,
	`scopes` json NOT NULL,
	`enabled` boolean NOT NULL DEFAULT true,
	`createdBy` int NOT NULL,
	`lastUsedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`revokedAt` timestamp,
	CONSTRAINT `api_clients_id` PRIMARY KEY(`id`),
	CONSTRAINT `api_clients_keyPrefix_unique` UNIQUE(`keyPrefix`),
	CONSTRAINT `api_clients_keyHash_unique` UNIQUE(`keyHash`)
);
