import assert from 'assert';

const BASE_URL = 'http://localhost:3005';

console.log('🚀 Running Full E2E Integration Test Suite against C-Yatra Server...\n');

let passedTests = 0;
let totalTests = 0;

async function test(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    Error: ${err.message}`);
  }
}

async function run() {
  // Wait for server ready
  let serverReady = false;
  for (let i = 0; i < 15; i++) {
    try {
      const res = await fetch(`${BASE_URL}/login`);
      if (res.status === 200) {
        serverReady = true;
        break;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 1000));
  }
  assert(serverReady, 'Server failed to start on port 3005');

  // Test 1: Public pages available, but private dashboards protected
  await test('Route Guard: /login page loads successfully (200)', async () => {
    const res = await fetch(`${BASE_URL}/login`);
    assert.strictEqual(res.status, 200);
  });

  await test('Route Guard: /admin/login page loads successfully (200)', async () => {
    const res = await fetch(`${BASE_URL}/admin/login`);
    assert.strictEqual(res.status, 200);
  });

  await test('Security: Unauthenticated access to /dashboard is blocked/redirected', async () => {
    const res = await fetch(`${BASE_URL}/dashboard`, { redirect: 'manual' });
    // Middleware returns redirect 307 to /login
    assert([307, 302, 308].includes(res.status), `Expected redirect, got ${res.status}`);
    const location = res.headers.get('location');
    assert(location.includes('/login'), `Expected redirect to /login, got ${location}`);
  });

  await test('Security: Unauthenticated access to /admin/portals is blocked/redirected', async () => {
    const res = await fetch(`${BASE_URL}/admin/portals`, { redirect: 'manual' });
    assert([307, 302, 308].includes(res.status), `Expected redirect, got ${res.status}`);
    const location = res.headers.get('location');
    assert(location.includes('/admin/login'), `Expected redirect to /admin/login, got ${location}`);
  });

  // Test 2: Owner Login
  let ownerCookie = '';
  await test('Auth: Owner login succeeds and returns session cookie', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'owner@cyatra.com',
        password: 'Owner@123',
        portalType: 'owner',
      }),
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.user.role, 'owner');

    const setCookie = res.headers.get('set-cookie');
    assert(setCookie && setCookie.includes('cyatra_session'), 'Expected cyatra_session cookie');
    ownerCookie = setCookie.split(';')[0];
  });

  // Test 3: Owner Role Permissions
  await test('Security: Owner cannot access /admin/portals', async () => {
    const res = await fetch(`${BASE_URL}/admin/portals`, {
      headers: { Cookie: ownerCookie },
      redirect: 'manual',
    });
    // Should be redirected away from admin area
    assert([307, 302, 308].includes(res.status), `Expected redirect for owner on admin portal, got ${res.status}`);
  });

  await test('Security: Owner cannot POST to /api/categories (403 Forbidden)', async () => {
    const res = await fetch(`${BASE_URL}/api/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: ownerCookie,
      },
      body: JSON.stringify({
        name: 'Hacker Category',
        icon: 'Plane',
      }),
    });
    assert.strictEqual(res.status, 403);
  });

  // Test 4: Admin Login
  let adminCookie = '';
  await test('Auth: Admin login succeeds and returns admin session', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@cyatra.com',
        password: 'Admin@123',
        portalType: 'admin',
      }),
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.user.role, 'admin');

    const setCookie = res.headers.get('set-cookie');
    adminCookie = setCookie.split(';')[0];
  });

  // Test 5: Dynamic Categories CRUD by Admin
  let createdCategoryId = '';
  await test('Admin CRUD: Admin can create a new category', async () => {
    const res = await fetch(`${BASE_URL}/api/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: adminCookie,
      },
      body: JSON.stringify({
        name: 'Honeymoon Packages',
        icon: 'Sparkles',
        sort_order: 15,
        is_active: true,
      }),
    });
    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert(data.category.id, 'Created category must have ID');
    createdCategoryId = data.category.id;
    assert.strictEqual(data.category.name, 'Honeymoon Packages');
  });

  await test('Owner View: Newly created category is immediately visible to owner', async () => {
    const res = await fetch(`${BASE_URL}/api/categories`, {
      headers: { Cookie: ownerCookie },
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    const found = data.categories.find((c) => c.id === createdCategoryId);
    assert(found, 'Owner must see newly created category');
    assert.strictEqual(found.name, 'Honeymoon Packages');
  });

  await test('Admin CRUD: Admin can update category', async () => {
    const res = await fetch(`${BASE_URL}/api/categories/${createdCategoryId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Cookie: adminCookie,
      },
      body: JSON.stringify({
        name: 'Romantic Stays & Honeymoon',
        icon: 'Umbrella',
      }),
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.category.name, 'Romantic Stays & Honeymoon');
    assert.strictEqual(data.category.icon, 'Umbrella');
  });

  // Test 6: Dynamic Portals CRUD & Strict URL Validation
  await test('Security: Invalid/dangerous URL is rejected (400 Bad Request)', async () => {
    const res = await fetch(`${BASE_URL}/api/portals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: adminCookie,
      },
      body: JSON.stringify({
        name: 'Exploit Site',
        category_id: createdCategoryId,
        website_url: 'javascript:alert(1)',
        is_active: true,
      }),
    });
    assert.strictEqual(res.status, 400);
  });

  let createdPortalId = '';
  await test('Admin CRUD: Admin can create portal with verified URL and logo', async () => {
    const res = await fetch(`${BASE_URL}/api/portals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: adminCookie,
      },
      body: JSON.stringify({
        name: 'Honeymoon Booking Hub',
        category_id: createdCategoryId,
        website_url: 'https://www.makemytrip.com/holidays-india/honeymoon-packages.html',
        logo_url: '/portals/makemytrip.svg',
        description: 'Special Curated Honeymoon Packages',
        sort_order: 1,
        is_active: true,
      }),
    });
    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert(data.portal.id);
    createdPortalId = data.portal.id;
  });

  await test('Owner View: Newly added portal appears in correct category for owner', async () => {
    const res = await fetch(`${BASE_URL}/api/portals?category_id=${createdCategoryId}`, {
      headers: { Cookie: ownerCookie },
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.portals.length, 1);
    assert.strictEqual(data.portals[0].name, 'Honeymoon Booking Hub');
    assert.strictEqual(data.portals[0].website_url, 'https://www.makemytrip.com/holidays-india/honeymoon-packages.html');
  });

  await test('Portal Search: Search query filters correctly', async () => {
    const res = await fetch(`${BASE_URL}/api/portals?category_id=${createdCategoryId}&search=honeymoon`, {
      headers: { Cookie: ownerCookie },
    });
    const data = await res.json();
    assert.strictEqual(data.portals.length, 1);

    const noRes = await fetch(`${BASE_URL}/api/portals?category_id=${createdCategoryId}&search=nonexistent`, {
      headers: { Cookie: ownerCookie },
    });
    const noData = await noRes.json();
    assert.strictEqual(noData.portals.length, 0);
  });

  await test('Admin CRUD: Admin can deactivate portal, hiding it from owner', async () => {
    const putRes = await fetch(`${BASE_URL}/api/portals/${createdPortalId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Cookie: adminCookie,
      },
      body: JSON.stringify({ is_active: false }),
    });
    assert.strictEqual(putRes.status, 200);

    // Owner checks portal list: should now be empty
    const ownerRes = await fetch(`${BASE_URL}/api/portals?category_id=${createdCategoryId}`, {
      headers: { Cookie: ownerCookie },
    });
    const ownerData = await ownerRes.json();
    assert.strictEqual(ownerData.portals.length, 0, 'Deactivated portal must be hidden from owner');
  });

  await test('Admin CRUD: Admin can delete portal and category', async () => {
    const delPort = await fetch(`${BASE_URL}/api/portals/${createdPortalId}`, {
      method: 'DELETE',
      headers: { Cookie: adminCookie },
    });
    assert.strictEqual(delPort.status, 200);

    const delCat = await fetch(`${BASE_URL}/api/categories/${createdCategoryId}`, {
      method: 'DELETE',
      headers: { Cookie: adminCookie },
    });
    assert.strictEqual(delCat.status, 200);
  });

  console.log(`\n========================================`);
  console.log(`E2E Results: ${passedTests}/${totalTests} Tests Passed!`);
  console.log(`========================================\n`);

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('E2E runner crashed:', err);
  process.exit(1);
});
