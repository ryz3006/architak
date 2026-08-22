import Image from "next/image";
import Link from "next/link";

import type { StaticProject } from "@/content/static";

import "@/styles/studio-work-grid.css";

type StudioWorkGridProps = {
  projects: StaticProject[];
};

export function StudioWorkGrid({ projects }: StudioWorkGridProps) {
  return (
    <ul className="studio-work-grid">
      {projects.map((project, index) => (
        <li key={project.slug} className="studio-work-grid__item">
          <Link href={`/work/${project.slug}`} className="studio-work-grid__link group">
            <div className="studio-work-grid__media">
              <Image
                src={project.coverImage}
                alt={project.title}
                fill
                className="studio-work-grid__image"
                sizes="(max-width: 48rem) 100vw, (max-width: 80rem) 50vw, 33vw"
                priority={index < 2}
              />
              <span className="studio-work-grid__overlay" aria-hidden="true" />
            </div>
            <div className="studio-work-grid__meta">
              <p className="studio-work-grid__category">
                {project.category} · {project.location}
              </p>
              <h3 className="studio-work-grid__title display">{project.title}</h3>
              <p className="studio-work-grid__summary">{project.summary}</p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
