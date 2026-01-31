import { LanguageSelector } from "./LanguageSelector";
import { StatusIndicator } from "./StatusIndicator";
import { Code2, Zap } from "lucide-react";

interface CompilerHeaderProps {
  language: string;
  onLanguageChange: (lang: string) => void;
  status: "valid" | "error" | "idle";
  statusMessage?: string;
}

export function CompilerHeader({
  language,
  onLanguageChange,
  status,
  statusMessage,
}: CompilerHeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-card border-b border-border">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Zap className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold gradient-text">VoiceCode IDE</h1>
            <p className="text-xs text-muted-foreground">
              AI-Powered Interactive Compiler
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <StatusIndicator status={status} message={statusMessage} />
        <LanguageSelector value={language} onChange={onLanguageChange} />
      </div>
    </div>
  );
}
