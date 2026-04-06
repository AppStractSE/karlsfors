"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Pill } from "@/components/Pill";
import { HowItWorks } from "@/components/HowItWorks";
import { FaqSection } from "@/components/FaqSection";

const CONTAINER = "max-w-[1680px] mx-auto px-4 md:px-6";
const SECTION_PY = "py-12 md:py-36";
const H2 = "text-2xl md:text-5xl font-semibold tracking-tight leading-tight";
const BODY = "text-sm text-black/45 leading-relaxed";

const navLinks = ["Funktioner", "Hur det fungerar", "FAQ"];
const navHrefs = ["#features", "#how", "#faq"];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="bg-white text-black" style={{ fontFamily: "var(--font-geist-sans), system-ui, sans-serif" }}>

      <div className="flex items-center justify-center gap-2 px-4 py-2.5 border-b border-black/[0.07] text-xs bg-white">
        <span className="font-semibold">Nyhet:</span>
        <span className="text-black/50">Tillfälle lanserar kapacitetskontroll i realtid</span>
        <span className="text-black/30">→</span>
      </div>

      <nav className={`fixed inset-x-0 z-50 transition-all duration-300 ${scrolled ? "top-0 md:top-2" : "top-0 md:top-12"}`}>
        <div className="flex items-center justify-between px-6 md:px-10 h-14 bg-white md:bg-transparent shadow-sm md:shadow-none">
          <span className="text-base font-semibold tracking-tight">Tillfälle</span>
          <div className="hidden md:flex items-center gap-1 bg-white/60 backdrop-blur-md border border-black/[0.08] rounded-full px-1 py-1">
            {navLinks.map((l, i) => (
              <a key={l} href={navHrefs[i]} className="text-sm font-medium text-black/80 hover:text-black hover:bg-white transition-colors px-4 py-1.5 rounded-full">{l}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-xs font-semibold bg-black text-white px-5 py-2 rounded-lg hover:bg-black/80 transition-colors">
              Logga in
            </Link>
            <button onClick={() => setMenuOpen(o => !o)} className="md:hidden flex flex-col gap-1.5 w-6 items-end" aria-label="Meny">
              <span className={`block h-px bg-black transition-all duration-200 ${menuOpen ? "w-6 rotate-45 translate-y-2" : "w-6"}`} />
              <span className={`block h-px bg-black transition-all duration-200 ${menuOpen ? "opacity-0" : "w-4"}`} />
              <span className={`block h-px bg-black transition-all duration-200 ${menuOpen ? "w-6 -rotate-45 -translate-y-2" : "w-6"}`} />
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-black/[0.07] px-6 py-2 flex flex-col">
            {navLinks.map((l, i) => (
              <a key={l} href={navHrefs[i]} onClick={() => setMenuOpen(false)} className="text-sm font-medium text-black/70 hover:text-black py-3 border-b border-black/[0.06] last:border-0">{l}</a>
            ))}
          </div>
        )}
      </nav>

      <section className="relative flex flex-col min-h-[calc(100vh-40px)] overflow-hidden">
        <Image src="/login/login.jpeg" alt="" fill className="object-cover object-center opacity-55 scale-105" style={{ filter: "blur(8px)" }} priority />
        <div className="absolute inset-0 bg-white/40 md:hidden" />
        <div className="absolute bottom-0 left-0 right-0 h-60 bg-gradient-to-t from-white to-transparent z-10" />

        <div className="relative z-20 flex flex-col items-center justify-center text-center px-6 flex-1 gap-5 pt-[100px] md:pt-[150px]">
          <div className="flex flex-col items-center gap-3">
            <h1 className="text-3xl md:text-6xl font-semibold leading-tight tracking-tight max-w-xl">
              Bokningar som faktiskt fungerar.
            </h1>
            <p className="text-sm md:text-lg text-black/60 max-w-xs md:max-w-sm leading-relaxed">
              Ta emot bokningar, styr kapaciteten och håll koll på gästerna. Direkt på din sajt.
            </p>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <Link href="/login" className="text-xs md:text-sm font-semibold bg-black text-white px-5 py-2.5 md:px-7 md:py-3.5 rounded-xl hover:bg-black/80 transition-colors">
              Skapa ditt tillfälle
            </Link>
            <p className="text-xxs text-black/30">Ingen bindningstid.</p>
          </div>
        </div>

        <div className="relative z-20 flex flex-col items-center gap-5 pb-8 pt-6">
          <p className="text-xs md:text-sm font-medium text-black/35 text-center">Används av venues som bryr sig om detaljerna</p>
          <div className="max-w-xs md:max-w-4xl mx-auto px-6 grid grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-4 md:gap-x-8 md:gap-y-6 items-center justify-items-center w-full">
            <svg className="w-full max-w-[100px] md:max-w-[180px] h-auto" viewBox="0 0 120 16" fill="none"><text x="0" y="13" fontFamily="Georgia, serif" fontSize="13" fill="black" fillOpacity="0.45" letterSpacing="2">FOTOGRAFISKA</text></svg>
            <svg className="w-full max-w-[50px] md:max-w-[80px] h-auto" viewBox="0 0 55 22" fill="none"><text x="0" y="17" fontFamily="Georgia, serif" fontSize="18" fontStyle="italic" fill="black" fillOpacity="0.45">Berns</text></svg>
            <svg className="w-full max-w-[90px] md:max-w-[150px] h-auto" viewBox="0 0 105 18" fill="none"><rect x="0" y="3" width="11" height="11" fill="black" fillOpacity="0.35"/><text x="15" y="14" fontFamily="Arial, sans-serif" fontSize="12" fontWeight="700" fill="black" fillOpacity="0.45" letterSpacing="0.5">RIVAL HOTEL</text></svg>
            <svg className="w-full max-w-[80px] md:max-w-[130px] h-auto" viewBox="0 0 90 18" fill="none"><text x="0" y="14" fontFamily="Arial, sans-serif" fontSize="12" fontWeight="300" fill="black" fillOpacity="0.45" letterSpacing="3">ARTIPELAG</text></svg>
            <svg className="w-full max-w-[80px] md:max-w-[130px] h-auto" viewBox="0 0 85 20" fill="none"><text x="0" y="15" fontFamily="Georgia, serif" fontSize="14" fill="black" fillOpacity="0.45" letterSpacing="1">Trädgårn</text></svg>
            <svg className="w-full max-w-[90px] md:max-w-[160px] h-auto" viewBox="0 0 115 16" fill="none"><text x="0" y="12" fontFamily="Arial, sans-serif" fontSize="10" fontWeight="600" fill="black" fillOpacity="0.45" letterSpacing="2.5">SPRITMUSEUM</text></svg>
            <div className="md:hidden col-span-3 flex justify-center gap-8 w-full">
              <svg className="max-w-[55px] h-auto" viewBox="0 0 65 22" fill="none"><text x="0" y="17" fontFamily="Georgia, serif" fontSize="17" fontStyle="italic" fill="black" fillOpacity="0.45">Landet</text></svg>
              <svg className="max-w-[110px] h-auto" viewBox="0 0 120 16" fill="none"><text x="0" y="12" fontFamily="Arial, sans-serif" fontSize="10" fontWeight="300" fill="black" fillOpacity="0.45" letterSpacing="2.5">VILLA GODTHEM</text></svg>
            </div>
            <svg className="hidden md:block w-full max-w-[100px] h-auto" viewBox="0 0 65 22" fill="none"><text x="0" y="17" fontFamily="Georgia, serif" fontSize="17" fontStyle="italic" fill="black" fillOpacity="0.45">Landet</text></svg>
            <svg className="hidden md:block w-full max-w-[180px] h-auto" viewBox="0 0 120 16" fill="none"><text x="0" y="12" fontFamily="Arial, sans-serif" fontSize="10" fontWeight="300" fill="black" fillOpacity="0.45" letterSpacing="2.5">VILLA GODTHEM</text></svg>
          </div>
        </div>
      </section>

      <section>
        <div className={`${CONTAINER} pt-4 md:pt-8`}>
          <div className="relative w-full aspect-video md:h-[56vw] md:aspect-auto min-h-[200px] max-h-[760px] rounded-2xl overflow-hidden">
            <Image src="/login/login.jpeg" alt="" fill className="object-cover" />
            <div className="absolute inset-0 bg-black/25" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors">
                <div className="w-0 h-0 ml-1" style={{ borderTop: "8px solid transparent", borderBottom: "8px solid transparent", borderLeft: "13px solid white" }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className={`${CONTAINER} ${SECTION_PY}`}>
          <div className="flex flex-col gap-12 md:gap-32">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 items-start">
              <div>
                <Pill>Varför Tillfälle</Pill>
              </div>
              <p className="md:col-span-2 text-xl md:text-3xl lg:text-4xl font-semibold tracking-tight leading-tight text-balance">
                Tillfälle låter dig ta emot bokningar direkt på din hemsida, styra kapaciteten per tidslucka och hantera alla gäster från en och samma dashboard. Bädda in formuläret med en rad kod. Resten sköter sig.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-8">
              {[
                { value: "1 rad", label: "kod för att bädda in", desc: "Formuläret lever direkt på din sajt utan omdirigering." },
                { value: "100%", label: "översikt i realtid", desc: "Se kapacitet, bokningar och gäster live från dashboarden." },
                { value: "0 kr", label: "extra friktion för gästen", desc: "Gästen bokar direkt på din hemsida, utan extra steg eller omdirigering." },
              ].map(({ value, label, desc }) => (
                <div key={label} className="flex flex-col gap-2">
                  <p className="text-5xl md:text-7xl font-medium tracking-tight leading-none">{value}</p>
                  <p className="text-sm font-semibold">{label}</p>
                  <p className={BODY}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className={`${CONTAINER} ${SECTION_PY}`}>
          <div className="flex flex-col gap-12">
            <div className="relative flex items-center justify-center h-[300px] md:h-[500px] select-none">
              {[
                { src: "/login/login.jpeg",  deg: -12, x: "-220px", y: "30px",  z: "z-10", scale: 0.82 },
                { src: "/login/login2.jpeg", deg:  -6, x: "-110px", y: "12px",  z: "z-20", scale: 0.91 },
                { src: "/login/login4.jpeg", deg:   0, x: "0px",    y: "0px",   z: "z-30", scale: 1.08 },
                { src: "/login/login3.jpeg", deg:   6, x: "110px",  y: "12px",  z: "z-20", scale: 0.91 },
                { src: "/login/login5.jpeg", deg:  12, x: "220px",  y: "30px",  z: "z-10", scale: 0.82 },
              ].map(({ src, deg, x, y, z, scale }, i) => (
                <div
                  key={i}
                  className={`absolute w-[160px] md:w-[200px] aspect-[3/4] rounded-2xl overflow-hidden shadow-lg ${z}`}
                  style={{ top: "50%", transform: `translateX(${x}) translateY(calc(-40% + ${y})) rotate(${deg}deg) scale(${scale})` }}
                >
                  <Image src={src} alt="" fill className="object-cover" />
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center text-center gap-3 md:gap-4">
              <Pill>Personalisering</Pill>
              <h2 className={`${H2} max-w-lg`}>
                Ditt varumärke.<br />Din stil. Ditt formulär.
              </h2>
              <p className={`${BODY} max-w-xs md:max-w-sm`}>
                Skicka in ditt tema och formuläret anpassar sig automatiskt till din design. Inga kompromisser med ditt varumärke.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="features">
        <div className={`${CONTAINER} ${SECTION_PY}`}>
          <div className="flex flex-col gap-8 md:gap-16">
            <div className="flex flex-col items-center text-center gap-3 md:gap-4">
              <Pill>Så här funkar det</Pill>
              <h2 className={`${H2} max-w-lg`}>
                Allt du behöver.<br />Inget du inte behöver.
              </h2>
              <p className={`${BODY} max-w-xs md:max-w-sm`}>
                Tre funktioner som gör hela skillnaden från förfrågan till bekräftad gäst.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
              {[
                { src: "/login/login2.jpeg", title: "Bokningshantering", desc: "Acceptera, neka och flytta bokningar direkt. All gästinfo samlad på ett ställe." },
                { src: "/login/login5.jpeg", title: "Kapacitetskontroll", desc: "Sätt exakt antal platser per tidslucka. Systemet räknar och flaggar i realtid." },
                { src: "/login/login3.jpeg", title: "Inbäddat på din sajt", desc: "En rad kod. Formuläret lever direkt på din hemsida utan omdirigering." },
              ].map(({ src, title, desc }) => (
                <div key={title} className="flex flex-col gap-3">
                  <div className="relative w-full aspect-[4/3] md:aspect-[4/5] rounded-2xl overflow-hidden">
                    <Image src={src} alt={title} fill className="object-cover" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-semibold">{title}</p>
                    <p className={BODY}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className={`${CONTAINER} ${SECTION_PY}`}>
          <div className="flex flex-col gap-8 md:gap-16">
            <h2 className={`${H2} text-center`}>
              Allt du behöver för<br />en perfekt kväll.
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              {[
                { icon: "⊹", title: "Bokningsformulär", desc: "Bädda in direkt på din hemsida med en rad kod. Gästen lämnar aldrig din sajt.", tags: ["Inbäddning", "Tema-API"] },
                { icon: "◎", title: "Kapacitetskontroll", desc: "Sätt maxantal per tidslucka. Systemet räknar och flaggar automatiskt.", tags: ["Realtid", "Tidsluckor"] },
                { icon: "⊞", title: "Gästhantering", desc: "All gästinfo samlad. Interna noteringar och kommunikation för hela teamet.", tags: ["Dashboard", "Noteringar"] },
                { icon: "⟳", title: "Flytta bokningar", desc: "Flytta en gäst till annan tidslucka direkt från panelen. Gästen behöver inte göra något.", tags: ["Dashboard", "Bokningar"] },
                { icon: "⬡", title: "Flera event", desc: "Obegränsat antal aktiva event. Var och ett med egna dagar, tider och kapacitet.", tags: ["Event", "Kapacitet"] },
                { icon: "◈", title: "Tema & design", desc: "Skicka in ditt tema. Formuläret anpassar sig automatiskt till ditt varumärke.", tags: ["Personalisering", "Tema-API"] },
              ].map(({ icon, title, desc, tags }) => (
                <div key={title} className="bg-[#f7f7f7] rounded-2xl p-5 md:p-8 flex flex-col gap-6 md:gap-8">
                  <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-white border border-black/[0.07] flex items-center justify-center text-sm md:text-base shadow-sm shrink-0">
                    {icon}
                  </div>
                  <div className="flex flex-col gap-1.5 flex-1">
                    <p className="text-sm font-semibold">{title}</p>
                    <p className={BODY}>{desc}</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {tags.map(tag => (
                      <span key={tag} className="text-xs text-black/35 bg-white border border-black/[0.07] rounded-full px-3 py-1">{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className={`${CONTAINER} ${SECTION_PY}`}>
          <div className="flex flex-col gap-8 md:gap-16">
            <div className="flex flex-col items-center text-center gap-3 md:gap-4">
              <Pill>Dashboarden</Pill>
              <h2 className={`${H2} max-w-lg`}>
                Allt du behöver.<br />Samlat på ett ställe.
              </h2>
              <p className={`${BODY} max-w-xs md:max-w-sm`}>
                Från inkommande förfrågan till bekräftad gäst utan ett enda extra verktyg.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {[
                { src: "/login/login2.jpeg", title: "Bokningshantering i realtid", desc: "Acceptera, neka och flytta bokningar direkt från dashboarden." },
                { src: "/login/login5.jpeg", title: "Kapacitetskontroll per tidslucka", desc: "Sätt maxantal per tillfälle. Systemet räknar och flaggar i realtid." },
              ].map(({ src, title, desc }) => (
                <div key={title} className="flex flex-col gap-3">
                  <div className="relative rounded-2xl overflow-hidden aspect-[4/3] md:aspect-[4/5]">
                    <Image src={src} alt={title} fill className="object-cover" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-semibold">{title}</p>
                    <p className={BODY}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="how">
        <div className={`${CONTAINER} ${SECTION_PY}`}>
          <HowItWorks />
        </div>
      </section>

      <section id="faq">
        <div className={`${CONTAINER} ${SECTION_PY} border-t border-black/[0.07]`}>
          <FaqSection />
        </div>
      </section>

      <section className="bg-black overflow-hidden">
        <div className={`${CONTAINER} pt-12 md:pt-24 pb-8 md:pb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4 md:gap-6`}>
          <p className="text-xs uppercase tracking-widest text-white/20">Kom igång</p>
          <div className="flex flex-col gap-3 md:gap-4 md:items-end">
            <p className="text-xs text-white/25 max-w-[200px] leading-relaxed md:text-right">
              Från första förfrågan till bekräftad gäst. Utan krångel.
            </p>
            <Link href="/login" className="self-start md:self-auto text-xs font-semibold text-white/60 hover:text-white transition-colors underline underline-offset-2">
              Logga in
            </Link>
          </div>
        </div>
        <p className={`${CONTAINER} font-bold leading-none tracking-tight text-white/[0.07] select-none whitespace-nowrap pb-0`}
          style={{ fontSize: "clamp(48px, 19.5vw, 280px)" }}>
          Tillfälle.
        </p>
      </section>

      <footer className="bg-black border-t border-white/[0.06]">
        <div className={`${CONTAINER} pt-10 pb-8`}>
          <div className="flex flex-col md:flex-row md:justify-between gap-8 md:gap-10 pb-8 border-b border-white/[0.06]">
            <div className="flex flex-col gap-3">
              <span className="text-xs font-semibold tracking-widest uppercase text-white">Tillfälle</span>
              <p className="text-xs text-white/20 leading-relaxed max-w-[160px]">Gästhantering för venues som tar varje detalj på allvar.</p>
              <a href="mailto:hej@tillfalle.se" className="text-xs text-white/20 hover:text-white transition-colors">hej@tillfalle.se</a>
            </div>
            <div className="grid grid-cols-2 md:flex md:gap-16 gap-6">
              {[
                { heading: "Plattform", links: ["Dashboard", "Bokningsformulär", "Kapacitetskontroll", "Teman"] },
                { heading: "Användningsfall", links: ["Restauranger", "Gårdar & venues", "Konferenslokaler", "Kulturscener"] },
                { heading: "Företag", links: ["Om oss", "Kontakt", "Integritetspolicy"] },
              ].map(({ heading, links }) => (
                <div key={heading} className="flex flex-col gap-3">
                  <p className="text-xs font-semibold uppercase tracking-widest text-white/15">{heading}</p>
                  <div className="flex flex-col gap-2">
                    {links.map((l) => (
                      <a key={l} href="#" className="text-xs text-white/20 hover:text-white transition-colors">{l}</a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <p className="text-xs text-white/15">© {new Date().getFullYear()} Tillfälle. Alla rättigheter förbehållna.</p>
            <div className="flex items-center gap-4 md:gap-5">
              {["Integritetspolicy", "Användarvillkor", "Cookies"].map((l) => (
                <a key={l} href="#" className="text-xs text-white/15 hover:text-white/40 transition-colors">{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
