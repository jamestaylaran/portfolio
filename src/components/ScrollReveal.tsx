"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Wraps content and reveals it with a slide-up animation once it enters the
 * viewport. Use it on sections, cards, and lists for a polished scroll effect.
 *
 * `delay` (ms) staggers the reveal when mapping over lists.
 */
export default function ScrollReveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -70px 0px" }
    );
    const el = ref.current;
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal transition-all duration-900 ease-out ${visible ? "visible" : ""} ${className || ""}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
