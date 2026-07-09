export type PaymentProviderType = "qris" | "mayar";

export function getPaymentProvider(): PaymentProviderType {
  const provider = process.env.NEXT_PUBLIC_PAYMENT_PROVIDER;
  if (provider === "mayar") return "mayar";
  return "qris";
}
