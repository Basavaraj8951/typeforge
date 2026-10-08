import { Schema, model } from 'mongoose';
const s = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  wpm: Number, rawWpm: Number, cpm: Number, mode: String, kind: String, accuracy: Number, errors: Number, consistency: Number,
  correctChars: Number, incorrectChars: Number, duration: Number, seconds: Number,
  category: String, difficulty: String,
  errorKeys: { type: Schema.Types.Mixed, default: {} },
  tokenId: { type: String, unique: true, sparse: true },
  flagged: { type: Boolean, default: false }, flagReasons: [String],
}, { timestamps: true });
s.index({ user: 1, createdAt: -1 });
s.index({ flagged: 1, createdAt: -1 });
export const TestResult = model('TestResult', s);
