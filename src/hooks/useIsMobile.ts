import { useState, useEffect } from "react";

/**
 * P2: Shared hook for mobile detection.
 * Consolidates the multiple independent resize listeners that were scattered
 * across components into a single, reusable hook.
 */
export function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < breakpoint);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [breakpoint]);

  return isMobile;
}
