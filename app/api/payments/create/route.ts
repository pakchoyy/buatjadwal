import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { createDynamicQRIS } from "@/lib/mayar";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Rate limiting map (in-memory, will reset on server restart)
const rateLimiter = new Map<string, number[]>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const attempts = rateLimiter.get(ip) || [];

  // Remove attempts older than 1 hour
  const recentAttempts = attempts.filter((t) => now - t < 3600000);

  if (recentAttempts.length >= 5) {
    return false; // Max 5 attempts per hour
  }

  recentAttempts.push(now);
  rateLimiter.set(ip, recentAttempts);
  return true;
}

export async function POST(req: NextRequest) {
  try {
    // Get client IP
    const ip =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown";

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Terlalu banyak percobaan. Silakan coba lagi dalam 1 jam." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { amount, exportType, exportMetadata } = body;

    // Validate amount
    if (!amount || typeof amount !== "number") {
      return NextResponse.json(
        { error: "Amount tidak valid" },
        { status: 400 }
      );
    }

    const minAmount = parseInt(
      process.env.NEXT_PUBLIC_MIN_PAYMENT_AMOUNT || "10000"
    );
    if (amount < minAmount) {
      return NextResponse.json(
        { error: `Minimal donasi Rp${minAmount.toLocaleString("id-ID")}` },
        { status: 400 }
      );
    }

    if (amount > 1000000) {
      return NextResponse.json(
        { error: "Maksimal donasi Rp1.000.000" },
        { status: 400 }
      );
    }

    // Validate amount is multiple of 1000
    if (amount % 1000 !== 0) {
      return NextResponse.json(
        { error: "Nominal harus kelipatan Rp1.000" },
        { status: 400 }
      );
    }

    // Validate export type
    const validExportTypes = [
      "pdf-class",
      "pdf-teacher",
      "pdf-all",
      "excel-single",
      "excel-multi",
    ];

    if (!exportType || !validExportTypes.includes(exportType)) {
      return NextResponse.json(
        { error: "Export type tidak valid" },
        { status: 400 }
      );
    }

    console.log(`[API] Creating payment: ${amount} IDR for ${exportType}`);

    // Create QRIS via MAYAR API
    const qrisResponse = await createDynamicQRIS(amount);

    console.log("[API] QRIS created successfully:", qrisResponse.data.url);

    // Store transaction in Convex
    const transactionId = await convex.mutation(api.transactions.create, {
      amount,
      qrisUrl: qrisResponse.data.url,
      exportType,
      exportMetadata,
      ipAddress: ip,
    });

    console.log("[API] Transaction stored in Convex:", transactionId);

    return NextResponse.json({
      success: true,
      transactionId,
      qrisUrl: qrisResponse.data.url,
      amount: qrisResponse.data.amount,
      expiresIn: 1800, // 30 minutes in seconds
    });
  } catch (error) {
    console.error("[API] Payment creation error:", error);

    return NextResponse.json(
      {
        error: "Gagal membuat pembayaran. Silakan coba lagi.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
