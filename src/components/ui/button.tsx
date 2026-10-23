import { Slot } from "@radix-ui/react-slot";
import type { ComponentPropsWithoutRef } from "react";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import { cn } from "../../shared/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-wine text-white shadow-sm hover:bg-espresso",
        secondary: "bg-blush/45 text-espresso hover:bg-blush/70",
        outline: "border border-wine/45 bg-white/70 text-wine hover:bg-blush/25",
        ghost: "text-espresso/75 hover:bg-blush/25 hover:text-wine",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 px-3",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type ButtonProps = ComponentPropsWithoutRef<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}
