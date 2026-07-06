import { NextRequest, NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { getConvexClient } from "@/lib/convex";
import { verifyWebhookSignature, parseMayarWebhook } from "@/lib/mayar";

export async function POST(req: NextRequest) {
  const traceId = `wh_${Date.now()}`;

  try {
    const signature = req.headers.get("x-mayar-signature");
    const payload = await req.json();

    console.log(`[${traceId}] Webhook received:`, {
      event: payload?.event,
      hasSignature: !!signature,
      payload: JSON.stringify(payload).substring(0, 300),
    });

    if (!verifyWebhookSignature(payload, signature)) {
      console.error(`[${traceId}] Invalid signature`);
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const webhookData = parseMayarWebhook(payload);
    if (!webhookData) {
      console.error(`[${traceId}] Invalid payload structure`);
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    console.log(`[${traceId}] Parsed webhook:`, {
      event: webhookData.event,
      amount: webhookData.data.amount,
      status: webhookData.data.status,
      mayarId: webhookData.data.id,
    });

    const event = webhookData.event.toLowerCase();
    const isPaymentEvent = event.includes("payment");
    const isSuccessEvent =
      event.includes("received") ||
      event.includes("success") ||
      webhookData.data.status === true;

    if (isPaymentEvent && isSuccessEvent) {
      const { amount } = webhookData.data;

      const convex = getConvexClient();

      // Try to find matching transaction using MAYAR's QRIS ID if available
      const mayarId = webhookData.data.id;
      let matchingTransaction = null;

      if (mayarId) {
        // Search by QRIS ID
        const allTransactions = await convex.query(api.transactions.listAll);
        matchingTransaction = allTransactions.find(
          (t) =>
            t.status === "pending" &&
            (t.mayarQrisId === mayarId ||
              (t.amount === amount &&
                Date.now() - t.createdAt < 30 * 60 * 1000))
        );
      }

      if (!matchingTransaction) {
        // Fallback: match by amount + recent timestamp
        const now = Date.now();
        const allTransactions = await convex.query(api.transactions.listAll);
        matchingTransaction = allTransactions.find(
          (t) =>
            t.status === "pending" &&
            t.amount === amount &&
            now - t.createdAt < 30 * 60 * 1000
        );
      }

      if (matchingTransaction) {
        console.log(`[${traceId}] Matching transaction: ${matchingTransaction._id}`);

        await convex.mutation(api.transactions.updateStatus, {
          id: matchingTransaction._id as Id<"transactions">,
          status: "paid",
        });

        console.log(`[${traceId}] Transaction marked as paid`);
        return NextResponse.json({
          success: true,
          message: "Payment recorded",
          transactionId: matchingTransaction._id,
        });
      } else {
        console.warn(`[${traceId}] No matching transaction found for amount: ${amount}`);
        return NextResponse.json(
          { success: false, message: "No matching transaction found" },
          { status: 404 }
        );
      }
    }

    console.log(`[${traceId}] Event "${webhookData.event}" not processed as payment.`);
    return NextResponse.json({ success: true, message: "Webhook received" });
  } catch (error) {
    console.error(`[${traceId}] Webhook error:`, error);
    return NextResponse.json(
      {
        error: "Webhook processing failed",
        traceId,
        details: error instanceof Error ? error.message : "Unknown",
      },
      { status: 500 }
    );
  }
}
