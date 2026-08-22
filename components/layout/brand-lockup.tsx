import Image from "next/image";

type BrandLockupProps = {
  tagline: string;
  className?: string;
  logoPriority?: boolean;
};

export function BrandLockup({ tagline, className, logoPriority = false }: BrandLockupProps) {
  return (
    <div className={className ?? "brand-lockup"}>
      <span className="brand-lockup-row inline-flex items-center gap-4 md:gap-5">
        <Image
          src="/brand/logo.png"
          alt=""
          width={80}
          height={80}
          priority={logoPriority}
          className="brand-lockup-logo h-14 w-14 object-contain brightness-110 drop-shadow-[0_0_14px_rgba(255,255,255,0.22)] md:h-[4.5rem] md:w-[4.5rem]"
        />
        <span className="brand-lockup-name display text-fluid-2xl tracking-[0.18em] md:text-[clamp(1.85rem,3.2vw,2.35rem)]">
          ARCHITAK
        </span>
      </span>
      <p className="brand-lockup-tagline">{tagline}</p>
    </div>
  );
}
