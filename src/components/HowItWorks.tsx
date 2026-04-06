"use client";

import React, { useState, useEffect, useRef } from "react";
import { Pill } from "@/components/Pill";

const STEP_DURATION = 3500;

const steps = [
  { n: "01", title: "Bygg upp ditt event", body: "Sätt namn, datum och hur många platser som finns per tidslucka. Du bestämmer reglerna — vi håller ordning på dem." },
  { n: "02", title: "Bädda in på din sajt", body: "Kopiera en rad kod och klistra in var du vill. Bokningsformuläret lever direkt på din hemsida — inga externa sidor, inga omvägar." },
  { n: "03", title: "Hantera allt på ett ställe", body: "Förfrågningar, bekräftelser, gästlistor och kapacitet samlas i din dashboard. Du ser exakt var du står — i realtid." },
];

function ProgressLine({ activeStep, total, duration, source }: { activeStep: number; total: number; duration: number; source: "auto" | "click" }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const isReset = activeStep === 0 && source === "auto";

    if (isReset || source === "click") {
      el.style.transition = "none";
      el.style.height = source === "click" ? `${(activeStep / total) * 100}%` : "0%";
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.style.transition = `height ${duration}ms linear`;
          el.style.height = `${((activeStep + 1) / total) * 100}%`;
        });
      });
    } else {
      el.style.transition = `height ${duration}ms linear`;
      el.style.height = `${((activeStep + 1) / total) * 100}%`;
    }
  }, [activeStep, total, duration, source]);

  return (
    <div className="absolute left-0 top-0 bottom-0 w-px bg-black/[0.07]">
      <div ref={ref} className="absolute left-0 top-0 w-full bg-black" style={{ height: "0%" }} />
    </div>
  );
}

export function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const [stepSource, setStepSource] = useState<"auto" | "click">("auto");

  useEffect(() => {
    const t = setTimeout(() => {
      setStepSource("auto");
      setActiveStep(s => (s + 1) % steps.length);
    }, STEP_DURATION);
    return () => clearTimeout(t);
  }, [activeStep]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">
      <div className="flex flex-col gap-6 md:gap-8 self-start">
        <div className="flex flex-col gap-3 md:gap-4">
          <Pill>För dig som arrangerar</Pill>
          <h2 className="text-2xl md:text-5xl font-semibold tracking-tight leading-tight max-w-xs">
            Från förfrågan till fullbokat.
          </h2>
          <p className="text-sm text-black/45 leading-relaxed">
            Skapa ett event, sätt kapacitet per tidslucka och bädda in formuläret. Resten sköter sig.
          </p>
        </div>
        <div className="relative flex flex-col">
          <ProgressLine activeStep={activeStep} total={steps.length} duration={STEP_DURATION} source={stepSource} />
          {steps.map(({ n, title, body }, i) => (
            <div
              key={n}
              onClick={() => { setStepSource("click"); setActiveStep(i); }}
              className="flex gap-5 pl-5 pt-4 md:pt-5 pb-0 cursor-pointer"
            >
              <div className="flex flex-col gap-1 flex-1">
                <p className={`text-sm font-semibold transition-colors duration-300 ${activeStep === i ? "text-black" : "text-black/30"}`}>{title}</p>
                {activeStep === i && (
                  <p className="text-sm text-black/45 leading-relaxed">{body}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="hidden md:block relative aspect-[3/4] rounded-2xl overflow-hidden">
        <video
          src="/7608989-hd_1080_1920_25fps.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover blur-md scale-110"
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>
    </div>
  );
}
