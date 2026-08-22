import Link from "next/link";

import "@/styles/home-work.css";
import "@/styles/project-page.css";

type ProjectNavProps = {
  backLabel: string;
};

export function ProjectNav({ backLabel }: ProjectNavProps) {
  return (
    <nav className="project-nav studio-section studio-section--nav page-frame" aria-label="Project navigation">
      <Link href="/studio#work" className="home-work-more__link project-nav__link">
        {backLabel}
      </Link>
    </nav>
  );
}
