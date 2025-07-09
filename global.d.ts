declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Database
      MONGODB_URI: string;
      MONGODB_DB_NAME: string;

      // NextAuth
      NEXTAUTH_URL: string;
      NEXTAUTH_SECRET: string;

      // AI Providers
      OPENAI_API_KEY: string;
      ANTHROPIC_API_KEY: string;
      GOOGLE_AI_API_KEY: string;

      // Stripe
      STRIPE_PUBLISHABLE_KEY: string;
      STRIPE_SECRET_KEY: string;
      STRIPE_WEBHOOK_SECRET: string;
      STRIPE_BASIC_PRICE_ID: string;
      STRIPE_PREMIUM_PRICE_ID: string;
      STRIPE_PRO_PRICE_ID: string;

      // Email
      SMTP_HOST: string;
      SMTP_PORT: string;
      SMTP_USER: string;
      SMTP_PASS: string;
      FROM_EMAIL: string;
      FROM_NAME: string;

      // Security
      RATE_LIMIT_MAX: string;
      RATE_LIMIT_WINDOW: string;
      JWT_SECRET: string;

      // File Upload
      MAX_FILE_SIZE: string;
      ALLOWED_FILE_TYPES: string;

      // Age Restrictions
      MIN_AGE: string;
      MAX_AGE: string;
      COPPA_AGE_LIMIT: string;

      // Socket.io
      SOCKET_IO_PATH: string;
      SOCKET_IO_CORS_ORIGIN: string;

      // Environment
      NODE_ENV: 'development' | 'production' | 'test';
      APP_URL: string;
    }
  }

  // Socket.io client-side types
  interface Window {
    io?: any;
  }
}

export {};
