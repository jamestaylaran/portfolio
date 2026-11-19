import { getActivities, getRoles } from "@/lib/data";
import { InvolvementManager } from "./involvement-manager";

export default async function AdminInvolvementPage() {
  const [roles, activities] = await Promise.all([getRoles(), getActivities()]);
  const nonProjectActivities = activities.filter((a) => a.activity_type !== "Project");
  return <InvolvementManager roles={roles} activities={nonProjectActivities} />;
}
