import { useState } from "react";
import Editor from "@monaco-editor/react";

const defaultValue = `function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet("ToggleCorp"));`;

function MonacoEditor({ value = defaultValue, language = "javascript", onChange }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard?.writeText(value ?? "");
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard unavailable — no-op */
    }
  };

  return (
    <div className="monaco-editor-shell">
      <div className="monaco-editor-header editor-drag-handle">
        <span className="window-dots">
          <i style={{ background: "#ff5f57" }} />
          <i style={{ background: "#febc2e" }} />
          <i style={{ background: "#28c840" }} />
        </span>
        <span className="monaco-editor-title">index.js</span>
        <span className="monaco-editor-language">{language}</span>
        <button type="button" className="monaco-copy nodrag" onClick={copy} aria-label="Copy code">
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="nodrag nowheel">
        <Editor
          height="260px"
          language={language}
          theme="vs-dark"
          value={value}
          onChange={(nextValue) => onChange?.(nextValue ?? "")}
          options={{
            automaticLayout: true,
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily: "'JetBrains Mono', ui-monospace, Consolas, monospace",
            lineNumbers: "on",
            padding: { top: 14, bottom: 14 },
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: "smooth",
            roundedSelection: true,
            wordWrap: "on",
          }}
        />
      </div>
    </div>
  );
}

export default MonacoEditor;
