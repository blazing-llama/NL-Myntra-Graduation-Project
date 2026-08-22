import type { ConfidenceLevel } from "../types";

// Requirement #6: the deterministic core decides (ComparisonStrip renders its
// output directly); this component only narrates — and even the narration
// text here is still a placeholder string, not a live LLM call. See
// mvp/api/narrate.ts for where the real serverless proxy call goes.

interface Props {
  level: ConfidenceLevel;
  narration: string;
  missingForHigherConfidence?: string;
  whatWouldHelp?: string;
}

export function NarrationBlock({ level, narration, missingForHigherConfidence, whatWouldHelp }: Props) {
  if (level === "insufficient") {
    return (
      <div style={{ fontFamily: "var(--font-body)", fontSize: 14, lineHeight: 1.5 }}>
        <p style={{ margin: 0 }}>
          We can&apos;t confidently answer this yet — {whatWouldHelp ?? "not enough past purchases to compare."}
        </p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "var(--font-body)", fontSize: 14, lineHeight: 1.5 }}>
      <p style={{ margin: 0 }}>{narration}</p>
      {level === "medium" && missingForHigherConfidence && (
        <p style={{ margin: "6px 0 0", opacity: 0.7, fontSize: 13 }}>
          What&apos;s missing: {missingForHigherConfidence}
        </p>
      )}
    </div>
  );
}
