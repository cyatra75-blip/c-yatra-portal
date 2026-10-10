import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey || supabaseUrl.includes('placeholder')) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local to provision accounts.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function provisionUser(email, password, role, fullName) {
  if (!email || !password) {
    console.warn(`⚠️ Skipping ${role} provisioning: email or password not provided in environment.`);
    return null;
  }

  console.log(`🔐 Provisioning ${role} account: ${email}...`);

  // Check if user already exists in auth.users
  const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    throw new Error(`Failed to list users from Supabase Auth: ${listError.message}`);
  }

  const existing = usersData.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  let userId;

  if (existing) {
    userId = existing.id;
    console.log(`ℹ️ User already exists in Supabase Auth. Updating password and metadata...`);
    const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
      password,
      email_confirm: true,
      user_metadata: { role, full_name: fullName },
    });
    if (updateError) throw updateError;
  } else {
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role, full_name: fullName },
    });
    if (createError) throw createError;
    userId = newUser.user.id;
    console.log(`✓ Created new user in Supabase Auth.`);
  }

  // Ensure record in public.profiles table
  const { error: profileError } = await supabase.from('profiles').upsert(
    {
      id: userId,
      email: email.toLowerCase(),
      role,
      full_name: fullName,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' }
  );

  if (profileError) {
    throw new Error(`Failed to update profile record for ${email}: ${profileError.message}`);
  }

  console.log(`✓ Profile synced in public.profiles with role '${role}'.`);
  return userId;
}

async function main() {
  console.log('=== C-YATRA Secure Account Provisioning ===\n');

  const ownerEmail = process.env.INITIAL_OWNER_EMAIL;
  const ownerPassword = process.env.INITIAL_OWNER_PASSWORD;
  const adminEmail = process.env.INITIAL_ADMIN_EMAIL;
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD;

  try {
    if (ownerEmail && ownerPassword) {
      await provisionUser(ownerEmail, ownerPassword, 'owner', 'C-Yatra Owner');
    } else {
      console.log('ℹ️ INITIAL_OWNER_EMAIL and INITIAL_OWNER_PASSWORD not set.');
    }

    if (adminEmail && adminPassword) {
      await provisionUser(adminEmail, adminPassword, 'admin', 'System Administrator');
    } else {
      console.log('ℹ️ INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD not set.');
    }

    console.log('\n✅ Account provisioning completed successfully.');
  } catch (err) {
    console.error('\n❌ Provisioning failed:', err.message);
    process.exit(1);
  }
}

main();
