import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Transaction ID is required" },
        { status: 400 }
      );
    }

    const transaction = await convex.query(api.transactions.getById, { id: id as Id<"transactions"> });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: transaction._id,
        status: transaction.status,
        amount: transaction.amount,
        qrisUrl: transaction.qrisUrl,
        exportType: transaction.exportType,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
        paidAt: transaction.paidAt,
        expiresAt: transaction.expiresAt,
      },
    });
  } catch (error) {
    console.error("[API] Status check error:", error);
    return NextResponse.json(
      {
        error: "Gagal memeriksa status pembayaran",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
