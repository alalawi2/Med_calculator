CREATE TABLE `feedback` (
	`id` int AUTO_INCREMENT NOT NULL,
	`calculatorName` varchar(255) NOT NULL,
	`rating` int NOT NULL,
	`feedbackText` text,
	`userEmail` varchar(320),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `feedback_id` PRIMARY KEY(`id`)
);
