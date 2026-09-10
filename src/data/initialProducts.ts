import { Product } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'omexo-wave-pro',
    title: 'Omexo Wave Pro Active Smartwatch',
    category: 'Smartwatches',
    description: 'Elevate your daily hustle with the Omexo Wave Pro. Featuring a gorgeous 1.96" AMOLED display, premium titanium-alloy chassis, dual-band GPS tracker, and custom sports tracking with real-time vitals monitoring. Crafted for the modern nomad with a rugged yet minimal aesthetic.',
    salePrice: 3499,
    regularPrice: 5999,
    stockCount: 45,
    images: [
      'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=600&q=80'
    ],
    specs: {
      'Display': '1.96" AMOLED Display (410x502 px, 1000 nits)',
      'Chassis': 'Titanium Alloy with Ceramic Back Cover',
      'Battery Life': 'Up to 10 days (typical use), 3 days (Always-On)',
      'Water Resistance': '5ATM & IP68 Dust & Water Proofing',
      'Sensors': 'Optical Heart Rate, SpO2 Blood Oxygen, 3-Axis Gyro',
      'Connectivity': 'Bluetooth 5.3 LE, Dual-Band GPS'
    },
    isTrending: true
  },
  {
    id: 'omexo-airbuds-max',
    title: 'Omexo Airbuds Max-T Dual Audio Buds',
    category: 'Audio',
    description: 'Immerse yourself in acoustic bliss. Built with dual-driver hybrid technology (10mm dynamic + balanced armature) and ultra-responsive Active Noise Cancellation up to 48dB. Features Mint Green-Teal accent rings for the ultimate premium visual style.',
    salePrice: 1999,
    regularPrice: 3999,
    stockCount: 60,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1608156639585-b3a032ef9689?auto=format&fit=crop&w=600&q=80'
    ],
    specs: {
      'Drivers': 'Dual Hybrid (10mm Coaxial Dynamic + Balanced Armature)',
      'Active Noise Cancellation': 'Up to 48dB Adaptive Hybrid ANC',
      'Playtime': 'Up to 40 Hours total with Charging Case',
      'Latency': '38ms Ultra-Low Latency Gaming Mode',
      'Microphones': '6 High-Definition Mics with Environmental Noise Cancellation (ENC)'
    },
    isTrending: true
  },
  {
    id: 'omexo-volt-120w',
    title: 'VoltCharge 120W GaN Wall Charger',
    category: 'Chargers',
    description: 'The last charger you will ever need. Packed with cutting-edge Gallium Nitride (GaN 5) technology, the VoltCharge delivers a massive 120W output over 3 multi-ports (2x USB-C, 1x USB-A) while running 20% cooler. Intelligently dynamically balances power output across active lines.',
    salePrice: 1499,
    regularPrice: 2499,
    stockCount: 120,
    images: [
      'https://images.unsplash.com/photo-1622445262465-2481c4574875?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80'
    ],
    specs: {
      'Total Output': '120W Max output',
      'Ports': '2x USB Type-C, 1x USB Type-A',
      'Technology': 'GaN 5 (Gallium Nitride) Semiconductor Tech',
      'Safety Protection': 'Over-current, over-voltage, short-circuit, high-temperature shields',
      'Compatibilities': 'PD 3.0, PPS, QC 4.0+, SuperVOOC, AFC'
    },
    isTrending: false
  },
  {
    id: 'omexo-magshield-carbon',
    title: 'Omexo MagShield Carbon Fiber Case',
    category: 'Phone Cases',
    description: 'Armor-grade protection with a slim featherweight profile. Crafted with authentic 1500D military-grade Aramid Carbon Fiber, this case features N52 ultra-strong neodymium magnetic arrays for solid MagSafe connection and deep slate textured gripping grids.',
    salePrice: 899,
    regularPrice: 1799,
    stockCount: 15,
    images: [
      'https://images.unsplash.com/photo-1601784551144-7ba5eb902c25?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=600&q=80'
    ],
    specs: {
      'Material': '100% Aerospace-grade 1500D Aramid Carbon Fiber',
      'Thickness': '0.95mm Ultra-Thin profile',
      'Weight': 'Just 12 grams',
      'Magnets': 'Integrated N52 Neodymium MagSafe Array (1200g pull strength)',
      'Camera Frame': 'Raised 1.2mm Aviation Aluminum defensive lip'
    },
    isTrending: false
  },
  {
    id: 'omexo-helix-3in1',
    title: 'Omexo Helix 3-in-1 Foldable Stand',
    category: 'Chargers',
    description: 'De-clutter your bedside table or office desk. The Omexo Helix simultaneously charges your iPhone, Apple Watch, and AirPods at maximum wireless speeds. Folds down to a 2cm thickness, making it the perfect compact travel accessory. Enhanced with an elegant mint green charging indicator.',
    salePrice: 2299,
    regularPrice: 3999,
    stockCount: 30,
    images: [
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80'
    ],
    specs: {
      'Wireless Output': '15W Phone, 5W Buds, 3W Watch charge lines',
      'Build Quality': 'Anodized Space Aluminum & Eco-Leather mats',
      'Angle Adjustment': '0° to 90° infinite friction hinges',
      'Input Port': 'USB Type-C (Requires 18W+ adapter)',
      'Indicator': 'Subtle Mint Green breathing LED'
    },
    isTrending: true
  },
  {
    id: 'omexo-flexicord-pd',
    title: 'FlexiCord Braided USB-C to USB-C Cable',
    category: 'Cables',
    description: 'The standard cable, perfected. Bulletproof Kevlar braid combined with dual-color high-density nylon weave guarantees over 50,000 extreme flex bends. Built-in e-marker chip supports stable, lightning-fast 100W Power Delivery and high-speed data syncing.',
    salePrice: 499,
    regularPrice: 999,
    stockCount: 200,
    images: [
      'https://images.unsplash.com/photo-1585143009493-965d276722f5?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1611532736597-ebb2d416853e?auto=format&fit=crop&w=600&q=80'
    ],
    specs: {
      'Power Delivery': 'Up to 100W (20V/5A) Power Delivery',
      'Data Speeds': 'USB 3.2 Gen 2 (up to 480 Mbps)',
      'Length': '2.0 Meters (6.6 Feet)',
      'Reinforcement': 'DuPont Kevlar armor core'
    },
    isTrending: false
  }
];
