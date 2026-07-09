import { NextRequest, NextResponse } from "next/server";
import { createDynamicQRIS } from "@/lib/mayar";
import { createPaymentTransaction } from "@/lib/supabase-payment";
import { createTestTransaction } from "@/lib/test-store";
import { generateId } from "@/lib/utils";

function generateTraceId(): string {
  return `tx_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

const rateLimiter = new Map<string, number[]>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const attempts = rateLimiter.get(ip) || [];
  const recentAttempts = attempts.filter((t) => now - t < 3600000);

  if (recentAttempts.length >= 5) {
    return false;
  }

  recentAttempts.push(now);
  rateLimiter.set(ip, recentAttempts);
  return true;
}

function isExternalConfigured(): boolean {
  return !!(process.env.MAYAR_API_KEY && process.env.SUPABASE_URL);
}

export async function POST(req: NextRequest) {
  const traceId = generateTraceId();

  try {
    const ip =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown";

    console.log(`[${traceId}] POST /api/payments/create from ${ip}`);

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Terlalu banyak percobaan. Silakan coba lagi dalam 1 jam." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { amount, isTestMode, exportType, exportMetadata } = body;

    console.log(`[${traceId}] Request body:`, { amount, isTestMode, exportType });

    if (!amount || typeof amount !== "number") {
      return NextResponse.json({ error: "Amount tidak valid" }, { status: 400 });
    }

    const minAmount = parseInt(
      process.env.NEXT_PUBLIC_MIN_PAYMENT_AMOUNT || "10000"
    );
    const isAllowedTestAmount = isTestMode === true && amount === 100;

    if (amount < minAmount && !isAllowedTestAmount) {
      return NextResponse.json(
        { error: `Minimal donasi Rp${minAmount.toLocaleString("id-ID")}` },
        { status: 400 }
      );
    }

    if (amount > 1000000 || (!isAllowedTestAmount && amount % 1000 !== 0)) {
      return NextResponse.json({ error: "Nominal tidak valid" }, { status: 400 });
    }

    const validExportTypes = [
      "pdf-class", "pdf-teacher", "pdf-all", "excel-single", "excel-multi",
    ];
    if (!exportType || !validExportTypes.includes(exportType)) {
      return NextResponse.json({ error: "Export type tidak valid" }, { status: 400 });
    }

    // Test mode + external services not configured → use local simulation
    const useLocal = isAllowedTestAmount && !isExternalConfigured();

    if (useLocal) {
      const txId = generateId();
      const qrisUrl = `${new URL(req.url).origin}/payment/qris.png`;

      createTestTransaction(txId, amount, qrisUrl);

      console.log(`[${traceId}] Local test transaction created:`, txId);

      return NextResponse.json({
        success: true,
        traceId,
        transactionId: txId,
        qrisUrl,
        amount,
        expiresIn: 1800,
        testMode: true,
        message: "Mode testing lokal — auto-success 5 detik",
      });
    }

    // Real Mayar QRIS
    console.log(`[${traceId}] Calling MAYAR create QRIS...`);
    const qrisResponse = await createDynamicQRIS(amount);
    console.log(`[${traceId}] MAYAR QRIS created:`, {
      id: qrisResponse.data.id,
      url: qrisResponse.data.url,
      amount: qrisResponse.data.amount,
    });

    // Store in Supabase
    const transaction = await createPaymentTransaction({
      amount,
      qrisUrl: qrisResponse.data.url,
      mayarQrisId: qrisResponse.data.id,
      exportType,
      exportMetadata,
      ipAddress: ip,
    });

    console.log(`[${traceId}] Transaction stored in Supabase:`, transaction.id);

    return NextResponse.json({
      success: true,
      traceId,
      transactionId: transaction.id,
      qrisUrl: qrisResponse.data.url,
      amount: qrisResponse.data.amount,
      expiresIn: 1800,
    });
  } catch (error) {
    console.error(`[${traceId}] Error:`, error);

    // If external fails and this is test mode, fallback to local
    if (error instanceof Error && error.message.includes("MAYAR_API_KEY")) {
      const txId = generateId();
      const qrisUrl = `${new URL(req.url).origin}/payment/qris.png`;
      createTestTransaction(txId, 100, qrisUrl);
      return NextResponse.json({
        success: true,
        traceId,
        transactionId: txId,
        qrisUrl,
        amount: 100,
        expiresIn: 1800,
        testMode: true,
        message: "Mode testing lokal (Mayar/Supabase tidak dikonfigurasi)",
      });
    }

    return NextResponse.json(
      {
        error: "Gagal membuat pembayaran. Silakan coba lagi.",
        traceId,
        details: error instanceof Error ? error.message : "Unknown",
      },
      { status: 500 }
    );
  }
}
