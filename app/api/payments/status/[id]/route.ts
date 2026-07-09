import { NextRequest, NextResponse } from "next/server";
import { checkMayarTransaction } from "@/lib/mayar";
import {
  getPaymentTransactionById,
  updatePaymentTransactionStatus,
} from "@/lib/supabase-payment";

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

    const transaction = await getPaymentTransactionById(id);

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
      console.log(`[${traceId}] Status already paid, returning immediately`);
      return NextResponse.json({ status: "paid" });
    }

    if (safeStatus === "expired" || safeStatus === "cancelled") {
      return NextResponse.json({ status: safeStatus });
    }

    if (new Date(transaction.expires_at).getTime() < now) {
      await updatePaymentTransactionStatus(id, "expired");
      console.log(`[${traceId}] Transaction auto-expired`);
      return NextResponse.json({
        status: "expired",
        message: "Pembayaran telah expired",
      });
    }

    // Fallback: cek ke API Mayar kalau masih pending
    console.log(`[${traceId}] Still pending, checking Mayar API with mayar_qris_id:`, transaction.mayar_qris_id);
    const result = await checkMayarTransaction(
      transaction.amount,
      transaction.created_at,
      transaction.mayar_qris_id || undefined
    );

    console.log(`[${traceId}] Mayar API result:`, JSON.stringify(result));

    if (result.found) {
      console.log(`[${traceId}] Payment confirmed via Mayar API, updating...`);
      await updatePaymentTransactionStatus(id, "paid");
      return NextResponse.json({
        status: "paid",
        message: "Pembayaran terverifikasi",
      });
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
