import type { StudioPageContent } from "@/content/static";

import "@/styles/studio-page.css";

type StudioProcessProps = {
  process: StudioPageContent["process"];
};

export function StudioProcess({ process }: StudioProcessProps) {
  return (
    <section className="studio-process page-frame" aria-labelledby="studio-process-title">
      <p className="studio-eyebrow">{process.eyebrow}</p>
      <h2 id="studio-process-title" className="studio-process__headline display">
        {process.headline}
      </h2>

      <ol className="studio-process__steps">
        {process.steps.map((step) => (
          <li key={step.step} className="studio-process__step">
            <p className="studio-process__step-index">{step.step}</p>
            <h3 className="studio-process__step-title display">{step.title}</h3>
            <div className="studio-process__step-lines">
              {step.lines.map((line) => (
                <p key={line} className="studio-process__step-line">
                  {line}
                </p>
              ))}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
