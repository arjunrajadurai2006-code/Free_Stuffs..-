-- NEST & NOVA Database Seed Data
USE `nest_and_nova`;

-- 1. Insert Initial Users (admin & customer)
INSERT INTO `users` (`id`, `full_name`, `email`, `password_hash`, `role`, `phone`) VALUES
(1, 'Nova Administrator', 'admin@nestandnova.com', '$2a$10$hXDFBEpjOOh2I5Leziu5Zul2ytEBmgjHlxpj53XiIYmnu8oBucQbO', 'admin', '+91 98450 01928'),
(2, 'Sarah Jenkins', 'customer@nestandnova.com', '$2a$10$Zt6KxzzAnKxl0dNuRbWF9.4ua4Ai.z1Fx6R8jZllMJg6K2H7rWjmi', 'customer', '+91 98450 12345')
ON DUPLICATE KEY UPDATE `email` = VALUES(`email`);

-- 2. Insert Customer Addresses
INSERT INTO `addresses` (`id`, `user_id`, `address_type`, `full_name`, `phone`, `address_line1`, `address_line2`, `city`, `state`, `postal_code`, `country`, `is_default`) VALUES
(1, 2, 'shipping', 'Sarah Jenkins', '+91 98450 12345', '42, 100 Feet Road, Indiranagar', 'Suite 4B, Near Metro Pillar 12', 'Bengaluru', 'Karnataka', '560038', 'India', 1)
ON DUPLICATE KEY UPDATE `address_line1` = VALUES(`address_line1`);

-- 3. Insert Categories with requested icons
INSERT INTO `categories` (`id`, `name`, `slug`, `department`, `description`, `icon`, `image_url`, `display_order`) VALUES
-- Electronics
(1, 'Smartphones', 'smartphones', 'electronics', 'Cutting-edge flagship & lifestyle smartphones', 'fa-mobile-screen-button', 'https://images.unsplash.com/photo-1511707171634-5f897ff02560?auto=format&fit=crop&w=600&q=80', 1),
(2, 'Laptops', 'laptops', 'electronics', 'High performance ultra-portables & creative workstations', 'fa-laptop', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80', 2),
(3, 'Headphones', 'headphones', 'electronics', 'Studio sound, spatial audio & active noise cancellation', 'fa-headphones', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80', 3),
(4, 'Smart TVs', 'smart-tvs', 'electronics', 'Cinema-grade OLED & 4K HDR displays with ambient art mode', 'fa-tv', 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=600&q=80', 4),
(5, 'Cameras', 'cameras', 'electronics', 'Mirrorless precision cameras and cinema lenses', 'fa-camera', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80', 5),
(6, 'Smartwatches', 'smartwatches', 'electronics', 'Wellness trackers, ECG monitors and sapphire crystal wearables', 'fa-stopwatch', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80', 6),
(7, 'Speakers', 'speakers', 'electronics', 'Architectural acoustic systems and wireless hi-fi speakers', 'fa-volume-high', 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80', 7),
(8, 'Gaming', 'gaming', 'electronics', 'Next-gen consoles, pro controllers & tactical headsets', 'fa-gamepad', 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&w=600&q=80', 8),
(9, 'Accessories', 'accessories', 'electronics', 'Braided cables, wireless charging pads & minimalist docks', 'fa-plug', 'https://images.unsplash.com/photo-1622445262464-84b1456045b6?auto=format&fit=crop&w=600&q=80', 9),
-- Furniture
(10, 'Sofas', 'sofas', 'furniture', 'Scandinavian sectionals, bouclé lounges and modular seating', 'fa-couch', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80', 10),
(11, 'Beds', 'beds', 'furniture', 'Platform oak frames, upholstered headboards and organic mattresses', 'fa-bed', 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80', 11),
(12, 'Chairs', 'chairs', 'furniture', 'Ergonomic task chairs, dining armchairs & sculptural accent seats', 'fa-chair', 'https://images.unsplash.com/photo-1580481077190-736135889c88?auto=format&fit=crop&w=600&q=80', 12),
(13, 'Tables', 'tables', 'furniture', 'Solid walnut dining tables, travertine coffee & marble side tables', 'fa-table', 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=600&q=80', 13),
(14, 'Wardrobes', 'wardrobes', 'furniture', 'Sliding oak wardrobes, integrated LED dressers & closet systems', 'fa-door-closed', 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=600&q=80', 14),
(15, 'Office Furniture', 'office-furniture', 'furniture', 'Motorized standing desks, acoustic panels & executive storage', 'fa-desktop', 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=600&q=80', 15),
(16, 'Lighting', 'lighting', 'furniture', 'Architectural pendant lamps, diffused ambient floor lights & sconces', 'fa-lightbulb', 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80', 16),
(17, 'Storage', 'storage', 'furniture', 'Minimalist sideboards, modular shelving and credenzas', 'fa-box-archive', 'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&w=600&q=80', 17),
(18, 'Home Decor', 'home-decor', 'furniture', 'Ceramic vases, wool rugs, walnut mirror frames & linen throws', 'fa-house', 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=600&q=80', 18)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 4. Insert Brands
INSERT INTO `brands` (`id`, `name`, `slug`, `logo_url`, `description`) VALUES
(1, 'Sony', 'sony', 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=200&q=80', 'Japanese engineering excellence in sound, vision, and optics.'),
(2, 'Apple', 'apple', 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=200&q=80', 'Harmonious industrial design and groundbreaking consumer tech.'),
(3, 'Bose', 'bose', 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=200&q=80', 'Acoustic pioneers delivering quiet comfort and deep audio fidelity.'),
(4, 'Samsung', 'samsung', 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=200&q=80', 'Display technology innovators and connected home solutions.'),
(5, 'Herman Miller', 'herman-miller', 'https://images.unsplash.com/photo-1580481077190-736135889c88?auto=format&fit=crop&w=200&q=80', 'World leader in ergonomic seating and progressive modern furnishings.'),
(6, 'Muuto', 'muuto', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=200&q=80', 'Rooted in Scandinavian design tradition with new contemporary perspectives.'),
(7, 'West Elm', 'west-elm', 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=200&q=80', 'Modern furniture and sustainable home decor tailored for everyday life.'),
(8, 'Hay Design', 'hay-design', 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=200&q=80', 'Danish design house creating vibrant, accessible modern interior products.')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 5. Insert Sample Products (22 realistic, rich products across Electronics & Furniture)
INSERT INTO `products` (`id`, `name`, `slug`, `brand_id`, `category_id`, `department`, `sku`, `short_description`, `description`, `price`, `original_price`, `discount_percent`, `rating`, `review_count`, `stock_quantity`, `is_featured`, `is_trending`, `is_new_arrival`, `specifications`, `dimensions`, `warranty_info`, `return_policy`, `status`) VALUES
-- 1. Electronics - Headphones
(1, 'Aura ANC Wireless Studio Headphones', 'aura-anc-wireless-headphones', 3, 3, 'electronics', 'ELC-HP-001', 'Spatial audio with custom active noise cancelation and 40-hour battery life.', 'Engineered for audio purists and modern creators. The Aura ANC combines custom 40mm biocellulose acoustic drivers with intelligent adaptive noise cancelation that measures ambient noise 50,000 times per second. Encased in bead-blasted anodized aluminum with ultra-soft lambskin ear cushions that provide unmatched comfort during long listening sessions.', 24999.00, 28999.00, 14, 4.90, 148, 45, 1, 1, 0, 
'{"Driver Size": "40mm Biocellulose", "Battery Life": "40 Hours", "Connectivity": "Bluetooth 5.3 & 3.5mm Hi-Res Audio", "Weight": "250g", "Charging": "USB-C Fast Charging (15 min gives 5 hours)"}', 
'{"Height": "19.5 cm", "Width": "16.8 cm", "Depth": "7.5 cm"}', '2-Year Pan-India Replacement Warranty', '7-Day Return & Replacement Policy', 'active'),

-- 2. Electronics - Smartphone
(2, 'Nova Titanium Flagship 5G Smartphone', 'nova-titanium-flagship-smartphone', 2, 1, 'electronics', 'ELC-SP-002', 'Grade 5 titanium chassis with LTPO OLED 120Hz display and studio tri-camera system.', 'The pinnacle of handheld engineering. Crafted with aerospace-grade titanium that provides an exceptionally durable yet lightweight tactile experience. Powered by the ultra-efficient 3nm processor, an edge-to-edge 6.7-inch 120Hz ProMotion display, and a 48MP main sensor with sensor-shift optical image stabilization for pristine photos even in low light.', 79999.00, 89999.00, 11, 4.95, 320, 30, 1, 1, 1,
'{"Display": "6.7-inch LTPO OLED 120Hz HDR", "Processor": "3nm Octa-Core Chipset", "Storage Options": "256GB / 512GB / 1TB", "Camera": "48MP Main + 12MP Telephoto 5x + 12MP Ultra-Wide", "Battery": "4600 mAh with MagWireless charging"}',
'{"Height": "15.9 cm", "Width": "7.6 cm", "Thickness": "0.82 cm"}', '1-Year Comprehensive Manufacturer Warranty', '7-Day Replacement for Manufacturing Defects', 'active'),

-- 3. Electronics - Laptop
(3, 'Starlight Pro 16 Ultrabook', 'starlight-pro-16-ultrabook', 2, 2, 'electronics', 'ELC-LT-003', 'M-Series architecture with Liquid Retina XDR screen and all-day 22hr battery life.', 'Redefining creative capability wherever you go. The Starlight Pro 16 features an uncompromising thermal architecture that unlocks continuous maximum performance for 4K video rendering, 3D modeling, and software engineering. Fitted with an immersive 6-speaker sound system with force-cancelling woofers and studio microphones.', 159999.00, 179999.00, 11, 4.88, 112, 20, 1, 0, 1,
'{"Screen": "16.2-inch Liquid Retina XDR (3456x2234)", "Memory": "32GB Unified Memory", "Storage": "1TB NVMe PCIe 4.0 SSD", "Ports": "3x Thunderbolt 4, HDMI 2.1, MagSafe 3", "Battery": "100Wh (up to 22 hrs)"}',
'{"Width": "35.5 cm", "Depth": "24.8 cm", "Height": "1.68 cm"}', '2-Year Limited International Hardware Warranty', '7-Day Return Policy', 'active'),

-- 4. Electronics - Smart TV
(4, 'Horizon 65" 4K OLED Ambient Smart TV', 'horizon-65-4k-oled-ambient-smart-tv', 4, 4, 'electronics', 'ELC-TV-004', 'Self-lit pixel technology with matte gallery frame and Dolby Atmos acoustic surface.', 'Transform your living space into a private cinema. The Horizon OLED TV showcases infinite contrast with pure deep blacks and 100% color volume. When not watching your favorite films, activate Ambient Gallery Mode to display curated museum artworks and photography that blend seamlessly into your wall decor.', 139999.00, 159999.00, 13, 4.82, 64, 15, 1, 1, 0,
'{"Resolution": "3840 x 2160 (4K UHD OLED)", "Refresh Rate": "144Hz Native VRR", "Audio": "60W 4.2ch Dolby Atmos & DTS:X", "Smart OS": "Tizen OS with Ambient Gallery Mode", "HDMI": "4x HDMI 2.1"}',
'{"Width": "144.9 cm", "Height": "83.2 cm", "Depth": "2.4 cm (Without Stand)"}', '3-Year Panel & In-Home Service Warranty', '10-Day Free In-Home Return Pickup', 'active'),

-- 5. Electronics - Camera
(5, 'Lumina Mark V Mirrorless Camera', 'lumina-mark-v-mirrorless-camera', 1, 5, 'electronics', 'ELC-CAM-005', '61MP full-frame BSI sensor with AI subject-tracking autofocus and 8K cinematic recording.', 'A visual masterpiece in camera engineering. The Lumina Mark V captures staggering resolution with 15 stops of dynamic range. Featuring next-generation AI autofocus that detects humans, birds, vehicles, and wildlife with instant eye autofocus in real-time.', 219999.00, 249999.00, 12, 4.96, 88, 12, 0, 0, 1,
'{"Sensor": "61.0 MP Full-Frame Exmor R BSI CMOS", "Video": "8K 24p / 4K 60p 10-Bit 4:2:2 All-Intra", "Stabilization": "8.0-Stop 5-Axis In-Body Image Stabilization"}',
'{"Width": "13.1 cm", "Height": "9.6 cm", "Depth": "8.2 cm"}', '2-Year Sony India Warranty', '7-Day Replacement Policy', 'active'),

-- 6. Electronics - Smartwatch
(6, 'Terra Sapphire Titanium Smartwatch', 'terra-sapphire-titanium-smartwatch', 2, 6, 'electronics', 'ELC-SW-006', 'Dual-frequency GPS, sapphire glass screen, ECG, dive sensor, and 72-hour battery.', 'Designed for athletes, adventurers, and design enthusiasts. The Terra smartwatch is carved from a solid block of titanium and protected by scratch-resistant sapphire crystal glass. Features advanced multisport metrics, offline topographic maps, skin temperature sensors, and emergency satellite SOS.', 49999.00, 56999.00, 12, 4.85, 140, 40, 1, 1, 0,
'{"Case": "49mm Grade 5 Titanium", "Display": "3000 nits Always-On OLED Sapphire", "Water Resistance": "100m", "Battery": "Up to 72 Hours in Low Power"}',
'{"Case Diameter": "49 mm", "Thickness": "14.4 mm", "Weight": "61.3g"}', '1-Year Apple India Warranty', '7-Day Replacement', 'active'),

-- 7. Electronics - Speakers
(7, 'Symphony Walnut Hi-Fi Bookshelf Speakers', 'symphony-walnut-hi-fi-bookshelf-speakers', 1, 7, 'electronics', 'ELC-SPK-007', 'Handcrafted solid walnut acoustic cabinet with ribbon tweeters and integrated streaming.', 'Where acoustic science meets timeless mid-century joinery. Symphony Bookshelf Speakers provide breathtaking vocal clarity and room-filling low end without needing an external amplifier. Stream via AirPlay, Spotify Connect, or plug directly into a turntable via built-in phono pre-amp.', 39999.00, 45999.00, 13, 4.92, 76, 18, 1, 1, 0,
'{"Amplification": "120W Class-D Bi-Amplified", "Frequency Response": "42Hz - 28,000Hz", "Inputs": "Optical, Coaxial, RCA Line-in, Bluetooth 5.2", "Cabinet Material": "Solid American Black Walnut"}',
'{"Height": "32.0 cm", "Width": "19.5 cm", "Depth": "24.0 cm (Each)"}', '3-Year Manufacturer Warranty', '10-Day Safe Transit Guarantee', 'active'),

-- 8. Electronics - Gaming
(8, 'Apex Precision Wireless Haptic Controller', 'apex-precision-wireless-controller', 1, 8, 'electronics', 'ELC-GM-008', 'Hall-effect anti-drift joysticks with adaptive mechanical triggers and magnetic paddles.', 'Built for pinpoint accuracy and unmatched tactile response. The Apex features ultra-durable contactless magnetic Hall-effect thumbsticks that eliminate stick drift forever. Swap thumbsticks and D-pads in seconds using precision magnetic fittings.', 9999.00, 11999.00, 17, 4.78, 180, 60, 0, 1, 1,
'{"Sticks": "Magnetic Hall-Effect Anti-Drift", "Latency": "1ms Ultra-Low Latency", "Battery": "1200mAh (Up to 20 hours)"}',
'{"Width": "16.0 cm", "Depth": "10.5 cm", "Height": "6.5 cm"}', '1-Year Replacement Warranty', '7-Day Return Policy', 'active'),

-- 9. Electronics - Accessories
(9, 'Orbit MagSafe Solid Walnut Wireless Charging Dock', 'orbit-walnut-magsafe-wireless-dock', 7, 9, 'electronics', 'ELC-ACC-009', '3-in-1 fast wireless charging station crafted from American walnut and matte anodized brass.', 'Organize your nightstand or workspace with architectural refinement. Simultaneously charge your smartphone at 15W, smartwatch at full speed, and wireless earbuds on a sculpted soft-touch tray. Weighted with a solid steel base so your dock stays firmly on your desk when detaching devices.', 7999.00, 9499.00, 16, 4.91, 124, 50, 0, 0, 1,
'{"Power Output": "15W MagSafe Phone + 5W Watch + 5W Earbuds", "Materials": "American Walnut, Anodized Aluminum, Weighted Zinc Base"}',
'{"Length": "20.5 cm", "Width": "10.2 cm", "Height": "13.0 cm"}', '1-Year Craftsmanship Guarantee', '7-Day Returns', 'active'),

-- 10. Furniture - Sofas
(10, 'Koto 3-Piece Modular Bouclé Chaise Sofa', 'koto-3-piece-modular-boucle-sofa', 6, 10, 'furniture', 'FUR-SF-010', 'Deep-seated organic curves upholstered in premium stain-resistant textured cream bouclé.', 'The centerpiece of calm, elevated living. The Koto modular sectional blends Japanese minimalism with Scandinavian coziness. Built with an FSC-certified solid kiln-dried hardwood frame and high-resiliency dual-density foam wrapped in down-feather cushioning that invites you to sink in without losing its tailored silhouette.', 89999.00, 104999.00, 14, 4.93, 92, 14, 1, 1, 0,
'{"Frame": "FSC-Certified Kiln-Dried European Birch & Pine", "Upholstery": "Heavy Commercial-Grade Tactile Bouclé (45,000 Martindale)", "Cushioning": "Dual-Density Pocket Springs + Feather Down Wrap", "Assembly": "Free White-Glove In-Room Assembly Included"}',
'{"Total Width": "285 cm", "Depth": "105 cm", "Chaise Depth": "170 cm", "Seat Height": "42 cm"}', '10-Year Structural Frame Warranty', '14-Day In-Home Return Trial', 'active'),

-- 11. Furniture - Beds
(11, 'Nara Solid Oak Floating Platform Bed', 'nara-solid-oak-floating-platform-bed', 7, 11, 'furniture', 'FUR-BD-011', 'Floating silhouette with built-in cantilever nightstands and integrated ambient soft backlighting.', 'Crafted with master-joiner Japanese mortise-and-tenon craftsmanship. The Nara floating bed creates an effortless illusion of suspension, grounding your bedroom in quiet tranquility. Features seamless integrated warm LED under-glow with touch-sensitive dimmers hidden beneath the solid white oak headboard.', 64999.00, 74999.00, 13, 4.89, 68, 18, 1, 0, 0,
'{"Wood": "100% Solid European White Oak, Natural Matte Hardwax Finish", "Lighting": "Touch-Dimmable 2700K Warm LED Backlight", "Slats": "Sprung Beechwood Slat Support System"}',
'{"Width (Queen)": "194 cm", "Length": "218 cm", "Headboard Height": "78 cm"}', '10-Year Wood Integrity Guarantee', '14-Day In-Home Return Trial', 'active'),

-- 12. Furniture - Chairs
(12, 'Eames Aluminum Studio Ergonomic Task Chair', 'eames-aluminum-studio-ergonomic-chair', 5, 12, 'furniture', 'FUR-CH-012', 'Iconic ribbed seating in full-grain cognac leather with polished cast-aluminum armature.', 'A design icon refined for the contemporary studio. The ribbed back conforms naturally to the contours of your spine, providing flexible comfort without the bulk of typical office chairs. Complete with a 5-star swivel base, pneumatic lift, and smooth tilt mechanism.', 34999.00, 39999.00, 12, 4.95, 110, 25, 1, 1, 0,
'{"Upholstery": "Top-Grain Italian Cognac Leather", "Base & Frame": "Hand-Polished Die-Cast Aluminum", "Mechanisms": "Class 4 Gas Lift, Synchro-Tilt with Tension Lock"}',
'{"Width": "68 cm", "Depth": "65 cm", "Height": "98 - 108 cm"}', '5-Year Mechanical Warranty', '14-Day Trial', 'active'),

-- 13. Furniture - Tables
(13, 'Solstice Live-Edge Solid Walnut Dining Table', 'solstice-live-edge-walnut-dining-table', 7, 13, 'furniture', 'FUR-TB-013', 'Continuous live-edge American walnut slab with matte blackened steel trestle legs.', 'Every Solstice table is a one-of-a-kind natural sculpture. Sourced from responsibly harvested American black walnut slabs, highlighting deep grain variations, butterfly key joints, and rich natural tones. Comfortably seats 8 to 10 guests for unforgettable dinner conversations.', 79999.00, 92999.00, 14, 4.91, 48, 8, 1, 0, 1,
'{"Timber": "Solid American Black Walnut (1.75 inch Solid Slab)", "Finish": "Organic Botanical Oil and Carnauba Wax", "Base": "Heavy-Gauge Industrial Carbon Steel", "Capacity": "8 - 10 Persons"}',
'{"Length": "240 cm", "Width": "100 cm", "Height": "76 cm"}', 'Lifetime Wood Structural Integrity Warranty', 'Free White Glove Delivery & In-Room Assembly', 'active'),

-- 14. Furniture - Wardrobes
(14, 'Aalto Minimalist Fluted Glass & Oak Wardrobe', 'aalto-fluted-glass-oak-wardrobe', 6, 14, 'furniture', 'FUR-WD-014', 'Soft-closing fluted tempered glass sliding doors with warm internal automatic lighting.', 'The ultimate architectural closet storage. The Aalto Wardrobe conceals clutter behind elegant reeded glass panels that refract light with subtle mystery. As the doors glide effortlessly open, concealed micro-sensors illuminate soft-glow interior LED clothing rails.', 94999.00, 109999.00, 14, 4.80, 28, 10, 0, 0, 0,
'{"Exterior": "FSC Oak Veneer with Solid Oak Edgebanding", "Doors": "8mm Fluted Reeded Safety Glass with Silent Dampers", "Interior": "2 Hanging Rails, 4 Drawers, 6 Adjustable Shelves", "Illumination": "Concealed 2700K Warm Sensor LED"}',
'{"Width": "180 cm", "Height": "215 cm", "Depth": "62 cm"}', '5-Year Hardware & Glass Warranty', 'White Glove Pre-Assembly Check', 'active'),

-- 15. Furniture - Office Furniture
(15, 'Strata Motorized Solid Walnut Standing Desk', 'strata-motorized-walnut-standing-desk', 5, 15, 'furniture', 'FUR-OF-015', 'Solid walnut ergonomic curved desktop with dual whisper-quiet Swedish lift motors.', 'Bring health and aesthetic harmony to your workday. The Strata standing desk combines the timeless warmth of a 1.25" thick solid American walnut tabletop with a commercial dual-motor lifting system capable of supporting 350 lbs with whisper-quiet transition under 40 decibels.', 48999.00, 56999.00, 14, 4.97, 142, 35, 1, 1, 1,
'{"Top": "100% Solid American Walnut (1.25 inch)", "Motors": "Dual Silent Motors (< 38 dB)", "Height Range": "62 cm to 128 cm with 4 Presets", "Weight Capacity": "140 kg Dynamic Load"}',
'{"Width": "152 cm (60\")", "Depth": "76 cm", "Thickness": "3.2 cm"}', '10-Year Motor & Steel Frame Warranty', '14-Day In-Home Trial', 'active'),

-- 16. Furniture - Lighting
(16, 'Lune Frosted Glass & Brass Pendant Light', 'lune-frosted-glass-brass-pendant-light', 8, 16, 'furniture', 'FUR-LT-016', 'Hand-blown opaline glass orb floating within a solid spun brushed brass ring.', 'Like a celestial sphere suspended in space. Lune casts a soft, shadowless, glare-free ambient glow ideal for illuminating kitchen islands, reading nooks, or bedside retreats. Dimmable from a golden twilight glow to crisp reading brightness.', 14999.00, 17999.00, 17, 4.83, 56, 45, 0, 1, 0,
'{"Shade": "Hand-Blown Triplex Opal Frosted Glass (25cm diameter)", "Metal": "Solid Spun Brushed Raw Brass", "Socket": "E27 Standard (Warm 2700K 9W LED Included)", "Cord": "300 cm Adjustable Braided Linen"}',
'{"Orb Diameter": "25 cm", "Brass Ring Diameter": "38 cm"}', '3-Year Luminaire Guarantee', '7-Day Return Policy', 'active'),

-- 17. Furniture - Storage
(17, 'Forma 4-Door Fluted Credenza Sideboard', 'forma-4-door-fluted-credenza-sideboard', 6, 17, 'furniture', 'FUR-ST-017', 'Rhythmically sculpted tambour doors with travertine stone top and brass feet.', 'The Forma sideboard strikes a dialogue between tactile timber and cool Italian travertine stone. The fluted doors wrap gracefully around rounded pill-shaped corners, revealing four spacious interior compartments with wire-management pass-throughs for electronics.', 59999.00, 69999.00, 14, 4.86, 36, 12, 0, 0, 0,
'{"Top": "Solid Honed Roman Beige Travertine", "Body": "Solid American Walnut Tambour Glides", "Internal Storage": "4 Compartments with Adjustable Shelves"}',
'{"Width": "175 cm", "Depth": "46 cm", "Height": "74 cm"}', '5-Year Structural Guarantee', 'White-Glove Delivery with Unboxing', 'active'),

-- 18. Furniture - Home Decor
(18, 'Brutalist Ceramic Sculptural Vessel Trio', 'brutalist-ceramic-sculptural-vessel-trio', 8, 18, 'furniture', 'FUR-HD-018', 'Set of three wheel-thrown matte stoneware vases with organic sand-textured glaze.', 'Designed by artisan potters to celebrate wabi-sabi authenticity. Display them as individual sculptural accents across your credenza or cluster them together with dried botanicals and eucalyptus branches for effortless organic styling.', 6999.00, 8499.00, 18, 4.90, 74, 80, 0, 0, 1,
'{"Material": "High-Fired Stoneware Clay", "Glaze": "Raw Textured Sand Glaze", "Pieces": "Set of 3 (Tall 28cm, Round 18cm, Wide 14cm)"}',
'{"Tall Vessel": "28 x 14 cm", "Round Vessel": "18 x 18 cm", "Wide Vessel": "14 x 22 cm"}', '1-Year Artisan Craft Guarantee', '7-Day Safe Transit Guarantee', 'active'),

-- 19. Electronics - Laptops
(19, 'Zenith Ultra 14 OLED Creator Laptop', 'zenith-ultra-14-oled-creator-laptop', 4, 2, 'electronics', 'ELC-LT-019', 'Featherlight 1.1kg magnesium laptop with 2.8K 120Hz Lumina OLED touchscreen.', 'Designed for wanderers and visual storytellers. The Zenith Ultra 14 packs astonishing computing prowess into an ultra-thin 13.9mm magnesium-aluminum alloy body. The 2.8K OLED panel boasts 100% DCI-P3 cinematic gamut and 500 nits HDR brightness.', 119999.00, 134999.00, 11, 4.79, 52, 22, 0, 1, 0,
'{"Display": "14.0-inch 2.8K 120Hz OLED Touchscreen", "Processor": "Intel Core Ultra 7 with Intel AI Boost", "RAM & Storage": "32GB LPDDR5X + 1TB Gen 4 SSD", "Weight": "1.19 kg"}',
'{"Width": "31.2 cm", "Depth": "22.0 cm", "Height": "1.39 cm"}', '2-Year On-Site Support Warranty', '7-Day Return Policy', 'active'),

-- 20. Furniture - Tables
(20, 'Atelier Round Travertine Coffee Table', 'atelier-round-travertine-coffee-table', 7, 13, 'furniture', 'FUR-TB-020', 'Sculptural monolithic low coffee table carved from solid honed Roman beige travertine.', 'Commanding presence in its purest geometric form. The Atelier coffee table features a thick circular travertine top resting upon three intersecting architectural slab legs. Each table highlights distinctive mineral veining that has formed across millennia.', 36999.00, 42999.00, 14, 4.92, 58, 16, 0, 1, 1,
'{"Material": "100% Genuine Italian Travertine", "Finish": "Honed Matte with Micro-Porous Sealant", "Weight": "48 kg Solid Stone"}',
'{"Diameter": "90 cm (35.4\")", "Height": "38 cm"}', '5-Year Stone Integrity Warranty', 'White-Glove In-Home Inspection', 'active'),

-- 21. Electronics - Headphones
(21, 'Echo Pods Pro Active Noise Cancelling Earbuds', 'echo-pods-pro-anc-earbuds', 2, 3, 'electronics', 'ELC-HP-021', 'Custom silicon acoustic architecture, transparency mode, and spatial audio with head tracking.', 'Remarkable studio sound nestled right inside your ear. Echo Pods Pro deliver twice as much active noise cancelation as previous generations, alongside adaptive audio that automatically tunes noise control to your dynamic environment throughout the day.', 18999.00, 21999.00, 14, 4.88, 195, 75, 0, 0, 1,
'{"Audio Technology": "Custom High-Excursion Driver & High Dynamic Range Amp", "Battery": "6 Hours (30 Hours Total with USB-C MagSafe Case)", "Microphones": "Dual Beamforming + Inward-Facing Voice Mic", "Water Resistance": "IP54 Dust, Sweat, and Water Resistant"}',
'{"Case Width": "6.0 cm", "Case Height": "4.5 cm"}', '1-Year Global Apple Warranty', '7-Day Replacement', 'active'),

-- 22. Furniture - Chairs
(22, 'Nordic Curved Oak Dining Armchair (Set of 2)', 'nordic-curved-oak-dining-armchair-set', 8, 12, 'furniture', 'FUR-CH-022', 'Sculpted steam-bent solid white oak backrest with stain-resistant oatmeal woven fabric seat.', 'Graceful ergonomics tailored for long, intimate dinners. The Nordic armchair features a single continuous sweep of steam-bent solid oak that doubles as an ergonomic armrest and supportive backrest. Sold as a convenient pair of two matching chairs.', 28999.00, 33999.00, 15, 4.94, 62, 30, 0, 0, 0,
'{"Frame": "Steam-Bent Solid European White Oak", "Upholstery": "High-Density Foam with Stain-Guarded Linen Upholstery", "Pack Size": "Set of 2 Assembled Chairs"}',
'{"Width": "54 cm", "Depth": "52 cm", "Height": "76 cm"}', '5-Year Structural Frame Warranty', '14-Day In-Home Trial', 'active')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 6. Insert Product Images (Multiple gallery views per product)
INSERT INTO `product_images` (`product_id`, `image_url`, `alt_text`, `is_primary`, `display_order`) VALUES
-- 1. Aura ANC Headphones
(1, 'assets/images/headphone.jpg', 'Aura ANC Studio Headphones in Sage Walnut', 1, 1),
(1, 'assets/images/headphone.jpg', 'Aura ANC Headphones ear cushion detail', 0, 2),
(1, 'assets/images/headphone.jpg', 'Aura ANC folded in travel case', 0, 3),

-- 2. Nova Titanium Smartphone
(2, 'assets/images/smartphone.jpg', 'Nova Titanium Flagship Smartphone front view', 1, 1),
(2, 'assets/images/smartphone.jpg', 'Nova Titanium triple camera housing detail', 0, 2),

-- 3. Starlight Pro 16 Ultrabook
(3, 'assets/images/laptop.jpg', 'Starlight Pro 16 Ultrabook open on oak desk', 1, 1),
(3, 'assets/images/laptop.jpg', 'Starlight Pro backlit keyboard detail', 0, 2),

-- 4. Horizon 65" OLED TV
(4, 'assets/images/tv.jpg', 'Horizon 65 OLED TV in modern minimalist living room', 1, 1),
(4, 'assets/images/tv.jpg', 'Horizon TV ultra-thin side bezel profile', 0, 2),

-- 5. Lumina Mark V Camera
(5, 'assets/images/camera.jpg', 'Lumina Mark V full frame camera body', 1, 1),
(5, 'assets/images/camera.jpg', 'Lumina Mark V top dial and OLED panel', 0, 2),

-- 6. Terra Sapphire Smartwatch
(6, 'assets/images/smartwatch.jpg', 'Terra Sapphire Titanium Smartwatch with trail band', 1, 1),
(6, 'assets/images/smartwatch.jpg', 'Terra Smartwatch wrist close-up', 0, 2),

-- 7. Symphony Walnut Hi-Fi Speakers
(7, 'assets/images/speaker.jpg', 'Symphony Walnut Bookshelf Speakers pair', 1, 1),
(7, 'assets/images/speaker.jpg', 'Symphony Bookshelf Speaker driver close-up', 0, 2),

-- 8. Apex Gaming Controller
(8, 'assets/images/controller.jpg', 'Apex Precision Wireless Haptic Controller', 1, 1),

-- 9. Orbit MagSafe Dock
(9, 'assets/images/charger.jpg', 'Orbit MagSafe Walnut Wireless Charging Dock', 1, 1),

-- 10. Koto 3-Piece Bouclé Sofa
(10, 'assets/images/sofa.jpg', 'Koto 3-Piece Modular Bouclé Chaise Sofa in Cream', 1, 1),
(10, 'assets/images/sofa.jpg', 'Koto sectional angle view with coffee table', 0, 2),

-- 11. Nara Oak Floating Bed
(11, 'assets/images/bed.jpg', 'Nara Solid Oak Floating Platform Bed with ambient glow', 1, 1),

-- 12. Eames Studio Task Chair
(12, 'assets/images/chairtask.jpg', 'Eames Aluminum Studio Ergonomic Task Chair Cognac', 1, 1),

-- 13. Solstice Live-Edge Dining Table
(13, 'assets/images/diningtable.jpg', 'Solstice Live Edge Solid Walnut Dining Table', 1, 1),

-- 14. Aalto Fluted Glass Wardrobe
(14, 'assets/images/wardrobe.jpg', 'Aalto Fluted Glass Oak Wardrobe with LED glow', 1, 1),

-- 15. Strata Standing Desk
(15, 'assets/images/desk.jpg', 'Strata Motorized Solid Walnut Standing Desk', 1, 1),

-- 16. Lune Pendant Light
(16, 'assets/images/lamp.jpg', 'Lune Frosted Glass & Brass Pendant Light illuminating room', 1, 1),

-- 17. Forma Credenza
(17, 'assets/images/credenza.jpg', 'Forma 4-Door Fluted Credenza Sideboard with marble top', 1, 1),

-- 18. Brutalist Ceramic Vessel
(18, 'assets/images/vase.jpg', 'Brutalist Ceramic Sculptural Vessel Trio on travertine shelf', 1, 1),

-- 19. Zenith Ultra 14 Laptop
(19, 'assets/images/laptopzenith.jpg', 'Zenith Ultra 14 OLED Creator Laptop slim profile', 1, 1),

-- 20. Atelier Travertine Coffee Table
(20, 'assets/images/coffe table.jpg', 'Atelier Round Travertine Coffee Table top view', 1, 1),

-- 21. Echo Pods Pro Earbuds
(21, 'assets/images/earbuds.jpg', 'Echo Pods Pro Wireless ANC Earbuds with case', 1, 1),

-- 22. Nordic Oak Dining Chairs
(22, 'assets/images/chair dining.jpg', 'Nordic Curved Oak Dining Armchairs Set of 2', 1, 1);

-- 7. Insert Product Variants
INSERT INTO `product_variants` (`id`, `product_id`, `sku`, `variant_name`, `variant_type`, `variant_value`, `additional_price`, `stock_quantity`) VALUES
-- Aura ANC Headphones variants
(1, 1, 'ELC-HP-001-SAGE', 'Sage Green & Walnut', 'color', 'Sage Green', 0.00, 20),
(2, 1, 'ELC-HP-001-BLK', 'Obsidian Black', 'color', 'Obsidian Black', 0.00, 15),
(3, 1, 'ELC-HP-001-CREAM', 'Sand Cream & Champagne', 'color', 'Sand Cream', 1500.00, 10),

-- Nova Smartphone variants (storage)
(4, 2, 'ELC-SP-002-256', '256GB - Natural Titanium', 'storage', '256GB', 0.00, 15),
(5, 2, 'ELC-SP-002-512', '512GB - Natural Titanium', 'storage', '512GB', 12000.00, 10),
(6, 2, 'ELC-SP-002-1TB', '1TB - Natural Titanium', 'storage', '1TB', 24000.00, 5),

-- Koto Boucle Sofa variants
(7, 10, 'FUR-SF-010-CREAM', 'Warm Cream Bouclé', 'material', 'Warm Cream Bouclé', 0.00, 8),
(8, 10, 'FUR-SF-010-SAGE', 'Sage Green Textured Velvet', 'material', 'Sage Velvet', 6000.00, 6),

-- Eames Task Chair variants
(9, 12, 'FUR-CH-012-COG', 'Cognac Italian Leather', 'material', 'Cognac Leather', 0.00, 15),
(10, 12, 'FUR-CH-012-BLK', 'Matte Black Aniline Leather', 'material', 'Black Leather', 0.00, 10),

-- Strata Standing Desk variants
(11, 15, 'FUR-OF-015-60', '60" Wide - Solid Walnut', 'size', '60 inch', 0.00, 20),
(12, 15, 'FUR-OF-015-72', '72" Wide - Solid Walnut Executive', 'size', '72 inch', 8000.00, 15);

-- 8. Insert Inventory Entries
INSERT INTO `inventory` (`product_id`, `variant_id`, `stock_quantity`, `low_stock_threshold`) VALUES
(1, 1, 20, 5),
(1, 2, 15, 5),
(1, 3, 10, 4),
(2, 4, 15, 3),
(2, 5, 10, 3),
(2, 6, 5, 2),
(3, NULL, 20, 4),
(4, NULL, 15, 3),
(5, NULL, 12, 2),
(6, NULL, 40, 6),
(7, NULL, 25, 4),
(8, NULL, 50, 8),
(9, NULL, 60, 10),
(10, 7, 8, 2),
(10, 8, 6, 2),
(11, NULL, 18, 3),
(12, 9, 15, 4),
(12, 10, 10, 3),
(13, NULL, 8, 2),
(14, NULL, 10, 2),
(15, 11, 20, 4),
(15, 12, 15, 3),
(16, NULL, 45, 6),
(17, NULL, 12, 3),
(18, NULL, 80, 10),
(19, NULL, 22, 4),
(20, NULL, 16, 3),
(21, NULL, 75, 10),
(22, NULL, 30, 5);

-- 9. Insert Coupons
INSERT INTO `coupons` (`id`, `code`, `description`, `discount_type`, `discount_value`, `min_order_amount`, `max_discount_amount`, `usage_limit`, `times_used`, `is_active`) VALUES
(1, 'WELCOME10', 'Welcome 10% Off Your First Order (Min ₹4,999)', 'percentage', 10.00, 4999.00, 5000.00, 1000, 14, 1),
(2, 'NOVA500', 'Flat ₹500 Off on Electronics or Furniture', 'fixed', 500.00, 9999.00, 500.00, 500, 28, 1),
(3, 'NOVA15', '15% Atelier Privilege Discount', 'percentage', 15.00, 19999.00, 15000.00, 200, 5, 1),
(4, 'FREESHIP', 'Complimentary Pan-India White-Glove Shipping', 'fixed', 499.00, 2999.00, 499.00, 2000, 89, 1)
ON DUPLICATE KEY UPDATE `code` = VALUES(`code`);

-- 10. Insert Customer Reviews
INSERT INTO `reviews` (`product_id`, `user_id`, `rating`, `title`, `comment`, `is_approved`, `is_verified_purchase`) VALUES
(1, 2, 5, 'Transcendent audio quality and comfort', 'I wear these for 8 hours of video editing daily. The acoustic clarity is unmatched, and the walnut accents pair beautifully with my desk setup.', 1, 1),
(10, 2, 5, 'The best sofa our family has ever owned', 'The bouclé is incredibly soft yet surprisingly resistant to stains. The seating depth is perfection for relaxed weekend reading.', 1, 1),
(3, 2, 5, 'Powerhouse laptop for creative workflows', 'Exports 4K DaVinci Resolve timelines in minutes without breaking a sweat or even spinning the fans audibly. Highly recommended.', 1, 1),
(15, 2, 5, 'Stunning walnut tabletop and whisper quiet', 'The beveled edge makes typing comfortable for hours. The motor transition is buttery smooth and remembers my exact sitting and standing heights.', 1, 1);
