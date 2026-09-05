import type { TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/cn";
import { adminControlClasses } from "@/components/admin/ui/input";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...props }: TextareaProps) {
  return <textarea className={cn(adminControlClasses, "min-h-24 resize-y", className)} {...props} />;
}
