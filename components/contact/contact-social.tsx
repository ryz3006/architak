import type { ContactPageContent, SocialProfiles } from "@/content/static";
import { SOCIAL_PLATFORMS, SocialIcon } from "@/components/icons/social-icon";

import "@/styles/contact-page.css";

type ContactSocialProps = {
  section: ContactPageContent["social"];
  profiles: SocialProfiles;
};

export function ContactSocial({ section, profiles }: ContactSocialProps) {
  const links = SOCIAL_PLATFORMS.map((entry) => ({
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
              aria-label={entry.label}
            >
              <SocialIcon platform={entry.key} className="contact-social__icon" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
