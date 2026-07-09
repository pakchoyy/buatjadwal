import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature, parseMayarWebhook } from "@/lib/mayar";
import {
  findPendingTransactionsByAmount,
  findPendingTransactionsByMayarQrisId,
  updatePaymentTransactionStatus,
} from "@/lib/supabase-payment";

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
      const mayarId = webhookData.data.id;
      const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

      let matchingTransaction = null;

      // Cari berdasarkan mayarQrisId dulu (lebih akurat)
      if (mayarId) {
        const byQrisId = await findPendingTransactionsByMayarQrisId(mayarId);
        matchingTransaction = byQrisId.find(
          (t) => t.amount === Number(amount) && t.created_at >= thirtyMinAgo
        );
      }

      // Fallback: cocokkan amount + waktu
      if (!matchingTransaction) {
        const byAmount = await findPendingTransactionsByAmount(Number(amount), thirtyMinAgo);
        matchingTransaction = byAmount[0] || null;
      }

      if (matchingTransaction) {
        console.log(`[${traceId}] Matching transaction: ${matchingTransaction.id}`);

        await updatePaymentTransactionStatus(matchingTransaction.id, "paid");

        console.log(`[${traceId}] Transaction marked as paid`);
        return NextResponse.json({
          success: true,
          message: "Payment recorded",
          transactionId: matchingTransaction.id,
        });
      }

      console.warn(`[${traceId}] No matching transaction found for amount: ${amount}`);
      return NextResponse.json(
        { success: false, message: "No matching transaction found" },
        { status: 404 }
      );
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
