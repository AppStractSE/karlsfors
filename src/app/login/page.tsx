"use client";

import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

const loginImages = [
  "/login/login.jpeg",
  "/login/login2.jpeg",
  "/login/login3.jpeg",
  "/login/login4.jpeg",
  "/login/login5.jpeg",
];

const loginQuotes = [
  {
    quote: "Varje gäst är ett tillfälle att imponera.",
    sub: "Gästhantering för den som tar varje detalj på allvar.",
  },
  {
    quote: "Fyll varje tillfälle med rätt människor.",
    sub: "Bokningar och gäster samlade på ett ställe.",
  },
  {
    quote: "Gästlistan är halva evenemanget.",
    sub: "Vi ser till att den andra halvan också sitter.",
  },
  {
    quote: "Vi håller koll på gästerna. Du håller koll på stämningen.",
    sub: "Enkelt, samlat och alltid under kontroll.",
  },
  { quote: "Rätt person, rätt bord, rätt tillfälle.", sub: "Gästhantering som faktiskt fungerar." },
  {
    quote: "Inga tomma stolar. Inga missade tillfällen.",
    sub: "Fyll dina event med gäster som längtat efter dem.",
  },
  {
    quote: "Bokningarna sköter sig. Du fokuserar på kvällen.",
    sub: "Så att varje tillfälle blir det bästa hittills.",
  },
];

export default function LoginPage() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    setCurrentIdx(Math.floor(Math.random() * loginImages.length));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((i) => (i + 1) % loginImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="login-page relative flex items-center justify-center px-4 py-16">
      <div className="fixed inset-0 -z-10">
        {loginImages.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt=""
            fill
            className={`object-cover transition-opacity duration-700 ease-in-out ${i === currentIdx ? "opacity-100" : "opacity-0"}`}
            priority={i === 0}
          />
        ))}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      </div>
      <div className="relative z-10 w-full max-w-[460px] md:max-w-[960px] rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-[1fr_420px] xl:grid-cols-[1fr_460px] md:min-h-[680px]">
        <div className="bg-white flex flex-col justify-between gap-8 px-6 py-8 md:px-14 md:py-14">
          <div className="flex items-center gap-2.5 justify-center md:justify-start">
            <div className="w-7 h-7 rounded-lg bg-foreground flex items-center justify-center shrink-0">
              <span className="text-background text-[11px] font-bold">T</span>
            </div>
            <span className="text-foreground font-bold text-sm tracking-[0.1em] uppercase">Tillfälle</span>
          </div>
          <div className="w-full max-w-[360px] flex flex-col gap-6 md:gap-10 mx-auto md:mx-0">
            <div className="flex flex-col gap-3">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Välkommen!</h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Logga in för att hantera dina event och bokningar.
              </p>
            </div>
            <div className="flex flex-col gap-3 md:gap-4">
              <button
                type="button"
                onClick={() => console.log("Google SSO")}
                className="cursor-pointer relative w-full flex items-center justify-center rounded-2xl border border-border bg-[#fafafa] px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/50 hover:border-foreground/20 transition-colors"
              >
                <svg className="w-4 h-4 shrink-0 absolute left-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Fortsätt med Google
              </button>
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-border" />
                <span className="text-[11px] font-medium text-muted-foreground/50 uppercase tracking-widest">eller</span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  window.location.href = "/dashboard";
                }}
                className="flex flex-col gap-3"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E-postadress"
                  autoComplete="email"
                  required
                  className="w-full rounded-2xl border border-foreground/15 bg-[#fafafa] px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-foreground/10 focus:border-foreground/40 focus:bg-white transition-colors"
                />
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Lösenord"
                    autoComplete="current-password"
                    required
                    className="w-full rounded-2xl border border-border bg-[#fafafa] px-4 py-3 pr-11 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/10 focus:border-foreground/30 focus:bg-white transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer text-left"
                >
                  Glömt lösenord?
                </button>
                <button
                  type="submit"
                  className="mt-4 cursor-pointer w-full flex items-center justify-center rounded-2xl bg-foreground text-background text-sm font-semibold px-4 py-3 hover:bg-foreground/85 transition-colors"
                >
                  Logga in
                </button>
              </form>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center md:text-left">
            Har du inget konto?{" "}
            <button type="button" className="cursor-pointer font-semibold text-foreground hover:underline">
              Kontakta oss
            </button>
          </p>
        </div>
        <div className="hidden md:block relative bg-neutral-900 overflow-hidden">
          {loginImages.map((src, i) => (
            <Image
              key={src}
              src={src}
              alt=""
              fill
              className={`object-cover transition-opacity duration-700 ease-in-out ${i === currentIdx ? "opacity-100" : "opacity-0"}`}
              priority={i === 0}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-6 left-5 right-5 flex flex-col gap-3">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-4">
              <p className="text-white font-semibold text-sm leading-snug">
                {loginQuotes[currentIdx % loginQuotes.length].quote}
              </p>
              <p className="text-white/60 text-xs leading-relaxed mt-1.5">
                {loginQuotes[currentIdx % loginQuotes.length].sub}
              </p>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              {loginImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIdx(i)}
                  className={`cursor-pointer rounded-full transition-all duration-300 ${i === currentIdx ? "w-5 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/40 hover:bg-white/70"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
