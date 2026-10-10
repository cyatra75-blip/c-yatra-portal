import fs from 'fs';
import path from 'path';

const logosDir = path.resolve('public', 'portals');
if (!fs.existsSync(logosDir)) {
  fs.mkdirSync(logosDir, { recursive: true });
}

const logos = {
  'makemytrip.svg': `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="20" fill="#E52E2E"/>
    <text x="50" y="66" font-family="Arial, Helvetica, sans-serif" font-size="44" font-weight="bold" font-style="italic" fill="#FFFFFF" text-anchor="middle">my</text>
  </svg>`,
  
  'ixigo.svg': `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="20" fill="#FF6600"/>
    <text x="50" y="60" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="bold" fill="#FFFFFF" text-anchor="middle">ixigo</text>
  </svg>`,
  
  'cleartrip.svg': `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="20" fill="#FF6B35"/>
    <path d="M30 50 L44 64 L72 36" stroke="#FFFFFF" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  </svg>`,
  
  'skyscanner.svg': `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="20" fill="#0770E3"/>
    <circle cx="50" cy="62" r="14" fill="#FFFFFF"/>
    <path d="M22 62 C22 42 36 28 50 28 C64 28 78 42 78 62" stroke="#FFFFFF" stroke-width="5" fill="none" stroke-dasharray="6 4"/>
  </svg>`,
  
  'googleflights.svg': `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="20" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
    <path d="M50 24 L56 42 L75 42 L60 54 L66 72 L50 60 L34 72 L40 54 L25 42 L44 42 Z" fill="#4285F4"/>
    <circle cx="50" cy="50" r="32" fill="none" stroke="#EA4335" stroke-width="4" stroke-dasharray="45 15"/>
  </svg>`,
  
  'booking.svg': `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="20" fill="#003580"/>
    <text x="50" y="67" font-family="Arial, Helvetica, sans-serif" font-size="52" font-weight="bold" fill="#FFFFFF" text-anchor="middle">B.</text>
  </svg>`,
  
  'yatra.svg': `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="20" fill="#EA2330"/>
    <text x="50" y="60" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="bold" fill="#FFFFFF" text-anchor="middle">yatra</text>
  </svg>`,
  
  'easemytrip.svg': `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="20" fill="#1B75BC"/>
    <path d="M22 50 L78 28 L48 78 L45 55 Z" fill="#FFFFFF"/>
  </svg>`,
  
  'trip.svg': `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="20" fill="#2577E3"/>
    <text x="50" y="61" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="bold" fill="#FFFFFF" text-anchor="middle">Trip.</text>
  </svg>`,
  
  'alternativeairlines.svg': `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="20" fill="#0A192F"/>
    <path d="M26 74 L50 26 L74 74 L58 74 L50 56 L42 74 Z" fill="#00E5FF"/>
  </svg>`,

  'agoda.svg': `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="20" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
    <circle cx="35" cy="38" r="8" fill="#FF2B2B"/>
    <circle cx="55" cy="38" r="8" fill="#FDBB14"/>
    <circle cx="75" cy="38" r="8" fill="#4DB848"/>
    <circle cx="45" cy="58" r="8" fill="#2484C6"/>
    <circle cx="65" cy="58" r="8" fill="#A2338A"/>
  </svg>`,

  'goibibo.svg': `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="20" fill="#EC5B24"/>
    <text x="50" y="63" font-family="Arial, Helvetica, sans-serif" font-size="36" font-weight="bold" fill="#FFFFFF" text-anchor="middle">go</text>
  </svg>`,

  'redbus.svg': `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="20" fill="#D84E55"/>
    <rect x="25" y="30" width="50" height="40" rx="8" fill="#FFFFFF"/>
    <circle cx="37" cy="70" r="5" fill="#D84E55"/>
    <circle cx="63" cy="70" r="5" fill="#D84E55"/>
    <rect x="30" y="36" width="40" height="16" rx="4" fill="#D84E55"/>
  </svg>`,

  'irctc.svg': `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="20" fill="#223E75"/>
    <circle cx="50" cy="50" r="30" fill="none" stroke="#E76B24" stroke-width="6"/>
    <path d="M50 28 L50 72 M28 50 L72 50" stroke="#FFFFFF" stroke-width="5"/>
  </svg>`,

  'airbnb.svg': `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="20" fill="#FF5A5F"/>
    <path d="M50 25 C42 25 35 34 35 46 C35 58 45 68 50 75 C55 68 65 58 65 46 C65 34 58 25 50 25 Z M50 48 C46 48 43 45 43 41 C43 37 46 34 50 34 C54 34 57 37 57 41 C57 45 54 48 50 48 Z" fill="#FFFFFF"/>
  </svg>`,

  'savaari.svg': `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="20" fill="#2E7D32"/>
    <path d="M25 60 L35 42 L65 42 L75 60 Z" fill="#FFFFFF"/>
    <circle cx="36" cy="64" r="6" fill="#2E7D32"/>
    <circle cx="64" cy="64" r="6" fill="#2E7D32"/>
  </svg>`,

  'atlys.svg': `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="20" fill="#000000"/>
    <path d="M50 25 L75 75 L62 75 L50 50 L38 75 L25 75 Z" fill="#00FF88"/>
  </svg>`,

  'policybazaar.svg': `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="20" fill="#004A99"/>
    <path d="M50 25 L75 36 V54 C75 68 64 78 50 82 C36 78 25 68 25 54 V36 Z" fill="#FFFFFF"/>
    <path d="M50 32 L70 41 V54 C70 65 61 73 50 76 C39 73 30 65 30 54 V41 Z" fill="#004A99"/>
  </svg>`,

  'travelboutique.svg': `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="20" fill="#D32F2F"/>
    <text x="50" y="62" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="bold" fill="#FFFFFF" text-anchor="middle">TBO</text>
  </svg>`,

  'vfs.svg': `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="20" fill="#003366"/>
    <text x="50" y="62" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="bold" fill="#FFFFFF" text-anchor="middle">VFS</text>
  </svg>`
};

for (const [file, svg] of Object.entries(logos)) {
  fs.writeFileSync(path.join(logosDir, file), svg);
}

console.log(`Successfully generated ${Object.keys(logos).length} portal logos in ${logosDir}`);
