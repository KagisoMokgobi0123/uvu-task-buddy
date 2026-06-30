import logo from "@/assets/uvu-logo.png";
import { cn } from "@/lib/utils";

export function Logo({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <img
      src={logo}
      alt="UVU"
      width={size}
      height={size}
      className={cn("inline-block", className)}
    />
  );
}

export function BrandLockup({ tagline = true }: { tagline?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <Logo size={36} />
      <div className="leading-tight">
        <div className="font-semibold tracking-tight text-foreground">
          UVU <span className="text-muted-foreground font-normal">AI Workplace</span>
        </div>
        {tagline && (
          <div className="text-[11px] text-muted-foreground">Work Smarter. Automate More.</div>
        )}
      </div>
    </div>
  );
}
