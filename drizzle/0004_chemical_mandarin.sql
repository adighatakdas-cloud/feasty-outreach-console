CREATE TABLE `proxy_routes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`accountId` int NOT NULL,
	`label` varchar(120) NOT NULL,
	`protocol` enum('http','https','socks5') NOT NULL DEFAULT 'https',
	`host` varchar(255) NOT NULL,
	`port` int NOT NULL,
	`username` varchar(160),
	`secretRef` varchar(160),
	`enabled` boolean NOT NULL DEFAULT false,
	`lastHealthAt` timestamp,
	`lastError` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `proxy_routes_id` PRIMARY KEY(`id`),
	CONSTRAINT `proxy_routes_accountId_unique` UNIQUE(`accountId`)
);
