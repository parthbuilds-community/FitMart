import "dotenv/config";
import mongoose from "mongoose";

const Product = require("../models/Product");
const Order = require("../models/Order");

/**
 * One-off backfill for the integer-paise migration.
 *
 *   npm run backfill:money
 *
 * Products: derive `priceMinor` from the legacy rupee `price` and default
 * `isActive` to true. Orders: derive per-line and total integer fields from the
 * legacy rupee snapshots. Safe to run more than once.
 */
async function main(): Promise<void> {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI is not set");
    process.exit(1);
  }

  await mongoose.connect(uri, process.env.MONGO_DB ? { dbName: process.env.MONGO_DB } : undefined);
  console.log("Connected to MongoDB");

  const products: Array<{ productId: number; price?: number; priceMinor?: number; isActive?: boolean }> =
    await Product.find({}).select("productId price priceMinor isActive").lean();

  type BulkOp = {
    updateOne: { filter: Record<string, unknown>; update: Record<string, unknown> };
  };

  const productOps: BulkOp[] = [];

  for (const product of products) {
    const priceMinor = Math.round(Number(product.price) * 100);
    if (!Number.isInteger(priceMinor) || priceMinor < 0) continue;

    const set: Record<string, unknown> = {};
    if (product.priceMinor !== priceMinor) set.priceMinor = priceMinor;
    if (product.isActive === undefined) set.isActive = true;

    if (Object.keys(set).length) {
      productOps.push({
        updateOne: { filter: { productId: product.productId }, update: { $set: set } },
      });
    }
  }

  if (productOps.length) {
    await Product.bulkWrite(productOps);
  }
  console.log(`Products updated: ${productOps.length} of ${products.length}`);

  const orders = await Order.find({}).select("items total totalMinor").lean();
  let updatedOrders = 0;

  for (const order of orders) {
    if (Number.isInteger(order.totalMinor)) continue;

    const items = (order.items ?? []).map((item: { price?: number; quantity?: number }) => {
      const priceMinor = Math.round(Number(item.price) * 100);
      return {
        ...item,
        priceMinor,
        lineTotalMinor: priceMinor * Number(item.quantity ?? 0),
      };
    });

    const totalMinor = items.reduce(
      (sum: number, item: { lineTotalMinor?: number }) => sum + Number(item.lineTotalMinor ?? 0),
      0,
    );

    await Order.updateOne(
      { _id: order._id },
      {
        $set: {
          items,
          subtotalMinor: totalMinor,
          shippingMinor: 0,
          totalMinor,
          currency: "INR",
        },
      },
    );
    updatedOrders += 1;
  }

  console.log(`Orders updated: ${updatedOrders} of ${orders.length}`);
  await mongoose.disconnect();
}

main().catch(async (error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
