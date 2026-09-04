// Source of truth for docs/deck/NL Myntra.pptx + .pdf. Run: node build.js
// (pdf export handled by convert_to_pdf.js via LibreOffice headless -- see README.md)
//
// Full rebuild (2026-09-05): restructured to match the brief's exact
// required section list -- business metric decomposition, discovery engine
// findings + how to use it, primary research, problem definition, solution
// rationale, MVP, success metrics, risks & mitigation -- within the same
// 10-slide cap, same engine/palette/type system as every prior round.
// Nothing here is new data: every number, quote, and claim traces to a file
// already in this repo (see the comment above each slide for its source).

const pptxgen = require("pptxgenjs");
const path = require("path");

const BONE = "F6F1EA";
const INK = "211D1B";
const PLUM = "5B3A4A";
const OCHRE = "B5822A";
const MOSS = "4B6B4F";
const CLAY = "C97B72";
const WHITE = "FFFFFF";

const TITLE_FONT = "Cambria";
const BODY_FONT = "Calibri";

const ASSETS = path.join(__dirname, "..", "deck-assets");

const REPO_URL = "https://github.com/blazing-llama/NL-Myntra-Graduation-Project";
const SURVEY_URL = "https://docs.google.com/forms/d/e/1FAIpQLScsU5OcvTbEetugF0pG-ek2eo_8VEz1DLEjX0gMDsydgOHizA/viewform";
const MVP_URL = "https://mvp-henna-delta.vercel.app";
const N8N_URL = "https://zeusworkspace1.app.n8n.cloud/webhook/wishlist-discovery-engine";
const STREAMLIT_URL = "https://nl-myntra-graduation-project-naspi2s3gtajwsv79uwe8w.streamlit.app/";

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";

const W = 13.333, H = 7.5;

function footer(slide, dark) {
  slide.addText("Wishlist → Purchase Conversion  |  NL Myntra", {
    x: 0.5, y: H - 0.4, w: 6, h: 0.3, fontFace: BODY_FONT, fontSize: 14,
    color: dark ? "9A9088" : "8A8078", isTextBox: true, margin: 0,
  });
}
function pageNum(slide, n, dark) {
  slide.addText(String(n), {
    x: W - 0.9, y: H - 0.4, w: 0.4, h: 0.3, fontFace: BODY_FONT, fontSize: 14,
    color: dark ? "9A9088" : "8A8078", align: "right", isTextBox: true, margin: 0,
  });
}
function titleBlock(slide, title, opts = {}) {
  const dark = !!opts.dark;
  slide.addText(title, {
    x: 0.7, y: 0.5, w: W - 1.4, h: opts.h || 1.15,
    fontFace: TITLE_FONT, bold: true, fontSize: opts.size || 28,
    color: dark ? BONE : INK, isTextBox: true, margin: 0, lineSpacingMultiple: 1.02,
  });
}
function cornerBadge(slide, x, y, n, color) {
  slide.addShape(pres.ShapeType.ellipse, { x, y, w: 0.32, h: 0.32, fill: { color }, line: { type: "none" } });
  slide.addText(String(n), {
    x, y, w: 0.32, h: 0.32, fontFace: BODY_FONT, bold: true, fontSize: 14,
    color: WHITE, align: "center", valign: "middle", isTextBox: true, margin: 0,
  });
}
function inlineLink(slide, { x, y, w, label, labelColor, url, displayText, textColor }) {
  slide.addText(
    [
      { text: label + "   ", options: { bold: true, color: labelColor, fontSize: 14, charSpacing: 0.5 } },
      { text: displayText, options: { color: textColor, fontSize: 14, hyperlink: { url } } },
    ],
    { x, y, w, h: 0.32, fontFace: BODY_FONT, isTextBox: true, margin: 0 },
  );
}

// ============================================================
// SLIDE 1 — Business metric decomposition (+ title)
// Source: README.md §1, docs/blueprints/wishlist-conversion-blueprint-v2.md Part B
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: INK };
  s.addText("MYNTRA · GROWTH · WISHLIST-TO-PURCHASE CONVERSION", {
    x: 0.7, y: 0.5, w: 10, h: 0.35, fontFace: BODY_FONT, fontSize: 14,
    color: CLAY, charSpacing: 2, isTextBox: true, margin: 0,
  });
  s.addText("Wishlist saves rarely become purchases — here's the metric, and how we broke it down", {
    x: 0.7, y: 0.92, w: 11.9, h: 1.3, fontFace: TITLE_FONT, bold: true, fontSize: 30,
    color: BONE, isTextBox: true, margin: 0, lineSpacingMultiple: 1.05,
  });
  s.addText("Business metric: % of users who purchase at least one wishlisted item within 30 days of adding it.", {
    x: 0.7, y: 2.15, w: 11.9, h: 0.4, fontFace: BODY_FONT, fontSize: 15,
    color: "D9CFC4", isTextBox: true, margin: 0,
  });

  const factors = ["Intent", "Availability", "Re-encounter", "Resolution", "Checkout"];
  const boxW = 2.05, gap = 0.2, startX = 0.7, y = 2.95, boxH = 1.1;
  factors.forEach((f, i) => {
    const x = startX + i * (boxW + gap);
    s.addShape(pres.ShapeType.roundRect, {
      x, y, w: boxW, h: boxH, rectRadius: 0.08,
      fill: { color: i % 2 === 0 ? PLUM : "6E4A5B" }, line: { color: "6E4A5B", width: 0.5 },
    });
    s.addText(f, {
      x: x + 0.08, y, w: boxW - 0.16, h: boxH, fontFace: BODY_FONT, bold: true, fontSize: 14,
      color: BONE, align: "center", valign: "middle", isTextBox: true, margin: 0,
    });
    if (i < factors.length - 1) {
      s.addText("→", { x: x + boxW, y, w: gap + 0.02, h: boxH, fontFace: BODY_FONT, fontSize: 16,
        color: OCHRE, align: "center", valign: "middle", isTextBox: true, margin: 0 });
    }
  });

  const pcY = y + boxH + 0.25, pcW = boxW * 5 + gap * 4;
  s.addShape(pres.ShapeType.roundRect, {
    x: startX, y: pcY, w: pcW, h: 0.6, rectRadius: 0.08,
    fill: { color: "6E4A5B" }, line: { color: OCHRE, width: 1 },
  });
  s.addText("+ Price-Certainty — a soft hesitation factor that modulates Resolution, not a hard sequential gate like Availability", {
    x: startX + 0.25, y: pcY, w: pcW - 0.5, h: 0.6, fontFace: BODY_FONT, italic: true, fontSize: 14,
    color: "E9DFD3", align: "center", valign: "middle", isTextBox: true, margin: 0,
  });

  s.addShape(pres.ShapeType.roundRect, { x: 0.7, y: pcY + 0.85, w: 11.9, h: 1.3, rectRadius: 0.08, fill: { color: "2C2622" }, line: { color: "463D36", width: 1 } });
  s.addText("The no-money constraint (no discounts, no incentives) rules out most price levers directly — pushing the real addressable opportunity toward Intent, Re-encounter, and Resolution. That narrowing is derived from this decomposition, not assumed going in.", {
    x: 1.0, y: pcY + 1.0, w: 11.3, h: 0.5, fontFace: BODY_FONT, fontSize: 14, color: "D9CFC4", isTextBox: true, margin: 0, lineSpacingMultiple: 1.15 });
  s.addText("What follows: AI discovery → primary research → one defined problem → a working MVP, measured against real success metrics.", {
    x: 1.0, y: pcY + 1.55, w: 11.3, h: 0.4, fontFace: BODY_FONT, italic: true, fontSize: 14, color: "9A9088", isTextBox: true, margin: 0 });

  footer(s, true); pageNum(s, 1, true);
}

// ============================================================
// SLIDE 2 — Discovery engine: architecture & findings
// Source: README.md §2/§4, docs/experiment_manifest.md EXP-005/EXP-006,
// docs/codebook.md, data/processed/relevance_summary.json
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: BONE };
  titleBlock(s, "The AI discovery engine — architecture and what it found", { h: 0.85 });

  const steps = ["Scrape", "Clean", "Pre-filter\n(noise cut)", "Gold Set\nn=137", "Coding Agent\n(Groq)", "Findings"];
  const bw = 1.92, g = 0.14, sx = 0.7, sy = 1.55, bh = 1.0;
  steps.forEach((label, i) => {
    const x = sx + i * (bw + g);
    s.addShape(pres.ShapeType.roundRect, {
      x, y: sy, w: bw, h: bh, rectRadius: 0.08,
      fill: { color: WHITE }, line: { color: "E3D9CB", width: 1 },
    });
    s.addShape(pres.ShapeType.ellipse, {
      x: x + bw / 2 - 0.16, y: sy + 0.1, w: 0.32, h: 0.32,
      fill: { color: i === 3 ? OCHRE : PLUM }, line: { type: "none" },
    });
    s.addText(String(i + 1), {
      x: x + bw / 2 - 0.16, y: sy + 0.1, w: 0.32, h: 0.32, fontFace: BODY_FONT, bold: true,
      fontSize: 14, color: BONE, align: "center", valign: "middle", isTextBox: true, margin: 0,
    });
    s.addText(label, {
      x: x + 0.06, y: sy + 0.48, w: bw - 0.12, h: 0.48, fontFace: BODY_FONT, bold: true, fontSize: 14,
      color: INK, align: "center", isTextBox: true, margin: 0, lineSpacingMultiple: 1.0,
    });
    if (i < steps.length - 1) {
      s.addText("→", { x: x + bw, y: sy, w: g + 0.02, h: bh, fontFace: BODY_FONT, fontSize: 15,
        color: OCHRE, align: "center", valign: "middle", isTextBox: true, margin: 0 });
    }
  });
  s.addText("Step 3 (\"pre-filter\") is a small, cheap relevance-only pass that screens 2,203 raw reviews down to what's actually pre-purchase-hesitation signal, before the fuller 9-category classifier ever runs on it — separating real signal from app-review noise (delivery complaints, generic praise) early and cheaply.", {
    x: 0.7, y: sy + bh + 0.1, w: 11.9, h: 0.5, fontFace: BODY_FONT, italic: true, fontSize: 14, color: "6B6259", isTextBox: true, margin: 0, lineSpacingMultiple: 1.1 });

  s.addChart(pres.ChartType.bar, [{
    name: "Gold-set count",
    labels: ["price_certainty", "quality_trust", "fit_size", "availability_decay", "occasion_styling", "timing_forgetting", "bookmark_not_intent"],
    values: [11, 7, 6, 5, 0, 0, 0],
  }], {
    x: 0.7, y: 3.25, w: 6.6, h: 3.35,
    barDir: "bar", chartColors: [PLUM],
    showTitle: true, title: "Barrier categories found (frozen gold set, n=137)", titleFontSize: 14, titleColor: INK,
    showValue: true, dataLabelPosition: "outEnd", dataLabelColor: INK, dataLabelFontSize: 14,
    catAxisLabelColor: "4A433C", catAxisLabelFontSize: 14, valAxisHidden: true,
    valGridLine: { style: "none" }, catGridLine: { style: "none" },
    showLegend: false, plotArea: { fill: { color: BONE } }, chartArea: { fill: { color: BONE } },
  });

  s.addShape(pres.ShapeType.roundRect, { x: 7.55, y: 3.25, w: 5.05, h: 1.0, rectRadius: 0.08, fill: { color: PLUM }, line: { type: "none" } });
  s.addText("2,203 classified · n=137 gold set · 89.4% agreement", { x: 7.75, y: 3.35, w: 4.65, h: 0.8, fontFace: BODY_FONT, bold: true, fontSize: 14, color: BONE, valign: "middle", isTextBox: true, margin: 0, lineSpacingMultiple: 1.15 });

  s.addShape(pres.ShapeType.roundRect, { x: 7.55, y: 4.4, w: 5.05, h: 1.0, rectRadius: 0.08, fill: { color: WHITE }, line: { color: "E3D9CB", width: 1 } });
  s.addText("0.875 accuracy vs. human labels", { x: 7.75, y: 4.5, w: 4.65, h: 0.4, fontFace: BODY_FONT, bold: true, fontSize: 15, color: OCHRE, isTextBox: true, margin: 0 });
  s.addText("κ=0.159 cross-model agreement — a weaker local model, not a codebook problem", { x: 7.75, y: 4.85, w: 4.65, h: 0.5, fontFace: BODY_FONT, fontSize: 14, color: "6B6259", isTextBox: true, margin: 0, lineSpacingMultiple: 1.1 });

  s.addShape(pres.ShapeType.roundRect, { x: 7.55, y: 5.55, w: 5.05, h: 1.05, rectRadius: 0.08, fill: { color: "EFE6D8" }, line: { type: "none" } });
  s.addText("Four categories never appeared in reviews at all — not rare, just the wrong instrument. Primary research picks up where the corpus stops.", {
    x: 7.75, y: 5.65, w: 4.65, h: 0.85, fontFace: BODY_FONT, italic: true, fontSize: 14, color: INK, isTextBox: true, margin: 0, lineSpacingMultiple: 1.12 });

  footer(s, false); pageNum(s, 2, false);
}

// ============================================================
// SLIDE 3 — Discovery engine: how to use it, live
// Source: README.md §2, discovery_engine_demo/app.py, docs/codebook.md v3
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: BONE };
  titleBlock(s, "Try the discovery engine yourself — two live ways in", { h: 0.85 });

  const colW = 5.75, colG = 0.4, colX0 = 0.7, colY = 1.55, colH = 5.1;

  s.addShape(pres.ShapeType.roundRect, { x: colX0, y: colY, w: colW, h: colH, rectRadius: 0.1, fill: { color: WHITE }, line: { color: MOSS, width: 1.25 } });
  s.addText("1 · DIRECT API CALL", { x: colX0 + 0.3, y: colY + 0.22, w: colW - 0.6, h: 0.32, fontFace: BODY_FONT, bold: true, fontSize: 14, color: MOSS, charSpacing: 1, isTextBox: true, margin: 0 });
  s.addText("POST any short review/comment text; get back is_relevant, primary_barrier, confidence, and 2 optional fields — a real classification call, not a demo stub.", {
    x: colX0 + 0.3, y: colY + 0.62, w: colW - 0.6, h: 0.9, fontFace: BODY_FONT, fontSize: 14, color: "3A342E", isTextBox: true, margin: 0, lineSpacingMultiple: 1.15 });
  s.addShape(pres.ShapeType.roundRect, { x: colX0 + 0.3, y: colY + 1.6, w: colW - 0.6, h: 1.3, rectRadius: 0.06, fill: { color: "F0EAE0" }, line: { type: "none" } });
  s.addText('curl -X POST \\\n  $WEBHOOK_URL \\\n  -d \'{"text":"waiting for\n  the price to drop"}\'', {
    x: colX0 + 0.42, y: colY + 1.7, w: colW - 0.84, h: 1.1, fontFace: "Courier New", fontSize: 14, color: INK, isTextBox: true, margin: 0, lineSpacingMultiple: 1.15 });
  inlineLink(s, { x: colX0 + 0.3, y: colY + 3.05, w: colW - 0.6, label: "WEBHOOK", labelColor: MOSS, url: N8N_URL, displayText: "…/wishlist-discovery-engine", textColor: INK });
  s.addText("Adds two categories beyond the original 7 — social_validation and comparison_shopping (v3, docs/codebook.md) — closing a real gap against the brief's own question list. Neither has corpus data yet; reported honestly, not silently implied.", {
    x: colX0 + 0.3, y: colY + 3.55, w: colW - 0.6, h: 1.3, fontFace: BODY_FONT, italic: true, fontSize: 14, color: "6B6259", isTextBox: true, margin: 0, lineSpacingMultiple: 1.15 });

  const col2X = colX0 + colW + colG;
  s.addShape(pres.ShapeType.roundRect, { x: col2X, y: colY, w: colW, h: colH, rectRadius: 0.1, fill: { color: WHITE }, line: { color: OCHRE, width: 1.25 } });
  s.addText("2 · INTERACTIVE DEMO (STREAMLIT)", { x: col2X + 0.3, y: colY + 0.22, w: colW - 0.6, h: 0.32, fontFace: BODY_FONT, bold: true, fontSize: 14, color: OCHRE, charSpacing: 1, isTextBox: true, margin: 0 });
  s.addText("A page over the same live webhook, with three panels: real corpus stats, real interview quote cards, and the metric framework — no chatbot, no fabricated numbers.", {
    x: col2X + 0.3, y: colY + 0.62, w: colW - 0.6, h: 0.9, fontFace: BODY_FONT, fontSize: 14, color: "3A342E", isTextBox: true, margin: 0, lineSpacingMultiple: 1.15 });
  const bullets = [
    "Corpus at a glance — 2,203 classified, n=137 gold set, 0.875 accuracy",
    "6 real interview quotes with sourced \"what this means\" notes",
    "Paste your own text and classify it live, or try a gold-set example",
  ];
  let by = colY + 1.65;
  bullets.forEach((b) => {
    s.addText("•  " + b, { x: col2X + 0.3, y: by, w: colW - 0.6, h: 0.55, fontFace: BODY_FONT, fontSize: 14, color: "3A342E", isTextBox: true, margin: 0, lineSpacingMultiple: 1.1 });
    by += 0.6;
  });
  inlineLink(s, { x: col2X + 0.3, y: by + 0.2, w: colW - 0.6, label: "LIVE DEMO", labelColor: OCHRE, url: STREAMLIT_URL, displayText: "nl-myntra-graduation-project…streamlit.app", textColor: INK });

  footer(s, false); pageNum(s, 3, false);
}

// ============================================================
// SLIDE 4 — Primary research
// Source: docs/research-findings.md Parts 1–2, docs/codebook.md
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: BONE };
  titleBlock(s, "Primary research confirmed what reviews structurally couldn't show", { h: 0.85 });

  const cardY4 = 1.45, cardH4 = 4.7;
  s.addShape(pres.ShapeType.roundRect, { x: 0.7, y: cardY4, w: 5.75, h: cardH4, rectRadius: 0.1, fill: { color: WHITE }, line: { color: "E3D9CB", width: 1 } });
  s.addText("SURVEY — n = 32", { x: 1.0, y: cardY4 + 0.22, w: 5.15, h: 0.32, fontFace: BODY_FONT, bold: true, fontSize: 14, color: PLUM, charSpacing: 1, isTextBox: true, margin: 0 });
  const surveyLines = [
    "94% (30/32) research outside the app before deciding",
    "100% (32/32) have had a saved item go out of stock",
    "Price uncertainty is the #1 reason not bought (9/32)",
    "19/32 \"trust but would double-check\" size predictions",
  ];
  let sy4 = cardY4 + 0.75;
  surveyLines.forEach((l) => { s.addText("•  " + l, { x: 1.0, y: sy4, w: 5.15, h: 0.55, fontFace: BODY_FONT, fontSize: 14, color: "3A342E", isTextBox: true, margin: 0, lineSpacingMultiple: 1.15 }); sy4 += 0.62; });
  inlineLink(s, { x: 1.0, y: sy4 + 0.2, w: 5.15, label: "SURVEY", labelColor: PLUM, url: SURVEY_URL, displayText: "Google Form (n=32)", textColor: INK });

  s.addShape(pres.ShapeType.roundRect, { x: 6.85, y: cardY4, w: 5.75, h: cardH4, rectRadius: 0.1, fill: { color: WHITE }, line: { color: "E3D9CB", width: 1 } });
  s.addText("INTERVIEWS — 6 people, 2 waves", { x: 7.15, y: cardY4 + 0.22, w: 5.15, h: 0.32, fontFace: BODY_FONT, bold: true, fontSize: 14, color: OCHRE, charSpacing: 1, isTextBox: true, margin: 0 });
  s.addText("“If it was 1,200 I probably would've bought it then and there.”", {
    x: 7.15, y: cardY4 + 0.65, w: 5.15, h: 0.75, fontFace: TITLE_FONT, italic: true, fontSize: 16, color: INK, isTextBox: true, margin: 0, lineSpacingMultiple: 1.15 });
  s.addText("— P1, on a saved pair of jeans, waiting for a specific price", { x: 7.15, y: cardY4 + 1.45, w: 5.15, h: 0.3, fontFace: BODY_FONT, fontSize: 14, color: OCHRE, isTextBox: true, margin: 0 });
  s.addText("Every corpus-sparse category (fit, price, occasion, timing) was independently confirmed real here. 6/6 raised availability decay unprompted — the single most unanimous finding in the project.", {
    x: 7.15, y: cardY4 + 1.9, w: 5.15, h: 0.9, fontFace: BODY_FONT, fontSize: 14, color: "3A342E", isTextBox: true, margin: 0, lineSpacingMultiple: 1.15 });
  s.addText("Not run as originally planned: the brief asks to pick one segment, then validate it with 5–6 targeted interviews. These stayed exploratory across barriers instead, because no single segment was chosen going in — disclosed plainly, not smoothed over.", {
    x: 7.15, y: cardY4 + 2.95, w: 5.15, h: 1.55, fontFace: BODY_FONT, italic: true, fontSize: 14, color: "6B6259", isTextBox: true, margin: 0, lineSpacingMultiple: 1.15 });

  s.addText("The relevance pre-filter (slide 2, step 3) is what made this corpus usable at all — a cheap engine built specifically to pick real pre-purchase signal out of a much noisier raw pull of app-store reviews, before any deeper classification or gold-set labeling happened.", {
    x: 0.7, y: cardY4 + cardH4 + 0.15, w: 11.9, h: 0.5, fontFace: BODY_FONT, italic: true, fontSize: 14, color: "6B6259", isTextBox: true, margin: 0, lineSpacingMultiple: 1.15 });

  footer(s, false); pageNum(s, 4, false);
}

// ============================================================
// SLIDE 5 — The evolution chain
// Source: docs/decisions/problem-definition.md
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: BONE };
  titleBlock(s, "How the thinking evolved, one link at a time", { h: 0.85 });

  const chain = [
    ["BUSINESS METRIC", "Wishlist → Purchase within 30 days", PLUM],
    ["PRODUCT OUTCOMES", "Intent × Availability × Re-encounter × Resolution × Checkout", "6E4A5B"],
    ["AI DISCOVERY", "2 categories corpus-visible; 5 corpus-blind — a finding, not a dead end", OCHRE],
    ["PRIMARY RESEARCH", "All 5 corpus-blind barriers confirmed real via survey + interviews", MOSS],
    ["PROBLEM DEFINITION", "One segment chosen, evidenced end to end (next slide)", CLAY],
  ];
  const rowH = 0.8, rowGap = 0.1, rx = 0.7, ry0 = 1.6, labelW = 3.0, contentX = rx + labelW + 0.35, contentW = 11.9 - labelW - 0.35;
  chain.forEach((c, i) => {
    const y = ry0 + i * (rowH + rowGap);
    s.addShape(pres.ShapeType.roundRect, { x: rx, y, w: 11.9, h: rowH, rectRadius: 0.08, fill: { color: WHITE }, line: { color: "E3D9CB", width: 1 } });
    s.addShape(pres.ShapeType.roundRect, { x: rx + 0.15, y: y + 0.13, w: labelW - 0.3, h: rowH - 0.26, rectRadius: 0.08, fill: { color: c[2] }, line: { type: "none" } });
    s.addText(c[0], { x: rx + 0.25, y: y + 0.13, w: labelW - 0.5, h: rowH - 0.26, fontFace: BODY_FONT, bold: true, fontSize: 14, color: BONE, valign: "middle", isTextBox: true, margin: 0, lineSpacingMultiple: 1.1 });
    s.addText(c[1], { x: contentX, y, w: contentW, h: rowH, fontFace: BODY_FONT, fontSize: 14.5, color: INK, valign: "middle", isTextBox: true, margin: 0, lineSpacingMultiple: 1.15 });
    if (i < chain.length - 1) {
      s.addText("↓", { x: rx + labelW / 2 - 0.2, y: y + rowH - 0.05, w: 0.4, h: rowGap + 0.15, fontFace: BODY_FONT, fontSize: 14, color: OCHRE, align: "center", valign: "middle", isTextBox: true, margin: 0 });
    }
  });
  s.addText("Full chain, in writing: docs/decisions/problem-definition.md — every link traces to a file already in this repo, not a narrative built after the fact.", {
    x: 0.7, y: ry0 + 5 * (rowH + rowGap) + 0.05, w: 11.9, h: 0.4, fontFace: BODY_FONT, italic: true, fontSize: 14, color: "6B6259", isTextBox: true, margin: 0 });

  footer(s, false); pageNum(s, 5, false);
}

// ============================================================
// SLIDE 6 — Problem definition
// Source: docs/decisions/problem-definition.md
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: BONE };
  titleBlock(s, "The problem: Price-Timing Waiters can't tell if waiting is rational", { h: 1.0 });

  const cards = [
    ["SEGMENT", "Price-Timing Waiters — save an item they like, deliberately wait for a self-set price target before buying. Largest gold-set count (11) and largest survey reason (9/32)."],
    ["PRODUCT OUTCOME", "Resolution — getting a user's price uncertainty answered with real evidence, inside the 30-day window, before the item decays or intent fades."],
    ["ROOT CAUSE", "The wishlist shows one current price and nothing else. No trend, no history — so a user has no way to tell if waiting is rational or just habit."],
    ["EXISTING WORKAROUND", "94% of survey respondents already leave the app to research before deciding — a real, quantified workaround the product doesn't need to invent, only bring in-app."],
    ["USER VALUE", "Removes a repeated, manual, cross-platform research chore for a decision the user has already shown real intent toward — less regret, less re-research effort."],
    ["BUSINESS VALUE", "Converts demand already on the platform, already explicit (a saved item), at no acquisition cost — the only failure mode is a stalled decision, not a missing customer."],
  ];
  const cw = 3.83, cg = 0.15, cx0 = 0.7, cy0 = 1.6, ch = 2.15;
  cards.forEach((c, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = cx0 + col * (cw + cg), y = cy0 + row * (ch + 0.15);
    const accent = [PLUM, OCHRE, MOSS, PLUM, OCHRE, MOSS][i];
    s.addShape(pres.ShapeType.roundRect, { x, y, w: cw, h: ch, rectRadius: 0.08, fill: { color: WHITE }, line: { color: "E3D9CB", width: 1 } });
    s.addText(c[0], { x: x + 0.22, y: y + 0.15, w: cw - 0.65, h: 0.35, fontFace: BODY_FONT, bold: true, fontSize: 14, color: accent, charSpacing: 0.5, isTextBox: true, margin: 0 });
    s.addText(c[1], { x: x + 0.22, y: y + 0.5, w: cw - 0.44, h: ch - 0.65, fontFace: BODY_FONT, fontSize: 14, color: "3A342E", isTextBox: true, margin: 0, lineSpacingMultiple: 1.15 });
    cornerBadge(s, x + cw - 0.4, y + 0.12, i + 1, accent);
  });

  s.addText("Chosen for being most fully evidenced and buildable — not for being the only real barrier. quality_trust, fit_size, and availability_decay are each independently confirmed too (docs/decisions/opportunity-selection.md); availability_decay has the strongest cross-method triangulation of all four (6/6 interviews, 32/32 survey).", {
    x: 0.7, y: cy0 + 2 * (ch + 0.15) + 0.05, w: 11.9, h: 0.5, fontFace: BODY_FONT, italic: true, fontSize: 14, color: "6B6259", isTextBox: true, margin: 0, lineSpacingMultiple: 1.1 });

  footer(s, false); pageNum(s, 6, false);
}

// ============================================================
// SLIDE 7 — Solution rationale
// Source: mvp/src/components/{DecisionCard,ConfidenceBadge,DecisionCheck}.tsx design rules
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: BONE };
  titleBlock(s, "Solution rationale: a Discovery Concierge, not a discount engine", { h: 0.85 });

  s.addText("Constraint honored: no monetary incentives — every nudge resolves real uncertainty. None manufacture urgency or offer a discount.", {
    x: 0.7, y: 1.55, w: 11.5, h: 0.4, fontFace: BODY_FONT, italic: true, fontSize: 14, color: MOSS, isTextBox: true, margin: 0 });

  const pillars = [
    ["Evidence-backed reasoning", "Every recommendation traces to a real theme, a real review, or a real interview finding — never a generic “picked for you.”"],
    ["Honest confidence states", "High / Medium / Insufficient-evidence, always icon + color + label together — confidence is shown, never implied by color alone."],
    ["No manufactured urgency", "“What if I wait” tells the truth — a real scarcity fact, or an honest “nothing changes.” Never a fake countdown."],
  ];
  const pw = 3.75, pg = 0.2, px0 = 0.7, py0 = 2.15, ph = 2.85;
  pillars.forEach((p, i) => {
    const x = px0 + i * (pw + pg);
    s.addShape(pres.ShapeType.roundRect, { x, y: py0, w: pw, h: ph, rectRadius: 0.1, fill: { color: WHITE }, line: { color: "E3D9CB", width: 1 },
      shadow: { type: "outer", color: "000000", opacity: 0.1, blur: 8, offset: 2, angle: 90 } });
    s.addShape(pres.ShapeType.ellipse, { x: x + pw / 2 - 0.27, y: py0 + 0.25, w: 0.54, h: 0.54, fill: { color: [PLUM, OCHRE, MOSS][i] }, line: { type: "none" } });
    s.addText(String(i + 1), { x: x + pw / 2 - 0.27, y: py0 + 0.25, w: 0.54, h: 0.54, fontFace: TITLE_FONT, bold: true, fontSize: 18, color: BONE, align: "center", valign: "middle", isTextBox: true, margin: 0 });
    s.addText(p[0], { x: x + 0.3, y: py0 + 0.98, w: pw - 0.6, h: 0.6, fontFace: BODY_FONT, bold: true, fontSize: 15, color: INK, align: "center", isTextBox: true, margin: 0, lineSpacingMultiple: 1.1 });
    s.addText(p[1], { x: x + 0.35, y: py0 + 1.58, w: pw - 0.7, h: 1.15, fontFace: BODY_FONT, fontSize: 14, color: "4A433C", align: "center", isTextBox: true, margin: 0, lineSpacingMultiple: 1.2 });
  });

  const noteY = py0 + ph + 0.2;
  s.addShape(pres.ShapeType.roundRect, { x: 0.7, y: noteY, w: 11.9, h: 1.15, rectRadius: 0.08, fill: { color: "EFE6D8" }, line: { type: "none" } });
  s.addText(
    [
      { text: "Why this design, not a chatbot or a discount banner — ", options: { bold: true, color: PLUM, fontSize: 14 } },
      { text: "the root cause (slide 6) is missing evidence, not missing motivation or missing conversation. A price-history strip and an honest \"if you wait\" answer directly fix a visibility gap; a chat interface or a coupon would each address a different problem this research didn't find.", options: { color: INK, fontSize: 14 } },
    ],
    { x: 0.95, y: noteY + 0.12, w: 11.4, h: 0.95, fontFace: BODY_FONT, valign: "top", isTextBox: true, margin: 0, lineSpacingMultiple: 1.18 },
  );

  footer(s, false); pageNum(s, 7, false);
}

// ============================================================
// SLIDE 8 — MVP walkthrough
// Source: mvp/src/, docs/deck-assets/ screenshots, mvp/README.md
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: BONE };
  titleBlock(s, "Live MVP: the problem, resolved end to end", { h: 0.8 });

  const steps = [
    { file: "01-persona-picker-expanded.png", caption: "Persona Picker" },
    { file: "02-wishlist-intelligence.png", caption: "Wishlist Intelligence" },
    { file: "03-item-detail-price-box.png", caption: "Item Detail" },
    { file: "04-decision-check-open.png", caption: "Decision Check" },
  ];

  const frameH = 2.3, frameW = 1.7;
  const gap = 0.5, rowY = 1.4;
  const totalW = steps.length * frameW + (steps.length - 1) * gap;
  const rowX = (W - totalW) / 2;
  const captionY = rowY + frameH + 0.1, captionH = 0.35;
  const bottomY = captionY + captionH + 0.15;

  steps.forEach((step, i) => {
    const x = rowX + i * (frameW + gap);
    s.addShape(pres.ShapeType.roundRect, {
      x: x - 0.06, y: rowY - 0.06, w: frameW + 0.12, h: frameH + 0.12, rectRadius: 0.14,
      fill: { color: INK }, line: { type: "none" },
    });
    s.addImage({
      path: path.join(ASSETS, step.file),
      x, y: rowY, w: frameW, h: frameH,
      sizing: { type: "cover", w: frameW, h: frameH },
    });
    s.addText(step.caption, {
      x: x - 0.25, y: captionY, w: frameW + 0.5, h: captionH,
      fontFace: BODY_FONT, bold: true, fontSize: 14, color: INK, align: "center", isTextBox: true, margin: 0, lineSpacingMultiple: 1.05,
    });
    if (i < steps.length - 1) {
      s.addText("→", {
        x: x + frameW, y: rowY, w: gap, h: frameH, fontFace: BODY_FONT, fontSize: 16,
        color: OCHRE, align: "center", valign: "middle", isTextBox: true, margin: 0,
      });
    }
  });

  const flagshipH = 2.0;
  s.addShape(pres.ShapeType.roundRect, { x: 0.7, y: bottomY, w: 11.9, h: flagshipH, rectRadius: 0.08, fill: { color: "EFE6D8" }, line: { type: "none" } });
  s.addText("FLAGSHIP CASE — WIDE-LEG JEANS", { x: 1.0, y: bottomY + 0.15, w: 11.3, h: 0.3, fontFace: BODY_FONT, bold: true, fontSize: 14, color: PLUM, charSpacing: 1, isTextBox: true, margin: 0 });
  s.addText("“If it was 1,200 I probably would've bought it then and there.” — the real interview quote (slide 4) directly powers this item's price-history box and Decision Check reasoning. Traced end to end from problem definition to pixel, not a plausible-sounding guess.", {
    x: 1.0, y: bottomY + 0.5, w: 11.3, h: 0.65, fontFace: BODY_FONT, fontSize: 14, color: INK, isTextBox: true, margin: 0, lineSpacingMultiple: 1.15 });
  s.addText("Also shown live today: real category filter chips, an honest \"Holding steady\" bucket for settled-but-thin-evidence items, and \"Tracking a partial move\" for items with a real, quantified price drop that hasn't hit target yet — three separate, verified fixes so the UI never contradicts its own data.", {
    x: 1.0, y: bottomY + 1.2, w: 11.3, h: 0.7, fontFace: BODY_FONT, italic: true, fontSize: 14, color: "6B6259", isTextBox: true, margin: 0, lineSpacingMultiple: 1.1 });

  const linkY = bottomY + flagshipH + 0.15;
  s.addShape(pres.ShapeType.roundRect, { x: 0.7, y: linkY, w: 11.9, h: 0.45, rectRadius: 0.08, fill: { color: WHITE }, line: { color: MOSS, width: 1.25 } });
  s.addText(
    [
      { text: "LIVE MVP   ", options: { bold: true, color: MOSS, fontSize: 14, charSpacing: 1 } },
      { text: MVP_URL, options: { color: INK, fontSize: 14, fontFace: "Courier New", hyperlink: { url: MVP_URL } } },
    ],
    { x: 1.0, y: linkY, w: 11.0, h: 0.5, fontFace: BODY_FONT, valign: "middle", isTextBox: true, margin: 0 },
  );

  footer(s, false); pageNum(s, 8, false);
}

// ============================================================
// SLIDE 9 — Success metrics
// Source: docs/deck-build/build.js prior round (unchanged content, moved up)
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: BONE };
  titleBlock(s, "Success means saves that convert, not saves that pile up", { h: 0.9 });

  const tiers = [
    ["NORTH STAR", "Wishlist-to-Purchase, Within 30 Days", "The business metric this whole project decomposes and targets (slide 1). Unchanged.", PLUM],
    ["MVP LEADING INDICATORS", "Trace-widget open rate · Trace-to-cart conversion", "Does the reasoning get read — and does resolving uncertainty actually lead to action?", OCHRE],
    ["GUARDRAIL", "False-urgency rate", "“What if I wait” shown where stock/price didn't actually change afterward. Designed in from day one, not added for this slide.", MOSS],
  ];
  const labelW = 2.6, contentX = 0.7 + labelW + 0.5, contentW = 11.9 - labelW - 0.5;
  let ty = 1.7;
  tiers.forEach((t) => {
    const th = 1.35;
    s.addShape(pres.ShapeType.roundRect, { x: 0.7, y: ty, w: 11.9, h: th, rectRadius: 0.08, fill: { color: WHITE }, line: { color: "E3D9CB", width: 1 } });
    s.addShape(pres.ShapeType.roundRect, { x: 0.85, y: ty + 0.15, w: labelW - 0.3, h: th - 0.3, rectRadius: 0.08, fill: { color: t[3] }, line: { type: "none" } });
    s.addText(t[0], { x: 0.95, y: ty + 0.15, w: labelW - 0.5, h: th - 0.3, fontFace: BODY_FONT, bold: true, fontSize: 14, color: BONE, charSpacing: 0.5, valign: "middle", isTextBox: true, margin: 0, lineSpacingMultiple: 1.1 });
    s.addText(t[1], { x: contentX, y: ty + 0.15, w: contentW, h: 0.5, fontFace: TITLE_FONT, bold: true, fontSize: 18, color: INK, isTextBox: true, margin: 0 });
    s.addText(t[2], { x: contentX, y: ty + 0.65, w: contentW, h: 0.65, fontFace: BODY_FONT, fontSize: 14, color: "6B6259", isTextBox: true, margin: 0, lineSpacingMultiple: 1.1 });
    ty += th + 0.15;
  });
  s.addText("No number is claimed as currently measured that isn't — the MVP is not yet wired to a live event pipeline for these three. They are the defined, agreed targets this project's architecture is built to support, not a retrospective result.", {
    x: 0.7, y: ty + 0.1, w: 11.9, h: 0.5, fontFace: BODY_FONT, italic: true, fontSize: 14, color: "8A8078", isTextBox: true, margin: 0, lineSpacingMultiple: 1.1 });

  footer(s, false); pageNum(s, 9, false);
}

// ============================================================
// SLIDE 10 — Risks & mitigation (+ closing links)
// Source: docs/experiment_manifest.md, README.md §9 Limitations
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: INK };
  titleBlock(s, "What could go wrong, and what we're doing about it", { dark: true, h: 0.8 });

  const risks = [
    ["Thin categories, wobbly numbers", "fit_size / quality_trust / price_certainty rest on small samples (n=5–11); recall moved run to run (0.4→0.5→0.545).", "Treated as directional, disclosed in every writeup — never presented as exact."],
    ["Corpus skews toward complaints", "Review-writers aren't representative; Reddit/YouTube/social scoped out for policy/time reasons.", "Triangulated against survey (n=32) and interviews (n=6) — caught what the corpus alone would have missed."],
    ["Local-model consistency is weak", "E1 accuracy 0.875 vs. human labels, but κ=0.159 between the primary and backup classifiers.", "Production path uses the stronger hosted model with retry-escalation; local is a documented fallback only."],
    ["Segment validation stayed exploratory", "Interviews weren't targeted at one pre-chosen segment (the brief's Part 3 sequencing) — the evidence didn't support choosing one first.", "Disclosed plainly (docs/decisions/opportunity-selection.md); the deck's chosen segment (slide 6) rests on the strongest available evidence anyway."],
  ];
  const rw = 5.75, rg = 0.4, rx0 = 0.7, ry0 = 1.55, rh = 2.35;
  risks.forEach((r, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = rx0 + col * (rw + rg), y = ry0 + row * (rh + 0.2);
    s.addShape(pres.ShapeType.roundRect, { x, y, w: rw, h: rh, rectRadius: 0.08, fill: { color: "2C2622" }, line: { color: "463D36", width: 1 } });
    s.addText(r[0], { x: x + 0.3, y: y + 0.16, w: rw - 0.75, h: 0.4, fontFace: BODY_FONT, bold: true, fontSize: 14, color: CLAY, isTextBox: true, margin: 0 });
    s.addText(r[1], { x: x + 0.3, y: y + 0.58, w: rw - 0.6, h: 0.85, fontFace: BODY_FONT, fontSize: 14, color: "B9AEA2", isTextBox: true, margin: 0, lineSpacingMultiple: 1.15 });
    s.addText("MITIGATION:  " + r[2], { x: x + 0.3, y: y + 1.5, w: rw - 0.6, h: 0.8, fontFace: BODY_FONT, fontSize: 14, color: "8FAF93", isTextBox: true, margin: 0, lineSpacingMultiple: 1.15 });
    cornerBadge(s, x + rw - 0.45, y + 0.15, i + 1, OCHRE);
  });

  inlineLink(s, {
    x: 0.7, y: ry0 + 2 * (rh + 0.2) + 0.05, w: 11.5,
    label: "FULL REPO & RESEARCH TRAIL", labelColor: OCHRE,
    url: REPO_URL, displayText: "github.com/blazing-llama/NL-Myntra-Graduation-Project",
    textColor: BONE,
  });

  footer(s, true); pageNum(s, 10, true);
}

const OUT = process.env.DECK_OUT || path.join(__dirname, "..", "deck", "NL Myntra.pptx");
pres.writeFile({ fileName: OUT }).then(() => console.log("wrote all 10 slides ->", OUT));
