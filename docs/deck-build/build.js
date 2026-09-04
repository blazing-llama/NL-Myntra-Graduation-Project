// Source of truth for docs/deck/NL Myntra.pptx + .pdf. Run: node build.js
// (pdf export handled by convert_to_pdf.js via LibreOffice headless -- see README.md)
//
// Round: final pre-submission Myntra design-language + content pass. Restyled
// within this same engine, same palette/type system -- not rebuilt from
// scratch. See git log for what changed and why on top of the prior version.

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
    fontFace: TITLE_FONT, bold: true, fontSize: opts.size || 30,
    color: dark ? BONE : INK, isTextBox: true, margin: 0, lineSpacingMultiple: 1.02,
  });
}
// Phase 4 (final pre-submission round): a small numbered corner badge on a
// grid card, for slides where reading order across a 2x2/2x4 grid isn't
// otherwise obvious (unlike e.g. slide 2/6's already-numbered flow, which
// this leaves untouched). Same locked-palette colors only.
function cornerBadge(slide, x, y, n, color) {
  slide.addShape(pres.ShapeType.ellipse, { x, y, w: 0.32, h: 0.32, fill: { color }, line: { type: "none" } });
  slide.addText(String(n), {
    x, y, w: 0.32, h: 0.32, fontFace: BODY_FONT, bold: true, fontSize: 14,
    color: WHITE, align: "center", valign: "middle", isTextBox: true, margin: 0,
  });
}
// A compact single-line "LABEL  linked-url-text" footnote, used for the two
// links this round adds (survey on slide 4, repo on slide 8) without
// needing a full callout box the way the n8n/MVP links on slides 2/7 get --
// those two are primary CTAs; these two are supporting-artefact citations.
function inlineLink(slide, { x, y, w, label, labelColor, url, displayText, textColor }) {
  slide.addText(
    [
      { text: label + "   ", options: { bold: true, color: labelColor, fontSize: 14, charSpacing: 0.5 } },
      { text: displayText, options: { color: textColor, fontSize: 14, hyperlink: { url } } },
    ],
    { x, y, w, h: 0.32, fontFace: BODY_FONT, isTextBox: true, margin: 0 },
  );
}

// SLIDE 1
{
  const s = pres.addSlide();
  s.background = { color: INK };
  s.addText("MYNTRA · GROWTH · WISHLIST-TO-PURCHASE CONVERSION", {
    x: 0.7, y: 0.55, w: 10, h: 0.35, fontFace: BODY_FONT, fontSize: 14,
    color: CLAY, charSpacing: 2, isTextBox: true, margin: 0,
  });
  s.addText("Wishlist saves rarely become purchases — and reviews alone can't explain why", {
    x: 0.7, y: 1.0, w: 11.9, h: 1.6, fontFace: TITLE_FONT, bold: true, fontSize: 34,
    color: BONE, isTextBox: true, margin: 0, lineSpacingMultiple: 1.05,
  });
  s.addText("Business goal: increase the % of users who purchase at least one wishlisted item within 30 days of adding it.", {
    x: 0.7, y: 2.55, w: 11.9, h: 0.5, fontFace: BODY_FONT, fontSize: 15,
    color: "D9CFC4", isTextBox: true, margin: 0,
  });

  const factors = ["Intent", "Availability", "Re-encounter", "Resolution", "Checkout"];
  const boxW = 2.05, gap = 0.2, startX = 0.7, y = 3.55, boxH = 1.15;
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

  const pcY = y + boxH + 0.3, pcW = boxW * 5 + gap * 4;
  s.addShape(pres.ShapeType.roundRect, {
    x: startX, y: pcY, w: pcW, h: 0.65, rectRadius: 0.08,
    fill: { color: "6E4A5B" }, line: { color: OCHRE, width: 1 },
  });
  s.addText("+ Price-Certainty — a soft hesitation factor that modulates Resolution, not a hard sequential gate like Availability", {
    x: startX + 0.25, y: pcY, w: pcW - 0.5, h: 0.65, fontFace: BODY_FONT, italic: true, fontSize: 14,
    color: "E9DFD3", align: "center", valign: "middle", isTextBox: true, margin: 0,
  });

  s.addText("Which factor breaks down — and for whom — was unknown going in. That's what this project set out to find, end to end: AI discovery → primary research → a working, evidence-grounded MVP.", {
    x: 0.7, y: 5.85, w: 11.0, h: 0.85, fontFace: BODY_FONT, italic: true, fontSize: 14,
    color: "B9AEA2", isTextBox: true, margin: 0, lineSpacingMultiple: 1.15,
  });
  footer(s, true); pageNum(s, 1, true);
}

// SLIDE 2
{
  const s = pres.addSlide();
  s.background = { color: BONE };
  titleBlock(s, "An AI discovery engine classified 2,203 user voices across 3 sources — here's how");

  const steps = [
    ["Scrape", "3 apps, 2 sources"],
    ["Clean", "Dedupe + PII scrub"],
    ["Pre-filter", "Cheap relevance pass"],
    ["Gold Set", "n=137, 89.4% agree"],
    ["Coding Agent", "Groq, retry-escalation"],
    ["Findings", "Evidence-grounded"],
  ];
  const bw = 1.92, g = 0.16, sx = 0.7, sy = 1.95, bh = 1.7;
  steps.forEach((st, i) => {
    const x = sx + i * (bw + g);
    s.addShape(pres.ShapeType.roundRect, {
      x, y: sy, w: bw, h: bh, rectRadius: 0.08,
      fill: { color: WHITE }, line: { color: "E3D9CB", width: 1 },
      shadow: { type: "outer", color: "000000", opacity: 0.12, blur: 6, offset: 2, angle: 90 },
    });
    s.addShape(pres.ShapeType.ellipse, {
      x: x + bw / 2 - 0.22, y: sy + 0.16, w: 0.44, h: 0.44,
      fill: { color: i === 3 ? OCHRE : PLUM }, line: { type: "none" },
    });
    s.addText(String(i + 1), {
      x: x + bw / 2 - 0.22, y: sy + 0.16, w: 0.44, h: 0.44, fontFace: BODY_FONT, bold: true,
      fontSize: 15, color: BONE, align: "center", valign: "middle", isTextBox: true, margin: 0,
    });
    s.addText(st[0], {
      x: x + 0.08, y: sy + 0.68, w: bw - 0.16, h: 0.32, fontFace: BODY_FONT, bold: true, fontSize: 14,
      color: INK, align: "center", isTextBox: true, margin: 0,
    });
    s.addText(st[1], {
      x: x + 0.08, y: sy + 1.05, w: bw - 0.16, h: 0.6, fontFace: BODY_FONT, fontSize: 14,
      color: "6B6259", align: "center", isTextBox: true, margin: 0, lineSpacingMultiple: 1.02,
    });
    if (i < steps.length - 1) {
      s.addText("→", { x: x + bw, y: sy, w: g + 0.02, h: bh, fontFace: BODY_FONT, fontSize: 16,
        color: OCHRE, align: "center", valign: "middle", isTextBox: true, margin: 0 });
    }
  });

  s.addShape(pres.ShapeType.roundRect, {
    x: 0.7, y: 3.9, w: 3.6, h: 1.35, rectRadius: 0.08, fill: { color: PLUM }, line: { type: "none" },
  });
  s.addText("2,203", { x: 0.9, y: 3.98, w: 3.2, h: 0.6, fontFace: TITLE_FONT, bold: true, fontSize: 32,
    color: BONE, isTextBox: true, margin: 0 });
  s.addText("reviews classified, checkpointed — stopped intentionally, not stalled", {
    x: 0.9, y: 4.58, w: 3.2, h: 0.6, fontFace: BODY_FONT, fontSize: 14, color: "D9CFC4",
    isTextBox: true, margin: 0, lineSpacingMultiple: 1.05 });

  s.addShape(pres.ShapeType.roundRect, {
    x: 4.5, y: 3.9, w: 7.6, h: 1.35, rectRadius: 0.08, fill: { color: WHITE },
    line: { color: MOSS, width: 1.25 },
  });
  s.addText("TEST THE DISCOVERY ENGINE LIVE", { x: 4.75, y: 4.05, w: 7.1, h: 0.3, fontFace: BODY_FONT,
    bold: true, fontSize: 14, color: MOSS, charSpacing: 1, isTextBox: true, margin: 0 });
  s.addText("https://zeusworkspace1.app.n8n.cloud/webhook/\nwishlist-discovery-engine", {
    x: 4.75, y: 4.42, w: 7.1, h: 0.75, fontFace: "Courier New", fontSize: 14, color: INK,
    isTextBox: true, margin: 0, lineSpacingMultiple: 1.15,
    hyperlink: { url: N8N_URL } });

  s.addText("Sources actually scraped at scale: Play Store + App Store reviews. Two were consciously not pursued in this window, not silently skipped: Reddit was scoped out per Reddit's Responsible Builder Policy, which funnels bulk research use through a formal researcher program this project's timeline couldn't accommodate. YouTube comments and social/community sources were never attempted — disclosed here for the same reason, not hidden.", {
    x: 0.7, y: 5.5, w: 11.4, h: 0.9, fontFace: BODY_FONT, italic: true, fontSize: 14,
    color: "6B6259", isTextBox: true, margin: 0, lineSpacingMultiple: 1.1 });

  footer(s, false); pageNum(s, 2, false);
}

// SLIDE 3
{
  const s = pres.addSlide();
  s.background = { color: BONE };
  titleBlock(s, "Reviews found two real barriers — and revealed their own blind spot");

  s.addChart(pres.ChartType.bar, [{
    name: "Gold-set count",
    labels: ["price_certainty", "quality_trust", "fit_size", "availability_decay", "occasion_styling", "timing_forgetting", "bookmark_not_intent"],
    values: [11, 7, 6, 5, 0, 0, 0],
  }], {
    x: 0.7, y: 1.9, w: 7.0, h: 4.5,
    barDir: "bar", chartColors: [PLUM],
    showTitle: true, title: "Barrier categories in the frozen gold set (n=137)", titleFontSize: 14, titleColor: INK,
    showValue: true, dataLabelPosition: "outEnd", dataLabelColor: INK, dataLabelFontSize: 14,
    catAxisLabelColor: "4A433C", catAxisLabelFontSize: 14, valAxisHidden: true,
    valGridLine: { style: "none" }, catGridLine: { style: "none" },
    showLegend: false, plotArea: { fill: { color: BONE } }, chartArea: { fill: { color: BONE } },
  });

  s.addShape(pres.ShapeType.roundRect, { x: 8.05, y: 1.9, w: 4.55, h: 1.35, rectRadius: 0.08, fill: { color: PLUM }, line: { type: "none" } });
  s.addText("n = 137", { x: 8.3, y: 1.98, w: 4.0, h: 0.6, fontFace: TITLE_FONT, bold: true, fontSize: 28, color: BONE, isTextBox: true, margin: 0 });
  s.addText("human-labeled gold set — 2 independent labelers, 89.4% raw agreement, 100% category agreement on jointly-flagged items", {
    x: 8.3, y: 2.58, w: 4.05, h: 0.6, fontFace: BODY_FONT, fontSize: 14, color: "D9CFC4", isTextBox: true, margin: 0, lineSpacingMultiple: 1.1 });

  s.addShape(pres.ShapeType.roundRect, { x: 8.05, y: 3.45, w: 4.55, h: 1.35, rectRadius: 0.08, fill: { color: WHITE }, line: { color: "E3D9CB", width: 1 } });
  s.addText("0.875", { x: 8.3, y: 3.53, w: 4.0, h: 0.6, fontFace: TITLE_FONT, bold: true, fontSize: 28, color: OCHRE, isTextBox: true, margin: 0 });
  s.addText("classifier accuracy against human labels — measured, not assumed", {
    x: 8.3, y: 4.13, w: 4.05, h: 0.6, fontFace: BODY_FONT, fontSize: 14, color: "6B6259", isTextBox: true, margin: 0, lineSpacingMultiple: 1.1 });

  s.addShape(pres.ShapeType.roundRect, { x: 8.05, y: 5.0, w: 4.55, h: 1.4, rectRadius: 0.08, fill: { color: "EFE6D8" }, line: { type: "none" } });
  s.addText("Four categories never appeared in review corpora at all — not because they're rare, but because reviews are the wrong place to find them. Primary research picks up where the corpus stops.", {
    x: 8.3, y: 5.12, w: 4.05, h: 1.15, fontFace: BODY_FONT, italic: true, fontSize: 14, color: INK, isTextBox: true, margin: 0, lineSpacingMultiple: 1.1 });

  footer(s, false); pageNum(s, 3, false);
}

// SLIDE 4
{
  const s = pres.addSlide();
  s.background = { color: BONE };
  titleBlock(s, "Every one of 6 interviewees hit the same wall: items disappear before they decide");

  const stats = [["6/6", "interviews independently raised it, unprompted"], ["32/32", "survey respondents (100%) have experienced it"], ["~0", "gold-set corpus examples — reviews miss it almost entirely"]];
  const sw = 3.75, sg = 0.2, sx0 = 0.7, sy0 = 1.95, sh = 1.5;
  stats.forEach((st, i) => {
    const x = sx0 + i * (sw + sg);
    s.addShape(pres.ShapeType.roundRect, { x, y: sy0, w: sw, h: sh, rectRadius: 0.08, fill: { color: i === 2 ? "EFE6D8" : PLUM }, line: { type: "none" } });
    s.addText(st[0], { x: x + 0.25, y: sy0 + 0.15, w: sw - 0.5, h: 0.65, fontFace: TITLE_FONT, bold: true, fontSize: 30, color: i === 2 ? INK : BONE, isTextBox: true, margin: 0 });
    s.addText(st[1], { x: x + 0.25, y: sy0 + 0.85, w: sw - 0.5, h: 0.6, fontFace: BODY_FONT, fontSize: 14, color: i === 2 ? "6B6259" : "D9CFC4", isTextBox: true, margin: 0, lineSpacingMultiple: 1.1 });
  });

  s.addShape(pres.ShapeType.roundRect, { x: 0.7, y: 3.75, w: 11.9, h: 1.55, rectRadius: 0.08, fill: { color: WHITE }, line: { color: MOSS, width: 1 } });
  s.addText("“If something says only two left, I'll probably decide faster.”", {
    x: 1.0, y: 3.95, w: 11.3, h: 0.6, fontFace: TITLE_FONT, italic: true, fontSize: 19, color: INK, isTextBox: true, margin: 0 });
  s.addText("— interview respondent, on how a near-miss stock-out changed future decision speed", {
    x: 1.0, y: 4.6, w: 11.3, h: 0.4, fontFace: BODY_FONT, fontSize: 14, color: MOSS, isTextBox: true, margin: 0 });

  s.addText("Three independent methods — corpus, survey, interviews — converge on one answer: availability decay is real and common, and app reviews are structurally the wrong instrument to measure it.", {
    x: 0.7, y: 5.55, w: 11.5, h: 0.55, fontFace: BODY_FONT, fontSize: 14, color: "4A433C", isTextBox: true, margin: 0, lineSpacingMultiple: 1.2 });

  // Phase 4 addition: the survey is cited right above (32/32) but was never
  // linked anywhere in the repo before this round — added as a real
  // embedded hyperlink, not just named.
  inlineLink(s, {
    x: 0.7, y: 6.2, w: 11.5,
    label: "SURVEY (n=32)", labelColor: MOSS,
    url: SURVEY_URL, displayText: "docs.google.com/forms/d/e/1FAIpQLScsU5OcvTbEetugF0pG-ek2eo_8VEz1DLEjX0gMDsydgOHizA/viewform",
    textColor: INK,
  });

  footer(s, false); pageNum(s, 4, false);
}

// SLIDE 5
{
  const s = pres.addSlide();
  s.background = { color: BONE };
  titleBlock(s, "The real problem: purchase intent, blocked by different uncertainty at the moment of decision");

  const cols = [
    ["SEGMENT", "Wishlist-savers with unresolved decision-stage uncertainty — spans price, fit, quality, occasion, and availability doubt, not one narrow group."],
    ["ROOT CAUSE", "Not disinterest. A specific, often-nameable uncertainty sits between saving and buying — today's wishlist gives no help resolving it."],
    ["OBSERVED WORKAROUND", "Users already compensate manually: cross-platform price/review checks, substitute purchases, rushed decisions after a stock-out scare."],
    ["WHY IT MATTERS", "User: less regret, less re-research effort. Business: converts demand that's already explicit and already on the platform — no acquisition cost."],
  ];
  const cw = 5.75, cg = 0.3, cx0 = 0.7, cy0 = 1.9, ch = 1.8;
  cols.forEach((c, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = cx0 + col * (cw + cg), y = cy0 + row * (ch + 0.2);
    const accent = row === 0 ? PLUM : OCHRE;
    s.addShape(pres.ShapeType.roundRect, { x, y, w: cw, h: ch, rectRadius: 0.08, fill: { color: WHITE }, line: { color: "E3D9CB", width: 1 } });
    s.addText(c[0], { x: x + 0.35, y: y + 0.16, w: cw - 0.85, h: 0.3, fontFace: BODY_FONT, bold: true, fontSize: 14, color: accent, charSpacing: 1, isTextBox: true, margin: 0 });
    s.addText(c[1], { x: x + 0.35, y: y + 0.5, w: cw - 0.65, h: ch - 0.65, fontFace: BODY_FONT, fontSize: 14, color: "3A342E", isTextBox: true, margin: 0, lineSpacingMultiple: 1.1 });
    // Phase 4: numbered corner badge -- a 2x2 grid has no obvious reading
    // order otherwise (the old dot only encoded row, not a 1-4 sequence).
    cornerBadge(s, x + cw - 0.45, y + 0.13, i + 1, accent);
  });

  s.addText("Process note: the brief's kill-criteria single-segment selection could not be run — no segment-tagged corpus data exists, and building it risked reopening the frozen gold set or inferring segments never observed. Full reasoning: docs/decisions/opportunity-selection.md", {
    x: 0.7, y: cy0 + 2 * (ch + 0.2) + 0.15, w: 11.5, h: 0.75, fontFace: BODY_FONT, italic: true, fontSize: 14,
    color: "8A8078", isTextBox: true, margin: 0, lineSpacingMultiple: 1.08 });

  footer(s, false); pageNum(s, 5, false);
}

// SLIDE 6
{
  const s = pres.addSlide();
  s.background = { color: BONE };
  titleBlock(s, "A Discovery Concierge that resolves the one barrier blocking each save");

  s.addText("Constraint honored: no monetary incentives — every nudge resolves real uncertainty. None manufacture urgency or offer a discount.", {
    x: 0.7, y: 1.7, w: 11.5, h: 0.45, fontFace: BODY_FONT, italic: true, fontSize: 14, color: MOSS, isTextBox: true, margin: 0 });

  const pillars = [
    ["Evidence-backed reasoning", "Every recommendation traces to a real theme, a real review, or a real interview finding — never a generic “picked for you.”"],
    ["Honest confidence states", "High / Medium / Insufficient-evidence, always icon + color + label together — confidence is shown, never implied by color alone."],
    ["No manufactured urgency", "“What if I wait” tells the truth — a real scarcity fact, or an honest “nothing changes.” Never a fake countdown."],
  ];
  const pw = 3.75, pg = 0.2, px0 = 0.7, py0 = 2.35, ph = 3.15;
  pillars.forEach((p, i) => {
    const x = px0 + i * (pw + pg);
    s.addShape(pres.ShapeType.roundRect, { x, y: py0, w: pw, h: ph, rectRadius: 0.1, fill: { color: WHITE }, line: { color: "E3D9CB", width: 1 },
      shadow: { type: "outer", color: "000000", opacity: 0.1, blur: 8, offset: 2, angle: 90 } });
    s.addShape(pres.ShapeType.ellipse, { x: x + pw / 2 - 0.3, y: py0 + 0.3, w: 0.6, h: 0.6, fill: { color: [PLUM, OCHRE, MOSS][i] }, line: { type: "none" } });
    s.addText(String(i + 1), { x: x + pw / 2 - 0.3, y: py0 + 0.3, w: 0.6, h: 0.6, fontFace: TITLE_FONT, bold: true, fontSize: 19, color: BONE, align: "center", valign: "middle", isTextBox: true, margin: 0 });
    s.addText(p[0], { x: x + 0.3, y: py0 + 1.12, w: pw - 0.6, h: 0.65, fontFace: BODY_FONT, bold: true, fontSize: 15.5, color: INK, align: "center", isTextBox: true, margin: 0, lineSpacingMultiple: 1.1 });
    s.addText(p[1], { x: x + 0.35, y: py0 + 1.78, w: pw - 0.7, h: 1.3, fontFace: BODY_FONT, fontSize: 14, color: "4A433C", align: "center", isTextBox: true, margin: 0, lineSpacingMultiple: 1.2 });
  });

  // Phase 4 addition: Alternatives / Compare Similar folded in here rather
  // than adding an 11th slide -- this is where the pillars already
  // establish "how the Concierge behaves," and both secondary features
  // follow the same 3 rules just described, so this is where they read as
  // reinforcement rather than a new topic.
  const noteY = py0 + ph + 0.2;
  s.addShape(pres.ShapeType.roundRect, { x: 0.7, y: noteY, w: 11.9, h: 0.75, rectRadius: 0.08, fill: { color: "EFE6D8" }, line: { type: "none" } });
  s.addText(
    [
      { text: "Also reachable — ", options: { bold: true, color: PLUM, fontSize: 14 } },
      { text: "Compare Similar (a real side-by-side against another saved item, never shown empty) and Alternatives (secondary browse, substitutes tied to existing wishlist items). Same 3 rules apply: honest CTAs only — Save / Compare / Move to cart, no \"Buy Now\" anywhere.", options: { color: INK, fontSize: 14 } },
    ],
    { x: 0.95, y: noteY, w: 11.4, h: 0.75, fontFace: BODY_FONT, valign: "middle", isTextBox: true, margin: 0, lineSpacingMultiple: 1.15 },
  );

  footer(s, false); pageNum(s, 6, false);
}

// SLIDE 7 — rebuilt: a real phone-frame step sequence using the actual
// screenshots in docs/deck-assets/ (Phase 3 of this round), not an abstract
// 4-box diagram. Frame size is derived from the vertical budget left after
// the title and the two boxes below, then cropped to a phone-like aspect
// (pptxgenjs `sizing: {type:'crop'}`) rather than stretching the 390x844
// source images, which would distort them.
{
  const s = pres.addSlide();
  s.background = { color: BONE };
  titleBlock(s, "Live MVP: real evidence, never guessed", { h: 0.85 });

  const steps = [
    { file: "01-persona-picker-expanded.png", caption: "Persona Picker" },
    { file: "02-wishlist-intelligence.png", caption: "Wishlist Intelligence" },
    { file: "03-item-detail-price-box.png", caption: "Item Detail" },
    { file: "04-decision-check-open.png", caption: "Decision Check" },
  ];

  const frameH = 2.8, frameW = 1.85; // phone-like crop, not the raw 390x844 aspect
  const gap = 0.55, rowY = 1.55;
  const totalW = steps.length * frameW + (steps.length - 1) * gap;
  const rowX = (W - totalW) / 2;
  const captionY = rowY + frameH + 0.1, captionH = 0.42; // room for a 2-line wrap, e.g. "Wishlist Intelligence"
  const bottomY = captionY + captionH + 0.18; // derived from the caption's own bottom, not a separate magic number that could drift out of sync

  steps.forEach((step, i) => {
    const x = rowX + i * (frameW + gap);
    // Bezel
    s.addShape(pres.ShapeType.roundRect, {
      x: x - 0.06, y: rowY - 0.06, w: frameW + 0.12, h: frameH + 0.12, rectRadius: 0.14,
      fill: { color: INK }, line: { type: "none" },
    });
    // "cover" (not "crop"): auto-computes a centered crop-to-fill from the
    // source's own aspect ratio -- same idea as CSS object-fit:cover.
    // "crop" instead expects raw inch offsets into the source image with no
    // default centering, which would have silently kept only the top-left
    // sliver of each screenshot (caught by inspecting pptxgenjs's own
    // ImageSizingXml.crop source before trusting it, not after rendering).
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
        x: x + frameW, y: rowY, w: gap, h: frameH, fontFace: BODY_FONT, fontSize: 18,
        color: OCHRE, align: "center", valign: "middle", isTextBox: true, margin: 0,
      });
    }
  });
  s.addShape(pres.ShapeType.roundRect, { x: 0.7, y: bottomY, w: 11.9, h: 1.05, rectRadius: 0.08, fill: { color: "EFE6D8" }, line: { type: "none" } });
  s.addText("FLAGSHIP CASE — WIDE-LEG JEANS", { x: 1.0, y: bottomY + 0.12, w: 11.3, h: 0.28, fontFace: BODY_FONT, bold: true, fontSize: 14, color: PLUM, charSpacing: 1, isTextBox: true, margin: 0 });
  s.addText("“If it was 1,200 I probably would've bought it then and there.” — real interview quote, directly powering the item's price-history box and confidence reasoning above. Not a template filled with a plausible-sounding guess.", {
    x: 1.0, y: bottomY + 0.4, w: 11.3, h: 0.6, fontFace: BODY_FONT, fontSize: 14, color: INK, isTextBox: true, margin: 0, lineSpacingMultiple: 1.15 });

  const linkY = bottomY + 1.2;
  s.addShape(pres.ShapeType.roundRect, { x: 0.7, y: linkY, w: 11.9, h: 0.55, rectRadius: 0.08, fill: { color: WHITE }, line: { color: MOSS, width: 1.25 } });
  s.addText(
    [
      { text: "LIVE MVP   ", options: { bold: true, color: MOSS, fontSize: 14, charSpacing: 1 } },
      { text: MVP_URL, options: { color: INK, fontSize: 14, fontFace: "Courier New", hyperlink: { url: MVP_URL } } },
    ],
    { x: 1.0, y: linkY, w: 11.0, h: 0.55, fontFace: BODY_FONT, valign: "middle", isTextBox: true, margin: 0 },
  );

  footer(s, false); pageNum(s, 7, false);
}

// SLIDE 8 — redesigned: same content (E1 vs E3, the "categories aren't the
// problem" paragraph), but the old "2 stat boxes + paragraph" treatment
// becomes a single 0-1 scale comparison chart so the accuracy-vs-agreement
// contrast reads visually, not just numerically. The paragraph below still
// carries the full nuance (these aren't the same kind of measurement) --
// the chart is a scannable aid, not a replacement for that explanation.
{
  const s = pres.addSlide();
  s.background = { color: BONE };
  titleBlock(s, "We don't trust AI insights blindly");

  s.addChart(pres.ChartType.bar, [{
    name: "Score (0–1 scale)",
    labels: ["E1 — accuracy vs. 137 human-labeled reviews", "E3 — cross-model agreement (Cohen's kappa)"],
    values: [0.875, 0.159],
  }], {
    x: 0.7, y: 1.85, w: 11.9, h: 2.15,
    barDir: "bar", chartColors: [PLUM, OCHRE],
    showValue: true, dataLabelPosition: "outEnd", dataLabelColor: INK, dataLabelFontSize: 14, dataLabelFormatCode: "0.000",
    catAxisLabelColor: "4A433C", catAxisLabelFontSize: 14,
    valAxisMinVal: 0, valAxisMaxVal: 1, valAxisHidden: true,
    valGridLine: { style: "none" }, catGridLine: { style: "none" },
    showLegend: false, plotArea: { fill: { color: BONE } }, chartArea: { fill: { color: BONE } },
  });

  s.addShape(pres.ShapeType.roundRect, { x: 0.7, y: 4.2, w: 11.9, h: 1.85, rectRadius: 0.08, fill: { color: "EFE6D8" }, line: { type: "none" } });
  s.addText("The categories aren't the problem — the small local model is.", {
    x: 1.0, y: 4.4, w: 11.3, h: 0.4, fontFace: BODY_FONT, bold: true, fontSize: 14.5, color: INK, isTextBox: true, margin: 0 });
  s.addText("Two independent human labelers, using the same taxonomy, reached 89.4% raw agreement and 100% category agreement on items they both flagged relevant. The task is learnable. E3's low kappa reflects a genuinely undersized local model standing in for a stronger one — not an ambiguous codebook. Production classification uses the stronger hosted model; the small local model is a documented fallback, not the primary path.", {
    x: 1.0, y: 4.8, w: 11.3, h: 1.15, fontFace: BODY_FONT, fontSize: 14, color: "3A342E", isTextBox: true, margin: 0, lineSpacingMultiple: 1.15 });

  // Phase 4 addition: public repo link, added only after independently
  // confirming (via `git log --format=%an|%ae|%cn|%ce | sort -u`, this
  // session) that the history scrub from the prior round is actually
  // complete -- every commit shows the blazing-llama identity only.
  inlineLink(s, {
    x: 0.7, y: 6.2, w: 11.5,
    label: "FULL REPO & RESEARCH TRAIL", labelColor: OCHRE,
    url: REPO_URL, displayText: "github.com/blazing-llama/NL-Myntra-Graduation-Project",
    textColor: INK,
  });

  footer(s, false); pageNum(s, 8, false);
}

// SLIDE 9 — tightened: the old layout was 3 full-width bars with every
// element left-aligned in one column, under-using the width. Split each
// tier into a label column (left) and a content column (right) instead.
{
  const s = pres.addSlide();
  s.background = { color: BONE };
  titleBlock(s, "Success means saves that convert, not saves that pile up");

  const tiers = [
    ["NORTH STAR", "Wishlist-to-Purchase, Within 30 Days", "The business metric this whole project decomposes and targets. Unchanged.", PLUM],
    ["MVP LEADING INDICATORS", "Trace-widget open rate · Trace-to-cart conversion", "Does the reasoning get read — and does resolving uncertainty actually lead to action?", OCHRE],
    ["GUARDRAIL", "False-urgency rate", "“What if I wait” shown where stock/price didn't actually change afterward. Designed in from day one, not added for this slide.", MOSS],
  ];
  const labelW = 2.5, contentX = 0.7 + labelW + 0.5, contentW = 11.9 - labelW - 0.5;
  let ty = 1.85;
  tiers.forEach((t) => {
    const th = 1.55;
    // A colored tag inset within the white card (not a second shape trying
    // to seam against the card's own rounded corner -- simpler and safer
    // than a manual corner-mask hack).
    s.addShape(pres.ShapeType.roundRect, { x: 0.7, y: ty, w: 11.9, h: th, rectRadius: 0.08, fill: { color: WHITE }, line: { color: "E3D9CB", width: 1 } });
    s.addShape(pres.ShapeType.roundRect, { x: 0.85, y: ty + 0.15, w: labelW - 0.3, h: th - 0.3, rectRadius: 0.08, fill: { color: t[3] }, line: { type: "none" } });
    s.addText(t[0], { x: 0.95, y: ty + 0.15, w: labelW - 0.5, h: th - 0.3, fontFace: BODY_FONT, bold: true, fontSize: 14, color: BONE, charSpacing: 0.5, valign: "middle", isTextBox: true, margin: 0, lineSpacingMultiple: 1.15 });
    s.addText(t[1], { x: contentX, y: ty + 0.2, w: contentW, h: 0.55, fontFace: TITLE_FONT, bold: true, fontSize: 18, color: INK, isTextBox: true, margin: 0 });
    s.addText(t[2], { x: contentX, y: ty + 0.78, w: contentW, h: 0.65, fontFace: BODY_FONT, fontSize: 14, color: "6B6259", isTextBox: true, margin: 0, lineSpacingMultiple: 1.15 });
    ty += th + 0.2;
  });

  footer(s, false); pageNum(s, 9, false);
}

// SLIDE 10
{
  const s = pres.addSlide();
  s.background = { color: INK };
  titleBlock(s, "What could go wrong, and what we're doing about it", { dark: true });

  const risks = [
    ["Thin categories, wobbly numbers", "fit_size / quality_trust / price_certainty rest on small samples (n=5–11); recall moved run to run (0.4→0.5→0.545).", "Treated as directional, disclosed in every writeup — never presented as exact."],
    ["Corpus skews toward complaints", "Review-writers aren't representative; Reddit/YouTube/social scoped out for policy/time reasons.", "Triangulated against survey (n=32) and interviews (n=6) — caught what the corpus alone would have missed."],
    ["Local-model consistency is weak", "Kappa = 0.159 between the primary and backup classifiers.", "Production path uses the stronger hosted model with retry-escalation; local is a documented fallback only."],
    ["Demo reasoning is templated", "The MVP doesn't yet call a live model against real per-user history.", "Disclosed openly. Deterministic-retrieval-then-narration is already the intended production architecture."],
  ];
  const rw = 5.75, rg = 0.4, rx0 = 0.7, ry0 = 2.0, rh = 2.15;
  risks.forEach((r, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = rx0 + col * (rw + rg), y = ry0 + row * (rh + 0.3);
    s.addShape(pres.ShapeType.roundRect, { x, y, w: rw, h: rh, rectRadius: 0.08, fill: { color: "2C2622" }, line: { color: "463D36", width: 1 } });
    s.addText(r[0], { x: x + 0.3, y: y + 0.18, w: rw - 0.75, h: 0.4, fontFace: BODY_FONT, bold: true, fontSize: 14, color: CLAY, isTextBox: true, margin: 0 });
    s.addText(r[1], { x: x + 0.3, y: y + 0.62, w: rw - 0.6, h: 0.65, fontFace: BODY_FONT, fontSize: 14, color: "B9AEA2", isTextBox: true, margin: 0, lineSpacingMultiple: 1.15 });
    s.addText("MITIGATION:  " + r[2], { x: x + 0.3, y: y + 1.32, w: rw - 0.6, h: 0.75, fontFace: BODY_FONT, fontSize: 14, color: "8FAF93", isTextBox: true, margin: 0, lineSpacingMultiple: 1.15 });
    // Phase 4: numbered corner badge, same reasoning as slide 5's 2x2 grid.
    // Ochre, not the card's own border tone -- needs to read as a distinct
    // badge against the dark card, not blend into it. Same fill+white-text
    // combo already proven on slide 2's 4th step badge, not a new untested
    // color pairing this close to deadline.
    cornerBadge(s, x + rw - 0.45, y + 0.15, i + 1, OCHRE);
  });

  footer(s, true); pageNum(s, 10, true);
}

// Defaults to the real shipped location -- this file must never again exist
// only in a temporary/scratch location between sessions. Override with
// DECK_OUT to iterate on a draft without touching docs/deck/ until it's
// been validated + visually checked (see README.md).
const OUT = process.env.DECK_OUT || path.join(__dirname, "..", "deck", "NL Myntra.pptx");
pres.writeFile({ fileName: OUT }).then(() => console.log("wrote all 10 slides ->", OUT));
