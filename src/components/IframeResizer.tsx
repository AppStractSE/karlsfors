"use client";

import { useEffect, useRef } from "react";

export default function IframeResizer({ children }: { children: React.ReactNode }) {
  const resizeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!resizeRef.current) return;

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
