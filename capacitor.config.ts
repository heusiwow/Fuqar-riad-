import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.apexfitness.app',
  appName: 'APEX',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'capacitor',
  },
  android: {
    allowMixedContent: false,
    backgroundColor: '#090A0B',
  },
  ios: {
    backgroundColor: '#090A0B',
    contentInset: 'automatic',
  },
};

export default config;
