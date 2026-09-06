"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { useAdminLoading } from "@/components/admin/loading";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/admin/ui/table";
import { deleteProjectAction } from "@/features/projects/actions";

export type ProjectListItem = {
  slug: string;
  title: string;
  category: string;
  status: string;
};

const STATUS_VARIANT = {
  published: "success" as const,
  draft: "warning" as const,
  archived: "neutral" as const,
};

export function ProjectsList({ projects }: { projects: ProjectListItem[] }) {
  const router = useRouter();
  const { withLoading } = useAdminLoading();
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function onDelete(project: ProjectListItem) {
    if (
      !window.confirm(
        `Delete “${project.title}”? This removes it from the admin and the public site.`,
      )
    ) {
      return;
    }

    setPendingSlug(project.slug);
    const result = await withLoading(() => deleteProjectAction(project.slug), "delete-project");
    setPendingSlug(null);

    if (result.ok) {
      toast.success(result.message);
      startTransition(() => router.refresh());
    } else {
      toast.error(result.message);
    }
  }

  return (
    <>
      <div className="mt-8 hidden overflow-x-auto md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => {
              const variant =
                STATUS_VARIANT[project.status as keyof typeof STATUS_VARIANT] ?? "neutral";
              return (
                <TableRow key={project.slug}>
                  <TableCell className="font-medium text-foreground">{project.title}</TableCell>
                  <TableCell className="text-muted">{project.category || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={variant} className="capitalize">
                      {project.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <Button asChild variant="primary" size="sm">
                        <Link href={`/admin/projects/${project.slug}`}>Edit</Link>
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/work/${project.slug}`} target="_blank" rel="noreferrer">
                          Preview
                        </Link>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={pendingSlug === project.slug}
                        onClick={() => void onDelete(project)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <ul className="mt-8 flex flex-col gap-3 md:hidden">
        {projects.map((project) => {
          const variant =
            STATUS_VARIANT[project.status as keyof typeof STATUS_VARIANT] ?? "neutral";
          return (
            <li
              key={project.slug}
              className="rounded-[var(--admin-radius)] border border-[var(--admin-border)] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{project.title}</p>
                  <p className="mt-1 text-fluid-sm text-muted">
                    {project.category || "Uncategorised"}
                  </p>
                </div>
                <Badge variant={variant} className="shrink-0 capitalize">
                  {project.status}
                </Badge>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild variant="primary" size="sm">
                  <Link href={`/admin/projects/${project.slug}`}>Edit</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/work/${project.slug}`} target="_blank" rel="noreferrer">
                    Preview
                  </Link>
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={pendingSlug === project.slug}
                  onClick={() => void onDelete(project)}
                >
                  Delete
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
