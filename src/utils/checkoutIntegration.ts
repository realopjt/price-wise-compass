// Enhanced checkout integration system
import { priceComparisonUtils, Alternative } from '../utils/priceComparison';

// Define ProductData interface for checkout integration
interface ProductData {
  name: string;
  price: number;
  currency: string;
  category?: string;
  sku?: string;
  description?: string;
}

export class CheckoutIntegration {
  private observedSelectors = [
    // Generic cart/checkout selectors
    '[class*="cart"]:not([class*="add-to-cart"])',
    '[class*="checkout"]',
    '[class*="basket"]',
    '[id*="cart"]',
    '[id*="checkout"]',
    '[id*="basket"]',
    
    // E-commerce platform specific
    '.shopify-cart',
    '.woocommerce-cart',
    '.magento-cart',
    '.cart-items',
    '.checkout-summary',
    '.order-summary',
    
    // Popular retailers
    '[data-testid*="cart"]',
    '[data-testid*="checkout"]',
    '.a-offscreen[aria-label*="cart"]', // Amazon
    '[data-automation-id*="cart"]', // Various retailers
  ];

  private checkoutWidgets = new Set<HTMLElement>();

  constructor() {
    this.init();
  }

  private init() {
    // Initial scan
    this.scanForCheckouts();
    
    // Watch for dynamic content
    this.setupMutationObserver();
    
    // URL change detection for SPAs
    this.setupNavigationListener();
    
    // Periodic scan for delayed loading
    setInterval(() => this.scanForCheckouts(), 3000);
  }

  private scanForCheckouts() {
    this.observedSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        if (this.isValidCheckoutElement(el as HTMLElement)) {
          this.injectPriceWiseWidget(el as HTMLElement);
        }
      });
    });
  }

  private isValidCheckoutElement(element: HTMLElement): boolean {
    // Skip if already has widget
    if (element.querySelector('.price-wise-checkout-widget')) {
      return false;
    }

    // Check if element contains product information
    const hasProducts = element.querySelector('[class*="product"], [class*="item"], [class*="line-item"]');
    const hasPrices = element.querySelector('[class*="price"], [class*="total"], [class*="amount"]');
    
    return !!(hasProducts || hasPrices);
  }

  private async injectPriceWiseWidget(checkoutElement: HTMLElement) {
    // Prevent duplicate widgets
    if (this.checkoutWidgets.has(checkoutElement)) return;
    this.checkoutWidgets.add(checkoutElement);

    const products = this.extractProductsFromCheckout(checkoutElement);
    
    if (products.length === 0) return;

    const widget = document.createElement('div');
    widget.className = 'price-wise-checkout-widget';
    widget.innerHTML = `
      <div class="price-wise-banner">
        <div class="banner-content">
          <div class="banner-icon">💰</div>
          <div class="banner-text">
            <strong>PriceWise is checking for better deals...</strong>
            <div class="banner-subtitle">We found alternatives for ${products.length} item${products.length > 1 ? 's' : ''}</div>
          </div>
          <button class="view-alternatives-btn" type="button">
            View Deals
          </button>
        </div>
        <div class="alternatives-panel" style="display: none;">
          <div class="panel-header">
            <h3>Better Deals Found</h3>
            <button class="close-panel">&times;</button>
          </div>
          <div class="alternatives-list">
            <div class="loading-alternatives">Finding better deals...</div>
          </div>
        </div>
      </div>
    `;

    // Insert widget at the top of checkout
    checkoutElement.insertBefore(widget, checkoutElement.firstChild);

    // Setup event listeners
    this.setupWidgetEventListeners(widget, products);

    // Load alternatives
    this.loadAlternatives(widget, products);
  }

  private extractProductsFromCheckout(checkoutElement: HTMLElement): ProductData[] {
    const products: ProductData[] = [];
    
    // Common product selectors within checkout
    const productSelectors = [
      '[class*="product"]',
      '[class*="item"]',
      '[class*="line-item"]',
      '.cart-item',
      '.checkout-item',
      '[data-testid*="item"]'
    ];

    productSelectors.forEach(selector => {
      const productElements = checkoutElement.querySelectorAll(selector);
      
      productElements.forEach(element => {
        const product = this.extractProductData(element as HTMLElement);
        if (product.name && product.price) {
          products.push(product);
        }
      });
    });

    return products;
  }

  private extractProductData(element: HTMLElement): ProductData {
    // Extract product name
    const nameSelectors = [
      'h1', 'h2', 'h3', 'h4',
      '[class*="title"]',
      '[class*="name"]',
      '[class*="product-name"]',
      '.item-name',
      '[data-testid*="name"]'
    ];

    let name = '';
    for (const selector of nameSelectors) {
      const nameEl = element.querySelector(selector);
      if (nameEl?.textContent?.trim()) {
        name = nameEl.textContent.trim();
        break;
      }
    }

    // Extract price
    const priceSelectors = [
      '[class*="price"]',
      '[class*="amount"]',
      '[class*="cost"]',
      '.price',
      '[data-testid*="price"]'
    ];

    let price = '';
    for (const selector of priceSelectors) {
      const priceEl = element.querySelector(selector);
      if (priceEl?.textContent) {
        const priceText = priceEl.textContent.trim();
        const priceMatch = priceText.match(/[\$£€¥]?[\d,]+\.?\d*/);
        if (priceMatch) {
          price = priceMatch[0];
          break;
        }
      }
    }

    // Extract image
    const imgEl = element.querySelector('img');
    const image = imgEl?.src || '';

    return {
      name,
      price: parseFloat(price.replace(/[\$£€¥,]/g, '')) || 0,
      currency: 'USD',
      category: this.detectCategory(name)
    };
  }

  private detectCategory(productName: string): string {
    const categories = {
      'electronics': ['phone', 'laptop', 'computer', 'tablet', 'tv', 'camera'],
      'clothing': ['shirt', 'pants', 'dress', 'shoes', 'jacket', 'jeans'],
      'home': ['furniture', 'decor', 'kitchen', 'bedroom', 'bathroom'],
      'books': ['book', 'novel', 'textbook', 'magazine'],
      'sports': ['fitness', 'exercise', 'sports', 'outdoor']
    };

    const lowercaseName = productName.toLowerCase();
    
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => lowercaseName.includes(keyword))) {
        return category;
      }
    }

    return 'general';
  }

  private setupWidgetEventListeners(widget: HTMLElement, products: ProductData[]) {
    const viewBtn = widget.querySelector('.view-alternatives-btn');
    const panel = widget.querySelector('.alternatives-panel') as HTMLElement;
    const closeBtn = widget.querySelector('.close-panel');

    viewBtn?.addEventListener('click', () => {
      panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    });

    closeBtn?.addEventListener('click', () => {
      panel.style.display = 'none';
    });
  }

  private async loadAlternatives(widget: HTMLElement, products: ProductData[]) {
    const listContainer = widget.querySelector('.alternatives-list');
    if (!listContainer) return;

    try {
      const alternativePromises = products.map(product => 
        priceComparisonUtils.findCheaperAlternatives(product.name, product.price)
      );

      const results = await Promise.all(alternativePromises);
      
      let totalSavings = 0;
      let alternativesHtml = '';

      results.forEach((result, index) => {
        const product = products[index];
        if (result.alternatives.length > 0) {
          const bestAlternative = result.alternatives[0]; // First is the best (sorted by savings)
          const savings = bestAlternative.savings;
          totalSavings += savings;

          alternativesHtml += `
            <div class="alternative-group">
              <div class="original-product">
                <span class="product-name">${product.name}</span>
                <span class="original-price">$${product.price.toFixed(2)}</span>
              </div>
              <div class="best-alternative">
                <div class="alt-info">
                  <div class="alt-name">${bestAlternative.vendor}</div>
                  <div class="alt-price">$${bestAlternative.price.toFixed(2)}</div>
                  <div class="savings-amount">Save $${savings.toFixed(2)}</div>
                </div>
                <button class="buy-alternative" data-url="${bestAlternative.url}">
                  Buy Now
                </button>
              </div>
            </div>
          `;
        }
      });

      if (totalSavings > 0) {
        listContainer.innerHTML = `
          <div class="total-savings">
            <strong>Total Potential Savings: $${totalSavings.toFixed(2)}</strong>
          </div>
          ${alternativesHtml}
        `;

        // Setup buy buttons
        listContainer.querySelectorAll('.buy-alternative').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const url = (e.target as HTMLElement).getAttribute('data-url');
            if (url) window.open(url, '_blank');
          });
        });
      } else {
        listContainer.innerHTML = '<div class="no-alternatives">No better deals found for these items.</div>';
      }

    } catch (error) {
      console.error('Error loading alternatives:', error);
      listContainer.innerHTML = '<div class="error">Error loading alternatives. Please try again.</div>';
    }
  }

  private setupMutationObserver() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as HTMLElement;
              this.observedSelectors.forEach(selector => {
                if (element.matches && element.matches(selector)) {
                  this.injectPriceWiseWidget(element);
                }
                // Also check children
                const children = element.querySelectorAll(selector);
                children.forEach(child => {
                  if (this.isValidCheckoutElement(child as HTMLElement)) {
                    this.injectPriceWiseWidget(child as HTMLElement);
                  }
                });
              });
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  private setupNavigationListener() {
    // Handle SPA navigation
    let currentUrl = window.location.href;
    
    const checkUrlChange = () => {
      if (window.location.href !== currentUrl) {
        currentUrl = window.location.href;
        // Clear existing widgets and rescan
        this.checkoutWidgets.clear();
        setTimeout(() => this.scanForCheckouts(), 1000);
      }
    };

    // Listen for navigation events
    window.addEventListener('popstate', checkUrlChange);
    
    // Override pushState and replaceState
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function(...args) {
      originalPushState.apply(this, args);
      setTimeout(checkUrlChange, 100);
    };
    
    history.replaceState = function(...args) {
      originalReplaceState.apply(this, args);
      setTimeout(checkUrlChange, 100);
    };
  }
}

// Auto-initialize when script loads
new CheckoutIntegration();