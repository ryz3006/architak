import type { StudioPageContent } from "@/content/static";

import "@/styles/studio-page.css";

type StudioComplimentProps = {
  compliment: StudioPageContent["compliment"];
};

export function StudioCompliment({ compliment }: StudioComplimentProps) {
  return (
    <section className="studio-compliment page-frame" aria-label="Reflection">
      <p className="studio-compliment__headline display">{compliment.headline}</p>
      <p className="studio-compliment__support">{compliment.support}</p>
    </section>
  );
}
