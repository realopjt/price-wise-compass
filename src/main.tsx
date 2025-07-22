
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@/contexts/ThemeContext'
import App from './App.tsx'
import './index.css'
import { Capacitor } from '@capacitor/core';
import { configureMobileStatusBar } from './utils/mobile';

// Initialize app for mobile platforms
if (Capacitor.isNativePlatform()) {
  // Mobile-specific initialization
  document.addEventListener('deviceready', () => {
    console.log('Device is ready for mobile app');
    configureMobileStatusBar();
  });
} else {
  // Web platform initialization
  configureMobileStatusBar();
}

// PWA service worker is handled automatically by VitePWA plugin

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
