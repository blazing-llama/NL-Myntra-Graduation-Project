import type { Persona } from "../types";
import { SimulatedDataLabel } from "./SimulatedDataLabel";

interface Props {
  personas: Persona[];
  activeId: string;
  onChange: (id: string) => void;
}

export function PersonaSwitcher({ personas, activeId, onChange }: Props) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        padding: "var(--space-sm) var(--space-md)",
        background: "var(--color-thread-plum-dark)",
        borderRadius: "var(--radius-xl)",
        color: "white",
      }}
    >
      <SimulatedDataLabel />
      <select
        value={activeId}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Demo persona"
        style={{
          minHeight: "var(--tap-target-min)",
          borderRadius: "var(--radius-sm)",
          border: "none",
          padding: "0 10px",
          fontSize: 14,
          background: "white",
          color: "var(--color-ink)",
        }}
      >
        {personas.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      <span style={{ fontSize: 12, opacity: 0.85 }}>
        {personas.find((p) => p.id === activeId)?.description}
      </span>
    </div>
  );
}
