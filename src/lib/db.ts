import { sql } from "@vercel/postgres";
import { hashPassword } from "./password";

// Schema is created and seeded lazily, once per server instance. A guard row in
// `settings` (inserted with ON CONFLICT DO NOTHING) ensures only one instance
// seeds, even if several cold-start at the same time.
let initPromise: Promise<void> | null = null;

export function ensureSchema(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS profile (
          id INTEGER PRIMARY KEY DEFAULT 1,
          name TEXT NOT NULL,
          headline TEXT NOT NULL,
          tagline TEXT NOT NULL,
          bio TEXT NOT NULL,
          location TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT NOT NULL,
          website TEXT NOT NULL,
          resume_url TEXT NOT NULL,
          avatar_text TEXT NOT NULL,
          accent TEXT NOT NULL,
          social_github TEXT NOT NULL,
          social_linkedin TEXT NOT NULL,
          social_twitter TEXT NOT NULL,
          social_facebook TEXT NOT NULL,
          skills TEXT NOT NULL
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS achievements (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          organization TEXT NOT NULL,
          date TEXT NOT NULL,
          category TEXT NOT NULL,
          sort_order INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT (now()::text)
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS roles (
          id SERIAL PRIMARY KEY,
          organization TEXT NOT NULL,
          position TEXT NOT NULL,
          start_date TEXT NOT NULL,
          end_date TEXT NOT NULL,
          description TEXT NOT NULL,
          type TEXT NOT NULL DEFAULT 'Officer',
          sort_order INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT (now()::text)
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS activities (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          activity_type TEXT NOT NULL,
          date TEXT NOT NULL,
          link TEXT NOT NULL DEFAULT '',
          sort_order INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT (now()::text)
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        )
      `;

      // Only the instance that wins this insert performs the seed.
      const guard = await sql`
        INSERT INTO settings (key, value) VALUES ('seeded', '1')
        ON CONFLICT (key) DO NOTHING
        RETURNING key
      `;
      if (guard.rows.length > 0) {
        await seed();
      }
    })().catch((err) => {
      // Allow a retry on the next request if this attempt failed.
      initPromise = null;
      throw err;
    });
  }
  return initPromise;
}

async function seed() {
  await sql`
    INSERT INTO profile (
      id, name, headline, tagline, bio, location, email, phone, website,
      resume_url, avatar_text, accent, social_github, social_linkedin,
      social_twitter, social_facebook, skills
    ) VALUES (
      1,
      'Alex Rivera',
      'Full-Stack Developer & Student Leader',
      'I build clean web apps and lead teams that get things done.',
      'I''m a developer and student leader who enjoys turning ideas into working products. Alongside coding, I serve as an officer in student organizations where I coordinate events, mentor peers, and help teams stay organized. I care about writing readable code, designing clear interfaces, and leaving every team a little better than I found it. When I''m not at a keyboard you''ll find me volunteering, reading, or exploring new tools.',
      'Manila, Philippines',
      'alex.rivera@example.com',
      '+63 912 345 6789',
      'alexrivera.dev',
      '/resume.pdf',
      'AR',
      '#6366f1',
      'https://github.com/alexrivera',
      'https://linkedin.com/in/alexrivera',
      'https://twitter.com/alexrivera',
      'https://facebook.com/alexrivera',
      'JavaScript,TypeScript,React,Next.js,Node.js,HTML & CSS,Tailwind CSS,SQLite,Python,Git,Leadership,Public Speaking,Project Management'
    )
  `;

  await sql`
    INSERT INTO achievements (title, description, organization, date, category, sort_order) VALUES
      ('Dean''s Lister', 'Recognized for outstanding academic performance across four consecutive semesters.', 'College of Computer Studies', '2025-05-15', 'Academic', 0),
      ('Best Capstone Project Award', 'Led a four-person team to build a campus navigation app judged best in class.', 'ACM Student Chapter', '2025-04-10', 'Competition', 1),
      ('Outstanding Student Leader Award', 'Awarded for exemplary service and leadership in student organization activities.', 'Student Affairs Office', '2024-11-20', 'Leadership', 2),
      ('Web Development Certification', 'Completed a rigorous full-stack web development specialization track.', 'freeCodeCamp', '2024-08-01', 'Certification', 3)
  `;

  await sql`
    INSERT INTO roles (organization, position, start_date, end_date, description, type, sort_order) VALUES
      ('Computer Science Society', 'Vice President', '2025-08-01', 'Present', 'Oversee day-to-day operations, lead a 12-person executive team, and organize monthly technical workshops and hackathons for 200+ members.', 'Officer', 0),
      ('ACM Student Chapter', 'Treasurer', '2024-08-01', '2025-07-31', 'Managed the organization budget, sponsored event funding, and reported finances to faculty advisers each semester.', 'Officer', 1),
      ('Youth Devs Volunteer Group', 'Mentor', '2024-01-15', 'Present', 'Mentor high school students in introductory programming and help run weekend coding bootcamps.', 'Volunteer', 2)
  `;

  await sql`
    INSERT INTO activities (title, description, activity_type, date, link, sort_order) VALUES
      ('Campus Hackathon 2025', 'Organized a 24-hour hackathon with 40 teams and secured sponsorships from three local tech firms.', 'Event', '2025-09-12', '', 0),
      ('Frontend Mentor Series', 'Delivered a five-part workshop series on React and Next.js fundamentals to fellow students.', 'Workshop', '2025-06-05', '', 1),
      ('Community Tree-Planting Drive', 'Coordinated 60 volunteers for a coastal clean-up and tree-planting outreach program.', 'Volunteer', '2025-03-18', '', 2),
      ('Open Source Contribution', 'Contributed accessibility fixes to a widely-used open-source UI library.', 'Contribution', '2024-12-02', 'https://github.com', 3)
  `;

  await sql`
    INSERT INTO settings (key, value) VALUES ('password_hash', ${hashPassword("admin123")})
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
  `;
}
