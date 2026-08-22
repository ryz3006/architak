import type { StudioPageContent } from "@/content/static";

import "@/styles/studio-page.css";

type StudioManifestoProps = {
  manifesto: StudioPageContent["manifesto"];
};

export function StudioManifesto({ manifesto }: StudioManifestoProps) {
  return (
    <section className="studio-manifesto page-frame" aria-labelledby="studio-manifesto-title">
      <p className="studio-eyebrow">{manifesto.eyebrow}</p>
      <h2 id="studio-manifesto-title" className="studio-manifesto__statement display">
        {manifesto.statement}
      </h2>
      <div className="studio-manifesto__lines">
        {manifesto.lines.map((line) => (
          <p key={line} className="studio-manifesto__line">
            {line}
          </p>
        ))}
      </div>
      <p className="studio-manifesto__closing display">{manifesto.closing}</p>
    </section>
  );
}
