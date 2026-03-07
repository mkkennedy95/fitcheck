import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fitcheck.app',
  appName: 'FitCheck',
  webDir: 'public', // Only used for local development fallback
  server: {
    url: 'https://fitcheck.vercel.app', // TODO: Update with your actual Vercel deployment URL
    cleartext: true // Allows HTTP for localhost during development
  }
};

export default config;
