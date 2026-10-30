const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

let pool = null;
let isUsingFallback = false;

// Embedded fallback store in case MySQL service is not yet running on host
let fallbackStore = null;

function initFallbackStore() {
  if (fallbackStore) return fallbackStore;

  // Initial mock data matching seed.sql
  fallbackStore = {
    contact_messages: [],
    users: [
      {
        id: 1,
        full_name: 'Nova Administrator',
        email: 'admin@nestandnova.com',
        password_hash: '$2a$10$hXDFBEpjOOh2I5Leziu5Zul2ytEBmgjHlxpj53XiIYmnu8oBucQbO', // admin123
        role: 'admin',
        phone: '+91 98450 01928',
        created_at: new Date()
      },
      {
        id: 2,
        full_name: 'Sarah Jenkins',
        email: 'customer@nestandnova.com',
        password_hash: '$2a$10$Zt6KxzzAnKxl0dNuRbWF9.4ua4Ai.z1Fx6R8jZllMJg6K2H7rWjmi', // customer123
        role: 'customer',
        phone: '+91 98450 12345',
        created_at: new Date()
      }
    ],
    addresses: [
      {
        id: 1,
        user_id: 2,
        address_type: 'shipping',
        full_name: 'Sarah Jenkins',
        phone: '+91 98450 12345',
        address_line1: '42, 100 Feet Road, Indiranagar',
        address_line2: 'Suite 4B, Near Metro Pillar 12',
        city: 'Bengaluru',
        state: 'Karnataka',
        postal_code: '560038',
        country: 'India',
        is_default: 1
      }
    ],
    categories: [
      { id: 1, name: 'Smartphones', slug: 'smartphones', department: 'electronics', description: 'Cutting-edge flagship & lifestyle smartphones', icon: 'fa-mobile-screen-button', image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02560?auto=format&fit=crop&w=600&q=80', display_order: 1 },
      { id: 2, name: 'Laptops', slug: 'laptops', department: 'electronics', description: 'High performance ultra-portables & creative workstations', icon: 'fa-laptop', image_url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80', display_order: 2 },
      { id: 3, name: 'Headphones', slug: 'headphones', department: 'electronics', description: 'Studio sound, spatial audio & active noise cancellation', icon: 'fa-headphones', image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80', display_order: 3 },
      { id: 4, name: 'Smart TVs', slug: 'smart-tvs', department: 'electronics', description: 'Cinema-grade OLED & 4K HDR displays with ambient art mode', icon: 'fa-tv', image_url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=600&q=80', display_order: 4 },
      { id: 5, name: 'Cameras', slug: 'cameras', department: 'electronics', description: 'Mirrorless precision cameras and cinema lenses', icon: 'fa-camera', image_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80', display_order: 5 },
      { id: 6, name: 'Smartwatches', slug: 'smartwatches', department: 'electronics', description: 'Wellness trackers, ECG monitors and sapphire crystal wearables', icon: 'fa-stopwatch', image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80', display_order: 6 },
      { id: 7, name: 'Speakers', slug: 'speakers', department: 'electronics', description: 'Architectural acoustic systems and wireless hi-fi speakers', icon: 'fa-volume-high', image_url: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80', display_order: 7 },
      { id: 8, name: 'Gaming', slug: 'gaming', department: 'electronics', description: 'Next-gen consoles, pro controllers & tactical headsets', icon: 'fa-gamepad', image_url: 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&w=600&q=80', display_order: 8 },
      { id: 9, name: 'Accessories', slug: 'accessories', department: 'electronics', description: 'Braided cables, wireless charging pads & minimalist docks', icon: 'fa-plug', image_url: 'https://images.unsplash.com/photo-1622445262464-84b1456045b6?auto=format&fit=crop&w=600&q=80', display_order: 9 },
      { id: 10, name: 'Sofas', slug: 'sofas', department: 'furniture', description: 'Scandinavian sectionals, bouclé lounges and modular seating', icon: 'fa-couch', image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80', display_order: 10 },
      { id: 11, name: 'Beds', slug: 'beds', department: 'furniture', description: 'Platform oak frames, upholstered headboards and organic mattresses', icon: 'fa-bed', image_url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80', display_order: 11 },
      { id: 12, name: 'Chairs', slug: 'chairs', department: 'furniture', description: 'Ergonomic task chairs, dining armchairs & sculptural accent seats', icon: 'fa-chair', image_url: 'https://images.unsplash.com/photo-1580481077190-736135889c88?auto=format&fit=crop&w=600&q=80', display_order: 12 },
      { id: 13, name: 'Tables', slug: 'tables', department: 'furniture', description: 'Solid walnut dining tables, travertine coffee & marble side tables', icon: 'fa-table', image_url: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=600&q=80', display_order: 13 },
      { id: 14, name: 'Wardrobes', slug: 'wardrobes', department: 'furniture', description: 'Sliding oak wardrobes, integrated LED dressers & closet systems', icon: 'fa-door-closed', image_url: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=600&q=80', display_order: 14 },
      { id: 15, name: 'Office Furniture', slug: 'office-furniture', department: 'furniture', description: 'Motorized standing desks, acoustic panels & executive storage', icon: 'fa-desktop', image_url: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=600&q=80', display_order: 15 },
      { id: 16, name: 'Lighting', slug: 'lighting', department: 'furniture', description: 'Architectural pendant lamps, diffused ambient floor lights & sconces', icon: 'fa-lightbulb', image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80', display_order: 16 },
      { id: 17, name: 'Storage', slug: 'storage', department: 'furniture', description: 'Minimalist sideboards, modular shelving and credenzas', icon: 'fa-box-archive', image_url: 'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&w=600&q=80', display_order: 17 },
      { id: 18, name: 'Home Decor', slug: 'home-decor', department: 'furniture', description: 'Ceramic vases, wool rugs, walnut mirror frames & linen throws', icon: 'fa-house', image_url: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=600&q=80', display_order: 18 }
    ],
    brands: [
      { id: 1, name: 'Sony', slug: 'sony' },
      { id: 2, name: 'Apple', slug: 'apple' },
      { id: 3, name: 'Bose', slug: 'bose' },
      { id: 4, name: 'Samsung', slug: 'samsung' },
      { id: 5, name: 'Herman Miller', slug: 'herman-miller' },
      { id: 6, name: 'Muuto', slug: 'muuto' },
      { id: 7, name: 'West Elm', slug: 'west-elm' },
      { id: 8, name: 'Hay Design', slug: 'hay-design' }
    ],
    products: [
      {
        id: 1,
        name: 'Aura ANC Wireless Studio Headphones',
        slug: 'aura-anc-wireless-headphones',
        brand_id: 3,
        category_id: 3,
        department: 'electronics',
        sku: 'ELC-HP-001',
        short_description: 'Spatial audio with custom active noise cancelation and 40-hour battery life.',
        description: 'Engineered for audio purists and modern creators. The Aura ANC combines custom 40mm biocellulose acoustic drivers with intelligent adaptive noise cancelation that measures ambient noise 50,000 times per second. Encased in bead-blasted anodized aluminum with ultra-soft lambskin ear cushions that provide unmatched comfort during long listening sessions.',
        price: 24999.00,
        original_price: 28999.00,
        discount_percent: 14,
        rating: 4.90,
        review_count: 148,
        stock_quantity: 45,
        is_featured: 1,
        is_trending: 1,
        is_new_arrival: 0,
        specifications: JSON.stringify({ "Driver Unit": "40mm Biocellulose Custom Drivers", "Battery Life": "Up to 40 Hours with ANC On", "Charging": "Type-C Fast Charge (15 mins = 5 hrs playback)", "Connectivity": "Bluetooth 5.3 + 3.5mm Hi-Res Audio Jack", "Noise Cancellation": "Adaptive Hybrid ANC with Transparency Mode", "Weight": "250 grams" }),
        dimensions: JSON.stringify({ "Height": "19.5 cm", "Width": "16.8 cm", "Depth": "7.5 cm" }),
        warranty_info: '2-Year Pan-India Replacement Warranty',
        return_policy: '7-Day Return & Replacement Policy',
        status: 'active'
      },
      {
        id: 2,
        name: 'Nova Titanium Flagship 5G Smartphone',
        slug: 'nova-titanium-flagship-smartphone',
        brand_id: 2,
        category_id: 1,
        department: 'electronics',
        sku: 'ELC-SP-002',
        short_description: 'Grade 5 titanium chassis with LTPO OLED 120Hz display and studio tri-camera system.',
        description: 'The pinnacle of handheld engineering. Crafted with aerospace-grade titanium that provides an exceptionally durable yet lightweight tactile experience. Powered by the ultra-efficient 3nm processor, an edge-to-edge 6.7-inch 120Hz ProMotion display, and a 48MP main sensor with sensor-shift optical image stabilization.',
        price: 79999.00,
        original_price: 89999.00,
        discount_percent: 11,
        rating: 4.95,
        review_count: 320,
        stock_quantity: 30,
        is_featured: 1,
        is_trending: 1,
        is_new_arrival: 1,
        specifications: JSON.stringify({ "Display": "6.7-inch Super Retina XDR OLED (120Hz ProMotion)", "Processor": "Next-Gen 3nm Octa-Core Chipset", "Primary Camera": "48MP Main + 12MP 5x Telephoto + 12MP Ultra-Wide", "Battery": "4600 mAh with MagSafe Wireless Charging", "Network": "5G Dual SIM" }),
        dimensions: JSON.stringify({ "Height": "15.9 cm", "Width": "7.6 cm", "Thickness": "0.82 cm" }),
        warranty_info: '1-Year Comprehensive Manufacturer Warranty',
        return_policy: '7-Day Replacement for Manufacturing Defects',
        status: 'active'
      },
      {
        id: 3,
        name: 'Starlight Pro 16 Ultrabook',
        slug: 'starlight-pro-16-ultrabook',
        brand_id: 2,
        category_id: 2,
        department: 'electronics',
        sku: 'ELC-LT-003',
        short_description: 'M-Series architecture with Liquid Retina XDR screen and all-day 22hr battery life.',
        description: 'Redefining creative capability wherever you go. The Starlight Pro 16 features an uncompromising thermal architecture that unlocks continuous maximum performance for 4K video rendering, 3D modeling, and software engineering. Fitted with an immersive 6-speaker sound system.',
        price: 159999.00,
        original_price: 179999.00,
        discount_percent: 11,
        rating: 4.88,
        review_count: 112,
        stock_quantity: 20,
        is_featured: 1,
        is_trending: 0,
        is_new_arrival: 1,
        specifications: JSON.stringify({ "Screen": "16.2-inch Liquid Retina XDR (3456x2234)", "Processor": "M3 Pro 12-Core CPU & 18-Core GPU", "Memory": "32GB Unified Memory", "Storage": "1TB PCIe Gen 4 NVMe SSD", "Battery": "Up to 22 Hours" }),
        dimensions: JSON.stringify({ "Width": "35.5 cm", "Depth": "24.8 cm", "Height": "1.68 cm" }),
        warranty_info: '2-Year Limited International Hardware Warranty',
        return_policy: '7-Day Return Policy',
        status: 'active'
      },
      {
        id: 4,
        name: 'Horizon 65" 4K OLED Ambient Smart TV',
        slug: 'horizon-65-4k-oled-ambient-smart-tv',
        brand_id: 4,
        category_id: 4,
        department: 'electronics',
        sku: 'ELC-TV-004',
        short_description: 'Self-lit pixel technology with matte gallery frame and Dolby Atmos acoustic surface.',
        description: 'Transform your living space into a private cinema. The Horizon OLED TV showcases infinite contrast with pure deep blacks and 100% color volume. When not watching your favorite films, activate Ambient Gallery Mode to display curated museum artworks and photography.',
        price: 139999.00,
        original_price: 159999.00,
        discount_percent: 13,
        rating: 4.82,
        review_count: 64,
        stock_quantity: 15,
        is_featured: 1,
        is_trending: 1,
        is_new_arrival: 0,
        specifications: JSON.stringify({ "Panel Size & Type": "65-inch (163 cm) 4K OLED", "Refresh Rate": "144Hz VRR / FreeSync Pro", "Audio": "60W 4.2.2 Channel Dolby Atmos Acoustic Sound", "Smart OS": "Tizen OS with Ambient Gallery Mode" }),
        dimensions: JSON.stringify({ "Width": "144.9 cm", "Height": "83.2 cm", "Depth": "2.4 cm" }),
        warranty_info: '3-Year Comprehensive Panel Warranty + Free Wall Mount Installation',
        return_policy: '10-Day Free In-Home Return Pickup',
        status: 'active'
      },
      {
        id: 5,
        name: 'Lumina Mark V Mirrorless Camera',
        slug: 'lumina-mark-v-mirrorless-camera',
        brand_id: 1,
        category_id: 5,
        department: 'electronics',
        sku: 'ELC-CAM-005',
        short_description: '61MP full-frame BSI sensor with AI subject-tracking autofocus and 8K cinematic recording.',
        description: 'A visual masterpiece in camera engineering. The Lumina Mark V captures staggering resolution with 15 stops of dynamic range. Featuring next-generation AI autofocus that detects humans, birds, vehicles, and wildlife with instant eye autofocus in real-time.',
        price: 219999.00,
        original_price: 249999.00,
        discount_percent: 12,
        rating: 4.96,
        review_count: 88,
        stock_quantity: 12,
        is_featured: 0,
        is_trending: 0,
        is_new_arrival: 1,
        specifications: JSON.stringify({ "Sensor": "61.0MP Full-Frame Back-Illuminated CMOS", "Video": "8K 24p / 4K 60p 10-bit 4:2:2 All-Intra", "Stabilization": "8.0-Stop 5-Axis In-Body Stabilization" }),
        dimensions: JSON.stringify({ "Width": "13.1 cm", "Height": "9.6 cm", "Depth": "8.2 cm" }),
        warranty_info: '2-Year Sony India Warranty',
        return_policy: '7-Day Replacement Policy',
        status: 'active'
      },
      {
        id: 6,
        name: 'Terra Sapphire Titanium Smartwatch',
        slug: 'terra-sapphire-titanium-smartwatch',
        brand_id: 2,
        category_id: 6,
        department: 'electronics',
        sku: 'ELC-SW-006',
        short_description: 'Dual-frequency GPS, sapphire glass screen, ECG, dive sensor, and 72-hour battery.',
        description: 'Designed for athletes, adventurers, and design enthusiasts. The Terra smartwatch is carved from a solid block of titanium and protected by scratch-resistant sapphire crystal glass.',
        price: 49999.00,
        original_price: 56999.00,
        discount_percent: 12,
        rating: 4.85,
        review_count: 140,
        stock_quantity: 40,
        is_featured: 1,
        is_trending: 1,
        is_new_arrival: 0,
        specifications: JSON.stringify({ "Chassis & Glass": "Aerospace Grade 5 Titanium + Sapphire Crystal", "Display": "1.92-inch Always-On OLED (2000 nits)", "Battery": "Up to 36 Hours Normal / 72 Hours Low Power", "Sensors": "ECG, SpO2 Blood Oxygen, Heart Rate" }),
        dimensions: JSON.stringify({ "Case Diameter": "49 mm", "Thickness": "14.4 mm" }),
        warranty_info: '1-Year Apple India Warranty',
        return_policy: '7-Day Replacement',
        status: 'active'
      },
      {
        id: 7,
        name: 'Symphony Walnut Hi-Fi Bookshelf Speakers',
        slug: 'symphony-walnut-hi-fi-bookshelf-speakers',
        brand_id: 1,
        category_id: 7,
        department: 'electronics',
        sku: 'ELC-SPK-007',
        short_description: 'Handcrafted solid walnut acoustic cabinet with ribbon tweeters and integrated streaming.',
        description: 'Where acoustic science meets timeless mid-century joinery. Symphony Bookshelf Speakers provide breathtaking vocal clarity and room-filling low end without needing an external amplifier.',
        price: 39999.00,
        original_price: 45999.00,
        discount_percent: 13,
        rating: 4.92,
        review_count: 76,
        stock_quantity: 18,
        is_featured: 1,
        is_trending: 1,
        is_new_arrival: 0,
        specifications: JSON.stringify({ "Power Output": "120 Watts RMS (Pair)", "Drivers": "1-inch Silk Dome Tweeter + 5.25-inch Woven Kevlar Woofer", "Frequency": "42 Hz – 28 kHz", "Inputs": "Optical, Coaxial, RCA Line-in, Bluetooth 5.2" }),
        dimensions: JSON.stringify({ "Height": "32.0 cm", "Width": "19.5 cm", "Depth": "24.0 cm" }),
        warranty_info: '3-Year Manufacturer Warranty',
        return_policy: '10-Day Safe Transit Guarantee',
        status: 'active'
      },
      {
        id: 8,
        name: 'Apex Precision Wireless Haptic Controller',
        slug: 'apex-precision-wireless-controller',
        brand_id: 1,
        category_id: 8,
        department: 'electronics',
        sku: 'ELC-GM-008',
        short_description: 'Hall-effect anti-drift joysticks with adaptive mechanical triggers and magnetic paddles.',
        description: 'Built for pinpoint accuracy and unmatched tactile response. The Apex features ultra-durable contactless magnetic Hall-effect thumbsticks that eliminate stick drift forever.',
        price: 9999.00,
        original_price: 11999.00,
        discount_percent: 17,
        rating: 4.78,
        review_count: 180,
        stock_quantity: 60,
        is_featured: 0,
        is_trending: 1,
        is_new_arrival: 1,
        specifications: JSON.stringify({ "Thumbsticks": "Anti-Drift Hall Effect Magnetic Sensors", "Switches": "Mechanical Microswitches (0.2ms actuation)", "Battery": "1200 mAh Rechargeable (Up to 20 Hours)", "Compatibility": "PC, PS5, Android, iOS" }),
        dimensions: JSON.stringify({ "Width": "16.0 cm", "Depth": "10.5 cm", "Height": "6.5 cm" }),
        warranty_info: '1-Year Replacement Warranty',
        return_policy: '7-Day Return Policy',
        status: 'active'
      },
      {
        id: 9,
        name: 'Orbit MagSafe Solid Walnut Wireless Charging Dock',
        slug: 'orbit-walnut-magsafe-wireless-dock',
        brand_id: 7,
        category_id: 9,
        department: 'electronics',
        sku: 'ELC-ACC-009',
        short_description: '3-in-1 fast wireless charging station crafted from American walnut and matte anodized brass.',
        description: 'Organize your nightstand or workspace with architectural refinement. Simultaneously charge your smartphone at 15W, smartwatch at full speed, and wireless earbuds on a sculpted soft-touch tray.',
        price: 7999.00,
        original_price: 9499.00,
        discount_percent: 16,
        rating: 4.91,
        review_count: 124,
        stock_quantity: 50,
        is_featured: 0,
        is_trending: 0,
        is_new_arrival: 1,
        specifications: JSON.stringify({ "Charging Speeds": "15W MagSafe Phone + 5W Watch + 5W Earbuds", "Material": "Solid American Walnut + Matte Zinc Alloy", "Power In": "USB-C 30W Power Delivery Adapter Included" }),
        dimensions: JSON.stringify({ "Length": "20.5 cm", "Width": "10.2 cm", "Height": "13.0 cm" }),
        warranty_info: '1-Year Craftsmanship Guarantee',
        return_policy: '7-Day Returns',
        status: 'active'
      },
      // Furniture
      {
        id: 10,
        name: 'Koto 3-Piece Modular Bouclé Chaise Sofa',
        slug: 'koto-3-piece-modular-boucle-sofa',
        brand_id: 6,
        category_id: 10,
        department: 'furniture',
        sku: 'FUR-SF-010',
        short_description: 'Deep-seated organic curves upholstered in premium stain-resistant textured cream bouclé.',
        description: 'The centerpiece of calm, elevated living. The Koto modular sectional blends Japanese minimalism with Scandinavian coziness. Built with an FSC-certified solid kiln-dried hardwood frame and high-resiliency dual-density foam wrapped in down-feather cushioning.',
        price: 89999.00,
        original_price: 104999.00,
        discount_percent: 14,
        rating: 4.93,
        review_count: 92,
        stock_quantity: 14,
        is_featured: 1,
        is_trending: 1,
        is_new_arrival: 0,
        specifications: JSON.stringify({ "Frame": "FSC Kiln-Dried European Birch & Pine", "Upholstery": "Tactile Bouclé (45,000 Martindale)", "Cushioning": "Dual-Density Pocket Springs + Down Wrap", "Assembly": "Free White-Glove In-Room Assembly Included" }),
        dimensions: JSON.stringify({ "Total Width": "285 cm", "Chaise Depth": "170 cm", "Height": "74 cm" }),
        warranty_info: '10-Year Structural Frame Warranty',
        return_policy: '14-Day In-Home Return Trial',
        status: 'active'
      },
      {
        id: 11,
        name: 'Nara Solid Oak Floating Platform Bed',
        slug: 'nara-solid-oak-floating-platform-bed',
        brand_id: 7,
        category_id: 11,
        department: 'furniture',
        sku: 'FUR-BD-011',
        short_description: 'Floating silhouette with built-in cantilever nightstands and integrated ambient soft backlighting.',
        description: 'Crafted with master-joiner Japanese mortise-and-tenon craftsmanship. The Nara floating bed creates an effortless illusion of suspension, grounding your bedroom in quiet tranquility.',
        price: 64999.00,
        original_price: 74999.00,
        discount_percent: 13,
        rating: 4.89,
        review_count: 68,
        stock_quantity: 18,
        is_featured: 1,
        is_trending: 0,
        is_new_arrival: 0,
        specifications: JSON.stringify({ "Wood": "100% Solid European White Oak", "Lighting": "Touch-Dimmable 2700K Warm LED", "Slats": "Sprung Beechwood Slat Support System" }),
        dimensions: JSON.stringify({ "Length": "218 cm", "Width": "194 cm", "Headboard Height": "78 cm" }),
        warranty_info: '10-Year Wood Integrity Guarantee',
        return_policy: '14-Day In-Home Trial',
        status: 'active'
      },
      {
        id: 12,
        name: 'Eames Aluminum Studio Ergonomic Task Chair',
        slug: 'eames-aluminum-studio-ergonomic-chair',
        brand_id: 5,
        category_id: 12,
        department: 'furniture',
        sku: 'FUR-CH-012',
        short_description: 'Iconic ribbed seating in full-grain cognac leather with polished cast-aluminum armature.',
        description: 'A design icon refined for the contemporary studio. The ribbed back conforms naturally to the contours of your spine, providing flexible comfort without the bulk of typical office chairs.',
        price: 34999.00,
        original_price: 39999.00,
        discount_percent: 12,
        rating: 4.95,
        review_count: 110,
        stock_quantity: 25,
        is_featured: 1,
        is_trending: 1,
        is_new_arrival: 0,
        specifications: JSON.stringify({ "Upholstery": "Top-Grain Italian Cognac Leather", "Base": "Die-Cast Polished Aluminum", "Ergonomics": "Class 4 Gas Lift, Synchro-Tilt with Tension Lock" }),
        dimensions: JSON.stringify({ "Width": "68 cm", "Depth": "65 cm", "Height": "98 - 108 cm" }),
        warranty_info: '5-Year Mechanical Warranty',
        return_policy: '14-Day Trial',
        status: 'active'
      },
      {
        id: 13,
        name: 'Solstice Live-Edge Solid Walnut Dining Table',
        slug: 'solstice-live-edge-walnut-dining-table',
        brand_id: 7,
        category_id: 13,
        department: 'furniture',
        sku: 'FUR-TB-013',
        short_description: 'Continuous live-edge American walnut slab with matte blackened steel trestle legs.',
        description: 'Every Solstice table is a one-of-a-kind natural sculpture. Sourced from responsibly harvested American black walnut slabs, highlighting deep grain variations and rich natural tones.',
        price: 79999.00,
        original_price: 92999.00,
        discount_percent: 14,
        rating: 4.91,
        review_count: 48,
        stock_quantity: 8,
        is_featured: 1,
        is_trending: 0,
        is_new_arrival: 1,
        specifications: JSON.stringify({ "Top Slab": "Solid American Black Walnut (4.5 cm thick slab)", "Base": "Industrial Heavy-Gauge Carbon Steel", "Capacity": "8 - 10 Persons" }),
        dimensions: JSON.stringify({ "Length": "240 cm", "Width": "100 cm", "Height": "76 cm" }),
        warranty_info: 'Lifetime Wood Structural Integrity Warranty',
        return_policy: 'White-Glove Delivery with Inspection Guarantee',
        status: 'active'
      },
      {
        id: 14,
        name: 'Aalto Minimalist Fluted Glass & Oak Wardrobe',
        slug: 'aalto-fluted-glass-oak-wardrobe',
        brand_id: 6,
        category_id: 14,
        department: 'furniture',
        sku: 'FUR-WD-014',
        short_description: 'Soft-closing fluted tempered glass sliding doors with warm internal automatic lighting.',
        description: 'The ultimate architectural closet storage. The Aalto Wardrobe conceals clutter behind elegant reeded glass panels that refract light with subtle mystery.',
        price: 94999.00,
        original_price: 109999.00,
        discount_percent: 14,
        rating: 4.80,
        review_count: 28,
        stock_quantity: 10,
        is_featured: 0,
        is_trending: 0,
        is_new_arrival: 0,
        specifications: JSON.stringify({ "Doors": "8mm Fluted Reeded Safety Glass with Silent Dampers", "Interior": "2 Hanging Rails, 4 Dovetail Drawers, 6 Adjustable Shelves", "Lighting": "Concealed 2700K Warm Sensor LED" }),
        dimensions: JSON.stringify({ "Width": "180 cm", "Height": "215 cm", "Depth": "62 cm" }),
        warranty_info: '5-Year Hardware & Glass Warranty',
        return_policy: 'White Glove Pre-Assembly Check',
        status: 'active'
      },
      {
        id: 15,
        name: 'Strata Motorized Solid Walnut Standing Desk',
        slug: 'strata-motorized-walnut-standing-desk',
        brand_id: 5,
        category_id: 15,
        department: 'furniture',
        sku: 'FUR-OF-015',
        short_description: 'Solid walnut ergonomic curved desktop with dual whisper-quiet Swedish lift motors.',
        description: 'Bring health and aesthetic harmony to your workday. The Strata standing desk combines the timeless warmth of a 1.25" thick solid American walnut tabletop with a commercial dual-motor lifting system.',
        price: 48999.00,
        original_price: 56999.00,
        discount_percent: 14,
        rating: 4.97,
        review_count: 142,
        stock_quantity: 35,
        is_featured: 1,
        is_trending: 1,
        is_new_arrival: 1,
        specifications: JSON.stringify({ "Top": "100% Solid American Walnut (1.25 inch)", "Motors": "Dual Silent Motors (< 38 dB)", "Height Range": "62 cm to 128 cm with 4 Presets", "Weight Capacity": "140 kg Dynamic Load" }),
        dimensions: JSON.stringify({ "Width": "152 cm (60\")", "Depth": "76 cm", "Thickness": "3.2 cm" }),
        warranty_info: '10-Year Motor & Steel Frame Warranty',
        return_policy: '14-Day In-Home Trial',
        status: 'active'
      },
      {
        id: 16,
        name: 'Lune Frosted Glass & Brass Pendant Light',
        slug: 'lune-frosted-glass-brass-pendant-light',
        brand_id: 8,
        category_id: 16,
        department: 'furniture',
        sku: 'FUR-LT-016',
        short_description: 'Hand-blown opaline glass orb floating within a solid spun brushed brass ring.',
        description: 'Like a celestial sphere suspended in space. Lune casts a soft, shadowless, glare-free ambient glow ideal for illuminating kitchen islands, reading nooks, or bedside retreats.',
        price: 14999.00,
        original_price: 17999.00,
        discount_percent: 17,
        rating: 4.83,
        review_count: 56,
        stock_quantity: 45,
        is_featured: 0,
        is_trending: 1,
        is_new_arrival: 0,
        specifications: JSON.stringify({ "Bulb Holder": "E27 Standard (Warm 2700K 9W LED Included)", "Metal": "Solid Spun Brushed Raw Brass", "Cord": "300 cm Adjustable Braided Linen" }),
        dimensions: JSON.stringify({ "Orb Diameter": "25 cm", "Brass Ring Diameter": "38 cm" }),
        warranty_info: '3-Year Luminaire Guarantee',
        return_policy: '7-Day Return Policy',
        status: 'active'
      },
      {
        id: 17,
        name: 'Forma 4-Door Fluted Credenza Sideboard',
        slug: 'forma-4-door-fluted-credenza-sideboard',
        brand_id: 6,
        category_id: 17,
        department: 'furniture',
        sku: 'FUR-ST-017',
        short_description: 'Rhythmically sculpted tambour doors with travertine stone top and brass feet.',
        description: 'The Forma sideboard strikes a dialogue between tactile timber and cool Italian travertine stone. The fluted doors wrap gracefully around rounded pill-shaped corners.',
        price: 59999.00,
        original_price: 69999.00,
        discount_percent: 14,
        rating: 4.86,
        review_count: 36,
        stock_quantity: 12,
        is_featured: 0,
        is_trending: 0,
        is_new_arrival: 0,
        specifications: JSON.stringify({ "Top Slab": "Solid Honed Roman Beige Travertine", "Body": "Solid American Walnut Tambour Glides", "Internal Storage": "4 Compartments with Adjustable Shelves" }),
        dimensions: JSON.stringify({ "Width": "175 cm", "Depth": "46 cm", "Height": "74 cm" }),
        warranty_info: '5-Year Structural Guarantee',
        return_policy: 'White-Glove Delivery with Unboxing',
        status: 'active'
      },
      {
        id: 18,
        name: 'Brutalist Ceramic Sculptural Vessel Trio',
        slug: 'brutalist-ceramic-sculptural-vessel-trio',
        brand_id: 8,
        category_id: 18,
        department: 'furniture',
        sku: 'FUR-HD-018',
        short_description: 'Set of three wheel-thrown matte stoneware vases with organic sand-textured glaze.',
        description: 'Designed by artisan potters to celebrate wabi-sabi authenticity. Display them as individual sculptural accents across your credenza or cluster them together with dried botanicals.',
        price: 6999.00,
        original_price: 8499.00,
        discount_percent: 18,
        rating: 4.90,
        review_count: 74,
        stock_quantity: 80,
        is_featured: 0,
        is_trending: 0,
        is_new_arrival: 1,
        specifications: JSON.stringify({ "Material": "High-Fired Stoneware Clay", "Glaze": "Raw Textured Sand Glaze", "Pieces": "Set of 3 (Tall 28cm, Round 18cm, Wide 14cm)" }),
        dimensions: JSON.stringify({ "Tall Vessel": "28 x 14 cm", "Round Vessel": "18 x 18 cm", "Wide Vessel": "14 x 22 cm" }),
        warranty_info: '1-Year Artisan Craft Guarantee',
        return_policy: '7-Day Safe Transit Guarantee',
        status: 'active'
      },
      {
        id: 19,
        name: 'Zenith Ultra 14 OLED Creator Laptop',
        slug: 'zenith-ultra-14-oled-creator-laptop',
        brand_id: 4,
        category_id: 2,
        department: 'electronics',
        sku: 'ELC-LT-019',
        short_description: 'Featherlight 1.1kg magnesium laptop with 2.8K 120Hz Lumina OLED touchscreen.',
        description: 'Designed for wanderers and visual storytellers. The Zenith Ultra 14 packs astonishing computing prowess into an ultra-thin 13.9mm magnesium-aluminum alloy body.',
        price: 119999.00,
        original_price: 134999.00,
        discount_percent: 11,
        rating: 4.79,
        review_count: 52,
        stock_quantity: 22,
        is_featured: 0,
        is_trending: 1,
        is_new_arrival: 0,
        specifications: JSON.stringify({ "Display": "14.0-inch 2.8K 120Hz OLED Touchscreen", "Processor": "Intel Core Ultra 7 with Intel AI Boost", "RAM & Storage": "32GB LPDDR5X + 1TB Gen 4 SSD", "Weight": "1.19 kg" }),
        dimensions: JSON.stringify({ "Width": "31.2 cm", "Depth": "22.0 cm", "Height": "1.39 cm" }),
        warranty_info: '2-Year On-Site Support Warranty',
        return_policy: '7-Day Return Policy',
        status: 'active'
      },
      {
        id: 20,
        name: 'Atelier Round Travertine Coffee Table',
        slug: 'atelier-round-travertine-coffee-table',
        brand_id: 7,
        category_id: 13,
        department: 'furniture',
        sku: 'FUR-TB-020',
        short_description: 'Sculptural monolithic low coffee table carved from solid honed Roman beige travertine.',
        description: 'Commanding presence in its purest geometric form. The Atelier coffee table features a thick circular travertine top resting upon three intersecting architectural slab legs.',
        price: 36999.00,
        original_price: 42999.00,
        discount_percent: 14,
        rating: 4.92,
        review_count: 58,
        stock_quantity: 16,
        is_featured: 0,
        is_trending: 1,
        is_new_arrival: 1,
        specifications: JSON.stringify({ "Material": "100% Genuine Italian Travertine", "Finish": "Honed Matte with Micro-Porous Sealant", "Weight": "48 kg Solid Stone" }),
        dimensions: JSON.stringify({ "Diameter": "90 cm (35.4\")", "Height": "38 cm" }),
        warranty_info: '5-Year Stone Integrity Warranty',
        return_policy: 'White-Glove In-Home Inspection',
        status: 'active'
      },
      {
        id: 21,
        name: 'Echo Pods Pro Active Noise Cancelling Earbuds',
        slug: 'echo-pods-pro-anc-earbuds',
        brand_id: 2,
        category_id: 3,
        department: 'electronics',
        sku: 'ELC-HP-021',
        short_description: 'Custom silicon acoustic architecture, transparency mode, and spatial audio with head tracking.',
        description: 'Remarkable studio sound nestled right inside your ear. Echo Pods Pro deliver twice as much active noise cancelation as previous generations with adaptive transparency.',
        price: 18999.00,
        original_price: 21999.00,
        discount_percent: 14,
        rating: 4.88,
        review_count: 195,
        stock_quantity: 75,
        is_featured: 0,
        is_trending: 0,
        is_new_arrival: 1,
        specifications: JSON.stringify({ "Battery": "6 Hours (30 Hours Total with Case)", "Microphones": "Dual Beamforming + Inward-Facing Voice Mic", "Water Resistance": "IP54" }),
        dimensions: JSON.stringify({ "Case Width": "6.0 cm", "Case Height": "4.5 cm" }),
        warranty_info: '1-Year Global Apple Warranty',
        return_policy: '7-Day Replacement',
        status: 'active'
      },
      {
        id: 22,
        name: 'Nordic Curved Oak Dining Armchair (Set of 2)',
        slug: 'nordic-curved-oak-dining-armchair-set',
        brand_id: 8,
        category_id: 12,
        department: 'furniture',
        sku: 'FUR-CH-022',
        short_description: 'Sculpted steam-bent solid white oak backrest with stain-resistant oatmeal woven fabric seat.',
        description: 'Graceful ergonomics tailored for long, intimate dinners. The Nordic armchair features a single continuous sweep of steam-bent solid oak that doubles as an ergonomic armrest and supportive backrest.',
        price: 28999.00,
        original_price: 33999.00,
        discount_percent: 15,
        rating: 4.94,
        review_count: 62,
        stock_quantity: 30,
        is_featured: 0,
        is_trending: 0,
        is_new_arrival: 0,
        specifications: JSON.stringify({ "Frame": "Steam-Bent Solid European White Oak", "Upholstery": "Oatmeal Linen-Blend", "Pack": "Set of 2 Chairs" }),
        dimensions: JSON.stringify({ "Width": "54 cm", "Depth": "52 cm", "Height": "76 cm" }),
        warranty_info: '5-Year Structural Frame Warranty',
        return_policy: '14-Day In-Home Trial',
        status: 'active'
      }
    ],
    product_images: [
      { id: 1, product_id: 1, image_url: 'assets/images/headphone.jpg', alt_text: 'Aura ANC Headphones', is_primary: 1 },
      { id: 2, product_id: 1, image_url: 'assets/images/headphone.jpg', alt_text: 'Aura ANC Headphones cushion detail', is_primary: 0 },
      { id: 3, product_id: 2, image_url: 'assets/images/smartphone.jpg', alt_text: 'Nova Titanium Smartphone', is_primary: 1 },
      { id: 4, product_id: 2, image_url: 'assets/images/smartphone.jpg', alt_text: 'Nova Titanium cameras', is_primary: 0 },
      { id: 5, product_id: 3, image_url: 'assets/images/laptop.jpg', alt_text: 'Starlight Pro 16 Ultrabook', is_primary: 1 },
      { id: 6, product_id: 4, image_url: 'assets/images/tv.jpg', alt_text: 'Horizon 65 OLED TV', is_primary: 1 },
      { id: 7, product_id: 5, image_url: 'assets/images/camera.jpg', alt_text: 'Lumina Mark V Mirrorless Camera', is_primary: 1 },
      { id: 8, product_id: 6, image_url: 'assets/images/smartwatch.jpg', alt_text: 'Terra Sapphire Titanium Smartwatch', is_primary: 1 },
      { id: 9, product_id: 7, image_url: 'assets/images/speaker.jpg', alt_text: 'Symphony Bookshelf Speakers', is_primary: 1 },
      { id: 10, product_id: 8, image_url: 'assets/images/controller.jpg', alt_text: 'Apex Precision Wireless Controller', is_primary: 1 },
      { id: 11, product_id: 9, image_url: 'assets/images/charger.jpg', alt_text: 'Orbit MagSafe Charging Dock', is_primary: 1 },
      { id: 12, product_id: 10, image_url: 'assets/images/sofa.jpg', alt_text: 'Koto 3-Piece Bouclé Sofa', is_primary: 1 },
      { id: 13, product_id: 10, image_url: 'assets/images/sofa.jpg', alt_text: 'Koto sectional angle view', is_primary: 0 },
      { id: 14, product_id: 11, image_url: 'assets/images/bed.jpg', alt_text: 'Nara Solid Oak Floating Bed', is_primary: 1 },
      { id: 15, product_id: 12, image_url: 'assets/images/chairtask.jpg', alt_text: 'Eames Studio Task Chair', is_primary: 1 },
      { id: 16, product_id: 13, image_url: 'assets/images/diningtable.jpg', alt_text: 'Solstice Live Edge Dining Table', is_primary: 1 },
      { id: 17, product_id: 14, image_url: 'assets/images/wardrobe.jpg', alt_text: 'Aalto Fluted Glass Wardrobe', is_primary: 1 },
      { id: 18, product_id: 15, image_url: 'assets/images/desk.jpg', alt_text: 'Strata Motorized Standing Desk', is_primary: 1 },
      { id: 19, product_id: 16, image_url: 'assets/images/lamp.jpg', alt_text: 'Lune Frosted Glass Pendant Light', is_primary: 1 },
      { id: 20, product_id: 17, image_url: 'assets/images/credenza.jpg', alt_text: 'Forma 4-Door Sideboard', is_primary: 1 },
      { id: 21, product_id: 18, image_url: 'assets/images/vase.jpg', alt_text: 'Brutalist Ceramic Vessel Trio', is_primary: 1 },
      { id: 22, product_id: 19, image_url: 'assets/images/laptopzenith.jpg', alt_text: 'Zenith Ultra 14 Laptop', is_primary: 1 },
      { id: 23, product_id: 20, image_url: 'assets/images/coffe table.jpg', alt_text: 'Atelier Travertine Coffee Table', is_primary: 1 },
      { id: 24, product_id: 21, image_url: 'assets/images/earbuds.jpg', alt_text: 'Echo Pods Pro Earbuds', is_primary: 1 },
      { id: 25, product_id: 22, image_url: 'assets/images/chair dining.jpg', alt_text: 'Nordic Curved Oak Dining Chairs', is_primary: 1 }
    ],
    product_variants: [
      { id: 1, product_id: 1, sku: 'ELC-HP-001-SAGE', variant_name: 'Sage Green & Walnut', variant_type: 'color', variant_value: 'Sage Green', additional_price: 0, stock_quantity: 20 },
      { id: 2, product_id: 1, sku: 'ELC-HP-001-BLK', variant_name: 'Obsidian Black', variant_type: 'color', variant_value: 'Obsidian Black', additional_price: 0, stock_quantity: 15 },
      { id: 3, product_id: 1, sku: 'ELC-HP-001-CREAM', variant_name: 'Sand Cream & Champagne', variant_type: 'color', variant_value: 'Sand Cream', additional_price: 1500, stock_quantity: 10 },
      { id: 4, product_id: 2, sku: 'ELC-SP-002-256', variant_name: '256GB - Natural Titanium', variant_type: 'storage', variant_value: '256GB', additional_price: 0, stock_quantity: 15 },
      { id: 5, product_id: 2, sku: 'ELC-SP-002-512', variant_name: '512GB - Natural Titanium', variant_type: 'storage', variant_value: '512GB', additional_price: 12000, stock_quantity: 10 },
      { id: 6, product_id: 2, sku: 'ELC-SP-002-1TB', variant_name: '1TB - Natural Titanium', variant_type: 'storage', variant_value: '1TB', additional_price: 24000, stock_quantity: 5 },
      { id: 7, product_id: 10, sku: 'FUR-SF-010-CREAM', variant_name: 'Warm Cream Bouclé', variant_type: 'material', variant_value: 'Warm Cream Bouclé', additional_price: 0, stock_quantity: 8 },
      { id: 8, product_id: 10, sku: 'FUR-SF-010-SAGE', variant_name: 'Sage Green Textured Velvet', variant_type: 'material', variant_value: 'Sage Velvet', additional_price: 6000, stock_quantity: 6 },
      { id: 9, product_id: 12, sku: 'FUR-CH-012-COG', variant_name: 'Cognac Italian Leather', variant_type: 'material', variant_value: 'Cognac Leather', additional_price: 0, stock_quantity: 15 },
      { id: 10, product_id: 12, sku: 'FUR-CH-012-BLK', variant_name: 'Matte Black Aniline Leather', variant_type: 'material', variant_value: 'Black Leather', additional_price: 0, stock_quantity: 10 },
      { id: 11, product_id: 15, sku: 'FUR-OF-015-60', variant_name: '60" Wide - Solid Walnut', variant_type: 'size', variant_value: '60 inch', additional_price: 0, stock_quantity: 20 },
      { id: 12, product_id: 15, sku: 'FUR-OF-015-72', variant_name: '72" Wide - Solid Walnut Executive', variant_type: 'size', variant_value: '72 inch', additional_price: 8000, stock_quantity: 15 }
    ],
    coupons: [
      { id: 1, code: 'WELCOME10', description: 'Welcome 10% Off Your First Order (Min ₹4,999)', discount_type: 'percentage', discount_value: 10.00, min_order_amount: 4999.00, max_discount_amount: 5000.00, usage_limit: 1000, times_used: 14, is_active: 1 },
      { id: 2, code: 'NOVA500', description: 'Flat ₹500 Off on Electronics or Furniture', discount_type: 'fixed', discount_value: 500.00, min_order_amount: 9999.00, max_discount_amount: 500.00, usage_limit: 500, times_used: 28, is_active: 1 },
      { id: 3, code: 'NOVA15', description: '15% Atelier Privilege Discount', discount_type: 'percentage', discount_value: 15.00, min_order_amount: 19999.00, max_discount_amount: 15000.00, usage_limit: 200, times_used: 5, is_active: 1 },
      { id: 4, code: 'FREESHIP', description: 'Complimentary Pan-India White-Glove Shipping', discount_type: 'fixed', discount_value: 499.00, min_order_amount: 2999.00, max_discount_amount: 499.00, usage_limit: 2000, times_used: 89, is_active: 1 }
    ],
    reviews: [
      { id: 1, product_id: 1, user_id: 2, rating: 5, title: 'Transcendent audio quality and comfort', comment: 'I wear these for 8 hours of video editing daily. The acoustic clarity is unmatched, and the walnut accents pair beautifully with my desk setup.', is_approved: 1, is_verified_purchase: 1, created_at: new Date() },
      { id: 2, product_id: 10, user_id: 2, rating: 5, title: 'The best sofa our family has ever owned', comment: 'The bouclé is incredibly soft yet surprisingly resistant to stains. The seating depth is perfection for relaxed weekend reading.', is_approved: 1, is_verified_purchase: 1, created_at: new Date() }
    ],
    carts: [],
    cart_items: [],
    wishlists: [],
    wishlist_items: [],
    orders: [
      {
        id: 1,
        order_number: 'NN-2026-98104',
        user_id: 2,
        subtotal_amount: 24999.00,
        discount_amount: 2499.90,
        shipping_fee: 0.00,
        tax_amount: 4049.84,
        total_amount: 26548.94,
        status: 'delivered',
        payment_status: 'paid',
        shipping_address: JSON.stringify({
          fullName: 'Sarah Jenkins',
          addressLine1: '42, 100 Feet Road, Indiranagar',
          addressLine2: 'Suite 4B, Near Metro Pillar 12',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560038',
          country: 'India',
          phone: '+91 98450 12345'
        }),
        shipping_method: 'White-Glove Pan-India Express Delivery',
        tracking_number: 'NN-BLR-884920',
        customer_email: 'customer@nestandnova.com',
        customer_name: 'Sarah Jenkins',
        customer_phone: '+91 98450 12345',
        notes: 'Please call before delivery.',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      }
    ],
    order_items: [
      {
        id: 1,
        order_id: 1,
        product_id: 1,
        variant_id: 1,
        product_name: 'Aura ANC Wireless Studio Headphones',
        variant_name: 'Sage Green & Walnut',
        sku: 'ELC-HP-001-SAGE',
        unit_price: 24999.00,
        quantity: 1,
        subtotal_price: 24999.00,
        image_url: 'assets/images/headphones.svg',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      }
    ],
    payments: [
      {
        id: 1,
        order_id: 1,
        payment_method: 'upi_razorpay',
        transaction_id: 'TXN-UPI-IND-998241',
        amount: 26548.94,
        currency: 'INR',
        status: 'succeeded',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      }
    ],
    newsletter_subscribers: []
  };

  return fallbackStore;
}

// Emulated SQL query runner for fallback store
function executeFallbackQuery(sql, params = []) {
  const store = initFallbackStore();
  const trimmed = sql.trim().replace(/;$/, '');
  const lower = trimmed.toLowerCase();

  // 1. SELECT COUNT / AGGREGATES / SELECT STATEMENTS
  if (lower.startsWith('select')) {
    // Determine main table from query
    let table = null;
    if (/\bfrom\s+[`]?users[`]?/i.test(trimmed)) table = 'users';
    else if (/\bfrom\s+[`]?categories[`]?/i.test(trimmed)) table = 'categories';
    else if (/\bfrom\s+[`]?brands[`]?/i.test(trimmed)) table = 'brands';
    else if (/\bfrom\s+[`]?products[`]?/i.test(trimmed)) table = 'products';
    else if (/\bfrom\s+[`]?product_images[`]?/i.test(trimmed)) table = 'product_images';
    else if (/\bfrom\s+[`]?product_variants[`]?/i.test(trimmed)) table = 'product_variants';
    else if (/\bfrom\s+[`]?orders[`]?/i.test(trimmed)) table = 'orders';
    else if (/\bfrom\s+[`]?order_items[`]?/i.test(trimmed)) table = 'order_items';
    else if (/\bfrom\s+[`]?reviews[`]?/i.test(trimmed)) table = 'reviews';
    else if (/\bfrom\s+[`]?coupons[`]?/i.test(trimmed)) table = 'coupons';
    else if (/\bfrom\s+[`]?addresses[`]?/i.test(trimmed)) table = 'addresses';
    else {
      const matchFrom = trimmed.match(/\bfrom\s+[`]?([a-zA-Z_]+)[`]?/i);
      if (matchFrom) table = matchFrom[1].toLowerCase();
    }

    // Custom handlers for key application queries
    if (table === 'users') {
      if (lower.includes('reset_token =') || lower.includes('reset_token=')) {
        const token = params[0];
        const found = store.users.find(u => u.reset_token === token);
        return [found ? [found] : []];
      }
      if (lower.includes('email =') || lower.includes('email=')) {
        const email = params[0]?.toLowerCase().trim();
        const found = store.users.find(u => u.email.toLowerCase() === email);
        return [found ? [found] : []];
      }
      if (lower.includes('id =') || lower.includes('id=')) {
        const id = parseInt(params[0], 10);
        const found = store.users.find(u => u.id === id);
        return [found ? [found] : []];
      }
      if (lower.includes('count(')) {
        return [[{ count: store.users.length }]];
      }
      return [store.users];
    }

    if (table === 'categories') {
      let list = [...store.categories];
      if (lower.includes('department =') || lower.includes('department=')) {
        const dept = params.find(p => p === 'electronics' || p === 'furniture') || params[0];
        list = list.filter(c => c.department === dept);
      }
      if (lower.includes('slug =') || lower.includes('slug=')) {
        const slug = params[0];
        list = list.filter(c => c.slug === slug);
      }
      if (lower.includes('like ?') || lower.includes('name like')) {
        const term = (params[0] || '').toString().replace(/%/g, '').toLowerCase().trim();
        if (term) list = list.filter(c => c.name.toLowerCase().includes(term) || c.slug.toLowerCase().includes(term));
      }
      list.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
      const limitMatch = trimmed.match(/limit\s+(\d+)/i);
      if (limitMatch) {
        list = list.slice(0, parseInt(limitMatch[1], 10));
      }
      return [list];
    }

    if (table === 'brands') {
      return [store.brands];
    }

    if (table === 'products') {
      let list = store.products.map(p => {
        const brand = store.brands.find(b => b.id === p.brand_id);
        const category = store.categories.find(c => c.id === p.category_id);
        const primaryImg = store.product_images.find(img => img.product_id === p.id && img.is_primary) || 
                           store.product_images.find(img => img.product_id === p.id);
        return {
          ...p,
          brand_name: brand ? brand.name : 'Nest & Nova Studio',
          category_name: category ? category.name : 'General',
          category_slug: category ? category.slug : '',
          primary_image: primaryImg ? primaryImg.image_url : null
        };
      });

      // Check count(*)
      if (lower.includes('count(*)')) {
        return [[{ count: list.length, 'count(*)': list.length, cnt: list.length }]];
      }

      // Filter by ID list: WHERE p.id IN (?, ?, ...)
      if (lower.includes('p.id in') || lower.includes('id in')) {
        const idParams = params.map(x => parseInt(x, 10)).filter(x => !isNaN(x));
        list = list.filter(p => idParams.includes(p.id));
        return [list];
      }

      // Filter by ID or Slug
      const idMatch = trimmed.match(/\bwhere\s+\(?p\.id\s*=\s*(\d+|\?)/i) || trimmed.match(/\bwhere\s+\(?id\s*=\s*(\d+|\?)/i);
      if (idMatch) {
        const idVal = idMatch[1] === '?' ? params[0] : parseInt(idMatch[1], 10);
        const item = list.find(p => p.id == idVal || p.slug === idVal);
        return [item ? [item] : []];
      }

      // Filter by Department
      if (lower.includes('p.department = ?') || lower.includes('department = ?')) {
        const deptParam = params.find(param => param === 'electronics' || param === 'furniture');
        if (deptParam) {
          list = list.filter(p => p.department === deptParam);
        }
      }

      // Filter by Category
      if (lower.includes('p.category_id = ?') || lower.includes('category_id = ?')) {
        const catId = parseInt(params.find(param => typeof param === 'number' || (!isNaN(param) && param !== 'electronics' && param !== 'furniture')), 10);
        if (catId) list = list.filter(p => p.category_id === catId);
      } else if (lower.includes('c.slug = ?') || lower.includes('lower(c.name) = ?')) {
        const catSlug = params.find(param => typeof param === 'string' && param !== 'electronics' && param !== 'furniture');
        if (catSlug) {
          const s = catSlug.toLowerCase().replace(/[^a-z0-9]/g, '');
          list = list.filter(p => (p.category_slug && p.category_slug.replace(/[^a-z0-9]/g, '') === s) || (p.category_name && p.category_name.toLowerCase().replace(/[^a-z0-9]/g, '').includes(s)));
        }
      }

      // Filter by Brand
      if (lower.includes('b.name = ?') || lower.includes('p.brand_id = ?') || lower.includes('b.slug = ?')) {
        const brandStr = params.find(param => typeof param === 'string' && param !== 'electronics' && param !== 'furniture');
        const brandNum = params.find(param => typeof param === 'number');
        if (brandNum) {
          list = list.filter(p => p.brand_id === brandNum);
        } else if (brandStr) {
          list = list.filter(p => p.brand_name && p.brand_name.toLowerCase() === brandStr.toLowerCase());
        }
      }

      // Filter by Featured / Trending
      if (lower.includes('is_featured = 1')) list = list.filter(p => p.is_featured);
      if (lower.includes('is_trending = 1')) list = list.filter(p => p.is_trending);

      // Search keyword
      if (lower.includes('like ?')) {
        const term = (params[0] || '').toString().replace(/%/g, '').toLowerCase().trim();
        if (term) {
          list = list.filter(p => 
            p.name.toLowerCase().includes(term) || 
            (p.short_description && p.short_description.toLowerCase().includes(term)) ||
            (p.brand_name && p.brand_name.toLowerCase().includes(term))
          );
        }
      }

      // Sorting
      if (lower.includes('order by p.price asc') || lower.includes('order by price asc')) {
        list.sort((a, b) => a.price - b.price);
      } else if (lower.includes('order by p.price desc') || lower.includes('order by price desc')) {
        list.sort((a, b) => b.price - a.price);
      } else if (lower.includes('order by p.rating desc') || lower.includes('order by rating desc')) {
        list.sort((a, b) => b.rating - a.rating);
      } else if (lower.includes('order by p.review_count desc')) {
        list.sort((a, b) => b.review_count - a.review_count);
      } else {
        list.sort((a, b) => b.id - a.id);
      }

      // Outer query pagination (at end of query)
      const limitMatch = trimmed.match(/limit\s+(\d+)(?:\s+offset\s+(\d+))?\s*$/i);
      if (limitMatch) {
        const limit = parseInt(limitMatch[1], 10);
        const offset = parseInt(limitMatch[2] || '0', 10);
        list = list.slice(offset, offset + limit);
      }

      return [list];
    }

    if (table === 'product_images') {
      const prodId = parseInt(params[0], 10);
      const images = store.product_images.filter(img => img.product_id === prodId);
      return [images];
    }

    if (table === 'product_variants') {
      const prodId = parseInt(params[0], 10);
      const variants = store.product_variants.filter(v => v.product_id === prodId);
      return [variants];
    }

    if (table === 'coupons') {
      if (lower.includes('code =') || lower.includes('code=')) {
        const code = (params[0] || '').toString().toUpperCase().trim();
        const found = store.coupons.find(c => c.code === code && c.is_active);
        return [found ? [found] : []];
      }
      return [store.coupons];
    }

    if (table === 'reviews') {
      const prodId = parseInt(params[0], 10);
      const reviews = store.reviews
        .filter(r => r.product_id === prodId && r.is_approved)
        .map(r => {
          const u = store.users.find(user => user.id === r.user_id);
          return { ...r, user_name: u ? u.full_name : 'Verified Customer' };
        });
      return [reviews];
    }

    if (table === 'orders') {
      if (lower.includes('order_number =') || lower.includes('where id =') || lower.includes('where o.id =')) {
        const p1 = params[0];
        const p2 = params[1];
        const num1 = parseInt(p1, 10);
        const num2 = parseInt(p2, 10);
        const order = store.orders.find(o => 
          o.order_number === p1 || 
          o.order_number === p2 || 
          (!isNaN(num1) && o.id === num1) || 
          (!isNaN(num2) && o.id === num2)
        );
        return [order ? [order] : []];
      }
      if (lower.includes('user_id =')) {
        const uid = parseInt(params[0], 10);
        const userOrders = store.orders.filter(o => o.user_id === uid);
        userOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        return [userOrders];
      }
      let allOrders = [...store.orders];
      allOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return [allOrders];
    }

    if (table === 'order_items') {
      if (lower.includes('inner join orders')) {
        const uid = parseInt(params[0], 10);
        const prodId = parseInt(params[1], 10);
        const hasPurchased = store.orders.some(o => 
          o.user_id === uid && 
          ['processing', 'shipped', 'delivered'].includes(o.status) &&
          store.order_items.some(oi => oi.order_id === o.id && oi.product_id === prodId)
        );
        return [hasPurchased ? [{ id: 1 }] : []];
      }
      const orderId = parseInt(params[0], 10);
      const items = store.order_items.filter(oi => oi.order_id === orderId);
      return [items];
    }

    if (table === 'contact_messages') {
      return [store.contact_messages || []];
    }

    if (table === 'addresses') {
      const uid = parseInt(params[0], 10);
      const addrs = store.addresses.filter(a => a.user_id === uid);
      return [addrs];
    }

    // Default count fallback
    if (lower.includes('count(')) {
      return [[{ count: 0 }]];
    }

    return [[]];
  }

  // 2. INSERT STATEMENTS
  if (lower.startsWith('insert into')) {
    const tableMatch = trimmed.match(/insert\s+into\s+[`]?([a-zA-Z_]+)[`]?/i);
    const table = tableMatch ? tableMatch[1].toLowerCase() : null;

    if (table && store[table]) {
      const newId = store[table].length > 0 ? Math.max(...store[table].map(x => x.id || 0)) + 1 : 1;
      const record = { id: newId, created_at: new Date() };

      if (table === 'users') {
        record.full_name = params[0];
        record.email = params[1];
        record.password_hash = params[2];
        record.role = params[3] || 'customer';
        record.phone = params[4] || null;
      } else if (table === 'orders') {
        record.order_number = params[0];
        record.user_id = params[1];
        record.subtotal_amount = params[2];
        record.discount_amount = params[3];
        record.shipping_fee = params[4];
        record.tax_amount = params[5];
        record.total_amount = params[6];
        record.status = params[7] || 'processing';
        record.payment_status = params[8] || 'paid';
        record.shipping_address = params[9];
        record.billing_address = params[10] || null;
        record.shipping_method = params[11] || 'White-Glove Express Delivery';
        record.customer_email = params[12];
        record.customer_name = params[13];
        record.customer_phone = params[14];
        record.notes = params[15] || null;
        record.guest_access_token = params[16] || null;
        record.tracking_number = 'NN-' + Math.floor(100000000 + Math.random() * 900000000);
      } else if (table === 'contact_messages') {
        record.name = params[0];
        record.email = params[1];
        record.department = params[2] || 'General';
        record.subject = params[3] || 'Concierge Inquiry';
        record.message = params[4];
        record.is_resolved = false;
      } else if (table === 'order_items') {
        record.order_id = params[0];
        record.product_id = params[1];
        record.variant_id = params[2];
        record.product_name = params[3];
        record.variant_name = params[4];
        record.sku = params[5];
        record.unit_price = params[6];
        record.quantity = params[7];
        record.subtotal_price = params[8];
        record.image_url = params[9];
      } else if (table === 'payments') {
        record.order_id = params[0];
        record.payment_method = params[1];
        record.transaction_id = params[2];
        record.amount = params[3];
        record.currency = params[4] || 'USD';
        record.status = params[5] || 'succeeded';
      } else if (table === 'addresses') {
        record.user_id = params[0];
        record.address_type = params[1] || 'shipping';
        record.full_name = params[2];
        record.phone = params[3];
        record.address_line1 = params[4];
        record.address_line2 = params[5];
        record.city = params[6];
        record.state = params[7];
        record.postal_code = params[8];
        record.country = params[9] || 'United States';
        record.is_default = 1;
      } else if (table === 'reviews') {
        record.product_id = params[0];
        record.user_id = params[1];
        record.rating = params[2];
        record.title = params[3];
        record.comment = params[4];
        record.is_approved = 1;
        record.is_verified_purchase = 1;
      } else if (table === 'products') {
        record.name = params[0];
        record.slug = params[1];
        record.brand_id = params[2];
        record.category_id = params[3];
        record.department = params[4];
        record.sku = params[5];
        record.short_description = params[6];
        record.description = params[7];
        record.price = params[8];
        record.original_price = params[9];
        record.discount_percent = params[10] || 0;
        record.rating = 5.0;
        record.review_count = 0;
        record.stock_quantity = params[11] || 10;
        record.is_featured = params[12] ? 1 : 0;
        record.is_trending = 0;
        record.is_new_arrival = 1;
        record.specifications = params[13] || '{}';
        record.dimensions = params[14] || '{}';
        record.status = 'active';
      } else if (table === 'product_images') {
        record.product_id = params[0];
        record.image_url = params[1];
        record.alt_text = params[2];
        record.is_primary = params[3] ? 1 : 0;
      } else if (table === 'newsletter_subscribers') {
        record.email = params[0];
      }

      store[table].push(record);
      return [{ insertId: newId, affectedRows: 1 }];
    }
    return [{ insertId: 1, affectedRows: 1 }];
  }

  // 3. UPDATE STATEMENTS
  if (lower.startsWith('update')) {
    const tableMatch = trimmed.match(/update\s+[`]?([a-zA-Z_]+)[`]?/i);
    const table = tableMatch ? tableMatch[1].toLowerCase() : null;

    if (table && store[table]) {
      if (table === 'orders' && lower.includes('status =')) {
        const status = params[0];
        const id = parseInt(params[1], 10);
        const order = store.orders.find(o => o.id === id);
        if (order) order.status = status;
      }
      if (table === 'products' && lower.includes('stock_quantity = stock_quantity -')) {
        const qty = parseInt(params[0], 10);
        const id = parseInt(params[1], 10);
        const prod = store.products.find(p => p.id === id);
        if (!prod || prod.stock_quantity < qty) {
          return [{ affectedRows: 0 }];
        }
        prod.stock_quantity = prod.stock_quantity - qty;
        return [{ affectedRows: 1 }];
      }
      if (table === 'users') {
        if (lower.includes('reset_token = ?')) {
          const token = params[0];
          const expires = params[1];
          const uid = parseInt(params[2], 10);
          const u = store.users.find(x => x.id === uid);
          if (u) { u.reset_token = token; u.reset_token_expires = expires; }
        } else if (lower.includes('reset_token = null')) {
          const hash = params[0];
          const uid = parseInt(params[1], 10);
          const u = store.users.find(x => x.id === uid);
          if (u) { u.password_hash = hash; u.reset_token = null; u.reset_token_expires = null; }
        } else if (lower.includes('password_hash = ?')) {
          const hash = params[0];
          const uid = parseInt(params[1], 10);
          const u = store.users.find(x => x.id === uid);
          if (u) u.password_hash = hash;
        } else if (lower.includes('full_name = ?')) {
          const name = params[0];
          const phone = params[1];
          const uid = parseInt(params[2], 10);
          const u = store.users.find(x => x.id === uid);
          if (u) { u.full_name = name; u.phone = phone; }
        }
      }
      if (table === 'coupons' && lower.includes('times_used = times_used + 1')) {
        const code = (params[0] || '').toString().toUpperCase().trim();
        const c = store.coupons.find(x => x.code === code);
        if (c) c.times_used = (c.times_used || 0) + 1;
      }
      return [{ affectedRows: 1 }];
    }
  }

  // 4. DELETE STATEMENTS
  if (lower.startsWith('delete from')) {
    const tableMatch = trimmed.match(/delete\s+from\s+[`]?([a-zA-Z_]+)[`]?/i);
    const table = tableMatch ? tableMatch[1].toLowerCase() : null;
    if (table && store[table]) {
      const id = parseInt(params[0], 10);
      const index = store[table].findIndex(item => item.id === id);
      if (index !== -1) store[table].splice(index, 1);
      return [{ affectedRows: 1 }];
    }
  }

  return [[]];
}

async function initializeDatabase() {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'nest_and_nova';

  try {
    const tempPool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 2000
    });

    // Test connection
    const conn = await tempPool.getConnection();
    conn.release();

    pool = tempPool;
    isUsingFallback = false;
    console.log(`[Database] Connected successfully to MySQL (${host}:${port}/${database})`);
  } catch (error) {
    if (process.env.NODE_ENV === 'production') {
      console.error(`[CRITICAL] Production MySQL connection failed: ${error.message}. In-memory fallback is strictly disabled in production.`);
      throw new Error(`Production database connection failed: ${error.message}`);
    }
    console.warn(`[Database] MySQL connection notice: (${error.message}).`);
    console.log(`[Database] Activating High-Performance In-Memory Relational Engine.`);
    console.log(`[Database] All 22 products, categories, reviews, auth, and checkout are fully active.`);
    console.log(`[Database] To use MySQL: Start your MySQL service and run "npm run db:setup" then "npm run db:seed".`);
    isUsingFallback = true;
    initFallbackStore();
  }
}

// Wrapper for query matching mysql2
async function query(sql, params = []) {
  if (isUsingFallback || !pool) {
    return executeFallbackQuery(sql, params);
  }
  try {
    return await pool.query(sql, params);
  } catch (err) {
    if (err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_CONNECTION_LOST') {
      isUsingFallback = true;
      return executeFallbackQuery(sql, params);
    }
    throw err;
  }
}

// Wrapper for transactions
async function getConnection() {
  if (isUsingFallback || !pool) {
    return {
      query: async (sql, params) => executeFallbackQuery(sql, params),
      beginTransaction: async () => {},
      commit: async () => {},
      rollback: async () => {},
      release: () => {}
    };
  }
  return await pool.getConnection();
}

module.exports = {
  initializeDatabase,
  query,
  getConnection,
  get isFallback() {
    return isUsingFallback;
  }
};
