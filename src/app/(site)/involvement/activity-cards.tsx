"use client";

import { useState } from "react";
import ScrollReveal from "@/components/ScrollReveal";
import type { Activity } from "@/lib/types";

const FILTER_LABELS: Record<string, string> = {
  all: "All",
  activities: "Activities",
  projects: "Projects",
};

export function ActivityCards({
  activities,
}: {
  activities: Activity[];
}) {
  const [filter, setFilter] = useState<"all" | "activities" | "projects">("all");

  const filteredActivities = activities.filter((act) => {
    if (filter === "all") return true;
    if (filter === "projects") return act.activity_type === "Project";
    return act.activity_type !== "Project";
  });

  return (
    <section className="mt-16 relative z-10">
      <ScrollReveal className="reveal" delay={150}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold section-head reveal-line">
            Activities & projects
          </h2>
          <div className="flex gap-2">
            {Object.entries(FILTER_LABELS).map(([key, label]) => {
              const f = key as "all" | "activities" | "projects";
              const active = filter === f;
              return (
                <button
                  key={key}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors border ${
                    active
                      ? "bg-accent text-white border-accent"
                      : "border-border text-muted hover:bg-surface hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filteredActivities.map((act, i) => (
            <ScrollReveal
              key={act.id}
              className="card card-lift card-hover p-6 reveal"
              delay={i * 100}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent">
                  {act.activity_type}
                </span>
                <span className="text-xs text-muted">{act.date}</span>
              </div>
              <h3 className="mt-3 font-semibold">{act.title}</h3>
              {act.description && (
                <p className="mt-2 text-sm leading-relaxed text-muted reveal">
                  {act.description}
                </p>
              )}
              {act.link && (
                <a
                  href={act.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-sm text-accent hover:underline"
                >
                  Learn more →
                </a>
              )}
            </ScrollReveal>
          ))}
          {filteredActivities.length === 0 && (
            <p className="text-muted reveal">
              No {FILTER_LABELS[filter].toLowerCase()} added yet.
            </p>
          )}
        </div>
      </ScrollReveal>
    </section>
  );
}
