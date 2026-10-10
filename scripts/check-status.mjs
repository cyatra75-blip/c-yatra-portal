async function check() {
  const routes = ['/', '/login', '/admin/login', '/dashboard', '/admin/portals'];
  for (const r of routes) {
    const res = await fetch(`http://localhost:3000${r}`, { redirect: 'manual' });
    const loc = res.headers.get('location') || '';
    console.log(`${r.padEnd(16)} -> Status: ${res.status} ${loc ? `(Redirect to ${loc})` : ''}`);
  }
}
check().catch(console.error);
