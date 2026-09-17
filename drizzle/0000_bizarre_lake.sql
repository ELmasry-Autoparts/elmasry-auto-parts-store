CREATE TABLE `inventory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`locationName` varchar(128) NOT NULL DEFAULT 'الحرفيين - المركز الرئيسي',
	`availableQty` int NOT NULL DEFAULT 0,
	`reservedQty` int NOT NULL DEFAULT 0,
	`lastSyncedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `inventory_id` PRIMARY KEY(`id`),
	CONSTRAINT `inventory_product_location_idx` UNIQUE(`productId`,`locationName`)
);
--> statement-breakpoint
CREATE TABLE `leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`productId` int,
	`name` varchar(160),
	`phone` varchar(32),
	`vin` varchar(64),
	`query` text NOT NULL,
	`mode` enum('text','code','image','vehicle') NOT NULL DEFAULT 'text',
	`source` varchar(48) NOT NULL DEFAULT 'storefront',
	`status` enum('new','contacted','closed') NOT NULL DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sku` varchar(96) NOT NULL,
	`title` varchar(255) NOT NULL,
	`oemNumber` varchar(96) NOT NULL,
	`brand` varchar(48) NOT NULL,
	`model` varchar(96) NOT NULL,
	`generation` varchar(96),
	`modelYears` varchar(96),
	`engine` varchar(96),
	`category` varchar(96) NOT NULL,
	`position` varchar(48),
	`supplier` varchar(128),
	`price` decimal(12,2) NOT NULL,
	`imageUrl` text,
	`isOriginal` boolean NOT NULL DEFAULT true,
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_sku_unique` UNIQUE(`sku`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
CREATE INDEX `inventory_location_idx` ON `inventory` (`locationName`);--> statement-breakpoint
CREATE INDEX `leads_status_idx` ON `leads` (`status`);--> statement-breakpoint
CREATE INDEX `leads_created_at_idx` ON `leads` (`createdAt`);--> statement-breakpoint
CREATE INDEX `products_oem_idx` ON `products` (`oemNumber`);--> statement-breakpoint
CREATE INDEX `products_model_idx` ON `products` (`model`);--> statement-breakpoint
CREATE INDEX `products_category_idx` ON `products` (`category`);