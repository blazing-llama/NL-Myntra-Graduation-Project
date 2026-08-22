// Vercel serverless function stub — the future LLM explanation layer proxy.
// Requirement #11: no client-side API keys, ever. GROQ_API_KEY lives only
// here (a Vercel env var), never in the bundled frontend.
//
// Not wired to the frontend yet — the skeleton's NarrationBlock currently
// renders static placeholder text. This exists so the deployed skeleton
// already has the correct shape (server-side-only key access) before the
// real barrier/prompt is chosen in Phase 5.

export const config = { runtime: "edge" };

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), { status: 405 });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "server_misconfigured: GROQ_API_KEY not set" }), {
      status: 500,
    });
  }

  // TODO(Phase 6, post-barrier-selection): wire the real narration prompt and
  // Groq call here, deterministic-core output only ever narrated, never decided.
  return new Response(
    JSON.stringify({ error: "not_implemented", note: "narration prompt not yet written — see Phase 5 gate" }),
    { status: 501 },
  );
}
