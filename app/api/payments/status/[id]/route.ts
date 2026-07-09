import { NextRequest, NextResponse } from "next/server";
import { checkMayarTransaction } from "@/lib/mayar";
import {
  getPaymentTransactionById,
  updatePaymentTransactionStatus,
} from "@/lib/supabase-payment";
import { getTestTransactionStatus } from "@/lib/test-store";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const traceId = `st_${Date.now()}`;

  try {
    const { id } = params;
    console.log(`[${traceId}] Checking status for transaction: ${id}`);

    if (!id) {
      return NextResponse.json(
        { error: "Transaction ID required" },
        { status: 400 }
      );
    }

    // Check in-memory test store first
    const testTx = getTestTransactionStatus(id);
    if (testTx) {
      console.log(`[${traceId}] Test transaction status:`, testTx.status);
      return NextResponse.json({
        status: testTx.status,
        isTest: true,
        amount: testTx.amount,
        paidAt: testTx.paidAt,
      });
    }

    // Check Supabase
    let transaction;
    try {
      transaction = await getPaymentTransactionById(id);
    } catch (err) {
      console.error(`[${traceId}] Supabase check failed:`, err);
      return NextResponse.json(
        { error: "Gagal memeriksa status pembayaran", traceId },
        { status: 500 }
      );
    }

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    const now = Date.now();
    if (transaction.status === "expired" || transaction.status === "cancelled") {
      return NextResponse.json({ status: transaction.status });
    }

    const safeStatus: string = transaction.status;

    if (safeStatus === "paid") {
      console.log(`[${traceId}] Already paid`);
      return NextResponse.json({ status: "paid" });
    }

    if (safeStatus === "expired" || safeStatus === "cancelled") {
      return NextResponse.json({ status: safeStatus });
    }

    if (new Date(transaction.expires_at).getTime() < now) {
      try {
        await updatePaymentTransactionStatus(id, "expired");
      } catch (err) {
        console.error(`[${traceId}] Failed to mark as expired:`, err);
      }
      console.log(`[${traceId}] Transaction auto-expired`);
      return NextResponse.json({ status: "expired" });
    }

    // Check Mayar API
    console.log(`[${traceId}] Checking Mayar API for transaction ${id}`);
    try {
      const result = await checkMayarTransaction(
        transaction.amount,
        transaction.created_at,
        transaction.mayar_qris_id || undefined
      );

      console.log(`[${traceId}] Mayar check result:`, JSON.stringify(result));

      if (result.found) {
        console.log(`[${traceId}] Payment confirmed via Mayar API`);
        await updatePaymentTransactionStatus(id, "paid");
        return NextResponse.json({ status: "paid" });
      }
    } catch (err) {
      console.error(`[${traceId}] Mayar API check error:`, err);
    }

    return NextResponse.json({
      status: "pending",
      amount: transaction.amount,
      createdAt: transaction.created_at,
      expiresAt: transaction.expires_at,
    });
  } catch (error) {
    console.error(`[${traceId}] Status check error:`, error);
    return NextResponse.json(
      { error: "Gagal memeriksa status pembayaran" },
      { status: 500 }
    );
  }
}
