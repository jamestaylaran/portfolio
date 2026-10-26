import HomeIntroShell from "@/components/HomeIntroShell";
import {
  getAchievements,
  getActivities,
  getProfile,
  getRoles,
} from "@/lib/data";

// Render at request time so edits from the dashboard appear immediately and the
// build never needs database access.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [profile, achievements, roles, activities] = await Promise.all([
    getProfile(),
    getAchievements(),
    getRoles(),
    getActivities(),
  ]);

  return (
    <HomeIntroShell
      profile={profile}
      achievements={achievements}
      roles={roles}
      activities={activities}
    />
  );
}
