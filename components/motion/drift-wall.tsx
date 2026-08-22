"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";

import { useReducedMotion } from "@/lib/a11y/use-reduced-motion";

import "@/styles/drift-wall.css";

export type DriftWallItem = {
  image: string;
  alt: string;
};

type DriftProfile = {
  columns: number;
  speed: number;
  tilt: number;
  turn: number;
  depth: number;
  parallax: number;
  scale: number;
};

type DriftWallProps = {
  items: DriftWallItem[];
  className?: string;
  style?: CSSProperties;
};

function columnFactor(index: number, variance: number): number {
  const pseudo = ((index * 0.6180339887 + 0.35) % 1) * 2 - 1;
  return 1 + variance * pseudo;
}

function resolveProfile(width: number, height: number, coarse: boolean): DriftProfile {
  const aspect = width / Math.max(height, 1);

  if (width < 480 || (width < 720 && aspect < 0.85)) {
    return { columns: 2, speed: 5, tilt: 2, turn: -2, depth: 40, parallax: 0, scale: 1.06 };
  }

  if (width < 768) {
    return { columns: 3, speed: 6, tilt: 3, turn: -3, depth: 50, parallax: 0, scale: 1.08 };
  }

  if (width < 1024 || (aspect > 1.4 && height < 720)) {
    return { columns: 4, speed: 7, tilt: 4, turn: -4, depth: 60, parallax: coarse ? 0 : 0.04, scale: 1.1 };
  }

  if (width < 1600) {
    return { columns: 5, speed: 8, tilt: 5, turn: -5, depth: 70, parallax: coarse ? 0 : 0.06, scale: 1.12 };
  }

  return { columns: 6, speed: 8, tilt: 6, turn: -5, depth: 80, parallax: coarse ? 0 : 0.08, scale: 1.14 };
}

export function DriftWall({ items, className = "", style }: DriftWallProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const trackRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef = useRef<number | null>(null);

  const offsetsRef = useRef<number[]>([]);
  const velocitiesRef = useRef<number[]>([]);
  const pointerRef = useRef({ x: 0, y: 0 });
  const pointerDampedRef = useRef({ x: 0, y: 0 });
  const lastTsRef = useRef<number | null>(null);
  const profileRef = useRef<DriftProfile>(resolveProfile(1280, 800, false));

  const reduced = useReducedMotion();
  const [containerHeight, setContainerHeight] = useState(720);
  const [profile, setProfile] = useState<DriftProfile>(() => resolveProfile(1280, 800, false));

  const columns = profile.columns;
  const variance = 0.25;
  const gap = 20;
  const tileHeight = 145;

  const columnItems = useMemo(() => {
    if (items.length === 0) return [];
    const cols = Array.from({ length: columns }, () => [] as DriftWallItem[]);
    items.forEach((item, index) => {
      cols[index % columns]?.push(item);
    });
    return cols.map((col) => (col.length ? col : [items[0] as DriftWallItem]));
  }, [columns, items]);

  const columnMeta = useMemo(() => {
    const unit = tileHeight + gap;
    return columnItems.map((col) => {
      const copyHeight = Math.max(unit, col.length * unit);
      const copies =
        profile.columns <= 3
          ? Math.max(2, Math.ceil((containerHeight * 1.2) / copyHeight) + 1)
          : Math.max(2, Math.ceil((containerHeight * 1.45) / copyHeight) + 1);
      return { copyHeight, copies };
    });
  }, [columnItems, containerHeight, profile.columns]);

  const baseVelocities = useMemo(() => {
    return columnItems.map((_, columnIndex) => {
      const altSign = columnIndex % 2 === 0 ? 1 : -1;
      return profile.speed * columnFactor(columnIndex, variance) * altSign;
    });
  }, [columnItems, profile.speed]);

  useLayoutEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const ro = new ResizeObserver(([entry]) => {
      setContainerHeight(entry.contentRect.height || 720);
    });
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const syncProfile = () => {
      const coarse = window.matchMedia("(pointer: coarse)").matches;
      const next = resolveProfile(window.innerWidth, window.innerHeight, coarse);
      profileRef.current = next;
      setProfile(next);
    };

    syncProfile();
    window.addEventListener("resize", syncProfile, { passive: true });
    window.addEventListener("orientationchange", syncProfile);
    return () => {
      window.removeEventListener("resize", syncProfile);
      window.removeEventListener("orientationchange", syncProfile);
    };
  }, []);

  useEffect(() => {
    offsetsRef.current = columnMeta.map((meta, columnIndex) => meta.copyHeight * ((columnIndex * 0.37) % 1));
    velocitiesRef.current = columnItems.map(() => 0);
  }, [columnItems, columnMeta]);

  const applyPlaneTransform = useCallback((px: number, py: number) => {
    const plane = planeRef.current;
    const p = profileRef.current;
    if (!plane) return;

    plane.style.transform =
      `translate(-50%, -50%) scale(${p.scale}) ` +
      `rotateX(${p.tilt + py}deg) rotateY(${p.turn + px}deg) ` +
      `translateZ(${-p.depth}px)`;
  }, []);

  useEffect(() => {
    applyPlaneTransform(0, 0);

    const onPointerMove = (event: PointerEvent) => {
      const p = profileRef.current;
      if (p.parallax <= 0 || reduced) return;

      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      pointerRef.current = {
        x: (event.clientX - rect.left) / rect.width - 0.5,
        y: (event.clientY - rect.top) / rect.height - 0.5,
      };
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });

    const animate = (timestamp: number) => {
      if (lastTsRef.current === null) lastTsRef.current = timestamp;
      const dt = Math.min(0.05, Math.max(0, timestamp - lastTsRef.current) / 1000);
      lastTsRef.current = timestamp;

      const p = profileRef.current;
      const maxTilt = p.parallax * 4;
      const targetX = pointerRef.current.x * maxTilt;
      const targetY = -pointerRef.current.y * maxTilt;
      const damp = 1 - Math.exp(-dt / 0.14);
      pointerDampedRef.current.x += (targetX - pointerDampedRef.current.x) * damp;
      pointerDampedRef.current.y += (targetY - pointerDampedRef.current.y) * damp;
      applyPlaneTransform(pointerDampedRef.current.x, pointerDampedRef.current.y);

      if (!reduced) {
        for (let columnIndex = 0; columnIndex < trackRefs.current.length; columnIndex += 1) {
          const meta = columnMeta[columnIndex];
          if (!meta) continue;

          const target = baseVelocities[columnIndex] ?? 0;
          const ease = 1 - Math.exp(-dt / 0.28);
          velocitiesRef.current[columnIndex] =
            (velocitiesRef.current[columnIndex] ?? 0) +
            (target - (velocitiesRef.current[columnIndex] ?? 0)) * ease;

          let next = (offsetsRef.current[columnIndex] ?? 0) + (velocitiesRef.current[columnIndex] ?? 0) * dt;
          next = ((next % meta.copyHeight) + meta.copyHeight) % meta.copyHeight;
          offsetsRef.current[columnIndex] = next;

          const track = trackRefs.current[columnIndex];
          if (track) track.style.transform = `translate3d(0, ${-next}px, 0)`;
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTsRef.current = null;
    };
  }, [applyPlaneTransform, baseVelocities, columnMeta, reduced]);

  if (items.length === 0) {
    return null;
  }

  const cssVars = {
    "--dw-perspective": "1800px",
    ...style,
  } as CSSProperties;

  return (
    <div
      ref={containerRef}
      className={`drift-wall${reduced ? " drift-wall--reduced" : ""}${className ? ` ${className}` : ""}`}
      style={cssVars}
      aria-hidden="true"
    >
      <div ref={planeRef} className="drift-wall__plane">
        {columnItems.map((column, columnIndex) => {
          const meta = columnMeta[columnIndex];
          if (!meta) return null;

          return (
            <div key={`col-${columnIndex}`} className="drift-wall__col">
              <div
                ref={(element) => {
                  trackRefs.current[columnIndex] = element;
                }}
                className="drift-wall__track"
              >
                {Array.from({ length: meta.copies }).flatMap((_, copyIndex) =>
                  column.map((item, itemIndex) => {
                    const key = `${columnIndex}-${copyIndex}-${itemIndex}`;
                    return (
                      <div key={key} className="drift-wall__tile">
                        <span className="drift-wall__inner">
                          <span className="drift-wall__media">
                            <img src={item.image} alt="" loading="lazy" decoding="async" draggable={false} />
                          </span>
                          <span className="drift-wall__overlay" />
                        </span>
                      </div>
                    );
                  }),
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
