async function testAssets() {
  const res = await fetch('http://127.0.0.1:3000/login');
  const html = await res.text();
  console.log('Login HTML fetched, length:', html.length);

  const links = [...html.matchAll(/(href|src)="(\/_next\/[^"]+)"/g)].map(m => m[2]);
  console.log('Found', links.length, 'Next.js asset links');

  for (const link of links.slice(0, 5)) {
    const aRes = await fetch('http://127.0.0.1:3000' + link);
    console.log(link.substring(0, 50), '... -> Status:', aRes.status);
  }

  // Check logo
  const logoRes = await fetch('http://127.0.0.1:3000/images/logo.png');
  console.log('/images/logo.png -> Status:', logoRes.status, 'Content-Type:', logoRes.headers.get('content-type'));

  // Check hero image
  const heroRes = await fetch('http://127.0.0.1:3000/images/udaipur-hero.jpg');
  console.log('/images/udaipur-hero.jpg -> Status:', heroRes.status);
}
testAssets().catch(console.error);
