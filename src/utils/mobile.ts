// Mobile splash screen component
import { Capacitor } from '@capacitor/core';
import { useEffect } from 'react';

export const MobileSplashHandler = () => {
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      // Hide splash screen after app loads
      const hideSplash = async () => {
        try {
          const { SplashScreen } = await import('@capacitor/splash-screen');
          await SplashScreen.hide();
        } catch (error) {
          console.log('Splash screen not available');
        }
      };

      const timer = setTimeout(hideSplash, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  return null;
};

// Mobile status bar configuration
export const configureMobileStatusBar = async () => {
  if (Capacitor.isNativePlatform()) {
    try {
      const { StatusBar, Style } = await import('@capacitor/status-bar');
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#ffffff' });
    } catch (error) {
      console.log('Status bar not available');
    }
  }
};