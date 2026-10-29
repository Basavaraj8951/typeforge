import http from 'http';
import mongoose from 'mongoose';
import { app } from './app.js';
import { env } from './config/env.js';
import { attachSockets } from './sockets/index.js';
if (!env.jwt) { console.error('Set JWT_SECRET in .env'); process.exit(1); }
await mongoose.connect(env.mongo);
const server = http.createServer(app);
attachSockets(server);
server.listen(env.port, () => console.log(`API + realtime on :${env.port}`));
