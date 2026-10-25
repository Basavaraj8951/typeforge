import { Schema, model } from 'mongoose';
const s = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  difficulty: String, text: { type: String, required: true },
  ai: [new Schema({ name: String, car: String, wpm: Number, finishSec: Number }, { _id: false })],
  startsAt: { type: Date, required: true },
  status: { type: String, enum: ['created', 'finished'], default: 'created' },
  result: { type: Schema.Types.Mixed },
}, { timestamps: true });
s.index({ user: 1, createdAt: -1 });
export const Race = model('Race', s);
