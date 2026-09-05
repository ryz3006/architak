"use client";

import { useState } from "react";

import { AreaRow, TextRow } from "@/components/admin/content/fields";
import { SaveBar, useContentSave } from "@/components/admin/content/save-bar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { saveSocialsAction, saveStudioInfoAction } from "@/features/content/actions";
import type { SocialsInput, StudioInfoInput } from "@/features/content/schema";

export function BusinessEditor({
  studioInfo,
  socials,
}: {
  studioInfo: StudioInfoInput;
  socials: SocialsInput;
}) {
  const [info, setInfo] = useState<StudioInfoInput>(studioInfo);
  const [social, setSocial] = useState<SocialsInput>(socials);
  const infoSave = useContentSave(saveStudioInfoAction);
  const socialSave = useContentSave(saveSocialsAction);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Contact details</CardTitle>
          <CardDescription>Shown in the footer, contact page and structured data.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <TextRow label="Studio name" required value={info.name} onChange={(v) => setInfo({ ...info, name: v })} />
          <TextRow label="Tagline" value={info.tagline} onChange={(v) => setInfo({ ...info, tagline: v })} />
          <AreaRow label="Statement" value={info.statement} onChange={(v) => setInfo({ ...info, statement: v })} />
          <TextRow label="Location" value={info.location} onChange={(v) => setInfo({ ...info, location: v })} />
          <AreaRow label="Address" value={info.address} onChange={(v) => setInfo({ ...info, address: v })} />
          <TextRow label="Phone" value={info.phone} onChange={(v) => setInfo({ ...info, phone: v })} />
          <TextRow
            label="Email"
            value={info.email}
            hint="Used for the mailto link and enquiries reply-to."
            onChange={(v) => setInfo({ ...info, email: v })}
          />
          <SaveBar onSave={() => infoSave.save(info)} pending={infoSave.pending} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Social links</CardTitle>
          <CardDescription>Leave a field empty to hide that profile.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <TextRow
            label="LinkedIn"
            placeholder="https://www.linkedin.com/company/..."
            value={social.linkedin}
            onChange={(v) => setSocial({ ...social, linkedin: v })}
          />
          <TextRow
            label="YouTube"
            placeholder="https://www.youtube.com/@..."
            value={social.youtube}
            onChange={(v) => setSocial({ ...social, youtube: v })}
          />
          <TextRow
            label="Instagram"
            placeholder="https://www.instagram.com/..."
            value={social.instagram}
            onChange={(v) => setSocial({ ...social, instagram: v })}
          />
          <TextRow
            label="Facebook"
            placeholder="https://www.facebook.com/..."
            value={social.facebook}
            onChange={(v) => setSocial({ ...social, facebook: v })}
          />
          <SaveBar onSave={() => socialSave.save(social)} pending={socialSave.pending} />
        </CardContent>
      </Card>
    </div>
  );
}
