import type { BrowseItem } from "../src/types";

// Phase 3 (docs/PHASE_PLAN.md): the Browse/Discovery page's product grid.
// Sourced from mvp/public/product-images-v2/manifest.json's
// browse_page_candidates (12 items) — same AI-generated-sample-imagery
// disclosure as the original 30 product images (mock-data/personas.ts
// header comment); no live API call at runtime, no key anywhere.
//
// Categories are deliberately reused from the existing persona wishlists
// (e.g. "Shirts", "Tees", "Bags") where the underlying garment genuinely
// matches, rather than invented fresh per item — this is what lets the
// similarity indicator find real overlaps against each persona's own
// wishlist instead of never firing.

function browseImage(filename: string): string {
  return `/product-images-v2/${filename}.png`;
}

export const BROWSE_CATALOG: BrowseItem[] = [
  {
    id: "browse-a02",
    name: "Olive Polo Shirt",
    brand: "Fieldwalk",
    category: "Polos",
    imageUrl: browseImage("a02_olive_polo_m"),
    imageAlt: "Olive polo shirt, product photography on plain background",
    price: "₹1,099",
  },
  {
    id: "browse-a03",
    name: "Denim Shirt",
    brand: "Studio Denim Co.",
    category: "Shirts",
    imageUrl: browseImage("a03_denim_shirt_f"),
    imageAlt: "Denim shirt, product photography on plain background",
    price: "₹1,599",
  },
  {
    id: "browse-a04",
    name: "Beige Hoodie",
    brand: "Northfield",
    category: "Hoodies",
    imageUrl: browseImage("a04_beige_hoodie_m"),
    imageAlt: "Beige hoodie, product photography on plain background",
    price: "₹1,799",
  },
  {
    id: "browse-a05",
    name: "Olive Strap Sandals",
    brand: "Fieldwalk",
    category: "Sandals",
    imageUrl: browseImage("a05_olive_strap_sandals"),
    imageAlt: "Olive strap sandals, product photography on plain background",
    price: "₹1,299",
  },
  {
    id: "browse-a07",
    name: "Cream Knit Polo",
    brand: "Meridian",
    category: "Polos",
    imageUrl: browseImage("a07_cream_knit_polo_m"),
    imageAlt: "Cream knit polo, product photography on plain background",
    price: "₹1,399",
  },
  {
    id: "browse-a09",
    name: "Navy Overshirt",
    brand: "Kerne & Fold",
    category: "Overshirts",
    imageUrl: browseImage("a09_navy_overshirt_m"),
    imageAlt: "Navy overshirt, product photography on plain background",
    price: "₹2,099",
  },
  {
    id: "browse-b02",
    name: "Cream Textured Shirt",
    brand: "Meridian",
    category: "Shirts",
    imageUrl: browseImage("b02_cream_textured_shirt_m"),
    imageAlt: "Cream textured shirt, product photography on plain background",
    price: "₹1,499",
  },
  {
    id: "browse-b04",
    name: "Sage Overshirt",
    brand: "Kerne & Fold",
    category: "Overshirts",
    imageUrl: browseImage("b04_sage_overshirt_m"),
    imageAlt: "Sage overshirt, product photography on plain background",
    price: "₹2,199",
  },
  {
    id: "browse-b05",
    name: "Tan Crossband Sandals",
    brand: "Fieldwalk",
    category: "Sandals",
    imageUrl: browseImage("b05_tan_crossband_sandals"),
    imageAlt: "Tan crossband sandals, product photography on plain background",
    price: "₹1,399",
  },
  {
    id: "browse-b07",
    name: "Teal T-Shirt & Shorts Set",
    brand: "Studio Denim Co.",
    category: "Tees",
    imageUrl: browseImage("b07_teal_tshirt_shorts_m"),
    imageAlt: "Teal t-shirt and shorts set, product photography on plain background",
    price: "₹1,699",
  },
  {
    id: "browse-b09",
    name: "Graphic Tee & Cargo Pants",
    brand: "Northfield",
    category: "Tees",
    imageUrl: browseImage("b09_graphic_tee_cargo_m"),
    imageAlt: "Graphic tee and cargo pants, product photography on plain background",
    price: "₹1,899",
  },
  {
    id: "browse-a10",
    name: "Striped Duffel Bag",
    brand: "Ferro & Hide",
    category: "Bags",
    imageUrl: browseImage("a10_striped_duffel_bag"),
    imageAlt: "Striped duffel bag, product photography on plain background",
    price: "₹2,499",
  },
];
