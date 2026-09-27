import Link from "next/link";

export default function Logo({ subtitle = "Séminaire" }: { subtitle?: string }) {
  return (
    <Link href="/" className="flex items-baseline gap-2 select-none">
      <span className="text-2xl font-black tracking-tight text-white">
        CANAL<span className="text-canal-red">+</span>
      </span>
      <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-canal-muted">
        {subtitle}
      </span>
    </Link>
  );
}
