import type { HTMLAttributes } from "react";
import { cn } from "../../shared/utils";

type DivProps = HTMLAttributes<HTMLDivElement>;
type HeadingProps = HTMLAttributes<HTMLHeadingElement>;
type ParagraphProps = HTMLAttributes<HTMLParagraphElement>;

export function Card({ className, ...props }: DivProps) {
  return <div className={cn("rounded-xl border border-zinc-200 bg-white text-zinc-950 shadow-sm", className)} {...props} />;
}

export function CardHeader({ className, ...props }: DivProps) {
  return <div className={cn("grid gap-1.5 p-6", className)} {...props} />;
}

export function CardTitle({ className, ...props }: HeadingProps) {
  return <h3 className={cn("text-xl font-bold leading-none tracking-tight", className)} {...props} />;
}

export function CardDescription({ className, ...props }: ParagraphProps) {
  return <p className={cn("text-sm text-zinc-500", className)} {...props} />;
}

export function CardContent({ className, ...props }: DivProps) {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}

export function CardFooter({ className, ...props }: DivProps) {
  return <div className={cn("flex items-center p-6 pt-0", className)} {...props} />;
}
