import assert from 'assert';
import fs from 'fs';
import path from 'path';

// Load local database service directly for headless API & DAL tests
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getPortals,
  getPortalById,
  createPortal,
  updatePortal,
  deletePortal,
} from '../lib/supabase/service.js';
import { portalSchema } from '../lib/validations/portal.js';
import { categorySchema } from '../lib/validations/category.js';
import { authenticate } from '../lib/auth.js';

console.log('🧪 Running C-Yatra Complete Verification Suite...\n');

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

async function runTests() {
  // 1. Asset verification
  await test('Brand Assets: Original Logo and Udaipur Scenic Images exist', () => {
    assert(fs.existsSync('public/images/logo.png'), 'logo.png must exist');
    assert(fs.existsSync('public/images/udaipur-hero.jpg'), 'udaipur-hero.jpg must exist');
    assert(fs.existsSync('public/images/udaipur-login.jpg'), 'udaipur-login.jpg must exist');
    assert(fs.existsSync('public/portals/makemytrip.svg'), 'makemytrip.svg must exist');
  });

  // 2. Authentication: Owner Login
  await test('Auth: Owner login succeeds with valid owner credentials', async () => {
    const res = await authenticate('owner@cyatra.com', 'Owner@123', 'owner');
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.user?.role, 'owner');
  });

  // 3. Authentication: Admin Login
  await test('Auth: Admin login succeeds with valid admin credentials', async () => {
    const res = await authenticate('admin@cyatra.com', 'Admin@123', 'admin');
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.user?.role, 'admin');
  });

  // 4. Role Separation: Owner cannot log into Admin portal
  await test('Auth Security: Owner account rejected from Admin portal', async () => {
    const res = await authenticate('owner@cyatra.com', 'Owner@123', 'admin');
    assert.strictEqual(res.success, false);
    assert.match(res.error, /administrator/i);
  });

  // 5. Authentication: Bad password rejected
  await test('Auth Security: Invalid password rejected', async () => {
    const res = await authenticate('owner@cyatra.com', 'WrongPassword', 'owner');
    assert.strictEqual(res.success, false);
  });

  // 6. Database: Default 10 Categories exist
  let initialCats;
  await test('Database: Default 10 travel categories initialized', async () => {
    initialCats = await getCategories(true);
    assert(initialCats.length >= 10, `Expected at least 10 categories, found ${initialCats.length}`);
    const flight = initialCats.find(c => c.slug === 'flight');
    assert(flight, 'Flight category must exist');
    assert.strictEqual(flight.icon, 'Plane');
  });

  // 7. Dynamic Category Management: Create Category
  let testCatId;
  await test('Category CRUD: Administrator can add a new category', async () => {
    const newCat = await createCategory({
      name: 'Luxury Cruise',
      slug: 'luxury-cruise',
      icon: 'Ship',
      sort_order: 11,
      is_active: true,
    });
    assert(newCat.id, 'New category must have an ID');
    testCatId = newCat.id;
    assert.strictEqual(newCat.name, 'Luxury Cruise');
    assert.strictEqual(newCat.icon, 'Ship');
  });

  // 8. Dynamic Category Management: Edit Category
  await test('Category CRUD: Administrator can edit category name and icon', async () => {
    const updated = await updateCategory(testCatId, {
      name: 'Ocean Cruises',
      icon: 'Anchor',
    });
    assert.strictEqual(updated.name, 'Ocean Cruises');
    assert.strictEqual(updated.icon, 'Anchor');
  });

  // 9. Dynamic Category Management: Deactivate Category
  await test('Category CRUD: Administrator can deactivate category', async () => {
    await updateCategory(testCatId, { is_active: false });
    const ownerCats = await getCategories(false); // owner sees only active
    const found = ownerCats.find(c => c.id === testCatId);
    assert.strictEqual(found, undefined, 'Deactivated category must be hidden from owner dashboard');
  });

  // 10. URL Validation: Safe HTTP/HTTPS enforced, dangerous schemes rejected
  await test('URL Validation: Zod enforces valid HTTP/HTTPS URLs and rejects unsafe schemes', () => {
    // Valid URLs
    assert.doesNotThrow(() => portalSchema.parse({
      name: 'Test Portal',
      category_id: 'c1000000-0000-0000-0000-000000000001',
      website_url: 'https://www.makemytrip.com/flights/',
      is_active: true,
    }));

    // Injected javascript: URL
    assert.throws(() => portalSchema.parse({
      name: 'Malicious Portal',
      category_id: 'c1000000-0000-0000-0000-000000000001',
      website_url: 'javascript:alert(1)',
      is_active: true,
    }), /Must be a valid HTTP or HTTPS website URL/);

    // Missing protocol
    assert.throws(() => portalSchema.parse({
      name: 'Invalid Portal',
      category_id: 'c1000000-0000-0000-0000-000000000001',
      website_url: 'not-a-url',
      is_active: true,
    }));
  });

  // 11. Dynamic Portal Management: Create Portal
  let testPortalId;
  await test('Portal CRUD: Administrator can add a new booking portal with URL and logo', async () => {
    const portal = await createPortal({
      category_id: 'c1000000-0000-0000-0000-000000000001',
      name: 'Kayak Flights',
      website_url: 'https://www.kayak.co.in/flights',
      logo_url: '/portals/skyscanner.svg',
      description: 'Search Hundreds of Flight Sites',
      internal_notes: 'Affiliate tracking verified',
      sort_order: 11,
      is_active: true,
    });
    assert(portal.id, 'Portal must have an ID');
    testPortalId = portal.id;
    assert.strictEqual(portal.name, 'Kayak Flights');
  });

  // 12. Dynamic Portal Management: Portal appears in correct category
  await test('Portal Filtering: New portal appears in selected category', async () => {
    const flightPortals = await getPortals({
      categoryId: 'c1000000-0000-0000-0000-000000000001',
      includeInactive: true,
    });
    const found = flightPortals.find(p => p.id === testPortalId);
    assert(found, 'Portal must appear in flight category');
    assert.strictEqual(found.name, 'Kayak Flights');
  });

  // 13. Dynamic Portal Management: Search filtering
  await test('Portal Search: Search matches name and description correctly', async () => {
    const searchResults = await getPortals({
      categoryId: 'c1000000-0000-0000-0000-000000000001',
      search: 'kayak',
      includeInactive: true,
    });
    assert.strictEqual(searchResults.length, 1);
    assert.strictEqual(searchResults[0].name, 'Kayak Flights');
  });

  // 14. Dynamic Portal Management: Deactivate portal
  await test('Portal Visibility: Deactivated portal hidden from owner view', async () => {
    await updatePortal(testPortalId, { is_active: false });
    const ownerActivePortals = await getPortals({
      categoryId: 'c1000000-0000-0000-0000-000000000001',
      includeInactive: false, // Owner view
    });
    const found = ownerActivePortals.find(p => p.id === testPortalId);
    assert.strictEqual(found, undefined, 'Deactivated portal must not be returned in owner query');
  });

  // 15. Dynamic Portal Management: Delete portal
  await test('Portal CRUD: Administrator can delete a portal', async () => {
    const res = await deletePortal(testPortalId);
    assert.strictEqual(res.success, true);
    const check = await getPortalById(testPortalId);
    assert.strictEqual(check, null);
  });

  // 16. Dynamic Category Management: Safe deletion of category
  await test('Category Safety: Safe category deletion removes category record', async () => {
    const res = await deleteCategory(testCatId);
    assert.strictEqual(res.success, true);
    const check = await getCategoryById(testCatId);
    assert.strictEqual(check, null);
  });

  console.log(`\n========================================`);
  console.log(`Results: ${passedTests}/${totalTests} Tests Passed!`);
  console.log(`========================================\n`);

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runTests().catch(e => {
  console.error('Test suite failed:', e);
  process.exit(1);
});
