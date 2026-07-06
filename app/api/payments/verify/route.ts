import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { checkMayarTransaction } from "@/lib/mayar";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { transactionId } = body;

    if (!transactionId) {
      return NextResponse.json(
        { error: "Transaction ID required" },
        { status: 400 }
      );
    }

    console.log(`[VERIFY] Verifying payment for transaction: ${transactionId}`);

    const transaction = await convex.query(api.transactions.getById, {
      id: transactionId as Id<"transactions">,
    });

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
        { error: "Transaction expired atau dibatalkan" },
        { status: 400 }
      );
    }

    // Check MAYAR API for matching transaction
    const result = await checkMayarTransaction(
      transaction.amount,
      transaction.createdAt
    );

    if (result.found) {
      console.log(`[VERIFY] Payment confirmed for transaction: ${transactionId}`);

      await convex.mutation(api.transactions.updateStatus, {
        id: transactionId as Id<"transactions">,
        status: "paid",
      });

      return NextResponse.json({
        success: true,
        status: "paid",
        message: "Pembayaran terverifikasi",
      });
    }

    console.log(`[VERIFY] No matching payment found for transaction: ${transactionId}`);

    return NextResponse.json({
      success: false,
      status: "pending",
      message: "Pembayaran belum terdeteksi",
    });
  } catch (error) {
    console.error("[VERIFY] Error:", error);
    return NextResponse.json(
      {
        error: "Gagal memverifikasi pembayaran",
        details: error instanceof Error ? error.message : "Unknown",
      },
      { status: 500 }
    );
  }
}
