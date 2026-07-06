import { query } from "./_generated/server";

/**
 * Analytics & Statistics Functions
 */

// Get payment statistics
export const getPaymentStats = query({
  handler: async (ctx) => {
    const transactions = await ctx.db.query("transactions").collect();

    const paidTransactions = transactions.filter((t) => t.status === "paid");
    const totalRevenue = paidTransactions.reduce((sum, t) => sum + t.amount, 0);
    const averageAmount =
      paidTransactions.length > 0 ? totalRevenue / paidTransactions.length : 0;

    return {
      total: transactions.length,
      paid: paidTransactions.length,
      pending: transactions.filter((t) => t.status === "pending").length,
      expired: transactions.filter((t) => t.status === "expired").length,
      cancelled: transactions.filter((t) => t.status === "cancelled").length,
      totalRevenue,
      averageAmount,
      conversionRate:
        transactions.length > 0
          ? (paidTransactions.length / transactions.length) * 100
          : 0,
    };
  },
});

// Get export type distribution
export const getExportTypeStats = query({
  handler: async (ctx) => {
    const transactions = await ctx.db
      .query("transactions")
      .filter((q) => q.eq(q.field("status"), "paid"))
      .collect();

    const exportTypes: Record<string, number> = {};

    for (const transaction of transactions) {
      const type = transaction.exportType;
      exportTypes[type] = (exportTypes[type] || 0) + 1;
    }

    return exportTypes;
  },
});

// Get recent transactions (last 10)
export const getRecentTransactions = query({
  handler: async (ctx) => {
    return await ctx.db.query("transactions").order("desc").take(10);
  },
});

// Get daily revenue (last 30 days)
export const getDailyRevenue = query({
  handler: async (ctx) => {
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

    const transactions = await ctx.db
      .query("transactions")
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "paid"),
          q.gt(q.field("createdAt"), thirtyDaysAgo)
        )
      )
      .collect();

    // Group by day
    const dailyRevenue: Record<string, number> = {};

    for (const transaction of transactions) {
      const date = new Date(transaction.createdAt);
      const dateKey = date.toISOString().split("T")[0]; // YYYY-MM-DD
      dailyRevenue[dateKey] = (dailyRevenue[dateKey] || 0) + transaction.amount;
    }

    return dailyRevenue;
  },
});
