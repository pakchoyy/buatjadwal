import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Transaction ID required" },
        { status: 400 }
      );
    }

    console.log(`[API] Checking status for transaction: ${id}`);

    // Query transaction from Convex
    const transaction = await convex.query(api.transactions.getById, {
      id: id as Id<"transactions">,
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    // Check if expired
    const now = Date.now();
    if (transaction.status === "pending" && transaction.expiresAt < now) {
      // Auto-expire
      await convex.mutation(api.transactions.updateStatus, {
        id: id as Id<"transactions">,
        status: "expired",
      });

      console.log(`[API] Transaction ${id} auto-expired`);

      return NextResponse.json({
        status: "expired",
        message: "Pembayaran telah expired",
      });
    }

    console.log(`[API] Transaction ${id} status: ${transaction.status}`);

    return NextResponse.json({
      status: transaction.status,
      amount: transaction.amount,
      createdAt: transaction.createdAt,
      expiresAt: transaction.expiresAt,
      paidAt: transaction.paidAt,
    });
  } catch (error) {
    console.error("[API] Status check error:", error);

    return NextResponse.json(
      { error: "Gagal memeriksa status pembayaran" },
      { status: 500 }
    );
  }
}
