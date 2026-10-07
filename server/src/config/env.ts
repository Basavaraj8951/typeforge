import 'dotenv/config';
export const env = {
  port: Number(process.env.PORT || 4000),
  mongo: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/typeforge',
  jwt: process.env.JWT_SECRET || '',
  client: process.env.CLIENT_URL || 'http://localhost:5173',
  prod: process.env.NODE_ENV === 'production',
};
