import Link from "next/link";
import {
  getAchievements,
  getActivities,
  getProfile,
  getRoles,
} from "@/lib/data";

export default async function AdminDashboardPage() {
  const [profile, achievements, roles, activities] = await Promise.all([
    getProfile(),
    getAchievements(),
    getRoles(),
    getActivities(),
  ]);

  const cards = [
    { label: "Profile", value: profile.name, href: "/admin/profile" },
    {
      label: "Achievements",
      value: `${achievements.length} entries`,
      href: "/admin/achievements",
    },
    {
      label: "Roles",
      value: `${roles.length} entries`,
      href: "/admin/involvement",
    },
    {
      label: "Activities",
      value: `${activities.length} entries`,
      href: "/admin/involvement",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-1 text-muted">
        Manage your portfolio content. Changes appear on your site instantly.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="card card-hover p-6">
            <p className="text-sm text-muted">{c.label}</p>
            <p className="mt-1 text-xl font-semibold">{c.value}</p>
            <p className="mt-3 text-sm text-accent">Edit →</p>
          </Link>
        ))}
      </div>

      <div className="card mt-8 p-6">
        <h2 className="font-semibold">Quick tips</h2>
        <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-muted">
          <li>
            Use the <strong>Profile</strong> page to update your bio, contact
            details, and skills.
          </li>
          <li>
            Add or remove achievements, roles, and activities from their pages.
          </li>
          <li>
            Change your login password from the <strong>Password</strong> page —
            the default is <code>admin123</code>.
          </li>
        </ul>
      </div>
    </div>
  );
}
