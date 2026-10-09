-- AlterTable
ALTER TABLE "books" ADD COLUMN     "fileUrl" TEXT,
ADD COLUMN     "isEbook" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pageCount" INTEGER;

-- CreateIndex
CREATE INDEX "books_isEbook_idx" ON "books"("isEbook");
