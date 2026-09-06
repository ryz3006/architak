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
          src="/brand/logo-mark-on-dark.png"
          alt=""
          width={96}
          height={96}
          priority={logoPriority}
          className="brand-lockup-logo"
        />
      </span>
      <div className="brand-lockup-text">
        <span className="brand-lockup-name display tracking-[0.18em]">ARCHITAK</span>
        <p className="brand-lockup-tagline">{tagline}</p>
      </div>
    </div>
  );
}
