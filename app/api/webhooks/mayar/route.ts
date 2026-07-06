import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { verifyWebhookSignature, parseMayarWebhook } from "@/lib/mayar";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("x-mayar-signature");
    const payload = await req.json();

    console.log("[WEBHOOK] Received MAYAR webhook:", {
      event: payload?.event,
      hasSignature: !!signature,
    });

    // Verify webhook signature
    if (!verifyWebhookSignature(payload, signature)) {
      console.error("[WEBHOOK] Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Parse webhook payload
    const webhookData = parseMayarWebhook(payload);
    if (!webhookData) {
      console.error("[WEBHOOK] Invalid webhook payload structure");
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    console.log("[WEBHOOK] Parsed webhook data:", {
      event: webhookData.event,
      amount: webhookData.data.amount,
      status: webhookData.data.status,
    });

    // Handle payment.received event
    if (webhookData.event === "payment.received" && webhookData.data.status) {
      const { amount } = webhookData.data;

      // Find matching transaction by amount and recent timestamp
      // Note: This is a workaround since MAYAR doesn't send our custom transaction ID
      const allTransactions = await convex.query(api.transactions.listAll);

      // Find pending transaction with matching amount created in last 30 minutes
      const now = Date.now();
      const matchingTransaction = allTransactions.find(
        (t) =>
          t.status === "pending" &&
          t.amount === amount &&
          now - t.createdAt < 30 * 60 * 1000 // Created within last 30 minutes
      );

      if (matchingTransaction) {
        console.log(
          `[WEBHOOK] Matching transaction found: ${matchingTransaction._id}`
        );

        // Update transaction status to paid
        await convex.mutation(api.transactions.updateStatus, {
          id: matchingTransaction._id,
          status: "paid",
        });

        console.log(
          `[WEBHOOK] Transaction ${matchingTransaction._id} marked as paid`
        );

        return NextResponse.json({
          success: true,
          message: "Payment recorded",
          transactionId: matchingTransaction._id,
        });
      } else {
        console.warn(
          `[WEBHOOK] No matching pending transaction found for amount: ${amount}`
        );
        return NextResponse.json(
          {
            success: false,
            message: "No matching transaction found",
          },
          { status: 404 }
        );
      }
    }

    // Handle other events if needed
    console.log(`[WEBHOOK] Event ${webhookData.event} received but not processed`);

    return NextResponse.json({
      success: true,
      message: "Webhook received",
    });
  } catch (error) {
    console.error("[WEBHOOK] Error processing webhook:", error);

    return NextResponse.json(
      {
        error: "Webhook processing failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
