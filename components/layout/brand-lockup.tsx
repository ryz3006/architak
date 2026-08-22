import Image from "next/image";

type BrandLockupProps = {
  tagline: string;
  className?: string;
  logoPriority?: boolean;
};

export function BrandLockup({ tagline, className, logoPriority = false }: BrandLockupProps) {
  return (
    <div className={className ?? "brand-lockup"}>
      <span className="brand-lockup-logo-wrap" aria-hidden="true">
        <Image
          src="/brand/logo.png"
          alt=""
          width={96}
          height={96}
          priority={logoPriority}
          className="brand-lockup-logo object-contain brightness-110 drop-shadow-[0_0_16px_rgba(255,255,255,0.24)]"
        />
      </span>
      <div className="brand-lockup-text">
        <span className="brand-lockup-name display tracking-[0.18em]">ARCHITAK</span>
        <p className="brand-lockup-tagline">{tagline}</p>
      </div>
    </div>
  );
}
