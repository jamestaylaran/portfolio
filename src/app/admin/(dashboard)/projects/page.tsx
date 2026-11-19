import { getActivities } from "@/lib/data";
import { ProjectsManager } from "./projects-manager";

export default async function AdminProjectsPage() {
  const activities = await getActivities();
  const projects = activities.filter((a) => a.activity_type === "Project");
  return <ProjectsManager projects={projects} />;
}
