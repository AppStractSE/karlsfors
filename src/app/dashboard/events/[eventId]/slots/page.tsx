import { notFound } from "next/navigation";
import { events } from "@/data/events";
import { CalendarDays, Clock } from "lucide-react";

const statusConfig: Record<string, { label: string; classes: string; dot: string; bar: string }> = {
  green:  { label: "Tillgänglig", classes: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200", dot: "bg-emerald-500", bar: "bg-emerald-500" },
  yellow: { label: "Begränsad",   classes: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",       dot: "bg-amber-400",  bar: "bg-amber-400"  },
  red:    { label: "Fullbokad",   classes: "bg-red-50 text-red-600 ring-1 ring-red-200",             dot: "bg-red-500",    bar: "bg-red-400"    },
};

export default async function SlotsPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const event = events.find((e) => e.id === eventId);
  if (!event) notFound();

  const available = event.slots.filter((s) => s.status === "green").length;
  const limited   = event.slots.filter((s) => s.status === "yellow").length;
  const full      = event.slots.filter((s) => s.status === "red").length;

  return (
    <div className="w-full">

      {/* Page header */}
      <div className="mb-8">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">Tider</p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {event.name} <span className="text-muted-foreground font-normal">{event.year}</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Konfigurerade bokningsdatum och tidsluckor.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Tillgängliga", value: available, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", dot: "bg-emerald-500" },
          { label: "Begränsade",   value: limited,   color: "text-amber-600",   bg: "bg-amber-50",   border: "border-amber-100",   dot: "bg-amber-400"  },
          { label: "Fullbokade",   value: full,       color: "text-red-600",     bg: "bg-red-50",     border: "border-red-100",     dot: "bg-red-500"    },
        ].map(({ label, value, color, bg, border, dot }) => (
          <div key={label} className="bg-white rounded-2xl border border-border px-5 py-5 flex flex-col gap-3 shadow-sm">
            <div className={`w-3 h-3 rounded-full ${dot}`} />
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
              <p className={`text-2xl font-bold tabular-nums leading-none mt-1 ${color}`}>{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">datum</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-border flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Alla tidsluckor</h2>
          <span className="ml-auto text-xs text-muted-foreground tabular-nums">{event.slots.length} datum</span>
        </div>
        <table className="w-full text-sm table-fixed">
          <colgroup>
            <col className="w-[40%]" />
            <col className="w-[40%]" />
            <col className="w-[20%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {["Datum", "Tider", "Status"].map((h) => (
                <th key={h} className="text-left px-6 py-3 font-semibold text-muted-foreground text-[10px] uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {event.slots.map((slot, i) => {
              const config = statusConfig[slot.status] ?? { label: slot.status, classes: "bg-muted text-muted-foreground", dot: "bg-muted-foreground", bar: "bg-muted-foreground" };
              return (
                <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-foreground">
                      {slot.date.toLocaleDateString("sv-SE", { year: "numeric", month: "long", day: "numeric" })}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 capitalize">
                      {slot.date.toLocaleDateString("sv-SE", { weekday: "long" })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {slot.times.map((t) => (
                        <span key={t} className="inline-flex items-center gap-1 rounded-lg bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground border border-border">
                          <Clock className="w-3 h-3" />{t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.classes}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                      {config.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
