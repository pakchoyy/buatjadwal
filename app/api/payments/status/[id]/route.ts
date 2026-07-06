import { NextRequest, NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { getConvexClient } from "@/lib/convex";

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

    const convex = getConvexClient();
    const transaction = await convex.query(api.transactions.getById, {
      id: id as Id<"transactions">,
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    const now = Date.now();
    if (transaction.status === "pending" && transaction.expiresAt < now) {
      await convex.mutation(api.transactions.updateStatus, {
        id: id as Id<"transactions">,
        status: "expired",
      });

      console.log(`[${traceId}] Transaction auto-expired`);
      return NextResponse.json({
        status: "expired",
        message: "Pembayaran telah expired",
      });
    }

    console.log(`[${traceId}] Transaction status: ${transaction.status}`);

    return NextResponse.json({
      status: transaction.status,
      amount: transaction.amount,
      createdAt: transaction.createdAt,
      expiresAt: transaction.expiresAt,
      paidAt: transaction.paidAt,
    });
  } catch (error) {
    console.error(`[${traceId}] Status check error:`, error);
    return NextResponse.json(
      { error: "Gagal memeriksa status pembayaran" },
      { status: 500 }
    );
  }
}
