import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { hashPassword } from "./password";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "portfolio.db");

// The owner's initial password. It is hashed before being stored; the owner
// should change it from the dashboard after the first login.
const DEFAULT_PASSWORD = "admin123";

const SCHEMA = `
CREATE TABLE IF NOT EXISTS profile (
  id INTEGER PRIMARY KEY CHECK (id = 1),
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
);

CREATE TABLE IF NOT EXISTS achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  organization TEXT NOT NULL,
  date TEXT NOT NULL,
  category TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organization TEXT NOT NULL,
  position TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Officer',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS activities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  date TEXT NOT NULL,
  link TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`;

// Cache the singleton connection across HMR reloads.
const globalForDb = globalThis as unknown as {
  __portfolioDb?: Database.Database;
};

export function getDb(): Database.Database {
  if (globalForDb.__portfolioDb) return globalForDb.__portfolioDb;

  fs.mkdirSync(DATA_DIR, { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.exec(SCHEMA);

  // Seed with placeholder content on very first run.
  const hasProfile = db.prepare("SELECT COUNT(*) AS c FROM profile").get() as {
    c: number;
  };
  if (hasProfile.c === 0) {
    seed(db);
  }

  globalForDb.__portfolioDb = db;
  return db;
}

function seed(db: Database.Database) {
  db.prepare(
    `INSERT INTO profile (
      id, name, headline, tagline, bio, location, email, phone, website,
      resume_url, avatar_text, accent, social_github, social_linkedin,
      social_twitter, social_facebook, skills
    ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    "Alex Rivera",
    "Full-Stack Developer & Student Leader",
    "I build clean web apps and lead teams that get things done.",
    "I'm a developer and student leader who enjoys turning ideas into working products. " +
      "Alongside coding, I serve as an officer in student organizations where I coordinate " +
      "events, mentor peers, and help teams stay organized. I care about writing readable code, " +
      "designing clear interfaces, and leaving every team a little better than I found it. " +
      "When I'm not at a keyboard you'll find me volunteering, reading, or exploring new tools.",
    "Manila, Philippines",
    "alex.rivera@example.com",
    "+63 912 345 6789",
    "alexrivera.dev",
    "/resume.pdf",
    "AR",
    "#6366f1",
    "https://github.com/alexrivera",
    "https://linkedin.com/in/alexrivera",
    "https://twitter.com/alexrivera",
    "https://facebook.com/alexrivera",
    "JavaScript,TypeScript,React,Next.js,Node.js,HTML & CSS,Tailwind CSS,SQLite,Python,Git,Leadership,Public Speaking,Project Management"
  );

  const insertAchievement = db.prepare(
    `INSERT INTO achievements (title, description, organization, date, category, sort_order)
     VALUES (?, ?, ?, ?, ?, ?)`
  );
  insertAchievement.run(
    "Dean's Lister",
    "Recognized for outstanding academic performance across four consecutive semesters.",
    "College of Computer Studies",
    "2025-05-15",
    "Academic",
    0
  );
  insertAchievement.run(
    "Best Capstone Project Award",
    "Led a four-person team to build a campus navigation app judged best in class.",
    "ACM Student Chapter",
    "2025-04-10",
    "Competition",
    1
  );
  insertAchievement.run(
    "Outstanding Student Leader Award",
    "Awarded for exemplary service and leadership in student organization activities.",
    "Student Affairs Office",
    "2024-11-20",
    "Leadership",
    2
  );
  insertAchievement.run(
    "Web Development Certification",
    "Completed a rigorous full-stack web development specialization track.",
    "freeCodeCamp",
    "2024-08-01",
    "Certification",
    3
  );

  const insertRole = db.prepare(
    `INSERT INTO roles (organization, position, start_date, end_date, description, type, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  );
  insertRole.run(
    "Computer Science Society",
    "Vice President",
    "2025-08-01",
    "Present",
    "Oversee day-to-day operations, lead a 12-person executive team, and organize " +
      "monthly technical workshops and hackathons for 200+ members.",
    "Officer",
    0
  );
  insertRole.run(
    "ACM Student Chapter",
    "Treasurer",
    "2024-08-01",
    "2025-07-31",
    "Managed the organization budget, sponsored event funding, and reported finances " +
      "to faculty advisers each semester.",
    "Officer",
    1
  );
  insertRole.run(
    "Youth Devs Volunteer Group",
    "Mentor",
    "2024-01-15",
    "Present",
    "Mentor high school students in introductory programming and help run weekend " +
      "coding bootcamps.",
    "Volunteer",
    2
  );

  const insertActivity = db.prepare(
    `INSERT INTO activities (title, description, activity_type, date, link, sort_order)
     VALUES (?, ?, ?, ?, ?, ?)`
  );
  insertActivity.run(
    "Campus Hackathon 2025",
    "Organized a 24-hour hackathon with 40 teams and secured sponsorships from three local tech firms.",
    "Event",
    "2025-09-12",
    "",
    0
  );
  insertActivity.run(
    "Frontend Mentor Series",
    "Delivered a five-part workshop series on React and Next.js fundamentals to fellow students.",
    "Workshop",
    "2025-06-05",
    "",
    1
  );
  insertActivity.run(
    "Community Tree-Planting Drive",
    "Coordinated 60 volunteers for a coastal clean-up and tree-planting outreach program.",
    "Volunteer",
    "2025-03-18",
    "",
    2
  );
  insertActivity.run(
    "Open Source Contribution",
    "Contributed accessibility fixes to a widely-used open-source UI library.",
    "Contribution",
    "2024-12-02",
    "https://github.com",
    3
  );

  // Store the default password hash.
  db.prepare(
    "INSERT OR REPLACE INTO settings (key, value) VALUES ('password_hash', ?)"
  ).run(hashPassword(DEFAULT_PASSWORD));
}
