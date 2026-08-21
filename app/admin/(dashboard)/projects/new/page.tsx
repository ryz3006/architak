import { ProjectEditor } from "@/features/projects/project-editor";
import { requireAdminSession } from "@/features/auth/session";

export default async function NewProjectPage() {
  await requireAdminSession();

  return (
    <main id="main-content">
      <h1 className="display text-display-md">New project</h1>
      <p className="mt-2 text-muted">Draft first, then publish when the story and media are ready.</p>
      <div className="mt-10">
        <ProjectEditor />
      </div>
    </main>
  );
}
