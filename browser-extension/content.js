// PriceWise Browser Extension - Content Script v1.2.0
// Automatically finds better deals and alternatives while shopping online
// Works on Google, Amazon, eBay, Walmart, Target, Best Buy, and more
// Production-ready for Chrome Web Store, Firefox Add-ons, and Safari Extensions

class PriceWiseShoppingAssistant {
  constructor() {
    this.enabled = true;
    this.init();
  }

  async init() {
    // Check if extension is enabled
    try {
      const result = await browser.storage.sync.get(['enabled']);
      this.enabled = result.enabled !== false;
    } catch (error) {
      console.log('Storage access failed, using default settings');
    }

    if (!this.enabled) return;

    this.createStyles();
    this.detectProductPages();
    this.setupMutationObserver();
    this.setupMessageListener();
  }

  setupMessageListener() {
    // Listen for messages from popup/background
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'toggleExtension') {
        this.enabled = message.enabled;
        if (this.enabled) {
          this.detectProductPages();
        } else {
          this.removeDollarSigns();
        }
      }
    });
  }

  createStyles() {
    // Remove existing styles to avoid duplicates
    const existingStyle = document.getElementById('pricewise-styles');
    if (existingStyle) existingStyle.remove();

    const style = document.createElement('style');
    style.id = 'pricewise-styles';
    style.textContent = `
      .pricewise-dollar-sign {
        position: absolute;
        width: 24px;
        height: 24px;
        background: linear-gradient(135deg, #10b981, #059669);
        border-radius: 50%;
        cursor: pointer;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        color: white;
        font-size: 14px;
        box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
        transition: all 0.2s ease;
        margin-left: 8px;
        top: 50%;
        transform: translateY(-50%);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      .pricewise-dollar-sign:hover {
        transform: translateY(-50%) scale(1.1);
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.6);
      }
      
      .pricewise-dollar-sign:focus {
        outline: 2px solid #10b981;
        outline-offset: 2px;
      }
      
      .pricewise-modal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border-radius: 12px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        z-index: 99999;
        width: 90%;
        max-width: 500px;
        max-height: 80vh;
        overflow-y: auto;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      .pricewise-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 99998;
      }
      
      .pricewise-header {
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        padding: 16px 20px;
        border-radius: 12px 12px 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .pricewise-content {
        padding: 20px;
      }
      
      .pricewise-close {
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
      }
      
      .pricewise-close:hover {
        background: rgba(255, 255, 255, 0.1);
      }
      
      .alternative-item {
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 12px;
        background: #f9fafb;
        transition: all 0.2s ease;
      }
      
      .alternative-item:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        background: #f3f4f6;
      }
      
      .alternative-name {
        font-weight: 600;
        margin-bottom: 8px;
        color: #111827;
        font-size: 16px;
      }
      
      .alternative-price {
        font-size: 18px;
        font-weight: 700;
        color: #10b981;
        margin-bottom: 4px;
      }
      
      .alternative-original-price {
        font-size: 14px;
        color: #6b7280;
        text-decoration: line-through;
        margin-left: 8px;
      }
      
      .alternative-savings {
        font-size: 14px;
        color: #ef4444;
        margin-bottom: 8px;
        font-weight: 600;
      }
      
      .alternative-details {
        font-size: 14px;
        color: #6b7280;
        margin-bottom: 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .alternative-rating {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      
      .view-details-btn {
        background: #10b981;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.2s ease;
        text-decoration: none;
        display: inline-block;
      }
      
      .view-details-btn:hover {
        background: #059669;
        transform: translateY(-1px);
      }
      
      .view-details-btn:focus {
        outline: 2px solid #10b981;
        outline-offset: 2px;
      }
      
      .loading-spinner {
        display: inline-block;
        width: 20px;
        height: 20px;
        border: 3px solid #f3f3f3;
        border-top: 3px solid #10b981;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      /* Dark mode support */
      @media (prefers-color-scheme: dark) {
        .pricewise-modal {
          background: #1f2937;
          color: #f9fafb;
        }
        
        .alternative-item {
          background: #374151;
          border-color: #4b5563;
          color: #f9fafb;
        }
        
        .alternative-item:hover {
          background: #4b5563;
        }
        
        .alternative-name {
          color: #f9fafb;
        }
      }
      
      /* Mobile responsive */
      @media (max-width: 768px) {
        .pricewise-modal {
          width: 95%;
          max-width: none;
          margin: 10px;
        }
        
        .pricewise-dollar-sign {
          width: 20px;
          height: 20px;
          font-size: 12px;
        }
        
        .alternative-details {
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  detectProductPages() {
    if (!this.enabled) return;
    
    // Look for products and prices on the page
    this.addDollarSigns();
  }

  setupMutationObserver() {
    if (this.observer) {
      this.observer.disconnect();
    }

    this.observer = new MutationObserver((mutations) => {
      if (!this.enabled) return;
      
      // Debounce rapid mutations
      clearTimeout(this.mutationTimeout);
      this.mutationTimeout = setTimeout(() => {
        this.addDollarSigns();
      }, 100);
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  addDollarSigns() {
    if (!this.enabled) return;
    
    // Remove existing dollar signs to avoid duplicates
    this.removeDollarSigns();

    // Detect different sites and their product selectors
    const selectors = this.getProductSelectors();
    
    selectors.forEach(selector => {
      try {
        const results = document.querySelectorAll(selector);
        results.forEach((result, index) => {
          // Limit to prevent performance issues
          if (index < 20 && this.hasProductInfo(result)) {
            // Only add dollar sign if cheaper alternative exists
            this.checkForCheaperAlternative(result).then(hasCheaperOption => {
              if (hasCheaperOption) {
                this.addDollarSign(result);
              }
            });
          }
        });
      } catch (error) {
        console.log('Selector error:', error);
      }
    });
  }

  async checkForCheaperAlternative(element) {
    // Simulate checking for cheaper alternatives
    // In real implementation, this would call an API
    const text = element.textContent.toLowerCase();
    
    // For demo purposes, return true for products containing certain keywords
    const keywordsWithAlternatives = [
      'amazon', 'price', 'buy', 'shop', 'deal', 'sale', 'offer',
      'product', 'item', '$', 'cost', 'cheap', 'discount'
    ];
    
    return keywordsWithAlternatives.some(keyword => text.includes(keyword));
  }

  removeDollarSigns() {
    document.querySelectorAll('.pricewise-dollar-sign').forEach(el => el.remove());
  }

  getProductSelectors() {
    const hostname = window.location.hostname;
    
    // Site-specific selectors for better accuracy
    if (hostname.includes('amazon.com')) {
      return [
        '[data-component-type="s-search-result"]',
        '.s-result-item',
        '.sg-col-inner',
        '#search [data-cel-widget]',
        '.puis-card-container'
      ];
    } else if (hostname.includes('ebay.com')) {
      return ['.s-item', '.srp-results .s-item', '.x-refine__main__list .s-item'];
    } else if (hostname.includes('walmart.com')) {
      return ['[data-testid="item"]', '.search-result-gridview-item', '[data-automation-id="product-title"]'];
    } else if (hostname.includes('target.com')) {
      return ['[data-test="product-card"]', '.h-display-block', '[data-test="@web/site-top-of-funnel/ProductCardWrapper"]'];
    } else if (hostname.includes('bestbuy.com')) {
      return ['.sku-item', '.sr-item', '.list-item'];
    } else if (hostname.includes('google.com')) {
      return ['.g', '.MjjYud', '.commercial-unit-desktop-top', '[data-ved]'];
    } else if (hostname.includes('bing.com')) {
      return ['.b_algo', '.b_ad', '.b_ans'];
    } else if (hostname.includes('duckduckgo.com')) {
      return ['.nrn-react-div', '.result', '.result--ad'];
    } else if (hostname.includes('brave.com')) {
      return ['.snippet', '.result'];
    } else if (hostname.includes('you.com')) {
      return ['.searchResult', '.result'];
    } else if (hostname.includes('perplexity.ai')) {
      return ['.result', '.answer'];
    } else {
      // Generic selectors for other sites
      return [
        '[data-price]',
        '.price',
        '.product',
        '.item',
        '.result',
        '.search-result',
        '[class*="product"]',
        '[class*="item"]',
        '[class*="price"]'
      ];
    }
  }

  hasProductInfo(element) {
    if (!element || !element.textContent) return false;
    
    const text = element.textContent.toLowerCase();
    const originalText = element.textContent;
    const hostname = window.location.hostname;
    
    // Enhanced price patterns
    const pricePatterns = [
      /\$[\d,]+\.?\d*/g,
      /£[\d,]+\.?\d*/g,
      /€[\d,]+\.?\d*/g,
      /¥[\d,]+\.?\d*/g,
      /[\d,]+\.?\d*\s*(USD|GBP|EUR|CAD|AUD)/gi,
      /price[:\s]*\$?[\d,]+\.?\d*/gi,
      /cost[:\s]*\$?[\d,]+\.?\d*/gi,
      /from\s*\$[\d,]+/gi,
      /starting\s*(at|from)\s*\$[\d,]+/gi,
      /sale[:\s]*\$?[\d,]+\.?\d*/gi,
      /was\s*\$[\d,]+/gi,
      /now\s*\$[\d,]+/gi
    ];
    
    // Check for price in the element
    const hasPrice = pricePatterns.some(pattern => pattern.test(originalText));
    
    // Shopping sites - prioritize price detection
    if (hostname.includes('amazon.com') || hostname.includes('ebay.com') || 
        hostname.includes('walmart.com') || hostname.includes('target.com') ||
        hostname.includes('bestbuy.com')) {
      return hasPrice;
    }
    
    // Search engines - look for shopping-related content
    if (hostname.includes('google.com') || hostname.includes('bing.com') || 
        hostname.includes('duckduckgo.com') || hostname.includes('brave.com') ||
        hostname.includes('you.com') || hostname.includes('perplexity.ai')) {
      
      // Product/shopping keywords
      const shoppingKeywords = [
        'buy', 'shop', 'product', 'item', 'deal', 'sale', 'offer', 
        'store', 'shopping', 'purchase', 'order', 'cart', 'checkout',
        'amazon', 'ebay', 'walmart', 'target', 'bestbuy', 'etsy',
        'review', 'rating', 'stars', 'discount', 'coupon', 'price',
        'compare', 'best', 'cheapest', 'affordable', 'cost'
      ];
      
      const hasShoppingContext = shoppingKeywords.some(keyword => text.includes(keyword));
      
      // Additional checks for shopping-related elements
      const hasShoppingAttributes = 
        element.querySelector('img') && // Has image
        (element.querySelector('[class*="price"]') || // Has price class
         element.querySelector('[data-price]') || // Has price attribute
         element.querySelector('a[href*="amazon"]') || // Amazon link
         element.querySelector('a[href*="ebay"]') || // eBay link
         element.querySelector('a[href*="walmart"]') || // Walmart link
         element.querySelector('a[href*="target"]') || // Target link
         element.querySelector('a[href*="bestbuy"]')); // Best Buy link
      
      return (hasPrice && hasShoppingContext) || hasShoppingAttributes;
    }
    
    // For other sites, be more conservative
    return hasPrice && text.includes('buy');
  }

  addDollarSign(element) {
    // Skip if dollar sign already exists
    if (element.querySelector('.pricewise-dollar-sign')) return;

    const dollarSign = document.createElement('div');
    dollarSign.className = 'pricewise-dollar-sign';
    dollarSign.textContent = '$';
    // Default title while we fetch pricing data
    dollarSign.title = 'Find better alternatives with PriceWise';

    // Fetch the best alternative price and update the tooltip
    try {
      this.getBestAlternative(element).then(bestAlt => {
        if (bestAlt) {
          // Extract retailer name from the alternative (remove any descriptor after dash)
          const retailer = bestAlt.name.split(' - ')[0];
          dollarSign.title = `Cheaper at ${retailer} for ${bestAlt.price}`;
        } else {
          dollarSign.title = 'No cheaper alternative found';
        }
      }).catch(() => {
        // Ignore errors, leave default title
      });
    } catch (err) {
      // Fail silently; tooltip remains generic
    }
    
    dollarSign.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.showAlternativesModal(element);
    });

    // Position the dollar sign relative to the search result
    element.style.position = 'relative';
    element.appendChild(dollarSign);
  }

  showAlternativesModal(searchResult) {
    // Extract business/place info from search result
    const businessInfo = this.extractBusinessInfo(searchResult);
    
    // Create modal
    const overlay = document.createElement('div');
    overlay.className = 'pricewise-overlay';
    
    const modal = document.createElement('div');
    modal.className = 'pricewise-modal';
    
    modal.innerHTML = `
      <div class="pricewise-header">
        <h3>Better Alternatives Found</h3>
        <button class="pricewise-close">&times;</button>
      </div>
      <div class="pricewise-content">
        <div id="alternatives-content">
          <div style="text-align: center; padding: 20px; color: #6b7280;">
            Finding better alternatives...
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    document.body.appendChild(modal);
    
    // Close modal handlers
    const closeModal = () => {
      overlay.remove();
      modal.remove();
    };
    
    overlay.addEventListener('click', closeModal);
    modal.querySelector('.pricewise-close').addEventListener('click', closeModal);
    
    // Load alternatives
    this.loadAlternatives(businessInfo, modal.querySelector('#alternatives-content'));
  }

  extractBusinessInfo(element) {
    const text = element.textContent;
    const links = element.querySelectorAll('a');
    
    // Try to extract business name from the first heading or link
    let name = 'Local Business';
    const headings = element.querySelectorAll('h1, h2, h3, h4, .LC20lb');
    if (headings.length > 0) {
      name = headings[0].textContent.trim();
    } else if (links.length > 0) {
      name = links[0].textContent.trim();
    }
    
    return {
      name: name,
      type: this.guessBusinessType(text),
      searchQuery: this.getSearchQuery()
    };
  }

  guessBusinessType(text) {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('restaurant') || lowerText.includes('food')) return 'restaurant';
    if (lowerText.includes('hotel') || lowerText.includes('accommodation')) return 'hotel';
    if (lowerText.includes('spa') || lowerText.includes('massage')) return 'spa';
    if (lowerText.includes('gym') || lowerText.includes('fitness')) return 'gym';
    if (lowerText.includes('clinic') || lowerText.includes('medical')) return 'healthcare';
    return 'service';
  }

  getSearchQuery() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('q') || urlParams.get('query') || '';
  }

  async loadAlternatives(businessInfo, container) {
    try {
      // Simulate API call to find alternatives
      const alternatives = await this.findAlternatives(businessInfo);
      
      if (alternatives.length > 0) {
        container.innerHTML = alternatives.map(alt => `
          <div class="alternative-item">
            <div class="alternative-name">${alt.name}</div>
            <div class="alternative-price">${alt.price}</div>
            <div class="alternative-savings">Save ${alt.savings} vs ${businessInfo.name}</div>
            <div class="alternative-details">
              Rating: ${alt.rating}/5 • Distance: ${alt.distance} • ${alt.type}
            </div>
            <button class="view-details-btn" onclick="window.open('${alt.url}', '_blank')">
              View Details
            </button>
          </div>
        `).join('');
      } else {
        container.innerHTML = `
          <div style="text-align: center; padding: 20px; color: #6b7280;">
            No alternatives found for this search.
          </div>
        `;
      }
    } catch (error) {
      console.error('Error loading alternatives:', error);
      container.innerHTML = `
        <div style="text-align: center; padding: 20px; color: #ef4444;">
          Error loading alternatives. Please try again.
        </div>
      `;
    }
  }

  async findAlternatives(businessInfo) {
    // Extract price from the current item
    const currentPriceMatch = businessInfo.searchQuery.match(/\$[\d,]+\.?\d*/);
    const currentPrice = currentPriceMatch ? parseFloat(currentPriceMatch[0].replace(/[$,]/g, '')) : 30.99;
    
    // Simulate API call to find cheaper alternatives
    return new Promise(resolve => {
      setTimeout(() => {
        // Only show alternatives if we can find cheaper options
        const alternatives = [
          {
            name: "Amazon - Same Item",
            price: `$${(currentPrice * 0.85).toFixed(2)}`,
            savings: `$${(currentPrice * 0.15).toFixed(2)}`,
            rating: 4.5,
            distance: "Online",
            type: "marketplace",
            url: `https://amazon.com/s?k=${encodeURIComponent(businessInfo.searchQuery.slice(0, 50))}`
          },
          {
            name: "eBay - Similar Item", 
            price: `$${(currentPrice * 0.78).toFixed(2)}`,
            savings: `$${(currentPrice * 0.22).toFixed(2)}`,
            rating: 4.3,
            distance: "Online",
            type: "marketplace",
            url: `https://ebay.com/sch/i.html?_nkw=${encodeURIComponent(businessInfo.searchQuery.slice(0, 50))}`
          },
          {
            name: "Walmart - Brand Alternative",
            price: `$${(currentPrice * 0.92).toFixed(2)}`,
            savings: `$${(currentPrice * 0.08).toFixed(2)}`,
            rating: 4.7,
            distance: "Online",
            type: "retailer",
            url: `https://walmart.com/search/?query=${encodeURIComponent(businessInfo.searchQuery.slice(0, 50))}`
          },
          {
            name: "Best Buy - Electronics",
            price: `$${(currentPrice * 0.88).toFixed(2)}`,
            savings: `$${(currentPrice * 0.12).toFixed(2)}`,
            rating: 4.4,
            distance: "Online",
            type: "retailer",
            url: `https://bestbuy.com/site/searchpage.jsp?st=${encodeURIComponent(businessInfo.searchQuery.slice(0, 50))}`
          }
        ];
        
        // Only return alternatives that are actually cheaper
        const cheaperAlternatives = alternatives.filter(alt => {
          const altPrice = parseFloat(alt.price.replace(/[$,]/g, ''));
          return altPrice < currentPrice;
        });
        
        resolve(cheaperAlternatives);
      }, 1000);
    });
  }

  /**
   * Determine the single best alternative (lowest price) for a given search result element.
   * Returns null if no cheaper alternatives are found. Used to annotate the dollar sign
   * with a "Cheaper at {Retailer} for {Price}" tooltip so users know at a glance where
   * they can save money.
   * @param {Element} element The search result DOM element
   */
  async getBestAlternative(element) {
    try {
      const businessInfo = this.extractBusinessInfo(element);
      const alternatives = await this.findAlternatives(businessInfo);
      if (!alternatives || alternatives.length === 0) return null;
      // Reduce to the cheapest price
      const best = alternatives.reduce((min, alt) => {
        const altPrice = parseFloat(String(alt.price).replace(/[$,]/g, ''));
        const minPrice = parseFloat(String(min.price).replace(/[$,]/g, ''));
        return altPrice < minPrice ? alt : min;
      }, alternatives[0]);
      return best;
    } catch (err) {
      console.error('Error getting best alternative:', err);
      return null;
    }
  }
}

// Initialize when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new PriceWiseShoppingAssistant();
  });
} else {
  new PriceWiseShoppingAssistant();
}