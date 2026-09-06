import Image from "next/image";

type BrandLockupProps = {
  tagline: string;
  className?: string;
  logoPriority?: boolean;
};

export function BrandLockup({ tagline, className, logoPriority = false }: BrandLockupProps) {
  return (
    <div className={className ?? "brand-lockup"}>
      <Image
        src="/brand/logo-on-dark.png"
        alt=""
        width={815}
        height={899}
        priority={logoPriority}
        className="brand-lockup-logo"
      />
      <span className="sr-only">ARCHITAK — {tagline}</span>
    </div>
  );
}
