import { useState, useCallback } from "react";

interface ExecutionResult {
  output: string;
  error?: string;
  exitCode: number;
}

// Piston API language mapping
const languageMap: Record<string, { language: string; version: string }> = {
  python: { language: "python", version: "3.10.0" },
  java: { language: "java", version: "15.0.2" },
  cpp: { language: "cpp", version: "10.2.0" },
};

export function useCodeExecution() {
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState("");

  const executeCode = useCallback(async (code: string, language: string): Promise<ExecutionResult> => {
    const langConfig = languageMap[language];
    
    if (!langConfig) {
      return {
        output: `Error: Unsupported language '${language}'`,
        error: "Unsupported language",
        exitCode: 1,
      };
    }

    try {
      setIsRunning(true);
      setOutput("⏳ Compiling and executing...\n");

      const response = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language: langConfig.language,
          version: langConfig.version,
          files: [
            {
              name: language === "java" ? "Main.java" : `main.${language === "cpp" ? "cpp" : "py"}`,
              content: code,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      
      const stdout = result.run?.stdout || "";
      const stderr = result.run?.stderr || "";
      const compileError = result.compile?.stderr || "";
      const exitCode = result.run?.code ?? 0;

      let finalOutput = "";
      
      if (compileError) {
        finalOutput = `❌ Compilation Error:\n${compileError}`;
      } else if (stderr) {
        finalOutput = `⚠️ Runtime Error:\n${stderr}`;
        if (stdout) {
          finalOutput = `📤 Output:\n${stdout}\n\n${finalOutput}`;
        }
      } else if (stdout) {
        finalOutput = `✅ Output:\n${stdout}`;
      } else {
        finalOutput = "✅ Program executed successfully (no output)";
      }

      finalOutput += `\n\n[Exit code: ${exitCode}]`;

      setOutput(finalOutput);
      return {
        output: finalOutput,
        exitCode,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      const errorOutput = `❌ Execution Failed:\n${errorMessage}\n\nPlease check your internet connection and try again.`;
      setOutput(errorOutput);
      return {
        output: errorOutput,
        error: errorMessage,
        exitCode: 1,
      };
    } finally {
      setIsRunning(false);
    }
  }, []);

  const stopExecution = useCallback(() => {
    setIsRunning(false);
    setOutput((prev) => prev + "\n\n⛔ Process terminated by user");
  }, []);

  const clearOutput = useCallback(() => {
    setOutput("");
  }, []);

  return {
    isRunning,
    output,
    executeCode,
    stopExecution,
    clearOutput,
    setOutput,
  };
}
