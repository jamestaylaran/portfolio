import { getActivities, getRoles } from "@/lib/data";
import { InvolvementManager } from "./involvement-manager";

export default async function AdminInvolvementPage() {
  const [roles, activities] = await Promise.all([getRoles(), getActivities()]);
  return <InvolvementManager roles={roles} activities={activities} />;
}
