"use client";

import { getPaymentProvider } from "@/lib/payment-provider";
import StaticQrisProvider from "./StaticQrisProvider";
import MayarProvider from "./MayarProvider";

interface PaymentProviderProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  exportType: string;
  exportMetadata?: any;
}

export default function PaymentProvider(props: PaymentProviderProps) {
  const provider = getPaymentProvider();

  if (provider === "mayar") {
    return <MayarProvider {...props} />;
  }

  return <StaticQrisProvider {...props} />;
}
