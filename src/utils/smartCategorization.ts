
interface CategoryRule {
  keywords: string[]
  confidence: number
  subcategories?: string[]
}

interface CategoryMatch {
  category: string
  confidence: number
  subcategory?: string
}

const CATEGORY_RULES: Record<string, CategoryRule> = {
  'Internet/Telecom': {
    keywords: [
      'internet', 'phone', 'mobile', 'wireless', 'telecom', 'broadband', 'fiber',
      'verizon', 'att', 'at&t', 'sprint', 'tmobile', 't-mobile', 'comcast', 'xfinity',
      'spectrum', 'cox', 'frontier', 'centurylink', 'optimum', 'charter'
    ],
    confidence: 0.9,
    subcategories: ['Internet Service', 'Mobile Phone', 'Landline', 'Cable TV']
  },
  
  'Utilities': {
    keywords: [
      'electric', 'electricity', 'gas', 'natural gas', 'water', 'sewer', 'utility',
      'power', 'energy', 'pge', 'pg&e', 'edison', 'sdge', 'duke energy', 'pepco',
      'trash', 'waste', 'garbage', 'recycling', 'solar'
    ],
    confidence: 0.95,
    subcategories: ['Electricity', 'Gas', 'Water/Sewer', 'Waste Management', 'Solar']
  },
  
  'Software/SaaS': {
    keywords: [
      'software', 'subscription', 'license', 'saas', 'cloud', 'app', 'service',
      'microsoft', 'office 365', 'adobe', 'google workspace', 'slack', 'zoom',
      'salesforce', 'hubspot', 'mailchimp', 'shopify', 'quickbooks', 'dropbox',
      'netflix', 'spotify', 'github', 'aws', 'azure', 'digital ocean'
    ],
    confidence: 0.85,
    subcategories: ['Productivity Software', 'Design Software', 'Communication', 'Cloud Storage', 'Development Tools']
  },
  
  'Office Supplies': {
    keywords: [
      'office', 'supplies', 'stationary', 'paper', 'printer', 'toner', 'ink',
      'staples', 'office depot', 'best buy', 'amazon business', 'costco business',
      'furniture', 'desk', 'chair', 'equipment', 'electronics'
    ],
    confidence: 0.8,
    subcategories: ['Stationery', 'Printer Supplies', 'Furniture', 'Electronics', 'General Supplies']
  },
  
  'Professional Services': {
    keywords: [
      'consulting', 'consultant', 'legal', 'lawyer', 'attorney', 'accounting',
      'accountant', 'cpa', 'tax', 'audit', 'financial', 'advisor', 'professional',
      'service', 'freelancer', 'contractor', 'marketing agency', 'design agency'
    ],
    confidence: 0.9,
    subcategories: ['Legal Services', 'Accounting/Tax', 'Consulting', 'Marketing Services', 'Design Services']
  },
  
  'Travel & Transport': {
    keywords: [
      'travel', 'flight', 'airline', 'hotel', 'airbnb', 'uber', 'lyft', 'taxi',
      'rental', 'car rental', 'train', 'bus', 'parking', 'toll', 'gas station',
      'fuel', 'mileage', 'conference', 'business trip', 'expedia', 'booking.com'
    ],
    confidence: 0.85,
    subcategories: ['Flights', 'Hotels', 'Ground Transport', 'Car Rental', 'Fuel', 'Parking']
  },
  
  'Meals & Entertainment': {
    keywords: [
      'restaurant', 'food', 'meal', 'lunch', 'dinner', 'breakfast', 'catering',
      'coffee', 'starbucks', 'cafe', 'bar', 'entertainment', 'client dinner',
      'business meal', 'conference meal', 'uber eats', 'doordash', 'grubhub'
    ],
    confidence: 0.8,
    subcategories: ['Business Meals', 'Client Entertainment', 'Conference/Event Meals', 'Office Catering']
  },
  
  'Marketing/Advertising': {
    keywords: [
      'marketing', 'advertising', 'ads', 'advertisement', 'promotion', 'campaign',
      'facebook ads', 'google ads', 'adwords', 'linkedin ads', 'twitter ads',
      'instagram ads', 'youtube ads', 'social media', 'seo', 'sem', 'ppc',
      'content marketing', 'email marketing', 'influencer'
    ],
    confidence: 0.9,
    subcategories: ['Digital Advertising', 'Social Media Marketing', 'Content Marketing', 'SEO/SEM', 'Print Advertising']
  },
  
  'Insurance': {
    keywords: [
      'insurance', 'policy', 'premium', 'coverage', 'liability', 'health insurance',
      'business insurance', 'professional liability', 'workers comp', 'property insurance',
      'auto insurance', 'commercial insurance', 'allstate', 'geico', 'progressive',
      'state farm', 'farmers', 'nationwide'
    ],
    confidence: 0.95,
    subcategories: ['Health Insurance', 'Business Insurance', 'Professional Liability', 'Property Insurance', 'Auto Insurance']
  },
  
  'Training & Education': {
    keywords: [
      'training', 'course', 'education', 'certification', 'workshop', 'seminar',
      'conference', 'online course', 'udemy', 'coursera', 'linkedin learning',
      'skillshare', 'masterclass', 'book', 'ebook', 'subscription', 'learning'
    ],
    confidence: 0.8,
    subcategories: ['Online Courses', 'Conferences', 'Certifications', 'Books/Resources', 'Workshops']
  }
}

export function categorizeExpense(
  text: string, 
  companyName: string = '', 
  description: string = ''
): CategoryMatch {
  const combinedText = `${text} ${companyName} ${description}`.toLowerCase()
  
  let bestMatch: CategoryMatch = {
    category: 'Other',
    confidence: 0
  }
  
  for (const [category, rule] of Object.entries(CATEGORY_RULES)) {
    let matchCount = 0
    let totalKeywords = rule.keywords.length
    let matchedKeywords: string[] = []
    
    for (const keyword of rule.keywords) {
      if (combinedText.includes(keyword.toLowerCase())) {
        matchCount++
        matchedKeywords.push(keyword)
      }
    }
    
    if (matchCount > 0) {
      const keywordScore = matchCount / totalKeywords
      const confidence = keywordScore * rule.confidence
      
      if (confidence > bestMatch.confidence) {
        bestMatch = {
          category,
          confidence,
          subcategory: determineSubcategory(matchedKeywords, rule.subcategories)
        }
      }
    }
  }
  
  return bestMatch
}

function determineSubcategory(matchedKeywords: string[], subcategories?: string[]): string | undefined {
  if (!subcategories) return undefined
  
  // Simple logic to determine subcategory based on matched keywords
  const keywordText = matchedKeywords.join(' ').toLowerCase()
  
  for (const subcategory of subcategories) {
    const subcategoryKeywords = subcategory.toLowerCase().split(/[\s\/]/);
    if (subcategoryKeywords.some(keyword => keywordText.includes(keyword))) {
      return subcategory
    }
  }
  
  return subcategories[0] // Default to first subcategory
}

export function suggestTags(category: string, subcategory?: string): string[] {
  const baseTags = [category.toLowerCase().replace(/[\/\s]/g, '-')]
  
  if (subcategory) {
    baseTags.push(subcategory.toLowerCase().replace(/[\/\s]/g, '-'))
  }
  
  // Add common business tags
  const commonTags = {
    'Internet/Telecom': ['communication', 'infrastructure'],
    'Utilities': ['overhead', 'facilities'],
    'Software/SaaS': ['tools', 'productivity'],
    'Office Supplies': ['equipment', 'supplies'],
    'Professional Services': ['consulting', 'expertise'],
    'Travel & Transport': ['business-travel', 'transportation'],
    'Meals & Entertainment': ['client-relations', 'networking'],
    'Marketing/Advertising': ['growth', 'customer-acquisition'],
    'Insurance': ['protection', 'compliance'],
    'Training & Education': ['development', 'skills']
  }
  
  if (commonTags[category as keyof typeof commonTags]) {
    baseTags.push(...commonTags[category as keyof typeof commonTags])
  }
  
  return baseTags
}

// Export for use in bill analysis
export { CATEGORY_RULES }
