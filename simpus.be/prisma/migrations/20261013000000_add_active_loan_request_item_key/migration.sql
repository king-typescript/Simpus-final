ALTER TABLE "loan_request_items"
ADD COLUMN "activeKey" TEXT;

CREATE UNIQUE INDEX "loan_request_items_activeKey_key"
ON "loan_request_items"("activeKey");
