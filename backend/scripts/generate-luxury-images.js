const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '../../frontend/assets/images');
if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

const svgs = {};

// 1. Headphones (Aura ANC Studio)
svgs['headphones.svg'] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FBF9F5"/><stop offset="100%" stop-color="#EBEFE7"/>
    </linearGradient>
    <linearGradient id="walnut" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#6F4733"/><stop offset="50%" stop-color="#5B3928"/><stop offset="100%" stop-color="#3C2417"/>
    </linearGradient>
    <linearGradient id="metal" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#E2E6DF"/><stop offset="50%" stop-color="#B2B8AC"/><stop offset="100%" stop-color="#879780"/>
    </linearGradient>
    <linearGradient id="cushion" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#3A3835"/><stop offset="100%" stop-color="#1E1D1B"/>
    </linearGradient>
    <filter id="drop" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#38251C" flood-opacity="0.18"/>
    </filter>
  </defs>
  <rect width="800" height="600" fill="url(#bg)"/>
  
  <!-- Subtle circular pedestal -->
  <ellipse cx="400" cy="460" rx="240" ry="40" fill="#D7DDCF" opacity="0.6"/>
  <ellipse cx="400" cy="455" rx="180" ry="24" fill="#C8CFC0" opacity="0.5"/>

  <!-- Headphones Artwork -->
  <g filter="url(#drop)">
    <!-- Headband Arch -->
    <path d="M 230 330 C 210 130, 590 130, 570 330" fill="none" stroke="url(#walnut)" stroke-width="32" stroke-linecap="round"/>
    <path d="M 250 310 C 235 155, 565 155, 550 310" fill="none" stroke="url(#metal)" stroke-width="12" stroke-linecap="round"/>
    <path d="M 300 170 C 350 145, 450 145, 500 170" fill="none" stroke="#252422" stroke-width="24" stroke-linecap="round"/>

    <!-- Left Fork & Cup -->
    <path d="M 230 300 L 230 350" stroke="url(#metal)" stroke-width="14" stroke-linecap="round"/>
    <!-- Left Outer Walnut Shell -->
    <ellipse cx="230" cy="380" rx="65" ry="90" fill="url(#walnut)"/>
    <ellipse cx="230" cy="380" rx="52" ry="75" fill="url(#metal)"/>
    <!-- Left Leather Cushion -->
    <ellipse cx="255" cy="380" rx="42" ry="85" fill="url(#cushion)"/>
    <ellipse cx="260" cy="380" rx="26" ry="60" fill="#121211"/>

    <!-- Right Fork & Cup -->
    <path d="M 570 300 L 570 350" stroke="url(#metal)" stroke-width="14" stroke-linecap="round"/>
    <!-- Right Outer Walnut Shell -->
    <ellipse cx="570" cy="380" rx="65" ry="90" fill="url(#walnut)"/>
    <ellipse cx="570" cy="380" rx="52" ry="75" fill="url(#metal)"/>
    <!-- Right Leather Cushion -->
    <ellipse cx="545" cy="380" rx="42" ry="85" fill="url(#cushion)"/>
    <ellipse cx="540" cy="380" rx="26" ry="60" fill="#121211"/>

    <!-- Brand Emblem on Cup -->
    <circle cx="230" cy="380" r="16" fill="url(#walnut)" stroke="url(#metal)" stroke-width="2"/>
    <circle cx="570" cy="380" r="16" fill="url(#walnut)" stroke="url(#metal)" stroke-width="2"/>
  </g>
  
  <text x="400" y="540" font-family="'DM Sans', sans-serif" font-weight="700" font-size="22" fill="#5B3928" text-anchor="middle" letter-spacing="1">AURA ANC STUDIO HEADPHONES</text>
  <text x="400" y="565" font-family="'Inter', sans-serif" font-weight="500" font-size="14" fill="#77776F" text-anchor="middle">Spatial Biocellulose Drivers &bull; Handcrafted Walnut</text>
</svg>`;

// 2. Smartphone (Nova Titanium Flagship)
svgs['smartphone.svg'] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#FBF9F5"/><stop offset="100%" stop-color="#E2E7DE"/></linearGradient>
    <linearGradient id="ti" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#A4A89E"/><stop offset="50%" stop-color="#D7DBD1"/><stop offset="100%" stop-color="#8B9184"/></linearGradient>
    <linearGradient id="screen" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1A2E26"/><stop offset="50%" stop-color="#566B52"/><stop offset="100%" stop-color="#5B3928"/>
    </linearGradient>
    <filter id="drop" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#292A26" flood-opacity="0.2"/>
    </filter>
  </defs>
  <rect width="800" height="600" fill="url(#bg)"/>
  <ellipse cx="400" cy="510" rx="200" ry="30" fill="#CAD2C5" opacity="0.6"/>

  <g filter="url(#drop)" transform="translate(290, 80)">
    <!-- Titanium Body -->
    <rect x="0" y="0" width="220" height="420" rx="38" fill="url(#ti)"/>
    <!-- Screen Bezel -->
    <rect x="6" y="6" width="208" height="408" rx="34" fill="#0A0A0A"/>
    <!-- Screen Glass Wallpaper -->
    <rect x="10" y="10" width="200" height="400" rx="30" fill="url(#screen)"/>
    <!-- Modern Graphic Overlay on screen -->
    <circle cx="110" cy="180" r="70" fill="#879780" opacity="0.4"/>
    <circle cx="140" cy="240" r="90" fill="#5B3928" opacity="0.3"/>
    <!-- Dynamic Island Pill -->
    <rect x="75" y="24" width="70" height="18" rx="9" fill="#000000"/>
    <circle cx="132" cy="33" r="3.5" fill="#1C2738"/>
    <!-- Lock Screen Clock -->
    <text x="110" y="95" font-family="'DM Sans', sans-serif" font-weight="700" font-size="34" fill="#FFFFFF" text-anchor="middle">09:41</text>
    <text x="110" y="120" font-family="'Inter', sans-serif" font-weight="500" font-size="12" fill="#E9EDE5" text-anchor="middle">Tuesday, October 27</text>
    <!-- Bottom Home Bar -->
    <rect x="70" y="392" width="80" height="4" rx="2" fill="#FFFFFF" opacity="0.8"/>
  </g>
  <text x="400" y="550" font-family="'DM Sans', sans-serif" font-weight="700" font-size="22" fill="#5B3928" text-anchor="middle">NOVA TITANIUM FLAGSHIP 5G</text>
</svg>`;

// 3. Laptop (Starlight Pro 16 Ultrabook)
svgs['laptop.svg'] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#F7F4EC"/><stop offset="100%" stop-color="#DFE5DB"/></linearGradient>
    <linearGradient id="screen" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2D3B31"/><stop offset="60%" stop-color="#566B52"/><stop offset="100%" stop-color="#879780"/></linearGradient>
    <linearGradient id="chassis" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#D7DBD1"/><stop offset="100%" stop-color="#A5ABA0"/></linearGradient>
    <filter id="drop" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#292A26" flood-opacity="0.18"/></filter>
  </defs>
  <rect width="800" height="600" fill="url(#bg)"/>
  <ellipse cx="400" cy="480" rx="280" ry="32" fill="#C5CDC0" opacity="0.6"/>

  <g filter="url(#drop)">
    <!-- Lid / Screen Open -->
    <rect x="180" y="110" width="440" height="280" rx="14" fill="url(#chassis)"/>
    <rect x="194" y="124" width="412" height="252" rx="6" fill="#0D0E0D"/>
    <rect x="200" y="130" width="400" height="240" rx="4" fill="url(#screen)"/>
    <!-- Screen Content: Code / Creative Workspace Graphic -->
    <circle cx="400" cy="250" r="60" fill="#E9EDE5" opacity="0.3"/>
    <circle cx="440" cy="220" r="40" fill="#5B3928" opacity="0.3"/>
    <text x="400" y="255" font-family="'DM Sans', sans-serif" font-weight="700" font-size="20" fill="#FFFFFF" text-anchor="middle" letter-spacing="2">NEST &amp; NOVA</text>
    <circle cx="400" cy="117" r="3" fill="#3A4036"/>

    <!-- Bottom Base / Keyboard Deck -->
    <polygon points="120,440 680,440 640,390 160,390" fill="url(#chassis)"/>
    <polygon points="164,432 636,432 610,396 190,396" fill="#1C1E1B"/>
    <!-- Trackpad -->
    <rect x="330" y="420" width="140" height="16" rx="3" fill="#BAC0B6" opacity="0.8"/>
    <!-- Front Lip Notch -->
    <rect x="375" y="438" width="50" height="4" rx="2" fill="#7E8578"/>
  </g>
  <text x="400" y="540" font-family="'DM Sans', sans-serif" font-weight="700" font-size="22" fill="#5B3928" text-anchor="middle">STARLIGHT PRO 16 ULTRABOOK</text>
  <text x="400" y="565" font-family="'Inter', sans-serif" font-weight="500" font-size="14" fill="#77776F" text-anchor="middle">Liquid Retina XDR &bull; M-Series 22hr Battery</text>
</svg>`;

// 4. Smart TV (Horizon 65" 4K OLED)
svgs['tv.svg'] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#F7F4EC"/><stop offset="100%" stop-color="#E2E7DE"/></linearGradient>
    <linearGradient id="tvpic" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1B3322"/><stop offset="50%" stop-color="#4F6D4A"/><stop offset="100%" stop-color="#C29D59"/></linearGradient>
    <filter id="drop" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#292A26" flood-opacity="0.18"/></filter>
  </defs>
  <rect width="800" height="600" fill="url(#bg)"/>
  <ellipse cx="400" cy="490" rx="300" ry="24" fill="#C5CDC0" opacity="0.6"/>

  <g filter="url(#drop)">
    <!-- Thin Bezel -->
    <rect x="110" y="100" width="580" height="340" rx="6" fill="#1C1D1A"/>
    <!-- Screen Display Wallpaper (Architectural Landscape) -->
    <rect x="116" y="106" width="568" height="328" rx="2" fill="url(#tvpic)"/>
    <ellipse cx="400" cy="360" rx="200" ry="60" fill="#3C2417" opacity="0.4"/>
    <circle cx="400" cy="220" r="48" fill="#F7F4EC" opacity="0.75"/>
    <text x="400" y="290" font-family="'DM Sans', sans-serif" font-weight="700" font-size="18" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">GALLERY AMBIENT MODE</text>

    <!-- Sleek Central Stand -->
    <rect x="380" y="440" width="40" height="36" fill="#4B4E47"/>
    <rect x="280" y="470" width="240" height="10" rx="5" fill="#5B3928"/>
  </g>
  <text x="400" y="540" font-family="'DM Sans', sans-serif" font-weight="700" font-size="22" fill="#5B3928" text-anchor="middle">HORIZON 65" 4K OLED AMBIENT TV</text>
</svg>`;

// 5. Camera (Lumina Mark V)
svgs['camera.svg'] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#FBF9F5"/><stop offset="100%" stop-color="#DFE5DB"/></linearGradient>
    <linearGradient id="body" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#363834"/><stop offset="100%" stop-color="#1B1C1A"/></linearGradient>
    <linearGradient id="lens" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1B2B38"/><stop offset="50%" stop-color="#2D5369"/><stop offset="100%" stop-color="#0E171E"/></linearGradient>
    <filter id="drop" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#292A26" flood-opacity="0.2"/></filter>
  </defs>
  <rect width="800" height="600" fill="url(#bg)"/>
  <ellipse cx="400" cy="480" rx="220" ry="26" fill="#C5CDC0" opacity="0.6"/>

  <g filter="url(#drop)" transform="translate(190, 140)">
    <!-- Camera Body -->
    <rect x="20" y="60" width="380" height="230" rx="20" fill="url(#body)"/>
    <rect x="140" y="30" width="140" height="40" rx="8" fill="#252623"/>
    <!-- Textured Leatherette Grip -->
    <rect x="20" y="90" width="110" height="200" rx="10" fill="#292A27"/>
    <!-- Top Dials -->
    <rect x="60" y="44" width="46" height="18" rx="4" fill="#C8CFC2"/>
    <rect x="310" y="44" width="56" height="18" rx="4" fill="#C8CFC2"/>
    <circle cx="118" cy="46" r="10" fill="#C0392B"/>
    <!-- Big Front Lens -->
    <circle cx="250" cy="180" r="95" fill="#141513"/>
    <circle cx="250" cy="180" r="85" fill="#5A6154"/>
    <circle cx="250" cy="180" r="72" fill="#242622"/>
    <circle cx="250" cy="180" r="60" fill="url(#lens)"/>
    <ellipse cx="235" cy="165" rx="30" ry="20" fill="#FFFFFF" opacity="0.25"/>
  </g>
  <text x="400" y="530" font-family="'DM Sans', sans-serif" font-weight="700" font-size="22" fill="#5B3928" text-anchor="middle">LUMINA MARK V MIRRORLESS</text>
  <text x="400" y="555" font-family="'Inter', sans-serif" font-weight="500" font-size="14" fill="#77776F" text-anchor="middle">61MP Full-Frame &bull; 8K Cinematic Precision</text>
</svg>`;

// 6. Smartwatch (Terra Sapphire Titanium)
svgs['smartwatch.svg'] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#F7F4EC"/><stop offset="100%" stop-color="#DFE5DB"/></linearGradient>
    <linearGradient id="band" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#566B52"/><stop offset="100%" stop-color="#3D4E3A"/></linearGradient>
    <filter id="drop" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#292A26" flood-opacity="0.18"/></filter>
  </defs>
  <rect width="800" height="600" fill="url(#bg)"/>
  <ellipse cx="400" cy="500" rx="160" ry="24" fill="#C5CDC0" opacity="0.6"/>

  <g filter="url(#drop)" transform="translate(300, 70)">
    <!-- Strap -->
    <rect x="45" y="0" width="110" height="460" rx="16" fill="url(#band)"/>
    <!-- Titanium Watch Case -->
    <rect x="15" y="140" width="170" height="180" rx="42" fill="#C5CAC0"/>
    <rect x="20" y="145" width="160" height="170" rx="38" fill="#1C1E1B"/>
    <!-- Digital Crown & Button -->
    <rect x="182" y="175" width="14" height="40" rx="6" fill="#D8DDD3"/>
    <rect x="182" y="240" width="10" height="30" rx="4" fill="#A5ABA0"/>
    <!-- Watch Face Display -->
    <circle cx="100" cy="230" r="65" fill="#0C0E0B"/>
    <!-- Activity Rings -->
    <circle cx="100" cy="230" r="50" fill="none" stroke="#C0392B" stroke-width="6" stroke-dasharray="240 80"/>
    <circle cx="100" cy="230" r="40" fill="none" stroke="#879780" stroke-width="6" stroke-dasharray="190 70"/>
    <circle cx="100" cy="230" r="30" fill="none" stroke="#566B52" stroke-width="6" stroke-dasharray="140 50"/>
    <text x="100" y="238" font-family="'DM Sans', sans-serif" font-weight="700" font-size="20" fill="#FFFFFF" text-anchor="middle">10:42</text>
  </g>
  <text x="400" y="555" font-family="'DM Sans', sans-serif" font-weight="700" font-size="22" fill="#5B3928" text-anchor="middle">TERRA SAPPHIRE TITANIUM WATCH</text>
</svg>`;

// 7. Speakers (Symphony Walnut Bookshelf Hi-Fi)
svgs['speaker.svg'] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#FBF9F5"/><stop offset="100%" stop-color="#E2E7DE"/></linearGradient>
    <linearGradient id="walnut" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#6E4530"/><stop offset="50%" stop-color="#5B3928"/><stop offset="100%" stop-color="#3C2417"/></linearGradient>
    <linearGradient id="cone" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#D9A865"/><stop offset="100%" stop-color="#8C5C23"/></linearGradient>
    <filter id="drop" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#292A26" flood-opacity="0.2"/></filter>
  </defs>
  <rect width="800" height="600" fill="url(#bg)"/>
  <ellipse cx="400" cy="480" rx="260" ry="26" fill="#C5CDC0" opacity="0.6"/>

  <g filter="url(#drop)">
    <!-- Speaker Left -->
    <rect x="210" y="150" width="160" height="290" rx="14" fill="url(#walnut)"/>
    <rect x="222" y="162" width="136" height="266" rx="8" fill="#1C1D1B"/>
    <circle cx="290" cy="220" r="26" fill="#0E0F0E"/>
    <circle cx="290" cy="220" r="14" fill="url(#cone)"/>
    <circle cx="290" cy="330" r="54" fill="#0E0F0E"/>
    <circle cx="290" cy="330" r="38" fill="url(#cone)"/>

    <!-- Speaker Right -->
    <rect x="430" y="150" width="160" height="290" rx="14" fill="url(#walnut)"/>
    <rect x="442" y="162" width="136" height="266" rx="8" fill="#1C1D1B"/>
    <circle cx="510" cy="220" r="26" fill="#0E0F0E"/>
    <circle cx="510" cy="220" r="14" fill="url(#cone)"/>
    <circle cx="510" cy="330" r="54" fill="#0E0F0E"/>
    <circle cx="510" cy="330" r="38" fill="url(#cone)"/>
  </g>
  <text x="400" y="530" font-family="'DM Sans', sans-serif" font-weight="700" font-size="22" fill="#5B3928" text-anchor="middle">SYMPHONY WALNUT HI-FI SPEAKERS</text>
  <text x="400" y="555" font-family="'Inter', sans-serif" font-weight="500" font-size="14" fill="#77776F" text-anchor="middle">Handcrafted Solid American Walnut &bull; 200W Class-D</text>
</svg>`;

// 8. Controller (Apex Wireless Gaming Controller)
svgs['controller.svg'] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#F7F4EC"/><stop offset="100%" stop-color="#DFE5DB"/></linearGradient>
    <linearGradient id="body" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#3D403A"/><stop offset="100%" stop-color="#20221E"/></linearGradient>
    <filter id="drop" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#292A26" flood-opacity="0.2"/></filter>
  </defs>
  <rect width="800" height="600" fill="url(#bg)"/>
  <ellipse cx="400" cy="480" rx="220" ry="24" fill="#C5CDC0" opacity="0.6"/>

  <g filter="url(#drop)" transform="translate(200, 150)">
    <!-- Controller Wings Shape -->
    <path d="M 50 140 C 20 250, 90 280, 120 220 L 160 170 L 240 170 L 280 220 C 310 280, 380 250, 350 140 C 330 60, 270 50, 200 60 C 130 50, 70 60, 50 140 Z" fill="url(#body)"/>
    <!-- LED Light Bar -->
    <path d="M 160 75 Q 200 85 240 75" stroke="#566B52" stroke-width="4" fill="none"/>
    <!-- Thumbsticks (Hall Effect) -->
    <circle cx="140" cy="180" r="26" fill="#151614"/>
    <circle cx="140" cy="180" r="18" fill="#5B3928"/>
    <circle cx="230" cy="140" r="26" fill="#151614"/>
    <circle cx="230" cy="140" r="18" fill="#5B3928"/>
    <!-- D-Pad -->
    <rect x="110" y="115" width="30" height="10" rx="2" fill="#CAD2C5"/>
    <rect x="120" y="105" width="10" height="30" rx="2" fill="#CAD2C5"/>
    <!-- Action Buttons -->
    <circle cx="280" cy="100" r="7" fill="#CAD2C5"/>
    <circle cx="265" cy="115" r="7" fill="#CAD2C5"/>
    <circle cx="295" cy="115" r="7" fill="#CAD2C5"/>
    <circle cx="280" cy="130" r="7" fill="#CAD2C5"/>
  </g>
  <text x="400" y="530" font-family="'DM Sans', sans-serif" font-weight="700" font-size="22" fill="#5B3928" text-anchor="middle">APEX WIRELESS HAPTIC CONTROLLER</text>
  <text x="400" y="555" font-family="'Inter', sans-serif" font-weight="500" font-size="14" fill="#77776F" text-anchor="middle">Magnetic Hall-Effect Anti-Drift Thumbsticks</text>
</svg>`;

// 9. Charger (Orbit MagSafe Solid Walnut Wireless Dock)
svgs['charger.svg'] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#FBF9F5"/><stop offset="100%" stop-color="#E2E7DE"/></linearGradient>
    <linearGradient id="walnut" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#6E4530"/><stop offset="50%" stop-color="#5B3928"/><stop offset="100%" stop-color="#3C2417"/></linearGradient>
    <linearGradient id="brass" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#C29D59"/><stop offset="50%" stop-color="#E2C48D"/><stop offset="100%" stop-color="#9C7733"/></linearGradient>
    <filter id="drop" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#292A26" flood-opacity="0.18"/></filter>
  </defs>
  <rect width="800" height="600" fill="url(#bg)"/>
  <ellipse cx="400" cy="480" rx="200" ry="24" fill="#C5CDC0" opacity="0.6"/>

  <g filter="url(#drop)" transform="translate(250, 160)">
    <!-- Weighted Walnut Base Tray -->
    <rect x="20" y="200" width="260" height="50" rx="20" fill="url(#walnut)"/>
    <ellipse cx="90" cy="220" rx="40" ry="14" fill="#4A2E20"/>
    <!-- Angled Brass Neck -->
    <polygon points="190,205 215,205 235,90 210,90" fill="url(#brass)"/>
    <!-- MagSafe Charging Puck -->
    <circle cx="210" cy="85" r="46" fill="#EAECE6"/>
    <circle cx="210" cy="85" r="40" fill="url(#brass)"/>
    <circle cx="210" cy="85" r="32" fill="#FFFFFF"/>
    <!-- Watch Stand Mini Puck -->
    <rect x="80" y="150" width="12" height="60" fill="url(#brass)"/>
    <circle cx="86" cy="140" r="22" fill="#EAECE6"/>
  </g>
  <text x="400" y="530" font-family="'DM Sans', sans-serif" font-weight="700" font-size="22" fill="#5B3928" text-anchor="middle">ORBIT MAGSAFE 3-IN-1 CHARGING DOCK</text>
  <text x="400" y="555" font-family="'Inter', sans-serif" font-weight="500" font-size="14" fill="#77776F" text-anchor="middle">Solid American Walnut &bull; Spun Brushed Brass</text>
</svg>`;

// 10. Sofa (Koto 3-Piece Modular Bouclé Sofa)
svgs['sofa.svg'] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#F7F4EC"/><stop offset="100%" stop-color="#DFE5DB"/></linearGradient>
    <linearGradient id="boucle" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#FCFAF6"/><stop offset="50%" stop-color="#F2EDE4"/><stop offset="100%" stop-color="#E2DCD0"/></linearGradient>
    <filter id="drop" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#292A26" flood-opacity="0.18"/></filter>
  </defs>
  <rect width="800" height="600" fill="url(#bg)"/>
  <ellipse cx="400" cy="460" rx="300" ry="34" fill="#C5CDC0" opacity="0.6"/>

  <g filter="url(#drop)">
    <!-- Sofa Backrest (Rounded Organic Clouds) -->
    <rect x="140" y="190" width="520" height="150" rx="60" fill="url(#boucle)"/>
    <!-- Left Arm -->
    <rect x="120" y="240" width="90" height="160" rx="45" fill="url(#boucle)"/>
    <!-- Right Arm / Chaise Return -->
    <rect x="590" y="240" width="90" height="160" rx="45" fill="url(#boucle)"/>
    <!-- Base Seating Cushions -->
    <rect x="190" y="280" width="420" height="130" rx="45" fill="#EAE5DC"/>
    <!-- Center Cushion Split Lines -->
    <line x1="330" y1="285" x2="330" y2="405" stroke="#C8C1B4" stroke-width="3"/>
    <line x1="470" y1="285" x2="470" y2="405" stroke="#C8C1B4" stroke-width="3"/>
    <!-- Plush Accent Pillows -->
    <ellipse cx="240" cy="280" rx="44" ry="40" fill="#566B52" transform="rotate(-10, 240, 280)"/>
    <ellipse cx="560" cy="280" rx="44" ry="40" fill="#879780" transform="rotate(10, 560, 280)"/>
    <!-- Low Oak Feet -->
    <rect x="180" y="410" width="24" height="24" rx="4" fill="#5B3928"/>
    <rect x="320" y="410" width="24" height="24" rx="4" fill="#5B3928"/>
    <rect x="460" y="410" width="24" height="24" rx="4" fill="#5B3928"/>
    <rect x="600" y="410" width="24" height="24" rx="4" fill="#5B3928"/>
  </g>
  <text x="400" y="530" font-family="'DM Sans', sans-serif" font-weight="700" font-size="22" fill="#5B3928" text-anchor="middle">KOTO 3-PIECE MODULAR BOUCLÉ SOFA</text>
  <text x="400" y="555" font-family="'Inter', sans-serif" font-weight="500" font-size="14" fill="#77776F" text-anchor="middle">Organic Curved Silhouette &bull; Stain-Resistant Textured Cream</text>
</svg>`;

// 11. Bed (Nara Solid Oak Floating Platform Bed)
svgs['bed.svg'] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#FBF9F5"/><stop offset="100%" stop-color="#E2E7DE"/></linearGradient>
    <linearGradient id="oak" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#DECBB3"/><stop offset="50%" stop-color="#CBB599"/><stop offset="100%" stop-color="#B69F82"/></linearGradient>
    <filter id="drop" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#292A26" flood-opacity="0.18"/></filter>
  </defs>
  <rect width="800" height="600" fill="url(#bg)"/>
  <ellipse cx="400" cy="460" rx="300" ry="32" fill="#C5CDC0" opacity="0.6"/>

  <g filter="url(#drop)">
    <!-- Solid Oak Headboard -->
    <rect x="130" y="160" width="540" height="160" rx="8" fill="url(#oak)"/>
    <!-- Ambient Warm LED Backlight Glow -->
    <rect x="140" y="152" width="520" height="12" rx="6" fill="#FCE9C8" opacity="0.8"/>
    <!-- Integrated Left & Right Cantilever Nightstands -->
    <rect x="90" y="270" width="80" height="16" rx="4" fill="url(#oak)"/>
    <rect x="630" y="270" width="80" height="16" rx="4" fill="url(#oak)"/>

    <!-- Mattress & Linen -->
    <rect x="180" y="260" width="440" height="130" rx="20" fill="#FCFCFA"/>
    <!-- Folded Duvet in Sage Linen -->
    <rect x="180" y="320" width="440" height="90" rx="14" fill="#879780"/>
    <!-- Pillows -->
    <rect x="220" y="240" width="150" height="50" rx="16" fill="#FFFFFF" stroke="#E5EAE0" stroke-width="2"/>
    <rect x="430" y="240" width="150" height="50" rx="16" fill="#FFFFFF" stroke="#E5EAE0" stroke-width="2"/>

    <!-- Floating Platform Base -->
    <rect x="160" y="390" width="480" height="30" rx="4" fill="url(#oak)"/>
    <!-- Concealed Recessed Floating Plinth -->
    <rect x="250" y="420" width="300" height="24" fill="#8B7B68"/>
  </g>
  <text x="400" y="530" font-family="'DM Sans', sans-serif" font-weight="700" font-size="22" fill="#5B3928" text-anchor="middle">NARA SOLID OAK FLOATING BED</text>
  <text x="400" y="555" font-family="'Inter', sans-serif" font-weight="500" font-size="14" fill="#77776F" text-anchor="middle">Integrated Cantilever Nightstands &bull; Dimmable 2700K Glow</text>
</svg>`;

// 12. Chair (Eames Aluminum Studio Task Chair)
svgs['chair.svg'] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#F7F4EC"/><stop offset="100%" stop-color="#DFE5DB"/></linearGradient>
    <linearGradient id="leather" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#9C623D"/><stop offset="50%" stop-color="#7E4A28"/><stop offset="100%" stop-color="#5B3928"/></linearGradient>
    <linearGradient id="chrome" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#E2E6DF"/><stop offset="50%" stop-color="#FFFFFF"/><stop offset="100%" stop-color="#B0B6AA"/></linearGradient>
    <filter id="drop" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#292A26" flood-opacity="0.18"/></filter>
  </defs>
  <rect width="800" height="600" fill="url(#bg)"/>
  <ellipse cx="400" cy="490" rx="180" ry="24" fill="#C5CDC0" opacity="0.6"/>

  <g filter="url(#drop)" transform="translate(250, 90)">
    <!-- Ribbed Leather Backrest & Seat -->
    <path d="M 60 40 Q 150 30 240 40 L 230 260 Q 150 280 70 260 Z" fill="url(#leather)"/>
    <!-- Horizontal Rib Stitch Lines -->
    <line x1="68" y1="80" x2="232" y2="80" stroke="#482C1C" stroke-width="4"/>
    <line x1="70" y1="120" x2="230" y2="120" stroke="#482C1C" stroke-width="4"/>
    <line x1="72" y1="160" x2="228" y2="160" stroke="#482C1C" stroke-width="4"/>
    <line x1="74" y1="200" x2="226" y2="200" stroke="#482C1C" stroke-width="4"/>
    <line x1="76" y1="240" x2="224" y2="240" stroke="#482C1C" stroke-width="4"/>

    <!-- Polished Cast Aluminum Arms -->
    <path d="M 50 110 C 20 120, 20 210, 65 240" fill="none" stroke="url(#chrome)" stroke-width="12" stroke-linecap="round"/>
    <path d="M 250 110 C 280 120, 280 210, 235 240" fill="none" stroke="url(#chrome)" stroke-width="12" stroke-linecap="round"/>

    <!-- Center Pneumatic Stem -->
    <rect x="142" y="270" width="16" height="70" fill="url(#chrome)"/>
    <!-- 5-Star Swivel Base with Castors -->
    <line x1="150" y1="340" x2="60" y2="380" stroke="url(#chrome)" stroke-width="12" stroke-linecap="round"/>
    <line x1="150" y1="340" x2="240" y2="380" stroke="url(#chrome)" stroke-width="12" stroke-linecap="round"/>
    <line x1="150" y1="340" x2="150" y2="390" stroke="url(#chrome)" stroke-width="12" stroke-linecap="round"/>
    <!-- Castors -->
    <circle cx="56" cy="384" r="8" fill="#1C1D1B"/>
    <circle cx="244" cy="384" r="8" fill="#1C1D1B"/>
    <circle cx="150" cy="394" r="8" fill="#1C1D1B"/>
  </g>
  <text x="400" y="535" font-family="'DM Sans', sans-serif" font-weight="700" font-size="22" fill="#5B3928" text-anchor="middle">EAMES ALUMINUM STUDIO TASK CHAIR</text>
  <text x="400" y="560" font-family="'Inter', sans-serif" font-weight="500" font-size="14" fill="#77776F" text-anchor="middle">Full-Grain Italian Cognac Leather &bull; Die-Cast Armature</text>
</svg>`;

// 13. Table (Solstice Live-Edge Walnut Dining Table)
svgs['dining-table.svg'] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#FBF9F5"/><stop offset="100%" stop-color="#E2E7DE"/></linearGradient>
    <linearGradient id="walnut" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#6F4733"/><stop offset="40%" stop-color="#5B3928"/><stop offset="70%" stop-color="#4A2E20"/><stop offset="100%" stop-color="#38251C"/></linearGradient>
    <filter id="drop" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#292A26" flood-opacity="0.2"/></filter>
  </defs>
  <rect width="800" height="600" fill="url(#bg)"/>
  <ellipse cx="400" cy="480" rx="300" ry="30" fill="#C5CDC0" opacity="0.6"/>

  <g filter="url(#drop)">
    <!-- Heavy Industrial Steel Trestle Legs -->
    <polygon points="200,280 230,280 200,450 170,450" fill="#20221E"/>
    <polygon points="220,280 250,280 280,450 250,450" fill="#20221E"/>
    <polygon points="560,280 590,280 560,450 530,450" fill="#20221E"/>
    <polygon points="580,280 610,280 640,450 610,450" fill="#20221E"/>

    <!-- Continuous Live-Edge Walnut Slab Tabletop -->
    <path d="M 120 250 C 240 240, 560 240, 680 250 C 690 270, 675 285, 665 285 C 540 280, 260 280, 135 285 C 120 285, 110 270, 120 250 Z" fill="url(#walnut)"/>
    <!-- Butterfly Key Joinery Accents -->
    <polygon points="280,256 288,264 280,272 272,264" fill="#C29D59"/>
    <polygon points="520,256 528,264 520,272 512,264" fill="#C29D59"/>
  </g>
  <text x="400" y="530" font-family="'DM Sans', sans-serif" font-weight="700" font-size="22" fill="#5B3928" text-anchor="middle">SOLSTICE LIVE-EDGE SOLID WALNUT TABLE</text>
  <text x="400" y="555" font-family="'Inter', sans-serif" font-weight="500" font-size="14" fill="#77776F" text-anchor="middle">Continuous 1.75" American Slab &bull; Butterfly Key Joinery</text>
</svg>`;

// 14. Standing Desk (Strata Motorized Solid Walnut Standing Desk)
svgs['desk.svg'] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#F7F4EC"/><stop offset="100%" stop-color="#DFE5DB"/></linearGradient>
    <linearGradient id="walnut" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#6F4733"/><stop offset="50%" stop-color="#5B3928"/><stop offset="100%" stop-color="#38251C"/></linearGradient>
    <filter id="drop" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#292A26" flood-opacity="0.18"/></filter>
  </defs>
  <rect width="800" height="600" fill="url(#bg)"/>
  <ellipse cx="400" cy="480" rx="280" ry="28" fill="#C5CDC0" opacity="0.6"/>

  <g filter="url(#drop)">
    <!-- Motorized Telescoping Dual Columns -->
    <rect x="220" y="240" width="30" height="200" rx="4" fill="#262824"/>
    <rect x="215" y="320" width="40" height="120" rx="4" fill="#383B35"/>
    <rect x="170" y="440" width="130" height="16" rx="8" fill="#262824"/>

    <rect x="550" y="240" width="30" height="200" rx="4" fill="#262824"/>
    <rect x="545" y="320" width="40" height="120" rx="4" fill="#383B35"/>
    <rect x="500" y="440" width="130" height="16" rx="8" fill="#262824"/>

    <!-- Solid Walnut Ergonomic Beveled Desktop -->
    <rect x="130" y="210" width="540" height="34" rx="10" fill="url(#walnut)"/>
    <!-- Undermount OLED Memory Controller Handset -->
    <rect x="570" y="244" width="70" height="18" rx="4" fill="#141513"/>
    <text x="605" y="258" font-family="'DM Sans', sans-serif" font-weight="700" font-size="11" fill="#879780" text-anchor="middle">72.5 cm</text>
  </g>
  <text x="400" y="530" font-family="'DM Sans', sans-serif" font-weight="700" font-size="22" fill="#5B3928" text-anchor="middle">STRATA MOTORIZED SOLID WALNUT DESK</text>
  <text x="400" y="555" font-family="'Inter', sans-serif" font-weight="500" font-size="14" fill="#77776F" text-anchor="middle">Dual Swedish Lift Motors &bull; 4 Memory Presets</text>
</svg>`;

// 15. Pendant Light (Lune Opal Glass Pendant Light)
svgs['lamp.svg'] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#FBF9F5"/><stop offset="100%" stop-color="#E2E7DE"/></linearGradient>
    <linearGradient id="brass" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#E2C48D"/><stop offset="50%" stop-color="#C29D59"/><stop offset="100%" stop-color="#8C6D2B"/></linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="24" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <rect width="800" height="600" fill="url(#bg)"/>
  
  <!-- Braided Cord -->
  <line x1="400" y1="0" x2="400" y2="200" stroke="#77776F" stroke-width="4"/>
  <rect x="390" y="190" width="20" height="24" rx="4" fill="url(#brass)"/>

  <!-- Spun Brass Ring Halo -->
  <circle cx="400" cy="300" r="140" fill="none" stroke="url(#brass)" stroke-width="22"/>

  <!-- Frosted Opal Glass Glowing Orb -->
  <circle cx="400" cy="300" r="85" fill="#FFFDF8" filter="url(#glow)"/>
  <circle cx="400" cy="300" r="80" fill="#FFFBE8" opacity="0.9"/>

  <text x="400" y="530" font-family="'DM Sans', sans-serif" font-weight="700" font-size="22" fill="#5B3928" text-anchor="middle">LUNE FROSTED GLASS &amp; BRASS PENDANT</text>
  <text x="400" y="555" font-family="'Inter', sans-serif" font-weight="500" font-size="14" fill="#77776F" text-anchor="middle">Hand-Blown Opaline Orb &bull; Dimmable 2700K Warm Filament</text>
</svg>`;

// 16. Credenza (Forma 4-Door Sideboard)
svgs['credenza.svg'] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#F7F4EC"/><stop offset="100%" stop-color="#DFE5DB"/></linearGradient>
    <linearGradient id="travertine" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#F2ECE4"/><stop offset="50%" stop-color="#E8E0D5"/><stop offset="100%" stop-color="#DDD3C4"/></linearGradient>
    <linearGradient id="oak" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#DECBB3"/><stop offset="100%" stop-color="#B69F82"/></linearGradient>
    <filter id="drop" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#292A26" flood-opacity="0.18"/></filter>
  </defs>
  <rect width="800" height="600" fill="url(#bg)"/>
  <ellipse cx="400" cy="480" rx="280" ry="26" fill="#C5CDC0" opacity="0.6"/>

  <g filter="url(#drop)" transform="translate(140, 160)">
    <!-- Travertine Honed Stone Slab Top -->
    <rect x="0" y="0" width="520" height="28" rx="14" fill="url(#travertine)"/>
    <!-- Tambour Fluted White Oak Body -->
    <rect x="10" y="24" width="500" height="200" rx="20" fill="url(#oak)"/>
    <!-- Fluted Slats Texture -->
    <path d="M 30 24 L 30 224 M 60 24 L 60 224 M 90 24 L 90 224 M 120 24 L 120 224 M 150 24 L 150 224 M 180 24 L 180 224 M 210 24 L 210 224 M 240 24 L 240 224 M 270 24 L 270 224 M 300 24 L 300 224 M 330 24 L 330 224 M 360 24 L 360 224 M 390 24 L 390 224 M 420 24 L 420 224 M 450 24 L 450 224 M 480 24 L 480 224" stroke="#9E876F" stroke-width="2"/>
    <!-- Brass Feet -->
    <rect x="40" y="224" width="16" height="40" rx="4" fill="#C29D59"/>
    <rect x="252" y="224" width="16" height="40" rx="4" fill="#C29D59"/>
    <rect x="464" y="224" width="16" height="40" rx="4" fill="#C29D59"/>
  </g>
  <text x="400" y="530" font-family="'DM Sans', sans-serif" font-weight="700" font-size="22" fill="#5B3928" text-anchor="middle">FORMA 4-DOOR FLUTED CREDENZA</text>
  <text x="400" y="555" font-family="'Inter', sans-serif" font-weight="500" font-size="14" fill="#77776F" text-anchor="middle">Honed Italian Silver Vein Travertine &bull; Tambour Oak</text>
</svg>`;

// 17. Wardrobe (Aalto Fluted Glass & Oak Wardrobe)
svgs['wardrobe.svg'] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#FBF9F5"/><stop offset="100%" stop-color="#DFE5DB"/></linearGradient>
    <linearGradient id="oak" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#DECBB3"/><stop offset="100%" stop-color="#B69F82"/></linearGradient>
    <filter id="drop" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#292A26" flood-opacity="0.18"/></filter>
  </defs>
  <rect width="800" height="600" fill="url(#bg)"/>
  <ellipse cx="400" cy="490" rx="220" ry="24" fill="#C5CDC0" opacity="0.6"/>

  <g filter="url(#drop)" transform="translate(240, 70)">
    <rect x="0" y="0" width="320" height="390" rx="10" fill="url(#oak)"/>
    <rect x="14" y="14" width="140" height="362" rx="4" fill="#E6EDE2" opacity="0.85"/>
    <rect x="166" y="14" width="140" height="362" rx="4" fill="#E6EDE2" opacity="0.85"/>
    <!-- Reeded Glass Fluting Lines -->
    <path d="M 30 14 L 30 376 M 50 14 L 50 376 M 70 14 L 70 376 M 90 14 L 90 376 M 110 14 L 110 376 M 130 14 L 130 376" stroke="#BAC4B5" stroke-width="2"/>
    <path d="M 180 14 L 180 376 M 200 14 L 200 376 M 220 14 L 220 376 M 240 14 L 240 376 M 260 14 L 260 376 M 280 14 L 280 376" stroke="#BAC4B5" stroke-width="2"/>
    <!-- Bronze Vertical Handles -->
    <rect x="144" y="160" width="6" height="80" rx="3" fill="#5B3928"/>
    <rect x="170" y="160" width="6" height="80" rx="3" fill="#5B3928"/>
  </g>
  <text x="400" y="535" font-family="'DM Sans', sans-serif" font-weight="700" font-size="22" fill="#5B3928" text-anchor="middle">AALTO FLUTED GLASS &amp; OAK WARDROBE</text>
</svg>`;

// 18. Vase (Ceramic Sculptural Vessel Trio)
svgs['vase.svg'] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#F7F4EC"/><stop offset="100%" stop-color="#DFE5DB"/></linearGradient>
    <linearGradient id="stone" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#E8E2D8"/><stop offset="100%" stop-color="#C2B7A5"/></linearGradient>
    <filter id="drop" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#292A26" flood-opacity="0.18"/></filter>
  </defs>
  <rect width="800" height="600" fill="url(#bg)"/>
  <ellipse cx="400" cy="480" rx="220" ry="24" fill="#C5CDC0" opacity="0.6"/>

  <g filter="url(#drop)" transform="translate(180, 140)">
    <!-- Tall Amphora Vessel -->
    <path d="M 120 70 C 80 160, 60 280, 120 300 C 180 280, 160 160, 120 70 Z" fill="url(#stone)"/>
    <!-- Round Doughnut Vessel with Cutout -->
    <circle cx="250" cy="220" r="75" fill="#B3A28E"/>
    <circle cx="250" cy="220" r="30" fill="#EAE5DC"/>
    <!-- Wide Low Bowl Vessel -->
    <ellipse cx="360" cy="250" rx="70" ry="45" fill="#879780"/>
  </g>
  <text x="400" y="530" font-family="'DM Sans', sans-serif" font-weight="700" font-size="22" fill="#5B3928" text-anchor="middle">BRUTALIST CERAMIC VESSEL TRIO</text>
  <text x="400" y="555" font-family="'Inter', sans-serif" font-weight="500" font-size="14" fill="#77776F" text-anchor="middle">Hand-Thrown Textured Stoneware &bull; Sand Matte Glaze</text>
</svg>`;

// 19. Hero Lifestyle Artwork
svgs['hero-lifestyle.svg'] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#F7F4EC"/><stop offset="50%" stop-color="#EAEFE5"/><stop offset="100%" stop-color="#DDE4D6"/></linearGradient>
    <linearGradient id="walnut" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#6F4733"/><stop offset="50%" stop-color="#5B3928"/><stop offset="100%" stop-color="#38251C"/></linearGradient>
    <linearGradient id="screen" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1B2E24"/><stop offset="60%" stop-color="#566B52"/><stop offset="100%" stop-color="#C29D59"/></linearGradient>
    <linearGradient id="boucle" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="100%" stop-color="#E4DDD1"/></linearGradient>
    <filter id="drop" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="18" stdDeviation="24" flood-color="#292A26" flood-opacity="0.16"/></filter>
  </defs>
  <rect width="1200" height="800" fill="url(#bg)"/>

  <!-- Interior Architectural Floor Line -->
  <line x1="0" y1="620" x2="1200" y2="620" stroke="#C8CFC0" stroke-width="4"/>
  <rect x="0" y="622" width="1200" height="178" fill="#E2E8DC"/>

  <!-- Ambient Light Sphere on Wall -->
  <circle cx="850" cy="220" r="160" fill="#FFFBE8" opacity="0.6"/>

  <g filter="url(#drop)">
    <!-- 1. The Walnut Desk -->
    <rect x="180" y="420" width="700" height="34" rx="10" fill="url(#walnut)"/>
    <rect x="230" y="454" width="28" height="170" rx="4" fill="#20221E"/>
    <rect x="800" y="454" width="28" height="170" rx="4" fill="#20221E"/>

    <!-- 2. The Ultrabook Laptop on Desk -->
    <rect x="420" y="270" width="240" height="150" rx="8" fill="#C5CABF"/>
    <rect x="428" y="278" width="224" height="134" rx="4" fill="url(#screen)"/>
    <polygon points="380,420 700,420 680,396 400,396" fill="#D8DDD2"/>

    <!-- 3. Bookshelf Hi-Fi Speaker on Desk -->
    <rect x="220" y="260" width="110" height="160" rx="8" fill="url(#walnut)"/>
    <circle cx="275" cy="310" r="20" fill="#141513"/>
    <circle cx="275" cy="310" r="12" fill="#C29D59"/>
    <circle cx="275" cy="370" r="32" fill="#141513"/>
    <circle cx="275" cy="370" r="22" fill="#C29D59"/>

    <!-- 4. Studio Task Chair -->
    <rect x="490" y="410" width="120" height="140" rx="20" fill="#7E4A28"/>
    <line x1="550" y1="550" x2="550" y2="610" stroke="#CAD0C5" stroke-width="12"/>

    <!-- 5. Bouclé Armchair in background corner -->
    <rect x="910" y="380" width="200" height="220" rx="40" fill="url(#boucle)"/>
    <ellipse cx="1010" cy="460" rx="70" ry="40" fill="#566B52" opacity="0.7"/>

    <!-- 6. Floating Glass Orb Lamp -->
    <circle cx="850" cy="220" r="60" fill="#FFFFFF"/>
    <circle cx="850" cy="220" r="85" fill="none" stroke="#C29D59" stroke-width="8"/>
    <line x1="850" y1="0" x2="850" y2="135" stroke="#77776F" stroke-width="3"/>
  </g>

  <!-- Brand Typography Overlay -->
  <rect x="60" y="60" width="280" height="40" rx="20" fill="#FFFFFF" opacity="0.9"/>
  <text x="200" y="86" font-family="'DM Sans', sans-serif" font-weight="700" font-size="14" fill="#5B3928" letter-spacing="3" text-anchor="middle">NEST &amp; NOVA ATELIER</text>
</svg>`;

for (const [file, content] of Object.entries(svgs)) {
  fs.writeFileSync(path.join(targetDir, file), content, 'utf8');
}

console.log(`Successfully generated ${Object.keys(svgs).length} luxury designer SVG artworks into frontend/assets/images/`);

