// Re-export from billOCR for receipt scanning functionality
export { extractTextFromImage } from './billOCR'

interface ReceiptItem {
  name: string
  quantity: number
  price: number
  category: string
}

interface ReceiptData {
  storeName: string
  date: string
  total: number
  items: ReceiptItem[]
  confidence: number
}

export function parseReceiptData(text: string): ReceiptData {
  console.log('Parsing receipt text with enhanced accuracy:', text.substring(0, 200) + '...')
  
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  const lowerText = text.toLowerCase()
  
  let storeName = 'Unknown Store'
  let date = ''
  let total = 0
  let items: ReceiptItem[] = []
  let confidence = 0.5
  
  // Enhanced store patterns with major retailers
  const storePatterns = [
    // Major grocery chains
    { pattern: /walmart/i, name: 'Walmart' },
    { pattern: /target/i, name: 'Target' },
    { pattern: /kroger/i, name: 'Kroger' },
    { pattern: /safeway/i, name: 'Safeway' },
    { pattern: /whole foods/i, name: 'Whole Foods Market' },
    { pattern: /costco/i, name: 'Costco Wholesale' },
    { pattern: /sam's club/i, name: "Sam's Club" },
    { pattern: /trader joe/i, name: "Trader Joe's" },
    { pattern: /publix/i, name: 'Publix' },
    { pattern: /harris teeter/i, name: 'Harris Teeter' },
    { pattern: /food lion/i, name: 'Food Lion' },
    { pattern: /giant/i, name: 'Giant' },
    { pattern: /stop & shop/i, name: 'Stop & Shop' },
    { pattern: /meijer/i, name: 'Meijer' },
    { pattern: /wegmans/i, name: 'Wegmans' },
    { pattern: /aldi/i, name: 'ALDI' },
    { pattern: /lidl/i, name: 'Lidl' },
    
    // Home improvement
    { pattern: /home depot/i, name: 'The Home Depot' },
    { pattern: /lowes/i, name: "Lowe's" },
    { pattern: /menards/i, name: 'Menards' },
    
    // Electronics & office
    { pattern: /best buy/i, name: 'Best Buy' },
    { pattern: /office depot/i, name: 'Office Depot' },
    { pattern: /staples/i, name: 'Staples' },
    
    // Pharmacy
    { pattern: /cvs/i, name: 'CVS Pharmacy' },
    { pattern: /walgreens/i, name: 'Walgreens' },
    { pattern: /rite aid/i, name: 'Rite Aid' },
    
    // General retail
    { pattern: /amazon/i, name: 'Amazon' },
    { pattern: /dollar tree/i, name: 'Dollar Tree' },
    { pattern: /dollar general/i, name: 'Dollar General' },
    { pattern: /family dollar/i, name: 'Family Dollar' }
  ]
  
  // Enhanced store name detection with context
  let bestStoreMatch = { name: '', confidence: 0 }
  
  for (let i = 0; i < Math.min(8, lines.length); i++) {
    const line = lines[i]
    for (const store of storePatterns) {
      if (store.pattern.test(line)) {
        const lineConfidence = calculateStoreConfidence(line, store.name)
        if (lineConfidence > bestStoreMatch.confidence) {
          bestStoreMatch = { name: store.name, confidence: lineConfidence }
        }
      }
    }
  }
  
  if (bestStoreMatch.name) {
    storeName = bestStoreMatch.name
    confidence += bestStoreMatch.confidence * 0.2
  }
  
  // Enhanced date extraction with multiple formats
  const datePatterns = [
    // MM/DD/YYYY and variations
    /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/g,
    /(\d{2,4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})/g,
    
    // Natural language dates
    /(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4}/gi,
    /\d{1,2}\s+(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}/gi,
    
    // Receipt-specific date patterns
    /(?:date|time|purchased|transaction)[\s:]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/gi,
    
    // ISO format
    /(\d{4}-\d{2}-\d{2})/g
  ]
  
  let bestDate = { date: '', confidence: 0 }
  
  for (const line of lines) {
    for (const pattern of datePatterns) {
      const matches = [...line.matchAll(pattern)]
      for (const match of matches) {
        const dateStr = match[1] || match[0]
        try {
          const parsedDate = new Date(dateStr.replace(/[-\.]/g, '/'))
          const currentDate = new Date()
          const daysDiff = Math.abs((currentDate.getTime() - parsedDate.getTime()) / (1000 * 60 * 60 * 24))
          
          if (!isNaN(parsedDate.getTime()) && daysDiff < 365) { // Within last year
            const dateConfidence = Math.max(0.1, 1 - (daysDiff / 365))
            if (dateConfidence > bestDate.confidence) {
              bestDate = {
                date: parsedDate.toISOString().split('T')[0],
                confidence: dateConfidence
              }
            }
          }
        } catch (e) {
          console.log('Failed to parse date:', dateStr)
        }
      }
    }
  }
  
  if (bestDate.date) {
    date = bestDate.date
    confidence += bestDate.confidence * 0.15
  }
  
  // Enhanced total amount extraction
  const totalPatterns = [
    // Primary total indicators
    /(?:total|grand\s*total|final\s*total|amount\s*due|subtotal)\s*:?\s*\$?(\d+\.?\d*)/gi,
    /(?:balance|due|pay|owed)\s*:?\s*\$?(\d+\.?\d*)/gi,
    
    // Receipt-specific patterns
    /(?:receipt\s*total|order\s*total|purchase\s*total)\s*:?\s*\$?(\d+\.?\d*)/gi,
    
    // Currency prefixed
    /\$(\d+\.?\d*)\s*(?:total|due|owed|balance)?/gi,
    
    // End of receipt patterns
    /^.*\$?(\d+\.?\d*).*(?:total|final|due).*$/gmi
  ]
  
  let bestTotal = { amount: 0, confidence: 0 }
  
  for (const line of lines) {
    for (const pattern of totalPatterns) {
      const matches = [...line.matchAll(pattern)]
      for (const match of matches) {
        const amountStr = match[1].replace(/,/g, '')
        const amount = parseFloat(amountStr)
        
        if (!isNaN(amount) && amount > 0 && amount < 10000) {
          let totalConfidence = 0.3
          const context = match[0].toLowerCase()
          
          // Boost confidence for key indicators
          if (context.includes('total')) totalConfidence += 0.4
          if (context.includes('grand') || context.includes('final')) totalConfidence += 0.2
          if (context.includes('due') || context.includes('balance')) totalConfidence += 0.2
          
          // Reduce confidence for suspicious amounts
          if (amount < 1) totalConfidence -= 0.3
          if (amount > 1000) totalConfidence -= 0.1
          
          if (totalConfidence > bestTotal.confidence) {
            bestTotal = { amount, confidence: totalConfidence }
          }
        }
      }
    }
  }
  
  if (bestTotal.amount > 0) {
    total = bestTotal.amount
    confidence += bestTotal.confidence * 0.2
  }
  
  // Enhanced item extraction with intelligent parsing
  const itemPatterns = [
    // Quantity, item, price patterns
    /^(\d+)\s+(.+?)\s+\$?(\d+\.?\d*)\s*$/,
    /^(.+?)\s+(\d+)\s*x\s*\$?(\d+\.?\d*)\s*$/,
    
    // Item followed by price
    /^(.{3,40})\s+\$?(\d+\.?\d*)\s*$/,
    /^(.{3,40})\s+(\d+\.?\d*)\s*$/,
    
    // Complex patterns with UPC/codes
    /^(.+?)\s+\d{8,}\s+\$?(\d+\.?\d*)\s*$/,
    
    // Sale/discount patterns
    /^(.+?)\s+(?:sale|reg|discount)\s*\$?(\d+\.?\d*)\s*$/i
  ]
  
  const excludeTerms = [
    'total', 'subtotal', 'tax', 'change', 'tender', 'cash', 'card', 'credit', 'debit',
    'thank you', 'receipt', 'store', 'phone', 'address', 'visit', 'www', 'customer',
    'cashier', 'register', 'transaction', 'approved', 'account', 'balance', 'due',
    'refund', 'return', 'policy', 'survey', 'save', 'rewards', 'member', 'number'
  ]
  
  for (const line of lines) {
    // Skip obviously non-item lines
    if (line.length < 3 || line.length > 80) continue
    if (excludeTerms.some(term => line.toLowerCase().includes(term))) continue
    if (/^\d+[\d\s\-\(\)]*$/.test(line)) continue // Just numbers/phone
    if (/^[A-Z\s]{10,}$/.test(line)) continue // All caps headers
    
    let itemMatch = null
    let patternUsed = -1
    
    for (let i = 0; i < itemPatterns.length; i++) {
      const match = line.match(itemPatterns[i])
      if (match) {
        itemMatch = match
        patternUsed = i
        break
      }
    }
    
    if (itemMatch) {
      let itemName = ''
      let quantity = 1
      let price = 0
      
      if (patternUsed === 0) {
        // Pattern: "qty item price"
        quantity = parseInt(itemMatch[1]) || 1
        itemName = itemMatch[2].trim()
        price = parseFloat(itemMatch[3])
      } else if (patternUsed === 1) {
        // Pattern: "item qty x price"
        itemName = itemMatch[1].trim()
        quantity = parseInt(itemMatch[2]) || 1
        price = parseFloat(itemMatch[3]) * quantity
      } else {
        // Pattern: "item price"
        itemName = itemMatch[1].trim()
        price = parseFloat(itemMatch[2])
      }
      
      // Validate item data
      if (itemName && price > 0 && price < 1000 && itemName.length > 2) {
        // Clean item name
        itemName = cleanItemName(itemName)
        
        const category = categorizeItemEnhanced(itemName)
        items.push({
          name: itemName,
          quantity: Math.max(1, quantity),
          price,
          category
        })
        confidence += 0.03 // Small boost per valid item
      }
    }
  }
  
  // Remove duplicate items and validate total
  const uniqueItems = items.filter((item, index, self) => 
    index === self.findIndex(i => i.name.toLowerCase() === item.name.toLowerCase())
  ).sort((a, b) => b.price - a.price)
  
  // Validate total against items
  if (uniqueItems.length > 0 && total > 0) {
    const itemsTotal = uniqueItems.reduce((sum, item) => sum + item.price, 0)
    const totalDiff = Math.abs(total - itemsTotal)
    
    if (totalDiff / total < 0.2) { // Within 20% - reasonable for tax/discounts
      confidence += 0.1
    }
  }
  
  // Final confidence adjustment
  confidence = Math.min(confidence + (uniqueItems.length * 0.02), 0.95)
  
  console.log(`Enhanced receipt parsing: ${storeName}, ${uniqueItems.length} items, total: $${total}, confidence: ${confidence.toFixed(2)}`)
  
  return {
    storeName,
    date: date || new Date().toISOString().split('T')[0],
    total,
    items: uniqueItems.slice(0, 25), // Limit to 25 items max
    confidence
  }
}

// Helper function to calculate store name confidence
function calculateStoreConfidence(line: string, storeName: string): number {
  let confidence = 0.3
  
  // Exact match boost
  if (line.toLowerCase() === storeName.toLowerCase()) confidence += 0.4
  
  // Position boost (earlier in receipt = more likely to be store name)
  confidence += 0.2
  
  // Line characteristics
  if (line.length < 30) confidence += 0.1 // Short lines more likely to be store names
  if (/^[A-Z\s&'.-]+$/.test(line)) confidence += 0.1 // All caps/title case
  
  return Math.min(confidence, 1.0)
}

// Helper function to clean item names
function cleanItemName(name: string): string {
  return name
    .replace(/\s+/g, ' ') // Multiple spaces
    .replace(/[^\w\s&'.-]/g, '') // Remove special chars except common ones
    .replace(/\b\d{8,}\b/g, '') // Remove UPC codes
    .replace(/\b[A-Z]{3,}\b/g, match => 
      match.charAt(0) + match.slice(1).toLowerCase()
    ) // Fix ALL CAPS
    .trim()
}

// Enhanced item categorization with more categories and better matching
function categorizeItemEnhanced(itemName: string): string {
  const name = itemName.toLowerCase()
  
  // Produce & Fresh
  if (/(?:banana|apple|orange|grape|berry|strawberry|peach|pear|plum|cherry|melon|watermelon|cantaloupe|pineapple|mango|avocado|lime|lemon|kiwi|papaya|coconut|fig|date|raisin|cranberry|blueberry|raspberry|blackberry)/i.test(name) ||
      /(?:lettuce|spinach|kale|arugula|cabbage|broccoli|cauliflower|carrot|celery|onion|garlic|potato|sweet potato|tomato|cucumber|pepper|bell pepper|jalapeño|mushroom|zucchini|squash|eggplant|asparagus|corn|peas|bean|radish|beet|turnip|parsley|cilantro|basil|herb)/i.test(name) ||
      /(?:organic|fresh|produce|fruit|vegetable)/i.test(name)) {
    return 'Produce & Fresh'
  }
  
  // Meat & Seafood
  if (/(?:beef|chicken|pork|turkey|lamb|fish|salmon|tuna|shrimp|crab|lobster|bacon|ham|sausage|ground|steak|chop|fillet|wing|breast|thigh|leg|roast|deli|lunch meat)/i.test(name)) {
    return 'Meat & Seafood'
  }
  
  // Dairy & Eggs
  if (/(?:milk|cheese|yogurt|butter|cream|sour cream|cottage cheese|egg|eggs|half and half|heavy cream|whipped cream|ice cream|frozen yogurt|mozzarella|cheddar|swiss|american|parmesan|feta|goat cheese)/i.test(name)) {
    return 'Dairy & Eggs'
  }
  
  // Pantry & Dry Goods
  if (/(?:bread|pasta|rice|flour|sugar|salt|pepper|spice|sauce|oil|vinegar|cereal|oats|quinoa|barley|lentil|bean|nut|almond|peanut|walnut|cashew|pistachio|sunflower|seed|honey|maple syrup|vanilla|baking|powder|soda)/i.test(name)) {
    return 'Pantry & Dry Goods'
  }
  
  // Beverages
  if (/(?:water|juice|soda|cola|pepsi|coke|sprite|beer|wine|coffee|tea|energy drink|sports drink|vitamin water|kombucha|smoothie|lemonade|milk|almond milk|soy milk|coconut milk)/i.test(name)) {
    return 'Beverages'
  }
  
  // Snacks & Candy
  if (/(?:chip|cracker|cookie|candy|chocolate|gum|popcorn|pretzel|nut|trail mix|granola|bar|snack)/i.test(name)) {
    return 'Snacks & Candy'
  }
  
  // Frozen Foods
  if (/(?:frozen|ice cream|pizza|burrito|dinner|vegetable|fruit|waffle|bagel|frozen meal)/i.test(name)) {
    return 'Frozen Foods'
  }
  
  // Health & Beauty
  if (/(?:shampoo|conditioner|soap|lotion|toothpaste|toothbrush|deodorant|perfume|cologne|makeup|vitamin|medicine|bandage|pain relief|allergy|cough|cold)/i.test(name)) {
    return 'Health & Beauty'
  }
  
  // Household & Cleaning
  if (/(?:paper towel|toilet paper|tissue|detergent|soap|cleaner|disinfectant|bleach|fabric softener|dryer sheet|trash bag|aluminum foil|plastic wrap|storage bag|light bulb|battery)/i.test(name)) {
    return 'Household & Cleaning'
  }
  
  // Baby & Pet
  if (/(?:diaper|baby|formula|pet|dog|cat|food|treat|toy|litter)/i.test(name)) {
    return 'Baby & Pet'
  }
  
  return 'Other'
}