import { Product } from '../types';
import { OMEXO_MEDIA } from '../config/media';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'nordic-ribbed-ambient-lamp',
    title: 'Nordic Ribbed Touch Ambient Lamp',
    category: 'Omexo Decor',
    categorySlug: 'decor',
    brand: 'Omexo',
    description:
      'Cordless brushed-brass and ribbed crystal touch table lamp with 3 warm dimming modes. Elevates bedrooms, study desks, and living room shelves effortlessly.',
    salePrice: 899,
    regularPrice: 1499,
    stockCount: 75,
    images: [OMEXO_MEDIA.prodAmbientLamp, OMEXO_MEDIA.catDecor],
    specs: {
      'Lighting Modes': 'Warm White, Amber Glow, Natural Daylight (3-Step Touch)',
      'Battery': '1800mAh Rechargeable USB-C (Up to 18 hrs runtime)',
      'Material': 'Optical Ribbed Acrylic & Brushed Alloy Base',
      'Dimensions': '21cm Height × 11cm Diameter',
      'Delivery': 'Free All India Cash on Delivery'
    },
    isTrending: true
  },
  {
    id: 'geometric-led-wall-sconce',
    title: 'Warm Geometric LED Wall Light & Decor Set',
    category: 'Omexo Decor',
    categorySlug: 'decor',
    brand: 'Omexo',
    description:
      'Minimalist Nordic diamond LED wall accent paired with matte botanical wall art styling. Creates soft architectural backlighting without harsh glare.',
    salePrice: 1199,
    regularPrice: 1899,
    stockCount: 40,
    images: [OMEXO_MEDIA.catDecor, OMEXO_MEDIA.prodAmbientLamp],
    specs: {
      'Illumination': '3000K Warm Architectural LED Strip',
      'Installation': 'No-drill 3M heavy-duty mount or concealed hook',
      'Power': 'USB / Standard Wall Adapter Compatible',
      'Ideal For': 'Living rooms, bedside walls & reading corners'
    },
    isTrending: false
  },
  {
    id: 'precision-3-stage-knife-sharpener',
    title: 'Omexo 3-Stage Precision Knife Sharpener',
    category: 'Omexo Essentials',
    categorySlug: 'essentials',
    brand: 'Omexo',
    description:
      'Restore razor-sharp factory edges in seconds. Engineered with coarse diamond, tungsten steel, and fine ceramic honing slots plus a non-slip ergonomic handle.',
    salePrice: 349,
    regularPrice: 699,
    stockCount: 130,
    images: [OMEXO_MEDIA.prodKnifeSharpener, OMEXO_MEDIA.catEssentials],
    specs: {
      'Sharpening Stages': '1. Diamond Coarse, 2. Tungsten Carbide, 3. Ceramic Fine',
      'Grip Design': 'Ergonomic Matte Anti-Slip Handle & Silicone Base',
      'Compatibility': 'Chef knives, cleavers, paring & utility blades',
      'Cleaning': 'Detachable stainless steel grinding head'
    },
    isTrending: true
  },
  {
    id: 'self-squeeze-mini-desktop-mop',
    title: 'Self-Squeeze Portable Mini Cleaning Mop',
    category: 'Omexo Essentials',
    categorySlug: 'essentials',
    brand: 'Omexo',
    description:
      'Compact one-hand self-wringing mini mop for kitchen counters, dining tables, glass mirrors, and bathroom tiles. Folds flat for effortless storage.',
    salePrice: 299,
    regularPrice: 549,
    stockCount: 110,
    images: [OMEXO_MEDIA.catEssentials, OMEXO_MEDIA.prodKnifeSharpener],
    specs: {
      'Mechanism': '180° Fold & Push-Pull Self-Squeeze Ring',
      'Head Material': 'High-Absorbency Biodegradable PVA Sponge',
      'Use Surfaces': 'Kitchen slabs, stovetops, car dashboards & glass',
      'Weight': '195g Ultra-Lightweight Portable Build'
    },
    isTrending: true
  },
  {
    id: 'mechanical-switch-keychain',
    title: 'Mechanical Switch Fidget Keychain',
    category: 'Omexo Lifestyle',
    categorySlug: 'lifestyle',
    brand: 'Omexo',
    description:
      'The ultimate clicky tactile stress-free companion for your keys or backpack. Built with a clear frosted housing, hot-swappable blue mechanical switch, and durable clasp.',
    salePrice: 199,
    regularPrice: 250,
    stockCount: 150,
    images: [OMEXO_MEDIA.catLifestyle],
    specs: {
      'Switch Type': 'Tactile Clicky Blue Mechanical Switch',
      'Hot-swappable': 'Yes (3-pin or 5-pin Cherry MX compatible)',
      'Keycap Profile': 'OEM Profile Translucent Polycarbonate',
      'Attachment': 'Stainless Steel Split Ring & Carabiner Clasp'
    },
    isTrending: true
  },
  {
    id: 'foldable-phone-stand',
    title: 'Ultra-Slim Foldable Mobile Holder Stand',
    category: 'Omexo Lifestyle',
    categorySlug: 'lifestyle',
    brand: 'Omexo',
    description:
      'Engineered for absolute stability and portability. Crafted with aerospace-grade aluminum alloy with dual multi-angle friction hinges. Folds flat to fit in any pocket.',
    salePrice: 199,
    regularPrice: 330,
    stockCount: 120,
    images: [OMEXO_MEDIA.catLifestyle],
    specs: {
      'Material': 'Anodized Space-Grade Aluminum Alloy',
      'Folded Thickness': '4mm Ultra-Thin Pocket Profile',
      'Angle Adjustment': 'Dual-axis 270-degree rotation',
      'Protection': 'Anti-skid premium silicone cushions'
    },
    isTrending: true
  },
  {
    id: 'omexo-airbuds-max',
    title: 'Omexo Airbuds Max-T Dual Audio Buds',
    category: 'Omexo Lifestyle',
    categorySlug: 'lifestyle',
    brand: 'Omexo',
    description:
      'Immerse yourself in acoustic clarity. Built with dual-driver hybrid technology and Active Noise Cancellation up to 48dB with quad-mic crystal clear voice calls.',
    salePrice: 1999,
    regularPrice: 3999,
    stockCount: 60,
    images: [OMEXO_MEDIA.catLifestyle],
    specs: {
      'Audio Driver': '11mm Dynamic + Balanced Armature Hybrid Drivers',
      'Noise Cancellation': 'Active ANC up to 48dB with Quad-mic ENC',
      'Playback': 'Up to 36 Hours Total Battery Life (with Case)',
      'Charging': 'Type-C Fast Charging (10 mins = 3 hrs playback)',
      'Bluetooth': 'v5.3 with Dual Device Connectivity'
    },
    isTrending: false
  },
  {
    id: 'omexo-special-combo',
    title: 'Omexo Special Combo: Keychain + Stand',
    category: 'Omexo Lifestyle',
    categorySlug: 'lifestyle',
    brand: 'Omexo',
    description:
      'Get both of our most-wanted everyday desk items for a special bundled price. Includes the clicky Mechanical Switch Fidget Keychain and the Foldable Mobile Stand.',
    salePrice: 350,
    regularPrice: 580,
    stockCount: 85,
    images: [OMEXO_MEDIA.catLifestyle],
    specs: {
      'Included Item 1': 'Mechanical Switch Fidget Keychain',
      'Included Item 2': 'Ultra-Slim Foldable Mobile Holder Stand',
      'Delivery': 'Free All India Air Express Delivery'
    },
    isTrending: true
  },
  {
    id: 'antitarnish-18k-layered-chain-bracelet-set',
    title: '18K Gold-Plated Anti-Tarnish Herringbone Chain & Bracelet Set',
    category: 'Omexo Aesthetic',
    categorySlug: 'aesthetic',
    brand: 'Omexo Aesthetic',
    description:
      'Sweat-proof, waterproof 316L stainless steel layered herringbone chain necklace, delicate curb bracelet, and sculpted minimalist band rings plated in 18K PVD gold for daily tarnish-free wear.',
    salePrice: 499,
    regularPrice: 999,
    stockCount: 95,
    images: [OMEXO_MEDIA.prodAntiTarnishJewelry, OMEXO_MEDIA.catAesthetic],
    specs: {
      'Subcategory': 'Anti-Tarnish Jewelry',
      'Material': '316L Surgical Stainless Steel with 18K PVD Gold',
      'Durability': '100% Waterproof, Sweat-Proof & Hypoallergenic',
      'Includes': 'Layered Chain Necklace, Matching Bracelet & 2 Band Rings',
      'Delivery': 'Free All India Cash on Delivery'
    },
    isTrending: true
  },
  {
    id: 'minimalist-band-rings-stack-pack',
    title: 'Sculpted Anti-Tarnish Minimalist Band Rings Pack (Set of 3)',
    category: 'Omexo Aesthetic',
    categorySlug: 'aesthetic',
    brand: 'Omexo Aesthetic',
    description:
      'Stackable minimalist band rings in waterproof 18K PVD gold and rhodium finishes. Skin-safe, fade-resistant daily rings designed to complement casual and festive looks.',
    salePrice: 349,
    regularPrice: 699,
    stockCount: 110,
    images: [OMEXO_MEDIA.prodAntiTarnishJewelry, OMEXO_MEDIA.catAesthetic],
    specs: {
      'Subcategory': 'Anti-Tarnish Jewelry',
      'Finish': 'Waterproof Anti-Tarnish Dual-Tone Gold & Silver',
      'Sizing': 'Comfort-Fit Open Adjustable Stack (Fits US 6–9)',
      'Care': 'Shower & Perfume Safe · Velvet Pouch Included'
    },
    isTrending: false
  },
  {
    id: 'minimalist-room-desk-decor-kit',
    title: 'Nordic Minimalist Room & Desk Aesthetic Decor Set',
    category: 'Omexo Aesthetic',
    categorySlug: 'aesthetic',
    brand: 'Omexo Aesthetic',
    description:
      'Curated study desk and bedroom corner upgrade: matte cream ceramic arch vase, natural travertine catchall tray, minimalist desktop organizer, and warm amber tea-light holder.',
    salePrice: 799,
    regularPrice: 1399,
    stockCount: 65,
    images: [OMEXO_MEDIA.prodMinimalistDeskDecor, OMEXO_MEDIA.catAesthetic],
    specs: {
      'Subcategory': 'Minimalist Room & Desk Decor',
      'Pieces Included': 'Ceramic Arch Vase, Dried Botanicals, Organizer & Tray',
      'Material': 'Matte Stoneware Ceramic & Travertine Composite',
      'Ideal For': 'Work-from-home desks, bookshelves & bedside corners'
    },
    isTrending: true
  },
  {
    id: 'custom-gift-hamper-couple-combo',
    title: 'Curated Custom Gift Hamper & Couple Combo Box',
    category: 'Omexo Aesthetic',
    categorySlug: 'aesthetic',
    brand: 'Omexo Aesthetic',
    description:
      'Bespoke linen keepsake gift box tied with sage-olive ribbon—includes matching minimalist magnetic couple bracelets, an anti-tarnish pendant chain, scented soy jar candle, and custom message card.',
    salePrice: 899,
    regularPrice: 1599,
    stockCount: 70,
    images: [OMEXO_MEDIA.prodGiftHamperCombo, OMEXO_MEDIA.catAesthetic],
    specs: {
      'Subcategory': 'Custom Gift Hampers & Couple Combos',
      'Hamper Contents': 'Couple Bracelet Duo, Anti-Tarnish Chain, Soy Candle & Note Card',
      'Personalization': 'Custom Gift Note Printed Inside (Send via WhatsApp after order)',
      'Packaging': 'Luxury Rigid Keepsake Gift Box with Satin Ribbon'
    },
    isTrending: true
  }
];
