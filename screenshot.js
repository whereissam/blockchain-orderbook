import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Set viewport size
  await page.setViewportSize({ width: 1200, height: 800 });
  
  try {
    // Navigate to your app
    await page.goto('http://localhost:3503', { waitUntil: 'networkidle' });
    
    // Wait a bit for any dynamic content to load
    await page.waitForTimeout(2000);
    
    // Take screenshot
    await page.screenshot({ path: 'layout-screenshot.png', fullPage: true });
    
    console.log('Screenshot saved as layout-screenshot.png');
  } catch (error) {
    console.error('Error taking screenshot:', error);
  }
  
  await browser.close();
})();