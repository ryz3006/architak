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
  title?: string;
  href?: string;
};

type DriftWallProps = {
  items: DriftWallItem[];
  columns?: number;
  tileWidth?: number;
  tileHeight?: number;
  gap?: number;
  radius?: number;
  tilt?: number;
  turn?: number;
  roll?: number;
  perspective?: number;
  depth?: number;
  speed?: number;
  direction?: "up" | "down";
  variance?: number;
  parallax?: number;
  pauseOnHover?: boolean;
  lift?: number;
  fade?: number;
  dim?: number;
  grayscale?: boolean;
  overlayColor?: string;
  className?: string;
  style?: CSSProperties;
  /** Decorative background — no tile hover, lift, or pointer interaction. */
  ambient?: boolean;
};

function columnFactor(index: number, variance: number): number {
  const pseudo = ((index * 0.6180339887 + 0.35) % 1) * 2 - 1;
  return 1 + variance * pseudo;
}

export function DriftWall({
  items,
  columns = 5,
  tileWidth = 200,
  tileHeight = 132,
  gap = 18,
  radius = 14,
  tilt = 16,
  turn = -14,
  roll = 0,
  perspective = 1200,
  depth = 120,
  speed = 42,
  direction = "up",
  variance = 0.45,
  parallax = 0.6,
  pauseOnHover = false,
  lift = 64,
  fade = 0.6,
  dim = 0.55,
  grayscale = false,
  overlayColor = "#060010",
  className = "",
  style,
  ambient = false,
}: DriftWallProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const trackRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef = useRef<number | null>(null);

  const offsetsRef = useRef<number[]>([]);
  const velocitiesRef = useRef<number[]>([]);
  const hoveredColRef = useRef(-1);
  const wallHoveredRef = useRef(false);
  const pointerRef = useRef({ x: 0, y: 0 });
  const pointerDampedRef = useRef({ x: 0, y: 0 });
  const lastTsRef = useRef<number | null>(null);
  const activeIdRef = useRef<string | null>(null);

  const reduced = useReducedMotion();
  const [containerHeight, setContainerHeight] = useState(600);
  const [activeId, setActiveId] = useState<string | null>(null);

  const effectiveParallax = ambient ? Math.min(parallax, 0.12) : parallax;
  const effectiveLift = ambient ? 0 : lift;

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
      const copies = Math.max(2, Math.ceil((containerHeight * 1.6) / copyHeight) + 1);
      return { copyHeight, copies };
    });
  }, [columnItems, containerHeight, gap, tileHeight]);

  useLayoutEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setContainerHeight(entry.contentRect.height || 600);
    });
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  const baseVelocities = useMemo(() => {
    const dirSign = direction === "up" ? 1 : -1;
    return columnItems.map((_, columnIndex) => {
      const altSign = columnIndex % 2 === 0 ? 1 : -1;
      return speed * columnFactor(columnIndex, variance) * dirSign * altSign;
    });
  }, [columnItems, direction, speed, variance]);

  useEffect(() => {
    offsetsRef.current = columnMeta.map((meta, columnIndex) => meta.copyHeight * ((columnIndex * 0.37) % 1));
    velocitiesRef.current = columnItems.map(() => 0);
  }, [columnItems, columnMeta]);

  const applyPlaneTransform = useCallback(
    (px: number, py: number) => {
      const plane = planeRef.current;
      if (!plane) return;

      plane.style.transform =
        `translate(-50%, -50%) scale(1.18) ` +
        `rotateX(${tilt + py}deg) rotateY(${turn + px}deg) rotateZ(${roll}deg) ` +
        `translateZ(${-depth}px)`;
    },
    [depth, roll, tilt, turn],
  );

  useEffect(() => {
    applyPlaneTransform(0, 0);

    const animate = (timestamp: number) => {
      if (lastTsRef.current === null) lastTsRef.current = timestamp;
      const dt = Math.min(0.05, Math.max(0, timestamp - lastTsRef.current) / 1000);
      lastTsRef.current = timestamp;

      const maxTilt = effectiveParallax * 8;
      const targetX = pointerRef.current.x * maxTilt;
      const targetY = -pointerRef.current.y * maxTilt;
      const damp = 1 - Math.exp(-dt / 0.12);
      pointerDampedRef.current.x += (targetX - pointerDampedRef.current.x) * damp;
      pointerDampedRef.current.y += (targetY - pointerDampedRef.current.y) * damp;
      applyPlaneTransform(pointerDampedRef.current.x, pointerDampedRef.current.y);

      if (!reduced) {
        for (let columnIndex = 0; columnIndex < trackRefs.current.length; columnIndex += 1) {
          const meta = columnMeta[columnIndex];
          if (!meta) continue;

          const paused = wallHoveredRef.current && pauseOnHover;
          const factor = paused || hoveredColRef.current === columnIndex ? 0 : 1;
          const target = (baseVelocities[columnIndex] ?? 0) * factor;

          const ease = 1 - Math.exp(-dt / (target === 0 ? 0.16 : 0.28));
          velocitiesRef.current[columnIndex] =
            (velocitiesRef.current[columnIndex] ?? 0) +
            (target - (velocitiesRef.current[columnIndex] ?? 0)) * ease;

          let next = (offsetsRef.current[columnIndex] ?? 0) + (velocitiesRef.current[columnIndex] ?? 0) * dt;
          next = ((next % meta.copyHeight) + meta.copyHeight) % meta.copyHeight;
          offsetsRef.current[columnIndex] = next;

          const track = trackRefs.current[columnIndex];
          if (track) track.style.transform = `translate3d(0, ${-next}px, 0)`;
        }
      } else {
        for (let columnIndex = 0; columnIndex < trackRefs.current.length; columnIndex += 1) {
          const track = trackRefs.current[columnIndex];
          const meta = columnMeta[columnIndex];
          if (track && meta) {
            track.style.transform = `translate3d(0, ${-(offsetsRef.current[columnIndex] ?? 0)}px, 0)`;
          }
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTsRef.current = null;
    };
  }, [applyPlaneTransform, baseVelocities, columnMeta, effectiveParallax, pauseOnHover, reduced]);

  const activate = useCallback(
    (id: string, columnIndex: number) => {
      if (ambient) return;
      activeIdRef.current = id;
      hoveredColRef.current = columnIndex;
      setActiveId(id);
    },
    [ambient],
  );

  const release = useCallback(() => {
    if (ambient) return;
    activeIdRef.current = null;
    hoveredColRef.current = -1;
    setActiveId(null);
  }, [ambient]);

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      if (effectiveParallax > 0 && !reduced) {
        pointerRef.current = {
          x: (event.clientX - rect.left) / rect.width - 0.5,
          y: (event.clientY - rect.top) / rect.height - 0.5,
        };
      }

      if (ambient) return;

      const hit = document.elementFromPoint(event.clientX, event.clientY);
      const tile = hit instanceof Element ? hit.closest("[data-tile-id]") : null;
      if (!tile || !(tile instanceof HTMLElement)) return;

      const id = tile.dataset.tileId;
      if (!id || id === activeIdRef.current) return;

      activeIdRef.current = id;
      hoveredColRef.current = Number(tile.dataset.col);
      setActiveId(id);
    },
    [ambient, effectiveParallax, reduced],
  );

  const handlePointerLeaveWall = useCallback(() => {
    wallHoveredRef.current = false;
    pointerRef.current = { x: 0, y: 0 };
    release();
  }, [release]);

  const cssVars = useMemo(
    () =>
      ({
        "--dw-tile-w": `${tileWidth}px`,
        "--dw-tile-h": `${tileHeight}px`,
        "--dw-gap": `${gap}px`,
        "--dw-radius": `${radius}px`,
        "--dw-perspective": `${perspective}px`,
        "--dw-lift": `${effectiveLift}px`,
        "--dw-dim": dim,
        "--dw-gray": grayscale ? 1 : 0,
        "--dw-overlay": overlayColor,
        "--dw-edge": `${Math.max(0, (1 - fade) * 100)}%`,
        ...style,
      }) as CSSProperties,
    [dim, effectiveLift, fade, gap, grayscale, overlayColor, perspective, radius, style, tileHeight, tileWidth],
  );

  const renderTile = (item: DriftWallItem, id: string, columnIndex: number) => {
    const inner = (
      <span className="drift-wall__inner">
        <img src={item.image} alt={item.title ?? ""} loading="lazy" decoding="async" draggable={false} />
        <span className="drift-wall__overlay" aria-hidden="true" />
      </span>
    );

    const commonProps = {
      className: `drift-wall__tile${activeId === id ? " is-active" : ""}`,
      "data-tile-id": id,
      "data-col": columnIndex,
      onFocus: () => activate(id, columnIndex),
      onBlur: release,
    };

    if (item.href) {
      return (
        <a key={id} href={item.href} target="_blank" rel="noreferrer noopener" {...commonProps}>
          {inner}
        </a>
      );
    }

    if (ambient) {
      return (
        <div key={id} className={commonProps.className} data-tile-id={id} data-col={columnIndex}>
          {inner}
        </div>
      );
    }

    return (
      <div key={id} tabIndex={0} role="button" aria-label={item.title ?? "tile"} {...commonProps}>
        {inner}
      </div>
    );
  };

  if (items.length === 0) {
    return null;
  }

  const rootClass = [
    "drift-wall",
    reduced ? "drift-wall--reduced" : "",
    ambient ? "drift-wall--ambient" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={containerRef}
      className={rootClass}
      style={cssVars}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => {
        wallHoveredRef.current = true;
      }}
      onPointerLeave={handlePointerLeaveWall}
      role="group"
      aria-hidden={ambient ? true : undefined}
      aria-label={ambient ? undefined : "Drifting wall of tiles"}
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
                  column.map((item, itemIndex) =>
                    renderTile(item, `${columnIndex}-${copyIndex}-${itemIndex}`, columnIndex),
                  ),
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
