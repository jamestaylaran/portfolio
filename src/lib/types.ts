export type Profile = {
  id: number;
  name: string;
  headline: string;
  tagline: string;
  bio: string;
  location: string;
  email: string;
  phone: string;
  website: string;
  resume_url: string;
  avatar_text: string;
  accent: string;
  social_github: string;
  social_linkedin: string;
  social_twitter: string;
  social_facebook: string;
  skills: string;
};

export type Achievement = {
  id: number;
  title: string;
  description: string;
  organization: string;
  date: string;
  category: string;
  sort_order: number;
  created_at: string;
};

export type Role = {
  id: number;
  organization: string;
  position: string;
  start_date: string;
  end_date: string;
  description: string;
  type: string;
  sort_order: number;
  created_at: string;
};

export type Activity = {
  id: number;
  title: string;
  description: string;
  activity_type: string;
  date: string;
  link: string;
  sort_order: number;
  created_at: string;
};
