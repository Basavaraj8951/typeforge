import { Schema, model } from 'mongoose';
const s = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  lessonId: { type: Number, required: true },
  attempts: { type: Number, default: 0 }, bestAccuracy: { type: Number, default: 0 }, bestWpm: { type: Number, default: 0 },
  completed: { type: Boolean, default: false }, completedAt: Date,
}, { timestamps: true });
s.index({ user: 1, lessonId: 1 }, { unique: true });
export const LessonProgress = model('LessonProgress', s);
