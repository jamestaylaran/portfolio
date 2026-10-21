"use client";

import { useActionState } from "react";
import { updateProfile, type ContentState } from "../content-actions";
import type { Profile } from "@/lib/types";

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, formAction, pending] = useActionState<ContentState, FormData>(
    updateProfile,
    undefined
  );

  return (
    <form action={formAction} className="space-y-6">
      <div className="card p-6">
        <h2 className="font-semibold">Identity</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="field">
            <label htmlFor="name">Full name</label>
            <input id="name" name="name" defaultValue={profile.name} required />
          </div>
          <div className="field">
            <label htmlFor="headline">Headline</label>
            <input
              id="headline"
              name="headline"
              defaultValue={profile.headline}
            />
          </div>
          <div className="field sm:col-span-2">
            <label htmlFor="tagline">Tagline</label>
            <input id="tagline" name="tagline" defaultValue={profile.tagline} />
          </div>
          <div className="field">
            <label htmlFor="avatar_text">Avatar initials</label>
            <input
              id="avatar_text"
              name="avatar_text"
              defaultValue={profile.avatar_text}
              maxLength={3}
            />
          </div>
          <div className="field">
            <label htmlFor="accent">Accent color (hex)</label>
            <input
              id="accent"
              name="accent"
              defaultValue={profile.accent}
              placeholder="#6366f1"
            />
          </div>
          <div className="field sm:col-span-2">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              rows={6}
              defaultValue={profile.bio}
            />
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold">Contact</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="field">
            <label htmlFor="location">Location</label>
            <input
              id="location"
              name="location"
              defaultValue={profile.location}
            />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" defaultValue={profile.email} />
          </div>
          <div className="field">
            <label htmlFor="phone">Phone</label>
            <input id="phone" name="phone" defaultValue={profile.phone} />
          </div>
          <div className="field">
            <label htmlFor="website">Website</label>
            <input id="website" name="website" defaultValue={profile.website} />
          </div>
          <div className="field sm:col-span-2">
            <label htmlFor="resume_url">Résumé URL</label>
            <input
              id="resume_url"
              name="resume_url"
              defaultValue={profile.resume_url}
            />
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold">Social links</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="field">
            <label htmlFor="social_github">GitHub</label>
            <input
              id="social_github"
              name="social_github"
              defaultValue={profile.social_github}
            />
          </div>
          <div className="field">
            <label htmlFor="social_linkedin">LinkedIn</label>
            <input
              id="social_linkedin"
              name="social_linkedin"
              defaultValue={profile.social_linkedin}
            />
          </div>
          <div className="field">
            <label htmlFor="social_twitter">Twitter / X</label>
            <input
              id="social_twitter"
              name="social_twitter"
              defaultValue={profile.social_twitter}
            />
          </div>
          <div className="field">
            <label htmlFor="social_facebook">Facebook</label>
            <input
              id="social_facebook"
              name="social_facebook"
              defaultValue={profile.social_facebook}
            />
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold">Skills</h2>
        <div className="field mt-4">
          <label htmlFor="skills">
            Comma-separated (e.g. JavaScript, React, Leadership)
          </label>
          <textarea
            id="skills"
            name="skills"
            rows={3}
            defaultValue={profile.skills}
          />
        </div>
      </div>

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
      {state?.ok && <p className="text-sm text-green-400">Saved.</p>}

      <button type="submit" disabled={pending} className="btn btn-primary">
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
