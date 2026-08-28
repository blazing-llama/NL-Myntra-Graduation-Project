import { supabase } from "./supabaseClient";

export type EventType = "add_to_cart" | "buy_now" | "trace_expand" | "badge_tap";

// Fire-and-forget telemetry. Never throws, never blocks the UI, never
// surfaces an error to the user -- a failed/missing event log must not
// degrade the actual product experience.
export function logEvent(itemId: string, eventType: EventType, personaId: string): void {
  if (!supabase) return; // no Supabase project configured yet

  supabase
    .from("event_log")
    .insert({ item_id: itemId, event_type: eventType, persona_id: personaId })
    .then(({ error }) => {
      if (error) console.warn("logEvent failed:", error.message);
    });
}
