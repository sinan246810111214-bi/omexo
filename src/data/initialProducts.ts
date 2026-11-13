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
  }
];
