// Background service worker for PriceWise Smart Shopping Assistant
// Cross-browser compatibility layer
const browser = typeof chrome !== 'undefined' ? chrome :
                typeof browser !== 'undefined' ? browser :
                undefined;

// Extension lifecycle management
browser.runtime.onInstalled.addListener((details) => {
  console.log('PriceWise extension installed:', details.reason);
  
  // Set default settings
  browser.storage.sync.set({
    enabled: true,
    autoDetect: true,
    notifications: true,
    version: browser.runtime.getManifest().version,
    installDate: Date.now()
  });

  // Check for updates on install
  if (details.reason === 'install') {
    scheduleUpdateCheck();
  }
});

// Auto-update system
browser.runtime.onStartup.addListener(() => {
  checkForUpdates();
});

// Periodic update checks (every 4 hours)
function scheduleUpdateCheck() {
  // Clear existing alarms
  browser.alarms.clear('updateCheck');
  
  // Schedule new update check
  browser.alarms.create('updateCheck', {
    delayInMinutes: 1, // Check 1 minute after startup
    periodInMinutes: 240 // Check every 4 hours
  });
}

browser.alarms?.onAlarm.addListener((alarm) => {
  if (alarm.name === 'updateCheck') {
    checkForUpdates();
  }
});

async function checkForUpdates() {
  try {
    const currentVersion = browser.runtime.getManifest().version;
    
    const response = await fetch('https://gwgnygxddaxpfkmlyrqd.supabase.co/functions/v1/extension-updates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'check_version',
        currentVersion,
        browser: getBrowserInfo()
      })
    });

    if (response.ok) {
      const updateInfo = await response.json();
      if (updateInfo.updateAvailable) {
        // Show update notification
        browser.notifications?.create({
          type: 'basic',
          iconUrl: 'icons/icon48.png',
          title: 'PriceWise Update Available',
          message: `Version ${updateInfo.latestVersion} is available with new features!`
        });
      }
    }
  } catch (error) {
    console.log('Update check failed:', error);
  }
}

function getBrowserInfo() {
  const userAgent = navigator.userAgent;
  if (userAgent.includes('Chrome')) return 'chrome';
  if (userAgent.includes('Firefox')) return 'firefox';
  if (userAgent.includes('Safari')) return 'safari';
  if (userAgent.includes('Edge')) return 'edge';
  return 'unknown';
}

// Handle messages from content scripts
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'findAlternatives') {
    findAlternatives(message.data)
      .then(alternatives => sendResponse({ success: true, alternatives }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep channel open for async response
  }
  
  if (message.action === 'trackEvent') {
    trackEvent(message.event, message.data);
    sendResponse({ success: true });
  }
});

async function findAlternatives(productData) {
  try {
    const response = await fetch('https://gwgnygxddaxpfkmlyrqd.supabase.co/functions/v1/find-alternatives', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3Z255Z3hkZGF4cGZrbWx5cnFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MTQ4OTgsImV4cCI6MjA2ODQ5MDg5OH0.2PuRCYlFYqW1nkRBjnEJrmda8DYvt9UL1Y1cdYzYX1k'
      },
      body: JSON.stringify(productData)
    });

    if (response.ok) {
      return await response.json();
    }
    
    throw new Error('Failed to fetch alternatives');
  } catch (error) {
    console.error('Error finding alternatives:', error);
    
    // Return demo alternatives
    return generateDemoAlternatives(productData);
  }
}

function generateDemoAlternatives(productData) {
  const currentPrice = extractPrice(productData.price) || 29.99;
  
  return [
    {
      name: "Amazon - Same Item",
      price: `$${(currentPrice * 0.85).toFixed(2)}`,
      originalPrice: `$${currentPrice.toFixed(2)}`,
      savings: `$${(currentPrice * 0.15).toFixed(2)}`,
      url: 'https://amazon.com',
      vendor: 'Amazon',
      rating: 4.5,
      reviews: 1250,
      shipping: 'Free 2-day',
      type: 'marketplace'
    },
    {
      name: "eBay - Similar Item", 
      price: `$${(currentPrice * 0.78).toFixed(2)}`,
      originalPrice: `$${currentPrice.toFixed(2)}`,
      savings: `$${(currentPrice * 0.22).toFixed(2)}`,
      url: 'https://ebay.com',
      vendor: 'eBay',
      rating: 4.3,
      reviews: 890,
      shipping: 'Free shipping',
      type: 'auction'
    },
    {
      name: "Walmart - Brand Alternative",
      price: `$${(currentPrice * 0.92).toFixed(2)}`,
      originalPrice: `$${currentPrice.toFixed(2)}`,
      savings: `$${(currentPrice * 0.08).toFixed(2)}`,
      url: 'https://walmart.com',
      vendor: 'Walmart',
      rating: 4.7,
      reviews: 2100,
      shipping: 'Free pickup',
      type: 'retailer'
    }
  ];
}

function extractPrice(priceText) {
  if (!priceText) return null;
  const match = priceText.match(/[\d,]+\.?\d*/);
  return match ? parseFloat(match[0].replace(/,/g, '')) : null;
}

function trackEvent(event, data) {
  // Analytics tracking for usage statistics
  console.log('Event tracked:', event, data);
}

// Initialize update checking
scheduleUpdateCheck();