"use client";

import { useEffect } from "react";

export default function KeyboardNav() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input/textarea
      const tag = (e.target as HTMLElement).tagName;
      const isInput = tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement).isContentEditable;

      if (e.key === "Escape") {
        history.back();
        return;
      }

      if (e.key === "/" && !isInput) {
        e.preventDefault();
        // Try to focus the homepage search input
        const input = document.getElementById("homepage-search")?.querySelector("input");
        if (input) {
          input.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return null;
}
