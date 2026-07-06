/**
 * MAYAR API Client
 * Handles all interactions with MAYAR Headless API
 */

const MAYAR_API_KEY = process.env.MAYAR_API_KEY;
const MAYAR_BASE_URL = process.env.MAYAR_BASE_URL;

if (!MAYAR_API_KEY) {
  throw new Error("MAYAR_API_KEY is not defined in environment variables");
}

if (!MAYAR_BASE_URL) {
  throw new Error("MAYAR_BASE_URL is not defined in environment variables");
}

interface CreateQRISResponse {
  statusCode: number;
  messages: string;
  data: {
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
  try {
    console.log(`[MAYAR] Creating QRIS for amount: ${amount}`);

    const response = await fetch(`${MAYAR_BASE_URL}/qr-codes/create`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MAYAR_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("[MAYAR] API Error:", {
        status: response.status,
        statusText: response.statusText,
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

    console.log("[MAYAR] QRIS created successfully:", data.data.url);
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
