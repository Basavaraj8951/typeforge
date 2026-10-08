import mongoose from 'mongoose';
import { app } from './app.js';
import { env } from './config/env.js';
if (!env.jwt) { console.error('Set JWT_SECRET in .env'); process.exit(1); }
await mongoose.connect(env.mongo);
app.listen(env.port, () => console.log(`API on :${env.port}`));
