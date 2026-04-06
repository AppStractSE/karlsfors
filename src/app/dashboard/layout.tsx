"use client";

import { events } from "@/data/events";
import {
  BookOpen,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Menu,
  PartyPopper,
  Settings,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [openEvents, setOpenEvents] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(events.map((e) => [e.id, pathname.includes(e.id)])),
  );

  const toggleEvent = (id: string) => setOpenEvents((prev) => ({ ...prev, [id]: !prev[id] }));

  const SidebarInner = ({ onNavigate }: { onNavigate?: () => void }) => (
    <div className="flex h-full">
      {/* Rail — narrow icon column */}
      <div className="w-[52px] shrink-0 bg-[#f0f0f0] border-r border-border flex flex-col items-center py-3 gap-1">
        {/* Logo mark */}
        <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center mb-4 shrink-0">
          <LayoutDashboard className="w-3.5 h-3.5 text-background" />
        </div>

        {(
          [
            { icon: LayoutDashboard, label: "Dashboard", active: pathname === "/dashboard" },
            { icon: PartyPopper, label: "Event", active: pathname.includes("/events/") },
            {
              icon: Settings,
              label: "Inställningar",
              active: pathname.includes("/settings") || pathname.includes("/themes"),
            },
          ] as { icon: React.ElementType; label: string; active: boolean }[]
        ).map(({ icon: Icon, label, active }) => (
          <button
            key={label}
            title={label}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors
              ${active ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:bg-white/70 hover:text-foreground"}`}
          >
            <Icon className="w-4 h-4" />
          </button>
        ))}

        <div className="flex-1" />

        {/* Avatar */}
        <div className="w-7 h-7 rounded-full bg-foreground flex items-center justify-center text-background text-[11px] font-semibold">
          K
        </div>
      </div>

      {/* Panel — text nav, hidden when collapsed */}
      <div
        className={`bg-white border-r border-border flex flex-col overflow-hidden transition-[width,opacity] duration-200 ease-in-out whitespace-nowrap ${collapsed ? "w-0 border-r-0 opacity-0" : "w-[196px] opacity-100"}`}
      >
        {/* App name */}
        <div className="flex items-center px-4 h-14 border-b border-border shrink-0">
          <Link
            href="/dashboard"
            onClick={onNavigate}
            className="font-semibold text-sm text-foreground hover:opacity-70 transition-opacity whitespace-nowrap"
          >
            Karlsfors Gård
          </Link>
        </div>

        {/* Nav sections */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-2 mb-1">
              Översikt
            </p>
            <Link
              href="/dashboard"
              onClick={onNavigate}
              className={`flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] font-medium transition-colors
                  ${pathname === "/dashboard" ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
              Dashboard
            </Link>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-2 mb-1">
              Event
            </p>
            <div className="flex flex-col gap-0.5">
              {events.map((event) => {
                const isExpanded = openEvents[event.id] ?? false;
                const isActive = pathname.includes(event.id);
                const bookingsHref = `/dashboard/events/${event.id}/bookings`;
                const slotsHref = `/dashboard/events/${event.id}/slots`;
                const pendingCount = event.bookings.filter((b) => b.status === "pending").length;

                return (
                  <div key={event.id}>
                    <button
                      onClick={() => toggleEvent(event.id)}
                      className={`w-full flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] font-medium transition-colors
                          ${isActive ? "text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
                    >
                      <PartyPopper className="w-3.5 h-3.5 shrink-0" />
                      <span className="flex-1 text-left truncate">
                        {event.name} {event.year}
                      </span>
                      {pendingCount > 0 && (
                        <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-700 text-[10px] font-semibold flex items-center justify-center leading-none shrink-0">
                          {pendingCount}
                        </span>
                      )}
                      <ChevronDown
                        className={`w-3.5 h-3.5 shrink-0 text-muted-foreground/40 transition-transform duration-150 ${isExpanded ? "rotate-180" : ""}`}
                      />
                    </button>

                    {isExpanded && (
                      <div className="ml-3 pl-3 border-l border-border flex flex-col gap-0.5 mt-0.5 mb-1">
                        <Link
                          href={bookingsHref}
                          onClick={onNavigate}
                          className={`flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] font-medium transition-colors
                              ${pathname === bookingsHref ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
                        >
                          <BookOpen className="w-3.5 h-3.5 shrink-0" />
                          Bokningar
                          {pendingCount > 0 && (
                            <span
                              className={`ml-auto w-4 h-4 rounded-full text-[10px] font-semibold flex items-center justify-center leading-none shrink-0 ${pathname === bookingsHref ? "bg-foreground/10 text-foreground" : "bg-amber-100 text-amber-700"}`}
                            >
                              {pendingCount}
                            </span>
                          )}
                        </Link>
                        <Link
                          href={slotsHref}
                          onClick={onNavigate}
                          className={`flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] font-medium transition-colors
                              ${pathname === slotsHref ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
                        >
                          <CalendarDays className="w-3.5 h-3.5 shrink-0" />
                          Tider
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </nav>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen text-foreground">
      {/* Desktop sidebar */}
      <aside
        className={`relative hidden md:flex shrink-0 h-full transition-[width] duration-200 ease-in-out ${collapsed ? "w-[52px]" : "w-[248px]"}`}
      >
        <SidebarInner />
        <button
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? "Expandera meny" : "Fäll in meny"}
          className="absolute top-[60px] -right-[14px] z-10 w-7 h-7 rounded-full bg-white border border-border shadow-sm flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronRight
            className={`w-3.5 h-3.5 transition-transform duration-200 ${collapsed ? "" : "rotate-180"}`}
          />
        </button>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex transform transition-transform duration-200 ease-in-out md:hidden
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <SidebarInner onNavigate={() => setMobileOpen(false)} />
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-[15px] right-3 p-1 rounded-md hover:bg-accent transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-14 bg-white border-b border-border flex items-center justify-between px-4 md:px-8 shrink-0">
          <button
            className="md:hidden p-1.5 rounded-md hover:bg-accent transition-colors"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          <span className="md:hidden text-sm font-semibold">Karlsfors</span>

          <div className="flex items-center gap-3 ml-auto">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium leading-none">Karlsfors Gård</p>
              <p className="text-xs text-muted-foreground mt-0.5">admin@karlsfors.se</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center text-background text-xs font-semibold shrink-0">
              K
            </div>
            <div className="w-px h-5 bg-border mx-1 hidden sm:block" />
            <button className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <LogOut className="w-3.5 h-3.5" />
              Logga ut
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto overflow-x-hidden bg-[#f6f6f4]">
          {children}
        </main>
      </div>
    </div>
  );
}
