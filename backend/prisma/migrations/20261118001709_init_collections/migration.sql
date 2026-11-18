-- CreateEnum
CREATE TYPE "VaultItemType" AS ENUM ('BOOK', 'MOVIE', 'IMAGE', 'QUOTE', 'LINK');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Library" (
    "id" UUID NOT NULL,
    "ownerId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Library_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VaultItem" (
    "id" UUID NOT NULL,
    "libraryId" UUID NOT NULL,
    "type" "VaultItemType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VaultItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Book" (
    "id" UUID NOT NULL,
    "vaultItemId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT,
    "isbn" TEXT,
    "publicationYear" INTEGER,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Movie" (
    "id" UUID NOT NULL,
    "vaultItemId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "originalTitle" TEXT,
    "director" TEXT,
    "releaseYear" INTEGER,

    CONSTRAINT "Movie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Image" (
    "id" UUID NOT NULL,
    "vaultItemId" UUID NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "storageKey" TEXT,
    "externalUrl" TEXT,
    "sourceUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quote" (
    "id" UUID NOT NULL,
    "vaultItemId" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "author" TEXT,
    "sourceTitle" TEXT,
    "sourceUrl" TEXT,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Link" (
    "id" UUID NOT NULL,
    "vaultItemId" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,

    CONSTRAINT "Link_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Collection" (
    "id" UUID NOT NULL,
    "libraryId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "coverUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Collection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollectionItem" (
    "id" UUID NOT NULL,
    "collectionId" UUID NOT NULL,
    "vaultItemId" UUID NOT NULL,
    "coverUrl" TEXT,
    "position" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CollectionItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Library_ownerId_key" ON "Library"("ownerId");

-- CreateIndex
CREATE INDEX "VaultItem_libraryId_idx" ON "VaultItem"("libraryId");

-- CreateIndex
CREATE UNIQUE INDEX "Book_vaultItemId_key" ON "Book"("vaultItemId");

-- CreateIndex
CREATE UNIQUE INDEX "Movie_vaultItemId_key" ON "Movie"("vaultItemId");

-- CreateIndex
CREATE UNIQUE INDEX "Image_vaultItemId_key" ON "Image"("vaultItemId");

-- CreateIndex
CREATE UNIQUE INDEX "Quote_vaultItemId_key" ON "Quote"("vaultItemId");

-- CreateIndex
CREATE UNIQUE INDEX "Link_vaultItemId_key" ON "Link"("vaultItemId");

-- CreateIndex
CREATE INDEX "Collection_libraryId_idx" ON "Collection"("libraryId");

-- CreateIndex
CREATE INDEX "CollectionItem_vaultItemId_idx" ON "CollectionItem"("vaultItemId");

-- CreateIndex
CREATE UNIQUE INDEX "CollectionItem_collectionId_vaultItemId_key" ON "CollectionItem"("collectionId", "vaultItemId");

-- AddForeignKey
ALTER TABLE "Library" ADD CONSTRAINT "Library_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VaultItem" ADD CONSTRAINT "VaultItem_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "Library"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_vaultItemId_fkey" FOREIGN KEY ("vaultItemId") REFERENCES "VaultItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movie" ADD CONSTRAINT "Movie_vaultItemId_fkey" FOREIGN KEY ("vaultItemId") REFERENCES "VaultItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_vaultItemId_fkey" FOREIGN KEY ("vaultItemId") REFERENCES "VaultItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_vaultItemId_fkey" FOREIGN KEY ("vaultItemId") REFERENCES "VaultItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_vaultItemId_fkey" FOREIGN KEY ("vaultItemId") REFERENCES "VaultItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "Library"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionItem" ADD CONSTRAINT "CollectionItem_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionItem" ADD CONSTRAINT "CollectionItem_vaultItemId_fkey" FOREIGN KEY ("vaultItemId") REFERENCES "VaultItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
