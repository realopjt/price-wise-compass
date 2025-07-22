import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.ac99a7a8137c45129e7689085e8292ca',
  appName: 'price-wise-compass',
  webDir: 'dist',
  server: {
    url: 'https://ac99a7a8-137c-4512-9e76-89085e8292ca.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#ffffffff",
      androidSplashResourceName: "splash",
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#999999",
      showSpinner: true,
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;