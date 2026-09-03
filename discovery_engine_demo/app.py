"""Discovery Engine — Live Test

A thin, single-page UI over the live discovery-engine webhook
(docs/decisions/discovery-engine-hosting.md). This does not call any
model itself — it POSTs to the same public n8n webhook the rest of the
project uses, and shows the real response. No canned/mocked output.
"""

import requests
import streamlit as st

WEBHOOK_URL = "https://zeusworkspace1.app.n8n.cloud/webhook/wishlist-discovery-engine"

# Real gold-set examples (evals/gold_set/gold_set_final_frozen.jsonl),
# one per barrier category with corpus coverage — not invented text.
EXAMPLES = [
    ("Availability", "sizes r not available for many liked products"),
    ("Price", "no additional discount given as promised"),
    ("Fit", "This product is too good but please buy one size above than recommended."),
]

BARRIER_LABELS = {
    "fit_size": "Fit / size",
    "price_certainty": "Price certainty",
    "occasion_styling": "Occasion / styling",
    "quality_trust": "Quality / trust",
    "availability_decay": "Availability decay",
    "timing_forgetting": "Timing / forgetting",
    "bookmark_not_intent": "Bookmark, not intent",
    "other": "Other (uncertain)",
    "not_relevant": "Not relevant",
}

st.set_page_config(page_title="Discovery Engine — Live Test", layout="centered")

st.title("Wishlist Discovery Engine")
st.caption(
    "Paste a real review or comment about a wishlisted fashion item. This sends it to the "
    "live classification webhook behind this project's research pipeline and shows the "
    "real response — not a canned demo."
)

if "de_text" not in st.session_state:
    st.session_state.de_text = ""

st.write("**Try a real example from the gold set:**")
cols = st.columns(len(EXAMPLES))
for col, (label, example_text) in zip(cols, EXAMPLES):
    if col.button(label, use_container_width=True):
        st.session_state.de_text = example_text

st.text_area(
    "Review or comment text",
    key="de_text",
    height=110,
    placeholder='e.g. "waiting for the price to drop before I buy"',
)

submitted = st.button("Classify", type="primary")

if submitted:
    text = st.session_state.de_text.strip()
    if not text:
        st.warning("Enter some text first, or pick an example above.")
    else:
        data = None
        try:
            with st.spinner("Calling the live discovery engine..."):
                resp = requests.post(WEBHOOK_URL, json={"text": text}, timeout=25)
            data = resp.json()
        except requests.exceptions.Timeout:
            st.error("The webhook didn't respond in time. It's a live free-tier n8n instance — try again in a moment.")
        except requests.exceptions.RequestException as e:
            st.error(f"Couldn't reach the webhook: {e}")
        except ValueError:
            st.error(f"Webhook returned a non-JSON response (HTTP {resp.status_code}).")

        if data is not None:
            if data.get("status") == "ok":
                result = data.get("result", {})
                is_relevant = result.get("is_relevant")
                barrier = result.get("primary_barrier")
                confidence = result.get("confidence_score")

                with st.container(border=True):
                    c1, c2 = st.columns(2)
                    with c1:
                        st.markdown("**Relevant to wishlist hesitation**")
                        st.markdown("Yes" if is_relevant else "No")
                    with c2:
                        st.markdown("**Primary barrier**")
                        st.markdown(BARRIER_LABELS.get(barrier, barrier or "—"))

                    if confidence is not None:
                        # Defensive: the live webhook's underlying model doesn't always
                        # emit confidence_score as a strict JSON number (observed a
                        # numeric-string response during testing) — coerce rather than
                        # trust the schema blindly, and skip the bar rather than crash
                        # the whole page if it's still unusable.
                        try:
                            confidence_val = min(max(float(confidence), 0.0), 1.0)
                            st.markdown("**Confidence**")
                            st.progress(confidence_val, text=f"{confidence_val:.0%}")
                        except (TypeError, ValueError):
                            st.markdown(f"**Confidence:** {confidence}")

                    segment = result.get("inferred_segment")
                    workaround = result.get("workaround_observed")
                    if segment:
                        st.markdown(f"**Inferred segment:** {segment}")
                    if workaround:
                        st.markdown(f"**Workaround observed:** {workaround}")
            else:
                st.error(data.get("error", "The webhook returned an error with no message."))

st.divider()
st.caption(
    "This calls the exact same public webhook documented in "
    "`docs/decisions/discovery-engine-hosting.md` — a real classification call each time, "
    "not a mocked response. Exactly 3 fixed fields (relevance, barrier, confidence) plus two "
    "optional ones the model may leave blank — nothing here is a chatbot or a free-text agent."
)
