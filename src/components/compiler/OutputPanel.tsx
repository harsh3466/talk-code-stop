import { ScrollArea } from "@/components/ui/scroll-area";
import { Terminal } from "lucide-react";

interface OutputPanelProps {
  output: string;
  isRunning: boolean;
}

export function OutputPanel({ output, isRunning }: OutputPanelProps) {
  return (
    <div className="flex flex-col h-full bg-editor-bg rounded-lg border border-border overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-secondary/50 border-b border-border">
        <Terminal className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Output</span>
        {isRunning && (
          <div className="flex items-center gap-2 ml-auto">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs text-muted-foreground">Running...</span>
          </div>
        )}
      </div>
      <ScrollArea className="flex-1 p-4">
        <pre className="font-mono text-sm text-foreground whitespace-pre-wrap">
          {output || (
            <span className="text-muted-foreground">
              {"// Output will appear here after running the code"}
            </span>
          )}
        </pre>
      </ScrollArea>
    </div>
  );
}
