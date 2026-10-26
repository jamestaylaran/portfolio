import HomeShell from "@/components/HomeShell";
import {
  getAchievements,
  getActivities,
  getProfile,
  getRoles,
} from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [profile, achievements, roles, activities] = await Promise.all([
    getProfile(),
    getAchievements(),
    getRoles(),
    getActivities(),
  ]);

  return (
    <HomeShell
      profile={profile}
      achievements={achievements}
      roles={roles}
      activities={activities}
    />
  );
}
