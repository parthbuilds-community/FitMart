import sharp from "sharp";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = join(__dirname, "..", "client", "public", "og-image.png");

const WIDTH = 1200;
const HEIGHT = 630;

// Create SVG with the same design as og-image.svg but optimized for PNG conversion
const svgContent = `
<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0a0a0a"/>
      <stop offset="50%" stop-color="#1a1a2e"/>
      <stop offset="100%" stop-color="#0f1a0f"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#22c55e"/>
      <stop offset="100%" stop-color="#16a34a"/>
    </linearGradient>
    <linearGradient id="accent2" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#16a34a"/>
      <stop offset="100%" stop-color="#15803d"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>

  <!-- Decorative circles -->
  <circle cx="1050" cy="150" r="280" fill="#22c55e" opacity="0.04"/>
  <circle cx="1150" cy="500" r="200" fill="#22c55e" opacity="0.03"/>
  <circle cx="200" cy="550" r="150" fill="#22c55e" opacity="0.02"/>

  <!-- Top accent line -->
  <rect x="0" y="0" width="${WIDTH}" height="4" fill="url(#accent)"/>

  <!-- Logo icon -->
  <rect x="80" y="80" width="64" height="64" rx="16" fill="url(#accent)"/>
  <text x="112" y="124" font-family="Arial, Helvetica, sans-serif" font-size="38" font-weight="bold" fill="#0a0a0a" text-anchor="middle">F</text>

  <!-- Brand name -->
  <text x="160" y="118" font-family="Arial, Helvetica, sans-serif" font-size="36" font-weight="bold" fill="#ffffff">FitMart</text>

  <!-- Tagline -->
  <text x="80" y="180" font-family="Arial, Helvetica, sans-serif" font-size="22" fill="#86efac" opacity="0.85">Fitness Equipment, Nutrition &amp; Coaching</text>

  <!-- Main headline -->
  <text x="80" y="290" font-family="Arial, Helvetica, sans-serif" font-size="56" font-weight="bold" fill="#ffffff">Your Fitness Journey</text>
  <text x="80" y="360" font-family="Arial, Helvetica, sans-serif" font-size="56" font-weight="bold" fill="url(#accent)">Starts Here</text>

  <!-- Description -->
  <text x="80" y="430" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="#9ca3af" opacity="0.9">Mumbai's premium fitness marketplace — gym equipment,</text>
  <text x="80" y="462" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="#9ca3af" opacity="0.9">supplements, personalized plans, and expert coaching.</text>

  <!-- Bottom bar -->
  <rect x="80" y="510" width="220" height="2" fill="url(#accent2)" opacity="0.5"/>
  <text x="80" y="545" font-family="Arial, Helvetica, sans-serif" font-size="16" fill="#6b7280">fitmart.in</text>

  <!-- Pill badges -->
  <rect x="800" y="510" width="120" height="32" rx="16" fill="#22c55e" opacity="0.12"/>
  <text x="860" y="532" font-family="Arial, Helvetica, sans-serif" font-size="14" fill="#86efac" text-anchor="middle">Shop Now</text>

  <rect x="940" y="510" width="140" height="32" rx="16" fill="#22c55e" opacity="0.12"/>
  <text x="1010" y="532" font-family="Arial, Helvetica, sans-serif" font-size="14" fill="#86efac" text-anchor="middle">Get Started</text>
</svg>
`;

await sharp(Buffer.from(svgContent))
  .png()
  .toFile(outputPath);

console.log(`OG image generated: ${outputPath}`);
console.log(`Dimensions: ${WIDTH}×${HEIGHT}`);
