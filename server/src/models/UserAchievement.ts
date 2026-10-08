import { Schema, model } from 'mongoose';
const s = new Schema({ user: { type: Schema.Types.ObjectId, ref: 'User', required: true }, achievementId: { type: String, required: true } }, { timestamps: { createdAt: 'unlockedAt', updatedAt: false } });
s.index({ user: 1, achievementId: 1 }, { unique: true });
export const UserAchievement = model('UserAchievement', s);
