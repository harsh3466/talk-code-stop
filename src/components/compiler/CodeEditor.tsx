import { useRef, useCallback, useState } from "react";
import Editor, { OnMount, OnChange, Monaco } from "@monaco-editor/react";

interface CodeEditorProps {
  language: string;
  value: string;
  onChange: (value: string) => void;
  onValidationChange?: (isValid: boolean, error?: string) => void;
  readOnly?: boolean;
}

const languageTemplates: Record<string, string> = {
  python: `# Python Code\ndef main():\n    print("Hello, World!")\n\nif __name__ == "__main__":\n    main()`,
  java: `// Java Code\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}`,
  cpp: `// C++ Code\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}`,
};

// Real-time syntax validator for code stopper
function validateSyntax(code: string): { isValid: boolean; error?: string } {
  const lines = code.split('\n');
  let parenCount = 0;
  let bracketCount = 0;
  let braceCount = 0;
  let inString: string | null = null;
  let stringStartLine = 0;

  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    const line = lines[lineNum];
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const prevChar = i > 0 ? line[i - 1] : '';

      // Handle escape sequences
      if (prevChar === '\\' && inString) continue;

      // Handle string literals
      if ((char === '"' || char === "'") && !inString) {
        inString = char;
        stringStartLine = lineNum + 1;
      } else if (char === inString) {
        inString = null;
      }

      // Only count brackets outside of strings
      if (!inString) {
        if (char === '(') parenCount++;
        else if (char === ')') {
          parenCount--;
          if (parenCount < 0) {
            return { isValid: false, error: `Line ${lineNum + 1}: Unexpected closing parenthesis ')'` };
          }
        }
        else if (char === '[') bracketCount++;
        else if (char === ']') {
          bracketCount--;
          if (bracketCount < 0) {
            return { isValid: false, error: `Line ${lineNum + 1}: Unexpected closing bracket ']'` };
          }
        }
        else if (char === '{') braceCount++;
        else if (char === '}') {
          braceCount--;
          if (braceCount < 0) {
            return { isValid: false, error: `Line ${lineNum + 1}: Unexpected closing brace '}'` };
          }
        }
      }
    }

    // Check for unclosed string at end of line (single-line string languages)
    if (inString) {
      return { isValid: false, error: `Line ${stringStartLine}: Unclosed string literal` };
    }
  }

  if (parenCount > 0) {
    return { isValid: false, error: `Missing ${parenCount} closing parenthesis ')'` };
  }
  if (bracketCount > 0) {
    return { isValid: false, error: `Missing ${bracketCount} closing bracket ']'` };
  }
  if (braceCount > 0) {
    return { isValid: false, error: `Missing ${braceCount} closing brace '}'` };
  }

  return { isValid: true };
}

export function CodeEditor({
  language,
  value,
  onChange,
  onValidationChange,
  readOnly = false,
}: CodeEditorProps) {
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const [hasError, setHasError] = useState(false);

  const handleEditorMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    editor.focus();

    // Code Stopper: Intercept Enter key to block new lines when there are syntax errors
    editor.addCommand(monaco.KeyCode.Enter, () => {
      const currentCode = editor.getValue();
      const validation = validateSyntax(currentCode);
      
      if (!validation.isValid) {
        // Block the Enter key - don't insert new line
        setHasError(true);
        onValidationChange?.(false, validation.error);
        return;
      }
      
      // No errors - allow normal Enter behavior
      setHasError(false);
      editor.trigger('keyboard', 'type', { text: '\n' });
    });
  }, [onValidationChange]);

  const handleEditorChange: OnChange = useCallback(
    (newValue) => {
      const val = newValue || "";
      onChange(val);

      // Real-time syntax validation
      const validation = validateSyntax(val);
      
      if (!validation.isValid) {
        setHasError(true);
        onValidationChange?.(false, validation.error);
      } else {
        setHasError(false);
        onValidationChange?.(true);
      }
    },
    [onChange, onValidationChange]
  );

  const getMonacoLanguage = (lang: string) => {
    const mapping: Record<string, string> = {
      python: "python",
      java: "java",
      cpp: "cpp",
    };
    return mapping[lang] || "plaintext";
  };

  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        language={getMonacoLanguage(language)}
        value={value || languageTemplates[language] || ""}
        onChange={handleEditorChange}
        onMount={handleEditorMount}
        theme="vs-dark"
        options={{
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          lineNumbers: "on",
          renderLineHighlight: "all",
          automaticLayout: true,
          padding: { top: 16, bottom: 16 },
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          smoothScrolling: true,
          readOnly,
          wordWrap: "on",
          bracketPairColorization: { enabled: true },
          tabSize: 4,
        }}
      />
    </div>
  );
}

export { languageTemplates };
