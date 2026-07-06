import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  verifyWebhookSignature,
  parseMayarWebhook,
} from "@/lib/mayar";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("x-mayar-signature");
    const rawBody = await req.text();

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    if (!verifyWebhookSignature(payload, signature)) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 }
      );
    }

    const webhook = parseMayarWebhook(payload);
    if (!webhook) {
      return NextResponse.json(
        { error: "Invalid webhook payload structure" },
        { status: 400 }
      );
    }

    console.log("[Webhook] Received event:", webhook.event);

    if (webhook.event === "payment.success") {
      const externalId = webhook.data.id;
      const status = webhook.data.status;

      if (status !== true) {
        console.warn("[Webhook] Payment success with false status, skipping");
        return NextResponse.json({ received: true });
      }

      await convex.mutation(api.transactions.updateStatus, {
        id: externalId as Id<"transactions">,
        status: "paid",
      });

      console.log("[Webhook] Transaction updated to paid:", externalId);
    } else {
      console.log("[Webhook] Unhandled event type:", webhook.event);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Webhook] Error processing webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
