"use client";

import { useRef, useState, useCallback } from "react";

type CodeEditorProps = {
  value: string;
  onChange: (val: string) => void;
  language: string;
  placeholder?: string;
  readOnly?: boolean;
};

export default function CodeEditor({
  value,
  onChange,
  language,
  placeholder = "",
  readOnly = false,
}: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const linesRef = useRef<HTMLDivElement>(null);

  const lines = value ? value.split("\n") : [""];
  const lineCount = Math.max(lines.length, 12);

  const syncScroll = useCallback(() => {
    if (textareaRef.current && linesRef.current) {
      linesRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = textareaRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newVal = value.substring(0, start) + "  " + value.substring(end);
      onChange(newVal);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 2;
      });
    }
  };

  return (
    <div className="editor-wrap">
      <div className="editor-toolbar">
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span className="editor-dot editor-dot-red" />
          <span className="editor-dot editor-dot-yellow" />
          <span className="editor-dot editor-dot-green" />
        </div>
        <div className="editor-tab">{language}</div>
      </div>
      <div className="editor-body">
        <div className="editor-lines" ref={linesRef}>
          {Array.from({ length: lineCount }, (_, i) => (
            <span key={i} className="editor-line-num">
              {i + 1}
            </span>
          ))}
        </div>
        {readOnly ? (
          <div className="editor-readonly">{value}</div>
        ) : (
          <textarea
            ref={textareaRef}
            className="editor-textarea"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onScroll={syncScroll}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
          />
        )}
      </div>
    </div>
  );
}
