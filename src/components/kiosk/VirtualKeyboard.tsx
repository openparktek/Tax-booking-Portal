import { useState, useCallback } from "react";

interface VirtualKeyboardProps {
  onInput: (value: string) => void;
  value: string;
  onDone?: () => void;
  visible: boolean;
}

const ROWS_LOWER = [
  ["1","2","3","4","5","6","7","8","9","0"],
  ["q","w","e","r","t","y","u","i","o","p"],
  ["a","s","d","f","g","h","j","k","l"],
  ["z","x","c","v","b","n","m"],
];
const ROWS_UPPER = ROWS_LOWER.map(row => row.map(k => k.toUpperCase()));
const SPECIAL_CHARS = ["@",".","-","_","'","(",")","/",":","!","?","&","#","%","+","="];

export default function VirtualKeyboard({ onInput, value, onDone, visible }: VirtualKeyboardProps) {
  const [caps, setCaps] = useState(false);
  const [showSpecial, setShowSpecial] = useState(false);

  const press = useCallback((key: string) => { onInput(value + key); }, [value, onInput]);
  const backspace = useCallback(() => { onInput(value.slice(0, -1)); }, [value, onInput]);
  const space = useCallback(() => { onInput(value + " "); }, [value, onInput]);

  if (!visible) return null;

  const rows = caps ? ROWS_UPPER : ROWS_LOWER;

  const pd = (fn: () => void) => (e: React.PointerEvent) => { e.preventDefault(); e.stopPropagation(); fn(); };

  // All styles inline to avoid Tailwind purge/JIT issues
  const container: React.CSSProperties = {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    background: "rgba(17,24,39,0.97)",
    backdropFilter: "blur(8px)",
    padding: "12px 12px 20px",
    boxShadow: "0 -8px 40px rgba(0,0,0,0.6)",
    userSelect: "none",
  };

  const rowStyle: React.CSSProperties = {
    display: "flex",
    gap: "6px",
    marginBottom: "6px",
    justifyContent: "center",
  };

  const keyStyle = (active = false, color: "white"|"dark"|"blue"|"green" = "white"): React.CSSProperties => {
    const backgrounds: Record<string, string> = {
      white: active ? "#e5e7eb" : "#ffffff",
      dark:  active ? "#374151" : "#4b5563",
      blue:  active ? "#2563eb" : "#3b82f6",
      green: active ? "#15803d" : "#16a34a",
    };
    const textColors: Record<string, string> = {
      white: "#111827",
      dark:  "#ffffff",
      blue:  "#ffffff",
      green: "#ffffff",
    };
    return {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "52px",
      minWidth: "36px",
      borderRadius: "10px",
      border: "none",
      background: backgrounds[color],
      color: textColors[color],
      fontSize: "18px",
      fontWeight: "600",
      cursor: "pointer",
      touchAction: "manipulation",
      WebkitTapHighlightColor: "transparent",
      transition: "transform 0.08s, background 0.08s",
      flexShrink: 0,
    };
  };

  const letterKeyStyle: React.CSSProperties = {
    ...keyStyle(),
    width: "calc(9.5vw)",
    maxWidth: "56px",
    fontSize: "20px",
  };

  const numKeyStyle: React.CSSProperties = {
    ...keyStyle(),
    width: "calc(9vw)",
    maxWidth: "50px",
  };

  const wideKeyStyle = (color: "white"|"dark"|"blue"|"green" = "dark"): React.CSSProperties => ({
    ...keyStyle(false, color),
    padding: "0 20px",
    fontSize: "15px",
    fontWeight: "700",
  });

  return (
    <div style={container} onPointerDown={(e) => e.preventDefault()}>

      {/* Number row */}
      <div style={rowStyle}>
        {rows[0].map(k => (
          <button key={k} style={numKeyStyle} onPointerDown={pd(() => press(k))}>{k}</button>
        ))}
        <button style={{...keyStyle(false,"dark"), padding:"0 14px", fontSize:"14px"}} onPointerDown={pd(backspace)}>⌫</button>
      </div>

      {/* Letter rows */}
      {!showSpecial && rows.slice(1).map((row, ri) => (
        <div key={ri} style={rowStyle}>
          {row.map(k => (
            <button key={k} style={letterKeyStyle} onPointerDown={pd(() => press(k))}>{k}</button>
          ))}
        </div>
      ))}

      {/* Special chars */}
      {showSpecial && (
        <div style={{...rowStyle, flexWrap:"wrap", padding:"4px 8px"}}>
          {SPECIAL_CHARS.map(k => (
            <button key={k} style={{...letterKeyStyle, width:"52px", maxWidth:"52px", fontSize:"22px"}} onPointerDown={pd(() => press(k))}>{k}</button>
          ))}
        </div>
      )}

      {/* Action row */}
      <div style={{...rowStyle, marginBottom:0}}>
        <button style={wideKeyStyle(caps ? "blue" : "dark")} onPointerDown={pd(() => setCaps(c => !c))}>
          ⇧ {caps ? "ABC" : "abc"}
        </button>

        <button style={wideKeyStyle(showSpecial ? "blue" : "dark")} onPointerDown={pd(() => setShowSpecial(s => !s))}>
          !@#
        </button>

        <button
          style={{...keyStyle(false,"white"), flex:1, maxWidth:"320px", fontSize:"14px", color:"#9ca3af", letterSpacing:"0.15em"}}
          onPointerDown={pd(space)}
        >
          SPACE
        </button>

        <button style={{...keyStyle(false,"dark"), padding:"0 14px", fontSize:"14px"}} onPointerDown={pd(backspace)}>⌫</button>

        <button style={{...wideKeyStyle("green"), fontSize:"16px", fontWeight:"800"}} onPointerDown={pd(() => onDone?.())}>
          ✓ Done
        </button>
      </div>
    </div>
  );
}
