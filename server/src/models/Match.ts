import { Schema, model } from 'mongoose';
const s = new Schema({
  type: { type: String, enum: ['race', 'battle'], required: true }, code: String, quick: Boolean, text: String, reason: String, durationSec: Number,
  players: [new Schema({ user: { type: Schema.Types.ObjectId, ref: 'User' }, name: String, place: Number, won: Boolean, wpm: Number, accuracy: Number, progress: Number, xp: Number }, { _id: false })],
}, { timestamps: true });
s.index({ 'players.user': 1, createdAt: -1 });
export const Match = model('Match', s);
