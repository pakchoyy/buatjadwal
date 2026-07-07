export type PaymentProviderType = "qris" | "mayar";

export function getPaymentProvider(): PaymentProviderType {
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_PAYMENT_PROVIDER === "mayar") {
    return "mayar";
  }
  return "qris";
}
