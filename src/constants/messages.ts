// Configurable UI messages and labels for the PriceWise application
// This allows easy customization of user-facing text without modifying components

export const UI_MESSAGES = {
  // Better alternatives and recommendations
  BETTER_ALTERNATIVE: "Better Alternative", 
  SMART_RECOMMENDATIONS: "Smart Recommendations",
  NO_ALTERNATIVE_AVAILABLE: "No alternative available",
  CHEAPER_AT_VENDOR: (vendor: string, price: number) => `Cheaper at ${vendor} for $${price.toFixed(2)}`,
  
  // Savings messages
  SAVE_AMOUNT: (amount: number) => `Save $${amount.toFixed(2)}`,
  POTENTIAL_SAVINGS: (amount: number) => `Potential Savings: $${amount.toFixed(2)}`,
  TOTAL_SAVINGS_FOUND: (amount: number) => `Total Savings Found: $${amount.toFixed(2)}`,
  
  // Analysis status
  ANALYSIS_IN_PROGRESS: "Analysis in Progress",
  ANALYSIS_COMPLETE: "Analysis Complete",
  ANALYSIS_FAILED: "Analysis Failed",
  
  // Upload and scanning
  UPLOAD_IN_PROGRESS: "Upload in Progress",
  SCANNING_RECEIPT: "Scanning receipt...",
  PROCESSING_BILL: "Processing bill...",
  
  // Error states
  CAMERA_ERROR: "Camera Error",
  CAMERA_PERMISSION_DENIED: "Camera permission denied. Please allow camera access and try again.",
  UPLOAD_FAILED: "Upload failed",
  SCAN_FAILED: "Scan failed",
  
  // Success messages
  UPLOAD_SUCCESS: "Upload successful",
  SCAN_SUCCESS: "Scan successful",
  PROFILE_UPDATED: "Profile updated successfully",
  BILL_UPDATED: "Bill updated successfully",
} as const;

// Alternative labels that can be easily swapped
export const ALTERNATIVE_LABELS = {
  BETTER_ALTERNATIVE: UI_MESSAGES.BETTER_ALTERNATIVE,
  SMART_RECOMMENDATIONS: UI_MESSAGES.SMART_RECOMMENDATIONS,
} as const;

export type UIMessage = typeof UI_MESSAGES;
export type AlternativeLabel = typeof ALTERNATIVE_LABELS;