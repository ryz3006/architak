import Image from "next/image";

import "@/styles/project-page.css";

type ProjectGalleryProps = {
  eyebrow: string;
  title: string;
  images: string[];
  projectTitle: string;
  category: string;
  location: string;
};

export function ProjectGallery({
  eyebrow,
  title,
  images,
  projectTitle,
  category,
  location,
}: ProjectGalleryProps) {
  if (images.length === 0) return null;

  return (
    <section className="project-gallery studio-section studio-section--gallery" aria-labelledby="project-gallery-title">
      <header className="project-gallery__intro page-frame">
        <p className="studio-eyebrow">{eyebrow}</p>
        <h2 id="project-gallery-title" className="project-gallery__headline display">
          {title}
        </h2>
      </header>

      <ul className="project-gallery__grid page-frame">
        {images.map((src, index) => (
          <li
            key={src}
            className="project-gallery__item"
            data-span={index === 0 ? "wide" : index % 3 === 1 ? "tall" : "default"}
          >
            <div className="project-gallery__media">
              <Image
                src={src}
                alt={`${projectTitle} — ${category} interior in ${location}, view ${index + 1}`}
                fill
                className="project-gallery__image"
                sizes="(max-width: 48rem) 100vw, 50vw"
              />
              <span className="project-gallery__scrim" aria-hidden="true" />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
