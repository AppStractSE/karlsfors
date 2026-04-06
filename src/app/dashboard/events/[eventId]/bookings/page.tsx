"use client";

import { Button } from "@/components/ui/button";
import { events, type Booking, type BookingComment } from "@/data/events";
import {
  AlertTriangle,
  ArrowDown,
  ArrowRightLeft,
  ArrowUp,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  ChevronDown,
  ChevronsUpDown,
  Clock,
  Download,
  Filter,
  HourglassIcon,
  Lock,
  LockOpen,
  Mail,
  MessageSquare,
  Phone,
  Search,
  Send,
  TrendingUp,
  X,
  XCircle,
} from "lucide-react";

import { notFound } from "next/navigation";
import React, { use, useState } from "react";

function exportCSV(bookings: Booking[], filename: string) {
  const headers = ["Namn", "Verksamhet", "E-post", "Telefon", "Datum", "Tid", "Gäster", "Status"];
  const rows = bookings.map((b) => [b.name, b.business, b.email, b.phone, b.date, b.time, b.guests, b.status]);
  const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename + ".csv";
  a.click();
  URL.revokeObjectURL(url);
}

type BookingStatus = "pending" | "accepted" | "denied";
type FilterStatus = "all" | BookingStatus;
type GlobalSortKey = "date" | "guests";
type SortKey = "name" | "business" | "guests" | "status";
type SortDir = "asc" | "desc";

const GUEST_MAX_RANGE = 200;

const GLOBAL_SORT_OPTIONS: { value: GlobalSortKey; label: string }[] = [
  { value: "date",   label: "Datum"   },
  { value: "guests", label: "Gäster"  },
];

const statusConfig: Record<BookingStatus, { label: string; pill: string; icon: React.ElementType }> = {
  pending:  { label: "Obesvarad",   pill: "bg-amber-50 text-amber-600 border border-amber-200",       icon: HourglassIcon },
  accepted: { label: "Accepterad", pill: "bg-emerald-50 text-emerald-700 border border-emerald-200", icon: CheckCircle2  },
  denied:   { label: "Nekad",      pill: "bg-red-50 text-red-500 border border-red-200",             icon: XCircle       },
};

const FILTER_OPTIONS: { value: FilterStatus; label: string }[] = [
  { value: "all",      label: "Alla"         },
  { value: "pending",  label: "Obesvarad"    },
  { value: "accepted", label: "Accepterade"  },
  { value: "denied",   label: "Nekade"       },
];

const MONTHS_SV   = ["Jan","Feb","Mar","Apr","Maj","Jun","Jul","Aug","Sep","Okt","Nov","Dec"];
const WEEKDAYS_SV = ["Mån","Tis","Ons","Tor","Fre","Lör","Sön"];

export default function BookingsPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);
  const event = events.find((e) => e.id === eventId);
  if (!event) notFound();

  const [bookings, setBookings]         = useState<Booking[]>(event.bookings);
  const [filter, setFilter]             = useState<FilterStatus>("all");
  const [expanded, setExpanded]         = useState<Record<string, boolean>>({});
  const [selectedId, setSelectedId]     = useState<string | null>(null);
  const [closedSlots, setClosedSlots]   = useState<Record<string, boolean>>({});
  const [scrolledToBottom, setScrolledToBottom] = useState<Record<string, boolean>>({});
  const [showClosed, setShowClosed]     = useState(true);
  const [sortKey, setSortKey]           = useState<Record<string, SortKey>>({});
  const [sortDir, setSortDir]           = useState<Record<string, SortDir>>({});
  const [search, setSearch]             = useState("");
  const [guestMin, setGuestMin]         = useState(0);
  const [guestMax, setGuestMax]         = useState(GUEST_MAX_RANGE);
  const [globalSortKey, setGlobalSortKey] = useState<GlobalSortKey>("date");
  const [globalSortDir, setGlobalSortDir] = useState<SortDir>("asc");
  const [filterDate, setFilterDate]     = useState<string | null>(null);
  const [comments, setComments]         = useState<Record<string, BookingComment[]>>(
    () => Object.fromEntries(event.bookings.map((b) => [b.id, b.comments ?? []]))
  );
  const [filterOpen, setFilterOpen]     = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [moveMode, setMoveMode]         = useState(false);
  const [moveDate, setMoveDate]         = useState<string>("");
  const [moveTime, setMoveTime]         = useState<string>("");
  const [showPendingSection, setShowPendingSection] = useState(false);
  const [rightColCollapsed, setRightColCollapsed] = useState(false);
  const [filterType, setFilterType]     = useState<"all" | "private" | "business">("all");
  const [newComment, setNewComment]     = useState("");
  const [calMonth, setCalMonth]         = useState<Date>(() => {
    const first = event.slots[0]?.date;
    return first ? new Date(first.getFullYear(), first.getMonth(), 1) : new Date();
  });
  const [calSelectedDate, setCalSelectedDate] = useState<string | null>(null);
  const dateRefs = React.useRef<Record<string, HTMLDivElement | null>>({});

  const handleSort = (key: string, col: SortKey) => {
    setSortKey((prev) => ({ ...prev, [key]: col }));
    setSortDir((prev) => ({
      ...prev,
      [key]: prev[key] === "asc" && sortKey[key] === col ? "desc" : "asc",
    }));
  };

  const sortBookings = (rows: Booking[], key: string) => {
    const col = sortKey[key];
    const dir = sortDir[key] ?? "asc";
    if (!col) return rows;
    return [...rows].sort((a, b) => {
      const av = col === "guests" ? a.guests : col === "status" ? a.status : col === "name" ? a.name : a.business;
      const bv = col === "guests" ? b.guests : col === "status" ? b.status : col === "name" ? b.name : b.business;
      if (av < bv) return dir === "asc" ? -1 : 1;
      if (av > bv) return dir === "asc" ? 1 : -1;
      return 0;
    });
  };

  const slotKey        = (date: string, time: string) => `${date}|${time}`;
  const toggleExpanded = (key: string) => setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  const selectedBooking = bookings.find((b) => b.id === selectedId) ?? null;

  React.useEffect(() => {
    if (selectedBooking) setTimeout(() => setDrawerVisible(true), 10);
    else setDrawerVisible(false);
  }, [selectedBooking]);

  const toggleClosedSlot = (date: string, time: string) =>
    setClosedSlots((prev) => ({ ...prev, [slotKey(date, time)]: !prev[slotKey(date, time)] }));
  const isDayClosed = (date: string, times: string[]) =>
    times.length > 0 && times.every((t) => closedSlots[slotKey(date, t)]);

  const updateStatus = (id: string, status: BookingStatus) =>
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));

  // Stats (always from full bookings list)
  const totalPending  = bookings.filter((b) => b.status === "pending").length;
  const totalAccepted = bookings.filter((b) => b.status === "accepted").length;
  const totalDenied   = bookings.filter((b) => b.status === "denied").length;
  const totalGuests   = bookings.filter((b) => b.status === "accepted").reduce((s, b) => s + b.guests, 0);
  const totalDays     = new Set(bookings.map((b) => b.date)).size;
  const avgPerDay     = totalDays > 0 ? Math.round(totalGuests / totalDays) : 0;

  const filteredBookings = bookings.filter((b) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!b.name.toLowerCase().includes(q) && !b.business.toLowerCase().includes(q) &&
          !b.email.toLowerCase().includes(q) && !b.phone.includes(q)) return false;
    }
    if (b.guests < guestMin || b.guests > guestMax) return false;
    if (filterDate && b.date !== filterDate) return false;
    if (filterType !== "all" && b.type !== filterType) return false;
    return true;
  });

  const byDate = filteredBookings.reduce<Record<string, Booking[]>>((acc, b) => {
    (acc[b.date] ??= []).push(b);
    return acc;
  }, {});

  const sortedDates = Object.keys(byDate)
    .filter((date) => filter === "all" || byDate[date].some((b) => b.status === filter))
    .filter((date) => {
      if (showClosed) return true;
      const tKeys = [...new Set(byDate[date].map((b) => b.time))].sort();
      return !isDayClosed(date, tKeys);
    })
    .sort((a, b) => {
      if (globalSortKey === "date") return globalSortDir === "asc" ? a.localeCompare(b) : b.localeCompare(a);
      const gA = byDate[a].reduce((s, bk) => s + bk.guests, 0);
      const gB = byDate[b].reduce((s, bk) => s + bk.guests, 0);
      return globalSortDir === "asc" ? gA - gB : gB - gA;
    });

  // Calendar
  const calYear     = calMonth.getFullYear();
  const calMon      = calMonth.getMonth();
  const daysInMonth = new Date(calYear, calMon + 1, 0).getDate();
  const firstDow    = (new Date(calYear, calMon, 1).getDay() + 6) % 7;

  const slotsByDate = event.slots.reduce<Record<string, typeof event.slots[0]>>((acc, s) => {
    const d = s.date;
    acc[`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`] = s;
    return acc;
  }, {});

  const dotColor: Record<string, string> = {
    green: "bg-emerald-400", yellow: "bg-amber-400", red: "bg-red-400",
  };

  const guestFiltered = guestMin > 0 || guestMax < GUEST_MAX_RANGE;
  const activeFilterCount = (filter !== "all" ? 1 : 0) + (guestFiltered ? 1 : 0) + (filterDate ? 1 : 0) + (!showClosed ? 1 : 0) + (filterType !== "all" ? 1 : 0);

  const panelStatusCfg = selectedBooking ? statusConfig[selectedBooking.status as BookingStatus] : null;
  const panelTimeAccepted = selectedBooking
    ? bookings.filter((bk) => bk.date === selectedBooking.date && bk.time === selectedBooking.time && bk.status === "accepted").reduce((s, bk) => s + bk.guests, 0)
    : 0;
  const panelWouldExceed = !!(selectedBooking && selectedBooking.status === "pending" && panelTimeAccepted + selectedBooking.guests > event.capacity);

  const totalCapacity = event.slots.reduce((s, sl) => s + sl.times.length * event.capacity, 0);
  const overallFillPct = totalCapacity > 0 ? Math.round((totalGuests / totalCapacity) * 100) : 0;

  return (
    <div className="w-full min-h-full">

      {/* Page header */}
      <div className="mb-6 sm:mb-8 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">Bokningar</p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground truncate">{event.name} <span className="text-muted-foreground font-normal">{event.year}</span></h1>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
              <CalendarCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              {event.slots.length} dagar
            </span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className="text-xs sm:text-sm text-muted-foreground">{event.capacity} platser/tillfälle</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className={`text-xs sm:text-sm font-semibold ${overallFillPct >= 80 ? "text-amber-600" : "text-emerald-600"}`}>{overallFillPct}% belagd</span>
          </div>
        </div>
        <button
          onClick={() => exportCSV(bookings, `${event.id}-bokningar`)}
          className="cursor-pointer shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-border bg-white px-3 py-2 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Exportera CSV</span>
          <span className="sm:hidden">CSV</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 mb-6 sm:mb-8">
        {[
          { label: "Obesvarade",    value: totalPending,  sub: "förfrågningar", icon: HourglassIcon, color: "text-amber-500",   bg: "bg-amber-50",   border: "border-amber-100",   topBorder: "border-t-2 border-amber-300"   },
          { label: "Accepterade",   value: totalAccepted, sub: "bokningar",     icon: CheckCircle2,  color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", topBorder: "border-t-2 border-emerald-400" },
          { label: "Nekade",        value: totalDenied,   sub: "bokningar",     icon: XCircle,       color: "text-red-500",     bg: "bg-red-50",     border: "border-red-100",     topBorder: "border-t-2 border-red-400"     },
          { label: "Bekr. gäster",  value: totalGuests,   sub: "totalt",        icon: TrendingUp,    color: "text-blue-500",    bg: "bg-blue-50",    border: "border-blue-100",    topBorder: "border-t-2 border-blue-400"    },
          { label: "Snitt / dag",   value: avgPerDay,     sub: "gäster",        icon: CalendarCheck, color: "text-violet-500",  bg: "bg-violet-50",  border: "border-violet-100",  topBorder: "border-t-2 border-violet-400"  },
        ].map(({ label, value, sub, icon: Icon, color, bg, border, topBorder }) => (
          <div key={label} className={`bg-white rounded-xl sm:rounded-2xl border border-border shadow-sm ${topBorder}
            flex items-center gap-3 px-4 py-3
            sm:flex-col sm:items-start sm:gap-3 sm:px-5 sm:py-5`}>
            <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl ${bg} border ${border} flex items-center justify-center shrink-0`}>
              <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${color}`} />
            </div>
            <div className="flex items-baseline gap-2 sm:block min-w-0">
              <p className="text-xl sm:text-3xl font-bold tabular-nums leading-none text-foreground sm:mt-1">{value}</p>
              <p className="text-xs text-muted-foreground sm:hidden">{label}</p>
            </div>
            <div className="hidden sm:block min-w-0">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider truncate">{label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="flex gap-6 items-start relative">

        {/* Left column — search, filters, bookings */}
        <div className="flex-1 min-w-0 min-h-0">

          {/* Search + Filter bar */}
          <div className="flex gap-2 mb-5">
            <div className="flex-1 bg-white rounded-xl border border-border px-4 h-11 flex items-center gap-2 min-w-0 shadow-sm">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                type="text"
                placeholder="Sök namn, verksamhet, e-post eller telefon…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 text-sm bg-transparent focus:outline-none placeholder:text-muted-foreground min-w-0"
              />
              {search && (
                <button onClick={() => setSearch("")} className="cursor-pointer text-muted-foreground hover:text-foreground shrink-0">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => setFilterOpen(true)}
              className={`cursor-pointer relative shrink-0 inline-flex items-center gap-2 rounded-xl border h-11 px-4 text-sm font-medium transition-colors ${activeFilterCount > 0 ? "bg-foreground text-background border-foreground" : "bg-white border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"}`}
            >
              <Filter className="w-4 h-4" />
              Filter
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-white/20 text-background text-[10px] font-semibold flex items-center justify-center leading-none">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Filter slide-out panel */}
          {filterOpen && (
            <div className="fixed inset-0 z-40" onClick={() => setFilterOpen(false)} />
          )}
          <div className={`fixed top-0 right-0 z-50 h-full w-80 bg-white border-l border-border shadow-xl flex flex-col transition-transform duration-200 ease-in-out ${filterOpen ? "translate-x-0" : "translate-x-full"}`}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
              <p className="text-sm font-semibold">Filter</p>
              <button onClick={() => setFilterOpen(false)} className="cursor-pointer p-1 rounded-md hover:bg-muted transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-6">

              {/* Mini calendar */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Datum</p>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold capitalize">{MONTHS_SV[calMon]} {calYear}</p>
                    <div className="flex items-center gap-0.5">
                      <button onClick={() => setCalMonth(new Date(calYear, calMon - 1, 1))} className="cursor-pointer p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                        <ChevronDown className="w-3.5 h-3.5 rotate-90" />
                      </button>
                      <button onClick={() => setCalMonth(new Date(calYear, calMon + 1, 1))} className="cursor-pointer p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                        <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7">
                    {WEEKDAYS_SV.map((d) => (
                      <div key={d} className="text-center text-[10px] font-medium text-muted-foreground py-0.5 w-8">{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7">
                    {Array.from({ length: firstDow }).map((_, i) => <div key={`e${i}`} className="w-8" />)}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day           = i + 1;
                      const dateStr       = `${calYear}-${String(calMon+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
                      const slot          = slotsByDate[dateStr];
                      const isToday       = dateStr === new Date().toISOString().slice(0, 10);
                      const isCalSelected = dateStr === calSelectedDate;
                      const hasBookings   = !!byDate[dateStr];
                      return (
                        <div key={day} className="flex flex-col items-center w-8 py-0.5">
                          <button
                            disabled={!slot && !hasBookings}
                            onClick={() => {
                              if (!slot && !hasBookings) return;
                              if (filterDate === dateStr) {
                                setFilterDate(null);
                                setCalSelectedDate(null);
                              } else {
                                setFilterDate(dateStr);
                                setCalSelectedDate(dateStr);
                                setFilterOpen(false);
                                setTimeout(() => dateRefs.current[dateStr]?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
                              }
                            }}
                            className={`w-7 h-7 flex items-center justify-center rounded-full text-xs tabular-nums font-medium transition-colors
                              ${isCalSelected ? "bg-foreground text-background" : isToday ? "ring-1 ring-foreground/20" : ""}
                              ${!isCalSelected && (slot || hasBookings) ? "text-foreground hover:bg-muted cursor-pointer" : !isCalSelected ? "text-muted-foreground cursor-default" : "cursor-pointer"}
                            `}
                          >
                            {day}
                          </button>
                          {slot && <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${dotColor[slot.status] ?? "bg-muted"}`} />}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-3 mt-2 pt-2 border-t border-border">
                    {[["bg-emerald-400","Tillgänglig"],["bg-amber-400","Begränsad"],["bg-red-400","Fullbokad"]].map(([cls, lbl]) => (
                      <div key={lbl} className="flex items-center gap-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${cls}`} />
                        <span className="text-[10px] text-muted-foreground">{lbl}</span>
                      </div>
                    ))}
                  </div>
                  {filterDate && (
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-xs text-muted-foreground">Valt datum:</span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-foreground text-background text-xs font-medium">
                        {new Date(filterDate).toLocaleDateString("sv-SE", { day: "numeric", month: "short" })}
                        <button onClick={() => { setFilterDate(null); setCalSelectedDate(null); }} className="cursor-pointer hover:opacity-70">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Status</p>
                <div className="flex flex-wrap gap-1.5">
                  {FILTER_OPTIONS.map((opt) => {
                    const count = opt.value === "pending" ? totalPending : opt.value === "accepted" ? totalAccepted : opt.value === "denied" ? totalDenied : null;
                    const active = filter === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setFilter(opt.value)}
                        className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${active ? "bg-foreground text-background border-foreground shadow-sm" : "bg-white border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"}`}
                      >
                        {opt.label}
                        {count !== null && (
                          <span className={`tabular-nums text-[10px] rounded-full px-1.5 py-0.5 leading-none font-semibold ${active ? "bg-white/20 text-background" : "bg-muted text-muted-foreground"}`}>
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Typ */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Typ</p>
                <div className="flex flex-wrap gap-1.5">
                  {([["all","Alla"],["business","Företag"],["private","Privat"]] as const).map(([val, lbl]) => (
                    <button
                      key={val}
                      onClick={() => setFilterType(val)}
                      className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${filterType === val ? "bg-foreground text-background border-foreground shadow-sm" : "bg-white border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"}`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sällskap */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Sällskap</p>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground tabular-nums">{guestMin} pers</span>
                  <span className="text-xs text-muted-foreground tabular-nums">{guestMax === GUEST_MAX_RANGE ? `${GUEST_MAX_RANGE}+` : `${guestMax}`} pers</span>
                </div>
                <div className="flex flex-col gap-3">
                  <div>
                    <p className="text-[10px] text-muted-foreground mb-1">Min</p>
                    <input
                      type="range" min={0} max={GUEST_MAX_RANGE} step={5} value={guestMin}
                      onChange={(e) => { const v = Number(e.target.value); setGuestMin(Math.min(v, guestMax - 5)); }}
                      className="w-full accent-foreground cursor-pointer"
                    />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground mb-1">Max</p>
                    <input
                      type="range" min={0} max={GUEST_MAX_RANGE} step={5} value={guestMax}
                      onChange={(e) => { const v = Number(e.target.value); setGuestMax(Math.max(v, guestMin + 5)); }}
                      className="w-full accent-foreground cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Sortering */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Sortering</p>
                <div className="flex flex-wrap gap-1.5">
                  {GLOBAL_SORT_OPTIONS.map((s) => {
                    const active = globalSortKey === s.value;
                    const dir = active ? globalSortDir : "asc";
                    return (
                      <button
                        key={s.value}
                        onClick={() => {
                          if (active) {
                            setGlobalSortDir((d) => d === "asc" ? "desc" : "asc");
                          } else {
                            setGlobalSortKey(s.value);
                            setGlobalSortDir("asc");
                          }
                        }}
                        className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${active ? "bg-foreground text-background border-foreground shadow-sm" : "bg-white border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"}`}
                      >
                        {s.label}
                        {active && (
                          dir === "asc"
                            ? <ArrowUp className="w-3 h-3" />
                            : <ArrowDown className="w-3 h-3" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Vy */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Vy</p>
                <div className="flex flex-wrap gap-1.5">
                  {(() => {
                    const allKeys = sortedDates.flatMap((date) =>
                      [...new Set(byDate[date].map((b) => b.time))].sort().map((time) => slotKey(date, time)),
                    );
                    const anyExpanded = allKeys.some((k) => expanded[k]);
                    return (
                      <button
                        onClick={() => setExpanded(Object.fromEntries(allKeys.map((k) => [k, !anyExpanded])))}
                        className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-white text-xs font-medium text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-all whitespace-nowrap"
                      >
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${anyExpanded ? "rotate-180" : ""}`} />
                        {anyExpanded ? "Fäll ihop alla" : "Expandera alla"}
                      </button>
                    );
                  })()}
                  <button
                    onClick={() => setShowClosed((prev) => !prev)}
                    className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${!showClosed ? "bg-foreground text-background border-foreground shadow-sm" : "bg-white border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"}`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    {showClosed ? "Göm låsta" : "Visa låsta"}
                  </button>
                </div>
              </div>

            </div>
            {activeFilterCount > 0 && (
              <div className="px-5 py-4 border-t border-border shrink-0">
                <button
                  onClick={() => { setFilter("all"); setGuestMin(0); setGuestMax(GUEST_MAX_RANGE); setFilterDate(null); setCalSelectedDate(null); setShowClosed(true); setFilterType("all"); }}
                  className="cursor-pointer w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Rensa filter ({activeFilterCount})
                </button>
              </div>
            )}
          </div>

          {/* Pending section */}
          {totalPending > 0 && (
            <div className="mb-6 rounded-2xl border border-amber-200 overflow-hidden shadow-sm">
              <div className={`bg-amber-50 ${showPendingSection ? "border-b border-amber-200" : ""}`}>
                <button
                  onClick={() => setShowPendingSection((v) => !v)}
                  className="cursor-pointer w-full flex items-center justify-between px-5 py-3 hover:bg-amber-100/70 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <HourglassIcon className="w-3.5 h-3.5 text-amber-600" />
                    <p className="text-sm font-semibold text-amber-800 leading-tight">Obesvarade förfrågningar <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-800 text-[10px] font-bold inline-flex items-center justify-center align-middle ml-0.5">{totalPending}</span></p>
                  </div>
                  <div className="inline-flex items-center gap-1 text-xs text-amber-700 font-medium">
                    {showPendingSection ? "Fäll ihop" : "Visa"}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ease-in-out ${showPendingSection ? "rotate-180" : ""}`} />
                  </div>
                </button>
                {showPendingSection && (
                  <p className="px-5 pb-3 text-xs text-amber-700/70">Acceptera eller neka direkt, eller klicka på en rad för att se detaljer.</p>
                )}
              </div>
              <div className={`grid transition-all duration-200 ease-in-out ${showPendingSection ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                <div className="overflow-hidden">
                  {/* Table header */}
                  <div className="grid grid-cols-[2fr_1fr_32px] sm:grid-cols-[2fr_2fr_1fr_1fr_32px] gap-x-4 px-5 py-2 bg-amber-100/60 border-b border-amber-200 text-[10px] font-semibold uppercase tracking-widest text-amber-800">
                    <div>Namn</div>
                    <div>Gäster</div>
                    <div className="hidden sm:block">Tid</div>
                    <div className="hidden sm:block">Åtgärd</div>
                    <div />
                  </div>
                  {bookings
                    .filter((b) => b.status === "pending")
                    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
                    .map((booking, i, arr) => {
                      const currentAccepted = bookings.filter((bk) => bk.date === booking.date && bk.time === booking.time && bk.status === "accepted").reduce((s, bk) => s + bk.guests, 0);
                      const afterAccepted = currentAccepted + booking.guests;
                      const wouldExceed = afterAccepted > event.capacity;
                      const isSelected = selectedId === booking.id;
                      return (
                        <div
                          key={booking.id}
                          className={`grid grid-cols-[2fr_1fr_32px] sm:grid-cols-[2fr_2fr_1fr_1fr_32px] gap-x-4 items-center px-5 py-3 transition-colors cursor-pointer ${i < arr.length - 1 ? "border-b border-border" : ""} ${isSelected ? "bg-amber-50/60" : "bg-white hover:bg-muted/20"}`}
                          onClick={() => setSelectedId((prev) => prev === booking.id ? null : booking.id)}
                        >
                          {/* Namn + verksamhet */}
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate leading-tight">{booking.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{booking.business}</p>
                          </div>
                          {/* Gäster */}
                          <div>
                            <span className={`text-sm font-bold tabular-nums ${wouldExceed ? "text-red-600" : "text-foreground"}`}>
                              {booking.guests}
                              {wouldExceed && <AlertTriangle className="inline w-3 h-3 ml-1 text-red-500" />}
                            </span>
                          </div>
                          {/* Actions */}
                          <div className="hidden sm:flex items-center gap-1.5">
                            <button
                              onClick={(e) => { e.stopPropagation(); updateStatus(booking.id, "accepted"); }}
                              className={`cursor-pointer inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${wouldExceed ? "bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-200" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border border-emerald-200"}`}
                            >
                              {wouldExceed ? "Ändå" : "Acceptera"}
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); updateStatus(booking.id, "denied"); }}
                              className="cursor-pointer inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold bg-red-100 text-red-700 hover:bg-red-200 border border-red-200 transition-colors"
                            >
                              Neka
                            </button>
                          </div>
                          {/* Comment icon + chevron */}
                          <div className="flex items-center justify-center gap-2">
                            <span className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                              {(comments[booking.id] ?? []).length > 0 && (
                                <span className="relative">
                                  <MessageSquare className="w-3.5 h-3.5 text-muted-foreground/50" />
                                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-amber-400" />
                                </span>
                              )}
                            </span>
                            <ChevronDown className="w-3.5 h-3.5 -rotate-90 text-muted-foreground/30 shrink-0" />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* Date groups */}
          <div className="flex flex-col gap-6">
            {sortedDates.map((date) => {
              const allDay      = byDate[date];
              const timeKeys    = [...new Set(allDay.map((b) => b.time))].sort();
              const isClosed    = isDayClosed(date, timeKeys);
              const dayDate     = new Date(date);
              const weekday     = dayDate.toLocaleDateString("sv-SE", { weekday: "long" });
              const dayAccepted = allDay.filter((b) => b.status === "accepted").reduce((s, b) => s + b.guests, 0);
              const dayPending  = allDay.filter((b) => b.status === "pending").length;
              const dayCapacity = timeKeys.length * event.capacity;
              const dayKeys     = timeKeys.map((t) => slotKey(date, t));
              const anyExpanded   = dayKeys.some((k) => expanded[k]);
              const dayFillPct    = dayCapacity > 0 ? Math.min((dayAccepted / dayCapacity) * 100, 100) : 0;
              const dayNearFull   = dayFillPct >= 80;
              const dayFullFull   = dayFillPct >= 100;
              const dayNumColor   = dayFullFull ? "text-red-600" : dayNearFull ? "text-amber-600" : "text-foreground";
              const isActiveDay   = date === calSelectedDate;

              return (
                <div
                  key={date}
                  ref={(el) => { dateRefs.current[date] = el; }}
                  className={`rounded-2xl border overflow-hidden transition-all duration-200 ease-in-out shadow-sm hover:shadow-md
                    ${isClosed
                      ? "border-red-200 bg-white"
                      : isActiveDay
                        ? "border-foreground/25 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.14)] mx-3"
                        : "border-border/70 bg-white"
                    }`}
                >
                  {/* Day heading */}
                  <div className={`flex items-stretch border-b
                    ${isActiveDay ? "bg-foreground border-white/10" : isClosed ? "bg-red-50/40 border-red-200/60" : dayFullFull ? "bg-red-50/50 border-red-200/40" : dayNearFull ? "bg-amber-50/60 border-amber-200/40" : "bg-white border-border/60"}`}>
                    {/* Date stamp */}
                    <div className={`shrink-0 flex flex-col items-center justify-center gap-0.5 px-7 py-4 border-r
                      ${isActiveDay ? "border-white/10" : isClosed ? "border-red-200/60 bg-red-50/60" : dayFullFull ? "border-red-200/40 bg-red-50/70" : dayNearFull ? "border-amber-200/40 bg-amber-50/80" : "border-border/50 bg-muted/30"}`}>
                      <span className={`text-[9px] font-bold uppercase tracking-[0.15em] ${isActiveDay ? "text-white/50" : "text-muted-foreground/60"}`}>{weekday.slice(0, 3).toUpperCase()}</span>
                      <span className={`text-3xl font-bold tabular-nums leading-none my-0.5 ${isActiveDay ? "text-white" : dayFullFull ? "text-red-600" : dayNearFull ? "text-amber-600" : "text-foreground"}`}>{dayDate.getDate()}</span>
                      <span className={`text-[10px] font-medium capitalize ${isActiveDay ? "text-white/60" : "text-muted-foreground"}`}>{dayDate.toLocaleDateString("sv-SE", { month: "short" })}</span>
                    </div>
                    {/* Day info */}
                    <div className="flex-1 flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 gap-3 min-w-0">
                      {/* Left: name + pill */}
                      <div className="min-w-0">
                        <p className={`text-sm font-semibold capitalize leading-tight ${isActiveDay ? "text-white" : "text-foreground"}`}>
                          {weekday.charAt(0).toUpperCase() + weekday.slice(1)} {dayDate.getDate()} {dayDate.toLocaleDateString("sv-SE", { month: "long" })}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                          {dayFullFull && !isClosed && (
                            <span className="inline-flex items-center gap-1 rounded-full text-[10px] font-semibold px-2 py-0.5 bg-red-100 text-red-600 border border-red-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                              Fullbokad
                            </span>
                          )}
                          {dayPending > 0 && (
                            <span className={`inline-flex items-center gap-1 rounded-full text-[10px] font-semibold px-2 py-0.5 ${isActiveDay ? "bg-white/15 text-white" : "bg-amber-100 text-amber-700 border border-amber-200"}`}>
                              <HourglassIcon className="w-2.5 h-2.5" />{dayPending} obesvarade
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Right: beläggning + lock + chevron */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <p className={`text-[10px] font-semibold uppercase tracking-wider leading-none mb-1 ${isActiveDay ? "text-white/50" : "text-muted-foreground/60"}`}>Beläggning</p>
                          <span className={`text-sm tabular-nums font-medium ${isActiveDay ? "text-white/80" : dayNumColor}`}>
                            <span className="font-bold">{dayAccepted}</span>
                            <span className={`${isActiveDay ? "text-white/50" : "text-muted-foreground"} font-normal`}> / {dayCapacity}</span>
                          </span>
                        </div>
                        {timeKeys.length > 1 && (
                          <button
                            onClick={(e) => { e.stopPropagation(); const allClosed = isDayClosed(date, timeKeys); timeKeys.forEach((t) => setClosedSlots((prev) => ({ ...prev, [slotKey(date, t)]: !allClosed }))); }}
                            className={`cursor-pointer w-7 h-7 rounded-lg border flex items-center justify-center transition-colors ${isActiveDay ? "border-white/20 text-white/70 hover:bg-white/10" : isClosed ? "border-border text-muted-foreground bg-white/80" : "border-border text-muted-foreground bg-white/80 hover:text-red-600"}`}
                          >
                            {isClosed ? <LockOpen className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                          </button>
                        )}
                        <button
                          onClick={() => setExpanded((prev) => ({ ...prev, ...Object.fromEntries(dayKeys.map((k) => [k, !anyExpanded])) }))}
                          className={`cursor-pointer w-7 h-7 rounded-lg border flex items-center justify-center transition-colors ${isActiveDay ? (anyExpanded ? "bg-white/20 text-white border-white/20" : "border-white/20 text-white/70 hover:bg-white/10") : "border-border text-muted-foreground hover:text-foreground bg-white/80"}`}
                        >
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ease-in-out ${anyExpanded ? "rotate-180" : ""}`} />
                        </button>
                      </div>
                    </div>
                  </div>


                  {/* Time slots */}
                  {timeKeys.map((time, timeIdx) => {
                    const key             = slotKey(date, time);
                    const isOpen          = !!expanded[key];
                    const isSlotClosed    = !!closedSlots[key];
                    const allTimeBookings = allDay.filter((b) => b.time === time);
                    const visibleBookings = filter === "all" ? allTimeBookings : allTimeBookings.filter((b) => b.status === filter);
                    const timeAccepted    = allTimeBookings.filter((b) => b.status === "accepted").reduce((s, b) => s + b.guests, 0);
                    const timePending     = allTimeBookings.filter((b) => b.status === "pending").reduce((s, b) => s + b.guests, 0);
                    const timeRemaining   = Math.max(event.capacity - timeAccepted, 0);
                    const timeNearFull    = timeAccepted / event.capacity >= 0.8;
                    const timeFull        = isSlotClosed || timeAccepted >= event.capacity;
                    const fillPct         = Math.min((timeAccepted / event.capacity) * 100, 100);
                    const pendPct         = Math.min((timePending / event.capacity) * 100, 100 - fillPct);
                    const pendingCount    = allTimeBookings.filter((b) => b.status === "pending").length;

                    if (filter !== "all" && visibleBookings.length === 0) return null;

                    return (
                      <div key={key} className={timeIdx > 0 ? "border-t border-border" : ""}>
                        {/* Time row header */}
                        <div className={`group flex items-center gap-4 px-6 py-4 transition-all duration-200 ease-in-out cursor-pointer
                          ${isSlotClosed ? "bg-red-50/30" : isOpen ? "bg-muted/30" : "bg-white hover:bg-muted/20"}`}
                          onClick={() => toggleExpanded(key)}
                        >
                          <Clock className={`shrink-0 w-4 h-4 ${isSlotClosed ? "text-red-400" : "text-muted-foreground"}`} />
                          <button onClick={(e) => { e.stopPropagation(); toggleExpanded(key); }} className="cursor-pointer flex-1 text-left min-w-0">
                            <div className="flex items-center gap-4">
                              <span className="text-lg font-bold tabular-nums shrink-0 w-14">{time}</span>
                              <div className="flex flex-col gap-1 min-w-0 flex-1">
                                <span className={`text-xs text-muted-foreground ${isSlotClosed ? "text-red-500" : timeFull ? "text-red-500" : timeNearFull ? "text-amber-600" : ""}`}>
                                  {isSlotClosed ? "Låst" : timeFull ? "Fullbelagt" : `${timeRemaining} av ${event.capacity} kvar`}
                                </span>
                                <div className="hidden sm:block h-2.5 bg-muted rounded-full overflow-hidden">
                                  <div className="h-full flex">
                                    <div className={`h-full transition-all duration-200 ease-in-out ${isSlotClosed ? "bg-red-300" : timeFull ? "bg-red-400" : timeNearFull ? "bg-amber-400" : "bg-emerald-500"}`} style={{ width: `${fillPct}%` }} />
                                    <div className="h-full bg-amber-200 transition-all duration-200 ease-in-out" style={{ width: `${pendPct}%` }} />
                                  </div>
                                </div>
                                <div className="hidden sm:flex items-center gap-2 mt-1">
                                  <span className="text-xs text-muted-foreground tabular-nums">
                                    {allTimeBookings.length} bokning{allTimeBookings.length !== 1 ? "ar" : ""}
                                  </span>
                                  {pendingCount > 0 && (
                                    <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-semibold bg-amber-50 border border-amber-200 rounded-lg px-2 py-0.5">
                                      <HourglassIcon className="w-3 h-3" />{pendingCount} obesvarade
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </button>
                          <div className="flex items-start gap-1.5 shrink-0">
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleClosedSlot(date, time); }}
                              className={`cursor-pointer inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${isSlotClosed ? "border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-white" : "border-border text-muted-foreground hover:border-red-200 hover:text-red-600 hover:bg-red-50 bg-white"}`}
                            >
                              {isSlotClosed ? <><LockOpen className="w-3.5 h-3.5" /><span className="hidden sm:inline"> Öppna</span></> : <><Lock className="w-3.5 h-3.5" /><span className="hidden sm:inline"> Lås</span></>}
                            </button>
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className={`p-1.5 rounded-lg border transition-colors ${isOpen ? "bg-foreground border-foreground text-background" : "border-border bg-white text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                            >
                              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ease-in-out ${isOpen ? "rotate-180" : ""}`} />
                            </div>
                          </div>
                        </div>

                        {/* Progress bar — mobile only, below slot row header */}
                        <div className="sm:hidden px-5 pb-2.5 bg-white">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                              <div className="h-full flex">
                                <div className={`h-full transition-all duration-200 ease-in-out ${isSlotClosed ? "bg-red-300" : timeFull ? "bg-red-400" : timeNearFull ? "bg-amber-400" : "bg-emerald-500"}`} style={{ width: `${fillPct}%` }} />
                                <div className="h-full bg-amber-200 transition-all duration-200 ease-in-out" style={{ width: `${pendPct}%` }} />
                              </div>
                            </div>
                            {pendingCount > 0 && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 font-semibold shrink-0 bg-amber-50 border border-amber-200 rounded-lg px-1.5 py-0.5">
                                <HourglassIcon className="w-2.5 h-2.5" />{pendingCount}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Booking list */}
                        <div className={`grid transition-all duration-200 ease-in-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                          <div className="overflow-hidden">
                            <div className="border-t border-border relative bg-white">
                              <div
                                className="overflow-y-auto max-h-[560px]"
                                onScroll={(e) => {
                                  const el = e.currentTarget;
                                  setScrolledToBottom((prev) => ({ ...prev, [key]: el.scrollHeight - el.scrollTop <= el.clientHeight + 2 }));
                                }}
                              >
                                {/* Table header — mobile */}
                                <div className="grid sm:hidden grid-cols-[2fr_1fr_1fr_24px] gap-0 sticky top-0 z-10 bg-[#f5f5f7] shadow-[0_1px_0_0_#e5e7eb] px-4 py-2">
                                  {([
                                    { label: "Namn",   col: "name"   as SortKey, right: false },
                                    { label: "Gäster", col: "guests" as SortKey, right: true  },
                                    { label: "Status", col: "status" as SortKey, right: true  },
                                  ] as { label: string; col: SortKey; right: boolean }[]).map(({ label, col, right }) => {
                                    const active = sortKey[key] === col;
                                    const Icon   = active ? (sortDir[key] === "asc" ? ArrowUp : ArrowDown) : ChevronsUpDown;
                                    return (
                                      <button key={col} onClick={() => handleSort(key, col)} className={`cursor-pointer text-[10px] font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground flex items-center gap-1 ${right ? "justify-end" : "justify-start"}`}>
                                        {label}<Icon className={`w-3 h-3 ${active ? "text-foreground" : "text-muted-foreground/40"}`} />
                                      </button>
                                    );
                                  })}
                                  <div />
                                </div>
                                {/* Table header — desktop */}
                                <div className="hidden sm:grid grid-cols-[2fr_2fr_1fr_1fr_40px] gap-0 sticky top-0 z-10 bg-[#f5f5f7] shadow-[0_1px_0_0_#e5e7eb]">
                                  {([
                                    { label: "Namn",       col: "name"     as SortKey },
                                    { label: "Verksamhet", col: "business" as SortKey },
                                    { label: "Gäster",     col: "guests"   as SortKey },
                                    { label: "Status",     col: "status"   as SortKey },
                                  ] as { label: string; col: SortKey }[]).map(({ label, col }) => {
                                    const active = sortKey[key] === col;
                                    const Icon   = active ? (sortDir[key] === "asc" ? ArrowUp : ArrowDown) : ChevronsUpDown;
                                    return (
                                      <button key={col} onClick={() => handleSort(key, col)} className="cursor-pointer text-left px-5 py-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground flex items-center gap-1">
                                        {label}<Icon className={`w-3 h-3 ${active ? "text-foreground" : "text-muted-foreground/40"}`} />
                                      </button>
                                    );
                                  })}
                                  <div />
                                </div>

                                {/* Booking rows */}
                                {visibleBookings.length > 0 ? (
                                  sortBookings(visibleBookings, key).map((booking, rowIdx) => {
                                    const { label, pill, icon: StatusIcon } = statusConfig[booking.status as BookingStatus];
                                    const wouldExceed = booking.status === "pending" && timeAccepted + booking.guests > event.capacity;
                                    const isSelected = selectedId === booking.id;

                                    return (
                                      <div
                                        key={booking.id}
                                        className={`group border-t border-border transition-colors cursor-pointer
                                          ${isSelected
                                            ? "bg-accent border-l-2 border-l-foreground"
                                            : rowIdx % 2 === 0
                                              ? "bg-white hover:bg-accent/50"
                                              : "bg-muted/10 hover:bg-accent/50"
                                          }`}
                                        onClick={() => setSelectedId((prev) => prev === booking.id ? null : booking.id)}
                                      >
                                        {/* Mobile row */}
                                        <div className="sm:hidden grid grid-cols-[2fr_1fr_1fr_24px] items-center px-4 py-3.5">
                                          <div className="min-w-0">
                                            <p className="text-sm font-semibold truncate">{booking.name}</p>
                                            <p className="text-xs text-muted-foreground truncate">{booking.business}</p>
                                          </div>
                                          <div className="flex justify-end">
                                            <span className="font-bold tabular-nums text-sm">{booking.guests}</span>
                                          </div>
                                          <div className="flex justify-end">
                                            <span className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${pill}`}>
                                              <StatusIcon className="w-2.5 h-2.5 shrink-0" />{label}
                                            </span>
                                          </div>
                                          <div className="flex justify-center">
                                            <ChevronDown className="w-3.5 h-3.5 -rotate-90 text-muted-foreground/30" />
                                          </div>
                                        </div>
                                        {/* Desktop row */}
                                        <button className="hidden sm:grid w-full grid-cols-[2fr_2fr_1fr_1fr_40px] text-left">
                                          <div className="px-5 py-4 min-w-0">
                                            <p className="text-sm font-semibold truncate">{booking.name}</p>
                                            <p className="text-xs text-muted-foreground truncate">{booking.business}</p>
                                          </div>
                                          <div className="px-5 py-4 min-w-0 flex items-center">
                                            <p className="text-sm text-muted-foreground truncate">{booking.business}</p>
                                          </div>
                                          <div className="px-5 py-4 flex items-center gap-1">
                                            <span className={`font-bold tabular-nums text-sm ${wouldExceed ? "text-red-600" : ""}`}>{booking.guests}</span>
                                            {wouldExceed && <AlertTriangle className="w-3 h-3 text-red-500 shrink-0" />}
                                          </div>
                                          <div className="px-5 py-4 flex items-center">
                                            <span className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${pill}`}>
                                              <StatusIcon className="w-2.5 h-2.5 shrink-0" />{label}
                                            </span>
                                          </div>
                                          <div className="flex items-center justify-center px-2">
                                            <span className="relative w-4 h-4 flex items-center justify-center">
                                              <ChevronDown className="w-3.5 h-3.5 -rotate-90 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
                                              {(comments[booking.id] ?? []).length > 0 && (
                                                <span className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-amber-400" />
                                              )}
                                            </span>
                                          </div>
                                        </button>
                                      </div>
                                    );
                                  })
                                ) : (
                                  <div className="px-5 py-4 text-xs text-muted-foreground italic border-t border-border">
                                    Inga bokningar matchar filtret.
                                  </div>
                                )}
                              </div>
                              {visibleBookings.length > 9 && !scrolledToBottom[key] && (
                                <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Day summary footer */}
                  {(() => {
                    const dayRemaining = Math.max(dayCapacity - dayAccepted, 0);
                    const dayPendingGuests = allDay.filter((b) => b.status === "pending").reduce((s, b) => s + b.guests, 0);
                    return (
                      <div className={`px-5 py-2 border-t text-[10px] sm:text-xs text-muted-foreground ${isClosed ? "border-red-200 bg-red-50/20" : isActiveDay ? "border-foreground/10" : "border-border"}`}>
                        <span>{dayRemaining} platser återstår denna dag.</span>
                        {dayPendingGuests > 0 && (
                          <span className="text-amber-600 font-medium"> Obesvarade täcker {dayPendingGuests} gäster.</span>
                        )}
                      </div>
                    );
                  })()}
                </div>
              );
            })}
          </div>

        </div>{/* end left column */}

        {/* Right column — capacity overview, collapsible */}
        <div className={`shrink-0 hidden lg:block sticky top-0 self-start transition-[width] duration-200 ease-in-out ${rightColCollapsed ? "w-8" : "w-[280px]"}`}>
          <div className="relative">
            {/* Collapse toggle */}
            <button
              onClick={() => setRightColCollapsed((c) => !c)}
              title={rightColCollapsed ? "Expandera kapacitet" : "Fäll in kapacitet"}
              className="absolute -left-3.5 top-4 z-10 w-7 h-7 rounded-full bg-white border border-border shadow-sm flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ease-in-out ${rightColCollapsed ? "rotate-90" : "-rotate-90"}`} />
            </button>

            <div className={`bg-white rounded-2xl border border-border shadow-sm overflow-hidden transition-[opacity] duration-200 ease-in-out ${rightColCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
              <div className="flex flex-col px-6 py-6">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Beläggning per dag</p>
                <div className="flex flex-col gap-3">
                  {event.slots.map((slot) => {
                    const d = slot.date;
                    const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
                    const dayBookings = bookings.filter((b) => b.date === dateStr && b.status === "accepted");
                    const slotTotal = slot.times.length * event.capacity;
                    const slotAccepted = dayBookings.reduce((s, b) => s + b.guests, 0);
                    const pct = slotTotal > 0 ? Math.min((slotAccepted / slotTotal) * 100, 100) : 0;
                    const barColor = pct >= 100 ? "bg-red-400" : pct >= 80 ? "bg-amber-400" : "bg-emerald-500";
                    const pending = bookings.filter((b) => b.date === dateStr && b.status === "pending").length;
                    return (
                      <div
                        key={dateStr}
                        className={`cursor-pointer rounded-lg px-2 py-1.5 -mx-2 transition-colors ${filterDate === dateStr ? "bg-foreground/5 ring-1 ring-foreground/15" : "hover:bg-muted/30"}`}
                        onClick={() => {
                          if (filterDate === dateStr) {
                            setFilterDate(null);
                            setCalSelectedDate(null);
                          } else {
                            setFilterDate(dateStr);
                            setCalSelectedDate(dateStr);
                            setTimeout(() => dateRefs.current[dateStr]?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
                          }
                        }}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`text-xs capitalize ${filterDate === dateStr ? "font-bold text-foreground" : "font-medium text-foreground"}`}>
                            {d.toLocaleDateString("sv-SE", { weekday: "short", day: "numeric", month: "short" })}
                          </span>
                          <div className="flex items-center gap-2">
                            {pending > 0 && (
                              <span className="text-[10px] text-amber-600 font-semibold">{pending} obesvarade</span>
                            )}
                            <span className="text-[11px] tabular-nums font-semibold text-muted-foreground">{Math.round(pct)}%</span>
                          </div>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-200 ease-in-out ${barColor}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-8 pt-6 border-t border-border flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-2xl bg-muted/60 flex items-center justify-center mb-3">
                    <BookOpen className="w-4 h-4 text-muted-foreground/40" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Välj en bokning</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Klicka på valfri rad för att se detaljer.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>{/* end two-column layout */}

      {/* Booking detail drawer — unified for all screen sizes */}
      {selectedBooking && (
        <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setSelectedId(null)} />
      )}
      <div className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[380px] bg-white border-l border-border shadow-xl flex flex-col transition-transform duration-200 ease-in-out ${drawerVisible && selectedBooking ? "translate-x-0" : "translate-x-full"}`}>
        {selectedBooking && panelStatusCfg && (
          <>
            {/* Hero */}
            <div className={`px-5 pt-5 pb-4 shrink-0 ${selectedBooking.status === "accepted" ? "bg-emerald-50" : selectedBooking.status === "denied" ? "bg-red-50" : "bg-amber-50"}`}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${panelStatusCfg.pill}`}>
                  <panelStatusCfg.icon className="w-3 h-3 shrink-0" />{panelStatusCfg.label}
                </span>
                <button onClick={() => setSelectedId(null)} className="cursor-pointer shrink-0 p-1.5 rounded-lg hover:bg-black/5 transition-colors -mt-1 -mr-1">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <p className="font-bold text-lg leading-tight truncate text-foreground">{selectedBooking.name}</p>
              <p className="text-sm text-muted-foreground truncate mt-0.5">{selectedBooking.business}</p>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1 px-5 py-5 flex flex-col gap-6">
              {/* Key facts */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Gäster", value: String(selectedBooking.guests), warn: panelWouldExceed },
                  { label: "Datum",  value: new Date(selectedBooking.date).toLocaleDateString("sv-SE", { day: "numeric", month: "short" }) },
                  { label: "Tid",    value: selectedBooking.time },
                ].map(({ label, value, warn }) => (
                  <div key={label} className="bg-muted/40 rounded-xl px-3 py-2.5 text-center">
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
                    <p className={`text-sm font-bold mt-0.5 ${warn ? "text-red-600" : "text-foreground"}`}>{value}</p>
                  </div>
                ))}
              </div>

              {/* Capacity bar for pending */}
              {selectedBooking.status === "pending" && (
                <div className="rounded-xl border border-border bg-muted/20 px-4 py-3 -mt-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    <span>Kapacitet {selectedBooking.time}</span>
                    <span className={`tabular-nums ${panelWouldExceed ? "text-red-600" : "text-foreground"}`}>
                      {panelTimeAccepted} → {panelTimeAccepted + selectedBooking.guests} / {event.capacity}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full flex">
                      <div className="h-full bg-emerald-500 transition-all duration-200 ease-in-out rounded-full" style={{ width: `${Math.min((panelTimeAccepted / event.capacity) * 100, 100)}%` }} />
                      <div className={`h-full transition-all duration-200 ease-in-out ${panelWouldExceed ? "bg-red-400" : "bg-amber-400"}`} style={{ width: `${Math.min((selectedBooking.guests / event.capacity) * 100, 100 - Math.min((panelTimeAccepted / event.capacity) * 100, 100))}%` }} />
                    </div>
                  </div>
                  {panelWouldExceed ? (
                    <p className="text-[11px] text-red-600 font-medium flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      Överskrider kapaciteten med {panelTimeAccepted + selectedBooking.guests - event.capacity} platser.
                    </p>
                  ) : (
                    <p className="text-[11px] text-muted-foreground">
                      {event.capacity - panelTimeAccepted - selectedBooking.guests} platser återstår efter acceptans.
                    </p>
                  )}
                </div>
              )}

              {/* Contact */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Kontakt</p>
                <div className="flex flex-col gap-2">
                  <a href={`mailto:${selectedBooking.email}`} className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5 text-muted-foreground hover:text-foreground transition-colors bg-white">
                    <Mail className="w-4 h-4 shrink-0 text-muted-foreground/60" />
                    <span className="truncate text-xs">{selectedBooking.email}</span>
                  </a>
                  <a href={`tel:${selectedBooking.phone}`} className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5 text-muted-foreground hover:text-foreground transition-colors bg-white">
                    <Phone className="w-4 h-4 shrink-0 text-muted-foreground/60" />
                    <span className="text-xs">{selectedBooking.phone}</span>
                  </a>
                </div>
              </div>

              {/* Comments */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Kommentarer</p>
                <div className="flex flex-col gap-2 mb-3">
                  {(comments[selectedBooking.id] ?? []).length === 0 && (
                    <p className="text-xs text-muted-foreground italic">Inga kommentarer ännu.</p>
                  )}
                  {(comments[selectedBooking.id] ?? []).map((c, i) => (
                    <div key={i} className="rounded-xl bg-muted/40 px-3 py-2.5 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-foreground">{c.author}</span>
                        <span className="text-[10px] text-muted-foreground">{new Date(c.timestamp).toLocaleDateString("sv-SE", { day: "numeric", month: "short" })}</span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{c.text}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newComment.trim()) {
                        setComments((prev) => ({ ...prev, [selectedBooking.id]: [...(prev[selectedBooking.id] ?? []), { text: newComment.trim(), author: "Admin", timestamp: new Date().toISOString() }] }));
                        setNewComment("");
                      }
                    }}
                    placeholder="Skriv en kommentar…"
                    className="flex-1 text-xs rounded-xl border border-border bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-foreground/10 min-w-0"
                  />
                  <button
                    onClick={() => {
                      if (!newComment.trim()) return;
                      setComments((prev) => ({ ...prev, [selectedBooking.id]: [...(prev[selectedBooking.id] ?? []), { text: newComment.trim(), author: "Admin", timestamp: new Date().toISOString() }] }));
                      setNewComment("");
                    }}
                    className="cursor-pointer shrink-0 rounded-xl border border-border bg-white px-2.5 py-2 text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Move booking */}
              {moveMode ? (() => {
                const moveDateSlot = event.slots.find((s) => {
                  const d = s.date;
                  const ds = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
                  return ds === moveDate;
                });
                const availableTimes = moveDateSlot?.times ?? [];
                return (
                  <div className="rounded-2xl border border-border bg-muted/20 p-4 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-widest text-foreground">Välj ny tid</p>
                      <button onClick={() => { setMoveMode(false); setMoveDate(""); setMoveTime(""); }} className="cursor-pointer p-1 rounded-lg hover:bg-black/5 transition-colors">
                        <X className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    </div>

                    {/* Date picker */}
                    <div className="flex flex-col gap-1.5">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Datum</p>
                      <div className="flex flex-col gap-1">
                        {event.slots.map((s) => {
                          const d = s.date;
                          const ds = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
                          const isCurrent = ds === selectedBooking.date;
                          const isSel = ds === moveDate;
                          return (
                            <button
                              key={ds}
                              disabled={isCurrent}
                              onClick={() => { setMoveDate(ds); setMoveTime(""); }}
                              className={`cursor-pointer flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-colors border
                                ${isSel ? "bg-foreground text-background border-foreground" : isCurrent ? "border-border text-muted-foreground/40 bg-muted/20 cursor-not-allowed" : "border-border bg-white text-foreground hover:border-foreground/30 hover:bg-muted/30"}`}
                            >
                              <span className="capitalize">{d.toLocaleDateString("sv-SE", { weekday: "short", day: "numeric", month: "short" })}</span>
                              <span className={`text-[10px] font-semibold ${isSel ? "text-background/60" : isCurrent ? "text-muted-foreground/40" : s.status === "red" ? "text-red-500" : s.status === "yellow" ? "text-amber-500" : "text-emerald-600"}`}>
                                {isCurrent ? "Nuvarande" : s.status === "red" ? "Fullbokad" : s.status === "yellow" ? "Begränsad" : "Tillgänglig"}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Time picker */}
                    {moveDate && (
                      <div className="flex flex-col gap-1.5">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Tid</p>
                        <div className="flex flex-wrap gap-1.5">
                          {availableTimes.map((t) => {
                            const slotAccepted = bookings.filter((bk) => bk.date === moveDate && bk.time === t && bk.status === "accepted").reduce((s, bk) => s + bk.guests, 0);
                            const remaining = event.capacity - slotAccepted;
                            const fits = remaining >= selectedBooking.guests;
                            const isSel = t === moveTime;
                            return (
                              <button
                                key={t}
                                onClick={() => setMoveTime(t)}
                                className={`cursor-pointer flex flex-col items-center rounded-xl px-3 py-2 text-xs font-medium transition-colors border
                                  ${isSel ? "bg-foreground text-background border-foreground" : "border-border bg-white text-foreground hover:border-foreground/30 hover:bg-muted/30"}`}
                              >
                                <span className="font-bold">{t}</span>
                                <span className={`text-[10px] mt-0.5 ${isSel ? "text-background/60" : fits ? "text-emerald-600" : "text-amber-600"}`}>
                                  {remaining} kvar
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Confirm */}
                    <Button
                      size="sm"
                      disabled={!moveDate || !moveTime}
                      className="w-full justify-center font-semibold bg-foreground text-background hover:bg-foreground/85 border-0 disabled:opacity-40 disabled:cursor-not-allowed"
                      onClick={() => {
                        setBookings((prev) => prev.map((b) => b.id === selectedBooking.id ? { ...b, date: moveDate, time: moveTime } : b));
                        setMoveMode(false);
                        setMoveDate("");
                        setMoveTime("");
                      }}
                    >
                      <ArrowRightLeft className="w-4 h-4 mr-2" />
                      Bekräfta flytt
                    </Button>
                  </div>
                );
              })() : (
              <div className="flex flex-col gap-2">
                {selectedBooking.status !== "accepted" && (
                  <Button
                    size="sm"
                    className={`w-full justify-center font-semibold ${panelWouldExceed ? "bg-amber-500 hover:bg-amber-600 text-white border-0" : "bg-emerald-600 hover:bg-emerald-700 text-white border-0"}`}
                    onClick={() => updateStatus(selectedBooking.id, "accepted")}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    {panelWouldExceed ? "Acceptera ändå" : "Acceptera bokning"}
                  </Button>
                )}
                {selectedBooking.status !== "denied" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full justify-center font-medium border-border text-muted-foreground hover:border-red-200 hover:text-red-600 hover:bg-red-50"
                    onClick={() => updateStatus(selectedBooking.id, "denied")}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    {selectedBooking.status === "accepted" ? "Avboka" : "Neka bokning"}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full justify-center font-medium border-border text-muted-foreground hover:text-foreground"
                  onClick={() => { setMoveMode(true); setMoveDate(""); setMoveTime(""); }}
                >
                  <ArrowRightLeft className="w-4 h-4 mr-2" />
                  Flytta till annan tid
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full justify-center font-medium border-border text-muted-foreground hover:text-foreground"
                  onClick={() => console.log("Skickar bekräftelse till:", selectedBooking.email)}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Skicka bekräftelse
                </Button>
              </div>
              )}

              <p className="text-[10px] text-muted-foreground/50 text-center pb-2">Boknings-ID: #{selectedBooking.id}</p>
            </div>
          </>
        )}
      </div>

    </div>
  );
}
