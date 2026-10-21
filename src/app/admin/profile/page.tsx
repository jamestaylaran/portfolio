import { getProfile } from "@/lib/data";
import { ProfileForm } from "./profile-form";

export default async function AdminProfilePage() {
  const profile = await getProfile();
  return <ProfileForm profile={profile} />;
}
