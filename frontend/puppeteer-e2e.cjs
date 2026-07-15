const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ userDataDir: './tmp_profile' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  
  const uniqueId = Date.now();
  const email = `test${uniqueId}@example.com`;
  
  await page.goto('http://localhost:3000/register');
  await page.type('input[placeholder="Username"]', `testuser${uniqueId}`);
  await page.type('input[type="email"]', email);
  await page.type('input[type="password"]', 'password');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
    page.click('button[type="submit"]')
  ]);

  await page.type('input[type="email"]', email);
  await page.type('input[type="password"]', 'password');
  
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
    page.click('button[type="submit"]')
  ]);
  
  await new Promise(r => setTimeout(r, 2000));
  await browser.close();
})();
