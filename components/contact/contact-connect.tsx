import type { ContactPageContent } from "@/content/static";
import { EnquiryForm } from "@/features/enquiries/enquiry-form";

import "@/styles/contact-page.css";

type ContactConnectProps = {
  channels: ContactPageContent["channels"];
  form: ContactPageContent["form"];
  phone: string;
  email: string;
  address: string;
};

export function ContactConnect({ channels, form, phone, email, address }: ContactConnectProps) {
  const wa = phone.replace(/\D/g, "");

  return (
    <section className="contact-connect studio-section studio-section--connect page-frame" aria-labelledby="contact-connect-title">
      <div className="contact-connect__grid">
        <div className="contact-connect__channels">
          <p className="studio-eyebrow">{channels.eyebrow}</p>
          <h2 id="contact-connect-title" className="contact-connect__headline display">
            {channels.headline}
          </h2>
          <p className="contact-connect__support">{channels.support}</p>

          <address className="contact-connect__address">
            <a href={`tel:${phone.replace(/\s/g, "")}`} className="contact-connect__phone">
              {phone}
            </a>
            <a href={`mailto:${email}`} className="contact-connect__email">
              {email}
            </a>
            <span className="contact-connect__location">{address}</span>
          </address>

          <div className="contact-connect__actions">
            <a
              href={`https://wa.me/${wa}`}
              className="contact-connect__action contact-connect__action--primary"
              rel="noopener noreferrer"
              target="_blank"
            >
              WhatsApp
            </a>
            <a
              href={`mailto:${email}?subject=Project%20enquiry`}
              className="contact-connect__action"
            >
              Email enquiry
            </a>
          </div>
        </div>

        <div className="contact-connect__form-panel">
          <p className="studio-eyebrow">{form.eyebrow}</p>
          <h3 className="contact-connect__form-headline display">{form.headline}</h3>
          <p className="contact-connect__form-support">{form.support}</p>
          <div className="contact-connect__form">
            <EnquiryForm />
          </div>
        </div>
      </div>
    </section>
  );
}
