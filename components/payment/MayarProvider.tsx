"use client";

import PaymentModal from "./PaymentModal";

interface MayarProviderProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  exportType: string;
  exportMetadata?: any;
}

export default function MayarProvider(props: MayarProviderProps) {
  return <PaymentModal {...props} />;
}
