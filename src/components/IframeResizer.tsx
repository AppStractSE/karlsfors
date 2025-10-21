"use client";

import { useEffect, useRef } from "react";

export default function IframeResizer({ children }: { children: React.ReactNode }) {
  const resizeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!resizeRef.current) return;

    const params = new URLSearchParams(window.location.search);
    const themeParam = params.get("theme");

    if (themeParam) {
      try {
        const decoded = atob(themeParam);
        console.log("[IframeResizer] Decoded theme param:", decoded);
        const styles = decoded
          .split(";")
          .map((line) => line.trim())
          .filter(Boolean);
        console.log("[IframeResizer] Parsed styles:", styles);

        const root = document.documentElement;
        for (const style of styles) {
          const [key, value] = style.split(":").map((s) => s.trim());
          if (key && value) root.style.setProperty(key, value);
        }
        console.info("[IframeResizer] Custom theme applied.");
      } catch (err) {
        console.warn("[IframeResizer] Invalid theme param:", err);
      }
    } else {
      console.info("[IframeResizer] No theme param — using default.");
    }

    const sendHeight = () => {
      const newHeight = resizeRef.current?.clientHeight ?? 0;
      window.parent.postMessage(
        { appstract: true, message: { type: "height", data: newHeight } },
        "*",
      );
    };

    sendHeight(); // Send initial height
    
    // Send "loaded" message
    window.parent.postMessage({ appstract: true, message: { type: "loaded" } }, "*");

    const resizeObserver = new ResizeObserver(sendHeight);
    resizeObserver.observe(resizeRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div ref={resizeRef} className="w-[calc(100%-1px)]">
      {children}
    </div>
  );
}
