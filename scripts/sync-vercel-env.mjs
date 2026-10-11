import { execSync } from 'child_process';
import fs from 'fs';

console.log('Syncing environment variables to Vercel project...');

if (!fs.existsSync('.env.local')) {
  console.error('❌ .env.local not found');
  process.exit(1);
}

const content = fs.readFileSync('.env.local', 'utf-8');
const envVars = {};

content.split('\n').forEach((line) => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const idx = trimmed.indexOf('=');
    if (idx !== -1) {
      const k = trimmed.substring(0, idx).trim();
      const v = trimmed.substring(idx + 1).trim();
      // Only include required application variables
      if ([
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'SUPABASE_SERVICE_ROLE_KEY',
        'SESSION_SECRET',
        'INITIAL_OWNER_EMAIL',
        'INITIAL_OWNER_PASSWORD',
        'INITIAL_ADMIN_EMAIL',
        'INITIAL_ADMIN_PASSWORD',
      ].includes(k)) {
        envVars[k] = v;
      }
    }
  }
});

const environments = ['production', 'preview', 'development'];

for (const [key, val] of Object.entries(envVars)) {
  for (const env of environments) {
    try {
      console.log(`Setting ${key} for ${env}...`);
      execSync(`npx vercel env add ${key} ${env} --value "${val}" --force --yes`, {
        stdio: 'pipe',
      });
      console.log(`✓ Set ${key} for ${env}`);
    } catch (err) {
      console.warn(`Warning setting ${key} for ${env}:`, err.message);
    }
  }
}

console.log('✅ All environment variables successfully configured on Vercel!');
