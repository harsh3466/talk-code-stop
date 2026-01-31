import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface StatusIndicatorProps {
  status: "valid" | "error" | "idle";
  message?: string;
}

export function StatusIndicator({ status, message }: StatusIndicatorProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "w-3 h-3 rounded-full status-pulse transition-colors duration-300",
          status === "valid" && "bg-success text-success",
          status === "error" && "bg-destructive text-destructive",
          status === "idle" && "bg-muted-foreground text-muted-foreground"
        )}
      />
      <div className="flex items-center gap-2">
        {status === "valid" && <CheckCircle2 className="h-4 w-4 text-success" />}
        {status === "error" && <XCircle className="h-4 w-4 text-destructive" />}
        {status === "idle" && <AlertCircle className="h-4 w-4 text-muted-foreground" />}
        <span
          className={cn(
            "text-sm font-medium",
            status === "valid" && "text-success",
            status === "error" && "text-destructive",
            status === "idle" && "text-muted-foreground"
          )}
        >
          {status === "valid" && (message || "Syntax Valid")}
          {status === "error" && (message || "Syntax Error")}
          {status === "idle" && "Ready"}
        </span>
      </div>
    </div>
  );
}
