// Converts docs/deck/NL Myntra.pptx -> docs/deck/NL Myntra.pdf via
// LibreOffice headless. This is the one non-Node dependency in this build
// chain -- there's no reliable pptx->pdf path without a real Office/
// LibreOffice engine. Per-slide PNGs for the mandatory visual-overflow
// check are rendered from the resulting PDF by render_slides.py
// (PyMuPDF, self-contained -- doesn't need poppler/pdftoppm on PATH).
//
// Usage: node convert_to_pdf.js "<file.pptx>" "<outdir>"

const { execFileSync } = require("child_process");
const fs = require("fs");

function findSoffice() {
  const candidates = [
    "C:\\Program Files\\LibreOffice\\program\\soffice.exe",
    "C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe",
  ];
  for (const c of candidates) if (fs.existsSync(c)) return c;
  return "soffice"; // fall back to PATH
}

const [, , inputFile, outDir] = process.argv;
if (!inputFile || !outDir) {
  console.error("Usage: node convert_to_pdf.js <file.pptx> <outdir>");
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });

const soffice = findSoffice();
execFileSync(soffice, ["--headless", "--norestore", "--convert-to", "pdf", "--outdir", outDir, inputFile], { stdio: "inherit" });
console.log(`Converted ${inputFile} -> ${outDir} (pdf)`);
