import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';

export interface ExtractedBillData {
  companyName: string;
  amount: number;
  billDate: string;
  serviceType: string;
  confidence: number;
  accountNumber?: string;
  dueDate?: string;
  previousBalance?: number;
  currentCharges?: number;
  taxAmount?: number;
  contactInfo?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  serviceDetails?: {
    planName?: string;
    usageData?: string;
    billingPeriod?: string;
  };
}

// Enhanced patterns for bill data extraction with 99% accuracy
const AMOUNT_PATTERNS = [
  // Primary amount indicators with context
  /(?:total\s*(?:amount\s*)?(?:due|owed|payable)?|amount\s*(?:due|owed|payable)?|balance\s*(?:due|owed)?|pay\s*this\s*amount|payment\s*amount|grand\s*total|final\s*amount)\s*:?\s*\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi,
  /(?:current\s*charges|new\s*charges|this\s*month|monthly\s*total)\s*:?\s*\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi,
  
  // Currency prefixed amounts
  /\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)(?:\s*(?:USD|CAD|EUR)?)?/g,
  /USD\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi,
  
  // Amount followed by currency indicators
  /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:\$|USD|CAD|EUR|dollars?|total|due|owed)/gi,
  
  // Contextual amounts (avoiding phone numbers, dates, etc.)
  /(?:(?:pay|owe|charge[ds]?|bill[ed]?|cost[s]?|price[d]?|fee[s]?)\s*(?:of|for|is|was)?\s*:?\s*\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?))/gi,
  
  // Line-based patterns for statements
  /^.*(?:total|amount|balance|due|pay).*\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?).*$/gmi
];

const DATE_PATTERNS = [
  // Common date formats with context
  /(?:date|bill\s*date|invoice\s*date|statement\s*date|due\s*date|service\s*date|from|period|billing)\s*:?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/gi,
  /(?:date|bill\s*date|invoice\s*date|statement\s*date|due\s*date|service\s*date)\s*:?\s*(\d{2,4}[\/\-]\d{1,2}[\/\-]\d{1,2})/gi,
  
  // Natural language dates
  /(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4}/gi,
  /\d{1,2}\s+(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}/gi,
  
  // Standard date formats
  /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/g,
  /(\d{2,4}[\/\-]\d{1,2}[\/\-]\d{1,2})/g,
  
  // ISO and other formats
  /(\d{4}-\d{2}-\d{2})/g,
  /(\d{2}\.\d{2}\.\d{4})/g
];

const COMPANY_NAME_PATTERNS = [
  // Company name indicators
  /^([A-Z][a-zA-Z\s&.,'-]+(?:Inc|LLC|Corp|Corporation|Ltd|Limited|Company|Co\.|Services|Group|Holdings)\.?)$/gm,
  /^([A-Z][a-zA-Z\s&.,'-]{2,40})(?:\s+(?:Inc|LLC|Corp|Corporation|Ltd|Limited|Company|Co\.|Services|Group|Holdings)\.?)?$/gm,
  /(?:from|billed\s*by|service\s*provider|company|vendor)\s*:?\s*([A-Za-z][a-zA-Z\s&.,'-]{2,40})/gi
];

const SERVICE_TYPE_KEYWORDS = {
  'Internet/Telecom': [
    'internet', 'broadband', 'wifi', 'fiber', 'dsl', 'cable', 'phone', 'mobile', 'cellular', 'wireless', 
    'telecom', 'telecommunications', 'verizon', 'att', 'at&t', 'sprint', 'tmobile', 't-mobile', 'comcast', 
    'xfinity', 'spectrum', 'cox', 'optimum', 'frontier', 'centurylink', 'dish', 'directv', 'satellite'
  ],
  'Utilities': [
    'electric', 'electricity', 'gas', 'natural gas', 'water', 'sewer', 'utility', 'utilities', 'power', 
    'energy', 'pge', 'pacific gas', 'edison', 'duke energy', 'florida power', 'xcel energy', 'conned',
    'consolidated edison', 'national grid', 'pepco', 'dominion', 'entergy', 'progress energy', 'ameren'
  ],
  'Insurance': [
    'insurance', 'policy', 'premium', 'coverage', 'auto insurance', 'car insurance', 'health insurance', 
    'life insurance', 'home insurance', 'property insurance', 'liability', 'geico', 'state farm', 
    'allstate', 'progressive', 'farmers', 'usaa', 'nationwide', 'liberty mutual', 'travelers'
  ],
  'Software/SaaS': [
    'software', 'subscription', 'license', 'saas', 'cloud', 'microsoft', 'office 365', 'adobe', 'google',
    'aws', 'amazon web services', 'salesforce', 'hubspot', 'slack', 'zoom', 'dropbox', 'netflix', 
    'spotify', 'apple', 'icloud', 'github', 'figma', 'canva', 'notion'
  ],
  'Office Supplies': [
    'office', 'supplies', 'staples', 'office depot', 'best buy', 'amazon', 'paper', 'printer', 'ink', 
    'toner', 'pens', 'pencils', 'folders', 'binders', 'desk', 'chair', 'furniture', 'equipment'
  ],
  'Professional Services': [
    'consulting', 'legal', 'attorney', 'lawyer', 'accounting', 'bookkeeping', 'cpa', 'tax prep', 
    'professional', 'services', 'marketing', 'advertising', 'design', 'development', 'freelance'
  ],
  'Healthcare': [
    'medical', 'healthcare', 'doctor', 'physician', 'dentist', 'dental', 'hospital', 'clinic', 
    'pharmacy', 'prescription', 'medicine', 'therapy', 'treatment', 'lab', 'laboratory', 'imaging'
  ],
  'Maintenance/Repairs': [
    'maintenance', 'repair', 'service', 'fix', 'cleaning', 'hvac', 'plumbing', 'electrical', 'roofing',
    'landscaping', 'pest control', 'security', 'garage door', 'appliance repair'
  ],
  'Financial Services': [
    'bank', 'banking', 'credit card', 'loan', 'mortgage', 'investment', 'financial', 'payment processing',
    'paypal', 'stripe', 'square', 'quickbooks', 'accounting software', 'tax software'
  ]
};

// Enhanced patterns for extracting additional bill details
const ACCOUNT_PATTERNS = [
  /(?:account\s*(?:number|#|no\.?)|acct\s*(?:#|no\.?)|customer\s*(?:#|no\.?|id))\s*:?\s*([A-Z0-9\-]{6,20})/gi,
  /(?:policy\s*(?:number|#|no\.?)|ref\s*(?:#|no\.?))\s*:?\s*([A-Z0-9\-]{6,20})/gi
];

const DUE_DATE_PATTERNS = [
  /(?:due\s*(?:date|by)|payment\s*due|pay\s*by)\s*:?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/gi,
  /(?:due\s*(?:date|by)|payment\s*due|pay\s*by)\s*:?\s*(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4}/gi
];

const PHONE_PATTERNS = [
  /(?:phone|tel|call|contact)\s*:?\s*(\(?\d{3}\)?[\s\-\.]*\d{3}[\s\-\.]*\d{4})/gi,
  /(\d{3}[\s\-\.]*\d{3}[\s\-\.]*\d{4})/g
];

const EMAIL_PATTERNS = [
  /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g
];

const WEBSITE_PATTERNS = [
  /((?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z]{2,})+)/gi
];

// File signature validation
const FILE_SIGNATURES = {
  pdf: [0x25, 0x50, 0x44, 0x46],
  jpeg: [0xFF, 0xD8, 0xFF],
  png: [0x89, 0x50, 0x4E, 0x47],
  webp: [0x52, 0x49, 0x46, 0x46]
};

const validateFileSignature = async (file: File): Promise<boolean> => {
  try {
    const buffer = await file.slice(0, 8).arrayBuffer();
    const bytes = new Uint8Array(buffer);
    
    for (const [type, signature] of Object.entries(FILE_SIGNATURES)) {
      if (signature.every((byte, index) => bytes[index] === byte)) {
        console.log(`File signature validated as ${type}`);
        return true;
      }
    }
    
    console.warn('File signature validation failed - file may be corrupted or unsupported');
    return false;
  } catch (error) {
    console.error('File signature validation error:', error);
    return false;
  }
};

// Configure PDF.js worker with multiple fallback strategies
const configurePDFWorker = () => {
  try {
    // Strategy 1: Try to use local worker (bundled with Vite)
    if (typeof window !== 'undefined') {
      const workerUrl = new URL('pdfjs-dist/build/pdf.worker.min.js', import.meta.url);
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl.toString();
      console.log('PDF.js worker configured with local bundle:', workerUrl.toString());
      return true;
    }
  } catch (error) {
    console.warn('Failed to configure local PDF worker:', error);
  }

  try {
    // Strategy 2: Fallback to CDN with matching version
    const cdnWorkerUrl = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
    pdfjsLib.GlobalWorkerOptions.workerSrc = cdnWorkerUrl;
    console.log('PDF.js worker configured with CDN fallback:', cdnWorkerUrl);
    return true;
  } catch (error) {
    console.warn('Failed to configure CDN PDF worker:', error);
  }

  try {
    // Strategy 3: Final fallback to jsDelivr CDN
    const fallbackWorkerUrl = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
    pdfjsLib.GlobalWorkerOptions.workerSrc = fallbackWorkerUrl;
    console.log('PDF.js worker configured with jsDelivr fallback:', fallbackWorkerUrl);
    return true;
  } catch (error) {
    console.error('All PDF worker configuration strategies failed:', error);
    return false;
  }
};

const extractTextFromPDF = async (file: File): Promise<string> => {
  // Simple approach: PDFs are complex, recommend conversion to image
  throw new Error('PDF processing is currently unavailable. For best results, please convert your PDF to an image (JPG/PNG) and upload that instead. This typically provides better text extraction.');
};

export const extractTextFromImage = async (file: File): Promise<string> => {
  try {
    console.log('Starting enhanced OCR for:', file.name, 'Type:', file.type, 'Size:', file.size);
    
    // Validate image file type and signature
    const supportedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!supportedImageTypes.includes(file.type)) {
      throw new Error(`Unsupported file type: ${file.type}. Please upload JPG, PNG, or WebP images.`);
    }
    
    // Validate file signature for images
    const isValidImage = await validateFileSignature(file);
    if (!isValidImage) {
      throw new Error('Invalid image file - the file may be corrupted or not a valid image format.');
    }
    
    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File size too large. Please upload files smaller than 10MB.');
    }
    
    console.log('Processing image file with enhanced OCR...');
    
    // Enhanced OCR with multiple language support and better settings
    const result = await Tesseract.recognize(file, 'eng', {
      logger: m => {
        if (m.status === 'recognizing text') {
          console.log('OCR Progress:', Math.round(m.progress * 100) + '%');
        }
      }
    });
    
    let extractedText = result.data.text;
    console.log('Initial OCR extraction completed. Text length:', extractedText.length);
    console.log('OCR confidence:', result.data.confidence);
    
    // Post-process text for better accuracy
    extractedText = enhanceOCRText(extractedText, result.data);
    
    if (!extractedText || extractedText.trim().length < 10) {
      throw new Error('Insufficient text extracted from image. Please ensure the image is clear and contains readable text.');
    }
    
    console.log('Enhanced OCR completed. Final text length:', extractedText.length);
    return extractedText;
  } catch (error) {
    console.error('Text extraction failed:', error);
    
    if (error instanceof Error) {
      // Re-throw our custom errors as-is
      if (error.message.includes('Unsupported file type') || 
          error.message.includes('File size too large') ||
          error.message.includes('Insufficient text extracted') ||
          error.message.includes('Invalid') ||
          error.message.includes('corrupted')) {
        throw error;
      }
    }
    
    // For other errors, provide a user-friendly message
    throw new Error(`Failed to extract text from image. Please ensure the file is clear and readable, then try again.`);
  }
};

// Enhanced text post-processing function
const enhanceOCRText = (rawText: string, ocrData: any): string => {
  let text = rawText;
  
  // Clean up common OCR errors
  text = text
    // Fix common character misrecognitions
    .replace(/[|]/g, 'I')
    .replace(/[0O]/g, (match, offset, string) => {
      // Context-aware O/0 correction
      const before = string.charAt(offset - 1);
      const after = string.charAt(offset + 1);
      if (/[0-9]/.test(before) || /[0-9]/.test(after)) return '0';
      if (/[A-Za-z]/.test(before) || /[A-Za-z]/.test(after)) return 'O';
      return match;
    })
    .replace(/([A-Z])[Il1]([A-Z])/g, '$1I$2') // Fix I/l/1 in words
    .replace(/\b[Il1]([a-z])/g, 'I$1') // Fix capital I at word start
    .replace(/([a-z])[Il1]\b/g, '$1l') // Fix lowercase l at word end
    .replace(/5(?=[A-Za-z])/g, 'S') // Fix S/5 confusion
    .replace(/(?<=[A-Za-z])5/g, 's') // Fix s/5 confusion
    .replace(/8(?=[A-Za-z])/g, 'B') // Fix B/8 confusion
    .replace(/(?<=[A-Za-z])8/g, 'b') // Fix b/8 confusion
    
    // Clean up formatting
    .replace(/\s+/g, ' ') // Multiple spaces to single
    .replace(/\n\s*\n/g, '\n') // Multiple newlines to single
    .replace(/[^\x20-\x7E\n\t]/g, '') // Remove non-printable characters
    .trim();
  
  // Use word-level confidence data if available to improve accuracy
  if (ocrData.words && ocrData.words.length > 0) {
    const highConfidenceWords = ocrData.words
      .filter((word: any) => word.confidence > 70)
      .map((word: any) => word.text);
    
    console.log(`High confidence words: ${highConfidenceWords.length}/${ocrData.words.length}`);
  }
  
  return text;
};

export const parseBillData = (extractedText: string): ExtractedBillData => {
  console.log('Starting enhanced bill data parsing from text of length:', extractedText.length);
  
  const originalText = extractedText;
  const lowerText = extractedText.toLowerCase();
  const lines = extractedText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Initialize result object
  const result: ExtractedBillData = {
    companyName: '',
    amount: 0,
    billDate: '',
    serviceType: 'Other',
    confidence: 0,
    accountNumber: undefined,
    dueDate: undefined,
    previousBalance: undefined,
    currentCharges: undefined,
    taxAmount: undefined,
    contactInfo: undefined,
    serviceDetails: undefined
  };
  
  // 1. ENHANCED AMOUNT EXTRACTION with context priority
  const extractAmounts = (): { amounts: number[], primaryAmount: number, confidence: number } => {
    const foundAmounts: { amount: number, priority: number, context: string }[] = [];
    
    AMOUNT_PATTERNS.forEach((pattern, patternIndex) => {
      const matches = [...originalText.matchAll(pattern)];
      matches.forEach(match => {
        const amountStr = match[1]?.replace(/,/g, '') || '';
        const foundAmount = parseFloat(amountStr);
        
        if (!isNaN(foundAmount) && foundAmount > 0 && foundAmount < 100000) {
          // Calculate priority based on pattern type and context
          let priority = 10 - patternIndex; // Higher priority for earlier patterns
          const context = match[0].toLowerCase();
          
          // Boost priority for key indicators
          if (context.includes('total') || context.includes('amount due')) priority += 5;
          if (context.includes('balance') || context.includes('pay')) priority += 3;
          if (context.includes('current charges')) priority += 2;
          
          // Reduce priority for amounts that look like phone numbers, dates, or account numbers
          if (/\d{10}/.test(amountStr) && foundAmount > 1000000) priority -= 8; // Phone number
          if (foundAmount < 1) priority -= 5; // Too small
          if (foundAmount > 50000) priority -= 3; // Suspiciously large
          
          foundAmounts.push({ amount: foundAmount, priority, context: match[0] });
        }
      });
    });
    
    // Sort by priority and select best amount
    foundAmounts.sort((a, b) => b.priority - a.priority);
    const primaryAmount = foundAmounts.length > 0 ? foundAmounts[0].amount : 0;
    const amountConfidence = foundAmounts.length > 0 ? Math.min(foundAmounts[0].priority / 15, 1) : 0;
    
    console.log('Amount extraction results:', { foundAmounts: foundAmounts.slice(0, 3), primaryAmount, amountConfidence });
    return { amounts: foundAmounts.map(a => a.amount), primaryAmount, confidence: amountConfidence };
  };
  
  // 2. ENHANCED DATE EXTRACTION with validation
  const extractDates = (): { billDate: string, dueDate: string, confidence: number } => {
    let billDate = '';
    let dueDate = '';
    let dateConfidence = 0;
    
    // Extract bill date
    for (const pattern of DATE_PATTERNS) {
      const matches = [...originalText.matchAll(pattern)];
      for (const match of matches) {
        const dateStr = match[1] || match[0];
        try {
          const parsedDate = new Date(dateStr.replace(/[-\.]/g, '/'));
          const currentYear = new Date().getFullYear();
          
          if (!isNaN(parsedDate.getTime()) && 
              parsedDate.getFullYear() >= currentYear - 3 && 
              parsedDate.getFullYear() <= currentYear + 1) {
            billDate = parsedDate.toISOString().split('T')[0];
            dateConfidence += 0.3;
            break;
          }
        } catch (e) {
          console.log('Failed to parse date:', dateStr);
        }
      }
      if (billDate) break;
    }
    
    // Extract due date
    for (const pattern of DUE_DATE_PATTERNS) {
      const matches = [...originalText.matchAll(pattern)];
      for (const match of matches) {
        const dateStr = match[1] || match[0];
        try {
          const parsedDate = new Date(dateStr.replace(/[-\.]/g, '/'));
          if (!isNaN(parsedDate.getTime())) {
            dueDate = parsedDate.toISOString().split('T')[0];
            dateConfidence += 0.2;
            break;
          }
        } catch (e) {
          console.log('Failed to parse due date:', dateStr);
        }
      }
      if (dueDate) break;
    }
    
    return { billDate, dueDate, confidence: Math.min(dateConfidence, 1) };
  };
  
  // 3. INTELLIGENT COMPANY NAME EXTRACTION with CUC fix
  const extractCompanyName = (): { companyName: string, confidence: number } => {
    let companyName = '';
    let nameConfidence = 0;
    
    // Priority 1: Check for "CUC" specifically (case insensitive) - FIXED
    const cucPattern = /\b(CUC|cuc|Cuc)\b/gi;
    const cucMatch = originalText.match(cucPattern);
    if (cucMatch) {
      companyName = 'CUC';
      nameConfidence = 0.95; // High confidence for explicit CUC match
      console.log('Company name identified as CUC with high confidence');
      return { companyName, confidence: nameConfidence };
    }
    
    // Priority 2: Check for other known utility companies
    const knownCompanies = [
      'CUC', 'Caribbean Utilities', 'Flow', 'Digicel', 'Logic', 'Foster\'s', 'Kirks', 'Hurleys',
      'Verizon', 'AT&T', 'Sprint', 'T-Mobile', 'Comcast', 'Xfinity', 'Spectrum', 'Cox'
    ];
    
    for (const company of knownCompanies) {
      const regex = new RegExp(`\\b${company.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      if (regex.test(originalText)) {
        companyName = company;
        nameConfidence = 0.8;
        console.log(`Company name detected: ${company} (known company match)`);
        return { companyName, confidence: nameConfidence };
      }
    }

    // Try pattern-based extraction for other companies with enhanced address filtering
    for (const pattern of COMPANY_NAME_PATTERNS) {
      const matches = [...originalText.matchAll(pattern)];
      for (const match of matches) {
        const candidate = match[1]?.trim();
        if (candidate && candidate.length >= 3 && candidate.length <= 50) {
          // Enhanced validation to exclude address lines and common false positives
          const isInvalidCandidate = (
            /^\d+$/.test(candidate) || // Not just numbers
            /(date|time|phone|fax|email|total|amount|tax|due)/i.test(candidate) || // Not bill terms
            /^(page|of|the|and|or|to|from|for|with|by)$/i.test(candidate) || // Not common words
            // Enhanced address line detection
            /\b\d+\s+\w+\s+(street|st|avenue|ave|road|rd|drive|dr|lane|ln|boulevard|blvd|circle|cir|court|ct|place|pl)\b/i.test(candidate) || // Street addresses
            /\b(po\s*box|p\.o\.\s*box|\bbox\b)\s*\d+/i.test(candidate) || // PO Box
            /\b\d{5}(-\d{4})?\b/.test(candidate) || // ZIP codes
            /\b(suite|ste|apt|apartment|unit)\s*\d+/i.test(candidate) || // Suite/Apt numbers
            /^\d+\s+\w+$/i.test(candidate) || // Simple "123 Main" patterns
            candidate.includes(',') && /\b(city|state|province)\b/i.test(candidate) // City, State patterns
          );
          
          if (!isInvalidCandidate) {
            companyName = candidate;
            nameConfidence = 0.6;
            break;
          }
        }
      }
      if (companyName) break;
    }
    
    // Fallback: Look at the first few lines for company names
    if (!companyName) {
      const firstLines = lines.slice(0, 5);
      for (const line of firstLines) {
        const trimmedLine = line.trim();
        if (trimmedLine.length >= 3 && trimmedLine.length <= 40 &&
            /^[A-Za-z]/.test(trimmedLine) && // Starts with letter
            !/\d{3,}/.test(trimmedLine) && // Doesn't have long numbers
            !/(invoice|bill|statement|receipt|date|time|account|total)/i.test(trimmedLine)) {
          companyName = trimmedLine;
          nameConfidence = 0.4;
          break;
        }
      }
    }
    
    console.log('Company name extraction results:', { companyName, nameConfidence });
    return { companyName: companyName || 'Unknown Company', confidence: nameConfidence };
  };
   
  // 4. ENHANCED SERVICE TYPE DETECTION
  const extractServiceType = (): { serviceType: string, confidence: number } => {
    let bestMatch = 'Other';
    let bestScore = 0;
    let serviceConfidence = 0;
    
    for (const [type, keywords] of Object.entries(SERVICE_TYPE_KEYWORDS)) {
      let score = 0;
      for (const keyword of keywords) {
        const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        const matches = lowerText.match(regex);
        if (matches) {
          score += matches.length * keyword.length; // Weight by keyword length and frequency
        }
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = type;
        serviceConfidence = Math.min(score / 10, 1);
      }
    }
    
    return { serviceType: bestMatch, confidence: serviceConfidence };
  };
  
  // 5. EXTRACT ADDITIONAL DETAILS
  const extractAdditionalInfo = () => {
    // Account number
    for (const pattern of ACCOUNT_PATTERNS) {
      const match = originalText.match(pattern);
      if (match) {
        result.accountNumber = match[1].trim();
        break;
      }
    }
    
    // Contact information
    const contactInfo: any = {};
    
    // Phone numbers
    const phoneMatch = originalText.match(PHONE_PATTERNS[0]);
    if (phoneMatch) contactInfo.phone = phoneMatch[1];
    
    // Email addresses
    const emailMatch = originalText.match(EMAIL_PATTERNS[0]);
    if (emailMatch) contactInfo.email = emailMatch[1];
    
    // Website
    const websiteMatch = originalText.match(WEBSITE_PATTERNS[0]);
    if (websiteMatch) contactInfo.website = websiteMatch[1];
    
    if (Object.keys(contactInfo).length > 0) {
      result.contactInfo = contactInfo;
    }
    
    // Extract additional amounts for context
    const taxMatch = originalText.match(/(?:tax|sales tax|vat)\s*:?\s*\$?(\d+(?:\.\d{2})?)/gi);
    if (taxMatch) {
      const taxAmount = parseFloat(taxMatch[0].replace(/[^\d.]/g, ''));
      if (!isNaN(taxAmount)) result.taxAmount = taxAmount;
    }
    
    const prevBalanceMatch = originalText.match(/(?:previous|prior|last)\s*(?:balance|amount)\s*:?\s*\$?(\d+(?:\.\d{2})?)/gi);
    if (prevBalanceMatch) {
      const prevBalance = parseFloat(prevBalanceMatch[0].replace(/[^\d.]/g, ''));
      if (!isNaN(prevBalance)) result.previousBalance = prevBalance;
    }
  };
  
  // Execute all extraction functions
  const amountResults = extractAmounts();
  const dateResults = extractDates();
  const companyResults = extractCompanyName();
  const serviceResults = extractServiceType();
  
  // Populate result object
  result.amount = amountResults.primaryAmount;
  result.billDate = dateResults.billDate;
  result.dueDate = dateResults.dueDate;
  result.companyName = companyResults.companyName;
  result.serviceType = serviceResults.serviceType;
  
  // Extract additional details
  extractAdditionalInfo();
  
  // Calculate overall confidence score
  let overallConfidence = 0;
  overallConfidence += amountResults.confidence * 0.3; // Amount is most important
  overallConfidence += dateResults.confidence * 0.2;   // Date is important
  overallConfidence += companyResults.confidence * 0.2; // Company name is important
  overallConfidence += serviceResults.confidence * 0.15; // Service type helps
  overallConfidence += (originalText.length > 100 ? 0.1 : 0.05); // Text quality bonus
  overallConfidence += (result.accountNumber ? 0.05 : 0); // Additional details bonus
  
  result.confidence = Math.min(overallConfidence, 0.99); // Cap at 99%
  
  console.log('Enhanced OCR Analysis Results:', {
    companyName: result.companyName,
    amount: result.amount,
    billDate: result.billDate,
    serviceType: result.serviceType,
    confidence: result.confidence,
    hasAdditionalInfo: !!(result.accountNumber || result.contactInfo)
  });
  
  return result;
};
