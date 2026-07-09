import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Transaction Management Functions
 */

// Create new transaction
export const create = mutation({
  args: {
    amount: v.number(),
    qrisUrl: v.string(),
    mayarQrisId: v.optional(v.string()),
    exportType: v.string(),
    exportMetadata: v.optional(
      v.object({
        classId: v.optional(v.string()),
        teacherId: v.optional(v.string()),
        day: v.optional(v.string()),
      })
    ),
    ipAddress: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const expiresAt = now + 30 * 60 * 1000; // 30 minutes

    const transactionId = await ctx.db.insert("transactions", {
      ...args,
      status: "pending",
      createdAt: now,
      updatedAt: now,
      expiresAt,
    });

    // Track analytics
    await ctx.db.insert("analytics", {
      eventType: "payment_created",
      transactionId,
      amount: args.amount,
      exportType: args.exportType,
      timestamp: now,
    });

    return transactionId;
  },
});

// Get transaction by ID
export const getById = query({
  args: { id: v.id("transactions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Update transaction status
export const updateStatus = mutation({
  args: {
    id: v.id("transactions"),
    status: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("expired"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    await ctx.db.patch(args.id, {
      status: args.status,
      updatedAt: now,
      ...(args.status === "paid" && { paidAt: now }),
    });

    // Track analytics
    await ctx.db.insert("analytics", {
      eventType: args.status === "paid" ? "payment_success" : "payment_failed",
      transactionId: args.id,
      timestamp: now,
    });
  },
});

// Check for expired transactions (can be called periodically)
export const expireOldTransactions = mutation({
  handler: async (ctx) => {
    const now = Date.now();
    const transactions = await ctx.db
      .query("transactions")
      .filter((q) =>
        q.and(q.eq(q.field("status"), "pending"), q.lt(q.field("expiresAt"), now))
      )
      .collect();

    for (const transaction of transactions) {
      await ctx.db.patch(transaction._id, {
        status: "expired",
        updatedAt: now,
      });
    }

    return transactions.length;
  },
});

// Get all transactions (for admin)
export const listAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("transactions").order("desc").take(100);
  },
});

// Get pending transaction by amount within time window (for webhook matching)
export const getPendingByAmount = query({
  args: { amount: v.number(), since: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("transactions")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .filter((q) =>
        q.and(
          q.eq(q.field("amount"), args.amount),
          q.gt(q.field("createdAt"), args.since)
        )
      )
      .take(10);
  },
});
