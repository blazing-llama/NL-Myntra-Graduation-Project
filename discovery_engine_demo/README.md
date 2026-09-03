# Discovery Engine — Live Test

A minimal Streamlit page so the discovery engine can be tested without hand-crafting a `curl` request. Calls the same live public webhook documented in [`docs/decisions/discovery-engine-hosting.md`](../docs/decisions/discovery-engine-hosting.md):

```
https://zeusworkspace1.app.n8n.cloud/webhook/wishlist-discovery-engine
```

No model runs locally or in this app — it's a thin UI over that one live endpoint.

## Run locally

```bash
cd discovery_engine_demo
pip install -r requirements.txt
streamlit run app.py
```

## Deploy (Streamlit Community Cloud)

1. Go to [share.streamlit.io](https://share.streamlit.io) and sign in with GitHub (this is an account-linking step only the repo owner can do).
2. **New app** → pick this repo → branch `main` → main file path `discovery_engine_demo/app.py`.
3. Deploy. No secrets or environment variables needed — the webhook URL is public and hardcoded in `app.py`.
