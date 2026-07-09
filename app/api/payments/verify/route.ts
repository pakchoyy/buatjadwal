import { NextRequest, NextResponse } from "next/server";
import { checkMayarTransaction } from "@/lib/mayar";
import {
  getPaymentTransactionById,
  updatePaymentTransactionStatus,
} from "@/lib/supabase-payment";

export async function POST(req: NextRequest) {
  const traceId = `vr_${Date.now()}`;

  try {
    const body = await req.json();
    const { transactionId } = body;

    console.log(`[${traceId}] Verify payment: ${transactionId}`);

    if (!transactionId) {
      return NextResponse.json(
        { error: "Transaction ID required" },
        { status: 400 }
      );
    }

    const transaction = await getPaymentTransactionById(transactionId);

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    if (transaction.status === "paid") {
      return NextResponse.json({ success: true, status: "paid" });
    }

    if (transaction.status === "expired" || transaction.status === "cancelled") {
      return NextResponse.json(
        { error: "Transaksi expired atau dibatalkan" },
        { status: 400 }
      );
    }

    const result = await checkMayarTransaction(
      transaction.amount,
      transaction.created_at,
      transaction.mayar_qris_id || undefined
    );

    if (result.found) {
      console.log(`[${traceId}] Payment confirmed via MAYAR API`);

      await updatePaymentTransactionStatus(transactionId, "paid");

      return NextResponse.json({
        success: true,
        status: "paid",
        message: "Pembayaran terverifikasi",
      });
    }

    console.log(`[${traceId}] Payment not found in MAYAR`);
    return NextResponse.json({
      success: false,
      status: "pending",
      message: "Pembayaran belum terdeteksi di MAYAR",
    });
  } catch (error) {
    console.error(`[${traceId}] Verify error:`, error);
    return NextResponse.json(
      {
        error: "Gagal memverifikasi pembayaran",
        traceId,
        details: error instanceof Error ? error.message : "Unknown",
      },
      { status: 500 }
    );
  }
}
