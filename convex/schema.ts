import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Convex Database Schema for Payment Integration
 */

export default defineSchema({
  // Payment transactions
  transactions: defineTable({
    amount: v.number(),
    qrisUrl: v.string(),
    mayarQrisId: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("expired"),
      v.literal("cancelled")
    ),
    exportType: v.string(), // "pdf-class", "pdf-teacher", "pdf-all", "excel-single", "excel-multi"
    exportMetadata: v.optional(
      v.object({
        classId: v.optional(v.string()),
        teacherId: v.optional(v.string()),
        day: v.optional(v.string()),
      })
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
    paidAt: v.optional(v.number()),
    expiresAt: v.number(),
    ipAddress: v.optional(v.string()), // For rate limiting
  })
    .index("by_status", ["status"])
    .index("by_created_at", ["createdAt"])
    .index("by_expires_at", ["expiresAt"]),

  // Analytics
  analytics: defineTable({
    eventType: v.string(), // "payment_created", "payment_success", "payment_failed", "export_downloaded"
    transactionId: v.optional(v.id("transactions")),
    amount: v.optional(v.number()),
    exportType: v.optional(v.string()),
    metadata: v.optional(v.any()),
    timestamp: v.number(),
  }).index("by_timestamp", ["timestamp"]),
});
