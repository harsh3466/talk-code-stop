import { useRef, useCallback } from "react";
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

export function CodeEditor({
  language,
  value,
  onChange,
  onValidationChange,
  readOnly = false,
}: CodeEditorProps) {
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const monacoRef = useRef<Monaco | null>(null);

  const handleEditorMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    editor.focus();

    // Code Stopper: Intercept Enter key to block new lines when there are syntax errors
    editor.addCommand(monaco.KeyCode.Enter, () => {
      const model = editor.getModel();
      if (model) {
        const markers = monaco.editor.getModelMarkers({ resource: model.uri });
        const errors = markers.filter((m) => m.severity >= 8); // Error severity
        
        if (errors.length > 0) {
          // Block the Enter key - don't insert new line
          // Optionally trigger validation feedback
          onValidationChange?.(false, `Line ${errors[0].startLineNumber}: ${errors[0].message}`);
          return;
        }
      }
      // No errors - allow normal Enter behavior
      editor.trigger('keyboard', 'type', { text: '\n' });
    });
  }, [onValidationChange]);

  const handleEditorChange: OnChange = useCallback(
    (newValue) => {
      const val = newValue || "";
      onChange(val);

      // Real-time syntax validation
      if (editorRef.current && monacoRef.current) {
        const model = editorRef.current.getModel();
        if (model) {
          // Monaco provides markers for syntax errors
          setTimeout(() => {
            const markers = monacoRef.current?.editor.getModelMarkers({ resource: model.uri }) || [];
            const errors = markers.filter((m) => m.severity >= 8); // Error severity
            
            if (errors.length > 0) {
              const firstError = errors[0];
              onValidationChange?.(false, `Line ${firstError.startLineNumber}: ${firstError.message}`);
            } else {
              onValidationChange?.(true);
            }
          }, 300);
        }
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
