"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Pill } from "@/components/Pill";

const faqs = [
  { q: "Hur bäddar jag in bokningsformuläret?", a: "Du klistrar in en enda rad kod. Formuläret anpassar sig automatiskt till din design via ett tema-API." },
  { q: "Kan jag ha flera event aktiva samtidigt?", a: "Ja. Obegränsat antal event, var och ett med egna dagar, tidsluckor och kapacitet." },
  { q: "Hur fungerar kapacitetskontrollen?", a: "Varje tidslucka har ett maxantal gäster. Tillfälle räknar automatiskt och varnar när det börjar bli fullt." },
  { q: "Kan jag flytta en bokning?", a: "Ja, direkt från bokningspanelen. Välj nytt datum och tid. Gästen behöver inte göra något." },
  { q: "Passar Tillfälle bara för restauranger?", a: "Nej. Från gårdar och konferenslokaler till gallerier och kulturscener." },
];

export function FaqSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 md:gap-16 max-w-4xl">
      <div className="flex flex-col gap-3 md:gap-4">
        <Pill>FAQ</Pill>
        <h2 className="text-xl font-semibold tracking-tight">Vanliga frågor.</h2>
      </div>
      <div className="divide-y divide-black/[0.07]">
        {faqs.map((faq, i) => (
          <div key={i} className="py-4">
            <button
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              className="w-full flex items-center justify-between gap-6 text-left cursor-pointer"
            >
              <span className="text-sm font-medium">{faq.q}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-black/25 shrink-0 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`} />
            </button>
            {openFaq === i && (
              <p className="mt-3 text-sm text-black/45 leading-relaxed max-w-lg">{faq.a}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
