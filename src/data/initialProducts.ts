import { Product } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'mechanical-switch-keychain',
    title: 'Mechanical Switch Fidget Keychain',
    category: 'Desk Essentials',
    brand: 'Omexo',
    description: 'The ultimate clicky tactile companion for your keys or backpack. Built with a premium clear housing, hot-swappable tactile blue mechanical switch, and a high-profile translucent colored keycap. Perfect for tactile sensory relief and desk fidgeting.',
    salePrice: 199,
    regularPrice: 250,
    stockCount: 150,
    images: [
      'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=600&q=80'
    ],
    specs: {
      'Switch Type': 'Tactical Clicky Blue Switch',
      'Hot-swappable': 'Yes (3-pin or 5-pin Cherry MX compatible)',
      'Keycap Profile': 'OEM Profile Translucent Polycarbonate',
      'Attachment': 'Stainless Steel Premium Split Ring & Lobster Clasp',
      'Housing': 'Clear Frost Acrylic Box'
    },
    isTrending: true
  },
  {
    id: 'foldable-phone-stand',
    title: 'Ultra-Slim Foldable Phone Stand',
    category: 'Tech Accessories',
    brand: 'Omexo',
    description: 'Engineered for absolute stability and portability. Crafted with premium aerospace-grade aluminum alloy with double multi-angle friction hinges. Folds completely flat to just 4mm thick, fitting seamlessly inside your pocket or card wallet.',
    salePrice: 199,
    regularPrice: 330,
    stockCount: 120,
    images: [
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=600&q=80'
    ],
    specs: {
      'Material': 'Anodized Space-Grade Aluminum Alloy',
      'Folded Thickness': '4mm Ultra-Thin',
      'Angle Adjustment': 'Dual-axis 270-degree rotation',
      'Friction Hinges': 'High-torque dampening hinges (tested for 20k cycles)',
      'Protection': 'Anti-skid premium silicone cushions'
    },
    isTrending: true
  },
  {
    id: 'omexo-special-combo',
    title: 'Omexo Special Combo: Keychain + Stand',
    category: 'Trending',
    brand: 'Omexo',
    description: 'Get both of our most-wanted everyday desk items for a special bundled price. Includes the clicky Mechanical Switch Fidget Keychain and the premium aerospace-grade Foldable Phone Stand. Elevate your everyday workspace layout.',
    salePrice: 350,
    regularPrice: 580,
    stockCount: 85,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'
    ],
    specs: {
      'Included Item 1': 'Mechanical Switch Fidget Keychain',
      'Included Item 2': 'Ultra-Slim Foldable Phone Stand',
      'Warranty': '1 Year Premium Replacement Warranty',
      'Delivery': 'Free All India Air Express Delivery'
    },
    isTrending: true
  },
  {
    id: 'omexo-wave-pro',
    title: 'Omexo Wave Pro Active Smartwatch',
    category: 'Lifestyle',
    brand: 'Omexo',
    description: 'Elevate your daily hustle with the Omexo Wave Pro. Featuring a gorgeous 1.96" AMOLED display, premium titanium-alloy chassis, dual-band GPS tracker, and custom sports tracking with real-time vitals monitoring. Crafted for the modern nomad with a rugged yet minimal aesthetic.',
    salePrice: 3499,
    regularPrice: 5999,
    stockCount: 45,
    images: [
      'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'
    ],
    specs: {
      'Display': '1.96" AMOLED Display (410x502 px, 1000 nits)',
      'Chassis': 'Titanium Alloy with Ceramic Back Cover',
      'Battery Life': 'Up to 10 days (typical use)',
      'Water Resistance': '5ATM & IP68 Dust & Water Proofing',
      'Connectivity': 'Bluetooth 5.3 LE, Dual-Band GPS'
    },
    isTrending: false
  },
  {
    id: 'omexo-airbuds-max',
    title: 'Omexo Airbuds Max-T Dual Audio Buds',
    category: 'Tech Accessories',
    brand: 'Omexo',
    description: 'Immerse yourself in acoustic bliss. Built with dual-driver hybrid technology and ultra-responsive Active Noise Cancellation up to 48dB. Features Mint Green-Teal accent rings for the ultimate premium visual style.',
    salePrice: 1999,
    regularPrice: 3999,
    stockCount: 60,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80'
    ],
    specs: {
      'Drivers': 'Dual Hybrid (10mm Coaxial Dynamic + Balanced Armature)',
      'Active Noise Cancellation': 'Up to 48dB Adaptive Hybrid ANC',
      'Playtime': 'Up to 40 Hours total with Charging Case',
      'Latency': '38ms Ultra-Low Latency Gaming Mode'
    },
    isTrending: false
  }
];
