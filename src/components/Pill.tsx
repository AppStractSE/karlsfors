export function Pill({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-fit inline-flex items-center bg-[#f7f7f7] border border-black/[0.08] rounded-full px-3 py-1 md:px-4 md:py-1.5">
      <span className="text-xs font-semibold text-black/70 tracking-wide">{children}</span>
    </div>
  );
}
