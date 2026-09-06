export function BrandMark({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-10 items-center justify-center rounded-xl bg-[#1e6bd6] text-sm font-black text-white">
        P
      </div>
      <div>
        <p className={`text-sm font-bold tracking-wide ${light ? "text-sidebar-foreground" : "text-foreground"}`}>
          PROTON SALES
        </p>
        <p className={`text-xs ${light ? "text-sidebar-foreground/65" : "text-muted-foreground"}`}>
          Follow-up & Renewal
        </p>
      </div>
    </div>
  );
}
