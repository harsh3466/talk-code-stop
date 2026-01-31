import { useState, useCallback, useEffect } from "react";
import { CompilerHeader } from "@/components/compiler/CompilerHeader";
import { CodeEditor, languageTemplates } from "@/components/compiler/CodeEditor";
import { SpeechToCode } from "@/components/compiler/SpeechToCode";
import { OutputPanel } from "@/components/compiler/OutputPanel";
import { ActionBar } from "@/components/compiler/ActionBar";
import { ErrorBanner } from "@/components/compiler/ErrorBanner";
import { cn } from "@/lib/utils";

const Index = () => {
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(languageTemplates.python);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<"valid" | "error" | "idle">("idle");
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [showError, setShowError] = useState(false);

  // Update code when language changes
  useEffect(() => {
    setCode(languageTemplates[language] || "");
    setOutput("");
    setValidationStatus("idle");
    setErrorMessage(undefined);
    setShowError(false);
  }, [language]);

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
    setIsRunning(true);
    setOutput("Compiling and running...\n");

    // Simulate compilation and execution
    setTimeout(() => {
      const simulatedOutput = `[${language.toUpperCase()} Compiler] Compilation successful!\n\n> Running program...\n\n${getSimulatedOutput(language, code)}\n\n[Process completed with exit code 0]`;
      setOutput(simulatedOutput);
      setIsRunning(false);
    }, 1500);
  }, [language, code]);

  const handleStop = useCallback(() => {
    setIsRunning(false);
    setOutput((prev) => prev + "\n\n[Process terminated by user]");
  }, []);

  const handleClear = useCallback(() => {
    setCode(languageTemplates[language] || "");
    setOutput("");
    setValidationStatus("idle");
    setErrorMessage(undefined);
    setShowError(false);
  }, [language]);

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

// Helper function to simulate output based on code patterns
function getSimulatedOutput(language: string, code: string): string {
  // Check for common patterns in the code
  if (code.includes('print("Hello') || code.includes("println(")) {
    return "Hello, World!";
  }
  if (code.includes("cout <<")) {
    return "Hello, World!";
  }
  if (code.includes("for") && (code.includes("range") || code.includes("int i"))) {
    return "0\n1\n2\n3\n4";
  }
  if (code.includes("fibonacci") || code.includes("fib")) {
    return "0, 1, 1, 2, 3, 5, 8, 13, 21, 34";
  }
  if (code.includes("factorial")) {
    return "120";
  }
  return "Program executed successfully.";
}

export default Index;
