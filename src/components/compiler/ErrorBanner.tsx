import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export function ErrorBanner({ message, onDismiss, className }: ErrorBannerProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 bg-destructive/10 border-l-4 border-destructive rounded-r-lg slide-in-bottom",
        className
      )}
    >
      <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-medium text-destructive">Syntax Error Detected</p>
        <p className="text-sm text-destructive/80">{message}</p>
      </div>
      {onDismiss && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:bg-destructive/20"
          onClick={onDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
