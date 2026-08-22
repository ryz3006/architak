"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useGesture } from "@use-gesture/react";

import { useReducedMotion } from "@/lib/a11y/use-reduced-motion";

import "@/styles/dome-gallery.css";

export type DomeGalleryImage = {
  src: string;
  alt?: string;
  title?: string;
  category?: string;
  location?: string;
  summary?: string;
  href?: string;
};

type DomeGalleryProps = {
  images: DomeGalleryImage[];
  fit?: number;
  fitBasis?: "auto" | "min" | "max" | "width" | "height";
  minRadius?: number;
  maxRadius?: number;
  padFactor?: number;
  overlayBlurColor?: string;
  maxVerticalRotationDeg?: number;
  dragSensitivity?: number;
  enlargeTransitionMs?: number;
  segments?: number;
  dragDampening?: number;
  openedImageWidth?: string;
  openedImageHeight?: string;
  imageBorderRadius?: string;
  openedImageBorderRadius?: string;
  grayscale?: boolean;
  className?: string;
};

type DomeCoord = {
  x: number;
  y: number;
  sizeX: number;
  sizeY: number;
};

type DomeItem = DomeCoord & DomeGalleryImage;

type Rotation = { x: number; y: number };
type TileRect = { left: number; top: number; width: number; height: number };

const DEFAULTS = {
  maxVerticalRotationDeg: 5,
  dragSensitivity: 20,
  enlargeTransitionMs: 300,
  segments: 35,
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function normalizeAngle(degrees: number): number {
  return ((degrees % 360) + 360) % 360;
}

function wrapAngleSigned(degrees: number): number {
  const angle = (((degrees + 180) % 360) + 360) % 360;
  return angle - 180;
}

function getDataNumber(element: Element, name: string, fallback: number): number {
  const attr = element.getAttribute(`data-${name}`);
  const parsed = attr == null ? Number.NaN : Number.parseFloat(attr);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function buildItems(pool: DomeGalleryImage[], segments: number): DomeItem[] {
  const xCols = Array.from({ length: segments }, (_, index) => -37 + index * 2);
  const evenYs = [-4, -2, 0, 2, 4];
  const oddYs = [-3, -1, 1, 3, 5];

  const coords: DomeCoord[] = xCols.flatMap((x, columnIndex) => {
    const ys = columnIndex % 2 === 0 ? evenYs : oddYs;
    return ys.map((y) => ({ x, y, sizeX: 2, sizeY: 2 }));
  });

  if (pool.length === 0) {
    return coords.map((coord) => ({
      ...coord,
      src: "",
      alt: "",
      title: "",
      category: "",
      location: "",
      summary: "",
      href: "",
    }));
  }

  const normalized = pool.map((image) => ({
    src: image.src,
    alt: image.alt ?? "",
    title: image.title ?? "",
    category: image.category ?? "",
    location: image.location ?? "",
    summary: image.summary ?? "",
    href: image.href ?? "",
  }));

  const used = Array.from({ length: coords.length }, (_, index) => normalized[index % normalized.length] as DomeGalleryImage);

  for (let index = 1; index < used.length; index += 1) {
    if (used[index]?.src === used[index - 1]?.src) {
      for (let swapIndex = index + 1; swapIndex < used.length; swapIndex += 1) {
        if (used[swapIndex]?.src !== used[index]?.src) {
          const temp = used[index];
          used[index] = used[swapIndex] as DomeGalleryImage;
          used[swapIndex] = temp as DomeGalleryImage;
          break;
        }
      }
    }
  }

  return coords.map((coord, index) => ({
    ...coord,
    ...(used[index] as DomeGalleryImage),
  }));
}

function computeItemBaseRotation(offsetX: number, offsetY: number, sizeX: number, sizeY: number, segments: number) {
  const unit = 360 / segments / 2;
  return {
    rotateY: unit * (offsetX + (sizeX - 1) / 2),
    rotateX: unit * (offsetY - (sizeY - 1) / 2),
  };
}

export function DomeGallery({
  images,
  fit = 0.5,
  fitBasis = "auto",
  minRadius = 600,
  maxRadius = Number.POSITIVE_INFINITY,
  padFactor = 0.25,
  overlayBlurColor = "#0a0a0a",
  maxVerticalRotationDeg = DEFAULTS.maxVerticalRotationDeg,
  dragSensitivity = DEFAULTS.dragSensitivity,
  enlargeTransitionMs = DEFAULTS.enlargeTransitionMs,
  segments = DEFAULTS.segments,
  dragDampening = 2,
  openedImageWidth = "min(420px, 92vw)",
  openedImageHeight = "auto",
  imageBorderRadius = "12px",
  openedImageBorderRadius = "12px",
  grayscale = true,
  className = "",
}: DomeGalleryProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const sphereRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const focusedElRef = useRef<HTMLDivElement | null>(null);
  const originalTilePositionRef = useRef<TileRect | null>(null);

  const rotationRef = useRef<Rotation>({ x: 0, y: 0 });
  const startRotRef = useRef<Rotation>({ x: 0, y: 0 });
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const draggingRef = useRef(false);
  const movedRef = useRef(false);
  const inertiaRafRef = useRef<number | null>(null);
  const openingRef = useRef(false);
  const openStartedAtRef = useRef(0);
  const lastDragEndAt = useRef(0);
  const scrollLockedRef = useRef(false);

  const [activeDetail, setActiveDetail] = useState<DomeGalleryImage | null>(null);

  const items = useMemo(() => buildItems(images, segments), [images, segments]);

  const applyTransform = useCallback((xDeg: number, yDeg: number) => {
    const sphere = sphereRef.current;
    if (!sphere) return;
    sphere.style.transform = `translateZ(calc(var(--radius) * -1)) rotateX(${xDeg}deg) rotateY(${yDeg}deg)`;
  }, []);

  const lockScroll = useCallback(() => {
    if (scrollLockedRef.current) return;
    scrollLockedRef.current = true;
    document.body.classList.add("dg-scroll-lock");
  }, []);

  const unlockScroll = useCallback(() => {
    if (!scrollLockedRef.current) return;
    if (rootRef.current?.getAttribute("data-enlarging") === "true") return;
    scrollLockedRef.current = false;
    document.body.classList.remove("dg-scroll-lock");
  }, []);

  const stopInertia = useCallback(() => {
    if (inertiaRafRef.current) {
      cancelAnimationFrame(inertiaRafRef.current);
      inertiaRafRef.current = null;
    }
  }, []);

  const startInertia = useCallback(
    (vx: number, vy: number) => {
      const maxV = 1.4;
      let velocityX = clamp(vx, -maxV, maxV) * 80;
      let velocityY = clamp(vy, -maxV, maxV) * 80;
      let frames = 0;
      const dampening = clamp(dragDampening, 0, 1);
      const friction = 0.94 + 0.055 * dampening;
      const stopThreshold = 0.015 - 0.01 * dampening;
      const maxFrames = Math.round(90 + 270 * dampening);

      const step = () => {
        velocityX *= friction;
        velocityY *= friction;
        if (Math.abs(velocityX) < stopThreshold && Math.abs(velocityY) < stopThreshold) {
          inertiaRafRef.current = null;
          return;
        }
        if (frames++ > maxFrames) {
          inertiaRafRef.current = null;
          return;
        }
        const nextX = clamp(rotationRef.current.x - velocityY / 200, -maxVerticalRotationDeg, maxVerticalRotationDeg);
        const nextY = wrapAngleSigned(rotationRef.current.y + velocityX / 200);
        rotationRef.current = { x: nextX, y: nextY };
        applyTransform(nextX, nextY);
        inertiaRafRef.current = requestAnimationFrame(step);
      };

      stopInertia();
      inertiaRafRef.current = requestAnimationFrame(step);
    },
    [applyTransform, dragDampening, maxVerticalRotationDeg, stopInertia],
  );

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;

      const { width, height } = entry.contentRect;
      const w = Math.max(1, width);
      const h = Math.max(1, height);
      const minDim = Math.min(w, h);
      const maxDim = Math.max(w, h);
      const aspect = w / h;

      let basis: number;
      switch (fitBasis) {
        case "min":
          basis = minDim;
          break;
        case "max":
          basis = maxDim;
          break;
        case "width":
          basis = w;
          break;
        case "height":
          basis = h;
          break;
        default:
          basis = aspect >= 1.3 ? w : minDim;
      }

      let radius = basis * fit;
      radius = Math.min(radius, h * 1.35);
      radius = clamp(radius, minRadius, maxRadius);

      root.style.setProperty("--radius", `${Math.round(radius)}px`);
      root.style.setProperty("--viewer-pad", `${Math.max(8, Math.round(minDim * padFactor))}px`);
      root.style.setProperty("--overlay-blur-color", overlayBlurColor);
      root.style.setProperty("--tile-radius", imageBorderRadius);
      root.style.setProperty("--enlarge-radius", openedImageBorderRadius);
      root.style.setProperty("--image-filter", grayscale ? "grayscale(1)" : "none");
      applyTransform(rotationRef.current.x, rotationRef.current.y);
    });

    observer.observe(root);
    return () => observer.disconnect();
  }, [
    applyTransform,
    fit,
    fitBasis,
    grayscale,
    imageBorderRadius,
    maxRadius,
    minRadius,
    openedImageBorderRadius,
    overlayBlurColor,
    padFactor,
  ]);

  useEffect(() => {
    applyTransform(rotationRef.current.x, rotationRef.current.y);
  }, [applyTransform]);

  useGesture(
    {
      onDragStart: ({ event }) => {
        if (focusedElRef.current) return;
        if (!("clientX" in event) || !("clientY" in event)) return;
        stopInertia();
        draggingRef.current = true;
        movedRef.current = false;
        startRotRef.current = { ...rotationRef.current };
        startPosRef.current = { x: event.clientX, y: event.clientY };
      },
      onDrag: ({ event, last, velocity = [0, 0], direction = [0, 0], movement = [0, 0] }) => {
        if (focusedElRef.current || !draggingRef.current || !startPosRef.current) return;
        if (!("clientX" in event) || !("clientY" in event)) return;

        const dxTotal = event.clientX - startPosRef.current.x;
        const dyTotal = event.clientY - startPosRef.current.y;

        if (!movedRef.current && dxTotal * dxTotal + dyTotal * dyTotal > 16) {
          movedRef.current = true;
        }

        const nextX = clamp(
          startRotRef.current.x - dyTotal / dragSensitivity,
          -maxVerticalRotationDeg,
          maxVerticalRotationDeg,
        );
        const nextY = wrapAngleSigned(startRotRef.current.y + dxTotal / dragSensitivity);

        if (rotationRef.current.x !== nextX || rotationRef.current.y !== nextY) {
          rotationRef.current = { x: nextX, y: nextY };
          applyTransform(nextX, nextY);
        }

        if (last) {
          draggingRef.current = false;
          let [vMagX, vMagY] = velocity;
          const [dirX, dirY] = direction;
          let vx = vMagX * dirX;
          let vy = vMagY * dirY;

          if (Math.abs(vx) < 0.001 && Math.abs(vy) < 0.001) {
            vx = clamp((movement[0] / dragSensitivity) * 0.02, -1.2, 1.2);
            vy = clamp((movement[1] / dragSensitivity) * 0.02, -1.2, 1.2);
          }

          if (Math.abs(vx) > 0.005 || Math.abs(vy) > 0.005) {
            startInertia(vx, vy);
          }

          if (movedRef.current) lastDragEndAt.current = performance.now();
          movedRef.current = false;
        }
      },
    },
    { target: mainRef, eventOptions: { passive: true } },
  );

  const readItemMeta = (parent: HTMLElement): DomeGalleryImage => ({
    src: parent.dataset.src ?? "",
    alt: parent.dataset.alt ?? "",
    title: parent.dataset.title ?? "",
    category: parent.dataset.category ?? "",
    location: parent.dataset.location ?? "",
    summary: parent.dataset.summary ?? "",
    href: parent.dataset.href ?? "",
  });

  const openItemFromElement = useCallback(
    (element: HTMLDivElement) => {
      if (openingRef.current) return;
      openingRef.current = true;
      openStartedAtRef.current = performance.now();
      lockScroll();

      const parent = element.parentElement as HTMLElement | null;
      if (!parent) {
        openingRef.current = false;
        unlockScroll();
        return;
      }

      const meta = readItemMeta(parent);
      setActiveDetail(meta);

      focusedElRef.current = element;
      element.setAttribute("data-focused", "true");

      const offsetX = getDataNumber(parent, "offset-x", 0);
      const offsetY = getDataNumber(parent, "offset-y", 0);
      const sizeX = getDataNumber(parent, "size-x", 2);
      const sizeY = getDataNumber(parent, "size-y", 2);
      const parentRot = computeItemBaseRotation(offsetX, offsetY, sizeX, sizeY, segments);
      const parentY = normalizeAngle(parentRot.rotateY);
      const globalY = normalizeAngle(rotationRef.current.y);
      let rotY = -(parentY + globalY) % 360;
      if (rotY < -180) rotY += 360;
      const rotX = -parentRot.rotateX - rotationRef.current.x;

      parent.style.setProperty("--rot-y-delta", `${rotY}deg`);
      parent.style.setProperty("--rot-x-delta", `${rotX}deg`);

      const refDiv = document.createElement("div");
      refDiv.className = "item__image item__image--reference";
      refDiv.style.opacity = "0";
      refDiv.style.transform = `rotateX(${-parentRot.rotateX}deg) rotateY(${-parentRot.rotateY}deg)`;
      parent.appendChild(refDiv);

      const tileRect = refDiv.getBoundingClientRect();
      const mainRect = mainRef.current?.getBoundingClientRect();
      const frameRect = frameRef.current?.getBoundingClientRect();

      if (!mainRect || !frameRect || tileRect.width <= 0 || tileRect.height <= 0) {
        openingRef.current = false;
        focusedElRef.current = null;
        refDiv.remove();
        setActiveDetail(null);
        unlockScroll();
        return;
      }

      originalTilePositionRef.current = {
        left: tileRect.left,
        top: tileRect.top,
        width: tileRect.width,
        height: tileRect.height,
      };

      element.style.visibility = "hidden";
      element.style.zIndex = "0";

      const overlay = document.createElement("div");
      overlay.className = "enlarge enlarge--with-detail";
      overlay.style.position = "absolute";
      overlay.style.left = `${frameRect.left - mainRect.left}px`;
      overlay.style.top = `${frameRect.top - mainRect.top}px`;
      overlay.style.width = openedImageWidth;
      overlay.style.height = openedImageHeight;
      overlay.style.opacity = "0";
      overlay.style.zIndex = "30";
      overlay.style.transformOrigin = "top left";
      overlay.style.transition = `transform ${enlargeTransitionMs}ms ease, opacity ${enlargeTransitionMs}ms ease`;

      const img = document.createElement("img");
      img.src = meta.src;
      img.alt = meta.alt ?? meta.title ?? "";
      overlay.appendChild(img);

      const detail = document.createElement("div");
      detail.className = "dome-gallery__detail";
      detail.innerHTML = `
        <p class="dome-gallery__detail-meta">${meta.category}${meta.location ? ` · ${meta.location}` : ""}</p>
        <h3 class="dome-gallery__detail-title">${meta.title}</h3>
        <p class="dome-gallery__detail-summary">${meta.summary}</p>
      `;
      if (meta.href) {
        const link = document.createElement("a");
        link.className = "dome-gallery__detail-link";
        link.href = meta.href;
        link.textContent = "View project";
        detail.appendChild(link);
      }
      overlay.appendChild(detail);

      viewerRef.current?.appendChild(overlay);

      const tx0 = tileRect.left - frameRect.left;
      const ty0 = tileRect.top - frameRect.top;
      const sx0 = tileRect.width / frameRect.width;
      const sy0 = tileRect.height / frameRect.height;
      overlay.style.transform = `translate(${tx0}px, ${ty0}px) scale(${Number.isFinite(sx0) && sx0 > 0 ? sx0 : 1}, ${Number.isFinite(sy0) && sy0 > 0 ? sy0 : 1})`;

      requestAnimationFrame(() => {
        if (!overlay.parentElement) return;
        overlay.style.opacity = "1";
        overlay.style.transform = "translate(0px, 0px) scale(1, 1)";
        rootRef.current?.setAttribute("data-enlarging", "true");
      });
    },
    [enlargeTransitionMs, lockScroll, openedImageHeight, openedImageWidth, segments, unlockScroll],
  );

  const closeFocused = useCallback(() => {
    if (performance.now() - openStartedAtRef.current < 250) return;

    const element = focusedElRef.current;
    if (!element) return;

    const parent = element.parentElement;
    const overlay = viewerRef.current?.querySelector(".enlarge");
    if (!parent || !overlay) return;

    overlay.remove();
    parent.querySelector(".item__image--reference")?.remove();
    parent.style.setProperty("--rot-y-delta", "0deg");
    parent.style.setProperty("--rot-x-delta", "0deg");
    element.style.visibility = "";
    element.style.zIndex = "0";
    element.removeAttribute("data-focused");
    focusedElRef.current = null;
    originalTilePositionRef.current = null;
    rootRef.current?.removeAttribute("data-enlarging");
    openingRef.current = false;
    setActiveDetail(null);
    unlockScroll();
  }, [unlockScroll]);

  useEffect(() => {
    const scrim = scrimRef.current;
    if (!scrim) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeFocused();
    };

    scrim.addEventListener("click", closeFocused);
    window.addEventListener("keydown", onKey);

    return () => {
      scrim.removeEventListener("click", closeFocused);
      window.removeEventListener("keydown", onKey);
    };
  }, [closeFocused]);

  const onTileClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (draggingRef.current || movedRef.current) return;
      if (performance.now() - lastDragEndAt.current < 80) return;
      if (openingRef.current) return;
      openItemFromElement(event.currentTarget);
    },
    [openItemFromElement],
  );

  const onTilePointerUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.pointerType !== "touch") return;
      if (draggingRef.current || movedRef.current) return;
      if (performance.now() - lastDragEndAt.current < 80) return;
      if (openingRef.current) return;
      openItemFromElement(event.currentTarget);
    },
    [openItemFromElement],
  );

  useEffect(() => {
    return () => {
      document.body.classList.remove("dg-scroll-lock");
      stopInertia();
    };
  }, [stopInertia]);

  if (images.length === 0) {
    return null;
  }

  const rootStyle = {
    "--segments-x": segments,
    "--segments-y": segments,
    "--overlay-blur-color": overlayBlurColor,
    "--tile-radius": imageBorderRadius,
    "--enlarge-radius": openedImageBorderRadius,
    "--image-filter": grayscale ? "grayscale(1)" : "none",
  } as CSSProperties;

  return (
    <div ref={rootRef} className={`sphere-root${className ? ` ${className}` : ""}`} style={rootStyle}>
      <main ref={mainRef} className="sphere-main">
        <div className="stage">
          <div ref={sphereRef} className="sphere">
            {items.map((item, index) =>
              item.src ? (
                <div
                  key={`${item.x}-${item.y}-${index}`}
                  className="item"
                  data-src={item.src}
                  data-alt={item.alt}
                  data-title={item.title}
                  data-category={item.category}
                  data-location={item.location}
                  data-summary={item.summary}
                  data-href={item.href}
                  data-offset-x={item.x}
                  data-offset-y={item.y}
                  data-size-x={item.sizeX}
                  data-size-y={item.sizeY}
                  style={
                    {
                      "--offset-x": item.x,
                      "--offset-y": item.y,
                      "--item-size-x": item.sizeX,
                      "--item-size-y": item.sizeY,
                    } as CSSProperties
                  }
                >
                  <div
                    className="item__image"
                    role="button"
                    tabIndex={0}
                    aria-label={item.title ? `Open ${item.title}` : "Open project image"}
                    onClick={onTileClick}
                    onPointerUp={onTilePointerUp}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openItemFromElement(event.currentTarget);
                      }
                    }}
                  >
                    <img src={item.src} draggable={false} alt={item.alt ?? ""} loading="lazy" decoding="async" />
                  </div>
                </div>
              ) : null,
            )}
          </div>
        </div>

        <div className="overlay" aria-hidden="true" />
        <div className="overlay overlay--blur" aria-hidden="true" />
        <div className="edge-fade edge-fade--top" aria-hidden="true" />
        <div className="edge-fade edge-fade--bottom" aria-hidden="true" />

        <div className="viewer" ref={viewerRef}>
          <div ref={scrimRef} className="scrim" aria-hidden="true" />
          <div ref={frameRef} className="frame" aria-hidden="true" />
        </div>
      </main>

      {activeDetail?.href ? (
        <div className="dome-gallery__sr-link">
          <Link href={activeDetail.href}>View {activeDetail.title}</Link>
        </div>
      ) : null}
    </div>
  );
}
