/**
 * MAYAR API Client
 * Handles all interactions with MAYAR Headless API
 */

function getMayarConfig(): { apiKey: string; baseUrl: string } {
  const apiKey = process.env.MAYAR_API_KEY;
  const baseUrl = process.env.MAYAR_BASE_URL;

  if (!apiKey) {
    throw new Error("MAYAR_API_KEY is not defined in environment variables");
  }

  if (!baseUrl) {
    throw new Error("MAYAR_BASE_URL is not defined in environment variables");
  }

  return { apiKey, baseUrl };
}

interface CreateQRISResponse {
  statusCode: number;
  messages: string;
  data: {
    id: string;
    url: string;
    amount: number;
  };
}

/**
 * Create Dynamic QRIS code via MAYAR API
 */
export async function createDynamicQRIS(
  amount: number
): Promise<CreateQRISResponse> {
  const { apiKey, baseUrl } = getMayarConfig();

  try {
    console.log(`[MAYAR] Creating QRIS for amount: ${amount}`);

    const response = await fetch(`${baseUrl}/qr-codes/create`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("[MAYAR] API Error:", {
        status: response.status,
        error: errorData,
      });
      throw new Error(
        `MAYAR API Error: ${response.status} - ${JSON.stringify(errorData)}`
      );
    }

    const data: CreateQRISResponse = await response.json();

    if (data.statusCode !== 200) {
      console.error("[MAYAR] Non-200 status code:", data);
      throw new Error(`MAYAR returned error: ${data.messages}`);
    }

    console.log("[MAYAR] QRIS created:", {
      id: data.data.id,
      url: data.data.url,
      amount: data.data.amount,
    });

    return data;
  } catch (error) {
    console.error("[MAYAR] Error creating QRIS:", error);
    throw error;
  }
}

/**
 * Verify webhook signature from MAYAR
 * Note: Basic validation for now - enhance with actual signature verification
 */
export function verifyWebhookSignature(
  payload: any,
  signature: string | null
): boolean {
  // Basic payload validation
  if (!payload || typeof payload !== "object") {
    console.warn("[MAYAR] Invalid webhook payload format");
    return false;
  }

  // Check required fields
  if (!payload.event || !payload.data) {
    console.warn("[MAYAR] Missing required webhook fields");
    return false;
  }

  // TODO: Implement actual cryptographic signature verification
  // when MAYAR provides webhook signature specification
  console.log("[MAYAR] Webhook signature verification (basic):", {
    hasSignature: !!signature,
    event: payload.event,
  });

  return true;
}

/**
 * Parse MAYAR webhook payload
 */
export interface MayarWebhookPayload {
  event: string;
  data: {
    id: string;
    status: boolean;
    amount: number;
    customerEmail?: string;
    customerName?: string;
    productName?: string;
    createdAt: string;
    updatedAt: string;
    [key: string]: any;
  };
}

/**
 * Check MAYAR transactions for matching payment
 * Used as fallback when webhook hasn't arrived yet
 */
export async function checkMayarTransaction(
  amount: number,
  sinceTimestamp: number,
  expectedQrisId?: string
): Promise<{ found: boolean; transaction?: any }> {
  let config: { apiKey: string; baseUrl: string };

  try {
    config = getMayarConfig();
  } catch {
    console.warn("[MAYAR] Config not available, skipping check");
    return { found: false };
  }

  try {
    console.log(`[MAYAR] Checking transactions for amount: ${amount}`, {
      sinceTimestamp,
      expectedQrisId,
    });

    const response = await fetch(`${config.baseUrl}/transactions?limit=200`, {
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.warn("[MAYAR] Failed to fetch transactions:", response.status);
      return { found: false };
    }

    const data = await response.json();
    const transactions = data.data || [];

    const match = transactions.find((t: any) => {
      const tAmount = Number(t.amount ?? t.total ?? t.value ?? 0);
      const tCreated = new Date(
        t.createdAt ?? t.created_at ?? t.created ?? t.dateCreated ?? 0
      ).getTime();
      const tQrisId = String(
        t.id ?? t.qrisId ?? t.qris_id ?? t.transactionId ?? ""
      );

      const amountMatches = Number.isFinite(tAmount) && tAmount === amount;
      const timeMatches = Number.isFinite(tCreated) && tCreated >= sinceTimestamp;
      const idMatches = expectedQrisId ? tQrisId === expectedQrisId : true;

      return amountMatches && timeMatches && idMatches;
    });

    if (match) {
      console.log("[MAYAR] Found matching transaction:", {
        id: match.id || match._id,
        amount: match.amount || match.total,
        status: match.status,
        createdAt: match.createdAt || match.created_at,
      });
      return { found: true, transaction: match };
    }

    console.log("[MAYAR] No matching transaction found among", transactions.length, "transactions");
    return { found: false };
  } catch (error) {
    console.error("[MAYAR] Error checking transactions:", error);
    return { found: false };
  }
}
export function parseMayarWebhook(payload: any): MayarWebhookPayload | null {
  try {
    if (!payload || !payload.event || !payload.data) {
      console.warn("[MAYAR] Invalid webhook payload structure");
      return null;
    }

    return payload as MayarWebhookPayload;
  } catch (error) {
    console.error("[MAYAR] Error parsing webhook:", error);
    return null;
  }
}
