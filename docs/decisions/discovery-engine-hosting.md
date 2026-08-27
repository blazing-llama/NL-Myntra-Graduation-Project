# Decision: Discovery-Engine Public Hosting

**Date:** 2026-08-26, confirmed working 2026-08-27
**Context:** the brief's "never cut" list (`wishlist-conversion-blueprint-v2.md` Part I) requires a publicly testable discovery-engine link. `workflows/discovery-engine-webhook.json` was live-tested (`docs/FAILURES.md`, 2026-08-22) only against a local, self-hosted n8n instance — no public URL existed as of 2026-08-26.

## ✅ CONFIRMED WORKING — n8n Cloud (option B), not the tunnel fallback

**Public webhook URL: `https://zeusworkspace1.app.n8n.cloud/webhook/wishlist-discovery-engine`**

Zero-cost, no self-hosting required. The workflow's portable, credential-based Groq auth (`httpHeaderAuth`, not a raw env-var expression — see `docs/FAILURES.md` 2026-08-22 entries) imported cleanly into the fresh n8n Cloud instance without code changes; the API key value was re-entered directly in the Cloud credential UI (credentials are encrypted per-instance and never travel in the JSON file, same as the original local setup).

**Verified 2026-08-27, independently, by direct POST against the production URL — not just import success:**

| Test | Input | Result |
|---|---|---|
| Real classification | `{"text": "I saved these jeans but I am waiting for the price to drop before I buy them"}` | `200`, `{"status":"ok","result":{...,"is_relevant":true,"primary_barrier":"price_certainty","confidence_score":0.95}}` |
| Not-relevant classification | `{"text": "Delivery was late and the packaging was damaged"}` | `200`, `{"status":"ok","result":{...,"is_relevant":false,"primary_barrier":"not_relevant"}}` |
| Missing-text error path | `{}` | `400`, `{"status":"error","error":"text field is required in the POST body, e.g. {\"text\": \"...\"}"}` |

Same three cases as the original local verification (`docs/FAILURES.md`, 2026-08-22). This is the link that goes in the deck and README as the testable AI discovery engine — see `README.md`'s Live Links section.

**Account creation was the user's own action** (n8n Cloud signup can't be performed on the assistant's behalf); import, credential wiring, activation, and the URL derivation/verification above were done jointly with the assistant.

## Fallback (not needed — kept on record): expose the existing local instance via a tunnel

**Not run.** The n8n Cloud option above worked on the first attempt, so this was never needed. Left here, unexecuted, in case the Cloud deployment ever needs to be replaced before submission.

Both options below are genuinely free, require no payment card, and work against the *exact same* local n8n setup already verified working in `docs/FAILURES.md` (2026-08-22) — nothing about the workflow changes, only how it's reached from outside.

### Option 1 — Cloudflare Tunnel (no account required for a quick/anonymous tunnel)

```bash
# one-time install (Windows, via winget) — or download the binary directly from
# https://github.com/cloudflare/cloudflared/releases
winget install --id Cloudflare.cloudflared

# with n8n already running locally on its default port:
cloudflared tunnel --url http://localhost:5678
```

`cloudflared` prints a random `https://<random-name>.trycloudflare.com` URL that proxies straight to the local n8n instance. No Cloudflare account needed for this quick-tunnel mode. The webhook would then be reachable at:

```
https://<random-name>.trycloudflare.com/webhook/wishlist-discovery-engine
```

**Caveat:** the tunnel and n8n both need to keep running on the machine that started them — the URL goes dead the moment either process stops, and a fresh run of `cloudflared tunnel --url ...` generates a *new* random URL each time (no stable domain without a free Cloudflare account + owned domain attached).

### Option 2 — ngrok (free tier, account required but no card)

```bash
# one-time: create a free ngrok account (no card) at ngrok.com, then:
ngrok config add-authtoken <your-free-authtoken>

# with n8n already running locally on its default port:
ngrok http 5678
```

ngrok prints a public `https://<random-id>.ngrok-free.app` URL forwarding to local n8n. Same webhook path convention:

```
https://<random-id>.ngrok-free.app/webhook/wishlist-discovery-engine
```

**Caveat:** same liveness requirement as Cloudflare's quick tunnel (machine + process must stay running); free-tier ngrok URLs also rotate on restart unless a static domain is claimed on the free plan (worth checking current ngrok terms at fallback time, since free-tier limits change).

## Verifying either fallback

Once a tunnel is up, from any machine:

```bash
curl -X POST https://<tunnel-url>/webhook/wishlist-discovery-engine \
  -H "Content-Type: application/json" \
  -d '{"text": "I saved these jeans but I am waiting for the price to drop before I buy them"}'
```

Expect `{"status": "ok", "result": {...}}` with `is_relevant: true` and a `primary_barrier` field — the same response shape verified in the original local test (`docs/FAILURES.md`, 2026-08-22).

## Not chosen: paid hosting (Railway, Render paid tier) or Oracle Cloud Always Free

Railway no longer has a genuinely free tier (requires a card, ~$5/mo minimum) — ruled out per explicit "don't want to pay anywhere" instruction. Oracle Cloud's Always Free VM is free forever but typically requires card entry at signup for identity verification and carries real provisioning-flakiness risk (capacity errors, slow verification) that isn't worth spending days of a 9-day budget on when a free trial or a tunnel already solves this at zero cost and near-zero setup time.
