# Post-Merge Checklist for PriceWise Core Issues Fix

This checklist outlines the steps needed after merging the core issues fix branch to ensure full functionality.

## 🔄 Lovable Sync Steps

### 1. Verify GitHub Integration  
- [ ] Confirm changes are synced from Lovable to GitHub repository
- [ ] Check that all new files (CHANGELOG.md, POST-MERGE-CHECKLIST.md, constants/messages.ts) are present
- [ ] Verify browser extension files are updated in GitHub

### 2. Test Live Preview
- [ ] Confirm camera functionality works in the live Lovable preview
- [ ] Test receipt scanning with clear error messages
- [ ] Verify manual bill editing and persistence
- [ ] Test PayPal integration flow

## 🔧 Environment Variables & Configuration

### 3. Supabase Configuration
The following are already configured in your Supabase project:

**✅ Already Set:**
- `SUPABASE_URL`: https://gwgnygxddaxpfkmlyrqd.supabase.co
- `SUPABASE_ANON_KEY`: [Configured in project]  
- `SUPABASE_SERVICE_ROLE_KEY`: [Configured for edge functions]
- `PAYPAL_CLIENT_ID`: [Configured for PayPal integration]
- `PAYPAL_CLIENT_SECRET`: [Configured for PayPal integration]
- `GOOGLE_MAPS_API_KEY`: [Configured for location services]
- `RESEND_API_KEY`: [Configured for email services]

**🔍 Verify Configuration:**
- [ ] Test avatar upload functionality (should work with existing avatars bucket)
- [ ] Confirm bill file uploads work (should work with existing bills bucket)

## 💳 PayPal Dashboard Configuration

### 4. PayPal Developer Dashboard Setup

You need to complete these steps in your PayPal Developer Dashboard:

#### A. Application Configuration
1. **Login to PayPal Developer Dashboard**
   - Go to: https://developer.paypal.com/
   - Login with your PayPal business account

2. **Navigate to Your Application**  
   - Go to "Applications" in the left sidebar
   - Select your existing PriceWise application

3. **Update Redirect URIs**
   - In the application settings, find "Redirect URIs" section
   - **Add this exact URI**: `https://gwgnygxddaxpfkmlyrqd.supabase.co/functions/v1/paypal-integration?action=oauth_callback`
   - Make sure no extra spaces or characters are included
   - Save the changes

4. **Verify Scopes**
   - Ensure these scopes are enabled:
     - `openid`
     - `profile` 
     - `email`
     - `https://uri.paypal.com/services/payments/payment/read`

#### B. Webhook Configuration (Optional)
5. **Set Up Webhooks** (if using payment notifications)
   - Add webhook URL: `https://gwgnygxddaxpfkmlyrqd.supabase.co/functions/v1/paypal-integration?action=webhook`
   - Select relevant event types for payment notifications

## 📱 Browser Extension Deployment

### 5. Extension Packaging & Distribution

#### A. Create Distribution Files
- [ ] Package Chrome extension as .zip for Chrome Web Store
- [ ] Package Firefox extension as .xpi for Firefox Add-ons
- [ ] Create Safari conversion guide for users with Xcode

#### B. Update Download Links
- [ ] Create `/public/browser-extension.zip` with Chrome extension files
- [ ] Create `/public/browser-extension-firefox.zip` with Firefox extension files  
- [ ] Test download functionality from dashboard

#### C. Store Submission (Optional)
- [ ] Submit Chrome extension to Chrome Web Store
- [ ] Submit Firefox extension to Firefox Add-ons
- [ ] Update download links to point to store listings once approved

## 🧪 Testing Checklist

### 6. Feature Testing

#### Camera & OCR
- [ ] Test camera access on multiple devices/browsers
- [ ] Verify clear error messages when camera fails
- [ ] Test receipt scanning with various bill types
- [ ] Confirm company name extraction avoids address lines  
- [ ] Test manual bill editing and verify changes persist

#### Better Alternatives
- [ ] Test utility bills (electric, gas, water, internet) show "No alternative available"
- [ ] Test non-utility items show proper alternatives with clickable links
- [ ] Verify CUC bills don't show random Costco/Amazon suggestions

#### Profile & Authentication
- [ ] Test avatar upload and verify image appears after page refresh
- [ ] Test login/logout flow without redirect loops
- [ ] Verify session persistence across browser tabs

#### PayPal Integration  
- [ ] Test PayPal connection flow (should open popup without invalid_redirect_uri error)
- [ ] Verify transaction analysis works after successful connection
- [ ] Test disconnection and reconnection flow

## 🚀 Deployment Verification

### 7. Production Readiness
- [ ] Test all features in production environment
- [ ] Verify database migrations applied correctly
- [ ] Confirm all Supabase edge functions deployed
- [ ] Test browser extension installation on clean browsers

## 📞 Support & Documentation

### 8. User Communication
- [ ] Update user documentation with new features
- [ ] Prepare support articles for common issues
- [ ] Test customer support contact forms

---

## ❌ Known Limitations & Future Improvements

### Current Limitations:
- Safari browser extension requires manual conversion with Xcode
- PDF processing recommends conversion to image for better OCR results
- Price comparison uses simulated data (ready for real API integration)

### Future Enhancements:
- Real-time price API integration
- Enhanced OCR for more bill types
- Mobile app development
- Advanced savings analytics

---

## 🆘 Troubleshooting

If you encounter issues:

1. **PayPal OAuth Errors**: Double-check redirect URI exactly matches the format above
2. **Camera Issues**: Test on different browsers and ensure HTTPS is enabled
3. **Upload Problems**: Verify Supabase storage bucket permissions
4. **Extension Issues**: Ensure manifest files are properly formatted

For additional support, refer to the updated documentation or contact the development team.