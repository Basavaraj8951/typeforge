import type { Types } from 'mongoose';
import { earned, type AStats } from '../config/achievements.js';
import { UserAchievement } from '../models/UserAchievement.js';

/** Unlocks newly earned badges. Safe to call repeatedly: the unique index prevents duplicates. */
export async function award(
  userId: Types.ObjectId | string,
  stats: AStats
) {
  const ok = earned(stats);

  if (!ok.length) {
    return [];
  }

  const achievementIds = await UserAchievement
    .find({ user: userId })
    .distinct('achievementId') as unknown as string[];

  const have = new Set<string>(achievementIds);

  const fresh: {
    id: string;
    title: string;
    icon: string;
  }[] = [];

  for (const a of ok) {
    if (have.has(a.id)) {
      continue;
    }

    try {
      await UserAchievement.create({
        user: userId,
        achievementId: a.id,
      });

      fresh.push({
        id: a.id,
        title: a.title,
        icon: a.icon,
      });
    } catch {
      // Unlocked concurrently
    }
  }

  return fresh;
}