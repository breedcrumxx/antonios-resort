/*
  Warnings:

  - You are about to drop the `_featuretopricing` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_featuretopricing` DROP FOREIGN KEY `_FeatureToPricing_A_fkey`;

-- DropForeignKey
ALTER TABLE `_featuretopricing` DROP FOREIGN KEY `_FeatureToPricing_B_fkey`;

-- DropTable
DROP TABLE `_featuretopricing`;

-- CreateTable
CREATE TABLE `FeaturesOnPricings` (
    `PricingId` INTEGER NOT NULL,
    `FeatureId` INTEGER NOT NULL,

    PRIMARY KEY (`PricingId`, `FeatureId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `firstname` VARCHAR(191) NOT NULL,
    `lastname` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `promotions` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `FeaturesOnPricings` ADD CONSTRAINT `FeaturesOnPricings_PricingId_fkey` FOREIGN KEY (`PricingId`) REFERENCES `Pricing`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FeaturesOnPricings` ADD CONSTRAINT `FeaturesOnPricings_FeatureId_fkey` FOREIGN KEY (`FeatureId`) REFERENCES `Feature`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
