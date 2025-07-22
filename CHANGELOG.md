# Changelog

All notable changes to PriceWise will be documented in this file.

## [1.3.0] - 2025-07-25 - Core Issues Fix

### 🐛 Bug Fixes

#### Camera & Scanner Improvements
- **Fixed camera black screen and initialization errors** in Receipt Scanner tab
- Enhanced error handling with proper getUserMedia fallback strategies  
- Added red error state display when camera fails to initialize
- Improved error messages for permission denied, device not found, and other camera issues

#### OCR & Company Parsing Enhancements
- **Fixed address lines being parsed as company names**
- Enhanced company name extraction with advanced address filtering
- Added detection for street addresses, PO boxes, ZIP codes, and apartment numbers
- Improved fallback to manual editing when OCR misidentifies company information
- **Fixed manual edits persistence** - changes now properly save and reflect in dashboard

#### Better Alternatives System
- **Fixed utility/unique provider handling** - now shows "No alternative available" for utilities like CUC, electric, gas, water, internet, and government services
- Enhanced price comparison logic to detect utility services and monopoly providers
- Improved alternative display with clickable vendor links and better pricing information
- Fixed random Costco/Amazon suggestions for CUC bills and other utilities

#### Authentication & Session Management
- **Fixed session/logout glitch and auto-redirect loops**
- Improved Supabase auth refresh handling with proper local storage configuration
- Enhanced auth state persistence with better error recovery

#### Profile & Avatar Management  
- **Fixed profile avatar upload to Supabase storage**
- Improved avatar URL saving and re-fetching after navigation
- Added automatic old avatar cleanup to prevent storage bloat
- Enhanced upload progress feedback and error handling

#### File Upload Improvements
- **Enhanced PDF upload robustness** with better error handling
- Improved upload progress indicators and error messaging
- Added file signature validation to prevent corrupted uploads

#### PayPal Integration
- **Fixed invalid client_id/redirect_uri errors** 
- Dynamic redirect URL construction based on environment
- Enhanced OAuth flow with proper error handling

### 🚀 New Features

#### Browser Extension Improvements
- **Removed need for Developer Mode** installation
- Enhanced popup messaging to show "Cheaper at [Retailer] for [Price]"
- Improved installation instructions for Chrome, Firefox, and Safari
- Better extension packaging and distribution

#### Configurable UI Messages
- **Added configurable labels** for "Better Alternative" and other UI text
- Created centralized message constants for easy customization
- Ability to switch between "Better Alternative" and "Smart Recommendations" labels

### 🔧 Technical Improvements

#### Code Quality
- Refactored price comparison utility with better error handling
- Enhanced OCR parsing with more robust data extraction
- Improved component state management and data persistence
- Added comprehensive error boundaries and fallback states

#### Performance
- Optimized file upload processing with better progress tracking
- Enhanced camera initialization with multiple fallback strategies  
- Improved database query efficiency for bill alternatives

### 📚 Documentation
- Added comprehensive installation instructions for browser extensions
- Enhanced error messages with more helpful troubleshooting guidance
- Improved code comments and documentation throughout

---

## Previous Versions

### [1.2.0] - Previous Release
- Initial browser extension support
- Basic OCR and bill scanning functionality
- PayPal integration foundation
- Core dashboard and recommendation system

### [1.1.0] - Initial Features  
- Basic bill upload and analysis
- Price comparison foundation
- User authentication with Supabase
- Basic recommendation engine

### [1.0.0] - Initial Release
- Core PriceWise application launch
- Basic expense tracking
- Simple price comparison