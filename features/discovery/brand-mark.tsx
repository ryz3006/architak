/** Shared brand mark JSX for dynamic icon generation (favicon, apple-touch, manifest). */
export function BrandMark({ size }: { size: number }) {
  const pad = Math.round(size * 0.12);
  const markSize = size - pad * 2;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0a",
      }}
    >
      <div
        style={{
          width: markSize,
          height: markSize,
          background: "#c4a574",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontSize: Math.max(10, Math.round(size * 0.22)),
            fontWeight: 600,
            letterSpacing: "0.08em",
            color: "#0a0a0a",
            fontFamily: "sans-serif",
          }}
        >
          A
        </div>
      </div>
    </div>
  );
}
