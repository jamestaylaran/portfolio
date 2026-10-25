import { getAchievements } from "@/lib/data";
import { AchievementsManager } from "./achievements-manager";

export default async function AdminAchievementsPage() {
  const achievements = await getAchievements();
  return <AchievementsManager achievements={achievements} />;
}
