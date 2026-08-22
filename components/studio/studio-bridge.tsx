import "@/styles/studio-page.css";

type StudioBridgeProps = {
  lines: string[];
  className?: string;
};

export function StudioBridge({ lines, className = "" }: StudioBridgeProps) {
  return (
    <section
      className={`studio-bridge studio-section studio-section--bridge page-frame${className ? ` ${className}` : ""}`}
      aria-label="Transition"
    >
      <div className="studio-bridge__inner">
        {lines.map((line) => (
          <p key={line} className="studio-bridge__line display">
            {line}
          </p>
        ))}
      </div>
    </section>
  );
}
