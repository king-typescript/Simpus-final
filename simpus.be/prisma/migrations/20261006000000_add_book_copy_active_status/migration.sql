-- AlterTable
ALTER TABLE "book_copies" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "book_copies_isActive_idx" ON "book_copies"("isActive");
