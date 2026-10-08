import { Schema, model } from 'mongoose';
const userSchema = new Schema({
  name: { type: String, required: true, trim: true, maxlength: 60 },
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  level: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'pro'], default: 'beginner' },
  xp: { type: Number, default: 0 },
  bestWpm: { type: Number, default: 0 },
  testsCompleted: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  lastActiveDay: { type: String, default: '' },
}, { timestamps: true });
export const User = model('User', userSchema);
