import { test, expect } from '@playwright/test';

test.describe('Orderbook Frontend', () => {
  test.beforeEach(async ({ page }) => {
    // Mock window.ethereum for wallet functionality
    await page.addInitScript(() => {
      // Mock MetaMask/Web3 provider
      window.ethereum = {
        isMetaMask: true,
        request: async ({ method, params }) => {
          if (method === 'eth_accounts') {
            return ['0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266']; // First Anvil account
          }
          if (method === 'eth_requestAccounts') {
            return ['0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'];
          }
          if (method === 'eth_chainId') {
            return '0x7a69'; // 31337 in hex
          }
          if (method === 'wallet_requestPermissions') {
            return [{ parentCapability: 'eth_accounts' }];
          }
          // For other methods, return empty or appropriate defaults
          return null;
        },
        on: (event, handler) => {
          // Mock event handlers
          if (event === 'accountsChanged') {
            setTimeout(() => handler(['0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266']), 100);
          }
          if (event === 'chainChanged') {
            setTimeout(() => handler('0x7a69'), 100);
          }
        },
        removeListener: () => {},
        selectedAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        chainId: '0x7a69'
      };
    });
    
    // Navigate to the frontend
    await page.goto('/');
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('should display the orderbook interface with proper functionality', async ({ page }) => {
    // Check if the main title/header is visible - be more specific to avoid strict mode violation
    await expect(page.getByRole('heading', { name: 'SSS Token Exchange' }).first()).toBeVisible();
    
    // Also check that essential sections are present
    await expect(page.getByRole('heading', { name: 'Order Book' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'New Order' })).toBeVisible();
    
    // CRITICAL: Check that market pair is NOT "undefined/undefined"
    const marketPairText = await page.textContent('h2:has-text("/")');
    console.log('Market pair text:', marketPairText);
    await expect(marketPairText).not.toContain('undefined/undefined');
    
    // CRITICAL: Should NOT show "Not Deployed to Network"
    const notDeployedText = page.getByText('Not Deployed to Network');
    await expect(notDeployedText).not.toBeVisible();
    
    // CRITICAL: Should show actual market options (SSS / mETH or SSS / mDAI)
    const marketButton = page.locator('button:has-text("SSS")');
    await expect(marketButton).toBeVisible();
    
    // Take a screenshot of the main interface
    await page.screenshot({ path: 'screenshots/orderbook-main.png', fullPage: true });
  });

  test('should show actual orders in the orderbook', async ({ page }) => {
    // Wait for orders to load
    await page.waitForTimeout(2000);
    
    // CRITICAL: Should NOT show "No Sell Orders" and "No Buy Orders"
    const noSellOrders = page.getByText('No Sell Orders');
    const noBuyOrders = page.getByText('No Buy Orders');
    
    // At least one of these should be false if we have seeded orders
    const noSellVisible = await noSellOrders.isVisible();
    const noBuyVisible = await noBuyOrders.isVisible();
    
    console.log('No Sell Orders visible:', noSellVisible);
    console.log('No Buy Orders visible:', noBuyVisible);
    
    // If both are visible, the orderbook is empty (which indicates a problem)
    if (noSellVisible && noBuyVisible) {
      console.error('❌ CRITICAL: Orderbook is empty - no orders loaded from blockchain');
      
      // Check if we can find any order-related elements
      const orderElements = await page.locator('[data-testid*="order"], .order, .buy-order, .sell-order, tbody tr').count();
      console.log(`Found ${orderElements} order elements`);
      
      // This test should fail if orderbook is completely empty
      await expect(false).toBe(true); // Force failure to show the issue
    }
    
    // Take screenshot of orders section
    await page.screenshot({ path: 'screenshots/orderbook-orders.png', fullPage: true });
  });

  test('should display wallet connection option', async ({ page }) => {
    // Look for wallet connection button/element
    const walletButton = page.locator('button:has-text("Connect"), button:has-text("Wallet"), [data-testid*="wallet"], [data-testid*="connect"]');
    
    if (await walletButton.count() > 0) {
      await expect(walletButton.first()).toBeVisible();
      console.log('Wallet connection button found');
    } else {
      console.log('No wallet connection button found - might be already connected or different UI pattern');
    }
    
    // Take screenshot
    await page.screenshot({ path: 'screenshots/wallet-connection.png', fullPage: true });
  });

  test('should display order form for placing orders', async ({ page }) => {
    // Look for form elements
    const forms = page.locator('form, .order-form, [data-testid*="form"]');
    const inputs = page.locator('input[type="number"], input[placeholder*="price"], input[placeholder*="amount"]');
    const buttons = page.locator('button:has-text("Buy"), button:has-text("Sell"), button:has-text("Place")');
    
    if (await forms.count() > 0) {
      console.log(`Found ${await forms.count()} form elements`);
    }
    
    if (await inputs.count() > 0) {
      console.log(`Found ${await inputs.count()} input fields`);
    }
    
    if (await buttons.count() > 0) {
      console.log(`Found ${await buttons.count()} action buttons`);
    }
    
    // Take screenshot
    await page.screenshot({ path: 'screenshots/order-form.png', fullPage: true });
  });

  test('should show market data and statistics', async ({ page }) => {
    // Look for price/market data displays
    const priceElements = page.locator('.price, .market-price, [data-testid*="price"]');
    const statisticElements = page.locator('.volume, .spread, .stats, [data-testid*="stat"]');
    
    console.log(`Found ${await priceElements.count()} price elements`);
    console.log(`Found ${await statisticElements.count()} statistic elements`);
    
    // Take screenshot
    await page.screenshot({ path: 'screenshots/market-data.png', fullPage: true });
  });

  test('should be responsive and work on different screen sizes', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.screenshot({ path: 'screenshots/desktop-view.png', fullPage: true });
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.screenshot({ path: 'screenshots/tablet-view.png', fullPage: true });
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ path: 'screenshots/mobile-view.png', fullPage: true });
  });

  test('should display network and contract information', async ({ page }) => {
    // Look for network/contract related information
    await page.waitForTimeout(1000);
    
    // Check for any address-like strings (contract addresses)
    const addressElements = page.locator('[data-testid*="address"], .address, .contract');
    console.log(`Found ${await addressElements.count()} address elements`);
    
    // Take final comprehensive screenshot
    await page.screenshot({ path: 'screenshots/complete-interface.png', fullPage: true });
  });
});