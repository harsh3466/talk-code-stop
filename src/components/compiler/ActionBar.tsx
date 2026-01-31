import { Button } from "@/components/ui/button";
import { Play, Square, Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ActionBarProps {
  onRun: () => void;
  onStop: () => void;
  onClear: () => void;
  code: string;
  isRunning: boolean;
  isValid: boolean;
}

export function ActionBar({
  onRun,
  onStop,
  onClear,
  code,
  isRunning,
  isValid,
}: ActionBarProps) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Code copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy code");
    }
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-secondary/30 border-t border-border">
      <Button
        onClick={onRun}
        disabled={isRunning || !isValid || !code.trim()}
        className="gap-2 bg-success text-success-foreground hover:bg-success/90"
      >
        <Play className="h-4 w-4" />
        Run Code
      </Button>

      <Button
        onClick={onStop}
        disabled={!isRunning}
        variant="destructive"
        className="gap-2"
      >
        <Square className="h-4 w-4" />
        Stop
      </Button>

      <div className="flex-1" />

      <Button
        onClick={handleCopy}
        variant="outline"
        size="icon"
        className="border-border"
        disabled={!code.trim()}
      >
        <Copy className="h-4 w-4" />
      </Button>

      <Button
        onClick={onClear}
        variant="outline"
        size="icon"
        className="border-border"
        disabled={!code.trim()}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
