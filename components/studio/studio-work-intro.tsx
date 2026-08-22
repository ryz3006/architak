import type { EditorialIntro } from "@/content/static";

import "@/styles/studio-page.css";

type StudioWorkIntroProps = {
  work: EditorialIntro;
};

export function StudioWorkIntro({ work }: StudioWorkIntroProps) {
  return (
    <header className="studio-work-intro studio-section studio-section--work-intro page-frame">
      <p className="studio-eyebrow">{work.eyebrow}</p>
      <h2 className="studio-work-intro__headline display">{work.headline}</h2>
      <p className="studio-work-intro__support">{work.support}</p>
    </header>
  );
}
