import type { ContactPageContent, SocialProfiles } from "@/content/static";

import "@/styles/contact-page.css";

type ContactSocialProps = {
  section: ContactPageContent["social"];
  profiles: SocialProfiles;
};

const PROFILE_ENTRIES = [
  { key: "linkedin" as const, label: "LinkedIn" },
  { key: "youtube" as const, label: "YouTube" },
  { key: "instagram" as const, label: "Instagram" },
  { key: "facebook" as const, label: "Facebook" },
];

export function ContactSocial({ section, profiles }: ContactSocialProps) {
  const links = PROFILE_ENTRIES.map((entry) => ({
    ...entry,
    href: profiles[entry.key],
  })).filter((entry) => entry.href);

  if (links.length === 0) return null;

  return (
    <section
      className="contact-social studio-section studio-section--social page-frame"
      aria-labelledby="contact-social-title"
    >
      <p className="studio-eyebrow">{section.eyebrow}</p>
      <h2 id="contact-social-title" className="contact-social__headline display">
        {section.headline}
      </h2>
      <p className="contact-social__support">{section.support}</p>
      <ul className="contact-social__list">
        {links.map((entry) => (
          <li key={entry.key}>
            <a
              href={entry.href}
              className="contact-social__link"
              target="_blank"
              rel="noopener noreferrer"
            >
              {entry.label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
