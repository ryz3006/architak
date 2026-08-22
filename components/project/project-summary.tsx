import "@/styles/project-page.css";
import "@/styles/studio-page.css";

type ProjectSummaryProps = {
  eyebrow: string;
  summary: string;
};

export function ProjectSummary({ eyebrow, summary }: ProjectSummaryProps) {
  return (
    <section
      className="project-summary studio-manifesto studio-section studio-section--summary page-frame"
      aria-labelledby="project-summary-title"
    >
      <p className="studio-eyebrow studio-manifesto__eyebrow">{eyebrow}</p>
      <h2 id="project-summary-title" className="project-summary__statement display">
        {summary}
      </h2>
    </section>
  );
}
