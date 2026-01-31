import { useState, useCallback, useEffect } from "react";
import { CompilerHeader } from "@/components/compiler/CompilerHeader";
import { CodeEditor, languageTemplates } from "@/components/compiler/CodeEditor";
import { SpeechToCode } from "@/components/compiler/SpeechToCode";
import { OutputPanel } from "@/components/compiler/OutputPanel";
import { ActionBar } from "@/components/compiler/ActionBar";
import { ErrorBanner } from "@/components/compiler/ErrorBanner";
import { useCodeExecution } from "@/hooks/useCodeExecution";
import { cn } from "@/lib/utils";

const Index = () => {
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(languageTemplates.python);
  const [isGenerating, setIsGenerating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<"valid" | "error" | "idle">("idle");
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [showError, setShowError] = useState(false);

  const { isRunning, output, executeCode, stopExecution, clearOutput } = useCodeExecution();

  // Update code when language changes
  useEffect(() => {
    setCode(languageTemplates[language] || "");
    clearOutput();
    setValidationStatus("idle");
    setErrorMessage(undefined);
    setShowError(false);
  }, [language, clearOutput]);

  const handleValidationChange = useCallback((isValid: boolean, error?: string) => {
    if (isValid) {
      setValidationStatus("valid");
      setErrorMessage(undefined);
      setShowError(false);
    } else {
      setValidationStatus("error");
      setErrorMessage(error);
      setShowError(true);
    }
  }, []);

  const handleCodeGenerated = useCallback((generatedCode: string) => {
    setCode(generatedCode);
    setValidationStatus("idle");
  }, []);

  const handleRun = useCallback(async () => {
    await executeCode(code, language);
  }, [executeCode, code, language]);

  const handleStop = useCallback(() => {
    stopExecution();
  }, [stopExecution]);

  const handleClear = useCallback(() => {
    setCode(languageTemplates[language] || "");
    clearOutput();
    setValidationStatus("idle");
    setErrorMessage(undefined);
    setShowError(false);
  }, [language, clearOutput]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <CompilerHeader
        language={language}
        onLanguageChange={setLanguage}
        status={validationStatus}
        statusMessage={errorMessage}
      />

      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4">
        {/* Left Panel - Editor */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          {/* Speech to Code Section */}
          <div className="glass rounded-xl p-4">
            <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
              🎤 Speech to Code
            </h2>
            <SpeechToCode
              language={language}
              onCodeGenerated={handleCodeGenerated}
              isGenerating={isGenerating}
              setIsGenerating={setIsGenerating}
            />
          </div>

          {/* Code Editor */}
          <div
            className={cn(
              "flex-1 editor-container min-h-[400px]",
              validationStatus === "error" && "error-state shake",
              validationStatus === "valid" && "success-state"
            )}
          >
            <CodeEditor
              language={language}
              value={code}
              onChange={setCode}
              onValidationChange={handleValidationChange}
            />
          </div>

          {/* Error Banner */}
          {showError && errorMessage && (
            <ErrorBanner
              message={errorMessage}
              onDismiss={() => setShowError(false)}
            />
          )}

          {/* Action Bar */}
          <ActionBar
            onRun={handleRun}
            onStop={handleStop}
            onClear={handleClear}
            code={code}
            isRunning={isRunning}
            isValid={validationStatus !== "error"}
          />
        </div>

        {/* Right Panel - Output */}
        <div className="w-full lg:w-[400px] min-h-[300px]">
          <OutputPanel output={output} isRunning={isRunning} />
        </div>
      </div>
    </div>
  );
};

export default Index;
