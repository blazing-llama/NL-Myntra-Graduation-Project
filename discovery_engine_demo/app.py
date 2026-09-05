"""Discovery Engine — Live Test

A thin, single-page UI over the live discovery-engine webhook
(docs/decisions/discovery-engine-hosting.md). This does not call any
model itself — it POSTs to the same public n8n webhook the rest of the
project uses, and shows the real response. No canned/mocked output.
"""

import pandas as pd
import requests
import streamlit as st

WEBHOOK_URL = "https://zeusworkspace1.app.n8n.cloud/webhook/wishlist-discovery-engine"

# All figures below are pulled directly from frozen source files, not
# estimated: data/processed/relevance_summary.json (2,203 = sum of the
# 5 sources' "total"), docs/experiment_manifest.md EXP-005/EXP-006
# (gold set n, inter-labeler agreement, E1 accuracy, category counts).
CORPUS_STATS = {
    "reviews_classified": 2203,
    "gold_set_n": 137,
    "inter_labeler_agreement": 0.894,
    "e1_accuracy": 0.875,
}

BARRIER_COUNTS = [
    ("Price certainty", 11),
    ("Quality / trust", 7),
    ("Fit / size", 6),
    ("Availability decay", 5),
    ("Occasion / styling", 0),
    ("Timing / forgetting", 0),
    ("Bookmark, not intent", 0),
]

# Survey, n=32 (docs/research-findings.md Part 1) -- exact figures already
# computed there, not re-estimated here.
REASON_NOT_BOUGHT = [
    ("Price uncertainty", 9),
    ("Quality doubt", 7),
    ("Fit doubt", 6),
    ("Occasion fit", 4),
    ("Forgot", 3),
    ("Other", 3),
]
SIZE_TRUST = [
    ("Trust, but verify", 19),
    ("Somewhat trust", 7),
    ("Would not trust", 4),
    ("Fully trust", 2),
]
AVAILABILITY_DECAY_RATE = "32/32 (100%)"

# WCAG-checked pairing for the two darker locked-palette colors, since white
# text fails AA contrast on both (computed: white/Ochre = 3.39:1, white/Clay
# Rose = 3.2:1 -- both below the 4.5:1 text minimum). Ink text on those two
# instead clears it (4.93:1 and 5.22:1). Plum and Moss keep white text
# (9.77:1 and 5.97:1) -- this is a fixed lookup, not a per-render guess.
BADGE_TEXT_ON = {"#5B3A4A": "#FFFFFF", "#4B6B4F": "#FFFFFF", "#B5822A": "#211D1B", "#C97B72": "#211D1B"}

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

# Verbatim quotes and their "what this means" gloss, both taken directly
# from docs/research-findings.md Part 2 (interview confirm/contradict
# matrix) — no new interpretation added here, only reproduced.
INTERVIEW_QUOTES = [
    {
        "quote": "If it was 1,200 I probably would've bought it then and there.",
        "who": "Person 1 — saved jeans, waiting for a sale price",
        "category": "price_certainty",
        "meaning": "Wanted price history, not just a current price — corpus-blind, and the single largest survey reason-not-bought (9/32).",
        "color": "#5B3A4A",
    },
    {
        "quote": "Actual height and weight and what size they bought.",
        "who": "Person 2 — saved a relaxed-fit shirt, unsure between M/L",
        "category": "fit_size",
        "meaning": "Explicitly avoided buy-two-sizes-and-return due to return hassle — corpus-blind; fit doubt is the 3rd-largest reason not bought (6/32).",
        "color": "#4B6B4F",
    },
    {
        "quote": "Didn't want to “gamble” on fabric/quality sight-unseen.",
        "who": "Person 4 — saved a jacket",
        "category": "quality_trust",
        "meaning": "Wanted a synthesized quality summary rather than reading 200 reviews — the one category where interview and corpus evidence directly triangulate.",
        "color": "#B5822A",
    },
    {
        "quote": "More like a moodboard than a shopping list.",
        "who": "Person 3 — on her wishlist in general",
        "category": "bookmark_not_intent",
        "meaning": "The only unambiguous case of a save with no purchase path — the other five interviewees describe deferred-but-real intent blocked by a specific barrier.",
        "color": "#C97B72",
    },
    {
        "quote": "It reminds me that I wanted the thing in the first place.",
        "who": "Person 6 — on price-drop notifications",
        "category": "timing_forgetting",
        "meaning": "A price-drop alert doing double duty as a reminder, not just a price signal.",
        "color": "#5B3A4A",
    },
    {
        "quote": "Not really the ones I care about… sometimes I'm deliberately waiting.",
        "who": "Person 4 — rejecting the “forgot” framing for himself",
        "category": "timing_forgetting",
        "meaning": "Distinguishes genuine forgetting from deliberate deferral — a real pattern, but a minority one (survey's lowest-ranked reason-not-bought, 3/32).",
        "color": "#4B6B4F",
    },
]

# Mirrors deck slide 9 exactly (docs/deck-build/build.js) — metric
# definitions and rationale only. No numbers: none of these are
# currently instrumented/measured anywhere in this repo, so showing a
# number here would imply live tracking that doesn't exist.
METRIC_TIERS = [
    ("NORTH STAR", "Wishlist-to-Purchase, Within 30 Days",
     "The business metric this whole project decomposes and targets. Unchanged.", "#5B3A4A"),
    ("MVP LEADING INDICATORS", "Trace-widget open rate · Trace-to-cart conversion",
     "Does the reasoning get read — and does resolving uncertainty actually lead to action?", "#B5822A"),
    ("GUARDRAIL", "False-urgency rate",
     "“What if I wait” shown where stock/price didn't actually change afterward. Designed in from day one, not added for this slide.", "#4B6B4F"),
]

st.set_page_config(page_title="Discovery Engine — Live Test", layout="centered")

st.title("Wishlist Discovery Engine")
st.caption(
    "Paste a real review or comment about a wishlisted fashion item. This sends it to the "
    "live classification webhook behind this project's research pipeline and shows the "
    "real response — not a canned demo."
)

with st.container(border=True):
    st.markdown("**Corpus at a glance**")
    st.caption(
        "From this project's own research pipeline — not simulated or live-tracked. "
        "See `docs/experiment_manifest.md` (EXP-005, EXP-006) and "
        "`data/processed/relevance_summary.json`."
    )
    m1, m2, m3 = st.columns(3)
    m1.metric("Reviews classified", f"{CORPUS_STATS['reviews_classified']:,}")
    m2.metric(
        "Gold set",
        f"n={CORPUS_STATS['gold_set_n']}",
        help=f"{CORPUS_STATS['inter_labeler_agreement']:.1%} inter-labeler agreement",
    )
    m3.metric("Classifier accuracy (E1)", f"{CORPUS_STATS['e1_accuracy']:.1%}")

    st.caption("Barrier category counts in the gold set")
    barrier_df = pd.DataFrame(BARRIER_COUNTS, columns=["Barrier", "Count"]).set_index("Barrier")
    st.bar_chart(barrier_df, horizontal=True, color="#5B3A4A")

st.divider()

with st.container(border=True):
    st.markdown("**Survey at a glance**")
    st.caption(
        "n=32 Google Form responses — `docs/research-findings.md` Part 1. "
        "Same figures already computed there, not re-estimated here."
    )
    st.metric("Have had a saved item go out of stock before deciding", AVAILABILITY_DECAY_RATE)

    sc1, sc2 = st.columns(2)
    with sc1:
        st.caption("Biggest reason not bought")
        reason_df = pd.DataFrame(REASON_NOT_BOUGHT, columns=["Reason", "Count"]).set_index("Reason")
        st.bar_chart(reason_df, horizontal=True, color="#B5822A")
    with sc2:
        st.caption("Size-prediction trust")
        trust_df = pd.DataFrame(SIZE_TRUST, columns=["Response", "Count"]).set_index("Response")
        st.bar_chart(trust_df, horizontal=True, color="#4B6B4F")

st.divider()

st.markdown("**What people actually said**")
st.caption(
    "Verbatim quotes from the 6 project interviews, reproduced as-is from "
    "`docs/research-findings.md` Part 2 — annotations below each quote are also "
    "taken directly from that file, not written fresh here."
)
quote_cols = st.columns(2)
for i, item in enumerate(INTERVIEW_QUOTES):
    with quote_cols[i % 2]:
        # Legibility fix: the previous version dimmed the attribution line
        # with CSS opacity, which shrinks contrast unpredictably depending
        # on the viewer's light/dark theme (verified: it's the underlying
        # text color that must stay full-strength, not the border accent).
        # Font-size/weight now carries the visual hierarchy instead of
        # opacity, and the border accent colors are checked separately
        # (BADGE_TEXT_ON) since they only ever sit as a stripe, never text.
        st.markdown(
            f"""
<div style="border-left: 4px solid {item['color']}; border-radius: 6px;
            padding: 12px 14px; margin-bottom: 12px;">
  <div style="font-size: 15px; font-style: italic; margin-bottom: 6px;">“{item['quote']}”</div>
  <div style="font-size: 12px; font-weight: 600; margin-bottom: 6px;">
    {item['who']} · {BARRIER_LABELS.get(item['category'], item['category'])}
  </div>
  <div style="font-size: 13px;">{item['meaning']}</div>
</div>
""",
            unsafe_allow_html=True,
        )

st.divider()

st.markdown("**Metric framework**")
st.caption(
    "Definitions only, mirroring deck slide 9 — none of these are currently "
    "instrumented in this MVP, so no numbers are shown next to them."
)
for label, name, rationale, color in METRIC_TIERS:
    badge_text = BADGE_TEXT_ON.get(color, "#FFFFFF")
    st.markdown(
        f"""
<div style="border: 1px solid rgba(128,128,128,0.35); border-radius: 8px; padding: 12px 16px; margin-bottom: 10px;">
  <span style="background: {color}; color: {badge_text}; font-size: 11px; font-weight: 700;
               letter-spacing: 0.5px; border-radius: 4px; padding: 2px 8px;">{label}</span>
  <div style="font-size: 17px; font-weight: 600; margin-top: 8px;">{name}</div>
  <div style="font-size: 13px; font-weight: 400; margin-top: 4px;">{rationale}</div>
</div>
""",
        unsafe_allow_html=True,
    )

st.divider()

if "de_text" not in st.session_state:
    st.session_state.de_text = ""

st.caption("These are unedited items from the frozen gold set — pick one to send as-is, or write your own below.")
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
