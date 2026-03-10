
import { PaymentStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  className?: string;
}

const PaymentStatusBadge = ({ status, className }: PaymentStatusBadgeProps) => {
  const isPaid = status === "Pago";
  
  return (
    <div 
      className={cn(
        "inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium",
        isPaid ? "bg-paid text-paid-foreground" : "bg-unpaid text-unpaid-foreground",
        className
      )}
    >
      {isPaid ? (
        <Check className="h-3.5 w-3.5" />
      ) : (
        <X className="h-3.5 w-3.5" />
      )}
      {status}
    </div>
  );
};

export default PaymentStatusBadge;
