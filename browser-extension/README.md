# PriceWise - Smart Shopping Assistant

A cross-browser extension that automatically finds better deals and alternatives while you shop online.

## Features

🔍 **Smart Price Detection** - Automatically detects products and prices on popular shopping sites
💰 **Real-time Alternatives** - Shows cheaper alternatives from Amazon, eBay, Walmart, and more
⭐ **Rating & Reviews** - Displays ratings and reviews to help you make informed decisions
🚀 **Auto-Updates** - Keeps the extension updated with the latest features
🌐 **Cross-Browser Support** - Works on Chrome, Edge, Firefox, and Safari
📱 **Mobile Responsive** - Optimized for all screen sizes

## Supported Websites

### Shopping Sites
- Amazon
- eBay  
- Walmart
- Target
- Best Buy
- Etsy

### Search Engines
- Google
- Bing
- DuckDuckGo
- Brave Search
- You.com
- Perplexity AI

## Installation

### Chrome/Edge (Manifest V3)
1. Download or clone this repository
2. Open Chrome/Edge and go to `chrome://extensions/` or `edge://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the `browser-extension` folder
5. The extension will appear in your toolbar

### Firefox (Manifest V2)
1. Download or clone this repository
2. Rename `manifest-v2.json` to `manifest.json` (backup the original first)
3. Open Firefox and go to `about:debugging`
4. Click "This Firefox" → "Load Temporary Add-on"
5. Select the `manifest.json` file

### Safari
1. Download Xcode from the App Store
2. Use the Safari Web Extension Converter to convert the extension
3. Build and install through Xcode

## How It Works

1. **Browse Normally** - Shop on your favorite sites as usual
2. **See Dollar Signs** - Green $ icons appear next to products with better alternatives
3. **Click for Alternatives** - Click any $ icon to see cheaper options
4. **Compare & Save** - View side-by-side comparisons with ratings and reviews

## Development

### File Structure
```
browser-extension/
├── manifest.json          # Chrome/Edge manifest (V3)
├── manifest-v2.json       # Firefox manifest (V2)
├── background.js          # Service worker/background script
├── content.js            # Content script for page interaction
├── content.css           # Basic styles
├── enhanced-styles.css   # Cross-browser compatibility styles
├── popup.html           # Extension popup interface
├── popup.js             # Popup functionality
└── icons/               # Extension icons
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

### Building for Different Browsers

**Chrome/Edge (Default)**
- Uses `manifest.json` with Manifest V3
- Service worker background script
- Modern Chrome extension APIs

**Firefox**
- Rename `manifest-v2.json` to `manifest.json`
- Uses Manifest V2 with background scripts
- Compatible with Firefox Add-on APIs

**Safari**
- Requires conversion using Safari Web Extension Converter
- May need additional iOS/macOS specific code

### Auto-Update System

The extension includes an automatic update system that:
- Checks for updates every 4 hours
- Shows notifications when updates are available
- Maintains version compatibility across browsers
- Uses the Supabase edge function for update management

### API Integration

The extension connects to a Supabase backend for:
- Product alternative lookup
- Price comparison data
- Analytics and usage tracking
- Update management

## Privacy & Security

- **No Personal Data Collection** - Only analyzes visible page content
- **Secure HTTPS Only** - All API calls use encrypted connections
- **Local Storage Only** - Preferences stored locally on your device
- **Open Source** - Code is open for security review

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test across browsers
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues or questions:
- Open an issue on GitHub
- Check the troubleshooting guide
- Contact support through the extension popup

## Version History

### v1.2.0 (Current)
- Enhanced cross-browser compatibility
- Auto-update system
- Improved price detection
- Better mobile responsive design
- Dark mode support

### v1.1.0
- Added support for more shopping sites
- Improved alternative detection
- Better error handling

### v1.0.0
- Initial release
- Basic price comparison
- Chrome extension support