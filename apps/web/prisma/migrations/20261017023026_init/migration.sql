-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(120) NOT NULL,
    `email` VARCHAR(190) NOT NULL,
    `phone` VARCHAR(40) NULL,
    `passwordHash` VARCHAR(255) NOT NULL,
    `marketing` BOOLEAN NOT NULL DEFAULT false,
    `shipDefaults` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(20) NOT NULL,
    `customerName` VARCHAR(120) NOT NULL,
    `customerPhone` VARCHAR(40) NOT NULL,
    `customerEmail` VARCHAR(190) NULL,
    `deliveryMethod` ENUM('retiro', 'correo_domicilio', 'correo_sucursal') NOT NULL,
    `address` VARCHAR(255) NULL,
    `province` VARCHAR(80) NULL,
    `city` VARCHAR(120) NULL,
    `postalCode` VARCHAR(12) NULL,
    `dni` VARCHAR(20) NULL,
    `branch` VARCHAR(160) NULL,
    `shippingCost` INTEGER NOT NULL DEFAULT 0,
    `shippingWeightKg` DECIMAL(6, 2) NOT NULL DEFAULT 0,
    `shippingZone` VARCHAR(40) NULL,
    `notes` TEXT NULL,
    `adminNote` TEXT NULL,
    `paymentMethod` VARCHAR(40) NULL,
    `discount` INTEGER NOT NULL DEFAULT 0,
    `total` INTEGER NOT NULL,
    `status` ENUM('pendiente_pago', 'pagado', 'en_produccion', 'listo', 'entregado', 'cancelado') NOT NULL DEFAULT 'pendiente_pago',
    `marketing` BOOLEAN NOT NULL DEFAULT false,
    `shareGallery` BOOLEAN NOT NULL DEFAULT false,
    `userId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `orders_code_key`(`code`),
    INDEX `orders_status_createdAt_idx`(`status`, `createdAt`),
    INDEX `orders_customerEmail_idx`(`customerEmail`),
    INDEX `orders_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_status_events` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `status` ENUM('pendiente_pago', 'pagado', 'en_produccion', 'listo', 'entregado', 'cancelado') NOT NULL,
    `at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `note` VARCHAR(255) NULL,

    INDEX `order_status_events_orderId_at_idx`(`orderId`, `at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `sheetId` INTEGER NULL,
    `widthCm` DECIMAL(4, 1) NOT NULL,
    `heightCm` DECIMAL(4, 1) NOT NULL,
    `qty` INTEGER NOT NULL,
    `unitPrice` INTEGER NOT NULL DEFAULT 0,
    `lineTotal` INTEGER NOT NULL DEFAULT 0,
    `label` VARCHAR(160) NULL,
    `printKey` VARCHAR(255) NOT NULL,
    `origKey` VARCHAR(255) NULL,
    `thumbKey` VARCHAR(255) NULL,
    `meta` JSON NULL,

    INDEX `order_items_orderId_idx`(`orderId`),
    INDEX `order_items_sheetId_idx`(`sheetId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sheets` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `price` INTEGER NOT NULL,
    `planchas` INTEGER NOT NULL DEFAULT 1,
    `widthCm` DECIMAL(5, 1) NOT NULL,
    `lengthCm` DECIMAL(5, 1) NOT NULL,
    `usedLengthCm` DECIMAL(5, 1) NOT NULL,

    INDEX `sheets_orderId_idx`(`orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shirts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `garmentId` VARCHAR(40) NOT NULL,
    `garmentLabel` VARCHAR(80) NOT NULL,
    `size` VARCHAR(10) NOT NULL,
    `colorId` VARCHAR(30) NOT NULL,
    `colorLabel` VARCHAR(40) NOT NULL,
    `colorHex` VARCHAR(9) NOT NULL,
    `print` VARCHAR(20) NOT NULL,
    `printLabel` VARCHAR(60) NOT NULL,
    `qty` INTEGER NOT NULL,
    `unitPrice` INTEGER NOT NULL,
    `lineTotal` INTEGER NOT NULL,
    `label` VARCHAR(160) NULL,
    `frontKey` VARCHAR(255) NULL,
    `backKey` VARCHAR(255) NULL,
    `frontOrigKey` VARCHAR(255) NULL,
    `backOrigKey` VARCHAR(255) NULL,
    `frontThumb` VARCHAR(255) NULL,
    `backThumb` VARCHAR(255) NULL,
    `frontMeta` JSON NULL,
    `backMeta` JSON NULL,
    `placements` JSON NULL,

    INDEX `shirts_orderId_idx`(`orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pack_lines` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `packId` INTEGER NULL,
    `packKey` VARCHAR(60) NULL,
    `title` VARCHAR(160) NOT NULL,
    `stickers` INTEGER NOT NULL,
    `qty` INTEGER NOT NULL,
    `unitPrice` INTEGER NOT NULL,
    `lineTotal` INTEGER NOT NULL,
    `thumbKey` VARCHAR(255) NULL,

    INDEX `pack_lines_orderId_idx`(`orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gallery_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(160) NOT NULL,
    `fileKey` VARCHAR(255) NOT NULL,
    `thumbKey` VARCHAR(255) NOT NULL,
    `hash` VARCHAR(64) NULL,
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `source` VARCHAR(30) NOT NULL DEFAULT 'propio',
    `orderCode` VARCHAR(20) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `gallery_items_featured_createdAt_idx`(`featured`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contacts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `key` VARCHAR(190) NOT NULL,
    `name` VARCHAR(120) NULL,
    `email` VARCHAR(190) NULL,
    `phone` VARCHAR(40) NULL,
    `marketing` BOOLEAN NOT NULL DEFAULT false,
    `marketingAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `contacts_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `optouts` (
    `email` VARCHAR(190) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`email`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `expenses` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATE NOT NULL,
    `concept` VARCHAR(160) NOT NULL,
    `category` VARCHAR(60) NOT NULL,
    `amount` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `expenses_date_idx`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `campaigns` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `subject` VARCHAR(200) NOT NULL,
    `total` INTEGER NOT NULL,
    `sent` INTEGER NOT NULL,
    `failed` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `settings` (
    `key` VARCHAR(80) NOT NULL,
    `value` JSON NOT NULL,

    PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_status_events` ADD CONSTRAINT `order_status_events_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_sheetId_fkey` FOREIGN KEY (`sheetId`) REFERENCES `sheets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sheets` ADD CONSTRAINT `sheets_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shirts` ADD CONSTRAINT `shirts_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pack_lines` ADD CONSTRAINT `pack_lines_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
