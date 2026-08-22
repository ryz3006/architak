import "@/styles/studio-page.css";

type StudioBridgeProps = {
  lines: string[];
  className?: string;
};

export function StudioBridge({ lines, className = "" }: StudioBridgeProps) {
  return (
    <section className={`studio-bridge page-frame${className ? ` ${className}` : ""}`} aria-label="Transition">
      {lines.map((line) => (
        <p key={line} className="studio-bridge__line display">
          {line}
        </p>
      ))}
    </section>
  );
}
