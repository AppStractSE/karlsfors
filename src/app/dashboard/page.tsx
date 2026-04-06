"use client";

import Link from "next/link";
import { events } from "@/data/events";
import { CalendarDays, Users, HourglassIcon, CheckCircle2, ArrowUpRight, Plus, PartyPopper } from "lucide-react";

export default function DashboardPage() {
  const totalPending = events.reduce((s, e) => s + e.bookings.filter((b) => b.status === "pending").length, 0);
  const totalGuests  = events.reduce((s, e) => s + e.bookings.filter((b) => b.status === "accepted").reduce((g, b) => g + b.guests, 0), 0);

  return (
    <div className="w-full">

      {/* Page header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">Översikt</p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Event</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-sm text-muted-foreground">{events.length} aktiva event</span>
            {totalPending > 0 && (
              <>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span className="text-sm font-semibold text-amber-600">{totalPending} obesvarade</span>
              </>
            )}
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className="text-sm text-muted-foreground">{totalGuests} bekräftade gäster totalt</span>
          </div>
        </div>
        <button
          onClick={() => console.log("Skapa nytt event")}
          className="cursor-pointer shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-foreground text-background px-4 py-2.5 text-sm font-medium hover:bg-foreground/85 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Skapa event
        </button>
      </div>

      {/* Event cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {events.map((event) => {
          const pending  = event.bookings.filter((b) => b.status === "pending").length;
          const accepted = event.bookings.filter((b) => b.status === "accepted").length;
          const denied   = event.bookings.filter((b) => b.status === "denied").length;
          const guests   = event.bookings.filter((b) => b.status === "accepted").reduce((s, b) => s + b.guests, 0);
          const days     = event.slots.length;
          const totalSlotCapacity = event.slots.reduce((s, sl) => s + sl.times.length * event.capacity, 0);
          const fillPct  = totalSlotCapacity > 0 ? Math.min(Math.round((guests / totalSlotCapacity) * 100), 100) : 0;
          const nearFull = fillPct >= 80;
          const barColor = fillPct >= 100 ? "bg-red-400" : nearFull ? "bg-amber-400" : "bg-emerald-500";

          return (
            <Link
              key={event.id}
              href={`/dashboard/events/${event.id}/bookings`}
              className="group bg-white rounded-2xl border border-border/70 shadow-sm hover:shadow-lg hover:border-border hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col"
            >
              {/* Card header */}
              <div className="px-6 pt-6 pb-4">
                <div className="flex items-start justify-between gap-3 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-foreground/5 border border-foreground/10 flex items-center justify-center shrink-0">
                      <PartyPopper className="w-4 h-4 text-foreground/70" />
                    </div>
                    <div>
                      <h2 className="font-bold text-base leading-tight text-foreground">{event.name}</h2>
                      <p className="text-xs text-muted-foreground mt-0.5">{event.year}</p>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-2 mt-0.5">
                    {pending > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200 text-[11px] font-semibold px-2 py-0.5">
                        <HourglassIcon className="w-3 h-3" />{pending}
                      </span>
                    )}
                    <span className="w-7 h-7 rounded-lg border border-border bg-muted/30 flex items-center justify-center text-muted-foreground group-hover:text-foreground group-hover:border-foreground/20 transition-colors">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2 mb-5">
                  <div className="flex flex-col gap-0.5 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
                    <span className="text-[10px] font-semibold text-amber-600 uppercase tracking-wide">Obesvarad</span>
                    <span className="text-xl font-bold tabular-nums text-foreground leading-none">{pending}</span>
                  </div>
                  <div className="flex flex-col gap-0.5 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2.5">
                    <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wide">Bokade</span>
                    <span className="text-xl font-bold tabular-nums text-foreground leading-none">{accepted}</span>
                  </div>
                  <div className="flex flex-col gap-0.5 bg-muted/40 border border-border rounded-xl px-3 py-2.5">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Nekade</span>
                    <span className="text-xl font-bold tabular-nums text-foreground leading-none">{denied}</span>
                  </div>
                </div>

                {/* Guest + capacity line */}
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    <span className="font-semibold text-foreground tabular-nums">{guests}</span> bekr. gäster
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5" />
                    {days} dag{days !== 1 ? "ar" : ""}
                    <span className="text-border">·</span>
                    {event.capacity} platser/tillfälle
                  </span>
                </div>

                {/* Fill bar */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Beläggning</span>
                    <span className={`text-xs font-bold tabular-nums ${fillPct >= 80 ? "text-amber-600" : "text-emerald-600"}`}>{fillPct}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                      style={{ width: `${fillPct}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Card footer */}
              <div className="px-6 py-3 bg-muted/20 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {event.slots[0]?.date.toLocaleDateString("sv-SE", { day: "numeric", month: "short" })}
                  {event.slots.length > 1 && (
                    <> – {event.slots[event.slots.length - 1]?.date.toLocaleDateString("sv-SE", { day: "numeric", month: "short" })}</>
                  )}
                </span>
                <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">Hantera →</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
