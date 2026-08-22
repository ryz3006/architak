"use client";

import { SpecularButton } from "@/components/motion/specular-button";

export function EnquireButton({ className = "" }: { className?: string }) {
  return (
    <SpecularButton
      href="/contact"
      size="sm"
      radius={999}
      tint="#ffffff"
      tintOpacity={0.05}
      blur={6}
      textColor="#f5f2eb"
      lineColor="#c4a574"
      baseColor="#2a2a2a"
      intensity={0.55}
      shineSize={8}
      shineFade={48}
      thickness={1}
      speed={0.25}
      followMouse
      proximity={180}
      autoAnimate
      className={`specular-button--header-cta ${className}`.trim()}
    >
      Let&apos;s <span className="text-accent">CREATE</span>
    </SpecularButton>
  );
}
