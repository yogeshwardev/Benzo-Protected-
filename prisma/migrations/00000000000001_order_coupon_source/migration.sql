-- Track the coupon source that was used to create an order quote.
ALTER TABLE "Order" ADD COLUMN "couponId" TEXT;

CREATE INDEX "Order_couponId_idx" ON "Order"("couponId");

ALTER TABLE "Order"
  ADD CONSTRAINT "Order_couponId_fkey"
  FOREIGN KEY ("couponId") REFERENCES "Coupon"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "CouponRedemption"
  ADD CONSTRAINT "CouponRedemption_orderId_fkey"
  FOREIGN KEY ("orderId") REFERENCES "Order"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
