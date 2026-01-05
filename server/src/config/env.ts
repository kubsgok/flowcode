import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root (when running from root via npm workspaces)
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
// Also try from server directory
dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });
// And from __dirname for direct execution
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/flowcode',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as string,
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
    refreshExpiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '30d') as string,
  },

  judge0: {
    apiUrl: process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com',
    apiKey: process.env.JUDGE0_API_KEY || '',
    apiHost: process.env.JUDGE0_API_HOST || 'judge0-ce.p.rapidapi.com',
  },

  cors: {
    origin: process.env.CORS_ORIGIN || 'http://127.0.0.1:3000',
  },
};
