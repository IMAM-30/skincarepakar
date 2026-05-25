import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

type RiskWarningProps = {
  children: ReactNode;
};

export function RiskWarning({ children }: RiskWarningProps) {
  return (
    <div className="flex items-start gap-3 border-l-4 border-clay bg-roseSoft px-4 py-3 text-sm text-ink">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-clay" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}
