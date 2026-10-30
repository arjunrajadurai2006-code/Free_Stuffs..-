const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '../../frontend/assets/images');
if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

function createSvg(title, subtitle, icon, bgGradient1, bgGradient2, accentColor) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bgGradient1}"/>
      <stop offset="100%" stop-color="${bgGradient2}"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#38251C" flood-opacity="0.12"/>
    </filter>
  </defs>
  <rect width="800" height="600" fill="url(#grad)"/>
  
  <!-- Subtle decorative architectural circles and grid lines -->
  <circle cx="400" cy="270" r="180" fill="none" stroke="${accentColor}" stroke-opacity="0.15" stroke-width="2"/>
  <circle cx="400" cy="270" r="120" fill="none" stroke="${accentColor}" stroke-opacity="0.25" stroke-width="1.5" stroke-dasharray="4 6"/>
  <line x1="120" y1="270" x2="680" y2="270" stroke="${accentColor}" stroke-opacity="0.1" stroke-width="1"/>
  
  <!-- Central Icon Plaque -->
  <g filter="url(#shadow)">
    <rect x="290" y="160" width="220" height="220" rx="36" fill="#FFFFFF"/>
    <text x="400" y="295" font-family="'Font Awesome 6 Free', 'Font Awesome 5 Free', 'Inter', sans-serif" font-weight="900" font-size="82" fill="${accentColor}" text-anchor="middle">${icon}</text>
  </g>
  
  <!-- Brand Tag -->
  <rect x="330" y="80" width="140" height="30" rx="15" fill="${accentColor}" fill-opacity="0.12"/>
  <text x="400" y="100" font-family="'DM Sans', 'Inter', sans-serif" font-weight="700" font-size="12" fill="${accentColor}" letter-spacing="3" text-anchor="middle">NEST &amp; NOVA</text>
  
  <!-- Text Label -->
  <text x="400" y="445" font-family="'DM Sans', 'Inter', sans-serif" font-weight="700" font-size="28" fill="#5B3928" text-anchor="middle" letter-spacing="0.5">${title}</text>
  <text x="400" y="480" font-family="'Inter', sans-serif" font-weight="500" font-size="16" fill="#77776F" text-anchor="middle">${subtitle}</text>
  
  <rect x="375" y="520" width="50" height="4" rx="2" fill="${accentColor}"/>
</svg>`;
}

const images = [
  { file: 'headphones.svg', title: 'Studio Acoustic Headphones', sub: 'Spatial Biocellulose Drivers', icon: '🎧', g1: '#F7F4EC', g2: '#E9EDE5', acc: '#566B52' },
  { file: 'smartphone.svg', title: 'Nova Titanium Flagship', sub: 'LTPO 120Hz ProMotion Display', icon: '📱', g1: '#F5F5F0', g2: '#DFE5DB', acc: '#5B3928' },
  { file: 'laptop.svg', title: 'Starlight Pro Ultrabook', sub: 'M-Series Architecture', icon: '💻', g1: '#F7F4EC', g2: '#E6EAE2', acc: '#566B52' },
  { file: 'tv.svg', title: 'Horizon 4K OLED Smart TV', sub: 'Cinema Ambient Art Mode', icon: '📺', g1: '#F9F8F5', g2: '#E8ECE4', acc: '#5B3928' },
  { file: 'camera.svg', title: 'Lumina Mirrorless Camera', sub: '61MP Full-Frame Optics', icon: '📷', g1: '#F7F4EC', g2: '#DFE5DB', acc: '#566B52' },
  { file: 'smartwatch.svg', title: 'Terra Sapphire Smartwatch', sub: 'Aerospace Grade 5 Titanium', icon: '⌚', g1: '#F5F5F0', g2: '#E9EDE5', acc: '#5B3928' },
  { file: 'speaker.svg', title: 'Walnut Hi-Fi Bookshelf Speakers', sub: 'Handcrafted Acoustic Joinery', icon: '🔊', g1: '#F7F4EC', g2: '#E2E7DE', acc: '#566B52' },
  { file: 'controller.svg', title: 'Apex Wireless Controller', sub: 'Magnetic Hall-Effect Anti-Drift', icon: '🎮', g1: '#F9F8F5', g2: '#E9EDE5', acc: '#5B3928' },
  { file: 'charger.svg', title: 'Orbit MagSafe Charging Dock', sub: 'Solid Walnut & Spun Brass', icon: '⚡', g1: '#F7F4EC', g2: '#DFE5DB', acc: '#566B52' },
  { file: 'sofa.svg', title: 'Koto Modular Bouclé Sofa', sub: 'Tactile Organic Sectional', icon: '🛋️', g1: '#F9F8F5', g2: '#ECEFE8', acc: '#5B3928' },
  { file: 'bed.svg', title: 'Nara Oak Floating Bed', sub: 'Integrated Ambient Headboard', icon: '🛏️', g1: '#F7F4EC', g2: '#E5EAE0', acc: '#566B52' },
  { file: 'chair.svg', title: 'Studio Ergonomic Task Chair', sub: 'Full-Grain Italian Leather', icon: '🪑', g1: '#F5F5F0', g2: '#E2E7DE', acc: '#5B3928' },
  { file: 'dining-table.svg', title: 'Live-Edge Walnut Dining Table', sub: 'Solid Continuous Slab', icon: '🪵', g1: '#F7F4EC', g2: '#E9EDE5', acc: '#5B3928' },
  { file: 'wardrobe.svg', title: 'Aalto Fluted Glass Wardrobe', sub: 'Motion-Sensor Soft Lighting', icon: '🚪', g1: '#F9F8F5', g2: '#DFE5DB', acc: '#566B52' },
  { file: 'desk.svg', title: 'Strata Motorized Standing Desk', sub: 'Dual Whisper Motors & Walnut Slab', icon: '🖥️', g1: '#F7F4EC', g2: '#E6EAE2', acc: '#5B3928' },
  { file: 'lamp.svg', title: 'Lune Opal Glass Pendant Light', sub: 'Hand-Blown Frosted Glass', icon: '💡', g1: '#F9F8F5', g2: '#ECEFE8', acc: '#566B52' },
  { file: 'credenza.svg', title: 'Forma 4-Door Fluted Credenza', sub: 'Tambour Oak & Travertine Top', icon: '🗄️', g1: '#F7F4EC', g2: '#E2E7DE', acc: '#5B3928' },
  { file: 'vase.svg', title: 'Ceramic Sculptural Vessel Trio', sub: 'Wheel-Thrown Textured Stoneware', icon: '🏺', g1: '#F9F8F5', g2: '#E9EDE5', acc: '#566B52' },
  { file: 'hero-lifestyle.svg', title: 'NEST & NOVA ATELIER', sub: 'Technology Meets Timeless Living', icon: '🌿', g1: '#F7F4EC', g2: '#DFE5DB', acc: '#566B52' }
];

images.forEach(img => {
  const content = createSvg(img.title, img.sub, img.icon, img.g1, img.g2, img.acc);
  fs.writeFileSync(path.join(targetDir, img.file), content, 'utf8');
});

console.log(`Generated ${images.length} high-fidelity local vector images into frontend/assets/images/`);

