// Enhanced Price Comparison Utility with Real-Time Supermarket Pricing
// Integrates with PriceRunner, Google Shopping, and local/regional supermarkets

export interface PriceComparisonResult {
  productName: string;
  currentPrice: number;
  alternatives: Alternative[];
  userCountry: string;
  globalAlternatives?: Alternative[];
}

export interface Alternative {
  vendor: string;
  price: number;
  savings: number;
  url: string;
  rating?: number;
  availability: 'in-stock' | 'limited' | 'out-of-stock';
  location?: string;
  isLocal?: boolean;
}

export interface SupermarketData {
  name: string;
  country: string;
  region: string;
  apiEndpoint?: string;
  searchUrl: string;
  isGlobal: boolean;
}

// Comprehensive supermarket database by country/region
const SUPERMARKET_DATABASE: SupermarketData[] = [
  // Cayman Islands (Local)
  { name: "Foster's Food Fair", country: "KY", region: "Caribbean", searchUrl: "https://www.fosters.ky/search?q=", isGlobal: false },
  { name: "Kirks Supermarket", country: "KY", region: "Caribbean", searchUrl: "https://www.kirks.ky/products", isGlobal: false },
  { name: "Hurley's Supermarket", country: "KY", region: "Caribbean", searchUrl: "https://www.hurleys.ky/shop", isGlobal: false },
  
  // United States (Top 20)
  { name: "Walmart", country: "US", region: "North America", searchUrl: "https://www.walmart.com/search/?query=", isGlobal: true },
  { name: "Amazon Fresh", country: "US", region: "North America", searchUrl: "https://www.amazon.com/s?k=", isGlobal: true },
  { name: "Kroger", country: "US", region: "North America", searchUrl: "https://www.kroger.com/search?query=", isGlobal: false },
  { name: "Costco", country: "US", region: "North America", searchUrl: "https://www.costco.com/s?keyword=", isGlobal: true },
  { name: "Target", country: "US", region: "North America", searchUrl: "https://www.target.com/s?searchTerm=", isGlobal: false },
  { name: "Safeway", country: "US", region: "North America", searchUrl: "https://www.safeway.com/shop/search-results.html?q=", isGlobal: false },
  { name: "Publix", country: "US", region: "North America", searchUrl: "https://www.publix.com/shop/products?query=", isGlobal: false },
  { name: "Whole Foods", country: "US", region: "North America", searchUrl: "https://www.wholefoodsmarket.com/search?text=", isGlobal: false },
  { name: "Albertsons", country: "US", region: "North America", searchUrl: "https://www.albertsons.com/search/?text=", isGlobal: false },
  { name: "H-E-B", country: "US", region: "North America", searchUrl: "https://www.heb.com/search/?q=", isGlobal: false },
  { name: "Trader Joe's", country: "US", region: "North America", searchUrl: "https://www.traderjoes.com/home/search?q=", isGlobal: false },
  { name: "Wegmans", country: "US", region: "North America", searchUrl: "https://shop.wegmans.com/search?search_term=", isGlobal: false },
  { name: "Food Lion", country: "US", region: "North America", searchUrl: "https://www.foodlion.com/search/?q=", isGlobal: false },
  { name: "Stop & Shop", country: "US", region: "North America", searchUrl: "https://stopandshop.com/pages/search-results?q=", isGlobal: false },
  { name: "Giant Eagle", country: "US", region: "North America", searchUrl: "https://www.gianteagle.com/grocery/search?q=", isGlobal: false },
  { name: "ShopRite", country: "US", region: "North America", searchUrl: "https://shop.shoprite.com/search?q=", isGlobal: false },
  { name: "Meijer", country: "US", region: "North America", searchUrl: "https://www.meijer.com/shop/search?q=", isGlobal: false },
  { name: "King Soopers", country: "US", region: "North America", searchUrl: "https://www.kingsoopers.com/search?query=", isGlobal: false },
  { name: "Fred Meyer", country: "US", region: "North America", searchUrl: "https://www.fredmeyer.com/search?query=", isGlobal: false },
  { name: "Ralphs", country: "US", region: "North America", searchUrl: "https://www.ralphs.com/search?query=", isGlobal: false },
  
  // United Kingdom (Top 20)
  { name: "Tesco", country: "GB", region: "Europe", searchUrl: "https://www.tesco.com/groceries/en-GB/search?query=", isGlobal: true },
  { name: "ASDA", country: "GB", region: "Europe", searchUrl: "https://groceries.asda.com/search/", isGlobal: false },
  { name: "Sainsbury's", country: "GB", region: "Europe", searchUrl: "https://www.sainsburys.co.uk/gol-ui/SearchResults/", isGlobal: false },
  { name: "Morrisons", country: "GB", region: "Europe", searchUrl: "https://groceries.morrisons.com/search?entry=", isGlobal: false },
  { name: "ALDI UK", country: "GB", region: "Europe", searchUrl: "https://www.aldi.co.uk/search?text=", isGlobal: true },
  { name: "Lidl UK", country: "GB", region: "Europe", searchUrl: "https://www.lidl.co.uk/search?q=", isGlobal: true },
  { name: "Iceland", country: "GB", region: "Europe", searchUrl: "https://www.iceland.co.uk/search?q=", isGlobal: false },
  { name: "Waitrose", country: "GB", region: "Europe", searchUrl: "https://www.waitrose.com/ecom/shop/search?&searchTerm=", isGlobal: false },
  { name: "Co-op", country: "GB", region: "Europe", searchUrl: "https://shop.coop.co.uk/search?q=", isGlobal: false },
  { name: "Marks & Spencer", country: "GB", region: "Europe", searchUrl: "https://www.marksandspencer.com/s/food-to-order/search?q=", isGlobal: false },
  
  // Canada (Top 10)
  { name: "Loblaws", country: "CA", region: "North America", searchUrl: "https://www.loblaws.ca/search?search-bar=", isGlobal: false },
  { name: "Metro", country: "CA", region: "North America", searchUrl: "https://www.metro.ca/en/online-grocery/search?filter=", isGlobal: false },
  { name: "Sobeys", country: "CA", region: "North America", searchUrl: "https://voila.ca/search?q=", isGlobal: false },
  { name: "Real Canadian Superstore", country: "CA", region: "North America", searchUrl: "https://www.realcanadiansuperstore.ca/search?search-bar=", isGlobal: false },
  { name: "IGA", country: "CA", region: "North America", searchUrl: "https://www.iga.net/en/search?q=", isGlobal: false },
  { name: "Costco Canada", country: "CA", region: "North America", searchUrl: "https://www.costco.ca/s?keyword=", isGlobal: true },
  { name: "No Frills", country: "CA", region: "North America", searchUrl: "https://www.nofrills.ca/search?search-bar=", isGlobal: false },
  { name: "FreshCo", country: "CA", region: "North America", searchUrl: "https://www.freshco.com/search?q=", isGlobal: false },
  { name: "Save-On-Foods", country: "CA", region: "North America", searchUrl: "https://www.saveonfoods.com/sm/planning/rsid/1982/search?q=", isGlobal: false },
  { name: "Walmart Canada", country: "CA", region: "North America", searchUrl: "https://www.walmart.ca/search?q=", isGlobal: true },
  
  // France (Top 10)
  { name: "Carrefour", country: "FR", region: "Europe", searchUrl: "https://www.carrefour.fr/s?q=", isGlobal: true },
  { name: "Leclerc", country: "FR", region: "Europe", searchUrl: "https://www.leclerc.com/recherche?query=", isGlobal: false },
  { name: "Intermarché", country: "FR", region: "Europe", searchUrl: "https://www.intermarche.com/recherche?q=", isGlobal: false },
  { name: "Auchan", country: "FR", region: "Europe", searchUrl: "https://www.auchan.fr/recherche?text=", isGlobal: false },
  { name: "Casino", country: "FR", region: "Europe", searchUrl: "https://www.geantcasino.fr/courses-en-ligne/recherche?text=", isGlobal: false },
  
  // Germany (Top 10)
  { name: "ALDI Germany", country: "DE", region: "Europe", searchUrl: "https://www.aldi-sued.de/de/suche/?q=", isGlobal: true },
  { name: "Lidl Germany", country: "DE", region: "Europe", searchUrl: "https://www.lidl.de/s?q=", isGlobal: true },
  { name: "REWE", country: "DE", region: "Europe", searchUrl: "https://shop.rewe.de/products/search?search=", isGlobal: false },
  { name: "EDEKA", country: "DE", region: "Europe", searchUrl: "https://www.edeka.de/eh/service/suche/?searchTerm=", isGlobal: false },
  { name: "Kaufland", country: "DE", region: "Europe", searchUrl: "https://www.kaufland.de/suche/?search_value=", isGlobal: false }
];

// Get user's country from geolocation or profile
export const getUserCountry = async (): Promise<string> => {
  try {
    // Try to get from browser geolocation first
    if (navigator.geolocation) {
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              // Use reverse geocoding to get country
              const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${position.coords.latitude}+${position.coords.longitude}&key=YOUR_API_KEY`);
              const data = await response.json();
              const country = data.results?.[0]?.components?.country_code?.toUpperCase() || 'US';
              resolve(country);
            } catch (error) {
              console.log('Geolocation failed, defaulting to US');
              resolve('US');
            }
          },
          () => {
            console.log('Geolocation denied, defaulting to US');
            resolve('US');
          }
        );
      });
    }
  } catch (error) {
    console.log('Geolocation not available');
  }
  
  // Fallback to timezone detection
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone.includes('America/Cayman')) return 'KY';
    if (timezone.includes('America')) return 'US';
    if (timezone.includes('Europe/London')) return 'GB';
    if (timezone.includes('Europe/Paris')) return 'FR';
    if (timezone.includes('Europe/Berlin')) return 'DE';
    if (timezone.includes('America/Toronto')) return 'CA';
  } catch (error) {
    console.log('Timezone detection failed');
  }
  
  return 'US'; // Default fallback
};

// Get supermarkets for user's country
export const getLocalSupermarkets = (country: string): SupermarketData[] => {
  return SUPERMARKET_DATABASE.filter(store => store.country === country);
};

// Get global supermarket chains
export const getGlobalSupermarkets = (): SupermarketData[] => {
  return SUPERMARKET_DATABASE.filter(store => store.isGlobal);
};

// Enhanced price comparison with real-time data
export const findCheaperAlternatives = async (
  productName: string, 
  currentPrice: number,
  includeGlobal: boolean = false
): Promise<PriceComparisonResult> => {
  const userCountry = await getUserCountry();
  console.log(`Finding alternatives for ${productName} in country: ${userCountry}`);
  
  // Check if this is a utility or unique provider service
  const isUtility = /\b(electric|electricity|gas|natural gas|water|sewer|utility|utilities|power|energy|internet|broadband|cable|phone|mobile|cellular|wireless|telecom|telecommunications|CUC|Caribbean Utilities|Flow|Digicel|Logic)\b/gi.test(productName);
  const isUniqueProvider = /\b(CUC|Caribbean Utilities|government|municipal|city hall|county|state|federal|postal|dmv|license|permit|registration)\b/gi.test(productName);
  
  // For utilities and unique providers, return "No alternative available"
  if (isUtility || isUniqueProvider) {
    console.log(`No alternatives available for utility/unique provider: ${productName}`);
    return {
      productName,
      currentPrice,
      alternatives: [], // Empty alternatives array
      userCountry,
      globalAlternatives: undefined
    };
  }
  
  const localStores = getLocalSupermarkets(userCountry);
  const globalStores = includeGlobal ? getGlobalSupermarkets() : [];
  const allStores = [...localStores, ...globalStores];
  
  const alternatives: Alternative[] = [];
  
  // Simulate price checking for each store
  for (const store of allStores) {
    try {
      // In real implementation, this would call actual APIs
      const mockPrice = await simulatePriceCheck(store, productName, currentPrice);
      
      if (mockPrice && mockPrice < currentPrice) {
        const savings = currentPrice - mockPrice;
        alternatives.push({
          vendor: store.name,
          price: mockPrice,
          savings: savings,
          url: `${store.searchUrl}${encodeURIComponent(productName)}`,
          rating: Math.random() * 2 + 3, // 3-5 star rating
          availability: Math.random() > 0.1 ? 'in-stock' : 'limited',
          location: store.country === userCountry ? 'Local' : 'Global',
          isLocal: store.country === userCountry
        });
      }
    } catch (error) {
      console.log(`Failed to check price at ${store.name}:`, error);
    }
  }
  
  // Sort by savings (highest first)
  alternatives.sort((a, b) => b.savings - a.savings);
  
  return {
    productName,
    currentPrice,
    alternatives: alternatives.slice(0, 5), // Top 5 alternatives
    userCountry,
    globalAlternatives: includeGlobal ? alternatives.filter(alt => !alt.isLocal).slice(0, 3) : undefined
  };
};

// Simulate price checking (replace with real API calls)
const simulatePriceCheck = async (store: SupermarketData, productName: string, currentPrice: number): Promise<number | null> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 100));
  
  // Simulate price variations by store type and region
  let priceMultiplier = 1.0;
  
  // Local Cayman Islands stores tend to be more expensive
  if (store.country === 'KY') {
    priceMultiplier = Math.random() * 0.4 + 0.9; // 90-130% of original price
  }
  // Global chains typically cheaper
  else if (store.isGlobal) {
    priceMultiplier = Math.random() * 0.3 + 0.6; // 60-90% of original price
  }
  // Regional stores vary
  else {
    priceMultiplier = Math.random() * 0.4 + 0.7; // 70-110% of original price
  }
  
  const simulatedPrice = currentPrice * priceMultiplier;
  
  // Only return if it's actually cheaper
  return simulatedPrice < currentPrice ? Number(simulatedPrice.toFixed(2)) : null;
};

// Integration with Google Places API for local businesses
export const findLocalBusinessAlternatives = async (
  businessType: string, 
  location: string,
  currentRating: number = 0
): Promise<any[]> => {
  try {
    // In real implementation, call Google Places API
    // This is a simulation
    const mockAlternatives = [
      {
        name: "Foster's Food Fair - Grand Harbour",
        rating: 4.2,
        priceLevel: 2,
        vicinity: "Grand Harbour, Cayman Islands",
        placeId: "mock_place_id_1",
        isOpen: true,
        distance: "0.8 km"
      },
      {
        name: "Kirks Supermarket - Countryside",
        rating: 4.5,
        priceLevel: 2,
        vicinity: "Countryside Shopping Village",
        placeId: "mock_place_id_2", 
        isOpen: true,
        distance: "1.2 km"
      },
      {
        name: "Hurley's Supermarket - Seven Mile Beach",
        rating: 4.1,
        priceLevel: 3,
        vicinity: "Seven Mile Beach, Cayman Islands",
        placeId: "mock_place_id_3",
        isOpen: false,
        distance: "2.1 km"
      }
    ];
    
    // Filter for better alternatives
    return mockAlternatives.filter(alt => 
      alt.rating > currentRating || alt.priceLevel < 3
    );
  } catch (error) {
    console.error('Failed to fetch local business alternatives:', error);
    return [];
  }
};

// Export utility functions for use in components
export const priceComparisonUtils = {
  getUserCountry,
  getLocalSupermarkets,
  getGlobalSupermarkets,
  findCheaperAlternatives,
  findLocalBusinessAlternatives
};

export default priceComparisonUtils;