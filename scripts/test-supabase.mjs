import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import ws from 'ws';

// Load .env.local manually
if (fs.existsSync('.env.local')) {
  const content = fs.readFileSync('.env.local', 'utf-8');
  content.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const k = trimmed.substring(0, idx).trim();
        const v = trimmed.substring(idx + 1).trim();
        process.env[k] = v;
      }
    }
  });
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
  realtime: { transport: ws },
});

async function testConnection() {
  console.log('Testing Supabase connection to:', url);

  // Test categories table
  const { data: catData, error: catError } = await supabase.from('categories').select('*').limit(5);
  console.log('Categories query:', { success: !catError, error: catError?.message, count: catData?.length });

  // Test portals table
  const { data: portData, error: portError } = await supabase.from('portals').select('*').limit(5);
  console.log('Portals query:', { success: !portError, error: portError?.message, count: portData?.length });

  // Test profiles table
  const { data: profData, error: profError } = await supabase.from('profiles').select('*').limit(5);
  console.log('Profiles query:', { success: !profError, error: profError?.message, count: profData?.length });
}

testConnection().catch(console.error);
